/* http://bl.ocks.org/gisminister/10001728  */
var raceColor = {'A':'#1b9e77','B':'#d95f02','I':'#7570b3','P':'#e7298a',
	     'Q':'#66a61e','W':'#e6ab00','U':'#a6761d','Z':'#666666'};
var raceName = {'A':'Asian/Pacific Islander','B':'Black',
	     'I':'American Indian/Alaskan Native','P':'Black-Hispanic',
	     'Q':'White-Hispanic','W':'White','U':'Unknown','Z':'Other'};
var boroName = {
    "BRONX" : "Bronx",
    "BROOKLYN":"Brooklyn",
    "QUEENS":"Queens",
    "STATEN IS":"Staten Island",
    "MANHATTAN":"Manhattan"
};

var incidScale = d3.scale.linear().range([.3,1]);
var minZoom=11,maxZoom=17;
var rmax = 50;
var latlngBounds = [[40.914550362677204,-73.65509033203126],
                    [40.498136668508536,-74.34173583984376]];
var mymap = L.map('mapid')
    .setView([40.73, -73.99], 11)
    .setMaxBounds(latlngBounds)
    .setMinZoom(minZoom)
    .setMaxZoom(maxZoom);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token='
	    +'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ'
	    +'._QA7i5Mpkd_m30IGElHziw', {
    maxZoom: maxZoom,
    minZoom: minZoom,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.light'
    //bounds:latlngBounds
}).addTo(mymap);


var getMinMaxCluster = function(){
    var clusters = document.getElementsByClassName("pie-cluster-center-text");
    var min = -1,max = -1;
    var m,M;
    var bnds = mymap.getBounds();
    var ne = mymap.latLngToLayerPoint(bnds._northEast);
    var sw = mymap.latLngToLayerPoint(bnds._southWest);
    var minX = sw.x,maxX = ne.x,minY = ne.y,maxY = sw.y;
    for(var i = 0;i<clusters.length;i++){
	var cluster = clusters[i];
	var s = cluster.parentNode.parentNode.style.transform;
	var dx = parseInt(s.substring(s.indexOf('(')+1))||-1;
	var dy = parseInt(s.substring(s.indexOf(',')+1))||-1;
	if(dx<minX || dy<minY||dx>maxX || dy>maxY){
	    continue;
	}
	var size = parseInt(cluster.innerHTML)||-1;
	if(isNaN(size))
	    continue;
	if(min == -1 || min>size){
	    min = size;
	}
	if(max<size){
	    max = size;
	}
    }
    return [min,max];
}

var myIconFxn = function(cluster){
    //console.log("run");
    var incidents = cluster.getAllChildMarkers();
    var n = incidents.length;
    var strokeWidth = 1; //strokeWidth of slice boundary
    var r = rmax-2*strokeWidth-(n<10?12:n<100?8:n<1000?4:0);
    var iconDim = (r+strokeWidth)*2;
    var data = d3.nest()
	.key(function(d){return d.options.race;})
	.entries(incidents);

    var options = {
	data: data,
	valueFxn:function(d){return d.values.length;},
	strokeWidth:strokeWidth,
	outerR:r,
	innerR:20,
	sliceClass:function(d){return "slice race-"+raceName[d.data.key];},
	sliceTooltip:function(d){
	    return d.data.values.length+' '+raceName[d.data.key];},
	colorFxn:function(d){return raceColor[d.data.key]},
	centerText:n,
	opacityFxn:function(){return incidScale(n);}
    };

    var html = createPieChart(options);
    var icon = new L.DivIcon({
	html:html,
	className: 'pie-cluster',
	iconSize: new L.Point(iconDim,iconDim)	  
    });
    return icon;
}

var createPieChart = function(options){
    var txtOffset = options.outerR+options.strokeWidth;
    var width = txtOffset*2;
    var height = width;
    
    var arc = d3.svg.arc()
	.outerRadius(options.innerR)
	.innerRadius(options.outerR);
    var donut = d3.layout.pie().value(options.valueFxn);
    var svg = document.createElementNS(d3.ns.prefix.svg,'svg');
    var vis = d3.select(svg)
	.data(options.data)
	.attr('class','pie-cluster')
	.attr('width',width)
	.attr('height',height);
    var arcs = vis.selectAll("g.arc")
	.data(donut(options.data))
	.enter().append("svg:g")
	.attr("class","arc")
	.attr("transform","translate("+txtOffset+","+txtOffset+")");
    arcs.append("svg:path")
	.attr("class",options.sliceClass)
	.attr("stroke-width",options.strokeWidth)
	.attr("d",arc)
	.style("fill",options.colorFxn)
	.style("opacity",options.opacityFxn)
	.append("svg:title")
	.text(options.sliceTooltip);
    
    vis.append("text")
	.attr('x',txtOffset)
	.attr('y',txtOffset)
	.attr('class',"pie-cluster-center-text")
	.attr("text-anchor","middle")
	.attr("dy",".3em")
	.text(options.centerText);
    
    return serializeXmlNode(svg);
}

var serializeXmlNode = function(xmlNode) {
    if (typeof window.XMLSerializer != "undefined") {
        return (new window.XMLSerializer()).serializeToString(xmlNode);
    } else if (typeof xmlNode.xml != "undefined") {
        return xmlNode.xml;
    }
    return "";
}

var createMarker = function(latlng,incident){
    return L.circleMarker(latlng,L.extend({
	radius:10,
	color:raceColor[incident.race],
	fillcolor:raceColor[incident.race],
	opacity:.5,
    },incident));
}

var loadedJson = function(err,data){
    if(err)
	console.log("failed to load json file");
    for(var borough in data){
	var bGrp = raceGrps[borough];
	for(var zipcode in data[borough]){
	    for(var addr in data[borough][zipcode]){
		var place = data[borough][zipcode][addr]
		var latlng = place.latlng;
		for(var i in place.data){
		    var incident = place.data[i];
		    var race = incident.race;
		    var rGrp = bGrp[race]
		    var marker = createMarker(latlng,incident);
		    rGrp.addLayer(marker);
		}		
	    }
	}
    }
};


var mcg = L.markerClusterGroup({
    maxClusterRadius:2*rmax,
//    spiderfyOnMaxZoom:false,
    iconCreateFunction:myIconFxn});

var raceGrps = function(){
    var res = {};
    for(var boro in boroName){
	res[boro] = {};
	for(var race in raceName)
	    res[boro][race] = new L.featureGroup.subGroup(mcg);
    }
    return res;
}();

var updateScale = function(){
    incidScale.domain(getMinMaxCluster());
    //console.log('upd',incidScale.domain());
    mcg.refreshClusters();
    return;
};

d3_queue.queue()
    .defer(d3.json,"data/countyIncRace.json")
    .defer(d3.json,"data/tractIncRace.json")
    .defer(d3.json,"data/fullData.json")
    .await(function(err,data,data2,data3){
	if(err){
	    console.log(err,data);
	    return;
	}
	loadedJson(err,data3);
	for(var i in data.features){
	    incColorScale.calcDomain(data.features[i]);
	}
	for(var i in data2.features){
	    incColorScale.calcDomain(data2.features[i]);
	}
	bkgrdGrp['county'] = L.geoJson(data,{style:giveMeStyle,onEachFeature:tellMeWhatDo});
	bkgrdGrp['tract'] = L.geoJson(data2,{style:giveMeStyle,onEachFeature:tellMeWhatDo});
	mymap.addControl(L.control.layers(null,bkgrdGrp,{collapsed:false,position:'bottomleft'}));
    });

var bkgrdGrp = {};

mymap.addLayer(mcg);
for(var b in raceGrps)
    mymap.addControl(L.control.layers(null,raceGrps[b],{collapsed:true,position:'bottomleft'}));

mymap.on({
    "overlayadd":updateScale,
    "overlayremove":updateScale,
    "moveend":updateScale
});
mcg.on("animationend",updateScale);


/******************************** toolbar stuff **********************************************/
var toolbar = L.control({position:'topright'});
toolbar.onAdd = function(map){
    var bar = L.DomUtil.create("div","toolbar");

    addRaceControls(bar);
    d3.select(bar).append("hr").classed("section-bar",true);
    addBoroControls(bar);
    d3.select(bar).append("hr").classed("section-bar",true);
    addIncRControls(bar);
    d3.select(bar).append("hr").classed("section-bar",true);
    
    L.DomEvent.disableClickPropagation(bar);
    L.DomEvent.disableScrollPropagation(bar);
    return bar
};

var addRaceControls = function(bar){
    var raceDiv = d3.select(bar).append("div").classed("race-options",true)[0][0];
    d3.select(raceDiv).append("span").classed("race-options-label label",true).text("Race");
    d3.select(raceDiv).selectAll('.race-selector').data(Object.keys(raceColor)).enter()
	.append('div')
	.attr("class",function(d,i){return "race-selector race-"+d;})
	.on("click",function(d,i){
	    var selected = this.classList.contains("selected");
	    var race = this.classList[1],
	    race = race[race.indexOf('-')+1]
	    
	    d3.select(this).classed("selected",!selected);
	    visVar[race] = !selected;
	    
	    for(var boro in raceGrps){
		if(visVar[boro])
		    !selected ? 
		    mymap.addLayer(raceGrps[boro][race]):mymap.removeLayer(raceGrps[boro][race]);
	    }
	    
	})
	//.style({background:function(d,i){return raceColor[d];}}) /* leave this to CSS */
	.text(function(d){return raceName[d];})

};

var addBoroControls = function(bar){
    var boroDiv = d3.select(bar).append("div").classed("boro-options",true)[0][0];
    d3.select(boroDiv).append("span").classed("boro-options-label label",true).text("Borough");
    d3.select(boroDiv).selectAll(".boro-selector").data(Object.keys(boroName)).enter()
	.append('div')
	.attr('class',function(d,i){return 'boro-selector boro-'+d+' selected';})
	.on("click",function(d,i){
	    var selected = this.classList.contains("selected"),
	    boro = this.classList[1],
	    boro = boro.substring(boro.indexOf('-')+1),
	    boro = boro=='STATEN'?"STATEN IS":boro;
	    	    
	    d3.select(this).classed("selected",!selected);
	    visVar[boro] = !selected;

	    for(var race in raceGrps[boro]){
		if(visVar[race])
		    !selected?
		    mymap.addLayer(raceGrps[boro][race]):mymap.removeLayer(raceGrps[boro][race]);
	    }
	})
	.text(function(d){return boroName[d];})

};

var addIncRControls = function(bar){
    var incRStates = {'N':'None','I':'Income','R':'Largest Race'};
    var sizeStates = {'C':'county','T':'tract'}
    var incRDiv = d3.select(bar).append("div").classed("incR-options",true)[0][0];
    d3.select(incRDiv).append("span").classed("incR-options-label label",true)
	.text("Income and Predominant Race");
    d3.select(incRDiv).append('div').classed("incR-selectors",true)
	.selectAll(".incR-selector").data(Object.keys(incRStates)).enter()
	.append('div')
	.attr('class',function(d,i){
	    return 'incR-selector incR-'+d+(d=='N'?' selected':'');})
	.on("click",function(d,i){
	    d3.selectAll('.incR-selector').classed('selected',false);
	    d3.select(this).classed("selected",true);
	    removeLegend();
	    if(this.classList.contains('incR-N')){
		if(mymap.hasLayer(bkgrdGrp['tract']))
		    mymap.removeLayer(bkgrdGrp['tract'])
		if(mymap.hasLayer(bkgrdGrp['county']))
		    mymap.removeLayer(bkgrdGrp['county'])
		d3.selectAll('.apple-selector').classed("selected",false);
		return;
	    }
	    visVar.inc = !this.classList.contains('incR-R');
	    if(!mymap.hasLayer(bkgrdGrp[sizeStates[visVar.county?'C':'T']]))
		mymap.addLayer(bkgrdGrp[sizeStates[visVar.county?'C':'T']])
	    updateBkgrdColor();
	    addLegend();
	})
	.text(function(d){return incRStates[d];});

    d3.select(incRDiv).append('div').classed('apple-selectors',true)
	.selectAll('.apple-selector').data(Object.keys(sizeStates)).enter()
	.append('div')
	.attr('class',function(d,i){return 'apple-selector apple-'+d})
	.on("click",function(d,i){
	    d3.selectAll('.apple-selector').classed("selected",false);
	    d3.select(this).classed("selected",true);
	    d3.selectAll(".incR-selector").classed("selected",false);
	    d3.select(visVar.inc?".incR-I":".incR-R").classed("selected",true);
	    visVar.county = this.classList.contains('apple-C');
	    removeLegend();
	    if(visVar.county && mymap.hasLayer(bkgrdGrp['tract']))
		mymap.removeLayer(bkgrdGrp['tract'])
	    if(!visVar.county && mymap.hasLayer(bkgrdGrp['county']))
		mymap.removeLayer(bkgrdGrp['county'])
	    visVar.county ? mymap.addLayer(bkgrdGrp['county']):
		mymap.addLayer(bkgrdGrp['tract']);
	    updateBkgrdColor();
	    addLegend();
	})
	.text(function(d){return sizeStates[d];});
};

var addLegend = function(){
    var legendDiv = d3.select('.toolbar').append("div").classed("legend-container",true)[0][0];
    var data = visVar.inc ? incColorScale.scale.range():raceColorScale.range();
    var label = visVar.inc ? "Income Legend":"Predominate Race Legend";
    d3.select(legendDiv).append("span").classed("legend-label label",true).text(label);
    d3.select(legendDiv)
	.selectAll('.legend-rows').data(data).enter()
	.append('div').attr('class',function(d,i){return 'legend-rows legend-row'+i;})
	.each(function(d,i){
	    d3.select(this).append('div').classed('legend-color',true)
		.style({background:d});
	    var domain = visVar.inc?
		incColorScale.scale.invertExtent(d):raceColorScale.invertExtent(i);
	    var text = visVar.inc?Math.round(domain[0])+' - '+Math.round(domain[1]):
		domain;
	    d3.select(this).append('div').classed('legend-text',true)
		//.style({display:'inline-block',padding:'3px'})
		.text(text);
	});
};

var removeLegend = function(){
    d3.selectAll(".legend-container").remove();
}

mymap.addControl(toolbar);
d3.selectAll(".leaflet-bottom.leaflet-left").attr("style","display:none");

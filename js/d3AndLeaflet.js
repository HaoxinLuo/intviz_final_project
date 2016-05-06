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
    //console.log(incidScale.domain(),n,cluster,incidScale(n));
    var data = d3.nest()
	.key(function(d){return d.options.race;})
	.entries(incidents);

    var options = {
	data: data,
	valueFxn:function(d){return d.values.length;},
	strokeWidth:strokeWidth,
	outerR:r,
	innerR:r-10,
	sliceClass:function(d){return "race-"+raceName[d.data.key];},
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
    var aGrp = raceGrp['All'];
    for(var borough in data){
	var bGrp = boroGrp[boroName[borough]];
	for(var zipcode in data[borough]){
	    for(var addr in data[borough][zipcode]){
		var place = data[borough][zipcode][addr]
		var latlng = place.latlng;
		for(var i in place.data){
		    var incident = place.data[i];
		    var race = incident.race;
		    var rGrp = raceGrp[raceName[race]]
		    var marker = createMarker(latlng,incident);
		    aGrp.addLayer(marker);
		    bGrp.addLayer(marker);
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

var raceGrp = {
    "All": L.featureGroup.subGroup(mcg),
    "Asian/Pacific Islander":  L.featureGroup.subGroup(mcg),
    "Black":  L.featureGroup.subGroup(mcg),
    "American Indian/Alaskan Native":  L.featureGroup.subGroup(mcg),
    "Black-Hispanic":  L.featureGroup.subGroup(mcg),
    "White-Hispanic":  L.featureGroup.subGroup(mcg),
    "White":  L.featureGroup.subGroup(mcg),
    "Unknown":  L.featureGroup.subGroup(mcg),
    "Other":  L.featureGroup.subGroup(mcg)
};
var boroGrp = {
    "Bronx": L.featureGroup.subGroup(mcg),
    "Manhattan":  L.featureGroup.subGroup(mcg),
    "Staten Island":  L.featureGroup.subGroup(mcg),
    "Queens":  L.featureGroup.subGroup(mcg),
    "Brooklyn":  L.featureGroup.subGroup(mcg),
};

var imagedCtrlGrp = {
    "<img src='icons/allColor.png' /> <span class='my-layer-item'>All</span>": 
    raceGrp["All"],
    "<img src='icons/aColor.png' /> <span class='my-layer-item'>Asian/Pacific Islander</span>":
    raceGrp["Asian/Pacific Islander"],
    "<img src='icons/bColor.png' /> <span class='my-layer-item'>Black</span>": 
    raceGrp["Black"],
    "<img src='icons/iColor.png'/><span class='my-layer-item'>American Indian/Alaskan Native</span>":
    raceGrp["American Indian/Alaskan Native"],
    "<img src='icons/pColor.png' /> <span class='my-layer-item'>Black-Hispanic</span>":
    raceGrp["Black-Hispanic"],
    "<img src='icons/qColor.png' /> <span class='my-layer-item'>White-Hispanic</span>": 
    raceGrp["White-Hispanic"],
    "<img src='icons/wColor.png' /> <span class='my-layer-item'>Whiter</span>": 
    raceGrp["White"],
    "<img src='icons/xColor.png' /> <span class='my-layer-item'>Unknown</span>": 
    raceGrp["Unknown"],
    "<img src='icons/zColor.png' /> <span class='my-layer-item'>Other</span>": 
    raceGrp["Other"]
};

var updateScale = function(){
    incidScale.domain(getMinMaxCluster());
    //console.log('upd',incidScale.domain());
    mcg.refreshClusters();
    return;
};

var updateThings = function(ev){
    foo = ev;
    if(ev.type=='overlayadd'&&(ev.name == 'tract' || ev.name=='county'))
	updateBkgrdColor(ev);
    else if(ev.name=="income/race"){
	visInc = !visInc;
	if(mymap.hasLayer(bkgrdGrp['tract']))
	    updateBkgrdColor({'layer':bkgrdGrp['tract']});
	else if(mymap.hasLayer(bkgrdGrp['county']))
	    updateBkgrdColor({'layer':bkgrdGrp['county']});	
    }
    else
	updateScale();
};

//d3.json("data/fullData.json",loadedJson);
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
	mymap.addControl(L.control.layers(null,bkgrdGrp,{collapsed:false,position:'topleft'}));
    });

var foo;

var bkgrdGrp = {
    "income/race":L.circle([0,0],0)
};

mymap.addLayer(mcg);
mymap.addControl(L.control.layers(null,imagedCtrlGrp,{collapsed:false,position:'topleft'}));
mymap.addControl(L.control.layers(null,boroGrp,{collapsed:false,position:'topleft'}));

mymap.on({
    "overlayadd":updateThings,
    "overlayremove":updateThings,
    "moveend":updateScale
});
mcg.on("animationend",updateScale);

var toolbar = L.control({position:'topright'});
toolbar.onAdd = function(map){
    var div = L.DomUtil.create("div","toolbar");
    d3.select(div).selectAll('.race-selector').data(Object.keys(raceColor)).enter()
	.append('div')
	.attr("class",function(d,i){return "race-selector race-"+d;})
	.style({background:function(d,i){return raceColor[d];}})
	.text(function(d){return raceName[d];})
    return div;

};
mymap.addControl(toolbar);

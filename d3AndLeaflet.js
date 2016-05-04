var latlngBounds = [[40.914550362677204,-73.65509033203126],
                    [40.498136668508536,-74.34173583984376]];
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

var mymap = L.map('mapid')
    .setView([40.73, -73.99], 11)
    .setMaxBounds(latlngBounds)
    .setMinZoom(11);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token'+
            '=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkif'+
            'Q._QA7i5Mpkd_m30IGElHziw', 
            {
                maxZoom: 17,
                minZoom: 11,
                attribution: 'Map data &copy;'+
                    '<a href="http://openstreetmap.org">OpenStreetMap</a>'+
                    'contributors,<a href="http://creativecommons.org/'+
                    'licenses/by-sa/2.0/">CC-BY-SA</a>,Imagery ©'+
                    '<a href="http://mapbox.com">Mapbox</a>',
                id: 'mapbox.streets',
                bounds:latlngBounds
            })
    .addTo(mymap);
var rmax = 30;



var myIconFxn = function(cluster){
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
	innerR:r-10,
	sliceClass:function(d){return "race-"+raceName[d.data.key];},
	sliceTooltip:function(d){
	    return d.data.values.length+' '+raceName[d.data.key];},
	colorFxn:function(d){return raceColor[d.data.key]},
	centerText:n
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

d3.json("data/fullData.json",loadedJson);

mymap.addLayer(mcg);
mymap.addControl(L.control.layers(null,raceGrp,{collapsed:false}));
mymap.addControl(L.control.layers(null,boroGrp,{collapsed:false}));

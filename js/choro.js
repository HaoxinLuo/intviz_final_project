// var minZoom = 11,maxZoom = 17;
// var latlngBounds = [[40.914550362677204,-73.65509033203126],
//                     [40.498136668508536,-74.34173583984376]];
// var mymap = L.map('mapid')
//     .setView([40.73, -73.99], 11)
//     .setMaxBounds(latlngBounds)
//     .setMinZoom(minZoom)
//     .setMaxZoom(maxZoom);
// L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token='
// 	    +'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ'
// 	    +'._QA7i5Mpkd_m30IGElHziw', {
//     maxZoom: maxZoom,
//     minZoom: minZoom,
//     attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
//     '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
//     'Imagery © <a href="http://mapbox.com">Mapbox</a>',
//     id: 'mapbox.light',
//     bounds:latlngBounds
// }).addTo(mymap);

var tellMeWhatDo = function(feature,layer){
    incColorScale.calcDomain(feature);
    // layer.bindPopup("<span>"+feature.properties.COUNTY+"</span>");
    // layer.on("click",function(){console.log(feature)});
};

var incColorScale = {
    scale : d3.scale.quantize().range(
	['#ffffff','#f0f0f0','#d9d9d9','#bdbdbd','#969696','#737373']),
    county : [Number.MAX_VALUE,0],
    tract : [Number.MAX_VALUE,0],    
    calcDomain: function(feature){
	var inc = feature.properties.income || 0;
	if(feature.properties.TRACT){
	    if(inc<this.tract[0]){this.tract[0] = inc;}
	    if(inc>this.tract[1]){this.tract[1] = inc;}
	}else{
	    if(inc<this.county[0]){this.county[0] = inc;}
	    if(inc>this.county[1]){this.county[1] = inc;}
	}
    },
    gColor : function(feature){
	this.scale.domain(feature.properties.TRACT ? this.tract:this.county);
	return this.scale(feature.properties.income||0);}
}

var raceColorScale = {
    raceColor : {'as':'#bef8e4','bl':'#fdc59b','am':'#dfdeed',
		 'hi':'#fad1e6','wh':'#ffecb3','tw':'#f4e1be','ot':'#e6e6e6'},
    storage: {},
    findDomRace :function(d){
	var max = 0,dom = '';
	for(var k in d){
	    if(!k.includes("population")||k=="population")
		continue;
	    if(max<+d[k]){
		max = +d[k];
		dom = k;
	    }
	}
	return dom;
    },
    gColor:function(feature){
	if(!feature._leaflet_id){
	    L.stamp(feature);
	    var dom = this.findDomRace(feature.properties);
	    this.storage[feature._leaflet_id]=this.raceColor[dom.substr(dom.indexOf('_')+1,2)];
	}
	return this.storage[feature._leaflet_id];	    
    }
	
}


var giveMeStyle = function(feature){
    return {
	stroke:true, //draw borders
	color:getBkgrdColor(feature), //gets color for layer in income/race
	weight:0.5, //border width(px)
	opacity:1.0, //border opacity
	fillOpacity:.5,//fill opacity
	interactive:true,//whether it reacts to events
    };
};

var visInc = true;
var getBkgrdColor = function(feature){
    return visInc ? incColorScale.gColor(feature):raceColorScale.gColor(feature);
};

var updateBkgrdColor = function(layerCtrlEvent){
    var layers  = layerCtrlEvent.layer.getLayers();
    for(var i in layers){
	layers[i].setStyle({color:getBkgrdColor(layers[i].feature)});
    }
};


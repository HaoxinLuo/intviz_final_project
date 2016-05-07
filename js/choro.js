
var tellMeWhatDo = function(feature,layer){
    incColorScale.calcDomain(feature);
    // layer.bindPopup("<span>"+feature.properties.COUNTY+"</span>");
    // layer.on("click",function(){console.log(feature)});
};

var incColorScale = {
    scale : d3.scale.quantize().range(
	['#bcbddc','#9e9ac8','#807dba','#6a51a3','#54278f','#3f007d']),
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
    raceColor : {'as':'#1b9e77','bl':'#d95f02','am':'#7570b3',
		 'hi':'#e7298a','wh':'#e6ab00','tw':'#a6761d','ot':'#666666'},
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
    },
    range:function(){
	var ans = []
	for(var r in this.raceColor)
	    ans.push(this.raceColor[r]);
	return ans;
    },
    invertExtent:function(i){
	return ['Asian','Black','American Indian','Hispanic Origin','White',
		'Mixed(Two or more races)','Other'][i];
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


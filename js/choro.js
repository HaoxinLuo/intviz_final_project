var onHover = function(ev){
    var layer = ev.target;
    d3.select(layer.getElement()).classed("incR-hover",true);
};

var endHover = function(ev){
    var layer = ev.target;
    d3.select(layer.getElement()).classed("incR-hover",false);
}

var tellMeWhatDo = function(feature,layer){
    incColorScale.calcDomain(feature);
    layer.on("mouseover",onHover);
    layer.on("mouseout",endHover);
    // layer.bindPopup("<span>"+feature.properties.COUNTY+"</span>");
    // layer.on("click",function(){console.log(feature)});
};

var incColorScale = {
    scale : d3.scale.quantize().range(
	['#ffffff','#f0f0f0','#d9d9d9','#bdbdbd','#969696','#737373']),
	//['#d9d9d9','#bdbdbd','#969696','#737373','#525252','#252525']),
	//['#f2f0f7','#dadaeb','#bcbddc','#9e9ac8','#756bb1','#54278f']),
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
	fillColor:getBkgrdColor(feature), //gets color for layer in income/race
	weight:0.5, //border width(px)
	opacity:1.0, //border opacity
	fillOpacity:.5,//fill opacity
	interactive:true,//whether it reacts to events
    };
};

var visVar = {inc:true,county:true,
	      BRONX:true,BROOKLYN:true,MANHATTAN:true,'STATEN IS':true,QUEENS:true,
	     'A':false,'B':false,'I':false,'P':false,'Q':false,'W':false,'U':false,'Z':false};

var getBkgrdColor = function(feature){
    return visVar.inc ? incColorScale.gColor(feature):raceColorScale.gColor(feature);
};

var updateBkgrdColor = function(){
    var layers  = bkgrdGrp[visVar.county?'county':'tract'].getLayers();
    for(var i in layers){
	layers[i].setStyle({color:getBkgrdColor(layers[i].feature)});
    }
};


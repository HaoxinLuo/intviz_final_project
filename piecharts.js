var mymap = L.map('mapid').setView([40.73, -73.99], 11);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.light'
}).addTo(mymap);

function loadJSON(callback) {   
    //http://codepen.io/KryptoniteDove/post/load-json-file-locally-using-pure-javascript
    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', 'data/data.json', true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);  
 }

function drawPieCharts(response){
    var data = JSON.parse(response);
//    points = [];
    for(var borough in data){
	for(var zipcode in data[borough]){
	    for(var loc in data[borough][zipcode]){
		place = data[borough][zipcode][loc]
		//createPieChart(place).addTo(mymap);
		var pie = createPieChart(place);
//		points.push(pie);
	    }
	}
    }
    // points.sort(function(a,b){
    // 	return b._numPpl - a._numPpl;
    // });
    // for(var point in points){
    // 	//points[point].addTo(mymap);
    // }
}

function createPieChart(place){
    var data = {};
    var total = place.data.length;
    for(var person in place.data){
	var race = place.data[person].race;
	if (!(race in data)){data[race]=0;}
	data[race] +=1;
    }
    // var group = L.layerGroup();	
    var startAngle = 0;
    for(var race in data){
	var color = getColor(race);
	var x = parseFloat(place.latlng[0]);
	var y = parseFloat(place.latlng[1]);
	var endAngle = (data[race]/total)*360.0+startAngle;
	var slice = L.circle([x,y],total*15,{
	    color:color, startAngle:startAngle,stopAngle:endAngle})
	// group.addLayer(slice);
	addToOverlay(race,slice);
	slice.bindPopup(getRace(race)+":"+data[race]);
	startAngle = endAngle;
    }
    // group._numPpl = total;
    // return group;
}

function addToOverlay(race,slice){
    overlays['All'].addLayer(slice);
    overlays[getRace(race)].addLayer(slice);
}

function getRace(race){
    races = {'A':'Asian/Pacific Islander','B':'Black',
	     'I':'American Indian/Alaskan Native','P':'Black-Hispanic',
	     'Q':'White-Hispanic','W':'White','U':'Unknown','Z':'Other'};
    return races[race];
}    

function getColor(race){
    races = {'A':'#1b9e77','B':'#d95f02','I':'#7570b3','P':'#e7298a',
	     'Q':'#66a61e','W':'#e6ab00','U':'#a6761d','Z':'#666666'};
    return races[race];
}

function bringToFront(e){
    activeSlices = []
    for(var race in overlays){
	overlay = overlays[race];
	if(overlayActive(overlay)){
	    layers = overlay.getLayers();
	    for(var layer in layers){
		var slice = layers[layer];
		activeSlices.push(slice);
	    }
	}
    }
    activeSlices.sort(function(a,b){return b.options.radius-a.options.radius;});
    for(var slice in activeSlices){
	activeSlices[slice].bringToFront();
    }
}

function overlayActive(overlay){
    try{
	return overlay.getBounds() != null;
    }catch(e){
	return false;
    }
}



var overlays = {
    "All": new L.featureGroup(),
    "Asian/Pacific Islander": new L.featureGroup(),
    "Black": new L.featureGroup(),
    "American Indian/Alaskan Native": new L.featureGroup(),
    "Black-Hispanic": new L.featureGroup(),
    "White-Hispanic": new L.featureGroup(),
    "White": new L.featureGroup(),
    "Unknown": new L.featureGroup(),
    "Other": new L.featureGroup()
};
loadJSON(drawPieCharts);


var overlays2 = {
    "<img src='icons/allColor.png' /> <span class='my-layer-item'>All</span>": overlays["All"],
    "<img src='icons/aColor.png' /> <span class='my-layer-item'>Asian/Pacific Islander</span>": overlays["Asian/Pacific Islander"],
    "<img src='icons/bColor.png' /> <span class='my-layer-item'>Black</span>": overlays["Black"],
    "<img src='icons/iColor.png' /> <span class='my-layer-item'>American Indian/Alaskan Native</span>":overlays["American Indian/Alaskan Native"],
    "<img src='icons/pColor.png' /> <span class='my-layer-item'>Black-Hispanic</span>": overlays["Black-Hispanic"],
    "<img src='icons/qColor.png' /> <span class='my-layer-item'>White-Hispanic</span>": overlays["White-Hispanic"],
    "<img src='icons/wColor.png' /> <span class='my-layer-item'>Whiter</span>": overlays["White"],
    "<img src='icons/xColor.png' /> <span class='my-layer-item'>Unknown</span>": overlays["Unknown"],
    "<img src='icons/zColor.png' /> <span class='my-layer-item'>Other</span>": overlays["Other"]
};

L.control.layers(null, overlays2,{autoZIndex:false,collapsed:false}).addTo(mymap);
mymap.on("overlayadd",bringToFront);



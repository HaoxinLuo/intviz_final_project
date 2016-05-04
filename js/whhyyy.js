    
var mymap = L.map('mapid').setView([40.73, -73.99], 11);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.streets'
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

function getColor(lst, nums){
    races = {'A':'#1b9e77','B':'#d95f02','I':'#7570b3','P':'#e7298a',
	     'Q':'#66a61e','W':'#e6ab00','X':'#a6761d','Z':'#666666'};
    for (var person in lst){
	nums[lst[person].race] += 1;
    }
    max = 'A';
    for (var race in nums){
	if (nums[max] < nums[race]){
	    max = race;
	}
    }
    return races[max];
}


function getBlurb(lst){
    nums = {'A':0,'B':0,'I':0,'P':0,
	     'Q':0,'W':0,'X':0,'Z':0};
    for (var person in lst){
	nums[lst[person].race] += 1;
    }
    retVal = '';
    for (var key in nums){
	if (nums[key] > 0){
	    retVal += key + ':' + nums[key] + '\n';
	}
    }
    return retVal;
}

var allRaces = new L.LayerGroup();
var asian = new L.LayerGroup();
var black = new L.LayerGroup();
var amerIndian = new L.LayerGroup();
var blcHispanic = new L.LayerGroup();
var whtHispanic = new L.LayerGroup();
var white = new L.LayerGroup();
var unknown = new L.LayerGroup();
var other = new L.LayerGroup(); 	     

function drawAllCircles(response){
    data = JSON.parse(response);
    points = []
    for(var borough in data){
    	for(var zipcode in data[borough]){
    	    for(var incident in data[borough][zipcode]){
    		place = data[borough][zipcode][incident]
		/***** merge this later *************/
    		// x_cor = parseFloat(place.latlng[0]);
    		// y_cor = parseFloat(place.latlng[1]);
    		// elements = place.data.length;
    		// color = getColor(place.data);
    		// points.push(L.circle([x_cor, y_cor], elements * 20, {
    		//     color: color,
    		//     fillColor: color,
    		//     fillOpacity: 0.20
    		// }).bindPopup(getBlurb(place.data)));

		x_cor = parseFloat(place.latlng[0]);
		y_cor = parseFloat(place.latlng[1]);
		elements = place.data.length;
		nums = {'A':0,'B':0,'I':0,'P':0,
			'Q':0,'W':0,'X':0,'Z':0};
		color = getColor(place.data,nums);
		L.circle([x_cor, y_cor], elements * 20, {
		    color: color,
		    fillColor: color,
		    fillOpacity: 0.20
		}).addTo(allRaces).bindPopup(elements + " stops");
		if (nums['A'] > 0)
		    L.circle([x_cor, y_cor], nums['A'] * 20, {
			color: '#1b9377',
			fillColor: '#1b9377',
			fillOpacity: 0.20
		    }).addTo(asian).bindPopup(nums['A'] + " stops");
		if (nums['B'] > 0)
		    L.circle([x_cor, y_cor], nums['B'] * 20, {
			color: '#d95f02',
			fillColor: '#d95f02',
			fillOpacity: 0.20
		    }).addTo(black).bindPopup(nums['B'] + " stops");
		if (nums['I'] > 0)
		    L.circle([x_cor, y_cor], nums['I'] * 20, {
			color: '#7570b3',
			fillColor: '#7570b3',
			fillOpacity: 0.20
		    }).addTo(amerIndian).bindPopup(nums['I'] + " stops");
		if (nums['P'] > 0)
		    L.circle([x_cor, y_cor], nums['P'] * 20, {
			color: '#e7298a',
			fillColor: '#e7298a',
			fillOpacity: 0.20
		    }).addTo(blcHispanic).bindPopup(nums['P'] + " stops");
		if (nums['Q'] > 0)
		    L.circle([x_cor, y_cor], nums['Q'] * 20, {
			color: '#66a61e',
			fillColor: '#66a61e',
			fillOpacity: 0.20
		    }).addTo(whtHispanic).bindPopup(nums['Q'] + " stops");
		if (nums['W'] > 0)
		    L.circle([x_cor, y_cor], nums['W'] * 20, {
			color: '#e6ab00',
			fillColor: '#e6ab00',
			fillOpacity: 0.20
		    }).addTo(white).bindPopup(nums['W'] + " stops");
		if (nums['X'] > 0)
		    L.circle([x_cor, y_cor], nums['X'] * 20, {
			color: '#a6761d',
			fillColor: '#a6761d',
			fillOpacity: 0.20
		    }).addTo(other).bindPopup(nums['X'] + " stops");
		if (nums['Z'] > 0)
		    L.circle([x_cor, y_cor], nums['Z'] * 20, {
			color: '#666666',
			fillColor: '#666666',
			fillOpacity: 0.20
		    }).addTo(unknown).bindPopup(nums['Z'] + " stops");

    	    }
    	}
    }
    points.sort(function(a,b){
	return b._mRadius - a._mRadius;
    });
    for(var point in points){
	points[point].addTo(mymap);
    }
}
loadJSON(drawAllCircles);

var overlays = {
    "All": allRaces,
    "Asian/Pacific Islander": asian,
    "Black": black,
    "American Indian/Alaskan Native": amerIndian,
    "Black-Hispanic": blcHispanic,
    "White-Hispanic": whtHispanic,
    "White": white,
    "Unknown": unknown,
    "Other": other 
};

L.control.layers(null, overlays).addTo(mymap);


//var popup = L.popup();

//function onMapClick(e) {
//    popup
//	.setLatLng(e.latlng)
//	.setContent("You clicked the map at " + e.latlng.toString())
//	.openOn(mymap);
//}

// mymap.on('click', onMapClick);

    
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

function getColor(lst){
    races = {'A':'#1b9e77','B':'#d95f02','I':'#7570b3','P':'#e7298a',
	     'Q':'#66a61e','W':'#e6ab00','X':'#a6761d','Z':'#666666'};
    nums = {'A':0,'B':0,'I':0,'P':0,
	     'Q':0,'W':0,'X':0,'Z':0};
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

function drawAllCircles(response){
    data = JSON.parse(response);
    for(var borough in data){
    	for(var zipcode in data[borough]){
    	    for(var incident in data[borough][zipcode]){
    		place = data[borough][zipcode][incident]
		x_cor = parseFloat(place.latlng[0]);
		y_cor = parseFloat(place.latlng[1]);
		elements = place.data.length;
		color = getColor(place.data);
		L.circle([x_cor, y_cor], elements * 20, {
		    color: color,
		    fillColor: color,
		    fillOpacity: 0.20
		}).addTo(mymap).bindPopup(elements + " many stops");

    	    }
    	}
    }
}
loadJSON(drawAllCircles);



var popup = L.popup();

function onMapClick(e) {
    popup
	.setLatLng(e.latlng)
	.setContent("You clicked the map at " + e.latlng.toString())
	.openOn(mymap);
}

// mymap.on('click', onMapClick);

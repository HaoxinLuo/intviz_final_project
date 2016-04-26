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

function drawPieCharts(response){
    var data = JSON.parse(response);
    points = [];
    for(var borough in data){
	for(var zipcode in data[borough]){
	    for(var loc in data[borough][zipcode]){
		place = data[borough][zipcode][loc]
		//createPieChart(place).addTo(mymap);
		var pie = createPieChart(place);
		points.push(pie);
	    }
	}
    }
    points.sort(function(a,b){
	return b._numPpl - a._numPpl;
    });
    for(var point in points){
	points[point].addTo(mymap);
    }
}

function createPieChart(place){
    var data = {};
    var total = place.data.length;
    for(var person in place.data){
	var race = place.data[person].race;
	if (!(race in data)){data[race]=0;}
	data[race] +=1;
    }
    var group = L.layerGroup();
    var startAngle = 0;
    for(var race in data){
	var color = getColor(race);
	var x = parseFloat(place.latlng[0]);
	var y = parseFloat(place.latlng[1]);
	var endAngle = (data[race]/total)*360.0+startAngle;
	var slice = L.circle([x,y],total*15,{
	    color:color, startAngle:startAngle,stopAngle:endAngle})
	group.addLayer(slice);
	slice.bindPopup(getRace(race)+":"+data[race]);
	startAngle = endAngle;
    }
    group._numPpl = total;
    return group;
}

function getRace(race){
    races = {'A':'Asian/Pacific Islander','B':'Black',
	     'I':'American Indian/Alaskan Native','P':'Black-Hispanic',
	     'Q':'White-Hispanic','W':'White','X':'Unknown','Z':'Other'};
    return races[race];
}    

function getColor(race){
    races = {'A':'#1b9e77','B':'#d95f02','I':'#7570b3','P':'#e7298a',
	     'Q':'#66a61e','W':'#e6ab00','X':'#a6761d','Z':'#666666'};
    return races[race];
}

loadJSON(drawPieCharts);

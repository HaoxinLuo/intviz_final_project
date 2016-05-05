var minZoom = 11,maxZoom = 17;
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
    id: 'mapbox.light',
    bounds:latlngBounds
}).addTo(mymap);

var sdk = new CitySDK();
var census = sdk.modules.census;
census.enable("b07f18d15179f62d5041038024bcd34c0c6cf321");

var request = {
    zip: "10001",
    level: "county",
    sublevel: true,
    container: "place",
    variables: [
        "income",
	"population_white_alone",
	"population_two_or_more_races",
	"population_other_alone",
	"population_native_hawaiian_alone",
	"population_asian_alone",
	"population_american_indian_alone",
	"population",
	"population_hispanic_origin",
	"population_black_alone"
    ]
    
};


var data,gjson;
census.GEORequest(request,function(d){
    data = d;
    gjson = L.geoJson(data);
    gjson.addTo(mymap);
 
    dl = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));

    var a = document.createElement('a');
    a.href = 'data:' + dl;
    a.download = 'data.json';
    a.innerHTML = 'download JSON';
    
    var container = document.getElementById('container');
    container.appendChild(a);
    //console.log(JSON.stringify(d));
    
});

// d3.json("data/incomeAndRace.json",function(d){
//     console.log(d);
//     L.geoJson(d).addTo(mymap);
// });

function loadJson(callback){
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open("GET","data/test.json",true);
    xobj.onreadystatechange=function(){
	if(xobj.readyState = 4 && xobj.status=="200"){
	    callback(xobj.responseText);
	    }
    };
    xobj.send(null);
}

function init(){
    loadJson(function(response){
	var actual_JSON = JSON.parse(response);
	getGeoCode(actual_JSON);
    });
}

function getGeoCode(json){
    var geocoder = new google.maps.Geocoder();

    for(var i = 0;i<json.length;i++){
	addrnum = +json[i].addrnum;
	stname = +json[i].stname;
	stinter = +json[i].stinter;
	crossst = +json[i].crossst;
	if(addrnum!=NaN && addrnum>0){//a num and > 0
	    // geocoder.geocode({'address':addrnum+' '+stname},function(results,status){
	    // 	if(status === google.maps.GeocoderStatus.OK){
	    // 	    json[i].latlng = results[0].geometry.location;
	    // 	    console.log(results[0].geometry.location,i);
	    // 	}
	    // });		 

	}//end of a num and > 0


    }


}

init();
console.log('hi');


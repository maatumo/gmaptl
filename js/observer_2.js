var file;
var body;
var bodyType;
var flight_state;
var state=0;//0が観測者モード、1がpilot modeもで自分の位置情報を数秒に一回発信
var heliPrediction={};


//Firebase Legacy
var dataStore;
dataStore = new Firebase('https://amakusa.firebaseio.com/');
var airplanes=dataStore.child('airplanes');

var mymarker;
//icons
var marker = [];
var infoWindow = [];
var markerData = [];

// Maps
var map;
var tokyo;
var pos;
function initMap() {//keyを取得してgoogle maps apiのsourceを取得した後に発火する
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 35.689614, lng: 139.691585},
		zoom: 12
	});
	// tokyo = new google.maps.LatLng(35.689614,139.691585);
	// pos = new google.maps.LatLng(34.686272,135.519649);	
}


//Get Key
var gkey;
dataStore.child('key').on('child_added',function(dataSnapShot){
	gkey = dataSnapShot.val();
	// console.log("gkey"+gkey);
//	var src="http://maps.google.com/maps/api/js?sensor=false&libraries=geometry"
	var src= "https://maps.googleapis.com/maps/api/js?key="+gkey+"&libraries=geometry&callback=initMap";
	var scriptElement = document.createElement('script');
	scriptElement.src = src ;
	document.getElementsByTagName('head')[0].appendChild(scriptElement);
});


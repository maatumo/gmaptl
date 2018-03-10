
if(localStorage){
	console.log('localStrage is available!');
}

var logText;
var now;
//Firebase Legacy

var dataStore;
dataStore = new Firebase('https://amakusa.firebaseio.com/');
var airplanes=dataStore.child('airplanes');


//firebaseの情報が変更されたら発火
airplanes.on('value',function(dataSnapShot){
	var data = dataSnapShot.val();
	console.log('data from firebase!');
	console.log(data);
	markerData = [];
	for(var bodyname in data){//firebaseからのデータをMarkerDataに格納
		console.log(bodyname+" data "+data[bodyname]);
		markerData.push({
	        name: bodyname,
	        lat: data[bodyname]["lat"],
	        lng: data[bodyname]["lng"],
	        bodyType: data[bodyname]["bodyType"],
	        updateTime: data[bodyname]["updateTime"],
	        flightState: data[bodyname]["flightState"],
	        velocity: data[bodyname]["velocity"],
	        heading: data[bodyname]["heading"],
	    });
	}
	var date=new Date();
	now=date.getFullYear()  + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    logText=localStorage.getItem('Log')+"\r\n\r\n"+now+"\r\n"+JSON.stringify(markerData);
	localStorage.setItem('Log', logText);

    document.getElementById('answer').innerHTML ="<textarea cols='100' rows='10'>"+logText+"</textarea>";

});


function handleDownload() {
    var blob = new Blob([ logText ], { "type" : "text/plain" });
    var fileName=now;

    if (window.navigator.msSaveBlob) { 
        window.navigator.msSaveBlob(blob, fileName); 

        // msSaveOrOpenBlobの場合はファイルを保存せずに開ける
        window.navigator.msSaveOrOpenBlob(blob, fileName); 
    } else {
        document.getElementById("download").href = window.URL.createObjectURL(blob);
    }
}

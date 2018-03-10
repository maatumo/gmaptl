
var file;
var body;
var bodyType;
var state=0;//0が観測者モード、1がpilot modeもで自分の位置情報を数秒に一回発信

debugList=[];
debugList[3]='test';

console.log(debugList);

if(localStorage){
	//機体名の取得
	body=localStorage.getItem('myBodyName');
	bodyType=localStorage.getItem('myBodyType');
	if(body){
		state=1;
	}
}

var myPos={lat:32.4,lng:130.2};

//Firebase Legacy
var dataStore;
dataStore = new Firebase('https://amakusa.firebaseio.com/');
var airplanes=dataStore.child('airplanes');

var mymarker;
//icons
var marker = [];
var infoWindow = [];
var markerData = [];
var alertAreas=[];
var	alertAreas2=[];

// Maps
	var map;
	var tokyo;
	var pos;

	function initMap() {//keyを取得してgoogle maps apiのsourceを取得した後に発火する
		map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: 32.4, lng: 130.2},
			zoom: 12
			}
		);
		tokyo = new google.maps.LatLng(35.689614,139.691585);
		pos = new google.maps.LatLng(34.686272,135.519649);

		//image設定
		drone_image={url:'drone_mini.png',size: new google.maps.Size(50, 50),
			origin: new google.maps.Point(0, 0),anchor: new google.maps.Point(25, 25)};
		heli_image={url:'heli_mini.png',size: new google.maps.Size(90, 67),
			origin: new google.maps.Point(0, 0),anchor: new google.maps.Point(45, 33)};



		//すでにある機体データをロードして表示
		for (var i = 0; i < markerData.length; i++) {
			var iconType;
			if(markerData[i]['bodyType']=="Multicopter"){
				iconType=drone_image;
			}else if(markerData[i]['bodyType']=="Helicopter"){
				iconType=heli_image;
			}
	        markerLatLng = new google.maps.LatLng({lat: markerData[i]['lat'], lng: markerData[i]['lng']}); // 緯度経度のデータ作成
    	    marker[i] = new google.maps.Marker({ // マーカーの追加
        	    position: markerLatLng, // マーカーを立てる位置を指定
           	 	map: map, // マーカーを立てる地図を指定
	        	icon: iconType,//アイコン指定
	        	anchor: 0.5,
	        });
	        infoWindow[i] = new google.maps.InfoWindow({ // 吹き出しの追加
    	        content: '<div class="sample">' + markerData[i]['name'] + '</div>' // 吹き出しに表示する内容
        	});
	        markerEvent(i); // マーカーにクリックイベントを追加


			// 危険エリアの表示
			alertAreas[i]= new google.maps.Circle({
			  center: markerLatLng,       // 中心点(google.maps.LatLng)
			  fillColor: '#00ff00',   // 塗りつぶし色
			  fillOpacity: 0.2,       // 塗りつぶし透過度（0: 透明 ⇔ 1:不透明）
			  map: map,        // 表示させる地図（google.maps.Map）
			  radius: 900,          // 半径（ｍ）
			  strokeColor: '#00ff00', // 外周色 
			  strokeOpacity: 1,       // 外周透過度（0: 透明 ⇔ 1:不透明）
			  strokeWeight: 1         // 外周太さ（ピクセル）
			});
			// 危険エリアの表示
			alertAreas2[i]= new google.maps.Circle({
			  center: markerLatLng,       // 中心点(google.maps.LatLng)
			  fillColor: '#00ff00',   // 塗りつぶし色
			  fillOpacity: 0.2,       // 塗りつぶし透過度（0: 透明 ⇔ 1:不透明）
			  map: map,        // 表示させる地図（google.maps.Map）
			  radius: 1800,          // 半径（ｍ）
			  strokeColor: '#00ff00', // 外周色 
			  strokeOpacity: 1,       // 外周透過度（0: 透明 ⇔ 1:不透明）
			  strokeWeight: 1         // 外周太さ（ピクセル）
			});
	    }



		//自分の位置のマーカー
		
		if(mymarker){mymarker.setMap(null);}
		mymarkerLatLng = new google.maps.LatLng({lat: myPos["lat"], lng: myPos["lng"]}); // 緯度経度のデータ作成
		mymarker = new google.maps.Marker({ // マーカーの追加
		position: mymarkerLatLng, // マーカーを立てる位置を指定
		map: map, // マーカーを立てる地図を指定
		draggable:true,
		icon: 'self_pos.png',
		});

		// マーカーのドロップ（ドラッグ終了）時のイベント
		google.maps.event.addListener( mymarker, 'dragend', function(ev){
			// イベントの引数evの、プロパティ.latLngが緯度経度。
			myPos["lat"] = ev.latLng.lat();
			myPos["lng"] = ev.latLng.lng();
			
			setPos(myPos["lat"],myPos["lng"]);
			var date = new Date();
			if(state){
			dataStore.child('airplanes').child(body).update({
		  		lat: myPos["lat"],
			  	lng: myPos["lng"],
			  	bodyType: bodyType,
			  	updateTime: date.getFullYear()  + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
				});
			}

		});
		
	}


	// マーカーにクリックイベントを追加
	function markerEvent(i) {
    	marker[i].addListener('click', function() { // マーカーをクリックしたとき
        infoWindow[i].open(map, marker[i]); // 吹き出しの表示
    	});
    }
	function OnButtonClick() {
	target = document.getElementById("output");
	target.innerHTML = "penguin";
	}

	function setTokyo() {
	  map.setCenter(tokyo);
	}

	function setPos(lat,lng) {
		pos = new google.maps.LatLng(lat,lng);
	    map.setCenter(pos);
	}



//Get Key
var gkey;
dataStore.child('key').on('child_added',function(dataSnapShot){
	gkey = dataSnapShot.val();
	console.log("gkey"+gkey);
//	var src="http://maps.google.com/maps/api/js?sensor=false&libraries=geometry"
	var src= "https://maps.googleapis.com/maps/api/js?key="+gkey+"&libraries=geometry&callback=initMap";
	var scriptElement = document.createElement('script');
	scriptElement.src = src ;
	document.getElementsByTagName('head')[0].appendChild(scriptElement);
});

// airplanes.on('child_changed',function(dataSnapShot){
// 	var data = dataSnapShot.val();
// });

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
	        updateTime: data[bodyname]["updateTime"]
	    });
	}
	//更新時にマーカーとかを消す http://www.ajaxtower.jp/googlemaps/gmarker/index4.html
	for (var i = 0; i < marker.length; i++) {
		marker[i].setMap(null);
	}
	for (var i = 0; i < marker.length; i++) {
		alertAreas[i].setMap(null);
	}
	for (var i = 0; i < marker.length; i++) {
		alertAreas2[i].setMap(null);
	}
	marker=[];
	alertAreas=[];
	alertAreas2=[];
	distance=[];//他機との距離のリスト（自分の機体の時はスルー）
	alertMessages=[];
	cationMessages=[];
	for (var i = 0; i < markerData.length; i++) {//各機体に関するループ
		var iconType;
		if(markerData[i]['bodyType']=="Multicopter"){
			iconType=drone_image;
		}else if(markerData[i]['bodyType']=="Helicopter"){
			iconType=heli_image;
		}
		markerLatLng = new google.maps.LatLng({lat: markerData[i]['lat'], lng: markerData[i]['lng']}); // 緯度経度のデータ作成
		marker[i] = new google.maps.Marker({ // マーカーの追加
		position: markerLatLng, // マーカーを立てる位置を指定
		map: map, // マーカーを立てる地図を指定
        icon: iconType,//アイコン指定

		});
		infoWindow[i] = new google.maps.InfoWindow({ // 吹き出しの追加
		content: '<div class="sample">' + markerData[i]['name'] + '</div>' // 吹き出しに表示する内容
		});
		markerEvent(i); // マーカーにクリックイベントを追加

		// 危険エリアの表示
		// 他機との中心間の距離のけいさん
		//自分の機体の時は発火せず
		var circle_color='#ff0000';
		if(body!=markerData[i]['name']){
			distance[i] = google.maps.geometry.spherical.computeDistanceBetween(markerLatLng, mymarkerLatLng);
			if(distance[i]<1800){
				alertMessages[i]=markerData[i]['name'];
				circle_color='#ff0000';
			}else if(distance[i] >= 1800 && distance[i]<3600){
				circle_color='#ccff00';
				cationMessages[i]=markerData[i]['name'];
			}else{
				circle_color='#33ccff';				
			}
			console.log(markerData[i]['name']+" : "+distance[i]);
		}

		alertAreas[i]= new google.maps.Circle({
		  center: markerLatLng,       // 中心点(google.maps.LatLng)
		  fillColor: circle_color,  // 塗りつぶし色
		  fillOpacity: 0.2,       // 塗りつぶし透過度（0: 透明 ⇔ 1:不透明）
		  map: map,        // 表示させる地図（google.maps.Map）
		  radius: 900,          // 半径（ｍ）
		  strokeColor: circle_color, // 外周色 
		  strokeOpacity: 1,       // 外周透過度（0: 透明 ⇔ 1:不透明）
		  strokeWeight: 1         // 外周太さ（ピクセル）
		});

		alertAreas2[i]= new google.maps.Circle({
		  center: markerLatLng,       // 中心点(google.maps.LatLng)
		  fillColor: circle_color,  // 塗りつぶし色
		  fillOpacity: 0.2,       // 塗りつぶし透過度（0: 透明 ⇔ 1:不透明）
		  map: map,        // 表示させる地図（google.maps.Map）
		  radius: 1800,          // 半径（ｍ）
		  strokeColor: circle_color, // 外周色 
		  strokeOpacity: 1,       // 外周透過度（0: 透明 ⇔ 1:不透明）
		  strokeWeight: 1         // 外周太さ（ピクセル）
		});
		
	}
	console.log("alerts");
	console.log(alertMessages);
	var at=document.getElementById('alertText');
	if(alertMessages.length!=0){
		at.innerHTML = "ALERT: <1 mile [Land Your Drone!]";
		at.style.background="#ff0000";
	}else if(cationMessages.length!=0){
		at.innerHTML = "ALERT: <2 mile";
		at.style.background="#ccff00";
	}else{
		at.innerHTML = "Safe Flight: >2 mile";
		at.style.background="#55bbff";
	}


});


//定期的に位置情報を発信する。http://qiita.com/yutori_enginner/items/98ecaae8945e3c17efa2
	var StartTimer, StopTimer, Timer, time, timerID;
	time = 0;
	timerID = 0;
	StartTimer = function() {
		time = 0;
		timerID = setInterval(Timer/*定期的に呼び出す関数名*/, 1000/*呼び出す間隔*/);
	};
	StopTimer = function() {
	  clearInterval(timerID);
	};
	Timer = function() {
	  time = time + 1;
	  console.log(time);
	  if (time > 3) {
	    StopTimer();
	    // 情報の更新
	    setPos(myPos["lat"],myPos["lng"]);
		var date = new Date();
		if (state){
			dataStore.child('airplanes').child(body).update({
			  lat: myPos["lat"],
			  lng: myPos["lng"],
			  bodyType: bodyType,
			  updateTime: date.getFullYear()  + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
			});
		}
		//自分の位置のマーカー
		
		if(mymarker){		mymarker.setMap(null);}
		mymarkerLatLng = new google.maps.LatLng({lat: myPos["lat"], lng: myPos["lng"]}); // 緯度経度のデータ作成
		mymarker = new google.maps.Marker({ // マーカーの追加
		position: mymarkerLatLng, // マーカーを立てる位置を指定
		map: map, // マーカーを立てる地図を指定
		draggable:true,
		icon: 'self_pos.png',
		});

		// マーカーのドロップ（ドラッグ終了）時のイベント

		google.maps.event.addListener( mymarker, 'dragend', function(ev){
			// イベントの引数evの、プロパティ.latLngが緯度経度。
			myPos["lat"] = ev.latLng.lat();
			myPos["lng"] = ev.latLng.lng();

			setPos(myPos["lat"],myPos["lng"]);
			var date = new Date();
						if(state){
			dataStore.child('airplanes').child(body).update({
		  			lat: myPos["lat"],
			  		lng: myPos["lng"],
				  	bodyType: bodyType,
				  	updateTime: date.getFullYear()  + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
				});
			}
		});

		if(file){//ファイル選択後はこれが発火
			console.log(file);
			//FileReaderの作成
			var reader = new FileReader();
			//テキスト形式で読み込む
			reader.readAsText(file[0]);
			console.log(reader);
			  
			//読込終了後の処理
			reader.onload = function(ev){
			  //テキストエリアに表示する
			  var res=reader.result;
			  console.log(res);
			  document.getElementById('res').innerHTML = reader.result;
			  var data= res.split(",");
			  console.log(data);
				myPos["lat"] = parseFloat(data[0]);
				myPos["lng"] = parseFloat(data[1]);

			}
		}

    	StartTimer();
	    // return alert("情報が更新されました");
	  }
	};
		
	StartTimer();//タイマースタートするか否か
	



window.onload = function() {//初期化
	var obj1 = document.getElementById("selfile");
	//ダイアログでファイルが選択された時
	obj1.addEventListener("change",function(evt){
	  console.log("fired");
	  file = evt.target.files;
	},false);

};


function initFile(){//ファイル初期化
	file="";
	var area = document.getElementById('span1');  
	var temp = area.innerHTML;  
    document.getElementById('res').innerHTML ="please reload this browser";
	area.innerHTML = temp; 
}
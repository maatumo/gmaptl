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
var alertAreas=[];
var	alertAreas2=[];
var	predictedPath=[];
var	predictedPos=[];
var num_prediction=0;

// Maps
	var map;
	var tokyo;
	var pos;
	function initMap() {//keyを取得してgoogle maps apiのsourceを取得した後に発火する
		map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: 32.4, lng: 130.1},
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
		drone_image_b={url:'drone_mini_b.png',size: new google.maps.Size(50, 50),
			origin: new google.maps.Point(0, 0),anchor: new google.maps.Point(25, 25)};
		heli_image_b={url:'heli_mini_b.png',size: new google.maps.Size(90, 67),
			origin: new google.maps.Point(0, 0),anchor: new google.maps.Point(45, 33)};
		heli_predicted_image={url:'predictedPos.png',size: new google.maps.Size(60, 60),
			origin: new google.maps.Point(0, 0),anchor: new google.maps.Point(30, 30)};



		//すでにある機体データをロードして表示
		for (var i = 0; i < markerData.length; i++) {
			var iconType;
			if(markerData[i]['bodyType']=="Multicopter"){
				iconType=drone_image;
			}else if(markerData[i]['bodyType']=="Helicopter"){
				iconType=heli_image;
			}
	        markerLatLng = new google.maps.LatLng({lat: 1.0*markerData[i]['lat'], lng: 1.0*markerData[i]['lng']}); // 緯度経度のデータ作成
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
			  fillColor: '#0000ff',   // 塗りつぶし色
			  fillOpacity: 0.2,       // 塗りつぶし透過度（0: 透明 ⇔ 1:不透明）
			  map: map,        // 表示させる地図（google.maps.Map）
			  radius: 1800,          // 半径（ｍ）
			  strokeColor: '#0000ff', // 外周色 
			  strokeOpacity: 1,       // 外周透過度（0: 透明 ⇔ 1:不透明）
			  strokeWeight: 1         // 外周太さ（ピクセル）
			});
			// 危険エリアの表示
			alertAreas2[i]= new google.maps.Circle({
			  center: markerLatLng,       // 中心点(google.maps.LatLng)
			  fillColor: '#0000ff',   // 塗りつぶし色
			  fillOpacity: 0.2,       // 塗りつぶし透過度（0: 透明 ⇔ 1:不透明）
			  map: map,        // 表示させる地図（google.maps.Map）
			  radius: 1800,          // 半径（ｍ）
			  strokeColor: '#0000ff', // 外周色 
			  strokeOpacity: 1,       // 外周透過度（0: 透明 ⇔ 1:不透明）
			  strokeWeight: 1         // 外周太さ（ピクセル）
			});
	    }
		
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
	// console.log(data);
	markerData = [];
	for(var bodyname in data){//firebaseからのデータをMarkerDataに格納
		// console.log(bodyname+" data "+data[bodyname]);
		markerData.push({
	        name: bodyname,
	        lat: data[bodyname]["lat"],
	        lng: data[bodyname]["lng"],
	        bodyType: data[bodyname]["bodyType"],
	        updateTime: data[bodyname]["updateTime"],
	        flightState: data[bodyname]["flightState"],
	        velocity: data[bodyname]["velocity"],
	        heading: data[bodyname]["heading"],
	        prediction: data[bodyname]["prediction"],
	    });
	}
	//更新時にマーカーとかを消す http://www.ajaxtower.jp/googlemaps/gmarker/index4.html
	for (var i = 0; i < marker.length; i++) {
		marker[i].setMap(null);
	}
	for (var i = 0; i < alertAreas.length; i++) {
		alertAreas[i].setMap(null);
	}
	for (var i = 0; i < alertAreas2.length; i++) {
		alertAreas2[i].setMap(null);
	}
	for (var i = 0; i < num_prediction; i++) {
		predictedPath[i].setMap(null);
	}
	for (var i = 0; i < num_prediction; i++) {
		predictedPos[i].setMap(null);
	}
	marker=[];
	alertAreas=[];
	alertAreas2=[];
	distance=[];//他機との距離のリスト（自分の機体の時はスルー）
	alertMessages=[];
	cationMessages=[];
	predictedPath=[];
	predictedPos=[];
	num_prediction=0;
	// 現在のローカル時間が格納された、Date オブジェクトを作成する
	var date_obj = new Date();
	// 協定世界時の 1970/01/01 00:00:00 から開始して、経過した時間をミリ秒で取得
	var milliseconds = date_obj.getTime();
	console.log("milliseconds");
	console.log(milliseconds);
	var predictedLatLng;
	for (var i = 0; i < markerData.length; i++) {//各機体に関するループ
		var iconType;
		markerLatLng = new google.maps.LatLng({lat: 1.0*markerData[i]['lat'], lng:1.0* markerData[i]['lng']}); // 緯度経度のデータ作成
		predictedLatLng= new google.maps.LatLng({lat: 1.0*markerData[i]['lat'], lng:1.0* markerData[i]['lng']}); // 緯度経度のデータ作成
	
		//もしpredictionのjsonデータが存在するならそれの代入
		if(markerData[i]['prediction']){
			console.log("prediction finded");
			predictedLatLng= new google.maps.LatLng({lat: 1.0*markerData[i]['prediction']['lat'], lng:1.0* markerData[i]['prediction']['lng']}); // 緯度経度のデータ作成
		 	// ヘリコプタ位置予想のライン、マーカー
			var flightPlanCoordinates = [
				markerLatLng,
				predictedLatLng
			];
			// Polyline オブジェクト
			predictedPath[num_prediction]=new google.maps.Polyline({
				path: flightPlanCoordinates, //ポリラインの配列
				strokeColor: '#2aea19', //色（#RRGGBB形式）
				strokeOpacity: 1.0, //透明度 0.0～1.0（デフォルト）
				strokeWeight: 2 ,//太さ（単位ピクセル）
				map:map,
			});
			predictedPos[num_prediction] = new google.maps.Marker({ // マーカーの追加
				position: predictedLatLng, // マーカーを立てる位置を指定
				map: map, // マーカーを立てる地図を指定
		        icon: heli_predicted_image,//アイコン指定
			});
			num_prediction=num_prediction+1;

		}


		if(markerData[i]['bodyType']=="Multicopter" && markerData[i]['flightState']=="flying"){
			iconType=drone_image;
		}else if(markerData[i]['bodyType']=="Helicopter" && markerData[i]['flightState']=="flying"){//飛行中のヘリコプタ
			iconType=heli_image;
			//ヘリコプター予測処理終わり
		}else if(markerData[i]['bodyType']=="Multicopter"){
			iconType=drone_image_b;
		}else if(markerData[i]['bodyType']=="Helicopter"){
			iconType=heli_image_b;
		}
		marker[i] = new google.maps.Marker({ // マーカーの追加
			position: markerLatLng, // マーカーを立てる位置を指定
			map: map, // マーカーを立てる地図を指定
	        icon: iconType,//アイコン指定
		});
		infoWindow[i] = new google.maps.InfoWindow({ // 吹き出しの追加
		content: '<div class="sample">' + markerData[i]['name'] + '</div>' // 吹き出しに表示する内容
		});
		markerEvent(i); // マーカーにクリックイベントを追加


		//危険半径の判定
		var each_rad;
		if(markerData[i]['bodyType']=="Multicopter"){
			each_rad=5;
		}else if(markerData[i]['bodyType']=="Helicopter"){
			each_rad=9000;
		}
		var each_rad2;
		if(markerData[i]['bodyType']=="Multicopter"){
			each_rad2=2;
		}else if(markerData[i]['bodyType']=="Helicopter"){
			each_rad2=5000;
		}		// 危険エリアの表示

		// 他機との中心間の距離のけいさん
		//ネットワークなので計算量おおし
		var circle_color='#222222';
		for (var net_i = 0; net_i < markerData.length; net_i++) {
			if(i!=net_i){
				if(markerData[net_i]['prediction']){
				 	otherMarkerLatLng= new google.maps.LatLng({lat: 1.0*markerData[net_i]['prediction']['lat'], lng:1.0*markerData[net_i]['prediction']['lng'] }); // 緯度経度のデータ作成
				}else{
				 	otherMarkerLatLng= new google.maps.LatLng({lat: 1.0*markerData[net_i]['lat'], lng:1.0*markerData[net_i]['lng'] }); // 緯度経度のデータ作成
				}
				distance[net_i] = google.maps.geometry.spherical.computeDistanceBetween(predictedLatLng, otherMarkerLatLng);
				//まず自分がプレディクションあるかどうか
				// if(markerData[net_i]['name'] in heliPrediction　&& Object.keys(heliPrediction[markerData[net_i]['name']]['predicts']).length>0){//predictデータがあるとき
				// 	var heliList=Object.keys(heliPrediction[markerData[net_i]['name']]['predicts']);
				// 	uptodateTimeStamp=heliList[heliList.length-1];
				// 	otherMarkerLatLng= new google.maps.LatLng({lat: 1.0*heliPrediction[markerData[net_i]['name']]["predicts"][uptodateTimeStamp]['lat'], lng:1.0*heliPrediction[markerData[net_i]['name']]["predicts"][uptodateTimeStamp]['lng'] }); // 緯度経度のデータ作成
				// }
				// otherMarkerLatLng = new google.maps.LatLng({lat: 1.0*markerData[net_i]['lat'], lng:1.0* markerData[net_i]['lng']}); // 緯度経度のデータ作成
				// distance[net_i] = google.maps.geometry.spherical.computeDistanceBetween(predictedLatLng, otherMarkerLatLng);
			}
			if(distance[net_i]<each_rad2 && markerData[net_i]['flightState']!="landing"&& markerData[i]['flightState']!="landing"){
				circle_color='#ff0000';
			}else if(distance[net_i] >= (each_rad2) && distance[net_i]<each_rad && markerData[net_i]['flightState']!="landing" && markerData[i]['flightState']!="landing"){
				if(circle_color=='#222222' || circle_color=='#33ccff'){
					circle_color='#ccff00';
				}
			}else{
				if(circle_color=='#222222'){
					circle_color='#33ccff';
				}
			}
		}
		//半径の描画
		alertAreas[i]= new google.maps.Circle({
		  center: predictedLatLng,       // 中心点(google.maps.LatLng)
		  fillColor: circle_color,  // 塗りつぶし色
		  fillOpacity: 0.2,       // 塗りつぶし透過度（0: 透明 ⇔ 1:不透明）
		  map: map,        // 表示させる地図（google.maps.Map）
		  radius: each_rad,          // 半径（ｍ）
		  strokeColor: circle_color, // 外周色 
		  strokeOpacity: 1,       // 外周透過度（0: 透明 ⇔ 1:不透明）
		  strokeWeight: 1         // 外周太さ（ピクセル）
		});
		alertAreas2[i]= new google.maps.Circle({
		  center: predictedLatLng,       // 中心点(google.maps.LatLng)
		  fillColor: circle_color,  // 塗りつぶし色
		  fillOpacity: 0.2,       // 塗りつぶし透過度（0: 透明 ⇔ 1:不透明）
		  map: map,        // 表示させる地図（google.maps.Map）
		  radius: each_rad2,          // 半径（ｍ）
		  strokeColor: circle_color, // 外周色 
		  strokeOpacity: 1,       // 外周透過度（0: 透明 ⇔ 1:不透明）
		  strokeWeight: 1         // 外周太さ（ピクセル）
		});
		
	}
});



function predictHeliPos(vel,heading,lat,lng,millisec){//位置予想（速度はknot, 時間はmilliseconds）
	//Hubeny's Equation http://yamadarake.jp/trdi/report000001.html
	var dist=1.0*millisec*(1.852*vel/3600.);//[m]
	// var a=6378137.;
	// var e2=0.00669438;
	// var pi=Math.PI;
	// var muy=1.0*lat/180.*pi;
	// var W=Math.sqrt(1.-e2*(Math.sin(muy)*Math.sin(muy)));
	// var M=a*(1.-e2)/(W*W*W);
	// var N=a/W;
	// // console.log("lat");
	// // console.log(lat);
	// // console.log("lng");
	// // console.log(lng);
	// // console.log("dist");
	// // console.log(dist);
	// // console.log("W");
	// // console.log(W);
	// dLat=dist*Math.cos(1.0*heading/180.*pi)/M/pi*180.;
	// dLng=dist*Math.sin(1.0*heading/180.*pi)/N/Math.cos(muy)/pi*180.;
	// // console.log("dLat");
	// // console.log(dLat);
	// // console.log("dLng");
	// // console.log(dLng);

	// var nextLat=lat+dLat;
	// var nextLng=lng+dLng;
	// console.log("Lat");
	// console.log(nextLat);
	// console.log("Lng");
	// console.log(nextLng);


	var point = new google.maps.LatLng(1.0*lat, 1.0*lng);
	var nextPoint = google.maps.geometry.spherical.computeOffset(point, dist, 1.0*heading); 
	console.log("Lat2");
	console.log(nextPoint.lat());
	console.log("Lng2");
	console.log(nextPoint.lng());

	var retValue={nextLat:nextPoint.lat(),nextLng:nextPoint.lng()}
	return retValue;
}


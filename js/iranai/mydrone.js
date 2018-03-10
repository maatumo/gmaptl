//Firebase Legacy
var dataStore;
dataStore = new Firebase('https://amakusa.firebaseio.com/');
var airplanes=dataStore.child('airplanes');


window.onload = function() {//初期化
  if(localStorage){
    var local=localStorage;
    console.log('localStrage is available!');
    if(localStorage.getItem('myBodyName')){
      console.log('Find Name!');
        document.getElementById('answer').innerHTML = "Your drone is on Map! : "+localStorage.getItem('myBodyName')+"<input type='button' value='End Mapping' style='float: right' onClick='logOut()'>";
      }
  }

};


function getBody() {
  console.log("submit button pushed");
  var x = document.getElementById('bodyname').value;
  body=x;
  localStorage.setItem('myBodyName', x);
  document.getElementById('answer').innerHTML = "Your drone is on Map! : "+localStorage.getItem('myBodyName')+"<input type='button' value='End Mapping' style='float: right' onClick='logOut()'>";

  var y =document.getElementById('bodytype').value;
  console.log(y);
  localStorage.setItem('myBodyType', y);

}

function logOut(){
  var body = localStorage.getItem('myBodyName');
  localStorage.clear();
  document.getElementById('answer').innerHTML = localStorage.getItem('myBodyName');
  console.log("start remove"+body);
  dataStore.child('airplanes').child(body).remove(function(error){
    //do stuff after removal
    console.log("removed");
  });
}

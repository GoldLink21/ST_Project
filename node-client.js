var firebase = require('firebase');
firebase.initializeApp({
 "appName": "Quiver Two Node Client Demo",
 "serviceAccount": "./service-account.json",
 "authDomain": "quiver-two.firebaseapp.com",
 "databaseURL": "https://quiver-two.firebaseio.com/",
 "storageBucket": "quiver-two.appspot.com"
});
var ref = firebase.app().database().ref();
ref.once('value')
 .then(function (snap) {
 console.log('snap.val()', snap.val());
 });

 var db = firebaseAdmin.database();
 var ref = db.ref("users");
 ref.orderByChild("LastName").on("child_added", function(snapshot) {
     console.log("The " + snapshot.key + " was sorted.");
 });
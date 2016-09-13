/* jshint esnext: true */
var mongoose = require('mongoose');

var dbHost = 'mongodb://localhost/dscServer1';

mongoose.connect(dbHost);

//Schema for Shared Registration keys
var sharedKeySchema = mongoose.Schema({
    name: {type: String, index:true},
    primary: String,
    secondary: String
});

var sharedKey = mongoose.model('SharedKey',sharedKeySchema);

//mongoose.connection;

// var OSSKeys = new sharedKey({
//     name:"InfraKeys",
//     primary:"845279827-796-493",
//     secondary:"53529226-cb06-4595-862d-4a5c6cc612f1"
// });

// OSSKeys.save(function(err, OSSKeys){
//     if(err){
//         throw err;
//     }
//     else{
//         console.log('Successfully saved keys to DB');
//     }
// });

// sharedKey.remove({"primary":"845279827-796-493"},function(err){
//     if(err){throw err;};
// });

// sharedKey.find(function(err, keys){
//     if(err){ console.log (err);}
//     console.log(keys);
// });

// var fs = require('fs');
// var path = require('path');

// var storePath = path.join(__dirname,'../','dataStore.json');
// var dataObject;

// fs.readFile(storePath, function(err, data){
//     if(err)
//     {
//         console.log(err);
//     }
//     else
//     {
//         dataObject = JSON.parse(data);
//     }
// });
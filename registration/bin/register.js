/* jshint esnext: true */

//Should this be aysnchronous??

var crypto = require('crypto');

module.exports =  function(req, key){
  // Hash the body of the request with sha-256
  var requestBody = JSON.stringify(req.body);
  var xmsDate = req.headers["x-ms-date"];
  var regKey = key;
  

  var bodyHash = crypto.createHash('sha256').update(requestBody,'utf8').digest('base64');
  var signString = `${bodyHash}\n${xmsDate}`;
  var signature = crypto.createHmac('sha256',regKey).update(signString,'utf8').digest('base64');

  return signature;

};
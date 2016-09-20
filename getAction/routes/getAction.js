/* jshint esnext: true */
var express = require('express');
var actions = require('../bin/getAction');
var router = express.Router();

var getActionPath = `/Nodes\\(AgentId=\':id\'\\)/GetDscAction`;

//Do not allow browsing to the root of the app
router.get('/',function(req, res, next){
  res.status(200).send('Root of app. Browsing not allowed.');
});

//req should be in the following format: {"ClientStatus":[{"Checksum""ChecksumAlgorithm""ConfigurationName"}]}
//res should be in the following format: {"NodeStatus":"","Details":[{"ConfigurationName","Status"}]}
router.post(getActionPath, function(req, res, next) {
  //compare checksums sent with current - the current should be queried from configuration service.
    
  
  //Send respone to node
    //GetConfiguration, UpdateMetaConfiguration, Retry, or OK
  res.header('Content-Type','application/json')
  res.header('ProtocolVersion','2.0');
  res.statusCode = 200;
  res.write(`{"NodeStatus":"GetConfiguration","Details":["ConfigurationName":"WebServer","Status":"GetConfiguration"]}`);
  res.end();
});

module.exports = router;
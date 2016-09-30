/* jshint esnext: true */
var express = require('express');
var actions = require('../bin/getAction');
var logger = require('winston');

var router = express.Router();

var getActionPath = `/Nodes\\(AgentId=\':id\'\\)/GetDscAction`;

//Log information for any request made to the server
router.use('/', function(req, res, next){
  logger.debug(`
                ***********************************
                Logging information about request...

                request url:        ${req.url}
                requst method:      ${req.method}
                request header:     ${JSON.stringify(req.headers)}
                request body:       ${JSON.stringify(req.body)}
                request host name:  ${req.hostname}
                request IP Address: ${req.ip}
                request trailers:   ${JSON.stringify(req.trailers)}
                request Cookie:     ${JSON.stringify(req.cookies)}
                request parameters: ${JSON.stringify(req.params)}
                request query:      ${JSON.stringify(req.query)}
                request raw Header: ${req.rawHeaders}
                request statuscode: ${req.statusCode}
                reqest statusmesg:  ${req.statusMessage}
                request cert:       ${JSON.stringify(req.connection.getPeerCertificate())}
                *********************************************
  `);
  next();
});


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
  var jsonResponse = {NodeStatus:"GetConfiguration",Details:[{ConfigurationName:"testConfig",Status:"GetConfiguration"}]};
  
  res.statusCode = 200;
  res.header('Content-Type','application/json');
  res.header('ProtocolVersion','2.0');
  res.json(jsonResponse);
});

module.exports = router;
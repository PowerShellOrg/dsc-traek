/* jshint esnext: true */

var express = require('express');
var path = require('path');
var report = require('../bin/report');
var logger = require('winston');

var router = express.Router();

var configPath = '/Nodes\\(AgentId=\':id\'\\)'; 
var sendReportPath = `${configPath}/SendReport`;

// Log information for any request made to the server
router.use('/', function(req, res, next){
  res.set('ProtocolVersion','2.0');
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
                reqest statusmessg: ${req.statusMessage}
                request cert:       ${JSON.stringify(req.connection.getPeerCertificate())}
                *********************************************
  `);
  
  //res.send(200,'This is the root folder that has no content. Go somewhere else, please!');
  next();
});

// Process registration request 
router.post(sendReportPath, function(req, res, next) {
  logger.debug(`Report recieved for AgentId: '${req.params.id}'.`);

  var responseCode = 200; //400 = BAD REQUEST, 404 = NOT FOUND
  
  logger.debug(JSON.stringify(req.body));
  //logger.debug(req.body.RebootRequested);
  res.statusCode = responseCode;
  res.end();
});

module.exports = router;
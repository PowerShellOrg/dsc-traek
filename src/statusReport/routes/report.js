/* jshint esnext: true */

var express = require('express');
var path = require('path');
var report = require('../bin/report');
var logger = require('winston');

var router = express.Router();

var configUri = '/Nodes\\(AgentId=\':id\'\\)'; 
var sendReportUri = `${configUri}/SendReport`;

var appConfig;

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

  next();
});

// Process registration request 
router.post(sendReportUri, function(req, res, next) {
  logger.debug(`Report recieved for AgentId: '${req.params.id}'.`);

  var responseCode = 200; //400 = BAD REQUEST, 404 = NOT FOUND
 
  report.writeReportData(req,function(err){
    if(err){
      responseCode = 404;
    }

    logger.debug(`Sending status ${responseCode}.`);
    
    res.statusCode = responseCode;
    res.end();
  });

});

module.exports = router;
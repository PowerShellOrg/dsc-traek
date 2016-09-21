/* jshint esnext: true */

var express = require('express');
var router = express.Router();
var register = require('../bin/register');

var configPath = '/Nodes\\(AgentId=\':term\'\\)'; 
var getConfigPath = `${registrationPath}/Configurations(ConfigurationName=:configName)/ConfigurationContent`;

// Log information for any request made to the server
router.use('/', function(req, res, next){
  var logger = req.app.locals.logger;

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
router.get(getConfigPath, function(req, res, next) {
  var responseCode = 200; //400 = BAD REQUEST, 404 = NOT FOUND
  
  res.header('Content-Type','application/json');
  res.header('ProtocolVersion','2.0');
  res.statusCode = responseCode;
  res.write(`{"ProtocolVersion":"2.0","Checksum":"475bca2f28784223b8cd65a414a92f6d","ChecksumAlgorithm":"SHA-256"}`);
  res.sendFile(); //Format???
  res.end();
});

module.exports = router;
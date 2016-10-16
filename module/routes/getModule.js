/* jshint esnext: true */

var express = require('express');
var path = require('path');
var getModule = require('../bin/getModule');
var logger = require('winston');

var router = express.Router();

var getModuleUri = `/Modules\\(ModuleName=\':moduleName\',ModuleVersion=\':moduleVersion\'\\)/ModuleContent`;

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
  router.get(getModuleUri, function(req, res, next) {
  logger.debug(`Module '${req.params.moduleName}' with version '${req.params.moduleVersion}' requested.`);
  var responseCode = 200; //400 = BAD REQUEST, 404 = NOT FOUND
  var moduleFileName = 'xModule.zip';
  var moduleFilePath = path.join(__dirname, `../${moduleFileName}`);
  
  res.statusCode = responseCode;
  res.header('Content-Type','application/json');
  res.header('ProtocolVersion','2.0');
  res.header('Checksum','475bca2f28784223b8cd65a414a92f6d');
  res.header('ChecksumAlgorithm','SHA-256');

  logger.debug(`Sending module file ${moduleFilePath}.`);
  res.sendFile(moduleFilePath);
});

module.exports = router;
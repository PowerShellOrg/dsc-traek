/* jshint esnext: true */

var express = require('express');
var path = require('path');
var getModule = require('../bin/getModule');
var logger = require('winston');

var router = express.Router();

var moduleUri = `/Modules\\(ModuleName=\':moduleName\',ModuleVersion=\':moduleVersion\'\\)/ModuleContent`;

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
router.get(moduleUri, function(req, res, next) {
    logger.debug(`Module '${req.params.moduleName}' with version '${req.params.moduleVersion}' requested.`);
  
    getModule.getResourceModule(req, function(resourceModule, fileInfo, err){

      res.statusCode = 200;

      if(err){
        res.statusCode = 404;
      }

      res.header('Cache-Control','no-cache');
      res.header('Content-Type','application/octet-stream');
      res.header('ProtocolVersion','2.0');
      res.header('Content-Length', fileInfo.size);
      res.header('Checksum',fileInfo.hash);
      res.header('ChecksumAlgorithm','SHA-256');

      if(!err){
        logger.debug(`Sending module file ${req.params.moduleName}.`);
        res.write(resourceModule);
        res.end();
      }
      else {
        res.end();
      }
  });
  
});

// Send module to data store
router.put(moduleUri, function(){

});

module.exports = router;
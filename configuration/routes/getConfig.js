/* jshint esnext: true */

var express = require('express');
var path = require('path');
var fs = require('fs');
var getConfig = require('../bin/getConfig');
var logger = require('winston');

var router = express.Router();

var configUri = '/Nodes\\(AgentId=\':id\'\\)'; 
var getConfigUri = `${configUri}/Configurations\\(ConfigurationName=\':configName\'\\)/ConfigurationContent`;
var compareHashUri = '/Configuration/CompareHash?Name=:configName&hash=:configHash';

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

// Process get config request
router.get(getConfigUri, function(req, res, next) {
  var appConfig = req.app.locals.config;

  logger.debug(`Configuration '${req.params.configName}' requested.`);
  var configFileName = `${req.params.configName}.mof`;
  
  logger.debug(`Path to configuration files: ${appConfig.configurations.filePath}.`);
  var configFilePath = path.join(appConfig.configurations.filePath, `${configFileName}`);
  
  //TODO: Validate certificate if it exists. If cert exists, request did not come through proxy. Return 400 if cert invalid.
  
  
  //Get statistics about configuration file to validate it exists. Error will be returned if file does not exists.
  fs.stat(configFilePath,function(err, stats){ 
    //Reply with configuration file and S_OK when config file exists.
    if(!err){
        getConfig.getFileHash(configFilePath,appConfig.configurations.hashAlgorithm, function(hash, err){
          
          res.statusCode = 200;

          if(err){
            res.statusCode = 404;
          }

          res.header('Content-Type','text/plain');
          res.header('ProtocolVersion','2.0');
          res.header('Content-Length', stats.size);
          res.header('Checksum',hash);
          res.header('ChecksumAlgorithm','SHA-256');

          if(!err){
            logger.debug(`Sending configuration file ${configFilePath}.`);
            res.sendFile(configFilePath);
          }
          else {
            res.end();
          }
        });

    }
    //Reply with Not Found 
    else
    {
      res.statusCode = 404;
      res.header('ProtocolVersion','2.0');

      logger.info(`Could not find configuration file ${configFilePath}.`);
      res.end();
    }
  });
});

// Compare fileHash sent with actual file hash
router.put(compareHashUri, function(req, res){
  var appConfig = req.app.locals.config;
  var configFilePath = path.join(appConfig.configurations.filePath, `${req.params.configName}`);

  getConfig.compareHash(configFilePath, req.params.configHash,appConfig.configurations.hashAlgorithm ,function(hashSame){
    var statusCode = 200;
    if(!hashSame){
      statusCode = 400;
    }
    res.sendStatus(statusCode);
  });  
});


module.exports = router;
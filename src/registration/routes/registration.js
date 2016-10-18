/* jshint esnext: true */
var express = require('express');
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var logger = require('winston');
var registration = require('../bin/register');

var router = express.Router();

var registrationUri = '/Nodes\\(AgentId=\':id\'\\)'; 

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

//Add ProtocolVersion to header
router.use('/', function(req, res, next){
  res.header('ProtocolVersion','2.0');
  next();
});

router.get('/',function(req, res, next){
  res.status(200).send('Root of app. Browsing not allowed.');
});

router.put('/regkeys',function(req, res, next){
  // TODO: This must be secured.
  
  // Store the registration key, primary or secondary, in the data store
  if(req.body.primary && req.body.secondary){
    registration.setRegKeys(req.body.primary,req.body.secondary);
  }else if(req.body.primary){
    registration.setRegKeys(req.body.primary);
  }
  else if(req.body.secondary){
    registration.setRegKeys(null,req.body.secondary);
  }

  res.sendStatus(200);
});

router.get('/regkeys',function(req, res, next){
  // TODO: This must be secured.

  // Get the registration keys, primary or secondary, from the data store
  registration.getRegKeys(function(keys){
    res.status(200).send(keys);      //`{primary: ${keys.primary}, secondary: ${keys.secondary}}`);
  });
});

// check whether or not agent is registered. Return 200 if found and 404 if not.
// This should restricted in some way so that everyone cannot call this to hack the system.
router.put('/validateAgent', function(req, res) {
    
  //Validate Agent ID exists & cert is valid
  registration.validate(req.body.agentId, req.body.certificate,function(valid){
    logger.debug(`Result from cert valiation: ${valid}`);
    
    if(valid){
      res.sendStatus(200);
    }
    else
    {
      logger.info(`Could not validate Agent with ID of ${req.body.agentId}.`);
      res.sendStatus(404);
    }
  });

});

// Process registration request 
router.put(registrationUri, function(req, res, next) {
  var responseCode = 201; //400 = BAD REQUEST, 404 = NOT found
  
  registration.setRegistration(req, function(successful){
    if(!successful){
      responseCode = 400;
    }

    logger.debug('Sending status: ' + responseCode + ' to ' + req.ip + '.');
    res.sendStatus(responseCode); 

  });
});

module.exports = router;
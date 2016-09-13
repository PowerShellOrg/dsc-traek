/* jshint esnext: true */
var express = require('express');
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var router = express.Router();
var signature = require('../bin/register');
var registrationPath = '/Nodes\\(AgentId=\':id\'\\)'; 
var dataStore;

//Load some initial variables
router.use('/',function(req, res, next){
  //get the app config json data that was read and stored in the app 
  var config = req.app.locals.config;

  //validate that the data store file exists in the bin directory
  var dataStoreCode = path.join(__dirname, '..' , 'bin', config.dataStore + '.js');

  if(fs.existsSync(dataStoreCode)){
    dataStore = require(dataStoreCode);
    console.log(`Successfully loaded data store: ${dataStoreCode}`);
  }
  else{
    Throw `Failed to load data store: '${dataStoreCode}'. Please specify a valid data store in the appconfig.json file.`;
  }

  next();
});

// Log information for any request made to the server
router.use('/', function(req, res, next){
  console.log(`
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
  var changes = '';
  if(req.body.primary && req.body.secondary){
    dataStore.setSharedKey(req.body.primary,req.body.secondary);
    changes = 'Primary & Secondary';
  }else if(req.body.primary){
    dataStore.setSharedKey(req.body.primary);
    changes = 'Primary';
  }
  else if(req.body.secondary){
    dataStore.setSharedKey(null,req.body.secondary);
    changes = 'Secondary';
  } else {
    changes = 'None';
  }

  res.sendStatus(200);
});

router.get('/regkeys',function(req, res, next){
  // TODO: This must be secured.

  // Get the registration keys, primary or secondary, from the data store
  dataStore.getSharedKey(function(keys){
    res.status(200).send(keys);      //`{primary: ${keys.primary}, secondary: ${keys.secondary}}`);
  });

  
});

router.get(registrationPath, function(req, res, next) {
  // check whether or not agent is registrationed. Return 200 if found and 404 if not.
  // This should restricted in some way so that everyone cannot call this to hack the system.
  var responseCode = 200;
  

});

// Process registration request 
router.put(registrationPath, function(req, res, next) {
  var responseCode = 201; //400 = BAD REQUEST, 404 = NOT FOUND
 
    dataStore.getSharedKey(function(keys){
      var authCodePrim = signature(req, keys.primary);
      var authCodeSecond = signature(req, keys.secondary);

      if (req.headers.authorization === `Shared ${authCodePrim}` || req.headers.authorization === `Shared ${authCodeSecond}`)
      {
        //Write information (agentId, registrationInfo) to DB
        console.log(req.params.id);
        if(req.params.id){
          //TODO: need to save certificate information as well
          dataStore.setAgent(req.params.id, req.body.AgentInformation, function(err){
            if(err){
              console.log(`Error occured while registering node with agent ID (${req.id}). Error details are as follows: ${err}. `);
              responseCode = 400;
              responseMessage = 'BAD REQUEST';
            }
            else
            {
              console.log(`Successfully registered node with agent ID (${req.params.id}).`);
            }

            console.log('Sending status: ' + responseCode + ' to ' + req.ip + '.');
            res.sendStatus(responseCode);
          });
        }
        else{
          responseCode = 400;
          responseMessage = 'BAD REQUEST';

          console.log('Sending status: ' + responseCode + ' to ' + req.ip + '.');
          res.sendStatus(responseCode);
        }
        
      }
      else
      {
        responseCode = 400;
        responseMessage = 'BAD REQUEST';

        console.log('Sending status: ' + responseCode + ' to ' + req.ip + '.');
        res.sendStatus(responseCode);
      }
    });
});

module.exports = router;
/* jshint esnext: true */

var express = require('express');
var crypto = require('crypto');
var router = express.Router();
var register = require('../bin/register');

/* GET nodes response. */
var registrationPath = '/Nodes\\(AgentId=\':term\'\\)'; 
var getActionPath = `${registrationPath}/GetDscAction`;

// Log information for any request made to the server
router.use('/', function(req, res, next){
  res.set('ProtocolVersion','2.0');
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
                reqest statusmessg: ${req.statusMessage}
                request cert:       ${JSON.stringify(req.connection.getPeerCertificate())}
                *********************************************
  `);
  
  //res.send(200,'This is the root folder that has no content. Go somewhere else, please!');
  next();
});

router.get(registrationPath, function(req, res, next) {
  res.end('List of nodes that have registered. \n' + req.params.term);
  console.log(req.body);
});

// Process registration request 
router.put(registrationPath, function(req, res, next) {
  var responseCode = 201; //400 = BAD REQUEST, 404 = NOT FOUND

  var authCode = register(req, "845279827-796-493"); //TODO: Get registration information from external source.

  // console.log('Calculated Authorization Code: ' + authCode);
  // console.log('Header Auth info: ' + req.headers.authorization);

  if (req.headers.authorization !== `Shared ${authCode}`)
  {
    responseCode = 400;
    responseMessage = 'BAD REQUEST';
  }

  console.log('Sending status: ' + responseCode + '.');
  //res.set('Connection','close');
  res.sendStatus(responseCode);
});

router.post(getActionPath, function(req, res, next) {
  console.log('GetAction called');
  
});

module.exports = router;
/* jshint esnext: true */

var crypto = require('crypto');
var logger = require('winston');
var path = require('path');

var appConfig;
var dataStore;

//TODO: validate that the xms-date is within 15 min or so.

exports.connectToDatastore = function(config){
  appConfig = config;

  //Load the DataStore module defined in the appConfig.
    logger.debug(`Loading dataStore: '${appConfig.dataStore.type}' from '${__dirname}' for registration module.`);
    var dataStorePath = path.join(__dirname, appConfig.dataStore.type + '.js');

    try {
        dataStore = require(dataStorePath);
        logger.info(`Successfully loaded data store: '${dataStorePath}' for registration module.`);
    } catch (error) {
        logger.error(`Failed to load data store: '${dataStorePath}' for registartion module.. Please specify a valid data store in the appconfig.json file.`);
        throw error;
    }

    dataStore.init(appConfig.dataStore.connectionString);
};

exports.setRegistration = function(req, callback){
  dataStore.getSharedKey(function(keys){
      var authCodePrim = getSignature(req, keys.primary);
      var authCodeSecond = getSignature(req, keys.secondary);
      var authorization = req.headers.authorization;

      var validValues = authorization !== null && (authCodePrim !== null || authCodeSecond !== null);

      if (validValues && (authorization === `Shared ${authCodePrim}` || authorization === `Shared ${authCodeSecond}`))
      {
        logger.debug(`Agent ID: ${req.params.id}`);

        if(req.params.id){
          dataStore.setAgent(req.params.id, req.body, function(err){
            if(err){
              logger.debug(`Error occured while registering node with agent ID (${req.id}). Error details are as follows: ${err}. `);
            }
            else
            {
              logger.info(`Successfully registered node with agent ID (${req.params.id}).`);
            }
            callback(true);
          });
        }
        else{
          callback(false);
        }
      }
      else
      {
        callback(false);
      }
    });
};

exports.setRegKeys = function(primary, secondary){
  dataStore.setSharedKey(primary, secondary);
};

exports.getRegKeys = function(callback){
  dataStore.getSharedKey(function(keys){
    callback(keys);
  });
};

exports.validate = function(agentId, certificate, callback){
  dataStore.validate(agentId, certificate, function(result){
    callback(result);
  });
};

function getSignature(req, key){
  // Hash the body of the request with sha-256
  var requestBody = JSON.stringify(req.body);
  var xmsDate = req.headers["x-ms-date"];
  var regKey = key;
  

  var bodyHash = crypto.createHash('sha256').update(requestBody,'utf8').digest('base64');
  var signString = `${bodyHash}\n${xmsDate}`;
  var signature = crypto.createHmac('sha256',regKey).update(signString,'utf8').digest('base64');

  return signature;
}


/* jshint esnext: true */

var logger = require('winston');
var path = require('path');
var appConfig;
var dataStore;

//This call is synchronous and should only be called when application is started.
exports.connectToDatastore = function(config){
    appConfig = config;

    //Load the DataStore module defined in the appConfig.
    logger.debug(`Loading dataStore: '${appConfig.dataStore.type}' from '${__dirname}'.`);
    var dataStorePath = path.join(__dirname, appConfig.dataStore.type + '.js');

    try {
        dataStore = require(dataStorePath);
        logger.info(`Successfully loaded data store: ${dataStorePath}`);
    } catch (error) {
        logger.error(`Failed to load data store: '${dataStorePath}'. Please specify a valid data store in the appconfig.json file.`);
        throw error;
    }

    dataStore.init(appConfig.dataStore.connectionString);

};

exports.writeReportData = function(req, callback){
    var reportData = req.body;
    var err;

    //Write Report data to datastore
    try {
        
        logger.debug(`Writing report for Job ID: ${reportData.JobId}.`);

        //Normalize format of report data. Specifically turn Status Data and Report Data into objects instead of strings.
        if(reportData.StatusData.length !== 0){
            var statusData = JSON.parse(reportData.StatusData);
            
            reportData.StatusData = statusData;
        }
        else {
            reportData.StatusData = null;
        }

        if(reportData.Errors.length !== 0){
            
            var errorData = JSON.parse(reportData.Errors);
            
            reportData.Errors = errorData;
        }
        else {
            reportData.Errors = null;
        }

        //set report information to datastore defined in appConfig.
        //TODO: This should be asynch.
        dataStore.setReportData(req.params.id,reportData, function(err){
            callback(err);
        });

    } catch (error){
        logger.debug(`Failed to parse report data.
            AgentId: ${req.params.id}
            Error: ${error}`);
        
        callback(error);
    }
};
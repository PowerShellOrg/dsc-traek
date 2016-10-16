/* jshint esnext: true */

var logger = require('winston');

var getResourceModule = function(req, callback){
    var appConfig = req.app.locals.config;
    var moduleName = req.params.moduleName;
    var moduleVersion = req.params.moduleVersion;
    var storeType = appConfig.dataStore.type;

    var dataStore = require(`./${storeType}`);

    dataStore.getResourceModule(moduleName, moduleVersion, appConfig, function(resourceModule, fileInfo, err){
        callback(resourceModule, fileInfo, err); // FileInfo includes: hash, hashAlgorithm, size, etc.
    });
};

exports.getResourceModule = getResourceModule;
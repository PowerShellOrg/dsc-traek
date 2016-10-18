/* jshint esnext: true */

var logger = require('winston');
var crypto = require('crypto');
var fs = require('fs');

var getConfiguration = function(req, callback){
    var appConfig = req.app.locals.config;
    var configurationName = req.params.configName;
    var storeType = appConfig.dataStore.type;

    var dataStore = require(`./${storeType}`);

    dataStore.getConfiguration(configurationName, appConfig, function(configuration, fileInfo, err){
        callback(configuration, fileInfo, err); // FileInfo includes: hash, hashAlgorithm, size, etc.
    });
};


var getFileHash = function(filePath, algorithm, callback){
    try {
        var chksum = crypto.createHash(algorithm);
        var hash;
        var stream = fs.createReadStream(filePath); 

        stream.on('data',function(chunk){
            chksum.update(chunk);
        });

        stream.on('end',function(){
            hash = chksum.digest('hex').toUpperCase();
            logger.debug(`Successfully generated hash for configuration file ${filePath}: '${hash}'`);
            callback(hash);
        });
    } catch (error) {
        logger.info(`Failed to get hash for file ${filePath} using algorith ${algorithm}.`);
        callback('',error);
    }
};

//Compare hash sent from target node with hash of configuration stored on server 
var compareHash = function(configFilePath, fileHash, algorithm, callback){
    
    getFileHash(configFilePath, algorithm, function(hash, err){
        if(!err && fileHash === hash){
            callback(true);
        }
        else {
            callback(false);
        }
    });
};

exports.getConfiguration = getConfiguration;
exports.compareHash = compareHash;
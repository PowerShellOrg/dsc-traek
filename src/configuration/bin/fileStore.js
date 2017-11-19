/* jshint esnext: true */

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var logger = require('winston');

var getConfiguration = function(configurationName, appConfig, callback){
    var Configuration = Buffer.alloc(0);
    var configurationFilePath;
    var fileInfo = {size:0,hash:'',hashAlgorith:''};

    logger.debug(`Path to configuration files: ${appConfig.fileStore.root}.`);

    try{
        configurationFilePath = path.join(appConfig.fileStore.root, `${configurationName}.mof`);
        
        logger.debug(`Path to ${configurationName}: ${configurationFilePath}`);
    
        //Get statistics about module file to validate it exists. Error will be returned if file does not exists.
        fs.stat(configurationFilePath,function(error, stats){ 
            //Reply with configuration file when config file exists.
            if(!error){
                fileInfo.size = stats.size;
                fileInfo.hashAlgorithm = appConfig.fileStore.hashAlgorithm;

                var chksum = crypto.createHash(fileInfo.hashAlgorithm);
                var configStream = fs.createReadStream(configurationFilePath);

                configStream.on('data',function(chunk){
                    chksum.update(chunk);
                    
                    var length = Configuration.length + chunk.length;
                    Configuration = Buffer.concat([Configuration,chunk], length);

                });
                
                configStream.on('end',function(){

                    fileInfo.hash = chksum.digest('hex').toUpperCase();
                    logger.debug(`Successfully generated hash for module file ${configurationFilePath}: '${fileInfo.hash}'`);

                    callback(Configuration, fileInfo, error);
                });
            }
            else
            {
                callback(null, fileInfo, error);
            }
        });
    }
    catch (error){
        logger.debug(`Path for ${configurationName} not found in ${appConfig.fileStore.root}.`);
        
        callback(null, fileInfo, error);
    }

};

exports.getConfiguration = getConfiguration;

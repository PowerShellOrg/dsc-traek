/* jshint esnext: true */

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var logger = require('winston');

//TODO: Validate certificate if it exists. If cert exists, request did not come through proxy. Return 400 if cert invalid.
var getResourceModule = function(moduleName, moduleVersion, appConfig, callback){
    var resourceModule = Buffer.alloc(0);
    var moduleFilePath;
    var fileInfo = {size:0,hash:'',hashAlgorith:''};

    logger.debug(`Path to resource module files: ${appConfig.fileStore.root}.`);

    try{
        moduleFilePath = path.join(appConfig.fileStore.root, `${moduleName}`, `${moduleVersion}`, `${moduleName}.zip`);
        
        logger.debug(`Path to ${moduleName} version ${moduleVersion}: ${moduleFilePath}`);
    
        //Get statistics about module file to validate it exists. Error will be returned if file does not exists.
        fs.stat(moduleFilePath,function(error, stats){ 
            //Reply with module file when config file exists.
            if(!error){
                fileInfo.size = stats.size;
                fileInfo.hashAlgorithm = appConfig.fileStore.hashAlgorithm;

                var chksum = crypto.createHash(fileInfo.hashAlgorithm);
                var moduleStream = fs.createReadStream(moduleFilePath);

                moduleStream.on('data',function(chunk){
                    chksum.update(chunk);
                    
                    var length = resourceModule.length + chunk.length;
                    resourceModule = Buffer.concat([resourceModule,chunk], length);

                });
                
                moduleStream.on('end',function(){

                    fileInfo.hash = chksum.digest('hex').toUpperCase();
                    logger.debug(`Successfully generated hash for module file ${moduleFilePath}: '${fileInfo.hash}'`);

                    callback(resourceModule, fileInfo, error);
                });
            }
            else
            {
                callback(null, fileInfo, error);
            }
        });
    }
    catch (error){
        logger.debug(`Path for ${moduleName} version ${moduleVersion} not found in ${appConfig.fileStore.root}.`);
        
        callback(null, fileInfo, error);
    }

};

exports.getResourceModule = getResourceModule;

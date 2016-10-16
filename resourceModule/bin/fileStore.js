/* jshint esnext: true */

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var logger = require('winston');

//TODO: Validate certificate if it exists. If cert exists, request did not come through proxy. Return 400 if cert invalid.
var getResourceModule = function(moduleName, moduleVersion, appConfig, callback){
    var resourceModule;
    var moduleFilePath;
    var fileInfo = {size:0,hash:'',hashAlgorith:''};

    logger.debug(`Path to resource module files: ${appConfig.fileStore.root}.`);

    try{
        moduleFilePath = path.join(appConfig.fileStore.root, `${moduleName}`, `${moduleVersion}`, `${moduleName}.zip`);
        fs.readFile(moduleFilePath,"binary", function(error, data){

            resourceModule = data;
        });
    }
    catch (error){
        logger.debug(`Path for ${moduleName} version ${moduleVersion} not found in ${appConfig.fileStore.root}.`);
        moduleFilePath = '';
    }
    logger.debug(`Path to ${moduleName} version ${moduleVersion}: ${moduleFilePath}`);
    
    //Get statistics about module file to validate it exists. Error will be returned if file does not exists.
    fs.stat(moduleFilePath,function(err, stats){ 
        //Reply with module file when config file exists.
        if(!err){
            fileInfo.size = stats.size;
            fileInfo.hashAlgorithm = appConfig.fileStore.hashAlgorithm;

            getFileHash(moduleFilePath,fileInfo.hashAlgorith, function(hash, err){
                fileInfo.hash = hash;

                callback(resourceModule, fileInfo, err);
            });
        }
        else
        {
            callback(resourceModule, fileInfo, err);
        }
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
            logger.debug(`Successfully generated hash for module file ${filePath}: '${hash}'`);
            callback(hash, null);
        });
    } catch (error) {
        logger.info(`Failed to get hash for file ${filePath} using algorith ${algorithm}.`);
        callback(null, error);
    }  
};

exports.getResourceModule = getResourceModule;

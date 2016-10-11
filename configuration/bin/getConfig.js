/* jshint esnext: true */

var logger = require('winston');
var crypto = require('crypto');
var fs = require('fs');

exports.getFileHash = function(filePath, algorithm, callback){
    var chksum = crypto.createHash(algorithm);
    var hash;
    var stream = fs.createReadStream(filePath); //TODO: error handling more than just hash

    stream.on('data',function(chunk){
        chksum.update(chunk);
    });

    stream.on('end',function(){
        hash = chksum.digest('hex').toUpperCase();
        logger.debug(`Successfully generated hash for configuration file ${filePath}: '${hash}'`);
        callback(hash);
    });
};

//Compare has sent from target node with hash of configuration stored on server 
exports.compareHash = function(configName, targetNodeHash, callback){
    
    callback(hashesSame);
};
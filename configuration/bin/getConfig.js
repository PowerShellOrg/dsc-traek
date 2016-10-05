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
        hash = chksum.digest('hex');
        logger.debug(`Successfully generated hash for configuration file ${filePath}: '${hash}'`);
        callback(hash);
    });
};
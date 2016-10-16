/* jshint esnext: true */

var express = require('express');
var crypto = require('crypto');
var getConfig = require('./routes/getConfig');
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');
var https = require('https');
var logger = require('winston');

//Set up logging
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console,{timestamp:true,colorize:true,level:'debug'});

// load application configuration from file
var configPath = path.join(__dirname,'appConfig.json');
var config;

if(fs.existsSync(configPath)){
    var configContents = fs.readFileSync(configPath);
    config = JSON.parse(configContents);
    logger.debug(`Application configuration loaded for getAction Module from ${configPath}.`);
}else{
    throw 'Configuration file not found.';
}

var app = express();
 
app.locals.config = config;

var privateKey = fs.readFileSync(config.certPaths.privateKey);
var sslCert = fs.readFileSync(config.certPaths.pubicKey);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({strict: false, type: '*/*'}));

app.use('/', getConfig);

https.createServer(
    {   key: privateKey, 
        cert: sslCert, 
        requestCert: true, 
        rejectUnauthorized: false  // validation of certificate done by app since no Certificate Authority is used
    },app).listen(config.port,function(req, res){
    logger.info(`Configuraiton module listening for HTTPS traffic on port ${config.port}.\n`);
});

module.exports = app; 
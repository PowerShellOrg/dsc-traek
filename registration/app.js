/* jshint esnext: true */

var express = require('express');
var bodyParser = require('body-parser');
var regRouter = require('./routes/registration');
var fs = require('fs');
var path = require('path');
var https = require('https');  // Only support HTTPS
var logger = require('winston');

//Set up logging
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console,{timestamp:true, colorize:true});
logger.add(logger.transport.Console,{timestamp:true,colorize:true,level:debug});

// load application configuration from file
var configPath = path.join(__dirname,'appConfig.json');
var config;

if(fs.existsSync(configPath)){
    var configContents = fs.readFileSync(configPath);
    config = JSON.parse(configContents);
    console.log(`Application configuration loaded for Registration Module from ${configPath}.`);
}else{
    throw 'Configuration file not found.';
}

// load web certificates
var privateKey = fs.readFileSync(config.certPaths.privateKey);
var sslCert = fs.readFileSync(config.certPaths.publicKey);

var app = express();

// Set variables that will be available to modules within app
app.locals.config = config;
app.locals.logger = logger;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({strict: false, type: '*/*'}));

app.use('/', regRouter);

https.createServer(
    {   key: privateKey, 
        cert: sslCert, 
        requestCert: true, 
        rejectUnauthorized: false  // validation of certificate done by app since no Certificate Authority is used
    },app).listen(config.port,function(req, res){
    logger.info(`Listening for HTTPS traffic on port ${config.port}.\n`);
});

module.exports = app; 
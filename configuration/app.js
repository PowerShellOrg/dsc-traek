/* jshint esnext: true */

var express = require('express');
var crypto = require('crypto');
var nodes = require('./routes/getConfig');
var bodyParser = require('body-parser');
var fs = require('fs');
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

var privateKey = fs.readFileSync('/data/certs/key.pem');
var sslCert = fs.readFileSync('/data/certs/certificate.pem');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({strict: false, type: '*/*'}));

app.use('/', nodes);

https.createServer(
    {   key: privateKey, 
        cert: sslCert, 
        requestCert: true, 
        rejectUnauthorized: false
    },app).listen(8443,function(req, res){
    logger.info('Listening for HTTPS traffic on port 8443.\n');
});

module.exports = app; 
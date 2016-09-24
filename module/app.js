var express = require('express');
var nodes = require('./routes/nodes');
var bodyParser = require('body-parser');
var fs = require('fs');
var http = require('http');
var https = require('https');
var logger = require('winston');

var app = express();

var privateKey = fs.readFileSync('/data/certs/key.pem');
var sslCert = fs.readFileSync('/data/certs/certificate.pem');

//Set up logging
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console,{timestamp:true,colorize:true,level:'debug'});

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
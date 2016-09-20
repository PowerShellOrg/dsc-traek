/* jshint esnext: true */

var express = require('express');
var proxyApp = express();
var https = require('https');
var path = require('path');
var fs = require('fs');
var proxyUtil = require('./bin/proxyUtil');
var logger = require('winston');

var registrationPath = '/Nodes\\(AgentId=\':id\'\\)'; 
var getActionPath = `${registrationPath}/GetDscAction`;
var getConfigPath = `${registrationPath}/Configurations\\(ConfigurationName=:configName\\)/ConfigurationContent`;;
var getModulePath = '/Modules\\(ModuleName=:moduleName,ModuleVersion=:moduleVersion\\)/ModuleContent';
var reportPath = `${registrationPath}/SendReport`;

var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer({});

// track indexes application wide for each set of targets for round robin distribution.
var registrationIndex;
var getActionIndex;
var moduleIndex;
var configurationIndex;
var reportingIndex;

// load application configuration from file
var configPath = path.join(__dirname,'appConfig.json');
var config; 

if(fs.existsSync(configPath)){
    var configContents = fs.readFileSync(configPath);
    config = JSON.parse(configContents);
    console.log(`Application configuration loaded for Proxy Module from ${configPath}.`);
}else{
    throw 'Configuration file not found.';
}

// load web certificates
var privateKey = fs.readFileSync(config.certPaths.privateKey);
var sslCert = fs.readFileSync(config.certPaths.publicKey);

//Direct traffic to registration targets
//secure: false is being used to allow for self signed certs. This should be removed in production.
//TODO: handle moving to next proxy if one fails.
proxyApp.all(getActionPath, function(req, res){
    var nextTarget = proxyUtil.roundRobin(config.proxyTargets.getAction,getActionIndex);
    var regTarget = proxyUtil.randomTarget(config.proxyTargets.registration);

    console.log(`nextTarget to be used to fulfill getAction request is ${nextTarget}.`);
    console.log(`regTarget to be used to check registration is ${regTarget}.`);

    proxyUtil.clientValidation(req.params.id, req.connection.getPeerCertificate(), regTarget, function(valid){
        if(valid)
        {
            console.log(`Successfully validated client cert.`);
            proxy.web(req, res, {target: nextTarget, secure:false}); 
        }
        else
        {
            res.sendStatus(404).end();
        }
    });

    proxy.on('error', function(err, req, res){
        console.log(`Failed to connect to proxy`);
    });
});

proxyApp.all(reportPath, function(req, res){
    var nextTarget = proxyUtil.roundRobin(config.proxyTargets.reporting, reportingIndex);
    console.log(`Routing ${req.path} to next target: ${nextTarget}.`);
    proxy.web(req, res, {target: nextTarget, secure:false});
}); 

proxyApp.all([registrationPath,'/regkeys'], function(req, res){
    var nextTarget = proxyUtil.roundRobin(config.proxyTargets.registration,registrationIndex);
    console.log(`Routing ${req.path} to next target: ${nextTarget}.`);
    proxy.web(req, res, {target:nextTarget, secure:false});
});

proxyApp.all(getConfigPath, function(req, res){
    var nextTarget = proxyUtil.roundRobin(config.proxyTargets.psModule,moduleIndex);
    console.log(`Routing ${req.path} to next target: ${nextTarget}.`);
    proxy.web(req, res, {target: nextTarget, secure:false});
});

proxyApp.all(getModulePath, function(req, res){
    var nextTarget = proxyUtil.roundRobin(config.proxyTargets.configuration, configurationIndex);
    console.log(`Routing ${req.path} to next target: ${nextTarget}.`);
    proxy.web(req, res, {target: nextTarget, secure:false});
}); 


https.createServer(
    {   key: privateKey, 
        cert: sslCert, 
        requestCert: true, 
        rejectUnauthorized: false  // validation of certificate done by app since no Certificate Authority is used
    },proxyApp).listen(config.port,function(req, res){
    console.log(`Proxy listening for HTTPS traffic on port ${config.port}.\n`);
});
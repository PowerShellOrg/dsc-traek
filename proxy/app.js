/* jshint esnext: true */

var express = require('express');
var proxyApp = express();
var https = require('https');
var path = require('path');
var fs = require('fs');

var registrationPath = '/Nodes\\(AgentId=\':id\'\\)'; 
var getActionPath = `${registrationPath}/GetDscAction`;

var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer({});

// track indexes application wide for each set of targets for round robin distribution.
var registrationIndex;
var orchestrationIndex;
var moduleIndex;
var configurationIndex;

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

//functions to assit with selecting proxy targets
function randomTarget(targets){
    
    var target;
    
    if(targets.length > 1 )
    {
        var i = Math.floor(Math.random() * (targets.length - 1));
        target = targets[i];
    }
    else
    {
        target = targets;
    }
    
    return target;
}

function roundRobin(targets, index){
    var target;

    switch (index) {
        case 'registration':
            if(isNaN(registrationIndex) || registrationIndex === (targets.length - 1)){
                registrationIndex = 0;
            }
            else
            {
                registrationIndex += 1;
            }
            target = targets[registrationIndex];
            break;

        case 'orchestration':
            if(isNaN(orchestrationIndex) || orchestrationIndex === (targets.length - 1)){
                orchestrationIndex = 0;
            }
            else
            {
                orchestrationIndex += 1;
            }
            target = targets[orchestrationIndex];
            break;

        case 'module':
            if(isNaN(moduleIndex) || moduleIndex === (targets.length - 1)){
                moduleIndex = 0;
            }
            else
            {
                moduleIndex += 1;
            }
            target = targets[moduleIndex];    
            break;

        case 'configuration':
            if(isNaN(configurationIndex) || configurationIndex === (targets.length - 1)){
                configurationIndex = 0;
            }
            else
            {
                configurationIndex += 1;
            }
            target = targets[configurationIndex];    
            break;
    }

    return target;
}

//Direct traffic to registration targets
//secure: false is being used to allow for self signed certs. This should be removed in production.
proxyApp.all(getActionPath, function(req, res){
    var nextTarget = roundRobin(config.proxyTargets.orchestration,'orchestration');
    proxy.web(req, res, {target: nextTarget, secure:false});
});

proxyApp.all([registrationPath,'/regkeys'], function(req, res){
    var nextTarget = roundRobin(config.proxyTargets.registration,'registration');
    console.log(`Routing ${req.path} to next target: ${nextTarget}.`);
    proxy.web(req, res, {target:nextTarget, secure:false});
});

proxyApp.all('/tres', function(req, res){
    var nextTarget = roundRobin(config.proxyTargets.psModule,'module');
    proxy.web(req, res, {target: nextTarget, secure:false});
});

proxyApp.all('/tres', function(req, res){
    var nextTarget = roundRobin(config.proxyTargets.configuration, 'configuration');
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
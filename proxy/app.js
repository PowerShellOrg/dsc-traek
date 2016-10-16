/* jshint esnext: true */

var express = require('express');
var proxyApp = express();
var https = require('https');
var path = require('path');
var fs = require('fs');
var proxyUtil = require('./bin/proxyUtil');
var logger = require('winston');
var spawn = require('child_process').fork;

var registrationUri = '/Nodes\\(AgentId=\':id\'\\)'; 
var getActionUri = `${registrationUri}/GetDscAction`;
var getConfigUri = `${registrationUri}/Configurations\\(ConfigurationName=\':configName\'\\)/ConfigurationContent`;;
var getModuleUri = '/Modules\\(ModuleName=\':moduleName\',ModuleVersion=\':moduleVersion\'\\)/ModuleContent';
var reportUri = `${registrationUri}/SendReport`;

var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer({});

// track indexes application wide for each set of targets for round robin distribution.
var registrationIndex;
var getActionIndex;
var moduleIndex;
var configurationIndex;
var reportingIndex;

//Set up logging
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console,{timestamp:true,colorize:true,level:'debug'});

// load application configuration from file
var configPath = path.join(__dirname,'appConfig.json');
var config; 

if(fs.existsSync(configPath)){
    var configContents = fs.readFileSync(configPath);
    config = JSON.parse(configContents);
    logger.debug(`Application configuration loaded for Proxy Module from ${configPath}.`);
}else{
    throw 'Configuration file not found.';
}

// load web certificates
var privateKey = fs.readFileSync(config.certPaths.privateKey);
var sslCert = fs.readFileSync(config.certPaths.publicKey);

//TODO: handle moving to next proxy if one fails.????
//Log information for any request made to the server
proxyApp.use('/', function(req, res, next){
  logger.debug(`
                ***********************************
                Logging information about request...

                request url:        ${req.url}
                requst method:      ${req.method}
                request header:     ${JSON.stringify(req.headers)}
                request body:       ${JSON.stringify(req.body)}
                request host name:  ${req.hostname}
                request IP Address: ${req.ip}
                request trailers:   ${JSON.stringify(req.trailers)}
                request Cookie:     ${JSON.stringify(req.cookies)}
                request parameters: ${JSON.stringify(req.params)}
                request query:      ${JSON.stringify(req.query)}
                request raw Header: ${req.rawHeaders}
                request statuscode: ${req.statusCode}
                reqest statusmesg:  ${req.statusMessage}
                request cert:       ${JSON.stringify(req.connection.getPeerCertificate())}
                *********************************************
  `);
  next();
});

proxyApp.all(getActionUri, function(req, res){
    var nextTarget = proxyUtil.roundRobin(config.proxyTargets.getAction,getActionIndex);
    var regTarget = proxyUtil.randomTarget(config.proxyTargets.registration);

    logger.debug(`nextTarget to be used to fulfill getAction request is ${nextTarget}.`);
    logger.debug(`regTarget to be used to check registration is ${regTarget}.`);

    logger.info('Validating agent ID and certificate.');
    proxyUtil.clientValidation(req.params.id, req.connection.getPeerCertificate(), regTarget, function(valid){
        if(valid)
        {
            logger.info(`Successfully validated client agent ID and cert.`);
            proxy.web(req, res, {target: nextTarget, secure:false}); //secure: false is being used to allow for self signed certs. This should be removed in production.
        }
        else
        {
            logger.info('Failed to validate client agent ID and Cert.');
            res.sendStatus(404).end();
        }
    });

    proxy.on('error', function(err, req, res){
        logger.warn(`Failed to connect to proxy!`);
    });
});

proxyApp.all(reportUri, function(req, res){
    var nextTarget = proxyUtil.roundRobin(config.proxyTargets.reporting, reportingIndex);
    logger.info(`Routing ${req.path} to next target: ${nextTarget}.`);
    proxy.web(req, res, {target: nextTarget, secure:false}); //secure: false is being used to allow for self signed certs. This should be removed in production.
}); 

proxyApp.all([registrationUri,'/regkeys'], function(req, res){
    var nextTarget = proxyUtil.roundRobin(config.proxyTargets.registration,registrationIndex);

    logger.info(`Routing ${req.path} to next target: ${nextTarget}.`);
    proxy.web(req, res, {target:nextTarget, secure:false}); //secure: false is being used to allow for self signed certs. This should be removed in production.
});

proxyApp.all(getConfigUri, function(req, res){
    var nextTarget = proxyUtil.roundRobin(config.proxyTargets.configuration, configurationIndex);

    logger.info(`Routing ${req.path} to next target: ${nextTarget}.`);
    proxy.web(req, res, {target: nextTarget, secure:false}); //secure: false is being used to allow for self signed certs. This should be removed in production.
});

proxyApp.all(getModuleUri, function(req, res){
    var nextTarget = proxyUtil.roundRobin(config.proxyTargets.psModule, moduleIndex);

    logger.info(`Routing ${req.path} to next target: ${nextTarget}.`);
    proxy.web(req, res, {target: nextTarget, secure:false}); //secure: false is being used to allow for self signed certs. This should be removed in production.
}); 

// TODO: paramaterize this so only desired modules will be spawned.
// start modules in separate processes
var reportingModule = spawn('../statusReport/app');
var registrationModule = spawn('../registration/app');
var dscResourceModule = spawn('../module/app');
var getActionModule = spawn('../getAction/app');
var configurationModule = spawn('../configuration/app');

https.createServer(
    {   key: privateKey, 
        cert: sslCert, 
        requestCert: true, 
        rejectUnauthorized: false  // validation of certificate done by app since no Certificate Authority is used
    },proxyApp).listen(config.port,function(req, res){
    logger.info(`Proxy listening for HTTPS traffic on port ${config.port}.\n`);
});
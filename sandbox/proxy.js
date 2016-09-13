/* jshint esnext: true */

var express = require('express');
var reg = express();
var orch = express();
var conf = express();
var proxyApp = express();

 
var httpProxy = require('http-proxy');

var proxy = httpProxy.createProxyServer({});

proxyApp.get('/first', function(req, res){
    proxy.web(req, res, {target:'http://localhost:8080'});
});

proxyApp.get('/second', function(req, res){
    proxy.web(req, res, {target:'http://localhost:8181'});
});

proxyApp.get('/tres', function(req, res){
    proxy.web(req, res, {target:'http://localhost:8888'});
});

proxyApp.listen(8000);





// creating target servers.
reg.get('/first',function(req, res){
    res.send('You have reached the FIRST milestone. You have along way to go!');
});

reg.listen(8080,function(){
    console.log('a webserver is listening on port 8080.');
});

orch.get('/second', function(req, res){
    res.send('You have reached the ORCHESTRATION milestone. You should get your act together!');
});

orch.listen(8181, function(){
    console.log('a webserver is listening on port 8181.');
});

conf.get('/tres', function(req, res){
    res.send('You have reached the LAST milestone. Good Luck!');
});

conf.listen(8888, function(){
    console.log('a webserver is listening on port 8888.');
});

var myString = "This is cool stuff";

console.log(JSON.stringify(myString));

// var express = require('express');
// var crypto = require('crypto');
// var app = express();

// // Hash the body of the request with sha-256
// var requestBody = `{"AgentInformation":{"LCMVersion":"2.0","NodeName":"WIN-9DNKGBJELRA","IPAddress":"192.168.56.101;127.0.0.1;fe80::75f9:e379:fe4d:45f%27;::2000:0:0:0;::1;::2800:0:0:0;fe80::ffff:ffff:fffe%14"},"ConfigurationNames":["WebServer","Security"],"RegistrationInformation":{"CertificateInformation":{"FriendlyName":"DSC-OaaS Client Authentication","Issuer":"CN=DSC-OaaS","NotAfter":"2017-08-13T10:32:02.0000000-07:00","NotBefore":"2016-08-13T17:22:03.0000000-07:00","Subject":"CN=DSC-OaaS","PublicKey":"U3lzdGVtLlNlY3VyaXR5LkNyeXB0b2dyYXBoeS5YNTA5Q2VydGlmaWNhdGVzLlB1YmxpY0tleQ==","Thumbprint":"18ED38906A8C6473378408D1EA70207C9FB07887","Version":3},"RegistrationMessageType":"ConfigurationRepository"}}`;
// var xmsDate = "2016-08-14T01:04:21.9280763Z";
// var regKey = "845279827-796-493";

// var bodyHash = crypto.createHash('sha256').update(requestBody,'utf8').digest('base64');
// var signString = `${bodyHash}\n${xmsDate}`;
// console.log(signString + '\n***');
// var signature = crypto.createHmac('sha256',regKey).update(signString,'utf8').digest('base64');
// console.log(signature);

/*
Example request information
request header:     
  {
    "accept":"application/json",
    "x-ms-date":"2016-08-14T01:04:21.9280763Z",
    "authorization":"Shared 0/D5GNkugDgqVageXUqlCRV6Rxf8HgXWxyeASrZtp8g=",
    "protocolversion":"2.0",
    "content-type":"application/json; charset=utf-8",
    "host":"host:8080",
    "content-length":"693",
    "expect":"100-continue",
    "connection":"Keep-Alive"
  }  
*/
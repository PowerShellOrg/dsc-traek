

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


request body:
  {
    "AgentInformation": {
      "LCMVersion": "2.0",
      "NodeName": "WIN-9DNKGBJELRA",
      "IPAddress": "192.168.56.101;127.0.0.1;fe80::75f9:e379:fe4d:45f%20;::2000:0:0:0;::1;::2000:0:0:0"
    },
    "ConfigurationNames": [
      "WebServer",
      "Security"
    ],
    "RegistrationInformation": {
      "CertificateInformation": {
        "FriendlyName": "DSC-OaaS Client Authentication",
        "Issuer": "CN=DSC-OaaS",
        "NotAfter": "2017-08-31T01:16:41.0000000-07:00",
        "NotBefore": "2016-08-31T08:06:41.0000000-07:00",
        "Subject": "CN=DSC-OaaS",
        "PublicKey": "U3lzdGVtLlNlY3VyaXR5LkNyeXB0b2dyYXBoeS5YNTA5Q2VydGlmaWNhdGVzLlB1YmxpY0tleQ==",
        "Thumbprint": "C0E35A283B4B1FAE573953CBC99567A1776A8472",
        "Version": 3
      },
      "RegistrationMessageType": "ConfigurationRepository"
    }
  }
  */
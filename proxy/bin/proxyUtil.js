/* jshint esnext: true */
var https = require('https');

//functions to assit with selecting proxy targets
exports.randomTarget = function(targets){
    
    var target;
    
    if(targets.constructor === Array && targets.length > 1 )
    {
        var i = Math.floor(Math.random() * (targets.length - 1));
        target = targets[i];
    }
    else if(targets.constructor === Array && targets.length === 1)
    {
        target = targets[0];
    }
    
    return target;
};

exports.roundRobin = function(targets, index){

    if(isNaN(index) || index === (targets.length - 1)){
        index = 0;
    }
    else
    {
        index += 1;
    }

    return targets[index];
};

exports.clientValidation = function(agentId, cert, targetHost, callback){
  //Validate node is registered and is using a valid cert
  //expected targetHost format: http://reg.contoso.com:6780

  console.log(`Validating ID and Certificate for ${agentId}.`);

  var options = {
      host: targetHost.toString().split(':')[1].replace('//',''),
      port: targetHost.toString().split(':')[2],
      path: `/validateAgent`,
      method: 'PUT',
      rejectUnauthorized: false,   //TODO: remove in prod
      headers: {
            connection: "keep-alive",
            'content-type': "text/json",
            accept:"*/*"
      }
  };

  var req = https.request(options, function(res){
      var data;
      res.on('data',function(chunk){
          data = chunk;
      });

      res.on('end',function(){
          //data = Buffer.concat(data).toString();
          console.log(`response from validation: ${data} 
                    response code: ${res.statusCode}`);
          if(res.statusCode === 404)
          {
              callback(false);
          }
          else if(res.statusCode === 200)
          {
              callback(true);
          }
      }); 
  });

  var reqbody = JSON.stringify({agentId: agentId,
                certificate: cert
                });

  req.end(reqbody);

  req.on('error',function(err){
        console.log(`Attempt to validate Agent failed with error: ${err}`);
    });
};
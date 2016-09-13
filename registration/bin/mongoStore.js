/* jshint esnext: true */
// This module defines how registration data is written and read.
// This implementation uses MongoDB 

const REGKEYDBID = "e9364206-c1bf-4916-af8c-8a04c8dc28c7";   //unique key to represent registration keys. This does not need to be changed.
var mongoose = require('mongoose');
var dbHost = 'mongodb://localhost/dscServer1';

mongoose.connect(dbHost);

//Schema for Shared Registration keys
var sharedKeySchema = mongoose.Schema({
    _id: String,
    primary: String,
    secondary: String
});

// Schema for Agents
var agentSchema = mongoose.Schema({
    agentId: {index: true, type: String},
    registrationInfo: {}
});

//Sets the shared keys that will be used by nodes to register with this server
exports.setSharedKey = function (primaryKey, secondaryKey){
    
    var sharedKey = mongoose.model('SharedKey',sharedKeySchema);

    sharedKey.findById(REGKEYDBID,function(err, sharedKeys){
        if(!sharedKeys){
            //Shared Keys do not exist so create them.
            sharedKeys = new sharedKey({_id:REGKEYDBID});
            console.log('Shared Key id created.');
        }
        
        // Shared keys already exist so update fields as appropriate
        if(primaryKey !== sharedKeys.primary){
            sharedKeys.primary = primaryKey;
            console.log('Primary shared key to be updated.');
        }
        
        if(secondaryKey !== sharedKeys.secondary){
            sharedKeys.secondary = secondaryKey;
            console.log('Secondary shared key to be updated.');
        }

        //Save changes back to DB.
        sharedKeys.save(function(err){});
        console.log('Shared keys successfully updated.');
        
    });
};

//Gets the shared keys that nodes can use to register with this server 
exports.getSharedKey = function (callback){
    var sharedKey = mongoose.model('SharedKey',sharedKeySchema);
    sharedKey.findById(REGKEYDBID,function(err, sharedkeys){
        if(err){
            console.log(err);
        }
        else{
            console.log(sharedkeys);
            callback(sharedkeys);
        }
    });
};

//Saves registration information about a node with this server
//TODO: save certificate information as well
exports.setAgent = function (agentId, registrationInfo, callback){
    var agent = mongoose.model('Agent', agentSchema);

    agent.findOne({'agentId':agentId},function(err, node){
        if(!node){
            node = new agent({'agentId':agentId, 'registrationInfo':registrationInfo});
        }
        else
        {
            node.agentId = agentId;
            node.registrationInfo = registrationInfo;
        }

        node.save(function(saveErr){
            err = saveErr;
        });

        callback(err);
    });
};

//Validates whether or not a node is already registered with this server
//This can be used by other microservices to validate Agent is already registered before processing requests
exports.validate = function (agentId){
    agent.findOne({'agentId':agentId},function(err, node){
        if(agent){
            console.log(`Found agent with id of ${agentId} in the datastore.`);
            return true;
        }
        else
        {
            console.log(`Agent with id of ${agentId} was NOT found in the datastore.`);
            return false;
        }
    });    
};
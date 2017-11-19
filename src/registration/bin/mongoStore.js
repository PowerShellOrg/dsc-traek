/* jshint esnext: true */
// This module defines how registration data is written and read.
// This implementation uses MongoDB 
var logger = require('winston');
var mongoose = require('mongoose');

var sharedKeySchema;
var agentSchema;

const REGKEYDBID = "e9364206-c1bf-4916-af8c-8a04c8dc28c7";   //unique key to represent registration keys. This does not need to be changed.

exports.init = function(connectionString){

    mongoose.connect(connectionString);

    //Schema for Shared Registration keys
    sharedKeySchema = mongoose.Schema({
        _id: String,
        primary: String,
        secondary: String
    });

    // Schema for Agents
    agentSchema = mongoose.Schema({
        agentId: {index: true, type: String},
        nodeInfo: {},
        configurations: [String],
        certificate:{}
    });

};

//Sets the shared keys that will be used by nodes to register with this server
exports.setSharedKey = function (primaryKey, secondaryKey){
    
    var sharedKey = mongoose.model('SharedKey',sharedKeySchema);

    sharedKey.findById(REGKEYDBID,function(err, sharedKeys){
        if(!sharedKeys){
            //Shared Keys do not exist so create them.
            sharedKeys = new sharedKey({_id:REGKEYDBID});
            logger.debug('Shared Key id created.');
        }
        
        // Shared keys already exist so update fields as appropriate
        if(primaryKey !== sharedKeys.primary){
            sharedKeys.primary = primaryKey;
            logger.debug('Primary shared key to be updated.');
        }
        
        if(secondaryKey !== sharedKeys.secondary){
            sharedKeys.secondary = secondaryKey;
            logger.debug('Secondary shared key to be updated.');
        }

        //Save changes back to DB.
        sharedKeys.save(function(err){});
        logger.debug('Shared keys successfully updated.');
        
    });
};

//Gets the shared keys that nodes can use to register with this server 
exports.getSharedKey = function (callback){
    var sharedKey = mongoose.model('SharedKey',sharedKeySchema);
    
    sharedKey.findById(REGKEYDBID,function(err, sharedkeys){
        if(err){
            logger.info(err);
        }
        else{
            callback(sharedkeys);
        }
    });
};

//Saves registration information about a node with this server

exports.setAgent = function (agentId, agentInfo, callback){
    var agent = mongoose.model('Agent', agentSchema);

    agent.findOne({'agentId':agentId},function(err, node){
        if(!node){
            node = new agent({'agentId':agentId, 'nodeInfo':agentInfo.AgentInformation, 
                              'configurations':agentInfo.ConfigurationNames, 
                              'certificate':agentInfo.RegistrationInformation.CertificateInformation
                            });
        }
        else
        {
            //node.agentId = agentId; // since finding by agentId this will never do anything
            node.nodeInfo = agentInfo.AgentInformation;
            node.configurations = agentInfo.ConfigurationNames;
            node.certificate = agentInfo.RegistrationInformation.CertificateInformation;
        }

        node.save(function(saveErr){
            err = saveErr;
        });

        callback(err);
    });
};

//Validates whether or not a node is already registered with this server
//This will be used by other microservices to validate Agent is already registered before processing requests
exports.validate = function (agentId, certificate, callback){
    var agent = mongoose.model('Agent', agentSchema);
    logger.debug(`Agent ID: ${agentId}`);
    logger.debug(`Certificate: ${certificate}`);

    agent.findOne({'agentId':agentId}, function(err, node){
        var result = false;

        if(err)
        {
            logger.info(`The following error occured while trying to find agent ${agentId}: ${err}.`);
        }

        //Validate that AgentID exists.
        if(!err && node){
            //Validate certificate thumprint matches
            var clientCert = certificate.fingerprint.split(":").join("");
            logger.debug(`cert from DB: ${node.certificate.Thumbprint}
                         Cert from client: ${certificate.fingerprint}
                         Cert reformat: ${clientCert}`); //Will this be the same for every cert???
            
            if(node.certificate.Thumbprint === clientCert)
            { 
                result = true ;
            }
            
            //TODO: Validate additional certificate properties
            
        }
        callback(result);
    });    
};
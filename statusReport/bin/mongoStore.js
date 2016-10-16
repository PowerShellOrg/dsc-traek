/* jshint esnext: true */
// This module defines how reporting data is written and read.
// This implementation uses MongoDB 

var logger = require('winston');
var mongoose = require('mongoose');
var reportSchema;

exports.init = function(connectionString){
    
    mongoose.connect(connectionString);

    //Schema for reporting data
    reportSchema = mongoose.Schema({
        _id: String,
        ReportRuns: [{
            JobId: {index: true, type: String},
            NodeName: String,
            IpAddress: String,
            LCMVersion: String,
            OperationType: String,
            RefreshMode: String,
            Status: String,
            ReportFormatVersion: String,
            ConfigurationVersion: String,
            StartTime: Date,
            EndTime: Date,
            RebootRequested: Boolean,
            Errors: {},
            StatusData: {},
            AdditionalData: {}
        }]
    });

};

//Sets reporting data
exports.setReportData = function (agentId, reportData, callback){
    
    var report = mongoose.model('Agent',reportSchema);

    report.findById(agentId,function(err, reportsDb){
        try {
            var reportRunDb;

            if(!reportsDb){
                //This agent does not exist in the DB so create it.
                reportsDb = new report({
                    '_id':agentId
                });
            }

            //Get object containing jobId for this run.
            var reportRunDbArr = reportsDb.ReportRuns.filter(function(run, index, allRuns){
                if(run.JobId === reportData.JobId){
                    allRuns.splice(index,1);
                    return run;
                }
            });

            //Should only be one item in the array so assign it to variable
            reportRunDb = reportRunDbArr[0];

            //If jobId does not exist create it.
            if(reportRunDb === undefined){
                reportRunDb = {JobId: reportData.JobId};
            }

            //Add the rest of the properties if they are included in the request body
            if(!isEmptyStringOrUndefined(reportData.NodeName) && reportRunDb.NodeName === undefined){
                reportRunDb.NodeName = reportData.NodeName;
            }

            if(!isEmptyStringOrUndefined(reportData.IpAddress) && reportRunDb.IpAddress === undefined){
                reportRunDb.IpAddress = reportData.IpAddress;
            }

            if(!isEmptyStringOrUndefined(reportData.LCMVersion) && reportRunDb.LCMVersion === undefined){
                reportRunDb.LCMVersion = reportData.LCMVersion;
            }

            if(!isEmptyStringOrUndefined(reportData.ReportFormatVersion) && reportRunDb.ReportFormatVersion === undefined){
                reportRunDb.ReportFormatVersion = reportData.ReportFormatVersion;
            }
            
            if(!isEmptyStringOrUndefined(reportData.ConfigurationVersion) && reportRunDb.ConfigurationVersion === undefined){
                reportRunDb.ConfigurationVersion = reportData.ConfigurationVersion;
            }

            if(!isEmptyStringOrUndefined(reportData.OperationType) && reportRunDb.OperationType === undefined){
                reportRunDb.OperationType = reportData.OperationType;
            }
            
            if(!isEmptyStringOrUndefined(reportData.RefreshMode) && reportRunDb.RefreshMode === undefined){
                reportRunDb.RefreshMode = reportData.RefreshMode;
            }

            if(!isEmptyStringOrUndefined(reportData.Status) && reportRunDb.Status === undefined){
                reportRunDb.Status = reportData.Status;
            }
            
            if(!isEmptyStringOrUndefined(reportData.StartTime) && reportRunDb.StartTime === undefined){
                reportRunDb.StartTime = new Date(reportData.StartTime);
            }

            if(!isEmptyStringOrUndefined(reportData.EndTime) && reportRunDb.EndTime === undefined){
                reportRunDb.EndTime = new Date(reportData.EndTime);
            }
            
            if(!isEmptyStringOrUndefined(reportData.RebootRequested) && reportRunDb.RebootRequested === undefined){
                reportRunDb.RebootRequested = reportData.RebootRequested;
            }
             
             if(isEmptyOrNotArray(reportRunDb.Errors) && reportData.Errors){
                (reportRunDb.Errors = []).push(reportData.Errors);
            }
            else if(reportData.Errors && reportRunDb.Errors) {
                    reportRunDb.Errors.push(reportData.Errors);
            }

            if(isEmptyOrNotArray(reportRunDb.StatusData) && reportData.StatusData){
                (reportRunDb.StatusData = []).push(reportData.StatusData);
            }
            else if(reportData.StatusData && reportRunDb.StatusData){
                    reportRunDb.StatusData.push(reportData.StatusData);
            }
            
            if(!isEmptyStringOrUndefined(reportData.AdditionalData) && reportRunDb.AdditionalData === undefined){
                reportRunDb.AdditionalData = reportData.AdditionalData;
            }

            //Add the updated run back to DB
            reportsDb.ReportRuns.push(reportRunDb);

            reportsDb.save();

            logger.debug(`Report data successfully updated for JobId '${reportData.JobId}' on AgentId '${agentId}'.`);
            callback(null);
            
        } catch (error) {
            logger.info(`Failed to save report data to datastore.
                AgentId: ${agentId}
                JobId: ${reportData.JobId}
                Error: ${error}
            `);
            callback(error);
        }
        
    });
};

function isEmptyOrNotArray(arr){
    var isAnArray = false;
    if(Array.isArray(arr) && arr.length > 0){
        isAnArray = true;
    }
    
    return !isAnArray;
}

function isEmptyStringOrUndefined(obj){
    var returnVal = false;
    if(obj === undefined || obj === ''){
        returnVal = true;
    }

    return returnVal;
}
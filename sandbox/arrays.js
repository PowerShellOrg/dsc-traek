var db = {
    _id: '87-fish',
    ReportRuns: [{
        JobId: '90-56-ffjj',
        NodeName: 'Thing1',
        IpAddress: '127.0.0.1',
        LCMVersion: '2.0',
        OperationType: 'Intial',
        RefreshMode: 'Pull',
        Status: 'Success',
        ReportFormatVersion: '2.0',
        ConfigurationVersion: '2.0.0',
        StartTime: new Date('10-9-2016 4:00'),
        EndTime: new Date('10-9-2016 4:02'),
        RebootRequested: false,
        Errors: {},
        AdditionalData: {}
    }]
};

var input = {
    JobId: '33-86-f0jj',
    NodeName: 'Thing2',
    IpAddress: '127.0.0.1',
    LCMVersion: '2.0',
    OperationType: 'Intial',
    RefreshMode: 'Pull',
    Status: 'Success',
    ReportFormatVersion: '2.0',
    ConfigurationVersion: '2.0.0',
    StartTime: new Date('10-9-2016 4:00'),
    EndTime: new Date('10-9-2016 4:02'),
    RebootRequested: false,
    Errors: {},
    AdditionalData: {}
};

db.ReportRuns.push(input);

var desiredIndex;

var thisRunArr = db.ReportRuns.filter(function(run, index, allRuns){
    return run.JobId === '33-86-f0jj';
});
var thisRun = thisRunArr[0];
thisRun.RebootRequested = true;
//db.ReportRuns.splice(desiredIndex,1);

console.log(db);
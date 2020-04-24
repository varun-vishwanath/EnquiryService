var bunyan = require('bunyan');

var log = bunyan.createLogger({
    name: 'customerAncillaryService',
    streams: [{
        // stream: process.stdout
        type: 'rotating-file',
        path: '../../logs/enquiry.log',
        period: '1d', // daily rotation
        count: 10, // keep 3 back copies
        level: "info" //it will display warn,error and fatal
    }]
});

exports.log = log;

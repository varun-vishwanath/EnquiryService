'use strict';
var log = require('../../server/logger-config.js').log;
var app = require('../../server/server.js');
var dataSource = app.dataSources.Enquiry;

module.exports = function(Enquiries) {

    // dataSource.discoverSchema('enquiries', { owner: 'kb_enquiry' }, function (err, schema) {
    //     schema.dataSource = 'Enquiry';
    //     console.log(JSON.stringify(schema), null, '  ');
    // });

};

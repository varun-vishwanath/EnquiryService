'use strict';
var log = require('../../server/logger-config.js').log;
var app = require('../../server/server.js');
var dataSource = app.dataSources.Enquiry;

module.exports = function(EnquiryTenant) {
    // log.info("kldin ..." + dataSource);
    // dataSource.discoverSchema('kb_enquiry_tenant', {
    //     owner: 'kb_enquiry'
    // }, function (err, schema) {
    //     schema.dataSource = 'kb_enquiry';
    //     console.log(JSON.stringify(schema), null, '  ');
    // });
};

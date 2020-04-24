var log = require('../../server/logger-config.js').log;
var app = require('../../server/server.js');
var Q = require('q');
const responseCode = require('../constant/response-codes.js');
// var client = require('../config/es_client');
var method = module.exports = {};
/**
 * A method to create Instance of keeboot enquiry details based on userId, tenantId
 * @param {object} enquiryObject 
 * @returns {Promise} A promise that will resolve employee tenant Object.
 */


method.createEnquiry = function (enquiryObject) {
    var createDeferred = Q.defer();
    app.models.kbenquiry.create(enquiryObject, function (err, res) {
        if (err) {
            log.error('error while creating keeboot enquiry details ' + JSON.stringify(err))
            createDeferred.reject(responseCode[25000]);
        } else {
            createDeferred.resolve(res);
        }
    })
    return createDeferred.promise;
}


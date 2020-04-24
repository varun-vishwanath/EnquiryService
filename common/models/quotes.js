'use strict';

var log = require('../../server/logger-config.js').log;
var app = require('../../server/server.js');
const responseCode = require('../constant/response-codes.js');

var quoteService = require('../services/quotes-service');
const ssUtil = require('../utils/ss-helper')
var dataSource = app.dataSources.Enquiry;



module.exports = function (Quotes) {

    Quotes.getQuotesByRefId = async function (refId, headerTenantId, headerUserId, headerEmployeeId, headerAppType, cb) {


        var quotes = await app.models['kb-quotes'].find({ where: { and: [{ referenceId: refId }, { isLatest: true }] } }).catch(err => { log.error(" Error while creating record  " + JSON.stringify(err)); return false });

        log.info("Response of quotes " + JSON.stringify(quotes))
        if (!quotes)
            return responseCode[25007];

        return {
            statusCode: 0, response: quotes
        }

    }

    Quotes.confirmQuote = async function (quoteId, headerTenantId, headerUserId, headerEmployeeId, headerAppType, cb) {

        if (quoteId) {
            var result = await app.models['kb-quotes'].updateAll({ id: quoteId }, { isConfirmed: true }).catch(err => {
                log.error("error while confirming quotes ", JSON.stringify(err));
                return false
            });
            if (!result) {
                return responseCode[25009]
            }

            //creating a booking record for this quoting

            var quoteRec = await app.models['kb-quotes'].findById(quoteId).catch(err => {
                log.error("error while getting quote by Id ", JSON.stringify(err));
                return false
            });

            if (quoteRec) {
                quoteService.createBookingRecord(quoteRec, headerTenantId, headerUserId, headerEmployeeId, headerAppType);
            }

            //confirm alert to tenant
            ssUtil.notifyTenants(headerTenantId, "CONFIRM", { where: { and: [{ referenceId: quoteRec.referenceId }, { tenantId: quoteRec.tenantId }] } });

            //reject alert to remaining tenants
            ssUtil.notifyTenants(headerTenantId, "REJECT", { where: { and: [{ referenceId: quoteRec.referenceId }, { tenantId: { neq: quoteRec.tenantId } }] } })

            return {
                statusCode: 0,
                response: "Submitted Successfully !!"
            }

        } else {
            return responseCode[25010]
        }
    }

    Quotes.getQuotesBySupplierRateId = async function (supplierRateId, headerTenantId, headerUserId, headerEmployeeId, headerAppType, cb) {

        log.info("getting  supplier rate request " + supplierRateId);

        log.info("getting supplier data ", headerTenantId, headerUserId, headerEmployeeId, headerAppType);

        var quotes = await app.models['kb-quotes'].find({ where: { supplierRateId: supplierRateId }, order: 'createdTs DESC', limit: 1 }).catch(err => { log.error(" Error while getting record  " + JSON.stringify(err)); return false });

        log.info("Response of quotes " + JSON.stringify(quotes))
        if (!quotes)
            return responseCode[25011];
        return {
            statusCode: 0, response: quotes
        }
    }

};

var func = module.exports = {};
var log = require('../../server/logger-config.js').log;
var app = require('../../server/server.js');
const responseCode = require('../constant/response-codes.js');

func.createBookingRecord = async function(quoteInfo, headerTenantId, headerUserId, headerEmployeeId, headerAppType){

    var bookingInfo = {
        "referenceId": quoteInfo.supplierRateId,
        "driverName": quoteInfo.driverName,
        "driverMobile": quoteInfo.driverMobile,
        "ownerName": quoteInfo.ownerName,
        "ownerMobile": quoteInfo.ownerMobile,
        "vehicleNumber": quoteInfo.vehicleNumber,
        "vehicleType": quoteInfo.vehicleType,
        "vehicleTypeId": quoteInfo.vehicleTypeId,
        "tenantId" : quoteInfo.tenantId
    }
    var createBookingRec = await app.dataSources.BookingService.create(headerTenantId, headerUserId, headerEmployeeId, headerAppType, bookingInfo).catch(err => {
        log.error("error while creating booking record ", JSON.stringify(err));
        return false;
    });

    log.info("printing result " + JSON.stringify(createBookingRec));
    if (!createBookingRec) {
        return responseCode[25006];
    }

    return createBookingRec;

}
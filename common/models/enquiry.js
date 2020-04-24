'use strict';

var log = require('../../server/logger-config.js').log;
var app = require('../../server/server.js');
var dataSource = app.dataSources.Enquiry;
const uuid = require('collaborator').UUID;
var kbdao = require('../dao/enquiry-dao');
var EnquiryService = require('../services/Enquiry');
var supplierRateService = require('../services/supplier-rates-service');
const responseCode = require('../constant/response-codes.js');

//var modelHelper = require('../dao/model-dao');
var modelHelper = require('lbmysqlcommon').CommonModelDao;
const cache = require('kbcommons-cache').Cache.keys;
const uuidv1 = require('uuid/v1');
const cacheUtil = require('../utils/cache-util');
const ssUtil = require('../utils/ss-helper');
var quoteService = require('../services/quotes-service');

const curdHelper = require("keebootcrud").keebootCommons;

const queueHelper = require('../utils/queue-helper');


/**
 * 
 */
module.exports = function (Enquiry) {

    /**
     * This method will add new Enquirey
     */
    Enquiry.addEnquiry = async function (headerTenantId, headerUserId, headerEmployeeId, headerAppType, enquiryData, cb) {

        enquiryData.createdByTenantId = headerTenantId;
        enquiryData.tenantId = enquiryData.tenantId ? enquiryData.tenantId : headerTenantId; //to  whom we are broadcasting
        enquiryData.userId = headerUserId;
        enquiryData.employeeId = headerEmployeeId;
        enquiryData.appType = headerAppType;

        enquiryData.enquiryType = enquiryData.enquiryType ? enquiryData.enquiryType : 'STANDALONE';

        log.info("Enquiry details", enquiryData.enquiryId, headerUserId, headerTenantId, headerEmployeeId, headerAppType, enquiryData);

        var result = await modelHelper.createEntity("enquiries", enquiryData.tenantId, enquiryData, "ENQ").catch(err => { return err });

        console.log("saved the enquiry " + JSON.stringify(result));



        return result;
    }

    Enquiry.getByTenantId = async function (pageNo, pageSize, headerTenantId, headerUserId, headerEmployeeId, headerAppType, cb) {

        var result = await modelHelper.getByTenantId('enquiries', headerTenantId, pageNo, pageSize, 'createdTs DESC').catch(err => { return err });

        log.info("Get by tenant response " + JSON.stringify(result));

        return result;

    }

    Enquiry.updateEnquiry = async function (enquiryId, headerTenantId, headerUserId, headerEmployeeId, headerAppType, data, cb) {

        var result = await modelHelper.updateById('enquiries', headerTenantId, enquiryId, data);

        log.info("updated the details  " + JSON.stringify(result));

        return result;
    }

    Enquiry.getDetailById = async function (entityId, headerTenantId, headerUserId, headerEmployeeId, headerAppType, cb) {

        var result = await modelHelper.getEntityById('enquiries', headerTenantId, entityId).catch(err => { return err });

        log.info("Get details by id response " + JSON.stringify(result));

        return result;

    }

    /**
     * update the enquiry rate for all the orders
     */
    Enquiry.updateEnquiryRates = async function (refId, ratesData, headerTenantId, headerUserId, headerEmployeeId, headerAppType, cb) {


        var updateData = {
            customerRate: ratesData.customerRate ? ratesData.customerRate : 0,
            customerLoadingRate: ratesData.customerLoadingRate ? ratesData.customerLoadingRate : 0,
            customerUnloadingRate: ratesData.customerUnloadingRate ? ratesData.customerUnloadingRate : 0
        }

        var response = await app.models["enquiries"].updateAll({ referenceId: refId }, updateData).catch(err => { log.error("Error while updating the rates", JSON.stringify(err)); return false });

        if (!response) {
            return responseCode[25008]
        }

        log.info("updated the details  " + JSON.stringify(response));

        //broadcast to rates update

        ssUtil.notifyTenants(headerTenantId, "RATE_UPDATE", { where: { referenceId: refId } })

        return {
            statusCode: 0,
            response: "Submitted Successfully !!"
        }
    }


    //************  supplier rates for enquires  *****************************

    // add supplier rates for given enquiry

    Enquiry.addSupplierRates = async function (enquiryId, supplierRates, headerTenantId, headerUserId, headerEmployeeId, headerAppType, cb) {


        log.info("adding supplier rate request " + enquiryId + JSON.stringify(supplierRates));

        log.info("adding data ", headerTenantId, headerUserId, headerEmployeeId, headerAppType);

        supplierRates.referenceId = enquiryId;
        supplierRates.tenantId = headerTenantId;

        var result = await modelHelper.createNewRecord('supplier-rates', supplierRates).catch(err => { return err });

        log.info("Get by tenant response " + result);

        return result;

    }

    Enquiry.getSupplierRates = async function (enquiryId, headerTenantId, headerUserId, headerEmployeeId, headerAppType, cb) {

        log.info("getting  supplier rate request " + enquiryId);

        log.info("getting supplier data ", headerTenantId, headerUserId, headerEmployeeId, headerAppType);

        var result = await supplierRateService.getSupplierRates(enquiryId).catch(err => { return err });

        log.info("Get by tenant response " + result);

        return result;

    }

    Enquiry.getSupplierRatesById = async function (supplierRateId, headerTenantId, headerUserId, headerEmployeeId, headerAppType, cb) {

        log.info("getting  supplier rate request " + supplierRateId);

        log.info("getting supplier data ", headerTenantId, headerUserId, headerEmployeeId, headerAppType);

        var result = await modelHelper.getEntityById('supplier-rates', headerTenantId, supplierRateId).catch(err => { return err });

        log.info("Get by tenant response " + result);

        return result;

    }

    Enquiry.getSupplierRates = async function (enquiryId, headerTenantId, headerUserId, headerEmployeeId, headerAppType, cb) {

        log.info("getting  supplier rate request " + enquiryId);

        log.info("getting supplier data ", headerTenantId, headerUserId, headerEmployeeId, headerAppType);

        var result = await supplierRateService.getSupplierRates(enquiryId).catch(err => { return err });

        log.info("Get by tenant response " + JSON.stringify(result));

        return result;

    }

    Enquiry.confirmSupplierRates = async function (supplierRateId, headerTenantId, headerUserId, headerEmployeeId, headerAppType, cb) {

        var data = { isConfirmed: true }

        var result = await modelHelper.updateById('supplier-rates', headerTenantId, supplierRateId, data);

        log.info("updated the details  " + JSON.stringify(result));

        return result;
    };


    //***************** order specifific flow for creating enquiries ****************/


    Enquiry.quote = async function (quoteInfo, headerTenantId, headerUserId, headerEmployeeId, headerAppType, cb) {


        log.info("quoting info ", JSON.stringify(quoteInfo));

        quoteInfo.tenantId = headerTenantId;

        if (quoteInfo.isAccepted) {
            var updateInfo = { isConfirmed: true }
            var result = await modelHelper.updateById('supplier-rates', headerTenantId, quoteInfo.supplierRateId, updateInfo).catch(err => {
                log.error("error while updating");
                return false;

            });
            log.info("updated the details  " + JSON.stringify(result));
        }

        var result = null;

        var creatingQuote = null;

        if (quoteInfo.referenceId && quoteInfo.tenantId) { //if this quote is for orders then create a record

            //mark old records as
            var response = await app.models["kb-quotes"].updateAll({ and: [{ referenceId: quoteInfo.referenceId }, { tenantId: quoteInfo.tenantId }] }, { isLatest : false}).catch(err => { log.error("Error while updating the rates", JSON.stringify(err)); return false });

            quoteInfo.id = uuidv1().replace(/-/g, "").toUpperCase();
            creatingQuote = await app.models['kb-quotes'].create(quoteInfo).catch(err => { log.error(" Error while creating record  " + JSON.stringify(err)); return false });
            if (!creatingQuote) {
                return responseCode[25005];
            }

            queueHelper.pustToQueue(creatingQuote); //pushing to kafka for dynamism

            //push to kafka for dyanamism
            log.info("adding quote " + JSON.stringify(creatingQuote));
        }

        //if it is standalone enquiry create booking.
        if (quoteInfo.enquiryType == 'STANDALONE' && quoteInfo.isAccepted) {

            quoteService.createBookingRecord(quoteInfo, headerTenantId, headerUserId, headerEmployeeId, headerAppType);

        }
        return {
            statusCode: 0,
            response: creatingQuote
        }


    }


    //share order to all the kbab vendors

    Enquiry.broadcast = async function (broadcastData, headerTenantId, headerUserId, headerEmployeeId, headerAppType, cb) {


        log.info("broadcast request received ", JSON.stringify(broadcastData))

        broadcastData.enquiryType = "SRC_ORDER"; // enquiry creating from orders

        //get all the tenant id for by moble numbers
        var enqData = Object.assign({}, broadcastData);

        var transformerKey = uuidv1().replace(/-/g, "").toUpperCase();

        var setCacheRes = await cacheUtil.setCache(cache['TRANSFORMER.TENANT.ID'], [transformerKey], JSON.stringify(broadcastData.agentsList));

        log.info("cache res", setCacheRes);

        var agentsTenantList = await app.dataSources.ProfileService.getTenants(transformerKey).catch(err => { return err });

        //delete transformer this key from cache
        cacheUtil.delCache(cache['TRANSFORMER.TENANT.ID'], [transformerKey]);

        log.info("got the tenants list " + JSON.stringify(agentsTenantList));

        if (agentsTenantList.statusCode == 0) {
            for (var i = 0; i < agentsTenantList.response.length; i++) {
                enqData.tenantId = agentsTenantList.response[i];
                var response = await Enquiry.addEnquiry(headerTenantId, headerUserId, headerEmployeeId, headerAppType, enqData).catch(err => { log.error(" Error while creating record  " + JSON.stringify(err)); return false });;
                console.log("response " + JSON.stringify(response))
            };

            //broadcast to tenant
            //get all the records to broadcast
            ssUtil.notifyTenants(headerTenantId, "CREATE", { where: { referenceId: broadcastData.referenceId } })

            log.info("broadcasted to all");

            return {
                statusCode: 0,
                response: "Submitted Successfully !!"
            }

        } else {
            return responseCode[25004]
        }
    }

    // Add the quotes response and confirming the list


};







// 
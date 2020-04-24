var func = module.exports = {};
var log = require('../../server/logger-config.js').log;
var app = require('../../server/server.js');
const curdHelper = require("keebootcrud").keebootCommons;

func.notifyTenants = async function ( headerTenantId, type, listQuery) {

    try {
        //broadcast to tenant
        //get all the records to broadcast
        var allTheRecords = await app.models.enquiries.find(listQuery).catch(err => {
            log.error("error while getting records  ", JSON.stringify(err));
            return false;
        });

        log.info("upating to tenants "+ JSON.stringify(allTheRecords))

        if (allTheRecords) {
            let kakfaRequest = curdHelper.getKafkaMsg(headerTenantId, "ENQUIRY", type, "POST", null, allTheRecords);
            let kafkaResponse = curdHelper.kafkaInfoPush(kakfaRequest);
            log.info("pushing to kafka " + JSON.stringify(kafkaResponse));
        }

        log.info("broadcasted to all");

    } catch (error) {
        log.error("error while broad casting to the tenants");
    }
}
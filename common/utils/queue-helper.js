var func = module.exports = {};
var log = require('../../server/logger-config.js').log;
var app = require('../../server/server.js');
const curdHelper = require("keebootcrud").keebootCommons;

func.pustToQueue = async function (creatingQuote) {

    try {
        //get the tenant id to broad cast
        var enquiry = await app.models.enquiries.find({ where: { and: [{ referenceId: creatingQuote.referenceId }, { tenantId: creatingQuote.tenantId }] } }).catch(err => {
            log.error("error while getting records  ", JSON.stringify(err));
            return false;
        });

        if (enquiry && enquiry.length > 0) {
            //push to kafka for dyanamism, tenant id should be the person who created
            let kakfaRequest = curdHelper.getKafkaMsg(enquiry[0].createdByTenantId, "QUOTES", "CREATE", "POST", null, creatingQuote);
            let kafkaResponse = curdHelper.kafkaInfoPush(kakfaRequest);
            log.info("pushing to kafka " + JSON.stringify(kafkaResponse));
        }

    } catch (error) {
        log.error("error while pushing to kafka ", JSON.stringify(error));
    }

}
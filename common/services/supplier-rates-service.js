var func = module.exports = {};

var modelHelper = require('../dao/model-dao');
//var modelHelper = require('lbmysqlcommon').CommonModelDao;

func.getSupplierRates = async function (enquiryId) {

    var query = { where: { referenceId: enquiryId } }

    return modelHelper.findRecords("supplier-rates", query);

}
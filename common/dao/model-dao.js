
var func = module.exports = {};
const uuidv1 = require('uuid/v1');
var Q = require('q');
var resCodes = require('../constant/response-codes');
var app = require('../../server/server');
const kbcommons = require('kbcommons').Generator;
var log = require('../../server/logger-config.js').log;

/**
 * This is the common model dao which will have the basic curd operaton create, get list by tenant id,
 * update, get entitiy by id.
 * This methods need a model name to perform operations
 */

/**
 * creating new Entity
 */
func.createEntity = async function (modelName, tenantId, data) {

    data.tenantId = tenantId;
    data.id = uuidv1().replace(/-/g, "").toUpperCase();

    var entityDefer = Q.defer();

    var tenantSlNo = await kbcommons.idGenerator(tenantId, modelName).catch(err => { return false })

    if (tenantSlNo) {
        data.tSlNo = tenantSlNo;
        app.models[modelName].create(data, function (err, createRes) {
            if (err) {
                console.log("error while creating record" + JSON.stringify(err));
                entityDefer.reject({
                    statusCode: 102,
                    errorResponse: modelName.toUpperCase() + ' : Error While creating new record' + modelName
                });

            } else {
                console.log("Created response " + JSON.stringify(createRes));
                var response = {
                    statusCode: 0,
                    response: createRes
                }
                entityDefer.resolve(response);
            }
        })
    } else { // generating serial number error
        entityDefer.reject({
            statusCode: 100,
            errorResponse: modelName.toUpperCase() + ' : Error while incrementing tenant serial number'
        });
    }
    return entityDefer.promise;
}

/**
 * Get all the records by tenantId
 *  
 */
func.getByTenantId = function (modelName, tenantId, pageNo, pageSize) {

    var findDefer = Q.defer();

    var query = { where: { tenantId: tenantId } };

    if (pageSize)
        query.limit = pageSize;

    if (pageNo) {
        query.limit = pageSize ? pageSize : 10; // if pagination is there giving 10 per page by default
        query.skip = (pageNo - 1) * query.limit;
    }

    app.models[modelName].find(query, function (err, result) {
        if (err) {
            log.error("error while finding entities by tenant id " + JSON.stringify(err));
            findDefer.reject({
                statusCode: 101,
                errorResponse: modelName.toUpperCase() + ' : Error while gettting tenant list from table'
            })
        } else {
            findDefer.resolve({
                statusCode: 0,
                response: result
            });
        }
    });

    return findDefer.promise;
}

/**
 * 
 */
func.updateById = function (modelName, tenantId, entityId, data) {

    var updateDefer = Q.defer();

    if (entityId) {
        app.models[modelName].updateAll({ and: [{ id: entityId }, { tenantId: tenantId }] }, data, function (err, result) {
            if (err) {
                log.error("error while updating the record " + JSON.stringify(err));
                updateDefer.reject({
                    statusCode: 102,
                    errorResponse: modelName.toUpperCase() + ' : Error while updating the list'
                })
            } else {
                log.info("updated the entity");
                updateDefer.resolve({
                    statusCode: 0,
                    response: "Updated Successfully !!!"
                });
            }
        });
    } else {
        updateDefer.reject({
            statusCode: 108,
            errorResponse: modelName.toUpperCase() + ' : Id not exit' + modelName
        });

    }

    return updateDefer.promise;
}

/**
 * 
 */
func.getEntityById = function (modelName, tenantId, entityId) {

    var getDefer = Q.defer();

    app.models[modelName].findOne({ where: { and: [{ tenantId: tenantId }, { id: entityId }] } }, function (err, result) {

        if (err) {
            log.error(" Error while getting entity by id " + JSON.stringify(err));
            getDefer.reject({
                statusCode: 103,
                errorResponse: modelName.toUpperCase() + ' : Error while getting the entity'
            });
        } else {
            getDefer.resolve({
                statusCode: 0,
                response: result
            })

        }
    });

    return getDefer.promise;

}


func.createNewRecord = async function (modelName, data) {

    data.id = uuidv1().replace(/-/g, "").toUpperCase();

    var entityDefer = Q.defer();

    app.models[modelName].create(data, function (err, createRes) {
        if (err) {
            console.log("error while creating record" + JSON.stringify(err));
            entityDefer.reject({
                statusCode: 105,
                errorResponse: modelName.toUpperCase() + ' : Error While creating new record' + modelName
            });

        } else {
            console.log("Created response " + JSON.stringify(createRes));
            var response = {
                statusCode: 0,
                response: createRes
            }
            entityDefer.resolve(response);
        }
    })

    return entityDefer.promise;

}

func.findRecords = async function (modelName, query) {

    var findDefer = Q.defer();

    app.models[modelName].find(query, function (err, createRes) {
        if (err) {
            console.log("error while querying records" + JSON.stringify(err));
            findDefer.reject({
                statusCode: 106,
                errorResponse: modelName.toUpperCase() + ' : Error While getting records' + modelName
            });

        } else {
            console.log("Getting records response " + JSON.stringify(createRes));
            var response = {
                statusCode: 0,
                response: createRes
            }
            findDefer.resolve(response);
        }
    })

    return findDefer.promise;

}

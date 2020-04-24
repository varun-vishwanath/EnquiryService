// var sql = require('../db/mysql.js');
var logger = require('../../server/logger-config.js');
var info = require('../../server/server.js');
var log = logger.log;
var moment = require('moment');
var Promise = require('bluebird');
var Q = require('q');
var app = module.exports = {};
// var client = require('../config/es_client');


//get required format
// app.createMulRecords = function (data) {
//     var recs = [];
//     for (var i = 0; i < data.hits.hits.length; i++) {
//         var resData = data.hits.hits[i]._source;
//         resData["esId"] = data.hits.hits[i]._id; 
//         recs.push(resData);
//     }
//     return recs;
// }
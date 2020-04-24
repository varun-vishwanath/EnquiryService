var logger = require('../../server/logger-config');
var log = logger.log;
var Q = require('q');
const util = require('collaborator').Utility;
const cache = require('kbcommons-cache').Cache;
const cacheManager = cache.getCacheManager();
var method = module.exports = {};

/**
 * A method to set / create new records in common cache module
 * @param {string} cacheKey 
 * @param {string} keyValue 
 * @param {string} arr
 */
method.setCache = function (cacheKey, keyValue, arr) {
  log.info('common setCache calling now ' + cacheKey, keyValue, JSON.stringify(arr));
  const key = util.stringInject(cacheKey, keyValue);
  log.info(key);
  cacheManager.put(key, arr)
    .then(res => {
      log.info('caching success ' + res + 'for the key ' + key);
    }).catch(err => {
      log.info('caching error' + err);
    });
}
/**
 * A method to get records from common cache module
 * @param {string} cacheKey 
 * @param {string} keyValue 
 */
method.getCache = function (cacheKey, keyValue) {
  var getCachePromise = Q.defer();
  log.info('common getCache calling now ' + cacheKey, keyValue);
  const key = util.stringInject(cacheKey, keyValue);
  log.info(key);
  cacheManager.get(key)
    .then(res => {
      log.info('caching success ' + res + 'for the key ' + key);
      if (res) {
        getCachePromise.resolve(res);
      } else {
        getCachePromise.reject(res);
      }
    }).catch(err => {
      log.info('caching error' + err);
      getCachePromise.reject(err);
    });
  return getCachePromise.promise
}

/**
 * A method to delete records from common cache module
 * @param {string} cacheKey 
 * @param {string} keyValue 
 */
method.delCache = function (cacheKey, keyValue) {
  log.info('common delCache calling now ' + cacheKey, keyValue);
  const key = util.stringInject(cacheKey, keyValue);
  log.info(key);
  return cacheManager.del(key)
    .then(res => {
      log.info('cache remove success ' + res + 'for the key ' + key);
      return res;
    }).catch(err => {
      log.info('caching error' + err);
      return err;
    });
}
/**
 * A method to get multiple records from common cache module
 * @param {string} cacheKey 
 * @param {string} keyValue 
 * @returns {promise} A promise that will resolve once the cache record received.
 */
method.getMultiKeyValue = function (cacheKey, keyValue) {
  var getCachePromise = Q.defer();
  log.info('common getMultiKeyValue calling now ' + cacheKey, keyValue);
  const key = util.stringInject(cacheKey, keyValue);
  log.info(key);
  cacheManager.getKeyValues(key)
    .then(res => {
      log.info('caching success ' + res + 'for the key ' + key);
      if (res) {
        getCachePromise.resolve(res);
      } else {
        getCachePromise.reject(res);
      }
    }).catch(err => {
      log.info('caching error' + err);
      getCachePromise.reject(err);
    });
  return getCachePromise.promise
}
module.exports = {
    "restApiRoot": "/api",
    "host": "0.0.0.0",
    "port": 7576,
    "remoting": {
      "context": false,
      "rest": {
        "handleErrors": false,
        "normalizeHttpPath": false,
        "xml": false
      },
      "json": {
        "strict": false,
        "limit": "100kb"
      },
      "urlencoded": {
        "extended": true,
        "limit": "100kb"
      },
      "cors": false
    },
    "legacyExplorer": false,
    "logoutSessionsOnSensitiveChanges": true,
    "INDEX": "kb_enquiry",
    "INDEX_TYPE": "enquiry_details",
    "ESID_GEN": "ENQ_",
    "elasticsearchIP": "http://ess-int.dev.keeboot.com:19200/",
    "mappingEntity": "enquiryTenant",
    "cacheKey": "ENQUIRY.TENANT.ID",
    "EntitycacheKey": "ENQUIRY.GLOBAL.ID",
    "uniqueId": "enquiryId",
    "entityType": "ENQUIRY",
    "KEYS": ["enquiryNumber","date","customerName","vehicleType","volume","from","to","supplierName","supplierRate","margin","customerRate"],
    "MICRO_KEYS": ["enquiryNumber","date","customerName","vehicleType"]
  
  }
  
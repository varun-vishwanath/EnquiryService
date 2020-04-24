var BOOKING_BASE_URL = "http://services-int.dev.keeboot.com:7577/api";
var PROFILE_BASE_URL = "http://services-int.dev.keeboot.com:3000/api"

module.exports = {
  "Enquiry": {
    "host": "infra-int.dev.keeboot.com",
    "port": 3306,
    "url": "",
    "database": "kb_enquiry",
    "password": "mer@tr@nsport",
    "name": "Enquiry",
    "user": "root",
    "connector": "mysql"
  },

  "BookingService": {
    "name": "booking",
    "connector": "rest",
    "operations": [
      {
        "template": {
          "method": "POST",
          "url": BOOKING_BASE_URL + "/bookings",
          "headers": {
            "x-keeboot-tid": "{tenantId}",
            "x-keeboot-uid": "{uid}",
            "x-keeboot-eid": "{eid}",
            "x-keeboot-apt": "{appType}"
          },
          "body": "{bookingInfo}"
        },
        "functions": {
          "create": [
            "tenantId",
            "uid",
            "eid",
            "appType",
            "bookingInfo"
          ]
        }
      }
    ]
  },
  "ProfileService": {
    "name": "booking",
    "connector": "rest",
    "operations": [
      {
        "template": {
          "method": "GET",
          "url": PROFILE_BASE_URL + "/keeboot-employee/broker-details-by-mobilenumber",
          "query": {
            "id": "{idVal}"
          }
        },
        "functions": {
          "getTenants": [
            "idVal"
          ]
        }
      }
    ]
  }
}
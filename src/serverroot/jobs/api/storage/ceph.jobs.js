var 
    config = require('../../../../../config/config.global.js'),
    rest = require('../../../common/rest.api'),
    util = require('util'),
    qs = require('querystring'),
    async = require('async'),
    jsonPath = require('JSONPath').eval,
    cephServer= require('../../../common/cephServer.api')
    assert = require('assert');


function processCephClusterStatus(pubChannel, saveChannelKey, jobData, done){
    
    url = "/status";
     cephServer.apiGet(url, jobData, function (error, resultJSON) {
            if(!error && (resultJSON)) {
                
                    console.log("getting Data a:", resultJSON);
                     redisPub.publishDataToRedis(pubChannel, saveChannelKey,
                        global.HTTP_STATUS_RESP_OK,
                        JSON.stringify(resultJSON),
                        JSON.stringify(resultJSON),
                        0, 0, done);
            } else {
                  redisPub.publishDataToRedis(pubChannel, saveChannelKey,
                                              global.HTTP_STATUS_INTERNAL_ERROR,
                                        global.STR_CACHE_RETRIEVE_ERROR,
                                        global.STR_CACHE_RETRIEVE_ERROR, 0,
                                        0, done);
            }
        });   
}

exports.processCephClusterStatus = processCephClusterStatus;

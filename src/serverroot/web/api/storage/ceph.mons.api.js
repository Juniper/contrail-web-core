/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

var cacheApi = require('../../core/cache.api'),
    global   = require('../../../common/global'),
    commonUtils = require('../../../utils/common.utils'),
    config = require('../../../../../config/config.global.js'),
    rest = require('../../../common/rest.api'),
    storageServer= require('../../../common/cephServer.api'),
    async = require('async'),
    jsonPath = require('JSONPath').eval,

storageMonsApi = module.exports;


function getStorageMonitorList(req, res, appData){
    url = "/status";
     storageServer.apiGet(url, appData,function (error, resultJSON) {
            if(!error && (resultJSON)) {
                var resultJSON = parseStorageClusterMonitorList(resultJSON);
                commonUtils.handleJSONResponse(null, res, resultJSON);
            } else {
                commonUtils.handleJSONResponse(error, res, null);
            }
        });   
}

function parseStorageClusterMonitorList(resultJSON){
   var emptyObj = {};  
        var monJSON ={};
        var monitor = jsonPath(resultJSON, "$..mons");
        if(monitor.length >2){
            var temp = new Object();
            var status= jsonPath(resultJSON, "$..overall_status");
            temp["overall_status"] = status[0];
            temp["all_mons"]= monitor[0];
            temp["mons_activity"]= monitor[1];
            temp["active_mons"]= monitor[2];
            monJSON['monitor_status']= temp;
            return monJSON;
        }

    return emptyObj;
}


/* List all public functions */
exports.getStorageMonitorList = getStorageMonitorList;





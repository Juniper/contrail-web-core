/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

var cacheApi = require('../../core/cache.api'),
    global   = require('../../../common/global'),
    commonUtils = require('../../../utils/common.utils'),
    config = require('../../../../../config/config.global.js'),
    rest = require('../../../common/rest.api'),
    cephServer= require('../../../common/cephServer.api'),
    async = require('async'),
    jsonPath = require('JSONPath').eval,

cephInfraApi = module.exports;

function getCephClusterStatus(req, res ){
    url = "/status";
    console.log("get data:"+url);
    cacheApi.queueDataFromCacheOrSendRequest(req, res, global.STR_JOB_TYPE_CACHE,
                                             global.STR_CEPH_TYPE_CLUSTER, url,
                                             0, 1, 0, -1, true, null);
}


function getCephHealthSummary(req, res, appData){
    url = "/status";
   cephServer.apiGet(url, appData, function (error, resultJSON) {
        if(!error && (resultJSON)) {
            var resultJSON = parseCephHealthSummaryData(resultJSON);
            commonUtils.handleJSONResponse(null, res, resultJSON);
        } else {
            commonUtils.handleJSONResponse(error, res, null);
        }
    });
   
}

function parseCephHealthSummaryData(healthJSON){
   return healthJSON;
}


function getCephClusterActivity(req, res,appData){
    url = "/status";
     cephServer.apiGet(url, appData,url, function (error, resultJSON) {
            if(!error && (resultJSON)) {
                var resultJSON = parseCephClusterActivityData(resultJSON);
                commonUtils.handleJSONResponse(null, res, resultJSON);
            } else {
                commonUtils.handleJSONResponse(error, res, null);
            }
        });  
}

function parseCephClusterActivityData(activityJSON){
   return activityJSON;
}

function getCephMonitorStatus(req, res, appData){
    url = "/status";
     cephServer.apiGet(url, appData,function (error, resultJSON) {
            if(!error && (resultJSON)) {
                var resultJSON = parseCephClusterMonitorStatus(resultJSON);
                commonUtils.handleJSONResponse(null, res, resultJSON);
            } else {
                commonUtils.handleJSONResponse(error, res, null);
            }
        });   
}

function parseCephClusterMonitorStatus(monJSON){
   return monJSON;
}


function getCephClusterUsageData(req, res, appData){
    url = "/status";
     cephServer.apiGet(url, appData, function (error, resultJSON) {
            if(!error && (resultJSON)) {
                var resultJSON = parseCephClusterUsageData(resultJSON);
                commonUtils.handleJSONResponse(null, res, resultJSON);
            } else {
                commonUtils.handleJSONResponse(error, res, null);
            }
        });  
}

function parseCephClusterUsagaeData(usageJSON){
   return usageJSON;
}

function getCephOSDSummary(req, res, appData){
    url = "/status";
     cephServer.apiGet(url, appData, function (error, resultJSON) {
            if(!error && (resultJSON)) {
                var resultJSON = parseCephOSDData(resultJSON);
                commonUtils.handleJSONResponse(null, res, resultJSON);
            } else {
                commonUtils.handleJSONResponse(error, res, null);
            }
        });     
}

function parseCephOSDData(osdJSON){
   var emptyObj = {};  
    var osdMapJSON ={};
    var osdMap = jsonPath(osdJSON, "$..osdmap");
    if (osdMap.length > 0) {
        osdMapJSON['osdmap']= osdMap[0];
        return osdMapJSON;
    }
    return emptyObj;
}


function getCephPGSummary(req, res, appData){
    url = "/status";
     cephServer.apiGet(url, appData, function (error, resultJSON) {
            if(!error && (resultJSON)) {
                var resultJSON = parseCephPGData(resultJSON);
                commonUtils.handleJSONResponse(null, res, resultJSON);
            } else {
                commonUtils.handleJSONResponse(error, res, null);
            }
        });
}

function parseCephPGData(pgDataJSON){
    var emptyObj = {};  
    var pgMapJSON ={};
    var pgMap = jsonPath(pgDataJSON, "$..pgmap");
    if (pgMap.length > 0) {
        pgMapJSON['pgmap']= pgMap[0];
        return pgMapJSON;
    }
    return emptyObj;
}

function createEmptyPaginatedData ()
{
    var resultJSON = {};
    resultJSON['data'] = {};
    resultJSON['data']['value'] = [];
    resultJSON['more'] = false;
    resultJSON['lastKey'] = null;
    return resultJSON;
}


/* List all public functions */
exports.getCephClusterStatus= getCephClusterStatus;

exports.getCephHealthSummary = getCephHealthSummary;
exports.getCephClusterActivity = getCephClusterActivity;
exports.getCephMonitorStatus = getCephMonitorStatus;
exports.getCephClusterUsageData= getCephClusterUsageData;
exports.getCephOSDSummary=getCephOSDSummary
exports.getCephPGSummary = getCephPGSummary;



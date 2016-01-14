/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var cacheApi = require(process.mainModule.exports["corePath"] + '/src/serverroot/web/core/cache.api'),
    global   = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/global'),
    messages = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/messages'),
    commonUtils = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/common.utils'),
    config = process.mainModule.exports["config"],
    rest = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/rest.api'),
    async = require('async'),
    jsonPath = require('JSONPath').eval,
    opApiServer = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/opServer.api'),
    configApiServer = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/configServer.api'),
    logutils = require(process.mainModule.exports["corePath"] + '/src/serverroot/utils/log.utils'),
//    ctrlGlobal = require('../../../../common/api/global'),
    appErrors = require(process.mainModule.exports["corePath"] + '/src/serverroot/errors/app.errors'),
    assert = require('assert'),
    authApi = require(process.mainModule.exports["corePath"] + '/src/serverroot/common/auth.api'),
    cacheApi = require(process.mainModule.exports["corePath"] + '/src/serverroot/web/core/cache.api');

function getAlarms(req, res, appData)
{
    opApiServer.apiGet('/analytics/alarms', appData, function(err, result) {
        commonUtils.handleJSONResponse(err, res, result);
    });
}

function getAlarmTypes(req, res, appData)
{
    opApiServer.apiGet('/analytics/alarm-types', appData, function(err, result) {
        commonUtils.handleJSONResponse(err, res, result);
    });
}

function getAlarmsAsync(dataObj, callback)
{
    var url = dataObj.reqUrl;
    var appData = dataObj.appData;
    opApiServer.apiGet(url, appData, function(err, alarmDetLst){
        callback(err, alarmDetLst);
    });
}

function ackAlarms(req, res, appData)
{
    var alarms = req.body;
    var alarmsLength = alarms.length;
    var reqUrl = '/analytics/alarms/acknowledge';
    var dataObjArr = [];
    console.log('inside ack');

    for(i = 0; i < alarmsLength; i++) {
        commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_POST,
                                alarms[i], null, null, appData);
    }

    if(dataObjArr.length > 0) {
        async.map(dataObjArr,
            commonUtils.getAPIServerResponse(opApiServer.apiPost, true),
            function(error, results) {
            console.log('got results');
                if (error) {
                   commonUtils.handleJSONResponse(error, res, null);
                   return;
                }
                commonUtils.handleJSONResponse(error, res, results);
            }
        );
    } else {
        commonUtils.handleJSONResponse(error, res, []);
    }
}

exports.getAlarms = getAlarms;
exports.getAlarmTypes = getAlarmTypes;
exports.ackAlarms = ackAlarms;

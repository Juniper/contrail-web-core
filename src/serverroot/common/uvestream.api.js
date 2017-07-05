/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

var async       = require('async');
var sseApi      = require('./sse.api');
var global      = require('./global');
var redisUtils  = require('../utils/redis.utils');
var commonUtils = require('../utils/common.utils');

function updateUVECacheByAppKey (dataObj, callback)
{
    var appKey = dataObj.appKey;
    var uveStreamResp = dataObj.uveStreamResp;
    var uveStreamKey = commonUtils.getValueByJsonPath(uveStreamResp, "key", null);
    var streamType = commonUtils.getValueByJsonPath(uveStreamResp, "type",
                                                    null);
    var streamVal = commonUtils.getValueByJsonPath(uveStreamResp, "value",
                                                   null);
    var idx = uveStreamKey.indexOf(":");
    var uveName = uveStreamKey.substr(0, idx - 1);
    var uveKey = uveStreamKey.substr(idx + 1);
    var addRedisKey = dataObj.addRedisKey;
    var appKeys = dataObj.appKeys;
    var redisKey = dataObj.redisKey;

    redisUtils.getRedisData(appKey, function(error, redisData) {
        if (null == redisData) {
            redisData = {data: []};
        }
        var len = redisData.data.length;
        var found = false;
        for (var i = 0; i < len; i++) {
            var cacheDataName = commonUtils.getValueByJsonPath(redisData.data,
                                                               i + ";name",
                                                               null);
            if (uveKey == cacheDataName) {
                found = true;
                break;
            }
        }
        if (null == streamType) {
            /* Delete */
            if (false == found) {
                /* Weired ??? */
                var err =
                    new appErrors.RESTServerError('Object not found to delete ' +
                                                  'with key as:' +
                                                  uveStreamKey);
                callback(null, {error: err});
            }
            redisData.data.splice(i, 1);
        } else {
            /* Add or Update */
            if (true == found) {
                /* Update */
                if (null == redisData.data[i]['value']) {
                    /* We should not come here */
                    redisData.data[i]['value'] = {};
                    logutils.logger.error("UVE-Stream, we did not find " +
                                          "correct formatted UVE");
                }
                redisData.data[i]['value'][streamType] = streamVal;
            } else {
                /* Add */
                var newData = {name: uveKey};
                newData.value = {};
                newData.value[streamType] = streamVal;
                redisData.data.push(newData);
            }
        }
        redisUtils.setRedisData(appKey, redisData,
                                function(error) {
            if (false == addRedisKey) {
                callback(null, {error: error});
            } else {
                appKeys.push(appKey);
                redisUtils.setRedisData(redisKey, appKeys, function(error) {
                    callback(null, {error: error});
                });
            }
        });
    });
}

function updateUVECacheByUVEStreamResponse (dataObj, done)
{
    var addRedisKey = false;
    var uveStreamResp = dataObj.uveStreamResp;
    var redisAppKey = dataObj.redisAppKey;

    var uveStreamKey = commonUtils.getValueByJsonPath(uveStreamResp, "key", null);
    var streamType = commonUtils.getValueByJsonPath(uveStreamResp, "type",
                                                    null);
    var streamVal = commonUtils.getValueByJsonPath(uveStreamResp, "value",
                                                   null);
    if (null == uveStreamKey) {
        /* key must not be null */
        done(null);
        return;
    }
    if ((null == streamType) || (null == streamVal)) {
        var dataObj = {appKey: dataObj.redisAppKey, uveStreamResp: uveStreamResp,
            addRedisKey: false};
        updateUVECacheByAppKey(dataObj, done);
        return;
    }

    var idx = uveStreamKey.indexOf(":");
    var uveName = uveStreamKey.substr(0, idx - 1);
    var uveKey = uveStreamKey.substr(idx + 1);
    var redisKey = uveStreamKey + ":" + streamType;
    redisUtils.getRedisData(redisKey, function(error, appKeys) {
        if (null == appKeys) {
            appKeys = [];
        }
        var len = appKeys.length;
        var dataObjArr = [];
        for (var i = 0; i < len; i++) {
            if (-1 == appKeys.indexOf(redisAppKey)) {
                addRedisKey = true;
            }
            dataObjArr.push({appKey: appKeys[i], redisKey: redisKey,
                            uveStreamResp: uveStreamResp,
                            addRedisKey: addRedisKey, appKeys: appKeys});
        }
        if (len > 0) {
            async.mapSeries(dataObjArr, updateUVECacheByAppKey,
                            function(error, data) {
                done(null);
            });
        } else {
            if (null != redisAppKey) {
                var dataObj = {appKey: redisAppKey, redisKey: redisKey,
                               uveStreamResp: uveStreamResp,
                               addRedisKey: true, appKeys: appKeys};
                updateUVECacheByAppKey(dataObj, done);
            } else {
                done(null);
            }
        }
    });
}

function updateUVECacheByUVEStream (dataObj, callback)
{
    var req         = dataObj.req;
    var reqUrl      = dataObj.reqUrl;
    var appData     = dataObj.appData;
    var redisAppKey = dataObj.redisAppKey;
    if (null == appData) {
        appData = getAppDataForUVEStreams();
    }

    var subsObj = {reqUrl: reqUrl, appData: appData, redisAppKey: redisAppKey};
    sseApi.subscribeToUVEStream(subsObj, function(data) {
        var dataObj = {uveStreamResp: data, redisAppKey: redisAppKey};
        updateUVECacheByUVEStreamResponse(dataObj, function(error, data) {
            if (null != error) {
                logutils.logger.error("updateUVECacheByUVEStreamResponse() " +
                                      "error: " + error);
                return;
            }
            if (callback) {
                callback();
            }
        });
    });
}

function getAppDataForUVEStreams ()
{
    var appData = {};
    appData.taskData = {};
    appData.taskData.loggedInOrchestrationMode = 'openstack';
    appData.taskData.genBy = global.service.MIDDLEWARE;
    return appData;
}

exports.updateUVECacheByUVEStream = updateUVECacheByUVEStream;
exports.getAppDataForUVEStreams = getAppDataForUVEStreams;


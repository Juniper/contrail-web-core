/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */
var url         = require('url');
var async       = require('async');
var sseApi      = require('./sse.api');
var global      = require('./global');
var threadApi   = require('./threads.api');
var appErrors   = require('../errors/app.errors');
var redisUtils  = require('../utils/redis.utils');
var commonUtils = require('../utils/common.utils');
var eventEmitter = require('events').EventEmitter;
var configApiServer = require('./configServer.api');

var configUVEKey = "ContrailConfig";
var readyQEvent = new eventEmitter();
var pendingUVEStreamData = [];
var sseProcessed = true;

var uveKeyToConfigKeyMap = {
    ObjectVNTable: {
        keyMap: "virtual-network",
        /* configKey: "fq_name",
           valueMapIndex: "all"
         */
    },
    ObjectVMTable: {
        keyMap: "virtual-machine",
    },
    ObjectVMITable: {
        keyMap: "virtual-machine-interface",
    },
    ObjectSITable: {
        keyMap: "service-instance"
    },
    ObjectVRouter: {
        keyMap: "virtual-router",
        valueMapIndex: 1,
    },
    ObjectCollectorInfo: {
        keyMap: "analytics-node",
        valueMapIndex: 1,
    },
    ObjectDatabaseInfo: {
        keyMap: "database-node",
        valueMapIndex: 1,
    },
    ObjectConfigNode: {
        keyMap: "config-node",
        valueMapIndex: 1,
    },
    ServiceChain: {
        keyMap: "service-chain",
    },
    ObjectPRouter: {
        keyMap: "physical-router",
        valueMapIndex: 1
    },
    ObjectBgpRouter: {
        keyMap: "bgp-router",
        valueMapIndex: 1
    }
};

function getConfigKeyByUVEStreamKey (streamKey)
{
    return uveKeyToConfigKeyMap[streamKey];
}

function convertUVEStreamToUIData (uveStreamData)
{
    if ((null == uveStreamData) || ("null" == uveStreamData)) {
        return null;
    }
    var finalData = {data: []};
    var uveStreamKey = commonUtils.getValueByJsonPath(uveStreamData, "key",
                                                      null);
    if (null == uveStreamKey) {
        return null;
    }
    var streamType = commonUtils.getValueByJsonPath(uveStreamData, "type",
                                                    null);
    var streamVal = commonUtils.getValueByJsonPath(uveStreamData, "value",
                                                   null);
    var idx = uveStreamKey.indexOf(":");
    var uveKey = uveStreamKey.substr(idx + 1);
    var uve = {}
    if (null != streamType) {
        uve[streamType] = streamVal;
    }
    finalData.data.push({name: uveKey, value: uve});
    return finalData;
}

function updateUVECacheByAppKey (dataObj, callback)
{
    var doFetchConfig = true;
    var redisAppKey = dataObj.redisAppKey;
    var uveStreamResp = dataObj.uveStreamResp;
    var uveStreamKey = commonUtils.getValueByJsonPath(uveStreamResp, "key", null);
    var streamType = commonUtils.getValueByJsonPath(uveStreamResp, "type",
                                                    null);
    var streamVal = commonUtils.getValueByJsonPath(uveStreamResp, "value",
                                                   null);
    var idx = uveStreamKey.indexOf(":");
    var uveName = uveStreamKey.substr(0, idx);
    var uveKey = uveStreamKey.substr(idx + 1);
    var doAddRedisKey = dataObj.doAddRedisKey;
    var appKeys = dataObj.appKeys;
    var redisKey = dataObj.redisKey;
    var redisDataIdx = -1;

    redisUtils.getRedisData(redisAppKey, function(error, redisData) {
        if (null == redisData) {
            redisData = {data: []};
        }
        var len = redisData.data.length;
        var found = false;
        for (var i = 0; i < len; i++) {
            redisDataIdx = i;
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
            /* We may have ContrailConfig in the UVE, due to some reason Config
             * still exists, but UVE Delete notification we got
             */
            var configUVEKeyFound = false;
            var uveData =
                commonUtils.getValueByJsonPath(redisData, "data;" + i +
                                               ";value", null);
                                                         i
            for (key in uveData) {
                if (configUVEKey == key) {
                    configUVEKeyFound = true;
                    continue;
                }
                delete redisData.data[i]["value"][key];
            }
            if (false == configUVEKeyFound) {
                /* We did not find ContrailConfig, so delete the array element
                 * having no object inside in it
                 */
                redisData.data.splice(i, 1);
            }
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
                if (configUVEKey == streamType) {
                    /* Config change */
                } else {
                    doFetchConfig = false;
                }
            } else {
                /* Add */
                redisDataIdx = len;
                var newData = {name: uveKey};
                newData.value = {};
                newData.value[streamType] = streamVal;
                redisData.data.push(newData);
            }
        }
        redisKey = (false == doAddRedisKey) ? null : redisKey;
        if (null == appKeys) {
            appKeys = [];
        }
        appKeys.push(redisAppKey);
        /* Now in Add/Del case, get the corresponding entry from API Server */
        var configKeyObj = getConfigKeyByUVEStreamKey(uveName);
        if ((null == configKeyObj) || (false == doFetchConfig)) {
            setRedisAppKeys(appKeys, redisKey, redisData, function(error, data) {
                callback(error, data);
            });
        } else {
            getConfigAndUpdateRedisKeys(appKeys, redisKey, configKeyObj, redisData,
                                        uveKey, dataObj.appData, redisDataIdx,
                                        function(error, data) {
                callback(error, data);
            });
        }
    });
}

function purgeConfigDataFromRedisData (redisData, redisDataIdx)
{
    var contrailConfig =
        commonUtils.getValueByJsonPath(redisData, "data;" + redisDataIdx +
                                       ";value;" + configUVEKey, null);
    if (null == contrailConfig) {
        return;
    }
    delete redisData.data[redisDataIdx].value[configUVEKey];
}

function getConfigAndUpdateRedisKeys (appKeys, redisKey, configKeyObj,
                                      redisData, uveKey, appData, redisDataIdx,
                                      callback)
{
    var configKey = configKeyObj.keyMap;
    var configURL = "/" + configKey + "s";
    var keyToCmp = commonUtils.getValueByJsonPath(configKeyObj, 'configKey',
                                                  "fq_name");
    var valueMapIndex = commonUtils.getValueByJsonPath(configKeyObj,
                                                       "valueMapIndex",
                                                       "all");
    configApiServer.apiGet(configURL, appData, function(error, configList) {
        var configList =
            commonUtils.getValueByJsonPath(configList,
                                           configKey + "s",
                                           []);
        if ((null != error) || (!configList.length)) {
            purgeConfigDataFromRedisData(redisData, redisDataIdx);
            setRedisAppKeys(appKeys, redisKey, redisData,
                            function(error, data) {
                callback(error, data);
            });
            return;
        }
        var len = configList.length;
        for (var i = 0; i < len; i++) {
            var cfgKeyVal =
                commonUtils.getValueByJsonPath(configList[i], keyToCmp, null);
            if (null == cfgKeyVal) {
                logutils.logger.error("Did not get cfgKeyVal for key " +
                                      keyToCmp + " in config");
                continue;
            }
            if ("all" == valueMapIndex) {
                cfgKeyVal = cfgKeyVal.join(":");
            } else if ("number" == typeof valueMapIndex) {
                cfgKeyVal = cfgKeyVal[valueMapIndex];
            } else if (valueMapIndex instanceof Array) {
                var idxLen = valueMapIndex.length;
                var cfgKey = "";
                var cfgVal = "";
                for (var i = 0; i < idxLen; i++) {
                    cfgVal = cfgKeyVal[valueMapIndex[i]];
                    if (i < idxLen - 1) {
                        cfgVal += ":";
                    }
                }
                cfgKeyVal = cfgVal;
            }
            if (cfgKeyVal == uveKey) {
                break;
            }
        }
        if (i == len) {
            /* Did not find in Api Server */
            purgeConfigDataFromRedisData(redisData, redisDataIdx);
            setRedisAppKeys(appKeys, redisKey, redisData,
                            function(error, data) {
                callback(error, data);
            });
            return;
        }
        var uuid = configList[i]["uuid"];
        var configReqUrl = "/" + configKey + "/" + uuid;
        configApiServer.apiGet(configReqUrl, appData,
                               function(error, configData) {
            if ((null != error) || (null == configData)) {
                purgeConfigDataFromRedisData(redisData, redisDataIdx);
            }
            redisData.data[redisDataIdx].value.ConfigData = configData;
            setRedisAppKeys(appKeys, redisKey, redisData,
                            function(error, data) {
                callback(error, data);
            });
        });
    });
}

function setRedisAppKeys (appKeys, redisKey, redisData, callback)
{
    var redisAppKey = appKeys[appKeys.length - 1];
    redisUtils.setRedisData(redisAppKey, redisData, function(error) {
        if (null == redisKey) {
            callback(null, {error: error});
        } else {
            redisUtils.setRedisData(redisKey, appKeys, function(error) {
                callback(null, {error: error});
            });
        }
    });
}

function updateUVECacheByUVEStreamResponse (dataObj, done)
{
    var doAddRedisKey = false;
    var uveStreamResp = dataObj.uveStreamResp;
    var redisAppKey = dataObj.redisAppKey;
    var appData = dataObj.appData;

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
        var dataObj = _.extend({}, dataObj, {doAddRedisKey: false});
        updateUVECacheByAppKey(dataObj, done);
        return;
    }

    /*
    var idx = uveStreamKey.indexOf(":");
    var uveKey = uveStreamKey.substr(idx + 1);
    */
    var redisKey = uveStreamKey + ":" + streamType;
    redisUtils.getRedisData(redisKey, function(error, appKeys) {
        if (null == appKeys) {
            appKeys = [];
        }
        var len = appKeys.length;
        var dataObjArr = [];
        for (var i = 0; i < len; i++) {
            if (-1 == appKeys.indexOf(redisAppKey)) {
                doAddRedisKey = true;
                dataObjArr.push({redisAppKey: redisAppKey, redisKey: redisKey,
                                uveStreamResp: uveStreamResp,
                                doAddRedisKey: doAddRedisKey, appKeys: appKeys,
                                appData: appData});
            }
            dataObjArr.push({redisAppKey: appKeys[i], redisKey: redisKey,
                            uveStreamResp: uveStreamResp,
                            doAddRedisKey: doAddRedisKey, appKeys: appKeys,
                            appData: appData});
        }
        if (len > 0) {
            async.mapSeries(dataObjArr, updateUVECacheByAppKey,
                            function(error, data) {
                done(null);
            });
        } else {
            if (null != redisAppKey) {
                var dataObj = {redisAppKey: redisAppKey, redisKey: redisKey,
                               uveStreamResp: uveStreamResp,
                               doAddRedisKey: true, appKeys: appKeys,
                               appData: appData};
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
    if (null == redisAppKey) {
        /* Build Redis Key from reqUrl */
        redisAppKey = getRedisAppKeyBySSEReqUrl(reqUrl);
    }
    registerSSEDataEventHandler();
    var subsObj = {reqUrl: reqUrl, appData: appData, redisAppKey: redisAppKey};
    sseApi.subscribeToUVEStream(subsObj, function(data) {
        if ((null != data) && ('null' != data)) {
            var dataObj = {uveStreamResp: data, redisAppKey: redisAppKey,
                           appData: appData};
            dataObj.doneCallback = callback;
            insertUVEStreamDataToPendingQ(dataObj);
            readyQEvent.emit('sseProcessStart');
        }
    });
}

function checkReadyQAndStartProcessSSEData ()
{
    if (pendingUVEStreamData.length > 0) {
        var dataObj = pendingUVEStreamData.splice(0, 1);
        startProcessUVEStartData(dataObj[0]);
    }
}

function registerSSEDataEventHandler ()
{
    readyQEvent.on('sseProcessDone', function() {
        sseProcessed = true;
        checkReadyQAndStartProcessSSEData();
    });
    readyQEvent.on('sseProcessStart', function() {
        if (true == sseProcessed) {
            checkReadyQAndStartProcessSSEData();
        }
    });
}

function insertUVEStreamDataToPendingQ (streamDataObj)
{
    pendingUVEStreamData.push(streamDataObj);
}

function startProcessUVEStartData (dataObj)
{
    sseProcessed = false;
    updateUVECacheByUVEStreamResponse(dataObj, function(error, data) {
        if (null != error) {
            logutils.logger.error("updateUVECacheByUVEStreamResponse() " +
                                  "error: " + error);
            return;
        }
        if (dataObj.doneCallback) {
            doneObj.doneCallback();
        }
        readyQEvent.emit('sseProcessDone');
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

function getRedisAppKeyBySSEReqUrl (reqUrl)
{
    var reqParams = url.parse(reqUrl, true);
    var cfilt = commonUtils.getValueByJsonPath(reqParams, "query;cfilt", null);
    var tablefilt = commonUtils.getValueByJsonPath(reqParams, "query;tablefilt",
                                                   null);
    if ((null == cfilt) && (null == tablefilt)) {
        logutils.logger.error("Specify cfilt/tablefilt in UVE-Stream Url:" +
                              reqUrl);
        return null;
    }
    var cfiltArr = [];
    if (null != cfilt) {
        cfiltArr = cfilt.split(",");
    }
    cfiltArr.sort();
    var redisAppKey = global.STR_UVE_STREAM;
    if (null != tablefilt) {
        redisAppKey += ":TAB:" + tablefilt + ":TAB";
        if (!cfiltArr.length) {
            redisAppKey += ":";
        }
    }
    if (cfiltArr.length > 0) {
        redisAppKey += ":CFILT:" + cfiltArr.join(":") + ":CFILT:";
    }
    return redisAppKey;
}

function findIfCfiltMatches (reqCfiltArr, redisCfiltArr)
{
    if (reqCfiltArr.length > 0) {
        if (!redisCfiltArr.length) {
            /* No cfilt in redis key */
            return true;
        }
        var found = (reqCfiltArr.length ===
                     _.intersection(reqCfiltArr, redisCfiltArr).length);
        if (found) {
            return true;
        }
    } else if (!redisCfiltArr.length) {
        return true;
    }
    return false;
}

function getRedisKeyValueBySSEReqUrl (redisKeys, reqUrl, redisClient, callback)
{
    var found = false;
    if ((null == redisKeys) || (!redisKeys.length) || (null == reqUrl)) {
        callback(found, null);
        return;
    }
    var reqParams = url.parse(reqUrl, true);
    var cfilt = commonUtils.getValueByJsonPath(reqParams, "query;cfilt", "");
    var tablefilt = commonUtils.getValueByJsonPath(reqParams, "query;tablefilt",
                                                   null);
    var cfiltArr = cfilt.split(",");
    var keysLen = redisKeys.length;
    for (var i = 0; i < keysLen; i++) {
        var redisKey = redisKeys[i];
        var tabSplitArr = redisKey.split(":TAB:");
        var redisTabFilt = null;
        if (tabSplitArr.length > 1) {
            redisTabFilt = tabSplitArr[1];
        }
        var cfiltSplitArr = redisKey.split(":CFILT:");
        if (cfiltSplitArr.length > 1) {
            cfiltSplitArr = cfiltSplitArr[1].split(":");
        }
        if (null != tablefilt) {
            if (null == redisTabFilt) {
                continue;
            }
            if (redisTabFilt != tablefilt) {
                continue;
            }
            var cfiltFound = findIfCfiltMatches(cfiltArr, cfiltSplitArr);
            if (true == cfiltFound) {
                found = true;
                break;
            }
        }
        if (cfiltArr.length > 0) {
            var cfiltFound = findIfCfiltMatches(cfiltArr, cfiltSplitArr);
            if (true == cfiltFound) {
                found = true;
                break;
            }
        }
    }
    if (false == found) {
        callback(found, null);
        return;
    }
    redisClient.get(redisKey, function(error, data) {
        if ((null != error) || (null == data)) {
            callback(found, null);
            return;
        }
        data = JSON.parse(data);
        if (!cfiltArr.length) {
            callback(found, data);
            return;
        }
        var parsedData = filterRedisDataByCfilt(data, cfiltArr);
        callback(found, parsedData);
    });
}

function filterRedisDataByCfilt (redisData, cfiltArr)
{
    var newData = commonUtils.getValueByJsonPath(redisData, "data", []);
    var cnt = newData.length;
    for (var i = 0; i < cnt; i++) {
        var val = newData[i].value;
        for (var key in val) {
            if (-1 == cfiltArr.indexOf(key)) {
                delete redisData.data[i].value[key];
            }
        }
    }
    return redisData;
}

exports.updateUVECacheByUVEStream = updateUVECacheByUVEStream;
exports.getAppDataForUVEStreams = getAppDataForUVEStreams;
exports.getRedisAppKeyBySSEReqUrl = getRedisAppKeyBySSEReqUrl;
exports.getAppDataForUVEStreams = getAppDataForUVEStreams;
exports.convertUVEStreamToUIData = convertUVEStreamToUIData;
exports.getRedisKeyValueBySSEReqUrl = getRedisKeyValueBySSEReqUrl;


/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var crypto = require('crypto');
var opApiServer = require('./opServer.api');
var eventEmitter = require('events').EventEmitter;
var redisUtils = require('../utils/redis.utils');
var global = require('./global');
var config = process.mainModule.exports.config;
var logutils = require('../utils/log.utils');
var commonUtils = require('../utils/common.utils');

var uveStreamEvent = new eventEmitter();
var uveStreamRequests = [];
var redisClient = null;
var STR_UVE_STREAM = 'uveStream';
var uveStreamRunTimers = {};
var uveStreamTimerTimeout = 1 * 60 * 1000; /* 1 Minutes */
var md5HeaderStr = "uve-stream-req-md5";
var redisKeyHeaderStr = "uve-stream-req-redis-app-key";

function serverSentEventHandler (streamData, response)
{
    var md5Val = response.req._headers[md5HeaderStr];
    uveStreamEvent.emit(md5Val, streamData, response);
}

function createMD5HashByReqUrl (reqUrl)
{
    var md5Input = reqUrl;
    var md5Val = crypto.createHash('md5').update(md5Input).digest('hex');
    return md5Val;
}

function subscribeToUVEStream (subsObj, callback)
{
    var reqUrl      = subsObj.reqUrl;
    var appData     = subsObj.appData;
    var redisAppKey = subsObj.redisAppKey;

    if (null == redisClient) {
        redisClient = redisUtils.createRedisClient();
    }
    var md5Val = createMD5HashByReqUrl(reqUrl);
    if (null == uveStreamRequests[md5Val]) {
        uveStreamRequests[md5Val] = [];
    }
    uveStreamRequests[md5Val].push(callback);
    uveStreamEvent.on(md5Val, function(data, response) {
        if ((null != uveStreamRequests[md5Val]) &&
            (uveStreamRequests[md5Val].length > 0)) {
            var cbCnt = uveStreamRequests[md5Val].length;
            for (var i = 0; i < cbCnt; i++) {
                uveStreamRequests[md5Val][i](data);
            }
        }
        redisClient.set(STR_UVE_STREAM + ':' + md5Val, JSON.stringify(data),
                        function(error) {
            if (null != error) {
                logutils.logger.error('Redis Get failed for ' +
                                      STR_UVE_STREAM + ' key:' + error);
           }
        });
        return;
    });
    if (uveStreamRequests[md5Val].length > 1) {
        logutils.logger.debug('Already issued same uve-stream with md5:' +
                              md5Val);
        redisClient.get(STR_UVE_STREAM + ':' + md5Val, function(error, data) {
            callback(JSON.parse(data));
        });
        return;
    }
    var headers = {'uve-stream-req-md5': md5Val,
        'uve-stream-req-redis-app-key': redisAppKey};
    opApiServer.apiGet(reqUrl, appData, function(error, data) {
        if ((null != error) || (null == data)) {
            console.log("Getting error as:", error);
            resetSSEEventListenersByAppKey({reqUrl: reqUrl, redisAppKey:
                                           redisAppKey});
        }
        return;
    }, headers);
}

function resetSSEEventListeners (httpMsg)
{
    var path = httpMsg.path;
    var headers = httpMsg._headers;
    var redisAppKey = headers[redisKeyHeaderStr];
    var dataObj = {reqUrl: path, redisAppKey: redisAppKey};
    resetSSEEventListenersByAppKey(dataObj);
}

function resetSSEEventListenersByAppKey (dataObj)
{
    uveStreamRequests = [];
    var md5Val = createMD5HashByReqUrl(dataObj.reqUrl);
    if (null != uveStreamRunTimers[md5Val]) {
        clearTimeout(uveStreamRunTimers[md5Val]);
    }
    uveStreamRunTimers[md5Val] = setTimeout(function() {
        var uveStreamApi = require("./uvestream.api");
        uveStreamApi.updateUVECacheByUVEStream(dataObj);
        clearTimeout(uveStreamRunTimers[md5Val]);
    }, uveStreamTimerTimeout);
}

function checkAndResetSSEEventListeners (reqParams)
{
    var uveStreamURLPrefix = "/analytics/uve-stream";
    var reqUrl = reqParams.path;
    var idx = reqUrl.indexOf(uveStreamURLPrefix);
    if (0 != idx) {
        return;
    }
    var redisAppKey =
        commonUtils.getValueByJsonPath(reqParams,
                                       "headers;" + redisKeyHeaderStr,
                                       null);
    if (null == redisAppKey) {
        return;
    }
    uveStreamRequests = [];
    var dataObj = {reqUrl: reqUrl, redisAppKey: redisAppKey};
    resetSSEEventListenersByAppKey(dataObj);
}

exports.serverSentEventHandler = serverSentEventHandler;
exports.subscribeToUVEStream = subscribeToUVEStream;
exports.resetSSEEventListeners = resetSSEEventListeners;
exports.checkAndResetSSEEventListeners = checkAndResetSSEEventListeners;

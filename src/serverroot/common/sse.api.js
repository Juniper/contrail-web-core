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

var uveStreamEvent = new eventEmitter();
var uveStreamRequests = [];
var redisClient = null;
var STR_UVE_STREAM = 'uveStream';


function serverSentEventHandler (streamData, response)
{
    var md5Val = response.req._headers['uve-stream-req-md5'];
    uveStreamEvent.emit(md5Val, streamData, response);
}

function createMD5HashByReqUrl (reqUrl, postData)
{
    var md5Input = reqUrl;
    if (null != postData) {
        md5Input += JSON.stringify(postData);
    }
    var md5Val = crypto.createHash('md5').update(md5Input).digest('hex');
    return md5Val;
}

function subscribeToUVEStream (req, reqUrl, postData, appData, callback)
{
    req.socket.setTimeout(Infinity);
    if (null == redisClient) {
        redisClient = redisUtils.createRedisClient();
    }
    var md5Val = createMD5HashByReqUrl(reqUrl, postData);
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
    var headers = {'uve-stream-req-md5': md5Val};
    opApiServer.apiGet(reqUrl, appData, function(error, data) {
        return;
    }, headers);
}

exports.serverSentEventHandler = serverSentEventHandler;
exports.subscribeToUVEStream = subscribeToUVEStream;


/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var redis = require("redis");
var logutils = require('./log.utils');
var config = process.mainModule.exports.config;

function createDefRedisClientAndWait (callback)
{
    var server_port = (config.redis_server_port) ?
        config.redis_server_port : global.DFLT_REDIS_SERVER_PORT;
    var server_ip = (config.redis_server_ip) ?
        config.redis_server_ip : global.DFLT_REDIS_SERVER_IP;
    createRedisClientAndWait(server_port, server_ip, global.WEBUI_DFLT_REDIS_DB,
                             function(redisClient) {
        callback(redisClient);
    });
}

function createRedisClientAndWait (port, ip, uiDB, callback)
{
    var options = {};
    var redisClient = redis.createClient(port, ip);
    redisClient.retry_backoff = 1;
    redisClient.retry_delay = 30 * 1000; //30 Seconds
    redisClient.on('connect', selectRedisDB(uiDB, redisClient, callback));
    redisClient.on('ready', redisLog('ready'));
    redisClient.on('reconnecting', redisLog('reconnecting'));
    redisClient.on('error', redisLog('error'));
    redisClient.on('end', redisLog('end'));
}

function createRedisClient (port, ip, uiDB)
{
    var doNotSelect = false;
    if (-1 == port) {
        doNotSelect = true;
        port = null;
    }
    port = (null != port) ? port :
        ((config.redis_server_port) ? config.redis_server_port :
         global.DFLT_REDIS_SERVER_PORT);
    ip = (null != ip) ? ip :
        ((config.redis_server_ip) ? config.redis_server_ip :
         global.DFLT_REDIS_SERVER_IP);
    uiDB = (null != uiDB) ? uiDB : global.WEBUI_DFLT_REDIS_DB;
    var redisClient = redis.createClient(port, ip);
    redisClient.retry_backoff = 1;
    redisClient.retry_delay = 30 * 1000; //30 Seconds
    if (false == doNotSelect) {
        redisClient.select(uiDB);
    }
    redisClient.on('error', redisLog('error'));
    redisClient.on('connect', redisLog('connect'));
    redisClient.on('ready', redisLog('ready'));//selectRedisDB(uiDB, redisClient, callback));
    redisClient.on('reconnecting', redisLog('reconnecting'));
    return redisClient;
}

function selectRedisDB (uiDB, redisClient, callback)
{
    return function() {
        if ((null == redisClient) || (true == redisClient.pub_sub_mode)) {
            callback(redisClient);
        } else {
            redisClient.select(uiDB, function(err, res) {
                if (err) {
                    logutils.logger.error('Redis DB ' + uiDB + ' SELECT error:' + err);
                } else {
                    logutils.logger.debug('Redis DB ' + uiDB + ' SELECT suuccess:');
                }
                callback(redisClient);
            });
        }
    }
}

function redisLog(type)
{
    return function() {
        switch(type) {
        case 'error':
            process.redisErrored = true;
            for (key in arguments) {
                var dispStr = arguments[key];
                /* Display first one */
                break;
            }
            if (global.service.MIDDLEWARE == process.mainModule.exports.myIdentity) {
                process.kueReinitReqd = true;
            }
            logutils.logger.error('Redis: ' + type + ' String: ' + dispStr);
            break;
        case 'connect':
            if ((global.service.MIDDLEWARE ===
                 process.mainModule.exports.myIdentity) &&
                (true == process.redisErrored) &&
                (true == process.connected)) {
                process.send({cmd: global.MSG_CMD_KILLALL});
                process.redisErrored = false;
            }
        default:
            logutils.logger.debug('Redis: ' + type);
            break;
        }
    }
}

function subscribeToRedisEvents (redisClient)
{
    redisClient.on('error', redisLog('error'));
}

function redisSetAndPostProcess (key, postRedisLookupCallback, req,
                                 appData, callback)
{
    postRedisLookupCallback(req, appData, function(err, data) {
        if ((null == err) && (null != data)) {
            process.mainModule.exports.redisClient.set(key, JSON.stringify(data),
                                                       function(setErr) {
                callback(err, data);
            });
        } else {
            callback(err, data);
        }
    });
}

function checkAndGetRedisDataByKey (key, postRedisLookupCallback, req,
                                    appData, callback)
{
    var forceRefresh = req.param('forceRefresh');
    if (null != forceRefresh) {
        redisSetAndPostProcess(key, postRedisLookupCallback, req, appData,
                               callback);
        return;
    }
    process.mainModule.exports.redisClient.get(key, function(err, value) {
        if ((null != err) || (null == value)) {
            redisSetAndPostProcess(key, postRedisLookupCallback, req, appData,
                                   callback);
            return;
        }
        callback(err, JSON.parse(value));
    });
}

function getRedisData (key, callback) {
    process.mainModule.exports.redisClient.get(key, function(err, value) {
        if ((null != err) || (null == value)) {
            callback(err, null);
            return;
        }
        callback(err, JSON.parse(value));
    });
}

function setRedisData (key, value, callback) {
    var data = JSON.stringify(value);
    process.mainModule.exports.redisClient.set(key, data, function(error) {
        if (callback) {
            callback(error);
        }
    });
}

function setexRedisData (key, expiry, value, callback) {
    process.mainModule.exports.redisClient.setex(key, expiry, JSON.stringify(value),
                                                 function(error) {
        if (callback) {
            callback(error);
        }
    });
}

exports.createRedisClient = createRedisClient;
exports.redisLog = redisLog;
exports.createRedisClientAndWait = createRedisClientAndWait;
exports.createDefRedisClientAndWait = createDefRedisClientAndWait;
exports.checkAndGetRedisDataByKey = checkAndGetRedisDataByKey;
exports.subscribeToRedisEvents = subscribeToRedisEvents;
exports.getRedisData = getRedisData;
exports.setRedisData = setRedisData;
exports.setexRedisData = setexRedisData;

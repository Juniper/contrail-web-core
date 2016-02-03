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
    var redisClient = redis.createClient(port, ip);
    redisClient.retry_backoff = 1;
    redisClient.retry_delay = 30 * 1000; //30 Seconds
    redisClient.on('connect', redisLog('connect'));
    redisClient.on('ready', selectRedisDB(uiDB, redisClient, callback));
    redisClient.on('reconnecting', redisLog('reconnecting'));
    redisClient.on('error', redisLog('error'));
    redisClient.on('end', redisLog('end'));
}

function selectRedisDB (uiDB, redisClient, callback)
{
    return function() {
        redisClient.select(uiDB, function(err, res) {
            if (err) {
                logutils.logger.error('Redis DB ' + uiDB + ' SELECT error:' + err);
            } else {
                logutils.logger.debug('Redis DB ' + uiDB + ' SELECT suuccess:');
                callback(redisClient);
            }
        });
    }
}

function redisLog(type) {
    return function() {
        if ('error' == type) {
            for (key in arguments) {
                var dispStr = arguments[key];
                /* Display first one */
                break;
            }
            logutils.logger.error('Redis: ' + type + ' String: ' + dispStr);
        } else {
            logutils.logger.debug('Redis: ' + type);
        }
    }
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

exports.createRedisClientAndWait = createRedisClientAndWait;
exports.createDefRedisClientAndWait = createDefRedisClientAndWait;
exports.checkAndGetRedisDataByKey = checkAndGetRedisDataByKey;


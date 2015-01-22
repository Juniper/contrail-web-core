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
        logutils.logger.debug("Redis: " + type, arguments);
    }
}

exports.createRedisClientAndWait = createRedisClientAndWait;
exports.createDefRedisClientAndWait = createDefRedisClientAndWait;


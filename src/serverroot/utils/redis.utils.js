/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var redis = require("redis");
var logutils = require('./log.utils');

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


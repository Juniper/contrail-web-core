/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

redisSub = module.exports;

var redis = require('redis')
  , cacheApi = require('./cache.api')
  , config = require('../../../../config/config.global.js')
  , logutils = require('../../utils/log.utils')
  , util = require('util')
  , UUID = require('uuid-js')
  , messages = require('../../common/messages')
  , longPolling = require('./longPolling.api')
  , commonUtils = require('../../utils/common.utils')
  ;

if (!module.parent) {
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
                                  module.filename));
  process.exit(1);
}

commonUtils.createRedisClient(function(client) {
    redisSub.redisSubClient = client;
    redisSub.addRedisSubMsgListener(redisSub.redisSubClient);
    redisSub.subsToRedis(global.MSG_REDIRECT_TO_LOGOUT);
});

commonUtils.createRedisClient(0, function(client) {
    redisSub.redisPerClient = client;
});

/* Function: subsToRedis
    This function is used to subscribe to a apecific channel to redis
 */
redisSub.subsToRedis = function(channel) {
  logutils.logger.info("Redis subs done for channel:" + channel);
  redisSub.redisSubClient.subscribe(channel);
}

/* Function: unsubsToRedis
    This function is used to unsubscribe a channel from redis
 */
redisSub.unsubsToRedis = function(channel) {
  redisSub.redisSubClient.unsubscribe(channel);
}

/* Function: createChannelByHashURL
    This function is used to create a channel by hash and URL.
    Whenever a client wants to subscribe to a channel, this API needs to be
    used, using unique hash, hash may be any string 
 */
redisSub.createChannelByHashURL = function(hash, url) {
  var channel = 'q:' + hash + global.ZWQ_MSG_SEPERATOR + url;
  return channel;
}

/* Function: createChannelByReqData
    This function is used to create a channel from the reqData.
    This channel is used for subscribing to redis for a specific client.
    reqData must be taken by using cacheApi.createReqData() API
 */
redisSub.createChannelByReqData = function(reqData, hash) {
  var reqJSON = JSON.parse(reqData);
  var channel = reqJSON.data.jobCreateReqTime + global.ZWQ_MSG_SEPERATOR
    + hash + global.ZWQ_MSG_SEPERATOR + reqJSON.data.url;
  logutils.logger.info("Creating listening channel as:" + channel);
  return channel;
}

/** @Function: createPubChannelKey
  *  This function is used to create publish channel key against which Job Server
  *  publishes data in Redis
  *  The publish key is UUID.
  * @public function
  */
function createPubChannelKey ()
{
    /* Version 4 */
    var pubKey = UUID.create();
    return pubKey.toString();
}

function processRedisSubMessage (channel, msg)
{
    switch (channel) {
    case global.MSG_REDIRECT_TO_LOGOUT:
        longPolling.redirectToLogoutByChannel(msg);
        break;

    default:
        cacheApi.sendResponseByChannel(channel, msg);
        redisSub.unsubsToRedis(channel);
        break;
    }
}

/* Function: addRedisSubMsgListener
    This function is used to add listener for messages published by redis to
    this client
 */
redisSub.addRedisSubMsgListener = function(redisClient) {
  redisClient.on('message', function(channel, msg) {
    logutils.logger.debug("We got the channel:" + channel + "by process:" +
                          process.pid);
    /* Based on the channel, now search the request/response context from 
       redis and send response and check if we got timed out or not
     */
    /* Process MSG by channel */
    processRedisSubMessage(channel, msg);
  });
}

exports.createPubChannelKey = createPubChannelKey;

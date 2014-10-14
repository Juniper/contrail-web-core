/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

redisSub = module.exports;

var redis = require('redis')
  , cacheApi = require('./cache.api')
  , config = require('../../../../config/config.global.js')
  , logutils = require('../../utils/log.utils')
  , util = require('util')
  , global = require('../../common/global')
  , UUID = require('uuid-js')
  , messages = require('../../common/messages')
  , longPolling = require('./longPolling.api')
  , commonUtils = require('../../utils/common.utils')
  , discClient = require('../../common/discoveryclient.api')
  ;

if (!module.parent) {
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
                                  module.filename));
  process.exit(1);
}
function createRedisClientAndSubscribeMsg (callback)
{
    commonUtils.createRedisClient(function(client) {
        redisSub.redisSubClient = client;
        addRedisSubMsgListener(redisSub.redisSubClient);
        subsToRedis(global.MSG_REDIRECT_TO_LOGOUT);
        subsToRedis(global.DISC_SERVER_SUB_CLINET);
        callback();
    });
}

commonUtils.createRedisClient(global.WEBUI_SESSION_REDIS_DB, function(client) {
    redisSub.redisPerClient = client;
});

/* Function: subsToRedis
    This function is used to subscribe to a apecific channel to redis
 */
function subsToRedis (channel)
{
  logutils.logger.info("Redis subs done for channel:" + channel);
  redisSub.redisSubClient.subscribe(channel);
}

/* Function: unsubsToRedis
    This function is used to unsubscribe a channel from redis
 */
function unsubsToRedis (channel)
{
  redisSub.redisSubClient.unsubscribe(channel);
}

/* Function: createChannelByHashURL
    This function is used to create a channel by hash and URL.
    Whenever a client wants to subscribe to a channel, this API needs to be
    used, using unique hash, hash may be any string 
 */
function createChannelByHashURL (hash, url)
{
  var channel = 'q:' + hash + global.ZWQ_MSG_SEPERATOR + url;
  return channel;
}

/* Function: createChannelByReqData
    This function is used to create a channel from the reqData.
    This channel is used for subscribing to redis for a specific client.
    reqData must be taken by using cacheApi.createReqData() API
 */
function createChannelByReqData (reqData, hash)
{
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

    case global.DISC_SERVER_SUB_CLINET:
        discClient.processDiscoveryServiceResponseMsg(msg);
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
function addRedisSubMsgListener (redisClient)
{
  redisClient.on('message', function(channel, msg) {
    if (global.DISC_SERVER_SUB_CLINET != channel) {
        /* As in system there will be a lot of disc-server-sub message, we are
         * not logging it
         */
        logutils.logger.debug("We got the channel:" + channel + " by process:" +
                              process.pid);
    }
    /* Based on the channel, now search the request/response context from 
       redis and send response and check if we got timed out or not
     */
    /* Process MSG by channel */
    processRedisSubMessage(channel, msg);
  });
}

exports.createPubChannelKey = createPubChannelKey;
exports.subsToRedis = subsToRedis;
exports.unsubsToRedis = unsubsToRedis;
exports.createChannelByHashURL = createChannelByHashURL;
exports.createChannelByReqData = createChannelByReqData;
exports.createPubChannelKey = createPubChannelKey;
exports.createRedisClientAndSubscribeMsg = createRedisClientAndSubscribeMsg;


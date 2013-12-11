/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

var redis = require('redis')
	, config = require('../../../../config/config.global.js')
	, logutils = require('../../utils/log.utils')
	, messages = require('../../common/messages')
    , jobsApi = require('./jobs.api')
    , commonUtils = require('../../utils/common.utils')
	, util = require('util');

if (!module.parent) {
	logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
		module.filename));
	process.exit(1);
}

redisPub = module.exports;

commonUtils.createRedisClient(function(client) {
    redisPub.redisPubClient = client;
});

function doSetToRedis (key, data)
{
	redisPub.redisPubClient.set(channel, data, function (err) {
		if (err) {
			logutils.logger.error("Redis SET error [key#]" + key + ", [value#]" + data);
		}
		logutils.logger.debug("Redis SET successful [key#]:" + key + ",[value#]" + data);
	});
}

function publishDataToRedis (pubChannel, saveChannelKey, errCode, pubData, 
                             saveData, doSave, expiryTime, done)
{
	var pubDataObj = {
		errCode:errCode,
		data:(pubData)
	};
	logutils.logger.info("Data Publish done on Channel:" + pubChannel);
	redisPub.redisPubClient.publish(pubChannel, JSON.stringify(pubDataObj));

   /* This may be a result of request in Job Server itself, so create an event 
      to trigger it
    */
    jobsApi.jobListenerReadyQEvent.emit('dataPublished', pubChannel, JSON.stringify(pubData));
         
	/* Reids does not save the data while publishing data, so if it is needed to
	 save the data by calling this API, set doSave = 1
	 */
	if (doSave) {
		//redisPub.redisPubClient.setex(saveChannelKey, expiryTime, saveData,
		redisPub.redisPubClient.set(saveChannelKey, saveData,
			function (err) {
				if (err) {
					logutils.logger.error("redis SET error for pubData [err#] " +
						                  err + ", [channel#]" + saveChannelKey);
				} else {
					logutils.logger.info("redis SET successful for pubData [err#] " +
						                 err + ", [channel#]" + saveChannelKey);
				}
				done();
			});
	} else {
		done();
	}
}

function createChannelByHashURL (hash, url)
{
	var channel = 'q:' + hash + global.ZWQ_MSG_SEPERATOR + url;
	return channel;
}

function sendRedirectRequestToMainServer (jobData)
{   
    var pubChannel = jobData['taskData']['pubChannel'];
    redisPub.redisPubClient.publish(global.MSG_REDIRECT_TO_LOGOUT, pubChannel);
}

exports.sendRedirectRequestToMainServer = sendRedirectRequestToMainServer;
exports.publishDataToRedis = publishDataToRedis;
exports.createChannelByHashURL = createChannelByHashURL;



/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

var redisSub = require('./redisSub')
	, global = require('../../common/global')
	, redis = require("redis")
	, longPoll = require('./longPolling.api')
	, config = require('../../../../config/config.global.js')
	, commonUtils = require('../../utils/common.utils')
	, logutils = require('../../utils/log.utils')
	, util = require('util')
	, messages = require('../../common/messages');

if (!module.parent) {
	logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
		module.filename));
	process.exit(1);
}

cacheApi = module.exports;

commonUtils.createRedisClient(function(client) {
    cacheApi.redisClient = client;
});

var cachePendingQueue = [];
cacheApi.cachePendingQueue = cachePendingQueue;

cacheApi.createChannelByHashURL = function (hash, URL) {
	var channel = 'q:' + hash + global.ZWQ_MSG_SEPERATOR + URL;
	return channel;
}

/* Function: insertReqCtxToCachePendingQueue
 This function is used to insert req context to cache pending queue
 */
cacheApi.insertReqCtxToCachePendingQueue = function (req, res, channel) {
	var obj = {
		'req':req,
		'res':res,
		'channel':channel
	};

	cacheApi.cachePendingQueue.push(obj);
}

/* Function: checkCachePendingQueue
 This function is used to check if there is any pending request in
 cachePendingQ. This API will be invoked when we got data on redis channel.
 This API checks the context of this data
 */
cacheApi.checkCachePendingQueue = function (channel) {
	if (!cacheApi.cachePendingQueue.length) {
        return null;
	}
	/* Now check if we have any channel matching with any channel in
	 pending queue */
	/* TODO: if we can optimize the searching, may be by HASH */
	for (var i = 0; i < cacheApi.cachePendingQueue.length; i++) {
		var qEntry = cacheApi.cachePendingQueue[i];
		if ((qEntry) && (qEntry['channel'] == channel)) {
			logutils.logger.debug("We got the channel as:" + channel);
			break;
		}
	}
	if (i == cacheApi.cachePendingQueue.length) {
		logutils.logger.info("Got PUB msg with channel [" + channel +
		                     "], but no entry in pendingQ");
		return null;
	}
	return cacheApi.cachePendingQueue[i];
}

/* Function: deleteCachePendingQueueEntry
   This function is used to delete the req Q entry by pubChannel
 */
function deleteCachePendingQueueEntry (channel)
{
    var qLen = cacheApi.cachePendingQueue.length;
    for (var i = 0; i < qLen; i++) {
        var qEntry = cacheApi.cachePendingQueue[i];
        if ((qEntry) && (qEntry['channel'] == channel)) {
            cacheApi.cachePendingQueue.splice(i, 1);
            return;
        }
    }
    return;
}

/* Function: createDataAndSendToJobServer
 This function is used to create reqData ready to send to Job Server
 */
cacheApi.createDataAndSendToJobServer = function (jobType, hash, reqData, req, res) {
	var reqJSON = JSON.parse(reqData);
	var reqUrl = reqJSON.data.url;
	var obj = {
		cmd:global.STR_SEND_TO_JOB_SERVER,
		reqStr:reqData
	};
	/* Now create a subscriber channel on that such that when the redis gets
	 updated with this data, we get a notification
	 */
	var reqDataJSON = JSON.parse(reqData); 
	var channel = reqDataJSON.data.pubChannel;
	redisSub.subsToRedis(channel);
	/* Now store the req/res context in queue, this will be required when we will
	 get the redis pub message for this context, we can send the response
	 accordingly based on this conext
	 */
	logutils.logger.debug("We got the channel as:" + channel);
	cacheApi.insertReqCtxToCachePendingQueue(req, res, channel);
	/* Send the request to master */
	process.send(obj);
}

/* Function: queueDataFromCacheOrSendRequest
 This function is used to check if we have already the cached data, if yes,
 then get the cached data, else send a request to job Server to update cache
 and publish the response on redis channel
 */
cacheApi.queueDataFromCacheOrSendRequest = function (req, res, jobType, jobName, 
                                                     reqUrl, defCallback, jobRunCount, 
                                                     firstRunDelay, nextRunDelay,
                                                     sendToJobServerAlways, appData) {
	var reqData = cacheApi.createReqData(req, jobType, jobName, reqUrl, jobRunCount,
		defCallback, firstRunDelay, nextRunDelay, appData);
	var reqJSON = JSON.parse(reqData);
	var reqUrl = reqJSON.data.url;
	var hash = reqJSON.jobName;
	var channel = redisSub.createChannelByHashURL(hash, reqUrl);
	if (true === sendToJobServerAlways) {
	    /* Do not populate the data from cache */
	    cacheApi.createDataAndSendToJobServer(global.STR_JOB_TYPE_CACHE, hash,
                                              reqData, req, res);
        return;
    }                                      
    
	cacheApi.redisClient.get(channel, function (err, value) {
		if (err) {
			logutils.logger.error("We got error while retrieving the " +
				"data from redis:[hash:#]" + hash + " [reqData:#]" + reqData);
			throw err;
		}
		if (value == null || value == 0) {
			logutils.logger.info("We could not get the data in cache:");
			/* Data not stored in cache, so let us send a request to Job Server to
			 create cache for this
			 */
			cacheApi.createDataAndSendToJobServer(global.STR_JOB_TYPE_CACHE, hash,
				reqData, req, res);
		} else {
			handleJSONResponse(err, req, res, value);
		}
	});
}

/* defCallback is used to identify, when the job gets schedulded, if 
 defCallback defined in Job infra should be called or not.

 if runCount: 0, then the job will be scheduled for infinite time as long
 as nodeJS server is up, else number of counts the
 job will get scheduled.
 NOTE: If nextRunDelay is mentioned as -1, this object does not have
 any effect, it will not get scheduled after first job is done.

 firstRunDelay: First Running delay (in milliSeconds) from getting inserted
 into job Queue,
 nextRunDelay: When the first time the job is over, next time onwards the job
 will get scheduled after nextRunDelay milliseconds onwards.
 This is useful when a request is coming from web Client to get
 the cache, and next time onwards the cache should be updated at
 a regular interval.
 NOTE: If runCount is 1, then nextRunDelay does not have any effect,


 if defCallback: 1, then default callback gets called, in this case, the
 whole json data gets stored in cache
 if to get data only one server call is required in backend, then set it to 1.
 if defCallback: 0, define the callback in job process section
 */
cacheApi.createReqData = function (req, type, jobName, reqUrl, runCount, defCallback, 
                                   firstRunDelay, nextRunDelay, appData) {
    var authObj = {
        /* authObj contains all the auth related parameters, which may be needed
         * for backend authentication, ex: Config Server or Op Server
         */
        token: req.session.def_token_used,
        sessionId: req.session.id
    };
	var curTime = commonUtils.getCurrentTimestamp();
	var reqId = longPoll.lastRequestId;
	var pubChannel = redisSub.createPubChannelKey();
	req.pubChannel = pubChannel;
	var saveChannelKey = redisSub.createChannelByHashURL(jobName, reqUrl);
	var reqMsgObj = {
		jobType:type,
		jobName:jobName,
		runCount:runCount,
		runDelay:firstRunDelay,
		jobPriority:'normal',
		data:{
            authObj:authObj,
			nextRunDelay:nextRunDelay,
			reqId:reqId,
			requester:process.pid,
			jobCreateReqTime:curTime,
			defCallback:defCallback,
			url:reqUrl,
			pubChannel: pubChannel,
			saveChannelKey: saveChannelKey,
			appData: appData
		}
	};
	return JSON.stringify(reqMsgObj);
}

/* Function: sendResponseByChannel
 This function is used to insert the response published on redis channel on
 ready Q
 */
cacheApi.sendResponseByChannel = function (channel, msg) {
	var obj = cacheApi.checkCachePendingQueue(channel);
    if (null == obj) {
        return;
    }
	var isJson = 0;
	var msgParse = JSON.parse(msg);
	if (msgParse.errCode == global.HTTP_STATUS_RESP_OK) {
		isJson = 1;
		/* In error case, application will send only the error string */
	}
	longPoll.insertResToReadyQ(obj.res, msgParse.data, msgParse.errCode, isJson);
}

function handleJSONResponse(error, req, res, jsonStr) {
	if (!error) {
		longPoll.insertResToReadyQ(res, jsonStr, global.HTTP_STATUS_RESP_OK, 1);
	} else {
		console.log(error.stack);
		res.send(error.responseCode, error.message);
	}
}

exports.deleteCachePendingQueueEntry = deleteCachePendingQueueEntry;


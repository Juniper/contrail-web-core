/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var jobsApi = module.exports;

var redis = require("redis")
	, kue = require('kue')
	, assert = require('assert')
	, config = process.mainModule.exports.config
	, logutils = require('../../utils/log.utils')
	, util = require('util')
    , redisPub = require('./redisPub')
    , commonUtils = require('../../utils/common.utils')
    , eventEmitter = require('events').EventEmitter
    , async = require('async')
    , discServ = require('./discoveryservice.api')
    , UUID = require('uuid-js')
    , jobUtils = require('../../common/jobs.utils')
	, messages = require('../../common/messages');

try {
    computeNode = require('../api/vrouternode.jobs.api');
} catch(e) {
    computeNode = {};
}
if (!module.parent) {
	logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
		module.filename));
	process.exit(1);
}

var jobListenerReadyQ = {};
var jobListenerReadyQEvent = new eventEmitter();

jobsApi.kue = kue;

jobsApi.storeQ = {};

kue.redis.createClient = function ()
{
    var server_port = (config.redis_server_port) ?
        config.redis_server_port : global.DFLT_REDIS_SERVER_PORT;
    var server_ip = (config.redis_server_ip) ?
        config.redis_server_ip : global.DFLT_REDIS_SERVER_IP;
    var client = redis.createClient(server_port, server_ip);
    var uiDB = commonUtils.getWebUIRedisDBIndex();
    client.select(uiDB);
    return client;
}

kue.redis.createClient();
commonUtils.createRedisClient(function(client) {
    jobsApi.redisClient = client;
    jobsApi.jobs = kue.createQueue();
    jobsApi.jobs.promote();
    jobListenerReadyQEvent.emit('kueReady');
});

/* kue UI listening port */
var kuePort = config.kue.ui_port || 3002;
//kue.app.listen(kuePort);
//logutils.logger.info("KUE Jobs Infra UI listening on", kuePort);

/* Jobs are of below states:
 - `failed` the job has failed
 - `complete` the job has completed
 - `promotion` the job (when delayed) is now queued
 - `progress` the job's progress ranging from 0-100
 */
var JOB_PRIORITY_LOW = 10;
var JOB_PRIORITY_NORMAL = 0;
var JOB_PRIORITY_MEDIUM = -5;
var JOB_PRIORITY_HIGH = -10;
var JOB_PRIORITY_CRITICAL = -15;

var jobCheckState = ['delayed'];
function checkKueJobPriority(jobPriority)
{
	return ((jobPriority === 'low') ||
		(jobPriority === 'normal') ||
		(jobPriority === 'high') ||
		(jobPriority === 'critical'));
}

function getKueJobPriorityByValue (priority)
{
	switch (priority) {
		case JOB_PRIORITY_LOW:
			return 'low';
		case JOB_PRIORITY_NORMAL:
			return 'normal';
		case JOB_PRIORITY_MEDIUM:
			return 'medium';
		case JOB_PRIORITY_HIGH:
			return 'high';
		case JOB_PRIORITY_CRITICAL:
			return 'critical';
		default:
			return null;
	}
}

function getKueJobExist (jobStr, callback)
{
    var oldJobStr = jobStr, oldCallback = callback;
    if (typeof oldJobStr === 'undefined' || typeof oldCallback === 'undefined') {
        return function (newJobStr, newCallback) {
            redisPub.redisPubClient.zcard(kueJobStr, function(err, data) {
                /* zcard returns the sorted set cardinality (number of elements) 
                   of the sorted set stored at key
                 */
                if (err) {
                    newCallback(err);
                } else {
                    newCallback(null, data);
                }
            });
        }
    } else {
        redisPub.redisPubClient.zcard(jobStr, function (err, data) {
            if (err) {
                callback(err);
            } else {
                callback(null, data);
            }
        });
    }
}

function doJobExist (jobName, callback)
{
    /* Check wheather job is already created or not */
    var len = jobCheckState.length;
    var kueJobStrArr = [];
    var jobExists = false;
    var count = 0;
    
    for (var i = 0; i < len; i++) {
        kueJobStrArr[i] = 'q:jobs:' + jobName + ':' + jobCheckState[i];
    }
    async.map(kueJobStrArr, getKueJobExist, function(err, resultArr) {
        if (resultArr) {
            count = resultArr.length;
            for (i = 0; i < count; i++) {
                if (resultArr[i]) {
                    /* Job Exists */
                    jobExists = true;
                    break;
                } else {
                    jobExists = false;
                }
            }
        }
        callback(err, jobExists);
    });
}

/* Function createJob:
 @jobName    : name of the job
 @jobTitle   : title of the job, useful for kue UI
 @jobPriority: priority of job
 @delayInMS  : delay to execute the job once submitted.
 @runCount   : how many times the job should be executed once
 done, if 0, then it runs infinite time
 */
function createJob (jobName, jobTitle, jobPriority, delayInMS, runCount, taskData)
{
    taskData['genBy'] = global.service.MIDDLEWARE;
    doJobExist(jobName, function(err, jobExists) {
        if (true == jobExists) {
            runCount = 1;
            /* Create a Job with runCount = 1, so only one time run */
            jobsApi.kue.Job.rangeByType(jobName, 'delayed', 0,
                                        global.MAX_INT_VALUE, 'desc',
                                        function (err, selectedJobs) {
              if ((null == err) && (null != selectedJobs)) {
                selectedJobs.forEach(function (job) {
                    taskData =
                        jobUtils.updateJobDataRequiresField(job.data, taskData);
                    var reqBy = job.data.taskData.reqBy;
                    if ((global.REQ_AT_SYS_INIT == reqBy) &&
                        (global.REQ_AT_SYS_INIT != taskData.reqBy)) {
                        /* Stored JOB is Requested at System INIT */
                        job.data.taskData = taskData;
                        checkAndRequeueJobs(job);
                        return;
                    }
                });
              }
            });
        }
	    var jobTitleStr = (jobTitle == null) ? jobName : jobTitle;
        /* Update any jobData parameters if any changed in last iteration of job
         * processing
         */
        taskData =
            jobUtils.getAndUpdateChangedJobTaskData(jobTitleStr, taskData);
	    var obj = { 'title':jobTitleStr, 'runCount':runCount, 'taskData':taskData };
	    var newJob = jobsApi.jobs.create(jobName, obj);
	    if (delayInMS) {
	        newJob.delay(delayInMS);
	    }
	    /* Check valid job priority */
	    var check = checkKueJobPriority(jobPriority);
	    if (false == check) {
	        logutils.logger.error("Invalid priority provided" + jobPriority);
	        assert(0);
	    }
	    newJob.priority(jobPriority);
	    newJob.save();
	    logutils.logger.debug("Created a new Job with jobName:" + jobName);
    });
}

function getJobInfo (job)
{
	var obj = {
		jobType:job.type,
		jobTitle:job.data.title,
		jobPriority:job._priority,
		jobDelay:job.data.taskData.nextRunDelay,
		jobRunCount:job.data.runCount,
		jobTaskData:job.data.taskData
	};
	return obj;
}

/* Function: removeJobFromKue
 This function is used to remove the job from Kue Q
 */
function removeJobFromKue (job, callback)
{
	logutils.logger.info("Removing the job:", job.id);
	job.remove(function (err) {
		if (err) {
			logutils.logger.error("error while removing the job:");
		} else {
		    logutils.logger.info("Removed completed job:" + job.id +
		                         " by process:" + process.pid);
        }
        callback(err);
	});
}

function checkTimeBoundJob (jobName)
{
    var timeBoundJobList = [global.STR_GET_VROUTERS_SUMMARY];
    var len = timeBoundJobList.length;
    for (var i = 0; i < len; i++) {
        if (jobName == timeBoundJobList[i]) {
            return true;
        }
    }
    return false;
}

var jobNextRefreshTimerCBList = {
    'getVRoutersSummary': computeNode.getVRouterJobRefreshTimer,
    'getVRoutersGenerators': computeNode.getVRouterJobRefreshTimer
}

function getJobNextRefreshTime (job, callback)
{
    if (true == checkTimeBoundJob(job.type)) {
        var refCb = jobNextRefreshTimerCBList[job.type];
        if (null == refCb) {
            /* App does not want to override the refresh time */
            callback(null);
            return;
        }
        redisPub.redisPubClient.get(job.data.taskData.saveChannelKey, 
                                    function(err, data) {
            if ((null == err) || (null != data)) {
                var nextRefTime = refCb(data);
                callback(nextRefTime);
                return;
            }
        });
    } else {
        callback(null);
    }
}

function checkAndRequeueJobs (job)
{
    getJobNextRefreshTime(job, function(nextRunDelay) {
        checkAndRequeueJob(job, nextRunDelay);
    });
}

/* Function: checkAndRequeueJob
 This function is used to check if the job should be requeued, if yes, then
 the old job is removed from queue and a new one gets created
 */
function checkAndRequeueJob (job, nextRunDelay)
{
    /* First check the job type */
    if (null == nextRunDelay) {
        /* DO not do anything */
    } else {
        job.data.taskData.nextRunDelay = nextRunDelay;
    }
    var jobType = job.type;
    var jobData = job.data;//commonUtils.cloneObj(job.data);
    var jobPriority = job._priority;

	if (jobData.runCount && ((jobData.runCount - 1) <= 0)) {
		removeJobFromKue(job, function(err) {
            /* No Need to log here, already logged */
        });
		return;
	}
	if (jobData.taskData.nextRunDelay != -1) {
        removeJobFromKue(job, function(err) {
            if (null == err) {
                /* Job got removed, so create a new one now */
                createJob(jobType, jobData.title,
                          getKueJobPriorityByValue(jobPriority),
                          jobData.taskData.nextRunDelay,
                          (!jobData.runCount) ? 0 :
                          jobData.runCount - 1, jobData.taskData);
                logutils.logger.debug("Job Got requeued with Job Type:" +
                                      job.type);
           }
        });
    } else {
        removeJobFromKue(job, function(err) {
            /* No Need to log again */
        });
        return;
    }
	return;
}

/* Function: doCheckJobsProcess
 This function is handler for different Kue Job events.
 When from application, done() API gets called, then this API gets invoked
 */
function doCheckJobsProcess ()
{
	jobsApi.jobs.on('job complete', function (id) {
		logutils.logger.info("We are on jobs.on for event 'job complete', id:" + id);
		jobsApi.kue.Job.get(id, function (err, job) {
			if ((err) || (null == job)) {
				logutils.logger.error("Some error happened or job is null:",
					err, process.pid);
				return;
			}
			logutils.logger.debug("Job " + job.id + " completed by process: " + process.pid);
			checkAndRequeueJobs(job);
		});
	});
}

function createJobAtInit (jobObj)
{
    if (null == jobObj) {
        logutils.logger.error("In createJobAtInit(): jobObj is null");
        return;
    }
    var jobName = jobObj['jobName'];
    if (null == jobName) {
        logutils.logger.error("In createJobAtInit(): jobName is null");
        assert(0);
    }
    var url = jobObj['url'];
    var firstRunDelay = jobObj['firstRunDelay'];
    var runCount = jobObj['runCount'];
    var nextRunDelay = jobObj['nextRunDelay'];
    var appData = jobObj['appData'];
    var orchModel = jobObj['orchModel'];
    var msgObj = {};
    msgObj['jobName'] = jobName;
    msgObj['priority'] = 'normal';
    msgObj['jobType'] = global.STR_JOB_TYPE_CACHE;
    if (null == runCount) {
        msgObj['runCount'] = 0;
    } else {
        msgObj['runCount'] = runCount;
    }
    if (null == firstRunDelay) {
        /* Let the whole system come up, so default start job after 2 minutes */
        msgObj['runDelay'] = 2 * 60 * 1000;
    } else {
        msgObj['runDelay'] = firstRunDelay;
    }
    msgObj['data'] = {};
    msgObj['data']['loggedInOrchestrationMode'] = orchModel;
    msgObj['data']['appData'] = appData;
    msgObj['data']['authObj'] = {};
    msgObj['data']['authObj']['sessionId'] = "";
    msgObj['data']['authObj']['token'] = {};
    msgObj['data']['defCallback'];
    msgObj['data']['jobCreateReqTime'] = commonUtils.getCurrentTimestamp();
    msgObj['data']['nextRunDelay'] = nextRunDelay;
    msgObj['data']['pubChannel'] = UUID.create().toString();
    msgObj['data']['saveChannelKey'] = redisPub.createChannelByHashURL(jobName, url);
    msgObj['data']['requester'] = process.pid;
    msgObj['data']['reqId'] = 0;
    msgObj['data']['url'] = url;
    msgObj['data']['reqBy'] = global.REQ_AT_SYS_INIT;
    createJob(jobName, jobName, 'normal', firstRunDelay, runCount, msgObj['data']);
}

/* Function: createJobByMsgObj
 This function is used to create a job by message coming from mainServer
 */
function createJobByMsgObj (msg)
{
    var msgJSON = JSON.parse(msg.toString());
    switch (msgJSON['jobType']) {
    case global.STR_MAIN_WEB_SERVER_READY:
        if (true == process.mainModule.exports['discServEnable']) {
            /* The main webServer is ready now, now start discovery service 
             * subscription
             */
            discServ.createRedisClientAndStartSubscribeToDiscoveryService(global.service.MAINSEREVR);
        }
        break;

    case global.STR_DISC_SUBSCRIBE_MSG:
        logutils.logger.debug("We got on-demand discovery SUB message for " +
                              "serverType " + msgJSON['serverType']);
        discServ.subscribeDiscoveryServiceOnDemand(msgJSON['serverType']);
        break;

    default:
        createJob(msgJSON.jobName, msgJSON.jobName, msgJSON.jobPriority,
                  msgJSON.firstRunDelay, msgJSON.runCount, msgJSON.data);
        break;
    }
}

function getChannelkeyByHashUrl (lookupHash, myHash, url)
{
    var channelObj = {};
    var createTime = commonUtils.getCurrentTimestamp();
    var pubChannel = createTime + global.ZWQ_MSG_SEPERATOR + lookupHash +
                     global.ZWQ_MSG_SEPERATOR + myHash + 
                     global.ZWQ_MSG_SEPERATOR + url;
    var saveChannelKey = redisPub.createChannelByHashURL(lookupHash, url);
    channelObj.pubChannel = pubChannel;
    channelObj.saveChannelKey = saveChannelKey;
    return channelObj;
}

function defDoneCallback ()
{
    logutils.logger.debug("We are done");
}

function createJobListener (lookupHash, myHash, url, oldPubChannel, oldSaveChannelKey, 
                            processCallback, doneCallback,
                            doCrateJob, runCount, nextRunDelay, data,
                            done, jobData)
{
    var channelObj = getChannelkeyByHashUrl(lookupHash, myHash, url);
    /* First create an entry in jobListening Q */
    var obj = {
        'lookupHash': lookupHash,
        'myHash': myHash,
        'pubChannel': oldPubChannel,
        'saveChannelKey': oldSaveChannelKey, 
        'done': done
    };
    jobListenerReadyQ[channelObj.pubChannel] = obj;
    if (doneCallback == null) {
        doneCallback = defDoneCallback;
    }

    var jobObj = createJobObj(lookupHash, url, runCount,
                              nextRunDelay, jobData);
    /* Now store the data in StoreQ */
    var storeObj = {'data': data, 'jobData': jobData};
    storeDataInStoreQ(obj.pubChannel, storeObj);

    processCallback(channelObj.pubChannel, channelObj.saveChannelKey, jobObj,
                    doneCallback);
    if (doCrateJob) {
        createJob(jobObj.title, jobObj.title,
        /* Background jobs always normal priority */
                  'normal', nextRunDelay,
                  jobObj.runCount, jobObj.taskData);
    }
}

function deleteQ (pubChannel)
{
    delete jobsApi.storeQ[pubChannel];
}

function getDataFromStoreQ (pubChannel)
{
    return jobsApi.storeQ[pubChannel];
}

function storeDataInStoreQ (pubChannel, data)
{
    jobsApi.storeQ[pubChannel] = data;
}

function createJobObj (hash, url, runCount, nextRunDelay, data)
{
    jobsApi.jobInternalReqId++;
    var  jobData = {};
    jobData.title = hash;
    jobData.runCount = (runCount) ? runCount : 1;
    jobData.taskData = {};
    jobData.taskData.nextRunDelay = (nextRunDelay) ? nextRunDelay : -1;
    jobData.taskData.reqId = jobsApi.jobInternalReqId;
    jobData.taskData.requester = process.pid;
    jobData.taskData.jobCreateReqTime = commonUtils.getCurrentTimestamp();
    jobData.taskData.defCallback = 0;
    jobData.taskData.url = url;
    jobData.taskData.authObj = data.taskData.authObj;
    return jobData;
}

jobListenerReadyQEvent.on('dataPublished', function(pubChannel, pubData) {
    logutils.logger.debug("Got notified on Job Listener Channel:" + pubChannel);
    /* Check if the originator of this request is myself */
    var channelObj = jobListenerReadyQ[pubChannel];
    if (null == channelObj) {
        logutils.logger.debug("We did not find this channel:" + pubChannel);
        return;
    }
    var hash = channelObj.myHash + global.ZWQ_MSG_SEPERATOR + channelObj.lookupHash;
    logutils.logger.debug("Getting channelObj:" + channelObj);

    jobListenerReadyQEvent.emit(hash, pubData, channelObj.pubChannel, 
                                channelObj.saveChannelKey, channelObj.done);
});

exports.jobListenerReadyQEvent = jobListenerReadyQEvent;
exports.createJobListener = createJobListener;
exports.createJobByMsgObj = createJobByMsgObj;
exports.doCheckJobsProcess = doCheckJobsProcess;
exports.getDataFromStoreQ = getDataFromStoreQ;
exports.createJobAtInit = createJobAtInit;


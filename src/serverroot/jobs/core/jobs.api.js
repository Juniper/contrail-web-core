/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

var jobsApi = module.exports;

var redis = require("redis")
	, kue = require('kue')
	, assert = require('assert')
	, config = require('../../../../config/config.global.js')
	, logutils = require('../../utils/log.utils')
	, util = require('util')
    , redisPub = require('./redisPub')
    , commonUtils = require('../../utils/common.utils')
    , eventEmitter = require('events').EventEmitter
    , async = require('async')
	, messages = require('../../common/messages');

if (!module.parent) {
	logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
		module.filename));
	process.exit(1);
}

var jobListenerReadyQ = {};
var jobListenerReadyQEvent = new eventEmitter();
jobsApi.jobListenerReadyQEvent = jobListenerReadyQEvent;

jobsApi.kue = kue;

jobsApi.storeQ = {};

kue.redis.createClient = function () {
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
    jobsApi.jobListenerReadyQEvent.emit('kueReady');
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
function checkKueJobPriority(jobPriority) {
	return ((jobPriority === 'low') ||
		(jobPriority === 'normal') ||
		(jobPriority === 'high') ||
		(jobPriority === 'critical'));
}

getKueJobPriorityByValue = function (priority) {
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

jobsApi.getKueJobExist = function(jobStr, callback) {
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

jobsApi.doJobExist = function(jobName, callback) {
    /* Check wheather job is already created or not */
    var len = jobCheckState.length;
    var kueJobStrArr = [];
    var jobExists = false;
    var count = 0;
    
    for (var i = 0; i < len; i++) {
        kueJobStrArr[i] = 'q:jobs:' + jobName + ':' + jobCheckState[i];
    }
    async.map(kueJobStrArr, jobsApi.getKueJobExist, function(err, resultArr) {
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
jobsApi.createJob = function (jobName, jobTitle, jobPriority, delayInMS, runCount, taskData) {
    jobsApi.doJobExist(jobName, function(err, jobExists) {
        if (true == jobExists) {
            /* Create a Job with runCount = 1, so only one time run */
            runCount = 1;
        }
	    var jobTitleStr = (jobTitle == null) ? jobName : jobTitle;
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

jobsApi.getJobInfo = function (job) {
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
removeJobFromKue = function (job, callback) {
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

/* Function: checkAndRequeueJobs
 This function is used to check if the job should be requeued, if yes, then
 the old job is removed from queue and a new one gets created
 */
checkAndRequeueJobs = function (job) {
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
                jobsApi.createJob(jobType, jobData.title,
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
jobsApi.doCheckJobsProcess = function () {
	jobsApi.jobs.on('job complete', function (id) {
		logutils.logger.info("We are on jobs.on for event 'job complete', id:" + id);
		jobsApi.kue.Job.get(id, function (err, job) {
			if ((err) || (null == job)) {
				logutils.logger.error("Some error happened or job is null:",
					err, process.pid);
				throw err;
				return;
			}
			logutils.logger.debug("Job " + job.id + " completed by process: " + process.pid);
			checkAndRequeueJobs(job);
		});
	});
}

/* Function: createJobByMsgObj
 This function is used to create a job by message coming from mainServer
 */
jobsApi.createJobByMsgObj = function (msg) {
	var msgJSON = JSON.parse(msg);
	jobsApi.createJob(msgJSON.jobName, msgJSON.jobName, msgJSON.jobPriority,
		msgJSON.firstRunDelay, msgJSON.runCount, msgJSON.data);
}

getChannelkeyByHashUrl = function(lookupHash, myHash, url) {
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

defDoneCallback = function() {
    console.log("We are done");
}

jobsApi.createJobListener = function(lookupHash, myHash, url, oldPubChannel, oldSaveChannelKey, 
                                     processCallback, doneCallback,
                                     doCrateJob, runCount, nextRunDelay, data,
                                     done, jobData) {
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

    var createJobObj = jobsApi.createJobObj(lookupHash, url, runCount,
                                            nextRunDelay, jobData);
    /* Now store the data in StoreQ */
    var storeObj = {'data': data, 'jobData': jobData};
    jobsApi.storeDataInStoreQ(obj.pubChannel, storeObj);

    processCallback(channelObj.pubChannel, channelObj.saveChannelKey, createJobObj,
                    doneCallback);
    if (doCrateJob) {
        jobsApi.createJob(createJobObj.title, createJobObj.title,
        /* Background jobs always normal priority */
                          'normal', nextRunDelay,
                          createJobObj.runCount, createJobObj.taskData);
    }
}

jobsApi.deleteQ = function(pubChannel) {
    delete jobsApi.storeQ[pubChannel];
}

jobsApi.getDataFromStoreQ = function(pubChannel) {
    return jobsApi.storeQ[pubChannel];
}

jobsApi.storeDataInStoreQ = function(pubChannel, data) {
    jobsApi.storeQ[pubChannel] = data;
}

jobsApi.createJobObj = function(hash, url, runCount, nextRunDelay, data) {
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

jobsApi.jobListenerReadyQEvent.on('dataPublished', function(pubChannel, pubData) {
    logutils.logger.debug("Got notified on Job Listener Channel:" + pubChannel);
    /* Check if the originator of this request is myself */
    var channelObj = jobListenerReadyQ[pubChannel];
    if (null == channelObj) {
        logutils.logger.debug("We did not find this channel:" + pubChannel);
        return;
    }
    var hash = channelObj.myHash + global.ZWQ_MSG_SEPERATOR + channelObj.lookupHash;
    logutils.logger.debug("Getting channelObj:" + channelObj);

    jobsApi.jobListenerReadyQEvent.emit(hash, pubData, channelObj.pubChannel, 
                                        channelObj.saveChannelKey, channelObj.done);
});


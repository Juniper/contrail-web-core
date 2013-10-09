/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

var axon = require('axon')
	, jobsApi = require('./src/serverroot/jobs/core/jobs.api')
	, assert = require('assert')
	, jobsCb = require('./src/serverroot/jobs/core/jobsCb.api')
    , jobsApi = require('./src/serverroot/jobs/core/jobs.api')
	, global = require('./src/serverroot/common/global')
	, redisPub = require('./src/serverroot/jobs/core/redisPub')
	, bgpNode = require('./src/serverroot/jobs/api/bgpNode.api')
	, computeNode = require('./src/serverroot/jobs/api/computeNode.api')
    , kue = require('kue')
    , commonUtils = require('./src/serverroot/utils/common.utils')
    , logutils = require('./src/serverroot/utils/log.utils')
	, config = require('./config/config.global.js');

var hostName = config.jobServer.server_ip
	, port = config.jobServer.server_port;

var workerSock = axon.socket('pull');

/* Function: processMsg
 Handler for message processing for messages coming from main Server
 */
processMsg = function (msg) {
	var msgJSON = JSON.parse(msg);
	jobsApi.createJobByMsgObj(msg);
}

/* Function: connectToMainServer
 This function is used to connect to main Server on host and port
 defined in config.global.js
 */
connectToMainServer = function () {
	var connectURL = 'tcp://' + hostName + ":" + port;
	workerSock.connect(connectURL);
	console.log('Job Server connected to port ', port);
}

kueJobListen = function() {
    /* kue UI listening port */
    var kuePort = config.kue.ui_port || 3002;
    kue.app.listen(kuePort);
}

function startServers ()
{
    kueJobListen();
    connectToMainServer();
    jobsCb.addjobListenerEvent();
    jobsCb.jobsProcess();
    jobsApi.doCheckJobsProcess();
}

function jobServerPurgeAndStart (redisClient)
{
    redisClient.flushdb(function (err) {
        var uiDB = config.redisDBIndex;
        if (null == uiDB) {
            uiDB = global.WEBUI_DFLT_REDIS_DB;
        }
        if (err) {
            logutils.logger.error("web-ui Redis FLUSHDB " + uiDB + " error:" + err);
        } else {
            logutils.logger.debug("Redis FLUSHDB " + uiDB + " Done.");
        }
    });
}

commonUtils.createRedisClient(function(client) {
    jobServerPurgeAndStart(client);
});

workerSock.on('message', function (msg) {
	/* Now based on the message type, act */
	processMsg(msg);
});

jobsApi.jobListenerReadyQEvent.on('kueReady', function() {
    /* Now start real server processing */
    startServers();
});


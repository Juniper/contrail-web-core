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
    , discServ = require('./src/serverroot/jobs/core/discoveryservice.api')
	, config = require('./config/config.global.js');

var hostName = config.jobServer.server_ip
	, port = config.jobServer.server_port;

var workerSock = axon.socket('pull');
var myIdentity = global.service.MIDDLEWARE;
var discServEnable = ((null != config.discoveryService) &&
                      (null != config.discoveryService.enable)) ?
                      config.discoveryService.enable : true;

/* Function: processMsg
 Handler for message processing for messages coming from main Server
 */
processMsg = function (msg) {
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

function createVRouterSummaryJob ()
{
    var appData = {};
    appData['addGen'] = true;
    var url = '/virtual-routers';
    jobsApi.createJobAtInit(global.STR_GET_VROUTERS_SUMMARY, url, 
                            global.VROUTER_SUMM_JOB_REFRESH_TIME,
                            /* Wait for 5 minutes to start job at web-ui start
                             * */
                            0, global.VROUTER_SUMM_JOB_REFRESH_TIME, appData);
}

function createVRouterGeneratorsJob ()
{
    var url = '/virtual-routers';
    jobsApi.createJobAtInit(global.STR_GET_VROUTERS_GENERATORS, url, 
                            global.VROUTER_SUMM_JOB_REFRESH_TIME,
                            /* Wait for 5 minutes to start job at web-ui start
                             * */
                            0, global.VROUTER_GENR_JOB_REFRESH_TIME, null);
}

function createJobsAtInit ()
{
    createVRouterSummaryJob();
    createVRouterGeneratorsJob();
}

function startServers ()
{
    kueJobListen();
    connectToMainServer();
    jobsCb.addjobListenerEvent();
    jobsCb.jobsProcess();
    jobsApi.doCheckJobsProcess();
    if (true == discServEnable) {
        discServ.createRedisClientAndStartSubscribeToDiscoveryService(global.service.MIDDLEWARE);
        discServ.startWatchDiscServiceRetryList();
    }
    redisPub.createRedisPubClient(function() {
        createJobsAtInit();
    });
}

function jobServerPurgeAndStart (redisClient)
{
    redisClient.flushall(function (err) {
        if (err) {
            logutils.logger.error("web-ui Redis FLUSALL error:" + err);
        } else {
            logutils.logger.debug("web-ui Redis FLUSHALL done.");
        }
    /*
        var uiDB = config.redisDBIndex;
        if (null == uiDB) {
            uiDB = global.WEBUI_DFLT_REDIS_DB;
        }
        if (err) {
            logutils.logger.error("web-ui Redis FLUSHDB " + uiDB + " error:" + err);
        } else {
            logutils.logger.debug("Redis FLUSHDB " + uiDB + " Done.");
        }
    */
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

exports.myIdentity = myIdentity;
exports.discServEnable = discServEnable;


/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/* Set corePath before loading any other module */
var corePath = process.cwd();
exports.corePath = corePath;

var axon = require('axon')
    , jobsApi = require('./src/serverroot/jobs/core/jobs.api')
    , assert = require('assert')
    , jobsApi = require('./src/serverroot/jobs/core/jobs.api')
    , global = require('./src/serverroot/common/global')
    , redisPub = require('./src/serverroot/jobs/core/redisPub')
    , kue = require('kue')
    , commonUtils = require('./src/serverroot/utils/common.utils')
    , logutils = require('./src/serverroot/utils/log.utils')
    , discServ = require('./src/serverroot/jobs/core/discoveryservice.api')
    , jsonPath = require('JSONPath').eval
    , config = require('./config/config.global.js');

var hostName = config.jobServer.server_ip
    , port = config.jobServer.server_port;

var workerSock = axon.socket('pull');
var myIdentity = global.service.MIDDLEWARE;
var discServEnable = ((null != config.discoveryService) &&
                      (null != config.discoveryService.enable)) ?
                      config.discoveryService.enable : true;

var pkgList = commonUtils.mergeAllPackageList(global.service.MIDDLEWARE);

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

function getDestPathByPkgPathURL (destPath)
{
    var destArrPath = destPath.split(':');
    if (destArrPath.length > 1) {
        destPath = config.featurePkg[destArrPath[0]]['path'] + '/' + destArrPath[1];
    }
    return destPath;
}

function registerTojobListenerEvent()
{
    var destPath = null;
    var jobProcData = jsonPath(pkgList, "$..jobProcess[0]");
    var jobProcDataLen = jobProcData.length;
    for (var i = 0; i < jobProcDataLen; i++) {
        destPath = getDestPathByPkgPathURL(jobProcData[i]['output'][0]);
        require(destPath).addjobListenerEvent();
        require(destPath).jobsProcess();
    }
}

function startServers ()
{
    kueJobListen();
    connectToMainServer();
    registerTojobListenerEvent();
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
exports.pkgList = pkgList;

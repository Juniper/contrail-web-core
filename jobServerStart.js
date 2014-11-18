/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/* Set corePath before loading any other module */
var corePath = process.cwd();
var config = require('./src/serverroot/common/config.utils').compareAndMergeDefaultConfig();
exports.corePath = corePath;
exports.config = config;

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
    , async = require('async')
    , fs = require('fs')
    , jsonPath = require('JSONPath').eval;

var hostName = config.jobServer.server_ip
    , port = config.jobServer.server_port;

var workerSock = axon.socket('pull');
var myIdentity = global.service.MIDDLEWARE;
var discServEnable = ((null != config.discoveryService) &&
                      (null != config.discoveryService.enable)) ?
                      config.discoveryService.enable : true;

var pkgList = commonUtils.mergeAllPackageList(global.service.MIDDLEWARE);
assert(pkgList);

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
    var jobObj = {};
    var url = '/virtual-routers';
    jobObj['jobName'] = global.STR_GET_VROUTERS_SUMMARY;
    jobObj['url'] = url;
    jobObj['firstRunDelay'] = global.VROUTER_SUMM_JOB_REFRESH_TIME;
    jobObj['runCount'] = 0;
    jobObj['nextRunDelay'] = global.VROUTER_SUMM_JOB_REFRESH_TIME;
    jobObj['orchModel'] = 'openstack';
    jobObj['appData'] = appData;
    jobsApi.createJobAtInit(jobObj);
}

function createVRouterGeneratorsJob ()
{
    var url = '/virtual-routers';
    var jobObj = {};
    jobObj['jobName'] = global.STR_GET_VROUTERS_GENERATORS;
    jobObj['url'] = url;
    jobObj['firstRunDelay'] = global.VROUTER_SUMM_JOB_REFRESH_TIME;
    jobObj['runCount'] = 0;
    jobObj['nextRunDelay'] = global.VROUTER_GENR_JOB_REFRESH_TIME;
    jobObj['orchModel'] = 'openstack';
    jobsApi.createJobAtInit(jobObj);
}

function createJobsAtInit ()
{
    createVRouterSummaryJob();
    createVRouterGeneratorsJob();
}

function registerTojobListenerEvent()
{
    var pkgDir;
    var pkgListLen = pkgList.length;
    for (var i = 0; i < pkgListLen; i++) {
        if (pkgList[i]['jobProcess.xml']) {
            pkgDir = commonUtils.getPkgPathByPkgName(pkgList[i]['pkgName']);
            var jobListLen = pkgList[i]['jobProcess.xml'].length;
            for (var j = 0; j < jobListLen; j++) {
                logutils.logger.debug("Registering jobListeners: " +
                                      pkgDir + pkgList[i]['jobProcess.xml'][j]);
                require(pkgDir +
                        pkgList[i]['jobProcess.xml'][j]).addjobListenerEvent();
                require(pkgDir + pkgList[i]['jobProcess.xml'][j]).jobsProcess();
            }
        }
    }
}

/* Function: doFeatureTaskInit
   This function is used to do all initializations of all the feature packages
   installed and if is set as enabled in config file
 */
function doFeatureTaskInit ()
{
    var featurePkgList = config.featurePkg;
    for (key in featurePkgList) {
        if ((config.featurePkg[key]) && (config.featurePkg[key]['path']) &&
            ((null == config.featurePkg[key]['enable']) ||
             (true == config.featurePkg[key]['enable'])) &&
            (true == fs.existsSync(config.featurePkg[key]['path'] +
                                   '/webroot/common/api/init.api.js'))) {
            var initApi = require(config.featurePkg[key]['path'] +
                                   '/webroot/common/api/init.api.js');
            if (initApi.featureInit) {
                initApi.featureInit();
            }
        }
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
        doFeatureTaskInit();
    });
}

function jobServerPurgeAndStart (redisClient, callback)
{
    var redisDBs = [global.WEBUI_SESSION_REDIS_DB, global.WEBUI_DFLT_REDIS_DB,
        global.QE_DFLT_REDIS_DB, global.SM_DFLT_REDIS_DB];
    async.map(redisDBs, commonUtils.flushRedisDB, function() {
        /* Already logged */
        callback();
    });
}

workerSock.on('message', function (msg) {
    /* Now based on the message type, act */
    processMsg(msg);
});

jobsApi.jobListenerReadyQEvent.on('kueReady', function() {
    /* Now start real server processing */
    commonUtils.createRedisClient(function(client) {
        jobServerPurgeAndStart(client, function() {
            startServers();
        });
    });
});

exports.myIdentity = myIdentity;
exports.discServEnable = discServEnable;
exports.pkgList = pkgList;


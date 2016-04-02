/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
var assert = require('assert');
var args = process.argv.slice(2);
var argsCnt = args.length;
var configFile = null;
for (var i = 0; i < argsCnt; i++) {
    if (('--c' == args[i]) || ('--conf_file' == args[i])) {
        if (null == args[i + 1]) {
            console.error('Config file not provided');
            assert(0);
        } else {
            configFile = args[i + 1];
            try {
                var tmpConfig = require(configFile);
                if ((null == tmpConfig) || (typeof tmpConfig !== 'object')) {
                    console.error('Config file ' + configFile + ' is not valid');
                    assert(0);
                }
                break;
            } catch(e) {
                console.error('Config file ' + configFile + ' not found');
                assert(0);
            }
        }
    }
}

/* Set corePath before loading any other module */
var corePath = process.cwd();
var config =
    require('./src/serverroot/common/config.utils').compareAndMergeDefaultConfig(configFile);

exports.corePath = corePath;
exports.config = config;

var redisUtils = require('./src/serverroot/utils/redis.utils');
var global = require('./src/serverroot/common/global');

var server_port = (config.redis_server_port) ?
    config.redis_server_port : global.DFLT_REDIS_SERVER_PORT;
var server_ip = (config.redis_server_ip) ?
    config.redis_server_ip : global.DFLT_REDIS_SERVER_IP;
redisUtils.createRedisClientAndWait(server_port, server_ip,
                                    global.WEBUI_DFLT_REDIS_DB,
                                    function(redisClient) {
    exports.redisClient = redisClient;
    loadJobServer();
});

function loadJobServer ()
{
var axon = require('axon')
    , jobsApi = require('./src/serverroot/jobs/core/jobs.api')
    , assert = require('assert')
    , jobsApi = require('./src/serverroot/jobs/core/jobs.api')
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
    logutils.logger.info('Job Server connected to port ' + port);
}

kueJobListen = function() {
    /* kue UI listening port */
    var kuePort = config.kue.ui_port || 3002;
    kue.app.listen(kuePort, '127.0.0.1');
}

function createJobsAtInit ()
{
    return;
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

function startJobServer () {
jobsApi.jobListenerReadyQEvent.on('kueReady', function() {
    /* Now start real server processing */
    commonUtils.createRedisClient(function(client) {
        jobServerPurgeAndStart(client, function() {
            startServers();
        });
    });
});
}

startJobServer();

exports.myIdentity = myIdentity;
exports.discServEnable = discServEnable;
exports.pkgList = pkgList;
}


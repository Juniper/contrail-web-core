/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var configUtils = require('./src/serverroot/common/config.utils');
    args = process.argv.slice(2),
    configFile = configUtils.getConfigFile(args);
configUtils.updateConfig(configFile);
configUtils.subscribeAutoDetectConfig(configFile);

/* Set corePath before loading any other contrail module */
var corePath = process.cwd();
var config = configUtils.getConfig();

exports.corePath = corePath;

var redisUtils = require('./src/serverroot/utils/redis.utils');
var global = require('./src/serverroot/common/global');
var jobsUtils = require('./src/serverroot/common/jobs.utils');
var commonUtils = require('./src/serverroot/utils/common.utils');
var async = require('async');
var cluster = require('cluster');
var clusterUtils = require('./src/serverroot/utils/cluster.utils');

var server_port = (config.redis_server_port) ?
    config.redis_server_port : global.DFLT_REDIS_SERVER_PORT;
var server_ip = (config.redis_server_ip) ?
    config.redis_server_ip : global.DFLT_REDIS_SERVER_IP;

function loadJobServer () {
jobsUtils.jobKueEventEmitter.on('kueReady', function() {
    /* Now start real server processing */
    if (false == process.kueReinitReqd) {
        return;
    }
    var purgeRedisClient = redisUtils.createRedisClient();//createDefRedisClientAndWait(function(purgeRedisClient) {
    jobServerPurgeAndStart(purgeRedisClient, function() {
        startServers();
        process.kueReinitReqd = false;
    });
});

var axon = require('axon')
    , assert = require('assert')
    , redisPub = require('./src/serverroot/jobs/core/redisPub')
    , kue = require('kue')
    , logutils = require('./src/serverroot/utils/log.utils')
    , contrailServ = require('./src/serverroot/common/contrailservice.api')
    , fs = require('fs')
    , jobsApi = require('./src/serverroot/jobs/core/jobs.api')
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
exports.myIdentity = myIdentity;
exports.discServEnable = discServEnable;
exports.pkgList = pkgList;

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
var resetDone = false;
connectToMainServer = function () {
    if (true == resetDone) {
        return;
    }
    var connectURL = 'tcp://' + hostName + ":" + port;
    workerSock.connect(connectURL);
    logutils.logger.info('Job Server connected to port ' + port);
    resetDone = true;
    workerSock.on('message', function (msg) {
        /* Now based on the message type, act */
        processMsg(msg);
    });
}

kueJobListen = function() {
    /* kue UI listening port */
    var kuePort = config.kue.ui_port || 3002;
    kue.app.listen(kuePort, '127.0.0.1');
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
    registerTojobListenerEvent();
    jobsApi.doCheckJobsProcess();
    contrailServ.getContrailServices();
    contrailServ.startWatchContrailServiceRetryList();
    redisPub.createRedisPubClient(function() {
        redisUtils.createDefRedisClientAndWait(function(redisClient) {
            exports.redisClient = redisClient;
            connectToMainServer();
            doFeatureTaskInit();
            process.send("INIT IS DONE");
        });
    });
}
}

function jobServerPurgeAndStart (redisClient, callback)
{
    var redisDBs = [global.WEBUI_DFLT_REDIS_DB, global.QE_DFLT_REDIS_DB, global.SM_DFLT_REDIS_DB];

    async.parallel(
        [
            function removeStaleSessions(cb) {
                redisUtils.selectRedisDB(global.WEBUI_SESSION_REDIS_DB, redisClient, function (redisSessionDB) {
                    redisSessionDB.keys(global.STR_REDIS_STORE_SESSION_ID_PREFIX + ':*', function(err, keys) {
                        if (err) {
                            throw err;
                        }

                        async.map(keys, redisClient.del, cb);
                    });
                });
            },
            function flushDBs(cb) {
                async.map(redisDBs, commonUtils.flushRedisDB, cb);
            }
        ],
        function () {
            /* Already logged */
            callback();
        }
    )
}

function messageHandler (msg)
{
    if ((null != msg) && (null != msg.cmd)) {
        switch(msg.cmd) {
        case global.MSG_CMD_KILLALL:
            /* Kill the worker process and let master again fork it */
            clusterUtils.killAllWorkers();
            break;
        }
    }
}

function startJobCluster ()
{
    if (cluster.isMaster) {
        clusterMasterInit(function(err) {
            clusterUtils.forkWorkers();
            clusterUtils.addClusterEventListener(messageHandler);
        });
    } else {
        clusterWorkerInit(function(err) {
            loadJobServer();
        });
    }
}

function clusterWorkerInit (callback)
{
    var purgeRedisClient = redisUtils.createRedisClient();
    async.parallel([
        function(CB) {
            jobServerPurgeAndStart(purgeRedisClient, function() {
                CB(null, null);
            });
        }
    ],
    function(error, results) {
        callback();
    });
}

function clusterMasterInit(callback)
{
    callback();
}

startJobCluster();

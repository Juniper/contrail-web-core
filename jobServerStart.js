/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
var assert = require('assert');
var cluster = require('cluster');
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

/* Set corePath before loading any other contrail module */
var corePath = process.cwd();
var config =
    require('./src/serverroot/common/config.utils').compareAndMergeDefaultConfig(configFile);

exports.corePath = corePath;
exports.config = config;

var fs              = require('fs');
var kue             = require('kue')
var axon            = require('axon');
var async           = require('async')
var assert          = require('assert');
var global          = require('./src/serverroot/common/global');
var logutils        = require('./src/serverroot/utils/log.utils')
var redisPub        = require('./src/serverroot/jobs/core/redisPub');
var redisUtils      = require('./src/serverroot/utils/redis.utils');
var commonUtils     = require('./src/serverroot/utils/common.utils');
var clusterUtils    = require('./src/serverroot/utils/cluster.utils');

var server_port = (config.redis_server_port) ?
    config.redis_server_port : global.DFLT_REDIS_SERVER_PORT;
var server_ip = (config.redis_server_ip) ?
    config.redis_server_ip : global.DFLT_REDIS_SERVER_IP;

var myIdentity = global.service.MIDDLEWARE;
var discServEnable = ((null != config.discoveryService) &&
                      (null != config.discoveryService.enable)) ?
                      config.discoveryService.enable : true;
var pkgList = commonUtils.mergeAllPackageList(global.service.MIDDLEWARE);
assert(pkgList);
exports.myIdentity = myIdentity;
exports.discServEnable = discServEnable;
exports.pkgList = pkgList;

function loadJobServer ()
{
    var contrailServ = require('./src/serverroot/jobs/core/contrailservice.api');
    var jobsApi = require('./src/serverroot/jobs/core/jobs.api');

    var hostName = config.jobServer.server_ip
        , port = config.jobServer.server_port;

    var workerSock = axon.socket('pull');


    /* Now start real server processing */
    if (false == process.kueReinitReqd) {
        return;
    }
    var purgeRedisClient = redisUtils.createRedisClient();
    jobServerPurgeAndStart(purgeRedisClient, function() {
        startServers();
        process.kueReinitReqd = false;
    });


    /* Function: processMsg
       Handler for message processing for messages coming from main Server
     */
    function processMsg (msg)
    {
        jobsApi.createJobByMsgObj(msg);
    }

    /* Function: connectToMainServer
       This function is used to connect to main Server on host and port
       defined in config.global.js
     */
    var resetDone = false;
    function connectToMainServer ()
    {
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

    function kueJobListen ()
    {
        /* kue UI listening port */
        var kuePort = config.kue.ui_port || 3002;
        kue.app.listen(kuePort, '127.0.0.1');
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
        jobsApi.doCheckJobsProcess();
        contrailServ.getContrailServices();
        contrailServ.startWatchContrailServiceRetryList();
        redisPub.createRedisPubClient(function() {
            connectToMainServer();
            doFeatureTaskInit();
            process.send("INIT IS DONE");
        });
    }
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

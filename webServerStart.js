/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/* Set corePath before loading any other module */
var corePath = process.cwd();
var config = require('./src/serverroot/common/config.utils').compareAndMergeDefaultConfig();
exports.corePath = corePath;
exports.config = config;

var redisUtils = require('./src/serverroot/utils/redis.utils');
var global = require('./src/serverroot/common/global');
var jsonDiff = require('./src/serverroot/common/jsondiff');

var server_port = (config.redis_server_port) ?
    config.redis_server_port : global.DFLT_REDIS_SERVER_PORT;
var server_ip = (config.redis_server_ip) ?
    config.redis_server_ip : global.DFLT_REDIS_SERVER_IP;

redisUtils.createRedisClientAndWait(server_port, server_ip,
                                    global.WEBUI_DFLT_REDIS_DB,
                                    function(redisClient) {
    exports.redisClient = redisClient;
    loadWebServer();
});

function loadWebServer ()
{
var express = require('express')
    , path = require('path')
    , fs = require("fs")
    , http = require('http')
    , https = require("https")
    , underscore = require('underscore')
    , logutils = require('./src/serverroot/utils/log.utils')
    , cluster = require('cluster')
    , axon = require('axon')
    , producerSock = axon.socket('push')
    , redisSub = require('./src/serverroot/web/core/redisSub')
    , global = require('./src/serverroot/common/global')
    , redis = require("redis")
    , eventEmitter = require('events').EventEmitter
    , async = require('async')
    , authApi = require('./src/serverroot/common/auth.api')
    , os = require('os')
    , commonUtils = require('./src/serverroot/utils/common.utils')
    , discClient = require('./src/serverroot/common/discoveryclient.api')
    , assert = require('assert')
    , jsonPath = require('JSONPath').eval
    ;

var pkgList = commonUtils.mergeAllPackageList(global.service.MAINSEREVR);
assert(pkgList);
var nodeWorkerCount = config.node_worker_count;

var server_port = (config.redis_server_port) ?
    config.redis_server_port : global.DFLT_REDIS_SERVER_PORT;
var server_ip = (config.redis_server_ip) ?
    config.redis_server_ip : global.DFLT_REDIS_SERVER_IP;

var RedisStore = require('connect-redis')(express);

var store;
var myIdentity = global.service.MAINSEREVR;
var discServEnable = ((null != config.discoveryService) &&
                      (null != config.discoveryService.enable)) ?
                      config.discoveryService.enable : true;

var sessEvent = new eventEmitter();

var options = {
    key:fs.readFileSync('./keys/cs-key.pem'),
    cert:fs.readFileSync('./keys/cs-cert.pem')
};

var insecureAccessFlag = false;
if (config.insecure_access && (config.insecure_access == true)) {
    insecureAccessFlag = true;
}

var httpsApp = express(),
    httpApp = express(),
    httpPort = config.http_port,
    httpsPort = config.https_port,
    redisPort = (config.redis_server_port) ?
        config.redis_server_port : global.DFLT_REDIS_SERVER_PORT,
    redisIP = (config.redis_server_ip) ?
        config.redis_server_ip : global.DFLT_REDIS_SERVER_IP;

function initializeAppConfig (appObj)
{
    var app = appObj.app;
    var port = appObj.port;
    var secretKey =
        'enterasupbK3xg8qescJK.dUbdgfVq0D70UaLTMGTzO4yx5vVJral2zIhVersecretkey';
    if ((null != config.session) && (null != config.session.secret_key)) {
        secretKey = config.session.secret_key;
    }
    app.set('port', process.env.PORT || port);
    app.use(express.cookieParser());
    store = new RedisStore({host:redisIP, port:redisPort,
                           db:global.WEBUI_SESSION_REDIS_DB,
                           prefix:global.STR_REDIS_STORE_SESSION_ID_PREFIX,
                           eventEmitter:sessEvent});

    app.use(express.session({ store:store,
        secret: secretKey,
        cookie:{
            maxAge:global.MAX_AGE_SESSION_ID
        }}));
        app.use(express.compress());
        app.use(express.methodOverride());
        app.use(express.bodyParser());
        app.use(app.router);
        registerStaticFiles(app);
    // Catch-all error handler
    app.use(function (err, req, res, next) {
        logutils.logger.error(err.stack);
        res.send(500, 'An unexpected error occurred!');
    });
}

function loadStaticFiles (pkgNameObj, callback)
{
    var app     = pkgNameObj['app'];

    /* First register core webroot directory */
    var dirPath = path.join(pkgNameObj['pkgDir'], 'webroot');
    fs.exists(dirPath, function(exists) {
        if (exists) {
            logutils.logger.debug("Registering Static Directory: " + dirPath);
            app.use(express.static(dirPath, {maxAge: 3600*24*3*1000}));
            callback(null);
        }
    });
}

function registerStaticFiles (app)
{
    var pkgDir;
    var staticFileDirLists = [];
    var pkgNameListsLen = pkgList.length;
    for (var i = 0; i < pkgNameListsLen; i++) {
        pkgDir = commonUtils.getPkgPathByPkgName(pkgList[i]['pkgName']);
        staticFileDirLists.push({'app': app, 'pkgDir': pkgDir});
    }
    async.mapSeries(staticFileDirLists, loadStaticFiles, function(err) {
    });
}

function initAppConfig ()
{
    if (false == insecureAccessFlag) {
        httpsApp.configure(function () {
            initializeAppConfig({app:httpsApp, port:httpsPort});
        });
    } else {
        httpApp.configure(function () {
            initializeAppConfig({app:httpApp, port:httpPort});
        });
    }
}

getSessionIdByRedisSessionStore = function(redisStoreSessId) {
    var sessIdPrefix = global.STR_REDIS_STORE_SESSION_ID_PREFIX;
    var pos = redisStoreSessId.indexOf(sessIdPrefix);
    if (pos != -1) {
        return redisStoreSessId.slice(pos + sessIdPrefix.length);
    }
    return redisStoreSessId;
}

/* Set max listeners to 0 */
//store.eventEmitter.setMaxListeners(0);
function registerSessionDeleteEvent ()
{
    store.eventEmitter.on('sessionDeleted', function (sid) {
        /* Handle session delete cases here */
        logutils.logger.debug("Session got expired: " + sid);
    });
}

function loadAllFeatureURLs (myApp)
{
    var pkgDir;
    var pkgListLen = pkgList.length;
    for (var i = 0; i < pkgListLen; i++) {
        if (pkgList[i]['parseURL.xml']) {
            pkgDir = commonUtils.getPkgPathByPkgName(pkgList[i]['pkgName']);
            var urlListLen = pkgList[i]['parseURL.xml'].length;
            for (var j = 0; j < urlListLen; j++) {
                logutils.logger.debug("Registered URLs to APP :" +
                                      pkgDir + pkgList[i]['parseURL.xml'][j]);
                require(pkgDir +
                        pkgList[i]['parseURL.xml'][j]).registerURLsToApp(myApp);
            }
        }
    }
    return;
}

function registerReqToApp ()
{
    var myApp = httpsApp;
    if (true == insecureAccessFlag) {
        myApp = httpApp;
    }
    loadAllFeatureURLs(myApp);
    var handler = require('./src/serverroot/web/routes/handler')
    handler.addAppReqToAllowedList(myApp.routes);
}

function bindProducerSocket ()
{
    var hostName = config.jobServer.server_ip
        , port = config.jobServer.server_port
        ;

    var connectURL = 'tcp://' + hostName + ":" + port;
    /* Master of this nodeJS Server should connect to the worker
       Server of other nodeJS server
     */
    producerSock.bind(connectURL);
    console.log('nodeJS Server bound to port %s to Job Server ', port);
}

function sendRequestToJobServer (msg)
{
    var timer = setInterval(function () {
        console.log("SENDING to jobServer:", msg);
        producerSock.send(msg.reqData);
        clearTimeout(timer);
    }, 1000);
}

function addProducerSockListener ()
{
    producerSock.on('message', function (msg) {
        console.log("Got A message, [%s]", msg);
    });
}

function messageHandler (msg)
{
    if (msg.cmd && msg.cmd == global.STR_SEND_TO_JOB_SERVER) {
        sendRequestToJobServer(msg);
    }
}

var workers = [];
var timeouts = [];

function addClusterEventListener ()
{
    cluster.on('fork', function (worker) {
        logutils.logger.info('Forking worker #', worker.id);
        cluster.workers[worker.id].on('message', messageHandler);
        timeouts[worker.id] = setTimeout(function () {
            logutils.logger.error(['Worker taking too long to start.']);
        }, 2000);
    });
    cluster.on('listening', function (worker, address) {
        logutils.logger.info('Worker #' + worker.id + ' listening on port: '
                             + address.port);
        clearTimeout(timeouts[worker.id]);
    });
    cluster.on('online', function (worker) {
        logutils.logger.info('Worker #' + worker.id + ' is online.');
    });
    cluster.on('exit', function (worker, code, signal) {
        logutils.logger.error(['The worker #' + worker.id +
                              ' has exited with exit code ' +
                              worker.process.exitCode]);
        clearTimeout(timeouts[worker.id]);
        // Don't try to restart the workers when disconnect or destroy has been called
        if (worker.suicide !== true) {
            logutils.logger.debug('Worker #' + worker.id + ' did not commit suicide.');
            workers[worker.id] = cluster.fork();
        }
    });
    cluster.on('disconnect', function (worker) {
        logutils.logger.debug('The worker #' + worker.id + ' has disconnected.');
    });
}

function registerFeatureLists ()
{
    var pkgDir;
    var pkgListLen = pkgList.length;
    for (var i = 0; i < pkgListLen; i++) {
        if (pkgList[i]['featureList.xml']) {
            pkgDir = commonUtils.getPkgPathByPkgName(pkgList[i]['pkgName']);
            var featureLen = pkgList[i]['featureList.xml'].length;
            for (var j = 0; j < featureLen; j++) {
                logutils.logger.debug("Registering feature Lists: " +
                                      pkgDir +
                                      pkgList[i]['featureList.xml'][j]);
                require(pkgDir +
                        pkgList[i]['featureList.xml'][j]).registerFeature();
            }
        }
    }
    return;
}

function checkAndDeleteRedisRDB (callback)
{
    var redisRdb = config.redis_dump_file;
    if (null == redisRdb) {
        redisRdb = '/var/lib/redis/dump-webui.rdb';
    }
    fs.stat(redisRdb, function(err, stats) {
        if ((null == err) && (null != stats) && (0 === stats.size)) {
            logutils.logger.debug('dump-webui.rdb size is 0, trying to ' +
                                 'delete');
            fs.unlink(redisRdb, function(err) {
                if (null != err) {
                    logutils.logger.error('Delete of zero sized ' +
                                          'dump-webui.rdb failed!!!');
                } else {
                    logutils.logger.debug('zero sized dump-webui.rdb ' +
                                          'deleted successfully');
                }
                callback();
            });
        } else {
            callback();
        }
    });
}

function startWebCluster ()
{
    if (cluster.isMaster) {
        clusterMasterInit(function(err) {
            logutils.logger.info("Starting Contrail UI in clustered mode.");
            bindProducerSocket();
            addProducerSockListener();

            var i;
            for (i = 0; i < nodeWorkerCount; i += 1) {
                var worker = cluster.fork();
                workers[i] = worker;
            }

            addClusterEventListener();

            // Trick by Ian Young to make cluster and supervisor play nicely together.
            // https://github.com/isaacs/node-supervisor/issues/40#issuecomment-4330946
            if (process.env.NODE_HOT_RELOAD === 1) {
                var signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
                underscore.each(signals, function (signal) {
                    process.on(signal, function () {
                        underscore.each(cluster.workers, function (worker) {
                            worker.destroy();
                        });
                    });
                });
            }
        });
        doPreStartServer(false);
    } else {
        clusterWorkerInit(function(error) {
            initAppConfig();
            jsonDiff.doFeatureJsonDiffParamsInit();
            registerSessionDeleteEvent();
            registerReqToApp();
            /* Set maxListener to unlimited */
            process.setMaxListeners(0);
            registerFeatureLists();
            redisSub.createRedisClientAndSubscribeMsg(function() {
                discClient.sendWebServerReadyMessage();
            });
            /* All the config should be set before this line */
            startServer();
        });
    }
}

function doPreStartServer (isRetry)
{
    generateLogoFile(isRetry);
    generateFaviconFile(isRetry);
}

function generateLogoFile(isRetry) {
    var rootPath = path.join(__dirname, 'webroot');
    var defLogoFile = '/img/opencontrail-logo.png';
    var srcLogoFile = rootPath + defLogoFile;

    if ((null != config.logo_file) && (false == isRetry)) {
        srcLogoFile = config.logo_file;
    }
    var destLogoFile = rootPath + '/img/sdn-logo.png';
    var cmd = 'cp -f ' + srcLogoFile + " " + destLogoFile;

    commonUtils.executeShellCommand(cmd, function(error, stdout, stderr) {
        if (error) {
            logutils.logger.error("Error occurred while copying logo file:" +
            srcLogoFile + ' to ' + destLogoFile +
            ' ['+ error + ']');
            if (false == isRetry) {
                logutils.logger.error("Retrying Copying default logo");
                generateLogoFile(true);
            } else {
                /* Default logo is also missing !!! */
            }
        }
    });
}

function generateFaviconFile(isRetry) {
    var rootPath = path.join(__dirname, 'webroot');
    var defFaviconFile = '/img/opencontrail-favicon.ico';
    var srcFaviconFile = rootPath + defFaviconFile;

    if ((null != config.favicon_file) && (false == isRetry)) {
        srcFaviconFile = config.favicon_file;
    }
    var destFaviconFile = rootPath + '/img/sdn-favicon.ico';
    var cmdFavicon = 'cp -f ' + srcFaviconFile + " " + destFaviconFile;

    commonUtils.executeShellCommand(cmdFavicon, function(error, stdout, stderr) {
        if (error) {
            logutils.logger.error("Error occurred while copying favicon file:" +
            srcFaviconFile + ' to ' + destFaviconFile +
            ' ['+ error + ']');
            if (false == isRetry) {
                logutils.logger.error("Retrying Copying default favicon");
                generateFaviconFile(true);
            } else {
                /* Default favicon is also missing !!! */
            }
        }
    });
}

function startWebUIService (webUIIP, callback)
{
    httpsServer = https.createServer(options, httpsApp);
    httpsServer.listen(httpsPort, webUIIP, function () {
        logutils.logger.info("Contrail UI HTTPS server listening on host:" + 
                             webUIIP + " Port:" + httpsPort);
    });

    httpServer = http.createServer(httpApp);
    httpServer.listen(httpPort, webUIIP, function () {
        logutils.logger.info("Contrail UI HTTP server listening on host:" + 
                             webUIIP + " Port:" + httpPort);
    });

    httpServer.on('clientError', function(exception, socket) {
        logutils.logger.error("httpServer Exception: on clientError:", 
                               exception, socket);
    });
    httpsServer.on('clientError', function(exception, socket) {
        logutils.logger.error("httpsServer Exception: on clientError:", 
                              exception, socket);
    });
    
    if (false == insecureAccessFlag) {
        httpApp.get("*", function (req, res) {
            var reqHost = req.headers.host;
            var index = reqHost.indexOf(':');
            if (-1 == index) {
                /* here, http port: 80, in case of http port 80, req.headers.host 
                 * does not include port, so add it
                 */
                reqHost = reqHost + ':80';
            }
            var redirectURL = global.HTTPS_URL + 
                reqHost.replace(httpPort, httpsPort) + req.url;
            res.redirect(redirectURL);
        });
    }
    callback(null, null);
}

function checkIfIpAddrAny (ipList)
{
    if (null == ipList) {
        return true;
    }
    var ipCnt = ipList.length;
    for (var i = 0; i < ipCnt; i++) {
        if (ipList[i] == global.IPADDR_ANY) {
            return true;
        }
    }
    return false;
}

function checkIpInConfig (ip)
{
    var ipList = config.webui_addresses;
    if (null == ipList) {
        return false;
    }
    var ipCnt = ipList.length;
    for (var i = 0; i < ipCnt; i++) {
        if (ipList[i] == ip) {
            return true;
        }
    }
    return false;
}

function startServer ()
{
    var ipList = config.webui_addresses;
    var uiIpList = [];
    var k = 0;
    if (null == ipList) {
        /* IPADDR_ANY */
        ipList = [global.IPADDR_ANY];
    }
    
    var ipCnt = ipList.length;
    
    var ifaces = os.networkInterfaces();
    if (checkIfIpAddrAny(ipList) || (null == ifaces)) {
        startWebUIService(global.IPADDR_ANY, function(err, data) {
            logutils.logger.debug("**** Contrail-WebUI Server ****");
        });
        return;
    }
    for (var dev in ifaces) {
        ifaces[dev].forEach(function(details) {
            if (checkIpInConfig(details['address'])) {
                uiIpList[k++] = details['address'];
            }
        });
    }
    if (uiIpList.length == 0) {
        uiIpList = [global.IPADDR_ANY];
    }
    async.mapSeries(uiIpList, startWebUIService, function(err, data) {
        logutils.logger.debug("**** Contrail-WebUI Server ****");
    });
}

/* Function: clusterMasterInit
    Initialization call for Master
 */
function clusterMasterInit (callback)
{
    var mergePath = path.join(__dirname, 'webroot');
    commonUtils.mergeAllMenuXMLFiles(pkgList, mergePath, function() {
        checkAndDeleteRedisRDB(function() {
            callback();
        });
    });
}

/* Function: clusterWorkerInit
    Initialization call for Worker
 */
function clusterWorkerInit (callback)
{
    callback();
}

/* Start Main Server */
startWebCluster();

exports.myIdentity = myIdentity;
exports.discServEnable = discServEnable;
exports.pkgList = pkgList;
}


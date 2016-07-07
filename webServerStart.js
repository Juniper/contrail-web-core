#!/usr/bin/env node
/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
var assert = require('assert');
var clusterUtils = require('./src/serverroot/utils/cluster.utils');
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

var express = require('express')
    , path = require('path')
    , fs = require("fs")
    , http = require('http')
    , https = require("https")
    , underscore = require('underscore')
    , cluster = require('cluster')
    , axon = require('axon')
    , producerSock = axon.socket('push')
    , global = require('./src/serverroot/common/global')
    , redis = require("redis")
    , eventEmitter = require('events').EventEmitter
    , async = require('async')
    , os = require('os')
    , commonUtils = require('./src/serverroot/utils/common.utils')
    , discClient = require('./src/serverroot/common/discoveryclient.api')
    , assert = require('assert')
    , jsonPath = require('JSONPath').eval
    , helmet = require('helmet')
    , logutils = require('./src/serverroot/utils/log.utils')
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
var csrfInvalidEvent = new eventEmitter();

/* Recommended Cipheres */
var defCiphers =
    'ECDHE-RSA-AES256-SHA384:AES256-SHA256:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM';
var serCiphers = ((null != config.server_options) &&
               (null != config.server_options.ciphers)) ?
    config.server_options.ciphers : defCiphers;

var keyFile = './keys/cs-key.pem';
var certFile = './keys/cs-cert.pem';
if (config.server_options) {
    keyFile = config.server_options.key_file;
    if (null != keyFile) {
        keyFile = path.normalize(keyFile);
        if (false == fs.existsSync(keyFile)) {
            keyFile = './keys/cs-key.pem';
        }
    } else {
        keyFile = './keys/cs-key.pem';
    }
    certFile = config.server_options.cert_file;
    if (null != certFile) {
        certFile = path.normalize(certFile);
        if (false == fs.existsSync(certFile)) {
            certFile = './keys/cs-cert.pem';
        }
    } else {
        certFile = './keys/cs-cert.pem';
    }
}
var options = {
    key:fs.readFileSync(keyFile),
    cert:fs.readFileSync(certFile),
    /* From https://github.com/nodejs/node-v0.x-archive/issues/2727
       https://github.com/nodejs/node-v0.x-archive/pull/2732/files
     */
    ciphers: serCiphers,
    honorCipherOrder: true
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

    // Implement X-XSS-Protection
    app.use(helmet.xssFilter());
    // Implement X-Frame: Deny
    app.use(helmet.xframe('deny'));
    // Implement Strict-Transport-Security
    var maxAgeTime =
        ((null != config.session) && (null != config.session.timeout)) ?
        config.session.timeout : global.MAX_AGE_SESSION_ID;

    var compressOptions = {
        filter: function(req, res) {
            //To enable gzip compression for xml,tmpl,...files
            return /json|text|xml|javascript|tmpl/.test(res.getHeader('Content-Type'))
        }
    };
    app.use(express.compress(compressOptions));
    express.static.mime.define({'text/tmpl': ['tmpl']});
    registerStaticFiles(app);
    app.use(helmet.hsts({
        maxAge: maxAgeTime,
        includeSubdomains: true
    }));
    var cookieObj = {maxAge: maxAgeTime, httpOnly: true};
    if (false == insecureAccessFlag) {
        cookieObj['secure'] = true;
    }
    app.use(express.session({ store:store,
        secret: secretKey,
        cookie: cookieObj
        }));
        app.use(express.methodOverride());
        app.use(express.bodyParser());
        app.use(app.router);
        // Catch-all error handler
        app.use(function (err, req, res, next) {
            logutils.logger.error(err.stack);
            res.send(500, 'An unexpected error occurred!');
        });
}

function loadStaticFiles (app, pkgDir)
{
    var dirPath = path.join(pkgDir, 'webroot');
    var fsStat = fs.statSync(dirPath);
    if ((null != fsStat) && (true == fsStat.isDirectory())) {
        logutils.logger.debug("Registering Static Directory: " + dirPath);
        app.use(express.static(dirPath, {maxAge: 3600*24*3*1000}));
    }
}

function registerStaticFiles (app)
{
    var pkgDir;
    var staticFileDirLists = [];
    var pkgNameListsLen = pkgList.length;
    for (var i = 0; i < pkgNameListsLen; i++) {
        pkgDir = commonUtils.getPkgPathByPkgName(pkgList[i]['pkgName']);
        loadStaticFiles(app, pkgDir);
    }
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

    var csrfOptions = {eventEmitter: csrfInvalidEvent};
    var csrf = express.csrf(csrfOptions);
    //Populate the CSRF token in req.session on login request
    myApp.get('/', csrf);
    myApp.get('/vcenter', csrf);
    //Enable CSRF token check for all URLs starting with "/api"
    myApp.all('/api/*', csrf);

    loadAllFeatureURLs(myApp);
    var handler = require('./src/serverroot/web/routes/handler')
    handler.addAppReqToAllowedList(myApp.routes);
    csrfInvalidEvent.on('csrfInvalidated', function(req, res) {
        logutils.logger.debug('_csrf token got invalidated');
        commonUtils.redirectToLogout(req, res);
    });
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
    logutils.logger.debug('Web Server bound to port ' + port +
                          ' to Job Server');
    return;
}

function sendRequestToJobServer (msg)
{
    var timer = setInterval(function () {
        //logutils.logger.debug("SENDING to jobServer:" + msg.reqData);
        //console.log("Getting producerSock as:", producerSock);
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
    console.log("Got from worker process:", msg);
    if ((null != msg) && (null != msg.cmd)) {
        switch (msg.cmd) {
        case global.STR_SEND_TO_JOB_SERVER:
            sendRequestToJobServer(msg);
            break;
        default:
            logutils.logger.error('Unknown cmd: ' + msg.cmd);
            break;
        }
    }
}

var workers = [];
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
            /**
             * Debug logic fix from https://github.com/nodejs/node-v0.x-archive/issues/5318
             * To enable server side debug, start the server by: node --debug webServerStart.js
             * attach node-inspector --web-port=8090 --debug-port=5859
             * access http://localhost:8090
             */
            var debug = process.execArgv.indexOf('--debug') !== -1;
            cluster.setupMaster({
                execArgv: process.execArgv.filter(function(s) { return s !== '--debug' })
            });
            for (var i = 0; i < nodeWorkerCount; i += 1) {
                if (debug) cluster.settings.execArgv.push('--debug=' + (5859 + i));
                var worker = cluster.fork();
                if (debug) cluster.settings.execArgv.pop();
                workers[i] = worker;
            }

            clusterUtils.addClusterEventListener(messageHandler);

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
            var jsonDiff = require('./src/serverroot/common/jsondiff');
            var redisSub = require('./src/serverroot/web/core/redisSub');
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
        logutils.logger.error("httpServer Exception: on clientError:" +
                               exception);
    });
    httpsServer.on('clientError', function(exception, socket) {
        logutils.logger.error("httpsServer Exception: on clientError:" +
                              exception);
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
    var parseXMLList = require('./src/tools/parseXMLList');
    var mergePath = path.join(__dirname, 'webroot');
    async.parallel([
        function(CB) {
            commonUtils.mergeAllMenuXMLFiles(pkgList, mergePath, function() {
                CB(null, null);
            });
        },
        function(CB) {
            parseXMLList.readAndParseRoleListFile(function() {
                CB(null, null);
            });
        },
        function(CB) {
            checkAndDeleteRedisRDB(function() {
                CB(null, null);
            });
        },
        function(CB) {
            var regionJs = require('./src/tools/parseRegion');
            regionJs.createRegionFile(function() {
                CB(null, null);
            });
        }
    ],
    function(error, results) {
        callback();
    });
}

/* Function: clusterWorkerInit
    Initialization call for Worker
 */
function clusterWorkerInit (callback)
{
    redisUtils.createRedisClientAndWait(server_port, server_ip,
                                    global.WEBUI_DFLT_REDIS_DB,
                                    function(redisClient) {
        exports.redisClient = redisClient;
        callback();
    });
}

/* Start Main Server */
startWebCluster();

exports.myIdentity = myIdentity;
exports.discServEnable = discServEnable;
exports.pkgList = pkgList;


/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

var express = require('express')
	, handler = require('./src/serverroot/web/routes/handler')
	, path = require('path')
	, fs = require("fs")
	, http = require('http')
	, https = require("https")
	, underscore = require('underscore')
	, config = require('./config/config.global.js')
	, logutils = require('./src/serverroot/utils/log.utils')
	, cluster = require('cluster')
	, nodeWorkerCount = config.node_worker_count
	, axon = require('axon')
	, producerSock = axon.socket('push')
	, redisSub = require('./src/serverroot/web/core/redisSub')
	, global = require('./src/serverroot/common/global')
	, redis = require("redis")
	, eventEmitter = require('events').EventEmitter
	, urlRoutes = require('./src/serverroot/web/routes/url.routes')
    , authApi = require('./src/serverroot/common/auth.api')
    , async = require('async')
    , os = require('os')
    , commonUtils = require('./src/serverroot/utils/common.utils')
    , discClient = require('./src/serverroot/common/discoveryclient.api')
	, featureList = require('./src/serverroot/web/core/feature.list.js');

var server_port = (config.redis_server_port) ?
	config.redis_server_port : global.DFLT_REDIS_SERVER_PORT;
var server_ip = (config.redis_server_ip) ?
	config.redis_server_ip : global.DFLT_REDIS_SERVER_IP;

var redisClient = redis.createClient(server_port,
	server_ip);
var RedisStore = require('./lib/connect-redis')(express);

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
		config.redis_server_port : global.DFLT_REDIS_SERVER_PORT;
redisIP = (config.redis_server_ip) ?
	config.redis_server_ip : global.DFLT_REDIS_SERVER_IP;

function initializeAppConfig (appObj)
{
    var app = appObj.app;
    var port = appObj.port;
    app.set('port', process.env.PORT || port);
    app.use(express.cookieParser());
    store = new RedisStore({host:redisIP, port:redisPort,
        prefix:global.STR_REDIS_STORE_SESSION_ID_PREFIX,
        eventEmitter:sessEvent});

    app.use(express.session({ store:store,
        secret:'enterasupbK3xg8qescJK.dUbdgfVq0D70UaLTMGTzO4yx5vVJral2zIhVersecretkey',
        cookie:{
            maxAge:global.MAX_AGE_SESSION_ID
        }}));
        app.use(express.compress());
        app.use(express.methodOverride());
        app.use(express.bodyParser());
        app.use(app.router);
        app.use(express.static(path.join(__dirname, 'webroot'), {maxAge: 3600*24*3*1000}));

    // Catch-all error handler
    app.use(function (err, req, res, next) {
        logutils.logger.error(err.stack);
        res.send(500, 'An unexpected error occurred!');
    });
}

if (false == insecureAccessFlag) {
    httpsApp.configure(function () {
        initializeAppConfig({app:httpsApp, port:httpsPort});
    });
} else {
    httpApp.configure(function () {
        initializeAppConfig({app:httpApp, port:httpPort});
    });
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
store.eventEmitter.on('sessionDeleted', function (sid) {
	/* Handle session delete cases here */
	console.log("Session got expired:", sid);
    /* Delete authKey from Redis for this Session ID */
    /* NOTE: sid is of format as: 
       global.STR_REDIS_STORE_SESSION_ID_PREFIXsessionId, so extract sessionId
       from here
     */
    var sessionId = getSessionIdByRedisSessionStore(sid);
    authApi.deleteAuthDataBySessionId(sessionId);
});

registerReqToApp = function () {
    var myApp = httpsApp;
    if (true == insecureAccessFlag) {
        myApp = httpApp;
    }
	urlRoutes.registerURLsToApp(myApp);
	handler.addAppReqToAllowedList(myApp.routes);
}

bindProducerSocket = function () {
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

sendRequestToJobServer = function (msg) {
	var timer = setInterval(function () {
		console.log("SENDING to jobServer:", msg);
		producerSock.send(msg.reqData);
		clearTimeout(timer);
	}, 1000);
}

addProducerSockListener = function () {
	producerSock.on('message', function (msg) {
		console.log("Got A message, [%s]", msg);
	});
}

messageHandler = function (msg) {
	if (msg.cmd && msg.cmd == global.STR_SEND_TO_JOB_SERVER) {
		sendRequestToJobServer(msg);
	}
}

var workers = [];
var timeouts = [];

addClusterEventListener = function () {
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

if (cluster.isMaster) {// && (process.env.NODE_CLUSTERED == 1)) {
  checkAndDeleteRedisRDB(function() {
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
    doPreStartServer(false);
  });
} else {
	registerReqToApp();
	/* Set maxListener to unlimited */
	process.setMaxListeners(0);
	featureList.registerFeature();
    redisSub.createRedisClientAndSubscribeMsg(function() {
        discClient.sendWebServerReadyMessage();
    });

    /* All the config should be set before this line */
    startServer();
}

function doPreStartServer (isRetry)
{
    var rootPath = path.join(__dirname, 'webroot');
    var defLogoFile = '/img/juniper-networks-logo.png';
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
                doPreStartServer(true);
            } else {
                /* Default logo is also missing !!! */
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
            var redirectURL = 'https://' + 
                req.headers.host.replace(httpPort, httpsPort) + req.url;
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

exports.myIdentity = myIdentity;
exports.discServEnable = discServEnable;


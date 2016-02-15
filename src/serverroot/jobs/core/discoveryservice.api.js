/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var config = process.mainModule.exports.config,
    rest = require('../../common/rest.api'),
    async = require('async'),
    logutils = require('../../utils/log.utils'),
    discClient = require('../../common/discoveryclient.api'),
    commonUtils = require('../../utils/common.utils'),
    os = require('os')
    ;

var discServiceRetryList = [];
var serviceTimers = {};

var server_ip = ((null != config) && (null != config.discoveryService) &&
                 (null != config.discoveryService.server_ip)) ? config.discoveryService.server_ip:
                  global.DFLT_SERVER_IP;

var server_port = (( null != config) && (null != config.discoveryService) &&
                   (null != config.discoveryService.server_port)) ?
                    config.discoveryService.server_port : '5998';

var discServer = rest.getAPIServer({apiName: global.label.DISCOVERY_SERVER,
                                   server: server_ip, port: server_port});
var discLocalServer = rest.getAPIServer({apiName: global.label.DISCOVERY_SERVER,
                                        server: global.DFLT_SERVER_IP,
                                        port: server_port});

var redisPubClient;
var redisSubClient;
var clientID = null;
var discServiceSubsStarted = false;

function createRedisClientAndStartSubscribeToDiscoveryService (reqFrom)
{
    if (null == redisSubClient) {
        commonUtils.createRedisClient(function(client) {
            redisSubClient = client;
            redisSubClient.subscribe(global.DISC_SERVER_SUB_CLIENT_RESPONSE);
            startSubscribeToDiscoveryServiceOrSendData(reqFrom);
        });
        commonUtils.createRedisClient(function(client) {
            redisPubClient = client;
        });
    } else {
        startSubscribeToDiscoveryServiceOrSendData(reqFrom);
    }
}

function subscribeToDiscoveryService (serviceObj, callback)
{
    var clientType  = "ContrailWebUI";
    var serviceName = serviceObj['serviceType'];
    var instCnt     = serviceObj['instCnt'];

    var clientID  = os.hostname() + ':' + clientType;
    var postJson =  
        { "service": serviceName, "instances": instCnt, "client": clientID,
            "client-type": clientType};
    var url = '/subscribe';

    discServer.api.post(url, postJson, function(err, data) {
        if ((null != err) && (('ECONNREFUSED' == err.code) || 
                               ('ETIMEOUT' == err.code))) {
            discLocalServer.api.post(url, postJson, function(err, data) {
                callback(err, data);
            });
        } else {
            callback(err, data);
        }
    });
}

function lookupDBAndSendDiscServerResponseToMainServer ()
{
    var serviceRespData = discClient.getServiceRespDataList();
    for (var key in serviceRespData) {
        if (null != serviceRespData[key]) {
            sendDiscServerResponseToMainServer(serviceRespData[key]['service'],
                                               serviceRespData[key]['data']);
        }
    }
}

function startSubscribeToDiscoveryServiceOrSendData (reqFrom)
{
    if (false == discServiceSubsStarted) {
        discServiceSubsStarted = true;
        startSubscribeToDiscoveryService();
    } else {
        if (global.service.MAINSEREVR == reqFrom) {
            /* mainWebServer has started later than jobServer, so no need to do
             * subscribe again, just send the stored service response to main
             * Server
             */
            lookupDBAndSendDiscServerResponseToMainServer();
        }
    }
}

function startSubscribeToDiscoveryService ()
{
    var serviceList = [];
    /* List the services */
    serviceList[0] = {};
    serviceList[0]['serviceType'] =
        global.DISC_SERVICE_TYPE_OP_SERVER;
    serviceList[0]['instCnt'] = global.DISC_SERVICE_MAX_INST_COUNT_OP_SERVER;

    serviceList[1] = {};
    serviceList[1]['serviceType'] = 
        global.DISC_SERVICE_TYPE_API_SERVER;
    serviceList[1]['instCnt'] = global.DISC_SERVICE_MAX_INST_COUNT_API_SERVER;

    var len = serviceList.length;
    async.map(serviceList, subscribeToDiscoveryService, function(err, data) {
        /* Send the Service responses to all the worker processes */
        for (var i = 0; i < len; i++) {
            doProcessDiscServerResponse(serviceList[i], data[i], false); 
        }
    });
}

function getInstCountByServiceType (serviceType)
{
    switch (serviceType) {
    case global.DISC_SERVICE_TYPE_OP_SERVER:
        return global.DISC_SERVICE_MAX_INST_COUNT_OP_SERVER;
    case global.DISC_SERVICE_TYPE_API_SERVER:
        return global.DISC_SERVICE_MAX_INST_COUNT_API_SERVER;
    default:
        return global.DISC_SERVICE_MAX_INST_COUNT;
    }
}

function subscribeDiscoveryServiceOnDemand (serviceType)
{
    var serviceObj = {};
    serviceObj['serviceType'] = serviceType;
    serviceObj['instCnt'] = getInstCountByServiceType(serviceType);;
    subscribeToDiscoveryService(serviceObj, function(err, data) {
        doProcessDiscServerResponse(serviceObj, data, true);
    });
}
function doDiscoveryServiceSubscribe (req, res, appData)
{
    var service     = req.param('serviceType');
    var instCnt     = req.param('instCnt');
    startSubscribeToDiscoveryService();
    var servObj = {};
    servObj['serviceType'] = service;
    servObj['instCnt'] = (null == instCnt) ? global.DISC_SERVICE_MAX_INST_COUNT
        : parseInt(instCnt);
    subscribeToDiscoveryService(servObj, function(err, data) {
        commonUtils.handleJSONResponse(err, res, data);
    });
}

var prevDiscServerResponseObj = {};

function doCheckDiscServerResponse (service, data)
{
    var flag = false;
    var serviceType = service['serviceType'];

    try {
        var servLen = data[serviceType].length;
        var dataLen = data[serviceType].length;
        if (servLen != dataLen) {
            return true;
        }
        for (var i = 0; i < servLen; i++) {
            if (prevDiscServerResponseObj[serviceType][i]['ip-address'] !=
                data[serviceType][i]['ip-address']) {
                flag = true;
            }
            if (prevDiscServerResponseObj[serviceType][i]['port'] !=
                data[serviceType][i]['port']) {
                flag = true;
            }
        }
    } catch(e) {
        flag = true;
    }
    prevDiscServerResponseObj[serviceType] = {};
    prevDiscServerResponseObj[serviceType] = data[serviceType];

    return flag;
}

function doProcessDiscServerResponse (service, data, forceSendToMainServer)
{
    /* Store the service response */
    discClient.storeServiceRespData(service, data);
    /* Do basic validation before sending to other servers */
    if ((null == data) || (null == data['ttl'])) {
        logutils.logger.debug("DiscService Response inserted in retry list " +
                              "for service:" + JSON.stringify(service));
        var retryListCnt = discServiceRetryList.length;
        discServiceRetryList[retryListCnt] = service;
    } else {
        if ((true == forceSendToMainServer) ||
            (true == doCheckDiscServerResponse(service, data))) {
            sendDiscServerResponseToMainServer(service, data);
        }
    }
    startsubscribeToDiscoveryServiceTimer(service, data);
}

function startsubscribeToDiscoveryServiceTimer (service, data)
{
    var ttl = ((data) && (data['ttl'])) ? data['ttl'] * 1000 : 1 * 60 * 1000;
    if (null != serviceTimers[service['serviceType']]) {
        clearTimeout(serviceTimers[service['serviceType']]);
    }
    serviceTimers[service['serviceType']] = setTimeout(function() {
        subscribeToDiscoveryService(service, function(err, data) {
            /* Store the service response */
            discClient.storeServiceRespData(service, data);
            sendDiscServerResponseToMainServer(service, data);
            startsubscribeToDiscoveryServiceTimer(service, data);
        });
    }, ttl);
}

function sendDiscServerResponseToMainServer (service, data)
{
    var msg = {};
    msg['cmd'] = global.STR_DISCOVERY_SERVICE_RESPONSE;
    msg['serviceResponse'] = {
        service: service,
        data: data
    };
    if (true == doCheckDiscServerResponse(service, data)) {
        /* Log Only if change happens */
        logutils.logger.debug("Sending DiscService Msg To MainServer:" + 
                              JSON.stringify(msg));
    }
    redisPubClient.publish(global.DISC_SERVER_SUB_CLINET, JSON.stringify(msg));
}

function watchDiscServiceRetryList ()
{
    var retryList = [];
    var listLen = discServiceRetryList.length;
    var j = 0;

    if (listLen == 0) {
        return;
    }
    for (var i = 0; i < listLen; i++) {
        if (discServiceRetryList[i]) {
            retryList[j++] = discServiceRetryList[i];
        }
        discServiceRetryList.splice(i, 1);
        i = -1;
        listLen--;
    }

    listLen = 0;
    async.map(retryList, subscribeToDiscoveryService, function(err, data) {
        if ((null == err) && (data)) {
            for (i = 0; i < j; i++) {
                if (data[i]['ttl'] == null) {
                    discServiceRetryList[listLen++] = data[i];
                    return;
                }
                doProcessDiscServerResponse(retryList[i], data[i], false);
            }
        }
    });
}

function startWatchDiscServiceRetryList ()
{
    setInterval (function() {
        watchDiscServiceRetryList();
    }, 60000);
}

exports.doDiscoveryServiceSubscribe = doDiscoveryServiceSubscribe;
exports.startSubscribeToDiscoveryService = startSubscribeToDiscoveryService;
exports.subscribeToDiscoveryService = subscribeToDiscoveryService;
exports.createRedisClientAndStartSubscribeToDiscoveryService =
    createRedisClientAndStartSubscribeToDiscoveryService;
exports.startWatchDiscServiceRetryList = startWatchDiscServiceRetryList;
exports.subscribeDiscoveryServiceOnDemand = subscribeDiscoveryServiceOnDemand;


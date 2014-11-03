/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var global = require('./global'),
    config = process.mainModule.exports.config,
    commonUtils = require('../utils/common.utils'),
    logutils = require('../utils/log.utils');

var serviceRespData = {};

function checkIfServiceRespDataExists (service, data)
{
    try {
        var serviceType = service['serviceType'];
        var svcData = serviceRespData[serviceType]['data'][serviceType];
        if (null == svcData) {
            return false;
        }
        var svcCnt = svcData.length;
        var dataCnt = data[serviceType].length;
        if (svcCnt != dataCnt) {
            return false;
        }
        for (var i = 0; i < svcCnt; i++) {
            if (svcData[i]['ip-address'] != 
                data[serviceType][i]['ip-address']) {
                return false;
            }
            if (svcData[i]['port'] != data[serviceType][i]['port']) {
                return false;
            }
        }
    } catch(e) {
        return false;
    }
    return true;
}

function storeServiceRespData (service, data)
{
    if ((null == service) || (null == data) || (null == data['ttl'])) {
        return;
    }
    var serviceType = service['serviceType'];
    if (null == serviceRespData[serviceType]) {
        serviceRespData[serviceType] = {};
    }

    if (false == checkIfServiceRespDataExists(service, data)) {
        /* Log Only if change happens */
        logutils.logger.debug("DiscService Response Updated by process:" + 
                              process.pid + " " + JSON.stringify(data));
    }
    serviceRespData[serviceType]['service'] = service;
    serviceRespData[serviceType]['data'] = data;
}

function getServiceRespDataList ()
{
    return serviceRespData;
}

/* Function: getDiscServiceByServiceType
   This function uses load balancing internally
   Always it returns the first server IP/Port combination in the service list and
   pushes that at the end, such that next time when new request comes then this
   server should be requested at last, as we have already sent the request to
   this server.
 */
function getDiscServiceByServiceType (serviceType)
{
    if (null != serviceRespData[serviceType]) {
        try {
            var service =
                serviceRespData[serviceType]['data'][serviceType].shift();
            serviceRespData[serviceType]['data'][serviceType].push(service);
            return service;
        } catch(e) {
        }
    }
    //logutils.logger.error("Unknown Service Type Request Rxed in " +
     //                     "getDiscServiceByServiceType(): " + serviceType);
    return null;
}

function getDiscServiceByApiServerType (apiServerType)
{
    var service     = null;
    var serviceType = null;
    var respObj = [];

    switch (apiServerType) {
    case global.label.OPS_API_SERVER:
        serviceType = global.DISC_SERVICE_TYPE_OP_SERVER;
        break;

    case global.label.VNCONFIG_API_SERVER:
        serviceType = global.DISC_SERVICE_TYPE_API_SERVER;
        break;

    default:
    //    logutils.logger.debug("Unknown Discovery Server Service Type:" + 
    //                          apiServerType);
        return null;
    }
    return getDiscServiceByServiceType(serviceType);
}

function processDiscoveryServiceResponseMsg (msg)
{
    if (null == msg) {
        return;
    }
    msg = JSON.parse(msg.toString());
    if (msg && msg['serviceResponse']) { 
        storeServiceRespData(msg['serviceResponse']['service'],
                             msg['serviceResponse']['data']);
    }
}

function getServerTypeByServerName (serverName)
{
    switch (serverName) {
    case global.label.OPS_API_SERVER:
        return global.DISC_SERVICE_TYPE_OP_SERVER;
    case global.label.OPS_API_SERVER:
    case global.label.VNCONFIG_API_SERVER:
        return global.DISC_SERVICE_TYPE_API_SERVER;
    default:
        return null;
    }
}

function sendWebServerReadyMessage ()
{
    var data = {};
    data['jobType'] = global.STR_MAIN_WEB_SERVER_READY;
    data = JSON.stringify(data);
    var msg = {
        cmd: global.STR_SEND_TO_JOB_SERVER,
        reqData: data
    };
    process.send(msg);
}

function sendDiscSubscribeMsgToJobServer (serverType)
{
    var data = {};
    data['jobType'] = global.STR_DISC_SUBSCRIBE_MSG;
    data['serverType'] = serverType;
    data = JSON.stringify(data);
    var msg = {
        cmd: global.STR_SEND_TO_JOB_SERVER,
        reqData: data
    };
    process.send(msg);
}

function sendDiscSubMessageOnDemand (apiName)
{
    var myId = process.mainModule.exports['myIdentity'];
    var servType = getServerTypeByServerName(apiName);
    if (null == servType) {
        logutils.logger.error("Unknown Discovery serviceType in " +
                              "sendDiscSubMessageOnDemand() : " + servType);
        return;
    }
    if (global.service.MAINSEREVR == myId) {
        sendDiscSubscribeMsgToJobServer(servType);
    } else {
        try {
            discServ = require('../jobs/core/discoveryservice.api');
            discServ.subscribeDiscoveryServiceOnDemand(servType);
        } catch(e) {
            logutils.logger.error('Module discoveryservice.api can not be ' +
                                  'found');
        }
    }
}

function resetServicesByParams (params, apiName)
{
    var serviceType = getServerTypeByServerName(apiName);
    if (null == serviceType) {
        return null;
    }
    try {
        var servData = serviceRespData[serviceType]['data'][serviceType];
        var servCnt = servData.length;
        if (servCnt <= 1) {
            /* Only one/no server, so no need to do any params update, as no other
             * server available 
             */
            return null;
        }
        for (var i = 0; i < servCnt; i++) {
            if ((servData[i]['ip-address'] == params['url']) && 
                (servData[i]['port'] == params['port'])) {
                serviceRespData[serviceType]['data'][serviceType].splice(i, 1);
                break;
            }
        }
        params['url'] =
            serviceRespData[serviceType]['data'][serviceType][0]['ip-address'];
        params['port'] =
            serviceRespData[serviceType]['data'][serviceType][0]['port'];
    } catch(e) {
        logutils.logger.error("In resetServicesByParams(): exception occurred" +
                              " " + e);
        return null;
    }
    return params;
}

exports.resetServicesByParams = resetServicesByParams;
exports.storeServiceRespData = storeServiceRespData;
exports.getServiceRespDataList = getServiceRespDataList;
exports.getDiscServiceByApiServerType = getDiscServiceByApiServerType;
exports.getDiscServiceByServiceType = getDiscServiceByServiceType;
exports.processDiscoveryServiceResponseMsg = processDiscoveryServiceResponseMsg;
exports.sendWebServerReadyMessage = sendWebServerReadyMessage;
exports.sendDiscSubMessageOnDemand = sendDiscSubMessageOnDemand;


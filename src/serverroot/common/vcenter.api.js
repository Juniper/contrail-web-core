/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * This file contains the wrapper functions for Config API Server
 */

var global = require('./global');
var assert = require('assert');
var config = process.mainModule.exports["config"];
var plugins = require('../orchestration/plugins/plugins.api');
var soap = require('./soap.api');
var fs = require('fs');
var easySoap = require('easysoap');
var logutils = require('../utils/log.utils');
var orchApi = require('../orchestration/orchestration.api');

function getApiServerRequestedByData (appData, reqBy)
{
    return plugins.getApiServerRequestedByData(appData, reqBy);
}

function doCall (userData, appData, callback)
{
    var service = getApiServerRequestedByData(appData,
                                              global.label.VCENTER_SERVER);
    service.doCall(userData, appData, function(err, data, resHeaders) {
        callback(err, data, resHeaders);
    });
}

function createvCenterSoapApi (serverType)
{
    var orchMods = orchApi.getOrchestrationModels();
    if (-1 == orchMods.indexOf('vcenter')) {
        return null;
    }
    if (config.vcenter) {
        if (config.vcenter.server_ip) {
            serverIp = config.vcenter.server_ip;
        } else {
            serverIp = global.DFLT_SERVER_IP;
        }
        if (config.vcenter.sdkPath) {
            sdkPath = config.vcenter.sdkPath;
        } else {
            sdkPath = global.VCENTER_SDK_PATH;
        }
        if (config.vcenter.wsdl) {
            wsdlPath = config.vcenter.wsdl;
            if (false == fs.existsSync(wsdlPath)) {
                logutils.logger.error("wsdl file not found at :" + wsdlPath);
                wsdlPath = process.mainModule.exports['corePath'] +
                    '/' + global.VCENTER_WSDL;
                logutils.logger.debug("Trying to load default wsdl file:" + wsdlPath);
                if (false == fs.existsSync(wsdlPath)) {
                    logutils.logger.error("default wsdl file not found at :" +
                                          wsdlPath);
                }
            }
        } else {
            wsdlPath = process.mainModule.exports['corePath'] + "/" + global.VCENTER_WSDL;
            if (false == fs.existsSync(wsdlPath)) {
                logutils.logger.error("default wsdl file not found at :" +
                                      wsdlPath);
            }
        }
    }

    var clientParams = {
        host: serverIp,
        path: sdkPath,
        wsdl: wsdlPath
    };
    var clientOptions = {
        secure: true
    };
    var soapClient = new easySoap.Client(clientParams, clientOptions);
    var vCenterServer =
        soap.getSOAPApiServer({apiName: global.label.VCENTER_SERVER,
                              soapClient: soapClient});
    return vCenterServer;
}

exports.doCall = doCall;
exports.createvCenterSoapApi = createvCenterSoapApi;


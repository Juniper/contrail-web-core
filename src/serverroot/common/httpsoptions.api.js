/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var fs      = require('fs');
var config  = process.mainModule.exports.config;
var request = require('request');
var restler = require('restler');

/* Function: getHttpsOptionsDefValue
    Get the default value for https options
 */

var apiProtocolList = {};
/* Function: getHttpsOptionsDefValue
   Get the default value for HTTPS options
 */
function getHttpsOptionsDefValue (reqType)
{
    switch (reqType) {
    case 'authProtocol':
        return 'http';
    case 'strictSSL':
        return false;
    case 'ca':
    default:
        return null;
    }
}

/* Function getHttpsOptionsByAPIType
    Get the https request option values from config file
 */
function getHttpsOptionsByAPIType (apiType, reqType)
{
    var defVal = getHttpsOptionsDefValue(reqType);
    if (null == apiType) {
        return defVal;
    }
    var orchModule = getOrchModuleByAPIType(apiType);
    if (null == orchModule) {
        return defVal;
    }
    if ((null != config) && (null != config[orchModule]) &&
        (null != config[orchModule][reqType])) {
        return config[orchModule][reqType];
    }
    return defVal;
}

/* Function: getOrchModuleByAPIType
    Get the Orchestration Module name by REST Api Type
 */
function getOrchModuleByAPIType (apiType)
{
    var orchModule = null;

    switch (apiType) {
    case global.label.IDENTITY_SERVER:
        orchModule = 'identityManager';
        break;
    case global.label.NETWORK_SERVER:
        orchModule = 'networkManager';
        break;
    case global.label.IMAGE_SERVER:
        orchModule = 'imageManager';
        break;
    case global.label.STORAGE_SERVER:
        orchModule = 'storageManager';
        break;
    case global.label.COMPUTE_SERVER:
        orchModule = 'computeManager';
        break;
    case global.label.VNCONFIG_API_SERVER:
    case global.label.API_SERVER:
        orchModule = 'cnfg';
        break;
    case global.label.OPS_API_SERVER:
        orchModule = 'analytics';
        break;
    case global.label.DISCOVERY_SERVER:
        orchModule = 'discoveryService';
        break;
    default:
        break;
    }
    return orchModule;
}

/* Function: getProtocolByAPIType
    Get the protocol either http/https to connect to backend server 
 */
function getProtocolByAPIType (apiType)
{
    if (null != apiProtocolList[apiType]) {
        return apiProtocolList[apiType];
    }
    var orchModule = null;
    var defProtocol = global.PROTOCOL_HTTP;
    if (null == apiType) {
        return defProtocol;
    }
    orchModule = getOrchModuleByAPIType(apiType);
    if (null == orchModule) {
        return defProtocol;
    }
    if ((null != config) && (null != config[orchModule]) &&
        (null != config[orchModule]['authProtocol']) &&
        ((global.PROTOCOL_HTTP == config[orchModule]['authProtocol']) ||
         (global.PROTOCOL_HTTPS == config[orchModule]['authProtocol']))) {
        return config[orchModule]['authProtocol'];
    }
    return defProtocol;
}

/* Function: getAppReqHeader
    Add protocol field along with other header fields sent from APP
 */
function getAppReqHeader (dataObj, apiType)
{
    var headers = dataObj['headers'] || {};
    if (null == apiType) {
        apiType = dataObj['apiType'];
    }
    var protocol = getProtocolByAPIType(apiType);
    headers['protocol'] = protocol;
    return headers;
}

/* Function: updateHttpsSecureOptions
    Get the HTTPS Secure config option values
 */
function updateHttpsSecureOptions (apiType, options)
{
    var proto = getProtocolByAPIType(apiType);
    if (global.PROTOCOL_HTTPS == proto) {
        options['headers']['protocol'] = global.PROTOCOL_HTTPS;
        var caFile = getHttpsOptionsByAPIType(apiType, 'ca');
        if ((null != caFile) && ('' != caFile) && ("" != caFile)) {
            try {
                options['ca'] = fs.readFileSync(caFile);
            } catch(e) {
                logutils.logger.error('readFileSync error for ca file' + e);
            }
        }
        /* If strictSSL is set to false, then if response.client.authorized
         * is set as false, a secure connection is established.
         */
        var strictSSL = getHttpsOptionsByAPIType(apiType, 'strictSSL');
        if (null != strictSSL) {
            options['strictSSL'] = strictSSL;
        }
    }
    return options;
}

/* Function: makeHttpOrHttpsGetRestCall
    Make a http/https GET request to backend server
 */
function makeHttpOrHttpsGetRestCall (makeCB, dataObj, callback)
{
    var reqUrl = dataObj['reqUrl'];

    var headers = getAppReqHeader(dataObj, makeCB.name);
    makeCB.get(reqUrl, function(err, data) {
        callback(err, data);
    }, headers);
}

/* Function: makeHttpOrHttpsPostRestCall
    Make a http/https POST request to backend server
 */
function makeHttpOrHttpsPostRestCall (makeCB, dataObj, callback)
{
    var reqUrl = dataObj['reqUrl'];
    var data = dataObj['data'];

    var headers = getAppReqHeader(dataObj, makeCB.name);
    makeCB.post(reqUrl, data, function(err, data) {
        callback(err, data);
    }, headers);
}
/* Function: makeHttpOrHttpsPutRestCall
    Make a http/https PUT request to backend server
 */
function makeHttpOrHttpsPutRestCall (makeCB, dataObj, callback)
{
    var reqUrl = dataObj['reqUrl'];
    var data = dataObj['data'];

    var headers = getAppReqHeader(dataObj, makeCB.name);
    makeCB.post(reqUrl, data, function(err, data) {
        callback(err, data);
    }, headers);
}

/* Function: makeHttpOrHttpsDelRestCall
    Make a http/https DELETE request to backend server
 */
function makeHttpOrHttpsDelRestCall (makeCB, dataObj, callback)
{
    var reqUrl = dataObj['reqUrl'];

    var headers = getAppReqHeader(dataObj, makeCB.name);
    makeCB.delete(reqUrl, data, function(err, data) {
        callback(err, data);
    }, headers);
}

exports.getHttpsOptionsByAPIType = getHttpsOptionsByAPIType;
exports.makeHttpOrHttpsGetRestCall = makeHttpOrHttpsGetRestCall;
exports.makeHttpOrHttpsPostRestCall = makeHttpOrHttpsPostRestCall;
exports.makeHttpOrHttpsPutRestCall = makeHttpOrHttpsPutRestCall;
exports.makeHttpOrHttpsDelRestCall = makeHttpOrHttpsDelRestCall;
exports.updateHttpsSecureOptions = updateHttpsSecureOptions;
exports.apiProtocolList = apiProtocolList;
exports.getProtocolByAPIType = getProtocolByAPIType;
exports.getOrchModuleByAPIType = getOrchModuleByAPIType;


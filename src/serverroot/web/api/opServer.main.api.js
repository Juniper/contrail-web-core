/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

var rest = require('../../common/rest.api'),
    config = process.mainModule.exports.config,
    authApi = require('../../common/auth.api'),
    commonUtils = require('../../utils/common.utils'),
    async = require('async'),
    opServer,
    appErrors = require('../../errors/app.errors');
var opServerIP = ((config.analytics) && (config.analytics.server_ip)) ?
    config.analytics.server_ip : global.DFLT_SERVER_IP;
var opServerPort = ((config.analytics) && (config.analytics.server_port)) ?
    config.analytics.server_port : '8081';

opServer = rest.getAPIServer({apiName: global.label.OPS_API_SERVER,
                              server: opServerIP, port: opServerPort});

function getHeaders(dataObj, callback)
{
    var headers =
        (null != dataObj['appHeaders']) ? dataObj['appHeaders'] : {};
    dataObj['headers'] = headers;
    var appData = dataObj['appData'];
    var req = commonUtils.getValueByJsonPath(appData, 'authObj;req', null,
                                             false);
    dataObj['apiRestApi'] = opServer;
    if (null == req) {
        callback(null, dataObj);
        return;
    }

    var opServiceType =
        authApi.getEndpointServiceType(global.DEFAULT_CONTRAIL_ANALYTICS_IDENTIFIER);
    authApi.getServiceAPIVersionByReqObj(req, opServiceType,
                                         function(verObjs, regionName) {
        var verObj = null;
        if (null != verObjs) {
            verObj = verObjs[0];
        }
        authApi.shiftServiceEndpointList(req, opServiceType, regionName);
        if ((null == verObj) || (null == verObj['protocol']) ||
            (null == verObj['ip']) || (null == verObj['port'])) {
            callback(null, dataObj);
            return;
        }
        headers['protocol'] = verObj['protocol'];
        var opServerRestInst =
            rest.getAPIServer({apiName: global.label.OPSERVER,
                               server: verObj['ip'], port: verObj['port']});
        dataObj['headers'] = headers;
        dataObj['apiRestApi'] = opServerRestInst;
        callback(null, dataObj);
    }, global.service.MAINSEREVR);
}

function doSendApiServerRespToApp (error, data, obj, appData, callback)
{
    var reqUrl = obj.reqUrl;
    var reqData = obj.reqData;
    var reqType = obj.reqType;
    var appData = obj.appData;
    var isRetry = obj.isRetry;
    var appHeaders = obj.appHeaders;

    if ((null != error) && (null == isRetry) &&
        (true == authApi.isMultiRegionSupported())) {
        var errCode = error.code;
        if (('ECONNREFUSED' == errCode) || ('ETIMEDOUT' == errCode)) {
            serveAPIRequest(reqUrl, reqData, appData, appHeaders, reqType,
                            callback, false);
            return;
        }
    }

    callback(error, data);
}

function serveAPIRequestCB (obj, callback)
{
    var reqUrl = obj.reqUrl;
    var reqData = obj.reqData;
    var reqType = obj.reqType;
    var appData = obj.appData;

    if (global.HTTP_REQUEST_GET == reqType) {
        obj.apiRestApi.api.get(reqUrl, function(error, data) {
            doSendApiServerRespToApp(error, data, obj, appData, callback);
        }, obj.headers);
    } else if (global.HTTP_REQUEST_PUT == reqType) {
        obj.apiRestApi.api.put(reqUrl, reqData, function(error, data) {
            doSendApiServerRespToApp(error, data, obj, appData, callback);
        }, obj.headers);
    } else if (global.HTTP_REQUEST_POST == reqType) {
        obj.apiRestApi.api.post(reqUrl, reqData, function(error, data) {
            doSendApiServerRespToApp(error, data, obj, appData, callback);
        }, obj.headers);
    } else if (global.HTTP_REQUEST_DEL == reqType) {
        obj.apiRestApi.api.delete(reqUrl, function(error, data) {
            doSendApiServerRespToApp(error, data, obj, appData, callback);
        }, obj.headers);
    } else {
        var error = new appErrors.RESTServerError('reqType: ' + reqType +
                                                  ' not allowed.');
        callback(error, null);
    }
}

function serveAPIRequest (reqUrl, reqData, appData, appHeaders, reqType,
                          callback, isRetry)
{
    var dataObj = {
        reqUrl: reqUrl,
        appHeaders: appHeaders,
        appData: appData,
        reqType: reqType,
        reqData: reqData,
        isRetry: isRetry
    };
    async.waterfall([
        async.apply(getHeaders, dataObj),
        serveAPIRequestCB
    ],
    function(error, data) {
        callback(error, data);
    });
}

function apiGet (reqUrl, appData, callback, appHeaders, stopRetry)
{
    serveAPIRequest(reqUrl, null, appData, appHeaders,
                    global.HTTP_REQUEST_GET, callback);
}


function apiPut (reqUrl, reqData, appData, callback, appHeaders, stopRetry)
{
    serveAPIRequest(reqUrl, reqData, appData, appHeaders,
                    global.HTTP_REQUEST_PUT, callback);
}

function apiPost (reqUrl, reqData, appData, callback, appHeaders, stopRetry)
{
    serveAPIRequest(reqUrl, reqData, appData, appHeaders,
                    global.HTTP_REQUEST_POST, callback);
}

function apiDelete (reqUrl, appData, callback, appHeaders, stopRetry)
{
    serveAPIRequest(reqUrl, null, appData, appHeaders,
                    global.HTTP_REQUEST_DEL, callback);
}

exports.apiGet = apiGet;
exports.apiPut = apiPut;
exports.apiPost = apiPost;
exports.apiDelete = apiDelete;


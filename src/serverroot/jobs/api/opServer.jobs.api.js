/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

var rest = require('../../common/rest.api'),
    config = process.mainModule.exports.config,
    authApi = require('../../common/auth.api'),
    logutils = require('../../utils/log.utils'),
    commonUtils = require('../../utils/common.utils'),
    async = require('async'),
    opServer;

var opServerIP = ((config.analytics) && (config.analytics.server_ip)) ?
    config.analytics.server_ip : global.DFLT_SERVER_IP;
var opServerPort = ((config.analytics) && (config.analytics.server_port)) ?
    config.analytics.server_port : '8081';

opServer = rest.getAPIServer({apiName: global.label.OPSERVER,
                              server: opServerIP, port: opServerPort});

function buildDummyReqObjByJobData (jobData)
{
    var session = commonUtils.getValueByJsonPath(jobData, 'taskData;session',
                                                 null);
    var cookies = commonUtils.getValueByJsonPath(jobData, 'taskData;cookies',
                                                 null);
    var req = null;
    if (null != session) {
        req = {
            session: session
        };
        if (null != cookies) {
            req['cookies'] = cookies;
        }
    }
    return req;
}

function getHeaders(dataObj, callback)
{
    var headers = {};
    var jobData = dataObj['jobData'];
    var appHeaders = dataObj['appHeaders'];
    for (key in appHeaders) {
        /* App Header overrides default header */
        headers[key] = appHeaders[key];
    }
    var svcCat = commonUtils.getValueByJsonPath(jobData, 'taskData;serviceCatalog',
                                                null);
    dataObj['headers'] = headers;
    dataObj['apiRestApi'] = opServer;
    if (null == svcCat) {
        callback(null, dataObj);
        return;
    }
    /* Create dummy req Object */
    var req = buildDummyReqObjByJobData(jobData);
    var opServiceType =
        authApi.getEndpointServiceType(global.DEFAULT_CONTRAIL_ANALYTICS_IDENTIFIER);
    authApi.getServiceAPIVersionByReqObj(req, opServiceType,
                                         function(verObjs) {
        var verObj = null;
        if (null != verObjs) {
            verObj = verObjs[0];
        }
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
    }, global.service.MIDDLEWARE);
}

function doSendOpServerRespToApp (error, data, callback)
{
    callback(error, data);
}

function serveAPIRequestCB (obj, callback)
{
    var reqUrl = obj.reqUrl;
    var reqData = obj.reqData;
    var reqType = obj.reqType;

    if (global.HTTP_REQUEST_GET == reqType) {
        obj.apiRestApi.api.get(reqUrl, function(error, data) {
            doSendOpServerRespToApp(error, data, callback);
        }, obj.headers);
    } else if (global.HTTP_REQUEST_PUT == reqType) {
        obj.apiRestApi.api.put(reqUrl, reqData, function(error, data) {
            doSendOpServerRespToApp(error, data, callback);
        }, obj.headers);
    } else if (global.HTTP_REQUEST_POST == reqType) {
        obj.apiRestApi.api.post(reqUrl, reqData, function(error, data) {
            doSendOpServerRespToApp(error, data, callback);
        }, obj.headers);
    } else if (global.HTTP_REQUEST_DEL == reqType) {
        obj.apiRestApi.api.delete(reqUrl, function(error, data) {
            doSendOpServerRespToApp(error, data, callback);
        }, obj.headers);
    } else {
        var error = new appErrors.RESTServerError('reqType: ' + reqType +
                                                  ' not allowed.');
        logutils.logger.error('reqType: ' + reqType + ' not allowed.');
        callback(error, null);
    }
}

function serveAPIRequest (reqUrl, reqData, jobData, appHeaders, reqType,
                          callback)
{
    var dataObj = {
        reqUrl: reqUrl,
        appHeaders: appHeaders,
        jobData: jobData,
        reqType: reqType,
        reqData: reqData
    };
    async.waterfall([
        async.apply(getHeaders, dataObj),
        serveAPIRequestCB
    ],
    function(error, data) {
        callback(error, data);
    });
}

function apiGet (reqUrl, jobData, callback, appHeaders, stopRetry)
{
    serveAPIRequest(reqUrl, null, jobData, appHeaders,
                    global.HTTP_REQUEST_GET, callback);
}

function apiPut (reqUrl, reqData, jobData, callback, appHeaders, stopRetry)
{
    serveAPIRequest(reqUrl, reqData, jobData, appHeaders,
                    global.HTTP_REQUEST_PUT, callback);
}

function apiPost (reqUrl, reqData, jobData, callback, appHeaders, stopRetry)
{
    serveAPIRequest(reqUrl, reqData, jobData, appHeaders,
                    global.HTTP_REQUEST_POST, callback);
}

function apiDelete (reqUrl, jobData, callback, appHeaders, stopRetry)
{
    serveAPIRequest(reqUrl, null, jobData, appHeaders,
                    global.HTTP_REQUEST_DEL, callback);
}

exports.apiGet = apiGet;
exports.apiPut = apiPut;
exports.apiPost = apiPost;
exports.apiDelete = apiDelete;


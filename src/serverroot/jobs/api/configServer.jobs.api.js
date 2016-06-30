/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var rest = require('../../common/rest.api'),
    config = process.mainModule.exports.config,
    authApi = require('../../common/auth.api'),
    redisPub = require('../core/redisPub'),
    logutils = require('../../utils/log.utils'),
    commonUtils = require('../../utils/common.utils'),
    jobsUtils = require('../../common/jobs.utils'),
    async = require('async'),
    configServer;

var configServerIP = ((config.cnfg) && (config.cnfg.server_ip)) ?
    config.cnfg.server_ip : global.DFLT_SERVER_IP;
var configServerPort = ((config.cnfg) && (config.cnfg.server_port)) ?
    config.cnfg.server_port : '8082';
configServer = rest.getAPIServer({apiName: global.label.VNCONFIG_API_SERVER,
                                 server: configServerIP,
                                 port: configServerPort});

function callApiByReqType (obj, reqType, stopRetry, callback)
{
    var jobData = obj.jobData;
    var appHeaders = obj.appHeaders;
    var reqUrl = obj.reqUrl;
    var reqData = obj.reqData;

    if (global.HTTP_REQUEST_GET == reqType) {
        apiGet(reqUrl, jobData, callback, appHeaders, true);
    } else if (global.HTTP_REQUEST_POST == reqType) {
        apiPost(reqUrl, reqData, jobData, callback, appHeaders, true);
    } else if (global.HTTP_REQUEST_PUT == reqType) {
        apiPut(reqUrl, reqData, jobData, callback, appHeaders, true);
    } else if (global.HTTP_REQUEST_DEL == reqType) {
        apiDelete(reqUrl, jobData, callback, appHeaders, true);
    } else {
        var error = new appErrors.RESTServerError('reqType: ' + reqType +
                                                  ' not allowed.');
        callback(error, null);
    }
}

function doSendApiServerRespToApp (err, data, obj, callback)
{
    var jobData = obj.jobData;
    var appHeaders = obj.appHeaders;
    var reqUrl = obj.reqUrl;
    var reqType = obj.reqType;
    var reqData = obj.reqData;
    var stopRetry = obj.stopRetry;

    var authObj = jobsUtils.buildAuthObjByJobData(jobData);
    if (null != err) {
        if (stopRetry) {
            callback(err, data);
        } else {
            if (err.responseCode ==
                 global.HTTP_STATUS_AUTHORIZATION_FAILURE) {
                /* Retry once again */
                authApi.getUserAuthDataByConfigAuthObj(jobData.taskData.loggedInOrchestrationMode,
                                                       authObj,
                                                       function(error, data) {
                    if ((null != error) || (null == data) ||
                        (null == data.access) ||
                        (null == data.access.token)) {
                        callback(error, data);
                        return;
                    }
                    jobsUtils.updateJobDataAuthObjToken(jobData, data.access.token);
                    obj.jobData = jobData;
                    callApiByReqType(obj, reqType, true, callback);
                });
            } else {
                callback(err, data);
            }
        }
    } else {
        callback(null, data);
    }
}

function serveAPIRequestCB (obj, callback)
{
    var reqUrl = obj.reqUrl;
    var reqData = obj.reqData;
    var reqType = obj.reqType;
    var jobData = obj.jobData;

    if (global.HTTP_REQUEST_GET == reqType) {
        obj.apiRestApi.api.get(reqUrl, function(error, data) {
            doSendApiServerRespToApp(error, data, obj, callback);
        }, obj.headers);
    } else if (global.HTTP_REQUEST_PUT == reqType) {
        obj.apiRestApi.api.put(reqUrl, reqData, function(error, data) {
            doSendApiServerRespToApp(error, data, obj, callback);
        }, obj.headers);
    } else if (global.HTTP_REQUEST_POST == reqType) {
        obj.apiRestApi.api.post(reqUrl, reqData, function(error, data) {
            doSendApiServerRespToApp(error, data, obj, callback);
        }, obj.headers);
    } else if (global.HTTP_REQUEST_DEL == reqType) {
        obj.apiRestApi.api.delete(reqUrl, function(error, data) {
            doSendApiServerRespToApp(error, data, obj, callback);
        }, obj.headers);
    } else {
        var error = new appErrors.RESTServerError('reqType: ' + reqType +
                                                  ' not allowed.');
        callback(error, null);
    }
}

function serveAPIRequest (reqUrl, reqData, jobData, appHeaders, reqType,
                          stopRetry, callback)
{
    var dataObj = {
        apiName: global.label.VNCONFIG_API_SERVER,
        reqUrl: reqUrl,
        appHeaders: appHeaders,
        jobData: jobData,
        reqType: reqType,
        stopRetry: stopRetry,
        reqData: reqData,
        apiRestApi: configServer
    };
    async.waterfall([
        async.apply(jobsUtils.getHeaders, dataObj),
        serveAPIRequestCB
    ],
    function(error, data) {
        callback(error, data);
    });
}

function apiGet (reqUrl, jobData, callback, appHeaders, stopRetry)
{
    serveAPIRequest(reqUrl, null, jobData, appHeaders,
                    global.HTTP_REQUEST_GET, stopRetry, callback);
}

function apiPut (reqUrl, reqData, jobData, callback, appHeaders, stopRetry)
{
    serveAPIRequest(reqUrl, reqData, jobData, appHeaders,
                    global.HTTP_REQUEST_PUT, stopRetry, callback);
}

function apiPost (reqUrl, reqData, jobData, callback, appHeaders, stopRetry)
{
    serveAPIRequest(reqUrl, reqData, jobData, appHeaders,
                    global.HTTP_REQUEST_POST, stopRetry, callback);
}

function apiDelete (reqUrl, jobData, callback, appHeaders, stopRetry)
{
    serveAPIRequest(reqUrl, null, jobData, appHeaders,
                    global.HTTP_REQUEST_DEL, stopRetry, callback);
}

exports.apiGet = apiGet;
exports.apiPut = apiPut;
exports.apiPost = apiPost;
exports.apiDelete = apiDelete;


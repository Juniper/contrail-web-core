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
var authParams = null;
try {
    authParams = require('../../../../config/userAuth');
} catch(e) {
    authParams = null;
}

function getHeaders (dataObj, callback)
{
    var jobData = dataObj['jobData'];
    var headers = {};
    headers = configAppHeaders(headers, jobData);
    var appHeaders = dataObj['appHeaders'];

    var req = buildDummyReqObjByJobData(jobData);
    dataObj['apiRestApi'] = configServer;

    for (key in appHeaders) {
        /* App Header overrides default header */
        headers[key] = appHeaders[key];
    }
    dataObj['headers'] = headers;
    if (null == req) {
        callback(null, dataObj);
        return;
    }
    var apiServiceType =
        authApi.getEndpointServiceType(global.DEFAULT_CONTRAIL_API_IDENTIFIER);
    authApi.getServiceAPIVersionByReqObj(req, apiServiceType,
                                         function(verObjs) {
        var verObj = null;
        if ((null != verObjs) && (null != verObjs[0])) {
            verObj = verObjs[0];
        }
        if ((null == verObj) || (null == verObj['protocol']) ||
            (null == verObj['ip']) || (null == verObj['port'])) {
            callback(null, dataObj);
            return;
        }
        headers['protocol'] = verObj['protocol'];
        var configServerRestInst =
            rest.getAPIServer({apiName: global.label.VNCONFIG_API_SERVER,
                               server: verObj['ip'], port: verObj['port']});
        dataObj['headers'] = headers;
        dataObj['apiRestApi'] = configServerRestInst;
        callback(null, dataObj);
    }, global.service.MIDDLEWARE);
}

function getAuthTokenByJobData (jobData)
{
    if ((null != jobData) && (null != jobData['taskData']) &&
        (null != jobData['taskData']['tokenid'])) {
        return jobData['taskData']['tokenid'];
    }

    if (true == commonUtils.isMultiTenancyEnabled()) {
        /* If multi-tenancy is disabled, then this is not error, so do not log
         */
        logutils.logger.error("We did not get tokenid in taskData");
    }
    return null;
}

function configAppHeaders (headers, jobData)
{
    try {
        headers['X-Auth-Token'] = getAuthTokenByJobData(jobData);
    } catch(e) {
        headers['X-Auth-Token'] = null;
    }
    if (true == commonUtils.isMultiTenancyEnabled()) {
        /* As we are sending with admin_user, so set the role as 'admin' */
        headers['X_API_ROLE'] = 'admin';
    }
    return headers;
}

function updateJobDataAuthObjToken (jobData, token)
{
    jobData['taskData']['tokenid'] = token.id;
    jobsUtils.registerForJobTaskDataChange(jobData, 'tokenid');
}

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

function buildAuthObjByJobData (jobData)
{
    var userAuthObj = {};

    if (null != authParams) {
        if ((null != authParams.admin_user) &&
            (null != authParams.admin_password)) {
            userAuthObj['username'] = authParams.admin_user;
            userAuthObj['password'] = authParams.admin_password;
        }
        if (null != authParams.admin_tenant_name) {
            userAuthObj['tenant'] = authParams.admin_tenant_name;
        }
    }
    if (null != jobData.taskData.reqBy) {
        userAuthObj['reqBy'] = jobData.taskData.reqBy;
    }
    /* Create a dummy req object and encapsulate region inside it */
    var req = buildDummyReqObjByJobData(jobData);
    if (null != req) {
        userAuthObj['req'] = req;
    }
    return userAuthObj;
}

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

    var authObj = buildAuthObjByJobData(jobData);
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
                    updateJobDataAuthObjToken(jobData, data.access.token);
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
        reqUrl: reqUrl,
        appHeaders: appHeaders,
        jobData: jobData,
        reqType: reqType,
        stopRetry: stopRetry,
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


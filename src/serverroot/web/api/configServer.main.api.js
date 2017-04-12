/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var rest = require('../../common/rest.api'),
    config = process.mainModule.exports.config,
    authApi = require('../../common/auth.api'),
    commonUtils = require('../../utils/common.utils'),
    async = require('async'),
    configServer,
    configServerApi = require('../../common/configServer.api'),
    logutils = require('../../utils/log.utils'),
    appErrors = require('../../errors/app.errors');

var configServerIP = ((config.cnfg) && (config.cnfg.server_ip)) ?
    config.cnfg.server_ip : global.DFLT_SERVER_IP;
var configServerPort = ((config.cnfg) && (config.cnfg.server_port)) ?
    config.cnfg.server_port : '8082';
configServer = rest.getAPIServer({apiName: global.label.VNCONFIG_API_SERVER,
                                 server: configServerIP,
                                 port: configServerPort});

function getHeaders(dataObj, callback)
{
    var headers = {};
    var appData = dataObj['appData'];
    headers = configServerApi.configAppHeaders(headers, appData);
    var appHeaders = dataObj['appHeaders'];
    for (key in appHeaders) {
        /* App Header overrides default header */
        headers[key] = appHeaders[key];
    }
    dataObj['headers'] = headers;
    dataObj['apiRestApi'] = configServer;
    callback(null, dataObj);
    return;
}

function doSendApiServerRespToApp (error, data, obj, appData, callback)
{
    var reqUrl = obj.reqUrl;
    var reqData = obj.reqData;
    var reqType = obj.reqType;
    var appData = obj.appData;
    var isRetry = obj.isRetry;
    var appHeaders = obj.appHeaders;

    /*
    if ((null != error) && (null == isRetry) &&
        (true == authApi.isMultiRegionSupported())) {
        var errCode = error.code;
        if (('ECONNREFUSED' == errCode) || ('ETIMEDOUT' == errCode)) {
            serveAPIRequest(reqUrl, reqData, appData, appHeaders, reqType,
                            callback, false);
            return;
        }
    }
    */
    var multiTenancyEnabled = commonUtils.isMultiTenancyEnabled();
    if (null != error) {
        if (global.HTTP_STATUS_AUTHORIZATION_FAILURE ==
            error.responseCode) {
            if (true == multiTenancyEnabled) {
                try {
                    commonUtils.redirectToLogoutByAppData(appData);
                } catch(e) {
                    console.log("APIServer: redirectToLogout failed:" + e);
                }
                return;
            }
        }
        callback(error, data);
        return;
    }
    callback(null, data);
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

function getDefProjectByAppData (appData)
{
    var defProject = null;

    try {
        defProject =
            appData['authObj']['req']['cookies'][global.COOKIE_PROJECT_DISPLAY_NAME];
        if (null == defProject) {
            defProject = appData['authObj']['defTokenObj']['tenant']['name'];
        }
    } catch(e) {
        if ((null != appData) && (null != appData['authObj']) &&
            (null != appData['authObj']['defTokenObj']) &&
            (null != appData['authObj']['defTokenObj']['tenant'])) {
            defProject = appData['authObj']['defTokenObj']['tenant']['name'];
        }
    }
    return defProject;
}

function getAuthTokenByProject (req, defTokenObj, project)
{
    if ((null != req.session.tokenObjs[project]) &&
        (null != req.session.tokenObjs[project]['token']) &&
        (null != req.session.tokenObjs[project]['token']['id'])) {
        return {'project': project,
            'token': req.session.tokenObjs[project]['token']['id']};
    }
    var defProject =
        commonUtils.getValueByJsonPath(defTokenObj,
                                       'tenant;name',
                                       null);
    return {'project': defProject, 'token': defTokenObj['id']};
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


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
    var req = commonUtils.getValueByJsonPath(appData, 'authObj;req', null,
                                             false);
    dataObj['headers'] = headers;
    dataObj['apiRestApi'] = configServer;
    if (null == req) {
        callback(null, dataObj);
        return;
    }
    var apiServiceType = authApi.getEndpointServiceType('apiServer');
    authApi.getServiceAPIVersionByReqObj(req, apiServiceType,
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
        var configServerRestInst =
            rest.getAPIServer({apiName: global.label.VNCONFIG_API_SERVER,
                               server: verObj['ip'], port: verObj['port']});
        dataObj['headers'] = headers;
        dataObj['apiRestApi'] = configServerRestInst;
        callback(null, dataObj);
    });
}

function doSendApiServerRespToApp (error, data, appData, callback)
{
    var multiTenancyEnabled = commonUtils.isMultiTenancyEnabled();
    if (null != error) {
        if (global.HTTP_STATUS_AUTHORIZATION_FAILURE ==
            error.responseCode) {
            if (true == multiTenancyEnabled) {
                commonUtils.redirectToLogoutByAppData(appData);
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
            doSendApiServerRespToApp(error, data, appData, callback);
        }, obj.headers);
    } else if (global.HTTP_REQUEST_PUT == reqType) {
        obj.apiRestApi.api.put(reqUrl, reqData, function(error, data) {
            doSendApiServerRespToApp(error, data, appData, callback);
        }, obj.headers);
    } else if (global.HTTP_REQUEST_POST == reqType) {
        obj.apiRestApi.api.post(reqUrl, reqData, function(error, data) {
            doSendApiServerRespToApp(error, data, appData, callback);
        }, obj.headers);
    } else if (global.HTTP_REQUEST_DEL == reqType) {
        obj.apiRestApi.api.delete(reqUrl, function(error, data) {
            doSendApiServerRespToApp(error, data, appData, callback);
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
        defProject = appData['authObj']['req']['cookies']['project'];
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
                          callback)
{
    var dataObj = {
        reqUrl: reqUrl,
        appHeaders: appHeaders,
        appData: appData,
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


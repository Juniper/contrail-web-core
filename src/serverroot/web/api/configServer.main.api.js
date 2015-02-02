/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var rest = require('../../common/rest.api'),
    config = process.mainModule.exports.config,
    authApi = require('../../common/auth.api'),
    commonUtils = require('../../utils/common.utils'),
    configServer;

configServer = rest.getAPIServer({apiName: global.label.VNCONFIG_API_SERVER,
                                 server: config.cnfg.server_ip, port:
                                 config.cnfg.server_port });

function getHeaders(defHeaders, appHeaders)
{
    var headers = defHeaders;
    for (key in appHeaders) {
        /* App Header overrides default header */
        headers[key] = appHeaders[key];
    }
    return headers;
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

function getAuthTokenByProject (req, defToken, project)
{
    if ((null != req.session.tokenObjs[project]) &&
        (null != req.session.tokenObjs[project]['token']) &&
        (null != req.session.tokenObjs[project]['token']['id'])) {
        return req.session.tokenObjs[project]['token']['id'];
    }
    return defToken;
}

function configAppHeaders (headers, appData)
{
    var defProject = getDefProjectByAppData(appData);
    var multiTenancyEnabled = commonUtils.isMultiTenancyEnabled();
    try {
        headers['X-Auth-Token'] =
            getAuthTokenByProject(appData['authObj'].req,
                                  appData['authObj']['defTokenObj']['id'],
                                  defProject);
    } catch(e) {
        headers['X-Auth-Token'] = null;
    }
    if (true == multiTenancyEnabled) {
        try {
            headers['X_API_ROLE'] =
                appData['authObj'].req.session.userRoles[defProject].join(',');
        } catch(e) {
            headers['X_API_ROLE'] = null;
        }
    }
    return headers;
}

function apiGet (reqUrl, appData, callback, appHeaders, stopRetry)
{
    var defProject = null;
    var headers = {};
    var multiTenancyEnabled = commonUtils.isMultiTenancyEnabled();

    var defProject = getDefProjectByAppData(appData);
    headers = configAppHeaders(headers, appData);
    headers = getHeaders(headers, appHeaders);
    configServer.api.get(reqUrl, function(err, data) {
        if (err) {
            if (global.HTTP_STATUS_AUTHORIZATION_FAILURE ==
                err.responseCode) {
                if (true == multiTenancyEnabled) {
                    commonUtils.redirectToLogoutByAppData(appData);
                    return;
                }
            }
            callback(err, data);
        } else {
            callback(null, data);
        }
    }, headers);
}

function apiPut (reqUrl, reqData, appData, callback, appHeaders, stopRetry)
{
    var defProject = null;
    var headers = {}; 
    var multiTenancyEnabled = commonUtils.isMultiTenancyEnabled();

    var defProject = getDefProjectByAppData(appData);
    headers = configAppHeaders(headers, appData);
    headers = getHeaders(headers, appHeaders);

    configServer.api.put(reqUrl, reqData, function(err, data) {
        if (err) {
            if (global.HTTP_STATUS_AUTHORIZATION_FAILURE ==
                err.responseCode) {
                if (true == multiTenancyEnabled) {
                    commonUtils.redirectToLogoutByAppData(appData);
                    return;
                }
            }
            callback(err, data);
        } else {
            callback(null, data);
        }
    }, headers);
}

function apiPost (reqUrl, reqData, appData, callback, appHeaders, stopRetry)
{
    var defProject = null;
    var headers = {}; 
    var multiTenancyEnabled = commonUtils.isMultiTenancyEnabled();

    var defProject = getDefProjectByAppData(appData);
    headers = configAppHeaders(headers, appData);
    headers = getHeaders(headers, appHeaders);

    configServer.api.post(reqUrl, reqData, function(err, data) {
        if (err) {
            if (global.HTTP_STATUS_AUTHORIZATION_FAILURE ==
                err.responseCode) {
                if (true == multiTenancyEnabled) {
                    commonUtils.redirectToLogoutByAppData(appData);
                    return;
                }
            }
            callback(err, data);
        } else {
            callback(null, data);
        }
    }, headers);
}

function apiDelete (reqUrl, appData, callback, appHeaders, stopRetry)
{
    var defProject = null;
    var headers = {}; 
    var multiTenancyEnabled = commonUtils.isMultiTenancyEnabled();

    var defProject = getDefProjectByAppData(appData);
    headers = configAppHeaders(headers, appData);
    headers = getHeaders(headers, appHeaders);

    configServer.api.delete(reqUrl, function(err, data) {
        if (err) {
            if (global.HTTP_STATUS_AUTHORIZATION_FAILURE ==
                err.responseCode) {
                if (true == multiTenancyEnabled) {
                    commonUtils.redirectToLogoutByAppData(appData);
                    return;
                }
            }
            callback(err, data);
        } else {
            callback(null, data);
        }
    }, headers);
}

exports.apiGet = apiGet;
exports.apiPut = apiPut;
exports.apiPost = apiPost;
exports.apiDelete = apiDelete;


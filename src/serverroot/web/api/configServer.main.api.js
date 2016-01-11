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

function configAppHeaders (headers, appData)
{
    var defProject = getDefProjectByAppData(appData);
    var multiTenancyEnabled = commonUtils.isMultiTenancyEnabled();
    var xAuthTokenObj = null;
    try {
        var xAuthTokenObj =
            getAuthTokenByProject(appData['authObj'].req,
                                  appData['authObj']['defTokenObj'],
                                  defProject);
        headers['X-Auth-Token'] = xAuthTokenObj['token'];
        if (true == multiTenancyEnabled) {
            if (null != xAuthTokenObj['project']) {
                headers['X_API_ROLE'] =
                    appData['authObj'].req.session.userRoles[xAuthTokenObj['project']].join(',');
            } else {
                headers['X_API_ROLE'] = null;
            }
        }
    } catch(e) {
        headers['X-Auth-Token'] = null;
        headers['X_API_ROLE'] = null;
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


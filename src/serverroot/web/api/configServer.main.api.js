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

function getAuthTokenByProject (req, defTokenObj, project, callback)
{
    if ((null != req.session.tokenObjs[project]) &&
        (null != req.session.tokenObjs[project]['token']) &&
        (null != req.session.tokenObjs[project]['token']['id'])) {
        callback(null, {'project': project,
                 'token': req.session.tokenObjs[project]['token']['id']});
        return;
    }
    var defProject =
        commonUtils.getValueByJsonPath(defTokenObj,
                                       'tenant;name',
                                       null);
    var defTokenId =
        commonUtils.getValueByJsonPath(defTokenObj, 'id', null);
    var authApi = require('./../../common/auth.api');
    var adminProjList = authApi.getAdminProjectList(req);
    if ((null == adminProjList) ||(!adminProjList.length)) {
        callback(null, {'project': defProject, 'token': defTokenId});
        return;
    }
    var tokenObjs = req.session.tokenObjs;
    var tokenId = null;
    for (key in tokenObjs) {
        if (-1 != adminProjList.indexOf(key)) {
            tokenId =
                commonUtils.getValueByJsonPath(tokenObjs[key],
                                               'token;id', null);
            break;
        }
    }
    if (null == tokenId) {
        tokenId =
            commonUtils.getValueByJsonPath(tokenObjs[key],
                                           'token;id', null);
        if (null == tokenId) {
            callback(null, {'project': defProject, 'token': defTokenId});
            return;
        }
    }

    var userObj = {'tokenid': tokenId, 'tenant': project, 'req': req};
    authApi.getUIUserRoleByTenant(userObj, function(err, roles, data) {
        if (null == data) {
            callback(null, {'project': defProject, 'token': defTokenId});
            return;
        }
        var tokenObj = data['tokenObj'];
        if ((null != err) || (null == tokenObj) ||
            (null == tokenObj['token']) || (null == tokenObj['token']['id']) ||
            (null == tokenObj['token']['tenant'])) {
            callback(null, {'project': defProject, 'token': defTokenId});
            return;
        }
        callback(null, {'project': tokenObj['token']['tenant']['name'],
                 'token': tokenObj['token']['id']});
    });
}

function configAppHeaders (headers, appData, callback)
{
    var defProject = getDefProjectByAppData(appData);
    var multiTenancyEnabled = commonUtils.isMultiTenancyEnabled();
    var xAuthTokenObj = null;
    if ((null == appData) || (null == appData['authObj'].req) ||
        (null == appData['authObj']['defTokenObj'])) {
        if (true == multiTenancyEnabled) {
            headers['X-Auth-Token'] = null;
            headers['X_API_ROLE'] = null;
        }
        callback(headers);
        return;
    }
    getAuthTokenByProject(appData['authObj'].req,
                          appData['authObj']['defTokenObj'],
                          defProject, function(err, xAuthTokenObj) {
        headers['X-Auth-Token'] = xAuthTokenObj['token'];
        if (true == multiTenancyEnabled) {
            try {
                if (null != xAuthTokenObj['project']) {
                    headers['X_API_ROLE'] =
                        appData['authObj'].req.session.userRoles[xAuthTokenObj['project']].join(',');
                } else {
                    headers['X_API_ROLE'] = null;
                }
            } catch(e) {
                headers['X_API_ROLE'] = null;
            }
        }
        callback(headers);
    });
}

function apiGet (reqUrl, appData, callback, appHeaders, stopRetry)
{
    var defProject = null;
    var headers = {};
    var multiTenancyEnabled = commonUtils.isMultiTenancyEnabled();

    var defProject = getDefProjectByAppData(appData);
    configAppHeaders(headers, appData, function(headers) {
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
  });
}

function apiPut (reqUrl, reqData, appData, callback, appHeaders, stopRetry)
{
    var defProject = null;
    var headers = {}; 
    var multiTenancyEnabled = commonUtils.isMultiTenancyEnabled();

    var defProject = getDefProjectByAppData(appData);
    configAppHeaders(headers, appData, function(headers) {
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
  });
}

function apiPost (reqUrl, reqData, appData, callback, appHeaders, stopRetry)
{
    var defProject = null;
    var headers = {}; 
    var multiTenancyEnabled = commonUtils.isMultiTenancyEnabled();

    var defProject = getDefProjectByAppData(appData);
    configAppHeaders(headers, appData, function(headers) {
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
  });
}

function apiDelete (reqUrl, appData, callback, appHeaders, stopRetry)
{
    var defProject = null;
    var headers = {}; 
    var multiTenancyEnabled = commonUtils.isMultiTenancyEnabled();

    var defProject = getDefProjectByAppData(appData);
    configAppHeaders(headers, appData, function(headers) {
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
  });
}

exports.apiGet = apiGet;
exports.apiPut = apiPut;
exports.apiPost = apiPost;
exports.apiDelete = apiDelete;


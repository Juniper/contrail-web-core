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
        defProject = appData['authObj']['defTokenObj']['tenant']['name'];
    }
    return defProject;
}

function apiGet (reqUrl, appData, callback, appHeaders, stopRetry)
{
    var defProject = null;
    var headers = {};
    var authObj;
    try {
        defProject = getDefProjectByAppData(appData);
        headers['X-Auth-Token'] =
            appData['authObj']['defTokenObj']['id'];
        headers['X_API_ROLE'] =
            appData['authObj'].req.session.userRoles[defProject].join(',');
        headers = getHeaders(headers, appHeaders);
    } catch(e) {
        /* We did not have authorized yet */
        headers['X-Auth-Token'] = null;
        headers['X_API_ROLE'] = null;
        defProject = null;
    }
    configServer.api.get(reqUrl, function(err, data) {
        if (err) {
            if (stopRetry) {
                callback(err, data);
            } else {
                if ((null != defProject) && (err.responseCode ==
                                             global.HTTP_STATUS_AUTHORIZATION_FAILURE)) {
                    /* Retry once again */
                    authApi.getTokenObj({'req': appData['authObj']['req'],
                                        'tenant': defProject, 'forceAuth': true},
                                        function(error, token) {
                        if ((error) || (null == token)) {
                            commonUtils.redirectToLogoutByAppData(appData);
                            return;
                        }
                        appData['authObj']['defTokenObj'] = token;
                        exports.apiGet(reqUrl, appData, callback, appHeaders, true);
                   });
                } else {
                    callback(err, data);
                }
            }
        } else {
            callback(null, data);
        }
    }, headers);
}

function apiPut (reqUrl, reqData, appData, callback, appHeaders, stopRetry)
{
    var defProject = null;
    var headers = {}; 
    var authObj;
    try {
        defProject = getDefProjectByAppData(appData);
        headers['X-Auth-Token'] =
            appData['authObj']['defTokenObj']['id'];
        headers['X_API_ROLE'] =
            appData['authObj'].req.session.userRoles[defProject].join(',');
        headers = getHeaders(headers, appHeaders);
    } catch(e) {
        /* We did not have authorized yet */
        headers['X-Auth-Token'] = null;
        headers['X_API_ROLE'] = null;
        defProject = null;
    }   
    configServer.api.put(reqUrl, reqData, function(err, data) {
        if (err) {
            if (stopRetry) {
                callback(err, data);
            } else {
                if ((null != defProject) && (err.responseCode ==
                                             global.HTTP_STATUS_AUTHORIZATION_FAILURE)) {
                    /* Retry once again */
                    authApi.getTokenObj({'req': appData['authObj']['req'],
                                        'tenant': defProject, 'forceAuth': true},
                                        function(error, token) {
                        if ((error) || (null == token)) {
                            commonUtils.redirectToLogoutByAppData(appData);
                            return;
                        }   
                        appData['authObj']['defTokenObj'] = token;
                        exports.apiPut(reqUrl, reqData, appData, callback,
                                       appHeaders, true);
                   });
                } else {
                    callback(err, data);
                }
            }
        } else {
            callback(null, data);
        }
    }, headers);
}

function apiPost (reqUrl, reqData, appData, callback, appHeaders, stopRetry)
{
    var defProject = null;
    var headers = {}; 
    var authObj;
    try {
        defProject = getDefProjectByAppData(appData);
        headers['X-Auth-Token'] =
            appData['authObj']['defTokenObj']['id'];
        headers['X_API_ROLE'] =
            appData['authObj'].req.session.userRoles[defProject].join(',');
        headers = getHeaders(headers, appHeaders);
    } catch(e) {
        /* We did not have authorized yet */
        headers['X-Auth-Token'] = null;
        headers['X_API_ROLE'] = null;
        defProject = null;
    }
    configServer.api.post(reqUrl, reqData, function(err, data) {
        if (err) {
            if (stopRetry) {
                callback(err, data);
            } else {
                if ((null != defProject) && (err.responseCode ==
                                             global.HTTP_STATUS_AUTHORIZATION_FAILURE)) {
                    /* Retry once again */
                    authApi.getTokenObj({'req': appData['authObj']['req'],
                                        'tenant': defProject, 'forceAuth': true},
                                        function(error, token) {
                        if ((error) || (null == token)) {
                            commonUtils.redirectToLogoutByAppData(appData);
                            return;
                        }   
                        appData['authObj']['defTokenObj'] = token;
                        exports.apiPost(reqUrl, reqData, appData, callback,
                                        appHeaders, true);
                   });
                } else {
                    callback(err, data);
                }
            }
        } else {
            callback(null, data);
        }
    }, headers);
}

function apiDelete (reqUrl, appData, callback, appHeaders, stopRetry)
{
    var defProject = null;
    var headers = {}; 
    var authObj;
    try {
        defProject = getDefProjectByAppData(appData);
        headers['X-Auth-Token'] =
            appData['authObj']['defTokenObj']['id'];
        headers['X_API_ROLE'] =
            appData['authObj'].req.session.userRoles[defProject].join(',');
        headers = getHeaders(headers, appHeaders);
    } catch(e) {
        /* We did not have authorized yet */
        headers['X-Auth-Token'] = null;
        headers['X_API_ROLE'] = null;
        defProject = null;
    }
    configServer.api.delete(reqUrl, function(err, data) {
        if (err) {
            if (stopRetry) {
                callback(err, data);
            } else {
                if ((null != defProject) && (err.responseCode ==
                                             global.HTTP_STATUS_AUTHORIZATION_FAILURE)) {
                    /* Retry once again */
                    authApi.getTokenObj({'req': appData['authObj']['req'],
                                        'tenant': defProject, 'forceAuth': true},
                                        function(error, token) {
                        if ((error) || (null == token)) {
                            commonUtils.redirectToLogoutByAppData(appData);
                            return;
                        }   
                        appData['authObj']['defTokenObj'] = token;
                        exports.apiDelete(reqUrl, appData, callback, appHeaders, true);
                   });
                } else {
                    callback(err, data);
                }
            }
        } else {
            callback(null, data);
        }
    }, headers);
}

exports.apiGet = apiGet;
exports.apiPut = apiPut;
exports.apiPost = apiPost;
exports.apiDelete = apiDelete;


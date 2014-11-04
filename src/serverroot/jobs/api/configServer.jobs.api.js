/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var rest = require('../../common/rest.api'),
    config = process.mainModule.exports.config,
    authApi = require('../../common/auth.api'),
    redisPub = require('../core/redisPub'),
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

function getDefProjectByJobData (jobData)
{
    var defProject = null;
    try {
        defProject = jobData['taskData']['cookies']['project'];
        if (null == defProject) {
            defProject = jobData['taskData']['authObj']['token']['tenant']['name'];
        }
    } catch(e) {
        logutils.logger.error("In getDefProjectByJobData(): JSON Parse error:" +
                              e);
        return null;
    }
    return defProject;
}

function getAuthTokenByJobData (jobData)
{
    var project = getDefProjectByJobData(jobData);
    try {
        var tokenObjs = jobData['taskData']['tokenObjs'];
        if ((null != tokenObjs) && (null != tokenObjs[project]) &&
            (null != tokenObjs[project]['token']) &&
            (null != tokenObjs[project]['token']['id'])) {
            return tokenObjs[project]['token']['id'];
        }
    } catch(e) {
        logutils.logger.error("In JOB getAuthTokenByJobData(): JSON Parse " +
                              "error:" + e);
    }
    try {
        return jobData['taskData']['authObj']['token']['id'];
    } catch(e) {
        logutils.logger.error("In JOB getAuthTokenByJobData(): JSON Parse " +
                              "error:" + e);
        return null;
    }
}

function apiGet (reqUrl, jobData, callback, appHeaders, stopRetry)
{
    var headers = {};
    var authObj;
    var defProject = null;
    var tokenId = null;
    try {
        defProject = getDefProjectByJobData(jobData);
        headers['X-Auth-Token'] = getAuthTokenByJobData(jobData);
        headers['X_API_ROLE'] =
            jobData['taskData']['userRoles'][defProject].join(',');
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
                if ((null != defProject) && (null != tokenId) &&
                    (err.responseCode ==
                     global.HTTP_STATUS_AUTHORIZATION_FAILURE)) {
                    /* Retry once again */
                    authApi.getNewTokenObjByToken({'tokenid': tokenId,
                                                  'tenant': defProject},
                                                  function(error, token) {
                                                      
                        if ((error) || (null == token)) {
                            redisPub.sendRedirectRequestToMainServer(jobData);
                            return;
                        }
                        jobData['taskData']['authObj']['token'] = token;
                        exports.apiGet(reqUrl, jobData, callback, appHeaders, true);
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

function apiPut (reqUrl, reqData, jobData, callback, appHeaders, stopRetry)
{
    var headers = {};
    var authObj;
    var defProject = null;
    var tokenId = null;
    try {
        defProject = getDefProjectByJobData(jobData);
        headers['X-Auth-Token'] = getAuthTokenByJobData(jobData);
        headers['X_API_ROLE'] =
            jobData['taskData']['userRoles'][defProject].join(',');
        headers = getHeaders(headers, appHeaders);
    } catch(e) {
        /* We did not have authorized yet */
        headers['X-Auth-Token'] = null;
        headers['X_API_ROLE'] = null;
        defProject = null;
    }
    configServer.api.put(reqUrl, function(err, data) {
        if (err) {
            if (stopRetry) {
                callback(err, data);
            } else {
                if ((null != defProject) && (null != tokenId) &&
                    (err.responseCode ==
                     global.HTTP_STATUS_AUTHORIZATION_FAILURE)) {
                    /* Retry once again */
                    authApi.getNewTokenObjByToken({'tokenid': tokenId,
                                                  'tenant': defProject},
                                                  function(error, token) {

                        if ((error) || (null == token)) {
                            redisPub.sendRedirectRequestToMainServer(jobData);
                            return;
                        }
                        jobData['taskData']['authObj']['token'] = token;
                        exports.apiPut(reqUrl, jobData, callback, appHeaders, true);
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

function apiPost (reqUrl, reqData, jobData, callback, appHeaders, stopRetry)
{
    var headers = {};
    var authObj;
    var defProject = null;
    var tokenId = null;
    try {
        defProject = getDefProjectByJobData(jobData);
        headers['X-Auth-Token'] = getAuthTokenByJobData(jobData);
        headers['X_API_ROLE'] =
            jobData['taskData']['userRoles'][defProject].join(',');
        headers = getHeaders(headers, appHeaders);
    } catch(e) {
        /* We did not have authorized yet */
        headers['X-Auth-Token'] = null;
        headers['X_API_ROLE'] = null;
        defProject = null;
    }
    configServer.api.post(reqUrl, function(err, data) {
        if (err) {
            if (stopRetry) {
                callback(err, data);
            } else {
                if ((null != defProject) && (null != tokenId) &&
                    (err.responseCode ==
                     global.HTTP_STATUS_AUTHORIZATION_FAILURE)) {
                    /* Retry once again */
                    authApi.getNewTokenObjByToken({'tokenid': tokenId,
                                                  'tenant': defProject},
                                                  function(error, token) {

                        if ((error) || (null == token)) {
                            redisPub.sendRedirectRequestToMainServer(jobData);
                            return;
                        }
                        jobData['taskData']['authObj']['token'] = token;
                        exports.apiPost(reqUrl, jobData, callback, appHeaders, true);
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

function apiDelete (reqUrl, jobData, callback, appHeaders, stopRetry)
{
    var headers = {};
    var authObj;
    var defProject = null;
    var tokenId = null;
    try {
        defProject = getDefProjectByJobData(jobData);
        headers['X-Auth-Token'] = getAuthTokenByJobData(jobData);
        headers['X_API_ROLE'] =
            jobData['taskData']['userRoles'][defProject].join(',');
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
                if ((null != defProject) && (null != tokenId) &&
                    (err.responseCode ==
                     global.HTTP_STATUS_AUTHORIZATION_FAILURE)) {
                    /* Retry once again */
                    authApi.getNewTokenObjByToken({'tokenid': tokenId,
                                                  'tenant': defProject},
                                                  function(error, token) {

                        if ((error) || (null == token)) {
                            redisPub.sendRedirectRequestToMainServer(jobData);
                            return;
                        }
                        jobData['taskData']['authObj']['token'] = token;
                        exports.apiDelete(reqUrl, jobData, callback, appHeaders, true);
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


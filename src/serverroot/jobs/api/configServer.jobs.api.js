/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var rest = require('../../common/rest.api'),
    config = require('../../../../config/config.global.js'),
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

function apiGet (reqUrl, jobData, callback, appHeaders, stopRetry)
{
    var headers = {};
    var authObj;
    var defProject = null;
    var tokenId = null;
    try {
        var tokenId = jobData['taskData']['authObj']['token']['id'];
        headers['X-Auth-Token'] = tokenId;
        headers = getHeaders(headers, appHeaders);
        defProject = jobData['taskData']['authObj']['token']['tenant']['name'];
    } catch(e) {
        /* We did not have authorized yet */
        headers['X-Auth-Token'] = null;
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
        tokenId = jobData['taskData']['authObj']['token']['id'];
        headers['X-Auth-Token'] = tokenId;
        headers = getHeaders(headers, appHeaders);
        defProject = jobData['taskData']['authObj']['token']['tenant']['name'];
    } catch(e) {
        /* We did not have authorized yet */
        headers['X-Auth-Token'] = null;
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
    try {
        tokenId = jobData['taskData']['authObj']['token']['id'];
        headers['X-Auth-Token'] =
            jobData['taskData']['authObj']['token']['id'];
        headers = getHeaders(headers, appHeaders);
        defProject = jobData['taskData']['authObj']['token']['tenant']['name'];
    } catch(e) {
        /* We did not have authorized yet */
        headers['X-Auth-Token'] = null;
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
        tokenId = jobData['taskData']['authObj']['token']['id'];
        headers['X-Auth-Token'] =
            jobData['taskData']['authObj']['token']['id'];
        headers = getHeaders(headers, appHeaders);
        defProject = jobData['taskData']['authObj']['token']['tenant']['name'];
    } catch(e) {
        /* We did not have authorized yet */
        headers['X-Auth-Token'] = null;
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


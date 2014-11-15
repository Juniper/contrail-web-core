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

var configAdminTenant =
    ((null != config.identityManager) &&
     (null != config.identityManager.admin_tenant_name)) ?
    config.identityManager.admin_tenant_name : null;

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
    var project = null;
    if (null != configAdminTenant) {
        project = configAdminTenant;
    } else {
        project = getDefProjectByJobData(jobData);
    }
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

function configAppHeaders (headers, jobData)
{
    var defProject = getDefProjectByJobData(jobData);
    var multiTenancyEnabled =
        ((null != config.multi_tenancy) &&
         (null != config.multi_tenancy.enabled)) ?
        config.multi_tenancy.enabled : true;
    try {
        headers['X-Auth-Token'] = getAuthTokenByJobData(jobData);
    } catch(e) {
        headers['X-Auth-Token'] = null;
    }
    if (true == multiTenancyEnabled) {
        try {
            headers['X_API_ROLE'] = jobData['taskData']['userRoles'][defProject].join(',');
        } catch(e) {
            headers['X_API_ROLE'] = null;
        }
    }
    return headers;
}

function updateJobDataTokenObjsByNewToken (jobData, token)
{
    var tenant = token['tenant'];
    var project = tenant['name'];
    try {
        jobData.taskData.tokenObjs[project]['token'] = token;
    } catch(e) {
        logutils.logger.error("In updateJobDataTokenObjsByNewToken() :" +
                              "JSON Parse error:" + e);
    }
}

function updateJobDataAuthObjToken (jobData, token)
{
    jobData['taskData']['authObj']['token'] = token;
    updateJobDataTokenObjsByNewToken(jobData, token);
    jobsUtils.registerForJobTaskDataChange(jobData, 'authObj');
    jobsUtils.registerForJobTaskDataChange(jobData, 'tokenObjs');
}

function buildAuthObjByJobData (jobData)
{
    var userAuthObj = {};

    if ((null != jobData.taskData.username) &&
        (null != jobData.taskData.password)) {
        userAuthObj =
            authApi.decryptUserAuth({'username': jobData.taskData.username,
                                     'password': jobData.taskData.password});
    }
    var defProject = getDefProjectByJobData(jobData);
    if (null != configAdminTenant) {
        userAuthObj['tenant'] = configAdminTenant;
    } else {
        userAuthObj['tenant'] = defProject;
    }
    return userAuthObj;
}

function apiGet (reqUrl, jobData, callback, appHeaders, stopRetry)
{
    var headers = {};
    var authObj = buildAuthObjByJobData(jobData);

    headers = configAppHeaders(headers, jobData);
    headers = getHeaders(headers, appHeaders);
    var multiTenancyEnabled = commonUtils.isMultiTenancyEnabled();

    configServer.api.get(reqUrl, function(err, data) {
        if (err) {
            if (stopRetry) {
                callback(err, data);
            } else {
                if (err.responseCode ==
                     global.HTTP_STATUS_AUTHORIZATION_FAILURE) {
                    /* Retry once again */
                    authApi.getUserAuthDataByConfigAuthObj(jobData.taskData.loggedInOrchestrationMode,
                                                           authObj,
                                                  function(error, data) {
                        if ((error) || (null == data) ||
                            (null == data.access) ||
                            (null == data.access.token)) {
                            if (true == multiTenancyEnabled) {
                                redisPub.sendRedirectRequestToMainServer(jobData);
                                callback(err, data);
                                return;
                            }
                            callback(err, data);
                            return;
                        }
                        updateJobDataAuthObjToken(jobData, data.access.token);
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
    var authObj = buildAuthObjByJobData(jobData);

    headers = configAppHeaders(headers, jobData);
    headers = getHeaders(headers, appHeaders);
    var multiTenancyEnabled = commonUtils.isMultiTenancyEnabled();

    configServer.api.put(reqUrl, function(err, data) {
        if (err) {
            if (stopRetry) {
                callback(err, data);
            } else {
                if (err.responseCode ==
                     global.HTTP_STATUS_AUTHORIZATION_FAILURE) {
                    /* Retry once again */
                    authApi.getUserAuthDataByConfigAuthObj(jobData.taskData.loggedInOrchestrationMode,
                                                           authObj,
                                                  function(error, data) {
                        if ((error) || (null == data) ||
                            (null == data.access) ||
                            (null == data.access.token)) {
                            if (true == multiTenancyEnabled) {
                                redisPub.sendRedirectRequestToMainServer(jobData);
                                callback(err, data);
                                return;
                            }
                            callback(err, data);
                            return;
                        }
                        updateJobDataAuthObjToken(jobData, data.access.token);
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
    var authObj = buildAuthObjByJobData(jobData);

    headers = configAppHeaders(headers, jobData);
    headers = getHeaders(headers, appHeaders);
    var multiTenancyEnabled = commonUtils.isMultiTenancyEnabled();

    configServer.api.post(reqUrl, function(err, data) {
        if (err) {
            if (stopRetry) {
                callback(err, data);
            } else {
                if (err.responseCode ==
                     global.HTTP_STATUS_AUTHORIZATION_FAILURE) {
                    /* Retry once again */
                    authApi.getUserAuthDataByConfigAuthObj(jobData.taskData.loggedInOrchestrationMode,
                                                           authObj,
                                                  function(error, data) {
                        if ((error) || (null == data) ||
                            (null == data.access) ||
                            (null == data.access.token)) {
                            if (true == multiTenancyEnabled) {
                                redisPub.sendRedirectRequestToMainServer(jobData);
                                callback(err, data);
                                return;
                            }
                            callback(err, data);
                            return;
                        }
                        updateJobDataAuthObjToken(jobData, data.access.token);
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
    var authObj = buildAuthObjByJobData(jobData);

    headers = configAppHeaders(headers, jobData);
    headers = getHeaders(headers, appHeaders);
    var multiTenancyEnabled = commonUtils.isMultiTenancyEnabled();

    configServer.api.delete(reqUrl, function(err, data) {
        if (err) {
            if (stopRetry) {
                callback(err, data);
            } else {
                if (err.responseCode ==
                     global.HTTP_STATUS_AUTHORIZATION_FAILURE) {
                    /* Retry once again */
                    authApi.getUserAuthDataByConfigAuthObj(jobData.taskData.loggedInOrchestrationMode,
                                                           authObj,
                                                  function(error, data) {
                        if ((error) || (null == data) ||
                            (null == data.access) ||
                            (null == data.access.token)) {
                            if (true == multiTenancyEnabled) {
                                redisPub.sendRedirectRequestToMainServer(jobData);
                                callback(err, data);
                                return;
                            }
                            callback(err, data);
                            return;
                        }
                        updateJobDataAuthObjToken(jobData, data.access.token);
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


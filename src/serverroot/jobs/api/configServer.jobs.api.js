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
var authParams = null;
try {
    authParams = require('../../../../config/userAuth');
} catch(e) {
    authParams = null;
}

function getHeaders(defHeaders, appHeaders)
{
    var headers = defHeaders;
    for (key in appHeaders) {
        /* App Header overrides default header */
        headers[key] = appHeaders[key];
    }
    return headers;
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
                                //redisPub.sendRedirectRequestToMainServer(jobData);
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

    configServer.api.put(reqUrl, reqData, function(err, data) {
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
                                //redisPub.sendRedirectRequestToMainServer(jobData);
                                callback(err, data);
                                return;
                            }
                            callback(err, data);
                            return;
                        }
                        updateJobDataAuthObjToken(jobData, data.access.token);
                        exports.apiPut(reqUrl, reqData, jobData, callback, appHeaders, true);
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

    configServer.api.post(reqUrl, reqData, function(err, data) {
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
                                //redisPub.sendRedirectRequestToMainServer(jobData);
                                callback(err, data);
                                return;
                            }
                            callback(err, data);
                            return;
                        }
                        updateJobDataAuthObjToken(jobData, data.access.token);
                        exports.apiPost(reqUrl, reqData, jobData, callback, appHeaders, true);
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
                                //redisPub.sendRedirectRequestToMainServer(jobData);
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


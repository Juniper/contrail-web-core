/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * This file contains the wrapper function for authentication mechanism, based
 * on the authentication method (as of now keystone or cloudStack),
 * corresponding module is loaded via this file.
 */

var config = process.mainModule.exports['config'],
    crypto = require('crypto'),
    redis = require('redis'),
    logutils = require('../utils/log.utils'),
    commonUtils = require('../utils/common.utils'),
    redisSub = require('../web/core/redisSub'),
    orch = require('../orchestration/orchestration.api'),
    global = require('./global');

var keystoneAuthApi = require('../orchestration/plugins/openstack/keystone.api');
var cloudstackAuthApi  =
    require('../orchestration/plugins/cloudstack/cloudstack.authApi');
var noOrchestrationAuthApi  =
    require('../orchestration/plugins/no-orch/noOrchestration.api');
var vCenterAuthApi = 
    require('../orchestration/plugins/vcenter/vcenter.authApi');

var getAuthMethod = {
    'vcenter': vCenterAuthApi,
    'openstack': keystoneAuthApi,
    'cloudstack' : cloudstackAuthApi,
    'none'       : noOrchestrationAuthApi
}

/* Function: createUserAuthObj
    Create User Authentication parameter object to store in Redis
 */
function createUserAuthObj (userName, password)
{
    var userObj = {};
    userObj['username'] = userName;
    userObj['password'] = password;
    return JSON.stringify(userObj);
}

/** Function: createAuthKeyBySessionId
 *  This function is used to return the key against which the userId/password
 *  is stored in Redis
 */
function createAuthKeyBySessionId (sessionId)
{
    return (global.STR_AUTH_KEY + global.ZWQ_MSG_SEPERATOR + sessionId);
}

/** Function: authorize
  * 1. This function is wrapper API to authenticate the user using authentication
  *    credentials
  *   @authObj:  Object containing authentication parameters provided from client.
  *   @callback: Once response comes from authentication servers, call the
  *              callback
  * 2. public function
  */
function doAuthenticate (req, res, appData, callback) {
    getAuthMethod[req.session.loggedInOrchestrationMode].authenticate(req, res,
                                                                      appData, function(err, data) {
        callback(err, data);
    });
}

function getTokenObj (authObj, callback)
{
    var req = authObj.req 
    getAuthMethod[req.session.loggedInOrchestrationMode].getToken(authObj, function(err, data) { 
        callback(err, data);
    });
}

function getTenantList (req, appData, callback)
{
    getAuthMethod[req.session.loggedInOrchestrationMode].getTenantList(req, appData, function(err, data) {
        callback(err, data);
    });
}

function getProjectList (req, appData, callback)
{
    getAuthMethod[req.session.loggedInOrchestrationMode].getProjectList(req, appData, function(err, data) {
        callback(err, data);
    });
}

function getDomainList (req, callback)
{
    getAuthMethod[req.session.loggedInOrchestrationMode].getDomainList(req, function(err, data) {
        callback(err, data);
    });
}

function getNewTokenObjByToken (authObj, callback) {
    var req = authObj.req 
    getAuthMethod[req.session.loggedInOrchestrationMode].getUserAuthDataByAuthObj(authObj,
                                       function(err, data) {
        callback(err, data);
    });
}

function checkAndUpdateDefTenantToken (req, tenantId, data)
{
    return getAuthMethod[req.session.loggedInOrchestrationMode].updateDefTenantToken(req, tenantId, data);
}

function getAPIServerAuthParams (req)
{
    return getAuthMethod[req.session.loggedInOrchestrationMode].getAPIServerAuthParamsByReq(req);
}

function formatTenantList (projectLists, apiProjects, callback)
{
    getAuthMethod[req.session.loggedInOrchestrationMode].formatTenantList(req, projectLists, apiProjects, 
                                   function (projects) {
        callback(projects);
    });
}

function isDefaultDomain (request, domain)
{
    return getAuthMethod[request.session.loggedInOrchestrationMode].isDefaultDomain(request, domain);
}

function getDefaultDomain (req)
{
    return getAuthMethod[req.session.loggedInOrchestrationMode].getDefaultDomain(req);
}

function getServiceCatalog (req, callback)
{
    getAuthMethod[req.session.loggedInOrchestrationMode].getServiceCatalog(req, function(data) {
        callback(data);
    });
}

function getUIRolesByExtRoles (req, extRoles)
{
    return getAuthMethod[req.session.loggedInOrchestrationMode].getUserRoleByAuthResponse(extRoles);
}

function getCookieObjs (req, appData, callback)
{
    return getAuthMethod[req.session.loggedInOrchestrationMode].getCookieObjs(req, appData, callback);
}

function getSessionExpiryTime (req, appData, callback)
{
    if (null != req.session.loggedInOrchestrationMode) {
        return getAuthMethod[req.session.loggedInOrchestrationMode].getSessionExpiryTime(req, appData, callback);
    }
    return null;
}

function getUserAuthDataByConfigAuthObj (loggedInOrchestrationMode, authObj, callback)
{
    if (null == loggedInOrchestrationMode) {
        loggedInOrchestrationMode = 'openstack';
    }
    getAuthMethod[loggedInOrchestrationMode].getUserAuthDataByConfigAuthObj(authObj,
                                                                            callback);
}

exports.doAuthenticate = doAuthenticate;
exports.getTenantList = getTenantList;
exports.getTokenObj = getTokenObj;
exports.checkAndUpdateDefTenantToken = checkAndUpdateDefTenantToken;
exports.getAPIServerAuthParams = getAPIServerAuthParams;
exports.createAuthKeyBySessionId = createAuthKeyBySessionId;
exports.formatTenantList = formatTenantList;
exports.getServiceCatalog = getServiceCatalog;
exports.getDomainList = getDomainList;
exports.getProjectList = getProjectList;
exports.isDefaultDomain = isDefaultDomain;
exports.getNewTokenObjByToken = getNewTokenObjByToken;
exports.getUIRolesByExtRoles = getUIRolesByExtRoles;
exports.getDefaultDomain = getDefaultDomain;
exports.getCookieObjs = getCookieObjs;
exports.getSessionExpiryTime = getSessionExpiryTime;
exports.getUserAuthDataByConfigAuthObj = getUserAuthDataByConfigAuthObj;


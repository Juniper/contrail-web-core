/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * This file contains the wrapper function for authentication mechanism, based
 * on the authentication method (as of now keystone or cloudStack),
 * corresponding module is loaded via this file.
 */

var configUtils = require('./config.utils'),
    crypto = require('crypto'),
    redis = require('redis'),
    logutils = require('../utils/log.utils'),
    commonUtils = require('../utils/common.utils'),
    redisSub = require('../web/core/redisSub'),
    orch = require('../orchestration/orchestration.api'),
    global = require('./global'),
    _ = require("lodash");

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
function redirectToConnectedApps (req, res) {
    var appName = req.param('app'),
        config = configUtils.getConfig(),
        connectedAppsInfo = config.connectedAppsInfo,
        appInfo = connectedAppsInfo[appName],
        userObj = {
            req: req
        };
    var tokenObj = keystoneAuthApi.getUserAuthData(req, null, function (err, data) {
        if (appInfo != null && appInfo.url != null && data != null) {
            res.redirect(appInfo.url + data.access.token.id);
        } else {
            logutils.logger.error('AppInfo or token not found');
            var errorObj = {
                status: 'failure',
                msg: 'AppInfo or token not found'
            };
            commonUtils.handleJSONResponse(null, res, errorObj);
        }
    });
}
function singleSignOn (req, res) {
    var config = configUtils.getConfig();
    getAuthMethod[req.session.loggedInOrchestrationMode].checkIfValidToken (req, null, function (err, data) {
        var tokenObj = data.access.token;
        req.session.authApiVersion = _.result(config, 'identityManager.apiVersion.0', 'v2.0');
        if (req.session.authApiVersion == 'v2.0') {
            getAuthMethod[req.session.loggedInOrchestrationMode].getTenantListByToken(req, tokenObj, function (err, tenantData) {
                getAuthMethod[req.session.loggedInOrchestrationMode].doV2AuthCB(err, tenantData, req, null, null, tokenObj.id, function (err) {
                    if (err != null) {
                        logutils.logger.error('Unauthorized project access');
                        commonUtils.handleJSONResponse(null, res, err);
                    } else {
                        res.redirect('/');
                        res.end();
                    }
                });
            });
        } else if (req.session.authApiVersion == 'v3'){
            req.session.userid = _.result(data, 'access.user.id', null);
            getAuthMethod[req.session.loggedInOrchestrationMode].getV3ProjectListByToken(req, tokenObj.id, function (err, tenantData) {
                var userObj = {
                    tokenid: tokenObj.id,
                    //req: req
                };
                getAuthMethod[req.session.loggedInOrchestrationMode].doV3AuthCB(err, tenantData, req, userObj, function (err) {
                    if (err != null) {
                        logutils.logger.error('Unauthorized project access');
                        commonUtils.handleJSONResponse(null, res, err);
                    } else {
                        res.redirect('/');
                        res.end();
                    }
                })
            });
        }
    });
}

function getTokenObj (authObj, callback)
{
    var req = authObj.req;
    getAuthMethod[req.session.loggedInOrchestrationMode].getToken(authObj,
                                                                  callback);
}

function getTokenAndUpdateLastToken (authObj, callback)
{
    var req = authObj.req;
    getAuthMethod[req.session.loggedInOrchestrationMode].getTokenAndUpdateLastToken(authObj,
                                                                                    callback);
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

function getRoleList (req, callback)
{
    getAuthMethod[req.session.loggedInOrchestrationMode].getRoleList(req, function(err, data) {
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

function getUIUserRoleByTenant (userObj, callback)
{
    var req = userObj['req'];
    return getAuthMethod[req.session.loggedInOrchestrationMode].getUIUserRoleByTenant(userObj,
                                                                                      callback);
}

function getUIRolesByExtRoles (req, extRoles)
{
    return getAuthMethod[req.session.loggedInOrchestrationMode].getUIRolesByExtRoles(extRoles);
}

function getExtUserRoleByTenant (userObj, callback)
{
    var req = userObj['req'];
    return getAuthMethod[req.session.loggedInOrchestrationMode].getExtUserRoleByTenant(userObj, callback);
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

function deleteAllTokens (req, callback)
{
    if ((null != req.session) && 
        (null != req.session.loggedInOrchestrationMode)) {
        getAuthMethod[req.session.loggedInOrchestrationMode].deleteAllTokens(req,
                                                                         callback);
    } else {
        callback(null, null);
    }
}

function getDomainNameByUUID (request, uuid, domList)
{
    return getAuthMethod[request.session.loggedInOrchestrationMode].getDomainNameByUUID(request,
                                                                             uuid,
                                                                             domList);
}

function getServiceAPIVersionByReqObj (request, appData, svcType, callback, reqBy)
{
    var orchMode = request.session.loggedInOrchestrationMode;
    return getAuthMethod[orchMode].getServiceAPIVersionByReqObj(request,
                                                                appData,
                                                                svcType,
                                                                callback, reqBy);
}
function isValidUrlWithXAuthToken (reqUrl, req)
{
    var validUrlsWithXAuthToken = global.URLS_TO_BYPASS_AUTH;
    var xAuthToken = req.headers["x-auth-token"];
    if (null == xAuthToken) {
        return false;
    }
    var validUrlsCnt = validUrlsWithXAuthToken.length;
    for (var i = 0; i < validUrlsCnt; i++) {
        if (0 == reqUrl.indexOf(validUrlsWithXAuthToken[i])) {
            return true;
        }
    }
    return false;
}

function setAuthFlagByXAuthTokenHeader (req)
{
    var orchMode = req.headers["x-orchestrationmode"];
    if (null == orchMode) {
        orchMode = "openstack";
    }
    if (isValidUrlWithXAuthToken(req.url, req)) {
        if (null == req.session) {
            req.session = {};
        }
        /* If the request contains the X-Auth-Token and URL contains the
         * forward-proxy, then assume that the request is authenticated and
         * authorized
         */
        req.session.isAuthenticated = true;
        var config = configUtils.getConfig();
        var idApiVersions =
            commonUtils.getValueByJsonPath(config,
                                           "identityManager;apiVersion",
                                           ["v2.0"]);
        req.session.authApiVersion = idApiVersions[0];
        if (null == req.session.loggedInOrchestrationMode) {
            req.session.loggedInOrchestrationMode = orchMode;
        }
    }
}

function checkIfValidToken (req, tokenId, callback)
{
    var orchMode = req.session.loggedInOrchestrationMode;
    return getAuthMethod[orchMode].checkIfValidToken(req, tokenId, callback);
}
function getAdminProjectList (req)
{
    var adminProjectList = [],
        config = configUtils.getConfig();
    var adminRoleProjects = config.roleMaps['cloudAdmin'];
    var adminRoleProjectsInUpper = adminRoleProjects.map(function(x) {
        return x.toUpperCase();
    });
    var memberRoleProjects = config.roleMaps['member'];
    var memberRoleProjectsInUpper = memberRoleProjects.map(function(x) {
        return x.toUpperCase();
    });
    var adminRoleProjectsCnt = adminRoleProjects.length;
    var userRoles = req.session.userRoles;
    if (-1 != adminRoleProjectsInUpper.indexOf(global.STR_ROLE_WILDCARD)) {
        /* If any role not matching with member role, treat it as admin role
         * project
         */
        for (var key in userRoles) {
            var roles = userRoles[key];
            var rolesCnt = roles.length;
            for (var i = 0; i < rolesCnt; i++) {
                var userRole = roles[i].toUpperCase();
                if (-1 != adminRoleProjectsInUpper.indexOf(userRole)) {
                    adminProjectList.push(key);
                    continue;
                }
                if (-1 == memberRoleProjectsInUpper.indexOf(userRole)) {
                    adminProjectList.push(key);
                    continue;
                }
            }
        }
        return adminProjectList;
    }
    for (var key in userRoles) {
        var roles = userRoles[key];
        if (null == roles) {
            logutils.logger.error('req.session.userRoles null for project:' +
                                  ' ' + key);
            continue;
        }
        var rolesCnt = roles.length;
        for (var i = 0; i < rolesCnt; i++) {
            var userRole = roles[i].toUpperCase();
            if (-1 != adminRoleProjectsInUpper.indexOf(userRole)) {
                adminProjectList.push(key);
            }
        }
    }
    return adminProjectList;
}

function getEndpointServiceType (type)
{
    var svcType = null,
        config = configUtils.getConfig();
    switch (type) {
    case 'OpServer':
        svcType =
            commonUtils.getValueByJsonPath(config,
                                           'endpoints;opServiceType',
                                           'OpServer');
        break;
    case 'ApiServer':
        svcType =
            commonUtils.getValueByJsonPath(config,
                                           'endpoints;apiServiceType',
                                           'ApiServer');
        break;
    default:
        break;
    }
    return svcType;
}

function isRegionListFromConfig ()
{
    var config = configUtils.getConfig();
    return ((false == config.serviceEndPointFromConfig) &&
            (true == config.regionsFromConfig));
}

function isRegionListFromIdentity ()
{
    var config = configUtils.getConfig();
    return ((false == config.serviceEndPointFromConfig) &&
            (false == config.regionsFromConfig));
}

function isMultiRegionSupported ()
{
    return isRegionListFromConfig() || isRegionListFromIdentity();
}

function getRegionList (req, res, appData)
{
    commonUtils.handleJSONResponse(null, res, req.session.regionList);
}

function getCurrentRegion (req)
{
    var sessionRegion =
        commonUtils.getValueByJsonPath(req, 'session;regionname', null, false);
    return commonUtils.getValueByJsonPath(req, 'cookies;region', sessionRegion,
                                          false);
}

function shiftServiceEndpointList (req, serviceType, regionName)
{
    var orchMode = req.session.loggedInOrchestrationMode;
    return getAuthMethod[orchMode].shiftServiceEndpointList(req,
                                                            serviceType,
                                                            regionName);
}

function getAuthRetryData (token, req, reqUrl, callback)
{
    var orchMode = req.session.loggedInOrchestrationMode;
    return getAuthMethod[orchMode].getAuthRetryData(token, req, reqUrl,
                                                    callback);
}

function getPortToProcessMapByReqObj (req)
{
    var orchMode = req.session.loggedInOrchestrationMode;
    return getAuthMethod[orchMode].getPortToProcessMapByReqObj(req);
}

function getConfigEntityByServiceEndpoint (req, serviceName)
{
    var orchMode = req.session.loggedInOrchestrationMode;
    return getAuthMethod[orchMode].getConfigEntityByServiceEndpoint(req, serviceName);
}

function checkIfValidToken (req, tokenId, callback)
{
    var orchMode = req.session.loggedInOrchestrationMode;
    return getAuthMethod[orchMode].checkIfValidToken(req, tokenId, callback);
}

exports.doAuthenticate = doAuthenticate;
exports.getTenantList = getTenantList;
exports.getTokenObj = getTokenObj;
exports.getTokenAndUpdateLastToken = getTokenAndUpdateLastToken;
exports.checkAndUpdateDefTenantToken = checkAndUpdateDefTenantToken;
exports.getAPIServerAuthParams = getAPIServerAuthParams;
exports.createAuthKeyBySessionId = createAuthKeyBySessionId;
exports.formatTenantList = formatTenantList;
exports.getServiceCatalog = getServiceCatalog;
exports.getDomainList = getDomainList;
exports.getProjectList = getProjectList;
exports.isDefaultDomain = isDefaultDomain;
exports.getNewTokenObjByToken = getNewTokenObjByToken;
exports.getDefaultDomain = getDefaultDomain;
exports.getCookieObjs = getCookieObjs;
exports.getSessionExpiryTime = getSessionExpiryTime;
exports.getUserAuthDataByConfigAuthObj = getUserAuthDataByConfigAuthObj;
exports.deleteAllTokens = deleteAllTokens;
exports.getExtUserRoleByTenant = getExtUserRoleByTenant;
exports.getDomainNameByUUID = getDomainNameByUUID;
exports.getUIUserRoleByTenant = getUIUserRoleByTenant;
exports.getUIRolesByExtRoles = getUIRolesByExtRoles;
exports.getAdminProjectList = getAdminProjectList;
exports.getServiceAPIVersionByReqObj = getServiceAPIVersionByReqObj;
exports.getEndpointServiceType = getEndpointServiceType;
exports.isRegionListFromConfig = isRegionListFromConfig;
exports.isRegionListFromIdentity = isRegionListFromIdentity;
exports.isMultiRegionSupported = isMultiRegionSupported;
exports.getRegionList = getRegionList;
exports.getCurrentRegion = getCurrentRegion;
exports.shiftServiceEndpointList = shiftServiceEndpointList;
exports.getRoleList = getRoleList;
exports.getAuthRetryData = getAuthRetryData;
exports.getPortToProcessMapByReqObj = getPortToProcessMapByReqObj;
exports.getConfigEntityByServiceEndpoint = getConfigEntityByServiceEndpoint;
exports.singleSignOn = singleSignOn;
exports.redirectToConnectedApps = redirectToConnectedApps;
exports.setAuthFlagByXAuthTokenHeader = setAuthFlagByXAuthTokenHeader;
exports.checkIfValidToken = checkIfValidToken;
exports.isValidUrlWithXAuthToken = isValidUrlWithXAuthToken;

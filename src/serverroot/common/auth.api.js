/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * This file contains the wrapper function for authentication mechanism, based
 * on the authentication method (as of now keystone or cloudStack),
 * corresponding module is loaded via this file.
 */

var config = require('../../../config/config.global'),
    crypto = require('crypto'),
    redis = require('redis'),
    logutils = require('../utils/log.utils'),
    commonUtils = require('../utils/common.utils'),
    redisSub = require('../web/core/redisSub'),
    orch = require('../orchestration/orchestration.api'),
    global = require('./global');

var authMethodApi;
var orchModel = orch.getOrchestrationModel();
if (orchModel == 'openstack') {
    authMethodApi = require('../orchestration/plugins/openstack/keystone.api');
} else if ('cloudstack' == orchModel) {
    authMethodApi =
        require('../orchestration/plugins/cloudstack/cloudstack.authApi');
} else {
    authMethodApi =
        require('../orchestration/plugins/no-orch/noOrchestration.api');
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

function pushUserAuthToSession (username, password, req, callback)
{
    var userCipher = null;
    var passwdCipher = null
    var userEncrypted = null;
    var passwdEncrypted = null;

    userCipher = crypto.createCipher(global.MD5_ALGO_AES256,
                                     global.MD5_MY_KEY);
    passwdCipher = crypto.createCipher(global.MD5_ALGO_AES256,
                                       global.MD5_MY_KEY);
    userEncrypted = userCipher.update(username, 'utf8', 'hex') +
                                      userCipher.final('hex');
    passwdEncrypted = passwdCipher.update(password, 'utf8', 'hex') +
                                          passwdCipher.final('hex');
    req.session.auth = {'userid': userEncrypted, 'passwd': passwdEncrypted}
    callback(null);
}

function getUserDetailsByReqObj (req, callback)
{
    var auth = req.session.auth;
    var userid = auth['userid'];
    var passwd = auth['passwd'];

    /* Decrypt the userName and Password first */
    userDecipher = crypto.createDecipher(global.MD5_ALGO_AES256,
                                         global.MD5_MY_KEY);
    passwdDecipher = crypto.createDecipher(global.MD5_ALGO_AES256,
                                           global.MD5_MY_KEY);
    userDecrypted = userDecipher.update(userid, 'hex', 'utf8') +
        userDecipher.final('utf8');
    passwdDecrypted = passwdDecipher.update(passwd, 'hex', 'utf8') +
        passwdDecipher.final('utf8');

    callback(null, {username:userDecrypted, password:passwdDecrypted});
}

/** Function: authorize
  * 1. This function is wrapper API to authenticate the user using authentication
  *    credentials
  *   @authObj:  Object containing authentication parameters provided from client.
  *   @callback: Once response comes from authentication servers, call the
  *              callback
  * 2. public function
  */
function doAuthenticate (req, res, callback) {
    authMethodApi.authenticate(req, res, function(err, data) {
        callback(err, data);
    });
}

function getTokenObj (authObj, callback)
{
    authMethodApi.getToken(authObj, function(err, data) { 
        callback(err, data);
    });
}

function getTenantList (req, callback)
{
    authMethodApi.getTenantList(req, function(err, data) {
        callback(err, data);
    });
}

function getProjectList (req, appData, callback)
{
    authMethodApi.getProjectList(req, appData, function(err, data) {
        callback(err, data);
    });
}

function getDomainList (req, callback)
{
    authMethodApi.getDomainList(req, function(err, data) {
        callback(err, data);
    });
}

function getTokenObjBySession (sessionId, tenantId, forceAuth, callback) {
    authMethodApi.getTokenBySession(sessionId, tenantId, forceAuth,
                                       function(err, data) {
        callback(err, data);
    });
}

function checkAndUpdateDefTenantToken (req, tenantId, data)
{
    return authMethodApi.updateDefTenantToken(req, tenantId, data);
}

function getAPIServerAuthParams (req)
{
    return authMethodApi.getAPIServerAuthParamsByReq(req);
}

function formatTenantList (projectLists, apiProjects, callback)
{
    authMethodApi.formatTenantList(projectLists, apiProjects, 
                                   function (projects) {
        callback(projects);
    });
}

function isDefaultDomain (request, domain)
{
    return authMethodApi.isDefaultDomain(request, domain);
}

function getServiceCatalog (req, callback)
{
    authMethodApi.getServiceCatalog(req, function(data) {
        callback(data);
    });
}

exports.doAuthenticate = doAuthenticate;
exports.pushUserAuthToSession = pushUserAuthToSession;
exports.getTenantList = getTenantList;
exports.getTokenObj = getTokenObj;
exports.getUserDetailsByReqObj = getUserDetailsByReqObj;
exports.deleteAuthDataBySessionId = deleteAuthDataBySessionId;
exports.getTokenObjBySession = getTokenObjBySession;
exports.checkAndUpdateDefTenantToken = checkAndUpdateDefTenantToken;
exports.getAPIServerAuthParams = getAPIServerAuthParams;
exports.createAuthKeyBySessionId = createAuthKeyBySessionId;
exports.formatTenantList = formatTenantList;
exports.getServiceCatalog = getServiceCatalog;
exports.getDomainList = getDomainList;
exports.getProjectList = getProjectList;
exports.isDefaultDomain = isDefaultDomain;


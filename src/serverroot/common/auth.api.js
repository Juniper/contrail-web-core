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
    global = require('./global');

var orchModel = ((config.orchestration) && (config.orchestration.Manager)) ?
    config.orchestration.Manager : 'openstack';

if (orchModel == 'openstack') {
    var authMethodApi = require('../orchestration/plugins/openstack/keystone.api');
} else {
    var authMethodApi =
        require('../orchestration/plugins/cloudstack/cloudstack.authApi');
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

function saveUserAuthInRedis (username, password, req, callback)
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
    var redisStoreKey =
        createAuthKeyBySessionId(req.session.id);
    var userObj = createUserAuthObj(userEncrypted,
                                                passwdEncrypted);
    redisSub.redisPerClient.set(redisStoreKey, userObj, function(err) {
        if (err) {
            /* Redis Set Error */
            logutils.logger.error("User auth store error " +
                                  err);
        } else {
            logutils.logger.debug("User auth stored in redis " + 
                                  req.session.id);
        }
        callback(err);
    });
}

function getDecryptedUserBySessionId (sessionId, callback)
{
    var data;
    var userDecipher, passwdDecipher, userDecrypted, passwdDecrypted;

    var authKey = createAuthKeyBySessionId(sessionId);
    redisSub.redisPerClient.get(authKey, function(err, data) {
        if (err) {
            logutils.logger.error("Redis get error for Session:" + sessionId +
                                  " Got Redis error:" + err);
            callback(err, null);
            return;
        }
        if (null == data) {
            logutils.logger.error("Did not get authObj for Session:" +
                                  sessionId);
            callback(err, null);
            return;
        }
        /* We got the authObj */
        data = JSON.parse(data);
        /* Decrypt the userName and Password first */
        userDecipher = crypto.createDecipher(global.MD5_ALGO_AES256,
                                             global.MD5_MY_KEY);
        passwdDecipher = crypto.createDecipher(global.MD5_ALGO_AES256,
                                               global.MD5_MY_KEY);
        userDecrypted = userDecipher.update(data['username'], 'hex', 'utf8') +
                                            userDecipher.final('utf8');
        passwdDecrypted = passwdDecipher.update(data['password'], 'hex', 'utf8') +
                                                passwdDecipher.final('utf8');

        callback(null, {username:userDecrypted, password:passwdDecrypted});
   });
}

/* Function: deleteAuthDataBySessionId
   This function is called when session expires.
   It is used to delete the Auth entry from redis by session id 
 */
function deleteAuthDataBySessionId (sessionId) {
    var authKey = createAuthKeyBySessionId(sessionId);
    redisSub.redisPerClient.del(authKey, function(err) {
        if (err) {
            logutils.logger.error("Redis DEL error [" + err + "] while " +
                                  "deleting authKey: " + authKey);
        } else {
            logutils.logger.debug("Redis DEL successful while deleting " +
                                  "authKey: " + authKey);
        }
    });
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
exports.saveUserAuthInRedis = saveUserAuthInRedis;
exports.getTenantList = getTenantList;
exports.getTokenObj = getTokenObj;
exports.getDecryptedUserBySessionId = getDecryptedUserBySessionId;
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


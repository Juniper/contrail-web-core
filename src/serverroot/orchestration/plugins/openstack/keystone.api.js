/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

/**
 * This file contains the functions for authentication mechanism via
 * keystone
 */

var config = require('../../../../../config/config.global'),
    global = require('../../../common/global'),
    messages = require('../../../common/messages'),
    logutils = require('../../../utils/log.utils'),
    authApi = require('../../../common/auth.api'),
    crypto = require('crypto'),
    appErrors = require('../../../errors/app.errors.js'),
    commonUtils = require('../../../utils/common.utils'),
    async = require('async'),
    rest = require('../../../common/rest.api');

var authServerIP = ((config.identityManager) && (config.identityManager.ip)) ? 
    config.identityManager.ip : global.DFLT_SERVER_IP;
var authServerPort = 
    ((config.identityManager) && (config.identityManager.port)) ?
    config.identityManager.port : '5000';

authAPIServer = rest.getAPIServer({apiName:global.label.IDENTITY_SERVER,
                                   server:authServerIP, port:authServerPort});


var authAPIVers = ['v2.0'];
if ((null != config) && (null != config.identityManager) &&
    (null != config.identityManager.apiVersion)) {
    if ((config.identityManager.apiVersion instanceof Array) &&
        (0 != config.identityManager.apiVersion.length)) {
        authAPIVers = config.identityManager.apiVersion;
    }
}

/** Function: getUserRoleByAuthResponse
 *  1. This function is used to get the user role by keystone roleList response
 *  @private function
 */
function getUserRoleByAuthResponse (resRoleList)
{
    if ((null == resRoleList) || (!resRoleList.length)) {
        /* Ideally if Role is not associated, then we should not allow user to
         * login, but we are assigning role as 'Member' to the user to not to
         * block UI
//        return null;
         */
        return global.STR_ROLE_USER;
    }
    var rolesCount = resRoleList.length;
    for (var i = 0; i < rolesCount; i++) {
        if (resRoleList[i]['name'] != 'Member') {
            return global.STR_ROLE_ADMIN;
        }
    }
    return global.STR_ROLE_USER;
}

/** Function: createProjectListInReqObj
 *  1. This function is used to create the project List to be stored in 
 *     req.session key as project name
 *  @private function
 */
function createProjectListInReqObj (req, tenantList)
{
    var tenantCount = tenantList.length;
    var dataObj = {};
    var projectName = null;
    for (var i = 0; i < tenantCount; i++) {
        projectName = tenantList[i]['name'];
        dataObj[projectName] =
        {  
            'id': tenantList[i]['id'],
            'description': tenantList[i]['description'],
            'enabled': tenantList[i]['enabled']
        };
    }
    req.session.projectList = dataObj;
}

function getAuthRespondData (error, data)
{
    var dataObj = {};
    dataObj['error'] = error;
    dataObj['data'] = data;
    return dataObj;
}

function makeAuthPostReq (dataObj, callback)
{
    var reqUrl = dataObj['reqUrl'];
    var data = dataObj['data'];

    authAPIServer.api.post(reqUrl, data, function(error, data) {
        if (null != error) {
            logutils.logger.error('makeAuthPostReq() error:' + error);
        }
        callback(error, data);
    });
}

function makeAuthGetReq (dataObj, callback)
{
    var reqUrl = dataObj['reqUrl'];
    var headers = dataObj['headers']; 

    authAPIServer.api.get(reqUrl, function(error, data) {
        if (null != error) {
            logutils.logger.error('makeAuthGetReq() error:' + error);
        }
        callback(error, data);
    }, headers);
}

/** Function: getTenantListByToken
 *  1. This API is used to get the list of the projects for current User using token
 *  @public function
 */
function getTenantListByToken (token, callback)
{
    var reqUrl = '/tenants';
    getAuthDataByReqUrl(token, reqUrl, callback);
}

function getAuthDataByReqUrl (token, authUrl, callback)
{
  var headers = {};
  var dataObjArr = [];

  if (null == token) {
      var err = 
          new appErrors.RESTServerError('Token null to populate Tenant List');
      callback(err, null);
      return;
  }
  var apiVerCnt = authAPIVers.length;
  for (var i = 0; i < apiVerCnt; i++) {
      reqUrl = '/' + authAPIVers[i] + authUrl;
      headers['X-Auth-Token'] = token.id;
      dataObjArr.push({'reqUrl': reqUrl, 'headers': headers});
  }
  var startIndex = 0;
  getAuthData(null, dataObjArr, startIndex, makeAuthGetReq, function(err, data) {
    if (null == err) {
        callback(null, data);
    } else {
        callback(err, null);
    }
  });
}

/* Function: getTenantList
    This API is used to get the list of projects for the logged in user
 */
function getTenantList (req, callback)
{
    var token = req.session.last_token_used;
    var reqUrl = '/tenants';
    getAuthRetryData(token, req, reqUrl, callback);
}

function getAuthRetryData (token, req, reqUrl, callback)
{
    getAuthDataByReqUrl(token, reqUrl, function(err, data) {
        if ((err) &&
            (err.responseCode == global.HTTP_STATUS_AUTHORIZATION_FAILURE)) {
            /* Get new Token and retry once again */
            authApi.getTokenObj(req, null, true, 
                                function(error, token) {
                if (error || (null == token)) {
                    commonUtils.redirectToLogout(req, req.res);                     
                    return;
                }
                getAuthDataByReqUrl(token, reqUrl, function(err, newData) {
                    callback(err, newData);
                });
            });
        } else {
            callback(null, data);
        }
    });
}

function formatTenantList (keyStoneProjects, apiProjects, callback) 
{
    var projObj     = {};
    var projectsLen = 0;
    var projects    = {'projects':[]};
    var tenantLen   = 0, i = 0;

    if ((null == keyStoneProjects) || (!('tenants' in keyStoneProjects))) {
        callback(projects);
        return;
    }

    tenantLen = keyStoneProjects['tenants'].length;

    if ((null == apiProjects) || (!('projects' in apiProjects)) ||
        (!(projectsLen = apiProjects['projects'].length))) {
        callback(projects);
        return;
    }

    for (i = 0; i < tenantLen; i++) {
        projName = keyStoneProjects['tenants'][i]['name'];
        projObj[projName] = {'name' : projName};
    }

    for (i = 0; i < projectsLen; i++) {
        projName = apiProjects['projects'][i]['fq_name'][1];
        if ((projObj[projName] != null)) {
            projects['projects'].push(
                   {'fq_name': ['default-domain',projName],
                    'uuid'   : apiProjects['projects'][i]['uuid']
                          });
        }
    }
    callback(projects);
}

function getKeystoneAPIVersions ()
{
    return authAPIVers;
}

function getAuthData (error, reqArr, index, authCB, callback)
{
    var authApiVerList = getKeystoneAPIVersions();
    var len = reqArr.length;
    if (index >= len) {
        var str = 'Did not get Auth Response for auth API versions:' +
            authApiVerList.join(',');
        var err = 
            new appErrors.RESTServerError(str);
        if (null == error) {
            error = err;
        }
        callback(error, null);
        return;
    }
    authCB(reqArr[index], function(err, data) {
        if ((null == err) && (null != data)) {
            callback(null, data);
            return;
        } else {
            getAuthData(err, reqArr, index + 1, authCB, callback);
        }
    });
}

/** Function: doAuth
 *  1. Authenticate and get user and token. Call the callback function on 
 *     successful authentication.
 *  @username: username provided by the client
 *  @password: password provided by the client
 *  @tenantName: tenant name
 *  @callback: callback called once authentication method is done
 *  2. private function
 */
function doAuth (username, password, tenantName, callback)
{
    var reqArr = [];
    var data = {
        auth:{
            passwordCredentials:{
                username: username,
                password: password
            }
        }
    };

    if (tenantName) {
        data['auth']['tenantName'] = tenantName;
    }
    var authApiVerList = getKeystoneAPIVersions();
    var apiVerCnt = authApiVerList.length;
    for (var i = 0; i < apiVerCnt; i++) {
        reqUrl = '/' + authApiVerList[i] + '/tokens';
        reqArr.push({'reqUrl': reqUrl, 'data': data,
                    'version': authApiVerList[i]});
    }
    var startIndex = 0;
    getAuthData(null, reqArr, startIndex, makeAuthPostReq, function(err, data) {
        if (null == err) {
            callback(data);
        } else {
            callback(null);
        }
    });
}

/* Function: getProjectObj
    This function is used to get the project Object from the tenantId
 */
function getProjectObj (req, tenantId)
{
    if (null == tenantId) {
        return null;
    }
    return req.session.projectList[tenantId];
}

/* Function: updateTokenIdForProject
    This function is used to update the Token for a particular project in 
    req.session
 */
function updateTokenIdForProject (req, tenantId, token)
{
    if (null == tenantId) {
        return;
    }
    var projObj = getProjectObj(req, tenantId);
    if (projObj) {
        try {
            projObj['token'] = token.access.token;
        } catch(e) {
            logutils.logger.debug("In updateTokenIdForProject(), " +
                                  "Got JSON parse error:" + e);
            projObj['token'] = null;
        }
    }
}

/** Function: getToken
 *   This function is used to get token object from the tenantId and once done,
 *   call the callback
 */
function getToken (req, tenantId, forceAuth, callback)
{
    var projEntry = getProjectObj(req, tenantId);
    if ((projEntry) && (projEntry['token']) && (null == forceAuth)) {
        logutils.logger.debug("We are having project already in DB:" +
                              tenantId);
        callback(null, projEntry['token']);
        return;
    }
    getUserAuthData(req, tenantId, function(err, data) {
        if ((null != err) || (null == data) || (null == data.access)) {
            callback(err, null);
        } else {
            callback(null, data.access.token);
        }
    });
}

function updateLastTokenUsed (req, data)
{
    if ((null != data) && (null != data.access) && 
        (null != data.access.token)) {
        req.session.last_token_used = data.access.token;
    }
}

function getUserAuthData (req, tenantId, callback)
{
    /* First check if we have tokenId against the tenantId 
       in req.session.projectList 
     */
    var userDecipher = null;
    var passwdDecipher = null;
    var userDecrypted = null;
    var passwdDecrypted = null;

    /* We did not get the Token, so now send the request to get the token id with the 
       Auth Obj Stored in Redis
     */
    /* First get the userId and password Details from the sessionId */
    authApi.getDecryptedUserBySessionId(req.session.id, function(err, authObj) {
        if ((err) || (null == authObj)) {
            callback(err, null);
            return;
        }
        
        doAuth(authObj.username, authObj.password, tenantId, function(data) {
            if (data == null) {
                if (tenantId) {
                    logutils.logger.error("Trying to illegal access with tenantId: " +
                                          tenantId + " With session: " + req.session.id);
                }
                var err = new
                    appErrors.RESTServerError(messages.error.unauthenticate_to_project);
                err.responseCode = global.HTTP_STATUS_AUTHORIZATION_FAILURE;
                callback(err, null);
                return;
            }
            /* Now save this token against this project */
            if (tenantId) {
                logutils.logger.debug("Got the token successfully for tenant:" +
                                      tenantId);
            }
            updateTokenIdForProject(req, tenantId, data);
            authApi.checkAndUpdateDefTenantToken(req, tenantId, data);
            updateLastTokenUsed(req, data);
            callback(null, data);
            return;
        });
    });
}

function getServiceCatalog (req, callback)
{
    try {
        var tenant = req.session.def_token_used.tenant.name;
    } catch(e) {
        logutils.logger.error("Tenant not found in Default Token.");
        tenant = null;
    }
    getUserAuthData(req, tenant, function(err, data) {
        if ((null != err) || (null == data) || (null == data.access)) {
            callback(null);
            return;
        }
        callback(data.access.serviceCatalog);
    });
}

function authenticate (req, res, callback)
{
    var self = this,
        post = req.body,
        username = post.username,
        password = post.password,
        urlHash = '',
        userJSON, tokenJSON, roleJSON;
    var userCipher = null;
    var passwdCipher = null
    var userEncrypted = null;
    var passwdEncrypted = null; 
    if(post.urlHash != null)        
        urlHash = post.urlHash;
    var loginErrFile = 'webroot/html/login-error.html';
    doAuth(username, password, null, function (data) {
        if ((null == data) || (null == data.access)) {
            req.session.isAuthenticated = false;
            commonUtils.changeFileContentAndSend(res, loginErrFile,
                                                 global.CONTRAIL_LOGIN_ERROR, 
                                                 messages.error.invalid_user_pass,
                                                 function() {
            });
            return;
        }
        req.session.isAuthenticated = true;
        req.session.userid = data.access.user["id"];
        /* Now check the tenants attached to this user */
        req.session.last_token_used = data.access.token;
        getTenantListByToken(data.access.token, function(err, data) {
            if ((null == data) || (null == data.tenants)) {
                req.session.isAuthenticated = false;
                commonUtils.changeFileContentAndSend(res, loginErrFile,
                                                     global.CONTRAIL_LOGIN_ERROR,
                                                     messages.error.unauthorized_to_project,
                                                     function() {
                });
                return;
            }
            var projCount = data.tenants.length;
            if (!projCount) {
                req.session.isAuthenticated = false;
                commonUtils.changeFileContentAndSend(res, loginErrFile,
                                                     global.CONTRAIL_LOGIN_ERROR,
                                                     messages.error.unauthorized_to_project,
                                                     function() {
                });
                return;
            }

            /* As of now, keystone does not provide the default project name,
               so we are using the last entry in the tenant list as default 
               project
             */
            var defProject = data.tenants[projCount - 1]['name'];
            createProjectListInReqObj(req, data.tenants);
            doAuth(username, password, defProject, function(data) {
                if (data == null) {
                    req.session.isAuthenticated = false;
                    commonUtils.changeFileContentAndSend(res, loginErrFile,
                                                         global.CONTRAIL_LOGIN_ERROR,
                                                         messages.error.unauthenticate_to_project,
                                                         function() {
                    });
                    return;
                } else {
                    logutils.logger.debug("After Successful auth def_token:" +
                                          JSON.stringify(data.access));
                    req.session.def_token_used = data.access.token;
                    try {
                        var roleStr = null;
                        roleStr =
                            getUserRoleByAuthResponse(data['access']['user']['roles']);
                        if (roleStr == null) {
                            req.session.isAuthenticated = false;
                            commonUtils.changeFileContentAndSend(res, loginErrFile,
                                                                 global.CONTRAIL_LOGIN_ERROR,
                                                                 messages.error.unauthenticate_to_project,
                                                                 function() {
                            });
                            return;
                        }
                    } catch(e) {
                        logutils.logger.debug("We did not get Roles in Correct JSON from" +
                                              " keystone, error: " + e);
                        req.session.isAuthenticated = false;
                        commonUtils.changeFileContentAndSend(res, loginErrFile,
                                                             global.CONTRAIL_LOGIN_ERROR,
                                                             messages.error.unauthenticate_to_project,
                                                             function() {
                        });
                        return;
                    }
                }
                /* Save the user-id/password in Redis in encrypted format.
                 */
                authApi.saveUserAuthInRedis(username, password, req, function(err) {
                    req.session.isAuthenticated = true;
                    req.session.userRole = roleStr;
                    //setSessionTimeoutByReq(req);
                    updateTokenIdForProject(req, defProject, data);
                    logutils.logger.info("Login Successful with tenants.");
                    res.setHeader('Set-Cookie', "username=" + username + 
                                  '; expires=' + 
                                  new Date(new Date().getTime() +
                                           global.MAX_AGE_SESSION_ID).toUTCString());
                    res.redirect('/tenants/monitor/network' + urlHash);
                });
            });
        });
    });
}

function getTokenBySession (sessionId, tenantId, forceAuth, callback)
{
    var userDecipher = null;
    var passwdDecipher = null;
    var userDecrypted = null;
    var passwdDecrypted = null;

    /* First get the userId and password Details from the sessionId */
    var authKey = authApi.createAuthKeyBySessionId(sessionId);
    redisSub.redisPerClient.get(authKey, function(err, data) {
        if (err) {
            logutils.logger.error("Redis get error for Session:" + sessionId +
                                  " Got Redis error:" + err);
            callback(err, null);
            return;
        }
        if (null == data) {
            logutils.logger.error("Did not get authObj for Session:" + sessionId);
            var err = 
                new appErrors.RESTServerError('Did not get authObj for Session:'
                                              + sessionId);
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
        doAuth(userDecrypted, passwdDecrypted,
                              tenantId, function(data) {
            if (data == null) {
                logutils.logger.error("Trying to illegal access with tenantId: " +
                                      tenantId + " With session: " + sessionId);
                var err = new
                    appErrors.RESTServerError(messages.error.unauthenticate_to_project);
                err.responseCode = global.HTTP_STATUS_AUTHORIZATION_FAILURE;
                callback(err, null);
                return;
            }
            /* Now save this token against this project */
            logutils.logger.debug("Got the token successfully for tenant:" + tenantId);
            callback(null, data.access.token);
            return;
        });
    });
}

function updateDefTenantToken (req, tenantId, data)
{
    /* First check if the def_token_used -> Tenant-> name is same as tenantId,
     * if yes, then update 
     */
    if (null == tenantId) {
        return;
    }
    var defProject = req.session.def_token_used.tenant.name;
    if (defProject == tenantId) {
        req.session.def_token_used = data.access.token;
    }
}

function getAPIServerAuthParamsByReq (req)
{
  var token;

  try {
    token = req.session.def_token_used;
  } catch(e) {
      token = null;
  }
  return token;
}

exports.authenticate = authenticate;
exports.getToken = getToken;
exports.getTenantList = getTenantList;
exports.getTokenBySession = getTokenBySession;
exports.updateDefTenantToken = updateDefTenantToken;
exports.getAPIServerAuthParamsByReq = getAPIServerAuthParamsByReq;
exports.formatTenantList = formatTenantList;
exports.getServiceCatalog = getServiceCatalog;


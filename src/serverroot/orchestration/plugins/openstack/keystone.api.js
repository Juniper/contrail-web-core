/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
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
    roleMap = require('../../../web/core/rolemap.api'),
    exec = require('child_process').exec,
    configUtils = require('../../../common/configServer.utils'),
    plugins = require('../plugins.api'),
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
    var uiRoles = [];
    var tmpRoleObj = {};
    if ((null == resRoleList) || (!resRoleList.length)) {
        /* Ideally if Role is not associated, then we should not allow user to
         * login, but we are assigning role as 'Member' to the user to not to
         * block UI
//        return null;
         */
        return [global.STR_ROLE_USER];
    }
    var rolesCount = resRoleList.length;
    var extRoleStr = null;
    for (var i = 0; i < rolesCount; i++) {
        extRoleStr = resRoleList[i]['name'];
        if ((null != roleMap.uiRoleMapList[extRoleStr]) &&
            (null == tmpRoleObj[roleMap.uiRoleMapList[extRoleStr]])) {
            uiRoles.push(roleMap.uiRoleMapList[extRoleStr]);
            tmpRoleObj[roleMap.uiRoleMapList[extRoleStr]] =
                roleMap.uiRoleMapList[extRoleStr];
        }
    }
    if (uiRoles.length) {
        return uiRoles;
    }
    return [global.STR_ROLE_USER];
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

var authPostReqCB = {
    'v2.0': authPostV2Req,
    'v3': sendV3CurlPostReq
};

function authPostV2Req (authObj, callback)
{
    var reqUrl = authObj['reqUrl'];
    var postData = authObj['data'];

    authAPIServer.api.post(reqUrl, postData, function(error, data) {
        if (null != error) {
            logutils.logger.error('authPostV2Req() error:' + error);
        }
        callback(error, data);
    });
}

function makeAuthPostReq (dataObj, callback)
{
    var reqUrl = dataObj['reqUrl'];
    var data = dataObj['data'];
    var version = dataObj['version'];

    var authPostCB = authPostReqCB[version];
    if (null == authPostCB) {
        var err = new appErrors.RESTServerError('version ' + version +
                                                ' not supported');
        callback(err, null, version);
        return;
    }
    authPostCB(dataObj, function(err, data) {
        callback(err, data, version);
    });
}

var authGetCB = {
    'v2.0': getV2AuthResponse,
    'v3': sendV3CurlGetReq
};

function getV2AuthResponse (dataObj, callback)
{
    var reqUrl = dataObj['reqUrl'];
    var headers = dataObj['headers'];

    authAPIServer.api.get(reqUrl, function(error, data) {
        if (null != error) {
            logutils.logger.error('getAuthResponse() error:' + error);
        }
        callback(error, data);
    }, headers);
}

function makeAuthGetReq (dataObj, callback)
{
    var req = dataObj['req'];
    var authApiVer = req.session.authApiVersion;
    var authCB = authGetCB[authApiVer];

    authCB(dataObj, function(err, data) {
        callback(err, data);
    });
}

/** Function: getTenantListByToken
 *  1. This API is used to get the list of the projects for current User using token
 *  @public function
 */
function getTenantListByToken (req, token, callback)
{
    var reqUrl = '/tenants';
    getAuthDataByReqUrl(req, token, reqUrl, callback);
}

function getAuthDataByReqUrl (req, token, authUrl, callback)
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
      dataObjArr.push({'req': req, 'reqUrl': reqUrl, 'headers': headers,
                      'token': token.id});
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
/*
var getTenantListCB = {
    'v2.0': getV2TenantList,
    'v3': getV3ProjectList
}
*/
/* Function: getTenantList
    This API is used to get the list of projects for the logged in user
 */
function getTenantList (req, callback)
{
    var lastAuthVerUsed = req.session.authApiVersion;
    var token = req.session.last_token_used;
    var reqUrl = null;
    if ('v2.0' == lastAuthVerUsed) {
        reqUrl = '/tenants';
    } else if ('v3' == lastAuthVerUsed) {
        reqUrl = '/users/' + req.session.userid + '/projects';
    }
    getAuthRetryData(token, req, reqUrl, function(err, data) {
        if ((null != err) || (null == data) || (null == data['projects'])) {
            callback(err, data);
            return;
        }
        data['tenants'] = data['projects'];
        delete data['projects'];
        callback(err, data);
    });
}

function getDomainList (req, callback)
{
    var reqUrl = '/domains';
    var token = req.session.last_token_used;;
    getAuthRetryData(token, req, reqUrl, function(err, data) {
        callback(err, data);
    });
}

function getAuthRetryData (token, req, reqUrl, callback)
{
    getAuthDataByReqUrl(req, token, reqUrl, function(err, data) {
        if ((err) &&
            (err.responseCode == global.HTTP_STATUS_AUTHORIZATION_FAILURE)) {
            /* Get new Token and retry once again */
            authApi.getTokenObj({'req': req, 'tenant': null,
                                'forceAuth': true},
                                function(error, token) {
                if (error || (null == token)) {
                    commonUtils.redirectToLogout(req, req.res);
                    return;
                }
                getAuthDataByReqUrl(req, token, reqUrl, function(err, newData) {
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
        callback(error, null, null);
        return;
    }
    authCB(reqArr[index], function(err, data, version) {
        if ((null == err) && (null != data) && (null == data['error'])) {
            callback(null, data, version);
            return;
        } else {
            getAuthData(err, reqArr, index + 1, authCB, callback);
        }
    });
}

function formatV2AuthTokenData (authObj)
{
    var username = authObj['username'];
    var password = authObj['password'];
    var tenantName = authObj['tenant'];
    var tokenId = authObj['tokenid'];
    var v2data = {};

    if (null != tokenId) {
        v2data = {"auth": {"token": {"id": tokenId}}};
    } else {
        v2data = {
            auth:{
                passwordCredentials:{
                    username: username,
                    password: password
                }
            }
        };
    }

    if (tenantName) {
        v2data['auth']['tenantName'] = tenantName;
    }
    return v2data;
}

function formatV3AuthTokenData (authObj, isUnscoped)
{
    var username = authObj['username'];
    var password = authObj['password'];
    var tenant = authObj['tenant'];
    var tokenId = authObj['tokenid'];
    var domain = getV3DomainIfNotAvailable(authObj['domain']);
    var v3data = {};

    if (null != tokenId) {
        v3data['methods'] = ['token'];
        v3data['token'] = {}
        v3data['token']['id'] = tokenId;
        v3data['auth'] = {};
    } else {
        v3data = {
            "auth": {
                "identity": {
                    "methods": [
                        "password"
                        ],
                    "password": {
                        "user": {
                            "domain": {
                                "name": domain
                            },
                            "name": username,
                            "password": password
                        }
                    }
                }
            }
        }
    }
    if (true == isUnscoped) {
        return v3data;
    }
    v3data['auth']['scope'] = {};
    if (null != tenant) {
        /* Scoped to project */
        v3data['auth']['scope'] = {
            "project": {
                "domain": {
                    "name": domain
                },
                "name": tenant
            }
        }
    } else {
        v3data['auth']['scope'] = {
            "domain": {
                "name": domain
            }
        }
    }
    return v3data;
}

var formatAuthTokenDataCB = {
    'v2.0': formatV2AuthTokenData,
    'v3': formatV3AuthTokenData
}

var getTokenURLCB = {
    'v2.0': getV2TokenURL,
    'v3': getV3TokenURL
}

function getV2TokenURL ()
{
    return '/v2.0/tokens';
}

function getV3TokenURL ()
{
    return '/v3/auth/tokens';
}

function getLastIdTokenUsed (req)
{
    if ((null == req.session) || (null == req.session.last_token_used) ||
        (null == req.session.last_token_used.id)) {
        commonUtils.redirectToLogout(req, req.res);
        return;
    }
    return req.session.last_token_used;
}

function getV3Token (authObj, callback)
{
    if ((null == authObj['username']) || (null == authObj['password'])) {
        var token = getLastIdTokenUsed(authObj['req']);
        if (null != authObj['tenant']) {
            try {
                callback(null,
                        authObj['req']['session']['tokenObjs'][authObj['tenant']]['token']);
            } catch(e) {
                logutils.logger.error("We do not have the token Obj in " +
                                      "session yet:" + e);
                callback(null, token);
            }
            return;
        }
        callback(null, token);
        return;
    } else {
        getV3TokenByAuthObj(authObj, callback);
    }
}

function getV3TokenByAuthObj (authObj, callback)
{
    var authIP      = authServerIP;
    var tokenObj    = {};
    var authPort    = authServerPort;
    var authProto   = null;
    try {
        authProto = config.identityManager.authProtocol;
        if (null == authProto) {
            authProto = global.PROTOCOL_HTTP;
        }
    } catch(e) {
        authProto = global.PROTOCOL_HTTP;
    }

    var postData = authObj['data'];
    if (null == postData) {
        postData = formatV3AuthTokenData(authObj, false);
    }
    var reqUrl = '/v3/auth/tokens';
    var cmd = 'curl -si -d ' + "'" + JSON.stringify(postData) + "'" +
        ' -H "Content-type: application/json" ' +
        authProto + '://' + authIP + ':' + authPort + reqUrl + "| awk " +
        "'/X-Subject-Token/ {print $2}'";
    exec(cmd, function(err, token, stderr) {
        if ((null == err) && (null != token)) {
            tokenObj['id'] = removeSpecialChars(token);
        }
        if (null != authObj['tenant']) {
            postData = formatV3AuthTokenData(authObj, false);
            sendV3CurlPostReq({'data': postData,
                              'reqUrl': global.KEYSTONE_V3_TOKEN_URL},
                              function(err, data) {
                if ((null == err) && (null != data) && (null != data['token'])
                    && (null != data['token']['project'])) {
                    tokenObj['tenant'] = data['token']['project'];
                    callback(err, tokenObj);
                } else {
                    callback(err, tokenObj);
                }
            });
        } else {
            callback(err, tokenObj);
        }
    });
}

function executeAsyncCmd (cmd, callback)
{
    exec(cmd, function(err, stdout, stderr) {
        var respObj = {};
        respObj['err'] = err;
        respObj['resp'] = stdout;
        respObj['stderr'] = stderr;
        callback(null, respObj);
    });
}

function removeSpecialChars (str)
{
    return str.replace(/(\n|\t|\r)/g, '');
}

function getCurlRespDataByType (curlResp, types, callback)
{
    var cmd = null;
    var cmdArr = [];
    var cnt = types.length;

    for (var i = 0; i < cnt; i++) {
        cmd = "echo " + "'" + removeSpecialChars(curlResp) + "'" + " | awk " +
            "'/" + types[i]['name'] + "/ {print $" + types[i]['pos'] + "}'";
        cmdArr.push(cmd);
    }
    async.map(cmdArr, executeAsyncCmd, function(err, respObj) {
        callback(null, respObj);
    });

}

function sendV3CurlPostReq (authObj, callback)
{
    var postData    = authObj['data'];
    var reqUrl      = authObj['reqUrl'];
    var authIP      = authServerIP;
    var authPort    = authServerPort;
    var authProto   = null;
    try {
        authProto = config.identityManager.authProtocol;
        if (null == authProto) {
            authProto = global.PROTOCOL_HTTP;
        }
    } catch(e) {
        authProto = global.PROTOCOL_HTTP;
    }
    var cmd = 'curl -d ' + "'" + JSON.stringify(postData) + "'" +
        ' -H "Content-type: application/json" ' + authProto + '://' + authIP +
        ':' + authPort + reqUrl;
    exec(cmd, function(err, stdout, stderr) {
        callback(err, JSON.parse(stdout));
    });
}

function sendV3CurlGetReq (dataObj, callback)
{
    var token       = dataObj['token'];
    var reqUrl      = dataObj['reqUrl'];
    var authIP      = authServerIP;
    var authPort    = authServerPort;
    var authProto   = null;
    try {
        authProto = config.identityManager.authProtocol;
        if (null == authProto) {
            authProto = global.PROTOCOL_HTTP;
        }
    } catch(e) {
        authProto = global.PROTOCOL_HTTP;
    }

    var cmd = 'curl -s -H "X-Auth-Token: ' + token + '" ' +
        authProto + '://' + authIP + ':' + authPort + reqUrl;
    exec(cmd, function(err, stdout, stderr) {
        callback(err, JSON.parse(stdout));
    });
}

function formatV3AuthDataToV2AuthData (v3AuthData, authObj, callback)
{
    var tokenObj = {};

    getV3Token(authObj, function(err, v3TokenObj) {
        tokenObj['access'] = {};
        tokenObj['access']['token'] = {};
        tokenObj['access']['token']['issued_at'] =
            v3AuthData['token']['issued_at'];
        tokenObj['access']['token']['expires_at'] =
            v3AuthData['token']['expires_at'];
        tokenObj['access']['token'] = v3TokenObj;
        tokenObj['access']['token']['id'] =
            removeSpecialChars(v3TokenObj['id']);
        tokenObj['access']['serviceCatalog'] =  v3AuthData['token']['catalog'];
        tokenObj['access']['user'] = {};
        tokenObj['access']['user']['username'] =
            v3AuthData['token']['user']['name'];
        tokenObj['access']['user']['roles'] = v3AuthData['token']['roles'];
        callback(null, tokenObj);
    });
}

/** Function: doAuth
 *  1. Authenticate and get user and token. Call the callback function on
 *     successful authentication.
 *  @authObj : auth Obj, comprising of
 *    @username: username provided by the client
 *    @password: password provided by the client
 *    @tenantName: tenant name
 *    @callback: callback called once authentication method is done
 *  2. private function
 */
function doAuth (authObj, callback)
{
    var username = authObj['username'];
    var password = authObj['password'];
    var tenantName = authObj['tenant'];
    var domainName = authObj['domain'];

    var reqArr = [];
    var authData = null;
    var authCB = null;
    var authApiVerList = getKeystoneAPIVersions();
    var apiVerCnt = authApiVerList.length;
    for (var i = 0; i < apiVerCnt; i++) {
        urlCB = getTokenURLCB[authApiVerList[i]];
        if (null == urlCB) {
            continue;
        }
        reqUrl = urlCB();
        authCB = formatAuthTokenDataCB[authApiVerList[i]];
        if (null == authCB) {
            /* We do not support this version */
            logutils.logger.error("We do not support keystone auth API " +
                                  "version :" + authApiVerList[i]);
            continue;
        } else {
            authData = authCB(authObj);
        }
        reqArr.push({'reqUrl': reqUrl, 'data': authData,
                    'version': authApiVerList[i]});
    }
    var startIndex = 0;
    getAuthData(null, reqArr, startIndex, makeAuthPostReq, function(err, data,
                                                                    version) {
        if (('v3' == version) && (null == err) && (null != data) &&
            (null == data['error'])) {
            formatV3AuthDataToV2AuthData(data, authObj,
                                         function(err, data) {
                callback(data);
            });
        } else {
            if (null == err) {
                callback(data);
            } else {
                callback(null);
            }
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

var getTokenCB = {
    'v2.0': getV2Token,
    'v3': getV3Token
};

function getToken (authObj, callback)
{
    var lastKeystoneVerUsed = authObj['req'].session.authApiVersion;
    var tokenCB = getTokenCB[lastKeystoneVerUsed];
    if (null == authObj['domain']) {
        authObj['domain'] = authObj['req'].cookies.domain;
    }
    if (null == tokenCB) {
        logutils.logger.error("Unexpected happened in getToken()");
        var err = new appErrors.RESTServerError('No getToken handler found for'
                                                + ' version:' +
                                                lastKeystoneVerUsed);
        callback(err, null);
        return;
    }
    tokenCB(authObj, function(err, data) {
        callback(err, data);
    });
}

/** Function: getToken
 *   This function is used to get token object from the tenantId and once done,
 *   call the callback
 */
function getV2Token (authObj, callback)
{
    var req         = authObj['req'];
    var tenantId    = authObj['tenant'];
    var forceAuth   = authObj['forceAuth'];

    var projEntry = getProjectObj(req, tenantId);
    if ((projEntry) && (projEntry['token'])) {
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

function getUserAuthData (req, tenantName, callback)
{
    var lastTokenUsed = getLastIdTokenUsed(req);
    var authObj = {};
    authObj['tokenid'] = lastTokenUsed.id;
    if (null == tenantName) {
        tenantName = req.cookies.project;
    }
    authObj['tenant'] = tenantName;
    getUserAuthDataByAuthObj (authObj, function(data) {
        updateTokenIdForProject(req, tenantName, data);
        authApi.checkAndUpdateDefTenantToken(req, tenantName, data);
        updateLastTokenUsed(req, data);
        callback(null, data);
    });
}

function getUserAuthDataByAuthObj (authObj, callback)
{
    doAuth(authObj, function(data) {
        if (data == null) {
            if (tenantName) {
                logutils.logger.error("Trying to illegal access with tenantName: " +
                                      tenantName + " With session: " + req.session.id);
            }
            var err = new
                appErrors.RESTServerError(messages.error.unauthenticate_to_project);
            err.responseCode = global.HTTP_STATUS_AUTHORIZATION_FAILURE;
            callback(err, null);
            return;
        }
        /* Now save this token against this project */
        if (tenantName) {
            logutils.logger.debug("Got the token successfully for tenant:" +
                                  tenantName);
        }
        callback(null, data);
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

function getUserRoleByTenant (userObj, callback)
{
    var userTokenObj = {};
    var username = userObj['username'];
    var password = userObj['password'];
    var tenant   = userObj['tenant'];
    doAuth(userObj, function(data) {
        if ((null != data) && (null != data['access']) &&
            (null != data['access']['user']) &&
            (null != data['access']['user']['roles'])) {
            userTokenObj['roles'] = data['access']['user']['roles'];
            userTokenObj['tokenObj'] = data['access'];
            callback(null, userTokenObj);
        } else {
            callback(null, null);
        }
    });
}

function getUserRoleByAllTenants (username, password, tenantlist, callback)
{
    var uiRoles = [];
    var tmpUIRoleObjs = {};
    var tenantObjArr = [];
    if (null == tenantlist) {
        return null;
    }
    var tenantCnt = tenantlist.length;
    var userRoles = [global.STR_ROLE_USER];

    for (var i = 0; i < tenantCnt; i++) {
        if ((null != tenantlist[i]) && (null != tenantlist[i]['name'])) {
            tenantObjArr[i] = {'username': username, 'password': password,
                'tenant': tenantlist[i]['name']};
        }
    }
    if (!tenantObjArr.length) {
        return userRoles;
    }

    async.map(tenantObjArr, getUserRoleByTenant, function(err, data) {
        if (data) {
            var roleList = [];
            var dataLen = data.length;
            var tokenObjs = {};
            for (var i = 0; i < dataLen; i++) {
                var project = data[i]['tokenObj']['token']['tenant']['name'];
                tokenObjs[project] = data[i]['tokenObj'];
                if (null == data[i]) {
                    continue;
                }
                userRoles =
                    getUserRoleByAuthResponse(data[i]['roles']);
                var userRolesCnt = userRoles.length;
                for (var j = 0; j < userRolesCnt; j++) {
                    if (null == tmpUIRoleObjs[userRoles[j]]) {
                        uiRoles.push(userRoles[j]);
                        tmpUIRoleObjs[userRoles[j]] = userRoles[j];
                    }
                }
            }
        }
        callback(uiRoles, tokenObjs);
    });
}

var makeAuthCB = {
    'v2.0': doV2Auth,
    'v3': doV3Auth
}

function makeAuth (req, startIndex, lastErrStr, callback)
{
    var identityApiVerList = config.identityManager.apiVersion;
    if (null == identityApiVerList[startIndex]) {
        callback(lastErrStr);
        return;
    }
    var authCB = makeAuthCB[identityApiVerList[startIndex]];
    if (null == authCB) {
        return makeAuth(req, startIndex + 1, lastErrStr, callback);
    }
    authCB(req, function(errStr) {
        if (null == errStr) {
            logutils.logger.debug("Set authApiVersion:" +
                                  req.session.authApiVersion);
            callback(null);
            return;
        } else {
            return makeAuth(req, startIndex + 1, errStr, callback);
        }
    });
}

function authenticate (req, res, callback)
{
    var urlHash = '';
    var post = req.body,
        username = post.username;
    if (post.urlHash != null) {
        urlHash = post.urlHash;
    }
    var loginErrFile = 'webroot/html/login-error.html';
    var identityApiVerList = config.identityManager.apiVersion;
    var verCnt = identityApiVerList.length;

    var startIndex = 0;
    makeAuth(req, startIndex, null, function(errStr) {
        if (false == req.session.isAuthenticated) {
            if (null == errStr) {
                logutils.logger.error("Very much unexpected, we came here!!!");
                errStr = "Unexpected event happened";
            }
            commonUtils.changeFileContentAndSend(res, loginErrFile,
                                                 global.CONTRAIL_LOGIN_ERROR,
                                                 errStr, function() {
            });
            return;
        }
        plugins.setAllCookies(req, res, {'username': username}, function() {
            res.redirect('/' + urlHash);
        });
    });

}

function getV3ProjectListByToken (req, tokenId, callback)
{
    var reqUrl = '/v3/users/' + req.session.userid + '/projects';
    sendV3CurlGetReq({'reqUrl': reqUrl, 'token': tokenId}, function(err, projects) {
        callback(err, projects);
    });
}

function sendV3CurlPostAsyncReq (dataObj, callback)
{
    var postData = dataObj['data'];
    var reqUrl = dataObj['reqUrl'];
    var withHeaderResp = dataObj['withHeaderResp'];

    sendV3CurlPostReq({'data': postData, 'reqUrl': reqUrl},
                      function(err, data) {
        callback(err, data);
    });
}

function getProjectDetails (projects, userObj, callback)
{
    var postDataArr = [];
    var userObjList = [];
    var projCnt = projects.length;
    for (var i = 0; i < projCnt; i++) {
        userObj['tenant'] = projects[i]['name'];
        userObjList[i] = commonUtils.cloneObj(userObj);
        postDataArr[i] = {};
        postDataArr[i]['data'] = formatV3AuthTokenData(userObj, false);
        postDataArr[i]['reqUrl'] = global.KEYSTONE_V3_TOKEN_URL;
        postDataArr[i]['withHeaderResp'] = false;
    }
    async.map(postDataArr, sendV3CurlPostAsyncReq, function(err, data) {
        if (err || (null == data)) {
            callback(err, data);
            return;
        }
        async.map(userObjList, getV3TokenByAuthObj, function(err, tokenList) {
            if (err || (null == tokenList)) {
                callback(err, data);
                return;
            }
            var tokenObjs = {};
            var tokenCnt = tokenList.length;
            for (var i = 0; i < tokenCnt; i++) {
                var project = tokenList[i]['tenant']['name'];
                tokenObjs[project] = {};
                tokenObjs[project]['token'] = tokenList[i];
                tokenObjs[project]['token']['id'] =
                    removeSpecialChars(tokenObjs[project]['token']['id'] );
            }
            callback(err, data, tokenObjs);
        });
    });
}

function getUserRoleByProjectList (projects, userObj, callback)
{
    var resTokenObjs = {};
    var userRole = global.STR_ROLE_USER;
    getProjectDetails (projects, userObj, function(err, projs, tokenObjs) {
        if ((null != err) || (null == projs)) {
            callback(null, tokenObjs);
            return;
        }
        var projCnt = projs.length;
        for (var i = 0; i < projCnt; i++) {
            try {
                var projName = projs[i]['token']['project']['name'];
                resTokenObjs[projName] = projs[i];
                if (null != tokenObjs[projName]) {
                    resTokenObjs[projName]['token']['id'] =
                        tokenObjs[projName]['token']['id'];
                    resTokenObjs[projName]['token']['tenant'] =
                        tokenObjs[projName]['token']['tenant'];
                    resTokenObjs[projName]['user'] = {};
                    resTokenObjs[projName]['user']['roles'] =
                        resTokenObjs[projName]['token']['roles'];
                }
            } catch(e) {
                logutils.logger.error("In getUserRoleByProjectList(): JSON " + 
                                      "Parse error:" + e);
            }
        }
        var resCnt = projs.length;
        for (var i = 0; i < resCnt; i++) {
            var userRole = getUserRoleByAuthResponse(projs[i]['token']['roles']);
            if (global.STR_ROLE_ADMIN == userRole) {
                callback(userRole, resTokenObjs);
                return;
            }
        }
        callback(userRole, resTokenObjs);
    });
}

function doV3Auth (req, callback)
{
    var tokenObj = {};
    var self = this,
        post = req.body,
        username = post.username,
        password = post.password,
        domain = post.domain,
        userJSON, tokenJSON, roleJSON;
    var userCipher = null;
    var passwdCipher = null
    var userEncrypted = null;
    var passwdEncrypted = null;
    var loginErrFile = 'webroot/html/login-error.html';
    var isUnscoped = true;

    req.session.authApiVersion = 'v3';
    var userObj = {'username': username, 'password': password};
    if ((null != domain) && (domain.length)) {
        userObj['domain'] = domain;
    }
    /* First send as unscoped request */
    var userPostData = formatV3AuthTokenData(userObj, isUnscoped);
    userObj['data'] = userPostData;
    getV3Token(userObj, function(err, tokenObj) {
        if ((null != err) || (null == tokenObj) || (null == tokenObj.id)) {
            req.session.isAuthenticated = false;
            callback(messages.error.invalid_user_pass);
            return;
        }
        req.session.last_token_used = {};
        tokenObj.id = removeSpecialChars(tokenObj.id);
        req.session.last_token_used = tokenObj;
        sendV3CurlPostReq({'data': userPostData, 'reqUrl':
                          global.KEYSTONE_V3_TOKEN_URL},
                          function(err, data) {
            if ((null != err) || (null == data) || (null == data['token']) ||
                (null == data['token']['user']) ||
                (null == data['token']['user']['id'])) {
                req.session.isAuthenticated = false;
                callback(messages.error.invalid_user_pass);
                return;
            }
            req.session.userid = data['token']['user']['id'];
            getV3ProjectListByToken(req, tokenObj.id, function(err, projects) {
                if ((null != err) || (null == projects) ||
                    (null == projects['projects'])) {
                    req.session.isAuthenticated = false;
                    callback(messages.error.unauthorized_to_project);
                    return;
                }
                try {
                    var projCnt = projects['projects'].length;
                    var defProject = projects['projects'][projCnt - 1]['name'];
                } catch(e) {
                    req.session.isAuthenticated = false;
                    callback(messages.error.unauthorized_to_project);
                    return;
                }
                createProjectListInReqObj(req, projects['projects']);
                getUserRoleByProjectList(projects['projects'], userObj,
                                         function(roleStr, tokenObjs) {
                    req.session.def_token_used = tokenObjs[defProject]['token'];
                    req.session.authApiVersion = 'v3';
                    req.session.tokenObjs = tokenObjs;
                    req.session.userRoles =
                        userRoleListByTokenObjs(tokenObjs);
                    updateTokenIdForProject(req, defProject,
                                            req.session.def_token_used);
                    req.session.isAuthenticated = true;
                    req.session.userRole = roleStr;
                    req.session.domain = domain;
                    req.session.last_token_used = req.session.def_token_used;
                    callback(null);
                });
            });
        });
    });
}

function userRoleListByTokenObjs (tokenObjs)
{
    var userRoleObj = {};
    for (var key in tokenObjs) {
        try {
            userRoleObj[key] = [];
            var roleList = tokenObjs[key]['user']['roles'];
            var roleListLen = roleList.length;
        } catch(e) {
            logutils.logger.error("In userRoleListByTokenObjs(): " +
                                  "roles parse error:" + e);
            roleListLen = 0;
        }
        for (var i = 0; i < roleListLen; i++) {
            if ((null != roleList[i]) && (null != roleList[i]['name'])) {
                userRoleObj[key].push(roleList[i]['name']);
            }
        }
    }
    return userRoleObj;
}

function doV2Auth (req, callback)
{
    var self = this,
        post = req.body,
        username = post.username,
        password = post.password,
        userJSON, tokenJSON, roleJSON;
    var userCipher = null;
    var passwdCipher = null
    var userEncrypted = null;
    var passwdEncrypted = null;
    var userObj = {'username': username, 'password': password};

    req.session.authApiVersion = 'v2.0';
    doAuth(userObj, function (data) {
        if ((null == data) || (null == data.access)) {
            req.session.isAuthenticated = false;
            callback(messages.error.invalid_user_pass);
            return;
        }
        req.session.isAuthenticated = true;
        req.session.userid = data.access.user["id"];
        /* Now check the tenants attached to this user */
        req.session.last_token_used = data.access.token;
        getTenantListByToken(req, data.access.token, function(err, data) {
            if ((null == data) || (null == data.tenants)) {
                req.session.isAuthenticated = false;
                callback(messages.error.unauthorized_to_project);
                return;
            }
            var projCount = data.tenants.length;
            if (!projCount) {
                req.session.isAuthenticated = false;
                callback(messages.error.unauthorized_to_project);
                return;
            }

            /* As of now, keystone does not provide the default project name,
               so we are using the last entry in the tenant list as default 
               project
             */
            var tenantList = data.tenants;
            var defProject = tenantList[projCount - 1]['name'];
            createProjectListInReqObj(req, tenantList);
            var userObj = {'username': username, 'password': password,
                           'tenant': defProject};
            doAuth(userObj, function(data) {
                if (data == null) {
                    req.session.isAuthenticated = false;
                    callback(messages.error.unauthorized_to_project);
                    return;
                } else {
                    logutils.logger.debug("After Successful auth def_token:" +
                                          JSON.stringify(data.access));
                    req.session.def_token_used = data.access.token;
                    var uiRoles = null;
                    getUserRoleByAllTenants(username, password,
                                            tenantList, 
                                            function(uiRoles, tokenObjs) {
                        if ((null == uiRoles) || (!uiRoles.length)) {
                            req.session.isAuthenticated = false;
                            callback(messages.error.unauthenticate_to_project);
                            return;
                        }
                        /* Save the user-id/password in Redis in encrypted format.
                         */
                        req.session.isAuthenticated = true;
                        req.session.userRole = uiRoles;
                        req.session.authApiVersion = 'v2.0';
                        req.session.tokenObjs = tokenObjs;
                        req.session.userRoles =
                            userRoleListByTokenObjs(tokenObjs);
                        //setSessionTimeoutByReq(req);
                        updateTokenIdForProject(req, defProject, data);
                        updateLastTokenUsed(req, data);
                        logutils.logger.info("Login Successful with tenants.");
                        callback(null);
                    });
                }
            });
        });
    });
}

function getV3DomainIfNotAvailable (domain)
{
    if (null == domain) {
        domain = config.identityManager.defaultDomain;
        if (null == domain) {
            domain = global.KEYSTONE_V3_DEFAULT_DOMAIN;
        }
    }
    return domain;
}

function getV3TenantListPostDataByDomain (authObj)
{
    var username = authObj['username'];
    var password = authObj['password'];
    var domain   = getV3DomainIfNotAvailable(authObj['domain']);

    var authPostData = {
        "auth": {
            "identity": {
                "methods": [
                    "password"
                ],
                "password": {
                    "user": {
                        "domain": {
                            "name": domain
                        },
                        "name": username,
                        "password": password
                    }
                }
            },
            "scope": {
                "domain": {
                    "name": domain
                }
            }
        }
    }
}

function getV3TenantListPostData (authObj)
{
    var username = authObj['username'];
    var password = authObj['password'];
    var authPostData = {
        "auth": {
            "identity": {
                "methods": [
                    "password"
                ],
                "password": {
                    "user": {
                        "domain": {
                            "name": domain
                        },
                        "name": username,
                        "password": password
                    }
                }
            }
        }
    }
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
        var userObj = {'username': userDecrypted, 'password': passwdDecrypted,
                       'tenant': tenantId};
        doAuth(userObj, function(data) {
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

function getProjectsFromKeystone (request, appData, callback)
{
    configUtils.getTenantListAndSyncDomain(request, appData,
                               function(error, domainObjs, tenantList,
                                        domList) {
        formatIdentityMgrProjects(error, request, tenantList, domList,
                                  function(error, data) {
            callback(error, data);
        });
    });
}

function getProjectList (req, appData, callback)
{
    var isProjectListFromApiServer = config.getDomainProjectsFromApiServer;
    if (null == isProjectListFromApiServer) {
        isProjectListFromApiServer = false;
    }
    if (true == isProjectListFromApiServer) {
        configUtils.getProjectsFromApiServer(request, appData,
                                               function(error, data) {
            callback(error, data);
        });
    } else {
        getProjectsFromKeystone(req, appData, function(error, data) {
            callback(error, data);
        });
    }
}

function getDomainNameByUUID (request, domUUID, domList)
{
    var domCnt = domList.length;
    for (var i = 0; i < domCnt; i++) {
        if (domList[i]['uuid'] == domUUID) {
            return domList[i]['fq_name'][0];
        }
    }
    return getDefaultDomain(request);
}

function isDefaultDomain (req, domain)
{
    if (('v2.0' == req.session.authApiVersion) || 
        (null == req.session.authApiVersion)) {
        return (domain == global.KEYSTONE_V2_DEFAULT_DOMAIN);
    }

    if (null != config.identityManager.defaultDomain) {
        return (config.identityManager.defaultDomain == domain);
    }
    return (global.KEYSTONE_V3_DEFAULT_DOMAIN == domain);
}

function getDefaultDomain (req)
{
    /* NOTE: API Server does have default-domain, keystone for v3 as default,
       So we need to send default-domain, else while creating VN and others it
       fails, as fqname ['default', 'XXX'] does not exist
     */
    return global.KEYSTONE_V2_DEFAULT_DOMAIN;
    if (('v2.0' == req.session.authApiVersion) ||
        (null == req.session.authApiVersion)) {
        return global.KEYSTONE_V2_DEFAULT_DOMAIN;
    }
    if (null != config.identityManager.defaultDomain) {
        return config.identityManager.defaultDomain;
    }
    return global.KEYSTONE_V3_DEFAULT_DOMAIN;
}

/**
 * @formatIdentityMgrProjects
 * private function
 * 1. Formats the project list got from Identity Manager equivalent to API
 *    Server project list
 */
function formatIdentityMgrProjects (error, request, projectLists, domList, callback)
{
    var uuid       = null;
    var domain     = null;
    var projects   = {'projects':[]};

    if (error) {
        callback(error, projects);
        return;
    }

    if (projectLists && projectLists.hasOwnProperty("tenants")) {
        var projects = {};
        projects["projects"] = [];
        var tenantLen = projectLists['tenants'].length;
        for(var i=0; i<tenantLen; i++) {
            var tenant = projectLists['tenants'][i];
            domain = getDefaultDomain(request);
            if ((null != tenant['domain_id']) &&
                (null != domList['domains'])) {
                uuid = commonUtils.convertUUIDToString(tenant["domain_id"]);
                domain = getDomainNameByUUID(request, uuid, domList['domains']);
            }
            projects["projects"].push({
                "uuid"    : commonUtils.convertUUIDToString(tenant["id"]),
                "fq_name" : [
                    domain,
                    tenant["name"]
                ]
            });
        }
        callback(null, projects);
    } else {
        callback(error, projects);
    }
}

exports.authenticate = authenticate;
exports.getToken = getToken;
exports.getTenantList = getTenantList;
exports.updateDefTenantToken = updateDefTenantToken;
exports.getAPIServerAuthParamsByReq = getAPIServerAuthParamsByReq;
exports.formatTenantList = formatTenantList;
exports.getServiceCatalog = getServiceCatalog;
exports.getDomainList = getDomainList;
exports.getProjectList = getProjectList;
exports.isDefaultDomain = isDefaultDomain;
exports.getDefaultDomain = getDefaultDomain;


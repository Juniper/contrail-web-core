/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * This file contains the functions for authentication mechanism via
 * keystone
 */

var config = process.mainModule.exports['config'],
    global = require('../../../common/global'),
    messages = require('../../../common/messages'),
    logutils = require('../../../utils/log.utils'),
    authApi = require('../../../common/auth.api'),
    crypto = require('crypto'),
    appErrors = require('../../../errors/app.errors.js'),
    commonUtils = require('../../../utils/common.utils'),
    async = require('async'),
    exec = require('child_process').exec,
    configUtils = require('../../../common/configServer.utils'),
    plugins = require('../plugins.api'),
    oStack = require('./openstack.api'),
    _ = require('underscore'),
    rest = require('../../../common/rest.api');

var authServerIP = ((config.identityManager) && (config.identityManager.ip)) ? 
    config.identityManager.ip : global.DFLT_SERVER_IP;
var authServerPort = 
    ((config.identityManager) && (config.identityManager.port)) ?
    config.identityManager.port : '5000';

authAPIServer = rest.getAPIServer({apiName:global.label.IDENTITY_SERVER,
                                   server:authServerIP, port:authServerPort});

var svcAuthAPIServer = rest.getAPIServer({apiName:global.label.IDENTITY_SERVER,
    server:authServerIP, port:"35357"});

var mandatoryEndpointList = ['compute', 'image'];
var adminRoles = config.roleMaps['cloudAdmin'];
var authAPIVers = ['v2.0'];
if ((null != config) && (null != config.identityManager) &&
    (null != config.identityManager.apiVersion)) {
    if ((config.identityManager.apiVersion instanceof Array) &&
        (0 != config.identityManager.apiVersion.length)) {
        authAPIVers = config.identityManager.apiVersion;
    }
}

/** Function: getUIRolesByExtRoles
 *  1. This function is used to convert UI roles from external roles
 */
function getUIRolesByExtRoles (resRoleList)
{
    var uiRoles = [];
    var tmpRoleObj = {};
    var extRoleList = [];
    if ((null == resRoleList) || (!resRoleList.length)) {
        /* Ideally if Role is not associated, then we should not allow user to
         * login, but we are assigning role as 'Member' to the user to not to
         * block UI
        return null;
         */
        logutils.logger.error('User does not have role associated, so UI ' +
                              'assigning to member role');
        return [global.STR_ROLE_USER];
    }
    var rolesCount = resRoleList.length;
    var extRoleStr = null;
    var tmpUIRoleMapList = {};
    var uiRoleMaps = {};
    var extRoleToUIRoleMaps = config.roleMaps;
    for (key in extRoleToUIRoleMaps) {
        var len = extRoleToUIRoleMaps[key].length;
        for (var i = 0; i < len; i++) {
            var extRole = extRoleToUIRoleMaps[key][i].toUpperCase();
            var extRole =
                commonUtils.getValueByJsonPath(extRoleToUIRoleMaps, key + ';' +
                                               i, null);
            if ((null == extRole) || (!extRole.length)) {
                continue;
            }
            extRole = extRole.toUpperCase();
            tmpUIRoleMapList[extRole] = key;
        }
    }

    for (var i = 0; i < rolesCount; i++) {
        extRoleStr = resRoleList[i]['name'];
        if (null == extRoleStr) {
            continue;
        }
        extRoleList.push(extRoleStr);
        extRoleStr = extRoleStr.toUpperCase();
        if ((null != tmpUIRoleMapList[extRoleStr]) &&
            (null == tmpRoleObj[tmpUIRoleMapList[extRoleStr]])) {
            uiRoles.push(tmpUIRoleMapList[extRoleStr]);
            tmpRoleObj[tmpUIRoleMapList[extRoleStr]] =
                tmpUIRoleMapList[extRoleStr];
        }
    }
    if (uiRoles.length) {
        return uiRoles;
    }
    logutils.logger.error('Keystone roles <' + extRoleList.join(',') +
                          '> not mapped with UI Role, so UI ' +
                          'assigning to member role');
    return [global.STR_ROLE_USER];
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
    'v3': sendV3PostReq
};

function isTokenGetURL (reqUrl)
{
    if (-1 != reqUrl.indexOf('/tokens')) {
        return true;
    }
    return false;
}

function getAuthRestApiInst (req, reqUrl, isSvcPortReq)
{
    var idPort = null;
    var region =
        commonUtils.getValueByJsonPath(req, 'req;session;region', null, false);
    var ip = commonUtils.getValueByJsonPath(region, 'ip', null);
    var port = commonUtils.getValueByJsonPath(region, 'port', null);
    if ((null == ip) || (null == port) || (false == isTokenGetURL(reqUrl))) {
        if (true == authApi.isMultiRegionSupported()) {
            var regionName = authApi.getCurrentRegion(req);
            var pubUrl = oStack.getPublicUrlByRegionName(regionName, req);
            var verObj = oStack.getServiceApiVersionObjByPubUrl(pubUrl, 'identity');
            if (null != verObj) {
                req.session.region = verObj;
                req.session.regionname = regionName;
                idPort = (true == isSvcPortReq) ? '35357': verObj.port;
                var tmpAPIServerInst =
                    rest.getAPIServer({apiName:global.label.IDENTITY_SERVER,
                                      server: verObj.ip, port: idPort});
                return {authRestAPI: tmpAPIServerInst, mapped: verObj};
            }
        }
        if (true === isSvcPortReq){
            return {authRestAPI: svcAuthAPIServer, mapped: null};
        }
        return {authRestAPI: authAPIServer, mapped: null};
    }
    idPort = (true == isSvcPortReq) ? '35357': port;
    var tmpAPIServerInst =
        rest.getAPIServer({apiName:global.label.IDENTITY_SERVER,
                           server:ip, port:idPort});
    return {authRestAPI: tmpAPIServerInst, mapped: region};
}

function authPostV2Req (authObj, callback)
{
    var reqUrl = authObj['reqUrl'];
    var postData = authObj['data'];
    var headers = authObj['headers'];

    if (null == headers) {
        headers = {};
    }
    var tmpAuthRestObj = getAuthRestApiInst(authObj.req, reqUrl);
    if (null != tmpAuthRestObj.mapped) {
        headers['protocol'] = tmpAuthRestObj.mapped.protocol;
    }
    tmpAuthRestObj.authRestAPI.api.post(reqUrl, postData, function(error, data) {
        if (null != error) {
            logutils.logger.error('authPostV2Req() error:' + error);
        }
        callback(error, data);
    }, headers);
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
    'v3': sendV3GetReq
};

function getV2AuthResponse (dataObj, callback, isSvcPortReq)
{
    var reqUrl = dataObj['reqUrl'];
    var headers = dataObj['headers'];

    if (null == headers) {
        headers = {};
    }
    var tmpAuthRestObj = getAuthRestApiInst(dataObj.req, reqUrl, isSvcPortReq);
    if (null != tmpAuthRestObj.mapped) {
        headers['protocol'] = tmpAuthRestObj.mapped.protocol;
    }

    tmpAuthRestObj.authRestAPI.api.get(reqUrl, function(error, data) {
        if (null != error) {
            logutils.logger.error('getAuthResponse() error:' + error);
        }
        callback(error, data);
    }, headers);

}

function makeAuthGetReq (dataObj, callback, isSvcPortReq)
{
    var req = dataObj['req'];
    var authApiVer = req.session.authApiVersion;
    var authCB = authGetCB[authApiVer];

    authCB(dataObj, function(err, data) {
        callback(err, data);
    }, isSvcPortReq);
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

function getAuthDataByReqUrl (req, token, authUrl, callback, isSvcPortReq)
{
  var headers = {};
  var dataObjArr = [];

  if (null == token) {
      var err = 
          new appErrors.RESTServerError('Token null to populate Tenant List');
      callback(err, null);
      return;
  }
  headers['X-Auth-Token'] = token.id;
  var apiVerCnt = authAPIVers.length;
  for (var i = 0; i < apiVerCnt; i++) {
      reqUrl = '/' + authAPIVers[i] + authUrl;
      dataObjArr.push({'req': req, 'reqUrl': reqUrl, 'headers': headers,
                      'token': token.id});
  }
  if (true == authApi.isRegionListFromConfig()) {
      dataObjArr = [];
      var version =
          commonUtils.getValueByJsonPath(req,
                                         'session;region;version',
                                         null, false);
      reqUrl = '/' + version + authUrl;
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
  }, isSvcPortReq);
}

/* Function: getEnabledProjects
   This function is used to filter out disabled projects from project-list got
   from keystone
 */
getEnabledProjects = function(projectList)
{
    var projects = [];
    if ((null == projectList) || (!projectList.length)) {
        return projects;
    }
    return _.filter(projectList, function(project) {
        if ('enabled' in project) {
            return (true == project['enabled']);
        }
        return false;
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
function getTenantList (req, appData, callback)
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
        if ((null != err) || (null == data)) {
            callback(err, data);
            return;
        }
        if (null == data['projects']) {
            data['tenants'] = getEnabledProjects(data['tenants']);
            callback(err, data);
            return;
        }
        data['tenants'] = data['projects'];
        delete data['projects'];
        data['tenants'] = getEnabledProjects(data['tenants']);
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

function getRoleList (req, callback)
{
    var lastAuthVerUsed = req.session.authApiVersion;
    var reqUrl;
    if ('v2.0' == lastAuthVerUsed) {
        reqUrl = "/OS-KSADM/roles"
    } else {
        reqUrl = "/roles"
    }
    var token = req.session.last_token_used;;
    getAuthRetryData(token, req, reqUrl, function(err, data) {
        callback(err, data);
    }, true);
}

function getAuthRetryData (token, req, reqUrl, callback, isSvcPortReq)
{
    getAuthDataByReqUrl(req, token, reqUrl, function(err, data) {
        if ((err) &&
            (err.responseCode == global.HTTP_STATUS_AUTHORIZATION_FAILURE)) {
            var tokenId = ((null != token) && (null != token.id)) ?
                token.id : null;
            var userObj = {'req': req, 'tenant': null, 'forceAuth': true};
            if (null != tokenId) {
                userObj['tokenid'] = tokenId;
            }

            /* Get new Token and retry once again */
            authApi.getTokenObj(userObj,
                                function(error, token) {
                if (error || (null == token)) {
                    commonUtils.redirectToLogout(req, req.res);
                    return;
                }
                getAuthDataByReqUrl(req, token, reqUrl, function(err, newData) {
                    callback(err, newData);
                }, isSvcPortReq);
            });
        } else {
            callback(null, data);
        }
    }, isSvcPortReq);
}

function formatTenantList (req, keyStoneProjects, apiProjects, callback) 
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

function getAuthData (error, reqArr, index, authCB, callback, isSvcPortReq)
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
            if (true == authApi.isRegionListFromConfig()) {
                callback(err, data, version);
                return;
            }
            getAuthData(err, reqArr, index + 1, authCB, callback);
        }
    }, isSvcPortReq);
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
    if ((null == authObj['domain']) &&
        (null != authObj['req'])) {
        authObj['domain'] =
            commonUtils.getValueByJsonPath(authObj['req'], 'session;domain',
                                           null, false);
    }
    var domain = getV3DomainIfNotAvailable(authObj['domain']);
    var v3data = {};

    if (null != tokenId) {
        v3data = {
            "auth": {
                "identity": {
                    "methods": [
                        "token"
                        ],
                    "token": {
                        "id": tokenId
                    }
                }
            }
        }
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

var getAuthURLCB = {
    'v2.0': getV2AuthURL,
    'v3': getV3AuthURL
}

function getV2AuthURL ()
{
    return '/v2.0';
}

function getV3AuthURL ()
{
    return '/v3/auth';
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
    if ((null != authObj['req']) &&
        ((null == authObj['username']) || (null == authObj['password']))) {
        var token = getLastIdTokenUsed(authObj['req']);
        if (null != authObj['tenant']) {
            try {
                callback(null,
                        authObj['req']['session']['tokenObjs'][authObj['tenant']]['token']);
            } catch(e) {
                if (null == authObj['tokenid']) {
                    var token = getLastIdTokenUsed(authObj['req']);
                    if (null != token) {
                        authObj['tokenid'] = token.id;
                    }
                }
                getV3TokenByAuthObj(authObj, callback);
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
    var reqUrl = '/v3/auth/tokens';

    var tmpAuthRestObj = getAuthRestApiInst(authObj.req, reqUrl);

    var postData = authObj['data'];
    if (null == postData) {
        postData = formatV3AuthTokenData(authObj, false);
    }
    tmpAuthRestObj.authRestAPI.api.post(reqUrl, postData,
                                        function(err, data, response) {
        if (null == err) {
            var token =
                commonUtils.getValueByJsonPath(response,
                                               'headers;x-subject-token',
                                               null, false);
            if (null != token) {
                tokenObj['id'] = removeSpecialChars(token);
            }
        }
        if (null != authObj['tenant']) {
            postData = formatV3AuthTokenData(authObj, false);
            sendV3PostReq({'data': postData,
                          'reqUrl': global.KEYSTONE_V3_TOKEN_URL,
                          'req': authObj['req']},
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

function removeSpecialChars (str)
{
    return str.replace(/(\n|\t|\r)/g, '');
}

function sendV3PostReq (authObj, callback)
{
    var postData    = authObj['data'];
    var reqUrl      = authObj['reqUrl'];
    var authIP      = authServerIP;
    var authPort    = authServerPort;
    var authProto   = null;
    var tmpAuthRestObj = getAuthRestApiInst(authObj.req, reqUrl);
    tmpAuthRestObj.authRestAPI.api.post(reqUrl, postData, function(err, data) {
        if (null != err) {
            callback(err, null);
        } else {
            callback(err, data);
        }
    });
}

function sendV3GetReq (dataObj, callback)
{
    var token       = dataObj['token'];
    var reqUrl      = dataObj['reqUrl'];
    var authIP      = authServerIP;
    var authPort    = authServerPort;
    var authProto   = null;
    var headers     = {'X-Auth-Token': token};

    var tmpAuthRestObj = getAuthRestApiInst(dataObj.req, reqUrl);
    tmpAuthRestObj.authRestAPI.api.get(reqUrl, function(err, data) {
        callback(err, data);
    }, headers);
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

/*
 * Determine if a token appears to be PKI
 *
 */
function is_asn1_token (token)
{
    if (null == token) {
        return false;
    }
    return (0 == token.indexOf(global.PKI_ASN1_PREFIX));
}

/*
 * Determine if a token a cmsz token
 *
 * Checks if the string has the prefix that indicates it is a
 * Crypto Message Syntax, Z compressed token
 *
 */
function is_pkiz (token)
{
    if (null == token) {
        return false;
    }
    return (0 == token.indexOf(global.PKIZ_PREFIX));
}

/*
 * Determines if this is a pki-based token (pki or pkiz)
 *
 */
function isPKIToken (token)
{
    /* For details, please go through
     * https://github.com/openstack/python-keystoneclient/blob/master/keystoneclient/common/cms.py
     */
    if (null == token) {
        return false;
    }
    return is_asn1_token(token) || is_pkiz(token);
}

function updateTokenIdWithMD5 (accessData)
{
    if ((null != accessData) && (null != accessData['token']) &&
        (null != accessData['token']['id'])) {
        var pkiTokenHash =
            commonUtils.getValueByJsonPath(config,
                                           'identityManager;pkiTokenHashAlgorithm',
                                           'md5');
        if (('md5' != pkiTokenHash) ||
            (false == isPKIToken(accessData['token']['id']))) {
            return;
        }
        var oldToken = accessData['token']['id'];
        accessData['token']['id'] =
            crypto.createHash('md5').update(oldToken).digest('hex');
        logutils.logger.debug('We are changing the old token: <' + oldToken +
                              '> to MD5 hash: ' + accessData['token']['id']);
    }
}

function fillAndGetReqArrToGetAuthData (authObj)
{
    var reqArr = [];
    var authData = null;
    var authCB = null;
    var req = authObj['req'];
    var regionname = authObj['regionname'];

    if ((true == authApi.isRegionListFromConfig()) &&
        (global.REQ_AT_SYS_INIT != authObj['reqBy'])) {
        var sessionRegion =
            commonUtils.getValueByJsonPath(req, 'session;region;name', null,
                                           false);
        var cookieRegion =
            commonUtils.getValueByJsonPath(req,
                                           'cookies;region', sessionRegion, false);
        if (null != cookieRegion) {
            var pubUrl = oStack.getPublicUrlByRegionName(cookieRegion, req);
            var verObj = oStack.getServiceApiVersionObjByPubUrl(pubUrl, 'identity');
            if (null != verObj) {
                req.session.region = verObj;
                req.session.region.name = cookieRegion;
                authObj['req'] = req;
            }
        }
        var version =
            commonUtils.getValueByJsonPath(authObj,
                                           'req;session;region;version',
                                           null, false);
        if (null != version) {
            var reqUrl = '/' + version + '/tokens';
            var authCB = formatAuthTokenDataCB[version];
            if (null == authCB) {
                logutils.logger.error("We do not support keystone auth API " +
                                      "version :" + version);
                return [];
            }
            authData = authCB(authObj);
            reqArr.push({'req': req, 'reqUrl': reqUrl,
                        'data': authData, version: version});
            return reqArr;
        }
        return [];
    }
    var authApiVerList = getKeystoneAPIVersions();
    var apiVerCnt = authApiVerList.length;
    for (var i = 0; i < apiVerCnt; i++) {
        urlCB = getAuthURLCB[authApiVerList[i]];
        if (null == urlCB) {
            continue;
        }
        reqUrl = urlCB();
        reqUrl += '/tokens';
        authCB = formatAuthTokenDataCB[authApiVerList[i]];
        if (null == authCB) {
            /* We do not support this version */
            logutils.logger.error("We do not support keystone auth API " +
                                  "version :" + authApiVerList[i]);
            continue;
        } else {
            authData = authCB(authObj);
        }
        reqArr.push({'req': req, 'reqUrl': reqUrl, 'data': authData,
                    'version': authApiVerList[i]});
    }
    return reqArr;
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
    var regionname = authObj['regionname'];
    var req = authObj['req'];

    var reqArr = fillAndGetReqArrToGetAuthData(authObj);
    var startIndex = 0;
    getAuthData(null, reqArr, startIndex, makeAuthPostReq, function(err, data,
                                                                    version) {
        if (('v3' == version) && (null == err) && (null != data) &&
            (null == data['error'])) {
            formatV3AuthDataToV2AuthData(data, authObj,
                                         function(err, data) {
                updateTokenIdWithMD5(data.access);
                callback(data);
            });
        } else {
            if (null == err) {
                if ((null != data) && (null != data.access)) {
                    updateTokenIdWithMD5(data.access);
                }
                callback(data);
            } else {
                callback(null);
            }
        }
    });
}

var formatAuthServiceCatalogCB = {
    'v2.0': formatV2ServiceCatalog,
    'v3': formatV3ServiceCatalog
};

function formatV2ServiceCatalog (serviceCatalog)
{
    return serviceCatalog;
}

function formatV3ServiceCatalog (serviceCatalog)
{
    var endPointList = [];
    var list = [];
    var tmpObjs = {};
    if (null == serviceCatalog) {
        return;
    }
    var cnt = serviceCatalog.length;
    for (var i = 0; i < cnt; i++) {
        var endPts = serviceCatalog[i]['endpoints'];
        var endPtsCnt = endPts.length;
        tmpObjs = {};
        for (var j = 0; j < endPtsCnt; j++) {
            var region = endPts[j]['region'];
            var intf = endPts[j]['interface'];
            if (null == tmpObjs[region]) {
                tmpObjs[region] = {};
            }
            var urlKey = intf + 'URL';
            tmpObjs[region][urlKey] = endPts[j]['url'];
        }
        list = [];
        for (region in tmpObjs) {
            list.push({'region': region});
            for (var urlKey in tmpObjs[region]) {
                list[list.length - 1][urlKey] = tmpObjs[region][urlKey];
            }
        }
        endPointList.push({'endpoints': list, name: serviceCatalog[i]['name'],
                           type: serviceCatalog[i]['type']});
    }
    return endPointList;
}

function getServiceTypeObj (svcCatType)
{
    var apiServType =
        commonUtils.getValueByJsonPath(config, 'endpoints;apiServiceType',
                                       global.DEFAULT_CONTRAIL_API_IDENTIFIER);
    var opServType =
        commonUtils.getValueByJsonPath(config, 'endpoints;opServiceType',
                                       global.DEFAULT_CONTRAIL_ANALYTICS_IDENTIFIER);
    if (-1 != svcCatType.indexOf(apiServType)) {
        return {type: apiServType, isContrailService: true};
    }
    if (-1 != svcCatType.indexOf(opServType)) {
        return {type: opServType, isContrailService: true};
    }
    return {type: svcCatType, isContrailService: false};
}

function getServiceCatalogByRegion (req, region, accessData, doFormat)
{
    if ((null == accessData) || (null == accessData.serviceCatalog)) {
        return null;
    }
    var domain =
        commonUtils.getValueByJsonPath(accessData, 'token;tenant;domain;name',
                                       'default-domain');
    if (domain == 'Default') {
        /* V3 default domain */
        domain = 'default-domain';
    }
    var project =
        commonUtils.getValueByJsonPath(accessData, 'token;tenant;name', null);
    var serviceCatalog = accessData.serviceCatalog;
    var tmpSvcCatObjs = {};
    var regionList = [];
    var authApiVersion = req.session.authApiVersion;
    var svcCatalogBySvcType = {};

    if (true == doFormat) {
        var formatSvcCatCB = formatAuthServiceCatalogCB[authApiVersion];
        if (null == formatSvcCatCB) {
            return null;
        }
        serviceCatalog = formatSvcCatCB(serviceCatalog);
        if (null == serviceCatalog) {
            return null;
        }
    }
    var cnt = serviceCatalog.length;
    for (var i = 0; i < cnt; i++) {
        var endpoints = serviceCatalog[i]['endpoints'];
        if (null == endpoints) {
            continue;
        }
        var typeObj = getServiceTypeObj(serviceCatalog[i]['type']);
        var type = typeObj['type'];
        var isContrailService = typeObj['isContrailService'];
        var endptCnt = endpoints.length;
        for (var j = 0; j < endptCnt; j++) {
            var cfgRegion = endpoints[j]['region'];
            var takePubURL =
                commonUtils.getValueByJsonPath(config,
                                               'serviceEndPointTakePublicURL',
                                               true);
            var pubUrl;
            if (true == takePubURL) {
                pubUrl = endpoints[j]['publicURL'];
            } else {
                pubUrl = endpoints[j]['internalURL'];
            }

            var svcApiObj =
                oStack.getServiceApiVersionObjByPubUrl(pubUrl, type);
            if (null == svcApiObj) {
                /* We could not decode verObj from pubUrl */
                logutils.logger.error('We could not decode verObj from ' +
                                      'pubUrl: ' + pubUrl + ' for type:' +
                                      type);
                continue;
            }
            svcApiObj = commonUtils.cloneObj(svcApiObj);
            endpoints[j] = commonUtils.cloneObj(endpoints[j]);
            if (true == authApi.isMultiRegionSupported()) {
                if (null == svcCatalogBySvcType[cfgRegion]) {
                    svcCatalogBySvcType[cfgRegion] = {};
                }
                if (null == req.session.regionname) {
                    req.session.regionname = cfgRegion;
                }
                if (-1 != global.keystoneServiceListByProject.indexOf(type)) {
                    if ((null == domain) || (null == project)) {
                        logutils.logger.error("We did not find domain/project" +
                                              " in serviceCatalog");
                        continue;
                    }
                    var domProject = domain + ':' + project;
                    if (null == svcCatalogBySvcType[cfgRegion][domProject]) {
                        svcCatalogBySvcType[cfgRegion][domProject] = {};
                        svcCatalogBySvcType[cfgRegion][domProject][type] = {};
                        svcCatalogBySvcType[cfgRegion][domProject][type]['maps']
                            = [];
                        svcCatalogBySvcType[cfgRegion][domProject][type]['values']
                            = [];
                    }
                    if (null ==
                        svcCatalogBySvcType[cfgRegion][domProject][type]) {
                        svcCatalogBySvcType[cfgRegion][domProject][type] = {};
                        svcCatalogBySvcType[cfgRegion][domProject][type]['maps']
                            = [];
                        svcCatalogBySvcType[cfgRegion][domProject][type]['values']
                            = [];
                    }
                    svcCatalogBySvcType[cfgRegion][domProject][type].maps.push(svcApiObj);
                    svcCatalogBySvcType[cfgRegion][domProject][type].values.push(endpoints[j]);
                } else {
                    if (null == svcCatalogBySvcType[cfgRegion][type]) {
                        svcCatalogBySvcType[cfgRegion][type] = {};
                        svcCatalogBySvcType[cfgRegion][type]['maps'] = [];
                        svcCatalogBySvcType[cfgRegion][type]['values'] = [];
                    }
                    svcCatalogBySvcType[cfgRegion][type].maps.push(svcApiObj);
                    svcCatalogBySvcType[cfgRegion][type].values.push(endpoints[j]);
                }
                if (null == tmpSvcCatObjs[cfgRegion]) {
                    tmpSvcCatObjs[cfgRegion] = [];
                }
                tmpSvcCatObjs[cfgRegion].push(type);
            }
        }
    }

    /* Now from the tmpSvcCatObjs, check which regions are having all the
     * endpoints which contrail-webui needs, add those regions in
     * req.session.regionList
     */
    var tmpEndpointList = commonUtils.cloneObj(mandatoryEndpointList);
    tmpEndpointList.push(authApi.getEndpointServiceType(global.DEFAULT_CONTRAIL_API_IDENTIFIER));
    tmpEndpointList.push(authApi.getEndpointServiceType(global.DEFAULT_CONTRAIL_ANALYTICS_IDENTIFIER));
    var tmpEndpointListLen = tmpEndpointList.length;

    var servicesNotFound = {};
    var tmpRegionMatchCnt = {};
    for (var i = 0; i < tmpEndpointListLen; i++) {
        for (var region in tmpSvcCatObjs) {
            if (-1 != tmpSvcCatObjs[region].indexOf(tmpEndpointList[i])) {
                if (null == tmpRegionMatchCnt[region]) {
                    tmpRegionMatchCnt[region] = 0;
                }
                tmpRegionMatchCnt[region]++;
                continue;
            }
            delete svcCatalogBySvcType[region];
            /* Not found */
            if (null == servicesNotFound[region]) {
                servicesNotFound[region] = [];
            }
            servicesNotFound[region].push(tmpEndpointList[i]);
            break;
        }
    }
    for (var region in tmpRegionMatchCnt) {
        if (tmpEndpointListLen == tmpRegionMatchCnt[region]) {
            regionList.push(region);
        }
    }
    if (true == authApi.isRegionListFromConfig()) {
        var cfgRegions =
            commonUtils.getValueByJsonPath(config, 'regions', {});
        regionList = [];
        for (var key in cfgRegions) {
            regionList.push(key);
        }
    }
    req.session.regionList = regionList;
    var sessionRegion = req.session.regionname;
    if (req.session.regionList.length > 0) {
        if ((null == sessionRegion) ||
            (-1 == req.session.regionList.indexOf(sessionRegion))) {
                /* Set the first region */
            //req.session.regionname = req.session.regionList[0];
        }
    }
    if (false == _.isEmpty(servicesNotFound)) {
        req.session.servicesNotFound = servicesNotFound;
    } else {
        delete req.session.servicesNotFound;
    }
    return svcCatalogBySvcType;
}

/* Function: updateTokenIdForProject
    This function is used to update the Token for a particular project in 
    req.session
 */
function updateTokenIdForProject (req, tenantId, accessData)
{
    if ((null == tenantId) || (null == accessData)) {
        return;
    }
    var region = commonUtils.getValueByJsonPath(req, 'session;regionname',
                                                null);
    if (true != req.session.isAuthenticated) {
        /* User is not authenticated yet */
        var svcCatalog =
            getServiceCatalogByRegion(req, region, accessData, true);
        if (null != svcCatalog) {
            req.session.serviceCatalog = svcCatalog;
        }
    }
    delete accessData['serviceCatalog'];
    if (null == req.session.tokenObjs) {
        req.session.tokenObjs = {};
    }
    if (null == req.session.tokenObjs[tenantId]) {
        req.session.tokenObjs[tenantId] = {};
    }
    req.session.tokenObjs[tenantId] = accessData;
    req.session.userRoles = userRoleListByTokenObjs(req.session.tokenObjs);
    return;
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

    var projEntry = getTokenIdByProject(req, tenantId);
    if ((null != projEntry) && ((null == forceAuth) ||
        (false == forceAuth))) {
        logutils.logger.debug("We are having project already in DB:" +
                              tenantId);
        callback(null, projEntry);
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

function updateLastTokenUsed (req, token)
{
    req.session.last_token_used = token;
}

function getTokenIdByProject (req, tenantName)
{
    if ((null != req.session) && (null != req.session.tokenObjs) &&
        (null != req.session.tokenObjs[tenantName])) {
        return req.session.tokenObjs[tenantName]['token'];
    }
    return null;

}

function getUserAuthData (req, tenantName, callback)
{
    var token = getTokenIdByProject(req, tenantName);
    if (null == token) {
        var token = getLastIdTokenUsed(req);
    }
    var authObj = {};
    authObj['tokenid'] = token.id;
    if (null == tenantName) {
        tenantName = req.cookies.project;
    }
    authObj['tenant'] = tenantName;
    authObj['req'] = req;

    getUserAuthDataByAuthObj (authObj, function(err, data) {
        if ((null != err) || (null == data) || (null == data.access) ||
            (null == data.access.token)) {
            callback(err, data);
            return;
        }
        var token = data.access.token;
        var dataAccess = commonUtils.cloneObj(data);
        updateTokenIdForProject(req, tenantName, data.access);
        updateDefTenantToken(req, tenantName, data);
        updateLastTokenUsed(req, token);
        callback(null, dataAccess);
    });
}

function getUserAuthDataByAuthObj (authObj, callback)
{
    var tenantName = authObj['tenant'];
    doAuth(authObj, function(data) {
        if (data == null) {
            if ((null != tenantName) && (null != authObj['req']) && 
                (null != authObj['req'].session.id)) {
                logutils.logger.error("Trying to illegal access with tenantName: " +
                                      tenantName + " With session: " +
                                      authObj['req'].session.id);
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

function getUserAuthDataByConfigAuthObj (authObj, callback)
{
    var error = new appErrors.RESTServerError("auth object not found in config");
    try {
        var authParams = require('../../../../../config/userAuth');
    } catch(e) {
        logutils.logger.error("userAuth.js not found");
        callback(error, null);
        return;
    }
    if (null == authObj) {
        authObj = {};
    }
    if (null == authObj['username']) {
        if ((null != authParams) &&
            (null != authParams.admin_user)) {
            authObj['username'] = authParams.admin_user;
        } else {
            callback(error, null);
            return;
        }
    }
    if (null == authObj['password']) {
        if ((null != authParams) &&
            (null != authParams.admin_password)) {
            authObj['password'] = authParams.admin_password;
        } else {
            callback(error, null);
            return;
        }
    }
    if (null == authObj['tenant']) {
        if ((null != authParams) &&
            (null != authParams.admin_tenant_name)) {
            authObj['tenant'] = authParams.admin_tenant_name;
        } else {
            callback(error, null);
            return;
        }
    }
    getUserAuthDataByAuthObj(authObj, callback);
}

function getCurrentTenant (req)
{
    var defTenant =
        commonUtils.getValueByJsonPath(req, 'session;def_token_used;tenant;name',
                                       null, false);
    var tenant =
        commonUtils.getValueByJsonPath(req, 'cookies;project', defTenant,
                                       false);
    return tenant;
}

function getServiceCatalog (req, callback)
{
    var tenant = getCurrentTenant(req);
    getUserAuthData(req, tenant, function(err, data) {
        if ((null != err) || (null == data) || (null == data.access)) {
            callback(null);
            return;
        }
        var svcCatCB = formatAuthServiceCatalogCB[req.session.authApiVersion];
        var svcCat = data.access.serviceCatalog;
        if (null != svcCatCB) {
            svcCat = svcCatCB(data.access.serviceCatalog);
        }
        var accessData = commonUtils.cloneObj(data.access);
        accessData.serviceCatalog = svcCat;
        callback(accessData);
    });
}

function getUIUserRoleByTenant (userObj, callback)
{
    var roles = [];
    getExtUserRoleByTenant(userObj, function(err, data) {
        if ((null != err) || (null == data) ||
            (null == data['roles'])) {
            callback(null, null);
            return;
        }
        roles = getUIRolesByExtRoles(data['roles']);
        callback(null, roles, data);
    });
}

function getExtUserRoleByTenant (userObj, callback)
{
    var userTokenObj = {};
    var tenant   = userObj['tenant'];
    doAuth(userObj, function(data) {
        if ((null != data) && (null != data['access']) &&
            (null != data['access']['user']) &&
            (null != data['access']['user']['roles'])) {
            userTokenObj['roles'] = data['access']['user']['roles'];
            userTokenObj['tokenObj'] = data['access'];
            if ((null != userObj['req']) && (null != tenant)) {
                 updateTokenIdForProject(userObj['req'], tenant,
                                         data.access);
            }
            callback(null, userTokenObj);
        } else {
            callback(null, null);
        }
    });
}

function getUserRoleByAllTenants (username, password, tenantlist, req, callback)
{
    var tokenObjs = {};
    var uiRoles = [];
    var tmpUIRoleObjs = {};
    var tenantObjArr = [];
    if ((null == tenantlist) || (!tenantlist.length)) {
        callback(null, tokenObjs);
        return;
    }
    var tenantCnt = tenantlist.length;
    var userRoles = [global.STR_ROLE_USER];

    /* Do only for the last tenant */
    for (var i = 0; i < tenantCnt; i++) {
        if ((null != tenantlist[i]) && (null != tenantlist[i]['name'])) {
            tenantObjArr[i] = {'username': username, 'password': password,
                'tenant': tenantlist[i]['name'], 'req': req};
        }
    }
    if (!tenantObjArr.length) {
        callback(null, tokenObjs);
        return;
    }

    async.map(tenantObjArr, getExtUserRoleByTenant, function(err, data) {
        if (data) {
            var roleList = [];
            var dataLen = data.length;
            for (var i = 0; i < dataLen; i++) {
                var project =
                    commonUtils.getValueByJsonPath(data[i],
                                                   'tokenObj;token;tenant;name',
                                                   null);
                if (null == project) {
                    continue;
                }
                tokenObjs[project] = data[i]['tokenObj'];
                /* We do not need service catalog */
                //delete tokenObjs[project]['serviceCatalog'];
                userRoles =
                    getUIRolesByExtRoles(data[i]['roles']);
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
};

function makeAuth (req, startIndex, lastErrStr, callback)
{
    if (null != req.session.authApiVersion) {
        authCB = makeAuthCB[req.session.authApiVersion];
        if (null == authCB) {
            errStr = 'keystone version from Region map not supported';
            callback(errStr);
            return;
        }
    }
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
            if (true == authApi.isRegionListFromConfig()) {
                /* We have exact match, so do not retry with next version and
                 * all
                 */
                logutils.logger.error("Login with region failed");
                errStr = "Login with region failed";
                callback(errStr);
                return;
            }
            return makeAuth(req, startIndex + 1, errStr, callback);
        }
    });
}

function isAdminRoleInProjects (userRolesPerProject)
{
    var adminRolesCnt = adminRoles.length;
    for (key in userRolesPerProject) {
        var roles = userRolesPerProject[key];
        for (var i = 0; i < adminRolesCnt; i++) {
            var userRoles = userRolesPerProject[key];
            var adminRole = adminRoles[i];
            adminRole = adminRole.toUpperCase();
            var userRolesCnt = userRoles.length;
            for (var j = 0; j < userRolesCnt; j++) {
                var userRole = userRoles[j].toUpperCase();
                if (userRole == adminRole) {
                    return true;
                }
            }
        }
    }
    return false;
}

function setDomainToReqObj (req, domain)
{
    if ('v2.0' == req.session.authApiVersion) {
        req.session.domain = global.KEYSTONE_V2_DEFAULT_DOMAIN;
        return;
    }
    if ((null == domain) || (isDefaultDomain(req, domain))) {
        req.session.domain = getDefaultDomain(req);
        return;
    }
    req.session.domain = domain;
}

function authenticate (req, res, appData, callback)
{
    var urlHash = '',urlPath = '';
    var post = req.body,
        username = post.username,
        regionname = post.regionname;
    if (post.urlHash != null) {
        urlHash = post.urlHash;
    }
    if (post.urlPath != null) {
        urlPath = post.urlPath;
    }
    var identityApiVerList = config.identityManager.apiVersion;
    var verCnt = identityApiVerList.length;

    var startIndex = 0;
    if ((null != regionname) && (regionname.length)) {
        req.session.regionname = regionname;
        req.cookies.region = regionname;
    } else {
        var cookieRegion = commonUtils.getValueByJsonPath(req, 'cookies;region',
                                                          null, false);
        if (null != cookieRegion) {
            //req.session.regionname = cookieRegion;
        }
    }
    if (true == authApi.isRegionListFromConfig()) {
        if ((null == regionname) || (!regionname.length)) {
            errStr = "regionsFromConfig is enabled, but region not provided";
            req.session.isAuthenticated = false;
            callback(errStr);
            return;
        }
        var pubUrl = oStack.getPublicUrlByRegionName(regionname, req);
        var verObj = oStack.getServiceApiVersionObjByPubUrl(pubUrl, 'identity');
        if (null != verObj) {
            req.session.region = verObj;
            req.session.region.name = regionname;
            startIndex = -1;
            version = verObj['version'];
            for (key in makeAuthCB) {
                if (key == version) {
                    startIndex++;
                    break;
                }
            }
            if (-1 == startIndex) {
                errStr = "Identity version from region not supported";
                logutils.logger.error(errStr);
                callback(errStr);
                return;
            } else {
                req.session.authApiVersion = version;
            }
        }
    }
    makeAuth(req, startIndex, null, function(errStr) {
        if (null != errStr) {
            req.session.isAuthenticated = false;
            callback(errStr);
            return;
        }
        var multiTenancyEnabled = commonUtils.isMultiTenancyEnabled();
        if ((true == multiTenancyEnabled) &&
            (false == isAdminRoleInProjects(req.session.userRoles))) {
            /* Logged in user is not admin in multi_tenancy mode,
               so redirect to login page
             */
            req.session.isAuthenticated = false;
            errStr = "User with admin only role is allowed";
            callback(errStr);
            return;
        }

        /* appData.req does not have the session object which we just injected,
         * so update req & defTokenObj in appData
         */
        appData['req'] = req;
        appData['defTokenObj'] = getAPIServerAuthParamsByReq(req);
        if (true == authApi.isMultiRegionSupported()) {
            /* Check if we have apiServer and opServer provisioned
             * in endpoint list
             */
            var regionName = req.session.regionname;
            var svcCatalogs =
                commonUtils.getValueByJsonPath(req,
                                               'session;serviceCatalog;' +
                                               regionName, null, false);
            var errStr = null;
            if (null == svcCatalogs) {
                errStr = 'Region: ' + regionName + ' - ' +
                    'All endpoints not provisioned.';
                var svcsNotFoundList =
                    commonUtils.getValueByJsonPath(req,
                                                   'session;servicesNotFound;' +
                                                   regionName, [], false);
                if (svcsNotFoundList.length > 0) {
                    errStr = 'Region: ' + regionName + ' - ' +
                        'endpoint not provisioned for ' +
                        req.session.servicesNotFound[regionName].join(', ');
                }
            }
            if (null != errStr) {
                req.session.isAuthenticated = false;
                callback(errStr);
                return;
            }
        }

        /* Check if we have multiple Regions configured in keystone, in that
         * case also, internally we will take as multiRegionSupported as true
         */
        req.session.isAuthenticated = true;
        setDomainToReqObj(req, post.domain);
        plugins.setAllCookies(req, res, appData, {'username': username}, function() {
            callback(null, null);
        });
    });

}

function getV3ProjectListByToken (req, tokenId, callback)
{
    var reqUrl = '/v3/users/' + req.session.userid + '/projects';
    sendV3GetReq({'reqUrl': reqUrl, 'token': tokenId, req: req},
                 function(err, projects) {
        callback(err, projects);
    });
}

function sendV3PostAsyncReq (dataObj, callback)
{
    var postData = dataObj['data'];
    var reqUrl = dataObj['reqUrl'];
    var withHeaderResp = dataObj['withHeaderResp'];

    sendV3PostReq({'data': postData, 'reqUrl': reqUrl,
                  'req': dataObj['req']},
                  function(err, data) {
        callback(err, data);
    });
}

function getProjectDetails (projects, userObj, callback)
{
    var req = userObj['req'];
    delete userObj['req'];
    var postDataArr = [];
    var userObjList = [];
    var projCnt = projects.length;
    for (var i = 0; i < projCnt; i++) {
        userObj['tenant'] = projects[i]['name'];
        var uObj = commonUtils.cloneObj(userObj);
        uObj['req'] = req;
        uObj['data'] = formatV3AuthTokenData(userObj, false);
        postDataArr[i] = {};
        userObjList[i] = uObj;
        postDataArr[i] = uObj;
        postDataArr[i]['data'] = uObj['data'];
        postDataArr[i]['reqUrl'] = global.KEYSTONE_V3_TOKEN_URL;
        postDataArr[i]['withHeaderResp'] = false;
    }
    async.map(postDataArr, sendV3PostAsyncReq, function(err, data) {
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
                var project =
                    commonUtils.getValueByJsonPath(tokenList[i], 'tenant;name',
                                                   null);
                if (null == project) {
                    continue;
                }
                tokenObjs[project] = {};
                tokenObjs[project]['token'] = tokenList[i];
                var tokenID =
                    commonUtils.getValueByJsonPath(tokenObjs[project],
                                                   'token;id', null);
                if (null == tokenID) {
                    logutils.logger.error('We did not get valid token id for ' +
                                          'project: ' + project);
                    delete tokenObjs[project];
                    continue;
                }
                tokenObjs[project]['token']['id'] = removeSpecialChars(tokenID);
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
    getProjectDetails(projects, userObj, function(err, projs, tokenObjs) {
        if ((null != err) || (null == projs)) {
            callback(null, tokenObjs);
            return;
        }
        var projCnt = projs.length;
        /* Only the last project- default project */
        for (var i = 0; i < projCnt; i++) {
            try {
                var projName =
                    commonUtils.getValueByJsonPath(projs[i],
                                                   'token;project;name',
                                                   null);
                if (null == projName) {
                    continue;
                }
                resTokenObjs[projName] = projs[i];
                if (null != tokenObjs[projName]) {
                    resTokenObjs[projName]['token']['id'] =
                        tokenObjs[projName]['token']['id'];
                    resTokenObjs[projName]['token']['tenant'] =
                        tokenObjs[projName]['token']['tenant'];
                    resTokenObjs[projName]['user'] = {};
                    resTokenObjs[projName]['user']['roles'] =
                        resTokenObjs[projName]['token']['roles'];
                    try {
                        resTokenObjs[projName]['serviceCatalog'] =
                            commonUtils.cloneObj(resTokenObjs[projName]['token']['catalog']);
                        delete resTokenObjs[projName]['token']['catalog'];
                    } catch(e) {
                    }
                }
            } catch(e) {
                logutils.logger.error("In getUserRoleByProjectList(): JSON " + 
                                      "Parse error:" + e);
            }
        }
        var resCnt = projs.length;
        for (var i = 0; i < resCnt; i++) {
            var roles =
                commonUtils.getValueByJsonPath(projs[i],
                                               'token;roles', null);
            var userRole = getUIRolesByExtRoles(roles);
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
        regionname = post.regionname,
        domain = post.domain,
        userJSON, tokenJSON, roleJSON;
    var userCipher = null;
    var passwdCipher = null
    var userEncrypted = null;
    var passwdEncrypted = null;
    var isUnscoped = true;

    req.session.authApiVersion = 'v3';
    var userObj = {'username': username, 'password': password};
    if ((null != domain) && (domain.length)) {
        userObj['domain'] = domain;
    }
    if ((null != regionname) && (regionname.length)) {
        userObj['regionname'] = regionname;
    }
    userObj['req'] = req;
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
        sendV3PostReq({'data': userPostData, 'reqUrl':
                      global.KEYSTONE_V3_TOKEN_URL, 'req': req},
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
                projects['projects'] = getEnabledProjects(projects['projects']);
                logutils.logger.debug("After V3 Successful auth def_token:" +
                                      JSON.stringify(data));
                /*
                req.session.serviceCatalog =
                    commonUtils.cloneObj(data.acccess.serviceCatalog);
                    */
                var projectCookie =
                    commonUtils.getValueByJsonPath(req,
                                                   'cookies;project',
                                                   null);
                var lastTenantObj = projects['projects'][projects['projects'].length - 1];
                var cookieProjObj = null;
                if (null != projectCookie) {
                    var tenantsCnt = projects['projects'].length;
                    for (var i = 0; i < tenantsCnt; i++) {
                        if ((projectCookie == projects['projects'][i]['name']) &&
                            (projectCookie != lastTenantObj['name'])) {
                            cookieProjObj = projects['projects'][i];
                        }
                    }
                }
                projects['projects'] = [lastTenantObj];
                if (null != cookieProjObj) {
                    projects['projects'].push(cookieProjObj);
                }
                getUserRoleByProjectList(projects['projects'], userObj,
                                         function(roleStr, tokenObjs) {
                    var defToken =
                        commonUtils.getValueByJsonPath(tokenObjs,
                                                       defProject + ';token',
                                                       null);
                    if (null == defToken) {
                        for (var key in tokenObjs) {
                            defToken =
                                commonUtils.getValueByJsonPath(tokenObjs[key],
                                                               'token', null);
                            if (null == defToken) {
                                continue;
                            }
                            defProject = key;
                            break;
                        }
                    }
                    req.session.def_token_used = defToken;
                    req.session.authApiVersion = 'v3';
                    req.session.tokenObjs = tokenObjs;
                    req.session.userRoles =
                        userRoleListByTokenObjs(tokenObjs);
                    updateTokenIdForProject(req, defProject,
                                            tokenObjs[defProject]);
                    req.session.userRole = roleStr;
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
        regionname = post.regionname,
        userJSON, tokenJSON, roleJSON;
    var userCipher = null;
    var passwdCipher = null
    var userEncrypted = null;
    var passwdEncrypted = null;
    var userObj = {'username': username, 'password': password};
    if ((null != regionname) && (regionname.length)) {
        userObj['regionname'] = regionname;
    }
    userObj['req'] = req;

    req.session.authApiVersion = 'v2.0';
    doAuth(userObj, function (data) {
        if ((null == data) || (null == data.access)) {
            req.session.isAuthenticated = false;
            callback(messages.error.invalid_user_pass);
            return;
        }
        req.session.userid = data.access.user["id"];
        /* Now check the tenants attached to this user */
        req.session.last_token_used = data.access.token;
        getTenantListByToken(req, data.access.token, function(err, data) {
            if ((null == data) || (null == data.tenants) ||
                (!data.tenants.length)) {
                req.session.isAuthenticated = false;
                callback(messages.error.unauthorized_to_project);
                return;
            }
            data.tenants = getEnabledProjects(data.tenants);
            var projectCookie =
                commonUtils.getValueByJsonPath(req,
                                               'cookies;project',
                                               null);
            var lastTenantObj = data.tenants[data.tenants.length - 1];
            var cookieProjObj = null;
            if (null != projectCookie) {
                var tenantsCnt = data.tenants.length;
                for (var i = 0; i < tenantsCnt; i++) {
                    if ((projectCookie == data.tenants[i]['name']) &&
                        (projectCookie != lastTenantObj['name'])) {
                        cookieProjObj = data.tenants[i];
                    }
                }
            }
            data.tenants = [lastTenantObj];
            if (null != cookieProjObj) {
                data.tenants.push(cookieProjObj);
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
            var userObj = {'username': username, 'password': password,
                           'tenant': defProject, 'req': req};
            doAuth(userObj, function(data) {
                if (data == null) {
                    req.session.isAuthenticated = false;
                    callback(messages.error.unauthorized_to_project);
                    return;
                } else {
                    logutils.logger.debug("After V2 Successful auth def_token:" +
                                          JSON.stringify(data.access));
                    req.session.def_token_used = data.access.token;
                    var uiRoles = null;
                    /* We got already the last one from tenantList, so remove
                       * this from tenantList now
                       */
                    var userRolesToDefProject =
                        commonUtils.getValueByJsonPath(data,
                                                       'access;user;roles', []);
                    var uiRolesToDefProject =
                        getUIRolesByExtRoles(userRolesToDefProject);
                    tenantList.splice(projCount - 1, 1);
                    getUserRoleByAllTenants(username, password,
                                            tenantList, req,
                                            function(uiRoles, tokenObjs) {
                        if ((tenantList.length > 0) && ((null == uiRoles) ||
                            (!uiRoles.length))) {
                            req.session.isAuthenticated = false;
                            callback(messages.error.unauthenticate_to_project);
                            return;
                        }
                        var uiRolesCnt = 0;
                        if ((null == uiRoles) || (!uiRoles.length)) {
                            uiRoles = [];
                            /* Take from default project one */
                            tokenObjs[defProject] =
                                commonUtils.getValueByJsonPath(data, 'access',
                                                               {});
                            delete tokenObjs[defProject]['serviceCatalog'];
                            var userRoles = uiRolesToDefProject;
                            var userRolesCnt = userRoles.length;
                            var tmpUIRoleObjs = {};
                            for (var i = 0; i < userRolesCnt; i++) {
                                if (null == tmpUIRoleObjs[userRoles[i]]) {
                                    uiRoles.push(userRoles[i]);
                                    tmpUIRoleObjs[userRoles[i]] = userRoles[i];
                                }
                            }
                        }

                        /* Save the user-id/password in Redis in encrypted format.
                         */
                        req.session.userRole = uiRoles;
                        req.session.authApiVersion = 'v2.0';
                        req.session.tokenObjs = tokenObjs;
                        req.session.userRoles =
                            userRoleListByTokenObjs(tokenObjs);
                        //setSessionTimeoutByReq(req);
                        updateTokenIdForProject(userObj.req, defProject,
                                                data.access);
                        updateLastTokenUsed(req, data.access.token);
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
    if (global.KEYSTONE_V2_DEFAULT_DOMAIN == domain) {
        return global.KEYSTONE_V3_DEFAULT_DOMAIN;
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

function buildAdminProjectListByReqObj (req)
{
    var adminRolesCnt = adminRoles.length;
    var tokenObjs = req.session.tokenObjs;
    var domProjects = [];
    for (key in tokenObjs) {
        try {
            var roles = tokenObjs[key]['user']['roles'];
            var rolesCnt = roles.length;
        } catch(e) {
            logutils.logger.error("Did not find role for project:" + key +
                                  " error:" + e);
            continue;
        }
        for (var i = 0; i < adminRolesCnt; i++) {
            for (var j = 0; j < rolesCnt; j++) {
                if (null == roles[j]['name']) {
                    continue;
                }
                if (roles[j]['name'].toUpperCase() ==
                    adminRoles[i].toUpperCase()) {
                    break;
                }
            }
        }
        if (j == rolesCnt) {
            continue;
        }
        var domain = getDomainByTokenObjKey(tokenObjs[key], req);
        domProjects.push([domain, key]);
    }
    return domProjects;
}

function getDomainByTokenObjKey (tokenObjKey, req)
{
    var domain = null;
    try {
        var tenant = tokenObjKey['token']['tenant'];
        domain = tenant['domain']['id'];
    } catch(e) {
        domain = null;
    }
    if (null == domain) {
        domain = getDefaultDomain(req);
    } else if (isDefaultDomain(req, domain)) {
        domain = getDefaultDomain(req);
    } else {
        domain = commonUtils.convertUUIDToString(domain);
    }
    return domain;
}

function filterProjectList (req, projectList)
{
    return projectList;
    var filtProjects = {'projects': []};
    var adminProjs = buildAdminProjectListByReqObj(req);
    var projects = projectList['projects'];
    var projCnt = projects.length;
    var adminProjCnt = adminProjs.length;
    for (var i = 0; i < projCnt; i++) {
        for (var j = 0; j < adminProjCnt; j++) {
            if (projects[i]['fq_name'].join(':') == adminProjs[j].join(':')) {
                filtProjects['projects'].push(projects[i]);
                break;
            }
        }
    }
    return filtProjects;
}

function getProjectList (req, appData, callback)
{
    var tenantObjArr = [];
    var filtProjects;
    var multiTenancyEnabled = commonUtils.isMultiTenancyEnabled();
    var isProjectListFromApiServer = config.getDomainProjectsFromApiServer;
    if (null == isProjectListFromApiServer) {
        isProjectListFromApiServer = false;
    }
    if (true == isProjectListFromApiServer) {
        configUtils.getProjectsFromApiServer(req, appData,
                                               function(error, data) {
            if (true == multiTenancyEnabled) {
                filtProjects = filterProjectList(req, data);
            } else {
                filtProjects = data;
            }
            callback(error, filtProjects);
        });
    } else {
        getProjectsFromKeystone(req, appData, function(error, keystoneProjs) {
            /* Check if we have all the projects listed in req.session.tokenObjs
             */
            if ((null != error) || (null == keystoneProjs) ||
                (null == keystoneProjs['projects']) ||
                (!keystoneProjs['projects'].length)) {
                callback(error, keystoneProjs);
                return;
            }
            var filtProjects = filterProjectList(req, keystoneProjs);
            callback(null, filtProjects);
            return;
            var projects = keystoneProjs['projects'];
            var projCnt = projects.length;
            var tokenObjs = req.session.tokenObjs;
            var found = false;
            for (var i = 0; i < projCnt; i++) {
                found = false;
                for (project in tokenObjs) {
                    var domain = getDomainByTokenObjKey(tokenObjs[project], req);
                    if ((projects[i]['fq_name'][0] == domain) &&
                        (projects[i]['fq_name'][1] == project)) {
                        found = true;
                        break;
                    }
                }
                if ((false == found) && (filtProjects['projects'].length > 0)) {
                    /* We did not find the project in our tokenObj, so get the
                     * token/role for this and update the tokenObjs
                     */

                    if (null != filtProjects['projects'][0]['fq_name']) {
                        var tokenObj =
                            req.session.tokenObjs[filtProjects['projects'][0]['fq_name'][1]];
                        if (null != tokenObj) {
                            var tokenId =
                                commonUtils.getValueByJsonPath(tokenObj,
                                                               'token;id',
                                                               null);
                            if (null != tokenId) {
                                tenantObjArr.push({'tenant': projects[i]['fq_name'][1],
                                      'domain': projects[i]['fq_name'][0],
                                      'req': req, 'tokenid': tokenId});
                            }
                        }
                    }
                }
            }
            if (!tenantObjArr.length) {
                callback(error, filtProjects);
                return;
            }
            async.map(tenantObjArr, getExtUserRoleByTenant, function(err, data) {
                var dataLen = data.length;
                for (var i = 0; i < dataLen; i++) {
                    var project =
                        commonUtils.getValueByJsonPath(data[i],
                                                       'tokenObj;token;tenant;name',
                                                       null);
                    if (null == project) {
                        continue;
                    }
                    var projectUUID =
                        commonUtils.getValueByJsonPath(data[i],
                                                       'tokenObj;token;tenant;id',
                                                       null);
                    if (null == projectUUID) {
                        continue;
                    }
                    req.session.tokenObjs[project] = data[i]['tokenObj'];
                    var userRoles = getUIRolesByExtRoles(data[i]['roles']);
                    var rolesCnt = data[i]['roles'].length;
                    var tmpRoleList = [];
                    for (var j = 0; j < rolesCnt; j++) {
                        if (null == data[i]['roles'][j]['name']) {
                            continue;
                        }
                        tmpRoleList.push(data[i]['roles'][j]['name'].toUpperCase());
                    }
                    var domain =
                        getDomainByTokenObjKey(req.session.tokenObjs[project], req);
                    var adminUserRolesCnt = adminRoles.length;
                    for (var j = 0; j < adminUserRolesCnt; j++) {
                        if (-1 !=
                            tmpRoleList.indexOf(adminRoles[j].toUpperCase())) {
                            filtProjects['projects'].push({"fq_name": [domain,
                                                            project],
                                                          "uuid":
                                                          commonUtils.convertUUIDToString(projectUUID)});
                            break;
                        }
                    }
                }
                callback(error, filtProjects);
            });
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
function formatIdentityMgrProjects (error, request, projectLists, domList,
                                    callback)
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
                (null != domList) && (null != domList['domains'])) {
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


function getAdminProjectList (req, appData, callback)
{
    var adminProjectList = {'projects': []};
    var adminProjectObjs = {};
    configUtils.getTenantListAndSyncDomain(req, appData,
                                           function(err, domainObjs,
                                                    tenantList, domList) {
        if ((null != err) || (null == tenantList) ||
            (null == tenantList['tenants'])) {
            logutils.logger.error('Tenant List retrieval error');
            callback(null, domainObjs, tenantList, domList, null);
            return;
        }
        var tokenObjs = req.session.tokenObjs;
        for (key in tokenObjs) {
            try {
                var domainObj = tokenObjs[key]['token']['tenant']['domain'];
            } catch(e) {
                logutils.logger.error("In getAdminProjectList(): " +
                                      "JSON parse error:" + e);
            }
            if (null == domainObj) {
                domain = global.KEYSTONE_V2_DEFAULT_DOMAIN;
            } else {
                domain = domainObj['id'];
                /* Check if it is default domain */
                if (authApi.isDefaultDomain(req, domain)) {
                    domain = getDefaultDomain(req);
                } else {
                    domain = (null != domainObj['name']) ?
                        domainObj['name']:
                        plugins.getDomainFqnByDomainUUID(commonUtils.convertUUIDToString(domain),
                                                         domainObjs);
                }
            }
            var roles = tokenObjs[key]['user']['roles'];
            var rolesCnt = roles.length;
            for (var i = 0 ; i < rolesCnt; i++) {
                var adminRolesCnt = adminRoles.length;
                for (var j = 0; j < adminRolesCnt; j++) {
                    if (null == roles[i]['name']) {
                        continue;
                    }
                    //if (adminRoles[j].toUpperCase() == roles[i]['name'].toUpperCase()) {
                        if (null == adminProjectObjs[domain]) {
                            adminProjectObjs[domain] = [];
                        }
                        adminProjectObjs[domain].push(key);
                    //}
                }
            }
        }
        formatIdentityMgrProjects(err, req, tenantList, domList,
                                  function(error, formattedAllTenantList) {
            var projs = formattedAllTenantList['projects'];
            var tenCnt = projs.length;
            for (var i = 0; i < tenCnt; i++) {
                var domain = projs[i]['fq_name'][0];
                if (null != adminProjectObjs[domain]) {
                    if (-1 !=
                        adminProjectObjs[domain].indexOf(projs[i]['fq_name'][1])) {
                        adminProjectList['projects'].push(projs[i]);
                    }
                }
            }
            callback(adminProjectObjs, domainObjs, tenantList, domList,
                     formattedAllTenantList, adminProjectList);
        });
    });
}

function isAdminRoleProject (project, req)
{
    var tokenObjs = req.session.tokenObjs;
    for (var key in tokenObjs) {
        if (key == project) {
            var roles = tokenObjs[key]['user']['roles'];
            var rolesCnt = roles.length;
            for (var i = 0; i < rolesCnt; i++) {
                if (null == roles[i]['name']) {
                    continue;
                }
                var adminRolesCnt = adminRoles.length;
                for (var k = 0; k < adminRolesCnt; k++) {
                    if (adminRoles[k].toUpperCase() ==
                        roles[i]['name'].toUpperCase()) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

function getCookieObjs (req, appData, callback)
{
    var cookieObjs = {};
    var domCookie = req.cookies.domain;
    var multiTenancyEnabled = commonUtils.isMultiTenancyEnabled();
    getAdminProjectList(req, appData, function(adminProjectObjs, domainObjs,
                                               tenantList, domList) {
        /*
        for (key in  adminProjectObjs) {
            cookieObjs['domain'] = key;
            cookieObjs['project'] = adminProjectObjs[key][0];
            callback(cookieObjs);
            return;
        }
        */
        /* multi_tenancy is disabled */
        if ((null == tenantList) || (null == tenantList['tenants'])) {
            logutils.logger.error('Tenant List retrieval error');
            callback(cookieObjs);
            return;
        }

        var tenLen = tenantList['tenants'].length;
        if (!tenLen) {
            logutils.logger.error("Tenant List empty");
            callback(cookieObjs);
            return;
        } else {
            defDomainId = tenantList['tenants'][tenLen - 1]['domain_id'];
            if (null != defDomainId) {
                if (authApi.isDefaultDomain(req, defDomainId)) {
                    defDomainId = getDefaultDomain(req);
                } else {
                    var domainID = commonUtils.convertUUIDToString(defDomainId);
                    defDomainId = plugins.getDomainFqnByDomainUUID(domainID, domainObjs);
                }
            } else {
                defDomainId = getDefaultDomain(req);
            }
        }
        var defProj = tenantList['tenants'][tenLen - 1]['name'];
        if (null == req.cookies) {
            /* Now check the tenantlist response, and if domain is there in
             * response, then set it, else set as default-domain
             */
            cookieObjs['domain'] = defDomainId;
            cookieObjs['project'] = defProj;
        } else {
            if (null == req.cookies.domain) {
                cookieObjs['domain'] = defDomainId;
            } else {
                /* First check if we have this domain now or not */
                if (false == plugins.doDomainExist(req.cookies.domain,
                                                   domainObjs)) {
                    cookieObjs['domain'] = defDomainId;
                } else {
                    cookieObjs['domain'] = req.cookies.domain;
                }
            }
            if (null == req.cookies.project) {
                cookieObjs['project'] = defProj;
            } else {
                if ('v2.0' == req.session.authApiVersion) {
                    /* Just check if the project exists or not */
                    var projCnt = tenantList['tenants'].length;
                    for (var i = 0; i < projCnt; i++) {
                        if ((null != tenantList['tenants'][i]) &&
                            (null != tenantList['tenants'][i]['name']) &&
                            (tenantList['tenants'][i]['name'] ==
                                req.cookies.project)) {
                            cookieObjs['project'] = req.cookies.project;
                            /* it is fine */
                            break;
                        }
                    }
                    if (i == projCnt) {
                        cookieObjs['project'] = defProj;
                    }
                } else {
                    var domList =
                        plugins.formatDomainList(req, tenantList, domainObjs);
                    var projList = domList[cookieObjs['domain']];
                    if (null == projList) {
                        cookieObjs['project'] = defProj;
                        callback(cookieObjs);
                        return;
                    }
                    var projCnt = projList.length;
                    for (var i = 0; i < projCnt; i++) {
                        if (projList[i] == req.cookies.project) {
                            /* It is fine */
                            cookieObjs['project'] = req.cookies.project;
                            break;
                        }
                    }
                    if (i == projCnt) {
                        /* We did not find the already set project cookie value in
                         * our project list
                         */
                        cookieObjs['project'] = defProj;
                    }
                }
            }
        }
        callback(cookieObjs);
    });
}

function authDelV2Req (authObj, callback)
{
    var token = authObj['token'];
    var tokDelURL = '/v2.0/tokens/' + token;
    var headers = authObj['headers'];
    if (null == headers) {
        headers = {};
    }
    try {
        var authParams = require('../../../../../config/userAuth');
        headers['X-Auth-Token'] = authParams.admin_token;
    } catch(e) {
    }

    var tmpAuthRestObj = getAuthRestApiInst(authObj.req, tokDelURL);
    if (null != tmpAuthRestObj.mapped) {
        headers['protocol'] = tmpAuthRestObj.mapped.protocol;
    }

    tmpAuthRestObj.authRestAPI.api.delete(tokDelURL, function(err, data) {
        callback(err, data);
    }, headers);
}

var delKeystoneTokenCBs = {
    'v2.0': deleteV2KeystoneToken,
    'v3': deleteV3KeystoneToken,
};

function deleteV3KeystoneToken (authObj, callback)
{
    var headers = {};
    var reqUrl = '/v3/auth/tokens/';
    if (null != authObj['headers']) {
        headers = authObj['headers'];
    }
    headers['X-Subject-Token'] = authObj['token'];
    try {
        var authParams = require('../../../../../config/userAuth');
        headers['X-Auth-Token'] = authParams.admin_token;
    } catch(e) {
    }

    var tmpAuthRestObj = getAuthRestApiInst(authObj.req, reqUrl);
    if (null != tmpAuthRestObj.mapped) {
        headers['protocol'] = tmpAuthRestObj.mapped.protocol;
    }

    tmpAuthRestObj.authRestAPI.api.delete(reqUrl, function(err) {
        callback(err);
    }, headers);
}

function deleteV2KeystoneToken (authObj, callback)
{
    authDelV2Req(authObj, callback);
}

function deleteKeystoneToken (data, callback)
{
    var req = data['req'];
    var authApiVer = req.session.authApiVersion;
    var delKeystoneTokenCB = delKeystoneTokenCBs[authApiVer];
    var token = data['token'];
    delKeystoneTokenCB(data, function(err, delData) {
        callback(err, delData);
    });
}

function deleteAllTokens (req, callback)
{
    try {
        var authParams = require('../../../../../config/userAuth');
    } catch(e) {
        logutils.logger.error("userAuth.js not found");
        callback(null, null);
        return;
    }
    var adminToken = authParams.admin_token;
    var tokenList = [];
    for (key in req.session.tokenObjs) {
        tokenList.push({'req': req,
                       'token': req.session.tokenObjs[key]['token']['id']});
    }
    async.map(tokenList, deleteKeystoneToken, function(err, data) {
        callback(err, data);
    });
}

function getSessionExpiryTime (req, appData, callback)
{
    var cfgSessTimeout =
        ((null != config.session) && (null != config.session.timeout)) ?
        config.session.timeout : null;
    var tokenSessTimeout = null;
    try {
        var tokenSessIssuedAt = new
            Date(req.session.last_token_used.issued_at).getTime();
        var tokenSessExpAt = new Date(req.session.last_token_used.expires).getTime();
        tokenSessTimeout = tokenSessExpAt - tokenSessIssuedAt;
    } catch(e) {
        tokenSessTimeout = null;
    }
    if (null != tokenSessTimeout) {
        if (null != cfgSessTimeout) {
            return ((tokenSessTimeout < cfgSessTimeout) ? tokenSessTimeout :
                    cfgSessTimeout);
        } else {
            return tokenSessTimeout;
        }
    }
    return null;
}

function getServiceAPIVersionByReqObj (req, svcType, callback, reqBy)
{
    oStack.getServiceAPIVersionByReqObj(req, svcType, callback, reqBy);
}

function shiftServiceEndpointList (req, serviceType, regionName)
{
    oStack.shiftServiceEndpointList(req, serviceType, regionName);
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
exports.getUserAuthDataByAuthObj = getUserAuthDataByAuthObj;
exports.getCookieObjs = getCookieObjs;
exports.getSessionExpiryTime = getSessionExpiryTime;
exports.getUserAuthDataByConfigAuthObj = getUserAuthDataByConfigAuthObj;
exports.deleteAllTokens = deleteAllTokens;
exports.getExtUserRoleByTenant = getExtUserRoleByTenant;
exports.getDomainNameByUUID = getDomainNameByUUID;
exports.getUIUserRoleByTenant = getUIUserRoleByTenant;
exports.getUIRolesByExtRoles = getUIRolesByExtRoles;
exports.getServiceAPIVersionByReqObj = getServiceAPIVersionByReqObj;
exports.getServiceCatalogByRegion = getServiceCatalogByRegion;
exports.shiftServiceEndpointList = shiftServiceEndpointList;
exports.getRoleList = getRoleList;

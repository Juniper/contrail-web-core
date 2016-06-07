/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * This file contains the functions for authentication mechanism via
 * cloudstack
 */

var config = process.mainModule.exports['config'],
    global = require('../../../common/global'),
    messages = require('../../../common/messages'),
    logutils = require('../../../utils/log.utils'),
    authApi = require('../../../common/auth.api'),
    crypto = require('crypto'),
    rest = require('../../../common/rest.api'),
    assert = require('assert'),
    commonUtils = require('./../../../utils/common.utils'),
    configUtils = require('../../../common/configServer.utils'),
    cloudStackApi = require('./cloudstack.api');

var authServerIP = ((config.identityManager) && (config.identityManager.ip)) ?
    config.identityManager.ip : global.DFLT_SERVER_IP;
var authServerPort =
    ((config.identityManager) && (config.identityManager.port)) ?
    config.identityManager.port : '8080';

authAPIServer = rest.getAPIServer({apiName:global.label.IDENTITY_SERVER,
                                   server:authServerIP, port:authServerPort});

var CLOUDSTACK_USER_TYPE_ADMIN = 1;
var CLOUDSTACK_USER_TYPE_USER  = 0;

function doAuth (userName, password, callback)
{
    var postData = {
        command: 'login',
        username: userName,
        password: password,
        response: 'json'
    };

    var reqUrl = '/client/api';

    authAPIServer.api.post(reqUrl, postData, function(err, data, response) {
        callback(err, data, response); 
    });
}

function getUserRoleByAuthResponse (cloudStackUserLoginResp)
{
    var userType = cloudStackUserLoginResp['loginresponse']['type'];
    if (CLOUDSTACK_USER_TYPE_ADMIN == userType) {
        return [global.STR_ROLE_ADMIN];
    } else {
        return [global.STR_ROLE_USER];
    }
}

function getUIUserRoleByTenant (userObj, callback)
{
    var userRoles = [global.STR_ROLE_USER];
    if ((null == userObj) || (null == userObj.req)) {
        callback(null, userRoles);
        return;
    }
    userRoles =
         commonUtils.getValueByJsonPath(userObj.req,
                                        'session;userRole',
                                        [global.STR_ROLE_USER]);
    callback(null, userRoles);
}

function getUIRolesByExtRoles (extRoles)
{
    var roles = [];
    if ((null == extRoles) || (!extRoles.length)) {
        return [global.STR_ROLE_USER];
    }
    var roleCnt = extRoles.length;
    for (var i = 0; i < roleCnt; i++) {
        roles.push(extRoles[i]['name']);
    }
    if (-1 != roles.indexOf('admin')) {
        return [global.STR_ROLE_ADMIN];
    }
    return [global.STR_ROLE_USER];
}

function getExtUserRoleByTenant (userObj, callback)
{
    getUIUserRoleByTenant(userObj, function(uiRoles) {
        if (-1 != uiRoles.indexOf(global.STR_ROLE_ADMIN)) {
            callback(null, {'roles': [{'name': 'admin'}]});
            return;
        }
        callback(null, {'roles': [{'name': 'Member'}]});
    });
}

function getUsers (req, callback)
{
    var postData = {};
    var cmd = 'listUsers';

    cloudStackApi.apiPost(req, cmd, postData, function(err, data) {
        callback(data);
    });
}

function updateUserKeys (req, userName, userLists)
{
    var users = userLists['listusersresponse']['user'];
    var usersCnt = users.length;
    for (var i = 0; i < usersCnt; i++) {
        if (userName == users[i]['username']) {
            break;
        }
    } 
    assert(i != usersCnt);
    req.session['userKey'] = {};
    req.session['userKey']['apiKey'] = users[i]['apikey'];
    req.session['userKey']['secretKey'] = users[i]['secretkey'];
}

function authenticate (req, res, appData, callback)
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

    doAuth(username, password, function (err, data, response) {
        if ((err) || (null == data)) {
            req.session.isAuthenticated = false;
            callback(messages.error.invalid_user_pass);
            return;
        }
        req.session.isAuthenticated = true;
        req.session.userid = data['loginresponse']['userid'];
        req.session['cloudstack-cookie'] = response.headers['set-cookie'][0];
        req.session.userRole = getUserRoleByAuthResponse(data);
        req.session.domainId = data['loginresponse']['domainid'];
        req.session.sessionKey = data['loginresponse']['sessionkey'];
        getUsers(req, function(userLists) {
            updateUserKeys(req, username, userLists);
            logutils.logger.info("Login Successful with tenants.");
            res.setHeader('Set-Cookie', "username=" + username +
                          '; expires=' +
                          new Date(new Date().getTime() +
                                   global.MAX_AGE_SESSION_ID).toUTCString());
            callback(null, '/' + urlHash);
        });
    });
}

function getAPIServerAuthParamsByReq (req)
{
    return req.session.sessionKey;
}

function formatClodStackTenantList (data)
{
    var resultJSON = {};
    resultJSON['projects'] = [];
    try {
        var projList = data['listprojectsresponse']['project'];
        var projCount = projList.length;
        for (var i = 0; i < projCount; i++) {
            resultJSON['projects'][i] = {};
            resultJSON['projects'][i]['fq_name'] = [];
            resultJSON['projects'][i]['fq_name'][0] = projList[i]['domain'];
            resultJSON['projects'][i]['fq_name'][1] = projList[i]['name'];
            resultJSON['projects'][i]['uuid'] = projList[i]['id'];
        }
    } catch(e) {
    }

    return resultJSON;
}

function formatTenantList (req, cloudstackProjects, apiProjects, callback)
{
    var resultJSON = formatClodStackTenantList(cloudstackProjects);
    callback(resultJSON);
}

function getTenantList (req, appData, callback)
{
    var postData = {};
    var cmd = 'listProjects';

    cloudStackApi.apiPost(req, cmd, postData, function(err, data) {
        callback(err, data);
    });
}

function getProjectList (req, appData, callback)
{
    getTenantList(req, appData, function(err, tenantList) {
       configUtils.listProjectsAPIServer(err, tenantList, appData,
                                             function(err, data) {
            formatTenantList(req, tenantList, data, function(projects) {
                callback(null, projects);
            });
        });
    });
}

function getSessionExpiryTime (req, appData, callback)
{
    var cfgSessTimeout =
        ((null != config.session) && (null != config.session.timeout)) ?
        config.session.timeout : null;
    var defSessTimeout = global.MAX_AGE_SESSION_ID;
    if (null == cfgSessTimeout) {
        return defSessTimeout;
    }
    return cfgSessTimeout;
}

function getUserAuthDataByConfigAuthObj (authObj, callback)
{
    callback(null, null);
}

function deleteAllTokens (req, callback)
{
    callback(null, null);
}

function getServiceAPIVersionByReqObj (req, svcType, callback)
{
    callback(null);
}

function shiftServiceEndpointList (req, serviceType, regionName)
{
    return;
}

exports.getAPIServerAuthParamsByReq = getAPIServerAuthParamsByReq;
exports.authenticate = authenticate;
exports.getTenantList = getTenantList;
exports.formatTenantList = formatTenantList;
exports.getProjectList = getProjectList;
exports.getSessionExpiryTime = getSessionExpiryTime;
exports.getUserAuthDataByConfigAuthObj = getUserAuthDataByConfigAuthObj;
exports.deleteAllTokens = deleteAllTokens;
exports.getUIUserRoleByTenant = getUIUserRoleByTenant;
exports.getExtUserRoleByTenant = getExtUserRoleByTenant;
exports.getUIRolesByExtRoles = getUIRolesByExtRoles;
exports.getServiceAPIVersionByReqObj = getServiceAPIVersionByReqObj;
exports.shiftServiceEndpointList = shiftServiceEndpointList;


/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * This file contains the functions for authentication mechanism via
 * vCenter
 */

var plugins = require('../plugins.api');
var config = process.mainModule.exports["config"],
    global = require('../../../common/global'),
    messages = require('../../../common/messages'),
    logutils = require('../../../utils/log.utils'),
    authApi = require('../../../common/auth.api'),
    crypto = require('crypto'),
    rest = require('../../../common/rest.api'),
    assert = require('assert'),
    commonUtils = require('./../../../utils/common.utils'),
    vcenterApi = require('../../../common/vcenter.api'),
    vCenterPluginApi = require('./vcenter.api'),
    configUtils = require('../../../common/configServer.utils'),
    authSoapServer = require('../../../common/auth.api');

var authServerIP = ((config.identityManager) && (config.identityManager.ip)) ?
    config.identityManager.ip : global.DFLT_SERVER_IP;
var authServerPort =
    ((config.identityManager) && (config.identityManager.port)) ?
    config.identityManager.port : '8080';

//authSOAPServer = rest.getSoapAPiServer({apiName:global.label.VCENTER_SERVER,
 //                                       vcenterParams: config.vcenter});
// var authSOAPServer = vcenterApi.createvCenterSoapApi('vcenter');

function authenticate (req, res, appData, callback)
{
    var urlHash = '',urlPath = '';
    var post = req.body,
        username = post.username,
        password = post.password;

    if (post.urlPath != null) {
        urlPath = post.urlPath + '/';
    }
    if (post.urlHash != null) {
        urlHash = post.urlHash;
    }
    var userData =
        {
        method    : 'Login',
        params : {
            _this : {
                _attributes : {
                    type: 'SessionManager'
                },
                _value : 'SessionManager'
            },
            userName : username,
            password: password
        }
    }
    console.log("getting urlPath as:", urlPath, urlHash);
    vcenterApi.doCall(userData, appData, function(err, data, resHeaders) {
        /* Once authenticated, then store the vmware_soap_session in session,
         * and pass this in header for next calls to vcenter server 
         */
            console.log("getting err as:", err, JSON.stringify(data), 
                        JSON.stringify(resHeaders));
        if (null != err) {
            var loginErrFile = 'webroot/html/login-error.html';
            commonUtils.changeFileContentAndSend(res, loginErrFile,
                                                 global.CONTRAIL_LOGIN_ERROR,
                                                 err.message,
                                                 //messages.error.invalid_user_pass,
                                             function() {
            });
            return;
        }
        req.session.isAuthenticated = true;
        req.session.userRole = [global.STR_ROLE_ADMIN];
        console.log("Getting urlPath as:", urlPath, urlHash);
        req.session['vmware_soap_session'] =
            resHeaders['set-cookie'][0];
            //res.redirect('/');
            //return;
        plugins.setAllCookies(req, res, appData, {'username': username}, function() {
            if ('' != urlPath) {
                res.redirect(urlPath + urlHash);
            } else {
                res.redirect('/' + urlHash);
            }
        });
    });
}

function getTenantList(req,appData,callback) {
    vCenterPluginApi.getProjectList(req,appData,function(err,projectList){
        console.log("Projects are "+JSON.stringify(projectList));
        if (err || (null == projectList)){
            callback(err,null);
            return;
        }
        var response = {
            "tenants_links": [], 
            "tenants": []
        };
        for (var i = 0; i < commonUtils.ifNull(projectList['projects'],[]).length; i++) {
            var projectObj = projectList['projects'][i];
            var tenantObj = {
                "description": null, 
                "enabled": true, 
                "id": commonUtils.convertApiServerUUIDtoKeystoneUUID(projectObj['uuid']),
                "name": projectObj['fq_name'].pop()
            };
            response['tenants'].push(tenantObj);
        }
        callback(err,response);
    });
}
function getServiceCatalog (req, callback)
{
    callback(null);
}

function getAPIServerAuthParamsByReq (req)
{
    return null;
}

function getProjectList (req, appData, callback)
{
    vCenterPluginApi.getProjectList(req, appData,
                                         function(error, data) {
        callback(error, data);
    });
}

function getUIUserRoleByTenant (userObj, callback)
{
    var roles = [global.STR_ROLE_ADMIN];
    callback(null, roles);
}

function getExtUserRoleByTenant (userObj, callback)
{
    callback(null, {'roles': [{'name': 'admin'}]});
}

function getUIRolesByExtRoles (extRoles)
{
    return [global.STR_ROLE_ADMIN];
}

function getImageList (req, callback)
{
    var imgList = {"images": []};
    callback(null, imgList);
}

function getFlavors (req, callback)
{
    var list = {"flavors": []};
    callback(null, list);
}

function getOSHostList (req, callback)
{
    var list = {"hosts": []};
    callback(null, list);
}

function getAvailabilityZoneList (req, callback)
{
    var list = {"availabilityZoneInfo": []};
    callback(null, list);
}

function getServiceInstanceVMStatus (req, vmRefs, callback)
{
    callback(null, null);
}

function getVMStatsByProject (projUUID, req, callback)
{
    callback(null, null);
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

function getCookieObjs (req, appData, callback)
{
    var cookieObjs = {};
    getProjectList(req, appData, function(err, data) {
        if ((null != err) || (null == data) || (null == data['projects']) ||
            (!data['projects'].length)) {
            callback(cookieObjs);
            return;
        }
        var projectList = data['projects'];
        cookieObjs['domain'] = projectList[0]['fq_name'][0];
        cookieObjs['project'] = projectList[0]['fq_name'][1];
        callback(cookieObjs);
    });
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

exports.getCookieObjs = getCookieObjs;
exports.getSessionExpiryTime = getSessionExpiryTime;
exports.authenticate = authenticate;
exports.getServiceCatalog = getServiceCatalog;
exports.getAPIServerAuthParamsByReq = getAPIServerAuthParamsByReq;
exports.getTenantList = getTenantList;
exports.getProjectList = getProjectList;
exports.getImageList = getImageList;
exports.getFlavors = getFlavors;
exports.getOSHostList = getOSHostList;
exports.getAvailabilityZoneList = getAvailabilityZoneList;
exports.getServiceInstanceVMStatus = getServiceInstanceVMStatus;
exports.getVMStatsByProject = getVMStatsByProject;
exports.getUserAuthDataByConfigAuthObj = getUserAuthDataByConfigAuthObj;
exports.deleteAllTokens = deleteAllTokens;
exports.getUIUserRoleByTenant = getUIUserRoleByTenant;
exports.getExtUserRoleByTenant = getExtUserRoleByTenant;
exports.getUIRolesByExtRoles = getUIRolesByExtRoles;
exports.getServiceAPIVersionByReqObj = getServiceAPIVersionByReqObj;


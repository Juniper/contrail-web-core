/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * This file contains the functions for the orchestration model when it is is
 * set to none
 *
 */
var plugins = require('../plugins.api');
var config = require('../../../../../config/config.global');
var commonUtils = require('../../../utils/common.utils');
var messages = require('../../../common/messages');
var configUtils = require('../../../common/configServer.utils');

function authenticate (req, res, callback)
{
    var urlHash = '';
    var post = req.body;
    var username = post.username;
    var password = post.password;

    var reqUser = config.noauth.username;
    var reqPwd = config.noauth.password;
    var roles = config.noauth.roles;
    if (post.urlHash != null) {
        urlHash = post.urlHash;
    }
    var loginErrFile = 'webroot/html/login-error.html';
    if ((username != reqUser) || (password != reqPwd)) {
        req.session.isAuthenticated = false;
        commonUtils.changeFileContentAndSend(res, loginErrFile,
                                             global.CONTRAIL_LOGIN_ERROR,
                                             messages.error.invalid_user_pass,
                                             function() {
        });
        return;
    }
    req.session.isAuthenticated = true;
    req.session.userRole = roles;
    plugins.setAllCookies(req, res, {'username': username}, function() {
        res.redirect('/' + urlHash);
    });
}

function getTenantList (req, callback)
{
    var projList = {"tenants": []};

    callback(null, projList);
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
    configUtils.getProjectsFromApiServer(req, appData,
                                         function(error, data) {
        callback(error, data);
    });
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


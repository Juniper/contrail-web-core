/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * This file contains the util functions for all plugins
 */

var config = process.mainModule.exports['config'];
var configMainServer = require('../../web/api/configServer.main.api');
var configJobServer = require('../../jobs/api/configServer.jobs.api');
var assert = require('assert');
var authApi = require('../../common/auth.api');
var logutils = require('../../utils/log.utils');
var orch = require('../orchestration.api');
var configUtils = require('../../common/configServer.utils');
var commonUtils = require('../../utils/common.utils');

var orchModel = orch.getOrchestrationModel();

function getApiServerRequestedByData (appData)
{
    assert(appData);
    var defproject = null;
    switch (orchModel) {
    case 'openstack':
    case 'cloudstack':
    case 'none':
        var genBy = appData['genBy'];
        if (null == genBy) {
            genBy = appData['taskData']['genBy'];
        }

        if (global.service.MAINSEREVR == genBy) {
            return configMainServer;
        } else if (global.service.MIDDLEWARE == genBy) {
            return configJobServer;
        } else {
            logutils.logger.error("We did not get info of generator");
            return configMainServer;
        }
        break;
    default:
        if (null != appData['taskData']) {
            if ((global.REQ_AT_SYS_INIT == appData['taskData']['reqBy']) ||
                (null != appData['taskData']['authObj'])) {
                return configJobServer;
            }
        }
        return configMainServer;
    }
}

function getOrchestrationPluginModel ()
{
    return {'orchestrationModel' : orchModel}
}

function doDomainExist (domain, domainList)
{
    var data = domainList['tenants'];
    var cnt = data.length;
    for (var i = 0; i < cnt; i++) {
        if (domain == data[i]['domain_id']) {
            return true;
        }
    }
    return false;
}

function formatDomainList (tenantList)
{
    var domainObjs = {};
    var data = tenantList['tenants'];
    var len = data.length;
    for (var i = 0; i < len; i++) {
        if (null == domainObjs[data[i]['domain_id']]) {
            domainObjs[data[i]['domain_id']] = [];
        }
        domainObjs[data[i]['domain_id']].push(data[i]['name']);
    }
    return domainObjs;
}
var adminProjects = ['admin'];
function getAdminProjectList (req)
{
    var adminProjectList = [];
    var adminProjectsCnt = adminProjects.length;
    var userRoles = req.session.userRoles;
    for (key in userRoles) {
        for (var i = 0; i < adminProjectsCnt; i++) {
            if (-1 !=
                req.session.userRoles[key].indexOf(adminProjects[i])) {
                adminProjectList.push(key);
            }
        }
    }
    return adminProjectList;
}

function setAllCookies (req, res, appData, cookieObj, callback)
{
    var loginErrFile = 'webroot/html/login-error.html';
    var multiTenancyEnabled = commonUtils.isMultiTenancyEnabled();
    if (null == appData['authObj']['defTokenObj']) {
        /* We have not got defTokenObj filled yet while sending to Auth
         * Module, so fill it up here
         */
        var adminProjectList = getAdminProjectList(req);
        /* adminProjectList must not empty array */
        if (adminProjectList.length) {
            appData['authObj']['defTokenObj'] =
                req.session.tokenObjs[adminProjectList[0]]['token'];
        } else {
            /* Check if multi_tenancy enabled */
            if (true == multiTenancyEnabled) {
                /* We should not come here, multi_tenancy enabled, why we came
                 * here still
                 */
                logutils.logger.error("No Admin Projects!!!");
                errStr = "No admin projects";
                commonUtils.changeFileContentAndSend(res, loginErrFile,
                                                     global.CONTRAIL_LOGIN_ERROR,
                                                     errStr, function() {
                });
                return;
            }
            var tokenObjs = req.session.tokenObjs;
            for (key in tokenObjs) {
                appData['authObj']['defTokenObj'] =
                    req.session.tokenObjs[key]['token'];
                break;
            }
        }
    }
    var defDomainId;
    res.setHeader('Set-Cookie', 'username=' + cookieObj.username +
                  '; expires=' +
                  new Date(new Date().getTime() +
                           global.MAX_AGE_SESSION_ID).toUTCString());
    authApi.getCookieObjs(req, appData, function(cookieObjs) {
        if (null != cookieObjs['domain']) {
            res.setHeader('Set-Cookie', 'domain=' + cookieObjs['domain'] +
                          '; expires=' + new Date(new Date().getTime() +
                                                  global.MAX_AGE_SESSION_ID).toUTCString());
        }
        if (null != cookieObjs['project']) {
            res.setHeader('Set-Cookie', 'project=' + cookieObjs['project'] +
                          '; expires=' + new Date(new Date().getTime() +
                                                  global.MAX_AGE_SESSION_ID).toUTCString());
        }
        callback();
    });
}

exports.getApiServerRequestedByData = getApiServerRequestedByData;
exports.getOrchestrationPluginModel = getOrchestrationPluginModel;
exports.setAllCookies = setAllCookies;
exports.doDomainExist = doDomainExist;

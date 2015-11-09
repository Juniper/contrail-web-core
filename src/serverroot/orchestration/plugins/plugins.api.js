/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * This file contains the util functions for all plugins
 */

var config = process.mainModule.exports['config'];
var configMainServer = require('../../web/api/configServer.main.api');
var configJobServer = require('../../jobs/api/configServer.jobs.api');
var vCenterMainServer = require('../../web/api/vCenterServer.main.api');
//var vCenterJobServer = require('../../web/api/vCenterServer.jobs.api');
var assert = require('assert');
var authApi = require('../../common/auth.api');
var logutils = require('../../utils/log.utils');
var orch = require('../orchestration.api');
var configUtils = require('../../common/configServer.utils');
var commonUtils = require('../../utils/common.utils');

var orchModels = orch.getOrchestrationModels();

function getApiServerRequestedByData (appData,reqBy)
{
    assert(appData);
    var defproject = null;
    //Set loggedInOrchestrionMode
    var loggedInOrchestrationMode = 'openstack';
    if ((null != appData) && (null != appData['authObj']) &&
        (null != appData['authObj']['req']) &&
        (null != appData['authObj']['req'].session) &&
        (null != appData['authObj']['req'].session.loggedInOrchestrationMode)) {
        loggedInOrchestrationMode =
            appData['authObj']['req'].session.loggedInOrchestrationMode;
    } else {
        if ((null != appData) && (null != appData.taskData) &&
            (null != appData.taskData.loggedInOrchestrationMode)) {
            loggedInOrchestrationMode =
                appData.taskData.loggedInOrchestrationMode;
        }
    }
    return getApiServerRequestedByApp(loggedInOrchestrationMode, appData,reqBy);
}

function getApiServerRequestedByApp (loggedInOrchestrationMode, appData, reqBy)
{
    switch (reqBy) {
    case global.label.API_SERVER:
        return getApiServerRequestedByApiServer(loggedInOrchestrationMode,
                                                appData);
    case global.label.VCENTER_SERVER:
        return getApiServerRequestedByvCenter(loggedInOrchestrationMode,
                                              appData);
    default:
        assert(0);
    }
}

function getApiServerRequestedByApiServer (loggedInOrchestrationMode, appData)
{
    switch (orchModel) {
        case 'openstack':
        case 'cloudstack':
        case 'vcenter':
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
        break
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

function getApiServerRequestedByvCenter (loggedInOrchestrationMode, appData)
{
    /* Openstack auth is keystone based, as config Server does not do
     * authentication using cloudstack, so for now add check
     */
        var genBy = appData['genBy'];
        if (null == genBy) {
            genBy = appData['taskData']['genBy'];
        }
        if (global.service.MAINSEREVR == genBy) {
            return vCenterMainServer;
        } else {
            return vCenterJobServer;
        }
}

function getOrchestrationPluginModel ()
{
    return {'orchestrationModel' : orchModels}
}

function doDomainExist (domain, domainList)
{
    var data = domainList['domains'];
    var cnt = data.length;
    for (var i = 0; i < cnt; i++) {
        if (domain == data[i]['fq_name'][0]) {
            return true;
        }
    }
    return false;
}

function getDomainFqnByDomainUUID (domUUID, domainObjs)
{
    var domCnt = 0;
    try {
        var domains = domainObjs['domains'];
        domCnt  = domains.length;
    } catch(e) {
        domCnt = 0;
    }
    for (var i = 0; i < domCnt; i++) {
        if (domains[i]['uuid'] == domUUID) {
            return domains[i]['fq_name'][0];
        }
    }
    return null;
}

function formatDomainList (req, tenantList, domainListObjs)
{
    var domainObjs = {};
    var data = tenantList['tenants'];
    var len = data.length;
    var domain = null;
    var tmpDomainMap = {};
    for (var i = 0; i < len; i++) {
        if (null == tmpDomainMap[data[i]['domain_id']]) {
            if (authApi.isDefaultDomain(req, data[i]['domain_id'])) {
                domain = authApi.getDefaultDomain(req);
            } else {
                domain = commonUtils.convertUUIDToString(data[i]['domain_id']);
                domain = getDomainFqnByDomainUUID(domain, domainListObjs);
            }
            if (null == domain) {
                logutils.logger.error('Not found the domain ' +
                                      data[i]['domain_id']);
                continue;
            }
            tmpDomainMap[data[i]['domain_id']] = domain;
            domainObjs[domain] = [];
        }
        domain = tmpDomainMap[data[i]['domain_id']];
        domainObjs[domain].push(data[i]['name']);
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
                           global.MAX_AGE_SESSION_ID).toUTCString() +
                  "; secure");
    authApi.getCookieObjs(req, appData, function(cookieObjs) {
        if (null != cookieObjs['domain']) {
            res.setHeader('Set-Cookie', 'domain=' + cookieObjs['domain'] +
                          '; expires=' +
                          new Date(new Date().getTime() +
                                   global.MAX_AGE_SESSION_ID).toUTCString() +
                          "; secure");
        }
        if (null != cookieObjs['project']) {
            res.setHeader('Set-Cookie', 'project=' + cookieObjs['project'] +
                          '; expires=' +
                          new Date(new Date().getTime() +
                                   global.MAX_AGE_SESSION_ID).toUTCString() +
                          "; secure");
        }
        res.setHeader('Set-Cookie', '_csrf=' + req.session._csrf +
                        '; expires=' + new Date(new Date().getTime() +
                                                global.MAX_AGE_SESSION_ID).toUTCString()
                        + '; secure');
        callback();
    });
}

exports.getApiServerRequestedByData = getApiServerRequestedByData;
exports.getOrchestrationPluginModel = getOrchestrationPluginModel;
exports.setAllCookies = setAllCookies;
exports.doDomainExist = doDomainExist;
exports.formatDomainList = formatDomainList;
exports.getDomainFqnByDomainUUID = getDomainFqnByDomainUUID;


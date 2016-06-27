/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * This file contains the util functions for all plugins
 */

var config = process.mainModule.exports['config'];
var configMainServer = require('../../web/api/configServer.main.api');
var opMainServer = require('../../web/api/opServer.main.api');
var configJobServer = require('../../jobs/api/configServer.jobs.api');
var opJobServer = require('../../jobs/api/opServer.jobs.api');
//var vCenterJobServer = require('../../web/api/vCenterServer.jobs.api');
var assert = require('assert');
var authApi = require('../../common/auth.api');
var logutils = require('../../utils/log.utils');
var orch = require('../orchestration.api');
var configUtils = require('../../common/configServer.utils');
var global = require('../../common/global');
var commonUtils = require('../../utils/common.utils');
var crypto = require('crypto');

var orchModels = orch.getOrchestrationModels();

function getApiServerRequestedByData (appData,reqBy)
{
    assert(appData);
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
    case global.label.OPSERVER:
        return getApiServerRequestedByReqType(loggedInOrchestrationMode,
                                              reqBy, appData);
    case global.label.VCENTER_SERVER:
        return getApiServerRequestedByvCenter(loggedInOrchestrationMode,
                                              appData);
    default:
        assert(0);
    }
}

function getServerType (genBy, reqBy)
{
    if (global.label.API_SERVER == reqBy) {
        switch (genBy) {
        case global.service.MIDDLEWARE:
            return configJobServer;
        case global.service.MAINSEREVR:
        default:
            return configMainServer;
        }
    } else if (global.label.OPSERVER = reqBy) {
        switch (genBy) {
        case global.service.MIDDLEWARE:
            return opJobServer;
        case global.service.MAINSEREVR:
        default:
            return opMainServer;
        }
    }
    logutils.logger.error('We did not find correct genBy/reqBy: ' + genBy + ':'
                          + reqBy);
    return null;
}

function getApiServerRequestedByReqType (loggedInOrchestrationMode, reqBy,
                                         appData)
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
        return getServerType(genBy, reqBy);
    default:
        if (null != appData['taskData']) {
            if ((global.REQ_AT_SYS_INIT == appData['taskData']['reqBy']) ||
                (null != appData['taskData']['authObj'])) {
                return configJobServer;
            }
        }
        return getServerType(global.service.MIDDLEWARE, reqBy);
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
            var vCenterMainServer = require('../../web/api/vCenterServer.main.api');
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

function setAllCookies (req, res, appData, cookieObj, callback)
{
    var loginErrFile = 'webroot/html/login-error.html';
    var multiTenancyEnabled = commonUtils.isMultiTenancyEnabled();
    var adminProjectList = authApi.getAdminProjectList(req);
    if (null == appData['authObj']['defTokenObj']) {
        /* We have not got defTokenObj filled yet while sending to Auth
         * Module, so fill it up here
         */
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
                logutils.logger.error("User with admin only role is allowed!!!");
                errStr = "User with admin only role is allowed";
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
    var cookieExp =
        ((null != config.session) && (null != config.session.timeout)) ?
        config.session.timeout : global.MAX_AGE_SESSION_ID;

    var cookieExpStr = new Date(new Date().getTime() + cookieExp).toUTCString();
    var secureCookieStr = (false == config.insecure_access) ? "; secure" : "";
    res.setHeader('Set-Cookie', 'username=' + cookieObj.username +
                  '; expires=' + cookieExpStr + secureCookieStr);
    var region = authApi.getCurrentRegion(req);
    if (null != region) {
        res.setHeader('Set-Cookie', 'region=' + region +
                      '; expires=Sun, 17 Jan 2038 00:00:00 UTC; path=/' +
                      secureCookieStr);
        req.cookies.region = region;
    }
    authApi.getCookieObjs(req, appData, function(cookieObjs) {
        if (null != cookieObjs['domain']) {
            res.setHeader('Set-Cookie', 'domain=' + cookieObjs['domain'] +
                          '; expires=' + cookieExpStr + secureCookieStr);
        }
        var cookieProject = cookieObjs['project'];
        if ((null == cookieProject) ||
            (-1 == adminProjectList.indexOf(cookieProject))) {
            cookieProject = adminProjectList[0];
        }
        if (null != cookieProject) {
            res.setHeader('Set-Cookie', 'project=' + cookieProject +
                          '; expires=' + cookieExpStr + secureCookieStr);
        }
        if(req.session._csrf == null)
            req.session._csrf = crypto.randomBytes(Math.ceil(24 * 3 / 4))
                .toString('base64')
                    .slice(0, 24);
        res.setHeader('Set-Cookie', '_csrf=' + req.session._csrf +
                      '; expires=' + cookieExpStr + secureCookieStr);
        callback();
    });
}

function doPostRegionSetConfig (req)
{
    if (false == authApi.isMultiRegionSupported()) {
        return;
    }
    /* Update the middleware about the region information */
    var clUtils = require('../../utils/cluster.utils');
    var cmd = global.STR_SEND_TO_JOB_SERVER;
    var reqData = {
        jobType: global.UPDATE_REGION_CONFIG,
        data: {
            serviceCatalog: req.session.serviceCatalog,
            regionName: req.session.regionname
        }
    };
    clUtils.sendMsgToMiddleware(cmd, JSON.stringify(reqData));
}

exports.getApiServerRequestedByData = getApiServerRequestedByData;
exports.getOrchestrationPluginModel = getOrchestrationPluginModel;
exports.setAllCookies = setAllCookies;
exports.doDomainExist = doDomainExist;
exports.formatDomainList = formatDomainList;
exports.getDomainFqnByDomainUUID = getDomainFqnByDomainUUID;
exports.doPostRegionSetConfig = doPostRegionSetConfig;


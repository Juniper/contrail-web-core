/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * This file contains the util functions for all plugins
 */

var config = require('../../../../config/config.global');
var configMainServer = require('../../web/api/configServer.main.api');
var configJobServer = require('../../jobs/api/configServer.jobs.api');
var assert = require('assert');
var authApi = require('../../common/auth.api');
var logutils = require('../../utils/log.utils');
var orch = require('../orchestration.api');

var orchModel = orch.getOrchestrationModel();

function getApiServerRequestedByData (appData)
{
    var defproject = null;
    switch (orchModel) {
    case 'openstack':
        /* Openstack auth is keystone based, as config Server does not do
         * authentication using cloudstack, so for now add check
         */
        try {
            defProject = appData['authObj']['defTokenObj']['tenant']['name'];
            return configMainServer;
        } catch(e) {
            try {
                defProject =
                    appData['taskData']['authObj']['token']['tenant']['name'];
                return configJobServer;
            } catch(e) {
                /* Nothing specified, assert */
                if (global.REQ_AT_SYS_INIT == appData['taskData']['reqBy']) {
                    return configJobServer;
                } else {
                    assert(0);
                }
            }
        }
        break;
    case 'cloudstack':
        /* If authentication is done via cloudstack, we can not have
         * multi_tenancy, as config Server does not do authentication through
         * cloudstack now */
        try {
            sessionKey = appData['authObj']['defTokenObj']['sessionkey'];
            return configMainServer;
        } catch(e) {
            return configJobServer;
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

function setAllCookies (req, res, cookieObj, callback)
{
    var defDomainId;
    res.setHeader('Set-Cookie', 'username=' + cookieObj.username +
                  '; expires=' +
                  new Date(new Date().getTime() +
                           global.MAX_AGE_SESSION_ID).toUTCString());
    var domCookie = req.cookies.domain;
    var adminProjectList = getAdminProjectList(req);
    authApi.getTenantList(req, function(err, data) {
        if ((null != err) || (null == data) || (null == data['tenants'])) {
            logutils.logger.error('Tenant List retrieval error');
            callback();
            return;
        }

        var adminProjectCnt = adminProjectList.length;
        var tenLen = data['tenants'].length;
        if (!tenLen) {
            logutils.logger.error("Tenant List empty");
            callback();
            return;
        }
        var j = 0;
        for (var i = 0; i < adminProjectCnt; i++) {
            for (j = 0; j < tenLen; j++) {
                if (adminProjectList[i] == data['tenants'][j]['name']) {
                    break;
                }
            }
        }
        if ((i != 0) && (j != tenLen)) {
            defDomainId = data['tenants'][j]['domain_id'];
            if (null != defDomainId) {
                if (authApi.isDefaultDomain(req, defDomainId)) {
                    defDomainId = authApi.getDefaultDomain(req);
                }
            } else {
                defDomainId = global.KEYSTONE_V2_DEFAULT_DOMAIN;
            }
            defProj = data['tenants'][j]['name'];
            res.setHeader('Set-Cookie', 'domain=' + defDomainId +
                          '; expires=' + new Date(new Date().getTime() +
                                                  global.MAX_AGE_SESSION_ID).toUTCString());
            res.setHeader('Set-Cookie', 'project=' + defProj +
                          '; expires=' + new Date(new Date().getTime() +
                                                  global.MAX_AGE_SESSION_ID).toUTCString());
            callback();
            return;
        }
        defDomainId = data['tenants'][tenLen - 1]['domain_id'];
        if (null == defDomainId) {
            defDomainId = global.KEYSTONE_V2_DEFAULT_DOMAIN;
        }
        var defProj = data['tenants'][tenLen - 1]['name'];
        if (null == req.cookies) {
            /* Now check the tenantlist response, and if domain is there in
             * response, then set it, else set as default-domain
             */
            res.setHeader('Set-Cookie', 'domain=' + defDomainId +
                          '; expires=' + new Date(new Date().getTime() +
                                                  global.MAX_AGE_SESSION_ID).toUTCString());
            res.setHeader('Set-Cookie', 'project=' + defProj +
                          '; expires=' + new Date(new Date().getTime() +
                                                  global.MAX_AGE_SESSION_ID).toUTCString());
        } else {
            if (null == req.cookies.domain) {
                res.setHeader('Set-Cookie', 'domain=' + defDomainId +
                              '; expires=' + new Date(new Date().getTime() +
                                                      global.MAX_AGE_SESSION_ID).toUTCString());
            } else {
                /* First check if we have this domain now or not */
                if (false == doDomainExist(req.cookies.domain, data)) {
                    res.setHeader('Set-Cookie', 'domain=' + defDomainId +
                                  '; expires=' + new Date(new Date().getTime() +
                                                          global.MAX_AGE_SESSION_ID).toUTCString());
                    domCookie = defDomainId;
                }
            }
            if (null == req.cookies.project) {
                res.setHeader('Set-Cookie', 'project=' + defProj +
                              '; expires=' + new Date(new Date().getTime() +
                                                      global.MAX_AGE_SESSION_ID).toUTCString());
            } else {
                if ('v2.0' == req.session.authApiVersion) {
                    /* Just check if the project exists or not */
                    var projCnt = data['tenants'].length;
                    for (var i = 0; i < projCnt; i++) {
                        if (data['tenants'][i] == req.cookies.project) {
                            /* it is fine */
                            break;
                        }
                    }
                    if (i == projCnt) {
                        res.setHeader('Set-Cookie', 'project=' + defProj +
                                      '; expires=' + new Date(new Date().getTime() +
                                                              global.MAX_AGE_SESSION_ID).toUTCString());
                    }
                } else {
                    var domList = formatDomainList(data);
                    var projList = domList[domCookie];
                    var projCnt = projList.length;
                    for (var i = 0; i < projCnt; i++) {
                        if (projList[i] == req.cookies.project) {
                            /* It is fine */
                            break;
                        }
                    }
                    if (i == projCnt) {
                        /* We did not find the already set project cookie value in
                         * our project list
                         */
                        res.setHeader('Set-Cookie', 'project=' + defProj +
                                      '; expires=' + new Date(new Date().getTime() +
                                                              global.MAX_AGE_SESSION_ID).toUTCString());
                    }
                }
            }
        }
        callback();
    });
}

exports.getApiServerRequestedByData = getApiServerRequestedByData;
exports.getOrchestrationPluginModel = getOrchestrationPluginModel;
exports.setAllCookies = setAllCookies;


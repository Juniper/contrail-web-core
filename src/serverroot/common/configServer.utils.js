/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var authApi = require('./auth.api');
var config = process.mainModule.exports.config;
var commonUtils = require('../utils/common.utils');
var async = require('async');
var configApiServer = require('./configServer.api');
var logutils = require('./../utils/log.utils');

/**
 * @listProjectsAPIServer
 * private function
 * 1. Gets list of projects from API server
 */
function listProjectsAPIServer (error, projectLists, appData, callback)
{
    var projects   = {'projects':[]};
    var projectURL = '/projects';

    if (error) {
        callback(error, projects);
        return;
    }
    configApiServer.apiGet(projectURL, appData,
        function(error, data) {
        callback(error, data);
    });
}

/** 
 * @getProjectsFromApiServer
 * Private function
 * 1. Gets all the projects from Api Server based on either /domain or /project 
 */
function getProjectsFromApiServer (request, appData, callback)
{
    var reqURL = null;
    var projectList = {"projects": []};

    var domain = request.param('domain');
    if ((null != domain) && (0 != domain.length)) {
        reqURL = '/projects?parent_fq_name_str=' + domain +
            '&parent_type=domain';
    } else {
        reqURL = '/projects';
    }
    configApiServer.apiGet(reqURL, appData, function(err, data) {
        if ((null != err) || (null == data) ||
            (null == data['projects'])) {
            callback(err, projectList);
            return;
        }
        callback(null, data);
    });
}

function getDomainsFromApiServer (appData, callback)
{
    var headers = {'noRedirectToLogout': true}
    /* This request is for login itself, it may happen we did not find the
     * region in cookie, or invalid cookie, so by default API Server plugin in
     * this scenario, redirects to logout page, but we should not do redirect in
     * this case
     */
    var domainsURL = '/domains';
    configApiServer.apiGet(domainsURL, appData, function(error, data) {
        if ((null != error) || (null == data)) {
            callback(error, null);
        } else {
            callback(error, data);
        }
    }, headers);
}

function getTenantListAndSyncDomain (request, appData, callback)
{
    var domain          = request.param('domain');
    var domainObjs      = {'domains':[]};
    var tmpDomainObjs   = {};
    var domArr          = [];
    authApi.getTenantList(request, appData, function(error, tenantList) {
        if ((null != error) || (null == tenantList) ||
            (null == tenantList['tenants'])) {
            callback(error, null, null, null);
            return;
        }
        var projCnt = tenantList['tenants'].length;
        for (var i = 0; i < projCnt; i++) {
            var domId = tenantList['tenants'][i]['domain_id'];
            if ((null != domId) && (false == authApi.isDefaultDomain(request, domId))) {
                domId =
                    commonUtils.convertUUIDToString(tenantList['tenants'][i]['domain_id']);
                if (null == tmpDomainObjs[domId]) {
                    tmpDomainObjs[domId] = domId;
                    if (false == authApi.isDefaultDomain(request, domId)) {
                        var domUrl = '/domain/' + domId;
                        commonUtils.createReqObj(domArr, domUrl,
                                                 global.HTTP_REQUEST_GET, null,
                                                 null, null, appData);
                    }
                }
            }
        }
        async.map(domArr,
                  commonUtils.getAPIServerResponse(configApiServer.apiGet,
                                                   true),
                  function(err, confData) {
            getDomainsFromApiServer(appData, function(err, domList) {
                if ((null != err) || (null == domList) || (null == domList['domains'])) {
                    /* We did not find any domain in API Server */
                    if ('v3' == request.session.authApiVersion) {
                        /* In v2, we have default-domain for all projects */
                        tenantList['tenants'] = [];
                    }
                    callback(null, domainObjs, tenantList, domList);
                    return;
                }
                tmpDomainObjs = {};
                for (var i = 0; i < projCnt; i++) {
                    var domId = tenantList['tenants'][i]['domain_id'];
                    if ((null != domId) &&
                        (false == authApi.isDefaultDomain(request, domId))) {
                        domId =
                            commonUtils.convertUUIDToString(tenantList['tenants'][i]['domain_id']);
                        var domFqn = authApi.getDomainNameByUUID(request, domId,
                                                        domList['domains']);
                        if (null == domFqn) {
                            if (null != request.cookies.domain) {
                                domFqn = request.cookies.domain;
                            } else {
                                domFqn = authApi.getDefaultDomain(request);
                            }
                        }
                        if ((null == tmpDomainObjs[domId]) && (null != domFqn)) {
                            domainObjs['domains'].push({'fq_name': [domFqn], 'uuid': domId});
                            tmpDomainObjs[domId] = domId;
                        }
                        if ((null != domain) && (domFqn != domain)) {
                            tenantList['tenants'].splice(i, 1);
                            i--;
                            projCnt--;
                        } else {
                            tenantList['tenants'][i]['domain_name'] = domFqn;
                        }
                    } else {
                        var defDomain = authApi.getDefaultDomain(request);
                        if (null == tmpDomainObjs[domId]) {
                            domainObjs['domains'].push({'fq_name': [defDomain], 'uuid': domId});
                            tmpDomainObjs[domId] = domId;
                        }
                        tenantList['tenants'][i]['domain_name'] = defDomain;
                    }
                }
                var allDomList = domList['domains'];
                var allDomCnt = allDomList.length;
                var domCnt = domainObjs['domains'].length;
                for (var i = 0; i < domCnt; i++) {
                    domFound = true;
                    for (var j = 0; j < allDomCnt; j++) {
                        if ((true == 
                             authApi.isDefaultDomain(request, domainObjs['domains'][i]['uuid'])) &&
                            (allDomList[j]['fq_name'][0] == "default-domain")) {
                            /* NOTE: API Server does have default-domain, keystone
                             * for v3 as default, So we need to send
                             * default-domain, else while creating VN and others
                             * it fails, as fqname ['default', 'XXX'] does not
                             * exist
                             */
                            if ((null != domain) && 
                                (domain != allDomList['uuid'])) {
                                domFound = false;
                                break;
                            }
                            domainObjs['domains'][i]['fq_name'] =
                                allDomList[j]['fq_name'];
                            domainObjs['domains'][i]['uuid'] =
                                allDomList[j]['uuid'];
                            break;
                        }
                        if (domainObjs['domains'][i]['uuid'] ==
                            allDomList[j]['uuid']) {
                            domainObjs['domains'][i]['fq_name'] =
                                allDomList[j]['fq_name'];
                            break;
                        }
                    }
                    if (false == domFound) {
                        continue;
                    }
                }
                callback(null, domainObjs, tenantList, domList);
            });
        });
    });
}

function getRoles (req, res, appData)
{
    var authApi = require('./auth.api');
    return authApi.getRoleList(req, function(error, roles){
        commonUtils.handleJSONResponse(error, res, roles);
    });
};

function getTokenIdByReqObj (req, project)
{
    var tokenObjs = req.session.tokenObjs;
    var tokenId =
        commonUtils.getValueByJsonPath(tokenObjs, project + ';token;id', null);
    if (null == tokenId) {
        var adminProjList = authApi.getAdminProjectList(req);
        if ((null != adminProjList) && (adminProjList.length > 0)) {
            for (project in tokenObjs) {
                if (-1 != adminProjList.indexOf(project)) {
                    tokenId =
                        commonUtils.getValueByJsonPath(tokenObjs[project],
                                                       'token;id', null);
                    break;
                }
            }
        }
    }
    if (null == tokenId) {
        for (var project in tokenObjs) {
            tokenId =
                commonUtils.getValueByJsonPath(tokenObjs[project],
                                               'token;id', null);
        }
    }
    return tokenId;
}

function getProjectTokenRole (userObj, callback)
{
    var projName = userObj.tenant;
    var req = userObj.req;
    var tokenObjs = req.session.tokenObjs;
    var userRoles = req.session.userRoles;

    if ((null != tokenObjs) && (null != tokenObjs[projName]) &&
        (null != userRoles) && (null != userRoles[projName])) {
        callback(null, {userObj: userObj});
        return;
    }
    authApi.getUIUserRoleByTenant(userObj, function(err, roles) {
        if ((null != err) || (null == roles)) {
            logutils.logger.debug('Failed to get token for project ' +
                                  projName + ", using last token");
            req.session.tokenObjs[projName] = req.session.last_token_obj_used;
        }
        callback(null, {data: roles, userObj: userObj});
    });
}

function getProjectGet (dataObj, callback)
{
    var uiRoles = null;
    var userObj = dataObj.userObj;
    var req     = userObj.req;
    var projId  = req.param('id');
    var project = req.param('project');
    var tokenid = userObj.tokenid;
    var appData = userObj.appData;
    var headers = {};

    var tokenObjs = req.session.tokenObjs;
    var syncedProj =
        commonUtils.getValueByJsonPath(req,
                                       'session;syncedProjects;' + projId +
                                       ';name', null);
    if (null != syncedProj) {
        callback(null, dataObj);
        return;
    }

    var tokenId = getTokenIdByReqObj(req, project);
    if (null != tokenId) {
        headers['X-Auth-Token'] = tokenId;
        try {
            headers['X_API_ROLE'] = req.session.userRoles[project].join(',');
        } catch(e) {
            headers['X_API_ROLE'] = null;
        }
    }
    var projUrl = '/project/' + projId + '?exclude_back_refs=true' +
        '&exclude_children=true';
    configApiServer.apiGet(projUrl, appData, function(error, data) {
        if ((null != error) || (null == data)) {
            logutils.logger.error('Project GET failed ' + req.param('id'));
            dataObj.uiRoles = uiRoles;
            callback(null, dataObj);
            return;
        }

        if (null == req.session.syncedProjects) {
            req.session.syncedProjects = {};
        }
        req.session.syncedProjects[projId] = {};
        req.session.syncedProjects[projId]['name'] = project;
        dataObj.uiRoles = uiRoles;
        callback(null, dataObj);
        return;
    }, headers);
}

function getProjectRole (req, res, appData)
{
    var uiRoles = null;
    var projId = req.param('id');
    var projName = req.param('project');
    var projUrl = '/project/' + projId + '?exclude_back_refs=true' +
        '&exclude_children=true';
    var authApi = require('./auth.api');
    var headers = {};
    var tokenId = null;

    var syncedProj =
        commonUtils.getValueByJsonPath(req,
                                       'session;syncedProjects;' + projId +
                                       ';name', null);
    var tokenObjs = req.session.tokenObjs;
    var userRoles = req.session.userRoles;

    if ((null != syncedProj) && (null != tokenObjs) &&
        (null != tokenObjs[projName]) && (null != userRoles) &&
        (null != userRoles[projName])) {
        commonUtils.handleJSONResponse(null, res, uiRoles);
        return;
    }

    tokenId = getTokenIdByReqObj(req, projName);
    if (global.ALL_PROJECT_UUID == projId) {
        /* 'all' project request, so do not do anything now */
        commonUtils.handleJSONResponse(null, res, uiRoles);
        return;
    }

    var userObj = {'tokenid': tokenId, 'tenant': projName, 'req': req,
                   'appData': appData};
    async.waterfall([
        async.apply(getProjectTokenRole, userObj),
        getProjectGet
    ],
    function(error, dataObj) {
        if (null != dataObj) {
            if (true == dataObj.redirectToLogout) {
                commonUtils.redirectToLogout(req, res);
                return;
            }
        }
        commonUtils.handleJSONResponse(null, res, uiRoles);
    });
}

exports.listProjectsAPIServer = listProjectsAPIServer;
exports.getProjectsFromApiServer = getProjectsFromApiServer;
exports.getTenantListAndSyncDomain = getTenantListAndSyncDomain;
exports.getDomainsFromApiServer = getDomainsFromApiServer;
exports.getProjectRole = getProjectRole;
exports.getRoles = getRoles;


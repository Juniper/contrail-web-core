/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var authApi = require('./auth.api');
var config = process.mainModule.exports.config;
var commonUtils = require('../utils/common.utils');
var async = require('async');
var configApiServer = require('./configServer.api');
var logutils = require('./../utils/log.utils');
var global = require('./../common/global');

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
    var domainsURL = '/domains';
    configApiServer.apiGet(domainsURL, appData, function(error, data) {
        if ((null != error) || (null == data)) {
            callback(error, null);
        } else {
            callback(error, data);
        }
    });
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

function getAllProjectRoles (req, res, appData)
{
    var uiRoles = null;
    var projObjList = [];
    authApi.getProjectList(req, appData, function(error, projList) {
        var projs = commonUtils.getValueByJsonPath(projList, 'projects', []);
        var projsCnt = projs.length;
        var syncedProjs =
            commonUtils.getValueByJsonPath(req, 'session;syncedProjects',
                                           {}, false);
        for (var i = 0; i < projsCnt; i++) {
            /* First check if we have any projects already in
             * req.session.syncedProjects, skip those
             */
            var projId = projs[i]['uuid'];
            if (null == syncedProjs[projId]) {
                projObjList.push({req: req, projId: projId,
                                  appData: appData, noProjectRole: true});
            }
        }
        if (!projObjList.length) {
            commonUtils.handleJSONResponse(null, res, uiRoles);
            return;
        }
        async.map(projObjList, getProjectRoleCB, function(error, data) {
            if ((null != error) || (null == data)) {
                commonUtils.handleJSONResponse(null, res, uiRoles);
                return;
            }
            var dataLen = data.length;
            for (var i = 0; i < dataLen; i++) {
                if (true == data[i]['redirectToLogout']) {
                    commonUtils.redirectToLogout(req, res);
                    return;
                }
            }
            commonUtils.handleJSONResponse(null, res, uiRoles);
        });
    });
}

function getProjectRole (req, res, appData)
{
    var projId = req.param('id');
    if (global.ALL_PROJECT_UUID == projId) {
        /* All project request, UUID can not be 'all' */
        getAllProjectRoles(req, res, appData);
        return;
    }
    var dataObj = {
        req: req,
        projId: projId,
        appData: appData
    };

    getProjectRoleCB(dataObj, function(error, response) {
        if (true == response['redirectToLogout']) {
            commonUtils.redirectToLogout(req, res);
            return;
        }
        commonUtils.handleJSONResponse(null, res, response['uiRoles']);
    });
}

function getProjectRoleCB (dataObj, callback)
{
    var req = dataObj['req'];
    var projId = dataObj['projId'];
    var appData = dataObj['appData'];
    var noProjectRole = dataObj['noProjectRole'];
    var redirectToLogout = true;

    var projUrl = '/project/' + projId + '?exclude_back_refs=true' +
        '&exclude_children=true';
    var authApi = require('./auth.api');
    var adminProjList = authApi.getAdminProjectList(req);
    var headers = {};
    var tokenId = null;

    var tokenObjs = req.session.tokenObjs;
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

    var syncedProj =
        commonUtils.getValueByJsonPath(req,
                                       'session;syncedProjects;' + projId +
                                       ';name', null);
    var uiRoles = null;
    if (null != syncedProj) {
        /* We do not do anything currently with role, so comment it, will enable
         * it when RBAC is supported in API Server
         */
        /*
        var userRoles = req.session.userRoles;
        uiRoles = [global.STR_ROLE_ADMIN];
        if (null != userRoles) {
            uiRoles = authApi.getUIRolesByExtRoles(req, userRoles[syncedProj]);
        }
        */
        if (true == noProjectRole) {
            callback(null, {uiRoles: uiRoles});
            return;
        }
        getUIUserRole(req, tokenId, syncedProj, callback);
        return;
    }
    if (null != tokenId) {
        headers['X-Auth-Token'] = tokenId;
        try {
            headers['X_API_ROLE'] = req.session.userRoles[project].join(',');
        } catch(e) {
            headers['X_API_ROLE'] = null;
        }
    }
    configApiServer.apiGet(projUrl, appData, function(error, data) {
        if ((null != error) || (null == data)) {
            logutils.logger.error('Project GET failed ' + req.param('id'));
            callback(null, {uiRoles: uiRoles});
            return;
        }
        var projName =
            commonUtils.getValueByJsonPath(data, 'project;name',
                                         null);
        if (null != projName) {
            if (null == req.session.syncedProjects) {
                req.session.syncedProjects = {};
            }
            req.session.syncedProjects[projId] = {};
            req.session.syncedProjects[projId]['name'] = projName;
        }
        if (true == noProjectRole) {
            /* For all project list, do not fetch the role information from
             * keystone here, that will be retrieved at individual project role
             * request
             */
            callback(null, {uiRoles: uiRoles});
            return;
        }
        getUIUserRole(req, tokenId, projName, callback)
    }, headers);
}

function getUIUserRole (req, tokenId, projName, callback)
{
    var uiRoles = null;
    var userRoles = req.session.userRoles;
    var tokenObjs = req.session.tokenObjs;
    if ((null != tokenObjs) && (null != tokenObjs[projName]) &&
        (null != userRoles) && (null != userRoles[projName])) {
        //var uiRoles = authApi.getUIRolesByExtRoles(req, userRoles[projName]);
        /* We got, no need to deduce uiRoles now, will do once RBAC is
         * supported */
        callback(null, {uiRoles: uiRoles});
        return;
    }
    var userObj = {'tokenid': tokenId, 'tenant': projName, 'req': req};
    authApi.getUIUserRoleByTenant(userObj, function(err, roles) {
    if ((null != err) || (null == roles)) {
            logutils.logger.error('Did not find the roles for project ' +
                                  projName);
            callback(null, {uiRoles: uiRoles, redirectToLogout: true});
            return;
        }
        callback(null, {uiRoles: uiRoles});
    });
}

exports.listProjectsAPIServer = listProjectsAPIServer;
exports.getProjectsFromApiServer = getProjectsFromApiServer;
exports.getTenantListAndSyncDomain = getTenantListAndSyncDomain;
exports.getDomainsFromApiServer = getDomainsFromApiServer;
exports.getProjectRole = getProjectRole;


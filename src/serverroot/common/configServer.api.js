/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * This file contains the wrapper functions for Config API Server
 */

var global = require('./global');
var assert = require('assert');
var config = process.mainModule.exports.config;
var plugins = require('../orchestration/plugins/plugins.api');
var commonUtils = require('../utils/common.utils');

function getApiServerRequestedByData (appData, reqBy)
{
    return plugins.getApiServerRequestedByData(appData, reqBy);
}

function apiGet (url, appData, callback, appHeaders)
{
    var service = getApiServerRequestedByData(appData, global.label.API_SERVER);
    service.apiGet(url, appData, function(err, data) {
        callback(err, data);
    }, appHeaders);
}

function apiPut (url, putData, appData, callback, appHeaders)
{
    var service = getApiServerRequestedByData(appData, global.label.API_SERVER);
    service.apiPut(url, putData, appData, function(err, data) {
        callback(err, data);
    }, appHeaders);
}


function apiPost (url, postData, appData, callback, appHeaders)
{
    var service = getApiServerRequestedByData(appData, global.label.API_SERVER);
    service.apiPost(url, postData, appData, function(err, data) {
        callback(err, data);
    }, appHeaders);
}

function apiDelete (url, appData, callback, appHeaders)
{
    var service = getApiServerRequestedByData(appData, global.label.API_SERVER);
    service.apiDelete(url, appData, function(err, data) {
        callback(err, data);
    }, appHeaders);
}

function getDefProjectByAppData (appData)
{
    return commonUtils.getValueByJsonPath(appData,
                         'authObj;req;cookies;project',
                         commonUtils.getValueByJsonPath(appData,
                                 'authObj;defTokenObj;tenant;name',
                                 null));
}

function getAuthTokenByProject (req, defTokenObj, project)
{
    var defProject =
        commonUtils.getValueByJsonPath(defTokenObj, 'tenant;name', null);
    var defToken = commonUtils.getValueByJsonPath(defTokenObj, 'id', null);
    var requestedToken =
        commonUtils.getValueByJsonPath(req,'session;tokenObjs;' + project +
                ';token;id', null);
    if (null != requestedToken) {
        return {'project': project, 'token': requestedToken};
    }
    return {'project': defProject, 'token': defToken};
}

function configAppHeaders (headers, appData)
{
    var defProject = getDefProjectByAppData(appData);
    var multiTenancyEnabled = commonUtils.isMultiTenancyEnabled();
    var xAuthTokenObj =
        getAuthTokenByProject(commonUtils.getValueByJsonPath(appData, 'authObj;req',
                                                             null,false),
                              commonUtils.getValueByJsonPath(appData,
                                                             'authObj;defTokenObj',
                                                             null),
                              defProject);
    headers['X-Auth-Token'] = xAuthTokenObj['token'];
    if (true == multiTenancyEnabled) {
        var userRole = commonUtils.getValueByJsonPath(appData,
                'authObj;req;session;userRoles;' + xAuthTokenObj['project'], null);
        headers['X_API_ROLE'] = (null != userRole)? userRole.join(',') : null;
    }
    return headers;
}

exports.apiGet = apiGet;
exports.apiPut = apiPut;
exports.apiPost = apiPost;
exports.apiDelete = apiDelete;
exports.getDefProjectByAppData = getDefProjectByAppData;
exports.getAuthTokenByProject = getAuthTokenByProject;
exports.configAppHeaders = configAppHeaders;



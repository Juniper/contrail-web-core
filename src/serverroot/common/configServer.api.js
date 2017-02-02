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
var async = require("async");

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

function apiRequest (reqUrl, reqData, appData, reqType, callback, appHeaders,
                     stopRetry, apiRequestCB, serveAPIRequest)
{
    var req = commonUtils.getValueByJsonPath(appData, "authObj;req", null,
                                             false);
    var regionCookie = commonUtils.getValueByJsonPath(req, "cookies;region",
                                                   null, false);
    if ((null == regionCookie) || (global.REGION_ALL != regionCookie)) {
        serveAPIRequest(reqUrl, reqData, appData, appHeaders, reqType, callback);
        return;
    }
    var regions = commonUtils.getValueByJsonPath(req, "session;regionList",
                                                 null, false);
    var apiObjArr = [];
    var regionsCnt = regions.length;
    if (regionsCnt > 0) {
        if (null == appData.authObj) {
            appData.authObj = {};
        }
    }
    var req = appData.authObj.req;
    for (var i = 0; i < regionsCnt; i++) {
        var newAppData = {};
        appData.authObj.reqRegion = regions[i];
        delete appData.authObj.req;
        delete appData.req;
        newAppData = commonUtils.cloneObj(appData);
        newAppData.authObj.req = req;
        newAppData.req = req;
        apiObjArr.push({reqUrl: reqUrl, reqData: reqData, appData: newAppData,
                       callback: callback, appHeaders: appHeaders,
                       reqType: reqType, stopRetry: stopRetry});
    }
    appData.authObj.req = req;
    appData.req = req;
    async.map(apiObjArr, apiRequestCB, function(error, data) {
        if (null == data) {
            callback(error, data);
            return;
        }
        var responseData = {};
        for (i = 0; i < regionsCnt; i++) {
            responseData[regions[i]] = data[i].data;
            if (null != data[i].error) {
                error = data[i].error;
            }
        }
        callback(error, responseData);
    });
}

exports.apiGet = apiGet;
exports.apiPut = apiPut;
exports.apiPost = apiPost;
exports.apiDelete = apiDelete;
exports.getDefProjectByAppData = getDefProjectByAppData;
exports.getAuthTokenByProject = getAuthTokenByProject;
exports.configAppHeaders = configAppHeaders;
exports.apiRequest = apiRequest;


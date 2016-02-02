/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var rest = require('../../common/rest.api'),
    config = process.mainModule.exports.config,
    authApi = require('../../common/auth.api'),
    commonUtils = require('../../utils/common.utils'),
    configServer,
    configApiServer = require(process.mainModule.exports["corePath"] +
    '/src/serverroot/common/configServer.api');

configServer = rest.getAPIServer({apiName: global.label.VNCONFIG_API_SERVER,
                                 server: config.cnfg.server_ip, port:
                                 config.cnfg.server_port });

function getHeaders(defHeaders, appHeaders)
{
    var headers = defHeaders;
    for (key in appHeaders) {
        /* App Header overrides default header */
        headers[key] = appHeaders[key];
    }
    return headers;
}

function apiGet (reqUrl, appData, callback, appHeaders, stopRetry)
{
    var defProject = null;
    var headers = {};
    var multiTenancyEnabled = commonUtils.isMultiTenancyEnabled();

    var defProject = configApiServer.getDefProjectByAppData(appData);
    headers = configApiServer.configAppHeaders(headers, appData);
    headers = getHeaders(headers, appHeaders);
    configServer.api.get(reqUrl, function(err, data) {
        if (err) {
            if (global.HTTP_STATUS_AUTHORIZATION_FAILURE ==
                err.responseCode) {
                if (true == multiTenancyEnabled) {
                    commonUtils.redirectToLogoutByAppData(appData);
                    return;
                }
            }
            callback(err, data);
        } else {
            callback(null, data);
        }
    }, headers);
}

function apiPut (reqUrl, reqData, appData, callback, appHeaders, stopRetry)
{
    var defProject = null;
    var headers = {}; 
    var multiTenancyEnabled = commonUtils.isMultiTenancyEnabled();

    var defProject = configApiServer.getDefProjectByAppData(appData);
    headers = configApiServer.configAppHeaders(headers, appData);
    headers = getHeaders(headers, appHeaders);

    configServer.api.put(reqUrl, reqData, function(err, data) {
        if (err) {
            if (global.HTTP_STATUS_AUTHORIZATION_FAILURE ==
                err.responseCode) {
                if (true == multiTenancyEnabled) {
                    commonUtils.redirectToLogoutByAppData(appData);
                    return;
                }
            }
            callback(err, data);
        } else {
            callback(null, data);
        }
    }, headers);
}

function apiPost (reqUrl, reqData, appData, callback, appHeaders, stopRetry)
{
    var defProject = null;
    var headers = {}; 
    var multiTenancyEnabled = commonUtils.isMultiTenancyEnabled();

    var defProject = configApiServer.getDefProjectByAppData(appData);
    headers = configApiServer.configAppHeaders(headers, appData);
    headers = getHeaders(headers, appHeaders);

    configServer.api.post(reqUrl, reqData, function(err, data) {
        if (err) {
            if (global.HTTP_STATUS_AUTHORIZATION_FAILURE ==
                err.responseCode) {
                if (true == multiTenancyEnabled) {
                    commonUtils.redirectToLogoutByAppData(appData);
                    return;
                }
            }
            callback(err, data);
        } else {
            callback(null, data);
        }
    }, headers);
}

function apiDelete (reqUrl, appData, callback, appHeaders, stopRetry)
{
    var defProject = null;
    var headers = {}; 
    var multiTenancyEnabled = commonUtils.isMultiTenancyEnabled();

    var defProject = configApiServer.getDefProjectByAppData(appData);
    headers = configApiServer.configAppHeaders(headers, appData);
    headers = getHeaders(headers, appHeaders);

    configServer.api.delete(reqUrl, function(err, data) {
        if (err) {
            if (global.HTTP_STATUS_AUTHORIZATION_FAILURE ==
                err.responseCode) {
                if (true == multiTenancyEnabled) {
                    commonUtils.redirectToLogoutByAppData(appData);
                    return;
                }
            }
            callback(err, data);
        } else {
            callback(null, data);
        }
    }, headers);
}

exports.apiGet = apiGet;
exports.apiPut = apiPut;
exports.apiPost = apiPost;
exports.apiDelete = apiDelete;


/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

/**
  * @proxy.helper.js
  *     - Helper functions for Proxy API
  */

var discoveryClientApi = require('./discoveryclient.api');
var redisUtils  = require('../utils/redis.utils');
var commonUtils = require('../utils/common.utils');
var config      = process.mainModule.exports.config;
var global      = require('./global');
var authApi     = require("./auth.api");

var redisProxyClient = null;
var opApiServerKeyList = [global.label.API_SERVER, global.label.OPSERVER,
    global.label.OPS_API_SERVER, global.label.VNCONFIG_API_SERVER];

function getAllowedProxyPortList ()
{
    var proxyObj = commonUtils.getValueByJsonPath(config, "proxy", {});
    var portList = [];

    for (var nodeTypeKey in proxyObj) {
        portList = portList.concat(proxyObj[nodeTypeKey]);
    }
    return portList;
}

function getNodesHostIPFromRedis (callback)
{
    var hash = 'node-hash';
    if (null == redisProxyClient) {
        redisUtils.createDefRedisClientAndWait(function(redisClient) {
            redisProxyClient = redisClient;
            redisProxyClient.hgetall(hash, function(err, data) {
                callback(err, data);
            });
        });
    } else {
        redisProxyClient.hgetall(hash, function(err, data) {
            callback(err, data);
        });
    }
}

function isKeyOpOrApiServer (key)
{
    return (-1 != opApiServerKeyList.indexOf(key));
}

function validateProxyIpPort (request, proxyHost, proxyPort, callback)
{
    var found = false;
    var apiServerPort = null;
    var errStr = 'Hostname not found in restricted list, you can visit ' +
         'dashboard page and come back here';

    var addAuthInfo = false;
    if (authApi.isValidUrlWithXAuthToken(request.url, request)) {
        /* In this case, just check if introspect name is listed in
         * allowed_introspect_list_access_by_token
         */
        var allowedIntrospectList =
            commonUtils.getValueByJsonPath(config,
                                           "proxy;allowed_introspect_list_access_by_token",
                                           []);
        var allowedIntrospectListLen = allowedIntrospectList.length;
        for (var i = 0; i < allowedIntrospectListLen; i++) {
            if (request.url.indexOf(allowedIntrospectList[i]) > -1) {
                break;
            }
        }
        if (i == allowedIntrospectListLen) {
            errStr = 'Introspect name is not in allowed list to get ' +
                'access using token';
            callback(errStr);
            return;
        }
        var portList = getAllowedProxyPortList();
        if (portList.indexOf(proxyPort) > -1) {
            callback(null);
            return;
        }
        errStr = "Port is not in allowed list to get access using token";
        callback(errStr);
        return;
    }
    getNodesHostIPFromRedis(function(err, data) {
        if ((null != err) || (null == data)) {
            callback(errStr);
            return;
        }
        for (key in data) {
            var hostsIps = JSON.parse(data[key]);
            var hosts = hostsIps['hosts'];
            for (node in hosts) {
                if (proxyHost == node) {
                    if (-1 != hosts[node].indexOf(proxyPort)) {
                        if (true == isKeyOpOrApiServer(key)) {
                            addAuthInfo = true;
                        }
                        found = true;
                        break;
                    }
                }
            }
            var ips = hostsIps['ips'];
            for (ip in ips) {
                if (proxyHost == ip) {
                    if (-1 != ips[ip].indexOf(proxyPort)) {
                        found = true;
                        if (true == isKeyOpOrApiServer(key)) {
                            addAuthInfo = true;
                        }
                        break;
                    }
                }
            }
        }
        if (true == found) {
            callback(null, {addAuthInfo: addAuthInfo});
            return;
        }
        /*
         * If still we are not able to match it could be a ApiServer/OpServer
         * Try to get the details from the discovery and match
         */
        if (true == isOpOrApiServer(request, proxyHost, proxyPort)) {
            callback(null, {addAuthInfo: true});
            return;
        }
        callback(errStr);
    });
}

function isOpOrApiServer (request, proxyHost, proxyPort)
{
    var isApiServer =
        isServerByType(global.DEFAULT_CONTRAIL_API_IDENTIFIER, proxyHost,
                       proxyPort);
    var isOpServer =
        isServerByType(global.DEFAULT_CONTRAIL_ANALYTICS_IDENTIFIER, proxyHost,
                       proxyPort);
    return (isApiServer || isOpServer);
}

function isServerByType (serverType, proxyHost, proxyPort)
{
    var isDiscEnabled =
        commonUtils.getValueByJsonPath(config, 'discoveryService;enable', true);
    if (true == isDiscEnabled) {
        var discServList = discoveryClientApi.getServiceRespDataList();
        var servers =
            commonUtils.getValueByJsonPath(discServList,
                                           serverType + ';data;' + serverType,
                                           []);
        var cnt = servers.length;
        for (var i = 0; i < cnt; i++) {
            var server = servers[i];
            var pubId =
                commonUtils.getValueByJsonPath(server, '@publisher-id', null);
            var ipAddr =
                commonUtils.getValueByJsonPath(server, 'ip-address', null);
            var portByDisc = commonUtils.getValueByJsonPath(server, 'port',
                                                            null);
            if (((pubId == proxyHost) || (ipAddr == proxyHost)) &&
                (portByDisc == proxyPort)) {
                return true;
            }
        }
    } else { //If not found from discovery fetch from the config and try to match
        var key;
        switch (serverType) {
        case global.DEFAULT_CONTRAIL_API_IDENTIFIER:
            key = 'cnfg';
            break;
        case global.DEFAULT_CONTRAIL_ANALYTICS_IDENTIFIER:
            key = 'analytics';
            break;
        default:
            key = null;
        }
        serverPort =
            commonUtils.getValueByJsonPath(config, key + ';server_port', null);
        var serverIp =
            commonUtils.getValueByJsonPath(config, key + ';server_ip', null);
        if ((serverIp == proxyHost) && (serverPort == proxyPort)) {
            return true;
        }
    }
    return false;
}

exports.validateProxyIpPort = validateProxyIpPort;

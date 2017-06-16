/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

/**
  * @proxy.helper.js
  *     - Helper functions for Proxy API
  */

var contrailService = require('./contrailservice.api');
var redisUtils  = require('../utils/redis.utils');
var commonUtils = require('../utils/common.utils');
var configUtils = require('./config.utils');
var global      = require('./global');
var authApi     = require("./auth.api");

var redisProxyClient = null;
var opApiServerKeyList = [global.label.API_SERVER, global.label.OPSERVER,
    global.label.OPS_API_SERVER, global.label.VNCONFIG_API_SERVER];

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
     errStr = 'Hostname not found in restricted list, you can visit ' +
         'dashboard page and come back here';

    var addAuthInfo = false;
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
    var contrailServList = contrailService.getActiveServiceRespDataList();
    var servers =
        commonUtils.getValueByJsonPath(contrailServList,
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
    return false;
}

function getSSLOptionsIntrospectPort (req, port)
{
    var found = false;
    var sslOptions = null;
    var config = configUtils.getConfig();
    var introspectSSLOptions =
        commonUtils.getValueByJsonPath(config, "introspect;ssl", null);
    var isIntrospectSSLEnabled =
        commonUtils.getValueByJsonPath(introspectSSLOptions, "enabled", false);
    if (true == isIntrospectSSLEnabled) {
        /* Check if the port is introspect port */
        /* TODO: If UVE sends the introspect port, then consider that also along
         * with config file
         */
        for (var key in config.proxy) {
            var portListObjs = config.proxy[key];
            var portList = [];
            var introspectPorts =
                commonUtils.getValueByJsonPath(portListObjs, "introspect", []);
            portList = _.values(introspectPorts);
            if (portList.indexOf(port) > -1) {
                found = true;
                break;
            }
            if (true == found) {
                break;
            }
        }
        if (true == found) {
            sslOptions = commonUtils.getValueByJsonPath(config, "introspect;ssl",
                                                        null);
            if (null != sslOptions) {
                sslOptions.authProtocol = (true == sslOptions.enabled) ?
                    global.PROTOCOL_HTTPS : global.PROTOCOL_HTTP;
                return sslOptions;
            }
            return sslOptions;
        }
    }
    return null;
}

function getSSLOptionsByProxyPort (req, port)
{
    var sslOptions = null;
    var config = configUtils.getConfig();
    port = port.toString();
    var isSvcEndPtsFromConfig = authApi.isOrchEndptFromConfig();
    var sslOptions = getSSLOptionsIntrospectPort(req, port);
    if (null != sslOptions) {
        /* Introspect Port */
        return sslOptions;
    }
    /* Now check for ports other than introspect */
    if (true == isSvcEndPtsFromConfig) {
        for (var key in config) {
            var entity = config[key];
            var ports =
                commonUtils.getValueByJsonPath(entity, "port",
                                               commonUtils.getValueByJsonPath(entity,
                                                                              "server_port",
                                                                              null));
            if (null == ports) {
                continue;
            }
            if (ports instanceof Array) {
                if (ports.indexOf(port) > -1) {
                    return entity;
                }
            } else if (ports == port) {
                return entity;
            }
        }
    } else {
        var portToProcessMap = authApi.getPortToProcessMapByReqObj(req);
        if (null != portToProcessMap) {
            return
                authApi.getConfigEntityByServiceEndpoint(req, portToProcessMap[port]);
        }
    }
    return null;
}

exports.validateProxyIpPort = validateProxyIpPort;
exports.getSSLOptionsByProxyPort = getSSLOptionsByProxyPort;


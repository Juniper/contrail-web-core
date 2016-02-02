/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
  * @proxy.api.js
  *     - Very basic forward proxy implementation for Contrail WebUI
  */
var url         = require('url');
var http        = require('http');
var https       = require('https');
var config      = process.mainModule.exports.config;
var logutils    = require('../utils/log.utils');
var appErrors   = require('../errors/app.errors');
var util        = require('util');
var messages    = require('./messages');
var async       = require('async');
var commonUtils = require('../utils/common.utils');
var opApiServer = require('./opServer.api');
var jsonPath    = require('JSONPath').eval;
var _           = require('underscore');
var redisUtils  = require('../utils/redis.utils');
var configApiServer = require(process.mainModule.exports["corePath"] +
                        '/src/serverroot/common/configServer.api');

var nodeList     = {'hosts': {}, 'ips': {}};
var timeOutId    = null;
var proxyURLStr  = 'proxyURL';
var protocolList = ['http:', 'https:'];
/* Default allowed proxy ports per node */
var defVirtualRouterPorts   = [
    '8085', /* HttpPortAgent */
    '8102', /* HttpPortVRouterNodemgr */
];
var defControlNodePorts     = [
    '8083', /* HttpPortControl */
    '8092', /* HttpPortDns */
    '8101', /* HttpPortControlNodemgr */
]
var defAnalyticsNodePorts   = [
    '8081', /* OpServerPort */
    '8089', /* HttpPortCollector */
    '8090', /* HttpPortOpserver */
    '8091', /* HttpPortQueryEngine */
    '8104', /* HttpPortAnalyticsNodemgr */
];
var defConfigNodePorts      = [
    '5998', /* DiscoveryServerPort */
    '8082', /* ApiServerPort */
    '8084', /* HttpPortApiServer */
    '8087', /* HttpPortSchemaTransformer */
    '8088', /* HttpPortSvcMonitor */
    '8096', /* HttpPortDeviceManager */
    '8100', /* HttpPortConfigNodemgr */
];

var apiServerPort = '8082'

function getAllowedProxyPortListByNodeType (nodeType)
{
    if (global.label.VROUTER == nodeType) {
        nodePortsLabel = 'vrouter_node_ports';
        defPorts = defVirtualRouterPorts;
    } else if (global.label.CONTROL_NODE == nodeType) {
        nodePortsLabel = 'control_node_ports';
        defPorts = defControlNodePorts;
    } else if (global.label.OPS_API_SERVER == nodeType) {
        nodePortsLabel = 'analytics_node_ports';
        defPorts = defAnalyticsNodePorts;
    } else if (global.label.API_SERVER == nodeType) {
        nodePortsLabel = 'config_node_ports';
        defPorts = defConfigNodePorts;
    }
    return ((null != config.proxy) &&
            (null != config.proxy[nodePortsLabel]) &&
            (config.proxy[nodePortsLabel].length > 0)) ?
            config.proxy[nodePortsLabel] : defPorts;
}

function sendProxyRequest (request, response, appData, options)
{
    var reqParams = options.query;
    var proxyURL = reqParams.proxyURL;
    var isConfigPort = false;  
    var isIndexedPage = (null != reqParams['indexPage']) ? true : false;
    logutils.logger.debug("Proxy Forwarder: Original: " + request.url +
                          " Forwarded TO: " + JSON.stringify(options));
    var protocol = ((options.protocol == 'http:') ? http : https);
    if(null != options.port) {
        isConfigPort = (options.port.indexOf(apiServerPort) != -1)? true: false;
    }
    var rqst = protocol.request(options, function(res) {
        var body = '';
        res.on('end', function() {
            if (true == isIndexedPage) {
                /* Before sending the response back, modify the href */
                body =
                    body.replace(/a href="/g, 'a href="proxy?proxyURL=' +
                                 reqParams[proxyURLStr] + '/');
            } else if (true == isConfigPort) {
                /* ApiServerPort needs to be handled differently */
                body = body.replace(/"href": "/g, '"href":"' + request.protocol 
                        +'://'+ request.headers.host +'/proxy?proxyURL=');
            }
            response.end(body);
        });
        res.on('data', function(chunk) {
            body += chunk;
        });
    }).on('error', function(err) {
          logutils.logger.error(err.stack);
          var error =
            new appErrors.ConnectionError(util.format(messages.error.api_conn,
                                                      options.hostname + ':' +
                                                      options.port));
          response.send(global.HTTP_STATUS_INTERNAL_ERROR, error.message);
    });
    rqst.end();
}

function validateProxyIpPort (proxyHost, proxyPort, callback)
{
     errStr = 'Hostname not found in restricted list, you can visit ' +
         'dashboard page and come back here';

    getNodesHostIPFromRedis(function(err, data) {
        if ((null != err) || (null == data)) {
            callback(errStr);
            return;
        }
        for (key in data) {
            var hostsIps = JSON.parse(data[key]);
            var hosts = hostsIps['hosts'];
            for (key in hosts) {
                if (proxyHost == key) {
                    if (-1 != hosts[key].indexOf(proxyPort)) {
                        callback(null);
                        return;
                    }
                }
            }
            var ips = hostsIps['ips'];
            for (key in ips) {
                if (proxyHost == key) {
                    if (-1 != ips[key].indexOf(proxyPort)) {
                        callback(null);
                        return;
                    }
                }
            }
        }
        callback(errStr);
    });
}

function forwardProxyRequest (request, response, appData)
{
    var index = 0;
    var options = url.parse(request.url, true);
    var reqParams = options.query;
    var errStr = null;

    var isProxyEnabled =
        ((null != config.proxy) && (null != config.proxy.enabled)) ?
        config.proxy.enabled : true;
    if (false == isProxyEnabled) {
        var error = new appErrors.RESTServerError('Proxy is disabled');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if ((null == reqParams) || (null == reqParams[proxyURLStr])) {
        var error = new appErrors.RESTServerError('proxyURL parameter not ' +
                                                  'found in forward proxy ' +
                                                  'request');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (0 == reqParams[proxyURLStr].length) {
        /* Sanity Check */
        response.statusCode = global.HTTP_STATUS_INTERNAL_ERROR;
        response.write("Error: empty proxyURL provided");
        response.end();
        return;
    }
    var pathStr = '';
    var proxy = url.parse(reqParams[proxyURLStr], true);
    for (key in reqParams) {
        if (proxyURLStr == key) {
            continue;
        }
        if (index == 0) {
            pathStr += '?';
        } else {
            pathStr += '&';
        }
        pathStr += key + '=' + reqParams[key];
        index++;
    }
    options.headers = {
        accept: '*/*',
        'content-length': 0
    };
    options.headers = configApiServer.configAppHeaders(options.headers, appData);
    options.path = proxy.path + pathStr;
    options.hostname = proxy.hostname;
    options.port = proxy.port;
    options.protocol = proxy.protocol;
    if (null == options.port) {
        errStr = 'Port not provided in proxy URL';
    }
    if (null == options.hostname) {
        errStr = 'hostname not provided in proxy URL';
    }
    if (-1 == protocolList.indexOf(options.protocol)) {
        errStr = 'Protocol not provided - provide http/https in proxy URL';
    }
    if (null != errStr) {
        response.send(global.HTTP_STATUS_INTERNAL_ERROR, errStr);
        return;
    }

    validateProxyIpPort(options.hostname, options.port, function(errStr) {
        if (null != errStr) {
            response.send(global.HTTP_STATUS_INTERNAL_ERROR, errStr);
            return;
        }
        sendProxyRequest(request, response, appData, options);
    });
}

var redisProxyClient = null;

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

exports.forwardProxyRequest = forwardProxyRequest;
exports.getAllowedProxyPortListByNodeType = getAllowedProxyPortListByNodeType;


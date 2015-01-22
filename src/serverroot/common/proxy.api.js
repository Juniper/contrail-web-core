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
function getNodeList ()
{
    return nodeList;
}

function mergeAllowedPortListPerNode (nodeUveData, nodeType)
{
    if ((null == nodeUveData) || (null == nodeUveData['value'])) {
        return;
    }
    nodeUveData = nodeUveData['value'];
    var nodeCnt = nodeUveData.length;
    var nodePortsLabel = null;
    var defPorts = null;
    var ipListLabel = null;
    if (global.label.VROUTER == nodeType) {
        ipListLabel = 'self_ip_list';
        nodePortsLabel = 'vrouter_node_ports';
        defPorts = defVirtualRouterPorts;
    } else if (global.label.CONTROL_NODE == nodeType) {
        ipListLabel = 'bgp_router_ip_list';
        nodePortsLabel = 'control_node_ports';
        defPorts = defControlNodePorts;
    } else if (global.label.OPS_API_SERVER == nodeType) {
        ipListLabel = 'self_ip_list';
        nodePortsLabel = 'analytics_node_ports';
        defPorts = defAnalyticsNodePorts;
    } else if (global.label.API_SERVER == nodeType) {
        ipListLabel = 'config_node_ip';
        nodePortsLabel = 'config_node_ports';
        defPorts = defConfigNodePorts;
    }
    var nodePortList =
        ((null != config.proxy) &&
         (null != config.proxy[nodePortsLabel]) &&
         (config.proxy[nodePortsLabel].length > 0)) ?
        config.proxy[nodePortsLabel] : defPorts;
    for (var i = 0; i < nodeCnt; i++) {
        if (null == nodeList['hosts'][nodeUveData[i]['name']]) {
            nodeList['hosts'][nodeUveData[i]['name']] = [];
        }
        nodeList['hosts'][nodeUveData[i]['name']] =
            nodeList['hosts'][nodeUveData[i]['name']].concat(nodePortList);
        var ipList = jsonPath(nodeUveData[i], "$.." + ipListLabel);
        ipList = ipList[0];
        if (null == ipList) {
            continue;
        }
        var ipCnt = ipList.length;
        if (ipCnt > 0) {
            for (var j = 0; j < ipCnt; j++) {
                if (null == nodeList['ips'][ipList[j]]) {
                    nodeList['ips'][ipList[j]] = [];
                }
                nodeList['ips'][ipList[j]] =
                    nodeList['ips'][ipList[j]].concat(nodePortList);
            }
        }
    }
    /* Now get the unique entries in hosts and ips */
    for (key in nodeList['hosts']) {
        nodeList['hosts'][key] = _.uniq(nodeList['hosts'][key]);
    }
    for (key in nodeList['ips']) {
        nodeList['ips'][key] = _.uniq(nodeList['ips'][key]);
    }
}

function getAllNodeList (callback)
{
    var appData     = null;
    var dataObjArr  = [];
    var postData    = {};
    var reqUrl      = null;

    var vrReqUrl      = '/analytics/uves/vrouter';
    var vrPostData = {};
    vrPostData['cfilt'] = ['VrouterAgent:self_ip_list'];
    commonUtils.createReqObj(dataObjArr, vrReqUrl, global.HTTP_REQUEST_POST,
                             vrPostData, opApiServer, null, appData);
    var cnReqUrl      = '/analytics/uves/control-node';
    var cnPostData = {};
    cnPostData['cfilt'] = ['BgpRouterState:bgp_router_ip_list'];
    commonUtils.createReqObj(dataObjArr, cnReqUrl, global.HTTP_REQUEST_POST,
                             cnPostData, opApiServer, null, appData);
    var anReqUrl      = '/analytics/uves/analytics-node';
    var anPostData = {};
    anPostData['cfilt'] = ['CollectorState:self_ip_lists'];
    commonUtils.createReqObj(dataObjArr, anReqUrl, global.HTTP_REQUEST_POST,
                             anPostData, opApiServer, null, appData);
    var cfgReqUrl      = '/analytics/uves/config-node';
    var cfgPostData = {};
    cfgPostData['cfilt'] = ['ModuleCpuState:config_node_ip'];
    commonUtils.createReqObj(dataObjArr, cfgReqUrl, global.HTTP_REQUEST_POST,
                             cfgPostData, opApiServer, null, appData);
    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(opApiServer, true),
              function(err, results) {
        mergeAllowedPortListPerNode(results[0], global.label.VROUTER);
        mergeAllowedPortListPerNode(results[1], global.label.CONTROL_NODE);
        mergeAllowedPortListPerNode(results[2], global.label.OPS_API_SERVER);
        mergeAllowedPortListPerNode(results[3], global.label.API_SERVER);
        callback(nodeList);
    });
}

function startTimerToUpdateNodeList ()
{
    if (null != timeOutId) {
        clearTimeout(timeOutId);
    }
    timeOutId = setTimeout(function() {
        getAllNodeList(function(nodes) {
            clearTimeout(timeOutId);
            startTimerToUpdateNodeList();
        });
    }, 5 * 60 * 1000); /* 5 minutes timer */
}

function updateNodeListAndTriggerTimer (callback)
{
    getAllNodeList(function(nodes) {
        startTimerToUpdateNodeList();
        if (null != callback) {
            callback(nodes);
        }
    });
}

function sendProxyRequest (request, response, appData, nodes, options)
{
    var errStr = null;
    /* Now check if the port is allowed */
    if ((null != nodes['hosts'][options.hostname]) &&
        (-1 == (nodes['hosts'][options.hostname]).indexOf(options.port))) {
        errStr = 'port is not in allowed list';
    } else if ((null != nodes['ips'][options.hostname]) &&
               (-1 == ((nodes['ips'][options.hostname]).indexOf(options.port)))) {
        errStr = 'port is not in allowed list';
    }
    if (null != errStr) {
        response.send(global.HTTP_STATUS_INTERNAL_ERROR, errStr);
        return;
    }

    var reqParams = options.query;
    var isIndexedPage = (null != reqParams['indexPage']) ? true : false;
    logutils.logger.debug("Proxy Forwarder: Original: " + request.url +
                          " Forwarded TO: " + JSON.stringify(options));
    var protocol = ((options.protocol == 'http:') ? http : https);
    var rqst = protocol.request(options, function(res) {
        var body = '';
        res.on('end', function() {
            if (true == isIndexedPage) {
                /* Before sending the response back, modify the href */
                body =
                    body.replace(/a href="/g, 'a href="proxy?proxyURL=' +
                                 reqParams[proxyURLStr] + '/');
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

function forwardProxyRequest (request, response, appData)
{
    var index = 0;
    var options = url.parse(request.url, true);
    var reqParams = options.query;
    var errStr = null;

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

    if (null != config.proxy) {
    }
    var nodes = getNodeList();
    if ((null == nodes['hosts'][options.hostname]) &&
        (null == nodes['ips'][options.hostname])) {
        /* Reissue once again the update node list request, it may happen after
         * the last update timer fire, a new node has come up
         */
        updateNodeListAndTriggerTimer(function(nodes) {
            if ((null == nodes['hosts'][options.hostname]) &&
                (null == nodes['ips'][options.hostname])) {
                errStr = 'hostname is not in allowed list';
                response.send(global.HTTP_STATUS_INTERNAL_ERROR, errStr);
                return;
            } else {
                sendProxyRequest(request, response, appData, nodes, options);
            }
        });
    } else {
        sendProxyRequest(request, response, appData, nodes, options)
    }
}

exports.forwardProxyRequest = forwardProxyRequest;
exports.getNodeList = getNodeList;
exports.updateNodeListAndTriggerTimer = updateNodeListAndTriggerTimer;


/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * This file contains the wrapper function for network manager 
 */

var config = process.mainModule.exports['config'];
var orch = require('../orchestration/orchestration.api');

var orchModels = orch.getOrchestrationModels();

var openstackNetworkApi = require('../orchestration/plugins/openstack/glance.api');
var cloudstackNetworkApi  =
    require('../orchestration/plugins/cloudstack/cloudstack.api');
var noOrchestrationNetworkApi  =
    require('../orchestration/plugins/no-orch/noOrchestration.api');
var vCenterNetworkApi =
    require('../orchestration/plugins/vcenter/vcenter.common');

var getNetworkMethod = {
    'vcenter': vCenterNetworkApi,
    'openstack': openstackNetworkApi,
    'cloudstack' : cloudstackNetworkApi,
    'none'       : noOrchestrationNetworkApi
}

function apiGet (reqUrl, req, callback)
{
    var loggedInOrchMode = orch.getLoggedInOrchestrationMode(req);
    getNetworkMethod[loggedInOrchMode].get(reqUrl, req, function(err, data) {
        callback(err, data);
    });
}

function apiPost (reqUrl, postData, req, callback)
{
    var loggedInOrchMode = orch.getLoggedInOrchestrationMode(req);
    getNetworkMethod[loggedInOrchMode].post(reqUrl, postData, req, function(err, data) {
        callback(err, data);
    });
}

function apiPut (reqUrl, putData, req, callback)
{
    var loggedInOrchMode = orch.getLoggedInOrchestrationMode(req);
    getNetworkMethod[loggedInOrchMode].put(reqUrl, putData, req, function(err, data) {
        callback(err, data);
    });
}

function apiDelete (reqUrl, req, callback)
{
    var loggedInOrchMode = orch.getLoggedInOrchestrationMode(req);
    getNetworkMethod[loggedInOrchMode].delete(reqUrl, req, function(err, data) {
        callback(err, data);
    });
}

function createNetworkPort (req, postData, project, callback)
{
    var loggedInOrchMode = orch.getLoggedInOrchestrationMode(req);
    req.cookies.project = project;
    getNetworkMethod[loggedInOrchMode].createNetworkPort(req, postData, callback);
}

function deleteNetworkPort (req, portId, callback)
{
    var loggedInOrchMode = orch.getLoggedInOrchestrationMode(req);
    getNetworkMethod[loggedInOrchMode].deleteNetworkPort(req, portId, callback);
}

function updateRouter (req, postData, portId,  callback)
{
    var loggedInOrchMode = orch.getLoggedInOrchestrationMode(req);
    getNetworkMethod[loggedInOrchMode].updateRouter(req, postData, portId, callback);
}

exports.apiGet = apiGet;
exports.apiPost = apiPost;
exports.apiPut = apiPut;
exports.apiDelete = apiDelete;
exports.createNetworkPort = createNetworkPort;
exports.deleteNetworkPort = deleteNetworkPort;
exports.updateRouter =  updateRouter;

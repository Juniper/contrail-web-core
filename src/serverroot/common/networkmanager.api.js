/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * This file contains the wrapper function for network manager 
 */

var config = require('../../../config/config.global');
var orch = require('../orchestration/orchestration.api');

var orchModel = orch.getOrchestrationModel();

var nwMgrApi;
if (orchModel == 'openstack') {
    nwMgrApi = require('../orchestration/plugins/openstack/neutron.api');
} else if ('none' == orchModel) {
    nwMgrApi = require('../orchestration/plugins/no-orch/noOrchestration.api');
}

function apiGet (reqUrl, req, callback)
{
    nwMgrApi.get(reqUrl, req, function(err, data) {
        callback(err, data);
    });
}

function apiPost (reqUrl, postData, req, callback)
{
    nwMgrApi.post(reqUrl, postData, req, function(err, data) {
        callback(err, data);
    });
}

function apiPut (reqUrl, putData, req, callback)
{
    nwMgrApi.put(reqUrl, putData, req, function(err, data) {
        callback(err, data);
    });
}

function apiDelete (reqUrl, req, callback)
{
    nwMgrApi.delete(reqUrl, req, function(err, data) {
        callback(err, data);
    });
}

function createNetworkPort (req, postData, project, callback)
{
    req.cookies.project = project;
    nwMgrApi.createNetworkPort(req, postData, callback);
}

exports.apiGet = apiGet;
exports.apiPost = apiPost;
exports.apiPut = apiPut;
exports.apiDelete = apiDelete;
exports.createNetworkPort = createNetworkPort;


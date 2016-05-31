/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * This file contains the wrapper function for image manager 
 */

var config = process.mainModule.exports['config'];
var orch = require('../orchestration/orchestration.api');

var orchModels = orch.getOrchestrationModels();

var openstackImageApi = require('../orchestration/plugins/openstack/glance.api');
var cloudstackImageApi  =
    require('../orchestration/plugins/cloudstack/cloudstack.api');
var noOrchestrationImageApi  =
    require('../orchestration/plugins/no-orch/noOrchestration.api');
var vCenterImageApi =
    require('../orchestration/plugins/vcenter/vcenter.common');

var getImageMethod = {
    'vcenter': vCenterImageApi,
    'openstack': openstackImageApi,
    'cloudstack' : cloudstackImageApi,
    'none'       : noOrchestrationImageApi
}

function apiGet (reqUrl, req, callback)
{
    var loggedInOrchMode = orch.getLoggedInOrchestrationMode(req);
    getImageMethod[loggedInOrchMode].get(reqUrl, req, function(err, data) {
        callback(err, data);
    });
}

function getImageList (req, callback)
{
    var loggedInOrchMode = orch.getLoggedInOrchestrationMode(req);
    getImageMethod[loggedInOrchMode].getImageList(req, function(err, data) {
        callback(err, data);
    });
}

exports.apiGet = apiGet;
exports.getImageList = getImageList;


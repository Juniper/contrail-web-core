/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * This file contains the wrapper function for image manager 
 */

var config = process.mainModule.exports['config'];
var orch = require('../orchestration/orchestration.api');

var orchModels = orch.getOrchestrationModels();

if (orchModels.indexOf('openstack') != -1) {
    var imageApi = require('../orchestration/plugins/openstack/glance.api');
} else if (orchModels.indexOf('none') != -1) {
    imageApi = require('../orchestration/plugins/no-orch/noOrchestration.api');
}

function apiGet (reqUrl, req, callback)
{
    imageApi.get(reqUrl, req, function(err, data) {
        callback(err, data);
    });
}

function getImageList (req, callback)
{
    imageApi.getImageList(req, function(err, data) {
        callback(err, data);
    });
}

exports.apiGet = apiGet;
exports.getImageList = getImageList;


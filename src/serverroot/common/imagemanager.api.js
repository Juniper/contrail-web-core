/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * This file contains the wrapper function for image manager 
 */

var config = require('../../../config/config.global');

var orchModel = ((config.orchestration) && (config.orchestration.Manager)) ?
    config.orchestration.Manager : 'openstack';

if (orchModel == 'openstack') {
    var imageApi = require('../orchestration/plugins/openstack/glance.api');
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


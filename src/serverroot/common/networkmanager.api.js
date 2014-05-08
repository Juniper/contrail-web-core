/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * This file contains the wrapper function for network manager 
 */

var config = require('../../../config/config.global');

var orchModel = ((config.orchestration) && (config.orchestration.Manager)) ?
    config.orchestration.Manager : 'openstack';

if (orchModel == 'openstack') {
    var nwMgrApi = require('../orchestration/plugins/openstack/quantum.api');
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

exports.apiGet = apiGet;
exports.apiPost = apiPost;
exports.apiPut = apiPut;
exports.apiDelete = apiDelete;


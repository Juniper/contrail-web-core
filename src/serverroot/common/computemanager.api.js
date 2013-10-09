/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

/**
 * This file contains the wrapper function for compute manager 
 */

var config = require('../../../config/config.global');

var orchModel = ((config.orchestration) && (config.orchestration.Manager)) ?
    config.orchestration.Manager : 'openstack';

if (orchModel == 'openstack') {
    var computeApi = require('../orchestration/plugins/openstack/nova.api');
}

function apiGet (reqUrl, req, callback)
{
    computeApi.get(reqUrl, req, function(err, data) {
        callback(err, data);
    });
}

function apiPost (reqUrl, postData, req, callback) 
{
    computeApi.post(reqUrl, postData, req, function(err, data) {
        callback(err, data);
    });
}

function launchVNC (req, callback)
{
    computeApi.launchVNC(req, function(err, data) {
        callback(err, data);
    });
}

function getServiceInstanceVMStatus (req, vmRefs, callback)
{
    computeApi.getServiceInstanceVMStatus(req, vmRefs, function(err, data) {
        callback(err, data);
    });
}

function getVMStatsByProject (projUUID, req, callback)
{
    computeApi.getVMStatsByProject(projUUID, req, function(err, data) {
        callback(err, data);
    });
}

exports.apiGet = apiGet;
exports.apiPost = apiPost;
exports.launchVNC = launchVNC;
exports.getServiceInstanceVMStatus = getServiceInstanceVMStatus;
exports.getVMStatsByProject = getVMStatsByProject;


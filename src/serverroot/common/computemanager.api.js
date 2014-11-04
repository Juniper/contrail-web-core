/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * This file contains the wrapper function for compute manager 
 */

var config = process.mainModule.exports['config'];
var orch = require('../orchestration/orchestration.api');

var orchModel = orch.getOrchestrationModel();

var computeApi;
if (orchModel == 'openstack') {
    computeApi = require('../orchestration/plugins/openstack/nova.api');
} else if ('none' == orchModel) {
    computeApi = require('../orchestration/plugins/no-orch/noOrchestration.api');
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

function getFlavors(req, callback)
{
    computeApi.getFlavors(req, function(err,data){
        callback(err,data);
    });
}

function getOSHostList(req, callback)
{
    computeApi.getOSHostList(req, function(err,data){
        callback(err,data);
    });
}

function getAvailabilityZoneList(req, callback)
{
    computeApi.getAvailabilityZoneList(req, function(err,data){
        callback(err,data);
    });
}

exports.apiGet = apiGet;
exports.apiPost = apiPost;
exports.launchVNC = launchVNC;
exports.getServiceInstanceVMStatus = getServiceInstanceVMStatus;
exports.getVMStatsByProject = getVMStatsByProject;
exports.getFlavors = getFlavors;
exports.getOSHostList = getOSHostList;
exports.getAvailabilityZoneList = getAvailabilityZoneList;

/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * This file contains the wrapper function for compute manager 
 */

var config = process.mainModule.exports['config'];
var orch = require('../orchestration/orchestration.api');

var orchModels = orch.getOrchestrationModels();

var openstackComputeApi = require('../orchestration/plugins/openstack/nova.api');
var cloudstackComputeApi  =
    require('../orchestration/plugins/cloudstack/cloudstack.api');
var noOrchestrationComputeApi  =
    require('../orchestration/plugins/no-orch/noOrchestration.api');
var vCenterComputeApi =
    require('../orchestration/plugins/vcenter/vcenter.common');

var getComputeMethod = {
    'vcenter': vCenterComputeApi,
    'openstack': openstackComputeApi,
    'cloudstack' : cloudstackComputeApi,
    'none'       : noOrchestrationComputeApi
}

function apiGet (reqUrl, req, callback)
{
    var loggedInOrchMode = orch.getLoggedInOrchestrationMode(req);
    getComputeMethod[loggedInOrchMode].get(reqUrl, req, function(err, data) {
        callback(err, data);
    });
}

function apiPost (reqUrl, postData, req, callback) 
{
    var loggedInOrchMode = orch.getLoggedInOrchestrationMode(req);
    getComputeMethod[loggedInOrchMode].post(reqUrl, postData, req, function(err, data) {
        callback(err, data);
    });
}

function launchVNC (req, callback)
{
    var loggedInOrchMode = orch.getLoggedInOrchestrationMode(req);
    getComputeMethod[loggedInOrchMode].launchVNC(req, function(err, data) {
        callback(err, data);
    });
}

function getServiceInstanceVMStatus (req, vmRefs, callback)
{
    var loggedInOrchMode = orch.getLoggedInOrchestrationMode(req);
    getComputeMethod[loggedInOrchMode].getServiceInstanceVMStatus(req, vmRefs, function(err, data) {
        callback(err, data);
    });
}

function getVMStatsByProject (projUUID, req, callback)
{
    var loggedInOrchMode = orch.getLoggedInOrchestrationMode(req);
    getComputeMethod[loggedInOrchMode].getVMStatsByProject(projUUID, req, function(err, data) {
        callback(err, data);
    });
}

function getFlavors(req, callback)
{
    var loggedInOrchMode = orch.getLoggedInOrchestrationMode(req);
    getComputeMethod[loggedInOrchMode].getFlavors(req, function(err,data){
        callback(err,data);
    });
}

function getOSHostList(req, callback)
{
    var loggedInOrchMode = orch.getLoggedInOrchestrationMode(req);
    getComputeMethod[loggedInOrchMode].getOSHostList(req, function(err,data){
        callback(err,data);
    });
}

function getAvailabilityZoneList(req, callback)
{
    var loggedInOrchMode = orch.getLoggedInOrchestrationMode(req);
    getComputeMethod[loggedInOrchMode].getAvailabilityZoneList(req, function(err,data){
        callback(err,data);
    });
}

function portAttach (req, callback)
{
    var loggedInOrchMode = orch.getLoggedInOrchestrationMode(req);
    getComputeMethod[loggedInOrchMode].portAttach(req, function(err, data) {
        callback(err, data);
    });
}

function portDetach (req, callback)
{
    var loggedInOrchMode = orch.getLoggedInOrchestrationMode(req);
    getComputeMethod[loggedInOrchMode].portDetach(req, function(err, data) {
        callback(err, data);
    });
}

function portAttach (req, body, callback)
{
    var loggedInOrchMode = orch.getLoggedInOrchestrationMode(req);
    getComputeMethod[loggedInOrchMode].portAttach(req, body, function(err, data) {
        callback(err, data);
    });
}

function portDetach (req, portID, vmUUID, callback)
{
    var loggedInOrchMode = orch.getLoggedInOrchestrationMode(req);
    getComputeMethod[loggedInOrchMode].portDetach(req, portID, vmUUID, function(err, data) {
        callback(err, data);
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
exports.portAttach = portAttach;
exports.portDetach = portDetach;


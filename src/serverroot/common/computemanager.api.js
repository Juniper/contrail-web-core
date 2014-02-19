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

function getFlavors(req, callback)
{
    computeApi.getFlavors(req, function(err, data) {
        callback(err, data);
    });
}

function pauseInstance(req, callback)
{
    computeApi.pauseInstance(req, function(err, data) {
        callback(err, data); 
    });  
}

function resumeInstance(req, callback)
{
    computeApi.resumeInstance(req, function(err, data) {
        callback(err, data);
    });
}

function suspendInstance(req, callback)
{
    computeApi.suspendInstance(req, function(err, data) {
        callback(err, data);
    });
}

function deleteInstance(req, callback)
{
    computeApi.deleteInstance(req, function(err, data) {
        callback(err, data);
    });
}

function softRebootInstance(req, callback)
{
    computeApi.softRebootInstance(req, function(err, data) {
        callback(err, data);
    });
}
function hardRebootInstance(req, callback)
{
    computeApi.hardRebootInstance(req, function(err, data) {
        callback(err, data);
    });
}

function createImage(req, callback)
{
    computeApi.createImage(req, function(err, data) {
        callback(err, data);
    });
}

exports.apiGet = apiGet;
exports.apiPost = apiPost;
exports.launchVNC = launchVNC;
exports.getServiceInstanceVMStatus = getServiceInstanceVMStatus;
exports.getVMStatsByProject = getVMStatsByProject;
exports.getFlavors = getFlavors;
exports.pauseInstance = pauseInstance;
exports.resumeInstance = resumeInstance;
exports.suspendInstance = suspendInstance;
exports.deleteInstance = deleteInstance;
exports.softRebootInstance = softRebootInstance;
exports.hardRebootInstance = hardRebootInstance;
exports.createImage = createImage;


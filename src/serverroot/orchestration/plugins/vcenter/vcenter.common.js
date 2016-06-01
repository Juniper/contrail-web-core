/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

function get (reqUrl, req, callback)
{
    callback(null, null);
}

function put (reqUrl, putData, req, callback)
{
    callback(null, null);
}

function post (reqUrl, postData, req, callback)
{
    callback(null, null);
}

exports.delete = function (reqUrl, req, callback)
{
    callback(null, null);
}

function launchVNC (req, callback)
{
    callback(null, null);
}

function getServiceInstanceVMStatus (req, vmRefs, callback)
{
    callback(null, null);
}

function getVMStatsByProject (projUUID, req, callback)
{
    callback(null, null);
}

function getFlavors (req, callback)
{
    callback(null, null);
}

function getOSHostList (req, callback)
{
    callback(null, null);
}

function getAvailabilityZoneList (req, callback)
{
    callback(null, null);
}

function portAttach (req, body, callback)
{
    callback(null, null);
}

function portDetach (req, portID, vmUUID, callback)
{
    callback(null, null);
}

/* Image Manager Dummy Code */
function getImageList (req, callback)
{
    callback(null, null);
}

exports.get = get;
exports.post = post;
exports.launchVNC = launchVNC;
exports.getServiceInstanceVMStatus = getServiceInstanceVMStatus;
exports.getVMStatsByProject = getVMStatsByProject;
exports.getFlavors = getFlavors;
exports.getOSHostList = getOSHostList;
exports.getAvailabilityZoneList = getAvailabilityZoneList;
exports.portAttach = portAttach;
exports.portDetach = portDetach;

/* Image Manager Public APIs */
exports.getImageList = getImageList;


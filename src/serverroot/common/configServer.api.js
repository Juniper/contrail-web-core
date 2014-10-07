/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * This file contains the wrapper functions for Config API Server
 */

var global = require('./global');
var assert = require('assert');
var config = process.mainModule.exports.config;
var plugins = require('../orchestration/plugins/plugins.api');

function getApiServerRequestedByData (appData, reqBy)
{
    return plugins.getApiServerRequestedByData(appData, reqBy);
}

function apiGet (url, appData, callback)
{
    var service = getApiServerRequestedByData(appData, global.label.API_SERVER);
    service.apiGet(url, appData, function(err, data) {
        callback(err, data);
    });
}

function apiPut (url, putData, appData, callback)
{
    var service = getApiServerRequestedByData(appData, global.label.API_SERVER);
    service.apiPut(url, putData, appData, function(err, data) {
        callback(err, data);
    });
}


function apiPost (url, postData, appData, callback) 
{
    var service = getApiServerRequestedByData(appData, global.label.API_SERVER);
    service.apiPost(url, postData, appData, function(err, data) {
        callback(err, data);
    });
}

function apiDelete (url, appData, callback) 
{
    var service = getApiServerRequestedByData(appData, global.label.API_SERVER);
    service.apiDelete(url, appData, function(err, data) {
        callback(err, data);
    });
}

exports.apiGet = apiGet;
exports.apiPut = apiPut;
exports.apiPost = apiPost;
exports.apiDelete = apiDelete;


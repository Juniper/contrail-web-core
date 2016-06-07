/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * This file contains the wrapper functions for Analytics Server
 */

var global = require('./global');
var assert = require('assert');
var config = process.mainModule.exports.config;
var plugins = require('../orchestration/plugins/plugins.api');
var commonUtils = require('../utils/common.utils');

function getApiServerRequestedByData (appData, reqBy)
{
    return plugins.getApiServerRequestedByData(appData, reqBy);
}

function apiGet (url, appData, callback, appHeaders)
{
    var service = getApiServerRequestedByData(appData, global.label.OPSERVER);
    service.apiGet(url, appData, function(err, data) {
        callback(err, data);
    }, appHeaders);
}

function apiPut (url, putData, appData, callback, appHeaders)
{
    var service = getApiServerRequestedByData(appData, global.label.OPSERVER);
    service.apiPut(url, putData, appData, function(err, data) {
        callback(err, data);
    }, appHeaders);
}


function apiPost (url, postData, appData, callback, appHeaders)
{
    var service = getApiServerRequestedByData(appData, global.label.OPSERVER);
    service.apiPost(url, postData, appData, function(err, data) {
        callback(err, data);
    }, appHeaders);
}

function apiDelete (url, appData, callback, appHeaders)
{
    var service = getApiServerRequestedByData(appData, global.label.OPSERVER);
    service.apiDelete(url, appData, function(err, data) {
        callback(err, data);
    }, appHeaders);
}

exports.apiGet = apiGet;
exports.apiPut = apiPut;
exports.apiPost = apiPost;
exports.apiDelete = apiDelete;


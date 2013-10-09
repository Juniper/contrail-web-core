/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

var rest = require('./rest.api');
var global = require('./global');
var assert = require('assert');
var config = require('../../../config/config.global');

var serverIp = global.DFLT_SERVER_IP;
var serverPort = '8081';

if (config.analytics) {
    if (config.analytics.server_ip) {
        serverIp = config.analytics.server_ip;
    }
    if (config.analytics.server_port) {
        serverPort = config.analytics.server_port;
    }
}

opServer = rest.getAPIServer({apiName:global.label.OPS_API_SERVER,
                             server: serverIp, port: serverPort
                             });

function apiGet (url, appData, callback)
{
    opServer.api.get(url, function(err, data) {
        callback(err, data);
    });
}

function apiPut (url, putData, appData, callback)
{
    opServer.api.get(url, putData, function(err, data) {
        callback(err, data);
    });
}

function apiPost (url, postData, appData, callback)
{
    opServer.api.post(url, postData, function(err, data) {
        callback(err, data);
    });
}

function apiDelete (url, appData, allback)
{
    opServer.api.delete(url, function(err, data) {
        callback(err, data);
    });
}

exports.apiGet = apiGet;
exports.apiPut = apiPut;
exports.apiPost = apiPost;
exports.apiDelete = apiDelete;


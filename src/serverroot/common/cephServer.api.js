/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

var rest = require('./rest.api');
var global = require('./global');
var assert = require('assert');
var config = require('../../../config/config.global');

var serverIp = global.DFLT_SERVER_IP;
var serverPort = '5003';
var serverUrlVersion= "/api/v0.1";


if (config.ceph.server_ip) {
    if (config.ceph.server_ip) {
        serverIp = config.ceph.server_ip;
    }
    if (config.ceph.server_port) {
        serverPort = config.ceph.server_port;
    }
}

cephServer = rest.getAPIServer({apiName:global.label.CEPH_API_SERVER,
                             server: serverIp, port: serverPort
                             });

function apiGet (url, appData, callback)
{
    var headers = {};
    headers['Accept'] = 'application/json';
    url = serverUrlVersion + url;
    
    cephServer.api.get(url, function(err, data) {
        callback(err, data);
    }, headers);
}

function apiPut (url, putData, appData, callback)
{
    cephServer.api.get(url, putData, function(err, data) {
        callback(err, data);
    });
}

function apiPost (url, postData, appData, callback)
{
    cephServer.api.post(url, postData, function(err, data) {
        callback(err, data);
    });
}

function apiDelete (url, appData, allback)
{
    cephServer.api.delete(url, function(err, data) {
        callback(err, data);
    });
}

exports.apiGet = apiGet;
exports.apiPut = apiPut;
exports.apiPost = apiPost;
exports.apiDelete = apiDelete;


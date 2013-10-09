/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

/**
 * This file contains the functions for REST APIs for Cloud Stack Service
 */
var config = require('../../../../../config/config.global'),
    global = require('../../../common/global'),
    messages = require('../../../common/messages'),
    logutils = require('../../../utils/log.utils'),
    authApi = require('../../../common/auth.api'),
    crypto = require('crypto'),
    rest = require('../../../common/rest.api');
    cookie = require('../../../../../node_modules/restler/lib/restler');
var authServerIP = ((config.identityManager) && (config.identityManager.ip)) ?
    config.identityManager.ip : global.DFLT_SERVER_IP;
var authServerPort =
    ((config.identityManager) && (config.identityManager.port)) ?
    config.identityManager.port : '8080';

var authAPIServer = 
    rest.getAPIServer({apiName:global.label.IDENTITY_SERVER,
                      server:authServerIP, port:authServerPort});

function getCloudStackHeaders (req, headers)
{
    headers['cookie'] = req.session['cloudstack-cookie'];
    return headers;
}

function getCloudStackCommandURL (req, cmd, headers)
{
    var dataObject = {};
    try {
        var apiSecret = req.session['userKey']['secretKey'];
        dataObject['apiKey'] = req.session['userKey']['apiKey'];
        dataObject['command'] = cmd;
        dataObject['response'] = 'json';
    } catch(e) {
        cmd += '&response=json&sessionkey=' + 
            encodeURIComponent(req.session.sessionKey);
        headers = getCloudStackHeaders(req, headers);
        return ('/client/api?command=' + cmd);
    }

    /* For details of calculating signature, please read below:
       http://download.cloud.com/releases/3.0.0/CloudStack3.0DeveloperGuide.pdf
       'Signing API Requests' Section
     */
    var paramsKey = [];
    for (var key in dataObject) {
        if (dataObject.hasOwnProperty(key)) {
            paramsKey.push(key);
        }
    }
    paramsKey.sort();
    var paramsKeyLen = paramsKey.length;

    var queryStringParams = [];

    for (var i = 0; i < paramsKeyLen; i++) {
        key = paramsKey[i];
        queryStringParams.push(key + '=' + encodeURIComponent(dataObject[key]));
    }
    var queryString =
        queryStringParams.join('&');
    var cryptoAlg = crypto.createHmac('sha1', apiSecret);
    var signature =
        cryptoAlg.update(queryString.toLowerCase()).digest('base64');
    return '/client/api?' + queryString + '&signature=' + encodeURIComponent(signature);

}

function apiGet (req, cmd, callback)
{
    var headers = {};
    var reqUrl  = getCloudStackCommandURL(req, cmd, headers); 
   
    authAPIServer.api.get(reqUrl, function (err, data) {
        callback(err, data);
    }, headers);
}

function apiGetByURL (req, url, callback)
{
    var headers = {};

    headers = getCloudStackHeaders(req, headers);
    authAPIServer.api.get(url, function (err, data) {
        callback(err, data);
    }, headers);
}

function apiPost (req, cmd, postData, callback)
{
    var headers = {};
    var reqUrl  = getCloudStackCommandURL(req, cmd, headers);

    authAPIServer.api.post(reqUrl, postData, function (err, data) {
        callback(err, data);
    }, headers);
}

function apiPostByURL (req, url, postData, callback)
{
    var headers = {};

    headers = getCloudStackHeaders(req, headers);
    authAPIServer.api.post(url, postData, function (err, data) {
        callback(err, data);
    }, headers);
}

function apiPut (req, cmd, putData, callback)
{
    var headers = {};
    var reqUrl  = getCloudStackCommandURL(req, cmd, headers);

    authAPIServer.api.put(reqUrl, putData, function (err, data) {
        callback(err, data);
    }, headers);
}

function apiPutByURL (req, url, putData, callback)
{
    var headers = {};
    
    headers = getCloudStackHeaders(req, headers);
    authAPIServer.api.put(url, putData, function (err, data) {
        callback(err, data);
    }, headers);
}

function apiDelete (req, cmd, callback)
{   
    var headers = {};
    var reqUrl  = getCloudStackCommandURL(req, cmd, headers);

    authAPIServer.api.delete(reqUrl, function (err, data) {
        callback(err, data);
    }, headers);
}

function apiDeleteByURL (req, url, callback)
{  
    var headers = {};

    headers = getCloudStackHeaders(req, headers);
    authAPIServer.api.delete(url, function (err, data) {
        callback(err, data);
    }, headers);
}

exports.apiGet = apiGet;
exports.apiGetByURL = apiGetByURL;
exports.apiPost = apiPost;
exports.apiPostByURL = apiPostByURL;
exports.apiPut = apiPut;
exports.apiPutByURL = apiPutByURL;
exports.apiDelete = apiDelete;
exports.apiDeleteByURL = apiDeleteByURL;


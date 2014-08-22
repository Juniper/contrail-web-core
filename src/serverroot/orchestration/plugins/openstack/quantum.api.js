/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var rest = require('../../../common/rest.api'),
    config = require('../../../../../config/config.global.js'),
    authApi = require('../../../common/auth.api')
    ;
var quantumAPIServer;

quantumApi = module.exports;

var quantumServerIP = ((config.networkManager) && (config.networkManager.ip)) ?
    config.networkManager.ip : global.DFLT_SERVER_IP;
var quantumServerPort = ((config.networkManager) && (config.networkManager.port)) ?
    config.networkManager.port : '9696';

quantumAPIServer = rest.getAPIServer({apiName:global.label.NETWORK_SERVER,
                                      server:quantumServerIP,
                                      port:quantumServerPort});
function getTenantIdByReqCookie (req)
{
    if (req.cookies && req.cookies.project) {
        return req.cookies.project;
    } else {
        var ajaxCall = req.headers['x-requested-with'];
        if (ajaxCall == 'XMLHttpRequest') {
           req.res.setHeader('X-Redirect-Url','/logout');
           req.res.send(307,'');
        } else {
           req.res.redirect('/logout');
        }
        return null;
    }
}

/* Function: doQuantumOpCb
 */
function doQuantumOpCb (reqUrl, tenantId, req, quantumCallback, stopRetry,
                        callback)
{
    var forceAuth = stopRetry;

    authApi.getTokenObj({'req': req, 'tenant': tenant, 'forceAuth': forceAuth}, 
                        function(err, tokenObj) {
        if ((err) || (null == tokenObj) || (null == tokenObj.id)) {
            if (stopRetry) {
                console.log("We are done retrying for tenantId:" + tenantId +
                            " with err:" + err);
                commonUtils.redirectToLogout(req, req.res);
            } else {
                /* Retry once again */
                console.log("We are about to retry for tenantId:" + tenantId);
                quantumCallback(reqUrl, req, callback, true);
            }
        } else {
            console.log("doQuantumOpCb() success with tenantId:" + tenantId);
            callback(err, tokenObj);
        }
    });
}         

/* Wrapper function to GET Data from Quantum-Server */
quantumApi.get = function(reqUrl, req, callback, stopRetry) {
    var headers = {};
    var forceAuth = stopRetry;
    var tenantId = getTenantIdByReqCookie(req);
    if (null == tenantId) {
        /* Just return as we will be redirected to login page */
        return;
    }

    headers['User-Agent'] = 'Contrail-WebClient';
    doQuantumOpCb(reqUrl, tenantId, req, quantumApi.get, stopRetry, 
                function(err, tokenObj) {
        if ((err) || (null == tokenObj) || (null == tokenObj.id)) {
            callback(err, null);
        } else {
            headers['X-Auth-Token'] = tokenObj.id;
		    quantumAPIServer.api.get(reqUrl, function(err, data) {
                if (err) {
                    /* Just retry in case of if it fails, it may happen that failure is
                     * due to token change, so give one more change
                     */
                    if (stopRetry) {
		                callback(err, data);
                    } else {
                        quantumApi.get(reqUrl, req, callback, true);
                    }
                 } else {
                    callback(err, data);
                 }
		    }, headers);
        }
    });
}

/* Wrapper function to PUT data to Quantum-Server */
quantumApi.put = function(reqUrl, reqData, req, callback, stopRetry) { 
    var headers = {};
    var tenantId = getTenantIdByReqCookie(req);
    if (null == tenantId) {
        /* Just return as we will be redirected to login page */
        return;
    }

    headers['User-Agent'] = 'Contrail-WebClient';
    doQuantumOpCb(reqUrl, tenantId, req, quantumApi.get, stopRetry, 
                function(err, tokenObj) {
        if ((err) || (null == tokenObj) || (null == tokenObj.id)) {
            callback(err, null);
        } else {
            headers['X-Auth-Token'] = tokenObj.id;
            quantumAPIServer.api.put(reqUrl, function(err, data) {
                if (err) {
                    /* Just retry in case of if it fails, it may happen that failure is
                     * due to token change, so give one more change
                     */
                    if (stopRetry) {
                      callback(err, data);
                    } else {
                        quantumApi.put(reqUrl, reqData, req, callback, true);
                    }
                 } else {
                    callback(err, data);
                 }
            }, headers);
        }
    });
}

/* Wrapper function to POST data to Quantum-Server */
quantumApi.post = function(reqUrl, reqData, req, callback, stopRetry) { 
    var headers = {};
    var i = 0;
    var tenantId = getTenantIdByReqCookie(req);
    if (null == tenantId) {
        /* Just return as we will be redirected to login page */
        return;
    }

    headers['User-Agent'] = 'Contrail-WebClient';
    doQuantumOpCb(reqUrl, tenantId, req, quantumApi.get, stopRetry, 
                function(err, tokenObj) {
        if ((err) || (null == tokenObj) || (null == tokenObj.id)) {
            callback(err, null);
        } else {
            headers['X-Auth-Token'] = tokenObj.id;
            quantumAPIServer.api.post(reqUrl, reqData, function(err, data) {
                if (err) {
                    /* Just retry in case of if it fails, it may happen that failure is
                     * due to token change, so give one more change
                     */
                    if (stopRetry) {
                      callback(err, data);
                    } else {
                        quantumApi.post(reqUrl, reqData, req, callback, true);
                    }
                 } else {
                    callback(err, data);
                 }
            }, headers);
        }
    });
}

/* Wrapper function to DELETE entry from Quantum-Server */
quantumApi.delete = function(reqUrl, req, callback, stopRetry) { 
    var headers = {};
    var tenantId = getTenantIdByReqCookie(req);
    if (null == tenantId) {
        /* Just return as we will be redirected to login page */
        return;
    }

    headers['User-Agent'] = 'Contrail-WebClient';

    doQuantumOpCb(reqUrl, tenantId, req, quantumApi.get, stopRetry, 
                function(err, tokenObj) {
        if ((err) || (null == tokenObj) || (null == tokenObj.id)) {
            callback(err, null);
        } else {
            headers['X-Auth-Token'] = tokenObj.id;
            quantumAPIServer.api.delete(reqUrl, function(err, data) {
                if (err) {
                    /* Just retry in case of if it fails, it may happen that failure is
                     * due to token change, so give one more change
                     */
                    if (stopRetry) {
                      callback(err, data);
                    } else {
                        quantumApi.delete(reqUrl, req, callback, true);
                    }
                 } else {
                    callback(err, data);
                 }
            }, headers);
        }
    });
}


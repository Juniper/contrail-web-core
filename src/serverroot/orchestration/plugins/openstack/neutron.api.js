/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var rest = require('../../../common/rest.api'),
    config = process.mainModule.exports.config,
    authApi = require('../../../common/auth.api'),
    commonUtils = require('../../../utils/common.utils')
    ;
var neutronAPIServer;

neutronApi = module.exports;

var neutronServerIP = ((config.networkManager) && (config.networkManager.ip)) ?
    config.networkManager.ip : global.DFLT_SERVER_IP;
var neutronServerPort = ((config.networkManager) && (config.networkManager.port)) ?
    config.networkManager.port : '9696';

neutronAPIServer = rest.getAPIServer({apiName:global.label.NETWORK_SERVER,
                                      server:neutronServerIP,
                                      port:neutronServerPort});
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

/* Function: doNeutronOpCb
 */
function doNeutronOpCb (reqUrl, tenantId, req, neutronCallback, stopRetry,
                        callback)
{
    var forceAuth = stopRetry;

    authApi.getTokenObj({'req': req, 'tenant': tenantId, 'forceAuth': forceAuth}, 
                        function(err, tokenObj) {
        if ((err) || (null == tokenObj) || (null == tokenObj.id)) {
            if (stopRetry) {
                console.log("We are done retrying for tenantId:" + tenantId +
                            " with err:" + err);
                commonUtils.redirectToLogout(req, req.res);
            } else {
                /* Retry once again */
                console.log("We are about to retry for tenantId:" + tenantId);
                neutronCallback(reqUrl, req, callback, true);
            }
        } else {
            console.log("doNeutronOpCb() success with tenantId:" + tenantId);
            callback(err, tokenObj);
        }
    });
}         

/* Wrapper function to GET Data from Neutron-Server */
neutronApi.get = function(reqUrl, req, callback, stopRetry) {
    var headers = {};
    var forceAuth = stopRetry;
    var tenantId = getTenantIdByReqCookie(req);
    if (null == tenantId) {
        /* Just return as we will be redirected to login page */
        return;
    }

    headers['User-Agent'] = 'Contrail-WebClient';
    doNeutronOpCb(reqUrl, tenantId, req, neutronApi.get, stopRetry,
                function(err, tokenObj) {
        if ((err) || (null == tokenObj) || (null == tokenObj.id)) {
            callback(err, null);
        } else {
            headers['X-Auth-Token'] = tokenObj.id;
		    neutronAPIServer.api.get(reqUrl, function(err, data) {
                if (err) {
                    /* Just retry in case of if it fails, it may happen that failure is
                     * due to token change, so give one more change
                     */
                    if (stopRetry) {
		                callback(err, data);
                    } else {
                        neutronApi.get(reqUrl, req, callback, true);
                    }
                 } else {
                    callback(err, data);
                 }
		    }, headers);
        }
    });
}

/* Wrapper function to PUT data to Neutron-Server */
neutronApi.put = function(reqUrl, reqData, req, callback, stopRetry) { 
    var headers = {};
    var tenantId = getTenantIdByReqCookie(req);
    if (null == tenantId) {
        /* Just return as we will be redirected to login page */
        return;
    }

    headers['User-Agent'] = 'Contrail-WebClient';
    doNeutronOpCb(reqUrl, tenantId, req, neutronApi.put, stopRetry,
                function(err, tokenObj) {
        if ((err) || (null == tokenObj) || (null == tokenObj.id)) {
            callback(err, null);
        } else {
            headers['X-Auth-Token'] = tokenObj.id;
            neutronAPIServer.api.put(reqUrl, reqData, function(err, data) {
                if (err) {
                    /* Just retry in case of if it fails, it may happen that failure is
                     * due to token change, so give one more change
                     */
                    if (stopRetry) {
                      callback(err, data);
                    } else {
                        neutronApi.put(reqUrl, reqData, req, callback, true);
                    }
                 } else {
                    callback(err, data);
                 }
            }, headers);
        }
    });
}

/* Wrapper function to POST data to Neutron-Server */
neutronApi.post = function(reqUrl, reqData, req, callback, stopRetry) { 
    var headers = {};
    var i = 0;
    var tenantId = getTenantIdByReqCookie(req);
    if (null == tenantId) {
        /* Just return as we will be redirected to login page */
        return;
    }

    headers['User-Agent'] = 'Contrail-WebClient';
    doNeutronOpCb(reqUrl, tenantId, req, neutronApi.post, stopRetry,
                function(err, tokenObj) {
        if ((err) || (null == tokenObj) || (null == tokenObj.id)) {
            callback(err, null);
        } else {
            headers['X-Auth-Token'] = tokenObj.id;
            neutronAPIServer.api.post(reqUrl, reqData, function(err, data) {
                if (err) {
                    /* Just retry in case of if it fails, it may happen that failure is
                     * due to token change, so give one more change
                     */
                    if (stopRetry) {
                      callback(err, data);
                    } else {
                        neutronApi.post(reqUrl, reqData, req, callback, true);
                    }
                 } else {
                    callback(err, data);
                 }
            }, headers);
        }
    });
}

/* Wrapper function to DELETE entry from Neutron-Server */
neutronApi.delete = function(reqUrl, req, callback, stopRetry) { 
    var headers = {};
    var tenantId = getTenantIdByReqCookie(req);
    if (null == tenantId) {
        /* Just return as we will be redirected to login page */
        return;
    }

    headers['User-Agent'] = 'Contrail-WebClient';

    doNeutronOpCb(reqUrl, tenantId, req, neutronApi.delete, stopRetry,
                function(err, tokenObj) {
        if ((err) || (null == tokenObj) || (null == tokenObj.id)) {
            callback(err, null);
        } else {
            headers['X-Auth-Token'] = tokenObj.id;
            neutronAPIServer.api.delete(reqUrl, function(err, data) {
                if (err) {
                    /* Just retry in case of if it fails, it may happen that failure is
                     * due to token change, so give one more change
                     */
                    if (stopRetry) {
                      callback(err, data);
                    } else {
                        neutronApi.delete(reqUrl, req, callback, true);
                    }
                 } else {
                    callback(err, data);
                 }
            }, headers);
        }
    });
}

function createNetworkPort (req, postData, callback)
{
    var url = '/v2.0/ports.json';
    neutronApi.post(url, postData, req, callback);
}

function deleteNetworkPort (req, portId, callback)
{
    var url = '/v2.0/ports/' + portId + '.json';
    neutronApi.delete(url, req, callback);
}

function updateRouter (req, postData, routerId, callback)
{
    var url = '/v2.0/routers/' + routerId + '.json';
    neutronApi.put(url, postData, req, callback);
}

exports.createNetworkPort = createNetworkPort;
exports.deleteNetworkPort = deleteNetworkPort;
exports.updateRouter = updateRouter;


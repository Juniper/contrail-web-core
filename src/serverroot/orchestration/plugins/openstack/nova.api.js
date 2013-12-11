/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

var rest = require('../../../common/rest.api'),
    config = require('../../../../../config/config.global.js'),
    authApi = require('../../../common/auth.api'),
    url = require('url'),
    logutils = require('../../../utils/log.utils'),
    async = require('async'),
    commonUtils = require('../../../utils/common.utils')
    ;
var novaAPIServer;

novaApi = module.exports;

var novaIP = ((config.computeManager) && (config.computeManager.ip)) ? 
    config.computeManager.ip : global.DFLT_SERVER_IP;
var novaPort = ((config.computeManager) && (config.computeManager.port)) ? 
    config.computeManager.port : '8774';

novaAPIServer = rest.getAPIServer({apiName:global.label.IDENTITY_SERVER,
                                      server:novaIP, port:novaPort});
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

/* Function: doNovaOpCb
 */
function doNovaOpCb (reqUrl, tenantId, req, novaCallback, stopRetry,
                     callback)
{
    var forceAuth = stopRetry;

    authApi.getTokenObj(req, tenantId, forceAuth, function(err, tokenObj) {
        if ((err) || (null == tokenObj) || (null == tokenObj.id)) {
            if (stopRetry) {
                console.log("We are done retrying for tenantId:" + tenantId +
                            " with err:" + err);
                commonUtils.redirectToLogout(req, req.res);
                callback(err, null);
            } else {
                /* Retry once again */
                console.log("We are about to retry for tenantId:" + tenantId);
                novaCallback(reqUrl, req, callback, true);
            }
        } else {
            console.log("doNovaOpCb() success with tenantId:" + tenantId);
            callback(err, tokenObj);
        }
    });
}         

/* Wrapper function to GET Data from Nova-Server */
novaApi.get = function(reqUrl, req, callback, stopRetry) {
    var headers = {};
    var forceAuth = stopRetry;
    var tenantId = getTenantIdByReqCookie(req);
    if (null == tenantId) {
        /* Just return as we will be redirected to login page */
        return;
    }

    headers['User-Agent'] = 'Contrail-WebClient';
    doNovaOpCb(reqUrl, tenantId, req, novaApi.get, stopRetry, 
                function(err, tokenObj) {
        if ((err) || (null == tokenObj) || (null == tokenObj.id)) {
            callback(err, null);
        } else {
            headers['X-Auth-Token'] = tokenObj.id;
		    novaAPIServer.api.get(reqUrl, function(err, data) {
                if (err) {
                    /* Just retry in case of if it fails, it may happen that failure is
                     * due to token change, so give one more change
                     */
                    if (stopRetry) {
		                callback(err, data);
                    } else {
                        novaApi.get(reqUrl, req, callback, true);
                    }
                 } else {
                    callback(err, data);
                 }
		    }, headers);
        }
    });
}

/* Wrapper function to POST data to Nova-Server */
novaApi.post = function(reqUrl, reqData, req, callback, stopRetry) { 
    var headers = {};
    var i = 0;
    var tenantId = getTenantIdByReqCookie(req);
    if (null == tenantId) {
        /* Just return as we will be redirected to login page */
        return;
    }

    headers['User-Agent'] = 'Contrail-WebClient';
    doNovaOpCb(reqUrl, tenantId, req, novaApi.post, stopRetry, 
                function(err, tokenObj) {
        if ((err) || (null == tokenObj) || (null == tokenObj.id)) {
            callback(err, null);
        } else {
            headers['X-Auth-Token'] = tokenObj.id;
            novaAPIServer.api.post(reqUrl, reqData, function(err, data) {
                if (err) {
                    /* Just retry in case of if it fails, it may happen that failure is
                     * due to token change, so give one more change
                     */
                    if (stopRetry) {
                      callback(err, data);
                    } else {
                        novaApi.post(reqUrl, reqData, req, callback, true);
                    }
                 } else {
                    callback(err, data);
                 }
            }, headers);
        }
    });
}

function getNovaData (novaCallObj, callback)
{
    var req = novaCallObj['req'];
    var reqUrl = novaCallObj['reqUrl'];

    novaApi.get(reqUrl, req, function(err, data) {
        callback(err, data);
    }, true);
}

function getVMStatsByProject (projUUID, req, callback)
{
    var tenantStr = getTenantIdByReqCookie(req);
    var novaCallObjArr = [];
    var reqUrl = null;

    authApi.getTokenObj(req, tenantStr, true, function(err, data) {
        if (err) {
            logutils.logger.error("Error in getting token object for tenant: " +
                                  tenantStr);
            callback(err, null);
            return;
        }
        var tenantId = data['tenant']['id'];
        var reqUrl = '/v1.1/' + tenantId + '/servers/detail';
        novaApi.get(reqUrl, req, function(err, data) {
            callback(err, data);
        });
    });

}

function getServiceInstanceVMStatus (req, vmRefs, callback)
{
    var tenantStr = getTenantIdByReqCookie(req);
    var novaCallObjArr = [];
    var reqUrl = null;

    authApi.getTokenObj(req, tenantStr, true, function(err, data) {
        if (err) {
            logutils.logger.error("Error in getting token object for tenant: " +
                                  tenantStr);
            callback(err, null);
            return;
        }
        var tenantId = data['tenant']['id'];
        var vmRefsCnt = vmRefs.length;
        for (var i = 0; i < vmRefsCnt; i++) {
            reqUrl = '/v1.1/' + tenantId + '/servers/' + vmRefs[i]['uuid'];
            novaCallObjArr[i] = {};
            novaCallObjArr[i]['req'] = req;
            novaCallObjArr[i]['reqUrl'] = reqUrl;
        }
        async.map(novaCallObjArr, getNovaData, function(err, data) {
            callback(err, data);
        });
    });
}

function launchVNC (request, callback)
{
    var projectId = null;
    var vmId = null;
    var requestParams = url.parse(request.url, true);

    authApi.getTokenObj(request, requestParams.query.project_id,
                        true, function (error, data) {
        if (error) {   
            logutils.logger.error("Error in getting token object for tenant: " +
                                  requestParams.query.project_id);
            callback(error, null);
        }
        if (data == null) {
            logutils.logger.error("Trying to illegal access with tenantId: " +
                                  requestParams.query.project_id + 
                                  " With session: " + request.session.id);
            callback(error, null);
            return;
        }
        /* Now create the final req */
        var vncURL = '/v1.1/';
        projectId = data.tenant.id;
        vncURL += projectId.toString() + "/servers/";
        if (requestParams.query.vm_id) {
            vmId = requestParams.query.vm_id;
            vncURL += vmId.toString();
        }
        var headers = {};
        headers['X-Auth-Token'] = data.id;
        headers['X-Auth-Project-Id'] = data.tenant.id;
        novaApi.get(vncURL, request,
                    function (error, data) {
            if (error) {
                callback(error, null);
            } else {
                novaApi.post(vncURL + "/action", 
                             {"os-getVNCConsole":{"type":"novnc"}}, 
                             request, function (error, data) {
                    if (error) {
                        callback(error, null);
                    } else {
                        callback(null, data);
                    }
                });
            }
        });
    });
}


function getFlavors (req, callback)
{   
    var tenantStr = getTenantIdByReqCookie(req);
    if (null == tenantStr) {
        /* Just return as we will be redirected to login page */
        return;
    }
    authApi.getTokenObj(req, tenantStr, true, function(err, data) {
        if (err) {
            logutils.logger.error("Error in getting token object for tenant: " + tenantStr);
            callback(err, null);
            return;
        }
        var tenantId = data['tenant']['id'];
        var reqUrl = '/v1.1/' + tenantId + '/flavors/detail';
        novaApi.get(reqUrl, req, function(err, data) {
            callback(err, data);
        });
    });
}


exports.launchVNC = launchVNC;
exports.getServiceInstanceVMStatus = getServiceInstanceVMStatus;
exports.getVMStatsByProject = getVMStatsByProject;
exports.getFlavors = getFlavors;


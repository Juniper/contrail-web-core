/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

var rest = require('../../../common/rest.api'),
    config = require('../../../../../config/config.global.js'),
    authApi = require('../../../common/auth.api'),
    url = require('url'),
    logutils = require('../../../utils/log.utils'),
    async = require('async'),
    plugins = require('../plugins.api'),
    appErrors = require('../../../errors/app.errors.js'),
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

var novaAPIVerList = ['v1.1', 'v2'];

var getVMStatsByProjectCB = {
    'v1.1': getVMStatsByProjectV11,
    'v2': getVMStatsByProjectV11
};

function getVMStatsByProjectV11 (err, data, callback)
{
    callback(err, data);
}

var getServiceInstanceVMStatusCB = {
    'v1.1': getServiceInstanceVMStatusV11,
    'v2': getServiceInstanceVMStatusV11
}

function getServiceInstanceVMStatusV11 (err, data, callback)
{
    callback(err, data);
}

var getFlavorsCB = {
    'v1.1': getFlavorsV11,
    'v2': getFlavorsV11
};

function getFlavorsV11 (err, data, callback)
{
    callback(err, data);
}

var launchVNCCB = {
    'v1.1' : launchVNCV11,
    'v2': launchVNCV11
};

function launchVNCV11 (error, data, callback)
{
    if (error) {
        callback(error, null);
    } else {
        callback(null, data);
    }
}
/* Wrapper function to Nova-Server to DELETE a VM Instance */
novaApi.delete = function(reqUrl, req, callback, stopRetry) {
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
                    novaAPIServer.api.delete(reqUrl, function(err, data) {
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

function getNovaData (novaCallObj, callback)
{
    var req = novaCallObj['req'];
    var reqUrl = novaCallObj['reqUrl'];

    novaApi.get(reqUrl, req, function(err, data) {
        callback(err, data);
    }, true);
}

function getVMStatsByProjectByAPIVersion (err, data, apiVer, callback)
{
    var VMStatsByProjectCB = getVMStatsByProjectCB[apiVer];
    if (null == VMStatsByProjectCB) {
        var str = 'Nova API Version not supported:' + apiVer;
        var error = appErrors.RESTServerError(str);
        callback(error, null);
        return;
    }
    VMStatsByProjectCB(err, data, callback);
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
        plugins.getServiceAPIVersionByReqObj(req,
                                             global.SERVICE_ENDPT_TYPE_COMPUTE,
                                             function(apiVer) {
            if (null == apiVer) {
                error = 
                    new appErrors.RESTServerError('apiVersion for NOVA is NULL');
                callback(error, null);
                return;
            }
            var reqUrlPrefix = '/' + tenantId + '/servers/detail';
            var startIndex = 0;
            novaApiGetByAPIVersionList(reqUrlPrefix, apiVer, req, startIndex, 
                                       function(err, data, ver) {
                getVMStatsByProjectByAPIVersion(err, data, ver, callback);
            });
        });
    });
}

function getServiceInstanceVMStatusByAPIVersion (err, data, apiVer, callback)
{
    var serviceInstanceVMStatusCB = getServiceInstanceVMStatusCB[apiVer];
    if (null == serviceInstanceVMStatusCB) {
        var str = 'Nova API Version not supported:' + apiVer;
        var error = appErrors.RESTServerError(str);
        callback(error, null);
        return;
    }
    serviceInstanceVMStatusCB(err, data, callback);
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
        plugins.getServiceAPIVersionByReqObj(req,
                                             global.SERVICE_ENDPT_TYPE_COMPUTE,
                                             function(apiVer) {
            if (null == apiVer) {
                error = 
                    new appErrors.RESTServerError('apiVersion for NOVA is NULL');
                callback(error, null);
                return;
            }
            var reqUrlPrefix = '/servers/' + vmRefs[0]['uuid'];
            var startIndex = 0;
            novaApiGetByAPIVersionList(reqUrlPrefix, apiVer, req, startIndex, 
                                       function (error, data, ver) {
                if ((null != error) || (null == data)) {
                    var err = 
                        new appErrors.RESTServerError('apiVersion for NOVA is NULL');
                    getServiceInstanceVMStatusByAPIVersion(err, null, null,
                                                           callback);
                    return;
                }
                for (var i = 0; i < vmRefsCnt; i++) {
                    reqUrl = '/' + ver +'/' + tenantId + '/servers/' + vmRefs[i]['uuid'];
                    novaCallObjArr[i] = {};
                    novaCallObjArr[i]['req'] = req;
                    novaCallObjArr[i]['reqUrl'] = reqUrl;
                }
                async.map(novaCallObjArr, getNovaData, function(err, data) {
                    getServiceInstanceVMStatusByAPIVersion(err, data, ver,
                                                           callback); 
                });
            });
        });
    });
}

function launchVNCByAPIVersion (data, apiVer, callback)
{
    var lnchCB = launchVNCCB[apiVer];
    if (null == lnchCB) {
        var str = 'Nova API Version not supported:' + apiVer;
        var err = appErrors.appErrors(str);
        callback(err, null);
        return;
    }
    lnchCB(err, data, callback);
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
        projectId = data.tenant.id;
        /* Now create the final req */
        plugins.getServiceAPIVersionByReqObj(request,
                                             global.SERVICE_ENDPT_TYPE_COMPUTE,
                                             function(apiVer) {
            if (null == apiVer) {
                error = 
                    new appErrors.RESTServerError('apiVersion for NOVA is NULL');
                callback(error, null);
                return;
            }

            var vncURL = '/' + projectId.toString() + "/servers/";
            if (requestParams.query.vm_id) {
                vmId = requestParams.query.vm_id;
                vncURL += vmId.toString();
            }
            var startIndex = 0;
            novaApiGetByAPIVersionList(vncURL, apiVer, request, startIndex, 
                                       function (error, data, ver) {
                if (error) {
                    callback(error, null);
                } else {
                    vncURL = '/' + ver + vncURL;
                    novaApi.post(vncURL + "/action", 
                                 {"os-getVNCConsole":{"type":"novnc"}}, 
                                 request, function (error, data) {
                        launchVNCByAPIVersion(data, ver, callback);
                    });
                }
            });
        });
    });
}

function getFlavorsByAPIVersion (err, data, apiVer, callback)
{
    var flavorsCB = getFlavorsCB[apiVer];
    if (null == flavorsCB) {
        var str = 'Nova API Version not supported:' + apiVer;
        callback(err, data);
        return;
    }
    flavorsCB(err, data, callback);
}

function novaApiGetByAPIVersionList (reqUrlPrefix, apiVerList, req, startIndex,
                                     callback)
{
    var apiVer = plugins.getApiVersion(novaAPIVerList, apiVerList, startIndex);
    if (null == apiVer) {
        var err = new appErrors.RESTServerError('apiVersion for NOVA is NULL');
        callback(err, null);
        return;
    }
    var reqUrl = '/' + apiVer['version'] + reqUrlPrefix;
    novaApi.get(reqUrl, req, function(err, data) {
        if ((null != err) || (null == data)) {
            novaApiGetByAPIVersionList(reqUrlPrefix, apiVerList, req,
                                       startIndex + 1, callback);
        } else {
            callback(null, data, apiVerList[startIndex]);
        }
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
        plugins.getServiceAPIVersionByReqObj(req,
                                             global.SERVICE_ENDPT_TYPE_COMPUTE,
                                             function(apiVer) {
            if (null == apiVer) {
                error = 
                    new appErrors.RESTServerError('apiVersion for NOVA is NULL');
                callback(error, null);
                return;
            }
            var reqUrlPrefix = '/' + tenantId + '/flavors/detail';
            var startIndex = 0;
            novaApiGetByAPIVersionList(reqUrlPrefix, apiVer, req, startIndex,
                                       function(err, data, ver) {
                getFlavorsByAPIVersion(err, data, ver, callback);
            });
        });
    });
}

function instanceActions(req, callback, action) 
{
    var tenantStr = getTenantIdByReqCookie(req);
    if(null == tenantStr) {
         /* Just return as we will be redirected to login page */
        return; 
    }
    authApi.getTokenObj(req, tenantStr, true, function(err, data){
        if(err) {
            logutils.logger.error("Error in getting token object for tenant: " + tenantStr);
            callback(err, null);
            return;
        }
        var tenantId = data['tenant']['id'];
        var serverId = req.param('serverId');
        var reqUrl = '/v1.1/' + tenantId + '/servers/' + serverId;
        var postData = '';
        if(action  === 'delete') {
            novaApi.delete(reqUrl,  req, function(err, data){
                callback(err, data);
            });
        }
        else {
            reqUrl = reqUrl + '/action';
            switch(action) {
                case 'pause':
                    postData = {"pause":null};
                    break;
                case 'resume':
                    postData = {"os-resetState": {"state": "active"}};
                    break;
                case 'suspend':
                    postData = {"suspend":null};
                    break;
                case 'soft-reboot':
                    postData = {"reboot": {"type": "SOFT"}};
                    break;
                case 'hard-reboot':
                    postData = {"reboot": {"type": "HARD"}};
                    break;
                case 'create-image':
                    var imgName = req.body['imageName'];
                    console.log("IMG-NAME:" + imgName);
                    postData = {"createImage": {"name": imgName, "metadata": {}}};
                    break;
            }
        } 
        novaApi.post(reqUrl, postData, req, function(err, data){
            callback(err, data);
        }); 
    });
}


function pauseInstance(req, callback) 
{
    instanceActions(req, callback, 'pause');
}

function resumeInstance(req, callback) 
{
    instanceActions(req, callback, 'resume');    
}

function suspendInstance(req, callback) 
{
    instanceActions(req, callback, 'suspend'); 
}

function deleteInstance(req, callback) 
{
    instanceActions(req, callback, 'delete');
}

function softRebootInstance(req, callback)
{
    instanceActions(req, callback, 'soft-reboot');
}

function hardRebootInstance(req, callback)
{
    instanceActions(req, callback, 'hard-reboot');
}

function createImage(req, callback)
{
    instanceActions(req, callback, 'create-image');    
}

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


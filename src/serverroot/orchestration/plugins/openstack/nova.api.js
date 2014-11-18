/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var rest = require('../../../common/rest.api'),
    config = process.mainModule.exports.config,
    authApi = require('../../../common/auth.api'),
    url = require('url'),
    logutils = require('../../../utils/log.utils'),
    async = require('async'),
    appErrors = require('../../../errors/app.errors.js'),
    commonUtils = require('../../../utils/common.utils'),
    httpsOp = require('../../../common/httpsoptions.api'),
    oStack = require('./openstack.api')
    ;
var novaAPIServer;

novaApi = module.exports;

var novaIP = ((config.computeManager) && (config.computeManager.ip)) ? 
    config.computeManager.ip : global.DFLT_SERVER_IP;
var novaPort = ((config.computeManager) && (config.computeManager.port)) ? 
    config.computeManager.port : '8774';

novaAPIServer = rest.getAPIServer({apiName:global.label.COMPUTE_SERVER,
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

function getHeaders(defHeaders, appHeaders)
{
    var headers = defHeaders;
    for (key in appHeaders) {
        /* App Header overrides default header */
        headers[key] = appHeaders[key];
    }
    return headers;
}

/* Function: doNovaOpCb
 */
function doNovaOpCb (reqUrl, apiProtoIP, tenantId, req, novaCallback, stopRetry,
                     appHeaders, callback)
{
    var forceAuth = stopRetry;

    authApi.getTokenObj({'req': req, 'tenant': tenantId, 'forceAuth': forceAuth}, 
                        function(err, tokenObj) {
        if ((null != err) || (null == tokenObj) || (null == tokenObj.id)) {
            if (stopRetry) {
                console.log("We are done retrying for tenantId:" + tenantId +
                            " with err:" + err);
                commonUtils.redirectToLogout(req, req.res);
            } else {
                /* Retry once again */
                console.log("We are about to retry for tenantId:" + tenantId);
                novaCallback(reqUrl, apiProtoIP, req, callback, true, appHeaders);
            }
        } else {
            console.log("doNovaOpCb() success with tenantId:" + tenantId);
            callback(err, tokenObj);
        }
    });
}         

/* Wrapper function to GET Data from Nova-Server */
novaApi.get = function(reqUrl, apiProtoIP, req, callback, stopRetry, appHeaders) {
    var headers = {};
    var forceAuth = stopRetry;
    var tenantId = getTenantIdByReqCookie(req);
    if (null == tenantId) {
        /* Just return as we will be redirected to login page */
        return;
    }

    headers['User-Agent'] = 'Contrail-WebClient';
    doNovaOpCb(reqUrl, apiProtoIP, tenantId, req, novaApi.get, stopRetry,
               appHeaders, function(err, tokenObj) {
        if ((err) || (null == tokenObj) || (null == tokenObj.id)) {
            callback(err, null);
        } else {
            headers['X-Auth-Token'] = tokenObj.id;
            novaAPIServer.api['hostname'] = apiProtoIP['ip'];
            novaAPIServer.api['port'] = apiProtoIP['port'];
            headers = getHeaders(headers, appHeaders);
		    novaAPIServer.api.get(reqUrl, function(err, data) {
                if (err) {
                    /* Just retry in case of if it fails, it may happen that failure is
                     * due to token change, so give one more change
                     */
                    if (stopRetry) {
		                callback(err, data);
                    } else {
                        novaApi.get(reqUrl, apiProtoIP, req, callback, true);
                    }
                 } else {
                    callback(err, data);
                 }
		    }, headers);
        }
    });
}

/* Wrapper function to POST data to Nova-Server */
novaApi.post = function(reqUrl, reqData, apiProtoIP, req, callback, stopRetry,
                        appHeaders) {
    var headers = {};
    var i = 0;
    var tenantId = getTenantIdByReqCookie(req);
    if (null == tenantId) {
        /* Just return as we will be redirected to login page */
        return;
    }

    headers['User-Agent'] = 'Contrail-WebClient';
    doNovaOpCb(reqUrl, apiProtoIP, tenantId, req, novaApi.post, stopRetry,
               appHeaders, function(err, tokenObj) {
        if ((err) || (null == tokenObj) || (null == tokenObj.id)) {
            callback(err, null);
        } else {
            headers['X-Auth-Token'] = tokenObj.id;
            novaAPIServer.api['hostname'] = apiProtoIP['ip'];
            novaAPIServer.api['port'] = apiProtoIP['port'];
            headers = getHeaders(headers, appHeaders);
            novaAPIServer.api.post(reqUrl, reqData, function(err, data) {
                if (err) {
                    /* Just retry in case of if it fails, it may happen that failure is
                     * due to token change, so give one more change
                     */
                    if (stopRetry) {
                      callback(err, data);
                    } else {
                        novaApi.post(reqUrl, reqData, apiProtoIP, req, callback,
                                     true, appHeaders);
                    }
                 } else {
                    callback(err, data);
                 }
            }, headers);
        }
    });
}

novaApi.delete = function (reqUrl, apiProtoIP, req, callback, stopRetry,
                           appHeaders)
{
    var headers = {};
    var i = 0;
    var tenantId = getTenantIdByReqCookie(req);
    if (null == tenantId) {
        /* Just return as we will be redirected to login page */
        return;
    }

    headers['User-Agent'] = 'Contrail-WebClient';
    doNovaOpCb(reqUrl, apiProtoIP, tenantId, req, novaApi.delete, stopRetry,
               appHeaders, function(err, tokenObj) {
        if ((err) || (null == tokenObj) || (null == tokenObj.id)) {
            callback(err, null);
        } else {
            headers['X-Auth-Token'] = tokenObj.id;
            novaAPIServer.api['hostname'] = apiProtoIP['ip'];
            novaAPIServer.api['port'] = apiProtoIP['port'];
            headers = getHeaders(headers, appHeaders);
            novaAPIServer.api.delete(reqUrl, function(err, data) {
                if (err) {
                    /* Just retry in case of if it fails, it may happen that failure is
                     * due to token change, so give one more change
                     */
                    if (stopRetry) {
                      callback(err, data);
                    } else {
                        novaApi.delete(reqUrl, apiProtoIP, req, callback,
                                     true, appHeaders);
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

var getServiceInstanceVMStatusCB = {
    'v1.1': getServiceInstanceVMStatusV11,
    'v2': getServiceInstanceVMStatusV11
}

var getFlavorsCB = {
    'v1.1': getFlavorsV11,
    'v2': getFlavorsV11
};

var launchVNCCB = {
    'v1.1' : launchVNCV11,
    'v2': launchVNCV11
};

var getOSHostListCB = {
    'v1.1': getOSHostV11,
    'v2': getOSHostV11
};

var availabilityZoneCB = {
    'v1.1': getAvailabilityZoneV11,
    'v2': getAvailabilityZoneV11
};

var portAttachSendRespCB = {
    'v1.1': portAttachSendRespV11,
    'v2': portAttachSendRespV11
};

function getOSHostV11 (err, data, callback){
    callback(err, data);
}

function getAvailabilityZoneV11 (err, data, callback){
    callback(err, data);
}

function getFlavorsV11 (err, data, callback)
{
    callback(err, data);
}

function launchVNCV11 (error, data, callback)
{
    if (error) {
        callback(error, null);
    } else {
        callback(null, data);
    }
}

function portAttachSendRespV11 (error, data, callback)
{
    if (null != error) {
        callback(error, null);
    } else {
        callback(null, data);
    } 
}

function getVMStatsByProjectV11 (err, data, callback)
{
    callback(err, data);
}

function getServiceInstanceVMStatusV11 (err, data, callback)
{
    callback(err, data);
}

function getNovaData (novaCallObj, callback)
{
    var req = novaCallObj['req'];
    var reqUrl = novaCallObj['reqUrl'];
    var apiProtoIP = novaCallObj['ver'];

    novaApi.get(reqUrl, apiProtoIP, req, function(err, data) {
        callback(err, data);
    }, true);
}

function getVMStatsByProjectByAPIVersion (err, data, apiVer, callback)
{
    var VMStatsByProjectCB = getVMStatsByProjectCB[apiVer];
    if (null == VMStatsByProjectCB) {
        var str = 'Nova API Version not supported:' + apiVer;
        var error = new appErrors.RESTServerError(str);
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

    authApi.getTokenObj({'req': req, 'tenant': tenantStr, 'forceAuth': true}, 
                        function(err, data) {
        if ((null != err) || (null == data) || (null == data['tenant'])) {
            logutils.logger.error("Error in getting token object for tenant: " +
                                  tenantStr);
            commonUtils.redirectToLogout(req, req.res);
            return;
        }
        var tenantId = data['tenant']['id'];
        oStack.getServiceAPIVersionByReqObj(req,
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
            var fallbackIndex = novaAPIVerList.length - 1;
            novaApiGetByAPIVersionList(reqUrlPrefix, apiVer, req, startIndex, 
                                       fallbackIndex, function(err, data, ver) {
                if (null != ver) {
                    ver = ver['version'];
                }
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
        var error = new appErrors.RESTServerError(str);
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

    authApi.getTokenObj({'req': req, 'tenant': tenantStr, 'forceAuth': true}, 
                        function(err, data) {
        if ((null != err)  || (null == data) || (null == data['tenant'])) {
            logutils.logger.error("Error in getting token object for tenant: " +
                                  tenantStr);
            commonUtils.redirectToLogout(req, req.res);
            return;
        }
        var tenantId = data['tenant']['id'];
        var vmRefsCnt = vmRefs.length;
        oStack.getServiceAPIVersionByReqObj(req,
                                            global.SERVICE_ENDPT_TYPE_COMPUTE,
                                            function(apiVer) {
            if (null == apiVer) {
                error = 
                    new appErrors.RESTServerError('apiVersion for NOVA is NULL');
                callback(error, null);
                return;
            }
            var reqUrlPrefix = '/' + tenantId + '/servers/' + vmRefs[0]['uuid'];
            var startIndex = 0;
            var fallbackIndex = novaAPIVerList.length - 1;
            novaApiGetByAPIVersionList(reqUrlPrefix, apiVer, req, startIndex, 
                                       fallbackIndex, function (error, data, ver) {
                if ((null != error) || (null == data) || (null == ver)) {
                    var err = 
                        new appErrors.RESTServerError('apiVersion for NOVA is NULL');
                    getServiceInstanceVMStatusByAPIVersion(err, null, null,
                                                           callback);
                    return;
                }
                for (var i = 0; i < vmRefsCnt; i++) {
                    reqUrl = '/' + ver['version'] +'/' + tenantId + '/servers/' + vmRefs[i]['uuid'];
                    novaCallObjArr[i] = {};
                    novaCallObjArr[i]['req'] = req;
                    novaCallObjArr[i]['reqUrl'] = reqUrl;
                    novaCallObjArr[i]['ver'] = ver;
                }
                async.map(novaCallObjArr, getNovaData, function(err, data) {
                    getServiceInstanceVMStatusByAPIVersion(err, data,
                                                           ver['version'],
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
        var err = new appErrors.RESTServerError(str);
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

    authApi.getTokenObj({'req': request, 'tenant':
                        requestParams.query.project_id, 'forceAuth': true}, 
                        function(error, data) {
        if (null != error) {
            logutils.logger.error("Error in getting token object for tenant: " +
                                  requestParams.query.project_id);
        }
        if (null == data) {
            logutils.logger.error("Trying to illegal access with tenantId: " +
                                  requestParams.query.project_id + 
                                  " With session: " + request.session.id);
        }
        if ((null != error) || (null == data) || (null == data.tenant)) {
            commonUtils.redirectToLogout(request, request.res);
            return;
        }

        projectId = data.tenant.id;
        /* Now create the final req */
        oStack.getServiceAPIVersionByReqObj(request,
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
            var fallbackIndex = novaAPIVerList.length - 1;
            novaApiGetByAPIVersionList(vncURL, apiVer, request, startIndex, 
                                       fallbackIndex, function (error, data, ver) {
                if ((error) || (null == ver)) {
                    callback(error, null);
                } else {
                    vncURL = '/' + ver['version'] + vncURL;
                    novaApi.post(vncURL + "/action", 
                                 {"os-getVNCConsole":{"type":"novnc"}}, 
                                 ver, request, function (error, data) {
                        launchVNCByAPIVersion(data, ver['version'], callback);
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
        if (null == err) {
            var str = 'Nova API Version not supported:' + apiVer;
            err = new appErrors.RESTServerError(str);
        }
        callback(err, null);
        return;
    }
    flavorsCB(err, data, callback);
}

function getOSHostListByAPIVersion (err, data, apiVer, callback)
{
    var osHostListCB = getOSHostListCB[apiVer];
    if (null == osHostListCB) {
        if (null == err) {
            var str = 'Nova API Version not supported:' + apiVer;
            err = new appErrors.RESTServerError(str);
        }
        callback(err, null);
        return;
    }
    osHostListCB(err, data, callback);
}

function getAvailabilityZone (err, data, apiVer, callback)
{
    var availabilityZoneListCB = availabilityZoneCB[apiVer];
    if (null == availabilityZoneListCB) {
        if (null == err) {
            var str = 'Nova API Version not supported:' + apiVer;
            err = new appErrors.RESTServerError(str);
        }
        callback(err, null);
        return;
    }
    availabilityZoneListCB(err, data, callback);
}

function novaApiGetByAPIVersionList (reqUrlPrefix, apiVerList, req, startIndex,
                                     fallbackIndex, callback)
{
    var apiVer = oStack.getApiVersion(novaAPIVerList, apiVerList, startIndex,
                                      fallbackIndex, global.label.COMPUTE_SERVER);
    if (null == apiVer) {
        var err = new appErrors.RESTServerError('apiVersion for NOVA is NULL');
        callback(err, null);
        return;
    }
    httpsOp.apiProtocolList[global.label.COMPUTE_SERVER] = apiVer['protocol'];
    var reqUrl = '/' + apiVer['version'] + reqUrlPrefix;
    novaApi.get(reqUrl, apiVer, req, function(err, data) {
        if ((null != err) || (null == data)) {
            logutils.logger.error("novaAPI GET error:" + err);
            novaApiGetByAPIVersionList(reqUrlPrefix, apiVerList, req,
                                       startIndex + 1, fallbackIndex - 1,
                                       callback);
        } else {
            callback(null, data, apiVer);
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
    authApi.getTokenObj({'req': req, 'tenant': tenantStr, 'forceAuth': true}, 
                        function(err, data) {
        if ((null != err) || (null == data) || (null == data['tenant'])) {
            logutils.logger.error("Error in getting token object for tenant: " + tenantStr);
            commonUtils.redirectToLogout(req, req.res);
            return;
        }
        var tenantId = data['tenant']['id'];
        oStack.getServiceAPIVersionByReqObj(req,
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
            var fallbackIndex = novaAPIVerList.length - 1;
            novaApiGetByAPIVersionList(reqUrlPrefix, apiVer, req, startIndex,
                                       fallbackIndex, function(err, data, ver) {
                if (null != ver) {
                    ver = ver['version'];
                }
                getFlavorsByAPIVersion(err, data, ver, callback);
            });
        });
    });
}

function getOSHostList(req, callback)
{   
    var tenantStr = getTenantIdByReqCookie(req);
    if (null == tenantStr) {
        /* Just return as we will be redirected to login page */
        return;
    }
    authApi.getTokenObj({'req': req, 'tenant': tenantStr, 'forceAuth':
                         true}, function(err, data) {
        if ((null != err) || (null == data) || (null == data['tenant'])) {
            logutils.logger.error("Error in getting token object for tenant: " + tenantStr);
            commonUtils.redirectToLogout(req, req.res);
            return;
        }
        var tenantId = data['tenant']['id'];
        oStack.getServiceAPIVersionByReqObj(req,
                                            global.SERVICE_ENDPT_TYPE_COMPUTE,
                                            function(apiVer) {
            if (null == apiVer) {
                error = 
                    new appErrors.RESTServerError('apiVersion for NOVA is NULL');
                callback(error, null);
                return;
            }
            var reqUrlPrefix = '/' + tenantId + '/os-hosts';
            var startIndex = 0;
            var fallbackIndex = novaAPIVerList.length - 1;
            novaApiGetByAPIVersionList(reqUrlPrefix, apiVer, req, startIndex,
                                       fallbackIndex, function(err, data, ver) {
                if (null != ver) {
                    ver = ver['version'];
                }
                getOSHostListByAPIVersion(err, data, ver, callback);
            });
        });
    });
}

function getAvailabilityZoneList(req, callback)
{   
    var tenantStr = getTenantIdByReqCookie(req);
    if (null == tenantStr) {
        /* Just return as we will be redirected to login page */
        return;
    }
    authApi.getTokenObj({'req': req, 'tenant': tenantStr, 'forceAuth':
                         true}, function(err, data) {
        if ((null != err) || (null == data) || (null == data['tenant'])) {
            logutils.logger.error("Error in getting token object for tenant: " + tenantStr);
            commonUtils.redirectToLogout(req, req.res);
            return;
        }
        var tenantId = data['tenant']['id'];
        oStack.getServiceAPIVersionByReqObj(req,
                                            global.SERVICE_ENDPT_TYPE_COMPUTE,
                                            function(apiVer) {
            if (null == apiVer) {
                error = 
                    new appErrors.RESTServerError('apiVersion for NOVA is NULL');
                callback(error, null);
                return;
            }
            var reqUrlPrefix = '/' + tenantId + '/os-availability-zone';
            var startIndex = 0;
            var fallbackIndex = novaAPIVerList.length - 1;
            novaApiGetByAPIVersionList(reqUrlPrefix, apiVer, req, startIndex,
                                       fallbackIndex, function(err, data, ver) {
                if (null != ver) {
                    ver = ver['version'];
                }
                getAvailabilityZone(err, data, ver, callback);
            });
        });
    });
}

function portAttachSendResp (err, data, apiVer, callback)
{
    var portAttachCB = portAttachSendRespCB[apiVer];
    if (null == portAttachCB) {
        var str = 'Nova API Version not supported:' + apiVer;
        var err = new appErrors.RESTServerError(str);
        callback(err, null);
        return;
    }
    portAttachCB(err, data, callback);
}

function portAttach (req, body, callback)
{
    var postData = body;
    var portID = postData.portID;
    var netID = postData.netID;
    var fixedIP = postData.fixedIP;
    var vmUUID = postData.vmUUID;
    var appHeaders = {};

    if (null == vmUUID) {
        var error = new appErrors.RESTServerError('Server not specified');
        callback(error, null);
        return;
    }
    var tenantStr = getTenantIdByReqCookie(req);
    if (null == tenantStr) {
        /* Just return as we will be redirected to login page */
        return;
    }
    var novaPostData = {'interfaceAttachment': {}};
    if (null != portID) {
        novaPostData['interfaceAttachment']['port_id'] = portID;
    }
    if (null != netID) {
        novaPostData['interfaceAttachment']['net_id'] = netID;
    }
    if (null != fixedIP) {
        novaPostData['interfaceAttachment']['fixed_ips'] = [];
        var fixedIPLen = fixedIP.length;
        for (var i = 0; i < fixedIPLen; i++) {
            novaPostData['interfaceAttachment']['fixed_ips'].push({'ip_address':
                                                                  fixedIP[i]});
        }
    }
    authApi.getTokenObj({'req': req, 'tenant': tenantStr, 'forceAuth':
                         true}, function(err, data) {
        if ((null != err) || (null == data) || (null == data['tenant'])) {
            logutils.logger.error("Error in getting token object for tenant: " + tenantStr);
            commonUtils.redirectToLogout(req, req.res);
            return;
        }
        var tenantId = data['tenant']['id'];
        oStack.getServiceAPIVersionByReqObj(req,
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
            var fallbackIndex = novaAPIVerList.length - 1;
            appHeaders['X-Auth-Project-Id'] = tenantStr;
            novaApiGetByAPIVersionList(reqUrlPrefix, apiVer, req, startIndex,
                                       fallbackIndex, function(err, data, ver) {
                if ((null != err) || (null == ver)) {
                    callback(err, null);
                    return;
                }
                reqUrlPrefix = '/' + tenantId + '/servers/' + vmUUID + '/os-interface';
                var reqUrl = '/' + ver['version'] + reqUrlPrefix;
                novaApi.post(reqUrl, novaPostData, ver, req,
                             function(error, data) {
                    portAttachSendResp(err, data, ver['version'], callback);
                }, false, appHeaders);
            });
        });
    }); 
}

function portDetach (req, portID, vmUUID, callback)
{
    var appHeaders = {};
    if (null == vmUUID) {
        var error = new appErrors.RESTServerError('Server not specified');
        callback(error, null);
        return;
    }
    var tenantStr = getTenantIdByReqCookie(req);
    if (null == tenantStr) {
        /* Just return as we will be redirected to login page */
        return;
    }

    authApi.getTokenObj({'req': req, 'tenant': tenantStr, 'forceAuth':
                         true}, function(err, data) {
        if ((null != err) || (null == data) || (null == data['tenant'])) {
            logutils.logger.error("Error in getting token object for tenant: " + tenantStr);
            commonUtils.redirectToLogout(req, req.res);
            return;
        }
        var tenantId = data['tenant']['id'];
        oStack.getServiceAPIVersionByReqObj(req,
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
            var fallbackIndex = novaAPIVerList.length - 1;
            appHeaders['X-Auth-Project-Id'] = tenantStr;
            novaApiGetByAPIVersionList(reqUrlPrefix, apiVer, req, startIndex,
                                       fallbackIndex, function(err, data, ver) {
                if ((null != err) || (null == ver)) {
                    callback(err, null);
                    return;
                }
                reqUrlPrefix = '/' + tenantId + '/servers/' + vmUUID + '/os-interface/' + portID;
                var reqUrl = '/' + ver['version'] + reqUrlPrefix;
                novaApi.delete(reqUrl, ver, req, function(err, data) {
                    callback(err, data);
                }, false, appHeaders);
            });
        });
    });
}

exports.launchVNC = launchVNC;
exports.getServiceInstanceVMStatus = getServiceInstanceVMStatus;
exports.getVMStatsByProject = getVMStatsByProject;
exports.getFlavors = getFlavors;
exports.getOSHostList =  getOSHostList;
exports.getAvailabilityZoneList =  getAvailabilityZoneList;
exports.novaAPIVerList = novaAPIVerList;
exports.portAttach = portAttach;
exports.portDetach = portDetach;


/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

var rest = require('../../../common/rest.api'),
    config = require('../../../../../config/config.global.js'),
    authApi = require('../../../common/auth.api'),
    plugins = require('../plugins.api'),
    appErrors = require('../../../errors/app.errors'),
    commonUtils = require('../../../utils/common.utils')
    ;
var glanceAPIServer;

glanceApi = module.exports;

var imgMgrIp = ((config.imageManager) && (config.imageManager.ip)) ? 
    config.imageManager.ip : global.DFLT_SERVER_IP;
var imgMgrPort = ((config.imageManager) && (config.imageManager.port)) ? 
    config.imageManager.port : '9292';

glanceAPIServer = rest.getAPIServer({apiName:global.label.IDENTITY_SERVER,
                                      server:imgMgrIp, port:imgMgrPort});
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

/* Function: doGlanceOpCb
 */
function doGlanceOpCb (reqUrl, tenantId, req, glanceCallback, stopRetry,
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
                glanceCallback(reqUrl, req, callback, true);
            }
        } else {
            console.log("doGlanceOpCb() success with tenantId:" + tenantId);
            callback(err, tokenObj);
        }
    });
}         

/* Wrapper function to GET Data from Glance-Server */
glanceApi.get = function(reqUrl, req, callback, stopRetry) {
    var headers = {};
    var forceAuth = stopRetry;
    var tenantId = getTenantIdByReqCookie(req);
    if (null == tenantId) {
        /* Just return as we will be redirected to login page */
        return;
    }

    headers['User-Agent'] = 'Contrail-WebClient';
    doGlanceOpCb(reqUrl, tenantId, req, glanceApi.get, stopRetry, 
                function(err, tokenObj) {
        if ((err) || (null == tokenObj) || (null == tokenObj.id)) {
            callback(err, null);
        } else {
            headers['X-Auth-Token'] = tokenObj.id;
		    glanceAPIServer.api.get(reqUrl, function(err, data) {
                if (err) {
                    /* Just retry in case of if it fails, it may happen that failure is
                     * due to token change, so give one more change
                     */
                    if (stopRetry) {
		                callback(err, data);
                    } else {
                        glanceApi.get(reqUrl, req, callback, true);
                    }
                 } else {
                    callback(err, data);
                 }
		    }, headers);
        }
    });
}

var imageListVerList = ['v1'];

var imageListCB = {
    'v1': getImageListV1
};

function getImageListV1 (err, data, callback)
{
    callback(err, data);
}

function parseImageListByAPIVersion (err, data, apiVer, callback)
{
    if (null != err) {
        imgListCB(err, data, callback);
        return;
    }
    var imgListCB = imageListCB[apiVer];
    if (null == imgListCB) {
        var str = 'Glance API Version <' + apiVer + '>' +
            ' not supported';
        var error = appErrors.RESTServerError(str);
        callback(error, null);
        return;
    }
    imgListCB(err, data, callback);
}

function glanceApiGetByAPIVersionList (reqUrlPrefix, apiVerList, req, startIndex,
                                       callback)
{
    var apiVer = plugins.getApiVersion(imageListVerList, apiVerList, startIndex);
    if (null == apiVer) {
        var err = new appErrors.RESTServerError('apiVersion <' +
                                                apiVerList.join(',') + '> for' +
                                                ' Glance is unsupported');
        callback(err, null, null);
        return;
    }   
    var reqUrl = '/' + apiVer['version'] + reqUrlPrefix;
    glanceApi.get(reqUrl, req, function(err, data) {
        if ((null != err) || (null == data)) {
            glanceApiGetByAPIVersionList(reqUrlPrefix, apiVerList, req,
                                         startIndex + 1, callback);
        } else {
            callback(null, data, apiVerList[startIndex]);
        }   
    }); 
}

function getImageList (req, callback)
{
    plugins.getServiceAPIVersionByReqObj(req,
                                         global.SERVICE_ENDPT_TYPE_IMAGE, 
                                         function(apiVer) {
        if (null == apiVer) {
            var error =
                new appErrors.RESTServerError('apiVersion for Glance is NULL');
            callback(error, null);
            return;
        }

        var glanceImagesURL = '/images';
        var startIndex = 0;
        glanceApiGetByAPIVersionList(glanceImagesURL, apiVer, req, startIndex, 
                                     function(err, data, ver) {
            parseImageListByAPIVersion(err, data, ver, callback);
        });
    });
}

exports.getImageList = getImageList;


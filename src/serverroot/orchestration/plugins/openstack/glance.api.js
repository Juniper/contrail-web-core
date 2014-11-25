/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var rest = require('../../../common/rest.api'),
    config = process.mainModule.exports.config,
    authApi = require('../../../common/auth.api'),
    appErrors = require('../../../errors/app.errors'),
    commonUtils = require('../../../utils/common.utils'),
    httpsOp = require('../../../common/httpsoptions.api'),
    oStack = require('./openstack.api'),
    logutils = require('../../../utils/log.utils')
    ;
var glanceAPIServer;

glanceApi = module.exports;

var imgMgrIp = ((config.imageManager) && (config.imageManager.ip)) ? 
    config.imageManager.ip : global.DFLT_SERVER_IP;
var imgMgrPort = ((config.imageManager) && (config.imageManager.port)) ? 
    config.imageManager.port : '9292';

glanceAPIServer = rest.getAPIServer({apiName:global.label.IMAGE_SERVER,
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
function doGlanceOpCb (reqUrl, apiProtoIP, tenantId, req, glanceCallback, 
                       stopRetry, callback)
{
    var forceAuth = stopRetry;

    authApi.getTokenObj({'req': req, 'tenant': tenantId, 'forceAuth': forceAuth}, 
                        function(err, tokenObj) {
        if ((err) || (null == tokenObj) || (null == tokenObj.id)) {
            if (stopRetry) {
                logutils.logger.debug("We are done retrying for tenantId:" +
                                      tenantId + " with err:" + err);
                commonUtils.redirectToLogout(req, req.res);
            } else {
                /* Retry once again */
                logutils.logger.debug("We are about to retry for tenantId:" +
                                      tenantId);
                glanceCallback(reqUrl, apiProtoIP, req, callback, true);
            }
        } else {
            logutils.logger.debug("doGlanceOpCb() success with tenantId:" +
                                  tenantId);
            callback(err, tokenObj);
        }
    });
}         

/* Wrapper function to GET Data from Glance-Server */
glanceApi.get = function(reqUrl, apiProtoIP, req, callback, stopRetry) {
    var headers = {};
    var forceAuth = stopRetry;
    var tenantId = getTenantIdByReqCookie(req);
    if (null == tenantId) {
        /* Just return as we will be redirected to login page */
        return;
    }

    headers['User-Agent'] = 'Contrail-WebClient';
    doGlanceOpCb(reqUrl, apiProtoIP, tenantId, req, glanceApi.get, stopRetry, 
                function(err, tokenObj) {
        if ((err) || (null == tokenObj) || (null == tokenObj.id)) {
            callback(err, null);
        } else {
            headers['X-Auth-Token'] = tokenObj.id;
            glanceAPIServer.api['hostname'] = apiProtoIP['ip'];
            glanceAPIServer.api['port'] = apiProtoIP['port'];
		    glanceAPIServer.api.get(reqUrl, function(err, data) {
                if (err) {
                    /* Just retry in case of if it fails, it may happen that failure is
                     * due to token change, so give one more change
                     */
                    if (stopRetry) {
		                callback(err, data);
                    } else {
                        glanceApi.get(reqUrl, apiProtoIP, req, callback, true);
                    }
                 } else {
                    callback(err, data);
                 }
		    }, headers);
        }
    });
}

var imageListVerList = ['v1', 'v2'];

var imageListCB = {
    'v1': getImageListV1,
    'v2': getImageListV1
};

function getImageListV1 (err, data, callback)
{
    callback(err, data);
}

function parseImageListByAPIVersion (err, data, apiVer, callback)
{
    var error = null;
    var imgListCB = imageListCB[apiVer];
    if (null == imgListCB) {
        if (null == err) {
            var str = 'Glance API Version <' + apiVer + '> not supported';
            error = new appErrors.RESTServerError(str);
        } else {
            error = err;
        }
        callback(error, null);
        return;
    }
    imgListCB(err, data, callback);
}

function glanceApiGetByAPIVersionList (reqUrlPrefix, apiVerList, req, startIndex,
                                       fallbackIndex, callback)
{
    var apiVers = "";
    var apiVer = oStack.getApiVersion(imageListVerList, apiVerList, startIndex,
                                      fallbackIndex, global.label.IMAGE_SERVER);
    var apiVerListCnt = apiVerList.length;
    for (var i = 0; i < apiVerListCnt; i++) {
        if (i != 0) {
            apiVers += ",";
        }
        apiVers += apiVerList[i]['version'];
    }
    if (null == apiVer) {
        var err = new appErrors.RESTServerError('apiVersion <' + apiVers + 
                                                '> for' +
                                                ' Glance is unsupported');
        callback(err, null, null);
        return;
    }
    var reqUrl = '/' + apiVer['version'] + reqUrlPrefix;
    httpsOp.apiProtocolList[global.label.IMAGE_SERVER] = apiVer['protocol'];
    glanceApi.get(reqUrl, apiVer, req, function(err, data) {
        if ((null != err) || (null == data)) {
            logutils.logger.error('glanceAPI GET error:' + err);
            glanceApiGetByAPIVersionList(reqUrlPrefix, apiVerList, req,
                                         startIndex + 1, fallbackIndex - 1,
                                         callback);
        } else {
            callback(null, data, apiVer['version']);
        }
    }); 
}

function getImageList (req, callback)
{
    oStack.getServiceAPIVersionByReqObj(req,
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
        var fallbackIndex = imageListVerList.length - 1;
        glanceApiGetByAPIVersionList(glanceImagesURL, apiVer, req, startIndex, 
                                     fallbackIndex, function(err, data, ver) {
            parseImageListByAPIVersion(err, data, ver, callback);
        });
    });
}

exports.getImageList = getImageList;
exports.imageListVerList = imageListVerList;


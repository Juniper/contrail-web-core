/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var rest        = require('../common/rest.api');
var global      = require('./global');
var config      = process.mainModule.exports.config;
var authApi     = require('./auth.api');
var logutils    = require('../utils/log.utils');
var appErrors   = require('../errors/app.errors');
var cgcConfig   = require('../../../webroot/config.json');
var commonUtils = require('../utils/common.utils');

var cgcServerIP = ((config.cgc) && (config.cgc.server_ip)) ?
    config.cgc.server_ip : global.DFLT_SERVER_IP;
var cgcServerPort = ((config.cgc) && (config.cgc.server_port)) ?
    config.cgc.server_port : '9500';
var cgcServer = rest.getAPIServer({apiName: global.label.CGC,
                                    server: cgcServerIP,
                                    port: cgcServerPort});

function getCGCRestApiInst (req)
{
    var oStack = require('../orchestration/plugins/openstack/openstack.api');
    var region =
        commonUtils.getValueByJsonPath(req, 'req;session;region', null, false);
    if (true == authApi.isMultiRegionSupported()) {
        var regionName = authApi.getCurrentRegion(req);
        var pubUrl = oStack.getPublicUrlByRegionName(regionName,
                                                     global.SERVICE_ENDPT_TYPE_CGC,
                                                     req);
        var verObj = oStack.getServiceApiVersionObjByPubUrl(pubUrl,
                                                            global.SERVICE_ENDPT_TYPE_CGC);
        if (null != verObj) {
            var cgcRestInst =
                rest.getAPIServer({apiName:global.label.CGC, server: verObj.ip,
                                  port: verObj.port});
            return {cgcRestAPI: cgcRestInst, mapped: verObj};
        }
    }
    return {cgcRestAPI: cgcServer, mapped: null};
}

function getCGCAllReq (req, res, next)
{
    var projectCookie = req.cookies.project;
    var tokenToUse =
        commonUtils.getValueByJsonPath(req, "session;tokenObjs;" + projectCookie
                                       + ";token;id", null, false);
    if (null != tokenToUse) {
        logutils.logger.debug("We have token for project:" + projectCookie);
        sendGohanRequest(req, res, tokenToUse);
    } else {
        /* Get the project token first */
        var authObj = {req: req, project: projectCookie};
        logutils.logger.debug("Trying to get new token for project:" +
                              projectCookie);
        authApi.getTokenObj(authObj, function(error, token, tokenObj) {
            updateTokenByProject(req,
                                 commonUtils.getValueByJsonPath(tokenObj,
                                                                "access", null),
                                 projectCookie);
            tokenToUse =
                commonUtils.getValueByJsonPath(tokenObj, "access;token;id",
                                               null);
            sendGohanRequest(req, res, tokenToUse);
        });
    }
}

function sendGohanRequest (req, res, token)
{
    var handler = require('../web/routes/handler')
    if (!handler.isSessionAuthenticated(req)) {
        commonUtils.redirectToLogout(req, res);
        return null;
    }
    var reqBody = req.body;
    var method = req.method.toLowerCase();
    var reqUrl = req.url;
    var cgcUrlPrefix =
        commonUtils.getValueByJsonPath(cgcConfig, 'gohan;url',
                                       'gohan_contrail');
    var splitArr = reqUrl.split(cgcUrlPrefix);
    if (1 == splitArr.length) {
        next();
        return;
    }
    var tmpCGCRestObj = getCGCRestApiInst(req);
    var headers = {'X-Auth-Token': token};
    if (null != tmpCGCRestObj['mapped']) {
        headers['protocol'] = tmpCGCRestObj.mapped.protocol;
    }

    var reqUrl = splitArr[1];
    if (global.HTTP_REQUEST_GET == method) {
        tmpCGCRestObj.cgcRestAPI.api.get(reqUrl, function(error, data) {
            commonUtils.handleJSONResponse(error, res, data);
            return;
        }, headers);
    } else if (global.HTTP_REQUEST_PUT == method) {
        tmpCGCRestObj.cgcRestAPI.api.put(reqUrl, reqBody, function(error, data) {
            commonUtils.handleJSONResponse(error, res, data);
            return;
        }, headers);
    } else if (global.HTTP_REQUEST_POST == method) {
        tmpCGCRestObj.cgcRestAPI.api.post(reqUrl, reqBody, function(error, data) {
            commonUtils.handleJSONResponse(error, res, data);
            return;
        }, headers);
    } else if (global.HTTP_REQUEST_DEL == method) {
        tmpCGCRestObj.cgcRestAPI.api.delete(reqUrl, function(error, data) {
            commonUtils.handleJSONResponse(error, res, data);
            return;
        }, headers);
    } else {
        logutils.logger.error('Unknown GOHAN Req Method:' + method);
        var error =
            new appErrors.RESTServerError('Unknown GOHAN Req Method:' + method);
        commonUtils.handleJSONResponse(error, res, null);
        return;
    }
}

function getCGCAuthReq (req, res, next)
{
    var handler = require('../web/routes/handler')
    if (!handler.isSessionAuthenticated(req)) {
        commonUtils.redirectToLogout(req, res);
        return null;
    }
    var reqBody = req.body;
    var method = req.method.toLowerCase();
    var reqUrl = req.url;
    var cgcAuthPrefix =
        commonUtils.getValueByJsonPath(cgcConfig, 'authUrl',
                                       '/gohan_contrail_auth');
    var splitArr = reqUrl.split(cgcAuthPrefix);
    if (1 == splitArr.length) {
        next();
        return;
    }
    var reqUrl = splitArr[1];
 
    if (-1 != reqUrl.indexOf('/tokens')) {
        /* This is a token get request */
        var authObj = {req: req, project: req.cookies.project};
        authApi.getTokenObj(authObj, function(error, token, tokenObj) {
            updateLastTokenUsed(req,
                                commonUtils.getValueByJsonPath(tokenObj,
                                                               "access;token",
                                                               null));
            commonUtils.handleJSONResponse(error, res, tokenObj);
            return;
        });
        return;
    }
    authApi.getAuthRetryData(req.session.last_token_used, req, reqUrl,
                             function(error, data) {
        updateLastTokenUsed(req, data);
        commonUtils.handleJSONResponse(error, res, data);
    });
}

function updateLastTokenUsed (req, token)
{
    if (null != token) {
        req.session.last_token_used = token;
    }
}

function updateTokenByProject (req, tokenObj, project)
{
    if (null == tokenObj) {
        return;
    }
    var tokenObjs = commonUtils.getValueByJsonPath(req, "session;tokenObjs",
                                                   null, false);
    if (null == tokenObjs) {
        req.session.tokenObjs = {};
    }
    req.session.tokenObjs[project] = tokenObj;
    updateLastTokenUsed(req, commonUtils.getValueByJsonPath(tokenObj, "token",
                                                            null));
}

exports.getCGCAllReq = getCGCAllReq;
exports.getCGCAuthReq = getCGCAuthReq;


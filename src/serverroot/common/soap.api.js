/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var http = require('http'),
    config = process.mainModule.exports["config"],
    logutils = require('../utils/log.utils'),
    messages = require('./messages'),
    appErrors = require('../errors/app.errors'),
    util = require('util'),
    commonUtils = require('../utils/common.utils'),
    configUtils = require('./config.utils'),
    restler = require('restler'),
    fs = require('fs'),
    global = require('./global'),
    httpsOp = require('./httpsoptions.api'),
    request = require('request'),
    discClient = require('./discoveryclient.api');

if (!module.parent) {
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call, 
                                     module.filename));
    process.exit(1);
}

/**
 * Constructor to API server access.
 * @param {Object} Parameters required to define a new API server
 */
function SoapAPIServer(params)
{
    var self = this;
    self.apiName = params.apiName;
    self.soapClient = params.soapClient;
    self.api = new self.API(self, self.apiName);
}

/**
 * Constructor to API.
 * @param {Object} API server object
 * @param {String} Name of the API
 */
SoapAPIServer.prototype.API = function (self, apiName)
{
    logutils.logger.debug("vcenter cfg:", self);
    self.name = apiName;
    return {
        name:apiName,
        doCall:function(dataObj, callback) {
            self.makeCall(self.soapClient, dataObj, callback);
        }
    };
};

SoapAPIServer.prototype.sendResponse = function (res, callback)
{
    var error =
        new appErrors.RESTServerError(messages.error.unexpected);
    error['custom'] = true;
    error['responseCode'] = global.HTTP_STATUS_INTERNAL_ERROR;
    if (null != res.response) {
    }
}

/**
 * Make a call to API server.
 * @param {restApi} {function} restler API based on method
 * @param {params} {object} Parameters 
 * @param {callback} {function} Callback function once response comes 
          from API Server
 */
SoapAPIServer.prototype.makeCall = function (soapClient, userData, callback)
{
    var headers = {};
    headers['SOAPAction'] = "urn:vim25/5.1";
    headers = configUtils.mergeObjects(userData['headers'], headers);
    userData['headers'] = headers;
    logutils.logger.debug("Getting userData as:", JSON.stringify(userData));
    soapClient.call(userData)
        .done(
            function(res) {
                logutils.logger.debug("getting resp as:", JSON.stringify(res));
                if ((null != res) && (null != res['data']) && 
                    (null != res['data']['Fault']) && 
                    (null != res['data']['Fault']['faultstring'])) {
                    logutils.logger.debug("getting MESSAGE AS:", JSON.stringify(res['data']));
                    var error = null;
                     error = new appErrors.SOAPServerError(res['data']['Fault']['faultstring']);
                     error['custom'] = true;
                     error['responseCode'] = global.HTTP_STATUS_INTERNAL_ERROR;
                    /*
                    TODO: Map the faultCode with HTTP Error code
                    error['responseCode'] =
                        (null != res['Fault']['faultcode']) ?
                        res['Fault']['faultcode'] :
                        global.HTTP_STATUS_INTERNAL_ERROR;
                    */
                    if (null != res.response) {
                        callback(error, res.data, res.response.header);
                    } else {
                        callback(error, res.data, null);
                    }
                } else if (null == res) {
                    var error =
                        new appErrors.RESTServerError(messages.error.unexpected);
                    error['custom'] = true;
                    error['responseCode'] = global.HTTP_STATUS_INTERNAL_ERROR;
                    //If faultstring is notAuthenticated,login and issue the request again
                    //Can't do currently as we don't store username and password in session
                    // commonUtils.redirectToLogout(req,req.res);
                    callback(error, null, null);
                } else {
                    callback(null, res.data, res.response.header);
                }
            },
            function(err) {
                callback(err, null, null);
            }
        );
}

// Export this as a module.
module.exports.getSOAPApiServer= function (params)
{
    return new SoapAPIServer(params);
};

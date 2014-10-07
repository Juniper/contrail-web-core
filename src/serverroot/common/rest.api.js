/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var http = require('http'),
	config = process.mainModule.exports.config,
	logutils = require('../utils/log.utils'),
	messages = require('./messages'),
	appErrors = require('../errors/app.errors'),
	util = require('util'),
    commonUtils = require('../utils/common.utils'),
    restler = require('restler'),
    fs = require('fs'),
    global = require('./global'),
    httpsOp = require('./httpsoptions.api'),
    request = require('request'),
    discClient = require('./discoveryclient.api');

if (!module.parent) {
	logutils.logger.warn(util.format(messages.warn.invalid_mod_call, module.filename));
	process.exit(1);
}

/**
 * Constructor to API server access.
 * @param {Object} Parameters required to define a new API server
 */
function APIServer(params)
{
	var self = this;
	self.hostname = params.server;
	self.port = params.port;
	self.xml2jsSettings = params.xml2jsSettings || {};
	self.api = new self.API(self, params.apiName);
}

/**
 * Authenticate and call the callback function on successful authentication.
 * @param {Function} Callback function
 */
APIServer.prototype.authorize = function (callback)
{
	var self = this;
	// TODO: Implement Authentication.
	self.cb(callback);
};

/**
 * Constructor to API.
 * @param {Object} API server object
 * @param {String} Name of the API
 */
APIServer.prototype.API = function (self, apiName)
{
    self.name = apiName;
	return {
		hostname:self.hostname,
		port:self.port,
		name:apiName,
		get:function (url, callback, headers) {
			var s = this,
				obj = { url:s.hostname, path:url, method:'GET', port:s.port, 
				        headers:headers, xml2jsSettings:self.xml2jsSettings };
			self.makeCall(restler.get, obj, callback, false);
		},
		post:function (url, data, callback, headers) {
			var s = this,
				obj = { url:s.hostname, path:url, method:'POST', port:s.port, 
				        data:data, headers:headers,
                        xml2jsSettings:self.xml2jsSettings};
			self.makeCall(restler.post, obj, callback, false);
		},
		put:function (url, data, callback, headers) {
			var s = this,
				obj = { url:s.hostname, path:url, method:'PUT', port:s.port, 
				        data:data, headers:headers,
                        xml2jsSettings:self.xml2jsSettings };
			self.makeCall(restler.put, obj, callback, false);
		},
		delete:function (url, callback, headers) {
			var s = this,
				obj = { url:s.hostname, path:url, method:'DELETE', port:s.port,
				        headers:headers , xml2jsSettings:self.xml2jsSettings};
			self.makeCall(restler.del, obj, callback, false);
		}
	};
};

/**
 * Check if given callback is a function and call it.
 * @param {Function} Callback function
 */
APIServer.prototype.cb = function (cb)
{
	if (typeof cb == 'function') {
		cb();
	}
};

/**
 * Update the host/port from discovery server response
 * @param {params} {object} Parameters
 */
APIServer.prototype.updateDiscoveryServiceParams = function (params)
{
    var opS = require('./opServer.api');
    var configS = require('./configServer.api');
    var server = null;
    var self = this;
    var apiServerType = self.name;
    var discService = null;

    discService = discClient.getDiscServiceByApiServerType(apiServerType);
    if (discService) {
        /* We are sending only the first IP */
        if (discService['ip-address'] != null) {
            params.url = discService['ip-address'];
        }
        if (discService['port'] != null) {
            params.port = discService['port'];
        }
    }
    return params;
}

/**
 * Make a https call to server.
 * @param {options} {object} Parameters
 * @param {callback} {function} Callback function once response comes 
 *        from Server
 */

APIServer.prototype.makeHttpsRestCall = function (options, callback)
{
    request(options, function(err, response, data) {
        callback(err, data, response);
    });
}

/** Retry the REST API Call, once it fails
 * @param {err} {object} error object got from previous error response
 * @param {restApi} {function} restler API based on method
 * @param {params} {object} Parameters
 * @param {response} {object} Response Object
 * @param {callback} {function} Callback function once response comes
 *        from Server
 * @param {isRetry} {bool} boolean flag if it is already a retry call
 */
APIServer.prototype.retryMakeCall = function(err, restApi, params, 
                                             response, callback, isRetry)
{
    var self = this;
    /* Check if the error code is ECONNREFUSED or ETIMEOUT, if yes then
     * issue once again discovery subscribe request, the remote server
     * may be down, so discovery server should send the Up Servers now
     */
    if ((true == process.mainModule.exports['discServEnable']) &&
        (('ECONNREFUSED' == err.code) || ('ETIMEOUT' == err.code))) {
        if (false == isRetry) {
            /* Only one time send a retry */
            discClient.sendDiscSubMessageOnDemand(self.name);
        }
        var reqParams = null;
        reqParams = discClient.resetServicesByParams(params, self.name);
        if (null != reqParams) {
            return self.makeCall(restApi, reqParams, callback, true);
        }
    }
    error = new appErrors.RESTServerError(util.format(err));
    error['custom'] = true;
    error['responseCode'] = ((null != response) &&
                             (null != response.statusCode)) ?
                             response.statusCode :
                             global.HTTP_STATUS_INTERNAL_ERROR;
    error['code'] = err.code;
    callback(error, '', response);
}

/**
 * Send the parsed response data to APP
 * @param {data} {object} response data either in xml/json format
 * @param {xml2jsSettings} {object} config for xml2js knob
 * @param {response} {object} response object
 * @param {callback} {function} Callback function to call once data parsing is done
 */
APIServer.prototype.sendParsedDataToApp = function(data, xml2jsSettings, 
                                                   response, callback)
{
    /* Data is xml/json format */
    restler.parsers.xml(data, function(err, xml2JsonData) {
        if (err) {
            /* This MUST be a JSON response, response can be 
             * JSON.stringify (if auto), else parsed if (json)
             */
            try {
                var JSONData = JSON.parse(data);
                callback(null, JSONData, response);
            } catch(e) {
                callback(null, data, response);
            }
        } else {
            /* XML Response */
            callback(null, xml2JsonData, response);
        }
    }, xml2jsSettings);
}

/**
 * Make a call to API server.
 * @param {restApi} {function} restler API based on method
 * @param {params} {object} Parameters 
 * @param {callback} {function} Callback function once response comes 
          from API Server
 */
APIServer.prototype.makeCall = function (restApi, params, callback, isRetry)
{
    var self = this;
    var reqUrl = null;
    var options = {};
    var data = commonUtils.getApiPostData(params['path'], params['data']);
    var method = params['method'];
    var xml2jsSettings = params['xml2jsSettings'];     
    options['headers'] = params['headers'] || {};
    options['data'] = data || {};
    options['method'] = method;
    options['headers']['Content-Length'] = (data) ? data.toString().length : 0;
    
    if ((method == 'POST') || (method == 'PUT')) {
        /* When we need to send the data along with options (POST/PUT)
           we need to specify the Content-Type as App/JSON with JSON.stringify
           of the data, otherwise, restler treats it as
           application/x-www-form-urlencoded as Content-Type and encodes
           the data accordingly
         */
        options['headers']['Content-Type'] = 'application/json';
    }
    params = self.updateDiscoveryServiceParams(params);
    options['parser'] = restler.parsers.auto;
    options = httpsOp.updateHttpsSecureOptions(self.name, options);
    if ((null != options['headers']) &&
        (null != options['headers']['protocol']) &&
        (global.PROTOCOL_HTTPS == options['headers']['protocol'])) {
        delete options['headers']['protocol'];
        reqUrl = global.HTTPS_URL + params.url + ':' + params.port + params.path;
        options['uri'] = reqUrl;
        options['body'] = options['data'];
        if (('POST' != method) && ('PUT' != method)) {
            delete options['data'];
            delete options['body'];
        }
        self.makeHttpsRestCall(options, function(err, data, response) {
            if (null != err) {
                try {
                    logutils.logger.error('URL [' + reqUrl + ']' + 
                                          ' returned error [' + 
                                          JSON.stringify(err) + ']');
                } catch(e) {
                    logutils.logger.error('URL [' + reqUrl + ']' +
                                          ' returned error [' + err + ']');
                }
                self.retryMakeCall(err, restApi, params, response, callback, false);
            } else {
                self.sendParsedDataToApp(data, xml2jsSettings, response,
                                         callback);
            }
        });
        return;
    }
    reqUrl = global.HTTP_URL + params.url + ':' + params.port + params.path;
    restApi(reqUrl, options).on('complete', function(data, response) {
        if (data instanceof Error ||
            parseInt(response.statusCode) >= 400) {
            try {
                logutils.logger.error('URL [' + reqUrl + ']' + 
                                      ' returned error [' + JSON.stringify(data) + ']');
            } catch(e) {
                logutils.logger.error('URL [' + reqUrl + ']' +
                                      ' returned error [' + data + ']');
            }
            self.retryMakeCall(data, restApi, params, response, callback, false);
        } else {
            self.sendParsedDataToApp(data, xml2jsSettings, response, callback);
        }
    });
}

// Export this as a module.
module.exports.getAPIServer = function (params)
{
	return new APIServer(params);
};

// Export this as a module.
module.exports.getSOAPApiServer= function (params)
{
    return new APIServer(params);
};

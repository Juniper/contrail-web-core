/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

var commonUtils = module.exports,
    logutils = require('./log.utils'),
    http = require('https'),
    messages = require('../common/messages'),
    util = require('util'),
    config = require('../../../config/config.global.js'),
    fs = require('fs'),
    path = require('path'),
    global = require('../common/global'),
    assert = require('assert'),
    rest = require('../common/rest.api'),
    redis = require('redis'),
    eventEmitter = require('events').EventEmitter,
    jsonPath = require('JSONPath').eval,
    mime = require('mime');

if (!module.parent) {
    logutils.logger.warn(util.format(
                         messages.warn.invalid_mod_call, module.filename));
    process.exit(1);
}

var redisClientCreateEvent = new eventEmitter();

commonUtils.putJsonViaInternalApi = function (api, ignoreError,
                                              dataObj, callback) {
    var oldDataObj = dataObj, oldCallback = callback;
    if (typeof dataObj === 'undefined' ||
        typeof oldCallback === 'undefined') {
        if (ignoreError) {
            return function (newDataObj, newCallback) {
                api.put(newDataObj.reqUrl,
                        newDataObj.data, function (error, jsonData) {
                    if (!error) {
                        newCallback(null, jsonData);
                    } else {
                        logutils.logger.error(util.format(
                            messages.error.broken_link, newUrl));
                        logutils.logger.error(error.stack);
                        // TODO: Currently ignoring if link is broken.
                        newCallback(null, null);
                    }
                });
            };
        } else {
            return function (newDataObj, newCallback) {
                api.put(newDataObj.reqUrl,
                        newDataObj.data, function (error, jsonData) {
                    if (!error) {
                        newCallback(null, jsonData);
                    } else {
                        newCallback(error);
                    }
                });
            };
        }
    } else {
        api.put(dataObj.reqUrl, dataObj.data, function (error, jsonData) {
            if (!error) {
                callback(null, jsonData);
            } else {
                if (ignoreError) {
                    logutils.logger.error(util.format(
                        messages.error.broken_link, url));
                    logutils.logger.error(error.stack);
                    // TODO: Currently ignoring if link is broken.
                    callback(null, null);
                } else {
                    callback(error);
                }
            }
        });
    }
};
/**
 * Get JSON for a url from a given API.
 * @param {Object} API Object
 * @param {Boolean} If true, callback shall be called irrespective of error
 * @param {String} Url to be fetched from API server
 * @param {Function} Callback Function
 */
commonUtils.getJsonViaInternalApi = function (api, ignoreError, url, callback) {
    var oldUrl = url, oldCallback = callback;
    if (typeof oldUrl === 'undefined' ||
        typeof oldCallback === 'undefined') {
        if (ignoreError) {
            return function (newUrl, newCallback) {
                api.get(newUrl, function (error, jsonData) {
                    if (!error) {
                        newCallback(null, jsonData);
                    } else {
                        logutils.logger.error(util.format(
                                 messages.error.broken_link, newUrl));
                        logutils.logger.error(error.stack);
                        // TODO: Currently ignoring if link is broken.
                        newCallback(null, null);
                    }
                });
            };
        } else {
            return function (newUrl, newCallback) {
                api.get(newUrl, function (error, jsonData) {
                    if (!error) {
                        newCallback(null, jsonData);
                    } else {
                        newCallback(error);
                    }
                });
            };
        }
    } else {
        api.get(url, function (error, jsonData) {
            if (!error) {
                callback(null, jsonData);
            } else {
                if (ignoreError) {
                    logutils.logger.error(util.format(
                             messages.error.broken_link, url));
                    logutils.logger.error(error.stack);
                    // TODO: Currently ignoring if link is broken.
                    callback(null, null);
                } else {
                    callback(error);
                }
            }
        });
    }
};

commonUtils.retrieveSandeshIpUrl = function(url, apiServer) {
    try {
        var serverObj = {};
        var url = url.toString();
        var pos = url.indexOf('@');
        var serverIp = url.substr(0, pos);
        var subStr = url.slice(pos + 1);
        pos = subStr.indexOf('@');
        var serverPort = subStr.substr(0, pos);
        url = subStr.slice(pos + 1);
        apiServer = apiServer({apiName:global.SANDESH_API, server:serverIp, port:serverPort });
        serverObj['apiServer'] = apiServer;
        serverObj['newUrl'] = url;
        return serverObj;
    } catch(e) {
        return null;
    }
}

doEnsureExecution = function(func, timeout, args, thisObj) {
    var timer, run, called = false;
    run = function() {
        if(!called) {
            clearTimeout(timer);
            called = true;
            func.apply(this, arguments);
        }
    };
    timer = setTimeout(run, timeout);
    return run;
}

commonUtils.getDataFromSandeshByIPUrl = function(apiServer, ignoreError, reqTimeout, url, callback) {
    var oldUrl = url, oldCallback = callback;
    if (typeof oldUrl === 'undefined' || typeof oldCallback === 'undefined') {
        if (null == reqTimeout) {
            reqTimeout = global.DEFAULT_ASYNC_REQUEST_TIMEOUT;
        }
        if (ignoreError) {
            return function (newUrl, newCallback) {
                var serverObj = commonUtils.retrieveSandeshIpUrl(newUrl, apiServer);
                if (serverObj == null) {
                    newCallback(null, null);
                } else {
                    serverObj.apiServer.api.get(serverObj.newUrl, doEnsureExecution(function (error, jsonData) {
                        if (!error) {
                            newCallback(null, jsonData);
                        } else {
                            logutils.logger.error(util.format(messages.error.broken_link, serverObj.newUrl));
                            logutils.logger.error(error.stack);
                            // TODO: Currently ignoring if link is broken.
                            newCallback(null, null);
                        }
                    }, reqTimeout));
                }
            }
        } else {
            return function (newUrl, newCallback) {
                var serverObj = commonUtils.retrieveSandeshIpUrl(newUrl, apiServer);
                if (null == serverObj) {
                    var error = new
                        appErrors.RESTServerError(util.format(messages.error.invalid_url,
                                                              serverObj.newUrl)); 
                    newCallback(error, '');
                } else {
                    serverObj.apiServer.api.get(serverObj.newUrl, doEnsureExecution(function (error, jsonData) {
                        if (!error) {
                            newCallback(null, jsonData);
                        } else {
                            newCallback(error, '');
                        }
                    }, reqTimeout));
                }
            };
        }
    } else {
        var serverObj = commonUtils.retrieveSandeshIpUrl(url, apiServer);
        if (null == serverobj) {
            var error = new
                    appErrors.RESTServerError(util.format(messages.error.invalid_url,
                                                          serverObj.newUrl)); 
                    newCallback(error, '');
        } else {
            if (null == reqTimeout) {
                reqTimeout = global.DEFAULT_ASYNC_REQUEST_TIMEOUT;
            }
            serverObj.apiServer.api.get(serverObj.newUrl, doEnsureExecution(function (error, jsonData) {
                if (!error) {
                    callback(null, jsonData);
                } else {
                    if (ignoreError) {
                        logutils.logger.error(util.format(messages.error.broken_link, serverObj.newUrl));
                        logutils.logger.error(error.stack);
                        // TODO: Currently ignoring if link is broken.
                        callback(null, null);
                    } else {
                        callback(error);
                    }
                }
            }, reqTimeout));
        }
    }
}

/**
 * Handle error (if any) and send result JSON or error text in response.
 * @param {Object} Error if any
 * @param {Object} HTTP Response
 * @param {Object} Result JSON
 */
commonUtils.handleJSONResponse = function (error, res, json) {
    if ((res.req) && (true == res.req.invalidated)) {
        /* Req timed out, we already sent the response */
        return;
    }
	if (!error) {
		res.json(global.HTTP_STATUS_RESP_OK, json);
	} else {
		logutils.logger.error(error.stack);
		if (error.custom) {
			res.send(error.responseCode, error.message);
		} else {
			res.send(error.responseCode, messages.error.unexpected);
		}
	}
};

/**
 * Handle error (if any) and send text/html or error text in response.
 * @param {Object} Error if any
 * @param {Object} HTTP Response
 * @param {Object} Data to be sent
 */
commonUtils.handleResponse = function (error, res, data) {
    if ((res.req) && (true == res.req.invalidated)) {
        /* Req timed out, we already sent the response */
        return;
    }
	if (!error) {
		res.writeHead(global.HTTP_STATUS_RESP_OK, {
			'Content-Type':'text/html'
		});
		res.end(data);
	} else {
		logutils.logger.error(error.stack);
		if (error.custom) {
			res.send(error.responseCode, error.message);
		} else {
			res.send(error.responseCode, messages.error.unexpected);
		}
	}
};

/** Returns current time in milliseconds from 1 Jan 1970, 00:00
 */
commonUtils.getCurrentTimestamp = function () {
	return new Date().getTime();
}

commonUtils.download = function (req, res) {
	var fileName = req.param('filename');
	var dir = ((config.files) && (config.files.download_path)) ?
		config.files.download_path : global.DFLT_UPLOAD_PATH;
	var file = dir + '/' + fileName;

	fs.stat(file, function (err, stats) {
		if (err) {
			res.send(err.message);
		} else {
			var filename = path.basename(file);
			var mimetype = mime.lookup(file);

			res.setHeader('Content-disposition', 'attachment; filename=' + filename);
			res.setHeader('Content-type', mimetype);

			var stream = fs.createReadStream(file);
			stream.on('error', function (err) {
				res.statusCode = 500;
				res.end(String(err));
			});
			stream.pipe(res);
		}
	});
}

commonUtils.upload = function (req, res, data) {
	var fileName = req.param('filename');
	var dir = ((config.files) && (config.files.download_path)) ?
		config.files.download_path : global.DFLT_UPLOAD_PATH;
	var filePath = dir + '/' + fileName;

	fs.writeFile(filePath, data, function (err) {
		if (err) {
			res.send(err.message);
		}
	});
}

commonUtils.getUTCTime = function(dateTime) {
    var dateTime = new Date(dateTime),
    utcDateTime, utcDateString;
    utcDateString = dateTime.toUTCString();
    utcDateTime = new Date(utcDateString).getTime();
    return utcDateTime;
};

function getCurrentUTCTime ()
{
    return commonUtils.getUTCTime(new Date().getTime());
}

//Adjust the date object by adding/subtracting the given interval(min/day/month/year)
commonUtils.adjustDate = function(dt,obj) {
    if(obj['min'] != null) {
       dt.setUTCMinutes(dt.getUTCMinutes()+obj['min'])
    }
    if(obj['day'] != null) {
       dt.setUTCDate(dt.getUTCDate()+obj['day'])
    }
    if(obj['sec'] != null) {
       dt.setTime(dt.getTime()+(obj['sec']*1000))
    }
    if(obj['ms'] != null) {
       dt.setTime(dt.getTime()+obj['ms'])
    }
    return dt;
}

/* Function: getSafeDataToJSONify
    While parsing the data from the response got from backend server, use this function
    to get the data, if input data is null, then a default value (N/A) is returned
  
    @param {data} response data object
 */  
commonUtils.getSafeDataToJSONify = function(data) {
    if (null == data) {
        return global.RESP_DATA_NOT_AVAILABLE;
    } else {
        return data;
    }
}

commonUtils.cloneObj = function(obj) {
	return JSON.parse(JSON.stringify(obj));
};

/**
 * Create Request Object used to send to Server to retrieve data.
 * @param {dataObjArr} Array of Objects to be filled with the requested parameters.
 * @param {arrIndex} Index of the array of which this dataObj needs to be filled up
 * @param {reqUrl} URL to send the request to.
 * @param {method} Requested HTTP Method, default is GET
 * @param {data} POST/PUT Data
 * @param {serverObj} Server Object got from rest.getAPIServer()
 * @param {headers} headers if any
 */
commonUtils.createReqObj = function(dataObjArr, arrIndex, reqUrl, method,
                                    data, serverObj, headers, appData) {
    /* Create the Object */
    dataObjArr[arrIndex] = {};
    dataObjArr[arrIndex]['reqUrl'] = reqUrl;
    dataObjArr[arrIndex]['method'] = method || global.HTTP_REQUEST_GET;
    dataObjArr[arrIndex]['data'] = data;
    dataObjArr[arrIndex]['headers'] = headers;
    dataObjArr[arrIndex]['serverObj'] = serverObj;
    dataObjArr[arrIndex]['appData'] = appData;
}

doPostJsonCb = function(url, error, ignoreError, jsonData, callback) {
    if (error) {
        if (ignoreError) {
            logutils.logger.error(util.format(messages.error.broken_link, url));
            logutils.logger.error(error.stack);
            callback(null, null);
        } else {
            callback(error, jsonData);
        }
    } else {
        callback(null, jsonData);
    }
}

callRestApiByParam = function(serverObj, dataObj, ignoreError, callback) {
    var method  = dataObj['method'];
    var reqUrl  = dataObj['reqUrl'];
    var headers = dataObj['headers'];
    var data    = dataObj['data'];

    if (global.HTTP_REQUEST_GET == method) {
          serverObj.api.get(reqUrl, function(err, jsonData) {
            doPostJsonCb(reqUrl, err, ignoreError, jsonData, callback);
        }, headers);
    } else if (global.HTTP_REQUEST_PUT == method) {
        serverObj.api.put(reqUrl, data, function(err, jsonData) {
            doPostJsonCb(reqUrl, err, ignoreError, jsonData, callback);
        }, headers);
    } else if (global.HTTP_REQUEST_POST == method) {
        serverObj.api.post(reqUrl, data, function(err, jsonData) {
            doPostJsonCb(reqUrl, err, ignoreError, jsonData, callback);
        }, headers);
    } else if (global.HTTP_REQUEST_DEL == method) {
        serverObj.api.delele(reqUrl, function(err, jsonData) {
            doPostJsonCb(reqUrl, err, ignoreError, jsonData, callback);
        }, headers);
    } else {
        /* Not implemented Requested Method */
        assert(0);
    }
}

/* API callRestAPI()
   private function
   This API is called by getServerResponseByRestApi() to call the rest APIs
 */
function callRestAPI (serverObj, dataObj, ignoreError, callback)
{
    var method  = dataObj['method'];
    var reqUrl  = dataObj['reqUrl'];
    var headers = dataObj['headers'];
    var data    = dataObj['data'];
    var appData = dataObj['appData'];

    if (global.HTTP_REQUEST_GET == method) {
          serverObj.apiGet(reqUrl, appData, function(err, jsonData) {
            doPostJsonCb(reqUrl, err, ignoreError, jsonData, callback);
        }, headers);
    } else if (global.HTTP_REQUEST_PUT == method) {
        serverObj.apiPut(reqUrl, data, appData, function(err, jsonData) {
            doPostJsonCb(reqUrl, err, ignoreError, jsonData, callback);
        }, headers);
    } else if (global.HTTP_REQUEST_POST == method) {
        serverObj.apiPost(reqUrl, data, appData, function(err, jsonData) {
            doPostJsonCb(reqUrl, err, ignoreError, jsonData, callback);
        }, headers);
    } else if (global.HTTP_REQUEST_DEL == method) {
        serverObj.apiDelele(reqUrl, appData, function(err, jsonData) {
            doPostJsonCb(reqUrl, err, ignoreError, jsonData, callback);
        }, headers);
    } else {
        /* Not implemented Requested Method */
        assert(0);
    }
}

/**
 * Get JSON for a url from a given API by method type.
 * @param {serverObj} API Server Object
 * @param {ignoreError} If true, callback shall be called irrespective of error
 * @param {dataObj} Object to store the data.
    It is Object with the below data:
    dataObj = {
        reqUrl: (mandatory) URL which needs to be sent to the server 
        data: (Optional) If Any data needs to be sent, it is applicable for only
              put and post type request method.
        headers: (Optional) headers if any need to be provided
        method: (Optional if Request Type is GET) Request type, 
                type is either get, post, put or delete,
        serverObj: (Optional) server where the request needs to be sent.
                Note, if this API is called as part async processing function, 
                and serverObj if used, then this serverObj the request is sent to.
                This is per reqUrl, if this API is used as part of async processing function,
                then dataObj['serverObj'] gets priority over serverObj passed as 1st argument 
                of this API.
    }
 * @param {callback} Callback Function
 */
commonUtils.getServerRespByRestApi = function (serverObj, ignoreError, dataObj, callback) {
    if (typeof dataObj === 'undefined' || typeof callback === 'undefined') {
        return function (newDataObj, newCallback) {
            callRestApiByParam((newDataObj['serverObj']) ? newDataObj['serverObj'] : serverObj,
                                newDataObj, ignoreError, newCallback);
        }
    } else {
        callRestApiByParam((dataObj['serverObj']) ? dataObj['serverObj'] : serverObj,
                            dataObj, ignoreError, callback);
    }
};

/* API getServerResponseByRestApi()
 *      This API can be used when we need to parallelly send request to multiple
 *      Servers
 * @param   {serverObj} Server Object returned by rest.getAPIServer()
 * @param   {ignoreError} if set true, then if any request fails, then it
 *              continues next request, if set false, then it returns once error
 *              occurs
 * @param   {dataObj}   Data object returned by api createReqObj()
 * @param   {callback}  callback to be called once all the request is served
 */

function getServerResponseByRestApi (serverObj, ignoreError, dataObj, callback)
{
    if (typeof dataObj === 'undefined' || typeof callback === 'undefined') {
        return function (newDataObj, newCallback) {
            callRestAPI((newDataObj['serverObj']) ? newDataObj['serverObj'] : serverObj,
                         newDataObj, ignoreError, newCallback);
        }  
    } else {
        callRestAPI((dataObj['serverObj']) ? dataObj['serverObj'] : serverObj,
                    dataObj, ignoreError, callback);
    }
};

function callAPIServerByParam (apiCallback, dataObj, ignoreError, callback)
{
    var method  = dataObj['method'];
    var reqUrl  = dataObj['reqUrl'];
    var headers = dataObj['headers'];
    var data    = dataObj['data'];
    var appData = dataObj['appData'];

    if ((global.HTTP_REQUEST_PUT == method) ||
        (global.HTTP_REQUEST_POST == method)) {
        apiCallback(reqUrl, data, appData, function(err, jsonData) {
            doPostJsonCb(reqUrl, err, ignoreError, jsonData, callback);
        }, headers);
    } else if ((global.HTTP_REQUEST_GET == method) ||
               (global.HTTP_REQUEST_DEL == method)) {
        apiCallback(reqUrl, appData, function(err, jsonData) {
            doPostJsonCb(reqUrl, err, ignoreError, jsonData, callback);
        }, headers);
    } else {
        /* Not implemented Requested Method */
        assert(0);
    }
}

commonUtils.getAPIServerResponse = function(apiCallback, ignoreError, dataObj,
                                            callback) {
    if (typeof dataObj === 'undefined' || typeof callback === 'undefined') {
        return function (newDataObj, newCallback) {
            callAPIServerByParam(apiCallback, newDataObj, ignoreError,
                                 newCallback);
        }
    } else {
        callAPIServerByParam(apiCallback, dataObj, ignoreError, callback);
    }
}

/* Function: ip2long
    This function is used to convert IP (string) to integer format
 */
commonUtils.ip2long = function(ipStr) {
    var ipl = 0;
    ipStr.split('.').forEach(function( octet ) {
        ipl<<=8;
        ipl += parseInt(octet);
    });
    return(ipl >>>0);
}

/* Function: long2ip
    This function is used to convert IP (integer) to string format
 */
commonUtils.long2ip = function(ipl) {
    return ( (ipl>>>24) +'.' +
        (ipl>>16 & 255) +'.' +
        (ipl>>8 & 255) +'.' +
        (ipl & 255) );
}

/**
 * Function: createJSONBySandeshResponse
 * public function
 * 1. This function is used to create formatted Object from the sandesh
 *    response
 */
function createJSONBySandeshResponse (resultObj, responseObj) 
{
    for (var key in responseObj) {
        try {
            resultObj[key] = 
                commonUtils.getSafeDataToJSONify(responseObj[key][0]['_']);
        } catch(e) {
            resultObj[key] = responseObj[key];
        }    
    }    
}

/** 
 * Function: createJSONBySandeshResponseArr
 * public function
 * 1. This function is used to create formatted Object Array from the Sandesh
 *    Response Array.
 * 2. It returns the last index of the result array which can be passed to this
 *    function for the next array element
 */
function createJSONBySandeshResponseArr (resultArr, responseArr, lastIndex)
{
    var j = 0; 
    try {
        var respCnt = responseArr.length;
        for (var i = 0; i < respCnt; i++) {
            j = i + lastIndex;
            resultArr[j] = {};
            commonUtils.createJSONBySandeshResponse(resultArr[j], responseArr[i]);
        }    
        return (j + 1);
    } catch(e) {
        return 0;
    }
}

/**
 * Function: createJSONByUVEResponse
 * public function
 * 1. This function is used to create formatted Object from the UVE
 *    response
 */
function createJSONByUVEResponse (resultObj, responseObj)
{
    resultObj = {};
    for (var key in responseObj) {
        try {
            resultObj[key] = responseObj[key]['#text'];
            if (null == resultObj[key]) {
                resultObj[key] = responseObj[key];
            }
        } catch(e) {
            resultObj[key] = responseObj[key];
        }
    }
    return resultObj;
}

/** 
 * Function: createJSONByUVEResponseArr
 * public function
 * 1. This function is used to create formatted Object Array from the UVE
 *    Response Array.
 * 2. It returns the last index of the result array which can be passed to this
 *    function for the next array element
 */
function createJSONByUVEResponseArr (resultArr, responseArr, lastIndex)
{
    var j = 0;
    try {
        var respCnt = responseArr.length;
        for (var i = 0; i < respCnt; i++) {
            j = i + lastIndex;
            resultArr[j] = {};
            resultArr[j] = 
                commonUtils.createJSONByUVEResponse(resultArr[j], responseArr[i]);
        }
        return (j + 1);
    } catch(e) {
        logutils.logger.debug('IN createJSONByUVEResponseArr(): JSON Parser ' +
                              'error: ' + e);
        return 0;
    }
}

/** 
 * Function: getRestAPIServer
 * public function
 * 1. This function is used to get instance of rest API. If the response is in
 *    xml format, then xml2jsSettings overrides default setting for ignoreAttrs
 *    which ignores all XML attributes and only creates text nodes
 */
function getRestAPIServer (ip, port, apiName) {
    var api = apiName || global.label.API_SERVER;
    return rest.getAPIServer({apiName: api, server:ip, port: port,
                             xml2jsSettings:
                                {ignoreAttrs: true,
                                 explicitArray: false
                                }});
}

function getWebUIRedisDBIndex () 
{
    var dbIndex = config.redisDBIndex;
    if (null == dbIndex) {
        dbIndex = global.WEBUI_DFLT_REDIS_DB;
    }
    return dbIndex;
}

function createRedisClient (redisDBIndex, callback) 
{
    var uiDB;
    var server_port = (config.redis_server_port) ?
        config.redis_server_port : global.DFLT_REDIS_SERVER_PORT;
    var server_ip = (config.redis_server_ip) ?
        config.redis_server_ip : global.DFLT_REDIS_SERVER_IP;
    var redisClient = redis.createClient(server_port,
        server_ip);
    if (typeof redisDBIndex === 'function') {
        uiDB = getWebUIRedisDBIndex();
        callback = redisDBIndex;
    } else {
        uiDB = redisDBIndex;
    }
    redisClient.select(uiDB, function(err, res) {
        if (err) {
            logutils.logger.error('Redis DB ' + uiDB + ' SELECT error:' + err);
            assert(0);
        } else {
            callback(redisClient);
        }
    });
}

function parseUVEArrayData (result, data)
{
    var len = data.length;
    for (var i = 0; i < len; i++) {
        result = [];
        result[i] = {};
        result[i]['value'] = data[i][0]['#text'];
        result[i]['source'] = data[i][1];
        if (result[i]['value'] != null) {
            return result;
        }
        if (data[i][0] instanceof Object) {
            for (var key in data[i][0]) {
                result[i]['value'] = {};
                result[i]['value'][key] = data[i][0][key];
            }
        }
    }
    return result;
}

function parseUVEObjectData (result, data)
{
    /* Check if we have #text in data, if yes, then this is the end, we can
     * directly copy the value to it */
    try {
        for (var key in data) {
            result = {};
            result[key] = data[key];
            if (result[key] == '#text') {
                continue;
            }
            result[key] = 
                commonUtils.createJSONByUVEResponse(result[key],
                                                    data[key]);
        }
    } catch(e) {
        result = data;
    }
    return result;
}

function parseUVEData (uveData)
{
    var resultJSON = {};
    var data = null;

    for (var key in uveData) {
        data = uveData[key];
        if (data instanceof Array) {
            resultJSON[key] = parseUVEArrayData(resultJSON[key], data);
        } else if (data instanceof Object) {
            resultJSON[key] = parseUVEObjectData(resultJSON[key], data);
        }
    }
    return resultJSON;
}

function parseUVEListData (uveData)
{
    var result = {};

    for (var key in uveData) {
        result[key] = uveData[key];
        for (var i = 0; i < uveData[key].length; i++) {
            try {
                data = uveData[key][i];
                data = data['value']['list']['element'];
                result[key] = [];
                result[key][i] = {};
                result[key][i]['value'] = data;
                result[key][i]['source'] = uveData[key][i]['source'];
            } catch(e) {
                result[key] = uveData[key];
            }
        }
    }
    return result;
}

function getApiPostData (url, postData)
{
    /* Cloud Stack API Service expects the post data to be in JSON.parse format, 
       whereas, other Contrail API Servers expect the data in JSON.stringify
       format.
     */
    var pos = url.indexOf('/client/api');
    if (pos == 0) {
        /* Cloud Stack API always start with /client/api */
        return postData;
    } else {
        return JSON.stringify(postData);
    }
}

function redirectToLogout (req, res) {
    var ajaxCall = req.headers['x-requested-with'];
    if (ajaxCall == 'XMLHttpRequest') {
       res.setHeader('X-Redirect-Url', '/logout');
       res.send(307, '');
    } else {
       res.redirect('/logout');
    }
}

function redirectToLogoutByAppData (appData)
{
    return redirectToLogout(appData['authObj']['req'],
                            appData['authObj']['req'].res);
}

exports.createJSONBySandeshResponseArr = createJSONBySandeshResponseArr;
exports.createJSONBySandeshResponse = createJSONBySandeshResponse;
exports.createJSONByUVEResponse = createJSONByUVEResponse;
exports.createJSONByUVEResponseArr = createJSONByUVEResponseArr;
exports.getRestAPIServer = getRestAPIServer;
exports.createRedisClient = createRedisClient;
exports.redisClientCreateEvent = redisClientCreateEvent;
exports.getWebUIRedisDBIndex = getWebUIRedisDBIndex;
exports.getCurrentUTCTime = getCurrentUTCTime;
exports.parseUVEData = parseUVEData;
exports.parseUVEListData = parseUVEListData;
exports.parseUVEObjectData = parseUVEObjectData;
exports.getApiPostData = getApiPostData;
exports.redirectToLogout = redirectToLogout;
exports.redirectToLogoutByAppData = redirectToLogoutByAppData;
exports.getServerResponseByRestApi = getServerResponseByRestApi;


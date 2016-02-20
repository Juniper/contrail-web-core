/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var commonUtils = module.exports,
    logutils = require('./log.utils'),
    http = require('https'),
    messages = require('../common/messages'),
    util = require('util'),
    config = process.mainModule.exports.config,
    fs = require('fs'),
    path = require('path'),
    global = require('../common/global'),
    assert = require('assert'),
    rest = require('../common/rest.api'),
    redis = require('redis'),
    eventEmitter = require('events').EventEmitter,
    jsonPath = require('JSONPath').eval,
    exec = require('child_process').exec,
    mime = require('mime'),
    os = require('os'),
    fs = require('fs'),
    async = require('async'),
    appErrors = require('../errors/app.errors.js'),
    downloadPath = '/var/log',
    xml2js = require('xml2js'),
    js2xml = require('data2xml')(),
    pd = require('pretty-data').pd,
    v4 = require('ipv6').v4,
    v6 = require('ipv6').v6;
    contrailPath = '/contrail',
    _ = require('underscore'),
    redisUtils = require('./redis.utils');

if (!module.parent) {
    logutils.logger.warn(util.format(
                         messages.warn.invalid_mod_call, module.filename));
    process.exit(1);
}

var parser = new xml2js.Parser();

var redisClientCreateEvent = new eventEmitter();

function putJsonViaInternalApi (api, ignoreError,
                                dataObj, callback)
{
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
function getJsonViaInternalApi (api, ignoreError, url, callback)
{
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

function retrieveSandeshIpUrl (url, apiServer, isRawData)
{
    try {
        var serverObj = {};
        var url = url.toString();
        var pos = url.indexOf('@');
        var serverIp = url.substr(0, pos);
        var subStr = url.slice(pos + 1);
        pos = subStr.indexOf('@');
        var serverPort = subStr.substr(0, pos);
        url = subStr.slice(pos + 1);
        apiServer =
            apiServer({apiName:global.SANDESH_API, server:serverIp,
                      port:serverPort, isRawData: isRawData });
        serverObj['apiServer'] = apiServer;
        serverObj['newUrl'] = url;
        return serverObj;
    } catch(e) {
        return null;
    }
}

function doEnsureExecution (func, timeout, args, thisObj)
{
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

function getDataFromSandeshByIPUrl (apiServer, ignoreError, params, url,
                                    callback)
{
    var reqTimeout = null;
    var isRawData = false;
    if (null != params) {
        reqTimeout = params['reqTimeout'];
        isRawData = params['isRawData'];
    }
    var oldUrl = url, oldCallback = callback;
    if (typeof oldUrl === 'undefined' || typeof oldCallback === 'undefined') {
        if (null == reqTimeout) {
            reqTimeout = global.DEFAULT_ASYNC_REQUEST_TIMEOUT;
        }
        if (ignoreError) {
            return function (newUrl, newCallback) {
                var serverObj = retrieveSandeshIpUrl(newUrl, apiServer,
                                                     isRawData);
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
                var serverObj = retrieveSandeshIpUrl(newUrl, apiServer,
                                                     isRawData);
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
        var serverObj = retrieveSandeshIpUrl(url, apiServer, isRawData);
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
function handleJSONResponse (error, res, json, isJson)
{
    if ((res.req) && (true == res.req.invalidated)) {
        /* Req timed out, we already sent the response */
        return;
    }
	if (!error) {
        if ((null == isJson) || (true == isJson)) {
            res.json(global.HTTP_STATUS_RESP_OK, json);
        } else {
            res.send(global.HTTP_STATUS_RESP_OK, json);
        }
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
function handleResponse (error, res, data)
{
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
function getCurrentTimestamp ()
{
	return new Date().getTime();
}

/** Returns network IP Address List
*/
function getIPAddressList()
{
    var addressList = [];
    var interfaces = os.networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];
        var ln = iface.length;
        for (var i = 0; i < ln; i++) {
            addressList.push(iface[i].address);
        }
    }
    return addressList;
}

/**validating requested host for downloading logs is local or not
*/
function isLocalAddress(ad)
{
    var addressList = getIPAddressList();
    if(addressList.length > 0) {
        for(var ip in addressList) {
            if(addressList[ip] == ad) {
                return true;
            } 		
        }
    }
    return false;
}

function createSSH2Connection (input, res, ready) {
    var conn = require('ssh2');
    var c = new conn();
    c.on('ready', function() {
        ready(c);         	
    });
    c.on('error', function(err) {
        if(err) {
            handleError('createSSH2Connection', res, err);
            return; 			
        }
    });
    c.connect({
        host : input.hostIP,
        port : 22,
        username : input.userName,
        password : input.passWord
    });   	
}
/**
This API is used to get the file from remote server
*/
function getRemoteFile(input, remotePath, localPath, res, callback)
{
    //Creating empty file in the given directory.It is required for 'sftp.fastGet' api
    var cmd='touch ' + localPath;
    executeShellCommand(cmd, function(err, stdout, stderr) {
        if(err) {
            handleError('getRemoteFile', res, err);
            return;
        }
        createSSH2Connection(input, res, function(c) {
            c.sftp(function(err, sftp) {
                if(err) {
                    handleError('getRemoteFile', res, err);
                    return;
                }
                sftp.fastGet(remotePath, localPath, function(err) {
                    c.end();
                    if(err) {
                        handleError('getRemoteFile', res, err);
                        return;
                    }
                    callback(localPath);
                });
            });           		
        }); 		
    });
}

/**It sends requested file to the web client
*/
function sendFile(file,res)
{
    fs.stat(file, function (err, stats) {
        if(err) {
            handleError('sendFile', res, err);
            return;
        }
        else {
            var filename = path.basename(file);
            var mimetype = mime.lookup(file);
            res.setHeader('Content-type', mimetype);
            res.setHeader('Content-disposition', 'attachment; filename=' + filename);
            var stream = fs.createReadStream(file);
            stream.on('error', function (err) {
                res.statusCode = global.HTTP_STATUS_INTERNAL_ERROR;
                res.end(String(err));
            });
            stream.pipe(res);
            stream.on('end', function() {
                var cmd = 'rm -f ' + file;
                executeShellCommand(cmd,function(err, stdout, stderr) {
                    if(err) {
                        handleError('sendFile', res, err);
                        return;
                    }
                });
            });
        }
    });
}

function localDirectoryListing(dir, res, callback)
{
    executeShellCommand('ls -hms ' + dir, function(err, stdout, stderr) {
        var list = [];
        if(!err) {
            var index = stdout.indexOf('\n');
            stdout = stdout.substring(index + 1, stdout.length - 1);
            stdout = stdout.replace(/\n/g,'');
            var files = stdout.split(',');
            for(var i in files) {
                var fileAttr = files[i].trim().split(' ');
                if(fileAttr[1] != undefined && fileAttr[0] != undefined && fileAttr[0] != "0") {
                    list.push({name:fileAttr[1],size:fileAttr[0]});
                }
            }
        }
        callback(err, list);
    });
}

function handleError(method, res, e)
{
    var err = new appErrors.RESTServerError(method + ' failed : ' + e.message);
    logutils.logger.debug('IN ' + method + '() ' + 'error: ' + e);
    handleJSONResponse(err, res, null);
}

function formatFileSize(n) {
    var o;
    if(n > 1073741824) {
        o = Math.round (n / 1073741824) + 'G';
    }else if(n > 1048576) {
        o = Math.round (n / 1048576) + 'M' ;
    }else if(n > 1024 ) {
        o = Math.round (n / 1024) + 'K' ;
    }else {
        o = n;
    }
    return o;
}

function getBytes(n){
    var o;
    if(n.indexOf('G') != -1) {
        n = n.split('G');
        o = n[0] * 1073741824;		
    }else if(n.indexOf('M') != -1) {
        n = n.split('M');
        o = n[0] * 1048576;
    }else if(n.indexOf('K') != -1) {
        n = n.split('K');
        o = n[0] * 1024;
    }else {
        o = n;
    }
    return o;
}

function remoteDirectoryListing(dir, input, res, callback)
{
    createSSH2Connection(input, res, function(c) {
        c.sftp(function(err, sftp) {
            if(err) {
                handleError('remoteDirectoryListing', res, err);
                return;
            }
            var actList = [];
            sftp.opendir(dir, function readdir(err, handle) {
                if(err) {
                    handleError('remoteDirectoryListing', res, err);
                    return;
                }
                sftp.readdir(handle, function(err, list) {
                    if(err) {
                        handleError('remoteDirectoryListing', res, err);
                        return;
                    }
                    for(var i in list) {
                        var fileName = list[i].filename;
                        if(fileName != '.' && fileName != '..') {
                            var fullPath = dir + '/' + fileName;
                            var fileSize = formatFileSize(list[i].attrs.size);
                            actList.push({"name":fullPath,"size":fileSize});
                        }			
                    }
                    c.end();
                    callback(err, actList);					
                });
            });
        });                 	
    });
}

function getIndex(r, name) {
   var len = r.length;
   for(var i = 0; i < len; i++) {
       if(r[i].name === name) {
           return i;
       }
   }
   return 0;
}

function excludeDirectories (r)
{
    var k = [];
    k = cloneObj(r);
    for(var i in k) {
        var name = k[i].name;
        if(name.indexOf('.') == -1) {
            i = getIndex(r, name);
            r.splice(i,1);
        }
    }
}

function directory (req, res, appData)
{
    try {
        //read the inputs
        var reqData = req.body;
        var userName = reqData['userName'];
        var passWord = reqData['passWord'];
        var hostIPAddress = reqData["hostIPAddress"];
        //read the log directory from the config
        var remoteDir = downloadPath;
        if(isLocalAddress(hostIPAddress)) {
            localDirectoryListing(remoteDir, res, function(err, list) {
                if(err) {
                    handleError("localDirectoryListing", res, err);
                    return;
                }
                if(list.length > 0 ) {
                    excludeDirectories(list);
                    //get contrail logs
                    remoteDir = remoteDir + contrailPath;
                    localDirectoryListing(remoteDir, res, function(childErr, childList){
                        var finalList = list;
                        if(childList.length > 0) {
                            finalList = list.concat(childList);
                        }
                        handleJSONResponse(childErr, res, finalList);
                    });
                }
            });

        }else {
            var input = {'hostIP' : hostIPAddress, 'userName' : userName, 'passWord' : passWord};
            remoteDirectoryListing(remoteDir, input, res, function(err,list) {
                if(err) {
                    handleError("remoteDirectoryListing", res, err);
                    return;
                }
                if(list.length > 0) {
                    excludeDirectories(list);
                    //get contrail logs
                    remoteDir = remoteDir + contrailPath;
                    remoteDirectoryListing(remoteDir, input, res ,function(err,childList) {
                        var finalList = list;
                        if(childList.length > 0) {
                            finalList = list.concat(childList);
                        }
                        handleJSONResponse(err, res, finalList);
                    });
                }
            });
        }
    }catch(e) {
        var err = new appErrors.RESTServerError("directoryListing failed : " + e.message);
        logutils.logger.debug('IN directory() ' + 'error: ' + e);		
        handleJSONResponse(err, res, null);
    }
}

/**Download API for the log file downloading feature
*/
function download (req, res, appData)
{
    try {
        //read the inputs
        var fileName = req.param('file');
        var userName = req.param('userName');
        var passWord = req.param('passWord');
        var hostIPAddress = req.param("hostIPAddress");
        var fileSize = req.param('size');

        //read the log directory from the config
        var localDir = ((config.files) && (config.files.download_path)) ?
            config.files.download_path : global.DFLT_UPLOAD_PATH;
        //var remoteDir = downloadPath;
        var file;
        if(isLocalAddress(hostIPAddress)) {
            file = fileName;
            sendFile(file, res);    				
        }else {
            //check whether enough space is there in /tmp or not
            executeShellCommand('df -h ' + localDir, function(err, stdout, stderr) {
                if(err) {
                    handleError('download', res, err);
                    return;
                }
                var arry = stdout.split(' ');
                var fileSizeInBytes = getBytes(fileSize);
                var dirAvalSpaceInBytes = getBytes(arry[35]);
                if(dirAvalSpaceInBytes < fileSizeInBytes) {
                    var err = {};
                    err.message = 'There is no enough space in /tmp directory.';
                    handleError('download', res, err);
                    return;
                }else {
                    var fileNameArr = fileName.split('/');
                    var actFileName = fileNameArr[fileNameArr.length -1];
                    file = localDir + '/' + actFileName;
                    remoteDir =  fileName;
                    var input = {'hostIP' : hostIPAddress, 'userName' : userName, 'passWord' : passWord};
                    getRemoteFile(input, remoteDir, file, res, function(r){
                       if(r) sendFile(r, res);
                    })				
                }
            });
        }
    }
    catch(e) {
        var err = new appErrors.RESTServerError("Download failed : " + e.message);
        logutils.logger.debug('IN download() ' + 'error: ' + e);		
        handleJSONResponse(err, res, null);
    }
}

function upload (req, res, data)
{
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

function getUTCTime (dateTime)
{
    var dateTime = new Date(dateTime),
    utcDateTime, utcDateString;
    utcDateString = dateTime.toUTCString();
    utcDateTime = new Date(utcDateString).getTime();
    return utcDateTime;
};

function getCurrentUTCTime ()
{
    return getUTCTime(new Date().getTime());
}

//Adjust the date object by adding/subtracting the given interval(min/day/month/year)
function adjustDate (dt,obj)
{
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
function getSafeDataToJSONify (data)
{
    if (null == data) {
        return global.RESP_DATA_NOT_AVAILABLE;
    } else {
        return data;
    }
}

function cloneObj (obj)
{
	return JSON.parse(JSON.stringify(obj));
};

/**
 * Create Request Object used to send to Server to retrieve data.
 * @param {dataObjArr} Array of Objects to be filled with the requested parameters.
 * @param {reqUrl} URL to send the request to.
 * @param {method} Requested HTTP Method, default is GET
 * @param {data} POST/PUT Data
 * @param {serverObj} Server Object got from rest.getAPIServer()
 * @param {headers} headers if any
 */
function createReqObj (dataObjArr, reqUrl, method,
                       data, serverObj, headers, appData)
{
    var tempData = {};
    /* Create the Object */
    tempData['reqUrl'] = reqUrl;
    tempData['method'] = method || global.HTTP_REQUEST_GET;
    tempData['data'] = data;
    tempData['headers'] = headers;
    tempData['serverObj'] = serverObj;
    tempData['appData'] = appData;
    dataObjArr.push(tempData);
}

function doPostJsonCb (url, error, ignoreError, jsonData, callback)
{
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

function callRestApiByParam (serverObj, dataObj, ignoreError, callback)
{
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
        serverObj.apiDelete(reqUrl, appData, function(err, jsonData) {
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
function getServerRespByRestApi (serverObj, ignoreError, dataObj, callback)
{
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

function getAPIServerResponse (apiCallback, ignoreError, dataObj,
                               callback)
{
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
function ip2long (ipStr)
{
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
function long2ip (ipl)
{
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
                getSafeDataToJSONify(responseObj[key][0]['_']);
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
    if (typeof redisDBIndex === 'function') {
        uiDB = getWebUIRedisDBIndex();
        callback = redisDBIndex;
    } else {
        uiDB = redisDBIndex;
    }
    redisUtils.createRedisClientAndWait(server_port, server_ip, uiDB, callback);
}

/* Function: flushRedisDB
    Used to flush the Redis DB
 */
function flushRedisDB (redisDB, callback)
{
    var server_port = (config.redis_server_port) ?
        config.redis_server_port : global.DFLT_REDIS_SERVER_PORT;
    var server_ip = (config.redis_server_ip) ?
        config.redis_server_ip : global.DFLT_REDIS_SERVER_IP;
    var redisClient = redis.createClient(server_port,
        server_ip);
    redisClient.select(redisDB, function(err, res) {
        if (null != err) {
            logutils.logger.error("Redis DB " + redisDB + " SELECT failed");
            redisClient.quit(function(err) {
                callback();
            });
            return;
        }
        redisClient.flushdb(function(err) {
            if (null != err) {
                logutils.logger.error("Redis FLUSHDB " + redisDB + " error:" +
                                      err);
            } else {
                logutils.logger.debug("Redis FLUSHDB "+ redisDB + " done");
            }
            redisClient.quit(function(err) {
                callback();
            });
        });
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

function redirectToLogout (req, res, callback)
{
    //If URL has '/vcenter',then redirect to /vcenter/logout
    //x-orchestrationmode is set only for ajax requests,so if user changes browser URL then we need to check for loggedInOrchestrationMode
    if(req.headers['x-orchestrationmode'] != null && req.headers['x-orchestrationmode'] == 'vcenter') {
        redURL = '/vcenter/logout';
    } else if(req.headers['x-orchestrationmode'] != null && req.headers['x-orchestrationmode'] == 'none') {
        redURL = '/logout';
    } else if(req['originalUrl'].indexOf('/vcenter') > -1) {
        redURL = '/vcenter/logout';
    } else {
        redURL = '/logout';
    }
    redirectToURL(req, res, redURL);
    if (null != callback) {
        callback();
    }
}

function redirectToLogin (req, res)
{
    if(req.headers['x-orchestrationmode'] != null && req.headers['x-orchestrationmode'] == 'vcenter') {
        redURL = '/vcenter/login';
    } else if(req.headers['x-orchestrationmode'] != null && req.headers['x-orchestrationmode'] == 'none') {
        redURL = '/login';
    } else if(req['originalUrl'].indexOf('/vcenter') > -1) {
        redURL = '/vcenter/login';
    } else {
        redURL = '/login';
    }
    redirectToURL(req, res, redURL);
}

function redirectToURL(req, res, redURL)
{
    var ajaxCall = req.headers['x-requested-with'];
    if (ajaxCall == 'XMLHttpRequest') {
       res.setHeader('X-Redirect-Url', redURL);
       var userAgent = req.headers['user-agent'];
       if (null == userAgent) {
           /* We must not come here */
           logutils.logger.error("We did not find user-agent in req header");
           res.send(307, '');
           return;
       }
       if ((-1 != userAgent.indexOf('MSIE')) ||
           (-1 != userAgent.indexOf('Trident'))) {
           /* In IE Browser, response code 307, does not lead the browser to
            * redirect to certain URL, so sending 200 responseCode
            */
           res.send(200, '');
       } else {
           res.send(307, '');
       }
    } else {
       res.redirect(redURL);
    }
}

function redirectToLogoutByAppData (appData)
{
    return redirectToLogout(appData['authObj']['req'],
                            appData['authObj']['req'].res);
}

function executeShellCommand (cmd, callback)
{
    exec(cmd, function(error, stdout, stderr) {
         callback(error, stdout, stderr);
    });
}

function copyObject(dest, src)
{
    for (key in src) {
        dest[key] = src[key];
    }
    return dest;
}

/* Function: readFileAndChangeContent
   This function is used to replace originalStr with changeStr in a file located
   in path
 */
function readFileAndChangeContent (path, originalStr, changeStr, callback)
{
    var contentStr = "";
    fs.readFile(path, function(err, content) {
        if (null != err) {
            callback(err, err);
            return;
        }
        try {
            contentStr = content.toString();
        } catch(e) {
            contentStr = content + "";
        }
        var newContent = contentStr.replace(originalStr, changeStr);
        callback(null, newContent);
    });
}

/* Function: changeFileContentAndSend
   This function is used to send the file content to client after replacing the
   originalStr with changeStr in a file located in path
 */
function changeFileContentAndSend (response, path, originalStr, changeStr, callback)
{
    var errStr = "";
    readFileAndChangeContent(path, originalStr, changeStr,
                             function(err, content) {
        if (null != err) {
            response.writeHead(global.HTTP_STATUS_INTERNAL_ERROR);
            try {
                errStr = err.toString();
            } catch(e) {
                errStr = err + "";
            }
            response.write(errStr);
            response.end();
            callback();
            return;
        }
        response.writeHead(global.HTTP_STATUS_AUTHORIZATION_FAILURE);
        response.write(content);
        response.end();
        callback();
    });
}

function getOrchestrationPluginModel (req, res, appData)
{
    var plugins = require('../orchestration/plugins/plugins.api');
    var modelObj = plugins.getOrchestrationPluginModel();
    commonUtils.handleJSONResponse(null, res, modelObj);
}

/* Function: getWebServerInfo
   Req URL: /api/service/networking/web-server-info
   Send basic information about Web Server
 */
function getWebServerInfo (req, res, appData)
{
    var plugins = require('../orchestration/plugins/plugins.api');
    var serverObj = plugins.getOrchestrationPluginModel(),
        featurePackages = config.featurePkg,
        ui = config.ui;

    if (null == serverObj) {
        /* We will not come here any time */
        logutils.logger.error("We did not get Orchestration Model");
        assert(0);
    }
    serverObj ['serverUTCTime'] = commonUtils.getCurrentUTCTime();
    serverObj['hostName'] = os.hostname();
    serverObj['role'] = req.session.userRole;
    serverObj['featurePkg'] = {};
    serverObj['uiConfig'] = ui;
    serverObj['discoveryEnabled'] = getValueByJsonPath(config,
                                                       'discoveryService;enable',
                                                       true);
    serverObj['configServer'] = {};
    serverObj['configServer']['port'] = getValueByJsonPath(config,
                                                    'cnfg;server_port',
                                                     null);
    serverObj['configServer']['ip'] = getValueByJsonPath(config,
            'cnfg;server_ip',
             null);
    var pkgList = process.mainModule.exports['pkgList'];
    var pkgLen = pkgList.length;
    var activePkgs = [];
    for (var i = 1; i < pkgLen; i++) {
        activePkgs.push(pkgList[i]['pkgName']);
    }
    /* It may happen that user has written same config multiple times in config
     * file
     */
    activePkgs = _.uniq(activePkgs);

    serverObj['loggedInOrchestrationMode'] = req.session.loggedInOrchestrationMode;
    serverObj['insecureAccess'] = config.insecure_access;
    serverObj['sessionExpiresAt'] = req.session.sessionExpiresAt;

    var pkgCnt = activePkgs.length;
    if (!pkgCnt) {
        commonUtils.handleJSONResponse(null, res, serverObj);
        return;
    }
    for (var i = 0; i < pkgCnt; i++) {
        serverObj['featurePkg'][activePkgs[i]] = true;
    }

    var project = req.param('project');
    var tokenObjs = req.session.tokenObjs;
    if ((null != tokenObjs) && (null != tokenObjs[project])) {
        /* We already fetched */
        commonUtils.handleJSONResponse(null, res, serverObj);
        return;
    }
    var adminProjList = authApi.getAdminProjectList(req);
    var tokenId = null;
    if ((null != adminProjList) && (adminProjList.length > 0)) {
        var adminProjCnt = adminProjList.length;
        for (var i = 0; i < adminProjCnt; i++) {
            if ((null != tokenObjs) && (null != tokenObjs[adminProjList[i]])) {
                tokenId = getValueByJsonPath(tokenObjs[adminProjList[i]],
                                             'token;id', null);
                if (null != tokenId) {
                    break;
                }
            }
        }
    }

    var userObj = {'tokenid': tokenId, 'tenant': project, 'req': req};
    var authApi = require('../common/auth.api');
    authApi.getUIUserRoleByTenant(userObj, function(err, roles) {
        if (null == roles) {
            /* We did not find the project role, so redirect to login */
            logutils.logger.error('We did not get the project in keystone or role' +
                                  ' not assigned, redirecting to login.');
            redirectToLogout(req, res);
            return;
        }
        /* Do not update the role, we will enable it when RBAC is supported in
         * API Server
         */
        /*
        if ((null == err) && (null != roles)) {
            serverObj['role'] = roles;
        }
        */
        commonUtils.handleJSONResponse(null, res, serverObj);
    });
}

function getUserRoleListPerTenant (req, res, callback)
{
    var authApi = require('../common/auth.api');
    var userRolesObj = {};
    var project = req.param('project');
    try {
        var tokenObjs = req.session.tokenObjs;
    } catch(e) {
        redirectToLogout(req, res);
        return;
    }
    var rolesPerTenant = {};
    if (null == tokenObjs) {
        redirectToLogout(req, res);
        return;
    }
    if (null != project) {
        var roles =
            commonUtils.getValueByJsonPath(tokenObjs[project],
                                           'user;roles', null);
        if (null != roles) {
            var uiRoles = authApi.getUIRolesByExtRoles(req, roles);
            userRolesObj[project] = uiRoles;
            commonUtils.handleJSONResponse(null, res, userRolesObj);
            return;
        }
        /* We did not find the project, so issue a new call to get the roles
         */
        var tokenObjs = req.session.tokenObjs;
        for (key in tokenObjs) {
            var tokenId = tokenObjs[key]['token']['id'];
            break;
        }
        var userObj = {'tokenid': tokenId, 'tenant': project, 'req': req};
        authApi.getExtUserRoleByTenant(userObj, function(error, tokenData) {
            if ((null != error) || (null == tokenData)) {
                logutils.logger.error("Roles not found.." +
                                      "Redirecting to login page");
                redirectToLogout(req, res);
                return;
            }
            roles = tokenData['roles'];
            var uiRoles = authApi.getUIRolesByExtRoles(req, roles);
            userRolesObj[project] = uiRoles;
            handleJSONResponse(null, res, userRolesObj);
        });
        return;
    }
    /* Request for all tokens */
    for (var key in tokenObjs) {
        var roles =
            commonUtils.getValueByJsonPath(tokenObjs[key],
                                           'user;roles', null);
        if (null == roles) {
            logutils.logger.error("Roles not found for project " +
                                  key + " ..Redirecting to login page");
            redirectToLogout(req, res);
            return;
        }
        rolesPerTenant[key] = authApi.getUIRolesByExtRoles(req, roles);
    }
    handleJSONResponse(null, res, rolesPerTenant);
}

function mergeAllPackageList (serverType)
{
    var tmpPkgNameObjs = {};
    var pkgList = [];
    pkgList.push(require('../../../webroot/common/api/package.js').pkgList);
    for (key in config.featurePkg) {
        if (null != tmpPkgNameObjs[key]) {
            /* Already added, user has mistakenly added twice same config */
            continue;
        }
        if ((config.featurePkg[key]) && (config.featurePkg[key]['path']) &&
            ((null == config.featurePkg[key]['enable']) ||
             (true == config.featurePkg[key]['enable'])) &&
            (true == fs.existsSync(config.featurePkg[key]['path'] +
                                   '/webroot/common/api/package.js'))) {
            pkgList.push(require(config.featurePkg[key]['path'] +
                                 '/webroot/common/api/package.js').pkgList);
            tmpPkgNameObjs[key] = true;
        }
    }
    logutils.logger.debug("Built Package List as:" + JSON.stringify(pkgList));
    return pkgList;
}

function getAllJsons (menuDir, callback)
{
    var fileName = menuDir + '/menu.xml';
    fs.readFile(fileName, function(err, content) {
        parser.parseString(content, function(err, content) {
            callback(err, content);
            return;
        });
    });
}

function createEmptyResourceObj (obj)
{
    if (null == obj) {
        obj = {};
    }
    obj['resources'] = [];
    obj['resources'][0] = {};
    obj['resources'][0]['resource'] = [];
    return obj['resources'];
}

function flattenResourceObjArr (resArr)
{
    var tmpResKeyArr = [];
    var tmpResKeyObjs = {};
    var len = resArr.length;
    for (var i = 0; i < len; i++) {
        tmpResKeyArr = [];
        for (key in resArr[i]) {
            tmpResKeyArr.push(key);
        }
        tmpResKeyArr.sort();
        var keysLen = tmpResKeyArr.length;
        var val = "";
        val += tmpResKeyArr.join(':');
        val += ":";
        for (var j = 0; j < keysLen; j++) {
            val += resArr[i][tmpResKeyArr[j]].join(':');
        }
        tmpResKeyObjs[tmpResKeyArr.join(':')] = {value: val, index: i};
    }
    return tmpResKeyObjs;
}

function mergeResourceObjs (obj1, obj2)
{
    if (null == obj2['resources']) {
        return obj1;
    }
    if (null == obj1['resources']) {
        obj1['resources'] = createEmptyResourceObj(obj1);
    }
    var resObjs1 = flattenResourceObjArr(obj1['resources'][0]['resource']);
    var resObjs2 = flattenResourceObjArr(obj2['resources'][0]['resource']);
    for (key in resObjs1) {
        if ((null != resObjs2[key]) &&
            (resObjs1[key]['value'] == resObjs2[key]['value'])) {
            obj2['resources'][0]['resource'].splice(resObjs2[key].index, 1);
        }
    }

    obj1['resources'][0]['resource'] =
        obj1['resources'][0]['resource'].concat(obj2['resources'][0]['resource']);
    return obj1;
}

function mergeMenuItems (obj1, obj2)
{
    var found = false;
    if (obj1['label'][0] == obj2['label'][0]) {
        obj1 = mergeResourceObjs(obj1, obj2);
        found = true;
        var itemObj1 = obj1['items'][0]['item'];
        var itemObj2 = obj2['items'][0]['item'];
        var itemObj1Len = itemObj1.length;
        var itemObj2Len = itemObj2.length;

        for (var i = 0; i < itemObj2Len; i++) {
            for (var j = 0; j < itemObj1Len; j++) {
                if (itemObj1[j]['label'][0] == itemObj2[i]['label'][0]) {
                    itemObj1[j] = mergeResourceObjs(itemObj1[j], itemObj2[i]);
                    break;
                }
            }
            if (j == itemObj1Len) {
                /* Not found so push it */
                itemObj1.push(itemObj2[i]);
            }
        }
    }
    return {obj: obj1, found: found};
}

function createResourceObject (obj)
{
    if ((null != obj['js']) || (null != obj['view']) ||
        (null != obj['class']) || (null != obj['rootDir']) ||
        (null != obj['css'])) {// || (null != obj['access'])) {
        obj['resources'] = [];
        obj['resources'][0] = {};
        obj['resources'][0]['resource'] = [];
        obj['resources'][0]['resource'][0] = {};
        if (null != obj['rootDir']) {
            obj['resources'][0]['resource'][0]['rootDir'] = obj['rootDir'];
            delete obj['rootDir'];
        }
        if (null != obj['js']) {
            obj['resources'][0]['resource'][0]['js'] = obj['js'];
            delete obj['js'];
        }
        if (null != obj['view']) {
            obj['resources'][0]['resource'][0]['view'] = obj['view'];
            delete obj['view'];
        }
        if (null != obj['css']) {
            obj['resources'][0]['resource'][0]['css'] = obj['css'];
            delete obj['css'];
        }
        if (null != obj['class']) {
            obj['resources'][0]['resource'][0]['class'] = obj['class'];
            delete obj['class'];
        }
        /*
        if (null != obj['access']) {
            obj['resources'][0]['resource'][0]['access'] = obj['access'];
            delete obj['access'];
        }
        */
    }
    return obj;
}

function checkAndCreateResourceObject (obj, isDeep)
{
    if (null != obj['resources']) {
        return obj;
    }
    obj = createResourceObject(obj);
    if (true == isDeep) {
        if ((null != obj['items']) && (null != obj['items'][0]['item'])) {
            var cnt = obj['items'][0]['item'].length;
            for (var i = 0; i < cnt; i++) {
                obj['items'][0]['item'][i] =
                    createResourceObject(obj['items'][0]['item'][i]);
            }
        }
    }
    return obj;
}

function convertResourceObject (object)
{
    var obj = object['items'][0]['item'];
}

function mergeMenuObjects (menuObj1, menuObj2)
{
    var found = false;
    var itms1 = menuObj1['menu']['items'][0]['item'];
    var itms2 = menuObj2['menu']['items'][0]['item'];

    var itms1Len = itms1.length;
    var itms2Len = itms2.length;
    for (var k = 0; k < itms2Len; k++) {
        found = false;
        for (var l = 0; l < itms1Len; l++) {
            itms1[l] = checkAndCreateResourceObject(itms1[l], false);
            itms2[k] = checkAndCreateResourceObject(itms2[k], false);
            if (itms1[l]['label'][0] == itms2[k]['label'][0]) {
                itms1[l] = mergeResourceObjs(itms1[l], itms2[k]);
                found = true;
                if ((null == itms2[k]['items']) ||
                    (null == itms2[k]['items'][0]) ||
                    (null == itms2[k]['items'][0]['item'])) {
                    continue;
                }
                if ((null == itms1[l]['items']) ||
                    (null == itms1[l]['items'][0]) ||
                    (null == itms1[l]['items'][0]['item'])) {
                    itms1[l]['items'] = [];
                    itms1[l]['items'][0] = {};
                    itms1[l]['items'][0] = itms2[k]['items'][0];
                    continue;
                }
                var items1 = itms1[l]['items'][0]['item'];
                var items2 = itms2[k]['items'][0]['item'];

                var items1Len = items1.length;
                var items2Len = items2.length;
                for (var i = 0; i < items2Len; i++) {
                    for (var j = 0; j < items1Len; j++) {
                        items1[j] = checkAndCreateResourceObject(items1[j],
                                                                 true);
                        items2[i] = checkAndCreateResourceObject(items2[i], true);
                        var newObj = mergeMenuItems(items1[j], items2[i]);
                        items1[j] = newObj['obj'];
                        objFound = newObj['found'];
                        if (true == objFound) {
                            break;
                        }
                    }
                    if (false == objFound) {
                        items1.push(items2[i]);
                    }
                }
                break;
            }
        }
        if (found == false) {
            itms1.push(itms2[k]);
        }
    }
    return menuObj1;
}

var featurePkgToMenuNameMap = {
    'webController': 'wc',
    'webStorage': 'ws',
    'serverManager': 'sm'
};

function mergeAllMenuXMLFiles (pkgList, mergePath, callback)
{
    var pkgLen = pkgList.length;
    var featureArr = [];
    var mFileName = 'menu.xml';

    for (var i = 1; i < pkgLen; i++) {
        /* i = 0; => contrail-web-core, so ignore this one */
        var pkgName = pkgList[i]['pkgName'];
        if (null != featurePkgToMenuNameMap[pkgName]) {
            featureArr.push(featurePkgToMenuNameMap[pkgName]);
        }
    }
    if (featureArr.length > 0) {
        featureArr.sort();
        mFileName = 'menu_' + featureArr.join('_') + '.xml';
    }

    var writeFile = mergePath + '/' + mFileName;
    var cmd = 'rm -f ' + writeFile;
    exec(cmd, function(error, stdout, stderr) {
         mergeFeatureMenuXMLFiles(pkgList, mergePath, mFileName, callback);
    });
}

/** Array: customMenuChangeCB
  * Holds for all the custom menu handlers
      pkgList : List of packages (if installed) for which the handler should
                be applied.
      CB      : The callback
  */
var customMenuChangeCB = [
    {
        pkgList: ['webController', 'webStorage'],
        CB: controllerStorageMenuChangeCB
    }
];

/** Function: controllerStorageMenuChangeCB
  * This function is used to do custom change of menu when
  * webController/webStorage package is installed.
  * Custom Changes:
  *     1. Under Monitor -> Storage should come before Debug Menu item.
  */
function controllerStorageMenuChangeCB (pkgList, resJson)
{
    try {
        var items = resJson['menu']['items'][0]['item'][0]['items'][0]['item'];
    } catch(e) {
        logutils.logger.error("Something REALLY wrong happened:" + e);
        return resJson;
    }

    /* Put Debug Menu before Storage Menu */
    var tmp = items[2];
    items[2] = items[3];
    items[3] = tmp;
    return resJson;
}

/** Function: getCustomeMenuChangeHandler
  * This function is used to get the custom menu change handler based on the
  * number of packages installed
  */
function getCustomeMenuChangeHandler (pkgList)
{
    var pkgLen = pkgList.length;
    var pkgName = "";
    var pkgNameList = [];

    /* We should exclude core pkg to compute */
    for (var i = 1; i < pkgLen; i++) {
        pkgNameList.push(pkgList[i]['pkgName']);
    }
    pkgNameList.sort();
    var pkgName = pkgNameList.join();
    var customMenuChangeCBLen = customMenuChangeCB.length;
    for (var i = 0; i < customMenuChangeCBLen; i++) {
        if (pkgLen - 1 != customMenuChangeCB[i]['pkgList'].length) {
            continue;
        }
        var cbPkgNameList = customMenuChangeCB[i]['pkgList'].sort();
        var cbPkgName = cbPkgNameList.join();
        if (cbPkgName == pkgName) {
            return customMenuChangeCB[i]['CB'];
        }
    }
    return null;
}

/** Function: customMenuChange
  * This function is used to change the menu positions based on the packages
  * installed
  */
function customMenuChange (pkgList, resMenuObj)
{
    var menuCB = getCustomeMenuChangeHandler(pkgList);
    if (null == menuCB) {
        return resMenuObj;
    }
    resMenuObj = menuCB(pkgList, resMenuObj);
    return resMenuObj;
}

function mergeFeatureMenuXMLFiles (pkgList, mergePath, mFileName, callback)
{
    var pkgDir = null;
    var pkgLen = pkgList.length;
    var menuDirs = [];
    var writeFile = mergePath + '/' + mFileName;

    if (1 == pkgLen) {
        /* Only core package, nothing to do */
        callback();
        return;
    }
    if (2 == pkgLen) {
        pkgDir = config.featurePkg[pkgList[1]['pkgName']].path;
        cmd = 'cp -af ' + pkgDir + '/webroot/menu.xml' + ' ' +
            writeFile;
        exec(cmd, function(error, stdout, stderr) {
            assert(error == null);
            callback();
            return;
        });
        return;
    }
    for (var i = 1; i < pkgLen; i++) {
        pkgDir = config.featurePkg[pkgList[i]['pkgName']].path;
        menuDirs.push(pkgDir + '/webroot/');
    }
    async.map(menuDirs, getAllJsons, function(err, data) {
        var len = data.length;
        var resJSON = null;
        for (var i = 0; i < len; i++) {
            if (0 == i) {
                resJSON = data[i];
            }
            if (null != data[i + 1]) {
                resJSON = mergeMenuObjects(resJSON, data[i + 1]);
            }
        }
        resJSON = customMenuChange(pkgList, resJSON);
        var xmlData = js2xml('ContrailTopLevelElement', resJSON);
        xmlData = xmlData.replace("<ContrailTopLevelElement>", "");
        xmlData = xmlData.replace("</ContrailTopLevelElement>", "");
        xmlData = pd.xml(xmlData);
        fs.writeFileSync(writeFile, xmlData);
        callback();
    });
}

function getPkgPathByPkgName (pkgName)
{
    if (null == pkgName) {
        return process.mainModule.exports['corePath'];
    }
    return config.featurePkg[pkgName].path;
}

/**
 * @convertUUIDToString
 * This function takes UUID without - and converts to UUID with dashes
 */
function convertUUIDToString (uuid) {
    var newUUID = "";
    newUUID =
        uuid.substr(0, 8) + '-' +
        uuid.substr(8, 4) + '-' +
        uuid.substr(12, 4) + '-' +
        uuid.substr(16, 4) + '-' +
        uuid.substr(20, 12);
    return newUUID;
}
/**
 * This function accepts the uuid with hyphen(-) and returns the uuid without '-'
 */
function convertApiServerUUIDtoKeystoneUUID(uuidStr) {
    if(uuidStr != null) {
        var uuid = ifNull(uuidStr,"").split('-').join('');
        return uuid;
    } else
        return null;
}
/**
/**
 * This function takes two parameters and compares the first one with null if it matches,
 * then it returns the second parameter else first parameter.
 */
function ifNull(value, defValue) {
    if (value == null)
        return defValue;
    else
        return value;
}

function getWebConfigValueByName (req, res, appData)
{
    var type = req.param('type'),
        variable = req.param('variable'),
        configObj = {}, value;
    if(type != null && variable != null) {
        value = ((null != config[type]) && (null != config[type][variable])) ?
            config[type][variable] : null;
        configObj[variable] = value;
    }
    commonUtils.handleJSONResponse(null, res, configObj);
}

function isMultiTenancyEnabled ()
{
    return ((null != config.multi_tenancy) &&
            (null != config.multi_tenancy.enabled)) ?
        config.multi_tenancy.enabled : true;
}

//Returns the corresponding NetMask for a givne prefix length
function prefixToNetMask(prefixLen) {
    var prefix = Math.pow(2,prefixLen) - 1;
    var binaryString = prefix.toString(2);
    for(var i=binaryString.length;i<32;i++) {
            binaryString += '0';
    }
    return v4.Address.fromHex(parseInt(binaryString,2).toString(16)).address;
}

//To check if it's an IPv4 Address
function isIPv4(ipAddr) {
    return (new v4.Address(ipAddr)).isValid();
}

function isIPv6(ipAddr) {
    return (new v6.Address(ipAddr)).isValid();
}

//Retruns the no of ip address in the range
//@ ipRangeObj['start'] - Start address of range
//@ ipRangeObj['end']   - End address of range
function getIPRangeLen(ipRangeObj) {
    if(isIPv4(ipRangeObj['start']) && isIPv4(ipRangeObj['end'])) {
        return ((new v4.Address(ipRangeObj['end'])).bigInteger() - (new v4.Address(ipRangeObj['start'])).bigInteger()) + 1;
    } else if(isIPv6(ipRangeObj['start']) && isIPv6(ipRangeObj['end'])) {
        return ((new v6.Address(ipRangeObj['end'])).bigInteger() - (new v6.Address(ipRangeObj['start'])).bigInteger()) + 1;
    } else
        return 0;
}

function isSubArray (arr, subarr)
{
    var filteredSubarray = _.filter(subarr, function(subarrelement) {
        return _.any(arr, function(arrelement){
            return arrelement === subarrelement;
        });
    });
    return _.isEqual(subarr, filteredSubarray);
};


/* Function: convertEdgelistToAdjList
 *  This function is used to convert edge list to adjacency list in a graph
 *
 * Input:
   ++++++
    edgeList:
    [
        ["Rack2-DataSw","ex4500-1"],
        ["Rack2-DataSw","Rack1-DataSw"],
        ["Rack2-DataSw","nodeg35"],
        ["ex4500-1","Rack2-DataSw"],
        ["ex4500-1","Rack1-DataSw"],
        ["Rack1-DataSw","Rack2-DataSw"],
        ["Rack1-DataSw","ex4500-1"],
        ["Rack1-DataSw","nodea29"],
        ["bb8056fc","nodeg35"],
        ["ea213e4f","nodea29"],
        ["31e27d4c","nodeg35"]
    ];
    Output:
    +++++++
    {
        "Rack2-DataSw": ['ex4500-1', 'Rack1-DataSw','nodeg35'],
        "ex4500-1": ['Rack2-DataSw','Rack1-DataSw'],
        'Rack1-DataSw': ['Rack2-DataSw', 'ex4500-1', 'nodea29'],
        'nodeg35': ['Rack2-DataSw', 'bb8056fc', '31e27d4c'],
        'nodea29': ['Rack1-DataSw','ea213e4f'],
        'bb8056fc': ['nodeg35'],
        'ea213e4f': ['nodea29'],
        '31e27d4c': ['nodeg35']
    };
 */
function convertEdgelistToAdjList (edgeList)
{
    var adjList = {};
    var len = edgeList.length;
    var  pair, u, v;
    for (i = 0; i < len; i++) {
        pair = edgeList[i];
        u = pair[0];
        v = pair[1];
        if (adjList[u]) {
            // append vertex v to edgeList of vertex u
            adjList[u].push(v);
        } else {
            // vertex u is not in adjList, create new adjacency list for it
            adjList[u] = [v];
        }
        if (adjList[v]) {
            adjList[v].push(u);
        } else {
            adjList[v] = [u];
        }
    }
    for (key in adjList) {
        adjList[key] = _.uniq(adjList[key]);
    }
    return adjList;
}

/* Function: findAllPathsInEdgeGraph
 *  This function is used to do breadth-first-search on graph to find all
 *  possible paths from source to dest
 * Ex:
    Input:
    ++++++
    graph:
    [
        ["Rack2-DataSw","ex4500-1"],
        ["Rack2-DataSw","Rack1-DataSw"],
        ["Rack2-DataSw","nodeg35"],
        ["ex4500-1","Rack2-DataSw"],
        ["ex4500-1","Rack1-DataSw"],
        ["Rack1-DataSw","Rack2-DataSw"],
        ["Rack1-DataSw","ex4500-1"],
        ["Rack1-DataSw","nodea29"],
        ["bb8056fc","nodeg35"],
        ["ea213e4f","nodea29"],
        ["31e27d4c","nodeg35"]
    ];
    source: 31e27d4c
    dest: ea213e4f
    Output:
    +++++++
    [
        [ '31e27d4c', 'nodeg35', 'Rack2-DataSw', 'ex4500-1', 'Rack1-DataSw',
            'nodea29', 'ea213e4f']
        [ '31e27d4c', 'nodeg35', 'Rack2-DataSw', 'Rack1-DataSw', 'nodea29',
            'ea213e4f']
    ]
 */
function findAllPathsInEdgeGraph (graph, source, dest)
{
    graph = convertEdgelistToAdjList(graph);
    var validPaths = [];
    var tmpNodeArr = [];
    var tempPath = [source];
    tmpNodeArr.push(tempPath);
    while (tmpNodeArr.length != 0) {
        var tmpPath = tmpNodeArr[0];
        if (1 == tmpNodeArr.length) {
            tmpNodeArr = [];
        } else {
            tmpNodeArr.splice(0, 1);
        }

        var lastNode = tmpPath[tmpPath.length - 1];
        if (lastNode == dest) {
            validPaths.push(tmpPath);
        }
        if (null == graph[lastNode]) {
            return [];
        }
        var graphLastNodeLen = graph[lastNode].length;
        for (var i = 0; i < graphLastNodeLen; i++) {
            var linkNode = graph[lastNode][i];
            if (-1 == tmpPath.indexOf(linkNode)) {
                var newPath = tmpPath.concat([linkNode]);
                tmpNodeArr.push(newPath);
            }
        }
    }
    return validPaths;
}

/**
 * Get the value of a property inside a json object with a given path
 */
function getValueByJsonPath(obj,pathStr,defValue,doClone) {
    try {
        var currObj = obj;
        var pathArr = pathStr.split(';');
        var doClone = (doClone == null)? true : doClone;
        var arrLength = pathArr.length;
        for(var i=0;i<arrLength;i++) {
            if(currObj[pathArr[i]] != null) {
                currObj = currObj[pathArr[i]];
            } else
                return defValue;
        }
        if(!doClone) {
            return currObj;
        }
        if(currObj instanceof Array)
            return cloneObj(currObj);
        else if(typeof(currObj) == "object")
            return cloneObj(currObj);
        else
            return currObj;
    } catch(e) {
        return defValue;
    }
}

/*
 * Filter keys in given json object recursively whose value matches with null
 */
function filterJsonKeysWithNullValues(obj) {
    if(typeof(obj) instanceof Array) {
        for(var i=0,len=obj.length;i<len;i++) {
            obj[i] = filterJsonKeysWithNullValues(obj[i]);
        }
    } else if(typeof(obj) == "object") {
        for(var key in obj) {
            if(obj[key] == null) {
                delete obj[key];
            } else if(typeof(obj[key]) == "object") {
                obj[key] = filterJsonKeysWithNullValues(obj[key]);
            }
        }
    }
    return obj;
}

exports.filterJsonKeysWithNullValues = filterJsonKeysWithNullValues;
exports.createJSONBySandeshResponseArr = createJSONBySandeshResponseArr;
exports.createJSONBySandeshResponse = createJSONBySandeshResponse;
exports.createJSONByUVEResponse = createJSONByUVEResponse;
exports.createJSONByUVEResponseArr = createJSONByUVEResponseArr;
exports.getRestAPIServer = getRestAPIServer;
exports.createRedisClient = createRedisClient;
exports.flushRedisDB = flushRedisDB;
exports.redisClientCreateEvent = redisClientCreateEvent;
exports.getWebUIRedisDBIndex = getWebUIRedisDBIndex;
exports.getCurrentUTCTime = getCurrentUTCTime;
exports.parseUVEData = parseUVEData;
exports.parseUVEListData = parseUVEListData;
exports.parseUVEObjectData = parseUVEObjectData;
exports.getApiPostData = getApiPostData;
exports.redirectToLogout = redirectToLogout;
exports.redirectToLogin = redirectToLogin;
exports.redirectToURL = redirectToURL;
exports.redirectToLogoutByAppData = redirectToLogoutByAppData;
exports.getServerResponseByRestApi = getServerResponseByRestApi;
exports.executeShellCommand = executeShellCommand;
exports.putJsonViaInternalApi = putJsonViaInternalApi;
exports.getJsonViaInternalApi = getJsonViaInternalApi;
exports.retrieveSandeshIpUrl = retrieveSandeshIpUrl;
exports.handleJSONResponse = handleJSONResponse;
exports.handleResponse = handleResponse;
exports.getCurrentTimestamp = getCurrentTimestamp;
exports.download = download;
exports.upload = upload;
exports.adjustDate = adjustDate;
exports.getUTCTime = getUTCTime;
exports.getSafeDataToJSONify = getSafeDataToJSONify;
exports.cloneObj = cloneObj;
exports.createReqObj = createReqObj;
exports.getServerRespByRestApi = getServerRespByRestApi;
exports.getAPIServerResponse = getAPIServerResponse;
exports.ip2long = ip2long;
exports.long2ip = long2ip;
exports.getDataFromSandeshByIPUrl = getDataFromSandeshByIPUrl;
exports.doEnsureExecution = doEnsureExecution;
exports.directory = directory;
exports.copyObject = copyObject;
exports.changeFileContentAndSend = changeFileContentAndSend;
exports.getOrchestrationPluginModel = getOrchestrationPluginModel;
exports.getWebServerInfo = getWebServerInfo;
exports.mergeAllPackageList = mergeAllPackageList;
exports.mergeAllMenuXMLFiles = mergeAllMenuXMLFiles;
exports.getPkgPathByPkgName = getPkgPathByPkgName;
exports.convertUUIDToString = convertUUIDToString;
exports.ifNull = ifNull;
exports.getUserRoleListPerTenant = getUserRoleListPerTenant;
exports.getWebConfigValueByName = getWebConfigValueByName;
exports.isMultiTenancyEnabled = isMultiTenancyEnabled;
exports.prefixToNetMask = prefixToNetMask;
exports.convertApiServerUUIDtoKeystoneUUID = convertApiServerUUIDtoKeystoneUUID;
exports.getIPRangeLen = getIPRangeLen;
exports.findAllPathsInEdgeGraph = findAllPathsInEdgeGraph;
exports.isSubArray = isSubArray;
exports.getValueByJsonPath = getValueByJsonPath;

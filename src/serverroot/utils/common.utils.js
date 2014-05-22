/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
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
    exec = require('child_process').exec,
    mime = require('mime'),
    os = require('os'),
    fs = require('fs'),
    appErrors = require('../errors/app.errors.js'),
    downloadPath = '/var/log',
    contrailPath = '/contrail';
if (!module.parent) {
    logutils.logger.warn(util.format(
                         messages.warn.invalid_mod_call, module.filename));
    process.exit(1);
}

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

function retrieveSandeshIpUrl (url, apiServer)
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
        apiServer = apiServer({apiName:global.SANDESH_API, server:serverIp, port:serverPort });
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

function getDataFromSandeshByIPUrl (apiServer, ignoreError, reqTimeout, url,
                                    callback)
{
    var oldUrl = url, oldCallback = callback;
    if (typeof oldUrl === 'undefined' || typeof oldCallback === 'undefined') {
        if (null == reqTimeout) {
            reqTimeout = global.DEFAULT_ASYNC_REQUEST_TIMEOUT;
        }
        if (ignoreError) {
            return function (newUrl, newCallback) {
                var serverObj = retrieveSandeshIpUrl(newUrl, apiServer);
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
                var serverObj = retrieveSandeshIpUrl(newUrl, apiServer);
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
        var serverObj = retrieveSandeshIpUrl(url, apiServer);
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
function handleJSONResponse (error, res, json)
{
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

function redirectToLogout (req, res)
{
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
    var serverObj = plugins.getOrchestrationPluginModel();
    if (null == serverObj) {
        /* We will not come here any time */
        logutils.logger.error("We did not get Orchestration Model");
        assert(0);
    }
    serverObj ['serverUTCTime'] = commonUtils.getCurrentUTCTime();
    serverObj['hostName'] = os.hostname();
    commonUtils.handleJSONResponse(null, res, serverObj);
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


/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var assert = require("assert")
    , http = require('http')
    , url = require("url")
    , eventEmitter = require('events').EventEmitter
    , handler = require('../routes/handler')
    , commonUtils = require('../../utils/common.utils')
    , logutils = require('../../utils/log.utils')
    , util = require('util')
    , authApi = require('../../common/auth.api')
    , messages = require('../../common/messages')
    , rbac = require('./rbac.api')
    , orch = require('../../orchestration/orchestration.api')
    ;

if (!module.parent) {
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
                                  module.filename));
    process.exit(1);
}

/* Global Pending Request Queue per Worker */ 
var pendingReqQObj = {};

var readyQ = [];

var readyQEvent = new eventEmitter();

readyQEvent.on('add', function() {
  triggerResponse();
});


/*
 * Maximum age of response in seconds
 */
var maxAge = 60;

/*
 * Global counter for unique ids
 */
var lastRequestId = 0;

/*
 *Ccompacts an array by removing all null values
 *
 */
function doCompact (arr)
{
  if (!arr) return null;
  var i, data = [];
  
  for (i=0; i < arr.length; i++) {
    if (arr[i]) {
      data.push(arr[i]);
    }
  }
  return data;
}

/*
 * Returns current time in milliseconds from 1 Jan 1970, 00:00
 */
function getCurrentTimestamp ()
{
  return new Date().getTime();
}

/*
 * Checks for all pending requests and then triggers process of that pending 
 * request 
 */
function triggerResponse ()
{
  if (!readyQ.length) {
    /* We got an event for add, but it seems no data, why? */
    assert(0);
  }
  var resCtx, event;
  curTS = getCurrentTimestamp();

  /* Check if any response got timed out
   */
  for(var i = 0; i < readyQ.length; i++) {
    resCtx = readyQ[i];
    /* Timed out responses */
    if ((curTS - resCtx.timestamp) > maxAge * 1000) {
      logutils.logger.error("Response timed out");
      readyQ[i]= null;
      continue;
    }
    var data = resCtx.data;
    if (resCtx.isJson) {
      resCtx.res.send(resCtx.statusCode, JSON.parse(data));
    } else {
      resCtx.res.send(resCtx.statusCode, data);
    }
    readyQ[i] = null;
  }
  readyQ = doCompact(readyQ);
}

/* Function: processPendingReq()
    This function is used to process pending request, 
    This function is invoked after processing the request, so here just delete
    the reqCtx
 */
function processPendingReq (ctx, next, callback)
{
  var token = null;
  var defProjectObj = {};

  delete pendingReqQObj[ctx.id];// = null;
  //If loggedInOrchestrationMode doesn't exist in session
  if (checkLoginReq(ctx.req)) {
    ctx.req.session.loggedInOrchestrationMode =
        orch.getOrchestrationModelsByReqURL(ctx.req.url);
    logutils.logger.debug("Getting Logged In Orchestration Mode:",
                          ctx.req.session.loggedInOrchestrationMode);
  }

  /* Process the request */
  defTokenObj = authApi.getAPIServerAuthParams(ctx.req);
  var appData = {
    authObj: {
      req: ctx.req,
      defTokenObj: defTokenObj
    },
    genBy: global.service.MAINSEREVR
  };
  callback(ctx.req, ctx.res, appData);
}

var restrictedURL = {};
/* Function: restrictedURL
    This function is used to pass the authentication check,
 */
function insertUrlToRestrictedList (url)
{
  restrictedURL[url] = url;
}

/* Function: registerRestrictedURL
    This function is used to register restricted URL List
 */
function registerRestrictedURL ()
{
  insertUrlToRestrictedList('/login');
  insertUrlToRestrictedList('/authenticate');
}

/* Function: checkLoginReq
    This function is used to check if the url is /login 
 */
function checkLoginReq (req)
{
  return ((req.url == '/login') || (req.url == '/authenticate') || (req.url == '/vcenter/authenticate') ||
          (req.url == '/logout') || (req.url == '/vcenter/login') ||
          (req.url == '/vcenter/logout'));
}

/* Function: routeAll
    This function is invoked on each request coming from web client.
    If the req.url is in the Allowed List, then req/res context gets stored
    in pending queue and triggers pending queue processing
 */
function routeAll (req, res, next)
{
  /* nodejs sets the timeout 2 minute, override this timeout here */
  req.socket.setTimeout(global.NODEJS_HTTP_REQUEST_TIMEOUT_TIME);
  if (checkLoginReq(req)) {
    req.session.loggedInOrchestrationMode =
        orch.getOrchestrationModelsByReqURL(req.url);
  }
  if (null == req.session.sessionExpSyncToIdentityToken) {
      if (null != authApi.getSessionExpiryTime) {
        var sessExp = authApi.getSessionExpiryTime(req);
        if (null != sessExp) {
            var sessExpAt = new Date().getTime() + sessExp;
            req.session.cookie.expires = new Date(sessExpAt);
            req.session.sessionExpSyncToIdentityToken = true;
        }
      }
  }
  var u = url.parse(req.url, true);
  if ((null == req.route) || (null == handler.checkURLInAllowedList(req))) {
      /* Not a Valid URL */
    next();
    return null;
  }

  var sessId    = req.sessionID,
    timestamp   = getCurrentTimestamp(),
    requestId;

  lastRequestId = parseInt(lastRequestId) + 1;
  requestId = lastRequestId;

  var ctx = {
    'id' : requestId,
    'sessId': sessId,
    'timestamp': timestamp,
    'state': "started",
    'req' : req,
    'res' : res,
  };
  /* Check if the session is authenticated or not */
  if (!handler.isSessionAuthenticated(req)) {
    /* Session not authenticated yet, so do not store this context in Q */
    if (!checkLoginReq(req)) {
      commonUtils.redirectToLogout(req, res);
      return null;
    }
  } else {
    /* Session is authenticated, now check resource access permission */
    var checkAccess = rbac.checkUserAccess(req, res);
    if (false == checkAccess) {
      /* We are yet to get authorized */
      insertResToReadyQ(res, global.HTTP_STATUS_FORBIDDEN_STR,
                        global.HTTP_STATUS_FORBIDDEN, 0);
      return null;
    }
  }
  pendingReqQObj[ctx.id] = ctx;
  return ctx;
}

/* Function: insertResToReadyQ
    Once the response is ready to send back to web client, 
    it is stored in readyQ, and one event is generated as 'add'
    which triggers to handler to take care upon this response.
 */
function insertResToReadyQ (res, data, statusCode, isJson)
{
  var resCtx = {
    timeStamp : getCurrentTimestamp(),
    res : res,
    data: data,
    statusCode : statusCode,
    isJson : isJson
  };
  
  readyQ.push(resCtx);
  readyQEvent.emit('add');
}

function insertDataToSendAllClients (resObjList, data, statusCode, isJson)
{
    var respAdd = false;
    var resCtx = {
        timeStamp : getCurrentTimestamp(),
        data: data,
        statusCode : statusCode,
        isJson : isJson
    };
    var resObjCnt = resObjList.length;
    for (var i = 0; i < resObjCnt; i++) {
        var newResCtx = commonUtils.cloneObj(resCtx);
        if (null != resObjList[i]['postCallback']) {
            if (isJson) {
                try {
                    data = JSON.parse(data);
                } catch(e) {
                    logutils.logger.error("In insertDataToSendAllClients():" + 
                                          "Data expected to JSON.stringified " +
                                          "format");
                }
            }
            if ((resObjList[i]['req']) && (resObjList[i]['res'])) {
                resObjList[i]['postCallback'](resObjList[i]['req'], resObjList[i]['res'], data);
            } else {
                logutils.logger.error("In insertDataToSendAllClients():" + 
                                      "req/res Obj is null");
            }
        } else {
            respAdd = true;
            newResCtx['res'] = resObjList[i]['res'];
            readyQ.push(newResCtx);
        }
    }
    if (true == respAdd) {
        readyQEvent.emit('add');
    }
}

function redirectToLogoutByChannel (channel)
{
    var reqCtxArr = cacheApi.checkCachePendingQueue(channel);
    if (null == reqCtxArr) {
        return;
    }
    var reqCtxArrLen = reqCtxArr.length;
    for (var i = 0; i < reqCtxArrLen; i++) {
        if ((null != reqCtxArr[i]) && (null != reqCtxArr[i]['req']) &&
            (null != reqCtxArr[i]['res'])) {
            /* First request is the initiator, and rest are only pending */
            break;
        }
    }
    if (i == reqCtxArrLen) {
        return;
    }
    /* Always 1st entry in reqCtxArr is the requested client, others were
     * waiting for this active job, so only for that client, redirect
     * to login
     */
    commonUtils.redirectToLogout(reqCtxArr[i]['req'], reqCtxArr[i]['res'],
                                 function() {
        /* We have redirected to logout page, so remove this channel from the
         * pending queue
         */
        cacheApi.deleteCachePendingQueueEntry(channel);
    });
}

exports.redirectToLogoutByChannel = redirectToLogoutByChannel;
exports.lastRequestId = lastRequestId;
exports.insertResToReadyQ = insertResToReadyQ;
exports.routeAll = routeAll;
exports.processPendingReq = processPendingReq;
exports.insertDataToSendAllClients = insertDataToSendAllClients;


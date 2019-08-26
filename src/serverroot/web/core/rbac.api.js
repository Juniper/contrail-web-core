/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var commonUtils = require('../../utils/common.utils')
  , logutils = require('../../utils/log.utils')
  , util = require('util')
  , _ = require("lodash")
  , plugins = require('../../orchestration/plugins/plugins.api')
  , messages = require('../../common/messages')

if (!module.parent) {
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
                                  module.filename));
  process.exit(1);
}

var userRoleMap = {};
var userFeatureMap = {};
var userFeatureToAccessMap = {};

/* trim:
    Used to remove space characters from left or right of a string
 */
String.prototype.trim=function() {
  return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');
};

/* getRoleValueByString:
    This function is used to get the role value bit from roleStr
    roleStr - Role in string format in comma seperated
    ex: user,admin
 */
function getRoleValueByString (roleStr)
{
  var configUtils = require('../../common/config.utils');
  var config = configUtils.getConfig();
  var roleListObjs = {};
  if (null == roleStr) {
    return null;
  }
  var index = 0;
  for (key in config.roleMaps) {
      roleListObjs[key] = index++;
  }

  var str = roleStr.split(',');
  var len = str.length;
  var roleBitMask = 0;
  if (roleStr == 'all') {
    for (key in roleListObjs) {
      var roleBit = parseInt(roleListObjs[key]);
      roleBitMask = parseInt(roleBitMask) + parseInt(1 << roleBit);
    }
    return roleBitMask;
  }

  for (var i = 0; i < len; i++) {
    var iStr = str[i].trim();
    var roleBit = parseInt(roleListObjs[iStr]);
    roleBitMask = parseInt(roleBitMask) + parseInt(1 << roleBit);
  }
  return roleBitMask;
}

/* setRoleByURL: 
    This function is used to set the feature against url, method and routes
    role:  role specified in string format, 
            ex: admin,user
 */
function setFeatureByURL (url, method, featureStr)
{
  var key = method + ':' + url;
  userFeatureMap[key] = featureStr;
}

/* Function: getRoleByURLRegexp
    This function is used to derive the role from urlRegexp.
    urlRegexp is the req.route.regexp
 */
function getRoleByURLRegexp (urlRegexp)
{
  return userRoleMap[urlRegexp];
}

/* Function: getFeatureByReq
    This function is used to get the feature object by req object coming from
    the web client.
 */
function getFeatureByReq (req)
{
  var key = req.method.toLowerCase() + ':' + req.route.path;

  return userFeatureMap[key];
}

/* Function: getUserAccess
    This function is used to check the access privileges based on the req.url
    and req.method
 */
function getUserAccess (req, userRoleStr)
{
  /* First check from the req.url, which feature is and then check 
     req.method does it have access
   */
  if (null == userRoleStr) {
    return false;
  }
  /* Get the feature */
  var featureStr = getFeatureByReq(req);
  /* From this feature, get the access */
  if (featureStr == 'all') {
    /* all is special keyword to represent '*' */
    return true;
  }
  var access = userFeatureToAccessMap[featureStr];
  if (null == access) {
    return false;
  }
  var rightAccess;

  var method = req.route.method;
  if (method == 'get') {
    rightAccess = access['read-access'];
  } else {
    rightAccess = access['write-access'];
  }

  var reqRole = getRoleValueByString(userRoleStr);
  if (rightAccess & reqRole) {
    return true;
  }
  return false;
}

/* Function: addFeatureAccess
    This function is used to add read/write access to specific feature
 */
function addFeatureAccess (feature, readAccess, writeAccess)
{
  var readAccessVal = getRoleValueByString(readAccess);
  var writeAccessVal = getRoleValueByString(writeAccess);

  var accessRight = {};
  accessRight['read-access'] = readAccessVal;
  accessRight['write-access'] = writeAccessVal;
  userFeatureToAccessMap[feature] = commonUtils.cloneObj(accessRight); 
}

/* Function: checkUserAccess
    This function is used to check the access privileges
 */
function checkUserAccess (req, res, callback)
{
  var userRoleLen = 0;
  var authApi = require("../../common/auth.api");
  if (authApi.isReqHasXAuthTokenHeader(req.url, req)) {
      if (true == plugins.isOpenstackModel()) {
       /* If the request contains the X-Auth-Token and URL contains the
        * forward-proxy, then verify that token is valid, if valid, then assume that
        * request is authorized
        */
        var xAuthToken = req.headers["x-auth-token"];
        authApi.checkIfValidToken(req, xAuthToken, function(isValidToken) {
            callback(isValidToken);
            return;
        });
        return;
     } else {
        callback(true);
        return;
     }
  }

  if ((req) && (req.session) && (req.session.userRole)) {
      var userRoles = req.session.userRole;
      userRoleLen = userRoles.length;
  }
  for (var i = 0; i < userRoleLen; i++) {
      userAccess = getUserAccess(req, userRoles[i]);
      if (true == userAccess) {
          callback(true);
          return;
      }
  }
}

exports.setFeatureByURL = setFeatureByURL;
exports.addFeatureAccess = addFeatureAccess;
exports.checkUserAccess = checkUserAccess;


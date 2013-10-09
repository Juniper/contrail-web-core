/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

var commonUtils = require('../../utils/common.utils')
  , logutils = require('../../utils/log.utils')
  , util = require('util')
  , messages = require('../../common/messages')

if (!module.parent) {
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
                                  module.filename));
  process.exit(1);
}

rbac = module.exports;

var userRole = {
  admin: global.USER_ROLE_ADMIN,
  user: global.USER_ROLE_USER,
  demo: global.USER_ROLE_DEMO
};

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
getRoleValueByString = function(roleStr) {
  if (null == roleStr) {
    return null;
  }
  var str = roleStr.split(',');
  var len = str.length;
  var roleBitMask = 0;
  if (roleStr == 'all') {
    for (key in userRole) {
      var roleBit = parseInt(userRole[key]);
      roleBitMask = parseInt(roleBitMask) + parseInt(1 << roleBit);
    }
    return roleBitMask;
  }

  for (var i = 0; i < len; i++) {
    var iStr = str[i].trim();
    var roleBit = parseInt(userRole[iStr]);
    roleBitMask = parseInt(roleBitMask) + parseInt(1 << roleBit);
  }
  return roleBitMask;
}

/* setRoleByURL: 
    This function is used to set the feature against url, method and routes
    role:  role specified in string format, 
            ex: admin,user
 */
rbac.setFeatureByURL = function(url, method, routes, featureStr) {
  var routesObj = [];
  if (method == 'get') {
    routesObj = routes['get'];
  } else if (method == 'put') {
    routesObj = routes['put'];
  } else if (method == 'delete') {
    routesObj = routes['delete'];
  } else if (method == 'post') {
    routesObj = routes['post'];
  } else {
    assert(0);
  }

  var len = routesObj.length;
  for (var i = 0; i < len; i++) {
    if (url == routesObj[i]['path']) {
      /* Set the role now against this regexp-path */
      var obj = routesObj[i]['regexp'];
      var key = method + ':' + obj;
      userFeatureMap[key] = featureStr;
      break;
    }
  }
}

/* Function: getRoleByURLRegexp
    This function is used to derive the role from urlRegexp.
    urlRegexp is the req.route.regexp
 */
getRoleByURLRegexp = function(urlRegexp) {
  return userRoleMap[urlRegexp];
}

/* Function: getFeatureByReq
    This function is used to get the feature object by req object coming from
    the web client.
 */
getFeatureByReq = function(req) {
  var key = req.route.method + ':' + req.route.regexp;
  return userFeatureMap[key];
}

/* Function: getUserAccess
    This function is used to check the access privileges based on the req.url
    and req.method
 */
rbac.getUserAccess = function(req, userRoleStr) {
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
rbac.addFeatureAccess = function(feature, readAccess, writeAccess) {
  var readAccessVal = getRoleValueByString(readAccess);
  var writeAccessVal = getRoleValueByString(writeAccess);

  var accessRight = {};
  accessRight['read-access'] = readAccessVal;
  accessRight['write-access'] = writeAccessVal;
  userFeatureToAccessMap[feature] = commonUtils.cloneObj(accessRight); 
}

/* Function: mapUserRoleToInternalRole
    This function is used to map roles derived from Identity Server to Role
    derived by Web Server
 */
mapUserRoleToInternalRole = function(userRole) {
  return userRole;
}

/* Function: checkUserAccess
    This function is used to check the access privileges
 */
rbac.checkUserAccess = function(req, res) {
  var userRoleStr = req.session.userRole;
  var roleStr = mapUserRoleToInternalRole(userRoleStr);
  var userAccess = rbac.getUserAccess(req, roleStr);
  return userAccess;
}


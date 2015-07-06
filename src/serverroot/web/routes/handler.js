/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var http = require('http'),
    https = require('https'),
    logutils = require('../../utils/log.utils'),
    messages = require('../../common/messages'),
    util = require('util'),
    redis = require("redis"),
    global = require('../../common/global'),
    config = process.mainModule.exports.config,
    longPoll = require('../core/longPolling.api'),
    logutils = require('../../utils/log.utils'),
    commonUtils = require('../../utils/common.utils'),
    crypto = require('crypto'),
    redisSub = require('../core/redisSub'),
    authApi = require('../../common/auth.api'),
    vCenterApi = require('../../orchestration/plugins/vcenter/vcenter.api');
    fs = require('fs'),
    messages = require('../../common/messages');

if (!module.parent) {
	logutils.logger.warn(util.format(messages.warn.invalid_mod_call, module.filename));
	process.exit(1);
}

exports.home = function (req, res) {
    checkAndRedirect(req, res, 'webroot/html/dashboard.html');
};

exports.dashboard = function (req, res) {
    checkAndRedirect(req, res, 'webroot/html/dashboard.html');
};

exports.admin = function (req, res) {
    checkAndRedirect(req, res, 'html/admin.html');
};

function login (req, res)
{
    res.sendfile('webroot/html/login.html');
}

function vcenter_login (req, res, appData)
{
    //Move setting loggedInOrchestrationMode to longPolling??
    var orch = config.orchestration.Manager;
    var models = orch.split(',');
    //If vcenter orchestration is not set and user tries to launch "/vcenter/login",redirect to "/login"
    if (-1 == models.indexOf('vcenter')) {
        commonUtils.redirectToURL(req, res, '/login');
    } else {
       return login(req, res);
    }
}

function vcenter_logout (req, res, appData)
{
    var orch = config.orchestration.Manager;
    var models = orch.split(',');
    if (req.session.loggedInOrchestrationMode != 'vcenter') {
        commonUtils.redirectToURL(req, res, '/logout');
    } else {
        //Issue logout on vCenter only if vmware session exists
        if(req.session.vmware_soap_session != null)
            vCenterApi.logout(appData);
        return logout(req, res);
    }
}

var urlAllowedList = {};

exports.addAppReqToAllowedList = function(appRoutes) {
    var len;
    /* First add for get methods */
    var getList = appRoutes['get'];
    if (getList) {
        len = getList.length;
        for (i = 0; i < len; i++) {
            if (getList[i]['path'] == '*') {
                continue;
            }
            var key = 'get' + ':' + getList[i]['regexp'];
            urlAllowedList[key] = getList[i]['path'];
        }
    }
  
    /* Add post list */
    var postList = appRoutes['post'];
    if (postList) {
        len = postList.length;
        for (i = 0; i < len; i++) {
            if (postList[i]['path'] == '*') {
                continue;
            }
            key = 'post' + ':' + postList[i]['regexp'];
            urlAllowedList[key] = postList[i]['path'];
        }
    }
  
    /* Add put list */
    var putList = appRoutes['put'];
    if (putList) {
        len = putList.length;
        for (i = 0; i < len; i++) {
            if (putList[i]['path'] == '*') {
                continue;
            }
            key = 'put' + ':' + putList[i]['regexp'];
            urlAllowedList[key] = putList[i]['path'];
        }
    }
  
    /* Add delete list */
    var delList = appRoutes['delete'];
    if (delList) {
        len = delList.length;
        for (i = 0; i < len; i++) {
            key = 'delete' + ':' + delList[i]['regexp'];
            if (delList[i]['path'] == '*') {
                continue;
            }
        urlAllowedList[key] = delList[i]['path'];
        }
    }
}

exports.checkURLInAllowedList = function(req) {
    if (req && req.route) {
        var key = req.route.method + ':' + req.route.regexp;
        /* Lookup by this key */
        return urlAllowedList[key];
    }
    return null;
}

/* Function: isSessionAuthenticated
    This function returns the isAuthenticated flag for a user session
 */
exports.isSessionAuthenticated = function(req) {
    //If url contains "/vcenter" and not loginReq and session doesn't contain vmware_soap_session
    // console.info('isSessionAuthenticated',req.url);
    //If loggedInOrchestrationMode doesn't match on client and server
    if(!longPoll.checkLoginReq(req) && req.session.loggedInOrchestrationMode != null && req.headers['x-orchestrationmode'] != null) {
        if(req.headers['x-orchestrationmode'] != req.session.loggedInOrchestrationMode) {
            // console.log(commonUtils.FgGreen,'not authenticated',req.headers['x-orchestrationmode'],req.session.loggedInOrchestrationMode);
            req.session.isAuthenticated = false;
            return false;
        }
    }
    //If not login request and not /api request
    //Requests that are same across vCenter and openStack
    if(!longPoll.checkLoginReq(req) && !longPoll.checkOrchestrationAgnosticReq(req)) {
        if(req.url.indexOf('/vcenter') > -1 && req.session.vmware_soap_session == null) {
            //Moving none to vcenter orchestration mode 
            req.session.isAuthenticated = false;
            // console.log(commonUtils.FgGreen,'vcenter not authenticated',req.url,req.session.vmware_soap_session);
            return false;
        }
        if(req.url.indexOf('/vcenter') == -1 && req.session.vmware_soap_session != null) {
            //Moving from vCenter orchestration mode to none
            // console.log(commonUtils.FgGreen,'none not authenticated',req.url,req.session.vmware_soap_session);
            delete req.session.vmware_soap_session;
            req.session.isAuthenticated = false;
            return false;
        }
    }
    return ((req.session) ? req.session.isAuthenticated : false);
}

/* Function: checkAndRedirect
   This function is used to check if the requested client is already authenticated, 
   if so, then redirect to the last page, user visited
 */
checkAndRedirect = function(req, res, sendFile) {
    var data = exports.checkURLInAllowedList(req);
    var loginErrFile = 'webroot/html/login-error.html';
    if (null == data) {
        res.send(global.HTTP_STATUS_PAGE_NOT_FOUND, "The page can not be found");
        res.end();
        return;
    }
    if (false == exports.isSessionAuthenticated(req)) {
        commonUtils.redirectToLogin(req, res);
    } else {
        var pkgList = process.mainModule.exports['pkgList'];
        if (pkgList.length > 1) {
            res.sendfile(sendFile);
        } else {
            /* Only Base Package installed */
            commonUtils.changeFileContentAndSend(res, loginErrFile,
                                                 global.CONTRAIL_LOGIN_ERROR,
                                                 "Install feature package",
                                                 function() {
            });
        }
    }
}

setSessionTimeoutByReq = function(req) {
    if ('admin' == req.session.userRole) {
        req.session.cookie.expires = false;
    } else {
        req.session.cookie.maxAge = global.DEMO_USER_MAX_AGE_SESSION;
    }
}

getUserRoleByAuthResponse = function(resRoleList) {
    if ((null == resRoleList) || (!resRoleList.length)) {
        /* Ideally if Role is not associated, then we should not allow user to
         * login, but we are assigning role as 'Member' to the user to not to
         * block UI
//        return null;
         */
        return global.STR_ROLE_USER;
    }
    var rolesCount = resRoleList.length;
    for (var i = 0; i < rolesCount; i++) {
        if (resRoleList[i]['name'] != 'Member') {
            return global.STR_ROLE_ADMIN;
        }
    }
    return global.STR_ROLE_USER;
}

exports.authenticate = function (req, res, appData) {
    /* Call module independent API */
    authApi.doAuthenticate(req, res, appData, function(err, data) {
        /* Already logged */
        logutils.logger.debug('Getting err ' + err);
    });
}
exports.vcenter_authenticate = function (req, res, appData) {
    /* Call module independent API */
    authApi.doAuthenticate(req, res, appData, function(err, data) {
        /* Already logged */
        logutils.logger.debug('Getting err ' + err);
    });
}

function logout (req, res)
{
    authApi.deleteAllTokens(req, function(err) {
        res.header('Cache-Control', 
               'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        commonUtils.redirectToLogin(req, res);
        /* Need to destroy the session after redirectToLogin as login page depends
           on orchestrationModel
         */
        req.session.isAuthenticated = false;
        req.session.destroy();
    });
};

function putData(id, callback) {
	var post_data = JSON.stringify({
			'content':{"bgp-router": {"parent_name": "__default__", "_type": "bgp-router", "uuid": "2bc0b653-97d9-491a-9eb1-5fed811e09d6", "bgp_router_refs": [{"to": ["default-domain", "default-project", "ip-fabric", "__default__", "system136"], "href": "http://0.0.0.0:8082/bgp-router/ac9d1760-2c1c-4731-95aa-6eceff624741", "attr": {"session": [{"attributes": [{"bgp_router": null, "address_families": {"family": ["inet-vpn"]}}], "uuid": null}]}}, {"to": ["default-domain", "default-project", "ip-fabric", "__default__", "system108"], "href": "http://0.0.0.0:8082/bgp-router/6e6b247b-dcf7-4041-a414-32c7755cec0c", "attr": {"session": [{"attributes": [{"bgp_router": null, "address_families": {"family": ["inet-vpn"]}}], "uuid": null}]}}, {"to": ["default-domain", "default-project", "ip-fabric", "__default__", "mx1"], "href": "http://0.0.0.0:8082/bgp-router/edc29a71-d91c-466c-ad00-d47149b8be50", "attr": {"session": [{"attributes": [{"bgp_router": null, "address_families": {"family": ["inet-vpn"]}}], "uuid": null}]}}], "fq_name": ["default-domain", "default-project", "ip-fabric", "__default__", "mx12"], "id_perms": {"enable": true, "created": null, "uuid": {"uuid_mslong": 4307075351756816717, "uuid_lslong": 13194714317593263062}, "last_modified": null, "permissions": {"owner": "cloud-admin", "owner_access": 7, "other_access": 7, "group": "cloud-admin-group", "group_access": 7}}, "href": "http://0.0.0.0:8082/bgp-router/2bc0b653-97d9-491a-9eb1-5fed811e09d6", "bgp_router_parameters": {"vendor": null, "autonomous_system": 64513, "address": "10.1.1.12", "identifier": "10.1.1.12", "port": 179, "address_families": {"family": ["inet-vpn"]}}, "name": "mx12"}}
		    //'content': {"bgp-router":{"uuid":"3bc5ce36-6a4e-414d-b71d-0ac364e83bd6","_type":"bgp-router","vendor":"test","_fq_name":["default-domain","default-project","ip-fabric","__default__","mx12"],"parent_name":"__default__","_bgp_router_parameters":{"address_families":{"family":["inet-vpn"]},"autonomous_system":64513,"address":"10.1.1.12","identifier":"10.1.1.12","port":179},"_bgp_router_refs":[{"uuid":"ac9d1760-2c1c-4731-95aa-6eceff624741","to":["default-domain","default-project","ip-fabric","__default__","system136"]},{"uuid":"edc29a71-d91c-466c-ad00-d47149b8be50","to":["default-domain","default-project","ip-fabric","__default__","mx1"]}],"name":"mx12"}}
		}),
		post_options = {
			host:'localhost',
			port:'8143',
			path:'/api/admin/bgp-router/2bc0b653-97d9-491a-9eb1-5fed811e09d6',
			method:'PUT',
			headers:{
				'Content-Type':'application/json',
				'Content-Length':post_data.length
			}
		},
		post_req;

	// Set up the Request
	post_req = https.request(post_options, function (res) {
		res.setEncoding('utf8');
		var data = '';
		res.on('data', function (chunk) {
			data += chunk;
		});
		res.on('end', function () {
			callback(null, data);
		});
	});

	// Post the Data
	post_req.write(post_data, 'utf8');
	post_req.end();
}

// Test function to generate update
exports.testUpdate = function (req, res) {
	var id = req.param('id');
	putData(id, function (err, data) {
		if (!err) {
			res.send(data);
		} else {
			res.send("Error");
		}
	});
};

function postData(callback) {
	var post_data = JSON.stringify({
		//'content': {"bgp-router":{"_type":"bgp-router","name":"myname","parent_name":"__default__","_bgp_router_parameters":{"address":"13.13.13.13","address-families":{"family":"inet-vpn"},"autonomous-system":65432,"identifier":"12.12.12.12","port":654,"vendor":""},"_bgp_router_refs":[],"_fq_name":["default-domain","default-project","ip-fabric","__default__","myname"]}}
		'content':{"bgp-router":{"parent_name":"__default__", "_type":"bgp-router", "bgp_router_parameters":{"port":179, "identifier":"10.1.1.23", "autonomous_system":64513, "address_families":{"family":["inet-vpn"]}, "address":"10.1.1.23"}, "name":"mx23", "fq_name":["default-domain", "default-project", "ip-fabric", "__default__", "mx23"]}}
		}),
		post_options,
		post_req;

	// Options
	post_options = {
		host:'localhost',
		port:'8143',
		path:'/api/admin/bgp-router',
		method:'POST',
		headers:{
			'Content-Type':'application/json',
			'Content-Length':post_data.length
		}
	};

	// Set up the Request
	post_req = https.request(post_options, function (res) {
		res.setEncoding('utf8');
		var data = '';
		res.on('data', function (chunk) {
			data += chunk;
		});
		res.on('end', function () {
			callback(null, data);
		});
	});

	// Post the Data
	post_req.write(post_data, 'utf8');
	post_req.end();
}

// Test function to generate create
exports.testCreate = function (req, res) {
	try {
		postData(function (err, data) {
			if (!err) {
				res.send(data);
			} else {
				res.send("Error");
			}
		});
	} catch (err) {
		logutils.logger.error(err.stack);
	}
};

function doAuthenticate (req, res, appData)
{
    /* This is a GET request, so redirect to login page */
    return commonUtils.redirectToLogin(req, res);
}

function doVcenterAuthenticate (req, res, appData)
{
    /* This is a GET request, so redirect to login page */
    return commonUtils.redirectToLogin(req, res);
}

exports.login = login;
exports.logout = logout;
exports.vcenter_login = vcenter_login;
exports.vcenter_logout = vcenter_logout;
exports.doAuthenticate = doAuthenticate;
exports.doVcenterAuthenticate = doVcenterAuthenticate;


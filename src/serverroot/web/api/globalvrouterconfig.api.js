/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

/**
 * @globalvrouterconfig.api.js
 *     - Handlers for Global vRouter Configuration
 *     - Interfaces with config api server
 */

var rest        = require('../../common/rest.api');
var async       = require('async');
var vnconfigapi = module.exports;
var logutils    = require('../../utils/log.utils');
var commonUtils = require('../../utils/common.utils');
var config      = require('../../../../config/config.global.js');
var messages    = require('../../common/messages');
var global      = require('../../common/global');
var appErrors   = require('../../errors/app.errors.js');
var util        = require('util');
var url         = require('url');
var configApiServer = require('../../common/configServer.api');

/**
 * Bail out if called directly as "nodejs globalvrouterconfig.api.js"
 */
if (!module.parent) 
{
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
                                     module.filename));
    process.exit(1);
}

function getFirstGlobalvRouterConfig(appData, callback) {
    var gvrListURL     = '/global-vrouter-configs';	
    configApiServer.apiGet(gvrListURL, appData,
        function(error, data) {
    		if (error) {
    			callback(error, null);
    			return;
    		}
    		var gvrUUID = null;
    		if(data["global-vrouter-configs"].length > 0) {
    			gvrUUID = data["global-vrouter-configs"][0].uuid; 
    		} else {
    			callback(error, null);
    			return;
    		}
		    var gvrGetURL = '/global-vrouter-config/' + gvrUUID;
	        configApiServer.apiGet(gvrGetURL, appData,
	        	function(error, data) {
	            	if (error) {
	        			callback(error, null);
	            	} else {
	        			callback(error, data);
	            	}
	        	});
        });
}

function createFirstGlobalvRouterConfig(request, appData, callback) {
    var gvrPostURL = '/global-vrouter-configs';
    var gvrPostData = {};
    gvrPostData["global-vrouter-config"] = {};
    if(null !== request && typeof request !== "undefined") {
    	gvrPostData["global-vrouter-config"] = request.body;
    }
    
    gvrPostData["global-vrouter-config"]["parent_type"] = "global-system-config";
    gvrPostData["global-vrouter-config"]["fq_name"] = [];
    gvrPostData["global-vrouter-config"]["fq_name"][0] = "default-global-system-config";
    gvrPostData["global-vrouter-config"]["fq_name"][1] = "default-global-vrouter-config"
    	
    configApiServer.apiPost(gvrPostURL, gvrPostData, appData, function(err, data) {
    	if (err) {
    		callback(err, null);
    	} else {
    		callback(err, data);
    	}
    });
}

/**
 * @getGlobalvRouterConfig
 * 1. URL /api/tenants/config/global-vrouter-config
 * 2. Gets global vrouter configuration from config api server and 
 * process data from config api server and sends back the http response.
 */
function getGlobalvRouterConfig (request, response, appData) 
{
    getFirstGlobalvRouterConfig(appData, function(error, data) {
    	if(error) {
    		commonUtils.handleJSONResponse(error, response, null);
        } else {
    		commonUtils.handleJSONResponse(error, response, data);
        }
    });
    return;
}

/**
 * @createGlobalvRouterConfig
 * 1. URL /api/tenants/config/global-vrouter-configs
 * 2. Creates global vrouter configuration from config api server and 
 * process data from config api server and sends back the http response.
 */
function createGlobalvRouterConfig (request, response, appData) {
	createFirstGlobalvRouterConfig(request, appData, function(err, data) {
	    if(err) {
			commonUtils.handleJSONResponse(err, response, null);
	    } else {
			commonUtils.handleJSONResponse(err, response, data);
	    }
	    return;
	});
}

/**
 * @updateForwardingOptions
 * 1. URL /api/tenants/config/global-vrouter-config/:id
 * 2. Updates 'vxlan_network_identifier_mode' and 'encapsulation_priorities' 
 * of global vrouter configuration from config api server and process
 * data from config api server and sends back the http response.
 */
function updateForwardingOptions (request, response, appData) {
    var gvrPutData = request.body;
    if (!('global-vrouter-config' in gvrPutData)) {
        error = new appErrors.RESTServerError('Invalid Request ');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    var gvrId = request.param('id');
    if(null === gvrId || typeof gvrId === "undefined") {
        error = new appErrors.RESTServerError('Invalid ID');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    
    var gvrGetURL = '/global-vrouter-config/' + gvrId;
    configApiServer.apiGet(gvrGetURL, appData,
        function(error, data) {
           	if (error) {
           		commonUtils.handleJSONResponse(error, response, null);
           		return;
           	} else {
        	    var gvrPutURL = '/global-vrouter-config/' + gvrId;
        	    var gvrConfigData = data;
        	    gvrConfigData["global-vrouter-config"]["vxlan_network_identifier_mode"] =
        	    	gvrPutData["global-vrouter-config"]["vxlan_network_identifier_mode"];

        	    gvrConfigData["global-vrouter-config"]["encapsulation_priorities"] = {};
        	    gvrConfigData["global-vrouter-config"]["encapsulation_priorities"]["encapsulation"] =
        	    	gvrPutData["global-vrouter-config"]["encapsulation_priorities"]["encapsulation"];
        	    
        	    configApiServer.apiPut(gvrPutURL, gvrConfigData, appData,
        	        function (error, data) {
		            	if (error) {
		            		commonUtils.handleJSONResponse(error, response, null);
		            		return;
		            	} else {
		            		commonUtils.handleJSONResponse(error, response, data);
		            	}
		            	return;
        	        });
           		}
           	});
}

function updateLinkLocalService (request, response, appData) {
    if (!("global-vrouter-config" in request.body)) {
        error = new appErrors.RESTServerError('Invalid Request ');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    getFirstGlobalvRouterConfig(appData, function(error, data) {
    	if(null === data) {
    		//Global vRouter Config doesnt exist or empty.
    		createFirstGlobalvRouterConfig(request, appData, function(error, data) {
            	if (error) {
            		commonUtils.handleJSONResponse(error, response, null);
            		return;
            	} else {
        		    var llsPutData = request.body;
        		    gvrConfigData = data;
        		    var gvrId = gvrConfigData["global-vrouter-config"]["uuid"];
        		    var gvrPutUrl = '/global-vrouter-config/' + gvrId;
        		    configApiServer.apiPut(gvrPutUrl, llsPutData, appData,
        		        function(error, data) {
        		        	if (error) {
        		        		commonUtils.handleJSONResponse(error, response, null);
        		        	} else {
        		        		commonUtils.handleJSONResponse(error, response, data);
        		        	}
        		        	return;
        		    	});
            	}
    		});
    	} else {
		    gvrConfigData = data;
		    var gvrId = gvrConfigData["global-vrouter-config"]["uuid"];
		    var llsPutData = request.body;
		    if(gvrId === llsPutData["global-vrouter-config"]["uuid"]) {
			    var gvrPutUrl = '/global-vrouter-config/' + gvrId;
    		    if(null !== gvrConfigData["global-vrouter-config"]["linklocal_services"] &&
    		    	typeof gvrConfigData["global-vrouter-config"]["linklocal_services"] !== "undefined" &&
    		    	null !== gvrConfigData["global-vrouter-config"]["linklocal_services"]["linklocal_service_entry"] &&
    		    	typeof gvrConfigData["global-vrouter-config"]["linklocal_services"]["linklocal_service_entry"] !== "undefined" &&
    		    	gvrConfigData["global-vrouter-config"]["linklocal_services"]["linklocal_service_entry"].length > 0) {
    		    	if(null === llsPutData["global-vrouter-config"]["linklocal_services"] ||
    		    		typeof llsPutData["global-vrouter-config"]["linklocal_services"] === "undefined") {
    		    		llsPutData["global-vrouter-config"]["linklocal_services"] = {};
    		    	}
    		    }

			    configApiServer.apiPut(gvrPutUrl, llsPutData, appData,
			        function(error, data) {
			        	if (error) {
			        		commonUtils.handleJSONResponse(error, response, null);
			        	} else {
			        		commonUtils.handleJSONResponse(error, response, data);
			        	}
			        	return;
			    	});
		    }
    	}
    });
} 

exports.getGlobalvRouterConfig = getGlobalvRouterConfig;
exports.createGlobalvRouterConfig = createGlobalvRouterConfig;
exports.updateForwardingOptions = updateForwardingOptions;
exports.updateLinkLocalService = updateLinkLocalService;
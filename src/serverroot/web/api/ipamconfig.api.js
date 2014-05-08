/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * @ipamconfig.api.js
 *     - Handlers for IPAM Configuration
 *     - Interfaces with config api server
 */

var rest          = require('../../common/rest.api');
var async         = require('async');
var ipamconfigapi = module.exports;
var logutils      = require('../../utils/log.utils');
var commonUtils   = require('../../utils/common.utils');
var config        = require('../../../../config/config.global.js');
var messages      = require('../../common/messages');
var global        = require('../../common/global');
var appErrors     = require('../../errors/app.errors.js');
var util          = require('util');
var url           = require('url');
var configApiServer = require('../../common/configServer.api');

/**
 * Bail out if called directly as "nodejs ipamconfig.api.js"
 */
if (!module.parent) 
{
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
                                     module.filename));
    process.exit(1);
}

/**
 * @listIpamsCb
 * private function
 * 1. Callback for listIpams
 * 2. Reads the response of per project ipams from config api server
 *    and sends it back to the client.
 */
function listIpamsCb (error, ipamListData, response) 
{
    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }
    commonUtils.handleJSONResponse(error, response, ipamListData);
}

/**
 * @listIpams
 * public function
 * 1. URL /api/tenants/config/ipams
 * 2. Gets list of ipams from config api server
 * 3. Needs tenant / project  id
 * 4. Calls listIpamsCb that process data from config
 *    api server and sends back the http response.
 */
function listIpams (request, response, appData) 
{
    var tenantId      = null;
    var requestParams = url.parse(request.url,true);
    var ipamListURL   = '/network-ipams';

    if (requestParams.query && requestParams.query.tenant_id) {
        tenantId     = requestParams.query.tenant_id;
        ipamListURL += '?parent_type=project&parent_fq_name_str=' + tenantId.toString();
    }

    configApiServer.apiGet(ipamListURL, appData,
                         function(error, data) {
                         listIpamsCb(error, data, response)
                         });
}

/**
 * @getIpamCb
 * private function
 * 1. Callback for getIpam
 * 2. Reads the response of ipam get from config api server
 *    and sends it back to the client.
 */
function getIpamCb (error, ipamConfig, callback) 
{
    if (error) {
        callback(error, null);
        return;
    }
    delete ipamConfig['network-ipam']['id_perms'];
    delete ipamConfig['network-ipam']['href'];
    delete ipamConfig['network-ipam']['_type'];
    callback(error, ipamConfig);
}

/**
 * @getIpam
 * public function
 * 1. URL /api/tenants/config/ipam/:id
 * 2. Gets  ipam config from config api server
 * 3. Needs ipam id
 * 4. Calls getIapmCb that process data from config
 *    api server and sends back the http response.
 */
function getIpam (request, response, appData) 
{
    var iapmId        = null;
    var requestParams = url.parse(request.url,true);
    var ipamGetURL    = '/network-ipam';

    if ((ipamId = request.param('id'))) {
        getIpamAsync({uuid: ipamId, appData: appData},
                     function(err, data) {
            commonUtils.handleJSONResponse(err, response, data);
        });
    } else {
        /**
         * TODO - Add Language independent error code and return
         */
    }
}

function getIpamAsync (ipamObj, callback)
{
    var ipamId = ipamObj['uuid'];
    var appData = ipamObj['appData'];

    var reqUrl = '/network-ipam/' + ipamId;
    configApiServer.apiGet(reqUrl, appData, function(err, data) {
        getIpamCb(err, data, callback);
    });
}

function readIpams (ipamObj, callback)
{
    var dataObjArr = ipamObj['reqDataArr'];
    console.log("Getting dataObjs:", dataObjArr);
    async.map(dataObjArr, getIpamAsync, function(err, data) {
        callback(err, data);
    });
}

/**
 * @ipamSendResponse
 * private function
 * 1. Sends back the response of ipam read to clients after set operations.
 */
function ipamSendResponse(error, ipamConfig, response) 
{
    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
    } else {
       commonUtils.handleJSONResponse(error, response, ipamConfig);
    }
    return;
}

/**
 * @setIpamInVN
 * private function
 * 1. Callback for ipam create / update operations
 * 2. Reads the response of ipam get from config api server
 *    and sends it back to the client.
 */
function setIpamInVN(error, vnConfig, ipamConfig, ipamPostData, response, appData) 
{
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
     }
    var dataObjArr = [];
    for(var i=0; i<vnConfig.length; i++) {
        var userIpamFoundInVN = false;
        var userVNFound = false;
        var vn = vnConfig[i]["virtual-network"];
        var vnPutData = "";
        if(null !== vn["network_ipam_refs"] &&
            typeof vn["network_ipam_refs"] !== "undefined" &&
            vn["network_ipam_refs"].length > 0) {
        	//Current VN has some references to IPAMs
            var ipamLen = vn["network_ipam_refs"].length;

            for(var j=0; j<ipamLen; j++) {
            	//Check if current VN has references to User's IPAM.
                if(vn["network_ipam_refs"][j]["to"][0] === ipamPostData['network-ipam']['fq_name'][0] &&
                    vn["network_ipam_refs"][j]["to"][1] === ipamPostData['network-ipam']['fq_name'][1] &&
                    vn["network_ipam_refs"][j]["to"][2] === ipamPostData['network-ipam']['fq_name'][2]) {
                	//Yes, Current VN has reference to User IPAM.
                	//Delete it. We add it again with User IPAM's new values later.
                	userIpamFoundInVN = true;
                    vn["network_ipam_refs"].splice(j,1);
                    break;
                }
            }
        }
        
        var nwRefs = ipamPostData['network-ipam']['virtual_network_refs'];
        if(null !== nwRefs && typeof nwRefs !== "undefined" && nwRefs.length > 0) {
        	//User has given IPBlocks with some VNs.
        	var nwRefsLen = nwRefs.length;
        	for(var k=0; k<nwRefsLen; k++) {
        		var vnRef = ipamPostData['network-ipam']['virtual_network_refs'][k];
        		var vnPostUrl = '/virtual-network/' + vnRef['uuid'].toString();
        		if(vn["fq_name"][0] === vnRef["to"][0] &&
        		    vn["fq_name"][1] === vnRef["to"][1] &&
        			vn["fq_name"][2] === vnRef["to"][2]) {
        			userVNFound = true;
        			if(userIpamFoundInVN === false) {
        				//Match current VN with VN reference from user.
        				//User is trying to add this IPAM to current VN.
        				if(null !== vn["network_ipam_refs"] &&
        					typeof vn["network_ipam_refs"] !== "undefined") {
        					//There are IPAM references in current VN,
        					//but this is a new IPAM to be added.
        					var ipamLen = vn["network_ipam_refs"].length;
        					vn["network_ipam_refs"][ipamLen] = {};
        					vn["network_ipam_refs"][ipamLen]["to"] = 
        						ipamPostData['network-ipam']['fq_name'];
        					vn["network_ipam_refs"][ipamLen]["attr"] =
        						vnRef['attr'];
        				} else {
        					//There are no IPAM references in current VN.
        					//Add this as new IPAM to current VN.
        					vn["network_ipam_refs"] = [];
        					vn["network_ipam_refs"][0] = {};
        					vn["network_ipam_refs"][0]["to"] = 
        						ipamPostData['network-ipam']['fq_name'];
        					vn["network_ipam_refs"][0]["attr"] = vnRef['attr'];
        				}
        				var vnPutData = {
        						"virtual-network" : vn	
        				};
        				var vnPutUrl = '/virtual-network/' + vn['uuid'].toString();
        				commonUtils.createReqObj(dataObjArr, vnPutUrl,
        					global.HTTP_REQUEST_PUT, vnPutData, null, null, appData);
        			} else {
        				//userIpamFoundInVN is TRUE. Set IPAM reference with new values in current VN.
        				var lenOfNwIpamRefs = vn["network_ipam_refs"].length;
        				vn["network_ipam_refs"][lenOfNwIpamRefs] = {};
        				vn["network_ipam_refs"][lenOfNwIpamRefs]["to"] = 
        					ipamPostData["network-ipam"]["fq_name"];
        				vn["network_ipam_refs"][lenOfNwIpamRefs]["attr"] =
        					vnRef['attr'];
        				var vnPutData = {
        						"virtual-network" : vn
        				};
        				var vnPutUrl = '/virtual-network/' + vn['uuid'].toString();
        				commonUtils.createReqObj(dataObjArr, vnPutUrl,
        					global.HTTP_REQUEST_PUT, vnPutData, null, null, appData);
        			}
        		}
        	}
        	if(userVNFound === false) {
        		//User has deleted IPAM reference from an current VN.
        		//Just check if this IPAM had reference from current VN.
        		if(userIpamFoundInVN === true) {
    				var vnPutData = {
    					"virtual-network" : vn
    				};
    				var vnPutUrl = '/virtual-network/' + vn['uuid'].toString();
    				commonUtils.createReqObj(dataObjArr, vnPutUrl,
    					global.HTTP_REQUEST_PUT, vnPutData, null, null, appData);
        		}
        	}
        } else { 
        	if(userIpamFoundInVN === true) {
            	//User is deleting this IPAM reference from current VN.
				var vnPutData = {
					"virtual-network" : vn
				};
				var vnPutUrl = '/virtual-network/' + vn['uuid'].toString();
				commonUtils.createReqObj(dataObjArr, vnPutUrl,
					global.HTTP_REQUEST_PUT, vnPutData, null, null, appData);
        	}
        }
    }
    if(dataObjArr && dataObjArr.length > 0) {
    	async.map(dataObjArr,
            commonUtils.getAPIServerResponse(configApiServer.apiPut, false),
            function(error, results) {
                setIpamRead(error, ipamConfig, response, appData);
            }
    	);
    } else {
    	setIpamRead(error, ipamConfig, response, appData);
    }
}

function readVNForIpams(error, ipamConfig, ipamPostData, response, appData) 
{
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    var dataObjArr = [];
    if (null !== ipamPostData['network-ipam']['virtual_network_refs'] &&
    	typeof nwRefs !== "undefined") {
    	var nwRefs = ipamPostData['network-ipam']['virtual_network_refs'];
		var nwRefsLen = nwRefs.length; 
		for(var i=0; i<nwRefsLen; i++) {
			var vn = ipamPostData['network-ipam']['virtual_network_refs'][i];
			var vnPostUrl = '/virtual-network/' + vn['uuid'].toString();
        
			commonUtils.createReqObj(dataObjArr, vnPostUrl,
                global.HTTP_REQUEST_GET, null, null, null,
                appData);
		}
        async.map(dataObjArr,
            commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
            function(error, results) {
        	    setIpamInVN(error, results, ipamConfig, ipamPostData, response, appData);
            });
    } else {
    	var domain = ipamPostData["network-ipam"]["fq_name"][0];
    	var project = ipamPostData["network-ipam"]["fq_name"][1];
    	var tenantId = domain + ":" + project;
        var vnsGetURL = "/virtual-networks";
	    configApiServer.apiGet(vnsGetURL, appData,
	    	function(error, data) {
	            for(var i=0; null != data["virtual-networks"][i]; i++) {
				    var vn = data["virtual-networks"][i];
				    var vnGetURL = '/virtual-network/' + vn['uuid'].toString();
			        commonUtils.createReqObj(dataObjArr, vnGetURL,
                        global.HTTP_REQUEST_GET, null, null, null, appData);
                }
	            if(dataObjArr.length > 0) {
		    	    async.map(dataObjArr,
		        	    commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
		        	    function(error, results) {
		        	        setIpamInVN(error, results, ipamConfig, ipamPostData, response, appData);
		        	    });
	            } else {
	            	commonUtils.handleJSONResponse(error, response, null);
	            }
	        });
    }
}


/**
 * @setIpamRead
 * private function
 * 1. Callback for ipam create / update operations
 * 2. Reads the response of ipam get from config api server
 *    and sends it back to the client.
 */
function setIpamRead(error, ipamConfig, response, appData) 
{
    var ipamGetURL = '/network-ipam/';

    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }

    ipamGetURL += ipamConfig['network-ipam']['uuid'];
    configApiServer.apiGet(ipamGetURL, appData,
                         function(error, data) {
                         ipamSendResponse(error, data, response)
                         });
}

/**
 * @createIpam
 * public function
 * 1. URL /api/tenants/config/ipams - Post
 * 2. Sets Post Data and sends back the ipam config to client
 */
function createIpam (request, response, appData) 
{
    var ipamCreateURL = '/network-ipams';
    var ipamPostData  = request.body;

    if (typeof(ipamPostData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (('network_ipam_mgmt' in ipamPostData['network-ipam']) &&
        ('dhcp_option_list' in ipamPostData['network-ipam']
         ['network_ipam_mgmt']) &&
        ('dhcp_option' in ipamPostData['network-ipam']
         ['network_ipam_mgmt']['dhcp_option_list']) &&
        (ipamPostData['network-ipam']['network_ipam_mgmt']
         ['dhcp_option_list']['dhcp_option'].length) &&
        (!(ipamPostData['network-ipam']['network_ipam_mgmt']
       ['dhcp_option_list']['dhcp_option'][0]['dhcp_option_value'].length))) {
        delete ipamPostData['network-ipam']['network_ipam_mgmt']['dhcp_option_list'];
    }

    configApiServer.apiPost(ipamCreateURL, ipamPostData, appData,
                         function(error, data) {
    					 readVNForIpams(error, data, ipamPostData, response, appData);
                         });

}

/**
 * @setIpamMgmt
 * private function
 * 1. Callback for updateIpam
 * 2. Updates the Ipam Mgmt Object, right now only dhcp options
 */
function setIpamOptions(error, ipamConfig, ipamPostData, ipamId, response,
                        appData) 
{
    var ipamPostURL = '/network-ipam/' + ipamId;

    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }

    if (!('network_ipam_mgmt' in ipamPostData['network-ipam'])) {
        ipamPostData['network-ipam']['network_ipam_mgmt'] = [];
    }

    ipamConfig['network-ipam']['network_ipam_mgmt'] = [];
    ipamConfig['network-ipam']['network_ipam_mgmt'] =
           ipamPostData['network-ipam']['network_ipam_mgmt'];
	ipamConfig["network-ipam"]["virtual_DNS_refs"] = [];
    if(typeof ipamPostData["network-ipam"]["network_ipam_mgmt"]["ipam_dns_server"] !== "undefined") {
    	if(typeof ipamPostData["network-ipam"]["network_ipam_mgmt"]
			["ipam_dns_server"]["virtual_dns_server_name"] !== "undefined") {
    		var vdnsName = ipamPostData["network-ipam"]["network_ipam_mgmt"]
    			["ipam_dns_server"]["virtual_dns_server_name"];
    		var dnsMethod = ipamPostData["network-ipam"]["network_ipam_mgmt"]["ipam_dns_method"];

    		if(dnsMethod != null && typeof dnsMethod !== "undefined" && dnsMethod === "virtual-dns-server" && 
    			vdnsName !== null && typeof vdnsName !== "undefined" && vdnsName.indexOf(":") != -1) {
        		var domainName = vdnsName.split(":")[0];
        		var vdnsName   = vdnsName.split(":")[1];
        		ipamConfig["network-ipam"]["virtual_DNS_refs"][0] = {
        			"to" : [
        			    domainName,
        			    vdnsName
        			]
        		};
    		}
    	}
    }

    configApiServer.apiPut(ipamPostURL, ipamConfig, appData, 
                         function(error, data) {
                             readVNForIpams(error, data, ipamPostData, response, appData);
                         });
}

/**
 * @updateIpam
 * public function
 * 1. URL /api/tenants/config/ipam/:id - Put
 * 2. Sets Post Data and sends back the policy to client
 */
function updateIpam (request, response, appData) 
{
    var ipamId         = null;
    var ipamGetURL     = '/network-ipam/';
    var ipamOptionsRef = [];
    var ipamOPtionsLen = 0, i = 0;
    var ipamPostData   = request.body;

    if (typeof(ipamPostData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (ipamId = request.param('id').toString()) {
        ipamGetURL += ipamId;
    } else {
        error = new appErrors.RESTServerError('Add Ipam ID');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if ('network-ipam' in ipamPostData &&
        'network_ipam_mgmt' in ipamPostData['network-ipam'] &&
        'dhcp_option_list' in ipamPostData['network-ipam']['network_ipam_mgmt']) {
    	var ipamOptionList = ipamPostData['network-ipam']['network_ipam_mgmt']['dhcp_option_list'];
    	if(typeof ipamOptionList !== "undefined" && ipamOptionList !== null) {
    		ipamOptionsRef = ipamOptionList['dhcp_option'];
            if(typeof ipamOptionsRef === "undefined")
            	ipamOptionsLen = 0;
            else
            	ipamOptionsLen = ipamOptionsRef.length;
            for (i = 0; i < ipamOptionsLen; i++) {
                if (!('dhcp_option_value' in ipamOptionsRef[i])) {
                    error = new appErrors.RESTServerError('Enter Valid DHCP Option');
                    commonUtils.handleJSONResponse(error, response, null);
                    return;
                } else if (!(ipamOptionsRef[i]['dhcp_option_value'])) {
                    error = new appErrors.RESTServerError('Enter Valid DHCP Option');
                    commonUtils.handleJSONResponse(error, response, null);
                    return;
                }
                if (!('dhcp_option_name' in ipamOptionsRef[i])) {
                    error = new appErrors.RESTServerError('Enter Valid DHCP Option');
                    commonUtils.handleJSONResponse(error, response, null);
                    return;
                } else if (!(ipamOptionsRef[i]['dhcp_option_name'])) {
                    error = new appErrors.RESTServerError('Enter Valid DHCP Option');
                    commonUtils.handleJSONResponse(error, response, null);
                    return;
                }
            }
    	}
    }

    if ('network-ipam' in ipamPostData &&
            'network_ipam_mgmt' in ipamPostData['network-ipam'] &&
            'ipam_dns_method' in ipamPostData['network-ipam']
                                              ['network_ipam_mgmt'] &&
            'ipam_dns_server' in ipamPostData['network-ipam']['network_ipam_mgmt']) {
    	var ipam_dns_method = ipamPostData['network-ipam']['network_ipam_mgmt']['ipam_dns_method'];
    	if(null == ipam_dns_method) {
            error = new appErrors.RESTServerError('Enter Valid DNS Method');
            commonUtils.handleJSONResponse(error, response, null);
            return;
    	}
    	var ipam_dns_server = ipamPostData['network-ipam']['network_ipam_mgmt']['ipam_dns_server'];
    	if(!('tenant_dns_server_address' in ipam_dns_server) ||
    			!('virtual_dns_server_name' in ipam_dns_server)) {
            error = new appErrors.RESTServerError('Enter Valid DNS Value');
            commonUtils.handleJSONResponse(error, response, null);
            return;
    	}
    }
    
    configApiServer.apiGet(ipamGetURL, appData,
                        function(error, data) {
                        setIpamOptions(error, data, ipamPostData,
                                       ipamId, response, appData);
                        });
}

/**
 * @deleteIpamCb
 * private function
 * 1. Return back the response of Ipam delete.
 */
function deleteIpamCb (error, ipamDelResp, response) 
{

    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    commonUtils.handleJSONResponse(error, response, ipamDelResp);
}

/**
 * @deleteIpam
 * public function
 * 1. URL /api/tenants/config/ipam/:id
 * 2. Deletes the Ipam from config api server
 */
function deleteIpam (request, response, appData) 
{
    var ipamDelURL     = '/network-ipam/';
    var ipamId         = null;
    var requestParams = url.parse(request.url, true);

    if (ipamId = request.param('id').toString()) {
        ipamDelURL += ipamId;
    } else {
        error = new appErrors.RESTServerError('Provide IPAM Id');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    configApiServer.apiDelete(ipamDelURL, appData,
                            function(error, data) {
                            deleteIpamCb(error, data, response)
                            });
}

function updateIpamDns (request, response, appData) 
{
    var ipamId         = null;
    var ipamGetURL     = '/network-ipam/';
    var ipamOptionsRef = [];
    var ipamOPtionsLen = 0, i = 0;
    var ipamPostData   = request.body;

    if (typeof(ipamPostData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (ipamId = request.param('id').toString()) {
        ipamGetURL += ipamId;
    } else {
        error = new appErrors.RESTServerError('Add Ipam ID');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    configApiServer.apiGet(ipamGetURL, appData,
                        function(error, data) {
    						setIpamDnsOptions(error, data, ipamPostData,
                                       ipamId, response, appData);
                        });
}

/**
 * @setIpamDnsOptions
 * private function
 * 1. Callback for updateIpamDns
 * 2. Updates the Ipam Mgmt Object
 */
function setIpamDnsOptions(error, ipamConfig, ipamPostData, ipamId, response,
                        appData) 
{
    var ipamPostURL = '/network-ipam/' + ipamId;

    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }

    if(!('network_ipam_mgmt' in ipamConfig['network-ipam'])) {
    	ipamConfig['network-ipam']['network_ipam_mgmt'] = {};
    }
    var vdnsRef = null;
    if(typeof ipamConfig["network-ipam"]["virtual_DNS_refs"] !== "undefined" &&
    		ipamConfig["network-ipam"]["virtual_DNS_refs"].length > 0) {
    	vdnsRef = ipamConfig["network-ipam"]["virtual_DNS_refs"][0];
    	ipamConfig["network-ipam"]["virtual_DNS_refs"].splice(0,ipamConfig["network-ipam"]["virtual_DNS_refs"].length);
    }
    
    var emptyConfig = {
		"ipam_method": null,
		"ipam_virtual_DNS": null,
		"ipam_dns_method": "",
		"ipam_dns_server": {
			"tenant_dns_server_address": null,
			"virtual_dns_server_name": null
		}
    };
    if(typeof ipamPostData['network-ipam']['network_ipam_mgmt']['dhcp_option_list'] !== "undefined") {
    	emptyConfig.dhcp_option_list = 
    		ipamPostData['network-ipam']['network_ipam_mgmt']['dhcp_option_list'];
    }
    
    ipamConfig['network-ipam']['network_ipam_mgmt'] = emptyConfig;

    configApiServer.apiPut(ipamPostURL, ipamConfig, appData, 
                         function(error, data) {
    					 updateIpamInVDNS(error, data, response, ipamId, vdnsRef, appData);
                         });
}

function updateIpamInVDNS(error, ipamConfig, response, ipamId, vdnsRef, appData) 
{
	if (error) {
    	commonUtils.handleJSONResponse(error, response, null);
        return;
    }

	if (null !== vdnsRef && typeof vdnsRef !== "undefined") {
        var vdnsURL = '/virtual-DNS/' + vdnsRef['uuid'];
	    configApiServer.apiGet(vdnsURL, appData,
                function(error, data) {
	    			updateIpamInVDNSCb(error, data, ipamConfig, response, ipamId, appData);
                });
	} else {
        setIpamRead(error, ipamConfig, response, appData);		
	}
}

function updateIpamInVDNSCb(error, result, ipamConfig, response, ipamId, appData) 
{
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    if(!('network_ipam_back_refs' in result['virtual-DNS'])) {
    	setIpamRead(error, ipamConfig, response, appData);
    	return;
    }
    var vdnsURL = '/virtual-DNS/' + result['virtual-DNS']['uuid'];
    for(var i=0; result['virtual-DNS']['network_ipam_back_refs'].length; i++) {
    	if(result['virtual-DNS']['network_ipam_back_refs'][i].uuid === ipamId) {
    		result['virtual-DNS']['network_ipam_back_refs'].splice(i,1);
    		break;
    	}
    }
    //delete result['virtual-DNS']['network_ipam_back_refs'];
    console.log(vdnsURL)
    configApiServer.apiPut(vdnsURL, result, appData, 
            function(error, data) {
    			console.log(data['virtual-DNS']['parent_href']);
    			setIpamRead(error, ipamConfig, response, appData);
            });
}
exports.listIpams  = listIpams;
exports.getIpam    = getIpam;
exports.readIpams  = readIpams;
exports.createIpam = createIpam;
exports.deleteIpam = deleteIpam;
exports.updateIpam = updateIpam;
exports.updateIpamDns = updateIpamDns;

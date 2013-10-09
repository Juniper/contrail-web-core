/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

/**
 * @virtualdnsconfig.api.js
 *     - Handlers for Virtual DNS Configuration
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
var UUID        = require('uuid-js');
var configApiServer = require('../../common/configServer.api');
var opApiServer     = require('../../common/opServer.api');
var jsonPath    = require('JSONPath').eval;

/**
 * Bail out if called directly as "nodejs virtualdnsconfig.api.js"
 */
if (!module.parent) {
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
                                     module.filename));
    process.exit(1);
}

/**
 * listVirtualDNSs
 * public function
 * 1. URL /api/tenants/config/virtual-DNSs/:id
 * 2. Gets list of virtual DNSs for a given domain
 * 3. Needs domain  id as the id
 * 4. Calls listVirtualDNSsCb that process data from config
 *    api server and sends back the http response.
 */
function listVirtualDNSs (request, response, appData) {

    var domainId      = null;
    var requestParams = url.parse(request.url,true);
    var domainURL   = '/domain';

    if ((domainId = request.param('id'))) {
        domainURL += '/' + domainId.toString();
    } else {
        /**
         * TODO - Add Language independent error code and return
         */
    }
    
    configApiServer.apiGet(domainURL, appData,
                         function(error, data) {
    						listVirtualDNSsCb(error, data, response, appData);
                         });
}

/**
 * listVirtualDNSsCb
 * private function
 * 1. Callback for listVirtualDNSs
 * 2. Reads the response of per domain Virtual DNS list from config api server
 *    and sends it back to the client.
 */
function listVirtualDNSsCb (error, vdnsListData, response, appData) {
    var vdnsURL           = null;
    var dataObjArr        = [];
    var i = 0, vdnsLength  = 0;
    var vdnss = {};
    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }

    vdnss['virtual_DNSs'] = [];

    if ('virtual_DNSs' in vdnsListData['domain']) {
        vdnss['virtual_DNSs'] =
              vdnsListData['domain']['virtual_DNSs'];
    }

    vdnsLength = vdnss['virtual_DNSs'].length;
    
    if (!vdnsLength) {
        commonUtils.handleJSONResponse(error, response, vdnss);
        return;
    }

    for (i = 0; i < vdnsLength; i++) {
       var vdnsRef = vdnss['virtual_DNSs'][i];
       vdnsURL = vdnsRef['href'].split(':8082')[1];
       commonUtils.createReqObj(dataObjArr, i, vdnsURL,
               global.HTTP_REQUEST_GET, null, null, null,
               appData);
       
    }
    
    async.map(dataObjArr,
              commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
              function(error, results) {
                  virtualDNSsListAggCb(error, results, response);
              });
}

/**
 * virtualDNSsListAggCb
 * private function
 * 1. Callback for the listVirtualDNSsCb gets, sends all virtual DNSs to client.
 */
function virtualDNSsListAggCb (error, results, response) {
    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }
    vdnss = {};
    vdnss["virtual_DNSs"] = results;
    commonUtils.handleJSONResponse(error, response, vdnss);
}

/**
 * @createDnsSetIpam
 * private function
 * 1. Reads newly created IPAM object and calls updateVirtualDnsAssocIpamRead
 *    to update the DNS ref in IPAM objects.
 */
function createDnsSetIpam(error, vdnsConfig, vdnsPostData,
                          response, appData) {
    var dnsId = null; 
    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }

    dnsId = vdnsConfig['virtual-DNS']['uuid'];
    
   
    updateVirtualDnsAssocIpamRead(error, vdnsConfig, vdnsPostData,
                                  dnsId, appData, function(err, data) {
        setVirtualDNSRead(err, vdnsConfig, response, appData);
    });
}

/**
 * @createVirtualDNS
 * public function
 * 1. URL /api/tenants/config/virtual-DNSs - Post
 * 2. Sets Post Data and sends back the virtual dns config to client
 */
function createVirtualDNS(request, response, appData) {
    var vdnsCreateURL = '/virtual-DNSs';
    var vdnsPostData  = request.body;
    var vdnsIpamRefs  = null;

    if (typeof(vdnsPostData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if ((!('virtual-DNS' in vdnsPostData)) ||
        (!('fq_name' in vdnsPostData['virtual-DNS'])) ||
        (!(vdnsPostData['virtual-DNS']['fq_name'][1].length))) {
        error = new appErrors.RESTServerError('Invalid virtual-DNS');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    vdnsIpamRefs = commonUtils.cloneObj(vdnsPostData);
    delete vdnsPostData['virtual-DNS']['network_ipam_back_refs'];
 
    configApiServer.apiPost(vdnsCreateURL, vdnsPostData, appData,
                         function(error, data) {
                         createDnsSetIpam(error, data, vdnsIpamRefs,
                                          response, appData);
                         });

}

/**
 * @updateVirtualDNS
 * public function
 * 1. URL /api/tenants/config/virtual-DNSs - Post
 * 2. Update Virtual DNS and sends back the virtual dns config to client
 */
function updateVirtualDNS (request, response, appData)
{
    var vdnsURL        = '/virtual-DNS/';
    var vdnsId         = null;
    var vdnsPutData    = request.body;

    if (vdnsId = request.param('id').toString()) {
        vdnsURL += vdnsId;
    } else {
        error = new appErrors.RESTServerError('Virtual DNS ID is required.');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    
    if (null == vdnsPutData['virtual-DNS']['virtual_DNS_data']) {
        error = new appErrors.RESTServerError('Virtual DNS Data not found');
        return;
    }

    configApiServer.apiPut(vdnsURL, vdnsPutData, appData,
                           function(err, data) {
        if (err) {
            commonUtils.handleJSONResponse(err, response, null);
            return;
        }
        configApiServer.apiGet(vdnsURL, appData, function(err, configData) {
		    updateVirtualDnsAssocIpamRead(err, configData, vdnsPutData,
		      		                      vdnsId, appData, 
                                          function(err, data) {
                readVirtualDNS(response, vdnsId, appData);
            });
        });
    });
}

/**
 * @deleteVirtualDNSCb
 * private function
 * 1. Return back the response of virtual dns delete.
 */
function deleteVirtualDNSCb (error, vdnsDelResp, response) {

    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    commonUtils.handleJSONResponse(error, response, vdnsDelResp);
}

/**
 * @deleteVirtualDNS
 * public function
 * 1. URL /api/tenants/config/virtual-DNS/:id
 * 2. Deletes the virtual DNS from config api server
 */
function deleteVirtualDNS (request, response, appData) {
    var vdnsDelURL     = '/virtual-DNS/';
    var vdnsId         = null;
    var requestParams = url.parse(request.url, true);

    if (vdnsId = request.param('id').toString()) {
        vdnsDelURL += vdnsId;
    } else {
        error = new appErrors.RESTServerError('Virtual DNS ID is required.');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    configApiServer.apiGet(vdnsDelURL, appData, function(err, configData) {
        /* Now delete the ipam_refs */
        var vdnsPostData = commonUtils.cloneObj(configData);
        delete vdnsPostData['virtual-DNS']['network_ipam_back_refs'];
        updateVirtualDnsAssocIpamRead(err, configData, vdnsPostData, vdnsId,
                                      appData, function(err, data) {
            if (err) {
                deleteVirtualDNSCb(err, null, response, appData);
                return;
            }
            
            /* Now delete the virtual DNS */
            configApiServer.apiDelete(vdnsDelURL, appData,
                                      function(error, data) {
                deleteVirtualDNSCb(error, data, response, appData);
            });
        });
    });
}

/**
 * @setVirtualDNSRead
 * private function
 * 1. Callback for Virtual DNS create / update operations
 * 2. Reads the response of Virtual DNS get from config api server
 *    and sends it back to the client.
 */
function setVirtualDNSRead(error, vdnsConfig, response, appData) {
    var vdnsGetURL = '/virtual-DNS/';

    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }

    vdnsGetURL += vdnsConfig['virtual-DNS']['uuid'];
    
    configApiServer.apiGet(vdnsGetURL, appData,
                         function(error, data) {
                         virtualDNSSendResponse(error, data, response);
                         });
}

/**
 * @virtualDNSSendResponse
 * private function
 * 1. Sends back the response of virtual dns read to clients after set operations.
 */
function virtualDNSSendResponse(error, vdnsConfig, response) {
    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
    } else {
       commonUtils.handleJSONResponse(error, response, vdnsConfig);
    }
    return;
}

/**
 * @getVirtualDNS
 * public function
 * 1. URL /api/tenants/config/virtual-DNS/:id
 * 2. Gets list of virtual DNSs from config api server
 * 3. Needs tenant id
 * 4. Calls getVirtualDNSCb that process data from config
 *    api server and sends back the http response.
 */
function getVirtualDNS (request, response, appData) {
    var virtualDNSId = null;
    var requestParams    = url.parse(request.url, true);

    if (!(virtualDNSId = request.param('id').toString())) {
        error = new appErrors.RESTServerError('Add Virtual DNS id');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    readVirtualDNS(response, virtualDNSId, appData);
}

/**
 * @getVirtualDNSCb
 * private function
 * 1. Callback for getVirtualDNS
 * 2. Reads the response of a particular Virtual DNS from config
 *    api server
 *    - Gets each DNSRecord
 */
function getVirtualDNSCb (error, vdnsGetData, response, appData) {

    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }
    
    parseVDNSRecords(error, response, vdnsGetData, appData);
}

/**
 * @readVirtualDNS
 * private function
 * 1. Needs VDNS uuid in string format
 */
function readVirtualDNS (response, dnsIdStr, appData) {
    var vdnsGetURL         = '/virtual-DNS/';

    if (dnsIdStr.length) {
        vdnsGetURL += dnsIdStr;
    } else {
        error = new appErrors.RESTServerError('Add Virtual DNS id');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    configApiServer.apiGet(vdnsGetURL, appData,
                         function(error, data) {
    						getVirtualDNSCb(error, data, response, appData);
                         });
}

/**
 * @parseVDNSRecords
 * private function
 * 1. Gets the Virtual DNS record list and then does an individual get on
 *    the record for a given virtual DNS
 */
function parseVDNSRecords(error, response, vdnsConfig, appData) {
	var vdnsRecordRef     = null;
	var vdnsRecordUrl     = null;
	var dataObjArr        = [];
	var vdnsObj         = null;
	var vdnsRecordRefsLen = 0;
	
    if ( 'virtual_DNS_records' in vdnsConfig['virtual-DNS']) {
    	vdnsRecordRef = vdnsConfig['virtual-DNS']['virtual_DNS_records'];
    	vdnsRecordRefsLen = vdnsRecordRef.length;
    }

    for (i = 0; i < vdnsRecordRefsLen; i++) {
    	if(vdnsRecordRef) {
    		vdnsObj = vdnsRecordRef[i];
    		vdnsRecordUrl = vdnsObj['href'].split('8082')[1];
            commonUtils.createReqObj(dataObjArr, i, vdnsRecordUrl,
                    global.HTTP_REQUEST_GET, response[i], null, null,
                    appData);
    		
    	}
    }

	async.map(dataObjArr,
		  commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
          function(error, results) {
              VDNSRecordAggCb(error, results, response, vdnsConfig, appData);
          });
          
}

/**
 * @VDNSRecordAggCb
 * private function
 * 1. Callback for the Virtual DNS Record get for a give Virtual DNS.
 */
function VDNSRecordAggCb (error, results, response, vdnsConfig, appData) {
    var i = 0, vdnsRecordsLen = 0;

    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }

    vdnsRecordsLen = results.length;
    for (i = 0; i < vdnsRecordsLen; i++) {
        vdnsConfig['virtual-DNS']['virtual_DNS_records'][i]['virtual_DNS_record_data'] = 
                     results[i]['virtual-DNS-record']['virtual_DNS_record_data'];
    }

    commonUtils.handleJSONResponse(error, response, vdnsConfig);
}

/**
 * @updateVDNSRecordAdd
 * public function
 * 1. URL /api/tenants/config/virtual-DNS/:id/virtual-DNS-records
 * 2. Adds a virtual DNS record to virtual DNS
 * 3. Reads back the updated virtual DNS config and send it
 *    back to the client
 */
function updateVDNSRecordAdd (request, response, appData) {
    var vdnsRecordPostURL    = '/virtual-DNS-records';
    var vdnsRecordPostData   = request.body;
    var vdnsRecordCreateData = {};
    var requestParams = url.parse(request.url, true);

    if (!request.param('id').toString()) {
        error = new appErrors.RESTServerError('Virtual DNS Id is required');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if ((!('virtual_DNS_records' in vdnsRecordPostData['virtual-DNS'])) ||
        (!vdnsRecordPostData['virtual-DNS']
         ['virtual_DNS_records'][0]['to'].length)) {
        error = new appErrors.RESTServerError('Virtual DNS name ' +
                                              'is required');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    if(typeof vdnsRecordPostData['virtual-DNS']['virtual_DNS_records'][0]['to'][2] === "undefined") {
        uuid = UUID.create();
        vdnsRecordPostData['virtual-DNS']['virtual_DNS_records'][0]['to'][2] = uuid['hex'];
        vdnsRecordPostData['virtual-DNS']['virtual_DNS_records'][0]['name']  = uuid['hex'];
        vdnsRecordPostData['virtual-DNS']['virtual_DNS_records'][0]['uuid']  = uuid['hex'];
    }
    
    vdnsRecordCreateData = {
    		"virtual-DNS-record": {
    			"_type": "virtual-DNS-record",
    			"fq_name": vdnsRecordPostData['virtual-DNS']['virtual_DNS_records'][0].to,
    			"name" : vdnsRecordPostData['virtual-DNS']['virtual_DNS_records'][0]['name'],
    			"uuid" : vdnsRecordPostData['virtual-DNS']['virtual_DNS_records'][0]['uuid'],
    			"parent_type": "virtual-DNS",
    			"virtual_DNS_record_data" : vdnsRecordPostData['virtual-DNS']['virtual_DNS_records'][0]['virtual_DNS_record_data']
    		}
    };

    configApiServer.apiPost(vdnsRecordPostURL, vdnsRecordCreateData, appData, 
                         function(error, data) {
    						if (error) {
    							commonUtils.handleJSONResponse(error, response, null);
    							return;
    						}
    						commonUtils.handleJSONResponse(error, response, data);
						 });
}

/**
 * @updateVDNSRecordUpdate
 * public function
 * 1. URL /api/tenants/config/virtual-DNS/:id/virtual-DNS-record/:recordid
 * 2. Updates a virtual DNS record 
 * 3. Reads back the updated virtual DNS config and send it
 *    back to the client
 */
function updateVDNSRecordUpdate (request, response, appData)
{
    var dnsRecURL = '/virtual-DNS-record/';
    var vdnsRecPutData = request.body;
    var requestParams = url.parse(request.url, true);

    if (!(virtualDNSId = request.param('id').toString())) {
        error = new appErrors.RESTServerError('Virtual DNS Id ' +
                                              'is required');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (!(vdnsRecordId = request.param('recordid').toString())) {
        error = new appErrors.RESTServerError('DNS Record Id is required');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    try {
        var vdnsRecData =
            vdnsRecPutData['virtual-DNS']['virtual_DNS_records'][0]['virtual_DNS_record_data'];
    } catch(e) {
        error = new appErrors.RESTServerError('DNS Record not found');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    dnsRecURL += vdnsRecordId;
    configApiServer.apiGet(dnsRecURL, appData, function(err, configData) {
        configData['virtual-DNS-record']['virtual_DNS_record_data'] =
            vdnsRecData;
        configApiServer.apiPut(dnsRecURL, configData, appData,
                               function(err, data) {
            if (err) {
                commonUtils.handleJSONResponse(err, response, null);
            } else {
            	commonUtils.handleJSONResponse(err, response, data);
            }
        });
    });
}

/**
 * @updateVDNSRecordDelete
 * public function
 * 1. URL /api/tenants/config/virtual-DNS/:id/virtual-DNS-record/:recordid
 * 2. Deletes the record from Virtual DNS
 * 3. Reads updated config and sends it back to client
 */
function updateVDNSRecordDelete (request, response, appData) {
    var vdnsRecordURL = '/virtual-DNS-record';
    var virtualDNSId = null;
    var vdnsRecordId       = null;
    var requestParams    = url.parse(request.url, true);

    if (!(virtualDNSId = request.param('id').toString())) {
        error = new appErrors.RESTServerError('Virtual DNS Id ' +
                                              'is required');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (!(vdnsRecordId = request.param('recordid').toString())) {
        error = new appErrors.RESTServerError('DNS Record Id is required');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    vdnsRecordURL += "/" + vdnsRecordId;
    configApiServer.apiDelete(vdnsRecordURL, appData,
    							function(error, data) {
							        if (error) {
							            commonUtils.handleJSONResponse(error, response, null);
							        } else {
							        	commonUtils.handleJSONResponse(error, response, data);
							        }
							    });
}

/**
 * @updateVDNSIpams
 * public function
 * 1. URL /api/tenants/config/virtual-DNS/:id/network-ipams
 * 2. Gets VDNS config and updates network ipam references for it.
 * 3. Reads updated config and sends it back to client
 */
function updateVDNSIpams (request, response, appData) {
	var vdnsURL = '/virtual-DNS/';
	var vdnsId = null;
	var vdnsPostData = request.body;
	var requestParams = url.parse(request.url, true);

	if (!(vdnsId = request.param('id').toString())) {
		error = new appErrors.RESTServerError('Add DNS name');
		commonUtils.handleJSONResponse(error, response, null);
		return;
	}

	vdnsURL += vdnsId;
	configApiServer.apiGet(vdnsURL, appData,
			function (error, data) {
		updateVirtualDnsAssocIpamRead(error, data, vdnsPostData,
				vdnsId, appData, function(err, data) {
            setVirtualDNSRead(err, data, response, appData);
        });
	});
}

/**
 * @updateVirtualDnsAssocIpamRead
 * private function
 */
function updateVirtualDnsAssocIpamRead(error, vdnsConfig, vdnsPostData, 
		                               vdnsId, appData, callback) 
{
    var url = null;
    var ipamRef = [];
    var ipamURL = [];
    var ipamRefLen = 0, i = 0;
    var ipamUIRef = [];
    var ipamUIRefLen = 0;
    var dataObjArr = [];
    var curCfgAllDel = false;

    if (error) {
        callback(error, null);
        return;
    }

    vdnsConfig['virtual-DNS']['ipam_uuid'] = {};

    try {
        if ((!('network_ipam_back_refs' in vdnsPostData['virtual-DNS'])) ||
            (!vdnsPostData['virtual-DNS']['network_ipam_back_refs']
                [0]['uuid'].length)) {
            curCfgAllDel = true;
        }
    } catch(e) {
        callback(null, null);
        return;
    }

    if ((!(['network_ipam_back_refs'] in vdnsConfig['virtual-DNS']) ||
        (!vdnsConfig['virtual-DNS']['network_ipam_back_refs'].length))
        && curCfgAllDel) {
        callback(null, null);
        return;
    }

    if ((!['network_ipam_back_refs'] in vdnsConfig['virtual-DNS']) && !curCfgAllDel) {
    	vdnsConfig['virtual-DNS']['network_ipam_back_refs'] = [];
    	ipamUIRef = vdnsPostData['virtual-DNS']['network_ipam_back_refs'];
    	ipamUIRefLen = ipamUIRef.length;
        for (i = 0; i < ipamUIRefLen; i++) {
            uuid = ipamUIRef[i]['uuid'];
            vdnsConfig['virtual-DNS']['ipam_uuid'][uuid] =
            {'to':ipamUIRef[i]['to'],
                'attr':ipamUIRef[i]['attr'],
                'uuid':uuid,
                'oper':'add'
            };
            url = '/network-ipam/' + uuid;
            commonUtils.createReqObj(dataObjArr, i, url,
                global.HTTP_REQUEST_GET, null, null, null,
                appData);
        }
        async.map(dataObjArr,
            commonUtils.getAPIServerResponse(configApiServer.apiGet,
                false),
            function (error, results) {
                updateVirtualDnsUpdateIpams(error, results,
                		vdnsConfig, vdnsId, appData, callback);
            });
        return;
    }

    var j = 0;
    if (['network_ipam_back_refs'] in vdnsConfig['virtual-DNS'] &&
    		vdnsConfig['virtual-DNS']['network_ipam_back_refs'].length) {
    	ipamRef = vdnsConfig['virtual-DNS']['network_ipam_back_refs'];
    	ipamRefLen = ipamRef.length;
        for (i = 0; i < ipamRefLen; i++) {
            uuid = ipamRef[i]['uuid'];
            if (vdnsConfig['virtual-DNS']['ipam_uuid'][uuid] == null) {
                url = '/network-ipam/' + uuid;
                commonUtils.createReqObj(dataObjArr, j++, url,
                    global.HTTP_REQUEST_GET, null, null,
                    null, appData);
            }
            vdnsConfig['virtual-DNS']['ipam_uuid'][uuid] =
            {'to':ipamRef[i]['to'],
                'attr':null,
                'uuid':ipamRef[i]['attr'],
                'oper':'delete'
            };
        }
        if (curCfgAllDel) {
            async.map(dataObjArr,
                commonUtils.getAPIServerResponse(configApiServer.apiGet,
                    false),
                function (error, results) {
                    updateVirtualDnsUpdateIpams(error, results,
                    		vdnsConfig, vdnsId, appData, callback);
                });
            return;
        }
    }

    j = 0;
    ipamUIRef = vdnsPostData['virtual-DNS']['network_ipam_back_refs'];
    ipamUIRefLen = ipamUIRef.length;
    for (i = 0; i < ipamUIRefLen; i++) {
        uuid = ipamUIRef[i]['uuid'];
        if (vdnsConfig['virtual-DNS']['ipam_uuid'][uuid] == null) {
            url = '/network-ipam/' + uuid;
            commonUtils.createReqObj(dataObjArr, j++, url,
                global.HTTP_REQUEST_GET, null, null, null,
                appData);
        }
        vdnsConfig['virtual-DNS']['ipam_uuid'][uuid] =
        {'to':ipamUIRef[i]['to'],
            'attr':ipamUIRef[i]['attr'],
            'uuid':uuid,
            'oper':'add'
        };
    }
    async.map(dataObjArr,
        commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
        function (error, results) {
            updateVirtualDnsUpdateIpams(error, results,
            		vdnsConfig, vdnsId, appData, callback);
        });
    return;
}

/**
 * @updateVirtualDnsUpdateIpams
 * private function
 * Updates Virtual DNSs references from Ipams
 */
function updateVirtualDnsUpdateIpams(error, results, vdnsConfig,
                                     vdnsId, appData, callback) {
    var ipamRef = null;
    var vdnsIpamRef = {};
    var ipamVdnsRef = [];
    var ipamURL = null;
    var ipamLen = 0, i = 0, j = 0;
    var vdnsIpamRefLen = [];
    var vdnsIpamRefObj = {};
    var ipamUUID = null;
    var dataObjArr = [];

    if (error) {
        callback(error, null);
        return;
    }

    ipamLen = results.length;

    for (i = 0; i < ipamLen; i++) {
    	ipamUUID = results[i]['network-ipam']['uuid'];
        vdnsIpamRef = vdnsConfig['virtual-DNS']['ipam_uuid'][ipamUUID];
        ipamURL = '/network-ipam/' + ipamUUID;
        results[i]['network-ipam']['virtual_DNS_refs'] = [];

        ipamVdnsRef = results[i]['network-ipam']['virtual_DNS_refs'];
        if (vdnsIpamRef['oper'] == 'add') {
        	vdnsIpamRefObj =
            {
                to:vdnsConfig['virtual-DNS']['fq_name'],     
                attr:{'sequence': { 'major': 0, 'minor': 0}},
                uuid:vdnsConfig['virtual-DNS']['uuid']
            };
            ipamVdnsRef.push(vdnsIpamRefObj);
        } else {
            ipamVdnsRefLen = ipamVdnsRef.length;
            for (j = 0; j < ipamVdnsRefLen; j++) {
                if (vdnsConfig['virtual-DNS']['uuid']
                    == ipamVdnsRef[j]['uuid']) {
                	ipamVdnsRef.splice(j, 1);
                    break;
                }
            }
        }
        var ipamNwIpamMgmtRefObj = results[i]['network-ipam']['network_ipam_mgmt'];
        if(null == ipamNwIpamMgmtRefObj || typeof ipamNwIpamMgmtRefObj === "undefined") {
        	ipamNwIpamMgmtRefObj = {};
        }
        if(null != ipamNwIpamMgmtRefObj && typeof ipamNwIpamMgmtRefObj !== "undefined") {
            if (vdnsIpamRef['oper'] == 'add') {
            	ipamNwIpamMgmtRefObj.ipam_dns_method = "virtual-dns-server";
            	ipamNwIpamMgmtRefObj.ipam_dns_server = {};
    			ipamNwIpamMgmtRefObj.ipam_dns_server.tenant_dns_server_address = null;
            	ipamNwIpamMgmtRefObj.ipam_dns_server.virtual_dns_server_name = 
            		vdnsConfig['virtual-DNS']['fq_name'][0] + ":" +
            		vdnsConfig['virtual-DNS']['fq_name'][1];
            } else {
            	ipamNwIpamMgmtRefObj.ipam_dns_method = "none";
            	ipamNwIpamMgmtRefObj.ipam_dns_server = {};
    			ipamNwIpamMgmtRefObj.ipam_dns_server.tenant_dns_server_address = null;
            	ipamNwIpamMgmtRefObj.ipam_dns_server.virtual_dns_server_name = null; 
            }
        }
        results[i]['network-ipam']['network_ipam_mgmt'] = ipamNwIpamMgmtRefObj;
        commonUtils.createReqObj(dataObjArr, i, ipamURL, global.HTTP_REQUEST_PUT,
            results[i], null, null, appData);
    }

    async.map(dataObjArr,
        commonUtils.getAPIServerResponse(configApiServer.apiPut, false),
        function (error, results) {
            callback(error, null);
        });

    return;
}

function sortDnsGenDataByConnectTime (genRec1, genRec2)
{
    var conTime1 = jsonPath(genRec1, "$..connect_time");
    var conTime2 = jsonPath(genRec2, "$..connect_time");

    var resetTime1 = jsonPath(genRec1, "$..reset_time");
    var resetTime2 = jsonPath(genRec2, "$..reset_time");
    var connTime = (conTime1[0] > conTime2[0]) ? conTime1[0] : conTime2[0];
    var resetTime = (resetTime1[0] > resetTime2[0]) ? resetTime1[0] :
        resetTime2[0];

    return (connTime - resetTime);
}

function getDNSNodeByGeneratorsData (dnsNodes, dnsGen)
{
    try {
        var dnsGen = dnsGen['value'];
        var dnsNodes = dnsNodes['value'];
        var dnsGenCnt = dnsGen.length;
        dnsGen.sort(sortDnsGenDataByConnectTime);
        /* We got sorted list, so use the first one */
        var dnsNodesCnt = dnsNodes.length;
    } catch(e) {
        return null;
    }
    for (var i = 0; i < dnsNodesCnt; i++) {
        var dnsAgent = dnsNodes[i]['name'] + ':DnsAgent';
        if (dnsAgent == dnsGen[0]['name']) {
            break;
        }
    }
    if (i == dnsNodesCnt) {
        return null;
    }
    return dnsNodes[i];
}

function getVirtualDNSSandeshRecordsSendCb (ip, req, res)
{
    var dnsName = req.param('dnsfqn');
    var dataObjArr = [];
    var reqUrl = '/Snh_ShowVirtualDnsRecords?virtual_dns=' + dnsName;

    commonUtils.createReqObj(dataObjArr, 0, reqUrl);
    var dnsAgentRestApi =
        commonUtils.getRestAPIServer(ip, global.SANDESH_DNS_AGENT_PORT);

    async.map(dataObjArr,
              commonUtils.getServerRespByRestApi(dnsAgentRestApi, true),
              function(err, data) {
        if (data) {
            commonUtils.handleJSONResponse(null, res, data);
        } else {
            commonUtils.handleJSONResponse(null, res, []);
        }
    });
}

function getVirtualDNSSandeshRecords (req, res, appData)
{
    var dataObjArr = [];
    var url = '/analytics/uves/dns-node/*';
    commonUtils.createReqObj(dataObjArr, 0, url, global.HTTP_REQUEST_GET, null,
                             opApiServer, null, appData);
    url = '/analytics/uves/generator/*:DnsAgent?flat';
    commonUtils.createReqObj(dataObjArr, 1, url, global.HTTP_REQUEST_GET, null,
                             opApiServer, null, appData);
    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(opApiServer, false),
              function(err, results) {
        var dnsNode = getDNSNodeByGeneratorsData(results[0], results[1]);
        if (null == dnsNode) {
            commonUtils.handleJSONResponse(null, res, []);
            return;
        }

        var ips = jsonPath(dnsNode, "$..self_ip_list");
        if (ips.length > 0) {
            ip = ips[0][0];
        }
        getVirtualDNSSandeshRecordsSendCb(ip, req, res);
    });
}

exports.listVirtualDNSs           = listVirtualDNSs;
exports.createVirtualDNS          = createVirtualDNS;
exports.updateVirtualDNS          = updateVirtualDNS;
exports.deleteVirtualDNS     	  = deleteVirtualDNS;
exports.getVirtualDNS             = getVirtualDNS;
exports.updateVDNSRecordAdd	      = updateVDNSRecordAdd;
exports.updateVDNSRecordUpdate    = updateVDNSRecordUpdate;
exports.updateVDNSRecordDelete	  = updateVDNSRecordDelete;
exports.updateVDNSIpams           = updateVDNSIpams;
exports.getVirtualDNSSandeshRecords = getVirtualDNSSandeshRecords;

/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

/**
 * @vnconfig.api.js
 *     - Handlers for Virtual Network Configuration
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
var jsonPath    = require('JSONPath').eval;
var configApiServer = require('../../common/configServer.api');

/**
 * Bail out if called directly as "nodejs vnconfig.api.js"
 */
if (!module.parent) 
{
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
                                     module.filename));
    process.exit(1);
}

/**
 * @listVirtualNetworksCb
 * private function
 * 1. Callback for listVirtualNetworks
 * 2. Reads the response of per tenant vn list from config api server
 *    and sends it back to the client.
 */
function listVirtualNetworksCb (error, vnListData, response) 
{
    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }
    commonUtils.handleJSONResponse(error, response, vnListData);
}

/**
 * @listVirtualNetworks
 * public function
 * 1. URL /api/tenants/config/virtual-networks
 * 2. Gets list of virtual networks from config api server
 * 3. Needs tenant id
 * 4. Calls listVirtualNetworksCb that process data from config
 *    api server and sends back the http response.
 */
function listVirtualNetworks (request, response, appData) 
{
    var tenantId      = null;
    var requestParams = url.parse(request.url,true);
    var vnListURL     = '/virtual-networks';

    if (requestParams.query && requestParams.query.tenant_id) {
        tenantId   = requestParams.query.tenant_id;
        vnListURL += '?parent_type=project&parent_fq_name_str=' + tenantId.toString();
    }

    configApiServer.apiGet(vnListURL, appData,
                         function(error, data) {
                         listVirtualNetworksCb(error, data, response)
                         });
}

/**
 * @sendVnGetResponse
 * private function
 * 1. Called from the last callback of vn config processig
 */ 
function sendVnGetResponse (error, vnConfig, callback) 
{

    delete vnConfig['virtual-network']['access_control_lists'];
    delete vnConfig['virtual-network']['href'];
    delete vnConfig['virtual-network']['id_perms'];
    delete vnConfig['virtual-network']['routing_instances'];
    callback(error, vnConfig);
}

/**
 * @parseVNSubnets
 * private function
 * 1. Parses the quantum subnets and adds it to ipam refs of the VN config
 */
function parseVNSubnets (error, vnConfig, callback) 
{
    var ipamRef       = null;
    var ipamSubnetLen = 0, i = 0;

    if (error) {
        callback(error, null);
        return;
    }

    var k = 0;
    try {
        var nwIpamRefs = [];
        var nwIpamRefsClone = [];
        try {
            var nwIpamRefs = vnConfig['virtual-network']['network_ipam_refs'];
            var nwIpamRefsLen = nwIpamRefs.length;
        } catch(e) {
            nwIpamRefsLen = 0;
        }
        for (var i = 0; i < nwIpamRefsLen; i++) {
            var ipamSubnets = nwIpamRefs[i]['attr']['ipam_subnets'];
            var ipamSubnetsLen = ipamSubnets.length;
        	var m = 0;
            for (var j = 0; j < ipamSubnetsLen; j++) {
                nwIpamRefsClone[k] = {};
                nwIpamRefsClone[k]['subnet'] = {};
                nwIpamRefsClone[k]['subnet']['ipam_subnet'] =
                    ipamSubnets[j]['subnet']['ip_prefix'] + '/' +
                    ipamSubnets[j]['subnet']['ip_prefix_len'];
                if(null == ipamSubnets[j]['default_gateway'] ||
                	typeof ipamSubnets[j]['default_gateway'] === "undefined")
                	nwIpamRefsClone[k]['subnet']['default_gateway'] = "";
                else
                	nwIpamRefsClone[k]['subnet']['default_gateway'] =
                	ipamSubnets[j]['default_gateway'];

                if(null !== nwIpamRefs[i]['attr']['host_routes'] &&
                	typeof nwIpamRefs[i]['attr']['host_routes'] !== "undefined" && !m) {
                	nwIpamRefsClone[k]["host_routes"] = {};
                	nwIpamRefsClone[k]["host_routes"] = nwIpamRefs[i]['attr']['host_routes'];
                	m++;
                }

                nwIpamRefsClone[k]['subnet']['ipam'] = nwIpamRefs[i]['to'];
                k++;
            }
        }
        vnConfig['virtual-network']['network_ipam_refs'] = [];
        vnConfig['virtual-network']['network_ipam_refs'] = nwIpamRefsClone;
    } catch(e) {
        logutils.logger.debug("In parseVNSubnets(): JSON Parse error:" + e);
    }
    sendVnGetResponse(error, vnConfig, callback);
}

/**
 * @VnGetSubnetResponse
 * private function
 * 1. Called from the last callback of vn config processig
 */ 
function VnGetSubnetResponse (error, vnConfig, callback)
{
    if (error) {
        callback(error, null);
        return;
    }
    parseVNSubnets(error, vnConfig, callback);
}

/**
 * @VNFloatingIpPoolAggCb
 * private function
 * 1. Callback for the floating ip pool get for a give VN.
 */
function VNFloatingIpPoolAggCb (error, results, vnConfig, appData, callback)
{
    var i = 0, floatingIpPoolsLen = 0;

    if (error) {
        callback(error, null);
        return;
    }

    floatingIpPoolsLen = results.length;
    for (i = 0; i < floatingIpPoolsLen; i++) {
        vnConfig['virtual-network']['floating_ip_pools'][i]['projects'] = 
                     results[i]['floating-ip-pool']['project_back_refs'];
    }

    VnGetSubnetResponse(error, vnConfig, callback);
}

/**
 * @parseVNFloatingIpPools
 * private function
 * 1. Gets the Floating ip pool list and then does an individual get on
 *    the floating ip pool for a given virtual network
 */
function parseVNFloatingIpPools (error, vnConfig, appData, callback)
{
    var fipPoolRef     = null;
    var dataObjArr     = [];
    var fipObj         = null;
    var fipPoolRefsLen = 0;
    var reqUrl         = null;

    if ( 'floating_ip_pools' in vnConfig['virtual-network']) {
        fipPoolRef = vnConfig['virtual-network']['floating_ip_pools'];
        fipPoolRefsLen = fipPoolRef.length;
    }

    for (i = 0; i < fipPoolRefsLen; i++) {
        fipObj = fipPoolRef[i];
        reqUrl = '/floating-ip-pool/' + fipObj['uuid'];
        commonUtils.createReqObj(dataObjArr, reqUrl,
                                 global.HTTP_REQUEST_GET, null, null, null,
                                 appData);
    }

    if (!dataObjArr.length) {
        VnGetSubnetResponse(error, vnConfig, callback);
        return;
    }

    async.map(dataObjArr,
              commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
              function(error, results) {
                  VNFloatingIpPoolAggCb(error, results, vnConfig,
                                        appData, callback);
              });
}

/**
 * @addRouteTargetDataToConfigByRoutingInstData
 * private function
 * 1. Reads the response of list of routing-instance data and add route 
 *    target entries from it to vnConfigData
 */
function addRouteTargetDataToConfigByRoutingInstData (vnConfigData,
                                                      routInstData)
{
    if (null == routInstData) {
        return;
    }
    var routTargetData = jsonPath(routInstData, "$..route_target_refs");
    if (!routTargetData.length) {
        return;
    }
    routTargetData = routTargetData[0];
    try {
        routTargetCnt = routTargetData.length;
        if (!routTargetCnt) {
            return;
        }
        vnConfigData['virtual-network']['route_target_list'] = {};
        vnConfigData['virtual-network']['route_target_list']['route_target']
            = [];
        for (var i = 0; i < routTargetCnt; i++) {
            var routTgtTo = routTargetData[i]['to'];
            var routTgtToCnt = routTgtTo.length;
            for (var j = 0; j < routTgtToCnt; j++) {
                vnConfigData['virtual-network']['route_target_list']['route_target'].push(routTargetData[i]['to'][j]);
            }
        }
    } catch(e) {
        logutils.logger.debug("In addRouteTargetDataToConfigByRoutingInstData():" +
                              "JSON Parse error:" + e);
    }
}

/**
 * @getVirtualNetworkCb
 * private function
 * 1. Callback for getVirtualNetwork
 * 2. Reads the response of a particular virtual-network from config
 *    api server
 *    - Gets each IpamSubnet
 *    - Gets each Floating IP pool
 *    - ACL Reference is already part of the virtual-network get
 */
function getVirtualNetworkCb (error, vnGetData, appData, callback) 
{
    var dataObjArr  = [];
    var routInstUrl = null;

    if (error) {
       callback(error, null);
       return;
    }

    /* Get the route target list from routing-instance */
    var routingInstData = vnGetData['virtual-network']['routing_instances'];
    if (null != routingInstData) {
        var routingInstCnt = routingInstData.length;
        if (routingInstCnt > 0) {
            for (var i = 0; i < routingInstCnt; i++) {
                routInstUrl = '/routing-instance/' + routingInstData[i]['uuid'];
                commonUtils.createReqObj(dataObjArr, routInstUrl, null, null, null,
                                         null, appData);
            }
            async.map(dataObjArr,
                      commonUtils.getServerResponseByRestApi(configApiServer,
                                                             true),
                      function(err, routInstData) {
                addRouteTargetDataToConfigByRoutingInstData(vnGetData,
                                                            routInstData);
                parseVNFloatingIpPools(error, vnGetData, appData, callback);
            });
        } else {
            parseVNFloatingIpPools(error, vnGetData, appData, callback);
        }
    } else {
        parseVNFloatingIpPools(error, vnGetData, appData, callback);
    }
}

/**
 * @readVirtualNetwork
 * private function
 * 1. Needs network uuid in string format
 */
function readVirtualNetwork (netIdStr, appData, callback) 
{
    var vnGetURL         = '/virtual-network/';

    if (netIdStr.length) {
        vnGetURL += netIdStr;
    } else {
        error = new appErrors.RESTServerError('Add Virtual Network id');
        callback(error, null);
        return;
    }

    configApiServer.apiGet(vnGetURL, appData,
                         function(error, data) {
                         getVirtualNetworkCb(error, data, appData, callback);
                         });
}

/**
 * @getVirtualNetwork
 * public function
 * 1. URL /api/tenants/config/virtual-network/:id
 * 2. Gets list of virtual networks from config api server
 * 3. Needs tenant id
 * 4. Calls getVirtualNetworkCb that process data from config
 *    api server and sends back the http response.
 */
function getVirtualNetwork (request, response, appData) 
{
    var virtualNetworkId = null;
    var requestParams    = url.parse(request.url, true);

    if (!(virtualNetworkId = request.param('id').toString())) {
        error = new appErrors.RESTServerError('Add Virtual Network id');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    readVirtualNetwork(virtualNetworkId, appData,
                       function(err, data) {
        commonUtils.handleJSONResponse(err, response, data);
    });
}

function readVirtualNetworkAsync (vnObj, callback)
{
    var vnID = vnObj['uuid'];
    var appData = vnObj['appData'];

    readVirtualNetwork(vnID, appData, function(err, data) {
        callback(err, data);
    });
}

function readVirtualNetworks (dataObj, callback)
{
    var dataObjArr = dataObj['reqDataArr'];
    async.map(dataObjArr, readVirtualNetworkAsync, function(err, data) {
        callback(err, data);
    });
}

/**
 * @createVirtualNetworkCb
 * private function
 * 1. Callback for CreateVirtualNetwork
 * 2. Again reads the response of the created network and updates
 *    the route target.
 */
function createVirtualNetworkCb (error, vnConfig, vnPostData, response, appData) 
{
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    vnPostData['virtual-network']['uuid'] = vnConfig['virtual-network']['uuid'];

    response.req.body = vnPostData;
    updateVNFipPoolAdd(response.req, response, appData);
}

/**
 * @createVNSubnetAdd
 * private function
 * 1. Callback for CreateVirtualNetwork
 */
function createVNSubnetAdd (error, vnConfig, vnPostData,
                            request, response, appData) 
{
    var subnetPostData   = {};
    var netIpamRef       = null;
    var subnet_prefix    = null;

    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if ('network_ipam_refs' in vnPostData['virtual-network']) {
        netIpamRef = vnPostData['virtual-network']['network_ipam_refs'];
        if (!netIpamRef[0]['attr']['ipam_subnets'][0]
                          ['subnet']['ip_prefix'].length) {
            delete vnPostData['virtual-network']['network_ipam_refs'];
        } else {
            var reqUrl = '/virtual-network/' +
                vnConfig['virtual-network']['uuid'].toString();
            var putData = { 'virtual-network' :
                {
                    'fq_name': vnPostData['virtual-network']['fq_name'],
                    'network_ipam_refs': netIpamRef
                }
            };
            configApiServer.apiPut(reqUrl, putData, appData, function(error, data) {
                createVirtualNetworkCb (error, vnConfig,
                                        vnPostData, response, appData);
            });
            return;
        }
    }
    createVirtualNetworkCb (error, vnConfig, vnPostData, response, appData);
}

/**
 * @setVNPolicySequence
 * private function
 * 1. Iterates through policy refs and sets the sequence numbers,
 */
function setVNPolicySequence (vnPostData) 
{
    var netPolRefLen = 0, i = 0;

    if ('network_policy_refs' in vnPostData['virtual-network']) {
        netPolRefLen = vnPostData['virtual-network']
                                 ['network_policy_refs'].length;
    }

    for (i = 0; i < netPolRefLen; i++) {
        if (!(vnPostData['virtual-network']['network_policy_refs']
              [i]['to'][2].length)) {
            vnPostData['virtual-network']['network_policy_refs'] = [];
            return vnPostData
        }
        var timer = null;
        if(null !== vnPostData['virtual-network']['network_policy_refs'][i]['attr'] &&
        	typeof vnPostData['virtual-network']['network_policy_refs'][i]['attr'] !== "undefined" &&
        	null !== vnPostData['virtual-network']['network_policy_refs'][i]['attr']['timer'] &&
        	typeof vnPostData['virtual-network']['network_policy_refs'][i]['attr']['timer'] !== "undefined") {
        	timer = vnPostData['virtual-network']['network_policy_refs'][i]['attr']['timer'];
        }
        vnPostData['virtual-network']['network_policy_refs'][i]['attr'] = {};
        vnPostData['virtual-network']['network_policy_refs']
                  [i]['attr'] = {
                      'timer': timer,
                      'sequence': {
                          major: i,
                          minor: 0
                      }
                  };
    }
    return vnPostData;
}

function getNewFipPoolLists (vnPutData, configData)
{
    var result = commonUtils.cloneObj(vnPutData);
    var fipList = [], k = 0;
    try {
        var fipPool = 
            result['virtual-network']['floating_ip_pools'];
        if (null == fipPool) {
            return result;
        }
        var configFipPool = 
            configData['virtual-network']['floating_ip_pools'];
        if (null == configFipPool) {
            return result;
        }
        var cnt = fipPool.length;
        var cCnt = configFipPool.length;
        for (var i = 0; i < cnt; i++) {
            fipTo = fipPool[i]['to'].join(':');
            for (var j = 0; j < cCnt; j++) {
                if (fipTo == configFipPool[j]['to'].join(':')) {
                    /* Already Exists */
                    break;
                }
            }
            if (j == cCnt) {
                fipList[k++] = fipPool[i];
            }
        }
    } catch(e) {
        logutils.logger.debug("In getNewFipPoolLists(): JSON Parse error:" + e);
    }
    if (!fipList.length) {
        delete result['virtual-network']['floating_ip_pools'];
    } else {
        result['virtual-network']['floating_ip_pools'] = fipList;
    }
    return result;
}

function getDelFipPoolLists (vnPutData, configData)
{
    var result = commonUtils.cloneObj(configData);
    try {
        var fipPool = 
            vnPutData['virtual-network']['floating_ip_pools'];
        if (null == fipPool) {
            return result;
        }

        var configFipPool = 
            result['virtual-network']['floating_ip_pools'];
        if (null == configFipPool) {
            return result;
        }
        var cnt = fipPool.length;
        var cCnt = configFipPool.length;
        for (var i = 0; i < cCnt; i++) {
            fipTo = configFipPool[i]['to'].join(':');
            for (var j = 0; j < cnt; j++) {
                if (fipTo == fipPool[j]['to'].join(':')) {
                    break;
                }
            }
            if (j != cnt) {
                result['virtual-network']['floating_ip_pools'].splice(i, 1);
                i = -1;
                cCnt--;
            }
        }
    } catch(e) {
        logutils.logger.debug("In getDelFipPoolLists(): JSON Parse error:" + e);
    }
    return result;
}

function getFipPoolToUpdate(vnConfigData, vnPutData)
{
    var tempFipPool = [];
    try {
        var configFipPool = vnConfigData['virtual-network']['floating_ip_pools'];
        var configFipPoolCnt = configFipPool.length;
        var vnPutFipPool = vnPutData['virtual-network']['floating_ip_pools'];
        var vnPutFipPoolCnt = vnPutFipPool.length;
    } catch(e) {
        return null;
    }

    for (var i = 0, k = 0; i < vnPutFipPoolCnt; i++) {
        for (var j = 0; j < configFipPoolCnt; j++) {
            try {
                if (vnPutFipPool[i]['to'].join(':') ==
                    configFipPool[j]['to'].join(':')) {
                    tempFipPool[k] = vnPutFipPool[i];
                    tempFipPool[k]['uuid'] = configFipPool[j]['uuid'];
                    k++;
                }
            } catch(e) {
            }
        }
    }
    vnPutData['virtual-network']['floating_ip_pools'] = tempFipPool;
    return vnPutData;
}

function updateVNFipPool (dataObj, callback)
{
    var fipPutData = dataObj['fipPutData'];
    var vnId = dataObj['vnId'];
    var appData = dataObj['appData'];

    var fipPoolId =
        fipPutData['virtual-network']['floating_ip_pools'][0]['uuid'];
    var reqUrl = '/floating-ip-pool/' + fipPoolId;

    configApiServer.apiGet(reqUrl, appData, function(err, configFipData) {
        if (err) {
            callback(err, null);
            return;
        }
        updateVNFipPoolReadUpdate(null, configFipData, fipPutData, vnId,
                                  appData, function(err, data) {
            callback(err, data);
        });
    });
}

function updateVNFipPoolEdit (error, vnConfigData, vnPutData, appData,
                              resultData, callback)
{
    var dataObjArr = [];
    if (error) {
        callback(error, null);
        return;
    }

    /* Now check what are the fip-pools are edit-config */
    var vnPutData = getFipPoolToUpdate(vnConfigData, vnPutData);
    if (null == vnPutData) {
        callback(null, null);
        return;
    }
    var fipPool = vnPutData['virtual-network']['floating_ip_pools'];
    if (null == fipPool) {
        callback(null, null);
        return;
    }
    var fipPoolLen = fipPool.length;
    var fipPutData = commonUtils.cloneObj(vnPutData);
    for (var i = 0; i < fipPoolLen; i++) {
        dataObjArr[i] = {};
        fipPutData['virtual-network']['floating_ip_pools'] = [];
        fipPutData['virtual-network']['floating_ip_pools'][0] =
            vnPutData['virtual-network']['floating_ip_pools'][i];
        dataObjArr[i]['fipPutData'] = commonUtils.cloneObj(fipPutData);
        dataObjArr[i]['vnId'] = vnConfigData['virtual-network']['uuid'];
        dataObjArr[i]['appData'] = appData;
    }
    async.mapSeries(dataObjArr, updateVNFipPool, function(err, data) {
        callback(err, resultData);
    });
}

function updateFloatingIpList (vnId, vnPutData, appData, response, callback)
{
    var vnUrl = '/virtual-network/' + vnId;
    var fipDelList = [];
    configApiServer.apiGet(vnUrl, appData, function(err, configData) {
        var fipNewPoolVN = getNewFipPoolLists(vnPutData, configData);
        var fipDelPoolVN = getDelFipPoolLists(vnPutData, configData);
        try {
            var len = fipDelPoolVN['virtual-network']['floating_ip_pools'].length;
            for (var i = 0; i < len; i++) {
                fipDelList[i] = {};
                fipDelList[i]['virtualNetworkId'] = vnId;
                fipDelList[i]['fipPoolId'] =
                    fipDelPoolVN['virtual-network']['floating_ip_pools'][i]['uuid'];
                fipDelList[i]['appData'] = appData;
            }
        } catch(e) {
            logutils.logger.debug('In updateFloatingIpList():' +
                                  ' JSON Parse error:' + e);
        }
        if (fipDelList.length > 0) {
            async.mapSeries(fipDelList, fipPoolDelete, function(error, results) {
                updateVNFipPoolAddCb(fipNewPoolVN, appData, 
                                     function(err, data) {
                    if (err) {
                        error = err;
                    }
                    updateVNFipPoolEdit(error, configData, vnPutData, appData,
                                        data, callback);
                });
            });
        } else {
            updateVNFipPoolAddCb(fipNewPoolVN, appData, function(err, data) {
                updateVNFipPoolEdit(err, configData, vnPutData, appData,
                                    null, callback);
            });
        }
    });
}

function updateVNPolicyRefs (vnConfig, response, appData)
{
    var vnPutData = response.req.body;
    var vnId = response.req.param('id');
    var vnPutURL = '/virtual-network/' + vnId;

    if(null === vnConfig['virtual-network']['virtual_network_properties'] ||
    	typeof vnConfig['virtual-network']['virtual_network_properties'] === "undefined") {
        if ('virtual_network_properties' in vnPutData['virtual-network']) {
        	vnConfig['virtual-network']['virtual_network_properties'] = {};
        }
    }
	if(null !== vnPutData['virtual-network']['virtual_network_properties']['forwarding_mode'] &&
		typeof vnPutData['virtual-network']['virtual_network_properties']['forwarding_mode'] !== "undefined") {
		vnConfig['virtual-network']['virtual_network_properties']['forwarding_mode'] =
		vnPutData['virtual-network']['virtual_network_properties']['forwarding_mode'];
	}
	if(null !== vnPutData['virtual-network']['virtual_network_properties']['vxlan_network_identifier'] &&
    	typeof vnPutData['virtual-network']['virtual_network_properties']['vxlan_network_identifier'] !== "undefined") {
    	vnConfig['virtual-network']['virtual_network_properties']['vxlan_network_identifier'] =
    	vnPutData['virtual-network']['virtual_network_properties']['vxlan_network_identifier'];
    }

    vnConfig['virtual-network']['route_target_list'] = {};
    if ('route_target_list' in vnPutData['virtual-network']) {
        vnConfig['virtual-network']['route_target_list'] = 
            vnPutData['virtual-network']['route_target_list'];
    }

    vnConfig['virtual-network']['network_ipam_refs'] = [];
    if ('network_ipam_refs' in vnPutData['virtual-network']) {
        vnConfig['virtual-network']['network_ipam_refs'] = 
            vnPutData['virtual-network']['network_ipam_refs'];
    }

    vnConfig['virtual-network']['network_policy_refs'] = [];
    if ('network_policy_refs' in vnPutData['virtual-network']) {
        vnConfig['virtual-network']['network_policy_refs'] =
            vnPutData['virtual-network']['network_policy_refs'];
        vnSeqConfig = setVNPolicySequence(vnConfig);
    } else {
        vnSeqConfig = vnConfig;
    }

    vnPutData['virtual-network']['uuid'] = vnId;
    configApiServer.apiPut(vnPutURL, vnSeqConfig, appData, function(err, data) {
        if (err) {
            commonUtils.handleJSONResponse(err, response, null);
            return;
        }
        readVirtualNetworkAsync({uuid:vnId, appData:appData},
                                function(err, data) {
            commonUtils.handleJSONResponse(err, response, data);
        });
    }); 
}

function updateVirtualNetwork (request, response, appData) 
{
    var vnId = request.param('id');
    var vnPutData = request.body;

    var reqUrl = '/virtual-network/' + vnId;

    vnPutData['virtual-network']['uuid'] = vnId;
    updateFloatingIpList(vnId, vnPutData, appData, response,
                         function(err, data) {
        if (err) {
            commonUtils.handleJSONResponse(err, response, null);
            return;
        }
        configApiServer.apiGet(reqUrl, appData, function(err, data) {
            if (err || (null == data)) {
                var error = new appErrors.RESTServerError('Virtual Network Id' +
                                                          vnId + ' does not exist');
                commonUtils.handleJSONResponse(error, response, null);
                return;
            }
            updateVNPolicyRefs(data, response, appData);
        });
    });
}

/**
 * @createVirtualNetwork
 * public function
 * 1. URL /api/tenants/config/virtual-networks - Post
 * 2. Gets list of virtual networks from config api server
 */
function createVirtualNetwork (request, response, appData) 
{
    var vnCreateURL    = '/virtual-networks';
    var vnPostData     = request.body;
    var vnSeqPostData  = {};
    var vnConfigData   = null;

    if (typeof(vnPostData) != 'object') {
        error = new appErrors.RESTServerError('Invalid Post Data');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    vnConfigData = JSON.parse(JSON.stringify(vnPostData)); 
    delete vnPostData['virtual-network']['network_ipam_refs'];

    if ('route_target_list' in vnPostData['virtual-network']) {
        if (!(vnPostData['virtual-network']['route_target_list']
                      ['route_target'][0].length)) {
            delete vnPostData['virtual-network']['route_target_list'];
        }
    }


    vnSeqPostData = setVNPolicySequence(vnPostData);
    configApiServer.apiPost(vnCreateURL, vnSeqPostData, appData,
                         function(error, data) {
                         createVNSubnetAdd(error, data,
                                           vnConfigData, request, response,
                                           appData);
    });
}

/**
 * @deleteVirtualNetworkCb
 * private function
 * 1. Return back the response of net delete.
 */
function deleteVirtualNetworkCb (error, vnDelResp, response) 
{
    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    commonUtils.handleJSONResponse(error, response, vnDelResp);
}

/**
 * @deleteVirtualNetwork
 * public function
 * 1. URL /api/tenants/config/virtual-network/:id
 * 2. Deletes the virtual network from config api server
 */
function deleteVirtualNetwork (request, response, appData) 
{
    var vnDelURL         = '/virtual-network/';
    var virtualNetworkId = null;
    var requestParams    = url.parse(request.url, true);
    var uuidList         = [];
    var dataObjArr       = [];

    if (virtualNetworkId = request.param('id').toString()) {
        vnDelURL += virtualNetworkId;
    } else {
        error = new appErrors.RESTServerError('Virtual Network Id ' +
                                              'is required');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    configApiServer.apiGet(vnDelURL, appData, function(err, data) {
        if (err || (null == data)) {
            var error = new appErrors.RESTServerError('Virtual Network Id' +
                                                      virtualNetworkId + ' does not exist');
            commonUtils.handleJSONResponse(error, response, null);
            return;
        }

        var vmiBackRefs = 
            data['virtual-network']['virtual_machine_interface_back_refs'];
        if (null != vmiBackRefs) {
            var vmiCnt = vmiBackRefs.length;
            for (var i = 0; i < vmiCnt; i++) {
                uuidList.push(vmiBackRefs[i]['uuid']);
            }   
            if (vmiCnt > 0) {
                var error =
                    new appErrors.RESTServerError('Virtual machine back refs ' +
                                                  uuidList.join(',') + ' exist');
                commonUtils.handleJSONResponse(error, response, null);
                return;                                
            }
        }
        /* Check if we have any floating-ip-pool */
        var fipPoolList = data['virtual-network']['floating_ip_pools'];
        if (null != fipPoolList) {
            var fipPoolCnt = fipPoolList.length;
            for (i = 0; i < fipPoolCnt; i++) {
                dataObjArr[i] = {};
                dataObjArr[i]['virtualNetworkId'] = virtualNetworkId;
                dataObjArr[i]['fipPoolId'] = fipPoolList[i]['uuid'];
                dataObjArr[i]['appData'] = appData;
            }
            async.map(dataObjArr, fipPoolDelete, function(err, results) {
                configApiServer.apiDelete(vnDelURL, appData,
                                          function(error, data) {
                    deleteVirtualNetworkCb(error, data, response);
                });
            });
        } else {
            configApiServer.apiDelete(vnDelURL, appData,
                                      function(error, data) {
                deleteVirtualNetworkCb(error, data, response);
            });
        }
    });
}

function doIpamSubnetExist(nwIpam, nwSubnet, vnNwIpamRefs)
{
    var vnIpam = null;
    var vnSubnet = null;
    var vnNwIpamRefsLen = vnNwIpamRefs.length;

    for (var i = 0; i < vnNwIpamRefsLen; i++) {
        vnIpam = vnNwIpamRefs[i]['subnet']['ipam'].join(':');
        if (nwIpam == vnIpam) {
            subnet = vnNwIpamRefs[i]['subnet']['ipam_subnet'];
            if (subnet == nwSubnet) {
                return true;
            }
        }
    }
    return false;
}

function updateVNSubnetByConfigData (request, response, vnConfigData, appData,
                                     callback)
{
    var nwConfigData     = request.body;
    var vnIpamRefs = 
        vnConfigData['virtual-network']['network_ipam_refs'];
    var virtualNetworkId = request.param('id').toString();
    var vnURL = '/virtual-network/' + virtualNetworkId;
    var vnIpamRefsLen = vnIpamRefs.length;
    for (var i = 0; i < vnIpamRefsLen; i++) {
        var vnIpam = vnIpamRefs[i]['to'].join(':');
        var vnSubnets = vnIpamRefs[i]['attr']['ipam_subnets'];
        var vnSubnetsLen = vnSubnets.length;
        for (var j = 0; j < vnSubnetsLen; j++) {
            var vnSubnet = vnSubnets[j]['subnet']['ip_prefix'] + "/" + 
                vnSubnets[j]['subnet']['ip_prefix_len'];
            if (false == doIpamSubnetExist(vnIpam, vnSubnet,
                                          nwConfigData['virtual-network']
                                          ['network_ipam_refs'])) {
                vnSubnets.splice(j, 1);
                i = 0;
                break;
            }
        }
    }
    configApiServer.apiPut(vnURL, vnConfigData, appData, function(error, data) {
        if (error) {
            commonUtils.handleJSONResponse(error, response, null);
        } else {
            readVirtualNetworkAsync({uuid:virtualNetworkId, appData:appData},
                                    function(err, data) {
                commonUtils.handleJSONResponse(err, response, data);
            });
        }
    });
}

/**
 * @updateVNSubnetDelete
 * public function
 * 1. URL /api/tenants/config/virtual-network/:id/ipam/:ipamid
 * 2. Deletes the subnet from Virtual Network, uses quantum to
 *    delete the subnet
 * 3. Reads updated config and sends it back to client
 */
function updateVNSubnetDelete (request, response, appData) 
{
    var vnURL            = '/virtual-network/';
    var virtualNetworkId = null;
    var vnSubnetId       = null;
    var requestParams    = url.parse(request.url, true);
    var subnetFoundFlag  = false;

    if (!(virtualNetworkId = request.param('id').toString())) {
        error = new appErrors.RESTServerError('Virtual Network Id ' +
                                              'is required');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    vnURL += virtualNetworkId;
    configApiServer.apiGet(vnURL, appData, function(error, vnConfigData) {
        updateVNSubnetByConfigData(request, response, vnConfigData, appData, 
                                   function (err, data) {
        });
    });
}

/**
 * @updateVNSubnetAdd
 * public function
 * 1. URL /api/tenants/config/virtual-network/:id/ipams
 * 2. Adds subnet to Virtual Network, uses quantum to
 *    add the subnet.
 * 3. Reads updated config and sends it back to client
 */
function updateVNSubnetAdd (vnId, vnPostData, vnConfigData, appData, callback)
{
    var vnURL            = '/virtual-network/';
    var subnetPostData   = {};
    var virtualNetworkId = null;
    var netIpamRef       = null;
    var subnet_prefix    = null;
    var configIpamRefsLen = 0;
    var configIpamRefs    = [];
    var noIpSubnet        = false;

    vnURL += vnId;

        configApiServer.apiPut(vnURL, vnConfigData, appData,
                               function(error, data) {
            callback(error, data);
            return;
        });
        return;
    netIpamRef = vnPostData['virtual-network']['network_ipam_refs'];
    if (null == netIpamRef) {
        noIpSubnet = true;
    }
    try {
        if (!netIpamRef[0]['attr']['ipam_subnets'][0]
            ['subnet']['ip_prefix'].length) {
            noIpSubnet = true;
        }
    } catch(e) {
    }
    if (true == noIpSubnet) {
        configApiServer.apiPut(vnURL, vnConfigData, appData,
                               function(error, data) {
            callback(error, data);
            return;
        });
    }
    try {
        netIpamTo = netIpamRef[0]['to'].join(':');
        configIpamRefs = vnConfigData['virtual-network']['network_ipam_refs'];
        configIpamRefsLen = configIpamRefs.length;
    } catch(e) {
        configIpamRefsLen = 0;
        vnConfigData['virtual-network']['network_ipam_refs'] = [];
        vnConfigData['virtual-network']['network_ipam_refs'][configIpamRefsLen]
            = netIpamRef[0];
    }
    try {
        for (var i = 0; i < configIpamRefsLen; i++) {
            configIpamTo = configIpamRefs[i]['to'].join(':');
            if (netIpamTo == configIpamTo) {
                var subnet = configIpamRefs[i]['attr']['ipam_subnets'];
                var subnetLen = subnet.length;
                configIpamRefs[i]['attr']['ipam_subnets'][subnetLen] =
                    netIpamRef[0]['attr']['ipam_subnets'][0];
                break;
            }
        }
        if (i == configIpamRefsLen) {
            configIpamRefs[configIpamRefsLen] = netIpamRef[0];
        }
    } catch(e) {
    }
    configApiServer.apiPut(vnURL, vnConfigData, appData, function(error, data) {
        callback(error, data);
    });
}

/**
 * @createFipPoolUpdateSendResponse
 * private function
 */ 
function createFipPoolUpdateSendResponse (error, results, response,
                                          fipPool, fipPostData, appData) 
{
    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }

    readVirtualNetwork(fipPostData['virtual-network']['uuid'].toString(),
                       appData, function(err, data) {
        commonUtils.handleJSONResponse(err, response, data);
    });
    return;
}

function getFipUUID (fipFqn, fipPool)
{
    var cnt = fipPool.length;
    for (var i = 0; i < cnt; i++) {
        if (fipFqn == fipPool[i]['floating-ip-pool']['fq_name'].join(':')) {
            return fipPool[i]['floating-ip-pool']['uuid'];
        }
    }
    return null;
}

function getFipPoolToEntry (fipPoolRef, fipPool, projName, fipPostData)
{
    try {
        var fipPoolCnt = fipPool.length;
        var fip = fipPostData['virtual-network']['floating_ip_pools'];
        var fipCnt = fip.length;
    } catch(e) {
        return;
    }
    for (var i = 0; i < fipCnt; i++) {
        try {
            var projCnt = fip[i]['projects'].length;
        } catch(e) {
            continue;
        }
        for (var j = 0; j < projCnt; j++) {
            if (projName == fip[i]['projects'][j]['to'].join(':')) {
                var fipName = fip[i]['to'].join(':');
                var fipUUID = getFipUUID(fipName, fipPool);
                if (fipUUID == null) {
                    continue;
                }
                fipPoolRefObj = {
                    to: fip[i]['to'],
                    attr: {},
                    uuid: fipUUID
                }
                fipPoolRef.push(fipPoolRefObj);
            }
        }
    }
}

/**
 * @createFipPoolUpdateProjects
 * private function
 */ 
function createFipPoolUpdateProjects (error, results,
                                      fipPool, fipPostData, appData,
                                      callback) 
{
    var projRef     = null;
    var fipPoolRef  = [];
    var dataObjArr  = [];
    var projURL     = null;
    var projLen     = 0, i = 0;
    var fipPoolRefObj = {};

    if (error) {
        callback(null, null);
        return;
    }

    if (!(projLen = results.length)) {
        callback(null, null);
        return;
    }

    fipPoolCnt = fipPool.length;
    for (i = 0; i < projLen ; i++) {
        projURL = '/project/' + results[i]['project']['uuid'];

        if (!('floating_ip_pool_refs' in results[i]['project'])) {
            results[i]['project']['floating_ip_pool_refs'] = [];
        }
        fipPoolRef = results[i]['project']['floating_ip_pool_refs'];
        getFipPoolToEntry(fipPoolRef, fipPool,
                          results[i]['project']['fq_name'].join(':'),
                          fipPostData);
        commonUtils.createReqObj(dataObjArr, projURL, global.HTTP_REQUEST_PUT,
                                 results[i], null, null, appData);
    }
    async.map(dataObjArr,
              commonUtils.getAPIServerResponse(configApiServer.apiPut, false),
              function(error, results) {
                  callback(error, results);
              });
    return;
}

/**
 * @createFipPoolProjectsGet
 * private function
 */ 
function createFipPoolProjectsGet (error, fipPool, fipPostData,
                                   appData, callback) 
{
    var reqUrl         = null;
    var fipPoolRef     = 0;
    var dataObjArr     = [];
    var fipProjRefsLen = 0, i = 0, j = 0, k = 0;

    if (error) {
        callback(error, null);
       return;
    }

    try {
        fipPoolRef = fipPostData['virtual-network']['floating_ip_pools'];
        var fipPoolRefCnt = fipPoolRef.length;
    } catch(e) {
        callback(null, null);
        return;
    }
    for (var i = 0; i < fipPoolRefCnt; i++) {
        try {
            if (!(('projects' in fipPoolRef[i]) &&
                  (fipPoolRef[i]['projects'][0]['to'][1].length))) {
                continue;
            }
        } catch(e) {
            continue;
        }
        try {
            fipProjRefsLen = fipPoolRef[i]['projects'].length;
        } catch(e) {
            continue;
        }
        for (var j = 0; j < fipProjRefsLen; j++) {
            reqUrl = '/project/' + fipPoolRef[i]['projects'][j]['uuid'];
            commonUtils.createReqObj(dataObjArr, reqUrl,
                                     global.HTTP_REQUEST_GET, null, null, null,
                                     appData);
        }
    }
    async.map(dataObjArr,
              commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
              function(error, results) {
                  createFipPoolUpdateProjects(error, results,
                                              fipPool, fipPostData,
                                              appData, callback);
              });

    return;
}

/**
 * @updateVNFipPoolAdd
 * public function
 * 1. URL /api/tenants/config/virtual-network/:id/floatingip-pools
 * 2. Adds a Floating IP pool to network and associates the
 *    floatingip-pool to projects
 * 3. Reads back the updated virtual network config and send it
 *    back to the client
 */
function updateVNFipPoolAdd (request, response, appData)
{
    var fipPostData   = request.body;
    var vnId = fipPostData['virtual-network']['uuid'];

    updateVNFipPoolAddCb(fipPostData, appData, function(err, data) {
        readVirtualNetwork(vnId, appData,
                           function(err, data) {
            commonUtils.handleJSONResponse(err, response, data);
        });
    });
}

function updateVNFipPoolAddCb (fipPostData, appData, callback) 
{
    var fipCreateDataArr = [];
    var fipPostURL    = '/floating-ip-pools';
    var fipCreateData = {};

    try {
        var fipPoolData = fipPostData['virtual-network']['floating_ip_pools'];
        var fipPoolCnt = fipPoolData.length;
        for (var i = 0; i < fipPoolCnt; i++) {
            fipCreateData = {
                "floating-ip-pool": {
                    "fq_name": fipPostData['virtual-network']
                        ['floating_ip_pools'][i]['to'],
                    "parent_type": "virtual-network"
                }
            };
            commonUtils.createReqObj(fipCreateDataArr, fipPostURL,
                                     global.HTTP_REQUEST_POST,
                                     commonUtils.cloneObj(fipCreateData), null, null,
                                     appData);
        }
    } catch(e) {
        callback(null, null);
        return;
    }
    async.map(fipCreateDataArr,
              commonUtils.getAPIServerResponse(configApiServer.apiPost, false),
              function(error, results) {
        createFipPoolProjectsGet(error, results, fipPostData, appData,
                                 function(err, data) {
            callback(err, data);
        });
    });
}

/**
 * @deleteFipPoolUpdateSendResponse
 * private function
 */ 
function deleteFipPoolUpdateSendResponse (error, results,
                                          fipPool, virtualNetworkId, appData,
                                          callback) 
{
    var fipPoolURL = '/floating-ip-pool/';

    if (error) {
        callback(error, null);
        return;
    }

    fipPoolURL += fipPool['floating-ip-pool']['uuid'];
    configApiServer.apiDelete(fipPoolURL, appData, function (error) {
        callback(error, null);
    });
}

/**
 * @deleteFipPoolUpdateProjects
 * private function
 * Deletes the FIP pool references from projects
 */
function deleteFipPoolUpdateProjects (error, results,
                                      fipPool, virtualNetworkId, appData,
                                      callback) 
{
    var projRef       = null;
    var fipPoolRef    = [];
    var dataObjArr    = [];
    var projURL       = null;
    var projLen       = 0, i = 0, j = 0;
    var fipPoolRefLen = [];
    var fipPoolRefObj = {};

    if (error) {
        callback(error, null);
        return;
    }

    projLen = results.length;

    for (i = 0; i < projLen ; i++) {
        projURL = '/project/' + results[i]['project']['uuid'];

        fipPoolRef = results[i]['project']['floating_ip_pool_refs'];
        fipPoolRefLen = fipPoolRef.length;
        for (j = 0; j < fipPoolRefLen; j++) {
            if (fipPool['floating-ip-pool']['uuid']
                           == fipPoolRef[j]['uuid']) {
               fipPoolRef.splice(j, 1);
               break; 
            }
        }
        commonUtils.createReqObj(dataObjArr, projURL,
                                 global.HTTP_REQUEST_PUT, results[i], null, null,
                                 appData);
    }

    async.map(dataObjArr,
              commonUtils.getAPIServerResponse(configApiServer.apiPut, false),
              function(error, results) {
                  deleteFipPoolUpdateSendResponse(error, results,
                                                  fipPool, virtualNetworkId,
                                                  appData, callback);
              });
}

/**
 * @updateVNFipPoolReadDel
 * private function
 */ 
function updateVNFipPoolReadDel (error, fipPool, virtualNetworkId, 
                                 appData, callback) 
{
    var reqUrl         = null;
    var fipProjRef     = [];
    var dataObjArr     = [];
    var fipPoolURL     = '/floating-ip-pool/';
    var fipProjRefsLen = 0, i = 0;

    if (error) {
        callback(error, null);
        return;
    }

    if (('floating_ips' in fipPool['floating-ip-pool']) &&
        fipPool['floating-ip-pool']['floating_ips'].length) {
        error = new appErrors.RESTServerError('Delete Floating IPs from ' +
                                              'the Floating IP Pool');
        callback(error, null);
        return;
    }

    if (('project_back_refs' in fipPool['floating-ip-pool']) &&
        (fipPool['floating-ip-pool']['project_back_refs'].length)) {
        fipProjRef = fipPool['floating-ip-pool']['project_back_refs'];
        fipProjRefsLen = fipProjRef.length;
    } else {
        fipPoolURL += fipPool['floating-ip-pool']['uuid'];
        configApiServer.apiDelete(fipPoolURL, appData, function (error) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, null);
            }
            return;
        });
        return;
    }

    for (i = 0; i < fipProjRefsLen; i++) {
        reqUrl = '/project/' + fipProjRef[i]['uuid']; 
        commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET,
                                 null, null, null, appData);
    }

    async.map(dataObjArr,
              commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
              function(error, results) {
                  deleteFipPoolUpdateProjects(error, results, 
                                              fipPool, virtualNetworkId,
                                              appData, callback);
              });

}

/**
 * @updateVNFipPoolDelete
 * public function
 * 1. URL api/config/virtual-network/:id/floatingip-pool/:fipid
 * 2. Gets floating-ip-pool object and checks if there are floating-ips
 *    requested by the project. 
 * 2. Removes floating-ip-pool references from projects and deletes
 *    the floating-ip-pool.
 * 3. Reads updated config and sends it back to client
 */
function updateVNFipPoolDelete (request, response, appData) 
{
    var fipPoolURL       = '/floating-ip-pool/';
    var virtualNetworkId = null;
    var fipPoolId        = null;
    var vnPostData       = request.body;
    var requestParams    = url.parse(request.url, true);

    if (!(virtualNetworkId = request.param('id').toString())) {
        error = new appErrors.RESTServerError('Add Virtual Network id');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (fipPoolId = request.param('fipid').toString()) {
        fipPoolURL += fipPoolId;
    } else {
        error = new appErrors.RESTServerError('Add Floating IP Pool id');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    var obj = [];
    obj[0] = {};
    obj[0]['virtualNetworkId'] = virtualNetworkId;
    obj[0]['fipPoolId'] = fipPoolId;
    obj[0]['appData'] = appData;
    async.map(obj, fipPoolDelete, function(err, results) {
        readVirtualNetwork(virtualNetworkId, appData, function(err, data) {
            commonUtils.handleJSONResponse(err, response, data);
        });
    });
}

function fipPoolDelete (obj, callback)
{
    var virtualNetworkId = obj['virtualNetworkId'];
    var fipPoolId = obj['fipPoolId'];
    var appData = obj['appData'];

    var fipPoolURL = '/floating-ip-pool/' + fipPoolId;

    configApiServer.apiGet(fipPoolURL, appData,
                           function(error, data) {
        updateVNFipPoolReadDel(error, data, virtualNetworkId, appData,
                               callback);
    });
}

/**
 * @updateFipPoolUpdateSendResponse
 * private function
 */ 
function updateFipPoolUpdateSendResponse (error, results,
                                          response, virtualNetworkId, appData)
{
    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }

    readVirtualNetwork(virtualNetworkId, appData, function(err, data) {
        commonUtils.handleJSONResponse(err, response, data);
    });

    return;
}

/**
 * @updateFipPoolUpdateProjects
 * private function
 * Deletes the FIP pool references from projects
 */
function updateFipPoolUpdateProjects (error, results,
                                      fipPool, virtualNetworkId, appData,
                                      callback)
{
    var projRef       = null;
    var fipProjRef    = {};
    var fipPoolRef    = [];
    var dataObjArr    = [];
    var projURL       = null;
    var projLen       = 0, i = 0, j = 0;
    var fipPoolRefLen = [];
    var fipPoolRefObj = {};

    if (error) {
       callback(error, null);
       return;
    }

    projLen = results.length;

    for (i = 0; i < projLen ; i++) {
        projUUID = results[i]['project']['uuid'];
        fipProjRef = fipPool['floating-ip-pool']['project_uuid'][projUUID];
        projURL = '/project/' + projUUID;
        if (!('floating_ip_pool_refs' in results[i]['project'])) {
            results[i]['project']['floating_ip_pool_refs'] = [];
        }

        fipPoolRef = results[i]['project']['floating_ip_pool_refs'];
        if (fipProjRef['oper'] == 'add') {
            fipPoolRefObj =
            {
                          to: fipPool['floating-ip-pool']['fq_name'],
                          attr: {},
                          uuid: fipPool['floating-ip-pool']['uuid']
            };
            fipPoolRef.push(fipPoolRefObj);
        } else {
            fipPoolRef = results[i]['project']['floating_ip_pool_refs'];
            fipPoolRefLen = fipPoolRef.length;
            for (j = 0; j < fipPoolRefLen; j++) {
                if (fipPool['floating-ip-pool']['uuid']
                               == fipPoolRef[j]['uuid']) {
                   fipPoolRef.splice(j, 1);
                   break; 
                }
            }
        }
        commonUtils.createReqObj(dataObjArr, projURL, global.HTTP_REQUEST_PUT,
                                 results[i], null, null, appData);
    }

    async.map(dataObjArr,
              commonUtils.getAPIServerResponse(configApiServer.apiPut, false),
              function(error, results) {
                  callback(error, results);
              });

    return;
}

/**
 * @updateVNFipPoolReadUpdate
 * private function
 */ 
function updateVNFipPoolReadUpdate (error, fipPool,
                                    vnPostData, virtualNetworkId,
                                    appData, callback) 
{
    var j               = 0;
    var reqUrl          = null;
    var fipProjObjArr   = [];
    var fipProjRef      = [];
    var fipProjRefsLen  = 0, i = 0;
    var fipProjUIRef    = [];
    var fipProjUIRefLen = 0;
    var curCfgAllDel    = false;


    if (error) {
       callback(error, null);
       return;
    }

    fipPool['floating-ip-pool']['project_uuid'] = {};

    if ((!('floating_ip_pools' in vnPostData['virtual-network'])) ||
        (!(vnPostData['virtual-network']['floating_ip_pools'].length)) ||
        (!('projects' in vnPostData['virtual-network']
         ['floating_ip_pools'][0])) ||
        (!(vnPostData['virtual-network']['floating_ip_pools'][0]
                   ['projects'][0]['uuid'].length))) {
        curCfgAllDel = true;
    }

    if ((!('project_back_refs' in fipPool['floating-ip-pool'])) &&
                curCfgAllDel) {
        callback(null, null);
        return;
    }

    j = 0;
    if ((!(['project_back_refs'] in fipPool['floating-ip-pool'])) &&
         !curCfgAllDel) {
        fipPool['floating-ip-pool']['project_back_refs'] = [];
        fipProjUIRef    =  vnPostData['virtual-network']
                                     ['floating_ip_pools'][0]['projects'];
        fipProjUIRefLen = fipProjUIRef.length;
        for (i = 0; i < fipProjUIRefLen ; i++) {
            uuid = fipProjUIRef[i]['uuid'];
            fipPool['floating-ip-pool'] ['project_uuid'][uuid] =
                {'to':fipProjUIRef[i]['to'],
                 'attr': null,
                 'uuid': fipProjUIRef[i]['uuid'],
                 'oper': 'add'
                };
            reqUrl = '/project/' + fipProjUIRef[i]['uuid'];
            commonUtils.createReqObj(fipProjObjArr, reqUrl,
                                     global.HTTP_REQUEST_GET, null, null, null,
                                     appData);

        }

        async.map(fipProjObjArr,
                  commonUtils.getAPIServerResponse(configApiServer.apiGet,
                                                   false),
                  function(error, results) {
                      updateFipPoolUpdateProjects(error, results,
                                                  fipPool, virtualNetworkId,
                                                  appData, callback);
                  });
        return;
    }

    if (['project_back_refs'] in fipPool['floating-ip-pool'] && 
        fipPool['floating-ip-pool']['project_back_refs'].length) {
        fipProjRef = fipPool['floating-ip-pool']['project_back_refs'];
        fipProjRefLen = fipProjRef.length;
        for (i = 0; i < fipProjRefLen ; i++) {
            uuid = fipProjRef[i]['uuid'];
            if (fipPool['floating-ip-pool']
                       ['project_uuid'][uuid] == null) {
                reqUrl = '/project/' + uuid;
                commonUtils.createReqObj(fipProjObjArr, reqUrl,
                                         global.HTTP_REQUEST_GET, null, null,
                                         null, appData);
            }
            fipPool['floating-ip-pool']['project_uuid'][uuid] =
                {'to':fipProjRef[i]['to'],
                 'attr': null,
                 'uuid': fipProjRef[i]['uuid'],
                 'oper': 'delete'
                };
        }
        if (curCfgAllDel) {
            async.map(fipProjObjArr,
                      commonUtils.getAPIServerResponse(configApiServer.apiGet,
                                                   false),
                    function(error, results) {
                        updateFipPoolUpdateProjects(error, results,
                                                    fipPool, virtualNetworkId,
                                                    appData, callback);
                    });
            return;
        }
    }

    fipProjUIRef = vnPostData['virtual-network']
                             ['floating_ip_pools'][0]['projects'];
    fipProjUIRefLen = fipProjUIRef.length;
    for (i = 0; i < fipProjUIRefLen ; i++) {
        uuid = fipProjUIRef[i]['uuid'];
        if (fipPool['floating-ip-pool']
                   ['project_uuid'][uuid] == null) {
            reqUrl = '/project/' + uuid;
            commonUtils.createReqObj(fipProjObjArr, reqUrl,
                                     global.HTTP_REQUEST_GET, null, null, null,
                                     appData);
        }
        fipPool['floating-ip-pool']['project_uuid'][uuid] = 
              {'to':fipProjUIRef[i]['to'],
               'attr': null,
               'uuid': fipProjUIRef[i]['uuid'],
               'oper': 'add'
              };
    }

    async.map(fipProjObjArr,
              commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
              function(error, results) {
                  updateFipPoolUpdateProjects(error, results,
                                              fipPool, virtualNetworkId,
                                              appData, callback);
              });

    return;
}

/**
 * @updateVNFipPoolUpdate
 * public function
 * 1. URL api/config/virtual-network/:id/floatingip-pool/:fipid
 * 2. Gets floating-ip-pool object figures the diff for association.
 * 3. Resets the floating-ip-pool references from / to projects.
 * 4. Reads updated config and sends it back to client
 */
function updateVNFipPoolUpdate (request, response, appData) 
{
    var fipPoolURL       = '/floating-ip-pool/';
    var virtualNetworkId = null;
    var fipPoolId        = null;
    var vnPostData       = request.body;
    var requestParams    = url.parse(request.url, true);

    if (virtualNetworkId = request.param('id').toString()) {
    } else {
        error = new appErrors.RESTServerError('Add Virtual Network id');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (fipPoolId = request.param('fipid').toString()) {
        fipPoolURL += fipPoolId;
    } else {
        error = new appErrors.RESTServerError('Add Floating IP Pool id');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    configApiServer.apiGet(fipPoolURL, appData,
                        function(error, data) {
                        updateVNFipPoolReadUpdate(error, data, vnPostData,
                                                  virtualNetworkId,
                                                  appData, function(err, data) {
                            if (err) {
                                commonUtils.handleJSONResponse(err, response,
                                                               appData);
                            } else {
                                readVirtualNetwork(virtualNetworkId, appData,
                                                   function(err, data) {
                                    commonUtils.handleJSONResponse(err, response, 
                                                                   data);
                                });
                            }
                        });
     });
}

/**
 * @updateVNNetPoliciesSendResponse
 * private function
 */ 
function updateVNNetPoliciesSendResponse(error, results,
                                         response, virtualNetworkId, appData) 
{
    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }

    readVirtualNetwork(virtualNetworkId, appData, function(err, data) {
        commonUtils.handleJSONResponse(err, response, data);
    });

    return;
}

/**
 * @updateVNNetPoliciesRead
 * private function
 */ 
function updateVNNetPoliciesRead (error, vnConfig,
                                  vnPostData, virtualNetworkId, response,
                                  appData) 
{
    var vnSeqConfig = {};

    var vnPostURL = '/virtual-network/' + virtualNetworkId;

    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }

    vnConfig['virtual-network']['network_policy_refs'] = [];
    if ('network_policy_refs' in vnPostData['virtual-network']) {
        vnConfig['virtual-network']['network_policy_refs'] = 
            vnPostData['virtual-network']['network_policy_refs'];
        vnSeqConfig = setVNPolicySequence(vnConfig);
    }

    configApiServer.apiPut(vnPostURL, vnSeqConfig, appData,
                         function(error, data) {
                         updateVNNetPoliciesSendResponse(error, data,
                                        response, virtualNetworkId, appData);
   });
 
}

/**
 * @updateVNNetPolicies
 * public function
 * 1. URL /api/tenants/config/virtual-network/:id/network-policys
 * 2. Gets VN config and updates Network policy references for it.
 * 3. Reads updated config and sends it back to client
 */
function updateVNNetPolicies (request, response, appData) 
{
    var vnGetURL         = '/virtual-network/';
    var virtualNetworkId = null;
    var vnPostData       = request.body;
    var requestParams    = url.parse(request.url, true);

    if (virtualNetworkId = request.param('id').toString()) {
        vnGetURL += virtualNetworkId;
    } else {
        error = new appErrors.RESTServerError('Add Virtual Network id');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    configApiServer.apiGet(vnGetURL, appData,
                        function(error, data) {
                        updateVNNetPoliciesRead(error, data, vnPostData,
                                                virtualNetworkId, response,
                                                appData)
                        });
}

/**
 * @listVMInterfacesAggCb
 * private function
 * 1. Aggregates vm interfaces across all VN's
 */
function listVMInterfacesAggCb (error, vnListData, response, appData) 
{
    var vnListLen = 0, i = 0;
    var vnRef     = [];
    var vmListRef = [];
    var dataObjArr = [];

    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }
    var vmList = [];

    vnListLen = vnListData.length;
    for (i = 0; i < vnListLen; i++) {
        vnRef = vnListData[i]['virtual-network'];
        if ('virtual_machine_interface_back_refs' in vnRef) {
            vmListRef = vnRef['virtual_machine_interface_back_refs'];
            vmList = vmList.concat(vmListRef);
        }
    }

    var vmIfRefLen = vmList.length;
    for(i=0; i<vmIfRefLen; i++) {
        var reqUrl = '/virtual-machine-interface/' + vmList[i]['uuid'];
        commonUtils.createReqObj(dataObjArr, reqUrl,
                global.HTTP_REQUEST_GET, null, null, null,
                appData);    	
    }
    async.map(dataObjArr,
    		commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
    		function(error, results) {
    		vmIfAggCb(error, results, response, vmList, appData);
    		});
}

function vmIfAggCb(error, vmIfList, response, vmList, appData) 
{
	var dataObjArr = [];
	if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
	}
	if(vmIfList.length <= 0) {
		commonUtils.handleJSONResponse(error, response,
			{'virtual_machine_interface_back_refs': vmList});		
        return;
	}

    for(var i=0; i<vmIfList.length; i++) {
    	if('instance_ip_back_refs' in vmIfList[i]["virtual-machine-interface"]) {
    		var inst_ip_ref = vmIfList[i]["virtual-machine-interface"]["instance_ip_back_refs"][0];
            if (inst_ip_ref) {
                var reqUrl = '/instance-ip/' + inst_ip_ref['uuid'];
        	
                commonUtils.createReqObj(dataObjArr, reqUrl,
                                         global.HTTP_REQUEST_GET, 
                                         null, null, null, appData);
            }
    	}
    }
    async.map(dataObjArr,
    		commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
    		function(error, results) {
    		instanceIPRefAggCb(error, results, response, vmList, appData);
    		});
}

function instanceIPRefAggCb(error, instanceIPList, response, vmList, appData) 
{
	if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
	}
	if(instanceIPList.length <= 0) {
		commonUtils.handleJSONResponse(error, response,
			{"virtual_machine_interface_back_refs" : vmList});
        return;
	}
	for(var i=0; i<instanceIPList.length; i++) {
		vmList[i]["instance_ip_address"] = instanceIPList[i]["instance-ip"]["instance_ip_address"]; 
	}
	commonUtils.handleJSONResponse(error, response,
		{'virtual_machine_interface_back_refs': vmList});
}

/**
 * @listVMInterfacesVNRead
 * private function
 * 1. Callback for listVirtualMachineInterfaces
 * 2. Does a VN Get of all VN's for a tenant / project
 */
function listVMInterfacesVNRead (error, vnListData, response, appData) 
{
    var vnListLen = 0, i = 0;
    var vnRef     = [];
    var dataObjArr = [];
    var reqUrl     = null;

    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }

    vnRef     = vnListData['virtual-networks'];
    vnListLen = vnRef.length;
    for (i = 0; i < vnListLen; i++) {
       reqUrl = '/virtual-network/' + vnRef[i]['uuid'];
       commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET,
                                null, null, null, appData);
    }
        
    async.map(dataObjArr,
              commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
              function(error, results) {
                  listVMInterfacesAggCb(error, results, response, appData);
              });
}

/**
 * @listVirtualMachineInterfaces
 * public function
 * 1. URL /api/tenants/config/virtual-machine-interfaces/:id
 * 2. Gets list of virtual networks from config api server
 * 3. Needs tenant id
 * 4. Fetches each VN and extracts VM interfaces and sends it to client.
 */
function listVirtualMachineInterfaces (request, response, appData) 
{
    var tenantId      = null;
    var requestParams = url.parse(request.url,true);
    var vnListURL     = '/virtual-networks';

    if (requestParams.query && requestParams.query.tenant_id) {
        tenantId   = requestParams.query.tenant_id;
        vnListURL += '?parent_type=project&parent_fq_name_str=' + tenantId.toString();
    }

    configApiServer.apiGet(vnListURL, appData,
                         function(error, data) {
                         listVMInterfacesVNRead(error, data, response, appData);
                         });
}

/**
 * @updateVNRouteTargetUpdate
 * private function
 */ 
function updateVNRouteTargetUpdate (error, vnConfig, vnPostData,
                                    virtualNetworkId, response, appData) 
{
    var vnPostURL = '/virtual-network/' + virtualNetworkId;

    if (error) {
       commonUtils.handleJSONResponse(error, response, null);
       return;
    }

    vnConfig['virtual-network']['route_target_list'] = [];
    if ('route_target_list' in vnPostData['virtual-network']) {
        vnConfig['virtual-network']['route_target_list'] = 
            vnPostData['virtual-network']['route_target_list'];
    }

    configApiServer.apiPut(vnPostURL, vnConfig, appData,
    function(error, data) {
        if (error) {
        } else {
            readVirtualNetwork(virtualNetworkId, appData, function(err, data) {
                commonUtils.handleJSONResponse(err, response, data);
            });
        }
        return;
   });
}

/**
 * @updateVNRouteTargets
 * public function
 * 1. URL /api/tenants/config/virtual-network/:id/route-targets
 * 2. Gets VN config and updates the route-target list.
 * 3. Reads updated config and sends it back to client
 */
function updateVNRouteTargets (request, response, appData) 
{
    var vnGetURL         = '/virtual-network/';
    var virtualNetworkId = null;
    var vnPostData       = request.body;
    var requestParams    = url.parse(request.url, true);

    if (virtualNetworkId = request.param('id').toString()) {
        vnGetURL += virtualNetworkId;
    } else {
        error = new appErrors.RESTServerError('Add Virtual Network id');
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    configApiServer.apiGet(vnGetURL, appData,
                        function(error, data) {
                        updateVNRouteTargetUpdate(error, data, vnPostData,
                                                  virtualNetworkId, response,
                                                  appData);
                        });
}

exports.listVirtualNetworks          = listVirtualNetworks;
exports.getVirtualNetwork            = getVirtualNetwork;
exports.readVirtualNetworks          = readVirtualNetworks;
exports.readVirtualNetworkAsync      = readVirtualNetworkAsync;
exports.createVirtualNetwork         = createVirtualNetwork;
exports.updateVirtualNetwork         = updateVirtualNetwork;
exports.deleteVirtualNetwork         = deleteVirtualNetwork;
exports.updateVNSubnetDelete         = updateVNSubnetDelete;
exports.updateVNFipPoolAdd           = updateVNFipPoolAdd;
exports.updateVNFipPoolDelete        = updateVNFipPoolDelete;
exports.updateVNFipPoolUpdate        = updateVNFipPoolUpdate;
exports.updateVNNetPolicies          = updateVNNetPolicies;
exports.listVirtualMachineInterfaces = listVirtualMachineInterfaces;
exports.updateVNRouteTargets         = updateVNRouteTargets;

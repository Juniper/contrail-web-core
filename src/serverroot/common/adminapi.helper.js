/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

/**
 * adminapi.hepler.js
 *     Contains Admin API helper functions used by Main Server and Job Server
 */

var rest = require('./rest.api'),
    config = require('../../../config/config.global.js'),
    logutils = require('../utils/log.utils'),
    commonUtils = require('../utils/common.utils'),
    messages = require('../common/messages'),
    global = require('../common/global'),
    appErrors = require('../errors/app.errors'),
    util = require('util'),
    async = require('async'),
    jsonPath = require('JSONPath').eval,
    configApiServer = require('./configServer.api');

adminApiHelper = module.exports;

function parseBGPRoutingInstanceResponse (bgpRoutInstRes)
{
    var results = [];

    try {
        var bgpRoutInst = 
            bgpRoutInstRes['ShowRoutingInstanceResp']['instances'][0]['list'][0]['ShowRoutingInstance'];
        var count = bgpRoutInst.length;
    } catch(e) {
        return results;
    }
    for (var i = 0; i < count; i++) {
        results[i] = {};
        results[i]['export_target'] = [];
        try {
	        var expTgt = bgpRoutInst[i]['export_target'][0]['list'];
	        var expTgtLen = expTgt.length;
	        for (var j = 0; j < expTgtLen; j++) {
	            results[i]['export_target'][j] = {};
	            try {
	                results[i]['export_target'][j] = 
	                    commonUtils.getSafeDataToJSONify(expTgt[j]['element'][0]);
	            } catch(e) {
	                results[i]['export_target'][j] = global.RESP_DATA_NOT_AVAILABLE;
	            }
	        }
	    } catch(e) {
	    }  
        try {
            var importTgt = bgpRoutInst[i]['import_target'][0]['list'];
            var importTgtLen = importTgt.length;
	        results[i]['import_target'] = [];
	        for (j = 0; j < importTgtLen; j++) {
	            results[i]['import_target'][j] = {};
	            try {
	                results[i]['import_target'][j] = 
	                   commonUtils.getSafeDataToJSONify(importTgt[j]['element'][0]);
	            } catch(e) {
	                results[i]['import_target'][j] = global.RESP_DATA_NOT_AVAILABLE;
	            }
	        }
	    } catch(e) {
	       results[i]['import_target'] = [];
	    }
	    try {
            results[i]['name'] = 
                commonUtils.getSafeDataToJSONify(bgpRoutInst[i]['name'][0]['_']);
        } catch(e) {
            results[i]['name'] = global.RESP_DATA_NOT_AVAILABLE;
        }
        try {
            results[i]['virtual_network'] = 
                commonUtils.getSafeDataToJSONify(bgpRoutInst[i]['virtual_network'][0]['_']);
        } catch(e) {
            results[i]['virtual_network'] = global.RESP_DATA_NOT_AVAILABLE;
        }
        try {
	        var routTabl = bgpRoutInst[i]['tables'][0]['list'];
	        var routTablLen = routTabl.length;
	        results[i]['tables'] = [];
	        for (j = 0; j < routTablLen; j++) {
	            results[i]['tables'][j] = {};
	            var shRoutInst = routTabl[j]['ShowRoutingInstanceTable'][0];
	            results[i]['tables'][j]['active_paths'] = 
	               commonUtils.getSafeDataToJSONify(shRoutInst['active_paths'][0]['_']);
	            try {
	                results[i]['tables'][j]['name'] = 
	                   commonUtils.getSafeDataToJSONify(shRoutInst['name'][0]['_']);
	            } catch(e) {
	                results[i]['tables'][j]['name'] = global.RESP_DATA_NOT_AVAILABLE;
	            }
	            var peerList = shRoutInst['peers'][0]['list'];
	            var peerListLen = peerList.length;
	            results[i]['tables'][j]['peers'] = [];
	            for (var k = 0; k < peerListLen; k++) {
	                results[i]['tables'][j]['peers'][k] = {};
	                try {
	                    results[i]['tables'][j]['peers'][k]['element'] = 
	                       commonUtils.getSafeDataToJSONify(peerList[k]['element'][0]);
	                } catch(e) {
	                    results[i]['tables'][j]['peers'][k]['element'] = global.RESP_DATA_NOT_AVAILABLE;
	                }
	            }
	            try {
	                results[i]['tables'][j]['total_paths'] =  
	                   commonUtils.getSafeDataToJSONify(shRoutInst['total_paths'][0]['_']);
	            } catch(e) {
	                results[i]['tables'][j]['total_paths'] = global.RESP_DATA_NOT_AVAILABLE;
	            }
	        }
	    } catch(e) {
	        results[i]['tables'] = [];
	    }
    }
    return results;
}

function processControlNodeRoutingInstanceList (resultJSON, resultArr)
{
    var len = 0, idx = 0;
    resultJSON['routeInstances'] = [];
    var controlNodeRoutes = [];
    var routes, routesLen, paths, pathsLen;
    var peerSrcCount = 0;
    var srcObj = {};

    var routInst = parseBGPRoutingInstanceResponse(resultArr[0]);
    if (routInst && routInst.length) {
        len = routInst.length;
        for (i = 0; i < len; i++) {
            resultJSON['routeInstances'][i] = routInst[i]['name'];
        }
    }
}

function processvRouterList (resultJSON, resultArr)
{
    var ip;
    var len = resultArr.length;
    for (var i = 0; i < len; i++) {
        resultJSON[i] = {};
        try {
            resultJSON[i]['name'] = 
                commonUtils.getSafeDataToJSONify(resultArr[i]['virtual-router']['name']);
        } catch(e) {
            resultJSON[i]['name'] = global.RESP_DATA_NOT_AVAILABLE;
        } 
        try {
            ip = resultArr[i]['virtual-router']['virtual_router_ip_address'];
            resultJSON[i]['ip'] = ip.split('/')[0];
        } catch(e) {
            resultJSON[i]['ip'] = global.RESP_DATA_NOT_AVAILABLE;
        }
        try {
            resultJSON[i]['uuid'] = 
                commonUtils.getSafeDataToJSONify(resultArr[i]['virtual-router']['uuid']);
        } catch(e) {
            resultJSON[i]['uuid'] = global.RESP_DATA_NOT_AVAILABLE;
        }
    }
}

/**
 * @param {Object} JSON containing BGP Router references
 * @return {Array} Names of BGP Router references
 */
function getBGPRefNames (routerRefs)
{
    var peers = [],
        i, peerList;
    if (routerRefs) {
        for (i = 0; i < routerRefs.length; i += 1) {
            peerList = routerRefs[i].to;
            if (peerList.length > 0) {
                peers[i] = peerList[peerList.length - 1];
            } else {
                peers[i] = '';
            }
        }
    }
    return peers;
}

/**
 * Populate JSON containing all Virtual Routers.
 * @param {Object} JSON to contain an array of Virtual routers
 * @param {Array} Array of JSONs of Virtual Routers
 */
function processVRJSON (vRouterJSON, vrJSONArray)
{
    var i, vrJSON = {}, ip;
    var vmRefs = [];
    for (i = 0; i < vrJSONArray.length; i += 1) {
        vrJSON = vrJSONArray[i];
        if (vrJSON != null) {
            vRouterJSON["virtual-routers"][i]["type"] = "virtual-router";
            try {
                vRouterJSON["virtual-routers"][i]["name"] = 
                    commonUtils.getSafeDataToJSONify(vrJSON["virtual-router"]["name"]);
            } catch(e) {
                vRouterJSON["virtual-routers"][i]["name"] = global.RESP_DATA_NOT_AVAILABLE;
            } 
            try {           
                vRouterJSON["virtual-routers"][i]["bgp_refs"] = 
                    getBGPRefNames(vrJSON["virtual-router"]["bgp_router_refs"]);
            } catch(e) {
                vRouterJSON["virtual-routers"][i]["bgp_refs"] = [];
            }
            try {
                ip = vrJSON['virtual-router']['virtual_router_ip_address'];
                vRouterJSON["virtual-routers"][i]["ip_address"] = ip.split('/')[0];
            } catch(e) {
                vRouterJSON["virtual-routers"][i]["ip_address"] = global.RESP_DATA_NOT_AVAILABLE;
            }
            /* Set vm_count 0 now, we will get actual through Sandesh */
            vRouterJSON["virtual-routers"][i]["vm_count"] = 0;
        }
    }
}

function getvRouterVNCount (vRouterJSON, ipIndexMap, results)
{
    var vnData = [];
    var vnCount = 0;
    var skipCount = 0;
    var vnEntryLen = 0;
    var vnEntry;
    
    for (var i = 0; i < results.length; i++) {
        vnCount = 0;
        skipCount = 0;
        var index = ipIndexMap[i];
        try {
            vnData = jsonPath(results[i], "$..VnSandeshData");
            vnEntryLen = vnData.length;
            for (var j = 0; j < vnEntryLen; j++) {
                vnCount += vnData[j].length;
            }
            vRouterJSON['virtual-routers'][index]['vn_count'] = vnCount;
        } catch(e) {
            vRouterJSON['virtual-routers'][index]['vn_count'] = 0;
        }
    }
}

function getvRouterItfCount (vRouterJSON, ipIndexMap, results)
{
    var itfData = [];
    var itfCount = 0;
    var ifDataCount = 0;
    var ifEntryCount = 0;
    for (var i = 0; i < results.length; i++) {
        itfCount = 0;
        var index = ipIndexMap[i];
        try {
            itfData = jsonPath(results[i], "$..ItfSandeshData");
            ifDataCount = itfData.length;
            for (var j = 0; j < ifDataCount; j++) {
                ifEntryCount = itfData[j].length;
                for (var k = 0; k < ifEntryCount; k++) {
                    if (itfData[j][k]['type'][0]['_'] != 'vport') {
                        continue;
                    }
                    itfCount = parseInt(itfCount) + 1;
                }
            }
            vRouterJSON['virtual-routers'][index]['itf_count'] = itfCount;
        } catch(e) {
            vRouterJSON['virtual-routers'][index]['itf_count'] = 0;
        }
    }
}

function getvRouterVMCount (vRouterJSON, ipIndexMap, results)
{
    var vmData = [];
    var vmCount = 0;
    try {
        var len = results.length;
    } catch(e) {
        logutils.logger.debug("In getvRouterVMCount(), JSON parse error:", e);
        return;
    }
    for (var i = 0; i < len; i++) {
        vmCount = 0;
        var index = ipIndexMap[i];
        try {
            vmData = jsonPath(results[i], "$..VmSandeshData");
            vmDataCnt = vmData.length;
            for (var j = 0; j < vmDataCnt; j++) {
                vmCount += vmData[j].length;
            }
            vRouterJSON['virtual-routers'][index]['vm_count'] = vmCount;
        } catch(e) {
            logutils.logger.debug("In getvRouterVMCount(), JSON parse error:", e);
            vRouterJSON['virtual-routers'][index]['vm_count'] = 0;
        }
    }
}

function updatevRoutersCpuMemoryDataAndSendResp (res, vRouterJSON, cpuMemData)
{
    try {
	    var cnt = vRouterJSON.length;
	    for (var i = 0; i < cnt; i++) {
            vRouterJSON[i]['cpuLoadInfo'] = cpuMemData[i]['cpuLoadInfo'];
            vRouterJSON[i]['sysMemInfo'] = cpuMemData[i]['sysMemInfo'];
            try {
                /* As the data is not available, asumption is when we are
                 * getting Memory info, then it is Up 
                 */
	            if (null != vRouterJSON[i]['sysMemInfo']['total']) {
	               vRouterJSON[i]['status'] = 'Up';   
	            }
            } catch(e) {
                vRouterJSON[i]['status'] = global.STR_HOST_NOT_REACHABLE;
            }
        }
    } catch(e) {
        console.log("In updatevRoutersCpuMemoryData(): JSON Parse error:" + e);
    }
    commonUtils.handleJSONResponse(null, res, vRouterJSON);
}

function getvRoutersCpuMemoryStats (vRouterJSON, ipList, res)
{
    var resultJSON = [];
    async.map(ipList, getComputeNodeCpuMemJSON, function(err, cpuMemData) {
        updatevRoutersCpuMemoryDataAndSendResp(res, vRouterJSON, cpuMemData);
    });
}

function getvRouterVnItfList (res, vnUrlLists, itfUrlLists, vmUrlLists,
                              ipIndexMap, vRouterJSON, ipList)
{
    async.map(vnUrlLists, 
              commonUtils.getDataFromSandeshByIPUrl(rest.getAPIServer, false), 
              function(err, results) {
         getvRouterVNCount(vRouterJSON, ipIndexMap, results);
         async.map(itfUrlLists, 
                   commonUtils.getDataFromSandeshByIPUrl(rest.getAPIServer, false),
                   function(err, results) {
            getvRouterItfCount(vRouterJSON, ipIndexMap, results);
                async.map(vmUrlLists,
                          commonUtils.getDataFromSandeshByIPUrl(rest.getAPIServer, false),
                          function(err, results) {
                    getvRouterVMCount(vRouterJSON, ipIndexMap, results);
                    getvRoutersCpuMemoryStats(vRouterJSON['virtual-routers'], ipList, res);
            });
        });
    });         
}

function processAndSendVRSummaryResponse (vRouterJSON, res)
{
    /* Now for all the vRouters IP, query sandesh to get the count 
       of interfaces and VN 
     */
    var vnUrlLists = [];
    var ipIndexMap = [];
    var itfUrlLists = [];
    var vmUrlLists = [];
    var j = 0;
    var ip = null;
    var ipList = [];
    var vRouterCount = vRouterJSON['virtual-routers'].length;
    for (var i = 0; i < vRouterCount; i++) {
        vRouter = vRouterJSON['virtual-routers'][i];
        vRouterJSON['virtual-routers'][i]['itf_count'] = 0;
        vRouterJSON['virtual-routers'][i]['vn_count'] = 0;
        ip = vRouter['ip_address'];
        if (global.RESP_DATA_NOT_AVAILABLE == ip) {
            /* Set ip as name */
            ip = vRouter['name'];
            /* Why IP is not set? */
        }
        vnUrlLists[j] = ip + '@' + global.SANDESH_COMPUTE_NODE_PORT + '@' +
            '/Snh_VnListReq?name=';
        itfUrlLists[j] = ip + '@' + global.SANDESH_COMPUTE_NODE_PORT + '@' +
            '/Snh_ItfReq?name=';
        vmUrlLists[j] = ip + '@' + global.SANDESH_COMPUTE_NODE_PORT + '@' + 
            '/Snh_VmListReq?uuid=';
        ipIndexMap[j] = i;
        ipList[i] = ip;
        j++;
        /* We do not have below info */
        vRouterJSON['virtual-routers'][i]['status'] = global.RESP_DATA_NOT_AVAILABLE;
        vRouterJSON['virtual-routers'][i]['trafficIn'] = global.RESP_DATA_NOT_AVAILABLE;
        vRouterJSON['virtual-routers'][i]['trafficOut'] = global.RESP_DATA_NOT_AVAILABLE;
    }
    if (!j) {
        commonUtils.handleJSONResponse(null, res, vRouterJSON['virtual-routers']);
        return;
    }
    getvRouterVnItfList(res, vnUrlLists, itfUrlLists, vmUrlLists, ipIndexMap,
                        vRouterJSON, ipList);
}

function sendvRouterResponse (res, type, resultJSON, resultArr, dataObj,
                              callback)
{
    if (type === global.GET_VIRTUAL_ROUTERS) {
        processVRJSON(resultJSON, resultArr);
        processAndSendVRSummaryResponse(resultJSON, res);
    } else if (type == global.GET_VROUTERS_LIST) {
        resultJSON = [];
        processvRouterList(resultJSON, resultArr);
        callback(global.HTTP_STATUS_RESP_OK, JSON.stringify(resultJSON),
                 JSON.stringify(resultJSON), 1, 0);
    }
}

function sendvRouterErrorResponse (res, err, type, dataObj, callback)
{
    if (type === global.GET_VIRTUAL_ROUTERS) {
        commonUtils.handleJSONResponse(err, res, null);
    } else if (type == global.GET_VROUTERS_LIST) {
        callback(global.HTTP_STATUS_INTERNAL_ERROR,
                 global.STR_CACHE_RETRIEVE_ERROR,
                 global.STR_CACHE_RETRIEVE_ERROR, 0, 0);
    }
}

function processVirtualRouters (req, res, type, dataObj, appData, callback)
{
    var url = '/virtual-routers';
    var resultJSON = [];

    configApiServer.apiGet(url, appData, function (error, jsonData) {
        if (error) {
            sendvRouterErrorResponse(res, error, type, dataObj, callback);
        } else {
            try {
                var vrJSON = jsonData,
                    vrURLs = [],
                    vrCount = vrJSON["virtual-routers"].length,
                    i, uuid, url
                    dataObjArr = [];
                if (vrCount != 0) {
                    for (i = 0; i < vrCount; i += 1) {
                        uuid = vrJSON["virtual-routers"][i].uuid;
                        url = '/virtual-router/' + uuid;
                        logutils.logger.debug("getVirtualRouters: " + url);
                        vrURLs[i] = [url];
                        commonUtils.createReqObj(dataObjArr, [url],
                                                 global.HTTP_REQUEST_GET, null,
                                                 null, null, appData);
                        delete vrJSON["virtual-routers"][i]["fq_name"];
                    }
                    async.map(dataObjArr,
                              commonUtils.getAPIServerResponse(configApiServer.apiGet,
                                                               true),
                              function (err, results) {
                        if (!err) {
                            sendvRouterResponse(res, type, vrJSON, results,
                                                dataObj, callback);
                        } else {
                            sendvRouterErrorResponse(res, error, type, dataObj,
                                                     callback);
                        }
                    });
                } else {
                    sendvRouterResponse(res, type, vrJSON, vrJSON, dataObj,
                                        callback);
                }
            } catch (e) {
                sendvRouterErrorResponse(res, e, type, dataObj, callback);
            }
        }
    });
};

function parseControlNodeCPUMemInfo (sandeshResp)
{
    var resultJSON = {};
    resultJSON['cpuLoadInfo'] = {};
    resultJSON['cpuLoadInfo']['cpuLoad'] = {};
    resultJSON['cpuLoadInfo']['memInfo'] = {};
    resultJSON['sysMemInfo'] = {};
    try {
        cpuLoadInfoResp = sandeshResp['CpuLoadInfoResp'];
        var cpuLoadInfo = cpuLoadInfoResp['cpu_info'][0]['CpuLoadInfo'][0];
        var cpuLoad = cpuLoadInfo['cpuload'][0]['CpuLoadAvg'][0];
        try {
            commonUtils.createJSONBySandeshResponse(resultJSON['cpuLoadInfo']['cpuLoad'],
                                                    cpuLoad);
        } catch(e) {
        }
        try {
            resultJSON['cpuLoadInfo']['cpuShare'] =
                commonUtils.getSafeDataToJSONify(cpuLoadInfo['cpu_share'][0]['_']);
        } catch(e) {
            resultJSON['cpuLoadInfo']['cpuShare'] = global.RESP_DATA_NOT_AVAILABLE;
        }
    } catch(e) {
        console.log("In parseControlNodeCPUInfo(): CPU JSON Parse error: " + e);
    }
    try {
        resultJSON['cpuLoadInfo']['numCpu'] = 
            commonUtils.getSafeDataToJSONify(cpuLoadInfoResp['cpu_info'][0]['CpuLoadInfo'][0]['num_cpu'][0]['_']);
    } catch(e) {
        resultJSON['cpuLoadInfo']['numCpu'] = global.RESP_DATA_NOT_AVAILABLE;
    }
    try {
        var memInfo = 
            sandeshResp['CpuLoadInfoResp']['cpu_info'][0]['CpuLoadInfo'][0]['meminfo'][0]['MemInfo'][0];
        try {
            commonUtils.createJSONBySandeshResponse(resultJSON['cpuLoadInfo']['memInfo'],
                                                    memInfo);
        } catch(e) {
        }
    } catch(e) {
        console.log("In parseControlNodeCPUInfo(): Mem JSON Parse error:" + e);
    }
    try {
        var sysMemInfo =
            sandeshResp['CpuLoadInfoResp']['cpu_info'][0]['CpuLoadInfo'][0]['sys_mem_info'][0]['SysMemInfo'][0];
        try {
            commonUtils.createJSONBySandeshResponse(resultJSON['sysMemInfo'],
                                                    sysMemInfo);
        } catch(e) {
        }
    } catch(e) {
        console.log("In parseControlNodeCPUInfo(): SysMem JSON Parse error:" +
                    e);
    }
    return resultJSON;
}

function processSandeshCollectorInfo (sandeshResponse)
{
    var resultJSON = {};
    try {
        var collectorInfo = sandeshResponse['CollectorInfoResponse'];
    } catch(e) {
        return;
    }
    try {
        resultJSON = {};
        resultJSON['ip'] = 
            commonUtils.getSafeDataToJSONify(collectorInfo['ip'][0]['_']);
    } catch(e) {
        resultJSON['ip'] = global.RESP_DATA_NOT_AVAILABLE;
    }        
    try {
        resultJSON['port'] = 
            commonUtils.getSafeDataToJSONify(collectorInfo['port'][0]['_']);
    } catch(e) {
        resultJSON['port'] = global.RESP_DATA_NOT_AVAILABLE;
    }        
    try {
        resultJSON['status'] = 
            commonUtils.getSafeDataToJSONify(collectorInfo['status'][0]['_']);
    } catch(e) {
        resultJSON['status'] = global.RESP_DATA_NOT_AVAILABLE;
    }
    return resultJSON;
}

function getAclSgUUID (flowData)
{
    var uuidObj = {};
    uuidObj['acl_uuid'] = global.RESP_DATA_NOT_AVAILABLE;
    uuidObj['sg_uuid'] = global.RESP_DATA_NOT_AVAILABLE;

    var aclAction = jsonPath(flowData, "$..AclAction");
    console.log("Getting aclAction as:", aclAction);
    if (aclAction.length > 0) {
        try {
            aclAction = aclAction[0];
            var cnt = aclAction.length;
        } catch(e) {
            return uuidObj;
        }
        for (var i = 0; i < cnt; i++) {
            try {
                if (aclAction[i]['sg'][0]['_'] == "true") {
                    uuidObj['sg_uuid'] = aclAction[i]['acl_id'][0]['_'];
                } else {
                    uuidObj['acl_uuid'] = aclAction[i]['acl_id'][0]['_'];
                }
            } catch(e) {
            }
        }
    }
    return uuidObj;
}

function processAclFlowsSandeshData (uuidLists, aclFlowResponse)
{
    var resultJSON = [];  
    var flowData = []; 
    var flowDataLen = 0; 
    var flowAction = [];   
    var flowActionLen = 0;                                 
    var aclFlowCount = aclFlowResponse.length;
    for (var i = 0; i < aclFlowCount; i++) {
        resultJSON[i] = {};
        resultJSON[i]['acl_uuid'] = uuidLists[i];

        try {
            resultJSON[i]['flow_count'] = 
                commonUtils.getSafeDataToJSONify(aclFlowResponse[i]['AclFlowResp']['flow_count'][0]['_']);
        } catch(e) {
            resultJSON[i]['flow_count'] = global.RESP_DATA_NOT_AVAILABLE;
        }
        try {
            resultJSON[i]['iteration_key'] =
                commonUtils.getSafeDataToJSONify(aclFlowResponse[i]['AclFlowResp']['iteration_key'][0]['_']);
        } catch(e) {
            resultJSON[i]['iteration_key'] = global.RESP_DATA_NOT_AVAILABLE;
        }
        try {
            resultJSON[i]['flow_miss'] = 
                commonUtils.getSafeDataToJSONify(aclFlowResponse[i]['AclFlowResp']['flow_miss'][0]['_']);
        } catch(e) {
            resultJSON[i]['flow_miss'] = global.RESP_DATA_NOT_AVAILABLE;
        }
        try {
            flowData = 
                aclFlowResponse[i]['AclFlowResp']['flow_entries'][0]['list'][0]['FlowSandeshData'];
            flowDataLen = flowData.length;
            resultJSON[i]['flowData'] = [];
            for (var j = 0; j < flowDataLen; j++) {
                resultJSON[i]['flowData'][j] = {};
                resultJSON[i]['flowData'][j] = getAclSgUUID(flowData[j]);
                try {
                    resultJSON[i]['flowData'][j]['bytes'] = 
                        commonUtils.getSafeDataToJSONify(flowData[j]['bytes'][0]['_']);
                } catch(e) {
                    resultJSON[i]['flowData'][j]['bytes'] = global.RESP_DATA_NOT_AVAILABLE;
                }
                try {
                    resultJSON[i]['flowData'][j]['packets'] = 
                        commonUtils.getSafeDataToJSONify(flowData[j]['packets'][0]['_']);
                } catch(e) {
                    resultJSON[i]['flowData'][j]['packets'] = global.RESP_DATA_NOT_AVAILABLE;
                }
                try {
                    resultJSON[i]['flowData'][j]['protocol'] = 
                        commonUtils.getSafeDataToJSONify(flowData[j]['protocol'][0]['_']);
                } catch(e) {
                    resultJSON[i]['flowData'][j]['protocol'] = global.RESP_DATA_NOT_AVAILABLE;
                }
                try {
                    resultJSON[i]['flowData'][j]['src_ip'] = 
                        commonUtils.getSafeDataToJSONify(flowData[j]['src'][0]['_']);
                } catch(e) {
                    resultJSON[i]['flowData'][j]['src_ip'] = global.RESP_DATA_NOT_AVAILABLE;
                }
                try {
                    resultJSON[i]['flowData'][j]['dst_ip'] = 
                        commonUtils.getSafeDataToJSONify(flowData[j]['dst'][0]['_']);
                } catch(e) {
                    resultJSON[i]['flowData'][j]['dst_ip'] = global.RESP_DATA_NOT_AVAILABLE;
                }
                try {
                    resultJSON[i]['flowData'][j]['src_port'] = 
                        commonUtils.getSafeDataToJSONify(flowData[j]['src_port'][0]['_']);
                } catch(e) {
                    resultJSON[i]['flowData'][j]['src_port'] = global.RESP_DATA_NOT_AVAILABLE;
                }
                try {
                    resultJSON[i]['flowData'][j]['dst_port'] = 
                        commonUtils.getSafeDataToJSONify(flowData[j]['dst_port'][0]['_']);
                } catch(e) {
                    resultJSON[i]['flowData'][j]['dst_port'] = global.RESP_DATA_NOT_AVAILABLE;
                }
                try {
                    resultJSON[i]['flowData'][j]['source_vn'] = 
                        commonUtils.getSafeDataToJSONify(flowData[j]['source_vn'][0]['_']);
                } catch(e) {
                    resultJSON[i]['flowData'][j]['source_vn'] = global.RESP_DATA_NOT_AVAILABLE;
                }
                try {
                    resultJSON[i]['flowData'][j]['dest_vn'] = 
                        commonUtils.getSafeDataToJSONify(flowData[j]['dest_vn'][0]['_']);
                } catch(e) {
                    resultJSON[i]['flowData'][j]['dest_vn'] = global.RESP_DATA_NOT_AVAILABLE;
                }
                try {
                    resultJSON[i]['flowData'][j]['setup_time'] = 
                        commonUtils.getSafeDataToJSONify(flowData[j]['setup_time'][0]['_']);
                } catch(e) {
                    resultJSON[i]['flowData'][j]['setup_time'] = global.RESP_DATA_NOT_AVAILABLE;
                }
                try {
                    resultJSON[i]['flowData'][j]['teardown_time'] = 
                        commonUtils.getSafeDataToJSONify(flowData[j]['teardown_time'][0]['_']);
                } catch(e) {
                    resultJSON[i]['flowData'][j]['teardown_time'] = global.RESP_DATA_NOT_AVAILABLE;
                }
                try {
                    resultJSON[i]['flowData'][j]['vrf'] = 
                        commonUtils.getSafeDataToJSONify(flowData[j]['vrf'][0]['_']);
                } catch(e) {
                    resultJSON[i]['flowData'][j]['vrf'] = global.RESP_DATA_NOT_AVAILABLE;
                }
                try {
                    resultJSON[i]['flowData'][j]['reverse_flow'] = 
                        commonUtils.getSafeDataToJSONify(flowData[j]['reverse_flow'][0]['_']);
                } catch(e) {
                    resultJSON[i]['flowData'][j]['reverse_flow'] = global.RESP_DATA_NOT_AVAILABLE;
                }
                try {
                    resultJSON[i]['flowData'][j]['flow_handle'] = 
                        commonUtils.getSafeDataToJSONify(flowData[j]['flow_handle'][0]['_']);
                } catch(e) {
                    resultJSON[i]['flowData'][j]['flow_handle'] = global.RESP_DATA_NOT_AVAILABLE;
                }
                try {
                    resultJSON[i]['flowData'][j]['flow_uuid'] = 
                        commonUtils.getSafeDataToJSONify(flowData[j]['flow_uuid'][0]['_']);
                } catch(e) {
                    resultJSON[i]['flowData'][j]['flow_uuid'] = global.RESP_DATA_NOT_AVAILABLE;
                }
                try {
                    resultJSON[i]['flowData'][j]['nat'] = 
                        commonUtils.getSafeDataToJSONify(flowData[j]['nat'][0]['_']);
                } catch(e) {
                    resultJSON[i]['flowData'][j]['nat'] = global.RESP_DATA_NOT_AVAILABLE;
                }
                try {
                    flowAction = flowData[j]['action_l'][0]['list'][0]['ActionStr'];
                    flowActionLen = flowAction.length;
                    resultJSON[i]['flowData'][j]['flow_action'] = [];
                    for (var k = 0; k < flowActionLen; k++) {
                        resultJSON[i]['flowData'][j]['flow_action'][k] = {};
                        resultJSON[i]['flowData'][j]['flow_action'][k] = 
                            commonUtils.getSafeDataToJSONify(flowAction[k]['action'][0]['_']);
                    }   
                } catch(e) {
                    resultJSON[i]['flowData'][j]['flow_action'] = [];
                }
            }
        } catch(e) {
            resultJSON[i]['flowData'] = [];
        }
    } 
    return resultJSON;  
}

function parseControlNodeRoutesByPeerSource (resultJSON, peerSource, addrFamily,
                                             protocol)
{
    var srcMatched;
    var protoMatched;
    if (((null == peerSource) && (null == addrFamily) && (null == protocol)) ||
        (null == resultJSON) || (!resultJSON.length)) {
        /* No Filter */
        return resultJSON;
    }

    var resultJSONLen = resultJSON.length;
    for (var i = 0; i < resultJSONLen; i++) {
        if (addrFamily) {
            try {
                pos = resultJSON[i]['routing_table_name'].indexOf(addrFamily);
            } catch(e) {
                pos = -1;
            }
            if (pos == -1) {
                resultJSON.splice(i, 1);
                i = -1;
                --resultJSONLen;
                continue;
            }
        }
        if ((null == peerSource) && (null == protocol)) {
            continue;
        }
        /* First check if we have any matching sourcePeer */
        var routes = resultJSON[i]['routes'];
        var routesLen = routes.length;
        for (var j = 0; j < routesLen; j++) {
            var paths = resultJSON[i]['routes'][j]['paths'];
            var pathsLen = paths.length;
            for (var k = 0; k < pathsLen; k++) {
                srcMatched = 1;
                protoMatched = 1;
                if (peerSource && (peerSource != paths[k]['source'])) {
                    srcMatched = 0;
                }
                if (protocol && (protocol != paths[k]['protocol'])) {
                    protoMatched = 0;
                }
                if ((!srcMatched) || (!protoMatched)) {
                    /* We did not find match
                       so remove from the array 
                     */
                    (resultJSON[i]['routes'][j]['paths']).splice(k, 1);
                    return parseControlNodeRoutesByPeerSource(resultJSON,
                                                              peerSource,
                                                              addrFamily,
                                                              protocol);
                }
            }
        }
    }
}

function parseSandeshGenStatsResp (sandeshGenStatsResp)
{
    var resultJSON = {};
    try {
	    var sandeshGenStats = 
	        sandeshGenStatsResp['SandeshGenStatsResp']['stats'][0]['SandeshGenStats'][0];
    } catch(e) {
        return;
    }
    try {
        resultJSON['total_bytes_sent'] = 
            sandeshGenStats['total_bytes_sent'][0]['_'];
    } catch(e) {
        var sandeshGenStats = global.RESP_DATA_NOT_AVAILABLE;
    }
    try {
        resultJSON['total_sandesh_sent'] = 
            sandeshGenStats['total_sandesh_sent'][0]['_'];
    } catch(e) {
        resultJSON['total_sandesh_sent'] = 0;
    }
    try {
        resultJSON['total_sandesh_received'] =
            sandeshGenStats['total_sandesh_received'][0]['_'];
    } catch(e) {
        resultJSON['total_sandesh_received'] = 0;
    }
    return resultJSON;
}

function isContrailControlNode (bgpRtr)
{
    try {
        var vendor = bgpRtr['bgp_router_parameters']['vendor'];
        if ((null == vendor) || (0 == vendor.length) ||
            (global.INTERNAL_VENDOR_TYPE == vendor.toLowerCase())) {
            return true;
        }
    } catch(e) {
    }
    return false;
}

function parseBgpJSON (resultJSON, bgpJSON)
{
    var bgpNodeCnt = 0;
    var j = 0;
    var pos = -1;
    var vendor = null;
    
    try {
        bgpNodeCnt = bgpJSON.length;
        for (var i = 0; i < bgpNodeCnt; i++) {
            bgpRtr = bgpJSON[i]['bgp-router'];
            vendor = bgpRtr['bgp_router_parameters']['vendor'];
            if (isContrailControlNode(bgpRtr)) {
	            resultJSON[j] = {};
	            try {
	                resultJSON[j]['name'] = 
	                    commonUtils.getSafeDataToJSONify(bgpRtr['name']);
	            } catch(e) {
	                resultJSON[j]['name'] = global.RESP_DATA_NOT_AVAILABLE;
	            }
	            try {
	                resultJSON[j]['ip'] = 
	                    commonUtils.getSafeDataToJSONify(bgpRtr['bgp_router_parameters']['address']);
	            } catch(e) {
	                resultJSON[j]['ip'] = global.RESP_DATA_NOT_AVAILABLE;
	            }
	            j++;
            }
        }
    } catch(e) {
        console.log("In parseBgpJSON(): JSON parse error:" + e);
    }
}

function parseXMPPConnStateResp (sandeshResp)
{
    var xmppMsgsIn = 0;
    var xmppMsgsOut = 0;
    var resultJSON = {};
    var rxProtoStats;
    var txProtoStats;
    resultJSON['controlNodes'] = [];
    try {
        var data = 
            sandeshResp['AgentXmppConnectionStatus']['peer'][0]['list'][0]['AgentXmppData'];
        var cnt = data.length;
        for (var i = 0; i < cnt; i++) {
            resultJSON['controlNodes'][i] = data[i]['controller_ip'][0]['_'];
            rxProtoStats = data[i]['rx_proto_stats'][0]['ControllerProtoStats'][0]
            xmppMsgsIn += rxProtoStats['close'][0]['_'];
            xmppMsgsIn += rxProtoStats['keepalive'][0]['_'];
            xmppMsgsIn += rxProtoStats['open'][0]['_'];
            xmppMsgsIn += rxProtoStats['update'][0]['_'];
            txProtoStats = data[i]['tx_proto_stats'][0]['ControllerProtoStats'][0];
            xmppMsgsOut += txProtoStats['close'][0]['_'];
            xmppMsgsOut += txProtoStats['keepalive'][0]['_'];
            xmppMsgsOut += txProtoStats['open'][0]['_'];
            xmppMsgsOut += txProtoStats['update'][0]['_'];
        }
        resultJSON['xmppMessagesIn'] = xmppMsgsIn;
        resultJSON['xmppMessagesOut'] = xmppMsgsOut;
    } catch(e) {
        resultJSON['controlNodes'] = [];
        resultJSON['xmppMessagesIn'] = global.RESP_DATA_NOT_AVAILABLE;
        resultJSON['xmppMessagesOut'] = global.RESP_DATA_NOT_AVAILABLE;
    }
    return resultJSON;
}

function parseIPCStatsResp (sandeshResp)
{
    var resultJSON = {};
    try {
	    var xmppData = sandeshResp['__IpcStatsResp_list']['XmppStatsResp'][0];
	    var resultJSON = {};
	    resultJSON['xmppMessagesIn'] = xmppData['xmpp_in_msgs'][0]['_'];
	    resultJSON['xmppMessagesOut'] = xmppData['xmpp_out_msgs'][0]['_'];
    } catch(e) {
        resultJSON['xmppMessagesIn'] = global.RESP_DATA_NOT_AVAILABLE;
        resultJSON['xmppMessagesOut'] = global.RESP_DATA_NOT_AVAILABLE;
    }
    return resultJSON;
}

function getComputeNodeCpuMemJSON (ip, callback)
{
    var url = null;
    var urlLists = [];
    var resultJSON = {};
    
    url = ip + '@' + global.SANDESH_COMPUTE_NODE_PORT + '@' +
                '/Snh_CpuLoadInfoReq?';
    urlLists[0] = [url];
    url = ip + '@' + global.SANDESH_COMPUTE_NODE_PORT + '@' +
                '/Snh_CollectorInfoRequest?';
    urlLists[1] = [url];
    url = ip + '@' + global.SANDESH_COMPUTE_NODE_PORT + '@' +
                '/Snh_SandeshGenStatsReq?';
    urlLists[2] = [url];
    url = ip + '@' + global.SANDESH_COMPUTE_NODE_PORT + '@' +
                '/Snh_AgentXmppConnectionStatusReq?';
    urlLists[3] = [url];
    url = ip + '@' + global.SANDESH_COMPUTE_NODE_PORT + '@' +
                '/Snh_AgentStatsReq?';
    urlLists[4] = url;
    async.map(urlLists, commonUtils.getDataFromSandeshByIPUrl(rest.getAPIServer, true), 
        function(err, results) {
        if (results) {
            var cpuLoad = 
                parseControlNodeCPUMemInfo(results[0]);
            resultJSON['cpuLoadInfo'] = cpuLoad['cpuLoadInfo'];
            resultJSON['sysMemInfo'] = cpuLoad['sysMemInfo'];
            var collectorData = 
                commonUtils.getSafeDataToJSONify(
                    processSandeshCollectorInfo(results[1]));
            try {
                resultJSON['analyticsNode'] = 
                    commonUtils.getSafeDataToJSONify(collectorData['ip']);
            } catch(e) {
                resultJSON['analyticsNode'] = global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                var statData = parseSandeshGenStatsResp(results[2]);
                resultJSON['analyticsMessagesOut'] = 
                    commonUtils.getSafeDataToJSONify(statData['total_sandesh_sent']);
                resultJSON['analyticsMessagesIn'] =
                    commonUtils.getSafeDataToJSONify(statData['total_sandesh_received']);
            } catch(e) {
                resultJSON['analyticsMessagesOut'] =
                    global.RESP_DATA_NOT_AVAILABLE;
                resultJSON['analyticsMessagesIn'] =
                    global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                var controlNodeData = 
                    parseXMPPConnStateResp(results[3]);
                resultJSON['controlNodes'] = controlNodeData['controlNodes'];
            } catch(e) {
                resultJSON['controlNodes'] = global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                var xmppConnStatData = parseIPCStatsResp(results[4]);
                resultJSON['xmppMessagesIn'] = xmppConnStatData['xmppMessagesIn'];
                resultJSON['xmppMessagesOut'] = xmppConnStatData['xmppMessagesOut'];
            } catch(e) {
                resultJSON['xmppMessagesIn'] = global.RESP_DATA_NOT_AVAILABLE;
                resultJSON['xmppMessagesOut'] = global.RESP_DATA_NOT_AVAILABLE;
            }
            callback(err, resultJSON); 
        }
    });
}

function getControlNodeList (appData, callback)
{
    var resultJSON = [];
    var bgpURLs = [];
    var dataObjArr = [];
    var bgpCount = 0;
    var i, uuid;
    var url = '/bgp-routers?parent_fq_name_str=default-domain:default-project:ip-fabric:__default__';
    configApiServer.apiGet(url, appData, function (error, bgpJSON) {
        if (error) {
            callback(error, bgpJSON);
        } else {
            try {
                bgpCount = bgpJSON["bgp-routers"].length;
                for (i = 0; i < bgpCount; i += 1) {
                    uuid = bgpJSON["bgp-routers"][i].uuid;
                    bgpURLs[i] = '/bgp-router/' + uuid;
                    commonUtils.createReqObj(dataObjArr, bgpURLs[i],
                                             global.HTTP_REQUEST_GET, null,
                                             null, null, appData);
                    delete bgpJSON["bgp-routers"][i]["fq_name"];
                }
                async.map(dataObjArr,
                          commonUtils.getAPIServerResponse(configApiServer.apiGet,
                                                           true),
                          function (err, results) {
                    if (results) {
                        parseBgpJSON(resultJSON, results);
                        callback(null, resultJSON);
                    } else {
                        callback(err, resultJSON);
                    }
                });
            } catch(e) {
                console.log("In getBgpNodeList(): JSON parse error:" + e);
                callback(e, resultJSON);
            }
        }
    });
}

exports.getControlNodeList = getControlNodeList;
exports.isContrailControlNode = isContrailControlNode;
exports.processControlNodeRoutingInstanceList =
    processControlNodeRoutingInstanceList;
exports.getBGPRefNames = getBGPRefNames;
exports.processVRJSON = processVRJSON;
exports.processVirtualRouters = processVirtualRouters;
exports.processAclFlowsSandeshData = processAclFlowsSandeshData;


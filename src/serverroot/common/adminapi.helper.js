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

adminApiHelper.parseBGPNeighborResponse = function (bgpNeighborResp) {
    var results = [];
    try {
        bgpNeighborResp = bgpNeighborResp['BgpNeighborListResp'];
        var nbrRsp = bgpNeighborResp['neighbors'][0]['list'][0]['BgpNeighborResp'];
        var count = nbrRsp.length;
        for (var i = 0; i < count; i++) {
            results[i] = {};
            try {
                results[i]['active_holdtime'] = 
                    commonUtils.getSafeDataToJSONify(nbrRsp[i]['active_holdtime'][0]['_']);
            } catch(e) {
                results[i]['active_holdtime'] = global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                results[i]['encoding'] = 
                    commonUtils.getSafeDataToJSONify(nbrRsp[i]['encoding'][0]['_']);
            } catch(e) {
                results[i]['encoding'] = global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                results[i]['flap_count'] = 
                    commonUtils.getSafeDataToJSONify(nbrRsp[i]['flap_count'][0]['_']);
            } catch(e) {
                results[i]['flap_count'] = global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                results[i]['hold_time'] = 
                    commonUtils.getSafeDataToJSONify(nbrRsp[i]['hold_time'][0]['_']);
            } catch(e) {
                results[i]['hold_time'] = global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                results[i]['last_error'] = 
                    commonUtils.getSafeDataToJSONify(nbrRsp[i]['last_error'][0]['_']);
            } catch(e) {
                results[i]['last_error'] = global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                results[i]['last_event'] = 
                    commonUtils.getSafeDataToJSONify(nbrRsp[i]['last_event'][0]['_']);
            } catch(e) {
                results[i]['last_event'] = global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                results[i]['last_state'] = 
                    commonUtils.getSafeDataToJSONify(nbrRsp[i]['last_state'][0]['_']);
            } catch(e) {
                results[i]['last_state'] = global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                results[i]['local_address'] = 
                    commonUtils.getSafeDataToJSONify(nbrRsp[i]['local_address'][0]['_']);
            } catch(e) {
                results[i]['local_address'] = global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                results[i]['local_asn'] = 
                    commonUtils.getSafeDataToJSONify(nbrRsp[i]['local_asn'][0]['_']);
            } catch(e) {
                results[i]['local_asn'] = global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                results[i]['local_id'] = 
                    commonUtils.getSafeDataToJSONify(nbrRsp[i]['local_id'][0]['_']);
            } catch(e) {
                results[i]['local_id'] = global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                results[i]['peer'] = 
                    commonUtils.getSafeDataToJSONify(nbrRsp[i]['peer'][0]['_']);
            } catch(e) {
                results[i]['peer'] = global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                results[i]['peer_address'] = 
                    commonUtils.getSafeDataToJSONify(nbrRsp[i]['peer_address'][0]['_']);
            } catch(e) {
                results[i]['peer_address'] = global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                results[i]['peer_asn'] = 
                    commonUtils.getSafeDataToJSONify(nbrRsp[i]['peer_asn'][0]['_']);
            } catch(e) {
                results[i]['peer_asn'] = global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                results[i]['peer_id'] = 
                    commonUtils.getSafeDataToJSONify(nbrRsp[i]['peer_id'][0]['_']);
            } catch(e) {
                results[i]['peer_id'] = global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                results[i]['peer_type'] = 
                    commonUtils.getSafeDataToJSONify(nbrRsp[i]['peer_type'][0]['_']);
            } catch(e) {
                results[i]['peer_type'] = global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                results[i]['preference'] = 
                    commonUtils.getSafeDataToJSONify(nbrRsp[i]['preference'][0]['_']);
            } catch(e) {
                results[i]['preference'] = global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                results[i]['send_state'] = 
                    commonUtils.getSafeDataToJSONify(nbrRsp[i]['send_state'][0]['_']);
            } catch(e) {
                results[i]['send_state'] = global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                results[i]['state'] =
                    commonUtils.getSafeDataToJSONify(nbrRsp[i]['state'][0]['_']);
            } catch(e) {
                results[i]['state'] = global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                var raw_peer_state =
                    commonUtils.getSafeDataToJSONify(nbrRsp[i]['state'][0]['_'])
                    + ', ' +
                    commonUtils.getSafeDataToJSONify(nbrRsp[i]['send_state'][0]['_']);

                if (!((commonUtils.getSafeDataToJSONify(nbrRsp[i]['state'][0]['_']) == 
                    'Established') && 
                    (results[i]['send_state'] == 'in sync'))) {
                    raw_peer_state += ', Last Error:' +
                        commonUtils.getSafeDataToJSONify(nbrRsp[i]['last_error'][0]['_']);
                }
                results[i]['introspect_state'] = raw_peer_state; 
            } catch(e) {
                results[i]['introspect_state'] = global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                rxProtoStats = nbrRsp[i]['rx_proto_stats'][0]['BgpPeerProtoStats'][0];
                results[i]['messsages_in'] = 
                    commonUtils.getSafeDataToJSONify(rxProtoStats['total'][0]['_']);
            } catch(e) {
                results[i]['messsages_in'] = global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                txProtoStats = nbrRsp[i]['tx_proto_stats'][0]['BgpPeerProtoStats'][0];
                results[i]['messsages_out'] = txProtoStats['total'][0]['_'];
            } catch(e) {
                results[i]['messsages_out'] = global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                results[i]['last_flap'] = 
                    commonUtils.getSafeDataToJSONify(nbrRsp[i]['flap_time'][0]['_'])
            } catch(e) {
                results[i]['last_flap'] = global.RESP_DATA_NOT_AVAILABLE;
            }
        }
        return results;
    } catch (e) {
        return [];
    }
}

adminApiHelper.parseBGPRoutingInstanceResponse = function(bgpRoutInstRes) {
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

adminApiHelper.parseBGPRoutingTableResponse = function(bgpRouteTable) {
    try {
        var routeTable =
            bgpRouteTable['ShowRouteResp']['tables'][0]['list'][0]['ShowRouteTable'];
        return routeTable;
    } catch (e) {
        return [];
    }
}

function processControlNodeRoutingInstanceList (resultJSON, resultArr)
{
    var len = 0, idx = 0;
    resultJSON['routeInstances'] = [];
    var controlNodeRoutes = [];
    var routes, routesLen, paths, pathsLen;
    var peerSrcCount = 0;
    var srcObj = {};

    var routInst = adminApiHelper.parseBGPRoutingInstanceResponse(resultArr[0]);
    if (routInst && routInst.length) {
        len = routInst.length;
        for (i = 0; i < len; i++) {
            resultJSON['routeInstances'][i] = routInst[i]['name'];
        }
    }
}

parseBGPRouteList = function(resultJSON, routeList, i) {
    try {
        resultJSON[i]['active_route_count'] = 
            commonUtils.getSafeDataToJSONify(routeList['active_route_count'][0]['_']);
    } catch(e) {
        resultJSON[i]['active_route_count'] = global.RESP_DATA_NOT_AVAILABLE;
    }
    try {
        resultJSON[i]['destination_count'] = 
            commonUtils.getSafeDataToJSONify(routeList['destination_count'][0]['_']);
    } catch (e) {
        resultJSON[i]['destination_count'] = global.RESP_DATA_NOT_AVAILABLE;
    }
    try {
        resultJSON[i]['hidden_route_count'] = 
            commonUtils.getSafeDataToJSONify(routeList['hidden_route_count'][0]['_']);
    } catch(e) {
        resultJSON[i]['hidden_route_count'] = global.RESP_DATA_NOT_AVAILABLE;
    }
    try {
        resultJSON[i]['holddown_route_count'] = 
            commonUtils.getSafeDataToJSONify(routeList['holddown_route_count'][0]['_']);
    } catch(e) {
        resultJSON[i]['holddown_route_count'] = global.RESP_DATA_NOT_AVAILABLE;
    }
    try {
        resultJSON[i]['routes_count'] = 
            commonUtils.getSafeDataToJSONify(routeList['routes_count'][0]['_']);
    } catch (e) {
        resultJSON[i]['routes_count'] = global.RESP_DATA_NOT_AVAILABLE;
    }
    try {
        resultJSON[i]['routing_instance'] = 
            commonUtils.getSafeDataToJSONify(routeList['routing_instance'][0]['_']);
    } catch (e) {
        resultJSON[i]['routing_instance'] = global.RESP_DATA_NOT_AVAILABLE;
    }
    try {
        resultJSON[i]['routing_table_name'] = 
            commonUtils.getSafeDataToJSONify(routeList['routing_table_name'][0]['_']);
    } catch (e) {
        resultJSON[i]['routing_table_name'] = global.RESP_DATA_NOT_AVAILABLE;
    }
    
    resultJSON[i]['routes'] = [];
    try {
        var routes = routeList['routes'][0]['list'][0]['ShowRoute'];
        var routesLen = routes.length;
    } catch(e) {
        resultJSON[i]['routes'] = [];
        return;
    } 
    for (var j = 0; j < routesLen; j++) {
        try {
            resultJSON[i]['routes'][j] = {};
                resultJSON[i]['routes'][j]['prefix'] = 
                    commonUtils.getSafeDataToJSONify(routes[j]['prefix'][0]['_']);
        } catch (e) {
            resultJSON[i]['routes'][j]['prefix'] = global.RESP_DATA_NOT_AVAILABLE;
        }
        
        resultJSON[i]['routes'][j]['paths'] = [];
        var paths = routes[j]['paths'][0]['list'][0]['ShowRoutePath'];
        var pathsLen = paths.length;
        for (var k = 0; k < pathsLen; k++) {
            resultJSON[i]['routes'][j]['paths'][k] = {};
            try {
                resultJSON[i]['routes'][j]['paths'][k]['origin_vn'] =
                    commonUtils.getSafeDataToJSONify(paths[k]['origin_vn'][0]['_']);
            } catch(e) {
                resultJSON[i]['routes'][j]['paths'][k]['origin_vn'] =
                    global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                var sgElem = jsonPath(paths[k]['communities'], "$..element");
                if (sgElem.length > 0) {
                    resultJSON[i]['routes'][j]['paths'][k]['sg'] = 
                        commonUtils.getSafeDataToJSONify(sgElem[0]);
                } else {
                    resultJSON[i]['routes'][j]['paths'][k]['sg'] = 
                        global.RESP_DATA_NOT_AVAILABLE;
                }
            } catch(e) {
                resultJSON[i]['routes'][j]['paths'][k]['sg'] =
                    global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                var tunnEnc = jsonPath(paths[k]['tunnel_encap'], "$..element");
                if (tunnEnc.length > 0) {
                    resultJSON[i]['routes'][j]['paths'][k]['tunnel_encap'] =
                        commonUtils.getSafeDataToJSONify(tunnEnc[0]);
                } else {
                    resultJSON[i]['routes'][j]['paths'][k]['tunnel_encap'] =
                        global.RESP_DATA_NOT_AVAILABLE;
                }
            } catch(e) {
                resultJSON[i]['routes'][j]['paths'][k]['tunnel_encap'] =
                    global.RESP_DATA_NOT_AVAILABLE;
            }
            try { 
                resultJSON[i]['routes'][j]['paths'][k]['as_path'] = 
                   commonUtils.getSafeDataToJSONify(paths[k]['as_path'][0]['_']);
            } catch(e) {
                resultJSON[i]['routes'][j]['paths'][k]['as_path'] = global.RESP_DATA_NOT_AVAILABLE;
            }
            try { 
                resultJSON[i]['routes'][j]['paths'][k]['known_since'] = 
                    commonUtils.getSafeDataToJSONify(paths[k]['known_since'][0]['_']);
            } catch(e) {
                resultJSON[i]['routes'][j]['paths'][k]['known_since'] = global.RESP_DATA_NOT_AVAILABLE;
            }
    
            try { 
                resultJSON[i]['routes'][j]['paths'][k]['label'] = 
                    commonUtils.getSafeDataToJSONify(paths[k]['label'][0]['_']);
            } catch(e) {
                resultJSON[i]['routes'][j]['paths'][k]['label'] = global.RESP_DATA_NOT_AVAILABLE;
            }
    
            try { 
                resultJSON[i]['routes'][j]['paths'][k]['local_asn'] = 
                    commonUtils.getSafeDataToJSONify(paths[k]['local_as'][0]['_']);
            } catch(e) {
                resultJSON[i]['routes'][j]['paths'][k]['local_asn'] = global.RESP_DATA_NOT_AVAILABLE;
            }
    
            try { 
                 resultJSON[i]['routes'][j]['paths'][k]['local_preference'] = 
                     commonUtils.getSafeDataToJSONify(paths[k]['local_preference'][0]['_']);
            } catch(e) {
                 resultJSON[i]['routes'][j]['paths'][k]['local_preference'] = global.RESP_DATA_NOT_AVAILABLE;
            }
    
            try { 
                 resultJSON[i]['routes'][j]['paths'][k]['metric'] = 
                     commonUtils.getSafeDataToJSONify(paths[k]['metric'][0]['_']);
            } catch(e) {
                 resultJSON[i]['routes'][j]['paths'][k]['metric'] = global.RESP_DATA_NOT_AVAILABLE;
            }
    
             try { 
                 resultJSON[i]['routes'][j]['paths'][k]['next_hop'] = 
                     commonUtils.getSafeDataToJSONify(paths[k]['next_hop'][0]['_']);
             } catch(e) {
                 resultJSON[i]['routes'][j]['paths'][k]['next_hop'] = global.RESP_DATA_NOT_AVAILABLE;
             }
    
            try { 
                 resultJSON[i]['routes'][j]['paths'][k]['peer_asn'] = 
                     commonUtils.getSafeDataToJSONify(paths[k]['peer_as'][0]['_']);
            } catch(e) {
                 resultJSON[i]['routes'][j]['paths'][k]['peer_asn'] = global.RESP_DATA_NOT_AVAILABLE;
            }
    
            try { 
                 resultJSON[i]['routes'][j]['paths'][k]['peer_router_id'] = 
                     commonUtils.getSafeDataToJSONify(paths[k]['peer_router_id'][0]['_']);
            } catch(e) {
                 resultJSON[i]['routes'][j]['paths'][k]['peer_router_id'] = global.RESP_DATA_NOT_AVAILABLE;
            }
    
            try { 
                 resultJSON[i]['routes'][j]['paths'][k]['preference'] = 
                     commonUtils.getSafeDataToJSONify(paths[k]['preference'][0]['_']);
            } catch(e) {
                 resultJSON[i]['routes'][j]['paths'][k]['preference'] = global.RESP_DATA_NOT_AVAILABLE;
            }
    
            try { 
                 resultJSON[i]['routes'][j]['paths'][k]['protocol'] = 
                     commonUtils.getSafeDataToJSONify(paths[k]['protocol'][0]['_']);
            } catch(e) {
                 resultJSON[i]['routes'][j]['paths'][k]['protocol'] = global.RESP_DATA_NOT_AVAILABLE;
            }
    
            try { 
                 resultJSON[i]['routes'][j]['paths'][k]['source'] = 
                     commonUtils.getSafeDataToJSONify(paths[k]['source'][0]['_']);
            } catch(e) {
                 resultJSON[i]['routes'][j]['paths'][k]['source'] = global.RESP_DATA_NOT_AVAILABLE;
            }
        }
    }
}

adminApiHelper.processControlNodesRoutes = function(resultJSON, results) {
    try {
        var routeList = results['ShowRouteResp']['tables'][0]['list'][0]['ShowRouteTable'];
        if (null == routeList) {
            resultJSON = [];
            return;
        }
    } catch (e) {
        resultJSON = [];
        return;
    }
    var routeListLen = routeList.length;
    
    for (var i = 0; i < routeListLen; i++) {
        resultJSON[i] = {};
        try {
            parseBGPRouteList(resultJSON, routeList[i], i);        
        } catch(e) {
            console.log("In adminApiHelper.processControlNodesRoutes(), error:", e);
            resultJSON = [];
        }
    }   
}

adminApiHelper.isfqFromProjectNotVisibleToUI = function(fqName) {
    var fqArr = fqName.split(':');
    if ((fqArr) && (fqArr[1]) && ((fqArr[1] == 'default-project') || 
        (fqArr[1] == 'service') || (fqArr[1] == 'invisible_to_admin'))) {        
        return true;
    }
    return false;
}

adminApiHelper.processControlNodeVN = function(resultJSON, resultArr) {
    resultArr = jsonPath(resultArr[0], "$..VnSandeshData");
    var lastIndex = 0;
    try {
        var vnListCnt = resultArr.length;
        for (var i = 0; i < vnListCnt; i++) {
            lastIndex = parsevRouterVnLists(resultArr[i], resultJSON, lastIndex);
        }
    } catch(e) {
        logutils.logger.debug("In processControlNodeVN(): JSON Parse error: " + e);
    }
}

parsevRouterVnLists = function(vnList, resultJSON, lastIndex) {
    var vnName = null;
    var j = 0;
    try {
	    var vnListLen = vnList.length;
	    for (var i = 0; i < vnListLen; i++) {
            j = i + lastIndex;
	        try {
               resultJSON[j] = {};
               resultJSON[j]['name'] = 
                   commonUtils.getSafeDataToJSONify(vnList[i]['name'][0]['_']);

	        } catch(e) {
	           resultJSON[j]['name'] = global.RESP_DATA_NOT_AVAILABLE;
	        }
            try {
               resultJSON[j]['uuid'] = 
                   commonUtils.getSafeDataToJSONify(vnList[i]['uuid'][0]['_']);
            } catch(e) {
               resultJSON[j]['uuid'] = global.RESP_DATA_NOT_AVAILABLE;
            }
	        try {
	           resultJSON[j]['acl_uuid'] = 
	               commonUtils.getSafeDataToJSONify(vnList[i]['acl_uuid'][0]['_']);
	        } catch(e) {
	            resultJSON[j]['acl_uuid'] = global.RESP_DATA_NOT_AVAILABLE;
	        }
            try {
               resultJSON[j]['mirror_acl_uuid'] = 
                   commonUtils.getSafeDataToJSONify(vnList[i]['mirror_acl_uuid'][0]['_']);
            } catch(e) {
                resultJSON[j]['mirror_acl_uuid'] = global.RESP_DATA_NOT_AVAILABLE;
            }
	        try {
	           resultJSON[j]['vrf'] = 
	               commonUtils.getSafeDataToJSONify(vnList[i]['vrf_name'][0]['_']);
	        } catch(e) {
	           resultJSON[j]['vrf'] = global.RESP_DATA_NOT_AVAILABLE;
	        }
	        var pos = (resultJSON[j]['vrf']).lastIndexOf(':');
	        if (pos != -1) {
	           resultJSON[j]['vrf'] = (resultJSON[j]['vrf']).substr(0, pos);
	        }
	        j++;
	    }
    } catch(e) {
        logutils.logger.debug("In processControlNodeVN(): JSON Parse error:" + e);
        resultJSON = [];
    }
    return j;
}

processvRouterList = function(resultJSON, resultArr) {
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
adminApiHelper.getBGPRefNames = function(routerRefs) {
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
adminApiHelper.processVRJSON = function(vRouterJSON, vrJSONArray) {
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
                    adminApiHelper.getBGPRefNames(vrJSON["virtual-router"]["bgp_router_refs"]);
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

getvRouterVNCount = function(vRouterJSON, ipIndexMap, results) {
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

getvRouterItfCount = function(vRouterJSON, ipIndexMap, results) {
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

getvRouterVMCount = function(vRouterJSON, ipIndexMap, results) {
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

updatevRoutersCpuMemoryDataAndSendResp = function(res, vRouterJSON, cpuMemData) {
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

getvRoutersCpuMemoryStats = function(vRouterJSON, ipList, res) {
    var resultJSON = [];
    async.map(ipList, adminApiHelper.getComputeNodeCpuMemJSON, function(err, cpuMemData) {
        updatevRoutersCpuMemoryDataAndSendResp(res, vRouterJSON, cpuMemData);
    });
}

getvRouterVnItfList = function(res, vnUrlLists, itfUrlLists, vmUrlLists,
                               ipIndexMap, vRouterJSON, ipList) {
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

adminApiHelper.processAndSendVRSummaryResponse = function(vRouterJSON, 
                                                          res) {
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

sendvRouterResponse = function(res, type, resultJSON, resultArr, dataObj) {
    if (type === global.GET_VIRTUAL_ROUTERS) {
        adminApiHelper.processVRJSON(resultJSON, resultArr);
        adminApiHelper.processAndSendVRSummaryResponse(resultJSON, res);
    } else if (type == global.GET_VROUTERS_LIST) {
        resultJSON = [];
        processvRouterList(resultJSON, resultArr);
        redisPub.publishDataToRedis(dataObj.pubChannel, dataObj.saveChannelKey,
                                    global.HTTP_STATUS_RESP_OK,
                                    JSON.stringify(resultJSON),
                                    JSON.stringify(resultJSON),
                                    1, 0, dataObj.done);
    }
}

sendvRouterErrorResponse = function(res, err, type, dataObj) {
    if (type === global.GET_VIRTUAL_ROUTERS) {
        commonUtils.handleJSONResponse(err, res, null);
    } else if (type == global.GET_VROUTERS_LIST) {
        redisPub.publishDataToRedis(dataObj.pubChannel, dataObj.saveChannelKey,
                                    global.HTTP_STATUS_INTERNAL_ERROR,
                                    global.STR_CACHE_RETRIEVE_ERROR,
                                    global.STR_CACHE_RETRIEVE_ERROR, 0,
                                    0, dataObj.done);
    }
}

adminApiHelper.processVirtualRouters = function(req, res, type, dataObj, appData) {
    var url = '/virtual-routers';
    var resultJSON = [];

    configApiServer.apiGet(url, appData, function (error, jsonData) {
        if (error) {
            sendvRouterErrorResponse(res, error, type, dataObj);
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
                        commonUtils.createReqObj(dataObjArr, i, [url],
                                                 global.HTTP_REQUEST_GET, null,
                                                 null, null, appData);
                        delete vrJSON["virtual-routers"][i]["fq_name"];
                    }
                    async.map(dataObjArr,
                              commonUtils.getAPIServerResponse(configApiServer.apiGet,
                                                               true),
                              function (err, results) {
                        if (!err) {
                            sendvRouterResponse(res, type, vrJSON, results, dataObj);
                        } else {
                            sendvRouterErrorResponse(res, error, type, dataObj);
                        }
                    });
                } else {
                    sendvRouterResponse(res, type, vrJSON, vrJSON, dataObj);
                }
            } catch (e) {
                sendvRouterErrorResponse(res, e, type, dataObj);
            }
        }
    });
};

adminApiHelper.parseControlNodeCPUMemInfo = function(sandeshResp) {
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

adminApiHelper.processSandeshCollectorInfo = function(sandeshResponse) {
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

adminApiHelper.processSandeshConfigInfo = function(results) {
    var resultJSON = {};
    resultJSON['configMessagesIn'] = 0;
    resultJSON['configMessagesOut'] = 0;
    try {
        var ifMapStat = results['IFMapStatsResp']['stats_info'][0]['IFMapStatsInfo'][0];
        resultJSON['configMessagesIn'] = ifMapStat['rx_msgs'][0]['_'];
        resultJSON['configMessagesOut'] = ifMapStat['tx_msgs'][0]['_'];
        var url = ifMapStat['server_info'][0]['IFMapServerInfo'][0]['url'][0]['_'];
        var pos = url.indexOf(':8443');
        var tempUrl = url.substr(0, pos);
        pos = tempUrl.indexOf('https://');
        resultJSON['configNode'] = tempUrl.slice(pos + 8);
    } catch(e) {
        console.log("In processSandeshConfigInfo(): JSON Parse error " + e);
        resultJSON['configNode'] = global.RESP_DATA_NOT_AVAILABLE;
        
    }
    return resultJSON;
}

adminApiHelper.processControlNodeDetailJson = function(resultJSON, results, controlNodeObj) {
    var detailData = adminApiHelper.parseBGPNeighborResponse(results[0]);
    var cpuData = adminApiHelper.parseControlNodeCPUMemInfo(results[1]);
    var collectorData = adminApiHelper.processSandeshCollectorInfo(results[2]);
    var configData = adminApiHelper.processSandeshConfigInfo(results[3]);
    var sandeshData = adminApiHelper.parseSandeshGenStatsResp(results[4]);
    var peerLen = detailData.length;
    resultJSON['ip'] = controlNodeObj['ip'];
    resultJSON['name'] = controlNodeObj['name'];
    resultJSON['totalPeerCount'] = peerLen;
    resultJSON['activevRouterCount'] = 0;
    resultJSON['establishedPeerCount'] = 0;
    for (var i = 0; i < peerLen; i++) {
        if (detailData[i]['state'] == 'Active') {
            resultJSON['establishedPeerCount']++;
        }
        if ((detailData[i]['encoding'] == 'XMPP') && 
            (detailData[i]['state'] == 'Active')) {
            resultJSON['activevRouterCount']++;
        }
    }
    resultJSON['cpuLoadInfo'] = cpuData['cpuLoadInfo'];
    resultJSON['sysMemInfo'] = cpuData['sysMemInfo'];
    try {
        resultJSON['analyticsNode'] = collectorData['ip'];
    } catch(e) {
        resultJSON['analyticsNode'] = global.RESP_DATA_NOT_AVAILABLE;
    } 
    try {       
        if (null != resultJSON['sysMemInfo']['total']) {
            resultJSON['status'] = 'Up';
        } else {
            resultJSON['status'] = global.STR_HOST_NOT_REACHABLE;
        }
    } catch(e) {
        resultJSON['status'] = global.STR_HOST_NOT_REACHABLE;
    }
    try {
        resultJSON['configNode'] = configData['configNode'];
	    resultJSON['configMessagesIn'] = configData['configMessagesIn'];
	    resultJSON['configMessagesOut'] = configData['configMessagesOut'];

    } catch(e) {
        resultJSON['configNode'] = global.RESP_DATA_NOT_AVAILABLE;
        resultJSON['configMessagesIn'] = global.RESP_DATA_NOT_AVAILABLE;
        resultJSON['configMessagesOut'] = global.RESP_DATA_NOT_AVAILABLE;
    }
    try {
         resultJSON['analyticsMessagesOut'] = 
             commonUtils.getSafeDataToJSONify(sandeshData['total_sandesh_sent']);
         resultJSON['analyticsMessagesIn'] =
             commonUtils.getSafeDataToJSONify(sandeshData['total_sandesh_received']);
    } catch(e) {
         resultJSON['analyticsMessagesOut'] = global.RESP_DATA_NOT_AVAILABLE;
         resultJSON['analyticsMessagesIn'] = global.RESP_DATA_NOT_AVAILABLE;
    }
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

adminApiHelper.processAclFlowsSandeshData = function(uuidLists, aclFlowResponse) {
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

adminApiHelper.parseControlNodeRoutesByPeerSource = 
    function(resultJSON, peerSource, addrFamily, protocol)
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
                    return adminApiHelper.parseControlNodeRoutesByPeerSource(resultJSON,
                                                                             peerSource,
                                                                             addrFamily,
                                                                             protocol);
                }
            }
        }
    }
}

/* Function: getvRouterObjByvRouterUUID
    This API is used to get the entry of vRouter from the vRouter List
 */
adminApiHelper.getvRouterObjByvRouterUUID = function(vRouterListData, uuid) {
    var vRouterObj = {};
    var vRouterCount = vRouterListData.length;
    for (var i = 0; i < vRouterCount; i++) {
        if (uuid === vRouterListData[i]['uuid']) {
            break;
        }
    }
    if (i == vRouterCount) {
        return null;
    }
    vRouterObj['name'] = vRouterListData[i]['name'];
    vRouterObj['ip'] = vRouterListData[i]['ip']
    vRouterObj['uuid'] = vRouterListData[i]['uuid'];
    return vRouterObj;
}

adminApiHelper.parseComputeNodeDetail = function(resultJSON, results, vRouterObj) {
    try {
        resultJSON['ip'] = 
            commonUtils.getSafeDataToJSONify(vRouterObj['ip']);
    } catch(e) {
        resultJSON['ip'] = global.RESP_DATA_NOT_AVAILABLE;
    }
    try {
        resultJSON['name'] = 
            commonUtils.getSafeDataToJSONify(vRouterObj['name']);
    } catch(e) {
        resultJSON['name'] = global.RESP_DATA_NOT_AVAILABLE;
    }
    /* As no information is available as of now, so adding dummy information */
    resultJSON['status'] = global.RESP_DATA_NOT_AVAILABLE;
    try {
        if (null != results['sysMemInfo']['total']) {
            resultJSON['status'] = 'Up';
        } else {
            resultJSON['status'] = global.STR_HOST_NOT_REACHABLE;
        }
    } catch(e) {
        resultJSON['status'] = global.STR_HOST_NOT_REACHABLE;
    }
    resultJSON['cpu'] = results['cpu'];
    resultJSON['memory'] = results['memory'];
    resultJSON['analyticsMessagesIn'] = results['analyticsMessagesIn'];
    resultJSON['analyticsMessagesOut'] = results['analyticsMessagesOut'];
    resultJSON['trafficPktsIn'] = global.RESP_DATA_NOT_AVAILABLE;
    resultJSON['trafficPktsOut'] = global.RESP_DATA_NOT_AVAILABLE;
    resultJSON['xmppMessagesIn'] = results['xmppMessagesIn'];
    resultJSON['xmppMessagesOut'] = results['xmppMessagesOut'];
    resultJSON['analyticsNode'] = results['analyticsNode'];
    resultJSON['controlNodes'] = results['controlNodes'];
}

adminApiHelper.parseSandeshGenStatsResp = function(sandeshGenStatsResp) {
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

adminApiHelper.parseBgpJSON = function(resultJSON, bgpJSON) {
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

adminApiHelper.parseXMPPConnStateResp = function(sandeshResp) {
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

adminApiHelper.parseIPCStatsResp = function(sandeshResp) {
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

adminApiHelper.getComputeNodeCpuMemJSON = function(ip, callback) {
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
                adminApiHelper.parseControlNodeCPUMemInfo(results[0]);
            resultJSON['cpuLoadInfo'] = cpuLoad['cpuLoadInfo'];
            resultJSON['sysMemInfo'] = cpuLoad['sysMemInfo'];
            var collectorData = 
                commonUtils.getSafeDataToJSONify(
                    adminApiHelper.processSandeshCollectorInfo(results[1]));
            try {
                resultJSON['analyticsNode'] = 
                    commonUtils.getSafeDataToJSONify(collectorData['ip']);
            } catch(e) {
                resultJSON['analyticsNode'] = global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                var statData = adminApiHelper.parseSandeshGenStatsResp(results[2]);
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
                    adminApiHelper.parseXMPPConnStateResp(results[3]);
                resultJSON['controlNodes'] = controlNodeData['controlNodes'];
            } catch(e) {
                resultJSON['controlNodes'] = global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                var xmppConnStatData = adminApiHelper.parseIPCStatsResp(results[4]);
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

function getVirtualRouterList (appData, callback) {
    var url = '/virtual-routers';
    var resultJSON = [];

    configApiServer.apiGet(url, appData, function (error, jsonData) {
        if (error) {
            callback(error, null);
        } else {
            try {
                var vrJSON = jsonData,
                    vrURLs = [],
                    vrCount = vrJSON["virtual-routers"].length,
                    i, uuid, url, 
                    dataObjArr = []; 
                if (!vrCount) {
                    /* No Virtual-Router */
                    callback(null, resultJSON);
                    return;
                }    
                for (i = 0; i < vrCount; i += 1) { 
                    uuid = vrJSON["virtual-routers"][i].uuid;
                    url = '/virtual-router/' + uuid;
                    logutils.logger.debug("getVirtualRouters: " + url);
                    vrURLs[i] = [url];
                    commonUtils.createReqObj(dataObjArr, i, [url],
                                             global.HTTP_REQUEST_GET, null,
                                             null, null, appData);
                    delete vrJSON["virtual-routers"][i]["fq_name"];
                }
                async.map(dataObjArr,
                          commonUtils.getAPIServerResponse(configApiServer.apiGet,
                                                           true),
                          function (err, results) {
                    if (!err) {
                        processvRouterList(resultJSON, results);
                        callback(null, resultJSON);
                    } else {
                        callback(err, null);
                    }
                });
            } catch (e) {
                callback(null, resultJSON);
            }
        }
    });
};

function getControlNodeList (appData, callback) {
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
                    commonUtils.createReqObj(dataObjArr, i, bgpURLs[i],
                                             global.HTTP_REQUEST_GET, null,
                                             null, null, appData);
                    delete bgpJSON["bgp-routers"][i]["fq_name"];
                }
                async.map(dataObjArr,
                          commonUtils.getAPIServerResponse(configApiServer.apiGet,
                                                           true),
                          function (err, results) {
                    if (results) {
                        adminApiHelper.parseBgpJSON(resultJSON, results);
                        callback(null, resultJSON);
                    } else {
                        callback(err, resultJSON);
                    }
                });
            } catch(e) {
                console.log("In adminApiHelper.getBgpNodeList(): JSON parse error:" + e);
                callback(e, resultJSON);
            }
        }
    });
}

exports.getVirtualRouterList = getVirtualRouterList;
exports.getControlNodeList = getControlNodeList;
exports.isContrailControlNode = isContrailControlNode;
exports.processControlNodeRoutingInstanceList =
    processControlNodeRoutingInstanceList;


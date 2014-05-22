/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var rest = require('../../common/rest.api'),
	config = require('../../../../config/config.global.js'),
	adminapi = module.exports,
	logutils = require('../../utils/log.utils'),
	async = require('async'),
	commonUtils = require('../../utils/common.utils'),
	messages = require('../../common/messages'),
	global = require('../../common/global'),
	appErrors = require('../../errors/app.errors.js'),
	util = require('util'),
	qs = require('querystring'),
    restler = require('restler'),
    urlMod = require('url'),
    adminApiHelper = require('../../common/adminapi.helper'),
    redisSub = require('../core/redisSub'),
    jsonPath = require('JSONPath').eval,
    configApiServer = require('../../common/configServer.api'),
    nwMonUtils = require('../../common/nwMon.utils'),
    vnConfig = require('./vnconfig.api'),
    fipConfig = require('./fipconfig.api'),
    polConfig = require('./policyconfig.api'),
    ipamConfig = require('./ipamconfig.api'),
    vdnsConfig = require('./virtualdnsconfig.api'),
    svcTempl = require('./servicetemplateconfig.api'),
    os = require('os'),
	opServer;

var parser = null;
var bgpHeader = {};
bgpHeader['X-Tenant-Name'] = 'default-project';

opServer = rest.getAPIServer({apiName:global.label.OPS_API_SERVER, server:config.analytics.server_ip, port:config.analytics.server_port });

if (!module.parent) {
	logutils.logger.warn(util.format(messages.warn.invalid_mod_call, module.filename));
	process.exit(1);
}

/**
 * Populate JSON containing all BGP routers.
 * @param {Object} JSON to contain an array of BGP routers
 * @param {Array} Array of JSONs of BGP Routers
 */
function processBGPRJSON(bgpRoutersJSON, bgpJSONArray) {
	var i, bgpJSON, bgpType;
	for (i = 0; i < bgpJSONArray.length; i += 1) {
		bgpJSON = bgpJSONArray[i];
		if (bgpJSON != null) {
			bgpType = bgpJSON["bgp-router"]["_type"];
			bgpRoutersJSON["bgp-routers"][i]["name"] = bgpJSON["bgp-router"]["name"];
			bgpRoutersJSON["bgp-routers"][i]["type"] = bgpType;
			bgpRoutersJSON["bgp-routers"][i]["bgp_refs"] = adminApiHelper.getBGPRefNames(bgpJSON["bgp-router"]["bgp_router_refs"]);
			bgpRoutersJSON["bgp-routers"][i]["vendor"] = bgpJSON["bgp-router"]["bgp_router_parameters"].vendor;
			bgpRoutersJSON["bgp-routers"][i]["autonomous_system"] = bgpJSON["bgp-router"]["bgp_router_parameters"].autonomous_system;
			bgpRoutersJSON["bgp-routers"][i]["address"] = bgpJSON["bgp-router"]["bgp_router_parameters"].address;
			bgpRoutersJSON["bgp-routers"][i]["identifier"] = bgpJSON["bgp-router"]["bgp_router_parameters"].identifier;
			bgpRoutersJSON["bgp-routers"][i]["port"] = bgpJSON["bgp-router"]["bgp_router_parameters"].port;
			bgpRoutersJSON["bgp-routers"][i]["address_families"] = bgpJSON["bgp-router"]["bgp_router_parameters"].address_families;
		}
	}
}

/**
 * Add BGP Routers to result JSON (all control and compute nodes).
 * @param {Object} JSON to contain an array of control and compute nodes
 * @param {Array} Array of JSONs of BGP Routers
 * @param {Object} Contains name and type of Virtual Router
 */
function processBGPRandVRJSON(resultJSON, bgpJSONArray, vrMap) {
	var i, bgpJSON, bgpType, bgpName;
	for (i = 0; i < bgpJSONArray.length; i += 1) {
		bgpJSON = bgpJSONArray[i];
		if (bgpJSON != null) {
			bgpType = bgpJSON["bgp-router"]["_type"];
			bgpName = bgpJSON["bgp-router"]["name"];
			resultJSON["bgp-routers"][i]["name"] = bgpJSON["bgp-router"]["name"];
			if (bgpName in vrMap) {
				bgpType += ", " + vrMap[bgpName];
				delete vrMap[bgpName];
			}
			resultJSON["bgp-routers"][i]["type"] = bgpType;
			resultJSON["bgp-routers"][i]["bgp_refs"] = adminApiHelper.getBGPRefNames(bgpJSON["bgp-router"]["bgp_router_refs"]);
			resultJSON["bgp-routers"][i]["href"] = bgpJSON["bgp-router"].href;
			resultJSON["bgp-routers"][i]["id_perms"] = bgpJSON["bgp-router"]["id_perms"];
			resultJSON["bgp-routers"][i]["vendor"] = bgpJSON["bgp-router"]["bgp_router_parameters"].vendor;
			resultJSON["bgp-routers"][i]["autonomous_system"] = bgpJSON["bgp-router"]["bgp_router_parameters"].autonomous_system;
			resultJSON["bgp-routers"][i]["address"] = bgpJSON["bgp-router"]["bgp_router_parameters"].address;
			resultJSON["bgp-routers"][i]["identifier"] = bgpJSON["bgp-router"]["bgp_router_parameters"].identifier;
			resultJSON["bgp-routers"][i]["port"] = bgpJSON["bgp-router"]["bgp_router_parameters"].port;
			resultJSON["bgp-routers"][i]["address_families"] = bgpJSON["bgp-router"]["bgp_router_parameters"].address_families;
		}
	}
}

// Handle request to get a JSON of BGP Routers
adminapi.getBGPRouters = function (req, res, appData) {
	// TODO Replace by dynamic url.
	var url = '/bgp-routers?parent_fq_name_str=default-domain:default-project:ip-fabric:__default__';
	configApiServer.apiGet(url, appData, function (error, jsonData) {
		if (error) {
			commonUtils.handleJSONResponse(error, res, null);
		} else {
			try {
				var bgpJSON = jsonData,
					bgpCount = bgpJSON["bgp-routers"].length,
					i, uuid, url, 
                    dataObjArr = [];
				if (bgpCount != 0) {
					for (i = 0; i < bgpCount; i += 1) {
						uuid = bgpJSON["bgp-routers"][i].uuid;
						url = '/bgp-router/' + uuid;
                        commonUtils.createReqObj(dataObjArr, [url],
                                                 global.HTTP_REQUEST_GET, null,
                                                 null, null, appData);
						logutils.logger.debug("getBGPRouters: " + url);
						delete bgpJSON["bgp-routers"][i]["fq_name"];
					}
                    async.map(dataObjArr,
                              commonUtils.getAPIServerResponse(configApiServer.apiGet,
                                                               true),
                              function(err, results) {
						if (!err) {
							processBGPRJSON(bgpJSON, results)
							commonUtils.handleJSONResponse(null, res, bgpJSON["bgp-routers"]);
						} else {
							commonUtils.handleJSONResponse(err, res, null);
						}
					});
				} else {
					commonUtils.handleJSONResponse(null, res, bgpJSON["bgp-routers"]);
				}
			} catch (e) {
				commonUtils.handleJSONResponse(e, res, null);
			}
		}
	});
};

function parseConfigControlNodeData (configControlNodeData)
{
    var resultJSON = [];
    try {
        var cnt = configControlNodeData.length;
        for (var i = 0; i < cnt; i++) {
            bgpJSON = configControlNodeData[i];
            resultJSON[i] = {};
            resultJSON[i]["type"] = "bgp-router";
            try {
                resultJSON[i]["bgp_refs"] =
                    adminApiHelper.getBGPRefNames(bgpJSON["bgp-router"]["bgp_router_refs"]);
            } catch(e) {
                resultJSON[i]["bgp_refs"] = [];
            }   
            try {
                resultJSON[i]["name"] =
                    commonUtils.getSafeDataToJSONify(bgpJSON["bgp-router"].name);
            } catch(e) {
                resultJSON[i]["name"] = global.RESP_DATA_NOT_AVAILABLE;
            } 
            try {
                resultJSON[i]["uuid"] =
                    commonUtils.getSafeDataToJSONify(bgpJSON["bgp-router"].uuid);
            } catch(e) {
                resultJSON[i]["uuid"] = global.RESP_DATA_NOT_AVAILABLE;
            } 
            try {
                resultJSON[i]["href"] =
                    commonUtils.getSafeDataToJSONify(bgpJSON["bgp-router"].href);
            } catch(e) {
                resultJSON[i]["href"] = global.RESP_DATA_NOT_AVAILABLE;
            }   
            try {
                resultJSON[i]["id_perms"] =
                    commonUtils.getSafeDataToJSONify(bgpJSON["bgp-router"]["id_perms"]);
            } catch(e) {
                resultJSON[i]["id_perms"] = global.RESP_DATA_NOT_AVAILABLE;
            }   
            try {
                resultJSON[i]["vendor"] =
                    bgpJSON["bgp-router"]["bgp_router_parameters"].vendor;
            } catch(e) {
                resultJSON[i]["vendor"] =
                    global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                 resultJSON[i]["autonomous_system"] =
                     commonUtils.getSafeDataToJSONify(bgpJSON["bgp-router"]["bgp_router_parameters"].autonomous_system);
            } catch(e) {
                 resultJSON[i]["autonomous_system"] = global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                 resultJSON[i]["address"] =
                     commonUtils.getSafeDataToJSONify(bgpJSON["bgp-router"]["bgp_router_parameters"].address);
            } catch(e) {
                 resultJSON[i]["address"] = global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                 resultJSON[i]["identifier"] =
                     commonUtils.getSafeDataToJSONify(bgpJSON["bgp-router"]["bgp_router_parameters"].identifier);
            } catch(e) {
                 resultJSON[i]["identifier"] = global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                 resultJSON[i]["port"] =
                     commonUtils.getSafeDataToJSONify(bgpJSON["bgp-router"]["bgp_router_parameters"].port);
            } catch(e) {
                 resultJSON[i]["port"] = global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                 resultJSON[i]["address_families"] =
                     commonUtils.getSafeDataToJSONify(bgpJSON["bgp-router"]["bgp_router_parameters"].address_families);
            } catch(e) {
                 resultJSON[i]["address_families"] = global.RESP_DATA_NOT_AVAILABLE;
            }
        }
    } catch(e) {
    }
    return resultJSON;
}

function getControlNodeDetailsFromConfig (req, res, appData)
{
    var url = '/bgp-routers';
    var dataObjArr = [];
    var resultJSON = [];

    configApiServer.apiGet(url, appData, function(err, bgpConfigList) {
        if (err || (null == bgpConfigList)) {
            commonUtils.handleJSONResponse(err, res, []);
            return;
        }
        try {
            var bgpList = bgpConfigList['bgp-routers'];
            var cnt = bgpList.length;
            for (var i = 0; i < cnt; i++) {
                reqUrl = '/bgp-router/' + bgpList[i]['uuid'];
                commonUtils.createReqObj(dataObjArr, reqUrl, null, null, 
                                         null, null, appData);
            }
            async.map(dataObjArr,
                      commonUtils.getAPIServerResponse(configApiServer.apiGet, true),
                      function(err, data) {
                resultJSON = parseConfigControlNodeData(data);        
                commonUtils.handleJSONResponse(err, res, resultJSON);
            });
        } catch(e) {
            commonUtils.handleJSONResponse(err, res, resultJSON);
        }
    });
}

// Handle request to get a JSON of BGP Router with given id.
adminapi.getBGPRouter = function (req, res, appData) {
	var id = req.param('id');
	var url = '/bgp-router/' + id;
	configApiServer.apiGet(url, appData, function (error, bgpConfigJSON) {
		commonUtils.handleJSONResponse(error, res, bgpConfigJSON);
	});
};

// Handle request to create a BGP Router.
adminapi.createBGPRouter = function (req, res, appData) {
	var content = req.param('content'),
		url = '/bgp-routers',
		bgpRefs = content["bgp-router"]["bgp_router_refs"],
		type = content["bgp-router"]["_type"],
		parentName = content["bgp-router"]["parent_name"],
		bgpParams = content["bgp-router"]["bgp_router_parameters"];
	logutils.logger.debug("createBGPRouter JSON: " + JSON.stringify(content));
	delete content["bgp-router"]["bgp_router_refs"];
		configApiServer.apiPost(url, content, appData, function (error, data) {
			if (!error) {
				data["bgp-router"]["bgp_router_refs"] = bgpRefs ? bgpRefs : [];
				data["bgp-router"]["_type"] = type;
				data["bgp-router"]["parent_name"] = parentName;
				data["bgp-router"]["bgp_router_parameters"] = bgpParams;
				logutils.logger.debug("createBGPRouter Response: " + JSON.stringify(data));
				updateBGPRouterInternal(req, res, data["bgp-router"].uuid, data,
                                        appData);
			} else {
				error = new appErrors.RESTServerError(messages.error.create_bgpr);
				commonUtils.handleJSONResponse(error, res, null);
			}
		}, bgpHeader);
};

/**
 * Update a BGP Router.
 * @param {Object} JSON of updated BGP Router
 */
function updateBGPRouter(bgpJSON, appData) {
	var updateUUID = bgpJSON["bgp-router"].uuid;
	var updateURL = '/bgp-router/' + updateUUID;
	configApiServer.apiPut(updateURL, bgpJSON, appData, function (error) {
		if (error) {
			logutils.logger.error(e.stack);
			// TODO: On error all changes should be rolled back.
		}
	}, bgpHeader);
}

/**
 * Add a BGP Router peer.
 * @param {number} uuid of BGP Router to which peer should be added
 * @param {Object} JSON of BGP peer
 */
function addBGPPeer(uuid, bgpPeerObj, appData) {
	var url = '/bgp-router/' + uuid;
	configApiServer.apiGet(url, appData, function (error, bgpJSON) {
		if (error) {
			logutils.logger.error(error.stack);
			// TODO: On error all changes should be rolled back.
		} else {
			var bjpPeers = bgpJSON["bgp-router"]["bgp_router_refs"],
				updateRequired,
				i;
			if (bjpPeers) {
				updateRequired = true;
				for (i = 0; i < bjpPeers.length; i += 1) {
					if (bjpPeers[i]["to"] == bgpPeerObj["to"]) {
						updateRequired = false;
						break;
					}
				}
				if (updateRequired) {
					bgpJSON["bgp-router"]["bgp_router_refs"][bjpPeers.length] = bgpPeerObj;
					updateBGPRouter(bgpJSON, appData);
				}
			} else {
				bgpJSON["bgp-router"]["bgp_router_refs"] = [bgpPeerObj];
				updateBGPRouter(bgpJSON, appData);
			}
		}
	});
}

// TODO: Implement function to delete BGP reference from peer
function deleteBGPRefFromPeer() {
}

/**
 * Update BGP Router.
 * @param {Object} JSON of BGP Router
 * @param {Object} JSON of updates to BGP Router
 */
function updateBGPJSON(bgpJSON, bgpUpdates) {
	bgpJSON["bgp-router"]["name"] = bgpUpdates["bgp-router"]["name"];
	bgpJSON["bgp-router"]["bgp_router_parameters"].autonomous_system = bgpUpdates["bgp-router"]["bgp_router_parameters"].autonomous_system;
	bgpJSON["bgp-router"]["bgp_router_parameters"].address = bgpUpdates["bgp-router"]["bgp_router_parameters"].address;
	bgpJSON["bgp-router"]["bgp_router_parameters"].identifier = bgpUpdates["bgp-router"]["bgp_router_parameters"].identifier;
	bgpJSON["bgp-router"]["bgp_router_parameters"]["address_families"] = bgpUpdates["bgp-router"]["bgp_router_parameters"]["address_families"];
	bgpJSON["bgp-router"]["bgp_router_parameters"].vendor = bgpUpdates["bgp-router"]["bgp_router_parameters"].vendor;
	bgpJSON["bgp-router"]["bgp_router_parameters"].port = bgpUpdates["bgp-router"]["bgp_router_parameters"].port;
	var bgpRefs = bgpJSON["bgp-router"]["bgp_router_refs"],
		newBGPRefs = bgpUpdates["bgp-router"]["bgp_router_refs"];
	if (!newBGPRefs || newBGPRefs.length == 0) {
		bgpJSON["bgp-router"]["bgp_router_refs"] = [];
	} else {
		if (!bgpRefs || bgpRefs.length == 0) {
			bgpJSON["bgp-router"]["bgp_router_refs"] = bgpUpdates["bgp_router_refs"];
		} else {
			var newBGPRefNames = {},
				bgpRefNames = {},
				spliceArray = [],
				newPeers = [],
				i;

			for (i = 0; i < newBGPRefs.length; i += 1) {
				var toArray = newBGPRefs[i].to;
				newBGPRefNames[toArray[toArray.length - 1]] = newBGPRefs.href;
			}

			for (i = 0; i < bgpRefs.length; i += 1) {
				var toArray = bgpRefs[i].to;
				bgpRefNames[toArray[toArray.length - 1]] = bgpRefs.href;
			}

			for (i = 0; i < bgpRefs.length; i += 1) {
				var toArray = bgpRefs[i].to;
				var peerName = toArray[toArray.length - 1];
				if (!(peerName in newBGPRefNames)) {
					spliceArray[spliceArray.length] = i;
					deleteBGPRefFromPeer(); // TODO: Implement
				}
			}

			for (i = 0; i < newBGPRefs.length; i += 1) {
				var toArray = newBGPRefs[i].to;
				if (!(toArray[toArray.length - 1] in bgpRefNames)) {
					var newPeer = {};
					newPeer["to"] = newBGPRefs[i].to
					newPeer["href"] = newBGPRefs[i].href
					newPeer["attr"] = global.EMPTY_BGP_PEER_ATTR_JSON;
					newPeers[newPeers.length] = newPeer;
				}
			}

			for (i = 0; i < spliceArray.length; i += 1) {
				var spliceIndex = spliceArray[i];
				(bgpJSON["bgp-router"]["bgp_router_refs"]).splice(spliceIndex - i, 1);
			}

			for (i = 0; i < newPeers.length; i += 1) {
				var length = bgpJSON["bgp-router"]["bgp_router_refs"].length
				bgpJSON["bgp-router"]["bgp_router_refs"][length] = newPeers[i];
			}
		}
	}
}

/**
 * Handle request to update a BGP Router.
 * @param {Object} HTTP Request
 * @param {Object} HTTP Response
 * @param {number} UUID of BGP Router
 * @param {Object} JSON of updates to BGP Router
 */
function updateBGPRouterInternal(req, res, id, bgpUpdates, appData) {
	var url = '/bgp-router/' + id;
	logutils.logger.debug("updateBGPRouter: " + url);
		configApiServer.apiGet(url, appData, function (error, bgpJSON) {
			if (error) {
				commonUtils.handleJSONResponse(error, res, null);
			} else {
				updateBGPJSON(bgpJSON, bgpUpdates);
				logutils.logger.debug("updateBGPRouter JSON: " + JSON.stringify(bgpJSON));
				configApiServer.apiPut(url, bgpJSON, appData, function (error, data) {
					if (error) {
						error = new appErrors.RESTServerError(messages.error.update_bgpr);
						commonUtils.handleJSONResponse(error, res, null);
					} else {
						try {
							var bgpPeers = bgpUpdates["bgp-router"]["bgp_router_refs"];
							if (bgpPeers) {
								var bgpPeerObj = {};
								//bgpPeerObj["uuid"] = content["bgp-router"].uuid;
								bgpPeerObj["to"] = bgpUpdates["bgp-router"]["fq_name"];
								bgpPeerObj["href"] = bgpUpdates["bgp-router"].href;
								bgpPeerObj["attr"] = global.EMPTY_BGP_PEER_ATTR_JSON;
								for (var i = 0; i < bgpPeers.length; i++) {
									addBGPPeer(bgpPeers[i].uuid, bgpPeerObj,
                                               appData);
								}
							}
						} catch (e) {
							logutils.logger.error(e.stack);
							// TODO: On error all changes should be rolled back.s
						}
						commonUtils.handleJSONResponse(null, res, data);
					}
				}, bgpHeader);
			}
		});
}

// Handle request to update a BGP Router.
adminapi.updateBGPRouter = function (req, res, appData) {
	var id = req.param('id');
	var bgpUpdates = req.param('content');
	updateBGPRouterInternal(req, res, id, bgpUpdates, appData);
};

// Handle request to get JSON of all analysers.
adminapi.getAnalyzers = function (req, res) {
	var url = '/analyzers';
	logutils.logger.debug('getAnalyzers: ' + url);
	opServer.authorize(function () {
		opServer.api.get(url, function (error, data) {
			if (error) {
				commonUtils.handleResponse(error, res, '');
			} else {
				commonUtils.handleJSONResponse(null, res, data['analyzers']);
			}
		});
	});
};

// Handle request to get JSON of an analyzer with a given name.
adminapi.getAnalyzer = function (req, res) {
	var name = req.param('name'),
		url = '/analyzers?name=' + name,
		mirrorUrls = [],
		mUrl, mirrorsJSON;
	logutils.logger.debug('getAnalyzer: ' + url);
	opServer.authorize(function () {
		opServer.api.get(url, function (error, analyzerJSON) {
			if (error) {
				commonUtils.handleResponse(error, res, '');
			} else {
				mirrorsJSON = analyzerJSON.analyzer.mirrors;
				for (i = 0; i < mirrorsJSON.length; i += 1) {
					mUrl = '/mirrors?name=' + mirrorsJSON[i].name;
					logutils.logger.debug('getMirror: ', mUrl);
					mirrorUrls[i] = mUrl;
				}
				async.map(mirrorUrls, commonUtils.getJsonViaInternalApi(opServer.api, true), function (err, results) {
					var i;
					if (!err) {
						for (i = 0; i < mirrorsJSON.length; i += 1) {
							mirrorsJSON[i] = results[i].mirror;
						}
						commonUtils.handleJSONResponse(null, res, mirrorsJSON);
					} else {
						commonUtils.handleJSONResponse(err, res);
					}
				});
			}
		});
	});
};

// Handle request to get JSON of all mirrors.
adminapi.getMirrors = function (req, res) {
	var url = '/mirrors';
	logutils.logger.debug('getMirrors: ' + url);
	opServer.authorize(function () {
		opServer.api.get(url, function (error, data) {
			if (error) {
				commonUtils.handleResponse(error, res, '');
			} else {
				commonUtils.handleJSONResponse(null, res, data['mirrors']);
			}
		});
	});
};

// Handle request to get JSON of a mirror with a given name.
adminapi.getMirror = function (req, res) {
	var name = req.param('name');
	var url = '/mirrors?name=' + name;
	logutils.logger.debug('getMirror: ' + url);
	opServer.authorize(function () {
		opServer.api.get(url, function (error, data) {
			if (error) {
				commonUtils.handleResponse(error, res, '');
			} else {
				commonUtils.handleJSONResponse(null, res, data);
			}
		});
	});
};

// Handle request to add analyser.
adminapi.addAnalyzer = function (req, res) {
	var analyzerName = req.param('analyzerName');
	var url = '/request-analyzer/' + analyzerName;
	logutils.logger.debug("addAnalyser: " + url);
	opServer.authorize(function () {
		opServer.api.get(url, function (error, data) {
			if (error || data['status'] != "pass") {
				if (data && data['error']) {
					error = new appErrors.RESTServerError(data['error']);
				} else {
					error = new appErrors.RESTServerError(messages.error.add_analyzer);
				}
				commonUtils.handleResponse(error, res, '');
			} else {
				commonUtils.handleJSONResponse(null, res, data);
			}
		});
	});
};

// Handle request to delete analyzer.
adminapi.deleteAnalyzer = function (req, res) {
	var analyzerName = req.param('name');
	var url = '/delete-analyzer/' + analyzerName;
	logutils.logger.debug("deleteAnalyzer: " + url);
	opServer.authorize(function () {
		opServer.api.get(url, function (error, data) {
			if (error || data['status'] != "pass") {
				if (data && data['error']) {
					error = new appErrors.RESTServerError(data['error']);
				} else {
					error = new appErrors.RESTServerError(messages.error.delete_analyzer);
				}
				commonUtils.handleResponse(error, res, '');
			} else {
				commonUtils.handleJSONResponse(null, res, data);
			}
		});
	});
};

/**
 * Validate parameters to create mirror request
 * @param {Object} Request Query Object
 */
function validateAddMirrorReq(reqQuery) {
	var applyIPs = reqQuery['apply_ips'],
		srcDstIPs = reqQuery['src_dst_ips'],
		applyPorts = reqQuery['apply_ports'],
		srcDstPorts = reqQuery['src_dst_ports'],
		direction = reqQuery['direction'],
		srcDstVN = reqQuery['src_dst_vn'],
		applyIPParams, srcDstIPParams, applyPortParam, srcDstPortParam;

	if (direction) {
		if (direction == 'from') {
			reqQuery['src_vn'] = srcDstVN;
			if (applyIPs && applyIPs.indexOf('/') != -1) {
				applyIPParams = applyIPs.split('/');
				reqQuery['dst_ip_prefix'] = applyIPParams[0];
				reqQuery['dst_ip_prefix_len'] = applyIPParams[1];
			} else {
				reqQuery['dst_ip_prefix'] = applyIPs;
			}

			if (applyPorts && applyPorts.indexOf('-') != -1) {
				applyPortParam = applyPorts.split('-');
				reqQuery['start_dst_port'] = applyPortParam[0];
				reqQuery['end_dst_port'] = applyPortParam[1];
			} else {
				reqQuery['start_dst_port'] = applyPorts;
			}

			if (srcDstPorts && srcDstPorts.indexOf('-') != -1) {
				srcDstPortParam = srcDstPorts.split('-');
				reqQuery['start_src_port'] = srcDstPortParam[0];
				reqQuery['end_src_port'] = srcDstPortParam[1];
			} else {
				reqQuery['start_src_port'] = srcDstPorts;
			}

			if (srcDstIPs && srcDstIPs.indexOf('/') != -1) {
				srcDstIPParams = srcDstIPs.split('/');
				reqQuery['src_ip_prefix'] = srcDstIPParams[0];
				reqQuery['src_ip_prefix_len'] = srcDstIPParams[1];
			} else {
				reqQuery['src_ip_prefix'] = srcDstIPs;
			}
		} else {
			reqQuery['dst_vn'] = srcDstVN;
			if (applyIPs && applyIPs.indexOf('/') != -1) {
				applyIPParams = applyIPs.split('/');
				reqQuery['src_ip_prefix'] = applyIPParams[0];
				reqQuery['src_ip_prefix_len'] = applyIPParams[1];
			} else {
				reqQuery['src_ip_prefix'] = applyIPs;
			}

			if (applyPorts && applyPorts.indexOf('-') != -1) {
				applyPortParam = applyPorts.split('-');
				reqQuery['start_src_port'] = applyPortParam[0];
				reqQuery['end_src_port'] = applyPortParam[1];
			} else {
				reqQuery['start_src_port'] = applyPorts;
			}

			if (srcDstPorts && srcDstPorts.indexOf('-') != -1) {
				srcDstPortParam = srcDstPorts.split('-');
				reqQuery['start_dst_port'] = srcDstPortParam[0];
				reqQuery['end_dst_port'] = srcDstPortParam[1];
			} else {
				reqQuery['start_dst_port'] = srcDstPorts;
			}

			if (srcDstIPs && srcDstIPs.indexOf('/') != -1) {
				srcDstIPParams = srcDstIPs.split('/');
				reqQuery['dst_ip_prefix'] = srcDstIPParams[0];
				reqQuery['dst_ip_prefix_len'] = srcDstIPParams[1];
			} else {
				reqQuery['dst_ip_prefix'] = srcDstIPs;
			}
		}
	}
};

// Handle request to add mirror.
adminapi.addMirror = function (req, res) {
	var mirrorName = req.param('mirror_name'),
		url;
	validateAddMirrorReq(req.query);
	url = '/request-mirroring/' + mirrorName + '?' + qs.stringify(req.query);
	logutils.logger.debug("addMirror: " + url);
	opServer.authorize(function () {
		opServer.api.get(url, function (error, data) {
			if (error || data['status'] != "pass") {
				if (data && data['error']) {
					error = new appErrors.RESTServerError(data['error']);
				} else {
					error = new appErrors.RESTServerError(messages.error.add_mirror);
				}
				commonUtils.handleResponse(error, res, '');
			} else {
				commonUtils.handleJSONResponse(null, res, data);
			}
		});
	});
};

// Handle request to delete mirror.
adminapi.deleteMirror = function (req, res) {
	var mirrorName = req.param('name');
	var url = '/delete-mirroring/' + mirrorName;
	logutils.logger.debug("deleteMirror: " + url);
	opServer.authorize(function () {
		opServer.api.get(url, function (error, data) {
			if (error || data['status'] != "pass") {
				if (data && data['error']) {
					error = new appErrors.RESTServerError(data['error']);
				} else {
					error = new appErrors.RESTServerError(messages.error.delete_mirror);
				}
				commonUtils.handleResponse(error, res, '');
			} else {
				commonUtils.handleJSONResponse(null, res, data);
			}
		});
	});
};

// Handle request to get a JSON of all virtual networks.
adminapi.getAllVNs = function (req, res, appData) {
	var url, resultJSON = {"virtual-networks":[]};
	url = "/projects";
	configApiServer.apiGet(url, appData, function (error, jsonData) {
		if (error) {
			commonUtils.handleJSONResponse(error, res, null);
		} else {
			try {
				var projectsJSON = jsonData,
					i, fq_name, url,
                    dataObjArr = [];
				for (i = 0; i < projectsJSON.projects.length; i += 1) {
					fq_name = projectsJSON.projects[i].fq_name;
					url = '/virtual-networks?parent_type=project&parent_fq_name_str=' + fq_name.join(':');
					logutils.logger.debug('getNetworks4Domain: ', url);
                    commonUtils.createReqObj(dataObjArr, url,
                                             global.HTTP_REQUEST_GET, null,
                                             null, null, appData);
				}
                async.map(dataObjArr,
                          commonUtils.getAPIServerResponse(configApiServer.apiGet,
                                                           true),
                          function(err, results) {
					var i, vnsJSON;
					if (!err) {
						for (i = 0; i < projectsJSON.projects.length; i += 1) {
							resultJSON['virtual-networks'] = resultJSON['virtual-networks'].concat(results[i]['virtual-networks']);
						}
						commonUtils.handleJSONResponse(null, res, resultJSON);
					} else {
						commonUtils.handleJSONResponse(err, res);
					}
				});
			} catch (error) {
				commonUtils.handleJSONResponse(error, res, null);
			}
		}
	});
};

/**
 * @updateGlobalASNPutBgpNodes
 *  Update ASN on all Contrail BGP Nodes
 */
function updateGlobalASNPutBgpNodes (error, bgpNodes, globalASN, response,
                                     appData)
{
    var url          = null;
    var bgpNodeRef   = [];
    var bgpNodeCount = [], i = 0, j = 0;
    var dataObjArr   = [];

    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (!(bgpNodeCount = bgpNodes.length)) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    for (i = 0; i < bgpNodeCount; i++) {
        bgpNodeRef = bgpNodes[i]['bgp-router'];
        if (('bgp_router_parameters' in bgpNodeRef) &&
            ((!('vendor' in bgpNodeRef['bgp_router_parameters'])) ||
             (!(bgpNodeRef['bgp_router_parameters']['vendor'])) ||
             bgpNodeRef['bgp_router_parameters']['vendor'].toLowerCase ===
                'contrail')) {
            bgpNodes[i]['bgp-router']['bgp_router_parameters']
                      ['autonomous_system'] = parseInt(globalASN);
            url = '/bgp-router/' + bgpNodeRef['uuid'];
            commonUtils.createReqObj(dataObjArr, url,
                                     global.HTTP_REQUEST_PUT, bgpNodes[i], null, null,
                                     appData);
            j++;
        }
    }

    if (j < 1) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }
    async.map(dataObjArr,
              commonUtils.getAPIServerResponse(configApiServer.apiPut,
                                               false),
              function(error, results) {
        if (error) {
            commonUtils.handleJSONResponse(error, response, null);
            return;
        } else {
            commonUtils.handleJSONResponse(error, response, null);
            return;
        }
    });
}

/**
 * @updateGlobalASNGetBgpNodes
 *  Get individual BGP Nodes 
 */
function updateGlobalASNGetBgpNodes(error, bgpNodeList, globalASN, response,
                                    appData)
{
    var url        = null;
    var dataObjArr = [];
    var bgpNodeRef = [];
    var bgpNodeCount = [], i = 0;

    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (!(bgpNodeCount = bgpNodeList['bgp-routers'].length)) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    for (i = 0; i < bgpNodeCount; i++) {
        bgpNodeRef = bgpNodeList['bgp-routers'][i];
        url = '/bgp-router/' + bgpNodeRef['uuid'];
        commonUtils.createReqObj(dataObjArr, url, global.HTTP_REQUEST_GET,
                                 null, null, null, appData);
    }

    async.map(dataObjArr,
              commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
              function(error, results) {
              updateGlobalASNPutBgpNodes(error, results, globalASN, response,
                                         appData)
    });
}

/**
 * @updateGlobalASNGetBgpNodeList
 *  Get list of BGP Nodes
 */
function updateGlobalASNGetBgpNodeList (error, data,
                                        globalASN, response, appData)
{
    var bgpListURL = '/bgp-routers?parent_fq_name_str=' +
                     'default-domain:default-project:ip-fabric:__default__';

    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    configApiServer.apiGet(bgpListURL, appData,
    function(error, data) {
        updateGlobalASNGetBgpNodes(error, data, globalASN, response, appData)
    });
}

/**
 * @updateGlobalConfigObj
 *  Update the ASN
 */
function updateGlobalConfigObj (error, data,
                                globalASNBody, response, appData)
{
    var gscURL = '/global-system-config/';
    var gASN   = null;

    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    gASN = globalASNBody['global-system-config']['autonomous_system'] ;
    data['global-system-config']['autonomous_system'] = gASN;

    gscURL += data['global-system-config']['uuid'];

    configApiServer.apiPut(gscURL, data, appData,
    function(error, data) {
        setTimeout(function() {
            commonUtils.handleJSONResponse(error, response, null);
        }, 3000);
    });
}

/**
 * @getGlobalConfigObj
 * private function
 * Gets the GSC Object
 */
function getGlobalConfigObj (error, data, globalASNBody, response, appData) {
    var gscURL = '/global-system-config/';

    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    gscURL += data['uuid'];

    configApiServer.apiGet(gscURL, appData,
                         function(error, data) {
                         updateGlobalConfigObj(error, data,
                                               globalASNBody, response, appData)
                         });
}

/**
 * @updateGlobalASN
 * public function
 * 1. URL /api/tenants/admin/config/global-asn
 * 2. Updates Global ASN
 */
function updateGlobalASN (request, response, appData) {
    var globalASNBody = request.body;
    var fqnameURL     = '/fqname-to-id';
    var gscReqBody    = null;

    gscReqBody = {'fq_name': ['default-global-system-config'],
                  'type': 'global-system-config'};
    configApiServer.apiPost(fqnameURL, gscReqBody, appData,
                         function(error, data) {
                         getGlobalConfigObj(error, data,
                                            globalASNBody, response, appData);
                         });
}

/**
 * @readGlobalConfigObj
 * private function
 * Gets the GSC Object
 */
function readGlobalConfigObj (error, data, globalASNBody, response, appData) {
    var gscURL = '/global-system-config/';
    var gscObj = {};  

    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    gscURL += data['uuid'];

    configApiServer.apiGet(gscURL, appData,
    function(error, data) {
        if (error) {
            commonUtils.handleJSONResponse(error, response, null);
            return;
        } else {
            gscObj = {'global-system-config':{
                      '_type': 'global-system-config',
                      'uuid': data['global-system-config']
                                  ['uuid'],
                      'autonomous_system':data['global-system-config']
                                  ['autonomous_system']}
            };
            commonUtils.handleJSONResponse(error, response, gscObj);
            return;
        }
    });
}

/**
 * @getGlobalASN
 * public function
 * 1. URL /api/tenants/admin/config/global-asn
 * 2. Gets the  Global ASN
 */
function getGlobalASN (request, response, appData) {
    var globalASNBody = request.body;
    var fqnameURL     = '/fqname-to-id';
    var gscReqBody    = null;

    gscReqBody = {'fq_name': ['default-global-system-config'],
                  'type': 'global-system-config'};
    configApiServer.apiPost(fqnameURL, gscReqBody, appData,
                         function(error, data) {
                         readGlobalConfigObj(error, data,
                                             globalASNBody, response, appData)
                         });
}

/**
 * @deleteBgpConfig
 * private function
 * Delete the bgp config object
 */
function deleteBgpConfig (error, bgpId, response, appData)
{
    var url = '/bgp-router/' + bgpId;

    if (error) {
        error = new appErrors.RESTServerError(messages.error.delete_bgpr);
        commonUtils.handleResponse(error, response, null);
        return;
    }

    configApiServer.apiDelete(url, appData, function (error, data) {
        if (error) {
            error = new appErrors.RESTServerError(messages.error.delete_bgpr);
        }
        commonUtils.handleResponse(error, response, data);
    });
}

/**
 * @deleteBgpVRoutersUpdate
 * private function
 * Remove bgp ref of the deleted bgp from each peer.
 */
function deleteBgpVRoutersUpdate (error, vRouterNodeList,
                                  bgpConfig, bgpId, response, appData)
{
    var url                 = null;
    var dataObjArr          = []
    var vRouterRef          = [];
    var vRouterRouterRef    = [];
    var vRouterRefLen = 0;
    var vRouterNodeCount = 0, i = 0, j = 0, k = 0;

    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (!(vRouterNodeCount = vRouterNodeList.length)) {
        deleteBgpConfig(error, bgpId, response, appData);
        return;
    }

    for (i = 0; i < vRouterNodeCount; i++) {
        vRouterRef = vRouterNodeList[i]['virtual-router'];
        if ((!('bgp_router_refs' in vRouterRef)) ||
            (!(vRouterRouterRefLen = vRouterRef['bgp_router_refs'].length))) {
            continue;
        }

        for (j = 0; j < vRouterRouterRefLen; j++) {
            if (vRouterRef['bgp_router_refs'][j]['uuid'] == bgpId) {
                vRouterRef['bgp_router_refs'].splice(j, 1);
                url = '/virtual-router/' + vRouterRef['uuid'];
                commonUtils.createReqObj(dataObjArr, url,
                                         global.HTTP_REQUEST_PUT,
                                         vRouterNodeList[i], null,
                                         null, appData);
                break;
            }
        }
    }
    
    async.map(dataObjArr,
              commonUtils.getAPIServerResponse(configApiServer.apiPut, false),
              function(error, results) {
              deleteBgpConfig(error, bgpId, response, appData)
    });
}

/**
 * @deleteBgpVRoutersRead
 * private function
 * Gets each vRouter for the bgp object that is being deleted.
 */
function deleteBgpVRoutersRead (error, bgpConfig, bgpId, response, appData)
{
    var dataObjArr   = [];
    var vRoutersRef  = [];
    var vRouterRefLen = 0, i = 0;
    var url = null;

    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (!('virtual_router_back_refs' in bgpConfig['bgp-router'])) {
        deleteBgpConfig(error, bgpId, response, appData);
        return;
    }

    vRoutersRef = bgpConfig['bgp-router']['virtual_router_back_refs'];
    vRoutersRefLen = vRoutersRef.length;

    for (i = 0; i < vRoutersRefLen; i++) {
        url = '/virtual-router/' + vRoutersRef[i]['uuid'];
        commonUtils.createReqObj(dataObjArr, url, global.HTTP_REQUEST_GET, 
                                 null, null, null, appData);

    }

    async.map(dataObjArr,
              commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
              function(error, results) {
              deleteBgpVRoutersUpdate(error, results, bgpConfig, bgpId,
                                      response, appData)
    });
} 

/**
 * @deleteBgpPeersUpdate
 * private function
 * Remove bgp ref of the deleted bgp from each peer.
 */
function deleteBgpPeersUpdate (error, bgpNodeList, bgpConfig, bgpId, response,
                               appData)
{
    var url             = null;
    var dataObjArr      = [];
    var bgpArray        = []
    var bgpRef          = [];
    var bgpRouterRef    = [];
    var bgpRouterRefLen = 0;
    var bgpNodeCount = 0, i = 0, j = 0, k = 0;;

    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (!(bgpNodeCount = bgpNodeList.length)) {
        deleteBgpVRoutersRead(error, bgpConfig, bgpId, response, appData);
        return;
    }

    for (i = 0; i < bgpNodeCount; i++) {
        bgpRef = bgpNodeList[i]['bgp-router'];
        if ((!('bgp_router_refs' in bgpRef)) ||
            (!(bgpRouterRefLen = bgpRef['bgp_router_refs'].length))) {
            continue;
        }

        for (j = 0; j < bgpRouterRefLen; j++) {
            if (bgpRef['bgp_router_refs'][j]['uuid'] == bgpId) {
                bgpRef['bgp_router_refs'].splice(j, 1);
                bgpArray.push({reqUrl: '/bgp-router/' + bgpRef['uuid'],
                               data: bgpNodeList[i]});
                url = '/bgp-router/' + bgpRef['uuid'];
                commonUtils.createReqObj(dataObjArr, url,
                                         global.HTTP_REQUEST_PUT, bgpNodeList[i], 
                                         null, null, appData);
                break;
            }
        }
    }

    async.map(dataObjArr,
              commonUtils.getAPIServerResponse(configApiServer.apiPut, false),
              function(error, results) {
              deleteBgpVRoutersRead(error, bgpConfig, bgpId, response, appData);
    });
}

/**
 * @deleteBgpPeersRead
 * private function
 * Gets each Peer object for the bgp object that is being deleted.
 */
function deleteBgpPeersRead (error, bgpConfig, bgpId, response, appData)
{
    var url = null;
    var dataObjArr = [];
    var peerRef  = [];
    var peerRefLen = 0, i = 0;

    if (error) {
        commonUtils.handleJSONResponse(error, response, null);
        return;
    }

    if (!('bgp_router_refs' in bgpConfig['bgp-router'])) {
        deleteBgpVRoutersRead(error, bgpConfig, bgpId, response, appData);
        return;
    }

    peerRef = bgpConfig['bgp-router']['bgp_router_refs'];
    peerRefLen = peerRef.length;

    for (i = 0; i < peerRefLen; i++) {
        url = '/bgp-router/' + peerRef[i]['uuid'];
        commonUtils.createReqObj(dataObjArr, url,
                                 global.HTTP_REQUEST_GET, null, null, null,
                                 appData);
    }

    async.map(dataObjArr,
              commonUtils.getAPIServerResponse(configApiServer.apiGet, false),
              function(error, results) {
              deleteBgpPeersUpdate(error, results, bgpConfig, bgpId, response,
                                   appData);
    });
}

/**
 * @deleteBGPRouter
 * public function
 * Gets the bgp object, reads it peers and removes
 * references from each peer and the deletes the bgp
 * object.
 */

function deleteBGPRouter (request, response, appData)
{
    var id = request.param('id');
    var url = '/bgp-router/' + id;

    configApiServer.apiGet(url, appData,
                         function(error, data) {
                         deleteBgpPeersRead(error, data, id.toString(),
                                            response, appData)
                         });
};

function getWebConfigValueByName (req, res, appData)
{
    var type = req.param('type'),
        variable = req.param('variable'),
        configObj = {}, value;
    if(type != null && variable != null) {
        value = ((config[type]) && (config[type][variable])) ? config[type][variable] : null;
        configObj[variable] = value;
    }
    commonUtils.handleJSONResponse(null, res, configObj);
}

function getMatchStrByType (type)
{
    switch (type) {
    case 'network-policy':
        return 'network_policys';
    case 'virtual-network':
        return 'virtual_networks';
    case 'network-ipam':
        return 'network_ipams';
    case 'floating-ip-pool':
        return 'floating_ip_pool_refs';
    case 'security-group':
        return 'security_groups';
    case 'floating-ip':
        return 'floating_ip_back_refs'
    default:
        return null;
    }
}

function getParentByReqType (type)
{
    switch (type) {
    case 'virtual-DNS-record':
        return 'virtual-DNS';
    default:
        return 'project';
    }
}

function isParentProject (type) {
    switch (type) {
    case 'virtual-DNS-record':
    case 'service-template':
	case 'virtual-DNS':
        return false;
    default:
        return true;
    }
}

function createReqArrByType (dataObjArr, type, obj)
{
    switch(type) {
    case 'virtual-network':
    case 'floating-ip':
    case 'network-policy':
    case 'network-ipam':
    case 'virtual-DNS':
    case 'virtual-DNS-record':
        dataObjArr.push({uuid: obj['uuid'], appData: obj['appData']});
        break;
    default:
        break;
    }
}

var configCBList = 
{
    'virtual-network': vnConfig.readVirtualNetworks,
    'network-policy': polConfig.readPolicys,
    'network-ipam': ipamConfig.readIpams,
    'virtual-DNS': vdnsConfig.readVirtualDNSs,
    'virtual-DNS-record': vdnsConfig.readVirtualDNSRecords,
    'service-template': svcTempl.getServiceTemplates,
    'floating-ip': fipConfig.listFloatingIpsAsync
}

function getConfigCallbackByType (type)
{
    return configCBList[type];
}

var filterCBList =
{
    'service-template': svcTempl.filterDefAnalyzerTemplate
}

function filterConfigListApi (type)
{
    return filterCBList[type];
}

function getApiServerDataByPage (req, res, appData)
{
    var count = req.query['count'];
    var lastKey = req.query['lastKey'];
    var type = req.query['type'];
    var fqnUUID = req.query['fqnUUID'];
    var resultJSON = [];
    var retLastKey = null;
    var found = false;
    var dataObjArr = [];
    var reqDataObjArr = [];
    var configListData = null;

    var matchStr = type + 's';
    var url = '/' + matchStr;
    var keyStr = 'uuid';

    if (null == count) {
        count = -1;
    } else {
        count = parseInt(count);
    }
    if (null != fqnUUID) {
        switch (type) {
        case 'virtual-DNS-record':
            url = '/virtual-DNS/' + fqnUUID;
            break;
        case 'service-template':
            url = '/domain/' + fqnUUID;
            matchStr = 'service_templates';
            break;
        case 'virtual-DNS':
            url = '/domain/' + fqnUUID;
            matchStr = 'virtual_DNSs';
            break;
        default:
            url = '/project/' + fqnUUID;
            break;
        }
    }
    configApiServer.apiGet(url, appData, function(err, configList) {
        if (err || (null == configList)) {
            commonUtils.handleJSONResponse(err, res, resultJSON);
            return;
        }
        if ((null != fqnUUID) && (isParentProject(type))) {
            configList = configList['project'];
            matchStr = getMatchStrByType(type);
            if (null == matchStr) {
                err = new appErrors.RESTServerError('type not supported');
                commonUtils.handleJSONResponse(err, res, null);
                return;
            }
        }
        switch (type) {
        case 'virtual-DNS-record':
            try {
                configListData = configList['virtual-DNS']['virtual_DNS_records'];
            } catch(e) {
                configListData = null;
            }
            break;
        case 'service-template':
        case 'virtual-DNS':
            configListData = configList['domain'][matchStr];
            break;
        default:
            configListData = configList[matchStr];
            break;
        }
        if (null == configListData) {
            commonUtils.handleJSONResponse(err, res, resultJSON);
            return;
        }
        var filterCb = filterConfigListApi(type);
        if (null != filterCb) {
            configListData = filterCb(configListData);
        }

        configListData = nwMonUtils.sortEntriesByObj(configListData, keyStr);
        var index = nwMonUtils.getnThIndexByLastKey(lastKey, configListData, keyStr);
        if (index == -2) {
            commonUtils.handleJSONResponse(err, res, resultJSON);
            return;
        }
        var cnt = configListData.length;
        if (cnt == index) {
            /* We are already at end */
            commonUtils.handleJSONResponse(err, res, resultJSON);
            return;
        }
        if (-1 == count) {
            /* Show all the entries */
            totCnt = cnt;
        } else {
            var totCnt = index + 1 + count;
        }
        if (totCnt < cnt) {
            retLastKey = configListData[totCnt - 1][keyStr];
        }
        for (var i = index + 1, j = 0; i < totCnt; i++) {
            if (configListData[i]) {
                url = '/' + type + '/' + configListData[i][keyStr];
                commonUtils.createReqObj(dataObjArr, url, null, null, null,
                                         null, appData);
                createReqArrByType(reqDataObjArr, type,
                                   {uuid: configListData[i][keyStr],
                                    appData: appData, 
                                    dataObjArr: dataObjArr});
                found = true;
            }
        }
        if (false == found) {
            commonUtils.handleJSONResponse(err, res, resultJSON);
            return;
        }
        var callback = getConfigCallbackByType(type);
        if (null == callback) {
            async.map(dataObjArr,
                      commonUtils.getServerResponseByRestApi(configApiServer,
                                                             true),
                      function(err, result) {
                sendConfigPagedResponse(err, result, res, retLastKey);
            });
        } else {
            var dataObj = {};
            dataObj['configData'] = configList;
            dataObj['reqDataArr'] = reqDataObjArr;
            dataObj['dataObjArr'] = dataObjArr;
            callback(dataObj, function(err, result) {
                sendConfigPagedResponse(err, result, res, retLastKey);
            });
        }
    });
}

function sendConfigPagedResponse (err, data, res, retLastKey)
{
    var result = {};
    result['data'] = data;
    result['lastKey'] = retLastKey;
    if (null == retLastKey) {
        result['more'] = false;
    } else {
        result['more'] = true;
    }
    commonUtils.handleJSONResponse(err, res, result);
}

exports.updateGlobalASN = updateGlobalASN;
exports.getGlobalASN    = getGlobalASN;
exports.deleteBGPRouter = deleteBGPRouter;
exports.getControlNodeDetailsFromConfig = getControlNodeDetailsFromConfig;
exports.getApiServerDataByPage = getApiServerDataByPage;
exports.getWebConfigValueByName = getWebConfigValueByName;



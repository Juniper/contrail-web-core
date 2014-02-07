/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

var rest = require('../../common/rest.api'),
	config = require('../../../../config/config.global.js'),
	adminapi = module.exports,
	logutils = require('../../utils/log.utils'),
	commonUtils = require('../../utils/common.utils'),
	messages = require('../../common/messages'),
	global = require('../../common/global'),
	appErrors = require('../../errors/app.errors'),
	util = require('util'),
	async = require('async'),
	qs = require('querystring'),
	adminApiHelper = require('../../common/adminapi.helper'),
	jobsApi = require('../core/jobs.api'),
    configApiServer = require('../../common/configServer.api'),
	opServer;

bgpNode = module.exports;

opServer = rest.getAPIServer({apiName:global.label.OPS_API_SERVER, server:config.analytics.server_ip, port:config.analytics.server_port });

/**
 * Add BGP Routers to result JSON (all control and compute nodes).
 * @param {Object} JSON to contain an array of control and compute nodes
 * @param {Array} Array of JSONs of BGP Routers
 * @param {Object} Contains name and type of Virtual Router
 */
function processBGPRandVRJSON(resultJSON, bgpJSONArray, vrMap)
{
	var i, bgpJSON, bgpType, bgpName;
	for (i = 0; i < bgpJSONArray.length; i += 1) {
		bgpJSON = bgpJSONArray[i];
		if (bgpJSON != null) {
			bgpType = "bgp-router";
			bgpName = bgpJSON["bgp-router"]["name"];
			try {
			     resultJSON["bgp-routers"][i]["name"] = 
			         commonUtils.getSafeDataToJSONify(bgpJSON["bgp-router"]["name"]);
			} catch(e) {
			     resultJSON["bgp-routers"][i]["name"] = 
			         global.RESP_DATA_NOT_AVAILABLE;
			}
			if (bgpName in vrMap) {
				bgpType += ", " + vrMap[bgpName];
				delete vrMap[bgpName];
			}
			resultJSON["bgp-routers"][i]["type"] = bgpType;
			try {
			     resultJSON["bgp-routers"][i]["bgp_refs"] = 
			         adminApiHelper.getBGPRefNames(bgpJSON["bgp-router"]["bgp_router_refs"]);
			} catch(e) {
			     resultJSON["bgp-routers"][i]["bgp_refs"] = [];
			}
			try {
			     resultJSON["bgp-routers"][i]["href"] = 
			         commonUtils.getSafeDataToJSONify(bgpJSON["bgp-router"].href);
			} catch(e) {
			     resultJSON["bgp-routers"][i]["href"] = global.RESP_DATA_NOT_AVAILABLE;
			}
            try {
                 resultJSON["bgp-routers"][i]["id_perms"] = 
                     commonUtils.getSafeDataToJSONify(bgpJSON["bgp-router"]["id_perms"]);
            } catch(e) {
                 resultJSON["bgp-routers"][i]["id_perms"] = global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
			    resultJSON["bgp-routers"][i]["vendor"] = 
                    bgpJSON["bgp-router"]["bgp_router_parameters"].vendor;
            } catch(e) {
                resultJSON["bgp-routers"][i]["vendor"] =
                    global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                 resultJSON["bgp-routers"][i]["autonomous_system"] = 
                     commonUtils.getSafeDataToJSONify(bgpJSON["bgp-router"]["bgp_router_parameters"].autonomous_system);
            } catch(e) {
                 resultJSON["bgp-routers"][i]["autonomous_system"] = global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                 resultJSON["bgp-routers"][i]["address"] = 
                     commonUtils.getSafeDataToJSONify(bgpJSON["bgp-router"]["bgp_router_parameters"].address);
            } catch(e) {
                 resultJSON["bgp-routers"][i]["address"] = global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                 resultJSON["bgp-routers"][i]["identifier"] = 
                     commonUtils.getSafeDataToJSONify(bgpJSON["bgp-router"]["bgp_router_parameters"].identifier);
            } catch(e) {
                 resultJSON["bgp-routers"][i]["identifier"] = global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                 resultJSON["bgp-routers"][i]["port"] = 
                     commonUtils.getSafeDataToJSONify(bgpJSON["bgp-router"]["bgp_router_parameters"].port);
            } catch(e) {
                 resultJSON["bgp-routers"][i]["port"] = global.RESP_DATA_NOT_AVAILABLE;
            }
            try {
                 resultJSON["bgp-routers"][i]["address_families"] = 
                     commonUtils.getSafeDataToJSONify(bgpJSON["bgp-router"]["bgp_router_parameters"].address_families);
            } catch(e) {
                 resultJSON["bgp-routers"][i]["address_families"] = global.RESP_DATA_NOT_AVAILABLE;
            }
		}
	}
}

/* Function: processControlNodeTree
    List the control name and compute node
 */
function processControlNodeTree (data)
{
    var pos = -1;
    try {
        data = JSON.parse(data);
        var len = data.length;
        var jsonData = [];
        var hostName = null;
        var j = 0;
        for (var i = 0; i < len && data[i]; i++) {
            pos = data[i]['type'].indexOf('bgp-router');
            if ((pos != -1) && (null == data[i]['vendor'])) {
                jsonData[j] = {};
                jsonData[j]['name'] = data[i]['name'];
                jsonData[j]['ip'] = data[i]['address'];
                j++;
            }
        }
		return JSON.stringify(jsonData);
	} catch (e) {
        return null;
    }
}

/* Function: sendNodeResByReq
 This function is used to publish the Control Node response to Redis based on
 the req type
 */
function sendNodeResByReq (pubChannel, saveChannelKey, errCode, pubData, 
                           saveData, reqType, done) {
	var doSave = 0;
	var expireTime = 6000000;
	if (errCode == global.HTTP_STATUS_RESP_OK) {
		doSave = 1;
	}

	if (global.STR_GET_NODES == reqType) {
		redisPub.publishDataToRedis(pubChannel, saveChannelKey, errCode, pubData,
			                        saveData, doSave, 60000, done);
	} else if (global.STR_GET_NODES_TREE == reqType) {
		saveData = processControlNodeTree(saveData);
		if (null == saveData) {
			redisPub.publishDataToRedis(pubChannel, saveChannelKey,
				global.HTTP_STATUS_INTERNAL_ERROR,
				global.STR_CACHE_RETRIEVE_ERROR,
				global.STR_CACHE_RETRIEVE_ERROR, 0,
				expireTime, done);
		} else {
            redisPub.publishDataToRedis(pubChannel, saveChannelKey, errCode, 
                                        saveData, saveData, doSave, expireTime,
                                        done);
		}
	}
}

/**
 * Send a JSON of all compute and control nodes in response.
 * @param {Object} HTTP Response
 * @param {Object} JSON of all Virtual Routers
 */
function getUnionBGPandVR(pubChannel, saveChannelKey, vrJSON, reqType, done,
                          jobData)
{
    var dataObjArr = [];
	var vrMap = {},
		vrCount = vrJSON["virtual-routers"].length,
		i, name, type, url;
	for (i = 0; i < vrCount; i += 1) {
		name = vrJSON["virtual-routers"][i].name;
		type = vrJSON["virtual-routers"][i].type;
		vrMap[name] = type;
	}
	// TODO Replace by dynamic url.
	url = '/bgp-routers?parent_fq_name_str=default-domain:default-project:ip-fabric:__default__';
	configApiServer.apiGet(url, jobData, function (error, jsonData) {
		if (error) {
			sendNodeResByReq(pubChannel, saveChannelKey, global.HTTP_STATUS_INTERNAL_ERROR,
				global.STR_CACHE_RETRIEVE_ERROR, global.STR_CACHE_RETRIEVE_ERROR, reqType, done);

		} else {
			try {
				var bgpJSON = jsonData,
					bgpURLs = [],
					bgpCount = bgpJSON["bgp-routers"].length,
					i, uuid, url;
				if (bgpCount != 0) {
					for (i = 0; i < bgpCount; i += 1) {
						uuid = bgpJSON["bgp-routers"][i].uuid;
						url = '/bgp-router/' + uuid;
						logutils.logger.debug("getUnionBGPandVR: " + url);
						bgpURLs[i] = [url];
                        commonUtils.createReqObj(dataObjArr, bgpURLs[i],
                                                 global.HTTP_REQUEST_GET, null,
                                                 null, null, jobData);
						delete bgpJSON["bgp-routers"][i]["fq_name"];
					}
                    async.map(dataObjArr,
                              commonUtils.getAPIServerResponse(configApiServer.apiGet,
                                                               true),
                              function (err, results) {
						var i, name;
						if (!err) {
							processBGPRandVRJSON(bgpJSON, results, vrMap);
							bgpJSON = bgpJSON["bgp-routers"];
							for (i = 0; i < vrCount; i += 1) {
								name = vrJSON["virtual-routers"][i].name;
								if (name in vrMap) {
									bgpJSON[bgpJSON.length + 1] = vrJSON["virtual-routers"][i];
								}
							}
							sendNodeResByReq(pubChannel, saveChannelKey, global.HTTP_STATUS_RESP_OK,
								JSON.stringify(bgpJSON), JSON.stringify(bgpJSON), reqType, done);
						} else {
							sendNodeResByReq(pubChannel, saveChannelKey, global.HTTP_STATUS_INTERNAL_ERROR,
								global.STR_CACHE_RETRIEVE_ERROR, global.STR_CACHE_RETRIEVE_ERROR, reqType, done);
						}
					});
				} else {
					sendNodeResByReq(pubChannel, saveChannelKey, global.HTTP_STATUS_RESP_OK,
						JSON.stringify(bgpJSON), JSON.stringify(bgpJSON), reqType, done);
				}
			} catch (e) {
				sendNodeResByReq(pubChannel, saveChannelKey, global.HTTP_STATUS_INTERNAL_ERROR,
					global.STR_CACHE_RETRIEVE_ERROR, global.STR_CACHE_RETRIEVE_ERROR, reqType, done);
			}
		}
	});
}

/* Function: processNodes
 This function is used to get the response from Config Api Server based on
 the control node API request coming from Web Client
 */

function processNodes (pubChannel, saveChannelKey, jobData, done)
{
    var dataObjArr = [];
	var url = jobData.taskData.url;
	var reqType = jobData.title;
	configApiServer.apiGet(url, jobData, function (error, jsonData) {
		if (error) {
			sendNodeResByReq(pubChannel, saveChannelKey,
				global.HTTP_STATUS_INTERNAL_ERROR,
				global.STR_CACHE_RETRIEVE_ERROR,
				global.STR_CACHE_RETRIEVE_ERROR, reqType, done);
		} else {
			try {
				var resultJSON = jsonData,
					vnURLs = [],
					vnCount = resultJSON["virtual-routers"].length,
					i, uuid, url;
				if (vnCount != 0) {
					for (i = 0; i < vnCount; i += 1) {
						uuid = resultJSON["virtual-routers"][i].uuid;
						url = '/virtual-router/' + uuid;
						logutils.logger.debug("getNodes: " + url);
						vnURLs[i] = [url];
                        commonUtils.createReqObj(dataObjArr, vnURLs[i],
                                                 global.HTTP_REQUEST_GET, null,
                                                 null, null, jobData);
						delete resultJSON["virtual-routers"][i]["fq_name"];
					}
                    async.map(dataObjArr,
                              commonUtils.getAPIServerResponse(configApiServer.apiGet,
                                                               true),
                              function (err, results) {
						if (!err) {
							adminApiHelper.processVRJSON(resultJSON, results);
							getUnionBGPandVR(pubChannel, saveChannelKey,
                                             resultJSON, reqType, done, jobData);
						} else {
							sendNodeResByReq(pubChannel, saveChannelKey, global.HTTP_STATUS_INTERNAL_ERROR,
								global.STR_CACHE_RETRIEVE_ERROR, global.STR_CACHE_RETRIEVE_ERROR, reqType, done);
						}
					});
				} else {
					getUnionBGPandVR(pubChannel, saveChannelKey, resultJSON,
                                     reqType, done, jobData);
				}
			} catch (e) {
				sendNodeResByReq(pubChannel, saveChannelKey, global.HTTP_STATUS_INTERNAL_ERROR,
					global.STR_CACHE_RETRIEVE_ERROR, global.STR_CACHE_RETRIEVE_ERROR, reqType, done);
			}
		}
	});
}

function sendPublishReqToGetNodes (lookupHash, myHash, url, pubChannel, 
                                   saveChannelKey, done, data, jobData) {
    jobsApi.createJobListener(lookupHash, myHash, url, pubChannel, saveChannelKey, 
                              processNodes, null, false, 0,
                              5 * 60 * 1000, data, done, jobData);
}

function getControlNodeLists (pubChannel, saveChannelKey, jobData, done)
{
    var doSave = 1;
    adminApiHelper.getControlNodeList(jobData, function(err, jsonData) {
        if (err || (null == jsonData)) {
            redisPub.publishDataToRedis(pubChannel, saveChannelKey,
                                        global.HTTP_STATUS_INTERNAL_ERROR,
                                        global.STR_CACHE_RETRIEVE_ERROR,
                                        global.STR_CACHE_RETRIEVE_ERROR, 0,
                                        0, done);
         } else {
            redisPub.publishDataToRedis(pubChannel, saveChannelKey, 
                                        global.HTTP_STATUS_RESP_OK, 
                                        JSON.stringify(jsonData), 
                                        JSON.stringify(jsonData), doSave, 
                                        1 * 60 * 1000, done);
        }
    });
}

exports.processNodes = processNodes;
exports.getControlNodeLists = getControlNodeLists;



/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

var rest = require('../../common/rest.api'),
  async = require('async'),
  tenantapi = module.exports,
  logutils = require('../../utils/log.utils'),
  commonUtils = require('../../utils/common.utils'),
  config = require('../../../../config/config.global.js'),
  messages = require('../../common/messages'),
  global = require('../../common/global'),
  appErrors = require('../../errors/app.errors.js'),
  util = require('util'),
  jsonPath = require('JSONPath').eval,
  configApiServer = require('../../common/configServer.api'),
  opServer;

// Instantiate config and ops server access objects.
opServer = rest.getAPIServer({apiName: global.label.OPS_API_SERVER, server: config.analytics.server_ip, port: config.analytics.server_port });

if (!module.parent) {
	logutils.logger.warn(util.format(messages.warn.invalid_mod_call, module.filename));
	process.exit(1);
}

function getVNCounterList(vnJSON) 
{
	var str_list = {},
		agt_data = vnJSON.UveVirtualNetworkAgent;
	str_list.in_bytes = agt_data.in_bytes['#text'];
	str_list.in_tpkts = agt_data.in_tpkts['#text'];
	str_list.out_bytes = agt_data.out_bytes['#text'];
	str_list.out_tpkts = agt_data.out_tpkts['#text'];
	return (str_list);
}

function getVNInStats(vnJSON) 
{
	var in_stats = {},
		agt_data = vnJSON.UveVirtualNetworkAgent.in_stats.list.UveInterVnStats,
		i;

	in_stats.in_bytes = 0;
	in_stats.in_tpkts = 0;

	for (i = 0; i < agt_data.length; i += 1) {
		in_stats.in_bytes += parseInt(agt_data[i].bytes['#text'], 10);
		in_stats.in_tpkts += parseInt(agt_data[i].tpkts['#text'], 10);
	}
	return in_stats;
}

function getVNOutStats(vnJSON) 
{
	var out_stats = {},
		agt_data = vnJSON.UveVirtualNetworkAgent.out_stats.list.UveInterVnStats,
		i;

	out_stats.out_bytes = 0;
	out_stats.out_tpkts = 0;

	for (i = 0; i < agt_data.length; i += 1) {
		out_stats.out_bytes += parseInt(agt_data[i].bytes['#text'], 10);
		out_stats.out_tpkts += parseInt(agt_data[i].tpkts['#text'], 10);
	}
	return out_stats;
}

function getVNState (req, res) 
{
	var vn_name = req.param('vn'),
		url = '/analytics/virtual-network/' + vn_name;
	opServer.authorize(function () {
		opServer.api.get(url, function (error, jsonData) {
			if (error) {
				commonUtils.handleJSONResponse(error, res, null);
			} else {
				var vnJSON = jsonData,
					final_data = {};
				try {
					result = getVNCounterList(vnJSON);
					final_data['counters'] = result;
					in_stats = getVNInStats(vnJSON);
					final_data['in_stats'] = in_stats;
					out_stats = getVNOutStats(vnJSON);
					final_data['out_stats'] = out_stats;
				} catch (err) {
					logutils.logger.error(err.stack);
					/* Send as much data as we can */
				}
				commonUtils.handleJSONResponse(null, res, final_data);
			}
		});
	});
};

/*
 * parse the VN JSON from /analytics/virutal-network/<vnName>  
 */
function parseVNDetails(data,vnName) 
{
	var interVNInStats = [];
	var interVNOutStats = [];
    if(data['UveVirtualNetworkAgent'] != null) { 
        if(data['UveVirtualNetworkAgent']['in_stats'] != null)
            interVNInStats = data['UveVirtualNetworkAgent']['in_stats']['list']['UveInterVnStats'];
        if(data['UveVirtualNetworkAgent']['out_stats'] != null)
            data['UveVirtualNetworkAgent']['out_stats']['list']['UveInterVnStats'];
    }

	var interVNTotalIn = 0, interVNTotalOut = 0, interVNData = {};
	for (var i = 0; i < interVNInStats.length; i++) {
		var currInterVN = interVNInStats[i]['other_vn']['#text'];
        //connected VN can be from a different project
		//currInterVN = currInterVN.split(':').reverse()[0];
		interVNData[currInterVN] = {'inBytes':parseInt(interVNInStats[i]['bytes']['#text']), 
                                    'outBytes':0,
                                    'inPkts':parseInt(interVNInStats[i]['tpkts']['#text']),
                                    'outPkts':0}
	}
	for (var i = 0; i < interVNOutStats.length; i++) {
		var currInterVN = interVNOutStats[i]['other_vn']['#text'];
		//currInterVN = currInterVN.split(':').reverse()[0];
		if (interVNData[currInterVN] == null)
			interVNData[currInterVN] = {'inBytes':0, 'inPkts':0,
                                        'outBytes':parseInt(interVNOutStats[i]['bytes']['#text']),
                                        'outPkts':parseInt(interVNOutStats[i]['tpkts']['#text'])};
		else {
			interVNData[currInterVN]['outBytes'] = parseInt(interVNOutStats[i]['bytes']['#text']);
			interVNData[currInterVN]['outPkts'] = parseInt(interVNOutStats[i]['tpkts']['#text']);
        }
	}
	var interVNDataSource = [];
	for (var currVN in interVNData) {
		var currVNData = interVNData[currVN];
        var currVNName = currVN;
        //Populate the complete fq_name as name if VN is from a different project/domain 
        if(vnName.substr(0,vnName.lastIndexOf(':')) == currVN.substr(0,currVN.lastIndexOf(':')))
            currVNName = currVNName.split(':').reverse()[0];
		interVNDataSource.push({'fq_name':currVN.split(':'),'name':currVNName, 
                                'inBytes':currVNData['inBytes'], 
                                'outBytes':currVNData['outBytes'],
                                'inPkts': currVNData['inPkts'],
                                'outPkts':currVNData['outPkts']
                                });
	}
	//var inStatsData = data['UveVirtualNetworkAgent']['in_stats']['list']['UveInterVnStats'];
	var inStatsData = interVNInStats;
	var interVNInBytes = 0, interVNOutBytes = 0;
	//var outStatsData = data['UveVirtualNetworkAgent']['out_stats']['list']['UveInterVnStats'];
	var outStatsData = interVNOutStats;
	for (var i = 0; i < inStatsData.length; i++) {
		interVNInBytes += parseInt(inStatsData[i]['bytes']['#text']);
	}
	for (var i = 0; i < outStatsData.length; i++) {
		interVNOutBytes += parseInt(outStatsData[i]['bytes']['#text']);
	}
	return {'interVNTrafficIn':interVNInBytes, 'interVNTrafficOut':interVNOutBytes, 'interVNData':interVNDataSource};
	//logutils.logger.debug({'interVNTrafficIn':interVNInBytes,'interVNTrafficOut':interVNOutBytes,'interVNData':interVNDataSource});
}

function getVNDetails (req, res) 
{
	var vn_name = req.param('vn'),
		url = '/analytics/virtual-network/' + vn_name;
	logutils.logger.debug('VN connected networks URL', url);
	opServer.authorize(function () {
		opServer.api.get(url, function (error, jsonData) {
			if (error) {
				commonUtils.handleJSONResponse(error, res, null);
			} else {
				try {
					jsonData = parseVNDetails(jsonData,vn_name);
				} catch (err) {
					logutils.logger.error(err.stack);
					/* Send as much data as we can */
				}
				commonUtils.handleJSONResponse(null, res, jsonData);
			}
		});
	});
};

function getFlowStat (req, res) 
{
  var st = req.param('st');
  var et = req.param('et');
  var svn = req.param('svn');
  var dvn = req.param('dvn');
  var dir = req.param('direct');
  var ts = req.param('ts');

  var reqUrl = '/flow-statistics?start_time=' + st + '&end_time=' + et +
    '&source_virtual_network=' + svn + '&destination_virtual_network=' + dvn +
    '&direction=' + dir + '&time_slice=' + ts;
  cacheApi.queueDataFromCacheOrSendRequest(req, res, global.STR_JOB_TYPE_CACHE,
                                           global.STR_GET_FLOW_STAT, reqUrl, 0,
                                           1, 0, -1, true);
}

function mergeSrcDstData(srcData,dstData) 
{
    var mergedData = {};
    //Entity can be present only in source data but not destination data
    for(var currKey in srcData) {
        var currPortData = srcData[currKey];
        mergedData[currKey] = {'bytes' : currPortData[0],'pkts':currPortData[1]};
    }
    for(var currKey in dstData) {
        var currPortData = dstData[currKey];
        if(mergedData[currKey] != null) {
            mergedData[currKey]['bytes'] += currPortData[0];
            mergedData[currKey]['pkts'] += currPortData[1];
        } else 
            mergedData[currKey] = {'bytes' : currPortData[0],
                                    'pkts':currPortData[1]};
    }
    return mergedData;
}

function parseFlowData(data) 
{
	var retObj = {};
	var tsData = data['VN to VN Flow Timeseries'] || {};
	var srcPortData = data['VN to VN Flow Protocol Source Ports'];
	var dstPortData = data['VN to VN Flow Protocol Destination Ports'];
    var srcPeerData = data['VN to VN Flow Source IPs'];
    var dstPeerData = data['VN to VN Flow Destination IPs'];
	var srcData = {}, dstData = {}, appData = {};
	//Port can be present only in source ports but not destination ports
    appData = mergeSrcDstData(srcPortData,dstPortData);
    peerData = mergeSrcDstData(srcPeerData,dstPeerData);
	return {'appData':appData,'peerData':peerData, 'tsData':tsData};
}

function getVMState (req, res) 
{
	var vm_name = req.param('vm');
	var url = '/analytics/virtual-machine/' + vm_name;
	opServer.authorize(function () {
		opServer.api.get(url, function (error, projectsJSON) {
			commonUtils.handleJSONResponse(error, res, projectsJSON);
		});
	});
}

function populateVNVMData (resultJSON, vmInsJSON, vnvm) 
{
	var count = 0;
	var vmInsJSONStr = JSON.stringify(vmInsJSON);
	var vmInsJSONParse = JSON.parse(vmInsJSONStr);
	logutils.logger.debug(vmInsJSONStr);
	var data = [];
	var ext_counter = 0;
	var int_counter = 0;
	if (vmInsJSONParse.UveVirtualMachineAgent != null)
        if(vmInsJSONParse.UveVirtualMachineAgent.interface_list != null)
            data = vmInsJSONParse.UveVirtualMachineAgent.interface_list;
	var ext_data;
	var int_stat = [];
	resultJSON['ip'] = (data.length == 0) ? '' : data[0][data[0].length - 1];
	resultJSON['floating_ip'] = [];
	resultJSON['name'] = [];
	resultJSON['ext-stat'] = {'inBytes':0,'inPkts':0,'outBytes':0,'outPkts':0};
	resultJSON['int-stat'] = {'inBytes':0,'inPkts':0,'outBytes':0,'outPkts':0};
	resultJSON['virtual-network'] = [];

	for (var i = 0; i < data.length; i++) {
		for (var j = 0; j < data[i].length - 1; j++) {
			var inBytes = 0;
			var inPkts = 0;
			var outBytes = 0;
			var outPkts = 0;
			counter_data = data[i][j]['list'].VmInterfaceAgent;
			var f_name = [];
			for (var k = 0; k < data[i][j]['list']['@size']; k++) {
				inBytes = parseInt(counter_data[k]['in_bytes']['#text']);
				inPkts = parseInt(counter_data[k]['in_pkts']['#text']);
				outBytes = parseInt(counter_data[k]['out_bytes']['#text']);
				outPkts = parseInt(counter_data[k]['out_pkts']['#text']);
				resultJSON['floating_ip'][count] = counter_data[k]['ip_address']['#text'] + ' (' + counter_data[k]['virtual_network']['#text'] + ')';
				resultJSON['name'][count] = counter_data[k]['name']['#text'];
				/* Check which network it is connected to */
				var virt_net = counter_data[k]['virtual_network']['#text'];
				/* Check if we have already added this name in our resultJSON data */
				len = resultJSON['virtual-network'].length;
				for (var p = 0; p < len; p++) {
					if (resultJSON['virtual-network'][p]['name'] == virt_net) {
						break;
					}
				}
				if (p == len) {
					/* No entry already */
					p = 0;
					resultJSON['virtual-network'][p] = {};
					resultJSON['virtual-network'][p]['inBytes'] = 0;
					resultJSON['virtual-network'][p]['inPkts'] = 0;
					resultJSON['virtual-network'][p]['outBytes'] = 0;
					resultJSON['virtual-network'][p]['outPkts'] = 0;
				}
				var fq_name = virt_net.split(':');
				resultJSON['virtual-network'][p]['name'] = fq_name[fq_name.length - 1];
				resultJSON['virtual-network'][p]['inBytes'] +=
					parseInt(counter_data[k]['in_bytes']['#text']);
				resultJSON['virtual-network'][p]['inPkts'] +=
					parseInt(counter_data[k]['in_pkts']['#text']);
				resultJSON['virtual-network'][p]['outBytes'] +=
					parseInt(counter_data[k]['out_bytes']['#text']);
				resultJSON['virtual-network'][p]['outPkts'] +=
					parseInt(counter_data[k]['out_pkts']['#text']);
				var pos = vnvm.indexOf(resultJSON['virtual-network'][p]['name']);
				if (-1 == pos) {
					resultJSON['ext-stat']['inBytes'] += inBytes;
					resultJSON['ext-stat']['inPkts'] += inPkts;
					resultJSON['ext-stat']['outBytes'] += outBytes;
					resultJSON['ext-stat']['outPkts'] += outPkts;
				} else {
					resultJSON['int-stat']['inBytes'] += inBytes;
					resultJSON['int-stat']['inPkts'] += inPkts;
					resultJSON['int-stat']['outBytes'] += outBytes;
					resultJSON['int-stat']['outPkts'] += outPkts;
				}
				count++;
			}
		}
	}
    resultJSON['fip_list'] = [];
    try {
        var fips = jsonPath(data, "$..VmFloatingIPAgent");
        var fipList = fips[0];
        var fipCount = fipList.length;
        for (i = 0; i < fipCount; i++) {
            resultJSON['fip_list'][i] = {};
            resultJSON['fip_list'][i]['ip_address'] =
                fipList[i]['ip_address']['#text'];
            resultJSON['fip_list'][i]['virtual_network'] =
                fipList[i]['virtual_network']['#text'];
        }
    } catch(e) {
        logutils.logger.debug("In populateVNVMData(): JSON Parse error: " + e);
    }
}

function getVNVM (req, res) 
{
	var url, vnm = req.param('vnvm');
	url = '/analytics/virtual-machine/' + vnm;
	opServer.authorize(function () {
		opServer.api.get(url, function (error, vmInsJSON) {
			var resultJSON = {};
			if(!error) {
				populateVNVMData(resultJSON, vmInsJSON, vnm);
			}
			commonUtils.handleJSONResponse(error, res, resultJSON);
		});
	});
}

// Handle request to get a JSON of projects for a given domain.
function getProjects (req, res, appData) 
{
	var url, domain = req.param('domain');
	url = "/projects?domain=" + domain;
	configApiServer.apiGet(url, appData, function (error, projectsJSON) {
		commonUtils.handleJSONResponse(error, res, projectsJSON);
	});
}

// Handle request to get a JSON of project details for a given project name.
function getProject (req, res, appData) 
{
	var url, project = req.param('project');
	url = "/project/" + project;
	configApiServer.apiGet(url, appData, function (error, projectJSON) {
		commonUtils.handleJSONResponse(error, res, projectJSON);
	});
}

// Handle request to get a JSON of virtual networks under a given project name.
function getVNetworks (req, res, appData) 
{
	var url, fqName = req.param('fqname');
	url = "/virtual-networks?parent_type=project&parent_fq_name_str=" + fqName;
	configApiServer.apiGet(url, appData, function (error, vnsJSON) {
		commonUtils.handleJSONResponse(error, res, vnsJSON);
	});
}

// Handle request to get a JSON of virtual network for a given id.
function getVNetwork (req, res, appData) 
{
	var url, vn = req.param('vn');
	url = "/virtual-network/" + vn;
	configApiServer.apiGet(url, appData, function (error, vnJSON) {
		commonUtils.handleJSONResponse(error, res, vnJSON);
	});
}

function populateName(arr) {
    
	for (var j = 0; j < arr.length; j++) {
		var currData = arr[j];
		currData['name'] = currData['fq_name'][currData['fq_name'].length - 1];
	}
}

function sortProjectsByName(a, b) {
	if (a['fq_name'][1] > b['fq_name'][1])
		return 1;
	else if (a['fq_name'][1] < b['fq_name'][1])
		return -1
	else
		return 0;
}

/**
 * Create a JSON of virtual networks along with their instances for a project.
 * @param {String} Url to get virtual networks in a project
 * @param {Function} Callback function
 */
function getProjectVNs(url, callback) {
	configServer.api.get(url, function (error, jsonData) {
		if (!error) {
			var vnsJSON = jsonData,
				instanceUrls = [],
				vnCount = vnsJSON['virtual-networks'].length,
				j, fq_name, url;
			if(vnCount != 0) {
				for (j = 0; j < vnCount; j += 1) {
					fq_name = vnsJSON['virtual-networks'][j].fq_name;
					url = '/analytics/virtual-machine/' + fq_name.join(':');
					instanceUrls[j] = url;
				}
				async.map(instanceUrls, commonUtils.getJsonViaInternalApi(opServer.api, true), function (err, results) {
					var k, vnDetailJSON;
					if (!err) {
						for (k = 0; k < vnCount; k += 1) {
							vnDetailJSON = results[k];
							vnsJSON['virtual-networks'][k]["items"] = getInstancesAndLinksforVN(vnDetailJSON);
						}
						callback(null, vnsJSON);
					} else {
						callback(err);
					}
				});
			} else {
				callback(null, vnsJSON);
			}
		} else {
			callback(error);
		}
	});
}

function getProjectsTree (req, res) 
{
  var url, domain = req.param('domain');
  url = "/projects?domain=" + domain;
  var includeDomain = req.param('includeDomain');
  var reqUrl = url;
  var isIncludeDomain = true;

  if (null == includeDomain) {
    isIncludeDomain = false;   
  }
  var appData = {
     includeDomain: isIncludeDomain
  }
  cacheApi.queueDataFromCacheOrSendRequest(req, res, global.STR_JOB_TYPE_CACHE,
                                           global.STR_GET_PROJECTS_TREE, reqUrl,
                                           /* Update the tree cache every 1 min
                                            * */
                                           0, 0, 0, 1 * 60 * 1000, false, appData);
}

function getInstLinks(linksData) 
{
	var links = [];
	try {
		for (var i = 0; i < linksData.length; i++) {
			var currLink = linksData[i]['other_vn'];
			var currLinkText = currLink['#text'];
			var fq_name = currLinkText;
			currLinkText = currLinkText.split(':').reverse()[0];
			links.push({'name':fq_name, 'fq_name':fq_name});
		}
	} catch (err) {
		logutils.logger.error(err.stack);
	}
	return links;
}

/**
 * Populate JSON containing all connected network and instances of a virtual network.
 * @param {Object} JSON to contain connected network and instances
 */
function getInstancesAndLinksforVN(vnDetailJSON) 
{
	var instances = [],
		links = [],
		instanceData, currInst, fq_name, i;
	try {
		if (vnDetailJSON['UveVirtualNetworkAgent'] != null) {
			instanceData = vnDetailJSON['UveVirtualNetworkAgent']['virtualmachine_list'];
			if (vnDetailJSON['UveVirtualNetworkAgent']['out_stats'])
				links = links.concat(getInstLinks(vnDetailJSON['UveVirtualNetworkAgent']['out_stats']['list']['UveInterVnStats']));
			//links = links.concat(getInstLinks(insJSON['UveVirtualNetworkAgent']['in_stats']['list']['UveInterVnStats']));
			if (instanceData != null && instanceData['list'] != null && instanceData['list']['element'] != null) {
				for (i = 0; i < instanceData['list']['element'].length; i += 1) {
					currInst = instanceData['list']['element'][i];
					fq_name = currInst;
					currInst = currInst.split(':').reverse()[0];
					instances.push({name:currInst, 'fq_name':fq_name});
				}
			}
		}
	} catch (err) {
		logutils.logger.error(err.stack);
	}
	return [{name:'Connected Networks', items:links}, {name:'Instances', items:instances}];
}

function populateSumInOutTraffic(vnJSON) 
{
}

function populateInOutTraffic (vnJSON, trafficJSON, counter) 
{
	var trafficDetails = {};
	try {
		//logutils.logger.debug('Traffic JSON:',trafficJSON);
		var inBytes = 0, outBytes = 0,inPkts=0,outPkts=0;
		var interVNInBytes = 0, interVNOutBytes = 0,interVNInPkts=0,interVNOutPkts=0;
		if (trafficJSON['UveVirtualNetworkAgent']) {
			var inBytesData = trafficJSON['UveVirtualNetworkAgent']['in_bytes'];
			var outBytesData = trafficJSON['UveVirtualNetworkAgent']['out_bytes'];
            var inPktsData = trafficJSON['UveVirtualNetworkAgent']['in_tpkts'];
            var outPktsData = trafficJSON['UveVirtualNetworkAgent']['out_tpkts'];
            if ((inBytesData == null) || (inBytesData['#text'] == null)) {
                inBytes = 0;
            } else {
                inBytes = inBytesData['#text'];
            }
            if ((outBytesData == null) || (outBytesData['#text'] == null)) {
                outBytes = 0;
            } else {
                outBytes = outBytesData['#text'];
            }

            if((inPktsData == null) || (inPktsData['#text'] == null))
                inPkts = 0;
            else
                inPkts = inPktsData['#text'];
            if((outPktsData == null) || (outPktsData['#text'] == null))
                outPkts = 0;
            else
                outPkts = outPktsData['#text'];

			var inStatsData = [], outStatsData = [];

			if ((trafficJSON['UveVirtualNetworkAgent']['in_stats'] != null) && (trafficJSON['UveVirtualNetworkAgent']['in_stats']['list'] != null) &&
				(trafficJSON['UveVirtualNetworkAgent']['out_stats'] != null) && (trafficJSON['UveVirtualNetworkAgent']['out_stats']['list'] != null)) {
				var inStatsData = trafficJSON['UveVirtualNetworkAgent']['in_stats']['list']['UveInterVnStats'];
				var outStatsData = trafficJSON['UveVirtualNetworkAgent']['out_stats']['list']['UveInterVnStats'];
				for (var i = 0; i < inStatsData.length; i++) {
					interVNInBytes += parseInt(inStatsData[i]['bytes']['#text']);
					interVNInPkts += parseInt(inStatsData[i]['tpkts']['#text']);
				}
				for (var i = 0; i < outStatsData.length; i++) {
					interVNOutBytes += parseInt(outStatsData[i]['bytes']['#text']);
					interVNOutPkts += parseInt(outStatsData[i]['tpkts']['#text']);
				}
			}
		}
		populateName([vnJSON['virtual-networks'][counter]]);
		vnJSON["virtual-networks"][counter]['inBytes'] = parseInt(inBytes);
		vnJSON["virtual-networks"][counter]['outBytes'] = parseInt(outBytes);
		vnJSON["virtual-networks"][counter]['inPkts'] = parseInt(inPkts);
		vnJSON["virtual-networks"][counter]['outPkts'] = parseInt(outPkts);
		vnJSON["virtual-networks"][counter]['interVNInBytes'] = interVNInBytes;
		vnJSON["virtual-networks"][counter]['interVNOutBytes'] = interVNOutBytes;
		vnJSON["virtual-networks"][counter]['interVNInPkts'] = interVNInPkts;
		vnJSON["virtual-networks"][counter]['interVNOutPkts'] = interVNOutPkts;
	} catch (err) {
		logutils.logger.error(err.stack);
	}
}

function getProjectData (configObj, callback) 
{
    var url = configObj.url;
    var appData = configObj.appData;
    configApiServer.apiGet(url, appData, function (error, jsonData) {
        if (error) {
            callback(error);
        } else {
            try {
                var vnJSON = jsonData,
                    uveUrls = [],
                    vnCount = vnJSON["virtual-networks"].length,
                    i, uuid, fq_name, url ;
                logutils.logger.debug("vnJSONStr: " + JSON.stringify(vnJSON));
                if(vnCount != 0) {
                    for (i = 0; i < vnCount; i += 1) {
                        uuid = vnJSON["virtual-networks"][i].uuid;
                        fq_name = vnJSON['virtual-networks'][i].fq_name;
                        url = '/analytics/virtual-network/' + fq_name.join(':');
                        logutils.logger.debug('getProjectDetails URL:', url);
                        uveUrls[i] = [url];
                    }
                    async.map(uveUrls, commonUtils.getJsonViaInternalApi(opServer.api, true), 
                              function (err, results) {
                        var i, trafficJSON;
                        if(!err) {
                            for (i = 0; i < vnCount; i += 1) {
                                trafficJSON = results[i];
                                populateInOutTraffic(vnJSON, trafficJSON, i);
                            }
                            callback(null, vnJSON);
                        } else {
                            callback(error);
                        }
                    });
                } else {
                    callback(null, vnJSON);
                }
            } catch (error) {
                callback(error);
            }
        }
    });
}

// Handle request to get JSON of project details for a given project name.
function getProjectDetails (req, res, appData) 
{
    var urlLists = [];
	var project = req.param('project');
    url = "/virtual-networks?parent_type=project&parent_fq_name_str=" + project;
    var configObj = {
        url: url,
        appData: appData
    };
    getProjectData(configObj, function(err, results) {
        if (err) {
            commonUtils.handleJSONResponse(err, res, null);
        } else {
            commonUtils.handleJSONResponse(null, res, results);
        }
    });
}

function parseDomainSummary (resultJSON, results) 
{
    resultJSON = {};
    resultJSON['interVNInBytes'] = 0;
    resultJSON['interVNInPkts'] = 0;
    resultJSON['interVNOutBytes'] = 0;
    resultJSON['interVNOutPkts'] = 0;
    resultJSON['inBytes'] = 0;
    resultJSON['inPkts'] = 0;
    resultJSON['outBytes'] = 0;
    resultJSON['outPkts'] = 0;
    try {
        var projCount = results.length;
        for (var i = 0; i < projCount; i++) {
            vnData = results[i]['virtual-networks'];
            vnCount = vnData.length;
            for (var j = 0; j < vnCount; j++) {
                try {
	                resultJSON['interVNInBytes'] = parseInt(resultJSON['interVNInBytes']) +
	                    parseInt(vnData[j]['interVNInBytes']);
                } catch(e) {
                    console.log("In parseDomainSummary(), JSON Parse error:" + e);
                }
                try {
	                resultJSON['interVNInPkts'] = parseInt(resultJSON['interVNInPkts']) +
	                    parseInt(vnData[j]['interVNInPkts']);
                } catch(e) {
                    console.log("In parseDomainSummary(), JSON Parse error:" + e);
                }
                try {
	                resultJSON['interVNOutBytes'] = parseInt(resultJSON['interVNOutBytes']) +
	                    parseInt(vnData[j]['interVNOutBytes']);
                } catch(e) {
                    console.log("In parseDomainSummary(), JSON Parse error:" + e);
                }
                try {
	                resultJSON['interVNOutPkts'] = parseInt(resultJSON['interVNOutPkts']) +
	                    parseInt(vnData[j]['interVNOutPkts']);
                } catch(e) {
                    console.log("In parseDomainSummary(), JSON Parse error:" + e);
                }
                try {
	                resultJSON['inBytes'] = parseInt(resultJSON['inBytes']) +
	                    parseInt(vnData[j]['inBytes']);
                } catch(e) {
                    console.log("In parseDomainSummary(), JSON Parse error:" + e);
                }
                try {
	                resultJSON['inPkts'] = parseInt(resultJSON['inPkts']) +
	                    parseInt(vnData[j]['interVNInBytes']);
                } catch(e) {
                    console.log("In parseDomainSummary(), JSON Parse error:" + e);
                }
                try {
	                resultJSON['inPkts'] = parseInt(resultJSON['interVNInBytes']) +
	                    parseInt(vnData[j]['interVNInBytes']);
                } catch(e) {
                    console.log("In parseDomainSummary(), JSON Parse error:" + e);
                }
                try {
	                resultJSON['outBytes'] = parseInt(resultJSON['outBytes']) +
	                    parseInt(vnData[j]['outBytes']);
                } catch(e) {
                    console.log("In parseDomainSummary(), JSON Parse error:" + e);
                }
                try {
	                resultJSON['outPkts'] = parseInt(resultJSON['outPkts']) +
	                    parseInt(vnData[j]['outPkts']);
                } catch(e) {
                    console.log("In parseDomainSummary(), JSON Parse error:" + e);
                }
            }
        }
    } catch(e) {
        console.log("In parseDomainSummary(), JSON parse error" + e);
    }
    return resultJSON;
}

function getNetworkDomainSummary (req, res, appData) 
{
    var configObjArr = [];
    var domain = req.param('fq-name');
    var results = {};
    var urlLists = [];
    var j = 0;
    var resultJSON = {};
    
    var url = '/projects?domain=' + domain;
    /* First get the project details in this domain */
    configApiServer.apiGet(url, appData, function (error, jsonData) {
        if (error) {
            commonUtils.handleJSONResponse(error, res, null);
            return;
        }
        try {
            var projects = jsonData['projects'];
            var projectsCount = projects.length;  
            for (var i = 0; i <  projectsCount; i++) {
                if ((projects[i]['fq_name'][1] == 'service') || 
                    (projects[i]['fq_name'][1] == 'default-project') ||
                    (projects[i]['fq_name'][1] == 'invisible_to_admin')) {
                    continue;
                }
                url = "/virtual-networks?parent_type=project&parent_fq_name_str=" + projects[i]['fq_name'].join(':');
                configObjArr[j] = {};
                configObjArr[j]['url'] = url;
                configObjArr[j]['appData'] = appData;
                j++;
            }
            async.map(configObjArr, getProjectData, function (err, results) {
                resultJSON = parseDomainSummary(resultJSON, results);
                commonUtils.handleJSONResponse(null, res, resultJSON);
            });
        } catch(e) {
            console.log("tenantapi.getNetworkDomainSummary(): Got json " + 
                        "parse error:" + e);
            commonUtils.handleJSONResponse(null, res, results);
        }
    });
}

function parseAclRuleData (resultJSON, results) 
{
    var aclRuleLists = [];
    var aclRuleCnt = 0;
    try {
        aclRuleCount = results.length;
        for (var i = 0; i < aclRuleCount; i++) {
            aclRuleLists = 
                results[i]['access-control-list']['access_control_list_entries']['acl_rule'];
            aclRuleCnt = parseInt(aclRuleCnt) + aclRuleLists.length;
        }
        resultJSON['aclRuleCnt'] = aclRuleCnt;
    } catch(e) {
        console.log("In parseAclRuleData(): JSON Parse error:", e);
    }
}

function parseVNUveData (resultJSON, vnUve)
{
    try {
        resultJSON['intfList'] =
            vnUve['UveVirtualNetworkAgent']['interface_list']['list']['element'];
    } catch(e) {
    }
    try {
        resultJSON['aclRuleCnt'] =
            vnUve['UveVirtualNetworkAgent']['total_acl_rules'][0][0]['#text'];
    } catch(e) {
        resultJSON['aclRuleCnt'] = 0;
    }
    try {
        resultJSON['intfCnt'] = resultJSON['intfList'].length;
    } catch(e) {
        resultJSON['intfCnt'] = 0;
    }
    try {
        resultJSON['vmCnt'] =
            vnUve['UveVirtualNetworkAgent']['virtualmachine_list']['list']['@size'];
    } catch(e) {
        resultJSON['vmCnt'] = 0;
    }
    try {
        resultJSON['partiallyConnectedNws'] = 
            vnUve['UveVirtualNetworkConfig']['partially_connected_networks']['list']['element'];
    } catch(e) {
    }
}

function parseNetworkDetails (resultJSON, appData, jsonData, callback) 
{
    var vmRefs = [];
    var vmRefsCount = 0;
    var urlLists = [];
    var dataObjArr = [];
    
    if (null == jsonData) {
        return;
    }
    resultJSON['vmCnt'] = 0;
    resultJSON['intfCnt'] = 0;
    resultJSON['aclRuleCnt'] = 0;
    resultJSON['policyList'] = [];
    resultJSON['intfList'] = {};
    resultJSON['partiallyConnectedNws'] = {};
    
    try {
        resultJSON['fq-name'] = jsonData['fq_name'].join(':');
        nwPolicyRefs = jsonData['network_policy_refs'];
        policyCount = nwPolicyRefs.length;
        for (i = 0; i < policyCount; i++) {
            resultJSON['policyList'][i] = {};
            resultJSON['policyList'][i]['name'] = nwPolicyRefs[i]['to'].join(':');
            resultJSON['policyList'][i]['uuid'] = nwPolicyRefs[i]['uuid'];
        }
        /* Now get the rest of the data from UVE */
        var url = '/analytics/virtual-network/' + resultJSON['fq-name'];
        opServer.api.get(url, function(err, vnUve) {
            parseVNUveData(resultJSON, vnUve);
            callback(resultJSON);
        });
    } catch(e) {
        console.log("In parseNetworkDetails(): VM JSON Parse error:" + e);
        callback(resultJSON);
    }
}

function getNetworkDetails (req, res, appData) 
{
    var resultJSON = {};
    var uuid = req.param('uuid');
    var url = '/virtual-network/' + uuid;
    
    configApiServer.apiGet(url, appData, function (error, jsonData) {
        if (error) {
            commonUtils.handleJSONResponse(error, res, null);
            return;
        }
        parseNetworkDetails(resultJSON, appData, jsonData['virtual-network'], 
            function(results) {
            commonUtils.handleJSONResponse(null, res, results);
        });
    });    
}

/**
 * Function: parsePingResponses
 * private function
 * 1. This function is used to parse the ping response from Sandesh
 */
function parsePingResponses (pingResps) 
{
    var results = [];
    var lastIndex = 0;
    try {
        var pingRespsCount = pingResps.length;

        for (var i = 0; i < pingRespsCount; i++) {
            lastIndex = commonUtils.createJSONBySandeshResponseArr(results, 
                                                                   pingResps[i],
                                                                   lastIndex);
        }
    } catch(e) {
        logutils.logger.debug("In parsePingResponses(): JSON Parse error: ", +
                              e);
    }
    return results;
}

/** 
 * Function: doPing
 * public function
 * 1. This function is used to handle a ping request coming from Web UI
 */
function doPing (req, res) 
{
    var strArr = [];
    var index  = 0;
    var resultJSON = {};
    var ip = req.param('ip');
    var srcIP = req.param('srcIP');
    var srcPort = req.param('srcPort');
    var destIP = req.param('destIP');
    var destPort = req.param('destPort');
    var protocol = req.param('protocol');
    var vrfName = req.param('vrfName');
    var pktSize = req.param('pktSize');
    var count = req.param('count');
    var interval = req.param('interval');
    var urlLists = [];
    var ping_async_cb_timeout = 115000; /* 1 Minute 55 Seconds */

    if (ip == null) {
        strArr[index++] = 'vRouter IP';
    }
    if (srcIP == null) {
        strArr[index++] = 'Source IP';
    }
    if (destIP == null) {
        strArr[index++] = 'Dest IP';
    }
    if (protocol == null) {
        strArr[index++] = 'Protocol';
    }
    if (vrfName == null) {
        strArr[index++] = 'vrfName';
    }
    var len = strArr.length;
    if (len > 0) {
        /* Some info missing */
        var str = strArr.join(', ');
        var error = new appErrors.RESTServerError('Field(s) ' + "'" + str + "'"
                                                  + ' mandatory');
        commonUtils.handleJSONResponse(error, res, null);
        return;
    }

    /* Defaults will be taken care by Agent */
    if (srcPort == null) {
        srcPort ="";
    }
    if (destPort == null) {
        destPort = "";
    }
    if (pktSize == null) {
        pktSize = "";
    }
    if (count == null) {
        count = "";
    }
    if (interval == null) {
        interval = "";
    }

    var url = ip + '@' + global.SANDESH_COMPUTE_NODE_PORT + '@' +
        '/Snh_PingReq?source_ip=' + srcIP + '&source_port=' + srcPort +
        '&dest_ip=' + destIP + '&dest_port=' + destPort + '&protocol=' +
        protocol + '&vrf_name=' + vrfName + '&packet_size=' + pktSize +
        '&count=' + count + '&interval=' + interval;

    urlLists[0] = url;
    async.map(urlLists,
              commonUtils.getDataFromSandeshByIPUrl(rest.getAPIServer, true,
                                                    ping_async_cb_timeout),
              function(err, results) {
        if ((err) || (null == results)) {
            commonUtils.handleJSONResponse(err, res, null);
            return;
        }
        try {
            var errResp = results[0]['PingErrResp']['error_response'][0]['_'];
            /* Check if it is error response */
            var error = new appErrors.RESTServerError(errResp);
            commonUtils.handleJSONResponse(error, res, null);
            return;
        } catch(e) {
            /* No Error */
            pingResp = jsonPath(results, "$..PingResp");
            resultJSON['pingResp'] = [];
            resultJSON['pingResp'] = parsePingResponses(pingResp);
            pingSummResp = jsonPath(results, "$..PingSummaryResp");
            resultJSON['pingSummResp'] = [];
            resultJSON['pingSummResp'] = parsePingResponses(pingSummResp);
            commonUtils.handleJSONResponse(null, res, resultJSON);
        }
    });
}

exports.getVMState = getVMState;
exports.getVNState = getVNState;
exports.getProjectData = getProjectData;
exports.getVNVM = getVNVM;
exports.getProjects = getProjects;
exports.getProject = getProject;
exports.getFlowStat = getFlowStat;
exports.getVNDetails = getVNDetails;
exports.getVNetworks = getVNetworks;
exports.getVNetwork = getVNetwork;
exports.getProjectsTree = getProjectsTree;
exports.getProjectDetails = getProjectDetails;
exports.getNetworkDomainSummary = getNetworkDomainSummary;
exports.getNetworkDetails = getNetworkDetails;
exports.populateInOutTraffic = populateInOutTraffic;
exports.populateVNVMData = populateVNVMData;
exports.doPing = doPing;


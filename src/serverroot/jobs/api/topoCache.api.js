/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

var assert = require('assert')
	, rest = require('../../common/rest.api')
	, config = require('../../../../config/config.global.js')
	, commonUtils = require('../../utils/common.utils')
	, jobsApi = require('../core/jobs.api')
	, global = require('../../common/global')
	, commonUtils = require('../../utils/common.utils')
	, async = require('async')
	, logutils = require('../../utils/log.utils')
	, util = require('util')
	, redisPub = require('../core/redisPub')
	, messages = require('../../common/messages');

if (!module.parent) {
	logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
		module.filename));
	process.exit(1);
}

// Instantiate config and ops server access objects.
vnc = rest.getAPIServer({apiName:global.label.VNCONFIG_API_SERVER,
	server:config.cnfg.server_ip,
	port:config.cnfg.server_port });
anC = rest.getAPIServer({apiName:global.label.OPS_API_SERVER,
	server:config.analytics.server_ip,
	port:config.analytics.server_port });

topoCache = module.exports;

function getInstLinks (linksData)
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

function getInstancesAndLinksforVN (vnDetailJSON)
{
	var instances = [],
		links = [],
		instanceData, currInst, fq_name, i;
	try {
		if (vnDetailJSON['UveVirtualNetworkAgent'] != null) {
			instanceData = vnDetailJSON['UveVirtualNetworkAgent']['virtualmachine_list'];
			if (vnDetailJSON['UveVirtualNetworkAgent']['out_stats']) {
				links = links.concat(getInstLinks(vnDetailJSON['UveVirtualNetworkAgent']['out_stats']['list']['UveInterVnStats']));
			}
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
	return [
		{name:'Connected Networks', items:links},
		{name:'Instances', items:instances}
	];
}

function populateName (arr)
{
	for (var j = 0; j < arr.length; j++) {
		var currData = arr[j];
		currData['name'] = currData['fq_name'][currData['fq_name'].length - 1];
	}
}

function getProjectVNs (url, callback)
{
	vnc.api.get(url, function (error, jsonData) {
		if (!error) {
			var vnsJSON = jsonData,
				instanceUrls = [],
				vnCount = vnsJSON['virtual-networks'].length,
				j, fq_name, url;
			if (vnCount != 0) {
				for (j = 0; j < vnCount; j += 1) {
					fq_name = vnsJSON['virtual-networks'][j].fq_name;
					url = '/analytics/virtual-machine/' + fq_name.join(':');
					instanceUrls[j] = url;
				}
				async.map(instanceUrls, commonUtils.getJsonViaInternalApi(anC.api, true), function (err, results) {
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

function sortProjectsByName (a, b)
{
	if (a['fq_name'][1] > b['fq_name'][1])
		return 1;
	else if (a['fq_name'][1] < b['fq_name'][1])
		return -1
	else
		return 0;
}

function getProjectsTreeByDomain (domain, callback)
{
    var cacheExpTime = config.cacheExpire.topo_tree_time;
    var url = '/projects?domain=' + domain;
    vnc.api.get(url, function (error, jsonData) {
        if (error) {
            callback(error, null);
        } else {
            try {
                var projectsJSON = jsonData,
                    vnUrls = [],
                    projJSON = {'projects':[]},
                    i, fq_name, uuid, url;
                populateName(projectsJSON.projects);
                for (i = 0; i < projectsJSON.projects.length; i += 1) {
                    fq_name = projectsJSON.projects[i].fq_name;
                    //Exclude "default-project" & "service"
/*                    if ((fq_name[1] == 'default-project') || (fq_name[1] == 'service')
                        || (fq_name[1] == 'invisible_to_admin')) {
                    } else {
                        projJSON['projects'].push(projectsJSON.projects[i]);
                    }
 */
                    projJSON['projects'].push(projectsJSON.projects[i]);
                }
                projectsJSON = projJSON;
                projectsJSON.projects.sort(sortProjectsByName);
                for (i = 0; i < projectsJSON.projects.length; i += 1) {
                    uuid = projectsJSON.projects[i].uuid;
                    fq_name = projectsJSON.projects[i].fq_name;
                    url = '/virtual-networks?parent_fq_name_str=' + fq_name.join(':');
                    logutils.logger.debug('getProjectsTree: ', url);
                    vnUrls[i] = url;
                }
                async.map(vnUrls, getProjectVNs, function (err, results) {
                    var i, vnsJSON;
                    if (!err) {
                        for (i = 0; i < projectsJSON.projects.length; i += 1) {
                            vnsJSON = results[i];
                            try {
                                //populate the name property
                                populateName(vnsJSON['virtual-networks']);
                                projectsJSON.projects[i]['items'] = vnsJSON['virtual-networks'];
                            } catch (e) {
                                callback(e, null);
                            }
                        }
                        callback(null, projectsJSON['projects']);
                    } else {
                        callback(err, null);
                    }
                });
            } catch (error) {
                callback(error, null);
            }
        }
    });
}

function getProjectsTreeWithDomain (resultJSON, domainList, projectTreeData)
{
    var len = domainList.length;
    var domain;
    for (var i = 0; i < len; i++) {
        domain = domainList[i];
        resultJSON[i] = {};
        resultJSON[i]['name'] = domain;
        resultJSON[i]['items'] = projectTreeData[i];
    }
    
}

function processTreeTopoCache (pubChannel, saveChannelKey, 
                               jobData, done)
{
    var reqUrl = url = jobData.taskData.url;
    var appData = jobData.taskData.appData;
    var emptyResultArr = [];
    var domainList = [];
    var resultJSON = [];
    var treeJSON = [];
    /* In future when more number of domains will be supported, then we 
       can add here itself
     */
    var domain = 'default-domain';
    domainList[0] = domain;
    
    async.map(domainList, getProjectsTreeByDomain, function(err, jsonData) {
        if (err) {
            redisPub.publishDataToRedis(pubChannel, saveChannelKey,
                global.HTTP_STATUS_INTERNAL_ERROR,
                emptyResultArr, emptyResultArr, 0,
                0, done);
            return;
        }
        getProjectsTreeWithDomain(resultJSON, domainList, jsonData);
        if (true == appData.includeDomain) {
            treeJSON = resultJSON;   
        } else {
            treeJSON = jsonData[0]
        }
        
        redisPub.publishDataToRedis(pubChannel, saveChannelKey,
                                    global.HTTP_STATUS_RESP_OK,
                                    JSON.stringify(treeJSON), 
                                    JSON.stringify(treeJSON), 1, 
                                    0, done);
    });
}

exports.processTreeTopoCache = processTreeTopoCache;


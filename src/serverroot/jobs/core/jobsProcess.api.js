/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

var  topoCache = require('../api/topoCache.api')
	, bgpNode = require('../api/bgpNode.api')
	, computeNode = require('../api/computeNode.api')
	, nwMonJobsApi = require('../api/network.mon.jobs')
	, tpoCache     = require('../api/tpoCache.api')
	;

var jobsProcess = module.exports;

jobsProcess.processTreeTopoCacheRequestByJob = function (pubChannel, saveChannelKey, jobData, callback) {
	topoCache.processTreeTopoCache(pubChannel, saveChannelKey, jobData, callback);
}

jobsProcess.processNetworkTopologyRequestByJob = function (pubChannel, 
                                                           saveChannelKey, 
                                                           jobData, callback) {
    tpoCache.processTreeTopoCache(pubChannel, saveChannelKey, jobData, callback);
}

jobsProcess.processControlNodeRequestByJob = function (pubChannel, saveChannelKey, jobData, callback) {
	bgpNode.processNodes(pubChannel, saveChannelKey, jobData, callback);
}

jobsProcess.processNodesRequestByJob = function (pubChannel, saveChannelKey, jobData, callback) {
	bgpNode.processNodes(pubChannel, saveChannelKey, jobData, callback);
}

jobsProcess.processControlNodesTreeRequestByJob = function (pubChannel,
                                                               saveChannelKey,
                                                               jobData, callback) {
    bgpNode.getControlNodeLists(pubChannel, saveChannelKey, jobData, callback);
}

jobsProcess.processControlNodeBgpPeerRequestByJob = function(pubChannel,
                                                             saveChannelKey,
                                                             jobData, callback) {
    bgpNode.processControlNodeBgpPeer(pubChannel, saveChannelKey, jobData, callback);
}

jobsProcess.processControlNodesSummaryRequestByJob = function(pubChannel,
                                                             saveChannelKey,
                                                             jobData, callback) {
    bgpNode.processControlNodesSummary(pubChannel, saveChannelKey, jobData, callback);
}

jobsProcess.processComputeNodeInterfaceRequestByJob = function(pubChannel,
                                                             saveChannelKey,
                                                             jobData, callback) {
    computeNode.processComputeNodeInterface(pubChannel, saveChannelKey, jobData, callback);
}

jobsProcess.processComputeNodeAclRequestByJob = function(pubChannel,
                                                         saveChannelKey,
                                                         jobData, callback) {
    computeNode.processComputeNodeAcl(pubChannel, saveChannelKey, jobData, callback);
}

jobsProcess.processTopNwDetailsByProjectRequestByJob = function(pubChannel,
                                                                saveChannelKey,
                                                                jobData, callback) {
    nwMonJobsApi.processTopNwDetailsByProject(pubChannel, saveChannelKey, jobData, callback);
}

jobsProcess.processTopProjectDetailsByDomainRequestByJob = function(pubChannel,
                                                                     saveChannelKey,
                                                                     jobData, callback) {
    nwMonJobsApi.processTopProjectDetailsByDomain(pubChannel, saveChannelKey, jobData, callback);
}

jobsProcess.processTopNwDetailsByDomainRequestByJob = function(pubChannel, 
                                                               saveChannelKey, 
                                                               jobData, callback) {
    nwMonJobsApi.processTopNwDetailsByDomain(pubChannel, saveChannelKey, jobData, callback);
}

jobsProcess.processTopFlowsByConnectedNetworkRequestByJob = function(pubChannel, 
                                                               saveChannelKey, 
                                                               jobData, callback) {
    nwMonJobsApi.processTopFlowsByConnectedNetwork(pubChannel, saveChannelKey, jobData, callback);
}

jobsProcess.processConnNetStatsSummaryRequestByJob = function(pubChannel, 
                                                              saveChannelKey, 
                                                              jobData, callback) {
    nwMonJobsApi.processConnNetStatsSummary(pubChannel, saveChannelKey, jobData, callback);
}

jobsProcess.processTopPortByProjectRequestByJob = function(pubChannel, 
                                                          saveChannelKey, 
                                                          jobData, callback) {
    var appData = jobData.taskData.appData;
    nwMonJobsApi.getTrafficStatsByPort(pubChannel, saveChannelKey, jobData,
                                       callback);
}

jobsProcess.processTopPortByNetworkRequestByJob = function(pubChannel, 
                                                          saveChannelKey, 
                                                          jobData, callback) {
    var appData = jobData.taskData.appData;
    nwMonJobsApi.getTrafficStatsByPort(pubChannel, saveChannelKey, jobData,
                                       callback);
}

jobsProcess.processTopPortByConnNetRequestByJob = function(pubChannel,
                                                           saveChannelKey,
                                                           jobData, callback) {
    nwMonJobsApi.processTopPortByNetwork(pubChannel, saveChannelKey, jobData,
                                         callback,
                                         global.STR_GET_TOP_PORT_BY_CONN_NW);
}

jobsProcess.processTopPeerByNetworkRequestByJob = function(pubChannel, 
                                               saveChannelKey, 
                                               jobData, callback) {
    nwMonJobsApi.processTopPeerByNetwork(pubChannel, saveChannelKey, jobData, callback);
}

jobsProcess.processTopPeerByConnNetRequestByJob = function(pubChannel,
                                                           saveChannelKey,
                                                           jobData, callback) {
    nwMonJobsApi.processTopPeerByNetwork(pubChannel, saveChannelKey, jobData,
                                         callback,
                                         global.STR_GET_TOP_PEER_BY_CONN_NW);
}

jobsProcess.processTopPeerDetailsRequestByJob = function(pubChannel,
                                                     saveChannelKey,
                                                     jobData, callback) {
    nwMonJobsApi.processTopPeerDetails(pubChannel, saveChannelKey, jobData,
                                       callback);
}

jobsProcess.processTopFlowsByDomainRequestByJob = function(pubChannel, 
                                                          saveChannelKey, 
                                                          jobData, callback) {
    nwMonJobsApi.processTopFlowsByDomain(pubChannel, saveChannelKey, jobData, callback);
}

jobsProcess.processTopFlowsByProjectRequestByJob = function(pubChannel, 
                                                          saveChannelKey, 
                                                          jobData, callback) {
    nwMonJobsApi.processTopFlowsByProject(pubChannel, saveChannelKey, jobData, callback);
}

jobsProcess.processTopFlowsByNetworkRequestByJob = function(pubChannel, 
                                                            saveChannelKey, 
                                                            jobData, callback) {
    nwMonJobsApi.processTopFlowsByNetwork(pubChannel, saveChannelKey, jobData,
                                          callback, null);
}

jobsProcess.processTopFlowsByConnNetRequestByJob = function(pubChannel,
                                                            saveChannelKey,
                                                            jobData, callback) {
    nwMonJobsApi.processTopFlowsByNetwork(pubChannel, saveChannelKey, jobData,
                                          callback,
                                          global.STR_GET_TOP_FLOWS_BY_CONN_NW);
}

jobsProcess.processTopPortByDomainRequestByJob = function(pubChannel, 
                                                          saveChannelKey, 
                                                          jobData, callback) {
    nwMonJobsApi.processTopPortByDomain(pubChannel, saveChannelKey, jobData, callback);
}
                                                                                                                             
jobsProcess.processVNFlowSeriesDataRequestByJob = function(pubChannel, 
                                                           saveChannelKey, 
                                                           jobData, callback) {
    nwMonJobsApi.processVNFlowSeriesData(pubChannel, saveChannelKey, 
                                          jobData, callback);
}

jobsProcess.processVNsFlowSeriesDataRequestByJob = function(pubChannel, 
                                                           saveChannelKey, 
                                                           jobData, callback) {
    nwMonJobsApi.processVNsFlowSeriesData(pubChannel, saveChannelKey, jobData, callback);
}

jobsProcess.processTopPeerByDomainRequestByJob = function(pubChannel, 
                                                         saveChannelKey, 
                                                         jobData, callback) {
    nwMonJobsApi.processTopPeerByDomain(pubChannel, saveChannelKey, jobData, callback); 
}

jobsProcess.processTopPeerByProjectRequestByJob = function(pubChannel, 
                                                         saveChannelKey, 
                                                         jobData, callback) {
    nwMonJobsApi.processTopPeerByProject(pubChannel, saveChannelKey, jobData, callback); 
}

jobsProcess.processTopPeerByVMRequestByJob = function(pubChannel, 
                                                      saveChannelKey, 
                                                      jobData, callback) {
    nwMonJobsApi.processTopPeerByVM(pubChannel, saveChannelKey, jobData, callback); 
}

jobsProcess.processTopPortByVMRequestByJob = function(pubChannel, 
                                                      saveChannelKey, 
                                                      jobData, callback) {
    nwMonJobsApi.processTopPortByVM(pubChannel, saveChannelKey, jobData, callback); 
}

jobsProcess.processTopFlowsByVMRequestByJob = function(pubChannel, 
                                                      saveChannelKey, 
                                                      jobData, callback) {
    nwMonJobsApi.processTopFlowsByVM(pubChannel, saveChannelKey, jobData, callback); 
}

jobsProcess.processFlowSeriesByVMRequestByJob = function(pubChannel, 
                                                      saveChannelKey, 
                                                      jobData, callback) {
    nwMonJobsApi.processVMFlowSeriesData(pubChannel, saveChannelKey, jobData, callback); 
}

jobsProcess.processVMStatSummaryRequestByJob = function(pubChannel, 
                                                        saveChannelKey, 
                                                        jobData, callback) {
    nwMonJobsApi.processVMStatSummary(pubChannel, 
                                      saveChannelKey, jobData, callback); 
}

jobsProcess.processPortLevelFlowSeriesRequestByJob = function(pubChannel,
                                                              saveChannelKey,
                                                              jobData, callback) {
    nwMonJobsApi.getPortLevelFlowSeries(pubChannel, saveChannelKey, jobData,
                                        callback);
}

jobsProcess.processFlowDetailsByFlowTupleRequestByJob = function(pubChannel, 
                                                                 saveChannelKey,
                                                                 jobData, callback) {
    nwMonJobsApi.processTopFlowsByNetwork(pubChannel, saveChannelKey, jobData,
                                          callback,
                                          global.STR_GET_FLOW_DETAILS_BY_FLOW_TUPLE);
}

jobsProcess.processCPULoadFlowSeriesRequestByJob = function(pubChannel,
                                                            saveChannelKey,
                                                            jobData,
                                                            callback) {
    nwMonJobsApi.processCPULoadFlowSeries(pubChannel, saveChannelKey,
                                          jobData, callback);
}

function processvRoutersSummaryRequestByJob (pubChannel, saveChannelKey,
                                             jobData, done)
{
    computeNode.getvRouterSummaryByJob(pubChannel, saveChannelKey, jobData,
                                       done);
}

function processvRoutersGenRequestByJob (pubChannel, saveChannelKey,
                                         jobData, done)
{
    computeNode.getvRouterGenByJob(pubChannel, saveChannelKey, jobData,
                                   done);
}

jobsProcess.mainJobprocessControlNodesSummaryRequestByJob = 
    function(pubChannel, saveChannelKey, dependData, storedData, jobData, callback) {
    bgpNode.getControlNodesSummary(pubChannel, saveChannelKey, JSON.parse(dependData), 
                                   storedData, jobData, callback);
}

jobsProcess.mainJobprocessControlNodeBgpPeerRequestByJob =   
    function(pubChannel, saveChannelKey, dependData, storedData, jobData, callback) {
    bgpNode.getControlNodeBgpPeer(pubChannel, saveChannelKey, dependData, 
                                  storedData, jobData, callback);
}

jobsProcess.mainJobprocessComputeNodeInterfaceRequestByJob =
    function(pubChannel, saveChannelKey, dependData, storedData, jobData, callback) {
    computeNode.getComputeNodeInterface(pubChannel, saveChannelKey, dependData, 
                                        storedData, jobData, callback);
}

jobsProcess.mainJobprocessComputeNodeAclRequestByJob =
    function(pubChannel, saveChannelKey, dependData, storedData, jobData, callback) {
    computeNode.getComputeNodeAcl(pubChannel, saveChannelKey, dependData, 
                                  storedData, jobData, callback);
}

jobsProcess.processControlNodeAutoCompleteListRequestByJob =   
    function(pubChannel, saveChannelKey, jobData, callback) {
    bgpNode.getControlNodeAutoCompleteList(pubChannel, saveChannelKey, jobData, callback);
}
  
jobsProcess.processvRouterListRequestByJob =   
    function(pubChannel, saveChannelKey, jobData, callback) {
    computeNode.getvRouterList(pubChannel, saveChannelKey, jobData, callback);
}

jobsProcess.processcRouterAclFlowsRequestByJob =
    function(pubChannel, saveChannelKey, jobData, callback) {
    computeNode.getvRouterAclFlows(pubChannel, saveChannelKey, jobData, callback);
}

exports.processvRoutersSummaryRequestByJob = processvRoutersSummaryRequestByJob;
exports.processvRoutersGenRequestByJob = processvRoutersGenRequestByJob;

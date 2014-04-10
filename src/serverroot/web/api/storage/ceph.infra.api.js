/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

var cacheApi = require('../../core/cache.api'),
    global   = require('../../../common/global'),
    commonUtils = require('../../../utils/common.utils'),
    config = require('../../../../../config/config.global.js'),
    rest = require('../../../common/rest.api'),
    storageServer= require('../../../common/cephServer.api'),
    async = require('async'),
    jsonPath = require('JSONPath').eval,

storageInfraApi = module.exports;

function getStorageClusterStatus(req, res ){
    url = "/status";
   // console.log("get data:"+url);
    cacheApi.queueDataFromCacheOrSendRequest(req, res, global.STR_JOB_TYPE_CACHE,
                                             global.STR_CEPH_TYPE_CLUSTER, url,
                                             0, 1, 0, -1, true, null);
}


function getStorageClusterHealthStatus(req, res, appData){
    url = "/health";
   storageServer.apiGet(url, appData, function (error, resultJSON) {
        if(!error && (resultJSON)) {
            var resultJSON = parseStorageHealthStatusData(resultJSON);
            commonUtils.handleJSONResponse(null, res, resultJSON);
        } else {
            commonUtils.handleJSONResponse(error, res, null);
        }
    });
   
}

function parseStorageHealthStatusData(resultJSON){
    var emptyObj = {};  
        var healthJSON = {};
        var status = jsonPath(resultJSON, "$..status");
        var summary= jsonPath(resultJSON, "$..summary");
        var details= jsonPath(resultJSON, "$..detail");
        if (status.length > 0 ) {
            var temp = new Object();
            temp["overall_status"] = status[0];
            temp["details"] = details[0];
            temp["summary"] = summary[0];
            healthJSON['cluster_status']= temp;
            return healthJSON;
        }
        return emptyObj;
}


function getStorageClusterActivity(req, res,appData){
    url = "/status";
     storageServer.apiGet(url, appData,url, function (error, resultJSON) {
            if(!error && (resultJSON)) {
                var resultJSON = parseStorageClusterActivityData(resultJSON);
                commonUtils.handleJSONResponse(null, res, resultJSON);
            } else {
                commonUtils.handleJSONResponse(error, res, null);
            }
        });  
}

function parseStorageClusterActivityData(activityJSON){
   return activityJSON;
}

function getStorageMonitorList(req, res, appData){
    url = "/status";
     storageServer.apiGet(url, appData,function (error, resultJSON) {
            if(!error && (resultJSON)) {
                var resultJSON = parseStorageClusterMonitorList(resultJSON);
                commonUtils.handleJSONResponse(null, res, resultJSON);
            } else {
                commonUtils.handleJSONResponse(error, res, null);
            }
        });   
}

function parseStorageClusterMonitorList(resultJSON){
   var emptyObj = {};  
        var monJSON ={};
        var monitor = jsonPath(resultJSON, "$..mons");
        if(monitor.length >2){
            var temp = new Object();
            var status= jsonPath(resultJSON, "$..overall_status");
            temp["overall_status"] = status[0];
            temp["all_mons"]= monitor[0];
            temp["mons_activity"]= monitor[1];
            temp["active_mons"]= monitor[2];
            monJSON['monitor_status']= temp;
            return monJSON;
        }

    return emptyObj;
}


function getStorageClusterUsageData(req, res, appData){
    url = "/df";
     storageServer.apiGet(url, appData, function (error, resultJSON) {
            if(!error && (resultJSON)) {
                var resultJSON = parseStorageClusterUsageData(resultJSON);
                commonUtils.handleJSONResponse(null, res, resultJSON);
            } else {
                commonUtils.handleJSONResponse(error, res, null);
            }
        });  
}

function parseStorageClusterUsagaeData(usageJSON){
   return usageJSON;
}

function getStorageOSDSummary(req, res, appData){
    url = "/osd/stat";
     storageServer.apiGet(url, appData, function (error, resultJSON) {
            if(!error && (resultJSON)) {
                var resultJSON = parseStorageOSDData(resultJSON);
                commonUtils.handleJSONResponse(null, res, resultJSON);
            } else {
                commonUtils.handleJSONResponse(error, res, null);
            }
        });     
}

function parseStorageOSDData(osdJSON){
    var osdMapJSON ={};    
    osdMapJSON['osd_stat']= osdJSON;
    return osdMapJSON;
}

function getOSDListURLs(appData){
    var dataObjArr = [];
    urlOSDsFromPG = "/pg/dump?dumpcontents=osds";
    commonUtils.createReqObj(dataObjArr, urlOSDsFromPG, null, null, 
                                         null, null, appData);
    urlOSDTree = "/osd/tree";
    commonUtils.createReqObj(dataObjArr, urlOSDTree, null, null, 
                                         null, null, appData);
    urlOSDDump = "/osd/dump";
    commonUtils.createReqObj(dataObjArr, urlOSDDump, null, null, 
                                         null, null, appData);
    return dataObjArr;
}

function getStorageOSDList(req, res, appData){
    var resultJSON = [];
    dataObjArr = getOSDListURLs(appData);
    async.map(dataObjArr,
                      commonUtils.getAPIServerResponse(storageServer.apiGet, true),
                      function(err, data) {
                resultJSON = parseStorageOSDList(data);        
                commonUtils.handleJSONResponse(err, res, resultJSON);
            });
 
}

function parseStorageOSDList(osdJSON){
    var emptyObj = {};  
    var osdList={};
    var osdPG= osdJSON[0];
    var osdTree= osdJSON[1];
    var osdDump= osdJSON[2];

    var rootMap = jsonPath(osdTree, "$..nodes[?(@.type=='root')]");
    var hostMap = jsonPath(osdTree, "$..nodes[?(@.type=='host')]");
    var osds = jsonPath(osdTree, "$..nodes[?(@.type=='osd')]");
    
    if (osds.length > 0) {
        var osdMapJSON = new Object();
        parseOSDFromPG(osds,osdPG);
        parseOSDFromDump(osds,osdDump);
        hostMap = parseHostFromOSD(hostMap,osds, true);
        osdMapJSON["osd_tree"]= parseRootFromHost(rootMap,hostMap,true);
        osdList= osdMapJSON;
        return osdList;
    }
    return emptyObj;
}

function parseRootFromHost(rootJSON, hostJSON, treeReplace){
    var chldCnt= rootJSON[0].children.length;
   // console.log("chldCnt:"+chldCnt);
     for(i=0;i< chldCnt;i++){ 
        var chldId= rootJSON[0].children[i];
        // console.log("chlId:"+chldId);
        var hostCnt= hostJSON.length;
        for(j=0;j< hostCnt;j++){
            var hostId= hostJSON[j].id;
            if(chldId == hostId){
                rootJSON[0].children[i] = hostJSON[j];
/*              console.log("chlId:"+chldId);
                console.log("hostId:"+hostId);*/
            }
        }
    }
    if(treeReplace){
        var jsonstr = JSON.stringify(rootJSON);
        var new_jsonstr = jsonstr.replace(/children/g, "hosts");
        rootJSON = JSON.parse(new_jsonstr);
    }

    return rootJSON;
}

function parseHostFromOSD(hostJSON,osdsJSON, treeReplace){
    var hstCnt= hostJSON.length;
    for(i=0;i< hstCnt;i++){       
        var cldCnt= hostJSON[i].children.length;
        for(j=0;j< cldCnt; j++){
            var chlId= hostJSON[i].children[j];
            for(k=0;k< osdsJSON.length;k++){
                var osdId= osdsJSON[k].id;
                if(chlId==osdId){
                  /*  console.log("hstCnt:"+hostJSON[i].name);
                    console.log("hstlength:"+cldCnt);
                    console.log("chlId:"+chlId);
                    console.log("osdId:"+osdId);*/
                    hostJSON[i].children[j] = osdsJSON[k];
                }
            }
        }
    }
    if(treeReplace){
        var jsonstr = JSON.stringify(hostJSON);
        var new_jsonstr = jsonstr.replace(/children/g, "osds");
        hostJSON = JSON.parse(new_jsonstr);
    }

    return hostJSON;
}

function getStorageOSDTree(req, res, appData){
    var resultJSON = [];
    dataObjArr = getOSDListURLs(appData);
    async.map(dataObjArr,
                      commonUtils.getAPIServerResponse(storageServer.apiGet, true),
                      function(err, data) {
                resultJSON = parseStorageOSDTree(data);        
                commonUtils.handleJSONResponse(err, res, resultJSON);
            });
 
}

function parseStorageOSDTree(osdJSON){
    var emptyObj = {};  
    var osdList={};
    var osdPG= osdJSON[0];
    var osdTree= osdJSON[1];
    var osdDump= osdJSON[2];
    var rootMap = jsonPath(osdTree, "$..nodes[?(@.type=='root')]");
    var hostMap = jsonPath(osdTree, "$..nodes[?(@.type=='host')]");
    var osds = jsonPath(osdTree, "$..nodes[?(@.type=='osd')]");
    if (osds.length > 0) {
        var osdMapJSON = new Object();
        parseOSDFromPG(osds,osdPG);
        parseOSDFromDump(osds,osdDump);
        hostMap = parseHostFromOSD(hostMap,osds, false);
        osdMapJSON["osd_tree"]= parseRootFromHost(rootMap,hostMap,false);
        osdList= osdMapJSON;
        return osdList;
    }
    return emptyObj;
}

function parseOSDFromPG(osdTree, osdPG ){
    var nodeCnt= osdTree.length;
    //log.console("count:"+nodeCnt);
    for (i = 0; i < nodeCnt; i++) {
        var treeId=osdTree[i].id;
        var pgOsdCnt = jsonPath(osdPG,"$.output.length")[0];
        for(j=0; j< pgOsdCnt; j++){
            var pgOSDId= jsonPath(osdPG,"$.output["+j+"].osd")[0];
            if( treeId == pgOSDId){
              /*  console.log("treeId:"+treeId);
                console.log("pgOSDId:"+pgOSDId);*/
                osdTree[i]['kb']=jsonPath(osdPG,"$.output["+j+"].kb")[0];
                osdTree[i]['kb_avail']=jsonPath(osdPG, "$.output["+j+"].kb_avail")[0];
                osdTree[i]['kb_used']=jsonPath(osdPG, "$.output["+j+"].kb_used")[0];
                osdTree[i]['fs_perf_stat']=jsonPath(osdPG, "$.output["+j+"].fs_perf_stat")[0];
            }   
        }
    }
    return osdTree;
}

function parseOSDFromDump(osdTree, osdDump){
    var nodeCnt= osdTree.length;
    var osdDumpCnt = jsonPath(osdDump,"$.output.osds.length")[0];
   // console.log("Dump count:"+osdDumpCnt);
    for (i = 0; i < nodeCnt; i++) {
        var treeId=osdTree[i].id;
        for(j=0; j< osdDumpCnt; j++){
            var dumpOSDId= jsonPath(osdDump,"$.output.osds["+j+"].osd")[0];
            /*console.log("treeId:"+treeId);
            console.log("dumpOSDId:"+dumpOSDId);
            */
            if( treeId == dumpOSDId){
                osdTree[i]['heartbeat_back_addr']=jsonPath(osdDump,"$.output.osds["+j+"].heartbeat_back_addr")[0];
                osdTree[i]['heartbeat_front_addr']=jsonPath(osdDump, "$.output.osds["+j+"].heartbeat_front_addr")[0];
                osdTree[i]['public_addr']=jsonPath(osdDump, "$.output.osds["+j+"].public_addr")[0];
                osdTree[i]['cluster_addr']=jsonPath(osdDump, "$.output.osds["+j+"].cluster_addr")[0];
                osdTree[i]['uuid']=jsonPath(osdDump, "$.output.osds["+j+"].uuid")[0];
                osdTree[i]['down_at']=jsonPath(osdDump, "$.output.osds["+j+"].down_at")[0];
                osdTree[i]['up_from']=jsonPath(osdDump, "$.output.osds["+j+"].up_from")[0];
                osdTree[i]['lost_at']=jsonPath(osdDump, "$.output.osds["+j+"].lost_at")[0];
                osdTree[i]['up_thru']=jsonPath(osdDump, "$.output.osds["+j+"].up_thru")[0];
                custer_status= jsonPath(osdDump, "$.output.osds["+i+"].in")[0]
           
                if(custer_status==1){
                     osdTree[i]['cluster_status']='in';
                }else{
                     osdTree[i]['cluster_status']='out';
                }
                osdTree[i]['up']=jsonPath(osdDump, "$.output.osds["+i+"].up")[0];;
                osdTree[i]['in']=custer_status;
                osdTree[i]['state']=jsonPath(osdDump, "$.output.osds["+i+"].state")[0];
                osdTree[i]['last_clean_begin']=jsonPath(osdDump, "$.output.osds["+i+"].last_clean_begin")[0];
                osdTree[i]['last_clean_end']=jsonPath(osdDump, "$.output.osds["+i+"].last_clean_end")[0];
            }   
            var dumpOSDId= jsonPath(osdDump,"$.output.osd_xinfo["+j+"].osd")[0];
            if( treeId == dumpOSDId){
                osdTree[i]['osd_xinfo']=jsonPath(osdDump,"$.output.osd_xinfo["+j+"]")[0];
            }
        }

    }
    return osdTree;
}

function getStoragePGStatus(req, res, appData){
    url = "/status";
     storageServer.apiGet(url, appData, function (error, resultJSON) {
            if(!error && (resultJSON)) {
                var resultJSON = parseStoragePGStatus(resultJSON);
                commonUtils.handleJSONResponse(null, res, resultJSON);
            } else {
                commonUtils.handleJSONResponse(error, res, null);
            }
        });
}

function parseStoragePGStatus(pgDataJSON){
    var emptyObj = {};  
    var pgMapJSON ={};
    var pgMap = jsonPath(pgDataJSON, "$..pgmap");
    if (pgMap.length > 0) {
        pgMapJSON['pgmap']= pgMap[0];
        return pgMapJSON;
    }
    return emptyObj;
}

function getStoragePGSummary(req, res, appData){
    var dataObjArr = [];
    var resultJSON = [];
    urlStatus = "/status";
    commonUtils.createReqObj(dataObjArr, urlStatus, null, null, 
                                         null, null, appData);

    urlPGSummary = "/pg/dump?dumpcontents=summary";
    commonUtils.createReqObj(dataObjArr, urlPGSummary, null, null, 
                                         null, null, appData);
     async.map(dataObjArr,
                      commonUtils.getAPIServerResponse(storageServer.apiGet, true),
                      function(err, data) {
                resultJSON = parseStoragePGData(data);        
                commonUtils.handleJSONResponse(err, res, resultJSON);
            });
}

function parseStoragePGData(pgJSON){
    var emptyObj = {};  
    var pgMapJSON ={};
    var pgStatusJson= pgJSON[0];
    var pgSummary= pgJSON[1];
    var pgMap = jsonPath(pgStatusJson, "$..pgmap");
    var pgDelta = jsonPath(pgSummary, "$..pg_stats_delta")[0];
    var pgSum= jsonPath(pgSummary, "$..pg_stats_sum")[0]; 

    if (pgMap.length > 0) {
        pgMapJSON['pg_overview']= pgMap[0];
        pgMapJSON['pg_stats_delta']=pgDelta;
        pgMapJSON['pg_stats_sum']=pgSum;
        return pgMapJSON;
    }
    return emptyObj;
}

function getStorageClusterDFStatus(req, res, appData){
    url = "/df";
    storageServer.apiGet(url, appData, function (error, resultJSON) {
        if(!error && (resultJSON)) {
            var resultJSON = parseStorageDFData(resultJSON);
            commonUtils.handleJSONResponse(null, res, resultJSON);
        } else {
            commonUtils.handleJSONResponse(error, res, null);
        }
    });
}

function parseStorageDFData(dfDataJSON){
    var dfJSON ={};
    dfJSON['utilization_stats']= dfDataJSON;
    return dfJSON;
}

function getStoragePGPoolsInfo(req, res, appData){
    url = "/pg/dump_pools_json";
     storageServer.apiGet(url, appData, function (error, resultJSON) {
            if(!error && (resultJSON)) {
                var resultJSON = parseStoragePGPoolsData(resultJSON);
                commonUtils.handleJSONResponse(null, res, resultJSON);
            } else {
                commonUtils.handleJSONResponse(error, res, null);
            }
        });
}

function parseStoragePGPoolsData(poolsJSON){
    var resultJSON ={};
    resultJSON['pools_info']= jsonPath(poolsJSON, "$..output")[0];
    return resultJSON;
}

function getStoragePGStuck(req, res, appData){
    url = "/pg/dump_stuck";
     storageServer.apiGet(url, appData, function (error, resultJSON) {
            if(!error && (resultJSON)) {
                var resultJSON = parseStoragePGStuckData(resultJSON);
                commonUtils.handleJSONResponse(null, res, resultJSON);
            } else {
                commonUtils.handleJSONResponse(error, res, null);
            }
        });
}

function parseStoragePGStuckData(pgStuckJSON){
    var resultJSON ={};
   // resultJSON['pg_pools_info']= jsonPath(poolsJSON, "$..output")[0];
    return pgStuckJSON;
}

/* List all public functions */
exports.getStorageClusterStatus= getStorageClusterStatus;
exports.getStorageClusterDFStatus=getStorageClusterDFStatus
exports.getStorageClusterHealthStatus = getStorageClusterHealthStatus;
exports.getStorageClusterActivity = getStorageClusterActivity;
exports.getStorageMonitorList = getStorageMonitorList;
exports.getStorageClusterUsageData= getStorageClusterUsageData;
exports.getStorageOSDSummary=getStorageOSDSummary
exports.getStoragePGSummary = getStoragePGSummary;
exports.getStorageOSDList=getStorageOSDList
exports.getStorageOSDTree=getStorageOSDTree
exports.getStoragePGStatus=getStoragePGStatus
exports.getStoragePGPoolsInfo=getStoragePGPoolsInfo
exports.getStoragePGStuck=getStoragePGStuck




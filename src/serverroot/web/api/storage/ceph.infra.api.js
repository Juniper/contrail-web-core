/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

var cacheApi = require('../../core/cache.api'),
    global   = require('../../../common/global'),
    commonUtils = require('../../../utils/common.utils'),
    config = require('../../../../../config/config.global.js'),
    rest = require('../../../common/rest.api'),
    cephServer= require('../../../common/cephServer.api'),
    async = require('async'),
    jsonPath = require('JSONPath').eval,

cephInfraApi = module.exports;

function getCephClusterStatus(req, res ){
    url = "/status";
   // console.log("get data:"+url);
    cacheApi.queueDataFromCacheOrSendRequest(req, res, global.STR_JOB_TYPE_CACHE,
                                             global.STR_CEPH_TYPE_CLUSTER, url,
                                             0, 1, 0, -1, true, null);
}


function getCephClusterHealthStatus(req, res, appData){
    url = "/health";
   cephServer.apiGet(url, appData, function (error, resultJSON) {
        if(!error && (resultJSON)) {
            var resultJSON = parseCephHealthStatusData(resultJSON);
            commonUtils.handleJSONResponse(null, res, resultJSON);
        } else {
            commonUtils.handleJSONResponse(error, res, null);
        }
    });
   
}

function parseCephHealthStatusData(resultJSON){
    var emptyObj = {};  
        var healthJSON = {};
        var status = jsonPath(resultJSON, "$..status");
        var summary= jsonPath(resultJSON, "$..summary");
        var details= jsonPath(resultJSON, "$..detail");
        if (status.length > 0 ) {
            var temp = new Object();
            temp["overall-status"] = status[0];
            temp["details"] = details[0];
            temp["summary"] = summary[0];
            healthJSON['cluster-status']= temp;
            return healthJSON;
        }
        return emptyObj;
}


function getCephClusterActivity(req, res,appData){
    url = "/status";
     cephServer.apiGet(url, appData,url, function (error, resultJSON) {
            if(!error && (resultJSON)) {
                var resultJSON = parseCephClusterActivityData(resultJSON);
                commonUtils.handleJSONResponse(null, res, resultJSON);
            } else {
                commonUtils.handleJSONResponse(error, res, null);
            }
        });  
}

function parseCephClusterActivityData(activityJSON){
   return activityJSON;
}

function getCephMonitorList(req, res, appData){
    url = "/status";
     cephServer.apiGet(url, appData,function (error, resultJSON) {
            if(!error && (resultJSON)) {
                var resultJSON = parseCephClusterMonitorList(resultJSON);
                commonUtils.handleJSONResponse(null, res, resultJSON);
            } else {
                commonUtils.handleJSONResponse(error, res, null);
            }
        });   
}

function parseCephClusterMonitorList(resultJSON){
   var emptyObj = {};  
        var monJSON ={};
        var monitor = jsonPath(resultJSON, "$..mons");
        if(monitor.length >2){
            var temp = new Object();
            var status= jsonPath(resultJSON, "$..overall_status");
            temp["overall-status"] = status[0];
            temp["all-mons"]= monitor[0];
            temp["mons-activity"]= monitor[1];
            temp["active-mons"]= monitor[2];
            monJSON['monitor-status']= temp;
            return monJSON;
        }

    return emptyObj;
}


function getCephClusterUsageData(req, res, appData){
    url = "/df";
     cephServer.apiGet(url, appData, function (error, resultJSON) {
            if(!error && (resultJSON)) {
                var resultJSON = parseCephClusterUsageData(resultJSON);
                commonUtils.handleJSONResponse(null, res, resultJSON);
            } else {
                commonUtils.handleJSONResponse(error, res, null);
            }
        });  
}

function parseCephClusterUsagaeData(usageJSON){
   return usageJSON;
}

function getCephOSDSummary(req, res, appData){
    url = "/osd/stat";
     cephServer.apiGet(url, appData, function (error, resultJSON) {
            if(!error && (resultJSON)) {
                var resultJSON = parseCephOSDData(resultJSON);
                commonUtils.handleJSONResponse(null, res, resultJSON);
            } else {
                commonUtils.handleJSONResponse(error, res, null);
            }
        });     
}

function parseCephOSDData(osdJSON){
        var osdMapJSON ={};    
        osdMapJSON['osd-stat']= osdJSON;
        return osdMapJSON;
}

function getCephOSDList(req, res, appData){
     var dataObjArr = [];
      var resultJSON = [];
    urlOSDsFromPG = "/pg/dump?dumpcontents=osds";
    commonUtils.createReqObj(dataObjArr, urlOSDsFromPG, null, null, 
                                         null, null, appData);
    urlOSDTree = "/osd/tree";
    commonUtils.createReqObj(dataObjArr, urlOSDTree, null, null, 
                                         null, null, appData);
    urlOSDDump = "/osd/dump";
    commonUtils.createReqObj(dataObjArr, urlOSDDump, null, null, 
                                         null, null, appData);
     async.map(dataObjArr,
                      commonUtils.getAPIServerResponse(cephServer.apiGet, true),
                      function(err, data) {
                resultJSON = parseCephOSDList(data);        
                commonUtils.handleJSONResponse(err, res, resultJSON);
            });
 
}
function parseCephOSDList(osdJSON){
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
        hostMap = parseHostFromOSD(hostMap,osds);
        osdMapJSON["osd_tree"]= parseRootFromHost(rootMap,hostMap);
        osdList= osdMapJSON;
        return osdList;
    }
    return emptyObj;
}

function parseRootFromHost(rootJSON, hostJSON){
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
    var jsonstr = JSON.stringify(rootJSON);
    var new_jsonstr = jsonstr.replace(/children/g, "hosts");
    rootJSON = JSON.parse(new_jsonstr);

    return rootJSON;
}

function parseHostFromOSD(hostJSON,osdsJSON){
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

    var jsonstr = JSON.stringify(hostJSON);

    var new_jsonstr = jsonstr.replace(/children/g, "osds");

    hostJSON = JSON.parse(new_jsonstr);
    return hostJSON;
}


function getCephOSDTree(req, res, appData){
     var dataObjArr = [];
      var resultJSON = [];
    urlOSDsFromPG = "/pg/dump?dumpcontents=osds";
    commonUtils.createReqObj(dataObjArr, urlOSDsFromPG, null, null, 
                                         null, null, appData);
    urlOSDTree = "/osd/tree";
    commonUtils.createReqObj(dataObjArr, urlOSDTree, null, null, 
                                         null, null, appData);

   urlOSDDump = "/osd/dump";
    commonUtils.createReqObj(dataObjArr, urlOSDDump, null, null, 
                                         null, null, appData);
     async.map(dataObjArr,
                      commonUtils.getAPIServerResponse(cephServer.apiGet, true),
                      function(err, data) {
                resultJSON = parseCephOSDTree(data);        
                commonUtils.handleJSONResponse(err, res, resultJSON);
            });
 
}
function parseCephOSDTree(osdJSON){
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
        hostMap = parseHostFromOSDTree(hostMap,osds);
        osdMapJSON["osd_tree"]= parseRootFromHostTree(rootMap,hostMap);
        osdList= osdMapJSON;
        return osdList;
    }
    return emptyObj;
}

function parseRootFromHostTree(rootJSON, hostJSON){
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
    return rootJSON;
}

function parseHostFromOSDTree(hostJSON,osdsJSON){
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
    return hostJSON;
}



function parseOSDFromPG(osdTree, osdPG ){
    var nodeCnt= osdTree.length;
    //log.console("count:"+nodeCnt);
       for (i = 0; i < nodeCnt; i++) {
        var treeId=osdTree[i].id;
        var pgOSDId= jsonPath(osdPG,"$.output["+i+"].osd")[0];
        if( treeId == pgOSDId){
          /*  console.log("treeId:"+treeId);
            console.log("pgOSDId:"+pgOSDId);*/
            osdTree[i]['kb']=jsonPath(osdPG,"$.output["+i+"].kb")[0];
            osdTree[i]['kb_avail']=jsonPath(osdPG, "$.output["+i+"].kb_avail")[0];
            osdTree[i]['kb_used']=jsonPath(osdPG, "$.output["+i+"].kb_used")[0];
            osdTree[i]['fs_perf_stat']=jsonPath(osdPG, "$.output["+i+"].fs_perf_stat")[0];
        }   
    }
    return osdTree;
}

function parseOSDFromDump(osdTree, osdDump){
    var nodeCnt= osdTree.length;
    //console.log("Dump count:"+nodeCnt);
       for (i = 0; i < nodeCnt; i++) {
        var treeId=osdTree[i].id;
        var dumpOSDId= jsonPath(osdDump,"$.output.osds["+i+"].osd")[0];
            /*console.log("treeId:"+treeId);
            console.log("dumpOSDId:"+dumpOSDId);
            */
        if( treeId == dumpOSDId){
            osdTree[i]['heartbeat_back_addr']=jsonPath(osdDump,"$.output.osds["+i+"].heartbeat_back_addr")[0];
            osdTree[i]['heartbeat_front_addr']=jsonPath(osdDump, "$.output.osds["+i+"].heartbeat_front_addr")[0];
            osdTree[i]['public_addr']=jsonPath(osdDump, "$.output.osds["+i+"].public_addr")[0];
            osdTree[i]['cluster_addr']=jsonPath(osdDump, "$.output.osds["+i+"].cluster_addr")[0];
            osdTree[i]['uuid']=jsonPath(osdDump, "$.output.osds["+i+"].uuid")[0];
            osdTree[i]['down_at']=jsonPath(osdDump, "$.output.osds["+i+"].down_at")[0];
            osdTree[i]['up_from']=jsonPath(osdDump, "$.output.osds["+i+"].up_from")[0];
            osdTree[i]['lost_at']=jsonPath(osdDump, "$.output.osds["+i+"].lost_at")[0];
            osdTree[i]['up_thru']=jsonPath(osdDump, "$.output.osds["+i+"].up_thru")[0];
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
        var dumpOSDId= jsonPath(osdDump,"$.output.osd_xinfo["+i+"].osd")[0];
            /*console.log("treeId:"+treeId);
            console.log("dumpOSDId:"+dumpOSDId);
            */
        if( treeId == dumpOSDId){
            osdTree[i]['osd_xinfo']=jsonPath(osdDump,"$.output.osd_xinfo["+i+"]")[0];
         //   osdTree[i]['heartbeat_front_addr']=jsonPath(osdDump, "$.output.osds["+i+"].heartbeat_front_addr")[0];
         //   osdTree[i]['public_addr']=jsonPath(osdDump, "$.output.osds["+i+"].public_addr")[0];
       }

    }
 //console.log("osdTreeDump:"+osdTree[0]['last_clean_end']);

    return osdTree;
}


function getCephPGSummary(req, res, appData){
    url = "/status";
     cephServer.apiGet(url, appData, function (error, resultJSON) {
            if(!error && (resultJSON)) {
                var resultJSON = parseCephPGData(resultJSON);
                commonUtils.handleJSONResponse(null, res, resultJSON);
            } else {
                commonUtils.handleJSONResponse(error, res, null);
            }
        });
}

function parseCephPGData(pgDataJSON){
    var emptyObj = {};  
    var pgMapJSON ={};
    var pgMap = jsonPath(pgDataJSON, "$..pgmap");
    if (pgMap.length > 0) {
        pgMapJSON['pgmap']= pgMap[0];
        return pgMapJSON;
    }
    return emptyObj;
}

function getCephClusterDFStatus(req, res, appData){
    url = "/df";
     cephServer.apiGet(url, appData, function (error, resultJSON) {
            if(!error && (resultJSON)) {
                var resultJSON = parseCephDFData(resultJSON);
                commonUtils.handleJSONResponse(null, res, resultJSON);
            } else {
                commonUtils.handleJSONResponse(error, res, null);
            }
        });
}

function parseCephDFData(dfDataJSON){
    var emptyObj = {};  
    var dfJSON ={};
    
        dfJSON['utilization-stats']= dfDataJSON;
        return dfJSON;
}

function createEmptyPaginatedData ()
{
    var resultJSON = {};
    resultJSON['data'] = {};
    resultJSON['data']['value'] = [];
    resultJSON['more'] = false;
    resultJSON['lastKey'] = null;
    return resultJSON;
}


/* List all public functions */
exports.getCephClusterStatus= getCephClusterStatus;
exports.getCephClusterDFStatus=getCephClusterDFStatus
exports.getCephClusterHealthStatus = getCephClusterHealthStatus;
exports.getCephClusterActivity = getCephClusterActivity;
exports.getCephMonitorList = getCephMonitorList;
exports.getCephClusterUsageData= getCephClusterUsageData;
exports.getCephOSDSummary=getCephOSDSummary
exports.getCephPGSummary = getCephPGSummary;
exports.getCephOSDList=getCephOSDList
exports.getCephOSDTree=getCephOSDTree



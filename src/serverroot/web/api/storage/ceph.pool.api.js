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

storagePoolsApi = module.exports;

function getStoragePGPoolsInfo(req, res, appData){

    var dataObjArr = [];
    var resultJSON = [];
    urlPools = "/pg/dump_pools_json";
    commonUtils.createReqObj(dataObjArr, urlPools, null, null, 
                                         null, null, appData);

    urlDF = "/df";
    commonUtils.createReqObj(dataObjArr, urlDF, null, null, 
                                         null, null, appData);

    async.map(dataObjArr,
                      commonUtils.getAPIServerResponse(storageServer.apiGet, true),
                      function(err, data) {
                resultJSON = parseStoragePGPoolsData(data);        
                commonUtils.handleJSONResponse(err, res, resultJSON);
            });
}

function parseStoragePGPoolsData(poolJSON){
    var resultJSON = {};
    var pools= jsonPath(poolJSON[0],"$.output")[0];
    var odf= poolJSON[1];
    var poolMapJSON = new Object();
    poolMapJSON['pools_info']= parsePoolsData(pools, odf);
    resultJSON = poolMapJSON;
    return resultJSON;
}

function parsePoolsData(pools, odf){
    var nodeCnt= pools.length;
    for (i = 0; i < nodeCnt; i++) { 
        var pId=jsonPath(pools,"$["+i+"].poolid")[0];
        var dfCnt = jsonPath(odf,"$.output.pools.length")[0];
        for(j=0; j< dfCnt; j++){
            var dfPoolId= jsonPath(odf,"$.output.pools["+j+"].id")[0];
            if( pId == dfPoolId){
                 pools[i]['name']=jsonPath(odf,"$.output.pools["+j+"].name")[0];
                 pools[i]['stats']=jsonPath(odf,"$.output.pools["+j+"].stats")[0];
                
            }

        }
     }
    return pools;
}



/* List all public functions */
exports.getStoragePGPoolsInfo=getStoragePGPoolsInfo





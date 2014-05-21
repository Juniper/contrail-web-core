/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var commonUtils = require('../utils/common.utils'),
    configApiServer = require('./configServer.api'),
    opApiServer = require('./opServer.api'),
    adminApiHelper = require('./adminapi.helper'),
    logutils = require('../utils/log.utils'),
    jsonPath = require('JSONPath').eval,
    assert = require('assert'),
    async = require('async');

function getModuleType (modName)
{
    switch(modName){
    case 'VRouterAgent':
        return 'Compute';
    case 'ControlNode':
    case 'DnsAgent':
        return 'Control';
    case 'ApiServer':
    case 'DiscoveryService':
    case 'ServiceMonitor':
    case 'Schema':
        return 'Config';
    case 'Collector':
    case 'OpServer':
    case 'QueryEngine':
        return 'Analytics';
    default:
        logutils.logger.error('Unknown moduleName used: ' + modName);
        assert(0);
    }
}

function modExistInGenList (moduleList, hostName, genName)
{
    if ((null == moduleList) || (null == genName)) {
        return false;
    }
    var modCnt = moduleList.length;
    for (var i = 0; i < modCnt; i++) {
        var modType = getModuleType(moduleList[i]);
        gen = hostName + ':' + modType + ':' + moduleList[i];
        pos = genName.indexOf(gen);
        if (-1 != pos) {
            return true;
        }
    }
    return false;
}

function getModInstName (genName)
{
    if (null == genName) {
        return null;
    }
    /* Generator Name field is a combination of 
       hostname:type:module:instId
       This function returns type:module:instId
     */
    var pos = genName.indexOf(':');
    return genName.slice(pos + 1);
}

function updateGeneratorInfo (resultJSON, genInfo, hostName, moduleNames)
{
    try {
        var modType = getModuleType(moduleNames[0]);
        var mod = hostName + ':' + modType + ':';
        var genCnt = genInfo.length;
    } catch(e) {
        return resultJSON;
    }
    for (var i = 0; i < genCnt; i++) {
        if (false == modExistInGenList(moduleNames, hostName,
                                       genInfo[i]['name'])) {
            continue;
        }
        try {
            modStr = getModInstName(genInfo[i]['name']);
            resultJSON[modStr] = {};
            resultJSON[modStr] = 
                commonUtils.copyObject(resultJSON[modStr], genInfo[i]['value']);
        } catch(e) {
        }
    }
    return resultJSON;
}

function doNodeExist (configData, moduleName, host)
{
    var fqName = null;
    try {
        var cnt = configData.length;
    } catch(e) {
        return -1;
    }
    for (var i = 0; i < cnt; i++) {
        try {
            if (moduleName == 'ControlNode') {
                fqName = configData[i]['bgp-router']['fq_name'];
            } else {
                fqName = configData[i]['virtual-router']['fq_name'];
            }
            var fqNameLen = fqName.length;
            if (host == fqName[fqNameLen - 1]) {
                configData[i]['visited'] = true;
                return i;
            }
        } catch(e) {
            continue;
        }
    }
    return -1;
}

function getProcStateMappedModule(moduleName)
{
    switch (moduleName) {
    case 'VRouterAgent':
        return 'contrail-vrouter';
    case 'ControlNode':
        return 'contrail-control';
    default:
        return moduleName;
    }
}

function getNodeStatusByUVE (moduleName, uveData)
{
    var procStateList = jsonPath(uveData, "$..process_state_list");
    if (procStateList.length == 0) {
        /* Why? */
        return 'Down';
    }
    moduleName = getProcStateMappedModule(moduleName);
    var len = procStateList[0].length;
    for (var i = 0; i < len; i++) {
        if (moduleName == procStateList[0][i]['process_name']) {
            if (procStateList[0][i]['process_state'] ==
                'PROCESS_STATE_RUNNING') {
                return 'Up';
            }
        }
    }
    return 'Down';
}

function checkAndGetSummaryJSON (configData, uves, moduleNames)
{
    var resultJSON = [];
    var k = 0;
    try {
        var uveData = uves[0]['value'];
        var cnt = uveData.length;
        try {
            var genInfo = uves[1]['value'];
            var genCnt = genInfo.length;
        } catch(e) {
            genInfo = null;
        }
        var j = 0;
        var modCnt = moduleNames.length;
        for (var i = 0; i < cnt; i++) {
            try {
                name = uveData[i]['name'] + ':' + moduleNames[0];
                resultJSON[j] = {};
                resultJSON[j]['name'] = uveData[i]['name'];
                resultJSON[j]['value'] = uveData[i]['value'];
                uveData[i]['visited'] = true;
                configIndex = doNodeExist(configData, moduleNames[0],
                                          uveData[i]['name']);
                if (-1 != configIndex) {
                    resultJSON[j]['value']['ConfigData'] = configData[configIndex];
                } else {
                    resultJSON[j]['value']['ConfigData'] = {};
                }
                resultJSON[j]['nodeStatus'] = getNodeStatusByUVE(moduleNames[0],
                                                                 uveData[i]);
                j++;
            } catch(e) {
                continue;
            }
        }
    } catch(e) {
    }
    /* Now traverse Config Data, if 'visited' not found, then mark as Down */
    cnt = configData.length;
    var nodeFound = false;
    for (i = 0; i < cnt; i++) {
        try {
            if (moduleNames[0] == 'ControlNode') {
                fqName = configData[i]['bgp-router']['fq_name'];
            } else {
                fqName = configData[i]['virtual-router']['fq_name'];
            }
            if (null == configData[i]['visited']) {
                if (moduleNames[0] == 'ControlNode') {
                    if (adminApiHelper.isContrailControlNode(configData[i]['bgp-router'])) {
                        nodeFound = true;
                    }
                } else {
                    nodeFound = true;
                }
            }
            if (true == nodeFound) {
                var fqLen = fqName.length;
                resultJSON[j] = {};
                resultJSON[j]['name'] = fqName[fqLen - 1];
                resultJSON[j]['nodeStatus'] = 'Down';
                resultJSON[j]['value'] = {};
                resultJSON[j]['value']['ConfigData'] = {};
                resultJSON[j]['value']['ConfigData'] = configData[i];
                j++;
            }
            nodeFound = false;
        } catch(e) {
        }
    }
    cnt = resultJSON.length;
    for (var i = 0; i < cnt; i++) {
        try {
            if (resultJSON[i]['value']['ConfigData']['visited']) {
                delete resultJSON[i]['value']['ConfigData']['visited'];
            }
        } catch(e) {
        }
    }
    for (var p = 0; p < j; p++) {
        updateGeneratorInfo(resultJSON[p]['value'], genInfo,
                            resultJSON[p]['name'], moduleNames);
    }
    return resultJSON;
}

function getvRouterAsyncResp (dataObj, callback)
{
    if (true == dataObj['configData']) {
        async.map(dataObj, 
                  commonUtils.getServerResponseByRestApi(configApiServer, true),
                  function(err, data) {
            callback(err, data);
        });
    } else {
        var postData = {};
        if (null != dataObj['cfilt']) {
            postData['cfilt'] = dataObj['cfilt'];
        }
        if (null != dataObj['kfilt']) {
            postData['kfilt'] = dataObj['kfilt'];
        }
        var url = '/analytics/uves/vrouter';
        opApiServer.apiPost(url, postData, dataObj['appData'], 
                            function(err, data) {
            callback(err, data);
        });
    }
}

function getvRouterSummaryConfigUVEData (configData, uuidList, nodeList, addGen,
                                         appData, callback)
{
    var newResult = [];
    var newResultLen = 0;
    var dataObjArr = [];
    var configFound = true;
    var index;

    if (null != uuidList) {
        len = uuidList.length;
    } else if (null != configData) {
        try {
            len = configData['virtual-routers'].length;
        } catch(e) {
            len = 0;
        }
    } else {
        len = 0;
    }
    dataObjArr[0] = [];
    for (var i = 0; i < len; i++) {
        var uuid = (null != configData) ?
            configData['virtual-routers'][i]['uuid'] : uuidList[i];
        var reqUrl = '/virtual-router/' + uuid;
        dataObjArr[0][i] = {};
        dataObjArr[0][i]['reqUrl'] = reqUrl;
        dataObjArr[0][i]['appData'] = appData;
        dataObjArr[0][i]['method'] = global.HTTP_REQUEST_GET;
        dataObjArr[0]['configData'] = true;
    }
    reqUrl = '/analytics/uves/vrouter';
    var cfilt = ['VrouterStatsAgent:cpu_info',
        'VrouterAgent:virtual_machine_list',
        'VrouterAgent:self_ip_list',
        'VrouterAgent:xmpp_peer_list',
        'VrouterAgent:total_interface_count',
        'VrouterAgent:down_interface_count', 'VrouterAgent:connected_networks',
        'VrouterAgent:control_ip', 'VrouterAgent:build_info',
        'VrouterStatsAgent:cpu_share', 'VrouterStatsAgent:process_state_list'];
    var postData = {};
    if (null != nodeList) {
        var nodeCnt = nodeList.length;
        var postDataIncrCnt = 
            Math.ceil(nodeCnt / global.VROUTER_COUNT_IN_JOB);
        var idx = 0;
        for (var i = 0; i < postDataIncrCnt; i++) {
            dataObjArr[i + 1] = {};
            dataObjArr[i + 1]['kfilt'] = [];
            dataObjArr[i + 1]['cfilt'] = cfilt;
            dataObjArr[i + 1]['appData'] = appData;
            dataObjArr[i + 1]['configData'] = false;
            for (j = idx; j < nodeCnt; j++) {
                dataObjArr[i + 1]['kfilt'].push(nodeList[j]);
                if ((j != 0) && (0 == (j + 1) % global.VROUTER_COUNT_IN_JOB)) {
                    idx = j + 1;
                    break;
                }
            }
        }
    } else {
        dataObjArr[0 + 1] = {};
        dataObjArr[0 + 1]['appData'] = appData;
        dataObjArr[0 + 1]['cfilt'] = cfilt;
        dataObjArr[0 + 1]['configData'] = false;
    }
    /* As Config Data we are already getting, so check if we have got Config or
     * not 
     */
    if (!dataObjArr[0].length) {
        /* We did not get config data */
        dataObjArr.splice(0, 1);
        configFound = false;
        index = 0;
    } else {
        index = 1;
    }
    async.mapSeries(dataObjArr, getvRouterAsyncResp, function(err, results) {
        if ((null != err) || (null == results)) {
            callback(err, results, len);
            return;
        }
        var cnt = results.length;
        var resultJSON = [];
        for (var i = index; i < cnt; i++) {
            try {
                resultJSON = resultJSON.concat(results[i]['value']);
            } catch(e) {
                logutils.logger.error("In getvRouterSummaryConfigUVEData():" +
                                      "JSON Parse error: " + e);
            }
        }
        if (true == configFound) {
            newResult = results[0];
            newResultLen = newResult.length;
        } else {
            newResultLen = 0;
        }
        newResult[newResultLen] = {};
        newResult[newResultLen]['value'] = resultJSON;
        callback(err, newResult, len);
    });
}

function dovRouterListProcess (configData, uuidList, nodeList, addGen,
                                   appData, callback)
{
    var uveData = [];
    var confData = [];
    getvRouterSummaryConfigUVEData(configData, uuidList, nodeList, addGen, appData,
                                  function(err, configUVEData,
                                           vRouterCnt) {
        if (null != err) {
            callback(null, []);
            return;
        }
        for (var i = 0; i < vRouterCnt; i++) {
            confData[i] = configUVEData[i];
        }
        var cnt = configUVEData.length;
        for (i = vRouterCnt; i < cnt; i++) {
            uveData[i - vRouterCnt] = configUVEData[i];
        }
        resultJSON =
            checkAndGetSummaryJSON(confData, uveData,
                                   ['VRouterAgent']);
        callback(null, resultJSON);
    });
}

function getNodeListByLastKey (list, count, lastKey, matchStr, uuidList)
{
    var resultJSON = {};
    var retLastUUID = null;
    resultJSON['lastKey'] = null;
    resultJSON['more'] = false;
    resultJSON['nodeList'] = [];
    resultJSON['uuidList'] = [];

    var list = nwMonUtils.makeUVEList(list);
    var index = nwMonUtils.getnThIndexByLastKey (lastKey, list, matchStr);
    if (index == -2) {
        return resultJSON;
    }
    try {
        var cnt = list.length;
    } catch(e) {
        return resultJSON;
    }
    if (cnt == index) {
        /* We are already at end */
        return resultJSON;
    }
    if (-1 == count) {
        totCnt = cnt;
    } else {
        totCnt = index + 1 + count;
    }
    if (totCnt < cnt) {
        retLastUUID = list[totCnt - 1][matchStr];
    }
    for (var i = index + 1; i < totCnt; i++) {
        if (list[i]) {
            resultJSON['nodeList'].push(list[i][matchStr]);
        }
        if (null != uuidList[i]) {
            resultJSON['uuidList'].push(uuidList[i]);
        }
    }
    if (null != retLastUUID) {
        resultJSON['more'] = true;
    }
    resultJSON['lastKey'] = retLastUUID;
    return resultJSON;
}

function getvRouterList (appData, callback)
{
    var resultJSON = [];
    var uuidList = [];
    var dataObjArr = [];
    var tmpInsertedList = {};
    var url = '/virtual-routers';
    commonUtils.createReqObj(dataObjArr, url, null, null, configApiServer, null,
                             appData);
    url = '/analytics/uves/vrouters';
    commonUtils.createReqObj(dataObjArr, url, null, null, opApiServer, null,
                             appData);
    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(configApiServer, true),
              function(err, results) {
        if (err || (null == results)) {
            callback(err, results, null);
            return;
        }
        try {
            var vrConf = results[0]['virtual-routers'];
            var vrCnt = vrConf.length;
        } catch(e) {
            logutils.logger.info("In getvRouterList(), vRouter Config not " +
                                  "found");
            vrCnt = 0;
        }
        for (var i = 0; i < vrCnt; i++) {
            try {
                len = vrConf[i]['fq_name'].length;
                vrouterName = vrConf[i]['fq_name'][len - 1];
                resultJSON.push(vrouterName);
                uuidList.push(vrConf[i]['uuid']);
                tmpInsertedList[vrouterName] = vrouterName;
            } catch(e) {
                logutils.logger.error("In getvRouterList(), vRouter Config Parse " +
                                      "Error: " + e);
            }
        }
        try {
            var vrUVE = results[1];
            vrCnt = vrUVE.length;
        } catch(e) {
            logutils.logger.info("In getvRouterList(), vRouter UVE not " +
                                 "found");
            vrCnt = 0;
        }
        for (i = 0; i < vrCnt; i++) {
            try {
                vrouterName = vrUVE[i]['name'];
                if (null == tmpInsertedList[vrouterName]) {
                    resultJSON.push(vrouterName);
                    tmpInsertedList[vrouterName] = vrouterName;
                }
            } catch(e) {
                logutils.logger.error("In getvRouterList(), vRouter UVE Parse " +
                                      "Error: " + e);
            }
        }
        callback(null, resultJSON, uuidList);
    });
}

function addGeneratorInfoToUVE (postData, uve, host, modules, callback)
{
    var resultJSON = {};
    var url = '/analytics/uves/generator';

    opServer.api.post(url, postData,
                      commonUtils.doEnsureExecution(function(err, data) {
        if ((null != err) || (null == data) || (null == data['value'])) {
            callback(null, uve);
            return;
        }
        data = data['value'];
        len = data.length;
        var modCnt = modules.length;
        for (var i = 0; i < len; i++) {
            try {
                if (false ==
                    modExistInGenList(modules, host, data[i]['name'])) {
                    continue;
                }
                var modInstName = getModInstName(data[i]['name']);
                if (null == modInstName) {
                    continue;
                }
                resultJSON[modInstName] = data[i]['value'];
            } catch(e) {
            }
        }
        resultJSON = commonUtils.copyObject(resultJSON, uve);
        callback(null, resultJSON);
    }, global.DEFAULT_CB_TIMEOUT));
}

function filterOutGeneratorInfoFromGenerators(excludeProcessList, resultJSON)
{
    for (var key in resultJSON) {
        var label = key.toUpperCase();
        var excludeProcessLen = excludeProcessList.length;
        for (var i = 0; i < excludeProcessLen; i++) {
            if (label.indexOf(excludeProcessList[i].toUpperCase()) > -1) {
                try {
                    delete resultJSON[key]['ModuleServerState']['generator_info'];
                } catch(e) {
                }
            }
       }
    }
    return resultJSON;
}

function getUVEByUrlAndSendData (url, errResponse, res, appData)
{
    opServer.api.get(url, function(err, data) {
        if (err || (null == data)) {
            commonUtils.handleJSONResponse(err, res, errResponse);
        } else {
            commonUtils.handleJSONResponse(err, res, data);
        }
    });
}

function sortUVEList (uveEntry1, uveEntry2)
{
    if (uveEntry1['name'] > uveEntry2['name']) {
        return 1;
    } else if (uveEntry1['name'] < uveEntry2['name']) {
        return -1;
    }
    return 0;
}

function sendSandeshRequest (req, res, dataObjArr, restAPI)
{
    async.map(dataObjArr,
              commonUtils.getServerRespByRestApi(restAPI, true),
              function(err, data) {
        if (data) {
            commonUtils.handleJSONResponse(null, res, data);
        } else {
            commonUtils.handleJSONResponse(null, res, []);
        }
    });
}

function getCpuStatDataByUVE (cpuInfo)
{
    var result = {};
    result['CpuLoadInfo'] = {};
    try {
        var resultJSON = jsonPath(cpuInfo, "$..SysMemInfo");
        var data = {};
        result['CpuLoadInfo']['SysMemInfo'] =
            commonUtils.createJSONByUVEResponse(data,
                                                resultJSON[0]);
    } catch(e) {
    }
    try {
        resultJSON = jsonPath(cpuInfo, "$..MemInfo");
        result['CpuLoadInfo']['MemInfo'] =
            commonUtils.createJSONByUVEResponse(data,
                                                resultJSON[0]);
    } catch(e) {
    }
     try {
        resultJSON = jsonPath(cpuInfo, "$..CpuLoadAvg");
        result['CpuLoadInfo']['CpuLoadAvg'] =
            commonUtils.createJSONByUVEResponse(data,
                                                resultJSON[0]);
    } catch(e) {
    }
    try {
        resultJSON = jsonPath(cpuInfo, "$..num_cpu");
        result['CpuLoadInfo']['num_cpu'] = resultJSON[0]['#text'];
    } catch(e) {
    }
    try {
        resultJSON = jsonPath(cpuInfo, "$..cpu_share");
        result['CpuLoadInfo']['cpu_share'] = resultJSON[0]['#text'];
    } catch(e) {
    }
    return result;
}

function parseUVECpuStatsData (cpuInfo)
{
    var resultJSON = [];
    var results = [];
    var cnt = cpuInfo.length;
    for (var i = 0; i < cnt; i++) {
        results[i] = {};
        results[i] = getCpuStatDataByUVE(cpuInfo[i]);
    }
    return results;
}

function getBulkUVEUrl (type, hostname, module, filtObj)
{
    var cfilt = filtObj['cfilt'];
    var kfilt = filtObj['kfilt'];
    var mfilt = filtObj['mfilt'];
    var reqUrl = '/analytics/uves/';
    if (null == type) {
        return null;
    }

    reqUrl += type + '/';
    if (null != hostname) {
        reqUrl += hostname + ':';
    //} else {
     //   reqUrl += '*';
    }
    if (null != module) {
        reqUrl += module;
    } else {
        reqUrl += '*';
    }
    if (null != kfilt) {
        reqUrl += '?kfilt=' + kfilt;
    }
    if (null != cfilt) {
        if (null != kfilt) {
            reqUrl += '&';
        } else {
            reqUrl += '?';
        }
        reqUrl += 'cfilt=' + cfilt;
    }
    if (null != mfilt) {
        if ((null != cfilt) || (null != kfilt)) {
            reqUrl += '&';
        } else {
            reqUrl += '?';
        }
        reqUrl += 'mfilt=' + mfilt;
    }
    return reqUrl;
}

function getBulkUVEPostURLs (filtData, appData)
{
    filtData = filtData['data'];
    var url = '/analytics/uves/';
    var dataObjArr = [];

    try {
        var modCnt = filtData.length;
    } catch(e) {
        return null;
    }
    for (var i = 0; i < modCnt; i++) {
        var postData = {};
        type = filtData[i]['type'];
        hostname = filtData[i]['hostname'];
        module = filtData[i]['module'];
        /* All URLs should be valid */
        if (null == type) {
            return null;
        }
        if (null != filtData[i]['kfilt']) {
            postData['kfilt'] = filtData[i]['kfilt'].split(',');
        }
        if (null != filtData[i]['cfilt']) {
            postData['cfilt'] = filtData[i]['cfilt'].split(',');
        }
        if (null != filtData[i]['mfilt']) {
            postData['mfilt'] = filtData[i]['mfilt'].split(',');
        }
        url += type;

        var kfilt = "";
        if (null != hostname) {
            kfilt += hostname + ':';
        }
        if (null != module) {
            kfilt += module;
        } else {
            kfilt += '*';
        }
        //postData['kfilt'].splice(0, 0, kfilt);
        commonUtils.createReqObj(dataObjArr, url, global.HTTP_REQUEST_POST,
                                 postData, opApiServer, null, appData);
    }
    return dataObjArr;
}

function getServerResponseByModType (req, res, appData)
{
    var postData = req.body;
    var dataObjArr = [];

    dataObjArr = getBulkUVEPostURLs(postData, appData);
    if (null == dataObjArr) {
        var err = new appErrors.RESTServerError('postData is not correct');
        commonUtils.handleJSONResponse(err, res, null);
        return;
    }
    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(opApiServer, false),
              function(err, resultJSON) {
        commonUtils.handleJSONResponse(err, res, resultJSON);
    });
}

function getDataFromConfigNode (str, hostName, appData, data, callback)
{
    var url = '/' + str;
    data['nodeStatus'] = 'Down';
    configApiServer.apiGet(url, appData,
                           commonUtils.doEnsureExecution(function(err, configData) {
        if ((null != err) || (null == configData)) {
            callback(null, data);
            return;
        }
        var configData = configData[str];
        var dataLen = configData.length;
        for (var i = 0; i < dataLen; i++) {
            try {
                fqNameLen = configData[i]['fq_name'].length;
                if (hostName == configData[i]['fq_name'][fqNameLen - 1]) {
                    break;
                }
            } catch(e) {
            }
        }
        if (i == dataLen) {
            callback(null, data);
            return;
        }
        if (str == 'bgp-routers') {
            url = '/bgp-router/';
        } else if (str == 'virtual-routers') {
            url = '/virtual-router/';
        }
        try {
            url += configData[i]['uuid'];
        } catch(e) {
            callback(null, data);
            return;
        }
        configApiServer.apiGet(url, appData,
                               commonUtils.doEnsureExecution(function(err, configData) {
            data['ConfigData'] = {};
            data['ConfigData'] = configData;
            data['nodeStatus'] = 'Up';
            callback(null, data);
        }, global.DEFAULT_CB_TIMEOUT));
    }, global.DEFAULT_CB_TIMEOUT));
}

exports.dovRouterListProcess = dovRouterListProcess;
exports.checkAndGetSummaryJSON = checkAndGetSummaryJSON;
exports.getvRouterList = getvRouterList;
exports.getNodeListByLastKey = getNodeListByLastKey;
exports.getModuleType = getModuleType;
exports.modExistInGenList = modExistInGenList;
exports.getModInstName = getModInstName;
exports.addGeneratorInfoToUVE = addGeneratorInfoToUVE;
exports.getUVEByUrlAndSendData = getUVEByUrlAndSendData;
exports.sortUVEList = sortUVEList;
exports.sendSandeshRequest = sendSandeshRequest;
exports.getServerResponseByModType = getServerResponseByModType;
exports.getDataFromConfigNode = getDataFromConfigNode;
exports.filterOutGeneratorInfoFromGenerators =
    filterOutGeneratorInfoFromGenerators;
exports.getBulkUVEUrl = getBulkUVEUrl;


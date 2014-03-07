/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

var rest = require('../../common/rest.api'),
    config = require('../../../../config/config.global.js'),
    async = require('async'),
    commonUtils = require('../../utils/common.utils'),
    logutils = require('../../utils/log.utils'),
    jsonPath = require('JSONPath').eval,
    appErrors = require('../../errors/app.errors.js'),
    adminApiHelper = require('../../common/adminapi.helper'),
    urlMod = require('url'),
    nwMonUtils = require('../../common/nwMon.utils'),
    opApiServer = require('../../common/opServer.api'),
    infraCmn = require('../../common/infra.common.api'),
    configApiServer = require('../../common/configServer.api');

opServer = rest.getAPIServer({apiName:global.label.OPS_API_SERVER,
                             server:config.analytics.server_ip,
                             port:config.analytics.server_port });

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

function processvRouterData (resultJSON)
{
    var lastIndex = 0;
    var cnt = resultJSON.length;
    for (var i = 0; i < cnt; i++) {
        try {
            resultJSON[i]['VrouterAgent'] =
                commonUtils.parseUVEListData(resultJSON[i]['VrouterAgent']);
        } catch(e) {
        }
        try {
            resultJSON[i]['VrouterStatsAgent']['cpu_info'][0]['value'] = 
                parseUVECpuStatsData(resultJSON[i]['VrouterStatsAgent']['cpu_info']);
        } catch(e) {
        }
        try {
            var data = jsonPath(resultJSON[i]['VrouterStatsAgent'], 
                                "$..AgentIfStats");
            resultJSON[i]['VrouterStatsAgent']['phy_if_stats_list'] = {};
            resultJSON[i]['VrouterStatsAgent']['phy_if_stats_list']['value'] =
                [];
            if (data.length > 0) {
                commonUtils.createJSONByUVEResponseArr(
                    resultJSON[i]['VrouterStatsAgent']['phy_if_stats_list']['value'],
                    data[0], lastIndex);
            }
        } catch(e) {
        }
    }
}

function processvRouterUVEData (resultJSON, uveData)
{
    try {
        var cnt = uveData.length;
        try {
            for (var i = 0; i < cnt; i++) {
                resultJSON[i]['VrouterAgent'] =
                    commonUtils.parseUVEData(uveData[i]['VrouterAgent']);
                resultJSON[i]['VrouterStatsAgent'] =
                    commonUtils.parseUVEData(uveData[i]['VrouterStatsAgent']);
            }
        } catch(e) {
            logutils.logger.debug("In processvRouterUVEData(): for loop JSON " +
                                  " Parse error :" + e);
        }
    } catch(e) {
        logutils.logger.debug("In processvRouterUVEData(): JSON Parse error :" +
                              e);
    }
    processvRouterData(resultJSON);
}

function getvRouterPagedSummary (req, res, appData)
{
    var addGen = req.param('addGen');
    var count = req.param('count');
    var lastKey = req.param('lastKey');
    var found = false;
    var retLastUUID = null;
    var resultJSON = {};
    var matchStr = 'name';

    resultJSON['data'] = [];
    resultJSON['lastKey'] = null;
    resultJSON['more'] = false;

    if (null != count) {
        count = parseInt(count);
    } else {
        count = -1;
    }
    infraCmn.getvRouterList(appData, function(err, data, uuidList) {
        if (err) {
            commonUtils.handleJSONResponse(err, res, resultJSON);
            return;
        }
        var result = 
            infraCmn.getNodeListByLastKey(data, count, lastKey, matchStr,
                                          uuidList);
        if (null == result) {
            commonUtils.handleJSONResponse(null, res, resultJSON);
            return;
        }
        infraCmn.dovRouterListProcess(null, result['uuidList'], 
                                          result['nodeList'],
                                          addGen, appData,
                                          function(err, data) {
            resultJSON['lastKey'] = result['lastKey'];
            resultJSON['data'] = data;
            resultJSON['more'] = result['more'];
            commonUtils.handleJSONResponse(err, res, resultJSON);
        });
    });
}

function getvRoutersSummaryByJob (req, res, appData)
{
    var url = '/virtual-routers';
    var forceRefresh = req.param('forceRefresh');
    var key = global.STR_GET_VROUTERS_SUMMARY;
    var objData = {};

    if (null == forceRefresh) {
        forceRefresh = false;
    } else {
        forceRefresh = true;
    }
    cacheApi.queueDataFromCacheOrSendRequest(req, res,
                                             global.STR_JOB_TYPE_CACHE, key,
                                             url, 0, 0, 0,
                                             global.VROUTER_SUMM_JOB_REFRESH_TIME,
                                             forceRefresh, objData);
}

function getvRouterGenerators (req, res, appData)
{
    var url = '/virtual-routers';
    var key = global.STR_GET_VROUTERS_GENERATORS;
    var forceRefresh = req.param['forceRefresh'];
    cacheApi.queueDataFromCacheOrSendRequest(req, res,
                                             global.STR_JOB_TYPE_CACHE, key,
                                             url, 0, 0, 0, 
                                             global.VROUTER_SUMM_JOB_REFRESH_TIME,
                                             forceRefresh, null);
}

function getvRouterDetailConfigUVEData (configData, uuidList, nodeList, addGen,
                                        appData, callback)
{
    var dataObjArr = [];
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
    for (var i = 0; i < len; i++) {
        var uuid = (null != configData) ?
            configData['virtual-routers'][i]['uuid'] : uuidList[i];
        var reqUrl = '/virtual-router/' + uuid;
        commonUtils.createReqObj(dataObjArr, reqUrl,
                                 global.HTTP_REQUEST_GET, null, configApiServer, null,
                                 appData);
    }
    reqUrl = '/analytics/uves/vrouter';
    var postData = {};
    if (null != nodeList) {
        postData['kfilt'] = nodeList;
    }
    postData['cfilt'] = ['VrouterStatsAgent:cpu_info',
        'VrouterAgent:virtual_machine_list',
        'VrouterAgent:self_ip_list',
        'VrouterAgent:xmpp_peer_list',
        'VrouterAgent:total_interface_count',
        'VrouterAgent:down_interface_count', 'VrouterAgent:connected_networks',
        'VrouterAgent:control_ip', 'VrouterAgent:build_info',
        'VrouterStatsAgent:cpu_share', 'VrouterStatsAgent:process_state_list'];
    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_POST,
                             postData, opApiServer, null, appData);
    if (null != addGen) {
        reqUrl = '/analytics/uves/generator';
        var postData = {};

        postData['kfilt'] = [];
        if (null != nodeList) {
            var nodeCnt = nodeList.length;
            var kfilt = ['VRouterAgent'];
            var kLen = kfilt.length;
            for (var i = 0; i < nodeCnt; i++) {
                for (var j = 0; j < kLen; j++) {
                    postData['kfilt'].push(nodeList[i] + ':*' + kfilt[j] + '*');
                }
            }
        } else {
            postData['kfilt'] = ['*:VRouterAgent*'];
        }
        postData['cfilt'] = ['ModuleClientState:client_info',
                             'ModuleServerState:generator_info'];

        commonUtils.createReqObj(dataObjArr, reqUrl,
                                 global.HTTP_REQUEST_POST,
                                 postData, opApiServer, null, appData);
    }
    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(configApiServer, true),
              function(err, results) {
        callback(err, results, len);
    });
}

function dovRouterListPostProcess (configData, uuidList, nodeList, addGen,
                                   appData, callback)
{
    var uveData = [];
    var confData = [];
    getvRouterDetailConfigUVEData(configData, uuidList, nodeList, addGen, appData,
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
            infraCmn.checkAndGetSummaryJSON(confData, uveData,
                                            ['VRouterAgent']);
        callback(null, resultJSON);
    });
}

/* Function: getComputeNodesSummary
    This function is used to get the summary of vRouters */
function getvRoutersSummary (req, res, appData) 
{
    var url = '/virtual-routers';
    var resultJSON = [];
    var configData = [], uveData = [];
    var addGen = req.param('addGen');
    var count = req.param('count');
    var lastKey = req.param('lastKey');
    if ((null != count) || (null != lastKey)) {
        getvRouterPagedSummary(req, res, appData);
        return;
    }

    configApiServer.apiGet(url, appData,
                           commonUtils.doEnsureExecution(function(err, data) {
        dovRouterListPostProcess(data, null, null, addGen, appData,
                                 function(err, resultJSON) {
            commonUtils.handleJSONResponse(err, res, resultJSON);
        });
    }, global.DEFAULT_CB_TIMEOUT));
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
                    infraCmn.modExistInGenList(modules, host, data[i]['name'])) {
                    continue;
                }
                var modInstName = infraCmn.getModInstName(data[i]['name']);
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

function getvRouterDetails (req, res, appData)
{
    var host        = req.param('hostname');
    var flatParse   = req.param('flat');
    var url         = '/analytics/vrouter/' + host + '?flat';
    var resultJSON = {};
    
    opServer.api.get(url, 
                     commonUtils.doEnsureExecution(function(err, data) {
        if ((null != err) || (null == data)) {
            data = {};
            getDataFromConfigNode('virtual-routers', host, appData,
                                  data, function(err, resultJSON) {
                commonUtils.handleJSONResponse(err, res, resultJSON);
            });
        } else {
            var postData = {};
            postData['kfilt'] = [host + ':*VRouterAgent*'];
            addGeneratorInfoToUVE(postData, data, host,
                                  ['VRouterAgent'],
                                  function(err, data) {
                getDataFromConfigNode('virtual-routers', host, appData, 
                                      data, function(err, data) {
                    commonUtils.handleJSONResponse(null, res, data);
                });
            });
        }
    }, global.DEFAULT_CB_TIMEOUT));
}

function processAnalyticsNodeUVEData (resultJSON, uveData)
{
    var lastIndex = 0;

    resultJSON['CollectorsCpuState'] = [];
    var CollectorCpuInfo = jsonPath(uveData, "$..CollectorCpuInfo");
    if (CollectorCpuInfo.length > 0) {
        commonUtils.createJSONByUVEResponseArr(resultJSON['CollectorsCpuState'],
                                               CollectorCpuInfo[0], lastIndex);
    }
    var cnt = resultJSON['CollectorsCpuState'].length;
    for (var i = 0; i < cnt; i++) {
        try {
            var cpuData = resultJSON['CollectorsCpuState'][i]['cpu_info'];
            resultJSON['CollectorsCpuState'][i]['cpu_info'] = 
                getCpuStatDataByUVE(resultJSON['CollectorsCpuState'][i]['cpu_info']);
        } catch(e) {
        }
    }
    return resultJSON;
}

function parseCollectorNodeUVEData (uve)
{
    var lastIndex = 0;
    var result = {};

    result['source'] = uve[1];
    result['value'] = [];
    try {
        commonUtils.createJSONByUVEResponseArr(result['value'],
                               uve[0]['list']['GeneratorSummaryInfo'],
                               lastIndex);
    } catch(e) {
    }
    return result;
}

function processCollectorNodeUVEData (uveData)
{
    var resultJSON = [];
    
    try {
        var info = uveData['CollectorState']['generator_infos'];
        var len = info.length;
        for (var i = 0; i < len; i++) {
            resultJSON[i] = parseCollectorNodeUVEData(info[i]);
        }
    } catch(e) {
        logutils.logger.debug("In processCollectorNodeUVEData(): JSON Parse " +
                              "error: " + e);
    }
    return resultJSON;
}

function isUniqueUrl (url, urlLists)
{
    var cnt = urlLists.length;
    for (var i = 0; i < cnt; i++) {
        if (url == urlLists[i]) {
            return false;
        }
    }
    return true;
}

function processGeneratorsData (hostName, uveData)
{
    var resultJSON = [];
    var j = 0;
    try {
        uveData = uveData['value'];
        var cnt = uveData.length;
    } catch(e) {
        return uveData;
    }
    for (var i = 0; i < cnt; i++) {
        try {
            var collData = jsonPath(uveData[i], "$..collector_name");
            if (collData.length > 0) {
                if (collData[0] == hostName) {
                    resultJSON[j] = uveData[i];
                    j++;
                }
            }
        } catch(e) {
        }
    }
    return resultJSON;
}

function getAnalyticsNodeGenerators (req, res, appData)
{
    var resultJSON = [];
    var ip = req.param('ip');
    var hostName = req.param('hostname');
    var url = '/analytics/generator/*';

    var count = req.param('count');
    var lastKey = req.param('lastKey');
    getAnalyticsGenPagedSummary(req, res, appData);
}

function getJsonByJsonPathHostName (uveData, path, hostName)
{
    var data = jsonPath(uveData, path);
    if (data.length > 0) {
        var len = data[0].length;
        if (null == hostName) {
            return data[0];
        }
        for (var i = 0; i < len; i++) {
            try {
                if (data[0][i]['hostname']['#text'] == hostName) {
                    return data[0][i];
                }
            } catch(e) {
            }
        }
    }
    return null;
}

function getCollectorData(hostName, uveData)
{
    var resultJSON = {};
    try {
        var cpuInfo = getJsonByJsonPathHostName(uveData, "$..CollectorCpuInfo",
                                                hostName);
    
        if (null != cpuInfo) {
            if (cpuInfo instanceof Array) {
                resultJSON['CollectorCpuInfo'] = []; 
                var len = cpuInfo.length;
                for (var i = 0; i < len; i++) {
                    try {
                        resultJSON['CollectorCpuInfo'][i] = {}; 
                        resultJSON['CollectorCpuInfo'][i]['source'] =
                            cpuInfo[i]['hostname']['#text'];
                        resultJSON['CollectorCpuInfo'][i]['value'] =
                            getCpuStatDataByUVE(cpuInfo[i]);
                    } catch(e) {
                    }
                }   
            } else {
                resultJSON['CollectorCpuInfo'] = {}; 
                resultJSON['CollectorCpuInfo'] = getCpuStatDataByUVE(cpuInfo);
            }   
        } else {
            resultJSON['CollectorCpuInfo'] = {};
        }
    } catch(e) {
    }
    try {
        var clientInfo = getJsonByJsonPathHostName(uveData,
                                                   "$..SandeshClientInfo",
                                                   hostName);
        if (null != clientInfo) {
            if (clientInfo instanceof Array) {
                resultJSON['SandeshClientInfo'] = [];
                len = clientInfo.length;
                for (i = 0; i < len; i++) {
                    resultJSON['SandeshClientInfo'][i] = {};
                    resultJSON['SandeshClientInfo'][i]['value'] =
                        commonUtils.createJSONByUVEResponse(resultJSON['SandeshClientInfo'][i],
                                                            clientInfo[i]);
                    resultJSON['SandeshClientInfo'][i]['source'] =
                        resultJSON['SandeshClientInfo'][i]['value']['hostname'];
                }
            } else {
                resultJSON['SandeshClientInfo'] = {};
                resultJSON['SandeshClientInfo'] =
                    commonUtils.createJSONByUVEResponse(resultJSON['SandeshClientInfo'],
                                                        clientInfo);
            }
        } else {
            resultJSON['SandeshClientInfo'] = {};
        }
    } catch(e) {
    }
    try {
        var genInfo = getJsonByJsonPathHostName(uveData,
                                                "$..GeneratorInfo",
                                                hostName);
        if (null != genInfo) {
            if (genInfo instanceof Array) {
                resultJSON['SelfGeneratorInfo'] = [];
                len = genInfo.length;
                for (i = 0; i < len; i++) {
                    resultJSON['SelfGeneratorInfo'][i] = {};
                    resultJSON['SelfGeneratorInfo'][i]['value'] =
                        commonUtils.createJSONByUVEResponse(resultJSON['SelfGeneratorInfo'][i],
                                                            genInfo[i]['gen_attr']['GeneratorInfoAttr']);
                    resultJSON['SelfGeneratorInfo'][i]['source'] =
                        genInfo[i]['hostname']['#text'];
                }
            } else {
                resultJSON['SelfGeneratorInfo'] =
                    commonUtils.createJSONByUVEResponse(resultJSON['SelfGeneratorInfo'],
                                                        genInfo['gen_attr']['GeneratorInfoAttr']);
            }
        } else {
            resultJSON['SelfGeneratorInfo'] = {};
        }
    } catch(e) {
    }
    try {
        var statsInfo = getJsonByJsonPathHostName(uveData,
                                                  "$..SandeshStatsInfo",
                                                  hostName);
        if (null != statsInfo) {
            lastIndex = 0;
            if (statsInfo instanceof Array) {
                resultJSON['SandeshStatsInfo'] = [];
                len = statsInfo.length;
                for (i = 0; i < len; i++) {
                    lastIndex = 0;
                    resultJSON['SandeshStatsInfo'][i] = {};
                    resultJSON['SandeshStatsInfo'][i]['value'] = [];
                    commonUtils.createJSONByUVEResponseArr(resultJSON['SandeshStatsInfo'][i]['value'],
                                   statsInfo[i]['msgtype_stats']['list']['SandeshStats'],
                                   lastIndex);
                    //resultJSON['SandeshStatsInfo'][i]['value'] = data;
                    resultJSON['SandeshStatsInfo'][i]['source'] =
                        statsInfo[i]['hostname']['#text'];
                }
            } else {
                resultJSON['SandeshStatsInfo'] = [];
                commonUtils.createJSONByUVEResponseArr(resultJSON['SandeshStatsInfo'],
                                   statsInfo['msgtype_stats']['list']['SandeshStats'],
                                   lastIndex);
            }
        } else {
            resultJSON['SandeshStatsInfo'] = [];
        }
    } catch(e) {
        logutils.logger.debug('In getCollectorData(): JSON Parse '
                              + ' error: ' + e);
    }
    return resultJSON;
}

function processAnalyticsNodeDetailJSON (hostName, genUVEData, callback)
{
    var data = null;
    var resultJSON = [];
    var lastIndex = 0;
    var url = '/analytics/collector/' + hostName + '?flat';
    opServer.api.get(url, function (err, collUVEData) {
        if (err || (collUVEData == null)) {
            callback(genUVEData);
            return;
        }
        var collData = {};
        collData['value'] = [];
        collData['value'][0] = {};
        collData['value'][0]['name'] = hostName;
        collData['value'][0]['value'] = collUVEData;
        var resultJSON = 
            postProcessAnalyticsNodeSummaryJSON(collData, genUVEData);
        result = resultJSON[0];
        if (result) {
            result = resultJSON[0]['value'];
        }
        callback(result);
    });
}

function addGenCollData (genData, collData, resultJSON, lastIndex)
{
    resultJSON[lastIndex] = {};
    for (key in genData) {
        resultJSON[lastIndex][key] = genData[key];
    }
    for (key in collData) {
        resultJSON[lastIndex][key] = collData[key];
    }
    ++lastIndex;
    return (lastIndex);
}

function postProcessAnalyticsNodeSummaryJSON (collUVEData, genUVEData) 
{
    var moduleNames = ['QueryEngine',
                       'OpServer', 'Collector'];
    var modCnt = moduleNames.length;
    var modHost = null;
    var resultJSON = [];
    var result = [];
    var lastIndex = 0;
    try {
        try {
            var genData = genUVEData['value'];
            var genDataLen = genData.length;
        } catch(e) {
            if (collUVEData && collUVEData['value']) {
                return collUVEData['value'];
            }
            return resultJSON;
        }
        try {
            var collData = collUVEData['value'];
            var collDataLen = collData.length;
        } catch(e) {
            if (genUVEData && genUVEData['value']) {
                return genUVEData['value'];
            }
            return resultJSON;
        }
        for (var i = 0, l = 0; i < collDataLen; i++) {
          try {
            resultJSON[lastIndex] = {};
            resultJSON[lastIndex]['name'] = collData[i]['name'];
            resultJSON[lastIndex]['value'] = {};
            resultJSON[lastIndex]['value'] =
                commonUtils.copyObject(resultJSON[lastIndex]['value'],
                                       collData[i]['value']);
            for (var j = 0; j < genDataLen; j++) {
                try {
                    if (false == 
                        infraCmn.modExistInGenList(moduleNames, 
                                                   collData[i]['name'],
                                                   genData[j]['name'])) {
                        continue;
                    }
                    var genName = genData[j]['name'];
                    var pos = genName.indexOf(':');
                    mod = genName.slice(pos + 1);
                    resultJSON[lastIndex]['value'][mod] = {};
                    resultJSON[lastIndex]['value'][mod] =
                        commonUtils.copyObject(resultJSON[lastIndex]['value'][mod],
                                               genData[j]['value']);
                } catch (e) {
                    continue;
                }
            }
            lastIndex++;
          } catch(e) {
              continue;
          }
        }
    } catch(e) {
    }
    return resultJSON;
}

function addAnalyticsQueryStatsToSummary (data, appData, callback)
{
    processAnalyticsQueryStats(data, appData, 0, function(err, result) {
        callback(result);
    });
}

function addAnalyticsQueryStatsToDetails(data, appData, callback) 
{
    var result = [];
    result[0] = {};
    result[0] = data;
    processAnalyticsQueryStats(result, appData, 1, function(err, result) {
        callback(result);
    });
}

function getAnalyticsNodeSummary (req, res, appData)
{
    var addGen = req.param('addGen');
    var resultJSON = [];
    var dataObjArr = [];

    reqUrl = '/analytics/uves/collector';
    var collPostData = {};
    collPostData['cfilt'] = ['ModuleCpuState', 'CollectorState'];
    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_POST,
                             collPostData, opApiServer, null, appData);

    if (null != addGen) {
        reqUrl = '/analytics/uves/generator';
        var postData = {};
        postData['kfilt'] = ['*:Collector*',
                             '*:OpServer*', '*:QueryEngine*'];
        postData['cfilt'] = ['ModuleClientState:client_info', 
                             'ModuleServerState:generator_info'];
        commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_POST,
                                 postData, opApiServer, null, appData);
    }
    
    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(opApiServer, true),
              function(err, results) {
        var resultJSON =
            postProcessAnalyticsNodeSummaryJSON(results[0], results[1]);
        addAnalyticsQueryStatsToSummary(resultJSON, appData, 
                                        function(data) {
            commonUtils.handleJSONResponse(err, res, data);
        });
    });
}

function getAnalyticsNodeDetails (req, res, appData)
{
    var hostName = req.param('hostname');
    var resultJSON = {};
    var url = '/analytics/uves/generator';

    var postData = {};
    postData['kfilt'] = [hostName + ':*Collector*', 
                         hostName + ':*OpServer*',
                         hostName + ':*QueryEngine*'];
    opServer.api.post(url, postData, function(err, genData) {
        if (err || (null == genData)) {
            commonUtils.handleJSONResponse(err, res, resultJSON);
        } else {
            processAnalyticsNodeDetailJSON(hostName, genData, function(resultJSON) {
                addAnalyticsQueryStatsToDetails(resultJSON, appData, 
                                                function(data) {
                    commonUtils.handleJSONResponse(null, res, resultJSON);
                });
            });
        }
    });
}

function getAnalyticsNodeList (req, res)
{
    var url = '/analytics/collectors';

    opServer.api.get(url, function(err, data) {
        if (err || (null == data)) {
            commonUtils.handleJSONResponse(err, res, []);
        } else {
            commonUtils.handleJSONResponse(null, res, data);
        } 
    });
}

function controlNodeExist (configData, bgpHost)
{
    try {
        var cnt = configData['bgp-routers'].length;
    } catch(e) {
        return false;
    }
    for (var i = 0; i < cnt; i++) {
        try {
            var fqName = configData['bgp-routers'][i]['fq_name'];
            var fqNameLen = fqName.length;
            if (bgpHost == configData['bgp-routers'][i]['fq_name'][fqNameLen - 1]) {
                return true;  
            }
        } catch(e) {
            continue;
        }
    }
    return false;
}

function checkAndGetControlNodeSummaryJSON(configData, uveData)
{
    var resultJSON = [];
    try {
        var configBgpRouters = configData['bgp-routers'];
        var uveBgpRouters = uveData['value'];
        var cnt = uveBgpRouters.length;
        var j = 0;
        for (var i = 0; i < cnt; i++) {
            try {
                if (controlNodeExist(configData, uveBgpRouters[i]['name'])) {
                    resultJSON[j++] = uveData['value'][i];
                }
            } catch(e) {
                continue;
            }
        }
    } catch(e) {
    }
    return resultJSON;
}

function processvRouterSummaryJSON(configData, uveData, callback)
{
    var resultJSON = [];
    var urlLists = [];
        callback(null, resultJSON);
}

function getControlNodeDetailConfigUVEData (configData, addGen, appData, callback)
{
    var len = 0;
    var dataObjArr = [];

    try {
        len = configData['bgp-routers'].length;
    } catch(e) {
        len = 0;
    }
    for (var i = 0; i < len; i++) {
        var reqUrl = '/bgp-router/' + configData['bgp-routers'][i]['uuid'];
        commonUtils.createReqObj(dataObjArr, reqUrl,
                                 global.HTTP_REQUEST_GET, null, configApiServer, null, 
                                 appData);
    }
    reqUrl = '/analytics/uves/bgp-router';
    var postData = {};
    postData['cfilt'] = ['BgpRouterState'];
    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_POST,
                             postData, opApiServer, null, appData);
    if (null != addGen) {
        var genPostData = {};
        genPostData['kfilt'] = ['*:ControlNode*'];
        genPostData['cfilt'] = ['ModuleClientState:client_info',
                                'ModuleServerState:generator_info'];
        reqUrl = '/analytics/uves/generator';
        commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_POST,
                                 genPostData, opApiServer, null, appData);
    }
    async.map(dataObjArr, 
              commonUtils.getServerResponseByRestApi(configApiServer, true),
              function(err, results) {
        callback(err, results, len);
    });
}

function getControlNodesSummary (req, res, appData)
{
    var url = '/bgp-routers';
    var resultJSON = [];
    var configData = [], uveData = [];
    var addGen = req.param('addGen');

    configApiServer.apiGet(url, appData, 
                           commonUtils.doEnsureExecution(function(err, data) {
        getControlNodeDetailConfigUVEData(data, addGen, appData,
                                          function(err, configUVEData,
                                          bgpRtrCnt) {
            if (null != err) {
                callback(null, []);
                return;
            }
            for (var i = 0; i < bgpRtrCnt; i++) {
                configData[i] = configUVEData[i];
            }
            var cnt = configUVEData.length;
            for (i = bgpRtrCnt; i < cnt; i++) {
                uveData[i - bgpRtrCnt] = configUVEData[i];
            }
            resultJSON =
                infraCmn.checkAndGetSummaryJSON(configData, uveData, 
                    ['ControlNode']);
            commonUtils.handleJSONResponse(err, res, resultJSON);
        });
    }, global.DEFAULT_CB_TIMEOUT));
}

function getDataFromConfigNode(str, hostName, appData, data, callback)
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

function getControlNodeDetails (req, res, appData)
{
    var hostName = req.param('hostname');
    var url = '/analytics/bgp-router/' + hostName + '?flat';
    var resultJSON = {};

    opServer.api.get(url, 
                     commonUtils.doEnsureExecution(function(err, data) {
        if ((null != err) || (null == data)) {
            data = {};
            getDataFromConfigNode('bgp-routers', hostName, appData,
                                  data, function(err, resultJSON) {
                commonUtils.handleJSONResponse(err, res, resultJSON);
            });
        } else {
            var postData = {};
            postData['kfilt'] = [hostName + '*:ControlNode*'];
            addGeneratorInfoToUVE(postData, data, hostName, 
                                  ['ControlNode'],
                                  function(err, data) {
                getDataFromConfigNode('bgp-routers', hostName, appData, 
                                      data, function(err, data) {
                    commonUtils.handleJSONResponse(err, res, data);
                });
            });
        }
    }, global.DEFAULT_CB_TIMEOUT));
}

function getUVByUrlEAndSendData (url, errResponse, res, appData)
{
    opServer.api.get(url, function(err, data) {
        if (err || (null == data)) {
            commonUtils.handleJSONResponse(err, res, errResponse);
        } else {
            commonUtils.handleJSONResponse(err, res, data);
        }
    });
}

function getConfigNodesList (req, res, appData)
{
    var url = '/analytics/config-nodes';
    var errResponse = {};

    getUVByUrlEAndSendData(url, errResponse, res, appData);
}

function parseConfigNodeProcessUVEs (resultJSON, configProcessUVEs, host)
{
    var moduleList = ['ApiServer'];
    try {
        var cfgProcUVEData = configProcessUVEs['value'];
        var cfgProcUVEDataLen = cfgProcUVEData.length;
    } catch(e) {
        return resultJSON;
    }
    for (var i = 0; i < cfgProcUVEDataLen; i++) {
        if (false == infraCmn.modExistInGenList(moduleList, host,
                                                cfgProcUVEData[i]['name'])) {
            continue;
        }
        try {
            var modInstName =
                infraCmn.getModInstName(cfgProcUVEData[i]['name']);
            if (null == modInstName) {
                continue;
            }
            resultJSON[modInstName] = {};
            resultJSON[modInstName] =
                commonUtils.copyObject(resultJSON[modInstName],
                                       cfgProcUVEData[i]['value']);
        } catch(e) {
            continue;
        }
    }
    return resultJSON;
}

function postProcessConfigNodeDetails (uves, host)
{
    var resultJSON = {};
    resultJSON['configNode'] = {};
    resultJSON['configNode'] = 
        commonUtils.copyObject(resultJSON['configNode'], uves[0]);
    resultJSON = parseConfigNodeProcessUVEs(resultJSON, uves[1], host)
    return resultJSON;
}

function postProcessConfigNodeSummary (uves)
{
    var resultJSON = [];
    var configData = uves[0]['value'];
    var configDataLen = configData.length;
    for (var i = 0; i < configDataLen; i++) {
        var host = configData[i]['name'];
        resultJSON[i] = {};
        resultJSON[i]['name'] = host;
        resultJSON[i]['value'] = {};
        resultJSON[i]['value']['configNode'] = {};
        resultJSON[i]['value']['configNode'] = 
            commonUtils.copyObject(resultJSON[i]['value']['configNode'],
                       configData[i]['value']);
        resultJSON[i]['value'] = 
            parseConfigNodeProcessUVEs(resultJSON[i]['value'], uves[1],
                                       host);
    }
    return resultJSON;
}

function getConfigNodeDetails (req, res, appData)
{
    var hostName = req.param('hostname');
    var errResponse = {};
    var urlLists = [];
    var resultJSON = {}; 
    var dataObjArr = [];

    var genPostData = {};
    reqUrl = '/analytics/config-node/' + hostName + '?flat';
    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_GET,
                             null, opApiServer, null, appData);
    genPostData['kfilt'] = ['*:ApiServer*'];
    reqUrl = '/analytics/uves/generator';
    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_POST,
                             genPostData, opApiServer, null, appData);
    async.map(dataObjArr, 
              commonUtils.getServerResponseByRestApi(configApiServer, false),
              function(err, results) {
        if (err || (results[0]['ModuleCpuState'] == null)) {
            commonUtils.handleJSONResponse(err, res, resultJSON);
            return;
        }
        resultJSON = postProcessConfigNodeDetails(results, hostName);
        commonUtils.handleJSONResponse(err, res, resultJSON);
    });
}

function getConfigNodesSummary (req, res, appData)
{
    var addGen = req.param('addGen');
    var dataObjArr = [];

    var reqUrl = '/analytics/uves/config-node';
    var postData = {};
    postData['cfilt'] = ['ModuleCpuState'];
    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_POST,
                             postData, opApiServer, null, appData);
    if (null != addGen) {
        reqUrl = '/analytics/uves/generator';
        var genPostData = {};
        genPostData['kfilt'] = ['*:ApiServer*'];
        genPostData['cfilt'] = ['ModuleClientState:client_info',
                                'ModuleServerState:generator_info'];
        commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_POST,
                                 genPostData, opApiServer, null, appData);
    }

    var resultJSON = [];

    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(opApiServer, true),
              function(err, results) {
        if (err || (results[0] == null) || 
            (results[0]['value'].length == 0)) {
            commonUtils.handleJSONResponse(err, res, resultJSON);
            return;
        }
        resultJSON = postProcessConfigNodeSummary(results);
        commonUtils.handleJSONResponse(err, res, resultJSON);
    });
}

function fillHostDetailsToAnalyticsQueryStatsUVE (collUVE, qStats, ipList,
                                                  details)
{
    var result = {};
    var ipCnt = ipList.length;
    var uveCnt = collUVE.length;
    for (var i = 0; i < ipCnt; i++) {
        for (var j = 0; j < uveCnt; j++) {
            try {
                ip = jsonPath(collUVE[j], "$..self_ip_list");
                if (ip[0][0] == ipList[i][0]) {
                    if (details) {
                        collUVE[j]['QueryStats'] = {};
                        collUVE[j]['QueryStats'] = 
                            commonUtils.cloneObj(qStats[i]);
                    } else {
                        collUVE[j]['value']['QueryStats'] = {};
                        collUVE[j]['value']['QueryStats'] = 
                            commonUtils.cloneObj(qStats[i]);
                    }
                    break;
                }
            } catch(e) {
            }
        }
    }
}

function processAnalyticsQueryStats (collUVE, appData, details, callback)
{
    var resultJSON = [];
    var ipList = jsonPath(collUVE, "$..self_ip_list");
    var urlLists = [];
    var dataObjArr = [];
    var url = '/analytics/queries';

    if (ipList.length == 0) {
        callback(null, collUVE);
    } else {
        cnt = ipList.length;
        for (var i = 0; i < cnt; i++) {
            opServerAPI =
                rest.getAPIServer({apiName:'Op-Server',
                                   server:ipList[i][0],
                                   port:config.analytics.server_port });
            commonUtils.createReqObj(dataObjArr, url, null, null,
                                     opServerAPI, null, appData);
        }
        async.map(dataObjArr,
            commonUtils.getServerRespByRestApi(opServer, true),
            function(err, data) {
            fillHostDetailsToAnalyticsQueryStatsUVE(collUVE, data, ipList,
                                                    details);
            callback(null, collUVE);
            for (var i = 0; i < cnt; i++) {
                delete dataObjArr[i]['serverObj'];
            }
        });
    }
}

function processBGPPeerDetails (hostname, bgpPeerInfo)
{
    var resultJSON = {};
    var nameArr = [];
    var j = 0;
    resultJSON['bgp-peer'] = [];
    
    try {
        var cnt = bgpPeerInfo['value'].length;
    } catch(e) {
        return resultJSON;
    }

    for (var i = 0; i < cnt; i++) {
        try {
            nameArr = bgpPeerInfo['value'][i]['name'].split(':');
            if (hostname == nameArr[4]) {
                resultJSON['bgp-peer'][j++] = bgpPeerInfo['value'][i];
            }
        } catch(e) {
            logutils.logger.debug("In processBGPPeerDetails(): JSON Parse error:" +
                                  e);
        }
    }
    return resultJSON;
}

function processXMPPPeerDetails (hostName, xmppPeerInfo)
{
    var resultJSON = {};
    var j = 0;

    resultJSON['xmpp-peer'] = [];
    try {
        var cnt = xmppPeerInfo['value'].length;
    } catch(e) {
        return resultJSON;
    }
    var lastIndex = 0;
    for (var i = 0; i < cnt; i++) {
        try {
            var name = xmppPeerInfo['value'][i]['name'];
            resultJSON['xmpp-peer'][j++] = xmppPeerInfo['value'][i];
        } catch(e) {
            logutils.logger.debug("In processXMPPPeerDetails(): JSON Parse error:"
                                  + e);
        }
    }
    return resultJSON;
}

function processControlNodePeerDetails (hostName, bgpPeerInfo, xmppPeerInfo)
{
    var resultJSON = [];
    bgpPeerInfo = processBGPPeerDetails(hostName, bgpPeerInfo);
    xmppPeerInfo = processXMPPPeerDetails(hostName, xmppPeerInfo);
    resultJSON = bgpPeerInfo;
    for (var key in xmppPeerInfo) {
        resultJSON[key] = xmppPeerInfo[key];
    }
    return resultJSON;
}

function getControlNodePeerInfo (req, res, appData)
{
    var hostName = req.param('hostname');
    var urlLists = [];

    urlLists[0] = '/analytics/bgp-peer/*:' + hostName + ':*';
    urlLists[1] = '/analytics/xmpp-peer/' + hostName + ':*?flat';

    async.map(urlLists, commonUtils.getJsonViaInternalApi(opServer.api, true),
              function(err, results) {
       var resultJSON = {};
       resultJSON['bgp-peer'] = results[0];
       resultJSON['xmpp-peer'] = results[1];
       commonUtils.handleJSONResponse(err, res, resultJSON);
    });
}

function getPagedPeerData (peerList, hostName, count, lastKey, appData, callback)
{
    var resultJSON = {};
    var dataObjArr = [];
    resultJSON['data'] = {};
    resultJSON['data']['bgp-peer'] = {};
    resultJSON['data']['bgp-peer']['value'] = [];
    resultJSON['data']['xmpp-peer'] = {};
    resultJSON['data']['xmpp-peer']['value'] = [];
    resultJSON['lastKey'] = null;
    resultJSON['more'] = false;
    var retLastKey = null;

    var matchStr = 'name';
    var index = nwMonUtils.getnThIndexByLastKey(lastKey, peerList, matchStr); 
    if (-2 == index) {
        callback(null, resultJSON);
        null;
    }
    try {
        var cnt = peerList.length;
    } catch(e) {
        callback(null, resultJSON);
        return;
    }
    if (cnt == index) {
        /* We are already at end */
        callback(null, resultJSON);
        return;
    }
    if (-1 == count) {
        totCnt = cnt;
    } else {
        totCnt = index + 1 + count;
    }
    if (totCnt < cnt) {
        retLastKey = peerList[totCnt - 1][matchStr];
    }
    var bgpPostData = {};
    bgpPostData['kfilt'] = [];
    var xmppPostData = {};
    xmppPostData['kfilt'] = [];

    for (var i = index + 1; i < totCnt; i++) {
        if (peerList[i]) {
            if ('bgp-peer' == peerList[i]['type']) {
                bgpPostData['kfilt'].push(peerList[i]['name']);
            }
            if ('xmpp-peer' == peerList[i]['type']) {
                xmppPostData['kfilt'].push(peerList[i]['name']);
            }
        }
    }
    if (bgpPostData['kfilt'].length > 0) {
        var bgpPeerUrl = '/analytics/uves/bgp-peer';
        commonUtils.createReqObj(dataObjArr, bgpPeerUrl,
                                 global.HTTP_REQUEST_POST, 
                                 commonUtils.cloneObj(bgpPostData), null, null,
                                 appData);
    }
    if (xmppPostData['kfilt'].length > 0) {
        var xmppPeerUrl = '/analytics/uves/xmpp-peer';
        commonUtils.createReqObj(dataObjArr, xmppPeerUrl,
                                 global.HTTP_REQUEST_POST, 
                                 commonUtils.cloneObj(xmppPostData), null, null,
                                 appData);
    }
    if (0 == dataObjArr.length) {
        callback(null, resultJSON);
        return;
    }
    async.map(dataObjArr, 
              commonUtils.getServerResponseByRestApi(opApiServer, true),
              function(err, data) {
        if ((null != err) || (null == data)) {
            callback(err, resultJSON);
            return;
        }
        if (bgpPostData['kfilt'].length > 0) {
            bgpArrIdx = 0;
            if (xmppPostData['kfilt'].length > 0) {
                xmppArrIdx = 1;
            } else {
                xmppArrIdx = -1;
            }
        } else {
            bgpArrIdx = -1;
            if (xmppPostData['kfilt'].length > 0) {
                xmppArrIdx = 0;
            } else {
                xmppArrIdx = -1;
            }
        }
        if (-1 != bgpArrIdx) {
            resultJSON['data']['bgp-peer'] = data[bgpArrIdx];
        } else {
            resultJSON['data']['bgp-peer']['value'] = [];
        }
        if (-1 != xmppArrIdx) {
            resultJSON['data']['xmpp-peer'] = data[xmppArrIdx];
        } else {
            resultJSON['data']['xmpp-peer']['value'] = [];
        }
        resultJSON['lastKey'] = retLastKey;
        if (null == retLastKey) {
            resultJSON['more'] = false;
        } else {
            resultJSON['more'] = true;
        }
        callback(err, resultJSON);
    });
}

function getControlNodePeerPagedInfo (req, res, appData)
{
    var hostName = req.param('hostname');
    var resultJSON = [];
    var urlLists = [];
    var peerList = [];
    var count = req.param('count');
    var lastKey = req.param('lastKey');
    var name = null;

    if (null == count) {
        count = -1;
    } else {
        count = parseInt(count);
    }
    urlLists[0] = '/analytics/bgp-peers';
    urlLists[1] = '/analytics/xmpp-peers';

    async.map(urlLists, commonUtils.getJsonViaInternalApi(opServer.api, true),
              function(err, results) {
        if ((null != err) || (null == results)) {
            commonUtils.handleJSONResponse(err, res, resultJSON);
            return;
        }
        if (null != results[0]) {
            var bgpPeerCnt = results[0].length;
            for (var i = 0; i < bgpPeerCnt; i++) {
                try {
                    name = results[0][i]['name'];
                    if (-1 != name.indexOf(':' + hostName + ':')) {
                        peerList.push({'name': name, 'type': 'bgp-peer'});
                    }
                } catch(e) {
                    continue;
                }
            }
        }
        if (null != results[1]) {
            var xmppPeerCnt = results[1].length;
            for (var i = 0; i < xmppPeerCnt; i++) {
                try {
                    name = results[1][i]['name'];
                    if (-1 != name.indexOf(hostName + ':')) {
                        peerList.push({'name': name, 'type': 'xmpp-peer'});
                    }
                } catch(e) {
                    continue;
                }
            }
        }
        peerList.sort(sortUVEList);
        getPagedPeerData(peerList, hostName, count, lastKey, appData, function(err, data) {
            commonUtils.handleJSONResponse(err, res, data);
        });
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

function getControlNodePeerDetails (req, res, appData)
{
    var urlLists = [];
    var resultJSON = [];

    adminApiHelper.getControlNodeList(appData, function(err, configData) {
        if (err || (null == configData)) {
            commonUtils.handleJSONResponse(err, res, null);
            return;
        }
        var len = configData.length;
        for (var i = 0; i < len; i++) {
            urlLists[i] = '/analytics/bgp-peer/*' + configData[i]['name'] + '*';
            urlLists[i + len] = '/analytics/xmpp-peer/' + configData[i]['name']
                + ':*?flat';
        }
        async.map(urlLists, 
                  commonUtils.getJsonViaInternalApi(opServer.api, true),
                  function(err, results) {
            for (var i = 0; i < len; i++) {
                resultJSON[i] = {};
                resultJSON[i] =
                    processControlNodePeerDetails(configData[i]['name'],
                                                  results[i], results[i + len]);
                resultJSON[i]['host'] = configData[i]['name'];
                resultJSON[i]['ip'] = configData[i]['ip'];
            }
            commonUtils.handleJSONResponse(err, res, resultJSON);
        });
    });
}

function getAclUUIDByFlowAclInfo (flowAclInfo)
{
    try {
        var uuidObj = jsonPath(flowAclInfo, "$..uuid");
        if (uuidObj.length > 0) {
            return uuidObj[0][0]['_'];
        }
    } catch(e) {
    }
    return global.RESP_DATA_NOT_AVAILABLE;
}

function postParsevRouterFlowsSandeshData (resultJSON, flowData)
{
    try {
        var cnt = resultJSON['flowData'].length;
    } catch(e) {
        return resultJSON;
    }
    for (var i = 0; i < cnt; i++) {
        try {
            resultJSON['flowData'][i]['acl_uuid'] =
                commonUtils.getSafeDataToJSONify(getAclUUIDByFlowAclInfo(flowData[i]['policy']));
                delete resultJSON['flowData'][i]['policy'];
        } catch(e) {
            resultJSON['flowData'][i]['acl_uuid'] =
                global.RESP_DATA_NOT_AVAILABLE;
        }
        try {
            resultJSON['flowData'][i]['out_acl_uuid'] =
                commonUtils.getSafeDataToJSONify(getAclUUIDByFlowAclInfo(flowData[i]['out_policy']));
            delete resultJSON['flowData'][i]['out_policy'];
        } catch(e) {
            resultJSON['flowData'][i]['out_acl_uuid'] =
                global.RESP_DATA_NOT_AVAILABLE;
        }
        try {
            resultJSON['flowData'][i]['sg_uuid'] =
                commonUtils.getSafeDataToJSONify(getAclUUIDByFlowAclInfo(flowData[i]['sg']));
            delete resultJSON['flowData'][i]['sg'];
        } catch(e) {
            resultJSON['flowData'][i]['sg_uuid'] =
                global.RESP_DATA_NOT_AVAILABLE;
        }
        try {
            resultJSON['flowData'][i]['out_sg_uuid'] =
                commonUtils.getSafeDataToJSONify(getAclUUIDByFlowAclInfo(flowData[i]['out_sg']));
            delete resultJSON['flowData'][i]['out_sg'];
        } catch(e) {
            resultJSON['flowData'][i]['out_sg_uuid'] =
                global.RESP_DATA_NOT_AVAILABLE;
        }
        try {
            resultJSON['flowData'][i]['bytes'] = 
                commonUtils.getSafeDataToJSONify(resultJSON['flowData'][i]['stats_bytes']);
            delete resultJSON['flowData'][i]['stats_bytes'];
        } catch(e) {
            resultJSON['flowData'][i]['bytes'] = global.RESP_DATA_NOT_AVAILABLE;
        }
        try {
        resultJSON['flowData'][i]['packets'] = 
            commonUtils.getSafeDataToJSONify(resultJSON['flowData'][i]['stats_packets']);
            delete resultJSON['flowData'][i]['stats_packets'];
        } catch(e) {
            resultJSON['flowData'][i]['packets'] =
                global.RESP_DATA_NOT_AVAILABLE;
        }
        try {
            resultJSON['flowData'][i]['source_vn'] = 
                commonUtils.getSafeDataToJSONify(resultJSON['flowData'][i]['src_vn']);
            delete resultJSON['flowData'][i]['src_vn'];
        } catch(e) {
            resultJSON['flowData'][i]['source_vn'] =
                global.RESP_DATA_NOT_AVAILABLE;
        }
        try {
            resultJSON['flowData'][i]['dest_vn'] = 
                commonUtils.getSafeDataToJSONify(resultJSON['flowData'][i]['dst_vn']);
            delete resultJSON['flowData'][i]['dst_vn'];
        } catch(e) {
            resultJSON['flowData'][i]['dest_vn'] =
                global.RESP_DATA_NOT_AVAILABLE;
        }
        try {
            resultJSON['flowData'][i]['src_ip'] = 
                commonUtils.getSafeDataToJSONify(resultJSON['flowData'][i]['sip']);
            delete resultJSON['flowData'][i]['sip'];
        } catch(e) {
            resultJSON['flowData'][i]['src_ip'] =
                global.RESP_DATA_NOT_AVAILABLE;
        }
        try {
            resultJSON['flowData'][i]['dst_ip'] = 
                commonUtils.getSafeDataToJSONify(resultJSON['flowData'][i]['dip']);
            delete resultJSON['flowData'][i]['dip'];
        } catch(e) {
            resultJSON['flowData'][i]['dst_ip'] =
                global.RESP_DATA_NOT_AVAILABLE;
        }
    }
    return resultJSON;
}

function parsevRouterFlowsSandeshData (flowSandeshData)
{
    var lastIndex = 0;
    var flowData = jsonPath(flowSandeshData, "$..SandeshFlowData");
    var resultArr = [];
    var resultJSON = {};

    try {
        if (flowData.length > 0) {
            commonUtils.createJSONBySandeshResponseArr(resultArr, flowData[0], lastIndex);
            resultJSON['flow_key'] =
            commonUtils.getSafeDataToJSONify(flowSandeshData[0]['FlowRecordsResp']
                                             ['flow_key'][0]['_']);
            resultJSON['flowData'] = resultArr;
            resultJSON = 
                postParsevRouterFlowsSandeshData(resultJSON, flowData[0]);
        }
    } catch(e) {
    }
    return resultJSON;
}

function getvRouterFlowsDetail (req, res, appData)
{
    var queryData = urlMod.parse(req.url, true);
    var flowKey = queryData.query['flowKey'];
    var ip = queryData.query['ip'];
    var aclUUID = queryData.query['aclUUID'];
    var iterKey = queryData.query['iterKey'];
    var resultJSON = [];
    var isFetchAll = false;
    var dataObjArr = [];

    var reqUrl= null;

    if ((null == aclUUID) && (null == iterKey)) {
        if (null == flowKey) {
            reqUrl = '/Snh_FetchAllFlowRecords?';
        } else {
            reqUrl = '/Snh_NextFlowRecordsSet?flow_key=' + flowKey;
        }
        isFetchAll = true;
    } else {
        if (null == iterKey) {
            reqUrl = '/Snh_AclFlowReq?x=' + aclUUID;
        } else {
            reqUrl = '/Snh_NextAclFlowReq?x=' + iterKey;
        }
    }

    var vRouterRestApi = 
        commonUtils.getRestAPIServer(ip, global.SANDESH_COMPUTE_NODE_PORT);

    commonUtils.createReqObj(dataObjArr, reqUrl);
    sendSandeshRequest(req, res, dataObjArr, vRouterRestApi);
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

function getControlNodeSandeshRequest (req, res, appData)
{
    var ip = req.param('ip');
    var type = req.param('type');
    var dataObjArr = [];
    var url = null;

    if (type == 'service-chain') {
        url = '/Snh_ShowServiceChainReq?';
    } else if (type == 'multicast-tree') {
        var rtTab = req.param('name');
        if (null == rtTab) {
            url = '/Snh_ShowMulticastManagerReq?';
        } else {
            url = '/Snh_ShowMulticastManagerDetailReq?x=' + rtTab;
        }
    } else if (type == 'routing-inst') {
        var name = req.param('name');
        if (null == name) {
            url = '/Snh_ShowRoutingInstanceReq?name=';
        } else {
            url = '/Snh_ShowRoutingInstanceReq?x=' + name;
        }
    } else if (type == 'static-route') {
        riName = req.param('name');
        if (null == riName) {
            url = '/Snh_ShowStaticRouteReq?ri_name=';
        } else {
            url = '/Snh_ShowStaticRouteReq?ri_name=' + riName;
        }
    }
    var controlNodeRestApi = 
        commonUtils.getRestAPIServer(ip, global.SANDESH_CONTROL_NODE_PORT);

    commonUtils.createReqObj(dataObjArr, url);
    sendSandeshRequest(req, res, dataObjArr, controlNodeRestApi);
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

function buildBulkUVEUrls (filtData, appData)
{
    filtData = filtData['data'];
    var url = '/analytics/uves';
    var dataObjArr = [];

    try {
        var modCnt = filtData.length;
    } catch(e) {
        return null;
    }
    for (var i = 0; i < modCnt; i++) {
        type = filtData[i]['type'];
        hostname = filtData[i]['hostname'];
        module = filtData[i]['module'];
        cfilt = filtData[i]['cfilt'];
        kfilt = filtData[i]['kfilt'];
        mfilt = filtData[i]['mfilt'];
        reqUrl = getBulkUVEUrl(type, hostname, module,
                               {cfilt:cfilt, kfilt:kfilt, mfilt:mfilt});
        /* All URLs should be valid */
        if (null == reqUrl) {
            return null;
        }
        commonUtils.createReqObj(dataObjArr, reqUrl, null,
                                 null, opApiServer, null, appData);
    }
    return dataObjArr;
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

function getGeneratorsList (hostName, appData, callback)
{
    var reqUrl = '/analytics/uves/collector';
    var dataObjArr = [];
    var postData = {};
    postData['kfilt'] = [hostName];
    postData['cfilt'] = ['CollectorState:generator_infos'];
    commonUtils.createReqObj(dataObjArr, reqUrl, global.HTTP_REQUEST_POST,
                             postData, opApiServer, null, appData);

    async.map(dataObjArr,
              commonUtils.getServerResponseByRestApi(opApiServer, true),
              function(err, results) {
        if ((null != err) || (null == results) || (null == results[0])) {
            callback(err, null);
            return;
        }
        var genInfo = jsonPath(results[0], "$..generator_infos");
        callback(err, genInfo[0]);
    });
}

function buildGenList (genList)
{
    var modGenList = [];
    try {
        var cnt = genList.length;
    } catch(e) {
        return null;
    }
    for (var i = 0; i < cnt; i++) {
        try {
            modGenList.push(genList[i]['source'] + ':' + 
                            genList[i]['node_type'] + ':' +
                            genList[i]['module_id'] + ':' +
                            genList[i]['instance_id']);
        } catch(e) {
            logutils.logger.error("JSON Parse error while building generator" +
                                  " list");
        }
    }
    modGenList.sort();
    return modGenList;
}

function getAnalyticsGenPagedSummary (req, res, appData)
{
    var count = req.param('count');
    var lastKey = req.param('lastKey');
    var hostName = req.param('hostname');
    var found = false;
    var retLastUUID = null;
    var resultJSON = {};
    var matchStr = 'name';
    var postData = {};
    var url = '/analytics/uves/generator';
    var lastGen = null;

    resultJSON['data'] = [];
    resultJSON['lastKey'] = null;
    resultJSON['more'] = false;
    postData['kfilt'] = [];
    postData['cfilt'] =
        ['ModuleClientState:client_info', 'ModuleServerState:generator_info',
        'ModuleServerState:msg_stats'];

    if (null != count) {
        count = parseInt(count);
    } else {
        count = -1;
    }
    
    if (null == hostName) {
        var err = new appErrors.RESTServerError('analytics node hostname not' +
                                                ' provided');
        commonUtils.handleJSONResponse(err, res, null);
        return;
    }
    getGeneratorsList(hostName, appData, function(err, genList) {
        var list = buildGenList(genList);
        if (null == list) {
            commonUtils.handleJSONResponse(null, res, resultJSON);
            return;
        }
        var index = nwMonUtils.getnThIndexByLastKey(lastKey, list, null);
        if (-2 == index) {
            commonUtils.handleJSONResponse(null, res, resultJSON);
            return;
        }
        try {
            var cnt = list.length;
        } catch(e) {
            commonUtils.handleJSONResponse(null, res, resultJSON);
            return;
        }
        if (cnt == index) {
            /* We are already at end */
            commonUtils.handleJSONResponse(null, res, resultJSON);
            return;
        }
        if (-1 == count) {
            totCnt = cnt;
        } else {
            totCnt = index + 1 + count;
        }
        if (totCnt < cnt) {
            lastGen = list[totCnt - 1];
        }
        for (var i = index + 1; i < totCnt; i++) {
            if (list[i]) {
                postData['kfilt'].push(list[i]);
                found = true;
            }
        }
        if (false == found) {
            commonUtils.handleJSONResponse(null, res, resultJSON);
            return;
        }
        opApiServer.apiPost(url, postData, appData, function (err, data) {
            resultJSON['data'] = data;
            resultJSON['lastKey'] = lastGen;
            if (null == lastGen) {
                resultJSON['more'] = false;
            } else {
                resultJSON['more'] = true;
            }
            commonUtils.handleJSONResponse(null, res, resultJSON);
        });
    });
}

exports.getvRoutersSummary = getvRoutersSummary;
exports.getvRouterDetails = getvRouterDetails;
exports.getControlNodesSummary = getControlNodesSummary;
exports.getControlNodeDetails = getControlNodeDetails;
exports.getConfigNodesList = getConfigNodesList;
exports.getConfigNodeDetails = getConfigNodeDetails;
exports.getConfigNodesSummary = getConfigNodesSummary;
exports.getAnalyticsNodeSummary = getAnalyticsNodeSummary;
exports.getAnalyticsNodeGenerators = getAnalyticsNodeGenerators;
exports.getAnalyticsNodeDetails = getAnalyticsNodeDetails;
exports.getAnalyticsNodeList = getAnalyticsNodeList;
exports.getControlNodePeerInfo = getControlNodePeerInfo;
exports.getControlNodePeerDetails = getControlNodePeerDetails;
exports.getvRouterFlowsDetail = getvRouterFlowsDetail;
exports.getControlNodeSandeshRequest = getControlNodeSandeshRequest;
exports.getServerResponseByModType = getServerResponseByModType;
exports.buildBulkUVEUrls = buildBulkUVEUrls;
exports.getvRoutersSummaryByJob = getvRoutersSummaryByJob;
exports.getAnalyticsGenPagedSummary = getAnalyticsGenPagedSummary;
exports.getvRouterGenerators = getvRouterGenerators;
exports.postProcessConfigNodeSummary = postProcessConfigNodeSummary;
exports.postProcessConfigNodeDetails = postProcessConfigNodeDetails;
exports.postProcessAnalyticsNodeSummaryJSON =
    postProcessAnalyticsNodeSummaryJSON;
exports.getControlNodePeerPagedInfo = getControlNodePeerPagedInfo;


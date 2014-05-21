/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
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

function getAnalyticsNodeSummary (req, res, appData)
{
    var addGen = req.param('addGen');
    var resultJSON = [];
    var dataObjArr = [];

    reqUrl = '/analytics/uves/analytics-node';
    var collPostData = {};
    collPostData['cfilt'] = ['ModuleCpuState', 'CollectorState:self_ip_list',
        'CollectorState:build_info', 'CollectorState:tx_socket_stats',
        'CollectorState:rx_socket_stats'];
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

function processAnalyticsNodeDetailJSON (hostName, genUVEData, callback)
{
    var data = null;
    var resultJSON = [];
    var lastIndex = 0;
    var url = '/analytics/uves/analytics-node/' + hostName + '?flat';
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

function getAnalyticsNodeDetails (req, res, appData)
{
    var hostName = req.param('hostname');
    var resultJSON = {};
    var url = '/analytics/uves/generator';
    var excludeProcessList = ['QueryEngine'];

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
                    resultJSON =
                        infraCmn.filterOutGeneratorInfoFromGenerators(excludeProcessList,
                                                                      resultJSON);
                    commonUtils.handleJSONResponse(null, res, resultJSON);
                });
            });
        }
    });
}

function getAnalyticsNodeList (req, res)
{
    var url = '/analytics/uves/analytics-nodes';

    opServer.api.get(url, function(err, data) {
        if (err || (null == data)) {
            commonUtils.handleJSONResponse(err, res, []);
        } else {
            commonUtils.handleJSONResponse(null, res, data);
        }
    });
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

function getGeneratorsList (hostName, appData, callback)
{
    var reqUrl = '/analytics/uves/analytics-node';
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

exports.getAnalyticsNodeSummary = getAnalyticsNodeSummary;
exports.getAnalyticsNodeGenerators = getAnalyticsNodeGenerators;
exports.postProcessAnalyticsNodeSummaryJSON = postProcessAnalyticsNodeSummaryJSON;
exports.getAnalyticsNodeDetails = getAnalyticsNodeDetails;
exports.getAnalyticsNodeList = getAnalyticsNodeList;
exports.getAnalyticsGenPagedSummary = getAnalyticsGenPagedSummary;


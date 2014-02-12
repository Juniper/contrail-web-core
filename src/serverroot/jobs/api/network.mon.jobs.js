/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

var rest = require('../../common/rest.api'),
    config = require('../../../../config/config.global.js'),
    logutils = require('../../utils/log.utils'),
    commonUtils = require('../../utils/common.utils'),
    messages = require('../../common/messages'),
    global = require('../../common/global'),
    appErrors = require('../../errors/app.errors'),
    util = require('util'),
    qs = require('querystring'),
    async = require('async'),
    jsonPath = require('JSONPath').eval,
    flowCache = require('../../common/flowCache.api'),
    nwMonUtils = require('../../common/nwMon.utils'),
    configApiServer = require('../../common/configServer.api'),
    assert = require('assert'),
    opServer;

opServer = rest.getAPIServer({apiName:global.label.OPS_API_SERVER,
    server:config.analytics.server_ip,
    port:config.analytics.server_port });

var parseString = require('xml2js').parseString;
nwMonJobsApi = module.exports;

function executeQueryString (queryJSON, callback)
{
    var resultData, startTime = (new Date()).getTime(), endTime;
    opServer.authorize(function () {
        opServer.api.post(global.RUN_QUERY_URL, queryJSON, function (error, jsonData) {
            endTime = (new Date()).getTime();
            logutils.logger.debug("Query executed in " + ((endTime - startTime) / 1000) +
                'secs ' + JSON.stringify(queryJSON));
            callback(error, jsonData);
        });
    });
};

function formatAndClause (objArr)
{
    var result = [];
    var len = objArr.length;
    result[0] = [];
    for (var i = 0; i < len; i++) {
        for (key in objArr[i]) {
            result[0].push({'name':key, 'op':1, 'value':objArr[i][key]});
        }
    }
    return result;
}

/**
 * Function: formatAndOrClause
 *  This function is used to formulate OR of two clauses which are ANDed
 * Ex: [[{'key1': value1}, {'key2': value2}],
 *      [{key3': value3}, {'key4': value4}]]
 * Output: (key1 AND key2) OR (key3 AND key4)
 */

function formatAndOrClause(objArrList)
{
    var objList = [], clause;
    var count = objArrList.length;
    for (var i = 0; i < count; i++) {
        clause = formatAndClause(objArrList[i]);
        objList[i] = clause[0];
    }
    return objList;
}

function formatQueryString (table, whereClauseObjArr, selectFieldObjArr, 
                            timeObj, noSortReqd, limit, dir, AndClause)
{
    var queryJSON = {};
    var whereClauseLen = 0;
    queryJSON = global.QUERY_JSON[table];
    var selectLen = selectFieldObjArr.length;
    queryJSON['select_fields'] = [];
    for (var i = 0; i < selectLen; i++) {
        /* Every array element is one object */
        queryJSON['select_fields'][i] = selectFieldObjArr[i];
    }
    queryJSON['select_fields'][i] = 'flow_count';
    selectFieldObjArr[i] = 'flow_count';

    queryJSON['start_time'] = timeObj['start_time'];
    queryJSON['end_time'] = timeObj['end_time'];
    if ((null == noSortReqd) || (false == noSortReqd) ||
        (typeof noSortReqd === 'undefined')) {
        queryJSON['sort_fields'] = ['sum(bytes)'];
        queryJSON['sort'] = global.QUERY_STRING_SORT_DESC;
    }
    if ((limit != null) && (typeof limit != undefined) && (-1 != limit)) {
        queryJSON['limit'] = limit;
    }
    queryJSON['where'] = [];
    whereClauseLen = whereClauseObjArr.length;
    if ((null == AndClause) || (typeof AndClause === 'undefined')) {
        for (i = 0; i < whereClauseLen; i++) {
            for (key in whereClauseObjArr[i]) {
                queryJSON['where'][i] =
                    [
                        {"name":key, "value":whereClauseObjArr[i][key], "op":1}
                    ];
            }
        }
    } else {
        queryJSON['where'][0] = [];
        for (i = 0; i < whereClauseLen; i++) {
            for (key in whereClauseObjArr[i]) {
                queryJSON['where'][0][i] =
                {"name":key, "value":whereClauseObjArr[i][key], "op":1};
            }
        }
    }
    if ((dir == null) || (typeof dir === 'undefined')) {
        queryJSON['dir'] = global.TRAFFIC_DIR_INGRESS;
    } else {
        queryJSON['dir'] = dir;
    }
    return commonUtils.cloneObj(queryJSON);
}

function formatQueryStringWithWhereClause (table, whereClause, selectFieldObjArr,
                                           timeObj, noSortReqd, limit, dir)
{
    var queryJSON = {};
    var whereClauseLen = 0;
    queryJSON = global.QUERY_JSON[table];
    var selectLen = selectFieldObjArr.length;
    queryJSON['select_fields'] = [];

    for (var i = 0; i < selectLen; i++) {
        /* Every array element is one object */
        queryJSON['select_fields'][i] = selectFieldObjArr[i];
    }
    queryJSON['select_fields'][i] = 'flow_count';
    selectFieldObjArr[i] = 'flow_count';

    queryJSON['start_time'] = timeObj['start_time'];
    queryJSON['end_time'] = timeObj['end_time'];
    if ((null == noSortReqd) || (false == noSortReqd) ||
        (typeof noSortReqd === 'undefined')) {
        queryJSON['sort_fields'] = ['sum(bytes)'];
        queryJSON['sort'] = global.QUERY_STRING_SORT_DESC;
    }
    if ((limit != null) && (typeof limit != undefined) && (-1 != limit)) {
        queryJSON['limit'] = limit;
    }
    queryJSON['where'] = whereClause;

    if ((dir == null) || (typeof dir === 'undefined')) {
        queryJSON['dir'] = global.TRAFFIC_DIR_INGRESS;
    } else {
        queryJSON['dir'] = dir;
    }
    return commonUtils.cloneObj(queryJSON);
}

/* Creates AND Clause Format:
 Ex: AndObjArr: [{'aaa': 12}, {'bbb': 15}]
 OrObjArr:  [{'ccc': 20}, {'ddd': 40}]
 O/P:
 [[{"name":"ccc","op":1,"value":20},{"name":"aaa","op":1,"value":12}, {"name":"bbb","op":1,"value":15}],
 [{"name":"ddd","op":1,"value":40}, {"name":"aaa","op":1,"value":12},{"name":"bbb","op":1,"value":15}]]
 */
function formatAndClauseGroup (AndObjArr, OrObjArr)
{
    var AndClause = [];
    var orObjArrLen = OrObjArr.length;
    var andObjArrLen = AndObjArr.length;
    var result = [];
    var index = 0, myId = 0;
    var finalResult = [];
    for (var i = 0; i < orObjArrLen; i++) {
        index = 0;
        for (key in OrObjArr[i]) {
            result[index++] = {'name':key, 'op':1, 'value':OrObjArr[i][key]};
        }
        for (j = 0; j < andObjArrLen; j++) {
            for (key in AndObjArr[j]) {
                result[index++] = {'name':key, 'op':1, 'value':AndObjArr[j][key]};
            }
        }
        finalResult[myId++] = commonUtils.cloneObj(result);
    }
    return finalResult;
}

function formatQueryWithPortRange (startPort, endPort, prots, vnFqName,
                                   isSrc)
{
    var result = [];
    var index = 0;
    var finalResult = [];
    var fqNameArr = vnFqName.split(':');
    if (fqNameArr.length != 3) {
        vnFqName = vnFqName + ':';
        vnOp = 7;
    } else {
        vnOp = 1;
    }
    if (isSrc) {
        portField = 'sport';
        vnField = 'sourcevn';
    } else {
        portField = 'dport';
        vnField = 'sourcevn';
    }

    var protosCnt = prots.length;
    for (var i = 0; i < protosCnt; i++) {
        index = 0;
        result = [];
        result[index++] = {'name':'protocol', 'op':1, 'value':prots[i]};
        if ((startPort != null) && (endPort != null)) {
            result[index++] = 
                {'name':portField, "value":startPort, "op":3, "value2":endPort};
        }
        result[index++]=
            {'name': vnField, "value": vnFqName, "op":vnOp};
        finalResult.push(result);
    }
    return finalResult;
}

function formatFlowSeriesQuery (queryString)
{
    if (null != queryString['limit']) {
        delete queryString['limit'];
    }
    if (null != queryString['sort']) {
        delete queryString['sort'];
    }
    if (null != queryString['sort_fields']) {
        delete queryString['sort_fields'];
    }
}

function sortEntries (statA, statB, sortKey)
{
    return statB[sortKey] - statA[sortKey];
}

function sortEntriesByObj (resultJSON, sortKey)
{
    resultJSON.sort(function (statA, statB) {
        return sortEntries(statA, statB, sortKey);
    });
    return resultJSON;
}

function getTopEntriesByCount (entryList, limit)
{
    if ((limit != null) && (limit != -1)) {
        return (entryList.slice(0, limit));
    }
    return entryList;
}

function getTopNCountEntry (resultJSON, limit, sortKey)
{
    if ((resultJSON == null) || (resultJSON.length < 2)) {
        return resultJSON;
    }
    if ((sortKey == null) || (typeof sortKey === undefined)) {
        sortKey = 'totalBytes';
    }
    resultJSON = sortEntriesByObj(resultJSON, sortKey);

    resultJSON = getTopEntriesByCount(resultJSON, limit);
    return resultJSON;
}

function createVNListObjArr (networkList, isSrcVn)
{
    var vnListObjArr = [];
    var len = networkList.length;
    for (var i = 0; i < len; i++) {
        vnListObjArr[i] = {};
        if (isSrcVn) {
            vnListObjArr[i]["sourcevn"] = networkList[i];
        } else {
            vnListObjArr[i]["destvn"] = networkList[i];
        }
    }
    return vnListObjArr;
}

function createTimeQueryJsonObj (minsSince, endTime)
{
    var startTime = 0, timeObj = {};

    if(endTime != null && endTime != '' ) {
        try {
            endTime = parseInt(endTime);
        } catch (err) {
            endTime = commonUtils.getUTCTime(new Date().getTime());
        }
    } else {
        endTime = commonUtils.getUTCTime(new Date().getTime());
    }

    if (minsSince != -1) {
        startTime = commonUtils.getUTCTime(commonUtils.adjustDate(new Date(endTime), {'min':-minsSince}).getTime());
    }


    timeObj['start_time'] = startTime * 1000;
    timeObj['end_time'] = endTime * 1000;
    return timeObj;
}

function getNetworkListsByProject (projObj, callback)
{
    var fqdn = null;
    var fqdnList = [];
    var vnCount = 0;
    var project = projObj['project'];
    var jobData = projObj['jobData'];
    var url = '/virtual-networks?parent_type=project&parent_fq_name_str=' + project;
    configApiServer.apiGet(url, jobData, function (error, jsonData) {
        if (error) {
            callback(error, jsonData);
        } else {
            try {
                vnCount = jsonData["virtual-networks"].length;
                for (i = 0; i < vnCount; i++) {
                    fq_name = jsonData['virtual-networks'][i].fq_name.join(':');
                    fqdnList[i] = fq_name;
                }
                callback(null, fqdnList);
            } catch (e) {
                callback(null, '');
            }
        }
    });
}

function getNwUrlListsByDomain (url, jobData, callback)
{
    var urlLists = [], projectLists = [], j = 0;
    configApiServer.apiGet(url, jobData, function (error, jsonData) {
        if (error) {
            callback(error, null, null);
            return;
        }
        try {
            var projects = jsonData['projects'];
            var projectsCount = projects.length;
            for (var i = 0; i < projectsCount; i++) {
                /*                if ((projects[i]['fq_name'][1] == 'service') ||
                 (projects[i]['fq_name'][1] == 'default-project') ||
                 (projects[i]['fq_name'][1] == 'invisible_to_admin')) {
                 continue;
                 }*/
                projectLists[j] = projects[i]['fq_name'].join(':');
                url = "/virtual-networks?parent_type=project&parent_fq_name_str=" + projectLists[j];
                urlLists[j] = url;
                j++;
            }
            callback(null, urlLists, projectLists);
        } catch (e) {
            callback(e, urlLists, projectLists);
        }
    });
}

function getNetworkListsByDomain (domain, jobData, callback)
{
    var urlLists = [], j = 0;
    var projectLists = [];
    var nwLists = [];
    var url = '/projects?domain=' + domain;

    getNwUrlListsByDomain(url, jobData, function (err, urlLists, projectLists) {
        if (err) {
            callback(err, null, null);
        } else {
            var dataObjArr = [];
            var projCnt = projectLists.length;
            for (var i = 0; i < projCnt; i++) {
                dataObjArr[i] = {};
                dataObjArr[i]['project'] = projectLists[i];
                dataObjArr[i]['jobData'] = jobData;
            }
            async.map(dataObjArr, getNetworkListsByProject, function (err, networkLists) {
                /* Now get the flow series data for all these networks */
                var len = networkLists.length;
                callback(err, networkLists, projectLists);
            });
        }
    });
}

function aggAndPutDataInResultJSON (matchName, statEntry, resultJSON)
{
    var resultCnt = 0;
    var i = 0;
    resultCnt = resultJSON.length;
    for (i = 0; i < resultCnt; i++) {
        if (resultJSON && resultJSON[i] && (resultJSON[i]['name'] == matchName)) {
            break;
        }
    }
    if (i == resultCnt) {
        /* New entry */
        index = resultCnt;
        resultJSON[index] = {};
        resultJSON[index]['outPkts'] = 0;
        resultJSON[index]['outBytes'] = 0;
        resultJSON[index]['inPkts'] = 0;
        resultJSON[index]['inBytes'] = 0;
        resultJSON[index]['inFlowCount'] = 0;
        resultJSON[index]['outFlowCount'] = 0;
    } else {
        index = i;
    }
    resultJSON[index]['name'] = matchName;
    resultJSON[index]['outPkts'] =
        parseInt(resultJSON[index]['outPkts']) +
            parseInt(statEntry['outPkts']);
    resultJSON[index]['outBytes'] =
        parseInt(resultJSON[index]['outBytes']) +
            parseInt(statEntry['outBytes']);
    resultJSON[index]['inPkts'] =
        parseInt(resultJSON[index]['inPkts']) +
            parseInt(statEntry['inPkts']);
    resultJSON[index]['inBytes'] =
        parseInt(resultJSON[index]['inBytes']) +
            parseInt(statEntry['inBytes']);
    resultJSON[index]['totalBytes'] =
        resultJSON[index]['inBytes'] + resultJSON[index]['outBytes']
    resultJSON[index]['totalPkts'] =
        resultJSON[index]['inPkts'] + resultJSON[index]['outPkts']
    resultJSON[index]['inFlowCount'] =
        parseInt(resultJSON[index]['inFlowCount']) +
            parseInt(statEntry['inFlowCount']);
    resultJSON[index]['outFlowCount'] =
        parseInt(resultJSON[index]['outFlowCount']) +
            parseInt(statEntry['outFlowCount']);
}

function getAggDataByDomainOrProject (jsonResponse, type, callback)
{
    var fqnArr = [];
    var resultJSON = [];
    var len = 0;
    var matchName = null;
    len = jsonResponse.length;
    for (var i = 0; i < len; i++) {
        try {
            fqnArr = jsonResponse[i]['sourcevn'].split(':');
        } catch (e) {
            fqnArr = jsonResponse[i]['destvn'].split(':');
        }
        if (type == 'domain') {
            matchName = fqnArr[0];
        } else {
            matchName = fqnArr[0] + ':' + fqnArr[1];
        }
        aggAndPutDataInResultJSON(matchName, jsonResponse[i], resultJSON);
    }
    callback(null, resultJSON);
}

function getNetworkOutIndex (resultJSON, statEntry, srcSelectArr, destSelectArr)
{
    var key;
    var found = false;
    var len = resultJSON.length;
    var selectArrlen = srcSelectArr.length;

    for (var i = 0; i < len; i++) {
        if (found == true) {
            break;
        }
        for (j = 0; j < selectArrlen; j++) {
            srcKey = srcSelectArr[j];
            destKey = destSelectArr[j];
            if ((srcKey == 'sum(bytes)') || (srcKey == 'sum(packets)') ||
                (srcKey == 'flow_count')) {
                continue;
            }
            if (resultJSON[i][srcKey] != statEntry[destKey]) {
                found = false;
                break;
            } else {
                found = true;
            }
        }
    }
    if ((i == len) && (found == false)) {
        return -1;
    }
    return (i - 1);
}

function fillResultJSONByIndex (resultJSON, index, statEntry, selectArr, isSrc)
{
    var selectArrlen = selectArr.length;
    var key;
    resultJSON[index]['name'] = (statEntry['sourcevn']) ?
        statEntry['sourcevn'] : statEntry['destvn'];
    for (var i = 0; i < selectArrlen; i++) {
        key = selectArr[i];
        if (key == 'sum(bytes)') {
            if (isSrc) {
                resultJSON[index]['inBytes'] = statEntry[key];
            } else {
                resultJSON[index]['outBytes'] = statEntry[key];
            }
        } else if (key == 'sum(packets)') {
            if (isSrc) {
                resultJSON[index]['inPkts'] = statEntry[key];
            } else {
                resultJSON[index]['outPkts'] = statEntry[key];
            }
        } else if (key == 'flow_count') {
            if (isSrc) {
                resultJSON[index]['inFlowCount'] = statEntry[key];
            } else {
                resultJSON[index]['outFlowCount'] = statEntry[key];
            }
        } else {
            resultJSON[index][key] = statEntry[key];
        }
    }
    resultJSON[index]['totalPkts'] = resultJSON[index]['inPkts'] +
        resultJSON[index]['outPkts'];
    resultJSON[index]['totalBytes'] = resultJSON[index]['inBytes'] +
        resultJSON[index]['outBytes'];
}

function parseNetStatDataByDomainOrProject (resultJSON, data, srcSelectArr, destSelectArr)
{
    if ((null == data) || (0 == data.length)) {
        return;
    }
    var srcSelectArrLen = srcSelectArr.length;
    var destSelectArrLen = destSelectArr.length;
    try {
        var outStat = data[0]['value'];
        var outStatLen = outStat.length;
    } catch (e) {
        outStatLen = 0;
    }
    var index = -1;
    for (var i = 0; i < outStatLen; i++) {
        resultJSON[i] = {};
        resultJSON[i]['inBytes'] = 0;
        resultJSON[i]['inPkts'] = 0;
        resultJSON[i]['outBytes'] = 0;
        resultJSON[i]['outPkts'] = 0;
        resultJSON[i]['inFlowCount'] = 0;
        resultJSON[i]['outFlowCount'] = 0;
        fillResultJSONByIndex(resultJSON, i, outStat[i], srcSelectArr, false);
    }
    var lastIndex = i;
    try {
        var inStat = data[1]['value'];
        var inStatLen = inStat.length;
    } catch (e) {
        inStatLen = 0;
    }
    for (i = 0; i < inStatLen; i++) {
        index = getNetworkOutIndex(resultJSON, inStat[i], srcSelectArr, destSelectArr);
        if (index == -1) {
            resultJSON[lastIndex] = {};
            resultJSON[lastIndex]['inBytes'] = 0;
            resultJSON[lastIndex]['inPkts'] = 0;
            resultJSON[lastIndex]['outBytes'] = 0;
            resultJSON[lastIndex]['outPkts'] = 0;
            resultJSON[lastIndex]['inFlowCount'] = 0;
            resultJSON[lastIndex]['outFlowCount'] = 0;
            fillResultJSONByIndex(resultJSON, lastIndex, inStat[i], destSelectArr, true);
        } else {
            fillResultJSONByIndex(resultJSON, index, inStat[i], destSelectArr, true);
        }
    }
}

function parseNetStatDataProjectOrNetwork (resultJSON, data, srcSelectArr, 
                                           destSelectArr)
{
    if ((null == data) || (0 == data.length)) {
        return;
    }
    try {
        var outStat = data[0]['value'];
        var outStatLen = outStat.length;
        resultJSON["sport"] = [];
    } catch (e) {
        outStatLen = 0;
    }
    for (var i = 0; i < outStatLen; i++) {
        resultJSON["sport"][i] = {};
        resultJSON["sport"][i]['outBytes'] = 0;
        resultJSON["sport"][i]['outPkts'] = 0;
        resultJSON["sport"][i]['outFlowCount'] = 0;
        fillResultJSONByIndex(resultJSON["sport"], i, outStat[i], srcSelectArr, false);
    }
    try {
        var inStat = data[1]['value'];
        var inStatLen = inStat.length;
        resultJSON["dport"] = [];
    } catch (e) {
        inStatLen = 0;
    }
    for (i = 0; i < inStatLen; i++) {
        resultJSON["dport"][i] = {};
        resultJSON["dport"][i]['inBytes'] = 0;
        resultJSON["dport"][i]['inPkts'] = 0;
        resultJSON["dport"][i]['inFlowCount'] = 0;
        fillResultJSONByIndex(resultJSON["dport"], i, inStat[i], destSelectArr, true);
    }
}

function getNwListByNwArray (networkListsArr)
{
    var nwLists = [];
    for (var i = 0; networkListsArr && (i < networkListsArr.length); i++) {
        nwLists = nwLists.concat(networkListsArr[i]);
    }
    return nwLists;
}

function processTopNwDetailsByDomain (pubChannel, saveChannelKey, jobData, done)
{
    var url = jobData.taskData.url;
    var urlLists = [];
    var i, j = 0;
    var appData = jobData.taskData.appData;
    var limit = (appData['limit']) ? parseInt(appData['limit']) : (-1);
    var srcVNObjArr = [];
    var destVNObjArr = [];
    var srcSelectArr = ['sum(bytes)', 'sum(packets)', 'sourcevn'];
    var destSelectArr = ['sum(bytes)', 'sum(packets)', 'destvn'];

    var domain = appData['domain'];
    var dataObjArr = [];
    var resultJSON = [];

    var timeObj = createTimeQueryJsonObj(appData.minsSince);

    getNetworkListsByDomain(domain, jobData, function (err, networkLists, projectLists) {
        var nwLists = getNwListByNwArray(networkLists);
        srcVNObjArr = createVNListObjArr(nwLists, true);
        var srcQueryJSON = formatQueryString('FlowSeriesTable', srcVNObjArr,
            srcSelectArr, timeObj, null,
            global.TRAFFIC_STAT_TOP_COUNT);
        commonUtils.createReqObj(dataObjArr, global.RUN_QUERY_URL,
            global.HTTP_REQUEST_POST,
            commonUtils.cloneObj(srcQueryJSON));

        destVNObjArr = createVNListObjArr(nwLists, false);
        var destQueryJSON = formatQueryString('FlowSeriesTable', destVNObjArr,
            destSelectArr, timeObj, null,
            global.TRAFFIC_STAT_TOP_COUNT);
        commonUtils.createReqObj(dataObjArr, global.RUN_QUERY_URL,
            global.HTTP_REQUEST_POST,
            commonUtils.cloneObj(destQueryJSON));
        logutils.logger.debug(messages.qe.qe_execution + 'Top N/W by domain:' + domain +
            'with Query' + JSON.stringify(dataObjArr[0]['data']),
            JSON.stringify(dataObjArr[1]['data']));
        async.map(dataObjArr, commonUtils.getServerRespByRestApi(opServer, true),
            function (err, data) {
                parseNetStatDataByDomainOrProject(resultJSON, data, srcSelectArr, destSelectArr);
                resultJSON = getTopNCountEntry(resultJSON, limit, null);
                redisPub.publishDataToRedis(pubChannel, saveChannelKey,
                    global.HTTP_STATUS_RESP_OK,
                    JSON.stringify(resultJSON),
                    JSON.stringify(resultJSON),
                    0, 0, done);
            });
    });
}

function getVnCountByProject (projName, projects, nws)
{
    try {
        var len = projects.length;
        for (var j = 0; j < len; j++) {
            if (projName == projects[j]) {
                return nws[j].length;
            }
        }
        return 0;
    } catch (e) {
        logutils.logger.debug("In getVnCountByProject(): JSON Parse error:" +
            e);
        return 0;
    }
}

function addNwCountByProject (resultJSON, projects, nws)
{
    var projName = null;
    try {
        var projectLen = projects.length;
        var len = resultJSON.length;
        for (var i = 0; i < len; i++) {
            projName = resultJSON[i]['name'];
            resultJSON[i]['vnCount'] =
                getVnCountByProject(projName, projects, nws);
        }
    } catch (e) {
        logutils.logger.debug("In addNwCountByProject(): JSON Parse error:" + e);
    }
}

function processTopProjectDetailsByDomain (pubChannel, saveChannelKey, jobData, done)
{
    var url = jobData.taskData.url;
    var urlLists = [];
    var i, j = 0;
    var appData = jobData.taskData.appData;
    var limit = (appData['limit']) ? parseInt(appData['limit']) : (-1);
    var srcVNObjArr = [];
    var destVNObjArr = [];
    var srcSelectArr = ['sum(bytes)', 'sum(packets)', 'sourcevn'];
    var destSelectArr = ['sum(bytes)', 'sum(packets)', 'destvn'];
    var domain = appData['domain'];
    var dataObjArr = [];
    var resultJSON = [];

    var timeObj = createTimeQueryJsonObj(appData.minsSince);

    getNetworkListsByDomain(domain, jobData, function (err, networkLists, projectLists) {
        var nwLists = getNwListByNwArray(networkLists);
        srcVNObjArr = createVNListObjArr(nwLists, true);
        var srcQueryJSON = formatQueryString('FlowSeriesTable', srcVNObjArr,
            srcSelectArr, timeObj);
        commonUtils.createReqObj(dataObjArr, global.RUN_QUERY_URL,
            global.HTTP_REQUEST_POST,
            commonUtils.cloneObj(srcQueryJSON));

        destVNObjArr = createVNListObjArr(nwLists, false);
        var destQueryJSON = formatQueryString('FlowSeriesTable', destVNObjArr,
            destSelectArr, timeObj);
        commonUtils.createReqObj(dataObjArr, global.RUN_QUERY_URL,
            global.HTTP_REQUEST_POST,
            commonUtils.cloneObj(destQueryJSON));
        logutils.logger.debug(messages.qe.qe_execution + 'Top project by domain:' + domain +
            'with Query' + JSON.stringify(dataObjArr[0]['data']),
            JSON.stringify(dataObjArr[1]['data']));
        async.map(dataObjArr, commonUtils.getServerRespByRestApi(opServer, true),
            function (err, data) {
                parseNetStatDataByDomainOrProject(resultJSON, data, srcSelectArr, destSelectArr);
                getAggDataByDomainOrProject(resultJSON, 'project', function (err, resultJSON) {
                    addNwCountByProject(resultJSON, projectLists, networkLists);
                    var result = getTopNCountEntry(resultJSON, limit, null);
                    redisPub.publishDataToRedis(pubChannel, saveChannelKey,
                        global.HTTP_STATUS_RESP_OK,
                        JSON.stringify(result),
                        JSON.stringify(result),
                        0, 0, done);

                });
            });
    });
}

function processTopPortByDomain (pubChannel, saveChannelKey, jobData, done)
{
    var appData = jobData.taskData.appData;

    var limit = (appData['limit']) ? parseInt(appData['limit']) : (-1);
    var srcVNObjArr = [];
    var destVNObjArr = [];
    var srcSelectArr = ['sum(bytes)', 'sum(packets)', 'sport', 'protocol'];
    var destSelectArr = ['sum(bytes)', 'sum(packets)', 'dport', 'protocol'];
    var domain = appData['domain'];
    var dataObjArr = [];
    var resultJSON = [];

    var timeObj = createTimeQueryJsonObj(appData.minsSince);

    getNetworkListsByDomain(domain, jobData, function (err, networkLists, projectLists) {
        var nwLists = getNwListByNwArray(networkLists);
        srcVNObjArr = createVNListObjArr(nwLists, true);
        var srcQueryJSON = formatQueryString('FlowSeriesTable', srcVNObjArr,
            srcSelectArr, timeObj, null,
            global.TRAFFIC_STAT_TOP_COUNT);
        commonUtils.createReqObj(dataObjArr, global.RUN_QUERY_URL,
            global.HTTP_REQUEST_POST,
            commonUtils.cloneObj(srcQueryJSON));

        destVNObjArr = createVNListObjArr(nwLists, false);
        var destQueryJSON = formatQueryString('FlowSeriesTable', destVNObjArr,
            destSelectArr, timeObj, null,
            global.TRAFFIC_STAT_TOP_COUNT);
        commonUtils.createReqObj(dataObjArr, global.RUN_QUERY_URL,
            global.HTTP_REQUEST_POST,
            commonUtils.cloneObj(destQueryJSON));
        logutils.logger.debug(messages.qe.qe_execution + 'Top port by domain:' + domain +
            'with Query' + JSON.stringify(dataObjArr[0]['data']),
            JSON.stringify(dataObjArr[1]['data']));
        async.map(dataObjArr, commonUtils.getServerRespByRestApi(opServer, true),
            function (err, data) {
                parseNetStatDataByDomainOrProject(resultJSON, data, srcSelectArr, destSelectArr);
                resultJSON = getTopNCountEntry(resultJSON, limit, null);
                redisPub.publishDataToRedis(pubChannel, saveChannelKey,
                    global.HTTP_STATUS_RESP_OK,
                    JSON.stringify(resultJSON),
                    JSON.stringify(resultJSON),
                    0, 0, done);
            });
    });
}

function createTimeQueryJsonObjByAppData (appData)
{
    var timeObj = {};

    if (appData['startTime']) {
        timeObj['start_time'] = parseInt(appData['startTime']) * 1000;
        timeObj['end_time'] = parseInt(appData['endTime']) * 1000;
    } else {
        timeObj = createTimeQueryJsonObj(appData['minsSince']);
    }
    return timeObj;
}

function processTopPortByProject (pubChannel, saveChannelKey, jobData, done)
{
    var appData = jobData.taskData.appData;

    var limit = (appData['limit']) ? parseInt(appData['limit']) : (-1);
    var srcVNObjArr = [];
    var destVNObjArr = [];
    var srcSelectArr = ['sum(bytes)', 'sum(packets)', 'sport', 'protocol'];
    var destSelectArr = ['sum(bytes)', 'sum(packets)', 'dport', 'protocol'];
    var project = appData['project'];
    var dataObjArr = [];
    var resultJSON = {};
    var domain = appData['project'];

    var timeObj = createTimeQueryJsonObjByAppData(appData);

    getNetworkListsByProject({project:project, jobData:jobData},
        function (err, nwLists) {
            srcVNObjArr = createVNListObjArr(nwLists, true);
            var srcQueryJSON = formatQueryString('FlowSeriesTable', srcVNObjArr,
                srcSelectArr, timeObj, null,
                global.TRAFFIC_STAT_TOP_COUNT);
            commonUtils.createReqObj(dataObjArr, global.RUN_QUERY_URL,
                global.HTTP_REQUEST_POST,
                commonUtils.cloneObj(srcQueryJSON));

            destVNObjArr = createVNListObjArr(nwLists, true);
            var destQueryJSON = formatQueryString('FlowSeriesTable', destVNObjArr,
                destSelectArr, timeObj, null,
                global.TRAFFIC_STAT_TOP_COUNT);
            commonUtils.createReqObj(dataObjArr, global.RUN_QUERY_URL,
                global.HTTP_REQUEST_POST,
                commonUtils.cloneObj(destQueryJSON));
            logutils.logger.debug(messages.qe.qe_execution + 'Top port by project:' + project +
                'with Query' + JSON.stringify(dataObjArr[0]['data']),
                JSON.stringify(dataObjArr[1]['data']));
            async.map(dataObjArr, commonUtils.getServerRespByRestApi(opServer, true),
                commonUtils.doEnsureExecution(function(err, data) {
                    parseNetStatDataProjectOrNetwork(resultJSON, data, srcSelectArr, destSelectArr);
                    redisPub.publishDataToRedis(pubChannel, saveChannelKey,
                        global.HTTP_STATUS_RESP_OK,
                        JSON.stringify(resultJSON),
                        JSON.stringify(resultJSON),
                        0, 0, done);
                }, global.DEFAULT_MIDDLEWARE_API_TIMEOUT));
        });
}

function parseFlowData (data)
{
    var len = 0;
    var flowData;
    var pktsCount = 0;
    var bytesCount = 0;
    var resultJSON = [];

    if ((data != null) && (data['value']) && (data['value'].length)) {
        flowData = data['value'];
        len = flowData.length;
        for (var i = 0; i < len; i++) {
            resultJSON[i] = {};
            resultJSON[i] = commonUtils.cloneObj(flowData[i]);
            for (var key in flowData[i]) {
                if (key == 'sum(packets)') {
                    pktsCount = flowData[i]['sum(packets)'];
                    resultJSON[i]['pkts'] = pktsCount;
                    delete resultJSON[i]['sum(packets)'];
                } else if (key == 'sum(bytes)') {
                    bytesCount = flowData[i]['sum(bytes)'];
                    resultJSON[i]['bytes'] = bytesCount;
                    delete resultJSON[i]['sum(bytes)'];
                }
            }
        }
    }
    return resultJSON;
}

function processTopFlowsByProject (pubChannel, saveChannelKey, jobData, done)
{
    var appData = jobData.taskData.appData;

    var limit = (appData['limit']) ? parseInt(appData['limit']) : (-1);
    var srcVNObjArr = [];
    var destVNObjArr = [];
    var srcSelectArr = ['flow_class_id', 'sourcevn', 'sourceip', 'destvn',
        'destip', 'sport', 'dport', 'protocol', 'sum(bytes)',
        'sum(packets)'];
    var project = appData['project'];
    var resultJSON = [];

    var timeObj = createTimeQueryJsonObj(appData.minsSince);
    getNetworkListsByProject({project:project, jobData:jobData},
        function (err, nwLists) {
            srcVNObjArr = createVNListObjArr(nwLists, true);
            destVNObjArr = createVNListObjArr(nwLists, false);
            srcVNObjArr = srcVNObjArr.concat(destVNObjArr);
            var srcQueryJSON = formatQueryString('FlowSeriesTable', srcVNObjArr,
                srcSelectArr, timeObj, null,
                global.TRAFFIC_STAT_TOP_COUNT);
            executeQueryString(srcQueryJSON, function (err, data) {
                var resultJSON = [];
                resultJSON = parseFlowData(data);
                resultJSON = getTopNCountEntry(resultJSON, limit, 'bytes');
                redisPub.publishDataToRedis(pubChannel, saveChannelKey,
                    global.HTTP_STATUS_RESP_OK,
                    JSON.stringify(resultJSON),
                    JSON.stringify(resultJSON),
                    0, 0, done);
            });
        });
}

function processTopFlowsByDomain (pubChannel, saveChannelKey, jobData, done)
{
    var appData = jobData.taskData.appData;

    var limit = (appData['limit']) ? parseInt(appData['limit']) : (-1);
    var srcVNObjArr = [];
    var destVNObjArr = [];
    var srcSelectArr = ['flow_class_id', 'sourcevn', 'sourceip', 'destvn',
        'destip', 'sport', 'dport', 'protocol', 'sum(bytes)',
        'sum(packets)'];
    var domain = appData['domain'];
    var resultJSON = [];

    var timeObj = createTimeQueryJsonObj(appData.minsSince);
    getNetworkListsByDomain(domain, jobData, function (err, networkLists) {
        var nwLists = getNwListByNwArray(networkLists);
        srcVNObjArr = createVNListObjArr(nwLists, true);
        destVNObjArr = createVNListObjArr(nwLists, false);
        srcVNObjArr = srcVNObjArr.concat(destVNObjArr);

        var srcQueryJSON = formatQueryString('FlowSeriesTable', srcVNObjArr,
            srcSelectArr, timeObj, null,
            global.TRAFFIC_STAT_TOP_COUNT);
        logutils.logger.debug(messages.qe.qe_execution + 'Top Flow by Domain ' +
            domain);
        executeQueryString(srcQueryJSON, function (err, data) {
            var resultJSON = [];
            resultJSON = parseFlowData(data);
            resultJSON = getTopNCountEntry(resultJSON, limit, 'bytes');
            redisPub.publishDataToRedis(pubChannel, saveChannelKey,
                global.HTTP_STATUS_RESP_OK,
                JSON.stringify(resultJSON),
                JSON.stringify(resultJSON),
                0, 0, done);
        });
    });
}

function doConcatArr (data)
{
    var result = [];
    if ((data == null) || (data['value'] == null)) {
        return result;
    }
    var len = data['value'].length;
    var result = [];
    for (var i = 0; i < len; i++) {
        result = result.concat(data['value'][i]);
    }
    return result;
}

function processVNFlowSeriesData (pubChannel, saveChannelKey, jobData, done)
{
    var appData = jobData.taskData.appData;
    var srcVNObjArr = [];
    var destVNObjArr = [];
    var vnName = appData['srcVN'];
    var srcWhereClause = [
        {'sourcevn':vnName}
    ];
    var destWhereClause = [
        {'destvn':vnName}
    ];
    var minsSince = appData.minsSince;
    var timeObj;
    var timeGran;
    if (minsSince != null) {
        timeObj = createTimeQueryJsonObj(appData.minsSince);
        timeGran = nwMonUtils.getTimeGranByTimeSlice(timeObj, appData.sampleCnt);
    } else {
        timeObj =
            nwMonUtils.createTimeQueryObjByStartEndTime(appData['startTime'],
                appData['endTime']);
        timeGran = appData['timeGran'];
    }
    var strTimeGran = 'T=' + timeGran;
    var srcSelectArr = ['sum(bytes)', 'sum(packets)', strTimeGran, 'sourcevn'];
    var destSelectArr = ['sum(bytes)', 'sum(packets)', strTimeGran, 'destvn'];

    var srcQueryJSON = formatQueryString('FlowSeriesTable', srcWhereClause,
        srcSelectArr, timeObj, true, null);
    var destQueryJSON = formatQueryString('FlowSeriesTable', destWhereClause,
        destSelectArr, timeObj, true, null);
    formatFlowSeriesQuery(srcQueryJSON);
    formatFlowSeriesQuery(destQueryJSON);
    logutils.logger.debug(messages.qe.qe_execution + 'VN Flow Series data ' +
        vnName);
    flowCache.getFlowSeriesData('vn', appData, srcQueryJSON, destQueryJSON,
        commonUtils.doEnsureExecution(function(err, data) {
            if (data != null) {
                resultJSON = data;
            } else {
                resultJSON = {};
            }
            redisPub.publishDataToRedis(pubChannel, saveChannelKey,
                global.HTTP_STATUS_RESP_OK,
                JSON.stringify(resultJSON),
                JSON.stringify(resultJSON),
                0, 0, done);
        }, global.DEFAULT_MIDDLEWARE_API_TIMEOUT));
}

function processVNsFlowSeriesData (pubChannel, saveChannelKey, jobData, done)
{
    var appData = jobData.taskData.appData;
    var srcVNObjArr = [];
    var destVNObjArr = [];
    var srcVN = appData['srcVN'];
    var dstVN = appData['dstVN'];
    var srcWhereClause = [
        {'sourcevn':srcVN},
        {'destvn':dstVN}
    ];
    var destWhereClause = [
        {'sourcevn':dstVN},
        {'destvn':srcVN}
    ];
    var minsSince = appData['minsSince'];
    var timeObj;
    var timeGran;
    if (minsSince != null) {
        timeObj = createTimeQueryJsonObj(appData['minsSince']);
        timeGran = nwMonUtils.getTimeGranByTimeSlice(timeObj,
            appData['sampleCnt']);
    } else {
        timeObj =
            nwMonUtils.createTimeQueryObjByStartEndTime(appData['startTime'],
                appData['endTime']);
        timeGran = appData['timeGran'];
    }
    var strTimeGran = 'T=' + timeGran;
    var srcSelectArr = ['sum(bytes)', 'sum(packets)', strTimeGran, 'sourcevn', 'destvn'];
    var destSelectArr = ['sum(bytes)', 'sum(packets)', strTimeGran, 'sourcevn', 'destvn'];

    var srcQueryJSON = formatQueryString('FlowSeriesTable', srcWhereClause,
        srcSelectArr, timeObj, true, null, 1, true);
    var destQueryJSON = formatQueryString('FlowSeriesTable', destWhereClause,
        destSelectArr, timeObj, true, null, 1, true);
    formatFlowSeriesQuery(srcQueryJSON);
    formatFlowSeriesQuery(destQueryJSON);
    logutils.logger.debug(messages.qe.qe_execution + 'Connected VNs Flow Series data ' +
        srcVN + ' ' + dstVN);
    flowCache.getFlowSeriesData('conn-vn', appData, srcQueryJSON, destQueryJSON,
        function (err, data) {
            if (data != null) {
                resultJSON = data;
            } else {
                resultJSON = {};
            }
            redisPub.publishDataToRedis(pubChannel, saveChannelKey,
                global.HTTP_STATUS_RESP_OK,
                JSON.stringify(resultJSON),
                JSON.stringify(resultJSON),
                0, 0, done);
        });
}

function processTopNwDetailsByProject (pubChannel, saveChannelKey, jobData, done)
{
    var appData = jobData.taskData.appData;
    var project = appData['project'];
    var limit = (appData['limit']) ? parseInt(appData['limit']) : (-1);
    var srcVNObjArr = [];
    var destVNObjArr = [];
    var resultJSON = [];
    var srcSelectArr = ['sum(bytes)', 'sum(packets)', 'sourcevn'];
    var destSelectArr = ['sum(bytes)', 'sum(packets)', 'destvn'];

    getNetworkListsByProject({project:project, jobData:jobData},
        function (err, nwLists) {
            srcVNObjArr = createVNListObjArr(nwLists, true);
            destVNObjArr = createVNListObjArr(nwLists, false);
            var timeObj = createTimeQueryJsonObj(appData.minsSince);
            var srcQueryJSON = formatQueryString('FlowSeriesTable', srcVNObjArr,
                srcSelectArr, timeObj, null,
                global.TRAFFIC_STAT_TOP_COUNT);
            var destQueryJSON = formatQueryString('FlowSeriesTable', destVNObjArr,
                destSelectArr, timeObj, null,
                global.TRAFFIC_STAT_TOP_COUNT);
            logutils.logger.debug(messages.qe.qe_execution + 'Top N/W by project ' + project);
            nwMonUtils.getStatDataByQueryJSON(srcQueryJSON, destQueryJSON, function (err, data) {
                parseNetStatDataByDomainOrProject(resultJSON, data, srcSelectArr, destSelectArr);
                resultJSON = getTopNCountEntry(resultJSON, limit, null);
                redisPub.publishDataToRedis(pubChannel, saveChannelKey,
                    global.HTTP_STATUS_RESP_OK,
                    JSON.stringify(resultJSON),
                    JSON.stringify(resultJSON),
                    0, 0, done);
            });
        });
}

function processTopPeerByDomain (pubChannel, saveChannelKey, jobData, done)
{
    var appData = jobData.taskData.appData;
    var domain = appData['domain'];
    var limit = (appData['limit']) ? parseInt(appData['limit']) : (-1);

    var srcVNObjArr = [];
    var destVNObjArr = [];
    var resultJSON = [];
    var srcSelectArr = ['sum(bytes)', 'sum(packets)', 'sourcevn', 'sourceip'];
    var destSelectArr = ['sum(bytes)', 'sum(packets)', 'destvn', 'destip'];

    getNetworkListsByDomain(domain, jobData, function (err, networkLists) {
        var nwLists = getNwListByNwArray(networkLists);
        var timeObj = createTimeQueryJsonObj(appData.minsSince);
        srcVNObjArr = createVNListObjArr(nwLists, true);
        destVNObjArr = createVNListObjArr(nwLists, false);
        var srcQueryJSON = formatQueryString('FlowSeriesTable', srcVNObjArr,
            srcSelectArr, timeObj, null,
            global.TRAFFIC_STAT_TOP_COUNT);
        var destQueryJSON = formatQueryString('FlowSeriesTable', destVNObjArr,
            destSelectArr, timeObj, null,
            global.TRAFFIC_STAT_TOP_COUNT);
        logutils.logger.debug(messages.qe.qe_execution + 'Top Peer by domain' + domain);
        nwMonUtils.getStatDataByQueryJSON(srcQueryJSON, destQueryJSON, function (err, data) {
            parseNetStatDataByDomainOrProject(resultJSON, data, srcSelectArr, destSelectArr);
            resultJSON = getTopNCountEntry(resultJSON, limit, null);
            redisPub.publishDataToRedis(pubChannel, saveChannelKey,
                global.HTTP_STATUS_RESP_OK,
                JSON.stringify(resultJSON),
                JSON.stringify(resultJSON),
                0, 0, done);
        });
    });
}

function processTopPeerByProject (pubChannel, saveChannelKey, jobData, done)
{
    var appData = jobData.taskData.appData;
    var project = appData['project'];
    var limit = (appData['limit']) ? parseInt(appData['limit']) : (-1);
    var srcVNObjArr = [];
    var destVNObjArr = [];
    var resultJSON = [];
    var srcSelectArr = ['sum(bytes)', 'sum(packets)', 'sourcevn', 'sourceip'];
    var destSelectArr = ['sum(bytes)', 'sum(packets)', 'destvn', 'destip'];

    getNetworkListsByProject({project:project, jobData:jobData},
        function (err, nwLists) {
            srcVNObjArr = createVNListObjArr(nwLists, true);
            destVNObjArr = createVNListObjArr(nwLists, false);
            var timeObj = createTimeQueryJsonObj(appData.minsSince);
            var srcQueryJSON = formatQueryString('FlowSeriesTable', srcVNObjArr,
                srcSelectArr, timeObj, null,
                global.TRAFFIC_STAT_TOP_COUNT);
            var destQueryJSON = formatQueryString('FlowSeriesTable', destVNObjArr,
                destSelectArr, timeObj, null,
                global.TRAFFIC_STAT_TOP_COUNT);
            logutils.logger.debug(messages.qe.qe_execution + 'Top Peer by project:' +
                project);
            nwMonUtils.getStatDataByQueryJSON(srcQueryJSON, destQueryJSON, function (err, data) {
                parseNetStatDataByDomainOrProject(resultJSON, data, srcSelectArr, destSelectArr);
                resultJSON = getTopNCountEntry(resultJSON, limit, null);
                redisPub.publishDataToRedis(pubChannel, saveChannelKey,
                    global.HTTP_STATUS_RESP_OK,
                    JSON.stringify(resultJSON),
                    JSON.stringify(resultJSON),
                    0, 0, done);
            });
        });
}

function processTopPortByNetwork (pubChannel, saveChannelKey, jobData, done, type)
{
    var appData = jobData.taskData.appData;

    var limit = (appData['limit']) ? parseInt(appData['limit']) : (-1);
    var srcVNObjArr = [];
    var destVNObjArr = [];
    var srcSelectArr = ['sum(bytes)', 'sum(packets)', 'sport', 'protocol'];
    var destSelectArr = ['sum(bytes)', 'sum(packets)', 'dport', 'protocol'];
    var vnName = appData['fqName'];
    var dataObjArr = [];
    var resultJSON = {};
    var srcWhereClause = [
        {'sourcevn':vnName}
    ];
    var destWhereClause = [
        {'sourcevn':vnName}
    ];

    var timeObj = createTimeQueryJsonObjByAppData(appData);
    if (type == global.STR_GET_TOP_PORT_BY_CONN_NW) {
        var srcVN = appData.srcVN;
        var destVN = appData.destVN;
        srcWhereClause = [
            {'sourcevn':srcVN},
            {'destvn':destVN}
        ];
        destWhereClause = [
            {'sourcevn':destVN},
            {'destvn':srcVN}
        ];
        var srcQueryJSON = formatQueryString('FlowSeriesTable', srcWhereClause,
            srcSelectArr, timeObj, null,
            global.TRAFFIC_STAT_TOP_COUNT,
            global.TRAFFIC_DIR_INGRESS, true);
        var destQueryJSON = formatQueryString('FlowSeriesTable', destWhereClause,
            destSelectArr, timeObj, null,
            global.TRAFFIC_STAT_TOP_COUNT,
            global.TRAFFIC_DIR_INGRESS,
            true);
        logutils.logger.debug(messages.qe.qe_execution + 'Top port in connected networks'
            + srcVN + ' ' + destVN);
    } else {
        logutils.logger.debug(messages.qe.qe_execution + 'Top port in VN ' + vnName);
        var srcQueryJSON = formatQueryString('FlowSeriesTable', srcWhereClause,
            srcSelectArr, timeObj, null,
            global.TRAFFIC_STAT_TOP_COUNT);
        var destQueryJSON = formatQueryString('FlowSeriesTable', destWhereClause,
            destSelectArr, timeObj, null,
            global.TRAFFIC_STAT_TOP_COUNT);
    }
    commonUtils.createReqObj(dataObjArr, global.RUN_QUERY_URL,
        global.HTTP_REQUEST_POST,
        commonUtils.cloneObj(srcQueryJSON));
    commonUtils.createReqObj(dataObjArr, global.RUN_QUERY_URL,
        global.HTTP_REQUEST_POST,
        commonUtils.cloneObj(destQueryJSON));
    nwMonUtils.getStatDataByQueryJSON(srcQueryJSON, destQueryJSON, function (err, data) {
        parseNetStatDataProjectOrNetwork(resultJSON, data, srcSelectArr, destSelectArr);
        redisPub.publishDataToRedis(pubChannel, saveChannelKey,
            global.HTTP_STATUS_RESP_OK,
            JSON.stringify(resultJSON),
            JSON.stringify(resultJSON),
            0, 0, done);
    });
}

function processTopPeerByNetwork (pubChannel, saveChannelKey, jobData, done, type)
{
    var appData = jobData.taskData.appData;

    var limit = (appData['limit']) ? parseInt(appData['limit']) : (-1);
    var srcVNObjArr = [];
    var destVNObjArr = [];
    var srcSelectArr = ['sum(bytes)', 'sum(packets)', 'sourcevn', 'sourceip'];
    var destSelectArr = ['sum(bytes)', 'sum(packets)', 'destvn', 'destip'];
    var vnName = appData['fqName'];
    var resultJSON = [];
    var srcWhereClause = [
        {'sourcevn':vnName}
    ];
    var destWhereClause = [
        {'destvn':vnName}
    ];
    var timeObj = createTimeQueryJsonObj(appData.minsSince);
    if (type == global.STR_GET_TOP_PEER_BY_CONN_NW) {
        var srcVN = appData.srcVN;
        var destVN = appData.destVN;
        srcWhereClause = [
            {'sourcevn':srcVN},
            {'destvn':destVN}
        ];
        destWhereClause = [
            {'sourcevn':destVN},
            {'destvn':srcVN}
        ];
        var srcQueryJSON = formatQueryString('FlowSeriesTable', srcWhereClause,
            srcSelectArr, timeObj, null,
            global.TRAFFIC_STAT_TOP_COUNT,
            global.TRAFFIC_DIR_INGRESS, true);
        var destQueryJSON = formatQueryString('FlowSeriesTable', destWhereClause,
            destSelectArr, timeObj, null,
            global.TRAFFIC_STAT_TOP_COUNT,
            global.TRAFFIC_DIR_INGRESS,
            true);
        logutils.logger.debug(messages.qe.qe_execution + 'Top peer in connected networks'
            + srcVN + ' ' + destVN);
    } else {
        var srcQueryJSON = formatQueryString('FlowSeriesTable', srcWhereClause,
            srcSelectArr, timeObj, null,
            global.TRAFFIC_STAT_TOP_COUNT);
        var destQueryJSON = formatQueryString('FlowSeriesTable', destWhereClause,
            destSelectArr, timeObj, null,
            global.TRAFFIC_STAT_TOP_COUNT);
        logutils.logger.debug(messages.qe.qe_execution + 'Top peer in VN ' + vnName);
    }
    nwMonUtils.getStatDataByQueryJSON(srcQueryJSON, destQueryJSON, function (err, data) {
        parseNetStatDataByDomainOrProject(resultJSON, data, srcSelectArr, destSelectArr);
        resultJSON = getTopNCountEntry(resultJSON, limit, null);
        redisPub.publishDataToRedis(pubChannel, saveChannelKey,
            global.HTTP_STATUS_RESP_OK,
            JSON.stringify(resultJSON),
            JSON.stringify(resultJSON),
            0, 0, done);
    });
}

function getFlowQueryJSONByAppData (appData, VNObjArr, selectArr, timeObj)
{
    var whereClause =
        [
            {'sourcevn':appData.srcVN},
            {'sourceip':appData.srcIP},
            {'destvn':appData.destVN},
            {'destip':appData.destIP},
            {'sport':appData.sport},
            {'dport':appData.dport},
            {'protocol':appData.proto}
        ];
    whereClause = formatAndClause(whereClause);
    queryJSON =
        formatQueryStringWithWhereClause('FlowSeriesTable',
            whereClause,
            selectArr, timeObj, null,
            appData.limit);
    return queryJSON;
}

function processTopFlowsByNetwork (pubChannel, saveChannelKey, jobData, done, type)
{
    var appData = jobData.taskData.appData;

    var limit = (appData['limit']) ? parseInt(appData['limit']) : (-1);
    var srcVNObjArr = [];
    var vnName = appData.fqName;
    var srcSelectArr = ['flow_class_id', 'sourcevn', 'sourceip', 'destvn',
        'destip', 'sport', 'dport', 'protocol', 'sum(bytes)',
        'sum(packets)'];
    var resultJSON = [];
    var timeObj = createTimeQueryJsonObj(appData.minsSince);
    var srcWhereClause = [
        {'sourcevn':vnName},
        {'destvn':vnName}
    ];
    if ((type != null) && (type == global.STR_GET_FLOW_DETAILS_BY_FLOW_TUPLE)) {
        srcQueryJSON = getFlowQueryJSONByAppData(appData, srcWhereClause,
            srcSelectArr, timeObj);
    } else {
        srcQueryJSON = formatQueryString('FlowSeriesTable', srcWhereClause,
            srcSelectArr, timeObj, null,
            global.TRAFFIC_STAT_TOP_COUNT);
    }
    if (type == global.STR_GET_TOP_FLOWS_BY_CONN_NW) {
        var srcVN = appData.srcVN;
        var destVN = appData.destVN;
        srcWhereClause = [
            {'sourcevn':srcVN},
            {'destvn':destVN}
        ];
        srcQueryJSON = formatQueryString('FlowSeriesTable', srcWhereClause,
            srcSelectArr, timeObj, null,
            global.TRAFFIC_STAT_TOP_COUNT,
            global.TRAFFIC_DIR_INGRESS, true);
    }
    executeQueryString(srcQueryJSON, function (err, data) {
        var resultJSON = [];
        resultJSON = parseFlowData(data);
        resultJSON = getTopNCountEntry(resultJSON, limit, 'bytes');
        redisPub.publishDataToRedis(pubChannel, saveChannelKey,
            global.HTTP_STATUS_RESP_OK,
            JSON.stringify(resultJSON),
            JSON.stringify(resultJSON),
            0, 0, done);
    });
}

function processTopPeerByVM (pubChannel, saveChannelKey, jobData, done)
{
    var appData = jobData.taskData.appData;

    var limit = (appData['limit']) ? parseInt(appData['limit']) : (-1);
    var srcVNObjArr = [];
    var destVNObjArr = [];
    var srcSelectArr = ['sum(bytes)', 'sum(packets)', 'sourcevn', 'sourceip'];
    var destSelectArr = ['sum(bytes)', 'sum(packets)', 'destvn', 'destip'];
    var vnName = appData['fqName'];
    var ip = appData['ip'];
    var resultJSON = [];
    var srcWhereClause = [
        {'sourcevn':vnName},
        {'sourceip':ip}
    ];
    var destWhereClause = [
        {'destvn':vnName},
        {'destip':ip}
    ];
    var timeObj = createTimeQueryJsonObj(appData.minsSince);
    var srcQueryJSON = formatQueryString('FlowSeriesTable', srcWhereClause,
        srcSelectArr, timeObj, null,
        global.TRAFFIC_STAT_TOP_COUNT,
        global.TRAFFIC_DIR_INGRESS, true);
    var destQueryJSON = formatQueryString('FlowSeriesTable', destWhereClause,
        destSelectArr, timeObj, null,
        global.TRAFFIC_STAT_TOP_COUNT,
        global.TRAFFIC_DIR_INGRESS, true);
    logutils.logger.debug(messages.qe.qe_execution + 'Top peer in VM ' + vnName + ' ' +
        ip);
    nwMonUtils.getStatDataByQueryJSON(srcQueryJSON, destQueryJSON, function (err, data) {
        parseNetStatDataByDomainOrProject(resultJSON, data, srcSelectArr, destSelectArr);
        resultJSON = getTopNCountEntry(resultJSON, limit, null);
        redisPub.publishDataToRedis(pubChannel, saveChannelKey,
            global.HTTP_STATUS_RESP_OK,
            JSON.stringify(resultJSON),
            JSON.stringify(resultJSON),
            0, 0, done);
    });
}

function processTopPortByVM (pubChannel, saveChannelKey, jobData, done)
{
    var appData = jobData.taskData.appData;

    var limit = (appData['limit']) ? parseInt(appData['limit']) : (-1);
    var srcVNObjArr = [];
    var destVNObjArr = [];
    var srcSelectArr = ['sum(bytes)', 'sum(packets)', 'sport', 'protocol'];
    var destSelectArr = ['sum(bytes)', 'sum(packets)', 'dport', 'protocol'];
    var vnName = appData['fqName'];
    var ip = appData['ip'];
    var dataObjArr = [];
    var resultJSON = [];
    var srcWhereClause = [
        {'sourcevn':vnName},
        {'sourceip':ip}
    ];
    var destWhereClause = [
        {'destvn':vnName},
        {'destip':ip}
    ];

    var timeObj = createTimeQueryJsonObj(appData.minsSince);
    var srcQueryJSON = formatQueryString('FlowSeriesTable', srcWhereClause,
        srcSelectArr, timeObj, null,
        global.TRAFFIC_STAT_TOP_COUNT,
        global.TRAFFIC_DIR_INGRESS, true);
    commonUtils.createReqObj(dataObjArr, global.RUN_QUERY_URL,
        global.HTTP_REQUEST_POST,
        commonUtils.cloneObj(srcQueryJSON));
    var destQueryJSON = formatQueryString('FlowSeriesTable', destWhereClause,
        destSelectArr, timeObj, null,
        global.TRAFFIC_STAT_TOP_COUNT,
        global.TRAFFIC_DIR_INGRESS, true);
    commonUtils.createReqObj(dataObjArr, global.RUN_QUERY_URL,
        global.HTTP_REQUEST_POST,
        commonUtils.cloneObj(destQueryJSON));

    nwMonUtils.getStatDataByQueryJSON(srcQueryJSON, destQueryJSON, function (err, data) {
        parseNetStatDataByDomainOrProject(resultJSON, data, srcSelectArr, destSelectArr);
        resultJSON = getTopNCountEntry(resultJSON, limit, null);
        redisPub.publishDataToRedis(pubChannel, saveChannelKey,
            global.HTTP_STATUS_RESP_OK,
            JSON.stringify(resultJSON),
            JSON.stringify(resultJSON),
            0, 0, done);
    });
}

function processTopFlowsByVM (pubChannel, saveChannelKey, jobData, done)
{
    var appData = jobData.taskData.appData;

    var limit = (appData['limit']) ? parseInt(appData['limit']) : (-1);
    var srcVNObjArr = [];
    var ip = appData.ip;
    var vnName = appData.fqName;
    var srcSelectArr = ['flow_class_id', 'sourcevn', 'sourceip', 'destvn',
        'destip', 'sport', 'dport', 'protocol', 'sum(bytes)',
        'sum(packets)'];
    var resultJSON = [];

    var whereClause = [
        [
            {'sourcevn':vnName},
            {'sourceip':ip}
        ],
        [
            {'destvn':vnName},
            {'destip':ip}
        ]
    ];
    var timeObj = createTimeQueryJsonObj(appData.minsSince);
    var srcWhereClause = formatAndOrClause(whereClause);

    var srcQueryJSON =
        formatQueryStringWithWhereClause('FlowSeriesTable', srcWhereClause,
            srcSelectArr, timeObj, null,
            global.TRAFFIC_STAT_TOP_COUNT,
            global.TRAFFIC_DIR_INGRESS, true);
    executeQueryString(srcQueryJSON, function (err, data) {
        var resultJSON = [];
        resultJSON = parseFlowData(data);
        resultJSON = getTopNCountEntry(resultJSON, limit, 'bytes');
        redisPub.publishDataToRedis(pubChannel, saveChannelKey,
            global.HTTP_STATUS_RESP_OK,
            JSON.stringify(resultJSON),
            JSON.stringify(resultJSON),
            0, 0, done);
    });
}

function processVMFlowSeriesData (pubChannel, saveChannelKey, jobData, done)
{
    var appData = jobData.taskData.appData;
    var srcVNObjArr = [];
    var destVNObjArr = [];
    var vnName = appData['vnName'];
    var ip = appData.ip;
    var srcWhereClause = [
        {'sourcevn':vnName},
        {'sourceip':ip}
    ];
    var destWhereClause = [
        {'destvn':vnName},
        {'destip':ip}
    ];
    var minsSince = appData['minsSince'];
    var timeObj;
    var timeGran;
    if (minsSince != null) {
        timeObj = createTimeQueryJsonObj(appData['minsSince']);
        timeGran = nwMonUtils.getTimeGranByTimeSlice(timeObj,
            appData['sampleCnt']);
    } else {
        timeObj =
            nwMonUtils.createTimeQueryObjByStartEndTime(appData['startTime'],
                appData['endTime']);
        timeGran = appData['timeGran'];
    }
    var strTimeGran = 'T=' + timeGran;
    var srcSelectArr = ['sum(bytes)', 'sum(packets)', strTimeGran, 'sourcevn'];
    var destSelectArr = ['sum(bytes)', 'sum(packets)', strTimeGran, 'destvn'];

    var srcQueryJSON = formatQueryString('FlowSeriesTable', srcWhereClause,
        srcSelectArr, timeObj, true, null,
        global.TRAFFIC_DIR_INGRESS, true);
    var destQueryJSON = formatQueryString('FlowSeriesTable', destWhereClause,
        destSelectArr, timeObj, true, null,
        global.TRAFFIC_DIR_INGRESS, true);
    formatFlowSeriesQuery(srcQueryJSON);
    formatFlowSeriesQuery(destQueryJSON);
    logutils.logger.debug(messages.qe.qe_execution + 'VM Flow Series data ' +
        vnName);
    flowCache.getFlowSeriesData('vm', appData, srcQueryJSON, destQueryJSON,
        function (err, data) {
            if (data != null) {
                resultJSON = data;
            } else {
                resultJSON = {};
            }
            redisPub.publishDataToRedis(pubChannel, saveChannelKey,
                global.HTTP_STATUS_RESP_OK,
                JSON.stringify(resultJSON),
                JSON.stringify(resultJSON),
                0, 0, done);
        });
}

function parseVMStats (resultJSON, data)
{
    if (data && data.length) {
        resultJSON['fromNW'] = {};
        resultJSON['toNW'] = {};
        try {
            resultJSON['fromNW']['inBytes'] = data[0]['value'][0]['sum(bytes)'];
        } catch (e) {
            resultJSON['fromNW']['inBytes'] = 0;
        }
        try {
            resultJSON['fromNW']['inPkts'] = data[0]['value'][0]['sum(packets)'];
        } catch (e) {
            resultJSON['fromNW']['inPkts'] = 0;
        }
        try {
            resultJSON['fromNW']['outBytes'] = data[1]['value'][0]['sum(bytes)'];
        } catch (e) {
            resultJSON['fromNW']['outBytes'] = 0;
        }
        try {
            resultJSON['fromNW']['outPkts'] = data[1]['value'][0]['sum(packets)'];
        } catch (e) {
            resultJSON['fromNW']['outPkts'] = 0;
        }
        try {
            resultJSON['toNW']['inBytes'] = data[2]['value'][0]['sum(bytes)'];
        } catch (e) {
            resultJSON['toNW']['inBytes'] = 0;
        }
        try {
            resultJSON['toNW']['inPkts'] = data[2]['value'][0]['sum(packets)'];
        } catch (e) {
            resultJSON['toNW']['inPkts'] = 0;
        }
        try {
            resultJSON['toNW']['outBytes'] = data[3]['value'][0]['sum(bytes)'];
        } catch (e) {
            resultJSON['toNW']['outBytes'] = 0;
        }
        try {
            resultJSON['toNW']['outPkts'] = data[3]['value'][0]['sum(packets)'];
        } catch (e) {
            resultJSON['toNW']['outPkts'] = 0;
        }
    }
}

function processStatSummary (pubChannel, saveChannelKey, jobData, done, type)
{
    var appData = jobData.taskData.appData;
    var vnName = appData['vnName'];
    var dataObjArr = [];
    var ip = appData.ip;
    var minsSince = appData.minsSince;
    var srcWhereClause;
    var destWhereClause;
    var srcSelectArr = ['sum(bytes)', 'sum(packets)'];
    var destSelectArr = ['sum(bytes)', 'sum(packets)'];
    var queryJSON = [];
    var timeObj = createTimeQueryJsonObj(-1);
    var timeGran = nwMonUtils.getTimeGranByTimeSlice(timeObj, (appData.sampleCnt));
    var strTimeGran = 'T=' + timeGran;

    if (type == global.GET_STAT_SUMMARY_BY_CONN_NWS) {
        var srcVN = appData.srcVN;
        var destVN = appData.destVN;
        srcWhereClause = [
            {'sourcevn':srcVN},
            {'destvn':destVN}
        ];
        destWhereClause = [
            {'sourcevn':destVN},
            {'destvn':srcVN}
        ];
    } else {
        srcWhereClause = [
            {'sourcevn':vnName},
            {'sourceip':ip}
        ];
        destWhereClause = [
            {'destvn':vnName},
            {'destip':ip}
        ];
    }
    /* Query String to get the ingress Traffic From this N/W */
    queryJSON[0] = formatQueryString('FlowSeriesTable', srcWhereClause,
        srcSelectArr, timeObj, true, null,
        global.TRAFFIC_DIR_INGRESS, true);
    /* Query String to get the egress Traffic from this N/W */
    queryJSON[1] = formatQueryString('FlowSeriesTable', srcWhereClause,
        srcSelectArr, timeObj, true, null,
        global.TRAFFIC_DIR_EGRESS, true);
    /* Query String to get the ingress traffic to this N/W */
    queryJSON[2] = formatQueryString('FlowSeriesTable', destWhereClause,
        destSelectArr, timeObj, true, null,
        global.TRAFFIC_DIR_INGRESS, true);
    /* Query String to get the egress traffic to this N/W */
    queryJSON[3] = formatQueryString('FlowSeriesTable', destWhereClause,
        destSelectArr, timeObj, true, null,
        global.TRAFFIC_DIR_EGRESS, true);
    if (type == global.GET_STAT_SUMMARY_BY_CONN_NWS) {
        str = 'Query for Connected Networks Stat Summary ';
    } else {
        str = 'Query for VM Stat Summary';
    }
    logutils.logger.debug(messages.qe.qe_execution + str + ':\n' +
        JSON.stringify(queryJSON[0]) + '\n' +
        JSON.stringify(queryJSON[1]) + '\n' +
        JSON.stringify(queryJSON[2]) + '\n' +
        JSON.stringify(queryJSON[3]));
    for (var i = 0; i < 4; i++) {
        commonUtils.createReqObj(dataObjArr, global.RUN_QUERY_URL,
            global.HTTP_REQUEST_POST,
            commonUtils.cloneObj(queryJSON[i]));
    }
    async.map(dataObjArr, commonUtils.getServerRespByRestApi(opServer, true),
        function (err, data) {
            var resultJSON = {};
            parseVMStats(resultJSON, data);
            redisPub.publishDataToRedis(pubChannel, saveChannelKey,
                global.HTTP_STATUS_RESP_OK,
                JSON.stringify(resultJSON),
                JSON.stringify(resultJSON),
                0, 0, done);
        });
}

function processVMStatSummary (pubChannel, saveChannelKey, jobData, done)
{
    setTimeout(function () {
        /* For processing the VM Stats, QE takes much time, as QE currently does
         * not do parallel processing, so when the instance page
         * loads, making sure VM Stats request goes at end by putting this
         * callback to be called after 2 seconds, before that all other top
         * Peer, top port request etc will be processed
         */
        processStatSummary(pubChannel, saveChannelKey, jobData, done);
    }, 2000);
}

function processConnNetStatsSummary (pubChannel, saveChannelKey, jobData, done)
{
    processStatSummary(pubChannel, saveChannelKey, jobData, done,
                       global.GET_STAT_SUMMARY_BY_CONN_NWS);
}

function processTopPeerDetailsByDomainAndPort (pubChannel, saveChannelKey, 
                                               jobData, done, fqName, sport)
{
    var appData = jobData.taskData.appData;
    var srcVNObjArr = [];
    var destVNObjArr = [];
    var limit = appData.limit;
    var limit = (appData['limit']) ? parseInt(appData['limit']) : (-1);

    var srcWhereClause = [
        {'sport':sport}
    ];
    var destWhereClause = [
        {'dport':sport}
    ];

    var srcSelectArr = ['sum(bytes)', 'sum(packets)', 'sourcevn', 'sourceip'];
    var destSelectArr = ['sum(bytes)', 'sum(packets)', 'destvn', 'destip'];

    getNetworkListsByDomain(fqName, jobData, function (err, networkLists) {
        var nwLists = getNwListByNwArray(networkLists);
        var timeObj = createTimeQueryJsonObj(appData.minsSince);
        srcVNObjArr = createVNListObjArr(nwLists, true);
        destVNObjArr = createVNListObjArr(nwLists, false);
        srcWhereClause = formatAndClauseGroup(srcWhereClause, srcVNObjArr);
        destWhereClause = formatAndClauseGroup(destWhereClause, destVNObjArr);

        var srcQueryJSON =
            formatQueryStringWithWhereClause('FlowSeriesTable',
                srcWhereClause, srcSelectArr,
                timeObj, null,
                global.TRAFFIC_STAT_TOP_COUNT);
        var destQueryJSON =
            formatQueryStringWithWhereClause('FlowSeriesTable', destWhereClause,
                destSelectArr, timeObj, null,
                global.TRAFFIC_STAT_TOP_COUNT);
        nwMonUtils.getStatDataByQueryJSON(srcQueryJSON, destQueryJSON, function (err, data) {
            var resultJSON = [];
            parseNetStatDataByDomainOrProject(resultJSON, data, srcSelectArr, destSelectArr);
            resultJSON = getTopNCountEntry(resultJSON, limit, null);
            redisPub.publishDataToRedis(pubChannel, saveChannelKey,
                global.HTTP_STATUS_RESP_OK,
                JSON.stringify(resultJSON),
                JSON.stringify(resultJSON),
                0, 0, done);
        });
    });
}

function processTopPeerDetailsByProjectAndPort (pubChannel, saveChannelKey, 
                                                jobData, done, fqName, sport)
{
    var appData = jobData.taskData.appData;
    var resultJSON = [];
    var limit = appData['limit'];
    var limit = (appData['limit']) ? parseInt(appData['limit']) : (-1);

    var srcWhereClause = [
        {'sport':sport}
    ];
    var destWhereClause = [
        {'dport':sport}
    ];

    var srcSelectArr = ['sum(bytes)', 'sum(packets)', 'sourcevn', 'sourceip'];
    var destSelectArr = ['sum(bytes)', 'sum(packets)', 'destvn', 'destip'];

    getNetworkListsByProject({project:fqName, jobData:jobData},
        function (err, nwLists) {
            srcVNObjArr = createVNListObjArr(nwLists, true);
            destVNObjArr = createVNListObjArr(nwLists, false);

            srcWhereClause = formatAndClauseGroup(srcWhereClause, srcVNObjArr);
            destWhereClause = formatAndClauseGroup(destWhereClause, destVNObjArr);

            var timeObj = createTimeQueryJsonObj(appData.minsSince);
            var srcQueryJSON =
                formatQueryStringWithWhereClause('FlowSeriesTable', srcWhereClause,
                    srcSelectArr, timeObj, null,
                    global.TRAFFIC_STAT_TOP_COUNT);
            var destQueryJSON =
                formatQueryStringWithWhereClause('FlowSeriesTable', destWhereClause,
                    destSelectArr, timeObj, null,
                    global.TRAFFIC_STAT_TOP_COUNT);

            nwMonUtils.getStatDataByQueryJSON(srcQueryJSON, destQueryJSON, function (err, data) {
                parseNetStatDataByDomainOrProject(resultJSON, data, srcSelectArr, destSelectArr);
                resultJSON = getTopNCountEntry(resultJSON, limit, null);
                redisPub.publishDataToRedis(pubChannel, saveChannelKey,
                    global.HTTP_STATUS_RESP_OK,
                    JSON.stringify(resultJSON),
                    JSON.stringify(resultJSON),
                    0, 0, done);
            });
        });
}

function processTopPeerDetailsByNetworkAndPort (pubChannel, saveChannelKey, 
                                                jobData, done, fqName, sport)
{
    var appData = jobData.taskData.appData;

    var limit = (appData['limit']) ? parseInt(appData['limit']) : (-1);
    var srcVNObjArr = [];
    var destVNObjArr = [];
    var srcSelectArr = ['sum(bytes)', 'sum(packets)', 'sourcevn', 'sourceip'];
    var destSelectArr = ['sum(bytes)', 'sum(packets)', 'destvn', 'destip'];
    var vnName = appData['fqName'];
    var resultJSON = [];
    var srcWhereClause = [
        {'sport':sport}
    ];
    var destWhereClause = [
        {'dport':sport}
    ];
    var srcVNObjArr = [
        {'sourcevn':fqName}
    ];
    var destVNObjArr = [
        {'destvn':fqName}
    ];
    var timeObj = createTimeQueryJsonObj(appData.minsSince);
    srcWhereClause = formatAndClauseGroup(srcWhereClause, srcVNObjArr);
    var srcQueryJSON =
        formatQueryStringWithWhereClause('FlowSeriesTable', srcWhereClause,
            srcSelectArr, timeObj, null,
            global.TRAFFIC_STAT_TOP_COUNT);
    destWhereClause = formatAndClauseGroup(destWhereClause, destVNObjArr);
    var destQueryJSON =
        formatQueryStringWithWhereClause('FlowSeriesTable', destWhereClause,
            destSelectArr, timeObj, null,
            global.TRAFFIC_STAT_TOP_COUNT);

    nwMonUtils.getStatDataByQueryJSON(srcQueryJSON, destQueryJSON, function (err, data) {
        parseNetStatDataByDomainOrProject(resultJSON, data, srcSelectArr, destSelectArr);
        resultJSON = getTopNCountEntry(resultJSON, limit, null);
        redisPub.publishDataToRedis(pubChannel, saveChannelKey,
            global.HTTP_STATUS_RESP_OK,
            JSON.stringify(resultJSON),
            JSON.stringify(resultJSON),
            0, 0, done);
    });
}

function processTopPeerDetailsByVNsAndPort (pubChannel, saveChannelKey, jobData,
                                            done, srcVN, destVN, port)
{
    var appData = jobData.taskData.appData;

    var limit = (appData['limit']) ? parseInt(appData['limit']) : (-1);
    var srcVNObjArr = [];
    var destVNObjArr = [];
    var srcSelectArr = ['sum(bytes)', 'sum(packets)', 'sourcevn', 'sourceip'];
    var destSelectArr = ['sum(bytes)', 'sum(packets)', 'destvn', 'destip'];
    var vnName = appData['fqName'];
    var resultJSON = [];
    var srcVNObjArr = [
        {'sourcevn':srcVN},
        {'destvn':destVN}
    ];
    var destVNObjArr = [
        {'sourcevn':destVN},
        {'destvn':srcVN}
    ];
    var srcWhereClause = [
        {'sport':port}
    ];
    var destWhereClause = [
        {'dport':port}
    ];
    var timeObj = createTimeQueryJsonObj(appData.minsSince);

    srcWhereClause = formatAndClauseGroup(srcWhereClause, srcVNObjArr);
    destWhereClause = formatAndClauseGroup(destWhereClause, destVNObjArr);

    var srcQueryJSON =
        formatQueryStringWithWhereClause('FlowSeriesTable', srcWhereClause,
            srcSelectArr, timeObj, null,
            global.TRAFFIC_STAT_TOP_COUNT);
    var destQueryJSON =
        formatQueryStringWithWhereClause('FlowSeriesTable', destWhereClause,
            destSelectArr, timeObj, null,
            global.TRAFFIC_STAT_TOP_COUNT);
    nwMonUtils.getStatDataByQueryJSON(srcQueryJSON, destQueryJSON, function (err, data) {
        parseNetStatDataByDomainOrProject(resultJSON, data, srcSelectArr, destSelectArr);
        resultJSON = getTopNCountEntry(resultJSON, limit, null);
        redisPub.publishDataToRedis(pubChannel, saveChannelKey,
            global.HTTP_STATUS_RESP_OK,
            JSON.stringify(resultJSON),
            JSON.stringify(resultJSON),
            0, 0, done);
    });
}

function processTopPeerDetails (pubChannel, saveChannelKey, jobData, done)
{
    var appData = jobData.taskData.appData;
    var reqType = appData.reqType;
    var fqName = appData.fqName;
    var fqNameArr = [];
    var fqNameArrLen = 0;
    var srcVN = appData.srcVN;
    var destVN = appData.destVN;

    if (srcVN && destVN) {
        processTopPeerDetailsByVNsAndPort(pubChannel, saveChannelKey,
            jobData, done, srcVN, destVN,
            appData.port);
        return;
    }

    /* From the fqName, check if the request is for domain/project/network
     * */
    fqNameArr = fqName.split(':');
    fqNameArrLen = fqNameArr.length;

    if (fqNameArrLen == 1) {
        /* Domain Context */
        processTopPeerDetailsByDomainAndPort(pubChannel, saveChannelKey,
            jobData, done, fqName,
            appData.port);
    } else if (fqNameArrLen == 2) {
        /* Project */
        processTopPeerDetailsByProjectAndPort(pubChannel, saveChannelKey, jobData,
            done, fqName,
            appData.port);
    } else if (fqNameArrLen == 3) {
        /* Network */
        processTopPeerDetailsByNetworkAndPort(pubChannel, saveChannelKey, jobData,
            done, fqName, appData.sourcevn,
            appData.port);
    }
}

function processPortLevelFlowSeriesByDomain (pubChannel, saveChannelKey,
                                             jobData, done)
{
    var appData = jobData.taskData.appData;
    var domain = appData['fqName'];
    var srcVNObjArr = [];
    var destVNObjArr = [];
    var srcWhereClause = [
        {'sport':appData.port},
        {'protocol':appData.protocol}
    ];
    var destWhereClause = [
        {'dport':appData.port},
        {'protocol':appData.protocol}
    ];
    var minsSince = appData['minsSince'];
    var timeObj;
    var timeGran;
    if (minsSince != null) {
        timeObj = createTimeQueryJsonObj(appData['minsSince']);
        timeGran = nwMonUtils.getTimeGranByTimeSlice(timeObj,
            appData['sampleCnt']);
    } else {
        timeObj =
            nwMonUtils.createTimeQueryObjByStartEndTime(appData['startTime'],
                appData['endTime']);
        timeGran = appData['timeGran'];
    }
    var strTimeGran = 'T=' + timeGran;
    var srcSelectArr = ['sum(bytes)', 'sum(packets)', strTimeGran];
    var destSelectArr = ['sum(bytes)', 'sum(packets)', strTimeGran];
    var srcWhereClause = [
        {'sport':appData.port},
        {'protocol':appData.protocol}
    ];
    var destWhereClause = [
        {'dport':appData.port},
        {'protocol':appData.protocol}
    ];

    getNetworkListsByDomain(domain, jobData, function (err, networkLists) {
        var nwLists = getNwListByNwArray(networkLists);
        srcVNObjArr = createVNListObjArr(nwLists, true);
        destVNObjArr = createVNListObjArr(nwLists, false);
        srcWhereClause = formatAndClauseGroup(srcWhereClause, srcVNObjArr);
        destWhereClause = formatAndClauseGroup(destWhereClause, destVNObjArr);
        var srcQueryJSON =
            formatQueryStringWithWhereClause('FlowSeriesTable',
                srcWhereClause, srcSelectArr,
                timeObj, true, null);
        var destQueryJSON =
            formatQueryStringWithWhereClause('FlowSeriesTable', destWhereClause,
                destSelectArr, timeObj, true, null);
        formatFlowSeriesQuery(srcQueryJSON);
        formatFlowSeriesQuery(destQueryJSON);
        flowCache.getFlowSeriesData('port', appData, srcQueryJSON,
            destQueryJSON, function (err, data) {
                if (data != null) {
                    resultJSON = data;
                } else {
                    resultJSON = {};
                }
                redisPub.publishDataToRedis(pubChannel, saveChannelKey,
                    global.HTTP_STATUS_RESP_OK,
                    JSON.stringify(resultJSON),
                    JSON.stringify(resultJSON),
                    0, 0, done);
            });
    });
}

function processPortLevelFlowSeriesByProject (pubChannel, saveChannelKey,
                                              jobData, done)
{
    var appData = jobData.taskData.appData;
    var project = appData['fqName'];
    var srcVNObjArr = [];
    var destVNObjArr = [];
    var srcWhereClause = [
        {'sport':appData.port},
        {'protocol':appData.protocol}
    ];
    var destWhereClause = [
        {'dport':appData.port},
        {'protocol':appData.protocol}
    ];
    var minsSince = appData['minsSince'];
    var timeObj;
    var timeGran;
    if (minsSince != null) {
        timeObj = createTimeQueryJsonObj(appData['minsSince']);
        timeGran = nwMonUtils.getTimeGranByTimeSlice(timeObj,
            appData['sampleCnt']);
    } else {
        timeObj =
            nwMonUtils.createTimeQueryObjByStartEndTime(appData['startTime'],
                appData['endTime']);
        timeGran = appData['timeGran'];
    }
    var strTimeGran = 'T=' + timeGran;
    var srcSelectArr = ['sum(bytes)', 'sum(packets)', strTimeGran];//, 'sourcevn'];
    var destSelectArr = ['sum(bytes)', 'sum(packets)', strTimeGran];//, 'destvn'];
    var srcWhereClause = [
        {'sport':appData.port},
        {'protocol':appData.protocol}
    ];
    var destWhereClause = [
        {'dport':appData.port},
        {'protocol':appData.protocol}
    ];

    getNetworkListsByProject({project:project, jobData:jobData},
        function (err, networkLists) {
            var nwLists = getNwListByNwArray(networkLists);
            srcVNObjArr = createVNListObjArr(nwLists, true);
            destVNObjArr = createVNListObjArr(nwLists, false);
            srcWhereClause = formatAndClauseGroup(srcWhereClause, srcVNObjArr);
            destWhereClause = formatAndClauseGroup(destWhereClause, destVNObjArr);
            var srcQueryJSON =
                formatQueryStringWithWhereClause('FlowSeriesTable',
                    srcWhereClause, srcSelectArr,
                    timeObj, true, null);
            var destQueryJSON =
                formatQueryStringWithWhereClause('FlowSeriesTable', destWhereClause,
                    destSelectArr, timeObj, true, null);
            formatFlowSeriesQuery(srcQueryJSON);
            formatFlowSeriesQuery(destQueryJSON);
            flowCache.getFlowSeriesData('port', appData, srcQueryJSON,
                destQueryJSON, function (err, data) {
                    if (data != null) {
                        resultJSON = data;
                    } else {
                        resultJSON = {};
                    }
                    redisPub.publishDataToRedis(pubChannel, saveChannelKey,
                        global.HTTP_STATUS_RESP_OK,
                        JSON.stringify(resultJSON),
                        JSON.stringify(resultJSON),
                        0, 0, done);
                });
        });
}

function processPortLevelFlowSeriesByNetwork (pubChannel, saveChannelKey, 
                                              jobData, done)
{
    var appData = jobData.taskData.appData;
    var fqName = appData['fqName'];
    var srcVNObjArr = [];
    var destVNObjArr = [];
    var srcWhereClause = [
        {'sport':appData.port},
        {'protocol':appData.protocol}
    ];
    var destWhereClause = [
        {'dport':appData.port},
        {'protocol':appData.protocol}
    ];
    var minsSince = appData['minsSince'];
    var timeObj;
    var timeGran;
    if (minsSince != null) {
        timeObj = createTimeQueryJsonObj(appData['minsSince']);
        timeGran = nwMonUtils.getTimeGranByTimeSlice(timeObj,
            appData['sampleCnt']);
    } else {
        timeObj =
            nwMonUtils.createTimeQueryObjByStartEndTime(appData['startTime'],
                appData['endTime']);
        timeGran = appData['timeGran'];
    }
    var strTimeGran = 'T=' + timeGran;
    var srcSelectArr = ['sum(bytes)', 'sum(packets)', strTimeGran];//, 'sourcevn'];
    var destSelectArr = ['sum(bytes)', 'sum(packets)', strTimeGran];//, 'destvn'];
    var srcWhereClause = [
        {'sport':appData.port},
        {'protocol':appData.protocol}
    ];
    var destWhereClause = [
        {'dport':appData.port},
        {'protocol':appData.protocol}
    ];

    srcWhereClause = formatAndClauseGroup(srcWhereClause, [
        {'sourcevn':fqName}
    ]);
    destWhereClause = formatAndClauseGroup(destWhereClause, [
        {'destvn':fqName}
    ]);
    if ((appData.srcVN != null) && (appData.destVN != null)) {
        srcWhereClause = formatAndClauseGroup([
            {'sourcevn':appData.srcVN}
        ], [
            {'destvn':appData.destVN}
        ]);
        destWhereClause = formatAndClauseGroup([
            {'sourcevn':appData.destVN}
        ], [
            {'destvn':appData.srcVN}
        ]);
    }
    var srcQueryJSON =
        formatQueryStringWithWhereClause('FlowSeriesTable',
            srcWhereClause, srcSelectArr,
            timeObj, true, null);
    var destQueryJSON =
        formatQueryStringWithWhereClause('FlowSeriesTable', destWhereClause,
            destSelectArr, timeObj, true, null);
    formatFlowSeriesQuery(srcQueryJSON);
    formatFlowSeriesQuery(destQueryJSON);
    flowCache.getFlowSeriesData('port', appData, srcQueryJSON, destQueryJSON,
        function (err, data) {
            if (data != null) {
                resultJSON = data;
            } else {
                resultJSON = {};
            }
            redisPub.publishDataToRedis(pubChannel, saveChannelKey,
                global.HTTP_STATUS_RESP_OK,
                JSON.stringify(resultJSON),
                JSON.stringify(resultJSON),
                0, 0, done);
        });
}

function getPortLevelFlowSeries (pubChannel, saveChannelKey, jobData, done)
{
    var appData = jobData.taskData.appData;
    var fqName = appData.fqName;
    var fqNameArr = [];

    if (appData.srcVN && appData.destVN) {
        processPortLevelFlowSeriesByNetwork(pubChannel, saveChannelKey, jobData,
            done);
        return;
    }

    fqNameArr = fqName.split(':');
    fqNameArrLen = fqNameArr.length;

    if (fqNameArrLen == 1) {
        /* Domain Context */
        processPortLevelFlowSeriesByDomain(pubChannel, saveChannelKey, jobData,
            done);
    } else if (fqNameArrLen == 2) {
        /* Project */
        processPortLevelFlowSeriesByProject(pubChannel, saveChannelKey, jobData,
            done);
    } else if (fqNameArrLen == 3) {
        /* Network */
        processPortLevelFlowSeriesByNetwork(pubChannel, saveChannelKey, jobData,
            done);
    }
}

function parseCPULoadXMLToJSON (cpuLoadXmlData)
{
    var cpuData = {};
    var memData = {};
    memData['memInfo'] = {};
    memData['sysMemInfo'] = {};
    var sysMemInfo = {};
    try {
        var cpuLoadInfo = jsonPath(cpuLoadXmlData, "$..CpuLoadInfo");
        /* Per index only one entry, so safely use 0th indexed data */
        try {
            cpuData['cpu_share'] = cpuLoadInfo[0][0]['cpu_share'][0]['_'];
        } catch (e) {
            cpuData['cpu_share'] = global.RESP_DATA_NOT_AVAILABLE;
        }
        try {
            cpuData['cpuLoadAvg'] = {};
            var cpuLoadAvg = jsonPath(cpuLoadXmlData, "$..CpuLoadAvg");
            if (cpuLoadAvg.length > 0) {
                commonUtils.createJSONBySandeshResponse(cpuData['cpuLoadAvg'],
                    cpuLoadAvg[0][0]);
            }
        } catch (e) {
            /* For control node, we do not have this data */
        }

        /* Per index only one entry, so safely use 0th indexed data */
        var peakvirt = jsonPath(cpuLoadXmlData, "$..peakvirt");
        var res = jsonPath(cpuLoadXmlData, "$..res");
        var virt = jsonPath(cpuLoadXmlData, "$..virt");
        try {
            memData['memInfo']['peakvirt'] = peakvirt[0][0]['_'];
            memData['memInfo']['res'] = res[0][0]['_'];
            memData['memInfo']['virt'] = virt[0][0]['_'];
        } catch (e) {
        }
        var sysMem = jsonPath(cpuLoadXmlData, "$..SysMemInfo");
        try {
            commonUtils.createJSONBySandeshResponse(memData['sysMemInfo'],
                sysMem[0][0]);
        } catch (e) {
            logutils.logger.debug("In parseCPULoadXMLToJSON: memInfo JSON " +
                "Parse error:" + e);
        }
    } catch (e) {
        logutils.logger.debug("In parseCPULoadXMLToJSON(): JSON Parse error:" + e);
    }
    return {'cpuData':cpuData, 'memData':memData};
}

function parseCPULoadXMLData (cpuLoadXmlMsg, callback)
{
    parseString(cpuLoadXmlMsg, function (err, result) {
        result = parseCPULoadXMLToJSON(result);
        callback(err, result);
    });
}

function formatCPULoadXMLData (resultJSON, callback)
{
    var cpuLoad = {};
    var results = [];
    var cnt = 0;
    try {
        resultJSON = resultJSON['value'];
        cnt = resultJSON.length;
        for (var i = 0; i < cnt; i++) {
            results[i] = resultJSON[i]['ObjectLog'];
        }
        async.map(results, parseCPULoadXMLData, function (err, data) {
            for (i = 0; i < cnt; i++) {
                resultJSON[i]['cpuData'] = {};
                resultJSON[i]['memData'] = {};
                if (resultJSON[i]['ObjectLog']) {
                    delete resultJSON[i]['ObjectLog'];
                }
                try {
                    resultJSON[i]['cpuData'] = data[i]['cpuData'];
                    resultJSON[i]['memData'] = data[i]['memData'];
                } catch (e) {
                    logutils.logger.debug("IN formatCPULoadXMLData: JSON Parse error:" +
                        e);
                }
            }
            callback(err, resultJSON);
        });
    } catch (e) {
        logutils.logger.debug("In formatCPULoadXMLData(): JSON Parse error: " + e);
        callback(null, '');
    }
}

function getCollectorCPUUve(uveData)
{
    var data = jsonPath(uveData, "$..module_cpu_info");
    if (data.length == 0) {
        return null;
    }
    data = data[0];
    var cnt = data.length;
    for (var i = 0; i < cnt; i++) {
        if (data[i]['module_id'] == 'Collector') {
            break;
        }
    }
    assert(i != cnt);
    return data[i];
}

function getNodeCPUUveByModuleId(uveData, moduleId)
{
    var data = jsonPath(uveData, "$..module_cpu_info");
    if (data.length == 0) {
        return null;
    }
    data = data[0];

    var cnt = data.length;
    for (var i = 0; i < cnt; i++) {
        if (data[i]['module_id'] == moduleId) {
            return data[i];
        }
    }
    return null;
}

function getCurrentMemCpuLoad(resultJSON, uveData, moduleId)
{

    var data;
    resultJSON['cpuData'] = {};
    resultJSON['memData'] = {};
    resultJSON['memData']['memInfo'] = {};
    resultJSON['memData']['sysMemInfo'] = {};

    try {
        switch (moduleId) {
            case 'ControlNode':
                data = uveData['BgpRouterState'];
                break;
            case 'vRouterAgent':
                data = uveData['VrouterStatsAgent'];
                break;
            case 'ApiServer':
            case 'Schema':
            case 'ServiceMonitor':
            case 'Collector':
            case 'OpServer':
            case 'QueryEngine':
                data = getNodeCPUUveByModuleId(uveData, moduleId);
                break;
            default:
                logutils.logger.debug("In getCurrentMemCpuLoad():" +
                    "Unknown module Id: " + moduleId);
                break;
        }

        data = data['cpu_info'];
        resultJSON['cpuData']['cpu_share'] = data['cpu_share'];
        resultJSON['cpuData']['cpuLoadAvg'] = {};
        if (null != data['cpuload']) {
            resultJSON['cpuData']['cpuLoadAvg'] = data['cpuload'];
        }

        resultJSON['memData']['memInfo'] = {};
        if (null != data['meminfo']) {
            resultJSON['memData']['memInfo'] = data['meminfo'];
        }
        resultJSON['num_cpu'] = parseInt(data['num_cpu']);
        resultJSON['memData']['sysMemInfo'] = {};
        resultJSON['memData']['sysMemInfo'] = data['sys_mem_info'];
    } catch (e) {
        logutils.logger.debug('In getCurrentMemCpuLoad(): JSON Parse error' +
            e);
    }
}

function formatFlowSeriesForCPUMemory(cpuMemFlowSeriesData, timeObj, timeGran, num_cpu)
{
    var len = 0;
    var resultJSON = {};
    resultJSON['summary'] = {};
    resultJSON['summary']['start_time'] = timeObj['start_time'];
    resultJSON['summary']['end_time'] = timeObj['end_time'];
    resultJSON['summary']['timeGran_microsecs'] =
        Math.floor(timeGran) * global.MILLISEC_IN_SEC * global.MICROSECS_IN_MILL;

    resultJSON['summary']['numCpu'] = num_cpu;
    resultJSON['summary']['loadInfo'] = {};
    try {
        len = cpuMemFlowSeriesData.length;
        resultJSON['summary']['loadInfo']['cpuData'] =
            cpuMemFlowSeriesData[len - 1]['cpuData'];
        resultJSON['summary']['loadInfo']['memData'] =
            cpuMemFlowSeriesData[len - 1]['memData'];
    } catch (e) {
    }
    resultJSON['flow-series'] = cpuMemFlowSeriesData;
    return resultJSON;
}

function getCurrentCpuMemDataJson(timeObj, moduleId, cpuMemData, timeGran)
{
    var resultJSON = [];
    try {
        var cpuData = cpuMemData['cpuData'];
        var memData = cpuMemData['memData'];
        if ((null == cpuData) || (cpuData['cpu_share'] == null) ||
            (null == memData) || (memData['memInfo']['virt'] == null)) {
            return resultJSON;
        }
        resultJSON[0] = {};
        resultJSON[0]['MessageTS'] = timeObj['start_time'] +
            Math.floor(timeGran) * global.MILLISEC_IN_SEC *
                global.MICROSECS_IN_MILL;
        resultJSON[0]['cpuData'] = cpuMemData['cpuData'];
        resultJSON[0]['memData'] = cpuMemData['memData'];
        return resultJSON;
    } catch (e) {
        logutils.logger.debug("In getCurrentCpuMemDataJson(): JSON Parse error:"
            + e);
    }
}

function getCpuMemoryFlowSeriesByUVE(appData, callback)
{
    var source = appData.source;
    var moduleId = appData.moduleId;

    if (moduleId == 'ControlNode') {
        url = '/analytics/bgp-router/' + source + '?flat';
    } else if (moduleId == 'vRouterAgent') {
        url = '/analytics/vrouter/' + source + '?flat';
    } else if ((moduleId == 'ApiServer') ||
        (moduleId == 'Schema') ||
        (moduleId == 'ServiceMonitor')) {
        url = '/analytics/config-node/' + source + '?flat';
    } else if ((moduleId == 'Collector') ||
        (moduleId == 'OpServer') ||
        (moduleId == 'QueryEngine')) {
        url = '/analytics/collector/' + source + '?flat';
    } else {
        /* Not supported module */
        assert(0);
    }
    opServer.api.get(url, function (err, data) {
        if (err || (null == data)) {
            callback(null);
            return;
        }
        var resultJSON = {};
        getCurrentMemCpuLoad(resultJSON, data, moduleId);
        callback(resultJSON);
        return;
    });
}

function processCPULoadFlowSeries (pubChannel, saveChannelKey, jobData, done)
{
    var appData = jobData.taskData.appData;

    var source = appData.source;
    var moduleId = appData.moduleId;
    var tableName, whereClause;

    whereClause = [
        {'ObjectId':source},
        {'ModuleId':moduleId}
    ];
    if (moduleId) {
        /* ModuleId : ControlNode/VRouterAgent */
        switch (moduleId) {
            case 'ControlNode':
                tableName = 'ObjectBgpRouter';
                whereClause = [
                    {'ObjectId':source}
                ];
                break;
            case 'vRouterAgent':
                tableName = 'ObjectVRouter';
                whereClause = [
                    {'ObjectId':source},
                    {"Messagetype":'VrouterStats'}
                ];
                break;
            case 'ApiServer':
            case 'Schema':
            case 'ServiceMonitor':
                tableName = 'ObjectConfigNode';
                break;
            case 'OpServer':
            case 'Collector':
            case 'QueryEngine':
                tableName = 'ObjectCollectorInfo';
                whereClause.push({'Messagetype':'ModuleCpuStateTrace'});
                break;
            default:
                logutils.logger.debug("In processCPULoadFlowSeries():" +
                    "Unknown module id: " + moduleId);
        }
    } else {
        /* ModuleId is MUST */
        redisPub.publishDataToRedis(pubChannel, saveChannelKey,
            global.HTTP_STATUS_INTERNAL_ERROR,
            global.STR_CACHE_RETRIEVE_ERROR,
            global.STR_CACHE_RETRIEVE_ERROR, 0,
            0, done);
        return;
    }

    whereClause = formatAndClause(whereClause);
    var timeObj = createTimeQueryJsonObj(appData.minsSince, appData.endTime);
    var timeGran = nwMonUtils.getTimeGranByTimeSlice(timeObj, appData.sampleCnt);
    var strTimeGran = 'T=' + timeGran;
    var selectArr = ["MessageTS", "ObjectLog"];
    var queryJSON =
        formatQueryStringWithWhereClause(tableName,
            whereClause,
            selectArr, timeObj, null,
            null);
    delete queryJSON['filter'];
    delete queryJSON['dir'];
    queryJSON['sort_fields'] = ['MessageTS'];
    queryJSON['sort'] = global.QUERY_STRING_SORT_ASC;
    var selectEleCnt = queryJSON['select_fields'].length;
    queryJSON['select_fields'].splice(selectEleCnt - 1, 1);
    executeQueryString(queryJSON, 
                       commonUtils.doEnsureExecution(function(err, resultJSON) {
        formatCPULoadXMLData(resultJSON, function (err, results) {
            /* Check if there is any data, if no data, then there is no change
             * in cpu/memory utilization, so we did not get the data, so now
             * send a query to opserver to get latest data and from that 
             * build the result json
             */
            getCpuMemoryFlowSeriesByUVE(appData, function (resultJSON) {
                if (resultJSON == null) {
                    redisPub.publishDataToRedis(pubChannel, saveChannelKey,
                        global.HTTP_STATUS_INTERNAL_ERROR,
                        global.STR_CACHE_RETRIEVE_ERROR,
                        global.STR_CACHE_RETRIEVE_ERROR,
                        0, 0, done);
                    return;
                }
                if ((results == null) || (results.length == 0)) {
                    var curCpuMemData =
                        getCurrentCpuMemDataJson(timeObj, moduleId,
                            resultJSON, timeGran);
                    results =
                        formatFlowSeriesForCPUMemory(curCpuMemData, timeObj,
                            timeGran, resultJSON['num_cpu']);
                    redisPub.publishDataToRedis(pubChannel, saveChannelKey,
                        global.HTTP_STATUS_RESP_OK,
                        JSON.stringify(results),
                        JSON.stringify(results),
                        0, 0, done);
                    return;
                }
                results = formatFlowSeriesForCPUMemory(results, timeObj, timeGran,
                    resultJSON['num_cpu']);
                redisPub.publishDataToRedis(pubChannel, saveChannelKey,
                    global.HTTP_STATUS_RESP_OK,
                    JSON.stringify(results),
                    JSON.stringify(results),
                    0, 0, done);
            });
        });
    }, global.DEFAULT_MIDDLEWARE_API_TIMEOUT));
}

function getStartEndPort (portRange)
{
    if (null == portRange) {
        return null;
    }
    var pos = portRange.indexOf('-');
    startPort = portRange.substr(0, pos);
    endPort = portRange.slice(pos + 1);
    return {startPort:startPort, endPort:endPort};
}

function getWhereClauseByPortRange (portRange, protocol, fqName, timeObj, isSrc)
{
    var startPort = null;
    var endPort = null;
    var whereClause = [];
    var protos = [1, 6, 17]; /* ICMP, TCP & UDP */

    if (null != protocol) {
        protos = [protocol];
    }
    var portObj = getStartEndPort(portRange); 
    if (null != portObj) {
        startPort = portObj.startPort;
        endPort = portObj.endPort;
    }
        
    if (true == isSrc) {
        var whereClause = 
            formatQueryWithPortRange(startPort, endPort, protos,
                                     fqName, true);
    } else {
        var whereClause = 
            formatQueryWithPortRange(startPort, endPort, protos,
                                     fqName, false);
    }
    return whereClause;
}

function getTrafficStatsByPort (pubChannel, saveChannelKey, jobData, done)
{
    var appData = jobData.taskData.appData;

    var limit = (appData['limit']) ? parseInt(appData['limit']) : (-1);
    var srcSelectArr = ['sum(bytes)', 'sum(packets)', 'sport', 'protocol'];
    var destSelectArr = ['sum(bytes)', 'sum(packets)', 'dport', 'protocol'];
    var dataObjArr = [];
    var resultJSON = {};

    var timeObj = createTimeQueryJsonObjByAppData(appData);

    var srcWhereClause = getWhereClauseByPortRange(appData['portRange'],
                                                   appData['protocol'],
                                                   appData['fqName'], timeObj,
                                                   true);
    var destWhereClause = getWhereClauseByPortRange(appData['portRange'],
                                                    appData['protocol'],
                                                    appData['fqName'], timeObj,
                                                    false);

    srcQueryJSON = 
        formatQueryStringWithWhereClause('FlowSeriesTable', srcWhereClause,
                                         srcSelectArr, timeObj, null, null);
    destQueryJSON =
        formatQueryStringWithWhereClause('FlowSeriesTable', destWhereClause,
                                         destSelectArr, timeObj, null, null);

    commonUtils.createReqObj(dataObjArr, global.RUN_QUERY_URL,
                             global.HTTP_REQUEST_POST,
                             commonUtils.cloneObj(srcQueryJSON));
    commonUtils.createReqObj(dataObjArr, global.RUN_QUERY_URL,
                             global.HTTP_REQUEST_POST,
                             commonUtils.cloneObj(destQueryJSON));
    logutils.logger.debug(messages.qe.qe_execution + 'Port Distribution:' +
                          appData['fqName'] +
                          ' with Query' +
                          JSON.stringify(dataObjArr[0]['data']),
                          JSON.stringify(dataObjArr[1]['data']));
    async.map(dataObjArr, commonUtils.getServerRespByRestApi(opServer, true),
              commonUtils.doEnsureExecution(function(err, data) {
        var resultJSON = {};
        parseNetStatDataProjectOrNetwork(resultJSON, data, srcSelectArr,
                                         destSelectArr);
        redisPub.publishDataToRedis(pubChannel, saveChannelKey,
                        global.HTTP_STATUS_RESP_OK,
                        JSON.stringify(resultJSON),
                        JSON.stringify(resultJSON),
                        0, 0, done);
        }, global.DEFAULT_MIDDLEWARE_API_TIMEOUT));
}

exports.getTrafficStatsByPort = getTrafficStatsByPort;
exports.processTopNwDetailsByDomain = processTopNwDetailsByDomain;
exports.processTopProjectDetailsByDomain = processTopProjectDetailsByDomain;
exports.processTopPortByDomain = processTopPortByDomain;
exports.processTopPortByProject = processTopPortByProject;
exports.parseFlowData = parseFlowData;
exports.processTopFlowsByProject = processTopFlowsByProject;
exports.processTopFlowsByDomain = processTopFlowsByDomain;
exports.processVNFlowSeriesData = processVNFlowSeriesData;
exports.processVNsFlowSeriesData = processVNsFlowSeriesData;
exports.processTopNwDetailsByProject = processTopNwDetailsByProject;
exports.processTopPeerByDomain = processTopPeerByDomain;
exports.processTopPeerByProject = processTopPeerByProject;
exports.processTopPortByNetwork = processTopPortByNetwork;
exports.processTopPeerByNetwork = processTopPeerByNetwork;
exports.processTopFlowsByNetwork = processTopFlowsByNetwork;
exports.processTopPeerByVM = processTopPeerByVM;
exports.processTopPortByVM = processTopPortByVM;
exports.processTopFlowsByVM = processTopFlowsByVM;
exports.getPortLevelFlowSeries = getPortLevelFlowSeries;
exports.processCPULoadFlowSeries = processCPULoadFlowSeries;
exports.processConnNetStatsSummary = processConnNetStatsSummary;
exports.processVMStatSummary = processVMStatSummary;
exports.processVMFlowSeriesData = processVMFlowSeriesData;
exports.processTopPeerDetails = processTopPeerDetails;


/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
var logutils = require('../utils/log.utils');
var commonUtils = require('../utils/common.utils');
var global = require('./global');

function formatAndClause (objArr)
{
    var result = [];
    var len = objArr.length;
    result[0] = [];
    for (var i = 0; i < len; i++) {
        for (key in objArr[i]) {
            result[0].push({'suffix': null, 'value2': null, 'name':key, 
                           'op':7, 'value':objArr[i][key]});
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
    var queryJSON = qeAPI.getQueryJSON4Table(table),
        selectLen = selectFieldObjArr.length;
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

function createTimeQueryJsonObj (minsSince, endTime)
{
    var startTime = 0, timeObj = {};

    if ((null != minsSince) && ((null == endTime) || ('' == endTime))) {
        timeObj['start_time'] = 'now-' + minsSince +'m';
        timeObj['end_time'] = 'now';
        return timeObj;
    }
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
        startTime = 
            commonUtils.getUTCTime(commonUtils.adjustDate(new Date(endTime), 
                                                          {'min':-minsSince}).getTime());
    }


    timeObj['start_time'] = startTime * 1000;
    timeObj['end_time'] = endTime * 1000;
    return timeObj;
}

function createTimeQueryJsonObjByServerTimeFlag (minsSince, serverTimeFlag)
{
    var timeObj = {};
    if ((null == serverTimeFlag) || (false == serverTimeFlag) ||
        ('false' == serverTimeFlag)) {
        timeObj['start_time'] = 'now-' + minsSince +'m';
        timeObj['end_time'] = 'now';
        return timeObj;
    }

    var endTime = commonUtils.getUTCTime(new Date().getTime());
    var startTime =
        commonUtils.getUTCTime(commonUtils.adjustDate(new
                                                      Date(endTime),
                                                      {'min':-minsSince}).getTime());
    timeObj['start_time'] = startTime * 1000;
    timeObj['end_time'] = endTime * 1000;
    return timeObj;
}

function createTimeQueryJsonObjByAppData (appData)
{
    var timeObj = {};

    if (appData['startTime']) {
        if (true == isNaN(appData['startTime'])) {
            timeObj['start_time'] = appData['startTime'];
        } else {
            timeObj['start_time'] = parseInt(appData['startTime']) * 1000;
        }
        if (true == isNaN(appData['endTime'])) {
            timeObj['end_time'] = appData['endTime'];
        } else {
            timeObj['end_time'] = parseInt(appData['endTime']) * 1000;
        }
    } else {
        timeObj = createTimeQueryJsonObj(appData['minsSince']);
    }
    return timeObj;
}

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

function buildPreUnderlayWhereQuery (data)
{
    var srcIP = data['srcIP'];
    var destIP = data['destIP'];
    var sPort = data['sport'];
    var dPort = data['dport'];
    var srcVN = data['srcVN'];
    var destVN = data['destVN'];
    var protocol = data['protocol'];

    var whereData = [
        {'name': 'o_protocol', 'value': protocol,
            'suffix': {'name': 'o_sport', 'value': sPort}},
        {'name': 'o_protocol', 'value': protocol,
            'suffix': {'name': 'o_dport', 'value': dPort}},
        {'name': 'o_svn', 'value': srcVN,
            'suffix': {'name': 'o_sip', 'value': srcIP}},
        {'name': 'o_dvn', 'value': destVN,
            'suffix': {'name': 'o_dip', 'value': destIP}}
    ];
    return whereData;
}

function buildUnderlayQuery (uiQData, selectFileds)
{
    var queryJSON = global.QUERY_JSON['OverlayToUnderlayFlowMap'];
    var whereClause = [];
    whereClause[0] = [];
    var whereData = buildPreUnderlayWhereQuery(uiQData);
    var cnt = whereData.length;
    for (var i = 0; i < cnt; i++) {
        whereClause[0][i] = {};
        whereClause[0][i]['name'] = whereData[i]['name'];
        whereClause[0][i]['value'] = whereData[i]['value'];
        if (null == whereData[i]['value2']) {
            whereClause[0][i]['op'] = 1;
            whereClause[0][i]['value2'] = null;
        } else {
            whereClause[0][i]['op'] = 3;
            whereClause[0][i]['value2'] = whereData[i]['value'];
        }
        if (null != whereData[i]['suffix']) {
            whereClause[0][i]['suffix'] = {};
            whereClause[0][i]['suffix']['name'] = whereData[i]['suffix']['name'];
            whereClause[0][i]['suffix']['value'] = whereData[i]['suffix']['value'];
            whereClause[0][i]['suffix']['suffix'] = null;
            if (null == whereData[i]['suffix']['value2']) {
                whereClause[0][i]['suffix']['op'] = 1;
                whereClause[0][i]['suffix']['value2'] = null;
            } else {
                whereClause[0][i]['suffix']['op'] = 3;
                whereClause[0][i]['suffix']['value2'] =
                    whereData[i]['suffix']['value2'];
            }
        }
    }
    var timeObj = createTimeQueryJsonObjByAppData(uiQData);
    queryJSON['start_time'] = timeObj['start_time'];
    queryJSON['end_time'] = timeObj['end_time'];
    queryJSON['where'] = whereClause;
    if (null != selectFileds) {
        queryJSON['select_fields'].concat(selectFileds);
    }
    queryJSON['dir'] = global.TRAFFIC_DIR_INGRESS;
    if (null != uiQData['direction']) {
        if ('ingress' == uiQData['direction']) {
            queryJSON['dir'] = global.TRAFFIC_DIR_INGRESS;
        } else if ('egress' == uiQData['direction']) {
            queryJSON['dir'] = global.TRAFFIC_DIR_EGRESS;
        } else {
            queryJSON['dir'] = uiQData['direction'];
        }
    }
    return queryJSON;
}

exports.formatAndClause = formatAndClause;
exports.formatAndOrClause = formatAndOrClause;
exports.formatQueryString = formatQueryString;
exports.formatQueryStringWithWhereClause = formatQueryStringWithWhereClause;
exports.formatAndClauseGroup = formatAndClauseGroup;
exports.formatQueryWithPortRange = formatQueryWithPortRange;
exports.formatFlowSeriesQuery = formatFlowSeriesQuery;
exports.createTimeQueryJsonObj = createTimeQueryJsonObj;
exports.createTimeQueryJsonObjByServerTimeFlag =
    createTimeQueryJsonObjByServerTimeFlag;
exports.executeQueryString = executeQueryString;
exports.buildUnderlayQuery = buildUnderlayQuery;
exports.createTimeQueryJsonObjByAppData = createTimeQueryJsonObjByAppData;


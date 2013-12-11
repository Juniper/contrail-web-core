/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

/**
 * API for communication with Query Engine.
 */

var qeapi = module.exports,
    rest = require('../../common/rest.api'),
    config = require('../../../../config/config.global.js'),
    logutils = require('../../utils/log.utils'),
    commonUtils = require('../../utils/common.utils'),
    messages = require('../../common/messages'),
    global = require('../../common/global'),
    qs = require('querystring'),
    underscore = require('underscore'),
    adminApi = require('./admin.api'),
    siConfigApi = require('./serviceinstanceconfig.api'),
    opServer;

var redis = require("redis"),
    redisServerPort = (config.redis_server_port) ? config.redis_server_port : global.DFLT_REDIS_SERVER_PORT,
    redisServerIP = (config.redis_server_ip) ? config.redis_server_ip : global.DFLT_REDIS_SERVER_IP,
    redisClient = redis.createClient(redisServerPort, redisServerIP);

redisClient.select(global.QE_DFLT_REDIS_DB, function(error) {
    if (error) {
        logutils.logger.error('Redis DB ' + global.QE_DFLT_REDIS_DB + ' Select Error:' + error);
    }
});

opServer = rest.getAPIServer({apiName:global.label.OPS_API_SERVER, server:config.analytics.server_ip, port:config.analytics.server_port });

if (!module.parent) 
{
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call, module.filename));
    process.exit(1);
}

function executeQuery(res, options) 
{
    var queryJSON = options.queryJSON,
        async = options.async, asyncHeader = {"Expect":"202-accepted"};
    opServer.authorize(function () {
        logutils.logger.debug("Query sent to Opserver at " + new Date() + ' ' + JSON.stringify(queryJSON));
        options['startTime'] = new Date().getTime();
        opServer.api.post(global.RUN_QUERY_URL, queryJSON, function (error, jsonData) {
            if (error) {
                logutils.logger.error('Error Run Query: ' + error.stack);
                commonUtils.handleJSONResponse(error, res, null);
            } else if (async) {
                initPollingConfig(options, queryJSON.start_time, queryJSON.end_time)
                options['url'] = jsonData['href'];
                setTimeout(fetchQueryResults, 1000, res, jsonData, options);
                options['intervalId'] = setInterval(fetchQueryResults, options.pollingInterval, res, jsonData, options);
                options['timeoutId'] = setTimeout(stopFetchQueryResult, options.pollingTimeout, options);
            } else {
                processQueryResults(res, jsonData, options);
            }
        }, async ? asyncHeader : {});
    });
};

function initPollingConfig(options, fromTime, toTime) 
{
    var timeRange = (toTime - fromTime) / 60000000;
    if (timeRange <= 720) {
        options.pollingInterval = 5000;
        options.maxCounter = 3;
        options.pollingTimeout = 1200000;
    } else if (timeRange > 720 && timeRange <= 1440) {
        options.pollingInterval = 30000;
        options.maxCounter = 1;
        options.pollingTimeout = 2400000;
    } else {
        options.pollingInterval = 60000;
        options.maxCounter = 1;
        options.pollingTimeout = 3600000;
    }
};

function fetchQueryResults(res, jsonData, options) 
{
    var queryId = options['queryId'], pageSize = options['pageSize'],
        queryJSON = options['queryJSON'], progress;
    opServer.authorize(function () {
        opServer.api.get(jsonData['href'], function (error, queryResults) {
            progress = queryResults['progress'];
            options['counter'] += 1;
            if (error) {
                logutils.logger.error(error.stack);
                clearInterval(options['intervalId']);
                clearTimeout(options['timeoutId']);
                options['progress'] = progress;
                if (options.status == 'run') {
                    commonUtils.handleJSONResponse(error, res, null);
                } else if (options.status == 'queued') {
                    options.status = 'error';
                    options.errorMessage = error;
                    updateQueryStatus(options);
                }
            } else if (progress == 100) {
                clearInterval(options['intervalId']);
                clearTimeout(options['timeoutId']);
                options['progress'] = progress;
                options['count'] = queryResults.chunks[0]['count'];
                jsonData['href'] = queryResults.chunks[0]['href'];
                fetchQueryResults(res, jsonData, options);
            } else if (progress == null) {
                processQueryResults(res, queryResults, options);
                if (options.status == 'queued') {
                    options['endTime'] = new Date().getTime();
                    options['status'] = 'completed';
                    updateQueryStatus(options);
                }
            } else if (options['counter'] == options.maxCounter) {
                options['progress'] = progress;
                options['status'] = 'queued';
                updateQueryStatus(options);
                commonUtils.handleJSONResponse(null, res, {status:"queued", value:[]});
            }
        });
    });
};

function stopFetchQueryResult(options) 
{
    clearInterval(options['intervalId']);
    options['status'] = 'timeout';
    updateQueryStatus(options);
};

function updateQueryStatus(options) 
{
    var queryStatus = {
        startTime:options.startTime, queryId:options.queryId,
        url:options.url, queryJSON:options.queryJSON, progress:options.progress, status:options.status,
        tableName:options.queryJSON['table'], count:options.count, timeTaken:-1, errorMessage:options.errorMessage
    };
    if (queryStatus.tableName == 'FlowSeriesTable' || queryStatus.tableName.indexOf('StatTable.') != -1) {
        queryStatus.tg = options.tg;
        queryStatus.tgUnit = options.tgUnit;
    }
    if (options.progress == 100) {
        queryStatus.timeTaken = (options.endTime - queryStatus.startTime) / 1000;
    }
    redisClient.hmset(options.queryQueue, options.queryId, JSON.stringify(queryStatus));
};

function parseQueryTime(queryId) 
{
    var splitQueryIds = splitString2Array(queryId, '-'),
        timeStr = splitQueryIds[splitQueryIds.length - 1];
    return parseInt(timeStr);
};

function processQueryResults(res, queryResults, options) 
{
    var startDate = new Date(), startTime = startDate.getTime(),
        queryId = options.queryId, pageSize = options.pageSize,
        queryJSON = options.queryJSON, endDate = new Date(), table = queryJSON.table,
        endTime, total, responseJSON, resultJSON;
    endTime = endDate.getTime();
    resultJSON = (queryResults && !isEmptyObject(queryResults)) ? queryResults.value : [];
    logutils.logger.debug("Query results (" + resultJSON.length + " records) received from opserver at " + endDate + ' in ' + ((endTime - startTime) / 1000) + 'secs. ' + JSON.stringify(queryJSON));
    resultJSON = formatQueryResultJSON(queryJSON.table, resultJSON);
    logutils.logger.debug('Formatting of query-results on webserver completed in ' + (((new Date()).getTime() - endTime) / 1000) + 'secs. ' + JSON.stringify(queryJSON));
    total = resultJSON.length;
    if (options.status == 'run') {
        if (queryId == null || total <= pageSize) {
            responseJSON = resultJSON;
        } else {
            responseJSON = resultJSON.slice(0, pageSize);
        }
        commonUtils.handleJSONResponse(null, res, {data:responseJSON, total:total});
    }
    saveQueryResult2Redis(resultJSON, total, queryId, pageSize);
    if (table == 'FlowSeriesTable') {
        saveData4Chart2Redis(queryId, resultJSON, getPlotFields(queryJSON['select_fields']));
    }
};

function saveQueryResult2Redis(resultData, total, queryId, pageSize, sort) 
{
    var endRow;
    if (sort != null) {
        redisClient.set(queryId + ":sortStatus", JSON.stringify(sort));
    }
    // TODO: Should we need to save every page?
    redisClient.set(queryId, JSON.stringify({data:resultData, total:total}));
    if (total == 0) {
        redisClient.set(queryId + ':page1', JSON.stringify({data:[], total:0}));
    } else {
        for (var j = 0, k = 1; j < total; k++) {
            endRow = k * pageSize;
            if (endRow > resultData.length) {
                endRow = resultData.length;
            }
            var spliceData = resultData.slice(j, endRow);
            redisClient.set(queryId + ':page' + k, JSON.stringify({data:spliceData, total:total}));
            j = endRow;
        }
    }
};

function getPlotFields(selectFields) 
{
    var plotFields = [],
        statFields = [
            {field:'sum(bytes)', label:'sum_bytes'},
            {field:'avg(bytes)', label:'avg_bytes'},
            {field:'sum(packets)', label:'sum_packets'},
            {field:'avg(packets)', label:'avg_packets'}
        ];
    for (var j = 0; j < statFields.length; j++) {
        if (selectFields.indexOf(statFields[j].field) != -1) {
            plotFields.push(statFields[j].label);
        }
    }
    return plotFields;
};

function saveData4Chart2Redis(queryId, dataJSON, plotFields) 
{
    var resultData = {},
        result, i, j, k, flowClassId, flowClassRecord, uniqueFlowClassArray = [], secTime,
        flowClassArray = [];
    if (plotFields.length != 0) {
        for (i = 0; i < dataJSON.length; i++) {
            flowClassId = dataJSON[i]['flow_class_id'];
            flowClassRecord = getFlowClassRecord(dataJSON[i]);
            if (uniqueFlowClassArray.indexOf(flowClassId) == -1) {
                uniqueFlowClassArray.push(flowClassId);
                flowClassArray.push(flowClassRecord);
            }
            secTime = Math.floor(dataJSON[i]['T'] / 1000);
            result = {'date':new Date(secTime), 'flow_class_id':flowClassId};
            for (k = 0; k < plotFields.length; k++) {
                result[plotFields[k]] = dataJSON[i][plotFields[k]];
            }
            if (resultData[flowClassId] == null) {
                resultData[flowClassId] = {};
                resultData[flowClassId][secTime] = result;
            } else {
                resultData[flowClassId][secTime] = result;
            }
        }
    }
    redisClient.set(queryId + ':flowclasses', JSON.stringify(flowClassArray));
    redisClient.set(queryId + ':chartdata', JSON.stringify(resultData));
};

function getFlowClassRecord(row) 
{
    var flowClassFields = global.FLOW_CLASS_FIELDS,
        fieldValue, flowClass = {flow_class_id:row['flow_class_id']};

    for (var i = 0; i < flowClassFields.length; i++) {
        fieldValue = row[flowClassFields[i]];
        if (fieldValue != null) {
            flowClass[flowClassFields[i]] = fieldValue;
        }
    }
    return flowClass;
};

function formatQueryResultJSON(tableName, jsonData) 
{
    var columnLabels, fieldName, fieldValue, label, resultJSON = [], xml;
    if (tableName == 'FlowSeriesTable') {
        columnLabels = global.FORMAT_TABLE_COLUMNS[tableName];
        jsonData.forEach(function (record) {
            for (fieldName in columnLabels) {
                if (columnLabels.hasOwnProperty(fieldName) && record[fieldName] != null) {
                    label = columnLabels[fieldName];
                    record[label] = record[fieldName];
                    delete record[fieldName];
                }
            }
        });
    }
    return jsonData;
};

function parseSLQuery(reqQuery) 
{
    var msgQuery, fromTimeUTC, toTimeUTC, where, filters, table, level, category, moduleId, source, messageType, limit;
    table = reqQuery['table'];
    msgQuery = getQueryJSON4Table(table);
    fromTimeUTC = reqQuery['fromTimeUTC'];
    toTimeUTC = reqQuery['toTimeUTC'];
    limit = parseInt(reqQuery['limit']);
    where = reqQuery['where'];
    filters = reqQuery['filters'];
    level = reqQuery['level'];
    category = reqQuery['category'];
    setMicroTimeRange(msgQuery, fromTimeUTC, toTimeUTC);
    if (where != null) {
        parseWhere(msgQuery, where);
    } else {
        moduleId = reqQuery['moduleId'];
        source = reqQuery['source'];
        messageType = reqQuery['messageType'];
        createSLWhere(msgQuery, moduleId, messageType, source, category);
    }
    if (limit > 0) {
        msgQuery['limit'] = limit;
    }
    if (level != null && level != '') {
        createSLFilter(msgQuery, level);
    }
    if (filters != null && filters != '') {
        parseLogsFilter(msgQuery, filters);
    }
    return msgQuery;
};

function setMicroTimeRange(query, fromTime, toTime) 
{
    query.start_time = fromTime * 1000;
    query.end_time = toTime * 1000;
};

function createSLWhere(msgQuery, moduleId, messageType, source, category) 
{
    var whereClauseArray = [];
    if (moduleId != null && moduleId != "") {
        whereClauseArray.push(createClause('ModuleId', moduleId, 1));
    }
    if (messageType != null && messageType != "") {
        whereClauseArray.push(createClause('MessageType', messageType, 1));
    }
    if (source != null && source != "") {
        whereClauseArray.push(createClause('Source', source, 1));
    }
    if (category != null && category != "") {
        whereClauseArray.push(createClause('Category', category, 1));
    }
    msgQuery.where = [whereClauseArray];
};

function createSLFilter(msgQuery, level) 
{
    var filterClauseArray = [];
    filterClauseArray.push(createClause('Level', level, 5));
    msgQuery.filter = msgQuery.filter.concat(filterClauseArray);
};

function createClause(fieldName, fieldValue, operator) 
{
    var whereClause = {};
    if (fieldValue != null) {
        whereClause = {};
        whereClause.name = fieldName;
        whereClause.value = fieldValue;
        whereClause.op = operator;
    }
    return whereClause;
};

function parseOTQuery(reqQuery) 
{
    var objTraceQuery, fromTimeUTC, toTimeUTC, where, filters, objectType, select, objectId, limit;
    select = reqQuery['select'];
    objectType = reqQuery['objectType'];
    objTraceQuery = createOTQueryJSON(objectType);
    fromTimeUTC = reqQuery['fromTimeUTC'];
    toTimeUTC = reqQuery['toTimeUTC'];
    objectId = reqQuery['objectId'];
    filters = reqQuery['filters'];
    where = reqQuery['where'];
    limit = parseInt(reqQuery['limit']);
    setMicroTimeRange(objTraceQuery, fromTimeUTC, toTimeUTC);
    parseOTWhere(objTraceQuery, where, objectId);
    if (select != null && select.trim() != '') {
        parseOTSelect(objTraceQuery, select);
    } else {
        objTraceQuery['select_fields'] = objTraceQuery['select_fields'].concat(['ObjectLog', 'SystemLog']);
    }
    if (limit > 0) {
        objTraceQuery['limit'] = limit;
    }
    if (filters != null && filters != '') {
        parseLogsFilter(objTraceQuery, filters);
    }
    return objTraceQuery;
};

function createOTQueryJSON(objectType) 
{
    var queryJSON = getQueryJSON4Table(objectType);
    if(queryJSON != null) {
        return getQueryJSON4Table(objectType);
    } else {
        queryJSON = getQueryJSON4Table('ObjectTableQueryTemplate');
    }
    queryJSON['table'] = objectType;
    return queryJSON;
}

function parseOTSelect(objTraceQuery, select) 
{
    var selectArray = select.split(','),
        selectLength = selectArray.length;
    for (var i = 0; i < selectLength; i++) {
        selectArray[i] = selectArray[i].trim();
    }
    objTraceQuery['select_fields'] = objTraceQuery['select_fields'].concat(selectArray);
};

function parseOTWhere(otQuery, where, objectId) 
{
    parseWhere(otQuery, where);
    var whereClauseArray, whereClauseLength, i;
    if (otQuery.where != null) {
        whereClauseArray = otQuery.where;
        whereClauseLength = whereClauseArray.length;
        for (i = 0; i < whereClauseLength; i += 1) {
            if (objectId != null && objectId != "") {
                whereClauseArray[i].push(createClause('ObjectId', objectId, 1));
            }
        }
        otQuery.where = whereClauseArray;
    } else if (objectId != null && objectId != "") {
        whereClauseArray = [
            []
        ];
        whereClauseArray[0].push(createClause('ObjectId', objectId, 1));
        otQuery.where = whereClauseArray;
    }
};

function parseFSQuery(reqQuery) 
{
    var select, where, filters, fromTimeUTC, toTimeUTC, fsQuery, table, tg, tgUnit, direction;
    table = reqQuery['table'];
    fsQuery = getQueryJSON4Table(table);
    fromTimeUTC = reqQuery['fromTimeUTC'];
    toTimeUTC = reqQuery['toTimeUTC'];
    select = reqQuery['select'];
    where = reqQuery['where'];
    filters = reqQuery['filters'];
    tg = reqQuery['tgValue'];
    tgUnit = reqQuery['tgUnits'];
    direction = parseInt(reqQuery['direction']);
    setMicroTimeRange(fsQuery, fromTimeUTC, toTimeUTC);
    if (select != "") {
        parseSelect(fsQuery, select, tg, tgUnit);
    }
    parseWhere(fsQuery, where);
    if (direction >= 0) {
        fsQuery['dir'] = direction;
    }
    parseFilter(fsQuery, filters);
    return fsQuery;
};

function parseStatsQuery(reqQuery)
{
    var select, where, fromTimeUTC, toTimeUTC, statQuery, table, tg, tgUnit;
    table = reqQuery['table'];
    statQuery = getQueryJSON4Table(table);
    fromTimeUTC = reqQuery['fromTimeUTC'];
    toTimeUTC = reqQuery['toTimeUTC'];
    select = reqQuery['select'];
    where = reqQuery['where'];
    //filters = reqQuery['filters'];
    tg = reqQuery['tgValue'];
    tgUnit = reqQuery['tgUnits'];
    setMicroTimeRange(statQuery, fromTimeUTC, toTimeUTC);
    if (select != "") {
        parseSelect(statQuery, select, tg, tgUnit);
    }
    parseWhere(statQuery, where);
    return statQuery;
};

function parseFRQuery(reqQuery) 
{
    var select, where, fromTimeUTC, toTimeUTC, frQuery, table, direction;
    table = reqQuery['table'];
    frQuery = getQueryJSON4Table(table);
    fromTimeUTC = reqQuery['fromTimeUTC'];
    toTimeUTC = reqQuery['toTimeUTC'];
    select = reqQuery['select'];
    where = reqQuery['where'];
    direction = parseInt(reqQuery['direction']);
    setMicroTimeRange(frQuery, fromTimeUTC, toTimeUTC);
    if (select != "") {
        parseSelect(frQuery, select);
    }
    parseWhere(frQuery, where);
    if (direction >= 0) {
        frQuery['dir'] = direction;
    }
    return frQuery;
};

function parseSelect(query, select, tg, tgUnit) 
{
    var selectArray = splitString2Array(select, ','),
        tgIndex = selectArray.indexOf('time-granularity');
    if (tgIndex > -1) {
        selectArray[tgIndex] = 'T=' + getTGSecs(tg, tgUnit);
    } else if(selectArray.indexOf('T=') != -1) {
        tgIndex = selectArray.indexOf('T=');
        selectArray[tgIndex] = 'T=' + getTGSecs(tg, tgUnit);
    }
    query['select_fields'] = query['select_fields'].concat(selectArray);
};

function splitString2Array(strValue, delimiter) 
{
    var strArray = strValue.split(delimiter),
        count = strArray.length;
    for (var i = 0; i < count; i++) {
        strArray[i] = strArray[i].trim();
    }
    return strArray;
};

function getTGSecs(tg, tgUnit) 
{
    if (tgUnit == 'secs') {
        return tg;
    } else if (tgUnit == 'mins') {
        return tg * 60;
    } else if (tgUnit == 'hrs') {
        return tg * 3600;
    } else if (tgUnit == 'days') {
        return tg * 86400;
    }
};

function parseWhere(query, where) 
{
    if (where != null && where.trim() != '') {
        var whereORArray = where.split(' OR '),
            whereORLength = whereORArray.length,
            i;
        for (i = 0; i < whereORLength; i += 1) {
            whereORArray[i] = whereORArray[i].trim();
            whereORArray[i] = parseWhereANDClause(whereORArray[i]);
        }
        query['where'] = whereORArray;
    }
};

function parseLogsFilter(query, filters) 
{
    var filtersArray, filtersLength, filterClause = [], i, filterObj;
    if (filters != null && filters.trim() != '') {
        filtersArray = filters.split(' AND ');
        filtersLength = filtersArray.length;
        for (i = 0; i < filtersLength; i += 1) {
            filtersArray[i] = filtersArray[i].trim();
            filterObj = getFilterObj(filtersArray[i]);
            filterClause.push(filterObj);
        }
        query['filter'] = query['filter'].concat(filterClause);
    }
};

function getFilterObj(filter) 
{
    var filterObj;
    if (filter.indexOf('!=') != -1) {
        filterObj = parseFilterObj(filter, '!=');
    } else if (filter.indexOf(" RegEx= ") != -1) {
        filterObj = parseFilterObj(filter, 'RegEx=');
    } else if (filter.indexOf("=") != -1) {
        filterObj = parseFilterObj(filter, '=');
    }
    return filterObj;
};

function parseFilterObj(filter, operator) 
{
    var filterObj, filterArray;
    filterArray = splitString2Array(filter, operator);
    if (filterArray.length > 1 && filterArray[1] != '') {
        filterObj = {"name":"", value:"", op:""};
        filterObj.name = filterArray[0];
        filterObj.value = filterArray[1];
        filterObj.op = getOperatorCode(operator);
    }
    return filterObj
};

function parseFilter(query, filters) 
{
    var arrayStart, arrayEnd, sortFieldsStr, sortFieldsArray,
        limitSortOrderStr, limitSortOrderArray, count, sortOrder, limitArray, limit;
    if (filters != null && filters.trim() != '') {
        try {
            arrayStart = filters.indexOf('[');
            arrayEnd = filters.indexOf(']');
            if (arrayStart != -1 && arrayEnd != -1) {
                sortFieldsStr = filters.slice(arrayStart + 1, arrayEnd);
                sortFieldsArray = splitString2Array(sortFieldsStr, ',');
                limitSortOrderStr = filters.slice(arrayEnd + 1);
            } else {
                limitSortOrderStr = filters;
            }
            limitSortOrderArray = splitString2Array(limitSortOrderStr, ',');
            count = limitSortOrderArray.length;
            for (var i = 0; i < count; i++) {
                if (limitSortOrderArray[i] == '') {
                    continue;
                } else if (limitSortOrderArray[i].indexOf('sort') != -1) {
                    sortOrder = splitString2Array(limitSortOrderArray[i], ':');
                    if (sortOrder.length > 1 && sortOrder[1] != '') {
                        if (sortOrder[1].toLowerCase() == 'asc') {
                            query['sort'] = 1;
                        } else {
                            query['sort'] = 2;
                        }
                        query['sort_fields'] = sortFieldsArray;
                    }
                } else if (limitSortOrderArray[i].indexOf('limit') != -1) {
                    limitArray = splitString2Array(limitSortOrderArray[i], ':');
                    if (limitArray.length > 1 && limitArray[1] != '') {
                        try {
                            limit = parseInt(limitArray[1]);
                            if (limit > 0) {
                                query['limit'] = limit;
                            }
                        } catch (err) {
                            logutils.logger.error(err.stack);
                        }
                    }
                }
            }
        } catch (error) {
            logutils.logger.error(error.stack);
        }
    }
};

function parseWhereANDClause(whereANDClause) 
{
    var whereANDArray = whereANDClause.replace('(', '').replace(')', '').split(' AND '),
        whereANDLength = whereANDArray.length, i, whereANDClause, whereANDClauseArray;
    for (i = 0; i < whereANDLength; i += 1) {
        whereANDArray[i] = whereANDArray[i].trim();
        whereANDClause = whereANDArray[i];
        whereANDClauseArray = whereANDClause.split('=');
        whereANDClause = {"name":"", value:"", op:""};
        populateWhereANDClause(whereANDClause, whereANDClauseArray[0].trim(), whereANDClauseArray[1].trim(), '=');
        whereANDArray[i] = whereANDClause;
    }
    return whereANDArray;
};

function populateWhereANDClause(whereANDClause, fieldName, fieldValue, operator) 
{
    var validLikeOPRFields = global.VALID_LIKE_OPR_FIELDS,
        validRangeOPRFields = global.VALID_RANGE_OPR_FIELDS,
        splitFieldValues;
    whereANDClause.name = fieldName;
    if (validLikeOPRFields.indexOf(fieldName) != -1 && fieldValue.indexOf('*') != -1) {
        whereANDClause.value = fieldValue.replace('*', '');
        whereANDClause.op = 7;
    } else if (validRangeOPRFields.indexOf(fieldName) != -1 && fieldValue.indexOf('-') != -1) {
        splitFieldValues = splitString2Array(fieldValue, '-');
        whereANDClause.value = splitFieldValues[0];
        whereANDClause['value2'] = splitFieldValues[1];
        whereANDClause.op = 3;
    } else {
        whereANDClause.value = fieldValue;
        whereANDClause.op = getOperatorCode(operator);
    }
};

function getOperatorCode(operator) 
{
    if (operator == '=') {
        return 1;
    } else if (operator == '!=') {
        return 2;
    } else if (operator == 'RegEx=') {
        return 8;
    } else {
        return -1
    }
};

function getQueryJSON4Table(tableName)
{
    var queryJSON;
    if(tableName == 'MessageTable') {
        queryJSON = {"table": tableName, "start_time": "", "end_time": "", "select_fields": ["MessageTS", "Type", "Source", "ModuleId", "Messagetype", "Xmlmessage", "Level", "Category"], "filter": [{"name": "Type", "value": "1", "op": 1}], "sort_fields": ['MessageTS'], "sort": 2};
    } else if(tableName == 'ObjectTableQueryTemplate') {
        queryJSON = {"table": '', "start_time": "", "end_time": "", "select_fields": ["MessageTS", "Source", "ModuleId"], "sort_fields": ['MessageTS'], "sort": 2, "filter": []};
    } else if(tableName == 'FlowSeriesTable') {
        queryJSON = {"table": tableName, "start_time": "", "end_time": "", "select_fields": ['flow_class_id', 'direction_ing']};
    } else if(tableName == 'FlowRecordTable') {
        queryJSON = {"table": tableName, "start_time": "", "end_time": "", "select_fields": ['vrouter', 'sourcevn', 'sourceip', 'sport', 'destvn', 'destip', 'dport', 'protocol', 'direction_ing']};
    } else if(tableName.indexOf('Object') != -1) {
        queryJSON = {"table": tableName, "start_time": "", "end_time": "", "select_fields": ["MessageTS", "Source", "ModuleId"], "sort_fields": ['MessageTS'], "sort": 2, "filter": []};
    } else if(tableName.indexOf('StatTable.') != -1) {
        queryJSON = {"table": tableName, "start_time": "", "end_time": "", "select_fields": []};
    } else {
        queryJSON = {"table": tableName, "start_time": "", "end_time": "", "select_fields": []};
    }
    return queryJSON;
};

function getJSONClone(json) 
{
    var newJSONStr = JSON.stringify(json);
    return JSON.parse(newJSONStr);
};

// Handle request to run query.
function runQuery (req, res) 
{
    var reqQuery = req.query, queryId = reqQuery['queryId'],
        page = reqQuery['page'], sort = reqQuery['sort'],
        pageSize = parseInt(reqQuery['pageSize']), options;
    options = {"queryId":queryId, "page":page, "sort":sort, "pageSize":pageSize, "toSort":true};
    logutils.logger.debug('Query Request: ' + JSON.stringify(reqQuery));
    if (queryId != null) {
        redisClient.exists(queryId + ':page1', function (err, exists) {
            if (err) {
                logutils.logger.error(err.stack);
                commonUtils.handleJSONResponse(err, res, null);
            } else if (exists == 1) {
                returnCachedQueryResult(res, options, handleQueryResponse);
            } else {
                runNewQuery(req, res, queryId);
            }
        });
    } else {
        runNewQuery(req, res);
    }
};

function returnCachedQueryResult(res, options, callback) 
{
    var queryId = options.queryId, sort = options.sort,
        statusJSON;
    if (sort != null) {
        redisClient.get(queryId + ':sortStatus', function (error, result) {
            var sort = options.sort;
            if (error) {
                logutils.logger.error(error.stack);
            } else if (result != null) {
                statusJSON = JSON.parse(result);
                if (statusJSON[0]['field'] == sort[0]['field'] && statusJSON[0]['dir'] == sort[0]['dir']) {
                    options.toSort = false;
                }
            }
            callback(res, options);
        });
    } else {
        options.toSort = false;
        callback(res, options);
    }
};

function handleQueryResponse(res, options) 
{
    var toSort = options.toSort, queryId = options.queryId,
        page = options.page, pageSize = options.pageSize,
        sort = options.sort;
    redisClient.get(queryId + ((page == null || toSort) ? '' : (":page" + page)), function (error, result) {
        if (error) {
            logutils.logger.error(error.stack);
            commonUtils.handleJSONResponse(error, res, null);
        } else if (page != null && toSort) {
            var resultJSON;
            resultJSON = JSON.parse(result);
            sortJSON(resultJSON['data'], sort, function () {
                var startIndex, endIndex, total, responseJSON
                total = resultJSON['total'];
                startIndex = (page - 1) * pageSize;
                endIndex = (total < (startIndex + pageSize)) ? total : (startIndex + pageSize);
                responseJSON = resultJSON['data'].slice(startIndex, endIndex);
                commonUtils.handleJSONResponse(null, res, {data:responseJSON, total:total});
                saveQueryResult2Redis(resultJSON['data'], total, queryId, pageSize, sort);
            });
        } else {
            commonUtils.handleJSONResponse(null, res, result ? JSON.parse(result) : []);
        }
    });
};

function sortJSON(resultArray, sort, callback) 
{
    var sortField = sort[0]['field'],
        sortDir = sort[0]['dir'] == 'desc' ? 0 : 1;
    sortField = sortField.replace(/([\"\[\]])/g, '');
    resultArray.sort(function (a, b) {
        var a1st = -1;
        var b1st = 1;
        var equal = 0;
        if (b[sortField] < a[sortField]) {
            return sortDir == 1 ? b1st : a1st;
        } else if (a[sortField] < b[sortField]) {
            return sortDir == 1 ? a1st : b1st;
        } else {
            return equal;
        }
    });
    callback();
};

function runNewQuery(req, res, queryId) 
{
    var reqQuery = req.query, tableName = reqQuery['table'],
        queryId = reqQuery['queryId'], pageSize = parseInt(reqQuery['pageSize']),
        async = (reqQuery['async'] != null && reqQuery['async'] == "true") ? true : false,
        options = {queryId:queryId, pageSize:pageSize, counter:0, status:"run", async:async, count:0, progress:0, errorMessage:""},
        queryJSON;
    if (tableName == 'MessageTable') {
        queryJSON = parseSLQuery(reqQuery);
        options.queryQueue = 'lqq';
    } else if (tableName.indexOf('Object') != -1) {
        queryJSON = parseOTQuery(reqQuery)
        options.queryQueue = 'lqq';
    } else if (tableName == 'FlowSeriesTable') {
        queryJSON = parseFSQuery(reqQuery);
        options.tg = reqQuery['tgValue'];
        options.tgUnit = reqQuery['tgUnits'];
        options.queryQueue = 'fqq';
    } else if (tableName == 'FlowRecordTable') {
        queryJSON = parseFRQuery(reqQuery);
        options.queryQueue = 'fqq';
    } else if (tableName.indexOf('StatTable.') != -1) {
        queryJSON = parseStatsQuery(reqQuery);
        options.tg = reqQuery['tgValue'];
        options.tgUnit = reqQuery['tgUnits'];
        options.queryQueue = 'sqq';
    }
    options.queryJSON = queryJSON;
    executeQuery(res, options);
};

// Handle request to get list of all tables.
function getTables (req, res) 
{
    var opsUrl = global.GET_TABLES_URL;
    sendCachedJSON4Url(opsUrl, res, 3600);
};

// Handle request to get valid values of a table column.
function getColumnValues (req, res) 
{
    var opsUrl = global.GET_TABLE_INFO_URL + '/' + req.param('tableName') + '/column-values/' + req.param('column');
    sendCachedJSON4Url(opsUrl, res, 3600);
};

// Handle request to get table schema.
function getTableSchema (req, res) 
{
    var opsUrl = global.GET_TABLE_INFO_URL + '/' + req.param('tableName') + '/schema';
    sendCachedJSON4Url(opsUrl, res, 3600);
};

function sendCachedJSON4Url(opsUrl, res, expireTime) 
{
    redisClient.get(opsUrl, function(error, cachedJSONStr) {
        if (error || cachedJSONStr == null) {
            opServer.authorize(function () {
                opServer.api.get(opsUrl, function (error, jsonData) {
                    if(!jsonData) {
                        jsonData = [];
                    }
                    redisClient.setex(opsUrl, expireTime, JSON.stringify(jsonData));
                    commonUtils.handleJSONResponse(error, res, jsonData);
                });
            });
        } else {
            commonUtils.handleJSONResponse(null, res, JSON.parse(cachedJSONStr));
        }
    });
};

// Handle request to get object ids.
function getObjectIds (req, res, appData) 
{
    var objectTable = req.param('objectType'),
        objectQuery, startTime, endTime, queryOptions;

    startTime = req.param('fromTimeUTC') * 1000;
    endTime = req.param('toTimeUTC') * 1000;

    objectQuery = {"start_time": startTime, "end_time": endTime, "select_fields": ["ObjectId"], "table": objectTable};
    queryOptions = {queryId:null, async:false, status: "run", queryJSON: objectQuery, errorMessage: ""};

    executeQuery(res, queryOptions);
};

// Handle request to get query queue.
function getQueryQueue (req, res) 
{
    var queryQueue = req.param('queryQueue');
    redisClient.hvals(queryQueue, function (error, results) {
        if (error) {
            logutils.logger.error(error.stack);
            commonUtils.handleJSONResponse(error, res, null);
        } else {
            for (var i = 0; i < results.length; i++) {
                results[i] = JSON.parse(results[i])
            }
            commonUtils.handleJSONResponse(error, res, results);
        }
    });
};

// Handle request to get unique flow classes for a flow-series query.
function getFlowClasses (req, res) 
{
    var queryId = req.param('queryId');
    redisClient.get(queryId + ':flowclasses', function (error, results) {
        if (error) {
            logutils.logger.error(error.stack);
            commonUtils.handleJSONResponse(error, res, null);
        } else {
            commonUtils.handleJSONResponse(error, res, JSON.parse(results));
        }
    });
};

// Handle request to get chart data for a flow-series query.
function getChartData (req, res) 
{
    var queryId = req.param('queryId');
    redisClient.get(queryId + ':chartdata', function (error, results) {
        if (error) {
            logutils.logger.error(error.stack);
            commonUtils.handleJSONResponse(error, res, null);
        } else {
            commonUtils.handleJSONResponse(error, res, JSON.parse(results));
        }
    });
};

// Handle request to delete redis cache for given query ids.
function deleteQueryCache4Ids (req, res) 
{
    var queryIds = req.body.queryIds;
    var queryQueue = req.body.queryQueue;
    for(var i = 0; i < queryIds.length; i++) {
        redisClient.hdel(queryQueue, queryIds[i]);
        redisClient.keys(queryIds[i] + "*", function (error, keysArray) {
            if(!error && keysArray.length > 0) {
                redisClient.del(keysArray, function(error) {
                    if(error) {
                        logutils.logger.error('Error in delete cache of query key: ' + error);
                    }
                });
            } else {
                logutils.logger.error('Error in delete cache of query id: ' + error);
            }
        });
    }
    commonUtils.handleJSONResponse(null, res, {});
};

// Handle request to delete redis cache for QE.
function deleteQueryCache4Queue (req, res) 
{
    var queryQueue = req.body.queryQueue;
    redisClient.hkeys(queryQueue, function (error, results) {
        if(!error) {
            redisClient.del(queryQueue, function(error) {
                if(error) {
                    logutils.logger.error('Error in delete cache of query queue: ' + error);
                    commonUtils.handleJSONResponse(error, res, null);
                } else {
                    logutils.logger.debug('Redis Query Queue ' + queryQueue + ' flush complete.');
                    commonUtils.handleJSONResponse(null, res, {message: 'Redis Query Queue ' + queryQueue + ' flush complete.'});
                }
            });
        } else {
            commonUtils.handleJSONResponse(error, res, null);
        }
    });
};

// Handle request to delete redis cache for QE.
function flushQueryCache (req, res) 
{
    redisClient.flushdb(function (error) {
        if (error) {
            logutils.logger.error("Redis QE FlushDB Error: " + error);
            commonUtils.handleJSONResponse(error, res, null);
        } else {
            logutils.logger.debug("Redis QE FlushDB Complete.");
            commonUtils.handleJSONResponse(null, res, {message: 'Redis QE FlushDB Complete.'});
        }
    });
};

function isEmptyObject(obj) 
{
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop))
            return false;
    }
    return true;
};

exports.runQuery = runQuery;
exports.getTables = getTables;
exports.getColumnValues = getColumnValues;
exports.getTableSchema = getTableSchema;
exports.getObjectIds = getObjectIds;
exports.getQueryQueue = getQueryQueue;
exports.getFlowClasses = getFlowClasses;
exports.getChartData = getChartData;
exports.deleteQueryCache4Ids = deleteQueryCache4Ids;
exports.deleteQueryCache4Queue = deleteQueryCache4Queue;
exports.flushQueryCache = flushQueryCache;


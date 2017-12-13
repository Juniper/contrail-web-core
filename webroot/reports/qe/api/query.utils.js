/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
var assert      = require("assert");
var logutils    = require(process.mainModule.exports.corePath +
                          "/src/serverroot/utils/log.utils");
var commonUtils = require(process.mainModule.exports.corePath +
                          "/src/serverroot/utils/common.utils");
var global      = require(process.mainModule.exports.corePath +
                          "/src/serverroot/common/global");
var opApiServer = require(process.mainModule.exports.corePath +
                          "/src/serverroot/common/opServer.api");
var crypto      = require("crypto");
var _           = require("lodash");
var async       = require("async");

function createTimeQueryJsonObj (minsSince, endTime) {
    var startTime = 0, timeObj = {};

    if ((!_.isNil(minsSince) && _.isNil(endTime)) || ("" === endTime)) {
        timeObj.start_time = "now-" + minsSince + "m";
        timeObj.end_time = "now";
        return timeObj;
    }
    if (!_.isNil(endTime) && endTime !== "" ) {
        try {
            endTime = parseInt(endTime);
        } catch (err) {
            endTime = commonUtils.getUTCTime(new Date().getTime());
        }
    } else {
        endTime = commonUtils.getUTCTime(new Date().getTime());
    }

    if (minsSince !== -1) {
        startTime =
            commonUtils.getUTCTime(commonUtils.adjustDate(new Date(endTime),
                                                          {"min":-minsSince}).getTime());
    }


    timeObj.start_time = startTime * 1000;
    timeObj.end_time = endTime * 1000;
    return timeObj;
}

function createTimeObj (appData) {
    var minsSince = appData.minsSince;
    var minsAlign = appData.minsAlign;

    var endTime = commonUtils.getUTCTime(new Date().getTime());
    var startTime = 0;

    if (minsSince !== -1) {
        if (_.isNil(appData.startTime)) {
            var ctDate = new Date();
            if (!_.isNil(minsAlign)) {
                ctDate.setSeconds(0);
            }

            startTime =
                commonUtils.getUTCTime(commonUtils.adjustDate(ctDate,
                                                              {"min":-minsSince}).getTime());
        } else {
            startTime = parseInt(appData.startTime);
            endTime = parseInt(appData.endTime);
        }
    }

    var timeObj = {};
    timeObj.start_time = startTime * 1000;
    timeObj.end_time = endTime * 1000;
    return timeObj;
}

function createTimeObjByAppData (appData) {
    var serverTime = appData.serverTime;
    var minsSince = appData.minsSince;
    var timeObj = {};
    if (!_.isNil(minsSince) && _.isNil(appData.startTime)) {
        if (!_.isNil(serverTime) && (("true" === serverTime) ||
                                     (true === serverTime))) {
            timeObj = createTimeObj(appData);
            timeObj.timeGran =
                getTimeGranByTimeSlice(timeObj, appData.sampleCnt);
        } else {
            timeObj.start_time = "now-" + minsSince + "m";
            timeObj.end_time = "now";
            timeObj.timeGran = getTimeGranByTimeSlice(timeObj,
                                                         appData.sampleCnt);
        }
    } else {
        assert(appData.startTime);
        assert(appData.endTime);
        timeObj = createTimeQueryObjByStartEndTime(appData.startTime,
                                                   appData.endTime);
        if (_.isNil(appData.timeGran)) {
            timeObj.timeGran = getTimeGranByTimeSlice(timeObj,
                                                      appData.sampleCnt);
        } else {
            timeObj.timeGran = parseInt(appData.timeGran);
        }
    }
    return timeObj;
}

function createTimeQueryJsonObjByServerTimeFlag (minsSince, serverTimeFlag) {
    var timeObj = {};
    if (_.isNil(serverTimeFlag) || (false === serverTimeFlag) ||
        ("false" === serverTimeFlag)) {
        timeObj.start_time = "now-" + minsSince + "m";
        timeObj.end_time = "now";
        return timeObj;
    }

    var endTime = commonUtils.getUTCTime(new Date().getTime());
    var startTime =
        commonUtils.getUTCTime(commonUtils.adjustDate(new
                                                      Date(endTime),
                                                      {"min":-minsSince}).getTime());
    timeObj.start_time = startTime * 1000;
    timeObj.end_time = endTime * 1000;
    return timeObj;
}

function createTimeQueryJsonObjByAppData (appData) {
    var timeObj = {};

    if (appData.startTime) {
        if (true === isNaN(appData.startTime)) {
            timeObj.start_time = appData.startTime;
        } else {
            timeObj.start_time = parseInt(appData.startTime) * 1000;
        }
        if (true === isNaN(appData.endTime)) {
            timeObj.end_time = appData.endTime;
        } else {
            timeObj.end_time = parseInt(appData.endTime) * 1000;
        }
    } else {
        timeObj = createTimeQueryJsonObj(appData.minsSince);
    }
    return timeObj;
}

function executeQueryString (queryJSON, appData, callback) {
    var startTime = (new Date()).getTime(), endTime;
    opApiServer.apiPost(global.RUN_QUERY_URL, queryJSON, appData,
                        function (error, jsonData) {
        endTime = (new Date()).getTime();
        logutils.logger.debug("Query executed in " + ((endTime - startTime) / 1000) +
            "secs " + JSON.stringify(queryJSON));
        callback(error, jsonData);
    });
}

function buildPreUnderlayWhereQuery (data) {
    var srcIP = data.srcIP;
    var destIP = data.destIP;
    var sPort = data.sport;
    var dPort = data.dport;
    var srcVN = data.srcVN;
    var destVN = data.destVN;
    var protocol = data.protocol;

    var whereData = [
        {"name": "o_protocol", "value": protocol,
            "suffix": {"name": "o_sport", "value": sPort}},
        {"name": "o_protocol", "value": protocol,
            "suffix": {"name": "o_dport", "value": dPort}},
        {"name": "o_svn", "value": srcVN,
            "suffix": {"name": "o_sip", "value": srcIP}},
        {"name": "o_dvn", "value": destVN,
            "suffix": {"name": "o_dip", "value": destIP}}
    ];
    return whereData;
}

function buildUnderlayQuery (uiQData, selectFileds) {
    var queryJSON = global.QUERY_JSON.OverlayToUnderlayFlowMap;
    var whereClause = [];
    whereClause[0] = [];
    var whereData = buildPreUnderlayWhereQuery(uiQData);
    var cnt = whereData.length;
    for (var i = 0; i < cnt; i++) {
        whereClause[0][i] = {};
        whereClause[0][i].name = whereData[i].name;
        whereClause[0][i].value = whereData[i].value;
        if (_.isNil(whereData[i].value2)) {
            whereClause[0][i].op = 1;
            whereClause[0][i].value2 = null;
        } else {
            whereClause[0][i].op = 3;
            whereClause[0][i].value2 = whereData[i].value;
        }
        if (!_.isNil(whereData[i].suffix)) {
            whereClause[0][i].suffix = {};
            whereClause[0][i].suffix.name = whereData[i].suffix.name;
            whereClause[0][i].suffix.value = whereData[i].suffix.value;
            whereClause[0][i].suffix.suffix = null;
            if (_.isNil(whereData[i].suffix.value2)) {
                whereClause[0][i].suffix.op = 1;
                whereClause[0][i].suffix.value2 = null;
            } else {
                whereClause[0][i].suffix.op = 3;
                whereClause[0][i].suffix.value2 =
                    whereData[i].suffix.value2;
            }
        }
    }
    var timeObj = createTimeQueryJsonObjByAppData(uiQData);
    queryJSON.start_time = timeObj.start_time;
    queryJSON.end_time = timeObj.end_time;
    queryJSON.where = whereClause;
    if (!_.isNil(selectFileds)) {
        queryJSON.select_fields.concat(selectFileds);
    }
    queryJSON.dir = global.TRAFFIC_DIR_INGRESS;
    if (!_.isNil(uiQData.direction)) {
        if ("ingress" === uiQData.direction) {
            queryJSON.dir = global.TRAFFIC_DIR_INGRESS;
        } else if ("egress" === uiQData.direction) {
            queryJSON.dir = global.TRAFFIC_DIR_EGRESS;
        } else {
            queryJSON.dir = uiQData.direction;
        }
    }
    return queryJSON;
}

function formatQEUIQuery (qObj) {
    var qeQuery = {};
    var qeModAttrs = {};
    if (_.isNil(qObj)) {
        return null;
    }
    qeQuery.async = false;
    if (!_.isNil(qObj.async)) {
        qeQuery.async = qObj.async;
    }
    if (!_.isNil(qObj.table)) {
        qeModAttrs = qeTableJSON[qObj.table];
        qeModAttrs.table_name = qObj.table;
    }
    if (!_.isNil(qObj.select)) {
        qeModAttrs.select = qObj.select;
    }
    if (!_.isNil(qObj.where)) {
        qeModAttrs.where = qObj.where;
    }
    if (!_.isNil(qObj.minsSince)) {
        qeModAttrs.to_time_utc = "now";
        qeModAttrs.from_time_utc = "now-" + qObj.minsSince + "m";
    } else if (!_.isNil(qObj.from_time_utc) && !_.isNil(qObj.to_time_utc)) {
        qeModAttrs.from_time_utc = qObj.from_time_utc;
        qeModAttrs.to_time_utc = qObj.to_time_utc;
    }
    if (!_.isNil(qObj.table_type)) {
        qeModAttrs.table_type = qObj.table_type;
    }
    if (!_.isNil(qObj.time_range)) {
        qeModAttrs.time_range = qObj.time_range;
        qeModAttrs.time_granularity_unit = "secs";
    }
    if (!_.isNil(qObj.time_granularity_unit)) {
        qeModAttrs.time_granularity_unit = qObj.time_granularity_unit;
    }
    qeModAttrs.filters = "";
    if (!_.isNil(qObj.filter)) {
        qeModAttrs.filters =
            fillQEFilterByKey("filter", qObj.filter,
                              qeModAttrs.filters);
    }
    if (_.isNil(qObj.limit)) {
        qObj.limit = 150000;
    }
    qeModAttrs.filters +=
        fillQEFilterByKey("limit", qObj.limit, qeModAttrs.filters);
    if (_.isNil(qObj.sort_fields)) {
        if (!_.isNil(qeModAttrs.sort_fields)) {
            qObj.sort_fields = qeModAttrs.sort_fields;
        }
    }
    delete qeModAttrs.sort_fields;
    if (!_.isNil(qObj.sort_fields)) {
        qeModAttrs.filters +=
            fillQEFilterByKey("sort_fields", qObj.sort_fields,
                              qeModAttrs.filters);
    }
    if (_.isNil(qObj.sort)) {
        if (!_.isNil(qeModAttrs.sort)) {
            qObj.sort = qeModAttrs.sort;
            qeModAttrs.filters +=
                fillQEFilterByKey("sort", qObj.sort, qeModAttrs.filters);
        }
    }
    delete qeModAttrs.sort;
    qeQuery.formModelAttrs = qeModAttrs;
    return qeQuery;
}

function getTableTypeByName (table) {
    if (table.indexOf("StatTable") > -1) {
        return global.QE_STAT_TABLE_TYPE;
    }
    if (table.indexOf("Flow") > -1) {
        return global.QE_FLOW_TABLE_TYPE;
    }
    return null;
}

function getTimeGranByTimeSlice (timeObj, sampleCnt) {
    var startTime = timeObj.start_time;
    var endTime = timeObj.end_time;
    var timeGran;
    if (true === isNaN(startTime)) {
        var str = "now-";
        var pos = startTime.indexOf(str);
        if (pos !== -1) {
            var mins = startTime.slice(pos + str.length);
            mins = mins.substr(0, mins.length - 1);
            mins = parseInt(mins);
        } else {
            assert(0);
        }
        timeGran = (mins * 60) / sampleCnt;
        return Math.floor(timeGran);
    }

    timeGran = (endTime - startTime) / (sampleCnt *
        global.MILLISEC_IN_SEC * global.MICROSECS_IN_MILL);
    if (timeGran < 1) {
        timeGran = 1;
    }
    return Math.floor(timeGran);
}

function createTimeQueryObjByStartEndTime (startTime, endTime) {
    var timeObj = {};
    timeObj.start_time = parseInt(startTime) * global.MICROSECS_IN_MILL;
    timeObj.end_time = parseInt(endTime) * global.MICROSECS_IN_MILL;
    return timeObj;
}

function formQEQueryData (table, appData, selectArr, where, filters) {
    var minsSince = appData.minsSince;
    var timeObj;
    var timeGran;
    if (minsSince !== null) {
        timeObj =
            createTimeQueryJsonObjByServerTimeFlag(appData.minsSince,
                                                   appData.useServerTime);
        timeGran = getTimeGranByTimeSlice(timeObj, appData.sampleCnt);
    } else {
        timeObj =
            createTimeQueryObjByStartEndTime(appData.startTime,
                                             appData.endTime);
        timeGran = appData.timeGran;
    }

    var index = selectArr.indexOf("T=");
    if (index !== -1) {
        selectArr[index] = "T=" + timeGran;
    }
    var queryJSON = {
        table_name: table,
        table_type: getTableTypeByName(table),
        select: selectArr.join(", "),
        where: where,
        time_granularity: timeGran,
        time_granularity_unit: "secs",
        from_time_utc: timeObj.start_time / 1000,
        to_time_utc: timeObj.end_time / 1000,
        filters: filters
    };
    var queryData = {
        async: false,
        chunk: 1,
        chunkSize: 10000,
        formModelAttrs: queryJSON,
        engQueryStr: JSON.stringify(queryJSON)
    };
    return queryData;
}

function fillQEFilterByKey (key, value, filterStr) {
    if (null === filterStr) {
        filterStr = "";
    }
    if (filterStr.length > 0) {
        filterStr += " & ";
    }
    var keyStr = (filterStr.length > 0) ? " & " : "";
    keyStr += key;
    filterStr = keyStr + ": " + value;
    return filterStr;
}

function getQueryDataByCache (queryJSON, appData, callback)
{
    var reqUrl = global.RUN_QUERY_URL;
    var tmpQuery = commonUtils.cloneObj(queryJSON);
    /* Delete the start_time and end_time and get the hash of the stringified
     * json, and check if we have any data for that hash key
     */
    var startTime = queryJSON.start_time;
    var endTime = queryJSON.end_time;
    var hashKey = startTime + ":" + endTime;
    delete tmpQuery.start_time;
    delete tmpQuery.end_time;
    tmpQuery = JSON.stringify(commonUtils.doDeepSort(tmpQuery));
    var hash = "qData:" + crypto.createHash('md5').update(tmpQuery).digest('hex');
    var redisClient = process.mainModule.exports.redisClient;
    redisClient.hgetall(hash, function(error, keyObj) {
        if ((null != error) || (null == keyObj)) {
            opApiServer.apiPost(reqUrl, queryJSON, appData,
                                function(error, data) {
                callback(error, data);
                if ((null == error) && (null != data)) {
                    redisClient.hset(hash, hashKey, JSON.stringify(data));
                }
            });
        } else {
            /* Got the redis data */
            mergeQueryDataAndSend(hash, keyObj, queryJSON, appData, callback);
        }
    });
}

function formQueryByTimes (dataObjArr, queryJson, startTime, endTime, appData)
{
    var qeURL = global.RUN_QUERY_URL;
    var tmpQ = commonUtils.cloneObj(queryJson);
    if (null == dataObjArr) {
        dataObjArr = [];
    }
    tmpQ.start_time = startTime;
    tmpQ.end_time = endTime;
    commonUtils.createReqObj(dataObjArr, qeURL, global.HTTP_REQUEST_POST,
                             tmpQ, null, null, appData);
}

function getCachedGapQueries (queryJSON, keyObjs, appData)
{
    var tmpQJson = commonUtils.cloneObj(queryJSON);
    var considerObjs = [];
    var startTime   = tmpQJson.start_time;
    var endTime     = tmpQJson.end_time;
    var foundKey    = false;

    for (var key in keyObjs) {
        /* Key is combination of startTime and endTime */
        var timeArr = key.split(":");
        var keyStartTime = Number(timeArr[0]);
        var keyEndTime = Number(timeArr[1]);
        if ((startTime >= keyStartTime) && (endTime <= keyEndTime)) {
            /*
                Ex: Stored Keys: 10:20 || 15:25
                Req Start:End  : 15:18
                We already have the data
             */
            return {foundKey: key}
        }
        if (((startTime < keyStartTime) && (endTime > keyStartTime)) ||
            /*
                Ex: Stored Keys: 10:20
                Req Start:End  : 5:15
             */
            ((startTime >= keyStartTime) && (startTime < keyEndTime)) ||
            /*
                Ex: Stored Keys: 10:20
                Req Start: End : 15:25
             */
            ((startTime < keyStartTime) && (endTime > keyEndTime)) ||
            /*
                Ex: Stored Keys: 47:55
                Req Start:End  : 15:60
             */
            ((startTime == keyStartTime) || (startTime == keyEndTime) ||
             (endTime == keyStartTime) || (endTime == keyEndTime))) {
            /* Border Cases */
            considerObjs.push(key);
            considerObjs.sort(function(a, b) {
                var aArr = a.split(":");
                var bArr = b.split(":");
                return (((Number(aArr[0]) > Number(bArr[0])) -
                         (Number(aArr[0]) < Number(bArr[0]))) +
                        ((Number(aArr[1]) > Number(bArr[1])) -
                         (Number(aArr[1]) < Number(bArr[1]))));
            });
        }
    }

    /* Now find the query times */
    var len = considerObjs.length;
    var dataObjArr = [];
    if (!len) {
        formQueryByTimes(dataObjArr, tmpQJson, startTime, endTime, appData);
        //dataObjArr.push({start_time: startTime, end_time: endTime});
    }
    if (1 == len) {
        var keyArr = considerObjs[0].split(":");
        if (startTime < Number(keyArr[0])) {
            formQueryByTimes(dataObjArr, tmpQJson, startTime, Number(keyArr[0]), appData);
            //dataObjArr.push({start_time: startTime, end_time: keyArr[0]});
        }
        if (endTime > Number(keyArr[1])) {
            formQueryByTimes(dataObjArr, tmpQJson, Number(keyArr[1]), endTime, appData);
            //dataObjArr.push({start_time: keyArr[1], end_key: endTime});
        }
    } else {
        for (var i = 0; i < len; i++) {
            var keyArr = considerObjs[i].split(":");
            if (0 == i) {
                /* First Entry */
                if (startTime < Number(keyArr[0])) {
                    formQueryByTimes(dataObjArr, tmpQJson, startTime,
                                     Number(keyArr[0]), appData);
                    //dataObjArr.push({start_time: startTime, end_time: keyArr[0]});
                }
            }
            if (i < len - 1) {
                /* Entries other than first and last entry */
                formQueryByTimes(dataObjArr, tmpQJson, Number(keyArr[1]),
                                 Number(considerObjs[i + 1].split(":")[0]), appData);
                //dataObjArr.push({start_time: keyArr[1],
                                //end_time: considerObjs[i + 1].split(":")[0]});
            }
            if (i == len - 1) {
                /* Last Entry */
                if (endTime > Number(keyArr[1])) {
                    formQueryByTimes(dataObjArr, tmpQJson, Number(keyArr[1]), endTime,
                                     appData);
                    //dataObjArr.push({start_time: keyArr[1], end_time: endTime});
                }
            }
        }
    }
    return {dataObjArr: dataObjArr, keys: considerObjs};
}

function mergeQueryDataAndSend (hash, keyObjs, queryJSON, appData, callback)
{
    var startTime       = queryJSON.start_time;
    var endTime         = queryJSON.end_time;
    var newStartTime    = startTime;
    var newEndTime      = endTime;
    var considerObjs    = [];

    /* First check we have all the data in cache */
    var queries = getCachedGapQueries(queryJSON, keyObjs, appData);
    var keys = queries.keys;
    /* Check if we have to adjust any keys */
    if (null != queries.foundKey) {
        var finalResp = [];
        var data = keyObjs[queries.foundKey];
        data = JSON.parse(data);
        var len = data.value.length;
        for (var i = 0; i < len; i++) {
            var T = data.value[i]["T="];///1000;
            if ((T >= startTime) && (T <= endTime)) {
                finalResp.push(data.value[i]);
            }
        }
        callback(null, {value: finalResp});
        return;
    }
    async.map(queries.dataObjArr,
              commonUtils.getAPIServerResponse(opApiServer.apiPost, true),
              function(error, data) {
        mergeServerRespWithCachedData(hash, data, queries, keyObjs,
                                      startTime, endTime,
                                      function(error, data) {
            callback(error, data);
        });
    });
}

function mergeServerRespWithCachedData (hash, serverResps, queriesObj, cachedKeyData,
                                        startTime, endTime, callback)
{
    var newStartTime    = startTime;
    var newEndTime      = endTime;
    var keys = queriesObj.keys;
    var keysLen = keys.length;
    if (keysLen > 0) {
        var startKey = keys[0];
        var startKeyArr = startKey.split(":");
        var startKeyStartTime   = Number(startKeyArr[0]);
        var startKeyEndTime     = Number(startKeyArr[1]);

        var endKey = keys[keys.length - 1];
        var endKeyArr = endKey.split(":");
        var endKeyStartTime     = Number(endKeyArr[0]);
        var endKeyEndTime       = Number(endKeyArr[1]);

        /* Now check what position we have the keys */
        if (startTime < startKeyStartTime) {
            newStartTime = startTime;
        } else {
            newStartTime = startKeyStartTime;
        }
        if (endTime > endKeyEndTime) {
            newEndTime = endTime;
        } else {
            newEndTime = endKeyEndTime;
        }
    }
    /* Now set the new hash key and delete the intermediate hash keys */
    //var key = newStartTime.toString() + ":" + newEndTime.toString();
    var redisClient = process.mainModule.exports.redisClient;
    var keys = queriesObj.keys;
    var keysLen = keys.length;
    var dataObjArr = queriesObj.dataObjArr;
    var dataObjArrLen = dataObjArr.length;
    /* dataObjArr contains the queries to be sent to OpServer */
    /* serverResps contains the responses of those quries in dataObjArr */
    /* keys is our main interest, we need to merge those and create a single one
     */
    /* cachedKeyData contains the hashKey/value pair as found in redis */
    var resultJSON = {value: []};
    for (var i = 0; i < dataObjArrLen; i++) {
        var qStartTime =
            commonUtils.getValueByJsonPath(dataObjArr[i], "data;start_time",
                                           null);
        var qEndTime =
            commonUtils.getValueByJsonPath(dataObjArr[i], "data;end_time",
                                           null);
        for (var j = 0; j < keysLen; j++) {
            var key = keys[j];
            var keysArr = key.split(":");
            var keyStartTime = Number(keysArr[0]);
            var keyEndTime  = Number(keysArr[1]);
            if ((qStartTime < keyStartTime) && (qEndTime == keyEndTime)) {
                /* Add this dataObjArr[i] == serverResps[i] to the final output
                 * */
                /* First entry */
                var cachedData = JSON.parse(cachedKeyData[key]);
                resultJSON = {value:
                    serverResps[i]['value'].concat(cachedData.value)};
            } else if (qStartTime == keyEndTime) {
                var cachedData = JSON.parse(cachedKeyData[key]);
                resultJSON = {value:
                    resultJSON.value.concat(cachedData.value.concat(serverResps[i]['value']))};
            } else if (qEndTime == keyStartTime) {
                var cachedData = JSON.parse(cachedKeyData[key]);
                resultJSON = {value:
                    resultJSON.value.concat(serverResps[i]['value'].concat(cachedData.value))};
            } else {
                console.log("Query: Condition does not satisfy:", qStartTime,
                            keyStartTime, qEndTime, keyEndTime);
            }
        }
    }
    var respToSend = [];
    /* Now send the responses which we are interested */
    var cnt = resultJSON.value.length;
    for (var i = 0; i < cnt; i++) {
        var T = resultJSON.value[i]["T="];
        if ((T >= startTime) && (T <= endTime)) {
            respToSend.push(resultJSON.value[i]);
        }
    }
    respToSend.sort(function(a, b) {
        return ((a["T="] > b["T="]) - (a["T="] < b["T="]));
    });
    callback(null, {value: respToSend});
    /* Merging data is done */
    /* Now delete the intermediate keys which we just merged */
    for (var i = 0; i < keysLen; i++) {
        redisClient.hdel(hash, keys[i]);
    }
    /* Now set the new key */
    var newKey = newStartTime + ":" + newEndTime;
    redisClient.hset(hash, newKey, JSON.stringify(resultJSON));
}

var qeTableJSON = {
    "MessageTable": {
        "select": "MessageTS, Type, Source, ModuleId, Messagetype, " +
            "Xmlmessage, Level, Category",
        "from_time_utc": "now-10m",
        "to_time_utc": "now",
        "level": 4,
        "sort_fields": "MessageTS",
        "sort": "desc"

    }
};

exports.createTimeQueryJsonObj = createTimeQueryJsonObj;
exports.createTimeQueryJsonObjByServerTimeFlag =
    createTimeQueryJsonObjByServerTimeFlag;
exports.executeQueryString = executeQueryString;
exports.buildUnderlayQuery = buildUnderlayQuery;
exports.createTimeQueryJsonObjByAppData = createTimeQueryJsonObjByAppData;
exports.formatQEUIQuery = formatQEUIQuery;
exports.createTimeObjByAppData = createTimeObjByAppData;
exports.formQEQueryData = formQEQueryData;
exports.getTimeGranByTimeSlice = getTimeGranByTimeSlice;
exports.getQueryDataByCache = getQueryDataByCache;


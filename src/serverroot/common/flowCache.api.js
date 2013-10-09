/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

/**
 * flowCache.api.js
 *      This file contains caching infra for flow-series data
 */

var assert = require('assert')
	, rest = require('./rest.api')
	, config = require('../../../config/config.global.js')
	, commonUtils = require('../utils/common.utils')
	, global = require('./global')
	, util = require('util')
	, logutils = require('../utils/log.utils')
    , nwMonUtils = require('./nwMon.utils')
	, messages = require('./messages');

if (!module.parent) {
	logutils.logger.warn(util.format(messages.warn.invalid_mod_call,
		module.filename));
	process.exit(1);
}

var FLOW_SERIES_CACHE_EXPIRY_TIME = 10 * 60; /* 10 Minutes */

// Instantiate config and ops server access objects.
opServer = rest.getAPIServer({apiName:global.label.OPS_API_SERVER,
	server:config.analytics.server_ip,
	port:config.analytics.server_port });

flowCache = module.exports;

function getFlowSeriesDataByAPIServer (context, appData, timeObj, srcQueryJSON,
                                       destQueryJSON, callback)
{
    var resultJSON = {};
    var timeGran = timeObj['timeGran'];
    /* No Need to change the time granularity params (T=X), directly send this
     * query 
     */
    nwMonUtils.getStatDataByQueryJSON(srcQueryJSON, destQueryJSON, function(err, data) {
        if ((data != null) && data.length) {
            //logutils.logger.debug("Getting Query Response as:" +
             //                     JSON.stringify(data));
            resultJSON = parseFlowSeriesData(data, timeObj);
            /* Cache saving should be done in caller */
        } 
        callback(err, resultJSON);
    });
}

function sortFlowSeriesDataByTS (a, b)
{
    return (parseInt(a['time']) - parseInt(b['time']));
}

function fillFlowSeriesData (resultJSON, i, j, inStat, outStat)
{
    if (null != inStat) {
        resultJSON['time'] = inStat[i]['T'];
    } else {
        /* We have either inStat/outStat/both valid */
        resultJSON['time'] = outStat[j]['T'];
    }
    try {
        resultJSON['outPkts'] = ((j == -1) ? 0 :
                                    outStat[j]['sum(packets)']);
    } catch(e) {
        resultJSON['outPkts'] = 0;
    }   
    try {
        resultJSON['outBytes'] = ((j == -1) ? 0 :
                                     outStat[j]['sum(bytes)']);
    } catch(e) {
        resultJSON['outBytes'] = 0;
    }   
    try {
        resultJSON['inPkts'] = ((i == -1) ? 0 :
                                inStat[i]['sum(packets)']);
    } catch(e) {
        resultJSON['inPkts'] = 0;
    }   
    try {
        resultJSON['inBytes'] = ((i == -1) ? 0 :
                                 inStat[i]['sum(bytes)']);
    } catch(e) {
        resultJSON['inBytes'] = 0;
    }
    resultJSON['totalPkts'] = parseInt(resultJSON['inPkts']) +
        parseInt(resultJSON['outPkts']);
    resultJSON['totalBytes'] = parseInt(resultJSON['inBytes']) +
        parseInt(resultJSON['outBytes']);
}

function parseFlowSeriesData (data, timeObj)
{
    var index = 0;
    var outStat;
    var outStatLen;
    var inStat;
    var inStatLen;
    var resultJSON = [];
    var results = {};
    var inStatTime = 0;
    var outStatTime = 0;
    try {
        outStat = data[0]['value'];
        outStatLen = outStat.length;
        len = outStatLen;
    } catch(e) {
        outStatLen = 0;
    }
    try {
        inStat = data[1]['value'];
        inStatLen = inStat.length;
    } catch(e) {
        inStatLen = 0;
    }
    for (var i = 0; i < inStatLen; i++) {
        resultJSON[i] = {};
        inStatTime = parseInt(inStat[i]['T']);
        for (j = 0; j < outStatLen; j++) {
            if (inStatTime == parseInt(outStat[j]['T'])) {
                break;
            }
        }
        if ((j == outStatLen) && (outStatLen != 0)) {
            /* No Match in outStat */
            fillFlowSeriesData(resultJSON[i], i, -1, inStat, null);
        } else {
            /* Match found */
            fillFlowSeriesData(resultJSON[i], i, j, inStat, outStat);
        }
    }
    index = i;
    for (i = 0; i < outStatLen; i++) {
        for (j = 0; j < inStatLen; j++) {
            /* Check if we have any match, if yes then already we have included
             * earlier step, so do not include that entry
             */
            outStatTime = parseInt(outStat[i]['T']);
            if (outStatTime == parseInt(inStat[j]['T'])) {
                break;
            }
        }
        if (j == inStatLen) {
            resultJSON[index] = {};
            /* We did not find this entry, so add now */
            fillFlowSeriesData(resultJSON[index], -1, i,
                               null, outStat);
            index++;
        }
    }
    /* Now Sort the data */
    var totCnt = resultJSON.length;
    resultJSON.sort(sortFlowSeriesDataByTS);
    results['summary'] = {};
    results['summary']['start_time'] = timeObj['start_time'];
    results['summary']['end_time'] = timeObj['end_time'];
    results['summary']['timeGran_microsecs'] =
        Math.floor(parseInt(timeObj['timeGran'])) * global.MILLISEC_IN_SEC *
        global.MICROSECS_IN_MILL;
    results['flow-series'] = resultJSON;
    return results;
}

function updateFlowSeriesQueryTimeGran (query, timeGran)
{
    var selectQuery = query['select_fields'];
    var len = selectQuery.length;
    for (var i = 0; i < len; i++) {
        var pos = selectQuery.indexOf('T=');
        if (pos != -1) {
            break;
        }
    }
    if (i == len) {
        assert(0);
    }
    query['select_fields'][i] = 'T=' + timeGran;
}

function updateFlowSeriesQueryStartEndTime (query, startTime, endTime)
{
    query['start_time'] = startTime;
    query['end_time'] = endTime;
}

function updateFlowSeriesDataByCache (cachedData, deltaData, reqTimeObj)
{
    var cachedFlowData = cachedData['flow-series'];
    var cachedCount = cachedFlowData.length;
    var deltaLen = 0;
    try {
        var deltaFlowData = deltaData['flow-series'];
        deltaLen = deltaFlowData.length;
    } catch(e) {
        /* Add empty JSON */
        deltaFlowData = {};
        deltaFlowData['summary'] = {};
        deltaFlowData['flow-series'] = [];
        deltaLen = 0;
    }
    
    var reqStartTime = reqTimeObj['start_time'];
    var reqEndTime = reqTimeObj['end_time'];

    /* Now add cached and delta flow data, then discard all the data which are
     * older than reqStartTime, then update the cache 
     */
    
    var tempResultJSON = commonUtils.cloneObj(cachedData);
    for (var i = 0; i < deltaLen; i++) {
        tempResultJSON['flow-series'][cachedCount + i] = deltaFlowData[i];
    }
    
    var total = cachedCount + deltaLen;
    var resultJSON = {};
    resultJSON['summary'] = {};
    resultJSON['summary'] = tempResultJSON['summary'];
    resultJSON['flow-series'] = [];
    /* Now scan whole list */
    var j = 0;
    var flowTime = 0;
    for (i = 0; i < total; i++) {
        flowTime = parseInt(tempResultJSON['flow-series'][i]['time']);
        if ((flowTime >= parseInt(reqStartTime)) && 
            (flowTime <= parseInt(reqEndTime))) {
            resultJSON['flow-series'][j] = tempResultJSON['flow-series'][i];
            j++;
        } else {
            continue;
        }
    }
    try {
        resultJSON['summary']['start_time'] = reqStartTime;
        var timeDiff = resultJSON['flow-series'][0]['time'] -
            resultJSON['summary']['start_time'];
        var timeDrift = 
            Math.floor(timeDiff / resultJSON['summary']['timeGran_microsecs']);
        timeDrift = (!timeDrift) ? 1 : timeDrift;
        resultJSON['summary']['start_time'] =
            resultJSON['flow-series'][0]['time'] - timeDrift *
            resultJSON['summary']['timeGran_microsecs'];
    } catch(e) {
        resultJSON['summary']['start_time'] = reqStartTime;
    }
    resultJSON['summary']['end_time'] = reqEndTime;
    return resultJSON;
}

function printFlowSeriesData (data)
{
    return;
    var cnt = 0;
    try {
        cnt = data['flow-series'].length;
        for (var i = 0; i < cnt; i++) {
            var diff = (data['flow-series'][i]['time'] -
                        data['flow-series'][0]['time']) /
                data['summary']['timeGran_microsecs'];
            if (i != 0) {
                var diff1 = (data['flow-series'][i]['time'] -
                             data['flow-series'][i-1]['time']) /
                    data['summary']['timeGran_microsecs'];
            } else {
                diff1 = 0;
            }
            logutils.logger.debug(i + 'th Entry: ' + new
                                  Date((parseInt(data['flow-series'][i]['time']))/1000)
                                  + ' ' + data['flow-series'][i]['time'] + ' ' +
                                  diff + ' ' + diff1);
        }
    } catch(e) {
    }
    logutils.logger.debug("Total entries:", cnt);
}

function getFlowSeriesDataByCache (context, appData, cachedData, srcQueryJSON,
                                   destQueryJSON, callback)
{
    var resultJSON = {};
    var relStartTime = 0;
    var relEndTime = 0;
    try {
        var cachedFlowSeriesLen = cachedData['flow-series'].length;
        var cachedStartTime = cachedData['flow-series'][0]['time'];
        var cachedEndTime = cachedData['flow-series'][cachedFlowSeriesLen - 1]['time'];
    } catch(e) {
        cachedStartTime = 0;
        cachedEndTime = 0;
    }
    var timeObj = nwMonUtils.createTimeObjByAppData(appData);
    var timeGran = timeObj['timeGran'];

    var reqStartTime = timeObj['start_time'];
    var reqEndTime = timeObj['end_time'];
    try {
        relStartTime = parseInt(appData['relStartTime']) * 1000;
        relEndTime = parseInt(appData['relEndTime']) * 1000;
    } catch(e) {
    }

    timeObj['timeGran'] = timeGran;

    /* Now check how delayed our cache is */
    if (cachedEndTime < reqStartTime) {
        getFlowSeriesDataByTimeObj(context, appData, timeObj, srcQueryJSON,
                                   destQueryJSON, function(err, reqData) {
            callback(err, reqData);
            saveFlowSeriesDataInCache(context, appData, reqData,
                                      function(err, resultJSON) {
                logutils.logger.debug("Data save Done!!!");
            });
        });
    } else {
        /* We do not need to check with cacheStartTime, as we MUST not have
         * any request with reqStartTime is less than cacheStartTime 
         */
        if ((reqStartTime < cachedEndTime) && (reqEndTime < cachedEndTime)) {
            /* We have all data in cache, so get it from cache it self */
            resultJSON = updateFlowSeriesDataByCache(cachedData, null,
                                                     timeObj);
            callback(null, resultJSON);
            printFlowSeriesData(resultJSON);
        } else {
            /* Now calculate the delta */
            timeObj['start_time'] = cachedEndTime;
            timeObj['end_time'] = reqEndTime;//parseInt(appData['relEndTime']) * 1000;
            getFlowSeriesDataByTimeObj(context, appData, timeObj, srcQueryJSON,
                                       destQueryJSON, function(err, resultJSON) {
                /* Again update with requested data */
                timeObj['start_time'] = reqStartTime;
                timeObj['end_time'] = reqEndTime;
                reqData = updateFlowSeriesDataByCache(cachedData, resultJSON,
                                                      timeObj);
                callback(err, reqData);
                if (null == appData['relStartTime']) {
                    /* Our updation is done */
                    saveFlowSeriesDataInCache(context, appData, reqData,
                                              function(err, resultJSON) {
                        printFlowSeriesData(resultJSON);
                    });
                    return;
                }
                /* Now check the delta time from reqEndTime and relEndTime */
                timeObj['start_time'] = relStartTime;
                timeObj['end_time'] = relEndTime;
                var fsData = updateFlowSeriesDataByCache(cachedData,
                                                          resultJSON, timeObj);
                try {
                    var cnt = resultJSON['flow-series'].length;
                    timeObj['start_time'] = 
                        resultJSON['flow-series'][cnt - 1]['time'];
                    timeObj['end_time'] = relEndTime;
                    if ((timeObj['start_time'] - timeObj['end_time']) >=
                        appData['timeGran'] * global.MILLISEC_IN_SEC *
                        global.MICROSECS_IN_MILL) {
                        getFlowSeriesDataByTimeObj(context, appData, timeObj,
                                                   srcQueryJSON, destQueryJSON, 
                                                   function(err, resultJSON) {
                            timeObj['start_time'] = relStartTime;
                            timeObj['end_time'] = relEndTime;
                            var fsData = updateFlowSeriesDataByCache(fsData,
                                                                     resultJSON,
                                                                     timeObj);
                        })
                    }
                    saveFlowSeriesDataInCache(context, appData, fsData,
                                              function(err, resultJSON) {
                        logutils.logger.debug("Data save Done!!!");
                        printFlowSeriesData(resultJSON);
                    });
                } catch(e) {
                }
            });
        }
    }
}

function getFlowSeriesRedisKey (context, appData) 
{
    var timeObj = nwMonUtils.createTimeObjByAppData(appData);
    var redisKey = "q:flow-series";
    var timeGran = timeObj['timeGran'];

    if (null != appData['relStartTime']) {
        assert(appData['relEndTime']);
        redisKey += global.ZWQ_MSG_SEPERATOR + 'startTime' +
            global.ZWQ_MSG_SEPERATOR + 'endTime';
    }

    if ('vn' == context) {
       redisKey += global.ZWQ_MSG_SEPERATOR + context + global.ZWQ_MSG_SEPERATOR
           + appData['srcVN'] + global.ZWQ_MSG_SEPERATOR + timeGran;
    } else if ('conn-vn' == context) {
        redisKey += global.ZWQ_MSG_SEPERATOR + context +
            global.ZWQ_MSG_SEPERATOR + appData['srcVN'] +
            global.ZWQ_MSG_SEPERATOR + appData['dstVN'] +
            global.ZWQ_MSG_SEPERATOR + timeGran;
    } else if ('port' == context) {
        redisKey += global.ZWQ_MSG_SEPERATOR + context + 
            global.ZWQ_MSG_SEPERATOR + appData['fqName'] +
            global.ZWQ_MSG_SEPERATOR + appData['port'] +
            global.ZWQ_MSG_SEPERATOR + appData['protocol'] +
            global.ZWQ_MSG_SEPERATOR + timeGran;
    } else if ('peer' == context) {
        redisKey += global.ZWQ_MSG_SEPERATOR + context +
            global.ZWQ_MSG_SEPERATOR + appData['fqName'] +
            global.ZWQ_MSG_SEPERATOR + appData['ip'] +
            global.ZWQ_MSG_SEPERATOR + timeGran;
    } else if ('vm' == context) {
        redisKey += global.ZWQ_MSG_SEPERATOR + context +
            global.ZWQ_MSG_SEPERATOR + appData['vnName'] +
            global.ZWQ_MSG_SEPERATOR + appData['ip'] +
            global.ZWQ_MSG_SEPERATOR + timeGran;
    }
    
    return redisKey;
}

function saveFlowSeriesDataInCache (context, appData, flowData, callback)
{
    if (null == flowData) {
        callback(null, null);
    } else {
        var redisKey = getFlowSeriesRedisKey(context, appData);
        redisPub.redisPubClient.setex(redisKey, FLOW_SERIES_CACHE_EXPIRY_TIME, 
                                      JSON.stringify(flowData),
                                    function(err) {
            callback(null, flowData);
        });
    }
}

function getFlowSeriesDataByTimeObj (context, appData, timeObj, srcQueryJSON,
                                     destQueryJSON, callback)
{
    updateFlowSeriesQueryStartEndTime(srcQueryJSON, timeObj['start_time'],
                                      timeObj['end_time']);
    updateFlowSeriesQueryStartEndTime(destQueryJSON, timeObj['start_time'],
                                      timeObj['end_time']);
    /* Update timeObj with delta time */
    getFlowSeriesDataByAPIServer(context, appData, timeObj, srcQueryJSON,
                                 destQueryJSON, function(err, resultJSON) {
        callback(err, resultJSON);
    }); 
}

function sendFlowSeriesDataByStartEndTime (context, appData, srcQueryJSON,
                                           destQueryJSON, callback)
{
    var timeObj = nwMonUtils.createTimeObjByAppData(appData);
    var relTimeObj = {};
    var relStartTime = appData['relStartTime'];
    var relEndTime = appData['relEndTime'];

    relTimeObj = 
        nwMonUtils.createTimeQueryObjByStartEndTime(relStartTime, relEndTime);
    relTimeObj['timeGran'] = parseInt(appData['timeGran']);

    getFlowSeriesDataByAPIServer(context, appData, timeObj, srcQueryJSON,
                                 destQueryJSON, function(err, data) {
        callback(err, data);
        /* We are done sending the data, now retrieve the entire data and save
         * cache
         */
        getFlowSeriesDataByTimeObj(context, appData, relTimeObj, srcQueryJSON,
                                   destQueryJSON, function(err, data) {
            saveFlowSeriesDataInCache(context, appData, data, 
                                      function(err, data) {
                printFlowSeriesData(data);
            });
        });
    });
}

function sendFlowSeriesDataByCache (appData, cacheData, callback)
{
    var reqStartTime = appData['startTime'];
    var reqEndTime = appData['endTime'];
    var fsData = {};
    var j = 0;

    fsData['flow-series'] = [];

    var fsCnt = cacheData['flow-series'].length;
    for (var i = 0; i < fsCnt; i++) {
        cachedTime = parseInt(cacheData['flow-series'][i]['time']);
        if ((cachedTime >= reqStartTime) && (cachedTime <= reqEndTime)) {
            fsData['flow-series'][j++] = cacheData['flow-series'][i];
        }
    }
    fsData['summary'] = {};
    try {
        var timeDiff = fsData['flow-series'][0]['time'] - reqStartTime;
        var timeDrift =
            Math.floor(timeDiff / fsData['summary']['timeGran_microsecs']);
        timeDrift = (!timeDrift) ? 1 : timeDrift;
        fsData['summary']['start_time'] =
            fsData['flow-series'][0]['time'] - timeDrift *
            fsData['summary']['timeGran_microsecs'];
    } catch(e) {
        fsData['summary']['start_time'] = reqStartTime;
    }
    fsData['summary']['end_time'] = reqEndTime;
    callback(null, fsData);
}

function getFlowSeriesDataByStartEndTime (context, appData, srcQueryJSON,
                                          destQueryJSON, callback)
{
    var timeObj = nwMonUtils.createTimeObjByAppData(appData);
    var redisKey = getFlowSeriesRedisKey(context, appData);

    /* Redis Key Format for the request with minsSince
       flow-series@vn@default-domain:admin:back-end@7@xxx@yyyy
     */
    redisPub.redisPubClient.get(redisKey, function(err, data) {
        if (err || (null == data)) {
            /* Send the exact request, do not store the data, we should have
             * created the entry when we will get the request with minsSince
             */
            sendFlowSeriesDataByStartEndTime(context, appData, srcQueryJSON,
                                             destQueryJSON, callback);
            return;
        }
        //sendFlowSeriesDataByCache(appData, JSON.parse(data), callback);
        getFlowSeriesDataByCache(context, appData, JSON.parse(data), srcQueryJSON,
                                 destQueryJSON, callback);
    });
}

function getFlowSeriesData (context, appData, srcQueryJSON, destQueryJSON,
                            callback) 
{
    var timeObj = nwMonUtils.createTimeObjByAppData(appData);
    var redisKey = getFlowSeriesRedisKey(context, appData);
    if (appData['relStartTime'] != null) {
        assert(appData['relEndTime']);
        appData['relStartTime'] = parseInt(appData['relStartTime']);
        appData['relEndTime'] = parseInt(appData['relEndTime']);
    }

    updateFlowSeriesQueryStartEndTime(srcQueryJSON, timeObj['start_time'],
                                      timeObj['end_time']);
    updateFlowSeriesQueryStartEndTime(destQueryJSON, timeObj['start_time'],
                                      timeObj['end_time']);
    /* Check if the request consists of startTime and endTime */
    if (appData['relStartTime'] != null) {
        getFlowSeriesDataByStartEndTime(context, appData, srcQueryJSON,
                                        destQueryJSON, callback);
        return;
    }
    /* First check if we have entry for this */
    redisPub.redisPubClient.get(redisKey, function(err, jsonData) {
        jsonData = null;
        if (err || (null == jsonData)) {
            /* No Cache, so create fresh entry */
            getFlowSeriesDataByAPIServer(context, appData, timeObj, srcQueryJSON,
                                         destQueryJSON, function (err, data) {
                /* Save the data in Cache */
                saveFlowSeriesDataInCache(context, appData, data, 
                                          function(err, flowData) {
                    callback(err, flowData);
                });
            });
        } else {
            /* Now check the time when we have the cache */
            getFlowSeriesDataByCache(context, appData, JSON.parse(jsonData), srcQueryJSON,
                                     destQueryJSON, callback);
        } 
    });
}

exports.getFlowSeriesData = getFlowSeriesData;
exports.parseFlowSeriesData = parseFlowSeriesData;


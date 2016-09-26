/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/**
 * API for communication with Query Engine.
 */

var assert = require("assert"), util = require("util"),
    logutils = require(process.mainModule.exports.corePath + "/src/serverroot/utils/log.utils"),
    commonUtils = require(process.mainModule.exports.corePath + "/src/serverroot/utils/common.utils"),
    messages = require(process.mainModule.exports.corePath + "/src/serverroot/common/messages"),
    global = require(process.mainModule.exports.corePath + "/src/serverroot/common/global"),
    opApiServer = require(process.mainModule.exports.corePath + "/src/serverroot/common/opServer.api"),
    redisUtils = require(process.mainModule.exports.corePath + "/src/serverroot/utils/redis.utils"),
    config = process.mainModule.exports.config,
    redisReadStream = require("redis-rstream"),
    Worker = require("webworker-threads").Worker,
    crypto = require("crypto"),
    _ = require("lodash");

var redisServerPort = (config.redis_server_port) ? config.redis_server_port : global.DFLT_REDIS_SERVER_PORT,
    redisServerIP = (config.redis_server_ip) ? config.redis_server_ip : global.DFLT_REDIS_SERVER_IP,
    redisClient = redisUtils.createRedisClient(redisServerPort, redisServerIP, global.QE_DFLT_REDIS_DB);

if (!module.parent) {
    logutils.logger.warn(util.format(messages.warn.invalid_mod_call, module.filename));
    process.exit(1);
}

function runGETQuery(req, res, appData) {
    var reqQuery = req.query;
    runQuery(req, res, reqQuery, appData);
}

function runPOSTQuery(req, res, appData) {
    var queryReqObj = req.body;
    runQuery(req, res, queryReqObj, appData);
}

// Handle request to get list of all tables.
function getTables(req, res, appData) {
    var opsUrl = global.GET_TABLES_URL;
    sendCachedJSON4Url(opsUrl, res, 3600, appData);
}

// Handle request to get table schema.
function getTableSchema(req, res, appData) {
    var opsUrl = global.GET_TABLE_INFO_URL + "/" + req.param("tableName") + "/schema";
    sendCachedJSON4Url(opsUrl, res, 3600, appData);
}

// Handle request to get columns values.
function getTableColumnValues(req, res, appData) {
    var reqQueryObj = req.body,
        tableName = reqQueryObj.table_name,
        selectFields = reqQueryObj.select,
        where = reqQueryObj.where,
        objectQuery, startTime, endTime, queryOptions;

    startTime = reqQueryObj.fromTimeUTC;
    endTime = reqQueryObj.toTimeUTC;

    if (_.isNil(tableName)) {
        commonUtils.handleJSONResponse(null, res, {});
    } else {
        objectQuery = { "start_time": startTime, "end_time": endTime, "select_fields": selectFields, "table": tableName, "where": where };
        setMicroTimeRange(objectQuery, startTime, endTime);
        queryOptions = { queryId: null, async: false, status: "run", queryJSON: objectQuery, errorMessage: "" };

        executeQuery(res, queryOptions, appData);
    }
}

// Handle request to get query queue.
function getQueryQueue(req, res) {
    var queryQueue = req.param("queryQueue"),
        responseArray = [];

    redisClient.hvals(queryQueue, function(error, results) {
        if (error) {
            logutils.logger.error(error.stack);
            commonUtils.handleJSONResponse(error, res, null);
        } else {
            for (var i = 0; i < results.length; i++) {
                responseArray[i] = JSON.parse(results[i]);
            }
            commonUtils.handleJSONResponse(error, res, responseArray);
        }
    });
}

// Handle request to get unique flow classes for a flow-series query.
function getChartGroups(req, res) {
    var queryId = req.param("queryId");

    redisClient.get(queryId + ":chartgroups", function(error, results) {
        if (error) {
            logutils.logger.error(error.stack);
            commonUtils.handleJSONResponse(error, res, null);
        } else {
            commonUtils.handleJSONResponse(error, res, JSON.parse(results));
        }
    });
}

// Handle request to get chart data for a flow-series query.
function getChartData(req, res) {
    var queryId = req.param("queryId");

    redisClient.get(queryId + ":chartdata", function(error, results) {
        if (error) {
            logutils.logger.error(error.stack);
            commonUtils.handleJSONResponse(error, res, null);
        } else {
            commonUtils.handleJSONResponse(error, res, JSON.parse(results));
        }
    });
}

// Handle request to delete redis cache for given query ids.
function deleteQueryCache4Ids(req, res) {
    var queryIds = req.body.queryIds,
        queryQueue = req.body.queryQueue;

    for (var i = 0; i < queryIds.length; i++) {
        redisClient.hdel(queryQueue, queryIds[i]);
        redisClient.keys(queryIds[i] + "*", function(error, keysArray) {
            if (!error && keysArray.length > 0) {
                redisClient.del(keysArray, function(error) {
                    if (error) {
                        logutils.logger.error("Error in delete cache of query key: " + error);
                    }
                });
            } else {
                logutils.logger.error("Error in delete cache of query id: " + error);
            }
        });
    }
    commonUtils.handleJSONResponse(null, res, {});
}

// Handle request to delete redis cache for QE.
function deleteQueryCache4Queue(req, res) {
    var queryQueue = req.body.queryQueue;

    redisClient.hkeys(queryQueue, function(error) {
        if (!error) {
            redisClient.del(queryQueue, function(error) {
                if (error) {
                    logutils.logger.error("Error in delete cache of query queue: " + error);
                    commonUtils.handleJSONResponse(error, res, null);
                } else {
                    logutils.logger.debug("Redis Query Queue " + queryQueue + " flush complete.");
                    commonUtils.handleJSONResponse(null, res, { message: "Redis Query Queue " + queryQueue + " flush complete." });
                }
            });
        } else {
            commonUtils.handleJSONResponse(error, res, null);
        }
    });
}

// Handle request to delete redis cache for QE.
function flushQueryCache(req, res) {
    redisClient.flushdb(function(error) {
        if (error) {
            logutils.logger.error("Redis QE FlushDB Error: " + error);
            commonUtils.handleJSONResponse(error, res, null);
        } else {
            logutils.logger.debug("Redis QE FlushDB Complete.");
            commonUtils.handleJSONResponse(null, res, { message: "Redis QE FlushDB Complete." });
        }
    });
}

// Handle request to get current time of server
function getCurrentTime(req, res) {
    var currentTime = new Date().getTime();

    commonUtils.handleJSONResponse(null, res, { currentTime: currentTime });
}

function runQuery(req, res, queryReqObj, appData, isGetQ) {
    var queryId = queryReqObj.queryId,
        chunk = queryReqObj.chunk,
        chunkSize = parseInt(queryReqObj.chunkSize),
        sort = queryReqObj.sort,
        cachedResultConfig;

    cachedResultConfig = { "queryId": queryId, "chunk": chunk, "sort": sort, "chunkSize": chunkSize, "toSort": true };

    logutils.logger.debug("Query Request: " + JSON.stringify(queryReqObj));

    if (!_.isNil(queryId)) {
        redisClient.exists(queryId + ":chunk1", function(err, exists) {
            if (err) {
                logutils.logger.error(err.stack);
                commonUtils.handleJSONResponse(err, res, null);
            } else if (exists === 1) {
                returnCachedQueryResult(res, cachedResultConfig, handleQueryResponse);
            } else {
                runNewQuery(req, res, queryId, queryReqObj, appData, isGetQ);
            }
        });
    } else {
        runNewQuery(req, res, null, queryReqObj, appData, isGetQ);
    }
}

function runNewQuery(req, res, queryId, queryReqObj, appData, isGetQ) {
    var queryOptions = getQueryOptions(queryReqObj),
        queryJSON = getQueryJSON4Table(queryReqObj);

    queryOptions.queryJSON = queryJSON;
    executeQuery(res, queryOptions, appData, isGetQ);
}

function getQueryOptions(queryReqObj) {
    var formModelAttrs = queryReqObj.formModelAttrs,
        tableType = formModelAttrs.table_type,
        queryId = queryReqObj.queryId,
        chunkSize = parseInt(queryReqObj.chunkSize),
        async = (!_.isNil(queryReqObj.async)) ? queryReqObj.async : false,
        queryOptions = {
            queryId: queryId,
            chunkSize: chunkSize,
            counter: 0,
            status: "run",
            async: async,
            count: 0,
            progress: 0,
            errorMessage: "",
            queryReqObj: queryReqObj,
            opsQueryId: "",
            tableType: tableType
        };

    if (tableType === "LOG" || tableType === "OBJECT") {
        queryOptions.queryQueue = "lqq";
    } else if (tableType === "FLOW") {
        queryOptions.queryQueue = "fqq";
    } else if (tableType === "STAT") {
        queryOptions.queryQueue = "sqq";
    }

    return queryOptions;
}

function executeQuery(res, queryOptions, appData, isGetQ) {
    var queryJSON = queryOptions.queryJSON,
        async = queryOptions.async,
        asyncHeader = { "Expect": "202-accepted" };

    logutils.logger.debug("Query sent to Opserver at " + new Date() + " " + JSON.stringify(queryJSON));
    queryOptions.startTime = new Date().getTime();
    opApiServer.apiPost(global.RUN_QUERY_URL, queryJSON, appData,
        function (error, jsonData) {
            if (error) {
                logutils.logger.error("Error Run Query: " + error.stack);
                commonUtils.handleJSONResponse(error, res, null);
            } else if (async) {
                initPollingConfig(queryOptions, queryJSON.start_time, queryJSON.end_time);
                queryOptions.url = jsonData.href;
                queryOptions.opsQueryId = parseOpsQueryIdFromUrl(jsonData.href);
                setTimeout(fetchQueryResults, 3000, res, jsonData, queryOptions, appData);
                queryOptions.intervalId = setInterval(fetchQueryResults, queryOptions.pollingInterval, res, jsonData, queryOptions, appData);
                queryOptions.timeoutId = setTimeout(stopFetchQueryResult, queryOptions.pollingTimeout, queryOptions);
            } else {
                processQueryResults(res, jsonData, queryOptions, isGetQ);
            }
        }, async ? asyncHeader : {});
}

function initPollingConfig(options, fromTime, toTime) {
    var timeRange = null;
    if (isNaN(fromTime) === true) {
        var str = "now-";
        /* Check if we have keyword now in that */
        var pos = fromTime.indexOf(str);
        if (pos !== -1) {
            var mins = fromTime.slice(pos + str.length);
            mins = mins.substr(0, mins.length - 1);
            mins = parseInt(mins);
        } else {
            assert(0);
        }
        timeRange = mins;
    } else {
        timeRange = (toTime - fromTime) / 60000000;
    }
    if (timeRange <= 720) {
        options.pollingInterval = 10000;
        options.maxCounter = 1;
        options.pollingTimeout = 3600000;
    } else if (timeRange > 720 && timeRange <= 1440) {
        options.pollingInterval = 30000;
        options.maxCounter = 1;
        options.pollingTimeout = 5400000;
    } else {
        options.pollingInterval = 60000;
        options.maxCounter = 1;
        options.pollingTimeout = 7200000;
    }
}

function fetchQueryResults(res, jsonData, queryOptions, appData) {
    var progress;

    opApiServer.apiGet(jsonData.href, appData, function(error, queryResults) {
        progress = queryResults.progress;
        queryOptions.counter += 1;
        if (error) {
            logutils.logger.error(error.stack);
            clearInterval(queryOptions.intervalId);
            clearTimeout(queryOptions.timeoutId);
            queryOptions.progress = progress;
            if (queryOptions.status === "run") {
                commonUtils.handleJSONResponse(error, res, null);
            } else if (queryOptions.status === "queued") {
                queryOptions.status = "error";
                queryOptions.errorMessage = error;
                updateQueryStatus(queryOptions);
            }
        } else if (progress === 100) {
            clearInterval(queryOptions.intervalId);
            clearTimeout(queryOptions.timeoutId);
            queryOptions.progress = progress;
            queryOptions.count = queryResults.chunks[0].count;
            jsonData.href = queryResults.chunks[0].href;

            if (queryOptions.count > 10000 && queryOptions.status !== "queued") {
                queryOptions.progress = progress;
                queryOptions.status = "queued";
                updateQueryStatus(queryOptions);
                commonUtils.handleJSONResponse(null, res, {status: "queued", data: []});
            }
            fetchQueryResults(res, jsonData, queryOptions, appData);
        } else if (_.isNil(progress) || progress === "undefined") {
            processQueryResults(res, queryResults, queryOptions);
                //TODO: Query should be marked complete
            queryOptions.endTime = new Date().getTime();
            queryOptions.status = "completed";
            updateQueryStatus(queryOptions);
        } else if (queryOptions.counter === queryOptions.maxCounter) {
            queryOptions.progress = progress;
            queryOptions.status = "queued";
            updateQueryStatus(queryOptions);
            commonUtils.handleJSONResponse(null, res, { status: "queued", data: [] });
        }
    });
}

function sendCachedJSON4Url(opsUrl, res, expireTime, appData) {
    redisClient.get(opsUrl, function(error, cachedJSONStr) {
        if (error || _.isNil(cachedJSONStr)) {
            opApiServer.apiGet(opsUrl, appData, function(error, jsonData) {
                if (!jsonData) {
                    jsonData = [];
                }
                redisClient.setex(opsUrl, expireTime, JSON.stringify(jsonData));
                commonUtils.handleJSONResponse(error, res, jsonData);
            });
        } else {
            commonUtils.handleJSONResponse(null, res, JSON.parse(cachedJSONStr));
        }
    });
}


function returnCachedQueryResult(res, queryOptions, callback) {
    var queryId = queryOptions.queryId,
        sort = queryOptions.sort,
        statusJSON;

    if (!_.isNil(sort)) {
        redisClient.get(queryId + ":sortStatus", function(error, result) {
            var sort = queryOptions.sort;
            if (error) {
                logutils.logger.error(error.stack);
            } else if (!_.isNil(result)) {
                statusJSON = JSON.parse(result);
                if (statusJSON[0].field === sort[0].field && statusJSON[0].dir === sort[0].dir) {
                    queryOptions.toSort = false;
                }
            }
            callback(res, queryOptions);
        });
    } else {
        queryOptions.toSort = false;
        callback(res, queryOptions);
    }
}

function handleQueryResponse(res, options) {
    var toSort = options.toSort,
        queryId = options.queryId,
        chunk = options.chunk,
        chunkSize = options.chunkSize,
        sort = options.sort;

    if (_.isNil(chunk) || toSort) {
        logutils.logger.error("QE received a query without any chunk information. Returning data for first chunk if available.");
        redisClient.exists(queryId + ":chunk1", function (err, exists) {
            if (exists) {
                chunk = 1;
            } else {
                commonUtils.handleJSONResponse(null, res, {data: [], total: 0});
            }
        });
    }
    redisClient.get(queryId + ":chunk" + chunk, function (error, result) {
        var resultJSON = result ? JSON.parse(result) : {data: [], total: 0};
        if (error) {
            logutils.logger.error(error.stack);
            commonUtils.handleJSONResponse(error, res, null);
        } else if (toSort) {
            sortJSON(resultJSON.data, sort, function () {
                var startIndex, endIndex, total, responseJSON;
                total = resultJSON.total;
                startIndex = (chunk - 1) * chunkSize;
                endIndex = (total < (startIndex + chunkSize)) ? total : (startIndex + chunkSize);
                responseJSON = resultJSON.data.slice(startIndex, endIndex);
                commonUtils.handleJSONResponse(null, res, {data: responseJSON, total: total, queryJSON: resultJSON.queryJSON});
                saveQueryResult2Redis(resultJSON.data, total, queryId, chunkSize, sort, resultJSON.queryJSON);
            });
        } else {
            commonUtils.handleJSONResponse(null, res, resultJSON);
        }
    });
}

function exportQueryResult(req, res) {
    var queryId = req.query.queryId;
    redisClient.exists(queryId, function(err, exists) {
        if (exists) {
            var stream = redisReadStream(redisClient, queryId);
            res.writeHead(global.HTTP_STATUS_RESP_OK, { "Content-Type": "application/json" });
            stream.on("error", function(err) {
                logutils.logger.error(err.stack);
                var errorJSON = { error: err.message };
                res.write(JSON.stringify(errorJSON));
                res.end();
            }).on("readable", function() {
                var data;
                while ((data = stream.read()) !== null) {
                    res.write(data);
                }
            }).on("end", function() {
                res.end();
            });
        } else {
            commonUtils.handleJSONResponse(null, res, { data: [], total: 0 });
        }
    });
}

function quickSortPartition(array, left, right, sort) {
    var sortField = sort[0].field,
        sortDir = sort[0].dir === "desc" ? 0 : 1,
        rightFieldValue = array[right - 1][sortField],
        min = left, max;

    for (max = left; max < right - 1; max += 1) {
        if (sortDir && array[max][sortField] <= rightFieldValue) {
            quickSortSwap(array, max, min);
            min += 1;
        } else if (!sortDir && array[max][sortField] >= rightFieldValue) {
            quickSortSwap(array, max, min);
            min += 1;
        }
    }
    quickSortSwap(array, min, right - 1);
    return min;
}

function quickSortSwap(array, max, min) {
    var temp = array[max];
    array[max] = array[min];
    array[min] = temp;
    return array;
}

function quickSort(array, left, right, sort, qsStatus) {
    if (left < right) {
        var p = quickSortPartition(array, left, right, sort);
        qsStatus.started++;
        process.nextTick(function() {
            quickSort(array, left, p, sort, qsStatus);
        });
        qsStatus.started++;
        process.nextTick(function() {
            quickSort(array, p + 1, right, sort, qsStatus);
        });
    }
    qsStatus.ended++;
}

function sortJSON(resultArray, sortParams, callback) {
    var qsStatus = { started: 1, ended: 0 },
        sortField = sortParams[0].field,
        sortBy = [{}];

    sortField = sortField.replace(/(["\[\]])/g, "");
    sortBy[0].field = sortField;
    sortBy[0].dir = sortParams[0].dir;
    quickSort(resultArray, 0, resultArray.length, sortBy, qsStatus);
    qsStatus.intervalId = setInterval(function(qsStatus, callback) {
        if (qsStatus.started === qsStatus.ended) {
            callback();
            clearInterval(qsStatus.intervalId);
        }
    }, 2000, qsStatus, callback);
}

function parseOpsQueryIdFromUrl(url) {
    var opsQueryId = "",
        urlArray;

    if (!_.isNil(url)) {
        urlArray = url.split("/");
        opsQueryId = urlArray[urlArray.length - 1];
    }

    return opsQueryId;
}

function stopFetchQueryResult(queryOptions) {
    clearInterval(queryOptions.intervalId);
    queryOptions.status = "timeout";
    updateQueryStatus(queryOptions);
}

function updateQueryStatus(queryOptions) {
    var queryStatus = {
        startTime: queryOptions.startTime,
        queryJSON: queryOptions.queryJSON,
        progress: queryOptions.progress,
        status: queryOptions.status,
        tableName: queryOptions.queryJSON.table,
        count: queryOptions.count,
        timeTaken: -1,
        errorMessage: queryOptions.errorMessage,
        queryReqObj: queryOptions.queryReqObj,
        opsQueryId: queryOptions.opsQueryId
    };

    if (queryOptions.progress === 100) {
        queryStatus.timeTaken = (queryOptions.endTime - queryStatus.startTime) / 1000;
    }

    redisClient.hmset(queryOptions.queryQueue, queryOptions.queryId, JSON.stringify(queryStatus));
}

function createStatRedisKey (req, query) {
    var urlReq = require("url"),
        urlParts = urlReq.parse(req.url),
        reqPayload = commonUtils.cloneObj(query),
        fromTime = commonUtils.getValueByJsonPath(reqPayload, "formModelAttrs;from_time", null);

    if (!_.isNil(fromTime)) {
        delete reqPayload.formModelAttrs.from_time;
    }

    var fromTimeUTC = commonUtils.getValueByJsonPath(reqPayload, "formModelAttrs;from_time_utc", null);
    if (!_.isNil(fromTimeUTC)) {
        delete reqPayload.formModelAttrs.from_time_utc;
    }

    var toTime = commonUtils.getValueByJsonPath(reqPayload, "formModelAttrs;to_time", null);
    if (!_.isNil(toTime)) {
        delete reqPayload.formModelAttrs.to_time;
    }

    var toTimeUTC = commonUtils.getValueByJsonPath(reqPayload, "formModelAttrs;to_time_utc", null);
    if (!_.isNil(toTimeUTC)) {
        delete reqPayload.formModelAttrs.to_time_utc;
    }

    reqPayload = commonUtils.doDeepSort(reqPayload);
    var md5Data = urlParts.pathname + JSON.stringify(reqPayload),
        redisKey = crypto.createHash("md5").update(md5Data).digest("hex");

    return redisKey;
}

function saveDataToRedisByReqPayload (res, resJson) {
    var reqPayload = res.req.body;

    if (global.HTTP_REQUEST_GET === res.req.method) {
        reqPayload = res.req.query;
    } else {
        reqPayload = res.req.body;
    }

    var redisKey = createStatRedisKey(res.req, reqPayload);

    redisClient.set(redisKey, JSON.stringify(resJson), function(error) {
        if (!_.isNil(error)) {
            logutils.logger.error("Redis key " + redisKey + " save error:" + error);
        }
    });
}

function getQueryData (req, res, appData) {
    var query;

    if (global.HTTP_REQUEST_GET === req.method) {
        query = req.query;
    } else {
        query = req.body;
    }

    if ((!_.isNil(req.query)) && ("forceRefresh" in req.query)) {
        runQuery(req, res, query, appData, true);
        return;
    }

    var redisKey = createStatRedisKey(req, query);
    redisClient.get(redisKey, function(error, data) {
        if (!_.isNil(error) || _.isNil(data)) {
            runQuery(req, res, query, appData, true);
            return;
        }
        commonUtils.handleJSONResponse(null, res, JSON.parse(data));
    });
}

function processQueryResults(res, queryResults, queryOptions, isGetQ) {
    var startDate = new Date(),
        startTime = startDate.getTime(),
        queryId = queryOptions.queryId,
        chunkSize = queryOptions.chunkSize,
        queryJSON = queryOptions.queryJSON,
        endDate = new Date(),
        table = queryJSON.table,
        tableType = queryOptions.tableType,
        endTime, total, responseJSON, resultJSON;

    endTime = endDate.getTime();
    resultJSON = (queryResults && !isEmptyObject(queryResults)) ? queryResults.value : [];
    logutils.logger.debug("Query results (" + resultJSON.length + " records) received from opserver at " + endDate + " in " + ((endTime - startTime) / 1000) + "secs. " + JSON.stringify(queryJSON));
    total = resultJSON.length;

    if (queryOptions.status === "run") {
        if (_.isNil(queryId) || total <= chunkSize) {
            responseJSON = resultJSON;
            chunkSize = total;
        } else {
            responseJSON = resultJSON.slice(0, chunkSize);
        }
        var resJson = {
            data: responseJSON,
            total: total,
            queryJSON: queryJSON,
            chunk: 1,
            chunkSize: chunkSize,
            serverSideChunking: true
        };
        commonUtils.handleJSONResponse(null, res, resJson);
        if (isGetQ === true) {
            saveDataToRedisByReqPayload(res, resJson);
        }
    }

    if(!_.isNil(queryId)) {
        var workerData = {};

        saveQueryResult2Redis(resultJSON, total, queryId, chunkSize, getSortStatus4Query(queryJSON), queryJSON);
        workerData.selectFields = queryJSON.select_fields;
        workerData.dataJSON = resultJSON;

        if (table === "FlowSeriesTable") {
            workerData.groupFieldName = "flow_class_id";
            workerData.timeFieldName = "T";
            saveData4Chart2Redis(queryId, workerData);
        } else if (tableType === "STAT") {
            workerData.groupFieldName = "CLASS(T=)";
            workerData.timeFieldName = "T=";
            saveData4Chart2Redis(queryId, workerData);
        }
    }
}

function saveQueryResult2Redis(resultData, total, queryId, chunkSize, sort, queryJSON) {
    var endRow;

    if (!_.isNil(sort)) {
        redisClient.set(queryId + ":sortStatus", JSON.stringify(sort));
    }

    if (total === 0) {
        redisClient.set(queryId + ":chunk1", JSON.stringify({ data: [], total: 0, queryJSON: queryJSON }));
        redisClient.set(queryId, JSON.stringify({ data: [], total: 0, queryJSON: queryJSON }));
    } else {
        for (var j = 0, k = 1; j < total; k++) {
            endRow = k * chunkSize;
            if (endRow > resultData.length) {
                endRow = resultData.length;
            }
            var spliceData = resultData.slice(j, endRow);

            var redisKey = queryId + ":chunk" + k,
                dataJSON = {
                    data: spliceData,
                    total: total,
                    queryJSON: queryJSON,
                    chunk: k,
                    chunkSize: chunkSize,
                    serverSideChunking: true
                },
                workerData = {
                    redisKey: redisKey,
                    dataJSON: dataJSON
                };

            writeData2Redis(workerData);

            j = endRow;
        }
        // TODO: Should we re-construct complete JSON from chunks?
        //writeData2Redis({redisKey: queryId, dataJSON: {data: resultData, total: total, queryJSON: queryJSON}});
    }
}

function writeData2Redis(workerData) {
    var redisKey = workerData.redisKey,
        dataJSON = workerData.dataJSON;

    var jsonWorker = new Worker(function () {
        this.onmessage = function (event) {
            var jsonData = event.data;
            try {
                var jsonStr = JSON.stringify(jsonData);
                postMessage({error: null, jsonStr: jsonStr});
            } catch (error) {
                postMessage({error: error});
            }
        };
    });

    jsonWorker.onmessage = function (event) {
        var workedData = event.data;
        if (_.isNil(workedData.error)) {
            var jsonStr = workedData.jsonStr;

            //logutils.logger.debug(redisKey + " start writing data to redis");
            redisClient.set(redisKey, jsonStr, function (rError) {
                if (rError) {
                    logutils.logger.error("QE Redis Write Error: " + rError);
                }
                //logutils.logger.debug(redisKey + " end writing data to redis");
            });
        } else {
            logutils.logger.error("QE JSON Stringify Error: " + workedData.error);
        }
    };

    jsonWorker.postMessage(dataJSON);
}

function getSortStatus4Query(queryJSON) {
    var sortFields, sortDirection, sortStatus;

    sortFields = queryJSON.sort_fields;
    sortDirection = queryJSON.sort;

    if (!_.isNil(sortFields) && sortFields.length > 0 && !_.isNil(sortDirection)) {
        sortStatus = [{ "field": sortFields[0], "dir": sortDirection === 2 ? "desc" : "asc" }];
    }
    return sortStatus;
}

function saveData4Chart2Redis(queryId, workerData) {
    var jsonWorker = new Worker(function () {
        this.onmessage = function (event) {
            var workerData = event.data,
                groupFieldName = workerData.groupFieldName,
                timeFieldName = workerData.timeFieldName,
                selectFields = workerData.selectFields,
                dataJSON = workerData.dataJSON;

            try {
                var resultData = {},
                    uniqueChartGroupArray = [],
                    charGroupArray = [],
                    result, i, k,
                    chartGroupId, chartGroup, secTime;

                if (selectFields.length !== 0) {
                    for (i = 0; i < dataJSON.length; i++) {
                        chartGroupId = dataJSON[i][groupFieldName];

                        if (uniqueChartGroupArray.indexOf(chartGroupId) === -1) {
                            chartGroup = getGroupRecord4Chart(dataJSON[i], groupFieldName);
                            uniqueChartGroupArray.push(chartGroupId);
                            charGroupArray.push(chartGroup);
                        }

                        secTime = Math.floor(dataJSON[i][timeFieldName] / 1000);
                        result = { "date": new Date(secTime) };
                        result[groupFieldName] = chartGroupId;

                        for (k = 0; k < selectFields.length; k++) {
                            result[selectFields[k]] = dataJSON[i][selectFields[k]];
                        }

                        // TODO: find out why can't use _.isNil here
                        if (resultData[chartGroupId] == null) { // eslint-disable-line
                            resultData[chartGroupId] = {};
                            resultData[chartGroupId][secTime] = result;
                        } else {
                            resultData[chartGroupId][secTime] = result;
                        }
                    }
                }
                postMessage({
                    error: null,
                    charGroupArray: charGroupArray,
                    resultData: resultData
                });
            } catch (error) {
                postMessage({
                    error: error
                });
            }

            function getGroupRecord4Chart(row, groupFieldName) {
                var groupRecord = {
                    chart_group_id: row[groupFieldName]
                };

                for (var fieldName in row) {
                    if (!isAggregateField(fieldName)) {
                        groupRecord[fieldName] = row[fieldName];
                    }
                }

                return groupRecord;
            }

            function isAggregateField(fieldName) {
                var fieldNameLower = fieldName.toLowerCase(),
                    isAggregate = false;

                var AGGREGATE_PREFIX_ARRAY = ["min(", "max(", "count(", "sum("];

                for (var i = 0; i < AGGREGATE_PREFIX_ARRAY.length; i++) {
                    if (fieldNameLower.indexOf(AGGREGATE_PREFIX_ARRAY[i]) !== -1) {
                        isAggregate = true;
                        break;
                    }
                }

                return isAggregate;
            }
        };
    });

    jsonWorker.onmessage = function (event) {
        var workedData = event.data;

        if (_.isNil(workedData.error)) {
            var charGroupArray = workedData.charGroupArray,
                resultData = workedData.resultData;

            writeData2Redis({ redisKey: queryId + ":chartgroups", dataJSON: charGroupArray });
            writeData2Redis({ redisKey: queryId + ":chartdata", dataJSON: resultData });
        } else {
            logutils.logger.error("QE JSON Stringify Error: " + JSON.stringify(workedData.error));
        }
    };

    jsonWorker.postMessage(workerData);
}

function setMicroTimeRange(query, fromTime, toTime) {
    if (isNaN(fromTime) === true) {
        query.start_time = fromTime;
    } else {
        query.start_time = fromTime * 1000;
    }
    if (isNaN(toTime) === true) {
        query.end_time = toTime;
    } else {
        query.end_time = toTime * 1000;
    }
}

function getQueryJSON4Table(queryReqObj) {
    var formModelAttrs = queryReqObj.formModelAttrs,
        tableName = formModelAttrs.table_name,
        tableType = formModelAttrs.table_type,
        queryJSON = {
            "table": tableName,
            "start_time": "",
            "end_time": "",
            "select_fields": [],
            // "filter" is a array of arrays ie. AND clauses inside just one OR clause
            "filter": [[]]
        };

    var fromTimeUTC = formModelAttrs.from_time_utc,
        toTimeUTC = formModelAttrs.to_time_utc,
        select = formModelAttrs.select,
        where = formModelAttrs.where,
        filters = formModelAttrs.filters,
        autoSort = queryReqObj.autoSort,
        direction = formModelAttrs.direction;

    autoSort = (!_.isNil(autoSort) && (autoSort === "true" || autoSort)) ? true : false;

    if (tableType === "LOG") {
        queryJSON = _.extend({}, queryJSON, {
            "select_fields": ["Type", "Level"],
            "filter": [
                [{ "name": "Type", "value": "1", "op": 1 }],
                [{ "name": "Type", "value": "10", "op": 1 }]
            ]
        });
        autoSort = (select.indexOf("MessageTS") === -1) ? false : autoSort;

        if (autoSort) {
            queryJSON.sort_fields = ["MessageTS"];
            queryJSON.sort = 2;
        }

        if (!_.isNil(formModelAttrs.log_level) && formModelAttrs.log_level !== "") {
            for (var i = 0; i < queryJSON.filter.length; i++) {
                queryJSON.filter[i].push({ "name": "Level", "value": formModelAttrs.log_level, "op": 5 });
            }
        }
    } else if (tableName === "FlowSeriesTable") {
        autoSort = (select.indexOf("T=") === -1 && select.indexOf("T") === -1) ? false : autoSort;
        queryJSON = _.extend({}, queryJSON, { "select_fields": ["flow_class_id", "direction_ing"] });

        if (autoSort) {
            if (select.indexOf("T=") !== -1) {
                queryJSON.select_fields.push("T");
            }
            queryJSON.sort_fields = ["T"];
            queryJSON.sort = 2;
        }

    } else if (tableName === "FlowRecordTable") {
        queryJSON = _.extend({}, queryJSON, { "select_fields": ["direction_ing"] });

    } else if (tableType === "OBJECT") {
        autoSort = (select.indexOf("MessageTS") === -1) ? false : autoSort;

        if (autoSort) {
            queryJSON.sort_fields = ["MessageTS"];
            queryJSON.sort = 2;
        }

    } else if (tableType === "STAT") {
        queryJSON = _.extend({}, queryJSON, {
            where: [
                [{ name: "name", value: "", op: 7 }]
            ],
        });
    }

    setMicroTimeRange(queryJSON, fromTimeUTC, toTimeUTC);
    parseSelect(queryJSON, formModelAttrs);
    parseWhere(queryJSON, where);

    if (tableName === "MessageTable" && !_.isNil(formModelAttrs.keywords) && formModelAttrs.keywords !== "") {
        parseSLWhere(queryJSON, where, formModelAttrs.keywords);
    }

    if (!_.isNil(filters) && filters !== "") {
        parseFilters(queryJSON, filters);
    }

    if (direction !== "" && parseInt(direction) >= 0) {
        queryJSON.dir = parseInt(direction);
    }

    if (_.isNil(queryJSON.limit)) {
        queryJSON.limit = getDefaultQueryLimit(tableType);
    }

    return queryJSON;
}

function getDefaultQueryLimit(tableType) {
    var limit = (tableType === "OBJECT" || tableType === "LOG") ? 50000 : 150000;

    return limit;
}

function parseSelect(query, formModelAttrs) {
    var select = formModelAttrs.select,
        tgValue = formModelAttrs.time_granularity,
        tgUnit = formModelAttrs.time_granularity_unit,
        queryPrefix = formModelAttrs.query_prefix,
        selectArray = splitString2Array(select, ","),
        classTEqualToIndex = selectArray.indexOf("T=");

    if (classTEqualToIndex !== -1) {
        selectArray[classTEqualToIndex] = "T=" + getTGSecs(tgValue, tgUnit);
    }

    query.select_fields = query.select_fields.concat(selectArray);

    // CLASS(T=) should be added to the select fields only if user has selected T= for stat queries
    if (classTEqualToIndex > -1 && queryPrefix === "stat") {
        query.select_fields = query.select_fields.concat("CLASS(T=)");
    }
}

function parseSLWhere(query, where, keywords) {
    var keywordsArray = keywords.split(","),
        keywordAndClause = [];

    if (!_.isNil(keywords) && keywords.trim() !== "") {
        for (var i = 0; i < keywordsArray.length; i++) {
            keywordsArray[i] = keywordsArray[i].trim();
        }
        keywordAndClause = parseKeywordsObj(keywordsArray);
    }
    if (!_.isNil(where) && where.trim() !== "") {
        // where clause is not empty case
        var whereORArray = where.split(" OR "),
            whereORLength = whereORArray.length,
            newWhereOR;

        where = [];
        for (i = 0; i < whereORLength; i += 1) {
            whereORArray[i] = whereORArray[i].trim();
            newWhereOR = whereORArray[i].substr(0, whereORArray[i].length - 1);
            where[i] = parseWhereANDClause(newWhereOR);
            // append keyword array to individual where OR clause
            where[i] = where[i].concat(keywordAndClause);
        }

        query.where = where;
    } else {
        // where clause is empty but keywords are non empty case
        if (!_.isNil(keywords) && keywords.trim() !== "") {
            where = [];
            where.push(keywordAndClause);
            query.where = where;
        }
    }
}

function parseKeywordsObj(keywordsArray) {
    var keywordObj = [],
        keywordArray = [];

    for (var i = 0; i < keywordsArray.length; i++) {
        keywordObj[i] = { name: "", value: "", op: "" };
        keywordObj[i].name = "Keyword";
        var keywordStrLen = keywordsArray[i].length;
        //check if the keyword has a star in the end: if yes change op to 7 and delete trailing star; else let it be 1
        if (keywordsArray[i].charAt(keywordStrLen - 1) === "*") {
            keywordObj[i].value = keywordsArray[i].slice(0, -1);
            keywordObj[i].op = 7;
        } else {
            keywordObj[i].value = keywordsArray[i];
            keywordObj[i].op = 1;
        }
        keywordArray.push(keywordObj[i]);
    }
    return keywordArray;
}

function parseWhere(query, where) {
    if (!_.isNil(where) && where.trim() !== "") {
        var whereORArray = where.split(" OR "),
            whereORLength = whereORArray.length, i;

        for (i = 0; i < whereORLength; i += 1) {
            whereORArray[i] = whereORArray[i].trim();
            whereORArray[i] = parseWhereANDClause(whereORArray[i]);
        }
        query.where = whereORArray;
    }
}

function parseFilters(query, filters) {
    var filtersArray = splitString2Array(filters, "&"),
        filter, filterBy, limitBy, sortFields, sortOrder;

    for (var i = 0; i < filtersArray.length; i++) {
        filter = filtersArray[i];

        if (filter.indexOf("filter:") !== -1) {
            filterBy = splitString2Array(filter, "filter:")[1];

            if (filterBy.length > 0) {
                parseFilterBy(query, filterBy);
            }

        } else if (filter.indexOf("limit:") !== -1) {
            limitBy = splitString2Array(filter, "limit:")[1];

            if (limitBy.length > 0) {
                parseLimitBy(query, limitBy);
            }
        } else if (filter.indexOf("sort_fields:") !== -1) {
            sortFields = splitString2Array(filter, "sort_fields:")[1];

            if (sortFields.length > 0) {
                parseSortFields(query, sortFields);
            }
        } else if (filter.indexOf("sort:") !== -1) {
            sortOrder = splitString2Array(filter, "sort:")[1];

            if (sortOrder.length > 0) {
                parseSortOrder(query, sortOrder);
            }
        }
    }
}

function parseFilterBy(query, filterBy) {
    var filtersArray, filtersLength, filterClause = [],
        i, filterObj;

    if (!_.isNil(filterBy) && filterBy.trim() !== "") {
        filtersArray = filterBy.split(" AND ");
        filtersLength = filtersArray.length;
        for (i = 0; i < filtersLength; i += 1) {
            filtersArray[i] = filtersArray[i].trim();
            filterObj = getFilterObj(filtersArray[i]);
            filterClause.push(filterObj);
        }
        // Loop through the default filters and add the UI submitted ones to each
        for (var j = 0; j < query.filter.length; j++) {
            var filterArr = query.filter[j];
            filterArr = filterArr.concat(filterClause);
            query.filter[j] = filterArr;
        }
    }
}

function parseFilterObj(filter, operator) {
    var filterObj, filterArray;

    filterArray = splitString2Array(filter, operator);
    if (filterArray.length > 1 && filterArray[1] !== "") {
        filterObj = { name: "", value: "", op: "" };
        filterObj.name = filterArray[0];
        filterObj.value = filterArray[1];
        filterObj.op = getOperatorCode(operator);
    }
    return filterObj;
}

function parseLimitBy(query, limitBy) {
    try {
        var parsedLimit = parseInt(limitBy);
        query.limit = parsedLimit;
    } catch (error) {
        logutils.logger.error(error.stack);
    }
}

function parseSortOrder(query, sortOrder) {
    try {
        query.sort = sortOrder;
    } catch (error) {
        logutils.logger.error(error.stack);
    }
}

function parseSortFields(query, sortFields) {
    try {
        query.sort_fields = sortFields.split(",");
    } catch (error) {
        logutils.logger.error(error.stack);
    }
}

function parseWhereANDClause(whereANDClause) {
    var whereANDArray = whereANDClause.replace("(", "").replace(")", "").split(" AND "),
        whereANDLength = whereANDArray.length, i, whereANDClauseArray, operator = "",
        whereANDClauseWithSuffixArrray, whereANDTerm, tempWhereANDClauseWithSuffix;

    for (i = 0; i < whereANDLength; i += 1) {
        whereANDArray[i] = whereANDArray[i].trim();
        whereANDClause = whereANDArray[i];
        if (whereANDClause.indexOf("&") === -1) {
            if (whereANDClause.indexOf("Starts with") !== -1) {
                operator = "Starts with";
                whereANDClauseArray = whereANDClause.split(operator);
            } else if (whereANDClause.indexOf("=") !== -1) {
                operator = "=";
                whereANDClauseArray = whereANDClause.split(operator);
            }
            whereANDClause = { name: "", value: "", op: "" };
            populateWhereANDClause(whereANDClause, whereANDClauseArray[0].trim(), whereANDClauseArray[1].trim(), operator);
            whereANDArray[i] = whereANDClause;
        } else {
            whereANDClauseWithSuffixArrray = whereANDClause.split("&");
            // Treat whereANDClauseWithSuffixArrray[0] as a normal AND term and
            // whereANDClauseWithSuffixArrray[1] as a special suffix term
            if (!_.isNil(whereANDClauseWithSuffixArrray) && whereANDClauseWithSuffixArrray.length !== 0) {
                for (var j = 0; j < whereANDClauseWithSuffixArrray.length; j++) {
                    if (whereANDClauseWithSuffixArrray[j].indexOf("Starts with") !== -1) {
                        operator = "Starts with";
                        whereANDTerm = whereANDClauseWithSuffixArrray[j].split(operator);
                    } else if (whereANDClauseWithSuffixArrray[j].indexOf("=") !== -1) {
                        operator = "=";
                        whereANDTerm = whereANDClauseWithSuffixArrray[j].split(operator);
                    }
                    whereANDClause = { name: "", value: "", op: "" };
                    populateWhereANDClause(whereANDClause, whereANDTerm[0].trim(), whereANDTerm[1].trim(), operator);
                    if (j === 0) {
                        tempWhereANDClauseWithSuffix = whereANDClause;
                    } else if (j === 1) {
                        tempWhereANDClauseWithSuffix.suffix = whereANDClause;
                    }
                }
                whereANDArray[i] = tempWhereANDClauseWithSuffix;
            }
        }
    }
    return whereANDArray;
}

function populateWhereANDClause(whereANDClause, fieldName, fieldValue, operator) {
    var validLikeOPRFields = global.VALID_LIKE_OPR_FIELDS,
        validRangeOPRFields = global.VALID_RANGE_OPR_FIELDS,
        splitFieldValues;

    whereANDClause.name = fieldName;
    if (validLikeOPRFields.indexOf(fieldName) !== -1 && fieldValue.indexOf("*") !== -1) {
        whereANDClause.value = fieldValue.replace("*", "");
        whereANDClause.op = 7;
    } else if (validRangeOPRFields.indexOf(fieldName) !== -1 && fieldValue.indexOf("-") !== -1) {
        splitFieldValues = splitString2Array(fieldValue, "-");
        whereANDClause.value = splitFieldValues[0];
        whereANDClause.value2 = splitFieldValues[1];
        whereANDClause.op = 3;
    } else {
        whereANDClause.value = fieldValue;
        whereANDClause.op = getOperatorCode(operator);
    }
}

function splitString2Array(strValue, delimiter) {
    var strArray = strValue.split(delimiter),
        count = strArray.length;

    for (var i = 0; i < count; i++) {
        strArray[i] = strArray[i].trim();
    }
    return strArray;
}

function getTGSecs(tg, tgUnit) {
    if (tgUnit === "secs") {
        return tg;
    } else if (tgUnit === "mins") {
        return tg * 60;
    } else if (tgUnit === "hrs") {
        return tg * 3600;
    } else if (tgUnit === "days") {
        return tg * 86400;
    } else {
        // TODO: use logger object instead?
        console.error("CANNOT handle UNKNOWN tg unit: " + tgUnit);
        return tg;
    }
}

function getFilterObj(filter) {
    var filterObj;
    // order of if's is important here
    // '=' should be last one to be checked else '!=', '>=', '<='
    // will be matched as '='
    if (filter.indexOf("!=") !== -1) {
        filterObj = parseFilterObj(filter, "!=");
    } else if (filter.indexOf(" RegEx= ") !== -1) {
        filterObj = parseFilterObj(filter, "RegEx=");
    } else if (filter.indexOf("<=") !== -1) {
        filterObj = parseFilterObj(filter, "<=");
    } else if (filter.indexOf(">=") !== -1) {
        filterObj = parseFilterObj(filter, ">=");
    } else if (filter.indexOf("=") !== -1) {
        filterObj = parseFilterObj(filter, "=");
    }
    return filterObj;
}

function getOperatorCode(operator) {
    if (operator === "=") {
        return 1;
    } else if (operator === "!=") {
        return 2;
    } else if (operator === "<=") {
        return 5;
    } else if (operator === ">=") {
        return 6;
    } else if (operator === "RegEx=") {
        return 8;
    } else if ((operator === "Starts with") || (operator === "*")) {
        return 7;
    } else {
        return -1;
    }
}

function isEmptyObject(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            return false;
        }
    }
    return true;
}

exports.runGETQuery = runGETQuery;
exports.runPOSTQuery = runPOSTQuery;
exports.getTables = getTables;
exports.getTableColumnValues = getTableColumnValues;
exports.getTableSchema = getTableSchema;
exports.getQueryQueue = getQueryQueue;
exports.getChartGroups = getChartGroups;
exports.getChartData = getChartData;
exports.deleteQueryCache4Ids = deleteQueryCache4Ids;
exports.deleteQueryCache4Queue = deleteQueryCache4Queue;
exports.flushQueryCache = flushQueryCache;
exports.exportQueryResult = exportQueryResult;
exports.getQueryJSON4Table = getQueryJSON4Table;
exports.getCurrentTime = getCurrentTime;
exports.getQueryData = getQueryData;


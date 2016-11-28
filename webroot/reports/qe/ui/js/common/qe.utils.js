/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    "lodash",
    "moment"
], function (_, moment) {
    var serializer = new XMLSerializer(),
        domParser = new DOMParser();
    var maxCountInWhere = 100;

    function filterXML(xmlString, is4SystemLogs) {
        var xmlDoc = parseXML(xmlString);
        $(xmlDoc).find("[type='struct']").each(function () {
            formatStruct(this);
        });
        if(!is4SystemLogs) {
            $(xmlDoc).find("[type='sandesh']").each(function () {
                formatSandesh(this, is4SystemLogs);
            });
        }
        $(xmlDoc).find("[type]").each(function () {
            removeAttributes(this, ["type", "size", "identifier", "aggtype", "key"]);
        });
        $(xmlDoc).find("data").each(function () {
            $(this).children().unwrap();
        });
        return xmlDoc;
    }

    function parseXML(xmlString) {
        if (window.DOMParser) {
            var xmlDoc = domParser.parseFromString(xmlString, "text/xml");
        } else { // Internet Explorer
            xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = false;
            xmlDoc.loadXML(xmlString);
        }
        return xmlDoc;
    }

    function formatStruct(xmlNode) {
        $(xmlNode).find("list").each(function () {
            $(this).children().unwrap();
        });
        //$(xmlNode).children().unwrap();
    }

    function formatSandesh(xmlNode, is4SystemLogs) {
        var messageString = "", nodeCount, i;
        $(xmlNode).find("file").each(function () {
            $(this).remove();
        });
        $(xmlNode).find("line").each(function () {
            $(this).remove();
        });
        if(contrail.checkIfExist(is4SystemLogs) && is4SystemLogs) {
            nodeCount = $(xmlNode).find("[identifier]").length;
            for (i = 1; i < (nodeCount + 1); i++) {
                $(xmlNode).find("[identifier='" + i + "']").each(function () {
                    messageString += $(this).text() + " ";
                    $(this).remove();
                });
            }
            if (messageString !== "") {
                $(xmlNode).text(messageString);
            }
            removeAttributes(xmlNode, ["type"]);
        }
    }

    function removeAttributes(xmlNode, attrArray) {
        for (var i = 0; i < attrArray.length; i++) {
            xmlNode.removeAttribute(attrArray[i]);
        }
    }

    function convertXML2JSON(xmlString) {
        return $.xml2json(xmlString);
    }

    function getTimeRangeObj(formModelAttrs, serverCurrentTime) {
        var timeRange = formModelAttrs.time_range,
            fromDate, toDate, fromTimeUTC, toTimeUTC, serverDateObj,
            fromTime, toTime, now;


        if (timeRange > 0) {
            if (serverCurrentTime) {
                serverDateObj = new Date(serverCurrentTime);
                serverDateObj.setSeconds(0);
                serverDateObj.setMilliseconds(0);
                toTimeUTC = serverDateObj.getTime();
            } else {
                now = new Date();
                now.setSeconds(0);
                now.setMilliseconds(0);
                toTimeUTC = now.getTime();
            }
            fromTimeUTC = toTimeUTC - (timeRange * 1000);
            toTime = toTimeUTC;
            fromTime = fromTimeUTC;
        } else {
            // Used for custom time range
            fromDate = formModelAttrs.from_time;
            fromTimeUTC = roundDate2Minutes(new Date(fromDate)).getTime();
            fromTime = fromTimeUTC;
            toDate = formModelAttrs.to_time;
            toTimeUTC = roundDate2Minutes(new Date(toDate)).getTime();
            toTime = toTimeUTC;
        }

        return {fromTime: fromTime, toTime: toTime};
    }

    function roundDate2Minutes(dateObj) {
        dateObj.setSeconds(0);
        dateObj.setMilliseconds(0);
        return dateObj;
    }

    function getFromTimeShowOptions(toTimeId) {
        var d = new Date($("#" + toTimeId + "_datetimepicker").val()),
            dateString = moment(d).format("MMM DD, YYYY"),
            timeString = moment(d).format("hh:mm:ss A");

        return {
            maxDate: dateString ? dateString : false,
            maxTime: timeString ? timeString : false
        };
    }

    function getFromTimeSelectOptions(toTimeId, cdt) {
        var d = new Date($("#" + toTimeId + "_datetimepicker").val()),
            toDateString = moment(d).format("MMM DD, YYYY"),
            timeString = moment(d).format("hh:mm:ss A"),
            fromDateString = moment(cdt).format("MMM DD, YYYY");

        return {
            maxDate: toDateString ? toDateString : false,
            maxTime: (fromDateString === toDateString) ? timeString : false
        };
    }

    function getToTimeShowOptions(fromTimeId) {
        var d = new Date($("#" + fromTimeId + "_datetimepicker").val()),
            dateString = moment(d).format("MMM DD, YYYY"),
            timeString = moment(d).format("hh:mm:ss A");

        return {
            minDate: dateString ? dateString : false,
            minTime: timeString ? timeString : false
        };
    }

    function getToTimeSelectOptions(fromTimeId, cdt) {
        var d = new Date($("#" + fromTimeId + "_datetimepicker").val()),
            fromDateString = moment(d).format("MMM dd, yyyy"),
            timeString = moment(d).format("hh:mm:ss A"),
            toDateString = moment(cdt).format("MMM DD, YYYY");

        return {
            minDate: fromDateString ? fromDateString : false,
            minTime: (toDateString === fromDateString) ? timeString : false
        };
    }

    function parseFilterANDClause(filters) {
        if (!contrail.checkIfExist(filters)){
            // make filters empty string to prevent parse error when opened first time
            filters = "";
        }
        var filtersArray = cowu.splitString2Array(filters, "&"),
            filter, filterBy, limitBy, sortFields, sortOrder,
            filter_json_obj = {};

        for (var i = 0; i < filtersArray.length; i++) {
            filter = filtersArray[i];
            if(filter.indexOf("filter:") !== -1) {
                filterBy = cowu.splitString2Array(filter, "filter:")[1];
                if(filterBy.length > 0) {
                    filter_json_obj.filter = parseFilterBy(filterBy);
                }
            } else if (filter.indexOf("limit:") !== -1) {
                limitBy = cowu.splitString2Array(filter, "limit:")[1];
                if(limitBy.length > 0) {
                    filter_json_obj.limit = parseLimitBy(limitBy);
                }
            } else if (filter.indexOf("sort_fields:") !== -1) {
                sortFields = cowu.splitString2Array(filter, "sort_fields:")[1];
                if(sortFields.length > 0) {
                    filter_json_obj.sort_fields = parseSortFields(sortFields);
                }
            } else if (filter.indexOf("sort:") !== -1) {
                sortOrder = cowu.splitString2Array(filter, "sort:")[1];
                if(sortOrder.length > 0) {
                    filter_json_obj.sort_order = sortOrder;
                }
            }
        }
        return filter_json_obj;
    }

    function parseFilterBy(filterBy) {
        var filtersArray, filtersLength, filterClause = [], i, filterObj;

        if (contrail.checkIfExist(filterBy) && filterBy.trim() !== "") {
            filtersArray = filterBy.split(" AND ");
            filtersLength = filtersArray.length;
            for (i = 0; i < filtersLength; i += 1) {
                filtersArray[i] = filtersArray[i].trim();
                filterObj = getFilterObj(filtersArray[i]);
                filterClause.push(filterObj);
            }
        }

        return filterClause;
    }

    function getFilterObj(filter) {
        var filterObj;
        if (filter.indexOf("!=") !== -1) {
            filterObj = parseFilterObj(filter, "!=");
        } else if (filter.indexOf(" RegEx= ") !== -1) {
            filterObj = parseFilterObj(filter, "RegEx=");
        } else if (filter.indexOf("=") !== -1) {
            filterObj = parseFilterObj(filter, "=");
        }
        return filterObj;
    }

    function parseFilterObj(filter, operator) {
        var filterObj, filterArray;
        filterArray = cowu.splitString2Array(filter, operator);
        if (filterArray.length > 1 && filterArray[1] !== "") {
            filterObj = {"name": "", value: "", op: ""};
            filterObj.name = filterArray[0];
            filterObj.value = filterArray[1];
            filterObj.op = getOperatorCode(operator);
        }
        return filterObj;
    }

    /* eslint-disable */
    function parseLimitBy(limitBy) {
        try {
            var parsedLimit = parseInt(limitBy);
            return parsedLimit;
        } catch (error) {
            window.logutils.logger.error(error.stack);
        }
    }
    /* eslint-enable */

    function parseSortFields(sortFields){
        var sortFieldsArr = sortFields.split(",");
        for(var i=0; i< sortFieldsArr.length; i++) {
            sortFieldsArr[i] = sortFieldsArr[i].trim();
        }
        return sortFieldsArr;
    }

    function parseWhereANDClause(whereANDClause) {
        var whereANDArray = whereANDClause.replace("(", "").replace(")", "").split(" AND "),
            whereANDLength = whereANDArray.length, i, whereANDClauseArray, operator = "";
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
                whereANDClause = {"name": "", value: "", op: ""};
                populateWhereANDClause(whereANDClause, whereANDClauseArray[0].trim(), whereANDClauseArray[1].trim(), operator);
                whereANDArray[i] = whereANDClause;
            } else {
                var whereANDClauseWithSuffixArrray = whereANDClause.split("&"),
                    whereANDTerm = "";
                // Treat whereANDClauseWithSuffixArrray[0] as a normal AND term and
                // whereANDClauseWithSuffixArrray[1] as a special suffix term
                if (contrail.checkIfExist(whereANDClauseWithSuffixArrray) && whereANDClauseWithSuffixArrray.length !== 0) {
                    var tempWhereANDClauseWithSuffix;
                    for (var j = 0; j < whereANDClauseWithSuffixArrray.length; j++) {
                        if (whereANDClauseWithSuffixArrray[j].indexOf("Starts with") !== -1) {
                            operator = "Starts with";
                            whereANDTerm = whereANDClauseWithSuffixArrray[j].split(operator);
                        } else if (whereANDClauseWithSuffixArrray[j].indexOf("=") !== -1) {
                            operator = "=";
                            whereANDTerm = whereANDClauseWithSuffixArrray[j].split(operator);
                        }
                        whereANDClause = {"name": "", value: "", op: ""};
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
        var validLikeOPRFields = ["sourcevn", "destvn"],
            validRangeOPRFields = ["protocol", "sourceip", "destip", "sport", "dport"],
            splitFieldValues;
        whereANDClause.name = fieldName;
        if (validLikeOPRFields.indexOf(fieldName) !== -1 && fieldValue.indexOf("*") !== -1) {
            whereANDClause.value = fieldValue.replace("*", "");
            whereANDClause.op = 7;
        } else if (validRangeOPRFields.indexOf(fieldName) !== -1 && fieldValue.indexOf("-") !== -1) {
            splitFieldValues = cowu.splitString2Array(fieldValue, "-");
            whereANDClause.value = splitFieldValues[0];
            whereANDClause.value2 = splitFieldValues[1];
            whereANDClause.op = 3;
        } else {
            whereANDClause.value = fieldValue;
            whereANDClause.op = getOperatorCode(operator);
        }
    }

    function getOperatorCode(operator) {
        var operatorCode = -1;

        $.each(cowc.OPERATOR_CODES, function(operatorCodeKey, operatorCodeValue) {
            if (operator === operatorCodeValue) {
                operatorCode = operatorCodeKey;
                return false;
            } else {
                return true;
            }
        });

        return operatorCode;
    }

    function _parseWhereJSON2Collection(queryFormModel) {
        var whereStr = queryFormModel.model().get("where"),
            whereOrClauseStrArr = !contrail.checkIfExist(whereStr) ? [] : whereStr.split(" OR "),
            whereOrJSON = queryFormModel.model().get("where_json"),
            wherOrClauseObjects = [];

        queryFormModel.model().get("where_or_clauses").reset();

        $.each(whereOrJSON, function(whereOrJSONKey, whereOrJSONValue) {
            wherOrClauseObjects.push({orClauseText: whereOrClauseStrArr[whereOrJSONKey], orClauseJSON: whereOrJSONValue});
        });

        queryFormModel.addNewOrClauses(wherOrClauseObjects);
    }

    function _parseFilterJSON2Collection(queryFormModel) {
        var filterOrJSON = queryFormModel.model().attributes.filter_json;

        queryFormModel.model().get("filter_and_clauses").reset();
        queryFormModel.addNewFilterAndClause(filterOrJSON);
    }

    function _parseWhereString2JSON(queryFormModel) {
        var whereStr = queryFormModel.model().get("where"),
            whereOrClauseStrArr = (!contrail.checkIfExist(whereStr)) ? [] : whereStr.split(" OR "),
            whereOrJSONArr = [];

        $.each(whereOrClauseStrArr, function(whereOrClauseStrKey, whereOrClauseStrValue) {
            if (whereOrClauseStrValue !== "") {
                whereOrJSONArr.push(parseWhereANDClause(whereOrClauseStrValue));
            }
        });

        return whereOrJSONArr;
    }

    function _parseFilterString2JSON(queryFormModel) {
        var filtersStr = queryFormModel.model().attributes.filters;
        return parseFilterANDClause(filtersStr);
    }

    function _isAggregateField(fieldName) {
        var fieldNameLower = fieldName.toLowerCase(),
            isAggregate = false;

        var AGGREGATE_PREFIX_ARRAY = ["min(", "max(", "count(", "sum("];

        for (var i = 0; i < AGGREGATE_PREFIX_ARRAY.length; i++) {
            if(fieldNameLower.indexOf(AGGREGATE_PREFIX_ARRAY[i]) !== -1) {
                isAggregate = true;
                break;
            }
        }

        return isAggregate;
    }

    function fillQEFilterByKey (key, value, filterStr) {
        if (cowu.isNil(filterStr)) {
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

    function formatUIWhereClauseConfigByMember (whereClause, key, list) {
        return formatUIWhereClauseConfigByAdmin(whereClause, key, list);
    }

    function formatUIWhereClauseConfigByAdmin (whereClause, key, list) {
        if (cowu.isNil(list) || (!list.length)) {
            return "(" + key + " = )";
        }
        var cnt = list.length;
        if (cnt > maxCountInWhere) {
            /* We do not blow out where Clause */
            if (!cowu.isNil(whereClause)) {
                return whereClause;
            }
            return "(" + key + " Starts with )";
        }
        var whereClause = "";
        if (cnt > 0) {
            for (var i = 0; i < cnt; i++) {
                whereClause += "(" + key + " = " + list[i] + ")";
                if ((cnt > 1) && (i < cnt - 1)) {
                    whereClause += " OR ";
                }
            }
        } else {
            whereClause += "(" + key + " = )";
        }
        return whereClause;
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
        },
        "StatTable.VirtualMachineStats.cpu_stats": {
            "select": "Source, T, cpu_stats.cpu_one_min_avg, cpu_stats.rss," +
                " name",
            "from_time_utc": "now-10m",
            "to_time_utc": "now",
            "where": []
        },
        "StatTable.UveVirtualNetworkAgent.vn_stats": {
            "select": "SUM(vn_stats.in_bytes), SUM(vn_stats.out_bytes), SUM(vn_stats.in_tpkts)," +
                " SUM(vn_stats.out_tpkts), name",
            "from_time_utc": "now-60m",
            "to_time_utc": "now",
            "where": []
        },
        "StatTable.UveVMInterfaceAgent.if_stats": {
            "select": "SUM(if_stats.in_bytes), SUM(if_stats.out_bytes), SUM(if_stats.in_pkts)," +
                " SUM(if_stats.out_pkts), vm_uuid",
            "from_time_utc": "now-60m",
            "to_time_utc": "now",
            "where": []
        }
    };

    return {
        generateQueryUUID: function () {
            var s = [], itoh = "0123456789ABCDEF";
            for (var i = 0; i < 36; i++) {
                s[i] = Math.floor(Math.random() * 0x10);
            }
            s[14] = 4;
            s[19] = (s[19] & 0x3) | 0x8;
            for (i = 0; i < 36; i++) {
                s[i] = itoh[s[i]];
            }
            s[8] = s[13] = s[18] = s[23] = s[s.length] = "-";
            s[s.length] = (new Date()).getTime();
            return s.join("");
        },

        setUTCTimeObj: function (queryPrefix, formModelAttrs, serverCurrentTime, timeRange) {
            timeRange = contrail.checkIfExist(timeRange) ? timeRange : getTimeRangeObj(formModelAttrs, serverCurrentTime);

            formModelAttrs.from_time_utc = timeRange.fromTime;
            formModelAttrs.to_time_utc = timeRange.toTime;
        },

        fetchServerCurrentTime: function(successCB) {
            var serverCurrentTime;

            $.ajax({
                url: "/api/service/networking/web-server-info"
            }).done(function (resultJSON) {
                serverCurrentTime = resultJSON.serverUTCTime;
            }).always(function() {
                successCB(serverCurrentTime);
            });
        },

        getLabelStepUnit: function (tg, tgUnit) {
            var baseUnit = null, secInterval = 0;
            if (tgUnit === "secs") {
                secInterval = tg;
                if (tg < 60) {
                    tg = (-1 * tg);
                } else {
                    tg = Math.floor(parseInt(tg / 60));
                }
                baseUnit = "minutes";
            } else if (tgUnit === "mins") {
                secInterval = tg * 60;
                baseUnit = "minutes";
            } else if (tgUnit === "hrs") {
                secInterval = tg * 3600;
                baseUnit = "hours";
            } else if (tgUnit === "days") {
                secInterval = tg * 86400;
                baseUnit = "days";
            }
            return {labelStep: (1 * tg), baseUnit: baseUnit, secInterval: secInterval};
        },

        getEngQueryStr: function (reqQueryObj) {
            var engQueryJSON = {
                select: reqQueryObj.select,
                from: reqQueryObj.table_name,
                where: reqQueryObj.where,
                filter: reqQueryObj.filters,
                direction: reqQueryObj.direction
            };
            if (reqQueryObj.toTimeUTC === "now") {
                engQueryJSON.from_time = reqQueryObj.from_time;
                engQueryJSON.to_time = reqQueryObj.to_time;
            } else {
                engQueryJSON.from_time = moment(reqQueryObj.from_time_utc).format("MMM DD, YYYY hh:mm:ss A");
                engQueryJSON.to_time = moment(reqQueryObj.to_time_utc).format("MMM DD, YYYY hh:mm:ss A");
            }

            return JSON.stringify(engQueryJSON);
        },

        formatEngQuery: function(enqQueryObjStr) {
            var engQueryObj = JSON.parse(enqQueryObjStr),
                engQueryStr = "";

            $.each(engQueryObj, function(key, val){
                if(key === "select" && (!contrail.checkIfExist(val) || val === "")){
                    engQueryStr += '<div class="row-fluid"><span class="bolder">' + key.toUpperCase() + "</span> &nbsp;*</div>";
                } else if((key === "where" || key === "filter") && (!contrail.checkIfExist(val) || val === "")){
                    engQueryStr += "";
                } else {
                    var formattedKey = key;
                    if(key === "from_time" || key === "to_time"){
                        formattedKey = key.split("_").join(" ");
                    }
                    engQueryStr += '<div class="row-fluid word-break-normal"><span class="bolder">' + formattedKey.toUpperCase() + "</span> &nbsp;" + val + "</div>";
                }
            });
            return engQueryStr;
        },

        adjustHeight4FormTextarea: function(queryPrefix) {
            var elId = "#qe-" + queryPrefix + "-form",
                texareaNames = ["select", "where", "filters"];

            $.each(texareaNames, function(nameKey, nameValue) {
                var scrollHeight = $(elId).find('[name="' + nameValue + '"]').get(0).scrollHeight;
                $(elId).find('[name="' + nameValue + '"]')
                    .outerHeight(((scrollHeight < 36) ? 26 : (scrollHeight- 10)));
            });
        },

        getFromTimeElementConfig: function(fromTimeId, toTimeId) {
            return {
                formatTime: "h:i A",
                format: "M d, Y h:i A",
                displayFormat: "MMM DD, YYYY hh:mm A",
                onShow: function(cdt) {
                    this.setOptions(getFromTimeShowOptions(toTimeId, cdt));
                },
                onClose: function(cdt) {
                    this.setOptions(getFromTimeShowOptions(toTimeId, cdt));
                },
                onSelectDate: function(cdt) {
                    this.setOptions(getFromTimeSelectOptions(toTimeId, cdt));
                }
            };
        },

        getToTimeElementConfig: function(fromTimeId) {
            return {
                formatTime: "h:i A",
                format: "M d, Y h:i A",
                displayFormat: "MMM DD, YYYY hh:mm A",
                onShow: function(cdt) {
                    this.setOptions(getToTimeShowOptions(fromTimeId, cdt));
                },
                onClose: function(cdt) {
                    this.setOptions(getToTimeShowOptions(fromTimeId, cdt));
                },
                onSelectDate: function(cdt) {
                    this.setOptions(getToTimeSelectOptions(fromTimeId, cdt));
                }
            };
        },

        getModalClass4Table: function(tableName) {
            switch (tableName) {
                case "StatTable.ServerMonitoringSummary.resource_info_stats":
                    return "modal-1120";

                case "StatTable.ServerMonitoringInfo.file_system_view_stats.physical_disks":
                    return "modal-1120";

                default:
                    return cowc.QE_DEFAULT_MODAL_CLASSNAME;
            }
        },

        //TODO- remove this
        addFlowMissingPoints: function(tsData, options, plotFields, color, counter) {
            var fromTime = options.fromTime,
                toTime = options.toTime,
                interval = options.interval * 1000,
                plotData = [], addPoint, flowClassId = null,
                sumBytes = [], sumPackets = [];

            for (var key in tsData) {
                if (contrail.checkIfExist(tsData[key].flow_class_id)) {
                    flowClassId = tsData[key].flow_class_id;
                    break;
                }
            }

            for (var i = fromTime + interval; i <= toTime; i += interval) {
                for (var k = 0; k < plotFields.length; k++) {
                    addPoint = {"x":i, "flow_class_id":flowClassId};
                    if (contrail.checkIfExist(tsData[i.toString()])) {
                        addPoint.y = tsData[i.toString()][plotFields[k]];
                    } else {
                        addPoint.y = 0;
                    }
                    if(plotFields[k] === "sum_bytes") {
                        sumBytes.push(addPoint);
                    } else if (plotFields[k] === "sum_packets") {
                        sumPackets.push(addPoint);
                    }
                }
            }

            if(sumBytes.length > 0) {
                plotData.push({"key": "#" + counter + ": Sum Bytes", color: color, values: sumBytes});
            } else if(sumPackets.length > 0) {
                plotData.push({"key": "#" + counter + ": Sum Packets", color: color, values: sumPackets});
            }

            return plotData;
        },

        getCurrentTime4Client: function() {
            var now = new Date(), currentTime;
            currentTime = now.getTime();
            return currentTime;
        },

        addChartMissingPoints: function(chartDataRow, queryFormAttributes, plotFields) {
            var chartDataValues = chartDataRow.values,
                newChartDataValues = {},
                emptyChartDataValue  = {},
                timeGranularity = queryFormAttributes.time_granularity,
                timeGranularityUnit = queryFormAttributes.time_granularity_unit,
                timeInterval = timeGranularity * cowc.TIME_GRANULARITY_INTERVAL_VALUES[timeGranularityUnit],
                toTime = queryFormAttributes.to_time_utc,
                fromTime = queryFormAttributes.from_time_utc;

            $.each(plotFields, function(plotFieldKey, plotFieldValue) {
                emptyChartDataValue[plotFieldValue] = 0;
            });

            for (var i = fromTime; i < toTime; i += timeInterval) {
                if (!contrail.checkIfExist(chartDataValues[i])) {
                    newChartDataValues[i] = emptyChartDataValue;
                } else {
                    newChartDataValues[i] = chartDataValues[i];
                }
            }

            chartDataRow.values = newChartDataValues;

            return chartDataRow;
        },

        parseWhereCollection2String: function(queryFormModel) {
            var whereOrClauses = queryFormModel.model().get("where_or_clauses"),
                whereOrClauseStrArr = [];

            $.each(whereOrClauses.models, function(whereOrClauseKey, whereOrClauseValue) {
                if (whereOrClauseValue.attributes.orClauseText !== "") {
                    whereOrClauseStrArr.push("(" + whereOrClauseValue.attributes.orClauseText + ")");
                }
            });

            return whereOrClauseStrArr.join(" OR ");
        },

        parseFilterCollection2String: function (queryFormModel) {
            var filterAndClauses = queryFormModel.model().attributes.filter_and_clauses,
                sort_by = queryFormModel.model().attributes.sort_by,
                sort_order = queryFormModel.model().attributes.sort_order,
                limit = queryFormModel.model().attributes.limit,
                filterAndClausestrArr = [], filterAndClausestr = "";

            $.each(filterAndClauses.models, function (filterAndClauseKey, filterAndClauseValue) {
                var name, value, operator;
                name = filterAndClauseValue.attributes.name;
                operator = filterAndClauseValue.attributes.operator;
                value = filterAndClauseValue.attributes.value();

                if (name !== "" && operator !== "" && value !== "") {
                    filterAndClausestrArr.push(name + " " + operator + " " + value);
                }
            });

            if (filterAndClausestrArr.length > 0) {
                filterAndClausestr = filterAndClausestr.concat("filter: ");
                filterAndClausestr = filterAndClausestr.concat(filterAndClausestrArr.join(" AND "));
            }
            if (contrail.checkIfExist(limit)) {
                if(filterAndClausestr !== "") {
                    filterAndClausestr = filterAndClausestr.concat(" & limit: " + limit);
                } else {
                    filterAndClausestr = filterAndClausestr.concat("limit: " + limit);
                }
            }
            if (contrail.checkIfExist(sort_by)) {
                if(filterAndClausestr !== "") {
                    filterAndClausestr = filterAndClausestr.concat(" & sort_fields: " + sort_by);
                } else {
                    filterAndClausestr = filterAndClausestr.concat("sort_fields: " + sort_by);
                }
            }
            if (contrail.checkIfExist(sort_order)) {
                if(filterAndClausestr !== "") {
                    filterAndClausestr = filterAndClausestr.concat(" & sort: " + sort_order);
                } else {
                    filterAndClausestr = filterAndClausestr.concat("sort: " + sort_order);
                }
            }
            return filterAndClausestr;
        },

        parseWhereCollection2JSON: function(queryFormModel) {
            var whereOrClauses = queryFormModel.model().get("where_or_clauses"),
                whereOrJSONArr = [];

            $.each(whereOrClauses.models, function(whereOrClauseKey, whereOrClauseValue) {
                if (whereOrClauseValue.attributes.orClauseText !== "") {
                    whereOrJSONArr.push(parseWhereANDClause("(" + whereOrClauseValue.attributes.orClauseText + ")"));
                }
            });

            return whereOrJSONArr;
        },

        parseSelectString2Array: function(queryFormModel) {
            var selectString = queryFormModel.select(),
                selectFields = queryFormModel.select_data_object().select_fields(),
                checkedFields = (!contrail.checkIfExist(selectString) || selectString.trim() === "") ? [] : selectString.split(", ");

            _.each(selectFields, function(selectFieldValue) {
                queryFormModel.select_data_object().checked_map()[selectFieldValue.name](checkedFields.indexOf(selectFieldValue.name) !== -1);
            });

        },

        parseWhereString2Collection: function(queryFormModel) {
            queryFormModel.where_json(_parseWhereString2JSON(queryFormModel));
            _parseWhereJSON2Collection(queryFormModel);
        },

        parseFilterString2Collection: function(queryFormModel) {
            queryFormModel.filter_json(_parseFilterString2JSON(queryFormModel));
            _parseFilterJSON2Collection(queryFormModel);
        },

        parseWhereJSON2Collection: _parseWhereJSON2Collection,

        parseFilterJSON2Collection: _parseFilterJSON2Collection,

        parseWhereString2JSON: _parseWhereString2JSON,

        parseFilterString2JSON: _parseFilterString2JSON,

        getAggregateSelectFields: function(selectArray) {
            var aggregateSelectArray = [];

            $.each(selectArray, function(selectKey, selectValue) {
                if (_isAggregateField(selectValue)) {
                    aggregateSelectArray.push(selectValue);
                }
            });

            return aggregateSelectArray;
        },

        getNameSuffixKey: function(name, nameOptionList) {
            var nameSuffixKey = -1;

            $.each(nameOptionList, function(nameOptionKey, nameOptionValue) { // eslint-disable-line
                if(nameOptionValue.name === name) {
                    nameSuffixKey = _.isNull(nameOptionValue.suffixes) ? -1 : nameOptionKey;
                    return false;
                }
            });

            return nameSuffixKey;
        },

        //format aggregate field names for grids
        formatNameForGrid: function(columnName) {
            var firstIndex = columnName.indexOf("("),
                lastIndex = columnName.indexOf(")"),
                aggregateType = columnName.substr(0,firstIndex),
                aggregateColumnName = columnName.substr(firstIndex + 1,lastIndex - firstIndex - 1);

            if(_isAggregateField(columnName) || aggregateType === "AVG" || aggregateType === "PERCENTILES") {
                return aggregateType.toUpperCase() + " (" + cowl.get(aggregateColumnName) + ")";
            } else {
                return cowl.get(columnName).replace(")", "");
            }
        },

        isAggregateField: _isAggregateField,

        getCheckedFields: function(checkedMap) {
            var checkedFields = [];
            _.each(checkedMap, function(checkedMapValue, checkedMapKey){
                if (checkedMapValue()) {
                    checkedFields.push(checkedMapKey);
                }
            });

            return checkedFields;
        },

        //TODO - Delete this
        formatXML2JSON: function(xmlString, is4SystemLogs) {
            console.warn(cowm.DEPRECATION_WARNING_PREFIX + "Function formatXML2JSON of qe-utils is deprecated. Use formatXML2JSON() of core-utils instead.");

            if (xmlString && xmlString !== "") {
                var xmlDoc = filterXML(xmlString, is4SystemLogs);
                return convertXML2JSON(serializer.serializeToString(xmlDoc));
            } else {
                return "";
            }
        },

        getLevelName4Value: function(logValue) {
            var count = cowc.QE_LOG_LEVELS.length;
            for (var i = 0; i < count; i++) {
                if (cowc.QE_LOG_LEVELS[i].value === logValue) {
                    return cowc.QE_LOG_LEVELS[i].name;
                }
            }
            return logValue;
        },

        /**
         * Pass either selectedFlowRecord or formModel attribute to check if session analyzer can be enabled.
         * @param selectedFlowRecord
         * @param formModelAttr
         * @returns {boolean}
         */
        enableSessionAnalyzer: function(selectedFlowRecord, formModelAttr) {
            var enable = true, disable = !enable,
                keys = ["vrouter", "sourcevn", "sourceip", "destvn", "destip", "sport", "dport"];
            if (contrail.checkIfExist(selectedFlowRecord)) {
                for (var i = 0; i < keys.length; i++) {
                    if (!selectedFlowRecord.hasOwnProperty(keys[i]) || !contrail.checkIfExist(selectedFlowRecord[keys[i]])) {
                        return disable;
                    }
                }
            }
            if (contrail.checkIfExist(formModelAttr)) {
                var selectArray = formModelAttr.select.split(", ");
                for (i = 0; i < keys.length; i++) {
                    if (selectArray.indexOf(keys[i]) === -1) {
                        return disable;
                    }
                }
            }
            return enable;
        },
        formatQEUIQuery: function(qObj) {
            var qeQuery = {};
            var qeModAttrs = {};
            if (cowu.isNil(qObj)) {
                return null;
            }
            qeQuery.async = false;
            if (!cowu.isNil(qObj.async)) {
                qeQuery.async = qObj.async;
            }
            qeQuery.chunk = 1;
            if (!cowu.isNil(qObj.chunk)) {
                qeQuery.chunk = qObj.chunk;
            }
            qeQuery.chunkSize = 10000;
            if (!cowu.isNil(qObj.chunkSize)) {
                qeQuery.chunkSize = qObj.chunkSize;
            }
            if (!cowu.isNil(qObj.table)) {
                qeModAttrs = qeTableJSON[qObj.table];
                qeModAttrs.table_name = qObj.table;
            }
            if (!cowu.isNil(qObj.select)) {
                qeModAttrs.select = qObj.select;
            }
            if (!cowu.isNil(qObj.where)) {
                qeModAttrs.where = qObj.where;
            }
            if (!cowu.isNil(qObj.minsSince)) {
                qeModAttrs.to_time_utc = "now";
                qeModAttrs.from_time_utc = "now-" + qObj.minsSince + "m";
            } else if (!cowu.isNil(qObj.from_time_utc) &&
                       !cowu.isNil(qObj.to_time_utc)) {
                qeModAttrs.from_time_utc = qObj.from_time_utc;
                qeModAttrs.to_time_utc = qObj.to_time_utc;
            }
            if (!cowu.isNil(qObj.table_type)) {
                qeModAttrs.table_type = qObj.table_type;
            }
            if (!cowu.isNil(qObj.time_range)) {
                qeModAttrs.time_range = qObj.time_range;
                qeModAttrs.time_granularity_unit = "secs";
            }
            if (!cowu.isNil(qObj.time_granularity_unit)) {
                qeModAttrs.time_granularity_unit = qObj.time_granularity_unit;
            }
            qeModAttrs.filters = "";
            if (!cowu.isNil(qObj.filter)) {
                qeModAttrs.filters =
                    fillQEFilterByKey("filter", qObj.filter,
                                      qeModAttrs.filters);
            }
            if (cowu.isNil(qObj.limit)) {
                qObj.limit = 150000;
            }
            qeModAttrs.filters +=
                fillQEFilterByKey("limit", qObj.limit, qeModAttrs.filters);
            if (cowu.isNil(qObj.sort_fields)) {
                if (!cowu.isNil(qeModAttrs.sort_fields)) {
                    qObj.sort_fields = qeModAttrs.sort_fields;
                }
            }
            delete qeModAttrs.sort_fields;
            if (!cowu.isNil(qObj.sort_fields)) {
                qeModAttrs.filters +=
                    fillQEFilterByKey("sort_fields", qObj.sort_fields,
                                      qeModAttrs.filters);
            }
            if (cowu.isNil(qObj.sort)) {
                if (!cowu.isNil(qeModAttrs.sort)) {
                    qObj.sort = qeModAttrs.sort;
                    qeModAttrs.filters +=
                        fillQEFilterByKey("sort", qObj.sort, qeModAttrs.filters);
                }
            }
            delete qeModAttrs.sort;
            qeQuery.formModelAttrs = qeModAttrs;
            qeQuery.queryId = this.generateQueryUUID();
            return qeQuery;
        },
        formatUIWhereClauseConfigByUserRole: function(whereClause, key, list) {
            var userRole = getValueByJsonPath(globalObj, "webServerInfo;role", []);
            var isAdminRole = userRole.indexOf(globalObj.roles.ADMIN) > -1;
            if (true == isAdminRole) {
                return formatUIWhereClauseConfigByAdmin(whereClause, key, list);
            } else {
                return formatUIWhereClauseConfigByMember(whereClause, key, list);
            }
        }
    };
});

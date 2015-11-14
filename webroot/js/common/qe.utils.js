/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var QEUtils = function () {
        var self = this;

        self.generateQueryUUID = function () {
            var s = [], itoh = '0123456789ABCDEF';
            for (var i = 0; i < 36; i++) {
                s[i] = Math.floor(Math.random() * 0x10);
            }
            s[14] = 4;
            s[19] = (s[19] & 0x3) | 0x8;
            for (var i = 0; i < 36; i++) {
                s[i] = itoh[s[i]];
            }
            s[8] = s[13] = s[18] = s[23] = s[s.length] = '-';
            s[s.length] = (new Date()).getTime();
            return s.join('');
        };

        self.setUTCTimeObj = function (queryPrefix, formModelAttrs, serverCurrentTime, timeRange) {
            timeRange = (timeRange == null) ? getTimeRangeObj(formModelAttrs, serverCurrentTime) : timeRange;

            formModelAttrs['from_time_utc'] = timeRange.fromTime;
            formModelAttrs['to_time_utc'] = timeRange.toTime;
            formModelAttrs['rerun_time_range'] = timeRange.reRunTimeRange;
            return formModelAttrs;
        };

        self.getLabelStepUnit = function (tg, tgUnit) {
            var baseUnit = null, secInterval = 0;
            if (tgUnit == 'secs') {
                secInterval = tg;
                if (tg < 60) {
                    tg = (-1 * tg);
                } else {
                    tg = Math.floor(parseInt(tg / 60));
                }
                baseUnit = 'minutes';
            } else if (tgUnit == 'mins') {
                secInterval = tg * 60;
                baseUnit = 'minutes';
            } else if (tgUnit == 'hrs') {
                secInterval = tg * 3600;
                baseUnit = 'hours';
            } else if (tgUnit == 'days') {
                secInterval = tg * 86400;
                baseUnit = 'days';
            }
            return {labelStep: (1 * tg), baseUnit: baseUnit, secInterval: secInterval};
        };

        self.getEngQueryStr = function (reqQueryObj) {
            var engQueryJSON = {
                select: reqQueryObj.select,
                from: reqQueryObj.table_name,
                where: reqQueryObj.where,
                filter: reqQueryObj.filters
            };
            if (reqQueryObj.toTimeUTC == "now") {
                engQueryJSON['from_time'] = reqQueryObj.fromTimeUTC;
                engQueryJSON['to_time'] = reqQueryObj.toTimeUTC;
            } else {
                engQueryJSON['from_time'] = moment(reqQueryObj.fromTimeUTC).format('MMM DD, YYYY hh:mm:ss A');
                engQueryJSON['to_time'] = moment(reqQueryObj.toTimeUTC).format('MMM DD, YYYY hh:mm:ss A');
            }
            return JSON.stringify(engQueryJSON);
        };

        self.getFromTimeElementConfig = function(fromTimeId, toTimeId) {
            return {
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
        };

        self.getToTimeElementConfig = function(fromTimeId, toTimeId) {
            return {
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
        };

        self.getModalClass4Table = function(tableName) {
            switch (tableName) {
                case "StatTable.ServerMonitoringSummary.resource_info_stats":
                    return "modal-1120";

                case "StatTable.ServerMonitoringInfo.file_system_view_stats.physical_disks":
                    return "modal-1120";

                default:
                    return cowc.QE_DEFAULT_MODAL_CLASSNAME;
            }
        };

        self.formatReRunTime = function(reRunTimeRange) {
            var formattedReRunTime = 'custom', timeInSecs;
            if(reRunTimeRange != null && reRunTimeRange != -1) {
                timeInSecs = parseInt(reRunTimeRange);
                if(timeInSecs <= 3600) {
                    formattedReRunTime = 'Last ' + timeInSecs/60 + ' mins';
                } else if ( timeInSecs <= 43200) {
                    formattedReRunTime = 'Last ' + timeInSecs/3600 + ' hrs';
                }
            }
            return formattedReRunTime;
        };

        //TODO- remove this
        self.addFlowMissingPoints = function(tsData, options, plotFields, color, counter) {
            var fromTime = options.fromTime,
                toTime = options.toTime,
                interval = options.interval * 1000,
                plotData = [], addPoint, flowClassId = null,
                sumBytes = [], sumPackets = [];

            for (var key in tsData) {
                if (tsData[key]['flow_class_id'] != null) {
                    flowClassId = tsData[key]['flow_class_id'];
                    break;
                }
            }

            for (var i = fromTime + interval; i <= toTime; i += interval) {
                for (var k = 0; k < plotFields.length; k++) {
                    addPoint = {'x':i, 'flow_class_id':flowClassId};
                    if (tsData[i.toString()] != null) {
                        addPoint['y'] = tsData[i.toString()][plotFields[k]];
                    } else {
                        addPoint['y'] = 0;
                    }
                    if(plotFields[k] == 'sum_bytes') {
                        sumBytes.push(addPoint);
                    } else if (plotFields[k] == 'sum_packets') {
                        sumPackets.push(addPoint);
                    }
                }
            }

            if(sumBytes.length > 0) {
                plotData.push({'key': "#" + counter + ': Sum Bytes', color: color, values: sumBytes});
            } else if(sumPackets.length > 0) {
                plotData.push({'key': "#" + counter + ': Sum Packets', color: color, values: sumPackets});
            }

            return plotData;
        };

        self.getCurrentTime4Client = function() {
            var now = new Date(), currentTime;
            currentTime = now.getTime();
            return currentTime;
        };

        self.addChartMissingPoints = function(chartDataRow, queryFormModel, plotFields) {
            var chartDataValues = chartDataRow.values,
                newChartDataValues = {},
                emptyChartDataValue  = {},
                toTime = queryFormModel.to_time_utc(),
                fromTime = queryFormModel.from_time_utc(),
                timeGranularity = queryFormModel.time_granularity(),
                timeGranularityUnit = queryFormModel.time_granularity_unit(),
                timeInterval = timeGranularity * cowc.TIME_GRANULARITY_INTERVAL_VALUES[timeGranularityUnit];

            $.each(plotFields, function(plotFieldKey, plotFieldValue) {
                emptyChartDataValue[plotFieldValue] = 0;
            });

            for (var i = fromTime; i <= toTime; i += timeInterval) {
                if (!contrail.checkIfExist(chartDataValues[i])) {
                    newChartDataValues[i] = emptyChartDataValue
                } else {
                    newChartDataValues[i] = chartDataValues[i];
                }
            }

            chartDataRow.values = newChartDataValues;

            return chartDataRow;
        };

        self.parseWhereCollection2String = function(queryFormModel) {
            var whereOrClauses = queryFormModel.model().get('where_or_clauses'),
                whereOrClauseStrArr = [];

            $.each(whereOrClauses.models, function(whereOrClauseKey, whereOrClauseValue) {
                if (whereOrClauseValue.attributes.orClauseText !== '') {
                    whereOrClauseStrArr.push('(' + whereOrClauseValue.attributes.orClauseText + ')')
                }
            });

            return whereOrClauseStrArr.join(' OR ');
        };

        self.parseFilterCollection2String = function (queryFormModel) {
            var filterAndClauses = queryFormModel.model().attributes['filter_and_clauses'],
                limit = queryFormModel.model().attributes['limit'],
                filterAndClausestrArr = [], filterAndClausestr = '';

            $.each(filterAndClauses.models, function (filterAndClauseKey, filterAndClauseValue) {
                var name, value, operator;
                name = filterAndClauseValue.attributes.name;
                operator = filterAndClauseValue.attributes.operator;
                value = filterAndClauseValue.attributes.value();

                if (name !== '' && operator !== '' && value !== '') {
                    filterAndClausestrArr.push(name + ' ' + operator + ' ' + value);
                }
            });

            if (filterAndClausestrArr.length > 0) {
                filterAndClausestr = filterAndClausestr.concat("filter: ");
                filterAndClausestr = filterAndClausestr.concat(filterAndClausestrArr.join(' AND '));
                filterAndClausestr = filterAndClausestr.concat(", limit: " + limit);
            } else if (contrail.checkIfExist(limit)) {
                filterAndClausestr = filterAndClausestr.concat("limit: " + limit);
            }
            return filterAndClausestr;
        };

        self.parseWhereCollection2JSON = function(queryFormModel) {
            var whereOrClauses = queryFormModel.model().get('where_or_clauses'),
                whereOrJSONArr = [];

            $.each(whereOrClauses.models, function(whereOrClauseKey, whereOrClauseValue) {
                if (whereOrClauseValue.attributes.orClauseText !== '') {
                    whereOrJSONArr.push(parseWhereANDClause('(' + whereOrClauseValue.attributes.orClauseText + ')'));
                }
            });

            return whereOrJSONArr;
        };

        self.parseWhereString2Collection = function(queryFormModel) {
            queryFormModel.where_json(self.parseWhereString2JSON(queryFormModel));
            qewu.parseWhereJSON2Collection(queryFormModel)
        };

        self.parseFilterString2Collection = function(queryFormModel) {
            queryFormModel.filter_json(self.parseFilterString2JSON(queryFormModel));
            qewu.parseFilterJSON2Collection(queryFormModel);
        };

        self.parseWhereJSON2Collection = function(queryFormModel) {
            var whereStr = queryFormModel.model().get('where'),
                whereOrClauseStrArr = (whereStr == null) ? [] : whereStr.split(' OR '),
                whereOrJSON = queryFormModel.model().get('where_json'),
                wherOrClauseObjects = [];

            queryFormModel.model().get('where_or_clauses').reset();

            $.each(whereOrJSON, function(whereOrJSONKey, whereOrJSONValue) {
                wherOrClauseObjects.push({orClauseText: whereOrClauseStrArr[whereOrJSONKey], orClauseJSON: whereOrJSONValue});
            });

            queryFormModel.addNewOrClauses(wherOrClauseObjects);
        };

        self.parseFilterJSON2Collection = function(queryFormModel) {
            var filterStr = queryFormModel.model().attributes.filters,
                filterOrJSON = queryFormModel.model().attributes.filter_json;

            queryFormModel.model().get('filter_and_clauses').reset();
            queryFormModel.addNewFilterAndClause(filterOrJSON);
        };

        self.parseWhereString2JSON = function(queryFormModel) {
            var whereStr = queryFormModel.model().get('where'),
                whereOrClauseStrArr = (whereStr == null) ? [] : whereStr.split(' OR '),
                whereOrJSONArr = [];

            $.each(whereOrClauseStrArr, function(whereOrClauseStrKey, whereOrClauseStrValue) {
                if (whereOrClauseStrValue != '') {
                    whereOrJSONArr.push(parseWhereANDClause(whereOrClauseStrValue));
                }
            });

            return whereOrJSONArr;
        };

        self.parseFilterString2JSON = function(queryFormModel) {
            var filtersStr = queryFormModel.model().attributes.filters;
            return parseFilterANDClause(filtersStr);
        };

        self.getAggregateSelectFields = function(queryFormModel) {
            var selectArray = queryFormModel.select().replace(/ /g, "").split(","),
                aggregateSelectArray = [];

            $.each(selectArray, function(selectKey, selectValue) {
                if (self.isAggregateField(selectValue)) {
                    aggregateSelectArray.push(selectValue);
                }
            });

            return aggregateSelectArray
        };

        self.getNameSuffixKey = function(name, nameOptionList) {
            var nameSuffixKey = -1;

            $.each(nameOptionList, function(nameOptionKey, nameOptionValue) {
                if(nameOptionValue.name === name) {
                    nameSuffixKey = (nameOptionValue.suffixes === null) ? -1 : nameOptionKey;
                    return false;
                }
            });

            return nameSuffixKey;
        };

        self.isAggregateField = function(fieldName) {
            var fieldNameLower = fieldName.toLowerCase(),
                isAggregate = false;

            var AGGREGATE_PREFIX_ARRAY = ['min(', 'max(', 'count(', 'sum('];

            for (var i = 0; i < AGGREGATE_PREFIX_ARRAY.length; i++) {
                if(fieldNameLower.indexOf(AGGREGATE_PREFIX_ARRAY[i]) != -1) {
                    isAggregate = true;
                    break;
                }
            }

            return isAggregate;
        };

        self.formatXML2JSON = function(xmlString, is4SystemLogs) {
            if (xmlString && xmlString != '') {
                var xmlDoc = filterXML(xmlString, is4SystemLogs);
                return convertXML2JSON(serializer.serializeToString(xmlDoc));
            } else {
                return '';
            }
        };

        self.getLevelName4Value = function(logValue) {
            var count = cowc.QE_LOG_LEVELS.length;
            for (var i = 0; i < count; i++) {
                if (cowc.QE_LOG_LEVELS[i].value == logValue) {
                    return cowc.QE_LOG_LEVELS[i].name;
                }
            }
            return logValue;
        };

        self.handleNull4Grid = function(value, placeHolder) {
            if(value == 0) {
                return 0;
            } else if (value != null && value != '') {
                return value;
            } else if (placeHolder != null) {
                return placeHolder;
            } else {
                return '';
            }
        };
    };

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
            removeAttributes(this, ['type', 'size', 'identifier', 'aggtype', 'key']);
        });
        $(xmlDoc).find("data").each(function () {
            $(this).children().unwrap();
        });
        return xmlDoc;
    }

    function formatStruct(xmlNode) {
        $(xmlNode).find("list").each(function () {
            $(this).children().unwrap();
        });
        //$(xmlNode).children().unwrap();
    };

    function formatSandesh(xmlNode, is4SystemLogs) {
        var messageString = '', nodeCount, i;
        $(xmlNode).find("file").each(function () {
            $(this).remove();
        });
        $(xmlNode).find("line").each(function () {
            $(this).remove();
        });
        if(is4SystemLogs != null && is4SystemLogs) {
            nodeCount = $(xmlNode).find("[identifier]").length;
            for (i = 1; i < (nodeCount + 1); i++) {
                $(xmlNode).find("[identifier='" + i + "']").each(function () {
                    messageString += $(this).text() + ' ';
                    $(this).remove();
                });
            }
            if (messageString != '') {
                $(xmlNode).text(messageString);
            }
            removeAttributes(xmlNode, ['type']);
        }
    };

    function removeAttributes(xmlNode, attrArray) {
        for (var i = 0; i < attrArray.length; i++) {
            xmlNode.removeAttribute(attrArray[i]);
        }
    };

    function convertXML2JSON(xmlString) {
        return $.xml2json(xmlString);
    };

    function getTimeRangeObj(formModelAttrs, serverCurrentTime) {
        var queryPrefix = formModelAttrs['query_prefix'],
            timeRange = formModelAttrs['time_range'],
            tgUnit = formModelAttrs['tg_unit'],
            tgValue = formModelAttrs['tg_value'],
            fromDate, toDate, fromTimeUTC, toTimeUTC, serverDateObj,
            fromTime, toTime, now, tgMicroSecs = 0;

        tgMicroSecs = getTGMicroSecs(tgValue, tgUnit);

        if (timeRange > 0) {
            if (serverCurrentTime) {
                serverDateObj =  new Date(serverCurrentTime);
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
            if (queryPrefix == cowc.FS_QUERY_PREFIX || queryPrefix == cowc.STAT_QUERY_PREFIX) {
                toTime = toTimeUTC;
                fromTime = fromTimeUTC;
            } else {
                toTime = "now";
                fromTime = "now-" + timeRange + "s";
            }
        } else {
            // used for custom time range
            fromDate = formModelAttrs['from_time'];
            fromTimeUTC = new Date(fromDate).getTime();
            fromTime = fromTimeUTC;
            toDate = formModelAttrs['to_time'];
            toTimeUTC = new Date(toDate).getTime();
            toTime = toTimeUTC;
        }

        if (typeof fromTimeUTC !== 'undefined' && typeof tgMicroSecs !== 'undefined') {
            fromTimeUTC = ceilFromTime(fromTimeUTC, tgMicroSecs);
        }

        return {fromTime: fromTime, toTime: toTime, fromTimeUTC: fromTimeUTC, toTimeUTC: toTimeUTC, reRunTimeRange: timeRange};
    };

    function getTGMicroSecs(tg, tgUnit) {
        if (tgUnit == 'secs') {
            return tg * 1000;
        } else if (tgUnit == 'mins') {
            return tg * 60 * 1000;
        } else if (tgUnit == 'hrs') {
            return tg * 3600 * 1000;
        } else if (tgUnit == 'days') {
            return tg * 86400 * 1000;
        }
    };

    function ceilFromTime(fromTimeUTC, TGSecs){
        fromTimeUTC = TGSecs * Math.ceil(fromTimeUTC/TGSecs);
        return fromTimeUTC;
    };

    function getFromTimeShowOptions(toTimeId, cdt) {
        var d = new Date($('#' + toTimeId + '_datetimepicker').val()),
            dateString = moment(d).format('MMM DD, YYYY'),
            timeString = moment(d).format('hh:mm:ss A');

        return {
            maxDate: dateString ? dateString : false,
            maxTime: timeString ? timeString : false
        };
    };

    function getFromTimeSelectOptions(toTimeId, cdt) {
        var d = new Date($('#' + toTimeId + '_datetimepicker').val()),
            toDateString = moment(d).format('MMM DD, YYYY'),
            timeString = moment(d).format('hh:mm:ss A'),
            fromDateString = moment(cdt).format('MMM DD, YYYY');

        return {
            maxDate: toDateString ? toDateString : false,
            maxTime: (fromDateString == toDateString) ? timeString : false
        };
    };

    function getToTimeShowOptions(fromTimeId, cdt) {
        var d = new Date($('#' + fromTimeId + '_datetimepicker').val()),
            dateString = moment(d).format('MMM DD, YYYY'),
            timeString = moment(d).format('hh:mm:ss A');

        return {
            minDate: dateString ? dateString : false,
            minTime: timeString ? timeString : false
        };
    };

    function getToTimeSelectOptions(fromTimeId, cdt) {
        var d = new Date($('#' + fromTimeId + '_datetimepicker').val()),
            fromDateString = moment(d).format('MMM dd, yyyy'),
            timeString = moment(d).format('hh:mm:ss A'),
            toDateString = moment(cdt).format('MMM DD, YYYY');

        return {
            minDate: fromDateString ? fromDateString : false,
            minTime: (toDateString == fromDateString) ? timeString : false
        };
    };

    function parseFilterANDClause(filters, query) {
        var filtersArray = splitString2Array(filters, ","),
            filter, filterBy, limitBy,
            parsedFilterArr = [], parsedLimit, filter_json_obj = {};

        for (var i = 0; i < filtersArray.length; i++) {
            filter = filtersArray[i];
            if(filter.indexOf('filter:') != -1) {
                filterBy = splitString2Array(filter, ":")[1];
                if(filterBy.length > 0) {
                    filter_json_obj["filter"] = parseFilterBy(filterBy);
                }
            } else if (filter.indexOf('limit:') != -1) {
                limitBy = splitString2Array(filter, ":")[1];
                if(limitBy.length > 0) {
                    filter_json_obj["limit"] = parseLimitBy(limitBy);
                }
            }
        }
        return filter_json_obj;
    };

    function parseFilterBy(filterBy) {
        var filtersArray, filtersLength, filterClause = [], i, filterObj;
        if (filterBy != null && filterBy.trim() != '') {
            filtersArray = filterBy.split(' AND ');
            filtersLength = filtersArray.length;
            for (i = 0; i < filtersLength; i += 1) {
                filtersArray[i] = filtersArray[i].trim();
                filterObj = getFilterObj(filtersArray[i]);
                filterClause.push(filterObj);
            }
            return filterClause;
        }
    };

    function getFilterObj(filter) {
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

    function parseFilterObj(filter, operator) {
        var filterObj, filterArray;
        filterArray = splitString2Array(filter, operator);
        if (filterArray.length > 1 && filterArray[1] != '') {
            filterObj = {"name": "", value: "", op: ""};
            filterObj.name = filterArray[0];
            filterObj.value = filterArray[1];
            filterObj.op = getOperatorCode(operator);
        }
        return filterObj
    };

    function parseLimitBy(limitBy) {
        try {
            var parsedLimit = parseInt(limitBy);
            return parsedLimit;
        } catch (error) {
            logutils.logger.error(error.stack);
        }
    };

    function parseWhereANDClause(whereANDClause) {
        var whereANDArray = whereANDClause.replace('(', '').replace(')', '').split(' AND '),
            whereANDLength = whereANDArray.length, i, whereANDClause, whereANDClauseArray, operator = '';
        for (i = 0; i < whereANDLength; i += 1) {
            whereANDArray[i] = whereANDArray[i].trim();
            whereANDClause = whereANDArray[i];
            if (whereANDClause.indexOf('&') == -1) {
                if (whereANDClause.indexOf('Starts with') != -1) {
                    operator = 'Starts with';
                    whereANDClauseArray = whereANDClause.split(operator);
                } else if (whereANDClause.indexOf('=') != -1) {
                    operator = '=';
                    whereANDClauseArray = whereANDClause.split(operator);
                }
                whereANDClause = {"name": "", value: "", op: ""};
                populateWhereANDClause(whereANDClause, whereANDClauseArray[0].trim(), whereANDClauseArray[1].trim(), operator);
                whereANDArray[i] = whereANDClause;
            } else {
                var whereANDClauseWithSuffixArrray = whereANDClause.split('&'),
                    whereANDTerm = '';
                // Treat whereANDClauseWithSuffixArrray[0] as a normal AND term and
                // whereANDClauseWithSuffixArrray[1] as a special suffix term
                if (whereANDClauseWithSuffixArrray != null && whereANDClauseWithSuffixArrray.length != 0) {
                    var tempWhereANDClauseWithSuffix;
                    for (var j = 0; j < whereANDClauseWithSuffixArrray.length; j++) {
                        if (whereANDClauseWithSuffixArrray[j].indexOf('Starts with') != -1) {
                            operator = 'Starts with';
                            whereANDTerm = whereANDClauseWithSuffixArrray[j].split(operator);
                        } else if (whereANDClauseWithSuffixArrray[j].indexOf('=') != -1) {
                            operator = '=';
                            whereANDTerm = whereANDClauseWithSuffixArrray[j].split(operator);
                        }
                        whereANDClause = {"name": "", value: "", op: ""};
                        populateWhereANDClause(whereANDClause, whereANDTerm[0].trim(), whereANDTerm[1].trim(), operator);
                        if (j == 0) {
                            tempWhereANDClauseWithSuffix = whereANDClause;
                        } else if (j == 1) {
                            tempWhereANDClauseWithSuffix.suffix = whereANDClause;
                        }
                    }
                    whereANDArray[i] = tempWhereANDClauseWithSuffix;
                }
            }
        }
        return whereANDArray;
    };

    function populateWhereANDClause(whereANDClause, fieldName, fieldValue, operator) {
        var validLikeOPRFields = ['sourcevn', 'destvn'],
            validRangeOPRFields = ['protocol', 'sourceip', 'destip', 'sport', 'dport'],
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

    function getOperatorCode(operator) {
        var operatorCode = -1;

        $.each(cowc.OPERATOR_CODES, function(operatorCodeKey, operatorCodeValue) {
            if(operator = operatorCodeValue) {
                operatorCode = operatorCodeKey;
                return false;
            }
        });

        return operatorCode;
    };

    return QEUtils;
});

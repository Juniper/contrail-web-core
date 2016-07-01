/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'core-basedir/js/common/qe.utils'
], function (_,qewu) {
    var QEDefaultConfig = function () {

        this.getQueryModelConfig = function (customModelConfig) {
            var defaultModelConfig = {
                "table_name": null,
                "table_type": null,
                "table_name_data_object": [],
                "query_prefix": cowc.DEFAULT_QUERY_PREFIX,
                "time_range": 600,
                "from_time": Date.now() - (10 * 60 * 1000),
                "from_time_utc": Date.now() - (10 * 60 * 1000),
                "to_time": Date.now(),
                "to_time_utc": Date.now(),
                "select": null,
                "time_granularity": 60,
                "time_granularity_unit": 'secs',
                "where": null,
                "where_json": null,
                "filter_json": null,
                "direction": '1',
                "filters": cowc.QE_DEFAULT_FILTER,
                "limit": cowc.QE_DEFAULT_LIMIT_150K,
                "sort_by" : null,
                "sort_order" : cowc.QE_DEFAULT_SORT_ORDER,
                "select_data_object": getSelectDataObject(),
                "where_data_object": {},
                "filter_data_object": {},
                "is_request_in_progress": false,
                "show_advanced_options": false
            };

            var modelConfig = $.extend(true, {}, defaultModelConfig, customModelConfig);

            return modelConfig;
        };
    };

    function getSelectDataObject() {
        var selectDataObject = {};

        selectDataObject.requestState = ko.observable(cowc.DATA_REQUEST_STATE_FETCHING);
        selectDataObject.fields = ko.observableArray([]);
        selectDataObject.enable_map = ko.observable({});

        selectDataObject.select_fields = ko.observableArray([]);
        selectDataObject.checked_fields = ko.observableArray([]);

        selectDataObject.on_select = function (root, data, event) {
            var tableType = root.table_type(),
                fieldName = data.name,
                dataObject = root.select_data_object(),
                checkedFields = dataObject.checked_fields,
                isEnableMap = dataObject.enable_map(),
                key, keyLower, nonAggKey;

            if (fieldName == 'T') {
                if (checkedFields.indexOf('T') != -1) {
                    checkedFields.remove('T=');
                    for (key in isEnableMap) {
                        keyLower = key.toLowerCase();
                        if (qewu.isAggregateField(key)) {
                            checkedFields.remove(key);
                            if (tableType === cowc.QE_FLOW_TABLE_TYPE) {
                                isEnableMap[key](false);
                            }

                            nonAggKey = key.substring(key.indexOf('(') + 1, key.indexOf(')'));
                            if(contrail.checkIfFunction(isEnableMap[nonAggKey]) && tableType === cowc.QE_FLOW_TABLE_TYPE) {
                                isEnableMap[nonAggKey](true);
                            }
                        }
                    }
                } else {
                    for (key in isEnableMap) {
                        keyLower = key.toLowerCase();
                        if (qewu.isAggregateField(key) && tableType === cowc.QE_FLOW_TABLE_TYPE) {
                            isEnableMap[key](true);
                        }
                    }
                }
            } else if (fieldName == 'T=') {
                if (checkedFields.indexOf('T=') != -1) {
                    checkedFields.remove('T');
                    for (key in isEnableMap) {
                        keyLower = key.toLowerCase();
                        if (qewu.isAggregateField(key)) {
                            if (tableType === cowc.QE_FLOW_TABLE_TYPE) {
                                isEnableMap[key](true);
                            }

                            nonAggKey = key.substring(key.indexOf('(') + 1, key.indexOf(')'));
                            if(contrail.checkIfFunction(isEnableMap[nonAggKey])) {
                                checkedFields.remove(nonAggKey);
                                if (tableType === cowc.QE_FLOW_TABLE_TYPE) {
                                    isEnableMap[nonAggKey](false);
                                }
                            }
                        }
                    }
                } else {
                    for (key in isEnableMap) {
                        keyLower = key.toLowerCase();
                        if (qewu.isAggregateField(key)) {
                            checkedFields.remove(key);
                            nonAggKey = key.substring(key.indexOf('(') + 1, key.indexOf(')'));
                            if(contrail.checkIfFunction(isEnableMap[nonAggKey]) && tableType === cowc.QE_FLOW_TABLE_TYPE) {
                                isEnableMap[nonAggKey](true);
                            }
                        }
                    }
                }
            }
            return true;
        };

        selectDataObject.on_select_all = function (data, event) {
            var tableType = data.table_type(),
                dataObject = data.select_data_object(),
                isEnableMap = dataObject.enable_map(),
                checkedFields = dataObject.checked_fields,
                key, nonAggKey;

            if (checkedFields().length == 0) {
                for (key in isEnableMap) {
                    if (tableType === cowc.QE_FLOW_TABLE_TYPE) {
                        isEnableMap[key](true);
                    }
                    checkedFields.remove(key);
                }

                for (key in isEnableMap) {
                    if (qewu.isAggregateField(key)) {
                        checkedFields.push(key);

                        nonAggKey = key.substring(key.indexOf('(') + 1, key.indexOf(')'));
                        if(contrail.checkIfFunction(isEnableMap[nonAggKey])) {
                            if (tableType === cowc.QE_FLOW_TABLE_TYPE) {
                                isEnableMap[nonAggKey](false);
                            }
                            if(checkedFields.indexOf(nonAggKey) != -1) {
                                checkedFields.remove(nonAggKey);
                            }
                        }
                    }
                    // don't select percentiles, uuid, T and source (only for stats) when we do a select all
                    else if((key.indexOf("PERCENTILES(") > -1) && (tableType == cowc.QE_STAT_TABLE_TYPE)) {
                        checkedFields.remove(key);
                    } else if (key == 'Source' && tableType != cowc.QE_STAT_TABLE_TYPE) {
                        checkedFields.push(key);
                    } else if (['T', 'Source', 'UUID'].indexOf(key) == -1 && isEnableMap[key]) {
                        checkedFields.push(key);
                    }
                }
            } else {
                for (key in isEnableMap) {
                    if (tableType === cowc.QE_FLOW_TABLE_TYPE) {
                        isEnableMap[key](true);
                    }
                    checkedFields.remove(key);
                }
            }
        };

        selectDataObject.reset = function(data, event) {
            var tableType = data.table_type(),
                dataObject = data.select_data_object(),
                isEnableMap = dataObject.enable_map(),
                checkedFields = dataObject.checked_fields;

            for(var key in isEnableMap) {
                checkedFields.remove(key);
                if (tableType === cowc.QE_FLOW_TABLE_TYPE) {
                    isEnableMap[key](true);
                }
            }
        };

        return selectDataObject;
    }

    return new QEDefaultConfig();
});

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
                "table_name_data_object": {
                    status: cowc.DATA_REQUEST_STATE_FETCHING,
                    data: []
                },
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
        selectDataObject.checked_map = ko.observable({});
        selectDataObject.select_fields = ko.observableArray([]);
        selectDataObject.aggTypes = ko.observableArray([]);

        selectDataObject.on_select = function (root, data, event) {
            var tableType = root.table_type(),
                fieldName = data.name,
                dataObject = root.select_data_object(),
                isEnableMap = dataObject.enable_map(),
                isCheckedMap = dataObject.checked_map(),
                key, keyLower, nonAggKey;

            if (fieldName == 'T') {
                if (isCheckedMap["T"]()) {
                    isCheckedMap["T="](false);
                    for (key in isEnableMap) {
                        keyLower = key.toLowerCase();
                        if (qewu.isAggregateField(key)) {
                            isCheckedMap[key](false);
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
                if (isCheckedMap["T="]()) {
                    isCheckedMap["T"](false);
                    for (key in isEnableMap) {
                        keyLower = key.toLowerCase();
                        if (qewu.isAggregateField(key)) {
                            if (tableType === cowc.QE_FLOW_TABLE_TYPE) {
                                isEnableMap[key](true);
                            }

                            nonAggKey = key.substring(key.indexOf('(') + 1, key.indexOf(')'));
                            if(contrail.checkIfFunction(isEnableMap[nonAggKey])) {
                                isCheckedMap[nonAggKey](false);
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
                            isCheckedMap[key](false);
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
                isCheckedMap = dataObject.checked_map(),
                checkedFields = qewu.getCheckedFields(isCheckedMap),
                key, nonAggKey;

            if (checkedFields.length == 0) {
                for (key in isEnableMap) {
                    if (tableType === cowc.QE_FLOW_TABLE_TYPE) {
                        isEnableMap[key](true);
                    }
                    isCheckedMap[key](false);
                }

                for (key in isEnableMap) {
                    if (qewu.isAggregateField(key)) {
                        isCheckedMap[key](true);

                        nonAggKey = key.substring(key.indexOf('(') + 1, key.indexOf(')'));
                        if (contrail.checkIfFunction(isEnableMap[nonAggKey])) {
                            if (tableType === cowc.QE_FLOW_TABLE_TYPE) {
                                isEnableMap[nonAggKey](false);
                            }
                            if (isCheckedMap[nonAggKey]()) {
                                isCheckedMap[nonAggKey](false);
                            }
                        }
                    }
                    // don't select percentiles, uuid, T and source (only for stats) when we do a select all
                    else if((key.indexOf("PERCENTILES(") > -1) && (tableType == cowc.QE_STAT_TABLE_TYPE)) {
                        isCheckedMap[key](false);
                    } else if (key == 'Source' && tableType != cowc.QE_STAT_TABLE_TYPE) {
                        isCheckedMap[key](true);
                    } else if (['T', 'Source', 'UUID'].indexOf(key) == -1 && isEnableMap[key]) {
                        isCheckedMap[key](true);
                    }
                }
            } else {
                for (key in isEnableMap) {
                    if (tableType === cowc.QE_FLOW_TABLE_TYPE) {
                        isEnableMap[key](true);
                    }
                    isCheckedMap[key](false);
                }
            }
        };

        selectDataObject.on_select_aggregate = function (root, aggregateType, event) {
            var tableType = root.table_type(),
                dataObject = root.select_data_object(),
                isEnableMap = dataObject.enable_map(),
                isCheckedMap = dataObject.checked_map(),
                selectFields = dataObject.select_fields();

            if(!selectDataObject.isSelectAggregateChecked(root, aggregateType)) {
                _.each(isEnableMap, function(enableMapValue, enableMapKey){
                    if (enableMapValue()) {
                        if (aggregateType == "Non Aggregate") {
                            selectFields.forEach(function (value, index) {
                                if (value.name == enableMapKey && value.aggregate_type == aggregateType) {
                                    isCheckedMap[enableMapKey](true);
                                }
                            });
                        } else {
                            if (enableMapKey.indexOf(aggregateType.toUpperCase()) > -1) {
                                isCheckedMap[enableMapKey](true);
                            } else if (tableType == cowc.QE_FLOW_TABLE_TYPE) {
                                if (enableMapKey.indexOf(aggregateType.toLowerCase()) > -1 && aggregateType == "Sum") {
                                    isCheckedMap[enableMapKey](true);
                                }
                            }
                        }
                    }
                });
            } else {
                _.each(isEnableMap, function(enableMapValue, enableMapKey){
                    if(aggregateType == "Non Aggregate"){
                        selectFields.forEach(function(selectValue,i) {
                            if(selectValue.name == enableMapKey && selectValue.aggregate_type == aggregateType){
                                isCheckedMap[enableMapKey](false);
                            }
                        });
                    }

                    if (enableMapKey.indexOf(aggregateType.toUpperCase()) > -1) {
                        isCheckedMap[enableMapKey](false);
                    } else if (tableType == cowc.QE_FLOW_TABLE_TYPE && enableMapKey.indexOf(aggregateType.toLowerCase()) > -1 && aggregateType == "Sum") {
                        isCheckedMap[enableMapKey](false);
                    }
                });
            }
        };

        selectDataObject.isSelectChecked = function (root) {
            var tableType = root.table_type(),
                dataObject = root.select_data_object(),
                isCheckedMap = dataObject.checked_map(),
                checkedFields = qewu.getCheckedFields(isCheckedMap);

            return (checkedFields.length !== 0)
        };

        selectDataObject.isSelectAggregateChecked = function (root, aggregateType) {
            var tableType = root.table_type(),
                dataObject = root.select_data_object(),
                selectFields = dataObject.select_fields,
                isCheckedMap = dataObject.checked_map(),
                checkedFields = qewu.getCheckedFields(isCheckedMap),
                selectAggregateChecked = false;

            if (checkedFields.length == 0) {
                return false;
            } else {
                checkedFields.forEach(function (checkedValue, i) {
                    //Handle defaults
                    if (aggregateType == 'Non Aggregate') {
                        selectFields().forEach(function (value, index) {
                            if (value.name == checkedValue && value.aggregate_type == aggregateType) {
                                selectAggregateChecked = true;
                            }
                        });
                    } else if (aggregateType == "Sum" && tableType == cowc.QE_FLOW_TABLE_TYPE && checkedValue.indexOf(aggregateType.toLowerCase()) > -1) {
                        selectAggregateChecked = true;
                    } else if (checkedValue.indexOf(aggregateType.toUpperCase()) > -1) {
                        selectAggregateChecked = true;
                    }
                });
            }
            return selectAggregateChecked;
        };

        selectDataObject.reset = function(data, event) {
            var tableType = data.table_type(),
                dataObject = data.select_data_object(),
                isEnableMap = dataObject.enable_map(),
                isCheckedMap = dataObject.checked_map();

            for(var key in isEnableMap) {
                isCheckedMap[key](false);
                if (tableType === cowc.QE_FLOW_TABLE_TYPE) {
                    isEnableMap[key](true);
                }
            }
        };

        return selectDataObject;
    }

    return new QEDefaultConfig();
});

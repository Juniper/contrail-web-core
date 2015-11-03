/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var QEDefaultConfig = function () {

        this.getQueryModelConfig = function (customModelConfig) {
            var defaultModelConfig = {
                "table_name": null,
                "table_type": null,
                "query_prefix": cowc.DEFAULT_QUERY_PREFIX,
                "time_range": 1800,
                "from_time": Date.now() - (10 * 60 * 1000),
                "from_time_utc": Date.now() - (10 * 60 * 1000),
                "to_time": Date.now(),
                "to_time_utc": Date.now(),
                "select": null,
                "time_granularity": 60,
                "time_granularity_unit": 'secs',
                "where": null,
                "where_json": null,
                "direction": '1',
                "filter": null,
                "select_data_object": getSelectDataObject(),
                "where_data_object": {}
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

        selectDataObject.select_all_text = ko.observable("Select All");
        selectDataObject.select_fields = ko.observableArray([]);
        selectDataObject.checked_fields = ko.observableArray([]);

        selectDataObject.on_select = function (root, data, event) {
            var fieldName = data.name,
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
                            isEnableMap[key](false);

                            nonAggKey = key.substring(key.indexOf('(') + 1, key.indexOf(')'));
                            if(contrail.checkIfFunction(isEnableMap[nonAggKey])) {
                                isEnableMap[nonAggKey](true);
                                if(checkedFields.indexOf(nonAggKey) == -1) {
                                    checkedFields.push(nonAggKey);
                                }
                            }
                        }
                    }
                } else {
                    for (key in isEnableMap) {
                        keyLower = key.toLowerCase();
                        if (qewu.isAggregateField(key)) {
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
                            isEnableMap[key](true);
                            checkedFields.push(key);

                            nonAggKey = key.substring(key.indexOf('(') + 1, key.indexOf(')'));
                            if(contrail.checkIfFunction(isEnableMap[nonAggKey])) {
                                checkedFields.remove(nonAggKey);
                                isEnableMap[nonAggKey](false);
                            }
                        }
                    }
                } else {
                    for (key in isEnableMap) {
                        keyLower = key.toLowerCase();
                        if (qewu.isAggregateField(key)) {
                            checkedFields.remove(key);

                            nonAggKey = key.substring(key.indexOf('(') + 1, key.indexOf(')'));
                            if(contrail.checkIfFunction(isEnableMap[nonAggKey])) {
                                isEnableMap[nonAggKey](true);
                            }
                        }
                    }
                }
            }
            return true;
        };

        selectDataObject.on_select_all = function (data, event) {
            var dataObject = data.select_data_object(),
                selectAllText = dataObject.select_all_text(),
                isEnableMap = dataObject.enable_map(),
                checkedFields = dataObject.checked_fields,
                key, nonAggKey;

            if (selectAllText == 'Select All') {
                dataObject.select_all_text('Clear All');

                for (key in isEnableMap) {
                    isEnableMap[key](true);
                    checkedFields.remove(key);
                }

                for (key in isEnableMap) {
                    if (qewu.isAggregateField(key)) {
                        checkedFields.push(key);

                        nonAggKey = key.substring(key.indexOf('(') + 1, key.indexOf(')'));
                        if(contrail.checkIfFunction(isEnableMap[nonAggKey])) {
                            isEnableMap[nonAggKey](false);
                            if(checkedFields.indexOf(nonAggKey) != -1) {
                                checkedFields.remove(nonAggKey);
                            }
                        }
                    } else if (key != "T" && isEnableMap[key]) {
                        checkedFields.push(key);
                    }
                }
            } else {
                dataObject.select_all_text('Select All');
                for (key in isEnableMap) {
                    isEnableMap[key](true);
                    checkedFields.remove(key);
                }
            }
        };

        selectDataObject.reset = function(data, event) {
            var dataObject = data.select_data_object(),
                isEnableMap = dataObject.enable_map(),
                checkedFields = dataObject.checked_fields;

            dataObject.select_all_text("Select All");

            for(var key in isEnableMap) {
                checkedFields.remove(key);
                isEnableMap[key](true);
            }
        };

        return selectDataObject;
    }

    return QEDefaultConfig;
});
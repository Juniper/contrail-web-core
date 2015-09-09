/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'knockout',
    'contrail-model'
], function (_, Backbone, Knockout, ContrailModel) {
    var QueryFormModel = ContrailModel.extend({
        defaultSelectFields: [],

        constructor: function (modelData) {
            var modelRemoteDataConfig;

            if (contrail.checkIfExist(this.defaultConfig.table_name)) {
                modelRemoteDataConfig = getModelRemoteDataConfig(this.defaultConfig.table_name, this.defaultSelectFields);
            }

            ContrailModel.prototype.constructor.call(this, modelData, modelRemoteDataConfig);

            return this;
        },

        saveSelect: function (callbackObj) {
            try {
                if (contrail.checkIfFunction(callbackObj.init)) {
                    callbackObj.init();
                }
                this.select(this.select_data_object().checked_fields().join(", "));
                if (contrail.checkIfFunction(callbackObj.success)) {
                    callbackObj.success();
                }
            } catch (error) {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(this.getFormErrorText(this.query_prefix()));
                }
            }
        },

        getQueryRequestPostData: function (serverCurrentTime) {
            var reqQueryObj = {},
                selectStr = this.select(),
                showChartToggle = selectStr.indexOf("T=") == -1 ? false : true,
                queryPrefix = this.query_prefix(),
                options = {
                    elementId: queryPrefix + '-results', gridHeight: 480, timeOut: 120000,
                    pageSize: 100, queryPrefix: 'fs', export: true, showChartToggle: showChartToggle,
                    labelStep: 1, baseUnit: 'mins', fromTime: 0, toTime: 0, interval: 0,
                    btnId: queryPrefix + '-query-submit', refreshChart: true, serverCurrentTime: serverCurrentTime
                };

            reqQueryObj['timeRange'] = this.time_range();
            reqQueryObj['fromTime'] = this.from_time();
            reqQueryObj['toTime'] = this.to_time();
            reqQueryObj['select'] = this.select();
            reqQueryObj['direction'] = this.direction();

            reqQueryObj = qewu.setUTCTimeObj(this.query_prefix(), reqQueryObj, options);

            reqQueryObj.table = 'FlowSeriesTable';
            reqQueryObj.queryId = qewu.generateQueryUUID();
            reqQueryObj.async = 'true';
            reqQueryObj.autoSort = 'true';
            reqQueryObj.autoLimit = 'true';

            return reqQueryObj;
        },

        reset: function (data, event) {
            this.time_range(30);
            this.select('');
            this.where('');
            this.direction("ingress");
            this.filter('');
            this.select_data_object().reset(data);
        },

        validations: {}
    });

    function getModelRemoteDataConfig(tableName, defaultSelectFields) {
        var tableSchemeUrl = '/api/qe/table/schema/' + tableName,
            modelRemoteDataConfig = {
                remote: {
                    ajaxConfig: {
                        url: tableSchemeUrl,
                        type: 'GET'
                    },
                    setData2Model: function (contrailViewModel, response) {
                        var selectFields = getSelectFields4Table(response, defaultSelectFields);
                        contrailViewModel.set({
                            'ui_added_parameters': {
                                'table_schema': response
                            }
                        });
                        contrailViewModel.attributes.select_data_object['select_fields'] = selectFields;
                        setEnable4SelectFields(selectFields, contrailViewModel.attributes.select_data_object['enable_map']);
                    }
                },
                vlRemoteConfig: {
                    vlRemoteList: []
                }
            };
        return modelRemoteDataConfig;
    };

    function getSelectFields4Table(tableSchema, defaultSelectFields) {
        var tableColumns = tableSchema['columns'],
            filteredSelectFields = [];

        $.each(tableColumns, function (k, v) {
            if (!(contrail.checkIfExist(v) && (v.name).indexOf('CLASS(') > -1)
                && !(contrail.checkIfExist(v) && (v.name).indexOf('UUID') > -1)
                && defaultSelectFields.indexOf(v.name) == -1) {

                filteredSelectFields.push(v);
            }
        });

        return filteredSelectFields;
    };

    function setEnable4SelectFields(selectFields, isEnableMap) {
        for (var i = 0; i < selectFields.length; i++) {
            isEnableMap[selectFields[i]['name']] = ko.observable(true);
        }
    }

    return QueryFormModel;
});

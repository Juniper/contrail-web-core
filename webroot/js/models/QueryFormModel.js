/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'knockout',
    'contrail-model',
    'query-or-model'
], function (_, Backbone, Knockout, ContrailModel, QueryOrModel) {
    var QueryFormModel = ContrailModel.extend({
        defaultSelectFields: [],

        constructor: function (modelData) {
            var modelRemoteDataConfig;

            if (contrail.checkIfExist(modelData.table_name)) {
                modelRemoteDataConfig = getModelRemoteDataConfig(modelData.table_name, this.defaultSelectFields);
            }

            ContrailModel.prototype.constructor.call(this, modelData, modelRemoteDataConfig);

            return this;
        },

        formatModelConfig: function(modelConfig) {

            var orClauses = [],
                orClauseModels = [], orClauseModel,
                orClausesCollectionModel;

            $.each(orClauses, function(orClauseKey, orClauseValue) {
                orClauseModel = new QueryOrModel(orClauseValue);
                orClauseModels.push(orClauseModel)
            });

            orClausesCollectionModel = new Backbone.Collection(orClauseModels);
            modelConfig['or_clauses'] = orClausesCollectionModel;


            return modelConfig;
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

        getAttributes4Server: function () {
            var modelAttrs = this.model().attributes,
                ignoreKeyList = ['elementConfigMap', 'errors', 'locks', 'ui_added_parameters'],
                attrs4Server = {};

            for (var key in modelAttrs) {
                if(modelAttrs.hasOwnProperty(key) && ignoreKeyList.indexOf(key) == -1) {
                    attrs4Server[key] = modelAttrs[key];
                }
            }

            return attrs4Server;
        },

        getQueryRequestPostData: function (serverCurrentTime) {
            var queryReqObj = {
                    formModelAttrs: this.getAttributes4Server()
                },
                selectStr = this.select(),
                showChartToggle = selectStr.indexOf("T=") == -1 ? false : true,
                queryPrefix = this.query_prefix(),
                options = {
                    elementId: queryPrefix + '-results', gridHeight: 480, timeOut: 120000,
                    pageSize: 100, queryPrefix: 'fs', export: true, showChartToggle: showChartToggle,
                    labelStep: 1, baseUnit: 'mins', fromTime: 0, toTime: 0, interval: 0,
                    btnId: queryPrefix + '-query-submit', refreshChart: true, serverCurrentTime: serverCurrentTime
                };

            queryReqObj['formModelAttrs'] = qewu.setUTCTimeObj(this.query_prefix(), queryReqObj['formModelAttrs'], options);

            queryReqObj.queryId = qewu.generateQueryUUID();

            queryReqObj.chunk = 1;
            queryReqObj.chunkSize = cowc.QE_RESULT_CHUNK_SIZE;
            queryReqObj.async = 'true';
            queryReqObj.autoSort = 'true';
            queryReqObj.autoLimit = 'true';

            return queryReqObj;
        },

        reset: function (data, event) {
            this.time_range(1800);
            this.time_granularity(60);
            this.time_granularity_unit('secs');
            this.select('');
            this.where('');
            this.direction("1");
            this.filter('');
            this.select_data_object().reset(data);
        },

        addWhereOrClause: function(elementId) {
            var orClauses = this.model().get('or_clauses'),
                newOrClause = new QueryOrModel();

            orClauses.add([newOrClause]);

            $('#' + elementId).find('.collection').accordion('refresh');
            $('#' + elementId).find('.collection').accordion("option", "active", -1);
        },

        getNameOptionList: function() {
            var uiAddedParameters = this.model().get('ui_added_parameters');

            return $.map(uiAddedParameters['table_schema_formatted'], function(schemaValue, schemaKey) {
                if(schemaValue.index) {
                    return {id: schemaValue.name, text: schemaValue.name};
                }
            });
        },

        isSuffixVisible: function(name) {
            var uiAddedParameters = this.model().get('ui_added_parameters'),
                suffixVisibility = false;

            $.each(uiAddedParameters['table_schema_formatted'], function(schemaKey, schemaValue) {
                if(schemaValue.name === name) {
                    suffixVisibility = !(schemaValue.suffixes === null);
                    return false;
                }
            });

            return suffixVisibility;
        },

        getSuffixNameOptionList: function(name) {
            var uiAddedParameters = this.model().get('ui_added_parameters'),
                suffixNameOptionList = [];

            $.each(uiAddedParameters['table_schema_formatted'], function(schemaKey, schemaValue) {
                if(schemaValue.name === name && schemaValue.suffixes !== null) {
                    suffixNameOptionList = $.map(schemaValue.suffixes, function(suffixValue, suffixKey) {
                        return {id: suffixValue, text: suffixValue};
                    });
                    return false;
                }
            });

            return suffixNameOptionList;
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
                        var selectFields = getSelectFields4Table(response, defaultSelectFields),
                            tableSchemaFormatted = [];

                        if (tableName === 'FlowSeriesTable') {
                            $.each(response.columns, function(schemaKey, schemaValue) {
                                if (schemaValue.index){
                                    if (schemaValue.name === 'protocol') {
                                        schemaValue.suffixes = ['sport', 'dport'];
                                        tableSchemaFormatted.push(schemaValue);
                                    } else if (schemaValue.name === 'sourcevn') {
                                        schemaValue.suffixes = ['sourceip'];
                                        tableSchemaFormatted.push(schemaValue);
                                    } else if (schemaValue.name === 'destvn') {
                                        schemaValue.suffixes = ['destip'];
                                        tableSchemaFormatted.push(schemaValue);
                                    } else if (schemaValue.name === 'vrouter') {
                                        tableSchemaFormatted.push(schemaValue);
                                    } else {
                                        schemaValue.index = false;
                                    }

                                }
                            });
                        }

                        contrailViewModel.set({
                            'ui_added_parameters': {
                                'table_schema': response,
                                'table_schema_formatted': tableSchemaFormatted
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

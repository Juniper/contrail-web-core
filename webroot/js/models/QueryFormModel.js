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
                modelRemoteDataConfig = getTableSchemaConfig(modelData.table_name, this.defaultSelectFields);
            }

            ContrailModel.prototype.constructor.call(this, modelData, modelRemoteDataConfig);

            this.model().on( "change:table_name", this.onChangeTable, this);

            return this;
        },

        onChangeTable: function(model) {
            this.reset(this);
            var tableName = model.attributes.table_name,
                tableSchemeUrl = '/api/qe/table/schema/' + tableName,
                ajaxConfig = {
                    url: tableSchemeUrl,
                    type: 'GET'
                },
                contrailViewModel = this.model(),
                defaultSelectFields = this.defaultSelectFields;

            if(tableName != '') {
                $.ajax(ajaxConfig).success(function(response) {
                    var selectFields = getSelectFields4Table(response, defaultSelectFields),
                        whereFields = getWhereFields4NameDropdown(response, tableName);

                    contrailViewModel.set({
                        'ui_added_parameters': {
                            'table_schema': response
                        }
                    });

                    contrailViewModel.attributes.select_data_object['select_fields'] = selectFields;

                    setEnable4SelectFields(selectFields, contrailViewModel.attributes.select_data_object['enable_map']);

                    contrailViewModel.attributes.where_data_object['name_option_list'] = whereFields;

                });
            }
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
                console.log(this.select_data_object().checked_fields().length)
                console.log(this.select_data_object().checked_fields().join(", "));
                if (contrail.checkIfFunction(callbackObj.success)) {
                    callbackObj.success();
                }
            } catch (error) {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(this.getFormErrorText(this.query_prefix()));
                }
            }
        },

        saveWhere: function (callbackObj) {
            try {
                if (contrail.checkIfFunction(callbackObj.init)) {
                    callbackObj.init();
                }
                var orClauses = this.model().get('or_clauses'),
                    orClauseStrArr = [];

                $.each(orClauses.models, function(orClauseKey, orClauseValue) {
                    if (orClauseValue.attributes.orClauseText !== '') {
                        orClauseStrArr.push('(' + orClauseValue.attributes.orClauseText + ')')
                    }
                });

                this.where(orClauseStrArr.join(' OR '));

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
                    pageSize: 100, queryPrefix: queryPrefix, export: true, showChartToggle: showChartToggle,
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

            delete queryReqObj.formModelAttrs.or_clauses;

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
            this.model().get('or_clauses').reset();
        },

        addWhereOrClause: function(elementId) {
            var orClauses = this.model().get('or_clauses'),
                newOrClause = new QueryOrModel();

            orClauses.add([newOrClause]);

            $('#' + elementId).find('.collection').accordion('refresh');
            $('#' + elementId).find('.collection').accordion("option", "active", -1);
        },

        getNameOptionList: function() {
            var whereDataObject = this.model().get('where_data_object');

            return $.map(whereDataObject['name_option_list'], function(schemaValue, schemaKey) {
                if(schemaValue.index) {
                    return {id: schemaValue.name, text: schemaValue.name};
                }
            });
        },

        isSuffixVisible: function(name) {
            var whereDataObject = this.model().get('where_data_object'),
                suffixVisibility = false;

            $.each(whereDataObject['name_option_list'], function(schemaKey, schemaValue) {
                if(schemaValue.name === name) {
                    suffixVisibility = !(schemaValue.suffixes === null);
                    return false;
                }
            });

            return suffixVisibility;
        },

        getSuffixNameOptionList: function(name) {
            var whereDataObject = this.model().get('where_data_object'),
                suffixNameOptionList = [];

            $.each(whereDataObject['name_option_list'], function(schemaKey, schemaValue) {
                if(schemaValue.name === name && schemaValue.suffixes !== null) {
                    suffixNameOptionList = $.map(schemaValue.suffixes, function(suffixValue, suffixKey) {
                        return {id: suffixValue, text: suffixValue};
                    });
                    return false;
                }
            });

            return suffixNameOptionList;
        },

        getTimeGranularityUnits: function() {
            var self = this;

            return Knockout.computed(function () {

                var timeRange = self.time_range(),
                    fromTime = new Date(self.from_time()).getTime(),
                    toTime = new Date(self.to_time()).getTime(),
                    timeGranularityUnits = [];

                timeGranularityUnits.push({id: "secs", text: "secs"});

                if (timeRange == -1) {
                    timeRange = (toTime - fromTime) / 1000;
                }

                if (timeRange > 60) {
                    timeGranularityUnits.push({id: "mins", text: "mins"});
                }
                if (timeRange > 3600) {
                    timeGranularityUnits.push({id: "hrs", text: "hrs"});
                }
                if (timeRange > 86400) {
                    timeGranularityUnits.push({id: "days", text: "days"});
                }

                return timeGranularityUnits;


            }, this);
        },

        addWhereOrClause: function(elementId) {
            var orClauses = this.model().get('or_clauses'),
                newOrClause = new QueryOrModel();

            orClauses.add([newOrClause]);

            $('#' + elementId).find('.collection').accordion('refresh');
            $('#' + elementId).find('.collection').accordion("option", "active", -1);
        },

        getNameOptionList: function() {
            var whereDataObject = this.model().get('where_data_object');

            return $.map(whereDataObject['name_option_list'], function(schemaValue, schemaKey) {
                if(schemaValue.index) {
                    return {id: schemaValue.name, text: schemaValue.name};
                }
            });
        },

        isSuffixVisible: function(name) {
            var whereDataObject = this.model().get('where_data_object'),
                suffixVisibility = false;

            $.each(whereDataObject['name_option_list'], function(schemaKey, schemaValue) {
                if(schemaValue.name === name) {
                    suffixVisibility = !(schemaValue.suffixes === null);
                    return false;
                }
            });

            return suffixVisibility;
        },

        getSuffixNameOptionList: function(name) {
            var whereDataObject = this.model().get('where_data_object'),
                suffixNameOptionList = [];

            $.each(whereDataObject['name_option_list'], function(schemaKey, schemaValue) {
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

    function getTableSchemaConfig(tableName, defaultSelectFields) {
        var tableSchemeUrl = '/api/qe/table/schema/' + tableName,
            modelRemoteDataConfig = {
                remote: {
                    ajaxConfig: {
                        url: tableSchemeUrl,
                        type: 'GET'
                    },
                    setData2Model: function (contrailViewModel, response) {
                        var selectFields = getSelectFields4Table(response, defaultSelectFields),
                            whereFields = getWhereFields4NameDropdown(response, tableName);

                        contrailViewModel.set({
                            'ui_added_parameters': {
                                'table_schema': response
                            }
                        });
                        contrailViewModel.attributes.select_data_object['select_fields'] = selectFields;
                        setEnable4SelectFields(selectFields, contrailViewModel.attributes.select_data_object['enable_map']);

                        contrailViewModel.attributes.where_data_object['name_option_list'] = whereFields;

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

    function getWhereFields4NameDropdown(tableSchema, tableName) {
        var tableSchemaFormatted = [];

        $.each(tableSchema.columns, function(schemaKey, schemaValue) {
            if (schemaValue.index){
                if (tableName === 'FlowSeriesTable') {
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
                } else {
                    tableSchemaFormatted.push(schemaValue);
                }
            }
        });

        return tableSchemaFormatted
    }

    function setEnable4SelectFields(selectFields, isEnableMap) {
        for (var key in isEnableMap) {
            delete isEnableMap[key];
        }

        for (var i = 0; i < selectFields.length; i++) {
            isEnableMap[selectFields[i]['name']] = ko.observable(true);
        }
    }

    return QueryFormModel;
});

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

            if(modelData['table_type'] == cowc.QE_OBJECT_TABLE_TYPE) {
                this.model().on("change:time_range", this.onChangeTime, this);
                this.model().on("change:from_time", this.onChangeTime, this);
                this.model().on("change:to_time", this.onChangeTime, this);
            }

            return this;
        },

        onChangeTime: function() {
            var model = this.model(),
                timeRange = model.attributes.time_range;

            //TODO: For custom time-range
            if(timeRange != -1) {
                this.setTableFieldValues();
            }
        },

        setTableFieldValues: function() {
            var tableName = this.table_name(),
                timeRange = this.time_range(),
                nameOptionList = this.where_data_object()['name_option_list'],
                nameCheckList = [];

            for(var i = 0; i < nameOptionList.length; i++) {
                nameCheckList.push(tableName + ":" + nameOptionList[i].name);
            }

            var data =  {
                fromTimeUTC: 'now-' + timeRange + "s",
                toTimeUTC: 'now',
                table_name: 'StatTable.FieldNames.fields',
                select: ['name', 'fields.value'],
                where: [[{"name":"name","value":tableName,"op":7}]]
            };

            $.ajax({
                url: '/api/qe/table/column/values',
                type: "POST",
                data: JSON.stringify(data),
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            }).done(function (resultJSON) {
                console.log(resultJSON);
            }).error(function(xhr) {
                console.log(xhr);
            });

        },

        onChangeTable: function() {
            var self = this,
                model = self.model();

            self.reset(this);
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

                    if(self.table_type() == cowc.QE_OBJECT_TABLE_TYPE) {
                        self.onChangeTime();
                    }
                }).error(function(xhr) {
                    console.log(xhr);
                });
            }
        },

        formatModelConfig: function(modelConfig) {
            var whereOrClauses = [],
                whereOrClauseModels = [], whereOrClauseModel,
                whereOrClausesCollectionModel,
                self = this;

            $.each(whereOrClauses, function(whereOrClauseKey, whereOrClauseValue) {
                whereOrClauseModel = new QueryOrModel(self, whereOrClauseValue);
                whereOrClauseModels.push(whereOrClauseModel)
            });

            whereOrClausesCollectionModel = new Backbone.Collection(whereOrClauseModels);
            modelConfig['where_or_clauses'] = whereOrClausesCollectionModel;


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

        saveWhere: function (callbackObj) {
            try {
                if (contrail.checkIfFunction(callbackObj.init)) {
                    callbackObj.init();
                }
                var whereOrClauses = this.model().get('where_or_clauses'),
                    whereOrClauseStrArr = [];

                $.each(whereOrClauses.models, function(whereOrClauseKey, whereOrClauseValue) {
                    if (whereOrClauseValue.attributes.whereOrClauseText !== '') {
                        whereOrClauseStrArr.push('(' + whereOrClauseValue.attributes.orClauseText + ')')
                    }
                });

                this.where(whereOrClauseStrArr.join(' OR '));

                if (contrail.checkIfFunction(callbackObj.success)) {
                    callbackObj.success();
                }
            } catch (error) {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(this.getFormErrorText(this.query_prefix()));
                }
            }
        },

        getFormModelAttributes: function () {
            var modelAttrs = this.model().attributes,
                ignoreKeyList = ['elementConfigMap', 'errors', 'locks', 'ui_added_parameters', 'where_or_clauses', 'select_data_object', 'where_data_object'],
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
                    formModelAttrs: this.getFormModelAttributes()
                },
                selectStr = this.select(),
                showChartToggle = selectStr.indexOf("T=") == -1 ? false : true,
                queryPrefix = this.query_prefix(),
                options = {
                    elementId: queryPrefix + '-results', gridHeight: 480, timeOut: cowc.QE_TIMEOUT,
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

            console.log(queryReqObj);

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
            this.model().get('where_or_clauses').reset();
        },

        addWhereOrClause: function(elementId) {
            var whereOrClauses = this.model().get('where_or_clauses'),
                newOrClause = new QueryOrModel(this);

            whereOrClauses.add([newOrClause]);

            //TODO: Should not be in Model
            $('#' + elementId).find('.collection').accordion('refresh');
            $('#' + elementId).find('.collection').accordion("option", "active", -1);
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

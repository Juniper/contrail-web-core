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
            var self = this,
                modelRemoteDataConfig;

            if (contrail.checkIfExist(modelData.table_name)) {
                modelRemoteDataConfig = getTableSchemaConfig(self, modelData.table_name, this.defaultSelectFields);
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

                    self.select_data_object().requestState((selectFields.length > 0) ? cowc.DATA_REQUEST_STATE_SUCCESS_NOT_EMPTY : cowc.DATA_REQUEST_STATE_SUCCESS_EMPTY);

                    contrailViewModel.set({
                        'ui_added_parameters': {
                            'table_schema': response
                        }
                    });

                    setEnable4SelectFields(selectFields, self.select_data_object().enable_map());
                    self.select_data_object().select_fields(selectFields);

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

                this.where(qewu.parseWhereCollection2String(this));

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
            var self = this,
                queryReqObj = {
                    formModelAttrs: this.getFormModelAttributes()
                },
                selectStr = self.select(),
                showChartToggle = selectStr.indexOf("T=") == -1 ? false : true,
                queryPrefix = self.query_prefix(),
                options = {
                    elementId: queryPrefix + '-results', gridHeight: 480, timeOut: cowc.QE_TIMEOUT,
                    pageSize: 100, queryPrefix: queryPrefix, export: true, showChartToggle: showChartToggle,
                    labelStep: 1, baseUnit: 'mins', fromTime: 0, toTime: 0, interval: 0,
                    btnId: queryPrefix + '-query-submit', refreshChart: true, serverCurrentTime: serverCurrentTime
                },
                formModelAttrs = qewu.setUTCTimeObj(this.query_prefix(), queryReqObj['formModelAttrs'], options);

            self.from_time_utc(formModelAttrs.from_time_utc);
            self.to_time_utc(formModelAttrs.to_time_utc);

            queryReqObj['formModelAttrs'] = formModelAttrs;
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
            this.model().get('where_or_clauses').reset();
        },

        addNewOrClauses: function(orClauseObject) {
            var self = this,
                whereOrClauses = this.model().get('where_or_clauses'),
                newOrClauses = [];

            $.each(orClauseObject, function(orClauseKey, orClauseValue) {
                newOrClauses.push(new QueryOrModel(self, orClauseValue));
            });

            whereOrClauses.add(newOrClauses);
        },

        addWhereOrClause: function(elementId) {
            this.addNewOrClauses([{}]);

            //TODO: Should not be in Model
            $('#' + elementId).find('.collection').accordion('refresh');
            $('#' + elementId).find('.collection').accordion("option", "active", -1);
        },

        isSuffixVisible: function(name) {
            var whereDataObject = this.model().get('where_data_object');
            name = contrail.checkIfFunction(name) ? name() : name;
            return (qewu.getNameSuffixKey(name, whereDataObject['name_option_list']) != -1);
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

    function getTableSchemaConfig(model, tableName, defaultSelectFields) {
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

                        model.select_data_object().requestState((selectFields.length > 0) ? cowc.DATA_REQUEST_STATE_SUCCESS_NOT_EMPTY : cowc.DATA_REQUEST_STATE_SUCCESS_EMPTY);

                        contrailViewModel.set({
                            'ui_added_parameters': {
                                'table_schema': response
                            }
                        });

                        setEnable4SelectFields(selectFields, model.select_data_object().enable_map());
                        model.select_data_object().select_fields(selectFields);

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
        if ($.isEmptyObject(tableSchema)) {
           return [];
        }
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
        if ($.isEmptyObject(tableSchema)) {
            return [];
        }
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

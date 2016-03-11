/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'knockout',
    'contrail-model',
    'query-or-model',
    'query-and-model'
], function (_, Backbone, Knockout, ContrailModel, QueryOrModel, QueryAndModel) {
    var QueryFormModel = ContrailModel.extend({
        defaultSelectFields: [],
        disableSelectFields: [],
        disableSubstringInSelectFields: ['CLASS('],
        disableWhereFields: [],

        constructor: function (modelData, queryReqConfig) {
            var self = this, modelRemoteDataConfig,
                defaultQueryReqConfig = {chunk: 1, autoSort: true, chunkSize: cowc.QE_RESULT_CHUNK_SIZE_10K, async: true};

            var defaultSelectFields = this.defaultSelectFields,
                disableFieldArray = [].concat(defaultSelectFields).concat(this.disableSelectFields),
                disableSubstringArray = this.disableSubstringInSelectFields;

            if (contrail.checkIfExist(modelData.table_name)) {
                modelRemoteDataConfig = getTableSchemaConfig(self, modelData.table_name, disableFieldArray, disableSubstringArray, this.disableWhereFields);
            }

            if(contrail.checkIfExist(queryReqConfig)) {
                defaultQueryReqConfig = $.extend(true, defaultQueryReqConfig, queryReqConfig);
            }

            this.defaultQueryReqConfig = defaultQueryReqConfig;

            ContrailModel.prototype.constructor.call(this, modelData, modelRemoteDataConfig);

            this.model().on( "change:table_name", this.onChangeTable, this);

            //TODO - Needs to be tested for Flow Pages
            this.model().on("change:time_range change:from_time change:to_time", this.onChangeTime, this);

            return this;
        },

        onChangeTime: function() {
            if(this.table_type() === 'STAT') {
                // reset everything except time range
                this.reset(this, null, false, true);
                this.setTableValues();
            }
            this.setTableFieldValues();
        },

        setTableValues: function() {
            var self = this,
                contrailViewModel = this.model(),
                timeRange = contrailViewModel.attributes.time_range;

            function fetchTableValues(fromTimeUTC, toTimeUTC) {
                var data = {
                    fromTimeUTC: fromTimeUTC,
                    toTimeUTC  : toTimeUTC,
                    table_name : 'StatTable.FieldNames.fields',
                    select     : ['name', 'fields.value'],
                    where      : [[{"name": "name", "value": "STAT", "op": 7}]]
                };
                $.ajax({
                    url: '/api/qe/table/column/values',
                    type: "POST",
                    data: JSON.stringify(data),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                }).done(function (resultJSON) {
                    var resultArr = [];
                    $.each(resultJSON.data, function(dataKey, dataValue) {
                        var nameOption = dataValue.name.split(':')[1];
                        resultArr.push(nameOption);
                    });
                    self.table_name_data_object(resultArr);
                }).error(function(xhr) {
                    console.log(xhr);
                });
            };

            if (timeRange == -1) {
                var fromTimeUTC = new Date(contrailViewModel.attributes.from_time).getTime(),
                    toTimeUTC = new Date(contrailViewModel.attributes.to_time).getTime();

                fetchTableValues(fromTimeUTC, toTimeUTC);
            } else {
                qewu.fetchServerCurrentTime(function (serverCurrentTime) {
                    var fromTimeUTC = serverCurrentTime - (timeRange * 1000),
                        toTimeUTC = serverCurrentTime;

                    fetchTableValues(fromTimeUTC, toTimeUTC);
                });
            }
        },
        setTableFieldValues: function() {
            var contrailViewModel = this.model(),
                tableName = contrailViewModel.attributes.table_name,
                timeRange = contrailViewModel.attributes.time_range;

            if (contrail.checkIfExist(tableName)) {
                qewu.fetchServerCurrentTime(function(serverCurrentTime) {
                    var fromTimeUTC = serverCurrentTime - (timeRange * 1000),
                        toTimeUTC = serverCurrentTime

                    if (timeRange == -1) {
                        fromTimeUTC = new Date(contrailViewModel.attributes.from_time).getTime();
                        toTimeUTC = new Date(contrailViewModel.attributes.to_time).getTime();
                    }

                    var data =  {
                        fromTimeUTC: fromTimeUTC,
                        toTimeUTC: toTimeUTC,
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
                        var valueOptionList = {};
                        $.each(resultJSON.data, function(dataKey, dataValue) {
                            var nameOption = dataValue.name.split(':')[1];

                            if (!contrail.checkIfExist(valueOptionList[nameOption])) {
                                valueOptionList[nameOption] = [];
                            }

                            valueOptionList[nameOption].push(dataValue['fields.value']);
                        });

                        contrailViewModel.attributes.where_data_object['value_option_list'] = valueOptionList;

                    }).error(function(xhr) {
                        console.log(xhr);
                    });
                });
            }
        },

        onChangeTable: function() {
            var self = this,
                model = self.model();

            if (self.table_type() == cowc.QE_OBJECT_TABLE_TYPE) {
                self.reset(this, null, true, false);
            } else if (self.table_type() == cowc.QE_STAT_TABLE_TYPE) {
                // reset everything except time range and table name
                self.reset(this, null, false, false);
            }

            var tableName = model.attributes.table_name,
                tableSchemeUrl = '/api/qe/table/schema/' + tableName,
                ajaxConfig = {
                    url: tableSchemeUrl,
                    type: 'GET'
                },
                contrailViewModel = this.model(),
                defaultSelectFields = this.defaultSelectFields,
                disableFieldArray = [].concat(defaultSelectFields).concat(this.disableSelectFields),
                disableSubstringArray = this.disableSubstringInSelectFields;

            if(tableName != '') {
                $.ajax(ajaxConfig).success(function(response) {
                    var selectFields = getSelectFields4Table(response, disableFieldArray, disableSubstringArray),
                        whereFields = getWhereFields4NameDropdown(response, tableName, self.disableWhereFields);

                    self.select_data_object().requestState((selectFields.length > 0) ? cowc.DATA_REQUEST_STATE_SUCCESS_NOT_EMPTY : cowc.DATA_REQUEST_STATE_SUCCESS_EMPTY);
                    contrailViewModel.set({
                        'ui_added_parameters': {
                            'table_schema': response,
                            'table_schema_column_names_map' : getTableSchemaColumnMap(response)
                        }
                    });

                    setEnable4SelectFields(selectFields, self.select_data_object().enable_map());
                    self.select_data_object().select_fields(selectFields);

                    contrailViewModel.attributes.where_data_object['name_option_list'] = whereFields;

                    if (self.table_type() == cowc.QE_OBJECT_TABLE_TYPE) {
                        self.onChangeTime();
                    } else if (self.table_type() == cowc.QE_STAT_TABLE_TYPE) {
                        self.setTableFieldValues();
                    }
                }).error(function(xhr) {
                    console.log(xhr);
                });
            }
        },

        formatModelConfig: function(modelConfig) {
            var whereOrClausesCollectionModel, filterAndClausesCollectionModel;

            whereOrClausesCollectionModel = new Backbone.Collection([]);
            modelConfig['where_or_clauses'] = whereOrClausesCollectionModel;

            filterAndClausesCollectionModel = new Backbone.Collection([]);
            modelConfig['filter_and_clauses'] = filterAndClausesCollectionModel;

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

        saveFilter: function (callbackObj) {
            try {
                if (contrail.checkIfFunction(callbackObj.init)) {
                    callbackObj.init();
                }

                this.filters(qewu.parseFilterCollection2String(this));

                if (contrail.checkIfFunction(callbackObj.success)) {
                    callbackObj.success();
                }
            } catch (error) {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(this.getFormErrorText(this.query_prefix()));
                }
            }
        },

        isSelectTimeChecked: function() {
            var self = this,
                selectString = self.select(),
                selectStringCheckedFields = (selectString !== null) ? selectString.split(', ') : [];

            return selectStringCheckedFields.indexOf("T=") != -1;
        },

        toggleAdvancedFields: function() {
            var showAdvancedOptions = this.model().get('show_advanced_options');
            this.show_advanced_options(!showAdvancedOptions);
        },

        getAdvancedOptionsText: function() {
            var showAdvancedOptions = this.show_advanced_options();

            if (!showAdvancedOptions) {
                return 'Show Advanced Options';
            } else {
                return 'Hide Advanced Options';
            }
        },

        getSortByOptionList: function(viewModel) {
            var validSortFields = this.select_data_object().checked_fields(),
                invalidSortFieldsArr = ["T=" , "UUID"],
                resultSortFieldsDataArr = [];

            for(var i=0; i< validSortFields.length; i++){
                if(invalidSortFieldsArr.indexOf(validSortFields[i]) === -1) {
                    resultSortFieldsDataArr.push({id: validSortFields[i], text: validSortFields[i]});
                }
            }
            return resultSortFieldsDataArr;
        },

        getFormModelAttributes: function () {
            var modelAttrs = this.model().attributes,
                attrs4Server = {},
                ignoreKeyList = ['elementConfigMap', 'errors', 'locks', 'ui_added_parameters', 'where_or_clauses', 'select_data_object', 'where_data_object',
                                 'filter_data_object', 'filter_and_clauses', 'sort_by', 'sort_order', 'log_category', 'log_type', 'is_request_in_progress',
                                 'show_advanced_options'];

            for (var key in modelAttrs) {
                if(modelAttrs.hasOwnProperty(key) && ignoreKeyList.indexOf(key) == -1) {
                    attrs4Server[key] = modelAttrs[key];
                }
            }

            return attrs4Server;
        },

        getQueryRequestPostData: function (serverCurrentTime, customQueryReqObj, useOldTime) {
            var self = this,
                formModelAttrs = this.getFormModelAttributes(),
                queryReqObj = {};

            if(useOldTime != true) {
                qewu.setUTCTimeObj(this.query_prefix(), formModelAttrs, serverCurrentTime);
            }

            self.from_time_utc(formModelAttrs.from_time_utc);
            self.to_time_utc(formModelAttrs.to_time_utc);

            queryReqObj['formModelAttrs'] = formModelAttrs;
            queryReqObj.queryId = qewu.generateQueryUUID();
            queryReqObj.engQueryStr = qewu.getEngQueryStr(formModelAttrs);

            queryReqObj = $.extend(true, self.defaultQueryReqConfig, queryReqObj, customQueryReqObj)

            return queryReqObj;
        },

        reset: function (data, event, resetTR, resetTable) {
            var resetTR = contrail.checkIfExist(resetTR) ? resetTR : true,
                resetTable = contrail.checkIfExist(resetTable) ? resetTable : true;

            if(resetTR) {
                this.time_range(600);
            }
            if(resetTable) {
                this.table_name('');
            }
            this.time_granularity(60);
            this.time_granularity_unit('secs');
            this.select('');
            this.where('');
            this.direction("1");
            this.filters('');
            this.select_data_object().reset(data);
            this.model().get('where_or_clauses').reset();
            this.model().get('filter_and_clauses').reset();
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

        addNewFilterAndClause: function(andClauseObject) {
            var self = this,
                filterObj = andClauseObject.filter,
                limitObj = andClauseObject.limit,
                sortByArr = andClauseObject.sort_fields,
                sortOrderStr = andClauseObject.sort_order,
                filterAndClauses = this.model().attributes.filter_and_clauses;

            if(contrail.checkIfExist(filterObj)) {
                $.each(filterObj, function(filterObjKey, filterObjValue) {
                    var modelDataObj = {
                        name    : filterObjValue.name,
                        operator: filterObjValue.op,
                        value   : filterObjValue.value
                    };
                    var newAndClause = new QueryAndModel(self.model().attributes, modelDataObj);
                    filterAndClauses.add(newAndClause);
                });
            }
            if(contrail.checkIfExist(limitObj)) {
                this.limit(limitObj);
            }
            if(contrail.checkIfExist(sortOrderStr)) {
                this.sort_order(sortOrderStr);
            }
            if(contrail.checkIfExist(sortByArr) && sortByArr.length > 0) {
                this.sort_by(sortByArr);
            }
        },

        addFilterAndClause: function() {
            var andClauses = this.model().get('filter_and_clauses'),
                newAndClause = new QueryAndModel(this.model().attributes);
            andClauses.add([newAndClause]);
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

        validations: {
            runQueryValidation: {
                'table_name': {
                    required: true,
                    msg: ctwm.getRequiredMessage('table name')
                },
                'select': {
                    required: true,
                    msg: ctwm.getRequiredMessage('select')
                },
                from_time: function(value) {
                    var fromTime = new Date(value).getTime(),
                        toTime = new Date(this.attributes.to_time).getTime(),
                        timeRange = this.attributes.time_range;

                    if(fromTime > toTime && timeRange == -1) {
                        return cowm.FROM_TIME_SMALLER_THAN_TO_TIME;
                    }
                },
                to_time: function(value) {
                    var toTime = new Date(value).getTime(),
                        fromTime = new Date(this.attributes.from_time).getTime(),
                        timeRange = this.attributes.time_range;

                    if (toTime < fromTime && timeRange == -1) {
                        return cowm.TO_TIME_GREATER_THAN_FROM_TIME;
                    }
                }
            }
        }
    });

    function getTableSchemaConfig(model, tableName, disableFieldArray, disableSubstringArray, disableWhereFields) {
        var tableSchemeUrl = '/api/qe/table/schema/' + tableName,
            modelRemoteDataConfig = {
                remote: {
                    ajaxConfig: {
                        url: tableSchemeUrl,
                        type: 'GET'
                    },
                    setData2Model: function (contrailViewModel, response) {
                        var selectFields = getSelectFields4Table(response, disableFieldArray, disableSubstringArray),
                            whereFields = getWhereFields4NameDropdown(response, tableName, disableWhereFields);

                        model.select_data_object().requestState((selectFields.length > 0) ? cowc.DATA_REQUEST_STATE_SUCCESS_NOT_EMPTY : cowc.DATA_REQUEST_STATE_SUCCESS_EMPTY);
                        contrailViewModel.set({
                            'ui_added_parameters': {
                                'table_schema': response,
                                'table_schema_column_names_map' : getTableSchemaColumnMap(response)
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

    function getTableSchemaColumnMap (tableSchema) {
        var tableSchemaColumnMapObj = {},
            cols = tableSchema.columns;
        for(var i = 0; i < cols.length; i++) {
            var colName = cols[i]["name"];
            tableSchemaColumnMapObj[colName]  = cols[i];
        }
        return tableSchemaColumnMapObj;
    };

    function getSelectFields4Table(tableSchema, disableFieldArray, disableSubstringArray) {
        if ($.isEmptyObject(tableSchema)) {
           return [];
        }
        var tableColumns = tableSchema['columns'],
            filteredSelectFields = [];

        $.each(tableColumns, function (k, v) {
            if (contrail.checkIfExist(v) && showSelectField(v.name, disableFieldArray, disableSubstringArray)) {
                filteredSelectFields.push(v);
            }
        });

        _.sortBy(filteredSelectFields, 'name');
        return filteredSelectFields;
    };

    function showSelectField(fieldName, disableFieldArray, disableSubstringArray) {
        var showField = true;

        for (var i = 0; i < disableSubstringArray.length; i++) {
            if(fieldName.indexOf(disableSubstringArray[i]) != -1) {
                showField = false;
                break;
            }
        }

        if(disableFieldArray.indexOf(fieldName) != -1) {
            showField = false;
        }

        return showField;
    };

    function getWhereFields4NameDropdown(tableSchema, tableName, disableWhereFields) {
        if ($.isEmptyObject(tableSchema)) {
            return [];
        }
        var tableSchemaFormatted = [];

        $.each(tableSchema.columns, function(schemaKey, schemaValue) {
            if (schemaValue.index && disableWhereFields.indexOf(schemaValue.name) == -1){
                if (tableName === 'FlowSeriesTable' || tableName === 'FlowRecordTable') {
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

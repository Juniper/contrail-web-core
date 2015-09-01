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
        defaultConfig: qewmc.getQueryModel(),

        constructor: function (modelData) {
            var modelRemoteDataConfig;

            if (contrail.checkIfExist(this.defaultConfig.table_name)) {
                modelRemoteDataConfig = getModelRemoteDataConfig(this.defaultConfig.table_name);
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

        validations: {}
    });

    function getModelRemoteDataConfig(tableName) {
        var tableSchemeUrl = '/api/admin/table/schema/' + tableName,
            modelRemoteDataConfig = {
                remote: {
                    ajaxConfig: {
                        url: tableSchemeUrl,
                        type: 'GET'
                    },
                    setData2Model: function (contrailViewModel, response) {
                        var selectFields = getSelectFields4Table(response);
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

    function getSelectFields4Table(tableSchema) {
        var tableColumns = tableSchema['columns'],
            filteredSelectFields = [];

        $.each(tableColumns, function (k, v) {
            if (!(contrail.checkIfExist(v) && (v.name).indexOf('CLASS(') > -1) && !(contrail.checkIfExist(v) && (v.name).indexOf('UUID') > -1)) {
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

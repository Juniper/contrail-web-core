/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    "lodash",
    "core-constants",
    "query-form-model",
    "core-basedir/reports/udd/ui/js/common/udd.form.validation.config",
    "core-basedir/reports/qe/ui/js/common/qe.model.config"
], function(_, coreConstants, QueryFormModel, formValidationConfig, qeModelConfig) {
    var QueryConfigModel = QueryFormModel.extend({
        defaultSelectFields: [],
        constructor: function(modelConfig, queryReqConfig) {
            var defaultOptions = {},
                flowTableDefaults = {};

            flowTableDefaults[coreConstants.FLOW_SERIES_TABLE] = coreConstants.QE_FS_DEFAULT_MODEL_CONFIG;
            flowTableDefaults[coreConstants.FLOW_RECORD_TABLE] = coreConstants.QE_FR_DEFAULT_MODEL_CONFIG;
            defaultOptions[coreConstants.QE_LOG_TABLE_TYPE] = coreConstants.QE_SL_DEFAULT_MODEL_CONFIG;
            defaultOptions[coreConstants.QE_STAT_TABLE_TYPE] = coreConstants.QE_STAT_DEFAULT_MODEL_CONFIG;
            defaultOptions[coreConstants.QE_OBJECT_TABLE_TYPE] = coreConstants.QE_OL_DEFAULT_MODEL_CONFIG;

            var defaultConfig = qeModelConfig.getQueryModelConfig({
                keywords: "",
                log_level: "",
                limit: ""
            });

            var modelData = _.merge(defaultConfig, modelConfig, {limit: coreConstants.QE_DEFAULT_LIMIT_50K});

            QueryFormModel.prototype.constructor.call(this, modelData, queryReqConfig);

            this.model().on("change:table_type", function(model, tableType) {
                model.set(defaultOptions[tableType]);
                // TODO select values are not set on first call
                model.set(defaultOptions[tableType]);
            });

            this.model().on("change:table_name", function(model, tableName) {
                var tableType = model.get("table_type");

                if (tableType === coreConstants.QE_FLOW_TABLE_TYPE) {
                    model.set(
                            _.merge({
                                table_name: tableName
                            },
                            flowTableDefaults[tableName])
                        );
                }
            });

            this.model().on("change", function(model) {
                model.isValid(true, cowc.KEY_RUN_QUERY_VALIDATION);
            });
            
            return this;
        },

        validations: formValidationConfig.mixValidationRules(QueryFormModel.prototype.validations, formValidationConfig.UDDQueryConfigValidations),

        reset: function(data, event, resetTR, resetTable) {
            resetTable = contrail.checkIfExist(resetTable) ? resetTable : this.query_prefix() !== coreConstants.SYSTEM_LOGS_PREFIX;
            QueryFormModel.prototype.reset.call(this, data, event, resetTR, resetTable);
        }
    });

    return QueryConfigModel;
});

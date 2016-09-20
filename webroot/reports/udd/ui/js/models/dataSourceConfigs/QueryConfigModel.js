/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    "lodash",
    "core-basedir/reports/qe/ui/js/common/qe.model.config",
    "core-constants",
    "query-form-model"
], function(_, qeModelConfig, coreConstants, QueryFormModel) {
    var QueryConfigModel = QueryFormModel.extend({
        defaultSelectFields: [],
        constructor: function(modelConfig, queryReqConfig) {
            var self = this;

            var defaultOptions = {},
                flowTableDefaults = {};

            defaultOptions[coreConstants.QE_LOG_TABLE_TYPE] = {
                query_prefix: coreConstants.SYSTEM_LOGS_PREFIX,
                table_name: coreConstants.MESSAGE_TABLE,
                select: coreConstants.DEFAULT_SL_SELECT_FIELDS,
                log_level: "7",
                keywords: "",
                limit: coreConstants.QE_DEFAULT_LIMIT_50K,
            };

            defaultOptions[coreConstants.QE_STAT_TABLE_TYPE] = {
                query_prefix: coreConstants.STAT_QUERY_PREFIX,
            };

            defaultOptions[coreConstants.QE_OBJECT_TABLE_TYPE] = {
                query_prefix: coreConstants.OBJECT_LOGS_PREFIX,
                limit: coreConstants.QE_DEFAULT_LIMIT_50K
            };

            flowTableDefaults[coreConstants.FLOW_SERIES_TABLE] = {
                query_prefix: coreConstants.FS_QUERY_PREFIX,
                select: coreConstants.DEFAULT_FS_SELECT_FIELDS,
            };

            flowTableDefaults[coreConstants.FLOW_RECORD_TABLE] = {
                query_prefix: coreConstants.FR_QUERY_PREFIX,
                select: coreConstants.DEFAULT_FR_SELECT_FIELDS,
            };

            var defaultConfig = qeModelConfig.getQueryModelConfig({
                keywords: "",
                log_level: "",
                limit: "",
            });

            var modelData = _.merge(defaultConfig, modelConfig);
            QueryFormModel.prototype.constructor.call(self, modelData, queryReqConfig);
            self.model().on("change:table_type", function(model, tableType) {
                model.set(defaultOptions[tableType]);
                // TODO select values are not set on first call
                model.set(defaultOptions[tableType]);
            });
            self.model().on("change:table_name", function(model, tableName) {
                var tableType = model.get("table_type");
                if (tableType === coreConstants.QE_FLOW_TABLE_TYPE) {
                    model.set(_.merge({
                        table_name: tableName
                    },
                        flowTableDefaults[tableName])
                    );
                }
            });

            return self;
        },

        timeSeries: function() {
            var self = this;
            return _.without((self.select() || "").split(", "), "T=");
        },

        reset: function(data, event, resetTR, resetTable) {
            resetTable = contrail.checkIfExist(resetTable) ? resetTable : this.query_prefix() !== coreConstants.SYSTEM_LOGS_PREFIX;
            QueryFormModel.prototype.reset.call(this, data, event, resetTR, resetTable);
        },
    });

    return QueryConfigModel;
});

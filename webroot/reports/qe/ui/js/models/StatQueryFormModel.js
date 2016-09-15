/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    "lodash",
    "knockout",
    "query-form-model",
    "core-basedir/js/common/qe.model.config",
    "core-constants"
], function (_, Knockout, QueryFormModel, queryEngineModelConfig, coreConstants) {
    var StatQueryFormModel = QueryFormModel.extend({

        defaultSelectFields: [],

        constructor: function (modelConfig, queryReqConfig) {
            var defaultConfig = queryEngineModelConfig.getQueryModelConfig({
                table_type: coreConstants.QE_STAT_TABLE_TYPE,
                query_prefix: coreConstants.STAT_QUERY_PREFIX,
            });

            var modelData = _.merge(defaultConfig, modelConfig);
            QueryFormModel.prototype.constructor.call(this, modelData, queryReqConfig);

            return this;
        },

        isTableNameAvailable: function () {
            var tableName = this.table_name();
            return !(tableName === null || tableName === "");
        },
    });

    return StatQueryFormModel;
});

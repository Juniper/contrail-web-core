/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'knockout',
    'query-form-model',
    'core-basedir/reports/qe/ui/js/common/qe.model.config'
], function (_, Knockout, QueryFormModel, qeModelConfig) {
    var ObjectLogsFormModel = QueryFormModel.extend({

        defaultSelectFields: [],

        constructor: function (modelData, queryReqConfig) {
            var defaultConfig = qeModelConfig.getQueryModelConfig({
                table_type: cowc.QE_OBJECT_TABLE_TYPE,
                query_prefix: cowc.OBJECT_LOGS_PREFIX,
                limit: cowc.QE_DEFAULT_LIMIT_50K
            });

            modelData = $.extend(true, {}, defaultConfig, modelData);
            QueryFormModel.prototype.constructor.call(this, modelData, $.extend(true, queryReqConfig, {chunkSize: cowc.QE_RESULT_CHUNK_SIZE_10K}));

            return this;
        },

        isTableNameAvailable: function() {
            var tableName = this.table_name();

            return !(tableName === null || tableName === '');
        }
    });

    return ObjectLogsFormModel;
});

/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'knockout',
    'query-form-model',
    'core-basedir/js/common/qe.model.config'
], function (_, Knockout, QueryFormModel,qewmc) {
    var NodeConsoleLogsModel = QueryFormModel.extend({

        defaultSelectFields: [],
        disableSelectFields: ['Type', 'SequenceNum', 'Context', 'Keyword'],

        constructor: function (modelData, queryReqConfig) {
            var defaultConfig = qewmc.getQueryModelConfig({
                time_range: 600,
                select: "MessageTS,Messagetype,Level,Category,Xmlmessage",
                hostname:"",
                node_type: "",
                table_name: cowc.MESSAGE_TABLE,
                table_type: cowc.QE_LOG_TABLE_TYPE,
                query_prefix: cowc.CONSOLE_LOGS_PREFIX,
                log_category: "",
                log_type: "",
                log_level: "5",
                limit: "50",
                keywords: "",
                where:""
            });

            modelData = $.extend(true, {}, defaultConfig, modelData);
            QueryFormModel.prototype.constructor.call(this, modelData, $.extend(true, queryReqConfig, {chunkSize: cowc.QE_RESULT_CHUNK_SIZE_1K, async: false}));
            return this;
        },

        validations: {},

        reset: function (data, event) {
            this.time_range(600);
            this.log_category('');
            this.log_type('any');
            this.log_level('5');
            this.limit("50");
            this.keywords('');
        },
    });

    return NodeConsoleLogsModel;
});

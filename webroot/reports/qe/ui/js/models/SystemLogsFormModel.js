/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    "lodash",
    "core-constants",
    "query-form-model",
    "core-basedir/reports/qe/ui/js/common/qe.model.config"
], function (_, coreConstants, QueryFormModel, qeModelConfig) {
    var SystemLogsFormModel = QueryFormModel.extend({
        defaultSelectFields: ["Type"],
        disableSelectFields: ["SequenceNum", "Context", "Keyword"],
        disableWhereFields: ["Level", "Keyword"],

        constructor: function (modelConfig, _queryReqConfig) {
            var defaultConfig = qeModelConfig.getQueryModelConfig(coreConstants.QE_SL_DEFAULT_MODEL_CONFIG);
            var queryReqConfig = {chunkSize: coreConstants.QE_RESULT_CHUNK_SIZE_10K};

            var modelData = _.merge(defaultConfig, modelConfig);
            _.merge(queryReqConfig, _queryReqConfig);
            QueryFormModel.prototype.constructor.call(this, modelData, queryReqConfig);

            return this;
        },
    });

    return SystemLogsFormModel;
});

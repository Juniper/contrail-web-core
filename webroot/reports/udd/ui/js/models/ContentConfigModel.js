/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    "lodash",
    "contrail-model"
], function(_, ContrailModel) {

    return ContrailModel.extend({
        constructor: function(modelConfig, modelRemoteDataConfig) {
            /**
             * Use contract defined by defaultConfig to sanitize modelConfig
             */
            modelConfig = this.normalizeModelConfig(modelConfig);
            ContrailModel.prototype.constructor.call(this, modelConfig, modelRemoteDataConfig);
        },
        onDataModelChange: function() {},

        toJSON: function() {
            return {};
        },

        getParserOptions: function() {
            return {};
        },

        getContentViewOptions: function() {
            return {};
        },

        normalizeModelConfig: function(modelConfig) {
            if (this.defaultConfig) {
                var picked = _.pick(modelConfig, function(propVal, propName) {
                    return propName in this.defaultConfig;
                }, this);

                return picked;
            } else {
                return modelConfig;
            }
        },

        timeSeries: function(fieldsString) {
            return _.without((fieldsString || "").split(", "), "T=");
        }
    });
});

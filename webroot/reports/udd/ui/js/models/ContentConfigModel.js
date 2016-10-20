/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    "lodash",
    "contrail-model"
], function(_, ContrailModel) {

    return ContrailModel.extend({
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

        timeSeries: function(fieldsString) {
            return _.without((fieldsString || "").split(", "), "T=");
        }
    });
});

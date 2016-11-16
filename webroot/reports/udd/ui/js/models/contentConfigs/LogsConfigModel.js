/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    "core-basedir/reports/udd/ui/js/models/ContentConfigModel"
], function(ContentConfigModel) {
    return ContentConfigModel.extend({
        constructor: function(modelConfig, modelRemoteDataConfig) {
            ContentConfigModel.prototype.constructor.call(this, modelConfig, modelRemoteDataConfig);
        },

        defaultConfig: {
            records: 5,
        },

        toJSON: function() {
            return {
                records: this.records(),
            };
        },

        getContentViewOptions: function() {
            return {
                totalRecords: this.records(),
            };
        },
    });
});

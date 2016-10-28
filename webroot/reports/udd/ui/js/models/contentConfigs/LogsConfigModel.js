/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    "core-basedir/reports/udd/ui/js/models/ContentConfigModel"
], function(ContentConfigModel) {
    return ContentConfigModel.extend({
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

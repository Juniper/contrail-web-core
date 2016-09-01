/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
  "reports/udd/ui/js/models/ContentConfigModel.js"
], function(ContentConfigModel) {
  return ContentConfigModel.extend({
    defaultConfig: {
      records: 5,
    },

    toJSON: function() {
      var self = this;
      return {
        records: self.records(),
      };
    },

    getContentViewOptions: function() {
      var self = this;
      return {
        totalRecords: self.records(),
      };
    },
  });
});

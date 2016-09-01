/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
  "contrail-model"
], function(ContrailModel) {

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
  });
});

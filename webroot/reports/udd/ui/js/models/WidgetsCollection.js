/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([
  "underscore",
  "backbone",
  "/reports/udd/ui/js/models/WidgetModel.js"
], function(_, Backbone, Widget) {
  var WidgetsCollection = Backbone.Collection.extend({

    initialize: function(attrs, options) {
      this.model = Widget;
      this.url = options ? options.url : "";
    },

    parse: function(response) {
      return response && response.result ? response.result.rows : [];
    },

    filterBy: function(dashboardId, tabId) {
      return new WidgetsCollection(this.filter(function(item) {
        var isValid = dashboardId ? item.get("dashboardId") === dashboardId : true;
        isValid = isValid && (tabId ? item.get("tabId") === tabId : true);
        return isValid;
      }), { url: this.url });
    },

    dashboardIds: function() {
      return _.uniq(this.pluck("dashboardId"));
    },

    tabIds: function(dashboardId) {
      return _.uniq(this.filterBy(dashboardId).pluck("tabId"));
    },

    setTabName: function(tabName) {
      this.tabName = tabName;
      _.each(this.models, function(widget) {
        widget.set("tabName", tabName);
        widget.save();
      });
    },
    // each tab has its own collection
    getTabName: function() {
      return this.models[0] ? (this.models[0].get("tabName") || this.models[0].get("tabId")) : "";
    },
  });
  return WidgetsCollection;
});

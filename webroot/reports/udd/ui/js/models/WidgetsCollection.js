/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([
    "lodash",
    "backbone",
    "/reports/udd/ui/js/models/WidgetModel.js"
], function(_, Backbone, Widget) {

    function markWidgetAsReady(widget) {
        _.merge(widget.config, {
            isReady: true
        });

        return widget;
    }

    var WidgetsCollection = Backbone.Collection.extend({

        initialize: function(attrs, options) {
            var self = this;
            this.model = Widget;
            this.url = options ? options.url : "";

            setTimeout(function() {
                self._tabName = self.getTabName();
            });
        },

        comparator: function (w) {
            return w.attributes.tabName.toLowerCase();
        },

        parse: function(response) {
            var _res = response && response.result ? response.result.rows : [];

            return _.map(_res, markWidgetAsReady);
        },
    //TODO it would be good to use synced subcollections like: https://github.com/anthonyshort/backbone.collectionsubset
    // both params are mandatory to access filtered collections right
        filterBy: function(dashboardId, tabId) {
            var self = this;
            var filtered = new WidgetsCollection(self.filter(function(item) {
                var isValid = dashboardId ? item.get("dashboardId") === dashboardId : true;
                isValid = isValid && (tabId ? item.get("tabId") === tabId : true);
                return isValid;
            }), { url: self.url });
            filtered.on("add", self._onAdd.bind(self));
            return filtered;
        },

        dashboardIds: function() {
            return _.uniq(this.pluck("dashboardId"));
        },

        tabIds: function(dashboardId) {
            var widgetsByDashboard = this.filter(function(model) {
                return model.get("dashboardId") === dashboardId;
            });
            return _.uniq(_.pluck(widgetsByDashboard, "attributes.tabId"));
        },

        setTabName: function(tabName) {
            this._tabName = tabName;
            _.each(this.models, function(widget) {
                widget.set("tabName", tabName);
                widget.save();
            });
        },
    // this handler is bound to parent collection
        _onAdd: function (model) {
            this.add(model);
        },
    // each tab has its own collection
        getTabName: function() {
            return this.models[0] ? (this.models[0].get("tabName") || this.models[0].get("tabId")) : this._tabName;
        },
    });
    return WidgetsCollection;
});

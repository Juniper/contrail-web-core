/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([
    "lodash",
    "backbone",
    "core-basedir/reports/udd/ui/js/common/udd.constants",
    "core-basedir/reports/udd/ui/js/models/WidgetModel"
], function(_, Backbone, uddConstants, Widget) {

    function markWidgetAsReady(widget) {
        _.merge(widget.config, {
            isReady: true,
            step: uddConstants.steps.SHOW_VISUALIZATION,
            editingTitle: false,
            canProceed: true
        });

        return widget;
    }

    var WidgetsCollection = Backbone.Collection.extend({
        tabModels: {}, // a map recording the Backbone collection of each tab
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
            var filtered = new WidgetsCollection(
                this.filter(function(item) {
                    var isValid = dashboardId ? item.get("dashboardId") === dashboardId : true;

                    isValid = isValid && (tabId ? item.get("tabId") === tabId : true);

                    return isValid;
                }),
                {
                    url: this.url
                }
            );

            filtered.on("add", this._onAdd, this);

            this.tabModels[tabId] = filtered;

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
        setTabCreationTime: function(tabCreationTime) {
            _.each(this.models, function(widget) {
                widget.set("tabCreationTime", tabCreationTime);
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
        getTabCreationTime: function() {
            return this.models[0] ? this.models[0].get("tabCreationTime") : Date.now();
        }
    });
    return WidgetsCollection;
});

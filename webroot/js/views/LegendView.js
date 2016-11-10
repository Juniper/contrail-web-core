/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'backbone'
], function (Backbone) {
    var LegendView = Backbone.View.extend({
        initialize: function (args) {
            var self = this;
            self.selector = getValueByJsonPath(args, 'el');
            self.legendTemplate = contrail.getTemplate4Id(cowc.TMPL_CUSTOM_CHART_LEGEND);
            self.viewConfig = getValueByJsonPath(args, 'viewConfig');
        },

        setViewConfig: function (config) {
            var self = this;
            self.viewConfig = config;
        },

        render: function() {
            var self = this;
            if ($(self.selector).find('.custom-chart-legend') != null &&
                $(self.selector).find('.custom-chart-legend').length > 0) {
                $(self.selector).find('.custom-chart-legend').remove();
            }
            $(self.selector).prepend(self.legendTemplate(self.viewConfig));
        },

        update: function(config) {
            var self = this;
            if (config) self.setViewConfig(config);
            //Todo Add one way binding with the config and update the DOM without having to re-render.
            self.render();
        }
    });
    return LegendView;
});
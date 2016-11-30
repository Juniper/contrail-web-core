/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'backbone', 'contrail-model'],
    function(_, Backbone, ContrailModel) {
    var defaults = {showControls : false, showLegend : false, showMultiViews: false};
    var chartsModel = ContrailModel.extend({
        defaultConfig : {
            showControls: false,
            show_titles: false,
            showLegend: false,
            refresh_interval: 0,
            time_range: 0,
            showMultiViews: false,
            cancelFlow: false
        },

        onSave: function(options, args) {
            var chartsData = {
                showControls: this.showControls(),
                showLegend: this.showLegend(),
                showMultiViews: this.showMultiViews()
            };
            contrail.setCookie(cowc.COOKIE_CHART_SETTINGS, JSON.stringify(chartsData));
        },

        onCancel: function(options, args) {
            var acts,
                s = contrail.getCookie(cowc.COOKIE_CHART_SETTINGS);
            this.cancelFlow(true);
            if(s) {
                acts = JSON.parse(s);
            } else {
                acts = defaults;
            }
            for(var key in acts) {
                this[key](acts[key]);
            }
        },

        formatModelConfig: function (modelConfig) {
            var s = contrail.getCookie(cowc.COOKIE_CHART_SETTINGS);
            if(s) {
                s = JSON.parse(s);
                for(var key in s) {
                    modelConfig[key] = s[key];
                }
            }
            return modelConfig;
        }
    });
    return chartsModel;
});
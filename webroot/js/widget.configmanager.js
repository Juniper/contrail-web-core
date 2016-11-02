/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([ 'controlnode-viewconfig', 'vrouter-viewconfig',
        'databasenode-viewconfig', 'analyticsnode-viewconfig',
        'confignode-viewconfig'], function(
        ControlNodeViewConfig, VRouterViewConfig, DatabaseNodeViewConfig,
        AnalyticsNodeViewConfig, ConfigNodeViewConfig) {

    var widgetCfgManager = function() {
        var self = this;
        var widgetViewCfgMap = {};
        $.extend(widgetViewCfgMap, ControlNodeViewConfig, VRouterViewConfig,
                DatabaseNodeViewConfig, AnalyticsNodeViewConfig,
                ConfigNodeViewConfig);

        self.get = function(widgetId) {
            return widgetViewCfgMap[widgetId];
        }
    }
    return new widgetCfgManager();

});

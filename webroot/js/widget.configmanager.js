/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([ 'controlnode-viewconfig', 'vrouter-viewconfig',
        'databasenode-viewconfig', 'analyticsnode-viewconfig',
        'confignode-viewconfig','monitor-infra-viewconfig'], function(
        ControlNodeViewConfig, VRouterViewConfig, DatabaseNodeViewConfig,
        AnalyticsNodeViewConfig, ConfigNodeViewConfig,MonitorInfraViewConfig) {
    var widgetCfgManager = function() {
        var self = this;
        var widgetViewCfgMap = {};
        $.extend(widgetViewCfgMap, ControlNodeViewConfig, VRouterViewConfig,
                DatabaseNodeViewConfig, AnalyticsNodeViewConfig,
                ConfigNodeViewConfig,MonitorInfraViewConfig);
        self.get = function(widgetId) {
            return widgetViewCfgMap[widgetId];
        }
    }
    return new widgetCfgManager();

});

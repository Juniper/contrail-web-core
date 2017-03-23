/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([ 'controlnode-viewconfig', 'vrouter-viewconfig',
        'databasenode-viewconfig', 'analyticsnode-viewconfig',
        'confignode-viewconfig','monitor-infra-viewconfig','alarms-viewconfig'], function(
        ControlNodeViewConfig, VRouterViewConfig, DatabaseNodeViewConfig,
        AnalyticsNodeViewConfig, ConfigNodeViewConfig,MonitorInfraViewConfig, AlarmsViewConfig) {
    var widgetCfgManager = function() {
        var self = this;
        var widgetViewCfgMap = {};
        $.extend(widgetViewCfgMap, ControlNodeViewConfig, VRouterViewConfig,
                DatabaseNodeViewConfig, AnalyticsNodeViewConfig,
                ConfigNodeViewConfig,MonitorInfraViewConfig,AlarmsViewConfig);
        self.get = function(widgetId) {
            return widgetViewCfgMap[widgetId];
        }
        self.modelInstMap = {};
    }
    return new widgetCfgManager();

});

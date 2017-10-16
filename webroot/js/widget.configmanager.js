/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([ 'controlnode-viewconfig', 'vrouter-viewconfig',
        'databasenode-viewconfig', 'analyticsnode-viewconfig',
        'confignode-viewconfig','monitor-infra-viewconfig',
        'global-controller-viewconfig','alarms-viewconfig',
        'security-dashboard-viewconfig'], function(
        ControlNodeViewConfig, VRouterViewConfig, DatabaseNodeViewConfig,
        AnalyticsNodeViewConfig, ConfigNodeViewConfig,MonitorInfraViewConfig,
        globalControllerViewConfig, AlarmsViewConfig, SecurityDashboardViewConfig) {
    var widgetCfgManager = function() {
        var self = this;
        var widgetViewCfgMap = {};
        $.extend(widgetViewCfgMap, ControlNodeViewConfig, VRouterViewConfig,
                DatabaseNodeViewConfig, AnalyticsNodeViewConfig, SecurityDashboardViewConfig,
                ConfigNodeViewConfig,MonitorInfraViewConfig,globalControllerViewConfig,AlarmsViewConfig);
        self.get = function(widgetId) {
            return widgetViewCfgMap[widgetId];
        }
        self.modelInstMap = {};
    }
    return new widgetCfgManager();

});

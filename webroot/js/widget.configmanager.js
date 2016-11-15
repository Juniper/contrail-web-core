/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define(['controlnode-viewconfig', 'databasenode-viewconfig', 'analyticsnode-viewconfig', 'confignode-viewconfig','monitor-infra-viewconfig'],
    function( ControlNodeViewConfig, DatabaseNodeViewConfig, AnalyticsNodeViewConfig,ConfigNodeViewConfig,MonitorInfraViewConfig) {

    var widgetCfgManager = function() {
        var self = this;
        var widgetViewCfgMap = {};
        $.extend(widgetViewCfgMap,ControlNodeViewConfig,DatabaseNodeViewConfig,AnalyticsNodeViewConfig,ConfigNodeViewConfig,MonitorInfraViewConfig);

        self.get = function(widgetId) {
            return widgetViewCfgMap[widgetId];
        }
    }
    return new widgetCfgManager();

});


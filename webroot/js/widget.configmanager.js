/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define(['controlnode-viewconfig', 'databasenode-viewconfig', 'analyticsnode-viewconfig', 'confignode-viewconfig'],
    function( ControlNodeViewConfig, DatabaseNodeViewConfig, AnalyticsNodeViewConfig,ConfigNodeViewConfig) {

    var widgetCfgManager = function() {
        var self = this;
        var widgetViewCfgMap = {};
        $.extend(widgetViewCfgMap,ControlNodeViewConfig,DatabaseNodeViewConfig,AnalyticsNodeViewConfig,ConfigNodeViewConfig);

        self.get = function(widgetId) {
            return widgetViewCfgMap[widgetId];
        }
    }
    return new widgetCfgManager();

});


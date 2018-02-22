/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([ 'lodash',
        'controlnode-widgetcfg', 'vrouter-widgetcfg','databasenode-widgetcfg', 
        'analyticsnode-widgetcfg','confignode-widgetcfg','monitor-infra-widgetcfg',
        'security-dashboard-widgetcfg',
        'confignode-modelcfg','controlnode-modelcfg','vrouter-modelcfg',
        'databasenode-modelcfg','analyticsnode-modelcfg','monitor-infra-modelcfg',
        'security-dashboard-modelcfg',
        'monitor-infra-viewcfg','confignode-viewcfg', 'databasenode-viewcfg',
        'vrouter-viewcfg', 'security-dashboard-viewcfg', 'alarms-viewconfig'
        ], function(
        _,ControlNodeWidgetCfg, VRouterWidgetCfg, DBNodeWidgetCfg,
        AnalyticsNodeWidgetCfg, CfgNodeWidgetCfg,MonitorInfraWidgetCfg,
        SecurityDashboardWidgetCfg,
        CfgNodeModelCfg,ControlNodeModelCfg,VRouterModelCfg,DatabaseNodeModelCfg,
        AnaltyicsNodeModelCfg,MonitorInfraModelCfg,SecurityDashboardModelCfg,
        MonitorInfraViewCfg,CfgNodeViewCfg, DBNodeViewCfg, VRouterViewCfg,
        SecurityDashboardViewConfig, AlarmsViewConfig, SecurityDashboardViewCfg ) {
    var widgetCfgManager = function() {
        var self = this;
        var widgetCfgMap = {},
        widgetViewCfgMap = {},
        widgetModelCfgMap = {};
        //Populate the available widget config maps
        $.extend(widgetCfgMap, ControlNodeWidgetCfg, VRouterWidgetCfg,
                DBNodeWidgetCfg, AnalyticsNodeWidgetCfg,
                CfgNodeWidgetCfg,MonitorInfraWidgetCfg, SecurityDashboardWidgetCfg);

        //Populate the available model config maps
        $.extend(widgetModelCfgMap, CfgNodeModelCfg,ControlNodeModelCfg,VRouterModelCfg,
            DatabaseNodeModelCfg,AnaltyicsNodeModelCfg,MonitorInfraModelCfg,
            SecurityDashboardModelCfg);

        $.extend(widgetViewCfgMap, MonitorInfraViewCfg, CfgNodeViewCfg,
                DBNodeViewCfg, VRouterViewCfg, SecurityDashboardViewConfig, AlarmsViewConfig,
                SecurityDashboardViewCfg);
        //,ControlNodeViewCfg,VRouterViewCfg,DatabaseNodeViewCfg,AnaltyicsNodeViewCfg,);

        self.get = function(widgetId,overrideCfg,i) {
            var widgetCfg = _.isFunction(widgetCfgMap[widgetId]) ? widgetCfgMap[widgetId](overrideCfg,i) : widgetCfgMap[widgetId];
            if (widgetCfg == null) {
                widgetCfg = _.isFunction(widgetViewCfgMap[widgetId]) ? widgetViewCfgMap[widgetId](overrideCfg) : widgetViewCfgMap[widgetId];
            }
            var modelCfg = {},viewCfg = {},baseModelCfg;
            
            if(widgetCfg['baseModel'] != null) {
                baseModelCfg = widgetModelCfgMap[widgetCfg['baseModel']];
                if(widgetCfg['modelCfg'] != null) {
                    $.extend(true,modelCfg,baseModelCfg,widgetCfg['modelCfg'])
                } else {
                    modelCfg = baseModelCfg;
                }
                if(_.result(baseModelCfg,'type','')) {
                    widgetCfg['tag'] = baseModelCfg['type'];
                }
                widgetCfg['modelCfg'] = modelCfg;
            }

            if(_.result(widgetCfg,'modelCfg.type','')) {
                widgetCfg['tag'] = _.result(widgetCfg,'modelCfg.type');
            }

            if(widgetCfg['baseView'] != null) {
                baseViewCfg = widgetViewCfgMap[widgetCfg['baseView']];
                if(widgetCfg['viewCfg'] != null) {
                    $.extend(true,viewCfg,baseViewCfg,widgetCfg['viewCfg'])
                } else {
                    viewCfg= baseViewCfg;
                }
                widgetCfg['viewCfg'] = viewCfg;
            }
            return widgetCfg;
        }
        //Returns list of available widgets
        self.getWidgetList = function() {
            // return _.keys(widgetCfgMap);
            var widgetMap = _.map(_.keys(widgetCfgMap),function(widgetId) {
                    return  {
                        key: widgetId,
                        value: self.get(widgetId),
                        tag: self.get(widgetId)['tag']
                    }
                });
            widgetMap = _.groupBy(widgetMap,function(d) {
                return d.tag;
            });
            //Pick yAxisLabel if exists else return widgetId
            return _.map(widgetMap,function(value,key) {
                return {
                    text: key,
                    children: _.map(value, function(widgetCfg) {
                        return {
                            id:widgetCfg['key'],
                            text:_.result(widgetCfg['value'],'viewCfg.viewConfig.chartOptions.yAxisLabel',widgetCfg['key'])
                        }
                    })
                    // val:_.result(widgetCfg['value'],'viewCfg.viewConfig.chartOptions.yAxisLabel',widgetCfg['key'])
                }
            });
        }
        self.modelInstMap = {};
    }
    return new widgetCfgManager();

});

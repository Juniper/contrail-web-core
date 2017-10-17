/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore',
 'contrail-view',
  'mon-infra-node-list-model',
  'monitor-infra-analyticsnode-model',
  'monitor-infra-databasenode-model',
  'monitor-infra-confignode-model',
  'monitor-infra-controlnode-model',
  'monitor-infra-vrouter-model',
  'contrail-list-model'],function(_, ContrailView, NodeListModel,
  analyticsNodeListModelCfg,databaseNodeListModelCfg,configNodeListModelCfg,
        controlNodeListModelCfg,vRouterListModelCfg, ContrailListModel){
   var MonitorInfraScatterChartView = ContrailView.extend({
        render : function (){
            var self = this,
                model = new NodeListModel();
            self.model = model.getNodeListModel();
            model.addListModel(new ContrailListModel(analyticsNodeListModelCfg));
            model.addListModel(new ContrailListModel(databaseNodeListModelCfg));
            model.addListModel(new ContrailListModel(configNodeListModelCfg));
            model.addListModel(new ContrailListModel(controlNodeListModelCfg));
            model.addListModel(new ContrailListModel(vRouterListModelCfg));
            self.renderView4Config(this.$el,
            self.model,
            getMonitorInfraNodeScatterChartViewConfig()
            );
            self.model.onDataUpdate.subscribe(function() {
                  var nodes = self.model.getItems();
                  var template = contrail.getTemplate4Id('dashboard-nodecntview-template');
                  var nodeMap = {};
                  $.each(nodes, function (idx, obj) {
                      if (nodeMap[obj['type']] == null) {
                          nodeMap[obj['type']] = {display_type: obj['display_type']+'s', totalCnt: 0, dwnCnt: 0}; 
                      }
                      if (obj['color'] != null && obj['color'].indexOf('error') > -1) {
                          nodeMap[obj['type']]['dwnCnt'] += 1;
                      }
                      nodeMap[obj['type']]['totalCnt'] += 1;
                  })
                  //console.log('ondataupdate', nodeMap);
                  $('div.monitor-infra-all-node-chart').find('.overview-text').html(template({nodeMap: nodeMap}));
            });
        }
    });

     function getMonitorInfraNodeScatterChartViewConfig() {
         return {
             elementId : ctwl.ANALYTICSNODE_SUMMARY_SCATTERCHART_ID,
             title : ctwl.ANALYTICSNODE_SUMMARY_TITLE,
             view : "ZoomScatterChartView",
             viewConfig : {
                 loadChartInChunks : true,
                 chartOptions : {
                     xLabel : ctwl.TITLE_CPU,
                     yLabel : 'Memory (MB)',
                     forceX : [ 0, 1 ],
                     forceY : [ 0, 20 ],
                     margin: {top:10, bottom: 30, right: 20, left: 50},
                     showXMinMax: true,
                     //showYMinMax: true,
                     yTickCount: 4,
                     overViewText: true,
                     overviewCss: 'flex-2',
                     overviewTextOptions: {
                        template: '' 
                     },
                     dataParser : function(
                             response) {
                         var chartDataValues = [ ];
                         for ( var i = 0; i < response.length; i++) {
                             var analyticsNode = response[i];
                             chartDataValues
                                 .push({
                                     name : analyticsNode['name'],
                                     y : analyticsNode['memory'],
                                     x : contrail.handleIfNull(
                                         analyticsNode['cpu'],
                                         0),
                                     color : analyticsNode['color'],
                                     size : contrail.handleIfNull(
                                         analyticsNode['size'],
                                         0),
                                     rawData : analyticsNode
                                 });
                         }
                         return chartDataValues;
                     },
                     tooltipConfigCB : getAnalyticsNodeTooltipConfig,
                     clickCB : onScatterChartClick
                 }
             }
          }
        };

       function onScatterChartClick(chartConfig) {
          var analyticsNode = chartConfig.name,
              rawData = chartConfig.rawData;
           layoutHandler.setURLHashParams(rawData.link.q, {
               p : rawData.link.p,
               merge : false,
               triggerHashChange : true
           });
       };

       function getAnalyticsNodeTooltipConfig(data) {
           var analyticsNode = data.rawData;
           var tooltipData = [
                              {
                                  label : 'Version',
                                  value : analyticsNode.version
                              },
                              {
                                  label : ctwl.TITLE_CPU,
                                  value : analyticsNode.cpu,
                              },
                              {
                                  label : 'Memory',
                                  value : analyticsNode.memory,
                              }];
           var tooltipAlerts = monitorInfraUtils.getTooltipAlerts(analyticsNode);
           tooltipData = tooltipData.concat(tooltipAlerts);
           var tooltipConfig = {
               title : {
                   name : data.name,
                   type : analyticsNode.display_type
               },
               content : {
                   iconClass : false,
                   info : tooltipData,
                   actions : [ {
                       type : 'link',
                       text : 'View',
                       iconClass : 'fa fa-external-link',
                       callback : onScatterChartClick
                   } ]
               },
               delay : cowc.TOOLTIP_DELAY
           };

           return tooltipConfig;
       };

       function getControlPanelLegendConfig() {
           return {
               groups : [ {
                   id : 'by-node-color',
                   title : 'Node Color',
                   items : [{
                       text : 'Errors in UVE', //TODO need to discuss the format
                       labelCssClass : 'fa-circle warning',
                       events : {
                           click : function(
                                   event) {
                           }
                       }
                   },{
                       text : infraAlertMsgs['UVE_MISSING']+ ' or ' +
                       infraAlertMsgs['NTP_UNSYNCED_ERROR'],
                       labelCssClass : 'fa-circle error',
                       events : {
                           click : function(
                                   event) {
                           }
                       }
                   } ]
               }]
           };
       };
   return MonitorInfraScatterChartView;
});

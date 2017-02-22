/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var globalControllerBarView = ContrailView.extend({
        render: function (viewConfig) {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                selector = $(contentContainer),
                globalControllerBarViewTemplate = contrail.getTemplate4Id("barView-template");
                var regionList = globalObj['webServerInfo']['regionList'];
                var index = regionList.indexOf('All Regions');
                var defaulConfig = {};
                if (index > -1) {
                      regionList.splice(index, 1);
                }
                var regionListLen = regionList.length;
                var totalNodesCnt =0;
                self.model.setData([]);
                self.model.onDataUpdate.subscribe(function(){
                  //parse the data to get the aggregate and render the view
                   var items = self.model.getItems();
                   var alarmsCnt = 0,servivceInstanceCnt = 0,interfacesCnt = 0,floatIps = 0,
                       analyticsNodesCnt = 0, configNodesCnt = 0;controlNodesCnt=0,
                       databaseNodesCnt = 0, vRoutersCnt = 0, vnCnt = 0, zeroAlarmsFlag = 0,
                       vRoutersNodesDownCnt = 0, configNodesDownCnt = 0, controlNodesDownCnt = 0,
                       analyticsNodesDownCnt = 0, databaseNodesDownCnt = 0,totalNodesDownCnt = 8;
                   for(i=0;i<items.length;i++){
                     alarmsCnt += items[i].data.alarmsCnt;
                     servivceInstanceCnt += items[i].data.svcInstsCnt;
                     interfacesCnt += items[i].data.vmiCnt;
                     floatIps += items[i].data.fipsCnt;
                     analyticsNodesCnt += items[i].data.analyticsNodesCnt;
                     configNodesCnt += items[i].data.configNodesCnt;
                     controlNodesCnt += items[i].data.controlNodesCnt;
                     databaseNodesCnt += items[i].data.databaseNodesCnt;
                     vRoutersCnt += items[i].data.vRoutersCnt;
                     vRoutersNodesDownCnt += items[i].data.vRoutersNodesDownCnt;
                     controlNodesDownCnt += items[i].data.controlNodesDownCnt;
                     analyticsNodesDownCnt += items[i].data.analyticsNodesDownCnt;
                     configNodesDownCnt += items[i].data.configNodesDownCnt;
                     databaseNodesDownCnt += items[i].data.databaseNodesDownCnt;
                     vnCnt += items[i].data.vnCnt;
                     totalNodesCnt = analyticsNodesCnt +
                                     configNodesCnt + controlNodesCnt +
                                     databaseNodesCnt + vRoutersCnt;
                     totalNodesDownCnt = vRoutersNodesDownCnt + configNodesDownCnt + controlNodesDownCnt +
                                         analyticsNodesDownCnt + databaseNodesDownCnt;
                    }
                  if(alarmsCnt > 0) {
                      $('#alert_info').css("background-color", "#e4564f");
                      $('#pageHeader').find('#alert_info').text(alarmsCnt);
                  }
                  else{
                      $('#alert_info').css("background-color", "#fff");
                  }
                   self.$el.html(globalControllerBarViewTemplate({zeroAlarmsFlag:zeroAlarmsFlag, alarmCnt:alarmsCnt,regionListLen:regionListLen,
                       interfacesCnt:interfacesCnt,servivceInstanceCnt:servivceInstanceCnt,floatIps:floatIps, vnCnt:vnCnt,totalNodesCnt:totalNodesCnt,
                       totalNodesDownCnt: totalNodesDownCnt}));
                });
        }
    });
    return globalControllerBarView;
});
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
                       anaNodesCnt = 0, configNodesCnt = 0;controlNodesCnt=0,
                       databaseNodesCnt = 0, vrNodesCnt = 0, vnCnt = 0, zeroAlarmsFlag = 0,
                       vrNodesDownCnt = 0, configNodeDownCnt = 0, controlNodeDownCnt = 0,
                       analyticsNodeDownCnt = 0, dbNodeDownCnt = 0,totalNodesDownCnt = 8;
                   for(i=0;i<items.length;i++){
                     alarmsCnt += items[i].data.alarmsCnt;
                     servivceInstanceCnt += items[i].data.svcInstsCnt;
                     interfacesCnt += items[i].data.vmiCnt;
                     floatIps += items[i].data.fipsCnt;
                     anaNodesCnt += items[i].data.anaNodesCnt;
                     configNodesCnt += items[i].data.anaNodesCnt;
                     controlNodesCnt += items[i].data.controlNodesCnt;
                     databaseNodesCnt += items[i].data.databaseNodesCnt;
                     vrNodesCnt += items[i].data.vrNodesCnt;
                     vrNodesDownCnt += items[i].data.vrDownAlarmsCnt;
                     controlNodeDownCnt += items[i].data.controlNodeDownAlarmsCnt;
                     analyticsNodeDownCnt += items[i].data.anaNodeDownAlarmsCnt;
                     configNodeDownCnt += items[i].data.configNodeDownAlarmsCnt;
                     dbNodeDownCnt += items[i].data.databaseNodeDownAlarmsCnt;
                     vnCnt += items[i].data.vnCnt;
                     totalNodesCnt = anaNodesCnt +
                                     configNodesCnt + controlNodesCnt +
                                     databaseNodesCnt + vrNodesCnt;
                     totalNodesDownCnt = vrNodesDownCnt + configNodeDownCnt + controlNodeDownCnt +
                                         analyticsNodeDownCnt + dbNodeDownCnt;
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
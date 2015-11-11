/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
],function(_,Backbone) {
    var SysInfoView = Backbone.View.extend({
        initialize: function(options) {
        },
        renderSysInfo: function() {
            var self = this;
            var sysInfoListTmpl = contrail.getTemplate4Id('infoList-template');
            var sysInfoList = self.getSysInfoList();
            self.$el.find('.widget-body .widget-main').html(sysInfoListTmpl(sysInfoList));
            self.$el.find('.widget-header').initWidgetHeader({
                title: 'System Information'
            });
            self.$el.find('#moreAlertsLink').click(function() {

            });
        },
        getSysInfoList: function() {
            var self = this;
            var dashboardDataArr = self.model.getItems();
            var dashboardCF = crossfilter(dashboardDataArr);
            var nameDimension = dashboardCF.dimension(function(d) { return d.name });
            var verDimension = dashboardCF.dimension(function(d) { return d.version });
            var verGroup = verDimension.group();
            var verArr = [];
            var systemCnt = 0;
            var systemList = [];
            for(var i=0;i<dashboardDataArr.length;i++) {
                if(dashboardDataArr[i]['vRouterType'] == null ||
                    dashboardDataArr[i]['vRouterType'] != 'tor-agent') {
                    systemList.push(dashboardDataArr[i]['name']);
                }
            }
            systemCnt = systemList.unique().length;
            var infoData = [{lbl:'No. of servers',value:systemCnt}];
            infoData.push({lbl:'No. of logical nodes', value:dashboardDataArr.length});
            //Distinct Versions
            if(verGroup.all().length > 1) {
                //verArr = verGroup.order(function(d) { return d.value;}).top(2);
                verArr = verGroup.top(Infinity);
                var unknownVerInfo = [];
                $.each(verArr,function(idx,value) {
                    if(verArr[idx]['key'] == '' || verArr[idx]['key'] ==  '-') {
                        unknownVerInfo.push({
                            lbl: 'Logical nodes with version unknown',
                            value: verArr[idx]['value']
                        });
                    } else {
                        infoData.push({
                            lbl: 'Logical nodes with version ' + verArr[idx]['key'],
                            value: verArr[idx]['value']
                        });
                    }
                });
                if(unknownVerInfo.length > 0)
                    infoData = infoData.concat(unknownVerInfo);
            } else if(verGroup.all().length == 1) {
                infoData.push({lbl:'Version',value:verGroup.all()[0]['key']});
            }
            return infoData;
        },
        render: function() {
            var self = this;
            self.renderSysInfo();
            self.model.onDataUpdate.subscribe(function() {
                self.renderSysInfo();
            });
        }
    });
    return SysInfoView;
});

/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
],function(_,ContrailView) {
    var BarChartInfoView = ContrailView.extend({
        el: ".chart",
        chart: null,
        chartSelection: null,
        initialize: function(options) {
            var self = this;
            self.$el.append($('<div/>',{
                class:'infobox-container'
            }));
        },
        renderInfoboxes : function() {
            var self = this;
            var infoChartCfg = getValueByJsonPath(self,'attributes;viewConfig;config',[]);
            var data = self.model.getItems();
            var dataCF = crossfilter(data);
            var chartInfoTmpl = contrail.getTemplate4Id(cowc.TMPL_CHARTINFO);
            var totalCntMap = {};
            //Sum-up each field across all records
            $.each(data,function(idx,obj) {
                for(var i=0;i<infoChartCfg.length;i++) {
                    var currField = infoChartCfg[i]['field'];
                    if(idx == 0) {
                        totalCntMap[currField] = 0;
                    }
                    totalCntMap[currField] += obj[currField]
                }
            });

            for(var i=0;i<infoChartCfg.length;i++) {
                var currCfg = infoChartCfg[i];
                var chartCfg = {
                    title : currCfg['title'],
                    totalCnt: totalCntMap[currCfg['field']]
                };
                self.$el.find('.infobox-container').append(chartInfoTmpl(chartCfg));
                var currElem = self.$el.find('.infobox-container .infobox:last');
                var sparkLineData = bucketizeCFData(dataCF,function(d) {
                    return d[currCfg['field']];
                });
                //Draw sparkline
                drawSparkLineBar(currElem.find('.sparkline')[0],sparkLineData);
            }
        },
        render: function() {
            var self = this;
            //Need to initialize crossfilter with model
            //If model is already populated
            if(self.model.isRequestInProgress() == false) {
                self.renderInfoboxes();
            }
            self.model.onAllRequestsComplete.subscribe(function() {
                self.renderInfoboxes();
            });
        }
    });
    return BarChartInfoView;
});

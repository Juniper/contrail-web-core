/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'chart-view', 'contrail-view', 'contrail-list-model'],
       function(_, ChartView, ContrailView,ContrailListModel){
        var PercentileTextView = ChartView.extend({
        initialize: function() {
            var self = this;
            ChartView.prototype.bindListeners.call(self);
        },
        render : function (){
            var percentileTextViewTemplate = contrail.getTemplate4Id(
                    ctwc.PERCENTILE_TEXT_VIEW_TEMPLATE);
            var viewConfig = this.attributes.viewConfig;
            var self = this;
            self.renderTemplate($(self.$el), viewConfig, self.model,percentileTextViewTemplate);
            /*if (self.model === null && viewConfig['modelConfig'] != null) {
                self.model = new ContrailListModel(viewConfig['modelConfig']);
            }
            if (self.model !== null) {
                self.renderTemplate($(self.$el), viewConfig, self.model,percentileTextViewTemplate);
                self.model.onDataUpdate.subscribe(function () {
                    self.renderTemplate($(self.$el), viewConfig, self.model,percentileTextViewTemplate);
                });
                self.model.onAllRequestsComplete.subscribe(function () {
                    self.renderTemplate($(self.$el), viewConfig, self.model,percentileTextViewTemplate);
                });
             }*/
           },
        renderTemplate: function (selector, viewConfig, chartViewModel,percentileTextViewTemplate) {
            var chartModelItems = chartViewModel.get('data'), self = this;
            var percentileXobjVal = getValueByJsonPath(chartModelItems, '0;percentileXobjVal', '-');
            var percentileYobjVal = getValueByJsonPath(chartModelItems, '0;percentileYobjVal', '-');
            if (percentileTextViewTemplate == null) {
                percentileTextViewTemplate = contrail.getTemplate4Id(
                    ctwc.PERCENTILE_TEXT_VIEW_TEMPLATE);
            }
            self.$el.html(percentileTextViewTemplate({percentileXobjVal: percentileXobjVal,
                percentileYobjVal: percentileYobjVal,
                percentileTitle: viewConfig.percentileTitle,
                percentileYvalue: viewConfig.percentileYvalue,
                percentileXvalue: viewConfig.percentileXvalue}));
        }
    });

   return PercentileTextView;
});

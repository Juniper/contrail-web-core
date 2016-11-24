/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'contrail-view', 'contrail-list-model'],
       function(_, ContrailView,ContrailListModel){
        var PercentileTextView = ContrailView.extend({
        render : function (){
            var percentileTextViewTemplate = contrail.getTemplate4Id(
                    ctwc.PERCENTILE_TEXT_VIEW_TEMPLATE);
            var viewConfig = this.attributes.viewConfig;
            var self = this;
            if (self.model === null && viewConfig['modelConfig'] != null) {
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
             }
           },
        renderTemplate: function (selector, viewConfig, chartViewModel,percentileTextViewTemplate) {
            var chartModelItems = chartViewModel.getItems(), self = this;
            var percentileXobjVal = getValueByJsonPath(chartModelItems, '0;percentileXobjVal', '-');
            var percentileYobjVal = getValueByJsonPath(chartModelItems, '0;percentileYobjVal', '-');
            self.$el.html(percentileTextViewTemplate({percentileXobjVal: percentileXobjVal,
                percentileYobjVal: percentileYobjVal,
                percentileTitle: viewConfig.percentileTitle,
                percentileYvalue: viewConfig.percentileYvalue,
                percentileXvalue: viewConfig.percentileXvalue}));
        }
    });

   return PercentileTextView;
});

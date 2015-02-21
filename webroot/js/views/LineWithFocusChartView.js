/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'js/models/LineWithFocusChartModel'
], function (_, Backbone, LineWithFocusChartModel) {
    var LineWithFocusChartView = Backbone.View.extend({
        render: function () {
            var loadingSpinnerTemplate = contrail.getTemplate4Id(cowc.TMPL_LOADING_SPINNER),
                viewConfig = this.attributes.viewConfig,
                ajaxConfig = viewConfig['ajaxConfig'],
                chartOptions = viewConfig['chartOptions'],
                self = this, deferredObj = $.Deferred();

            self.$el.append(loadingSpinnerTemplate);

            var selector = $(self.$el),
                url = viewConfig['url'],
                cbParams = {
                    selector: selector,
                    height: contrail.checkIfExist(viewConfig['height']) ? viewConfig['height'] : 300
                };

            console.log(url);

            chartHandler(url, "GET", null, null, 'parseTSChartData', "successHandlerTSChart", null, false, cbParams, 310000);
        }
    });

    return LineWithFocusChartView;
});
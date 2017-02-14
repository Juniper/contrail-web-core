/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'chart-utils',
    'chart-config'
], function (_, ContrailView, chUtils, ChartConfig) {
    var ChartView = ContrailView.extend({
        getChartOptionsFromDimension: function (selector) {
             var height = $(selector).height(),
                width = $(selector).width();
            var chartOptions = new ChartConfig().config;
            var widthOptions = cowu.getValueByJsonPath(chartOptions, 'min-width', {});
            var heightOptions = cowu.getValueByJsonPath(chartOptions, 'min-height', {});
            var widthsArray = _.keys(widthOptions),
                widthsArrLen = widthsArray.length;
            var heightsArray = _.keys(heightOptions),
                heightsArrLen = heightsArray.length;
            var selectedWidthOptions, selectedHeightOptions;
            for (var i = 0; i < widthsArrLen; i++) {
                var widthItem = widthsArray[i];
                if (widthItem >= width) {
                    selectedWidthOptions = widthOptions[widthItem];
                    break;
                }
            }
            for (var i = 0; i < heightsArrLen; i++) {
                var heightItem = heightsArray[i];
                if (heightItem >= height) {
                    selectedHeightOptions = heightOptions[heightItem];
                    break;
                }
            }
            return $.extend({}, selectedWidthOptions, selectedHeightOptions);
        },
        render: function () {
            var loadingSpinnerTemplate = contrail.getTemplate4Id(cowc.TMPL_LOADING_SPINNER),
                viewConfig = this.attributes.viewConfig,
                ajaxConfig = viewConfig['ajaxConfig'],
                self = this, deferredObj = $.Deferred();

            self.$el.append(loadingSpinnerTemplate);

            $.ajax(ajaxConfig).done(function (result) {
                deferredObj.resolve(result);
            });

            deferredObj.done(function (response) {
                if (contrail.checkIfFunction(viewConfig['parseFn'])) {
                    response = viewConfig['parseFn'](response);
                }
                self.$el[viewConfig['renderFn']](response);
                self.$el.find('.loading-spinner').remove()
            });

            deferredObj.fail(function (errObject) {
                if (errObject['errTxt'] != null && errObject['errTxt'] != 'abort') {
                    showMessageInChart({selector: $(self.$el), msg: 'Error in fetching Details', type: 'bubblechart'});
                }
            });
        }
    });

    return ChartView;
});
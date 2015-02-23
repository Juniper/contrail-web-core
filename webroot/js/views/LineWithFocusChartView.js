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
                chartOptions = {
                    height: 300,
                    yAxisLabel: 'Bytes per 30 secs',
                    y2AxisLabel: 'Bytes per min',
                    yFormatter: 'formatSumBytes',
                    y2Formatter: 'formatSumBytes'
                };

            $.ajax(ajaxConfig).done(function (result) {
                deferredObj.resolve(result);
            });

            deferredObj.done(function (response) {
                var chartData = response;
                if (contrail.checkIfFunction(viewConfig['parseFn'])) {
                    chartData = viewConfig['parseFn'](response);
                }

                var chartViewConfig = getChartViewConfig(chartData, chartOptions);

                self.chartModel = new LineWithFocusChartModel(chartOptions);

                self.renderChart(selector, chartData, chartOptions, self.chartModel);
                self.$el.find('.loading-spinner').remove()
            });

            deferredObj.fail(function (errObject) {
                if (errObject['errTxt'] != null && errObject['errTxt'] != 'abort') {
                    showMessageInChart({
                        selector: self.$el,
                        msg: 'Error in fetching Details',
                        type: 'timeseriescharts'
                    });
                }
            });
        },

        renderChart: function (selector, chartData, chartOptions, chartModel) {
            if ($(selector).find("svg") != null) {
                $(selector).empty();
            }

            $(selector).append("<svg style='height:" + chartOptions.height + "px;'></svg>");

            //Store the chart object as a data attribute so that the chart can be updated dynamically
            $(selector).data('chart', chartModel);

            if (!($(selector).is(':visible'))) {
                $(selector).find('svg').bind("refresh", function () {
                    d3.select($(selector)[0]).select('svg').datum(chartData).call(chartModel);
                });
            } else {
                d3.select($(selector)[0]).select('svg').datum(chartData).call(chartModel);
            }

            nv.utils.windowResize(function () {
                updateChartOnResize(selector, chartModel);
            });
            //Seems like in d3 chart renders with some delay so this deferred object helps in that situation,which resolves once the chart is rendered
            if (chartOptions['deferredObj'] != null)
                chartOptions['deferredObj'].resolve();

            nv.addGraph(chartModel);
        }
    });

    function getChartViewConfig(chartData, chartOptions) {
        var values = chartData[0].values,
            brushExtent = null, chartViewConfig = {},
            start, end;

        if (values.length >= 20) {
            start = values[values.length - 20];
            end = values[values.length - 1];
            chartOptions['brushExtent'] = [getViewFinderPoint(start.x), getViewFinderPoint(end.x)];
        }

        chartViewConfig['chartData'] = chartData;
        chartViewConfig['chartOptions'] = chartOptions;

        return chartViewConfig;
    };

    return LineWithFocusChartView;
});
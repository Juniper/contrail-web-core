/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'core-basedir/js/models/LineBarWithFocusChartModel',
    'contrail-list-model'
], function (_, Backbone, LineFocusChartModel, ContrailListModel) {
    var LineBarWithFocusChartView = Backbone.View.extend({
        render: function () {
            var loadingSpinnerTemplate = contrail.getTemplate4Id(cowc.TMPL_LOADING_SPINNER),
                viewConfig = this.attributes.viewConfig,
                ajaxConfig = viewConfig['ajaxConfig'],
                self = this, deferredObj = $.Deferred(),
                selector = $(self.$el);

            $(selector).append(loadingSpinnerTemplate);

            if (viewConfig['modelConfig'] != null) {
                self.model = new ContrailListModel(viewConfig['modelConfig']);
                if(self.model.loadedFromCache || !(self.model.isRequestInProgress())) {
                    var chartData = self.model.getItems();
                    self.renderChart(selector, viewConfig, chartData);
                }

                self.model.onAllRequestsComplete.subscribe(function() {
                    var chartData = self.model.getItems();
                    self.renderChart(selector, viewConfig, chartData);
                });

                if(viewConfig.loadChartInChunks) {
                    self.model.onDataUpdate.subscribe(function() {
                        var chartData = self.model.getItems();
                        self.renderChart(selector, viewConfig, chartData);
                    });
                }
            }
        },

        renderChart: function (selector, viewConfig, data) {
            var chartViewConfig, chartModel, chartData, chartOptions;

            if (contrail.checkIfFunction(viewConfig['parseFn'])) {
                data = viewConfig['parseFn'](data);
            }

            chartOptions = ifNull(viewConfig['chartOptions'], {});

            chartViewConfig = getChartViewConfig(data, chartOptions);
            chartData = chartViewConfig['chartData'];
            chartOptions = chartViewConfig['chartOptions'];

            chartModel = new LineFocusChartModel(chartOptions);
            this.chartModel = chartModel;

            if ($(selector).find("svg") != null) {
                $(selector).empty();
            }

            $(selector).append("<svg style='height:" + chartOptions.height + "px;'></svg>");

            //Store the chart object as a data attribute so that the chart can be updated dynamically
            $(selector).data('chart', chartModel);

            nvd3v181.addGraph(function() {
                if (!($(selector).is(':visible'))) {
                    $(selector).find('svg').bind("refresh", function () {
                        d3.select($(selector)[0]).select('svg').datum(chartData).transition().duration(500).call(chartModel);
                    });
                } else {
                    d3.select($(selector)[0]).select('svg').datum(chartData).transition().duration(500).call(chartModel);
                }

                nvd3v181.utils.windowResize(chartModel.update);

                chartModel.dispatch.on('stateChange', function(e) { nvd3v181.log('New State:', JSON.stringify(e)); });
                $(selector).find('.loading-spinner').remove();

                return chartModel;
            });
        }
    });

    function getChartViewConfig(chartData, chartOptions) {
        var chartViewConfig = {};
        var chartDefaultOptions = {
            height: 300,
            y1AxisLabel: 'CPU Utilization (%)',
            y2AxisLabel: 'Memory Usage',
            y2Formatter: function(y2Value) {
                var formattedValue = formatBytes(y2Value * 1024, true);
                return formattedValue;
            },
            y1Formatter: d3.format(".01f"),
        };
        var chartOptions = $.extend(true, {}, chartDefaultOptions, chartOptions);

        if (chartData.length > 0) {
            var values = chartData[0].values,
                brushExtent = null,
                start, end;

            if (values.length >= 25) {
                start = values[values.length - 25];
                end = values[values.length - 1];
                chartOptions['brushExtent'] = [getViewFinderPoint(start.x), getViewFinderPoint(end.x)];
            }
        }

        chartViewConfig['chartData'] = chartData;
        chartViewConfig['chartOptions'] = chartOptions;

        return chartViewConfig;
    };

    return LineBarWithFocusChartView;
});
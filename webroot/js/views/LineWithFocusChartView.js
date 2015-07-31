/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'core-basedir/js/models/LineWithFocusChartModel',
    'contrail-list-model'
], function (_, ContrailView, LineWithFocusChartModel, ContrailListModel) {
    var LineWithFocusChartView = ContrailView.extend({
        render: function () {
            var loadingSpinnerTemplate = contrail.getTemplate4Id(cowc.TMPL_LOADING_SPINNER),
                viewConfig = this.attributes.viewConfig,
                ajaxConfig = viewConfig['ajaxConfig'],
                self = this, deferredObj = $.Deferred(),
                selector = $(self.$el);

            $(selector).append(loadingSpinnerTemplate);

            if (self.model === null && viewConfig['modelConfig'] !== null) {
                self.model = new ContrailListModel(viewConfig['modelConfig']);
            }

            if (self.model !== null) {
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

            chartModel = new LineWithFocusChartModel(chartOptions);
            this.chartModel = chartModel;

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

            $(selector).find('.loading-spinner').remove();
            //nv.addGraph(chartModel);
        }
    });

    function getChartViewConfig(chartData, chartOptions) {
        var chartViewConfig = {};
        var chartDefaultOptions = {
            height: 300,
            yAxisLabel: 'Traffic',
            y2AxisLabel: '',
            yFormatter: function(d) { return cowu.addUnits2Bytes(d, false, false, 1, 60); },
            y2Formatter: function(d) { return cowu.addUnits2Bytes(d, false, false, 1, 60); }
        };
        var chartOptions = $.extend(true, {}, chartDefaultOptions, chartOptions);

        var defaultForceY = contrail.checkIfExist(chartOptions['forceY']) ? chartOptions['forceY'] : [0, 60],
            newForceY = getForceYAxis(chartData, defaultForceY);

        chartOptions['forceY'] = newForceY;

        if (chartData.length > 0) {
            spliceBorderPoints(chartData);
            var values = chartData[0].values,
                brushExtent = null,
                start, end;

            if (values.length >= 20) {
                start = values[values.length - 20];
                end = values[values.length - 1];
                chartOptions['brushExtent'] = [getViewFinderPoint(start.x), getViewFinderPoint(end.x)];
            }
        }

        chartViewConfig['chartData'] = chartData;
        chartViewConfig['chartOptions'] = chartOptions;

        return chartViewConfig;
    };

    function spliceBorderPoints(chartData) {
        var lineChart;
        for(var i = 0; i < chartData.length; i++) {
            lineChart = chartData[i];
            lineChart['values'].splice(0, 1);
            lineChart['values'].splice((lineChart['values'].length - 1), 1);
        }
    };

    function getForceYAxis(chartData, defaultForceY) {
        var dataAllLines = [], forceY;

        for (var j = 0; j < chartData.length; j++) {
            dataAllLines = dataAllLines.concat(chartData[j]['values']);
        }

        forceY = cowu.getForceAxis4Chart(dataAllLines, "y", defaultForceY);
        return forceY[1] == defaultForceY[1] ? forceY : null;
    };

    return LineWithFocusChartView;
});
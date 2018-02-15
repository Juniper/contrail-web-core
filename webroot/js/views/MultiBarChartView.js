/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'chart-view',
    'core-basedir/js/models/MultiBarChartModel',
    'contrail-list-model',
    'nv.d3',
    'chart-utils'
], function (_, ChartView, MultiBarChartModel, ContrailListModel, nv, chUtils) {
    var MultiBarChartView = ChartView.extend({
        render: function () {
            var viewConfig = this.attributes.viewConfig,
                ajaxConfig = viewConfig['ajaxConfig'],
                self = this,
                selector = $(self.$el);

            if (self.model === null && viewConfig['modelConfig'] !== null) {
                self.model = new ContrailListModel(viewConfig['modelConfig']);
            }
            self.renderChart(selector, viewConfig, self.model)
            ChartView.prototype.bindListeners.call(self);
        },

        renderChart: function (selector, viewConfig, chartDataModel) {
            var chartViewConfig, chartModel, chartData, chartOptions;

            chartOptions = ifNull(viewConfig['chartOptions'], {});

            chartViewConfig = getChartViewConfig(chartData, chartOptions);
            chartData  = (chartDataModel instanceof Backbone.Model) ? chartDataModel.get('data') : chartDataModel.getItems(),
            chartOptions = chartViewConfig['chartOptions'];
            if (!chartData.length) {
                chartOptions['yDomain'] = [0,5];
                chartOptions['staggerLabels'] = false;
            }
            chartOptions.setTickValuesForByteAxis = this.setTickValuesForByteAxis;
            if (contrail.checkIfFunction(viewConfig['parseFn'])) {
                chartData = viewConfig['parseFn'](chartData, chartOptions, chartDataModel);
            }
            if ( ! chartDataModel.isRequestInProgress()) {
                chartData = chUtils.formatDataForMultibarChart(chartData);
            }
            if (cowu.isGridStackWidget(selector)) {
                chartOptions['height'] = $(selector).closest('.custom-grid-stack-item').height() - 10;
            }
            chartOptions['chartData'] = chartData;
            chartModel = new MultiBarChartModel(chartOptions);
            this.chartModel = chartModel;

            if ($(selector).find("svg") != null) {
                $(selector).empty();
            }
            ChartView.prototype.appendTemplate(selector, chartOptions);

            //Store the chart object as a data attribute so that the chart can be updated dynamically
            $(selector).data('chart', chartModel);
            if (!($(selector).is(':visible'))) {
                $(selector).find('svg').bind("refresh", function () {
                    d3.select($(selector)[0]).select('svg').datum(chartData).call(chartModel);
                });
            } else {
                d3.select($(selector)[0]).select('svg').datum(chartData).call(chartModel);
            }
            if(chartOptions['yUnit'] == 'bytes' || chartOptions['yUnit'] == 'bps') {
              var yTickValues = this.setTickValuesForByteAxis(
                      chartModel.yScale().domain()[0],
                      chartModel.yScale().domain()[1],
                      nv.utils.calcTicksY(chartOptions.height, chartData),
                      false, chartOptions['yUnit']);
              chartModel.yAxis.tickValues(yTickValues);
              d3.select($(selector)[0]).select('svg').datum(chartData).call(chartModel);
            }
            nv.utils.windowResize(function () {
                chUtils.updateChartOnResize(selector, chartModel);
            });

            if (chartOptions['deferredObj'] != null)
                chartOptions['deferredObj'].resolve();

        }
    });

    function getChartViewConfig(chartData, chartOptions) {
        var chartViewConfig = {};
        var chartDefaultOptions = {
            margin: {top: 10, right: 30, bottom: 80, left: 60},
            height: 250,
            barOrientation: 'vertical',
            xAxisLabel: 'Items',
            xAxisTickPadding: 10,
            yAxisLabel: 'Values',
            yAxisTickPadding: 5,
            yFormatter: function (d) {
                return cowu.addUnits2Bytes(d, false, false, 2);
            },
            showLegend: false,
            stacked: false,
            showControls: false,
            showTooltips: true,
            rotateLabels: 0,
            groupSpacing: 0.5,
            transitionDuration: 350,
            legendRightAlign: true,
            legendPadding: 32,
            barColor: d3.scale.category10()
        };
        //Incase of horizontal we need more left margin to 
        //accomodate the labels.
        if (chartOptions['barOrientation'] == 'horizontal') {
        	chartDefaultOptions.margin['left'] = 180;
        	chartDefaultOptions.margin['bottom'] = 80;
        }
        var chartOptions = $.extend(true, {}, chartDefaultOptions, chartOptions);

        chartViewConfig['chartData'] = chartData;
        chartViewConfig['chartOptions'] = chartOptions;

        return chartViewConfig;
    };

    return MultiBarChartView;
});

/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'core-basedir/js/models/MultiBarChartModel',
    'contrail-list-model',
    'nv.d3',
    'chart-utils'
], function (_, ContrailView, MultiBarChartModel, ContrailListModel, nv, chUtils) {
    var MultiBarChartView = ContrailView.extend({
        render: function () {
            var loadingSpinnerTemplate = contrail.getTemplate4Id(cowc.TMPL_LOADING_SPINNER),
                viewConfig = this.attributes.viewConfig,
                ajaxConfig = viewConfig['ajaxConfig'],
                self = this,
                selector = $(self.$el);

            $(selector).append(loadingSpinnerTemplate);

            if (self.model === null && viewConfig['modelConfig'] !== null) {
                self.model = new ContrailListModel(viewConfig['modelConfig']);
            }
            if (self.model !== null) {
                var callback = function () {
                    var chartData = self.model.getItems();
                    if (contrail.checkIfFunction(viewConfig['parseFn'])) {
                        chartData = viewConfig['parseFn'](chartData);
                    }
                    self.renderChart(selector, viewConfig, chartData);
                }
                if (self.model.loadedFromCache || !(self.model.isRequestInProgress())) {
                	callback();
                }

                self.model.onAllRequestsComplete.subscribe(function () {
                	callback();
                });

                if (viewConfig.loadChartInChunks) {
                    self.model.onDataUpdate.subscribe(function () {
                        callback();
                    });
                }
                var prevDimensions = chUtils.getDimensionsObj(self.$el);
                self.resizeFunction = _.debounce(function (e) {
                    if(!chUtils.isReRenderRequired({
                        prevDimensions:prevDimensions,
                        elem:self.$el})) {
                        return;
                    }
                    callback();
                 },cowc.THROTTLE_RESIZE_EVENT_TIME);

                $(self.$el).parents('.custom-grid-stack-item').on('resize',self.resizeFunction);

            }
        },

        renderChart: function (selector, viewConfig, data) {
            var chartViewConfig, chartModel, chartData, chartOptions;

            chartOptions = ifNull(viewConfig['chartOptions'], {});

            chartViewConfig = getChartViewConfig(data, chartOptions);
            chartData = chartViewConfig['chartData'];
            chartOptions = chartViewConfig['chartOptions'];
            if ($(selector).parents('.custom-grid-stack-item').length != 0) {
                chartOptions['height'] = $(selector).parents('.custom-grid-stack-item').height();
            }
            chartModel = new MultiBarChartModel(chartOptions);
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
                chUtils.updateChartOnResize(selector, chartModel);
            });

            if (chartOptions['deferredObj'] != null)
                chartOptions['deferredObj'].resolve();

            $(selector).find('.loading-spinner').remove();
        }
    });

    function getChartViewConfig(chartData, chartOptions) {
        var chartViewConfig = {};
        var chartDefaultOptions = {
            margin: {top: 10, right: 30, bottom: 20, left: 60},
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
            reduceXTicks: true,
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

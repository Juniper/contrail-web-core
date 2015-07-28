/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'core-basedir/js/models/MultiDonutChartModel',
    'contrail-list-model'
], function (_, Backbone, MultiDonutChartModel, ContrailListModel) {
    var HorizontalBarChartView = Backbone.View.extend({
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
                if (self.model.loadedFromCache || !(self.model.isRequestInProgress())) {
                    var chartData = self.model.getItems();
                    self.renderChart(selector, viewConfig, chartData);
                }

                self.model.onAllRequestsComplete.subscribe(function () {
                    var chartData = self.model.getItems();
                    self.renderChart(selector, viewConfig, chartData);
                });

                if (viewConfig.loadChartInChunks) {
                    self.model.onDataUpdate.subscribe(function () {
                        var chartData = self.model.getItems();
                        self.renderChart(selector, viewConfig, chartData);
                    });
                }
            }
        },

        renderChart: function (selector, viewConfig, data) {
            var chartViewConfig, chartModel, chartData, chartOptions, svgHeight;

            if (contrail.checkIfFunction(viewConfig['parseFn'])) {
                data = viewConfig['parseFn'](data);
            }

            chartOptions = ifNull(viewConfig['chartOptions'], {});

            chartViewConfig = getChartViewConfig(data, chartOptions);
            chartData = chartViewConfig['chartData'];
            chartOptions = chartViewConfig['chartOptions'];

            chartModel = new MultiDonutChartModel(chartOptions);
            this.chartModel = chartModel;

            svgHeight = chartOptions.height + 40;

            if ($(selector).find("svg") != null) {
                $(selector).empty();
            }

            $(selector).append("<svg style='height:" + svgHeight + "px;'></svg>");

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

            if (chartOptions['deferredObj'] != null)
                chartOptions['deferredObj'].resolve();

            $(selector).find('.loading-spinner').remove();
        }
    });

    function getChartViewConfig(chartData, chartOptions) {
        var chartViewConfig = {};

        var chartDefaultOptions = {
            margin: {top: 20, right: 20, bottom: 20, left: 30},
            width: 150,
            height: 150,
            innerArc: {
                color: d3.scale.ordinal().range(["#1F77B4", "#C6DBEF", "#ADD6FB", "#6BAED6", "#D6EBFD", "#5DAEF8"]),
                opacity: 0,
                tooltipFn: function (d) {
                    return {
                        series: [{
                            key: d.data.name,
                            value: '',
                            color: d.data.color
                        }]
                    };
                }
            },
            outerArc: {
                color: d3.scale.ordinal().range(["#2CA02C", "#FF7F0E", "#D62728"]),
                opacity: 0.5,
                tooltipFn: function (d) {
                    return {
                        series: [{
                            key: d.data.name,
                            value: '',
                            color: d.data.color
                        }]
                    };
                },
                flagKey: 'Normal'
            },
            barColor: d3.scale.category10()
        };
        var chartDefaultData = {
            innerData: [{
                name: "used",
                value: 0
            }, {
                name: "available",
                value: 100
            }],
            outerData: [{
                name: "Normal",
                value: 75
            }, {
                name: "Warning",
                value: 15
            }, {
                name: "Critical",
                value: 10
            }]
        };

        var chartOptions = $.extend(true, {}, chartDefaultOptions, chartOptions);
        var chartData = $.extend(true, {}, chartDefaultData, chartData);

        chartViewConfig['chartData'] = chartData;
        chartViewConfig['chartOptions'] = chartOptions;

        return chartViewConfig;
    };

    return HorizontalBarChartView;
});
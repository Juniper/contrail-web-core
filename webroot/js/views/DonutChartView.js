/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'core-basedir/js/models/DonutChartModel',
    'contrail-list-model'
], function (_, Backbone, DonutChartModel, ContrailListModel) {
    var DonutChartView = Backbone.View.extend({
        render: function () {
            var self = this,
                loadingSpinnerTemplate = contrail.getTemplate4Id(cowc.TMPL_LOADING_SPINNER),
                viewConfig = self.attributes.viewConfig,
                elementId = self.attributes.elementId,
                ajaxConfig = viewConfig['ajaxConfig'],
                selector = $(self.$el);

            if (contrail.checkIfExist(viewConfig.title) && viewConfig.title !== false) {
                var widgetTemplate = contrail.getTemplate4Id(cowc.TMPL_WIDGET_BOX),
                    widgetTemplateAttr = {
                        elementId: elementId,
                        title: viewConfig.title
                    };
                $(selector).append(widgetTemplate(widgetTemplateAttr));
                selector = ($('#' + elementId).find('.widget-main'));
            }

            $(selector).append(loadingSpinnerTemplate);

            if (viewConfig['modelConfig'] != null) {
                self.model = new ContrailListModel(viewConfig['modelConfig']);
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
            var chartViewConfig, chartModel, chartData, chartOptions;

            if (contrail.checkIfFunction(viewConfig['parseFn'])) {
                data = viewConfig['parseFn'](data);
            }

            chartOptions = ifNull(viewConfig['chartOptions'], {});

            chartViewConfig = getChartViewConfig(data, chartOptions);
            chartData = chartViewConfig['chartData'];
            chartOptions = chartViewConfig['chartOptions'];

            chartModel = new DonutChartModel(chartOptions);
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

            if (chartOptions['deferredObj'] != null)
                chartOptions['deferredObj'].resolve();

            $(selector).find('.loading-spinner').remove();
        }
    });

    function getChartViewConfig(chartData, chartOptions) {
        var chartViewConfig = {};
        var chartDefaultOptions = {
            margin: {top: 10, right: 20, bottom: 20, left: 20},
            height: 250,
            showLegend: true,
            legendPosition: "top",
            showLabels: true,
            showTooltips: true,
            valueFormat: function (d) {
                return d;
            },
            donutRatio: 0.5,
            color: d3.scale.category10(),
            noDataMessage: "Unable to get data"
        };
        var chartOptions = $.extend(true, {}, chartDefaultOptions, chartOptions);

        chartViewConfig['chartData'] = chartData;
        chartViewConfig['chartOptions'] = chartOptions;

        return chartViewConfig;
    };

    return DonutChartView;
});
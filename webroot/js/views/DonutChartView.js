/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'core-basedir/js/models/DonutChartModel',
    'contrail-list-model'
], function (_, ContrailView, DonutChartModel, ContrailListModel) {
    var DonutChartView = ContrailView.extend({
        render: function () {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                ajaxConfig = viewConfig['ajaxConfig'],
                selector = $(self.$el);

            if (self.model === null && viewConfig['modelConfig'] !== null) {
                self.model = new ContrailListModel(viewConfig['modelConfig']);
            }

            self.renderChart(selector, viewConfig, self.model);

            if (self.model !== null) {
                if(self.model.loadedFromCache || !(self.model.isRequestInProgress())) {
                    self.renderChart(selector, viewConfig, self.model);
                }

                self.model.onAllRequestsComplete.subscribe(function() {
                    self.renderChart(selector, viewConfig, self.model);
                });

                if(viewConfig.loadChartInChunks) {
                    self.model.onDataUpdate.subscribe(function() {
                        self.renderChart(selector, viewConfig, self.model);
                    });
                }
                var resizeFunction = function (e) {
                    self.renderChart(selector, viewConfig, self.model);
                };

                $(window)
                    .off('resize', resizeFunction)
                    .on('resize', resizeFunction);
            }
        },

        renderChart: function (selector, viewConfig, chartViewModel) {
            var data = chartViewModel.getItems(),
                chartTemplate = contrail.getTemplate4Id(cowc.TMPL_CHART),
                chartViewConfig, chartModel, chartData, chartOptions,
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ? viewConfig.widgetConfig : null;

            if (contrail.checkIfFunction(viewConfig['parseFn'])) {
                data = viewConfig['parseFn'](data);
            }

            chartViewConfig = getChartViewConfig(data, viewConfig);
            chartOptions = chartViewConfig['chartOptions'];
            chartModel = new DonutChartModel(chartOptions);

            this.chartModel = chartModel;

            if ($(selector).find("svg") != null) {
                $(selector).empty();
            }

            $(selector).append(chartTemplate(chartOptions));

            //Store the chart object as a data attribute so that the chart can be updated dynamically
            $(selector).data('chart', chartModel);

            if (!($(selector).is(':visible'))) {
                $(selector).find('svg').bind("refresh", function () {
                    setData2Chart(selector, chartViewConfig, chartViewModel, chartModel);
                });
            } else {
                setData2Chart(selector, chartViewConfig, chartViewModel, chartModel);
            }

            nv.utils.windowResize(function () {
                chUtils.updateChartOnResize(selector, chartModel);
            });

            if (chartOptions['deferredObj'] != null)
                chartOptions['deferredObj'].resolve();

            if (widgetConfig !== null) {
                this.renderView4Config(selector.find('.chart-container'), self.model, widgetConfig, null, null, null);
            }

        }
    });

    function setData2Chart(selector, chartViewConfig, chartViewModel, chartModel) {

        var chartData = chartViewConfig.chartData,
            checkEmptyDataCB = function (data) {
                return (!data || data.length === 0);
            },
            chartDataRequestState = cowu.getRequestState4Model(chartViewModel, chartData, checkEmptyDataCB),
            chartDataObj = {
                data: chartData,
                requestState: chartDataRequestState
            },
            chartOptions = chartViewConfig['chartOptions'];

        d3.select($(selector)[0]).select('svg').datum(chartDataObj).call(chartModel);

        if (chartDataRequestState !== cowc.DATA_REQUEST_STATE_SUCCESS_NOT_EMPTY) {
            var container = d3.select($(selector).find("svg")[0]),
                requestStateText = container.selectAll('.nv-requestState').data([cowm.getRequestMessage(chartDataRequestState)]),
                textPositionX = $(selector).width() / 2,
                textPositionY = chartOptions.height / 2;

            requestStateText
                .enter().append('text')
                .attr('class', 'nvd3 nv-requestState')
                .attr('dy', '-.7em')
                .style('text-anchor', 'middle');

            requestStateText
                .attr('x', textPositionX)
                .attr('y', textPositionY)
                .text(function(t){ return t; });

        } else {
            $(selector).find('.nv-requestState').remove();
        }
    }

    function getChartViewConfig(chartData, viewConfig) {
        var chartViewConfig = {},
            chartOptions = ifNull(viewConfig['chartOptions'], {}),
            chartDefaultOptions = {
                margin: {top: 0, right: 0, bottom: 0, left: 0},
                height: 250,
                showLegend: false,
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

        chartOptions = $.extend(true, {}, chartDefaultOptions, chartOptions);

        var dataZero = true;
        _.each(chartData, function(data) {
            if(data.value != 0) {
                dataZero = false;
            }
        });
        if(dataZero) {
            chartOptions['noDataMessage'] = "All values are 0.";
            chartData = [];
        }

        chartViewConfig['chartData'] = chartData;
        chartViewConfig['chartOptions'] = chartOptions;

        return chartViewConfig;
    };

    return DonutChartView;
});
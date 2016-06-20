/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'core-basedir/js/models/LineWithFocusChartModel',
    'contrail-list-model',
    'nv.d3'
], function (_, ContrailView, LineWithFocusChartModel, ContrailListModel,nv) {
    var LineWithFocusChartView = ContrailView.extend({
        render: function () {
            var viewConfig = this.attributes.viewConfig,
                ajaxConfig = viewConfig['ajaxConfig'],
                self = this, deferredObj = $.Deferred(),
                selector = $(self.$el),
                modelMap = contrail.handleIfNull(self.modelMap, {});

            if (contrail.checkIfExist(viewConfig.modelKey) && contrail.checkIfExist(modelMap[viewConfig.modelKey])) {
                self.model = modelMap[viewConfig.modelKey]
            }

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
            }
        },

        renderChart: function (selector, viewConfig, chartViewModel) {
            var self = this,
                modelData = chartViewModel.getItems(),
                data = modelData.slice(0),
                chartTemplate = contrail.getTemplate4Id(cowc.TMPL_CHART),
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ? viewConfig.widgetConfig : null,
                chartViewConfig, chartOptions, chartModel;

            if (contrail.checkIfFunction(viewConfig['parseFn'])) {
                data = viewConfig['parseFn'](data);
            }

            chartViewConfig = getChartViewConfig(data, viewConfig);
            chartOptions = chartViewConfig['chartOptions'];
            chartModel = new LineWithFocusChartModel(chartOptions);

            chartModel.chartOptions = chartOptions;

            self.chartModel = chartModel;

            if ($(selector).find("svg") != null) {
                $(selector).empty();
            }

            $(selector).append(chartTemplate(chartOptions));

            //Store the chart object as a data attribute so that the chart can be updated dynamically
            $(selector).data('chart', chartModel);

            if (!($(selector).is(':visible'))) {
                $(selector).find('svg').bind("refresh", function () {
                    setData2Chart(self, chartViewConfig, chartViewModel, chartModel);
                });
            } else {
                setData2Chart(self, chartViewConfig, chartViewModel, chartModel);
            }

            nv.utils.windowResize(function () {
                chUtils.updateChartOnResize(selector, chartModel);
            });
            //Seems like in d3 chart renders with some delay so this deferred object helps in that situation,which resolves once the chart is rendered
            if (chartOptions['deferredObj'] != null)
                chartOptions['deferredObj'].resolve();

            if (widgetConfig !== null) {
                this.renderView4Config(selector.find('.chart-container'), chartViewModel, widgetConfig, null, null, null, function(){
                    chUtils.updateChartOnResize(selector, chartModel);
                });
            }
        },

        renderMessage: function(message, selector, chartOptions) {
            var self = this,
                message = contrail.handleIfNull(message, ""),
                selector = contrail.handleIfNull(selector, $(self.$el)),
                chartOptions = contrail.handleIfNull(chartOptions, self.chartModel.chartOptions),
                container = d3.select($(selector).find("svg")[0]),
                requestStateText = container.selectAll('.nv-requestState').data([message]),
                textPositionX = $(selector).width() / 2,
                textPositionY = chartOptions.margin.top + $(selector).find('.nv-focus').heightSVG() / 2 + 10;

            requestStateText
                .enter().append('text')
                .attr('class', 'nvd3 nv-requestState')
                .attr('dy', '-.7em')
                .style('text-anchor', 'middle');

            requestStateText
                .attr('x', textPositionX)
                .attr('y', textPositionY)
                .text(function(t){ return t; });

        },

        removeMessage: function(selector) {
            var self = this,
                selector = contrail.handleIfNull(selector, $(self.$el));

            $(selector).find('.nv-requestState').remove();
        }
    });

    function setData2Chart(self, chartViewConfig, chartViewModel, chartModel) {

        var chartData = chartViewConfig.chartData,
            checkEmptyDataCB = function (data) {
                return (!data || data.length === 0 || !data.filter(function (d) { return d.values.length; }).length);
            },
            chartDataRequestState = cowu.getRequestState4Model(chartViewModel, chartData, checkEmptyDataCB),
            chartDataObj = {
                data: chartData,
                requestState: chartDataRequestState
            },
            chartOptions = chartViewConfig['chartOptions'];

        d3.select($(self.$el)[0]).select('svg').datum(chartDataObj).call(chartModel);

        if (chartOptions.defaultDataStatusMessage) {
            var messageHandler = chartOptions.statusMessageHandler;
            self.renderMessage(messageHandler(chartDataRequestState));

        } else {
            self.removeMessage();
        }
    }

    function getChartViewConfig(chartData, viewConfig) {
        var chartViewConfig = {},
            chartOptions = ifNull(viewConfig['chartOptions'], {}),
            chartAxesOptionKey = contrail.checkIfExist(chartOptions.chartAxesOptionKey) ? chartOptions.chartAxesOptionKey : null,
            chartAxesOption = (contrail.checkIfExist(chartOptions.chartAxesOptions) && chartAxesOptionKey !== null)? chartOptions.chartAxesOptions[chartAxesOptionKey] : {};

        chartOptions = $.extend(true, {}, covdc.lineWithFocusChartConfig, chartOptions, chartAxesOption);

        chartOptions['forceY'] = getForceYAxis(chartData, chartOptions);

        if (chartData.length > 0) {
            spliceBorderPoints(chartData);
            var values = chartData[0].values,
                brushExtent = null,
                start, end;
            end = values[values.length - 1];
            if (values.length >= 20) {
                start = values[values.length - 20];
                chartOptions['brushExtent'] = [chUtils.getViewFinderPoint(start.x), chUtils.getViewFinderPoint(end.x)];
            } else if (chartOptions['defaultSelRange'] != null && 
                  values.length >= parseInt(chartOptions['defaultSelRange'])) {
                var selectionRange = parseInt(chartOptions['defaultSelRange']);
                start = values[values.length - selectionRange];
                chartOptions['brushExtent'] = [chUtils.getViewFinderPoint(start.x), chUtils.getViewFinderPoint(end.x)];
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
            if (lineChart.length > 2) {
                lineChart['values'] = lineChart['values'].slice(1, -1);
            }
        }
    };

    function getForceYAxis(chartData, chartOptions) {
        var dataAllLines = [];

        for (var j = 0; j < chartData.length; j++) {
            dataAllLines = dataAllLines.concat(chartData[j]['values']);
        }

        if (contrail.checkIfExist(chartOptions.chartAxesOptions)) {
            $.each(chartOptions.chartAxesOptions, function(axisKey, axisValue) {
                var defaultForceY = axisValue['forceY'],
                    yAxisDataField = axisValue['yAxisDataField'];

                axisValue.forceY = cowu.getForceAxis4Chart(dataAllLines, yAxisDataField, defaultForceY);
            });
        }

        var defaultForceY = chartOptions['forceY'],
            yAxisDataField = contrail.checkIfExist(chartOptions['yAxisDataField']) ? chartOptions['yAxisDataField'] : 'y',
            forceY;

        forceY = cowu.getForceAxis4Chart(dataAllLines, yAxisDataField, defaultForceY);
        return forceY;
    };

    return LineWithFocusChartView;
});

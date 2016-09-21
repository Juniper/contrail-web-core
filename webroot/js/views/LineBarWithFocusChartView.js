/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'core-basedir/js/models/LineBarWithFocusChartModel',
    'contrail-list-model',
    'nv.d3',
    'chart-utils'
], function (_, ContrailView, LineBarWithFocusChartModel, ContrailListModel, nv, chUtils) {
    var LineBarWithFocusChartView = ContrailView.extend({
        render: function () {
            var viewConfig = this.attributes.viewConfig,
                ajaxConfig = viewConfig['ajaxConfig'],
                self = this, deferredObj = $.Deferred(),
                selector = $(self.$el),
                modelMap = contrail.handleIfNull(self.modelMap, {});

            if (contrail.checkIfExist(viewConfig.modelKey) && contrail.checkIfExist(modelMap[viewConfig.modelKey])) {
                self.model = modelMap[viewConfig.modelKey]
            }

            if (self.model === null && viewConfig['modelConfig'] != null) {
                self.model = new ContrailListModel(viewConfig['modelConfig']);
            }

            self.renderChart(selector, viewConfig, self.model);

            if (self.model !== null) {
                if (self.model.loadedFromCache || !(self.model.isRequestInProgress())) {
                    self.renderChart(selector, viewConfig, self.model);
                }

                self.model.onAllRequestsComplete.subscribe(function () {
                    self.renderChart(selector, viewConfig, self.model);
                });

                if (viewConfig.loadChartInChunks) {
                    self.model.onDataUpdate.subscribe(function () {
                        self.renderChart(selector, viewConfig, self.model);
                    });
                }
            }
        },

        renderChart: function (selector, viewConfig, chartViewModel) {
            var self = this,
                data = chartViewModel.getItems(),
                chartTemplate = contrail.getTemplate4Id(cowc.TMPL_CHART),
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ? viewConfig.widgetConfig : null,
                chartViewConfig, chartOptions, chartModel;

            if (contrail.checkIfFunction(viewConfig['parseFn'])) {
                data = viewConfig['parseFn'](data);
            }

            chartViewConfig = self.getChartViewConfig(data, viewConfig.chartOptions);
            chartOptions = chartViewConfig['chartOptions'];
            //viewConfig.chartOptions = chartOptions;
            chartModel = new LineBarWithFocusChartModel(chartOptions);
            chartModel.chartOptions = chartOptions;

            self.chartModel = chartModel;

            if ($(selector).find("svg") != null) {
                $(selector).empty();
            }

            $(selector).append(chartTemplate(chartOptions));

            //Store the chart object as a data attribute so that the chart can be updated dynamically
            $(selector).data('chart', chartModel);
            if (chartOptions['showLegend'] && chartOptions['legendView'] != null) {
                var barData = [], lineData = [];
                $.each(data, function(idx, obj) {
                    if (obj['bar']) {
                        barData.push({
                            name: obj['key'],
                            color: obj['color']
                        })
                    } else {
                        lineData.push({
                            name: obj['key'],
                            color: obj['color']
                        })
                    }
                });
                new chartOptions['legendView']({
                    el: $(selector),
                    legendConfig: {
                        showLegend: chartOptions['showLegend'],
                        legendData: [{
                            label: getValueByJsonPath(chartOptions, 'title'),
                            legend: barData
                        }, {
                            legend: lineData
                        }]
                    }
                });
            }

            nv.addGraph(function () {
                if (!($(selector).is(':visible'))) {
                    $(selector).find('svg').bind("refresh", function () {
                        setData2Chart(self, chartViewConfig, chartViewModel, chartModel);
                    });
                    
                } else {
                    setData2Chart(self, chartViewConfig, chartViewModel, chartModel);
                }
                var resizeFunction = function (e) {
                    if ($(selector).is(':visible')) {
                        setData2Chart(self, chartViewConfig, chartViewModel, chartModel);
                    }
                };
                $(window)
                    .off('resize', resizeFunction)
                    .on('resize', resizeFunction);

                nv.utils.windowResize(chartModel.update);

                chartModel.dispatch.on('stateChange', function (e) {
                    nv.log('New State:', JSON.stringify(e));
                });
                return chartModel;
            });

            if (widgetConfig !== null) {
                this.renderView4Config(selector.find('.chart-container'), chartViewModel, widgetConfig, null, null, null);
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
        },

        getChartViewConfig: function(chartData, chartOptions) {
            var chartViewConfig = {};

            var chartOptions = $.extend(true, {}, covdc.lineBarWithFocusChartConfig, chartOptions);

            chartOptions['forceY1'] = getForceY1Axis(chartData, chartOptions['forceY1']);
            chartOptions['forceY2'] = getForceY2Axis(chartData, chartOptions['forceY2']);
            if (chartData.length > 0 && chartOptions['focusEnable']) {
                var values = chartData[0].values,
                    brushExtent = null,
                    start, end;

                if (values.length >= 25) {
                    start = values[values.length - 25];
                    end = values[values.length - 1];
                    chartOptions['brushExtent'] = [chUtils.getViewFinderPoint(start.x), chUtils.getViewFinderPoint(end.x)];
                }
            }

            chartViewConfig['chartData'] = chartData;
            chartViewConfig['chartOptions'] = chartOptions;

            return chartViewConfig;
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

    function getForceY1Axis(chartData, defaultForceY1) {
        var dataBars = chartData.filter(function (d) {
                return !d.disabled && d.bar
            }),
            dataAllBars = [], forceY1;

        for (var j = 0; j < dataBars.length; j++) {
            dataAllBars = dataAllBars.concat(dataBars[j]['values']);
        }

        forceY1 = cowu.getForceAxis4Chart(dataAllBars, "y", defaultForceY1);
        return forceY1;
    };

    function getForceY2Axis(chartData, defaultForceY2) {
        var dataLines = chartData.filter(function (d) {
                return !d.bar
            }),
            dataAllLines = [], forceY2;

        for (var i = 0; i < dataLines.length; i++) {
            dataAllLines = dataAllLines.concat(dataLines[i]['values']);
        }

        forceY2 = cowu.getForceAxis4Chart(dataAllLines, "y", defaultForceY2);
        return forceY2;
    };

    return LineBarWithFocusChartView;
});

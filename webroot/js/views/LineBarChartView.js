/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'core-basedir/js/charts/LineBarChart',
    'contrail-list-model'
], function (_, ContrailView, LineBarChartContainer, ContrailListModel) {
    var LineBarChartView = ContrailView.extend({
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

                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ? viewConfig.widgetConfig : null,
                chartViewConfig;

            if (contrail.checkIfFunction(viewConfig['parseFn'])) {
                data = viewConfig['parseFn'](data);
            }

            chartViewConfig = getChartViewConfig(data, viewConfig.chartOptions);

            setData2ChartAndRender(self, selector, chartViewConfig, chartViewModel, LineBarChartContainer);

            if (widgetConfig !== null) {
                this.renderView4Config(selector.find('.coCharts-container'), chartViewModel, widgetConfig, null, null, null);
            }
        },

        renderMessage: function(message, selector, chartOptions) {
            var self = this,
                message = contrail.handleIfNull(message, ""),
                selector = contrail.handleIfNull(selector, $(self.$el)),
                chartOptions = contrail.handleIfNull(chartOptions, self.chartContainer.chartOptions);

            var svgElement = $(selector).find('svg');
            if(!svgElement.length)
                $('<svg style="height:300px;" class="row-fluid"></svg>').appendTo(selector);

            var container = d3.select($(selector).find("svg")[0]),
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
            $(selector).find('svg').remove();
        }
    });

    function setData2ChartAndRender(self, selector, chartViewConfig, chartViewModel, ChartContainer) {
        var chartTemplate = contrail.getTemplate4Id("coCharts-chart-template"),
            chartData = chartViewConfig.chartData,
            checkEmptyDataCB = function (data) {
                return (!data || data.length === 0 || !data.filter(function (d) { return d.values.length; }).length);
            },
            chartDataRequestState = cowu.getRequestState4Model(chartViewModel, chartData, checkEmptyDataCB),
            chartOptions = chartViewConfig['chartOptions'];

        self.chartContainer = contrail.handleIfNull(self.chartContainer, {}); //Initialize chart container with empty obj.

        if (chartOptions.defaultDataStatusMessage && !(chartData.length > 0 && chartData[0].values.length > 0)) {
            var messageHandler = chartOptions.statusMessageHandler;
            self.renderMessage(messageHandler(chartDataRequestState), selector, chartOptions);
        } else {
            self.removeMessage();
            $(selector).find(".coCharts-container").remove();
            $(selector).append(chartTemplate(chartOptions));

            var configDataObj  = createConfigAndData4ContrailD3(chartOptions, chartData);
            
            self.chartContainer = new ChartContainer(configDataObj.config, configDataObj.charts);
            self.chartContainer.chartOptions = chartOptions;

            self.chartContainer.render($(selector).find(".coCharts-container")[0]);

            //Store the chart object as a data attribute so that the chart can be updated dynamically
            $(selector).find(".coCharts-container").data('chart', self.chartContainer);
        }
    }

    function getChartViewConfig(chartData, chartOptions) {
        var chartViewConfig = {};

        var chartOptions = $.extend(true, {}, covdc.lineBarWithFocusChartConfig, chartOptions);

        chartOptions['chartId'] = 'linebar-chart';
        if (chartOptions['forceY1']) {
            chartOptions['forceY1'] = getForceY1Axis(chartData, chartOptions['forceY1'], chartOptions['metaData']);
        }
        if (chartOptions['forceY2']) {
            chartOptions['forceY2'] = getForceY2Axis(chartData, chartOptions['forceY2'], chartOptions['metaData']);
        }
        chartOptions['margin']['right'] += 40;
        chartOptions['margin2']['right'] += 40;

        if (chartData.length > 0) {
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
    };

    function getForceY1Axis(chartData, defaultForceY1, metaData) {
        var dataBars = chartData.filter(function (d) {
                return !d.disabled && d.bar
            }),
            dataAllBars = [], forceY1;

        for (var j = 0; j < dataBars.length; j++) {
            for (var key in metaData) {
                if (metaData[key].y == 1) {
                    _.each(dataBars[j].values, function(valObj) {
                        dataAllBars.push({y: valObj[key]});
                    });
                }
            }
        }

        forceY1 = cowu.getForceAxis4Chart(dataAllBars, "y", defaultForceY1);
        return forceY1;
    };

    function getForceY2Axis(chartData, defaultForceY2, metaData) {
        var dataLines = chartData.filter(function (d) {
                return !d.bar
            }),
            dataAllLines = [], forceY2;

        for (var i = 0; i < dataLines.length; i++) {
            for (var key in metaData) {
                if (metaData[key].y == 2) {
                    _.each(dataLines[i].values, function(valObj) {
                        dataAllLines.push({y: valObj[key]});
                    });
                }
            }
        }

        forceY2 = cowu.getForceAxis4Chart(dataAllLines, "y", defaultForceY2);
        return forceY2;
    };
    
    function createConfigAndData4ContrailD3(options, data) {

        var config = {
            metaData : {},
            components: [{
                type: "crosshair"
            }],
            options: {
                container : {
                    "mainChartHeight": 300,
                    "navChartHeight": 80,
                    "showControls": false
                },
                axes: {},
                brush: {
                    "size": 45
                }
            }
        };

        var chartSeries = [],
            metaKeyData = {};
        data.forEach(function(series, idx) {
            series.values.forEach(function(valueObj) {
                _.each(valueObj, function(value, key) {
                    var chartDataObj = {};
                    if (key !== options.xAccessor) {
                        chartDataObj[options.xAccessor] = valueObj[options.xAccessor];
                        chartDataObj[key] = value;
                        if (metaKeyData[key] == undefined) {
                            metaKeyData[key] = {
                                type: function(bar){return (bar) ? 'bar': 'line';}(series.bar),
                                color: options.metaData[key] && options.metaData[key].color || cowc.D3_COLOR_CATEGORY5[idx],
                                xField: options.xAccessor,
                                yField: key,
                                y: series.y || function(bar){return (bar) ? 1 : 2;}(series.bar),
                                data: [],
                                interpolate: options.metaData[key] && options.metaData[key].interpolate || "step-before",
                            };
                        }
                        metaKeyData[key].data.push(chartDataObj);
                    }
                });
            });
        });
        /**
         * only need chart data series for the field defined in metaData.
         */
        for (var key in options.metaData) {
            if (options.metaData.hasOwnProperty(key) && key !== options.xAccessor) {
                chartSeries.push(metaKeyData[key]);
            }
        }
        
        if (options.height) {
            config.options.container.mainChartHeight =  options.height - config.options.container.navChartHeight;
        }
        config.options.container.mainChartMargin = (options.margin) ? options.margin: {top: 20, right: 110, bottom: 50, left: 70};
        config.options.container.navChartMargin = (options.margin2) ? options.margin2: {top: 0, right: 110, bottom: 20, left: 70};

        config.metaData = options.metaData;

        config.options.axes = {
            grid: {
                ticksAmount: 5,
            },
            y1Label: options.y1AxisLabel,
            y2Label: options.y2AxisLabel,
            forceY1: options.forceY1,
            forceY2: options.forceY2,
            x1Formatter: options.xFormatter,
            y1Formatter: options.y1Formatter,
            y2Formatter: options.y2Formatter,
            yTicks: (options.yTicks != undefined) ? options.yTicks : 4
        };

        config.options.container.showContainer = options.showLegend;
        config.options.brush.extent = options.brushExtent;
        
        return {
            config: config,
            charts: chartSeries
        };

    }

    return LineBarChartView;
});
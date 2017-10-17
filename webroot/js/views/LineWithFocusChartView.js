/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'chart-view',
    'core-basedir/js/models/LineWithFocusChartModel',
    'contrail-list-model',
    'nv.d3',
    'chart-utils'
], function (_, ChartView, LineWithFocusChartModel, ContrailListModel, nv, chUtils) {
    var LineWithFocusChartView = ChartView.extend({
        settingsChanged: function(newSettings) {
            var self = this,
                vc = self.attributes.viewConfig;
            if(vc.hasOwnProperty("chartOptions")) {
                vc.chartOptions["resetColor"] = true;
                for(var key in newSettings) {
                    if(key in vc.chartOptions) {
                        vc.chartOptions[key] = newSettings[key];
                    }
                }
                if(!vc.chartOptions.staticColor &&
                    typeof vc.chartOptions["colors"] != 'function') {
                    vc.chartOptions["colors"] = cowc.FIVE_NODE_COLOR;
                }
            }

            self.renderChart($(self.$el), vc, self.model);
        },

        render: function () {
            var viewConfig = this.attributes.viewConfig,
                ajaxConfig = viewConfig['ajaxConfig'],
                self = this, deferredObj = $.Deferred(),
                selector = $(self.$el),
                modelMap = contrail.handleIfNull(self.modelMap, {});
            //settings
            cowu.updateSettingsWithCookie(viewConfig);
            self.viewConfig = viewConfig;

            /*if (contrail.checkIfExist(viewConfig.modelKey) && contrail.checkIfExist(modelMap[viewConfig.modelKey])) {
                self.model = modelMap[viewConfig.modelKey]
            }*/

            if (self.model === null && viewConfig['modelConfig'] !== null) {
                self.model = new ContrailListModel(viewConfig['modelConfig']);
            }

            self.renderChart(selector, viewConfig, self.model);
            self.updateOverviewText();
            ChartView.prototype.bindListeners.call(self);
        },

        renderChart: function (selector, viewConfig, chartDataModel) {
            var self = this,
                modelData = (chartDataModel instanceof Backbone.Model) ? chartDataModel.get('data') : chartDataModel.getItems(),
                data = modelData.slice(0), //work with shallow copy
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ? viewConfig.widgetConfig : null,
                chartViewConfig, chartOptions, chartViewModel,
                yAxisOffset = getValueByJsonPath(viewConfig, 'chartOptions;yAxisOffset', 0),
                defaultZeroLineDisplay = getValueByJsonPath(viewConfig,'chartOptions;defaultZeroLineDisplay', false);
                

            if (contrail.checkIfFunction(viewConfig['parseFn'])) {
                if(viewConfig['parseFn'] === cowu.chartDataFormatter && chartDataModel instanceof Backbone.Model) {
                    viewConfig['chartOptions'].type = chartDataModel.get('type');
                }
                data = viewConfig['parseFn'](data, viewConfig['chartOptions'], chartDataModel.isRequestInProgress());
            }
            if (cowu.isGridStackWidget(selector)) {
                viewConfig['chartOptions']['height'] = $(selector).closest('.custom-grid-stack-item').height();
            }
            chartViewConfig = self.getChartViewConfig(data, viewConfig, chartDataModel.isRequestInProgress());
            chartOptions = chartViewConfig['chartOptions'];
            var chartOptionsForSize = ChartView.prototype.getChartOptionsFromDimension(selector);
            //TODO Need to check overview chart enabled cases on resize
            chartOptions = $.extend(true, {}, chartOptions, chartOptionsForSize);
            var showLegend = getValueByJsonPath(chartOptions,'showLegend',false);
            ChartView.prototype.appendTemplate(selector, chartOptions);
            ChartView.prototype.renderLegend(selector, chartOptions, getLegendViewConfig(chartOptions, data));
            selector = $(selector).find('.main-chart');
            chartViewModel = new LineWithFocusChartModel(chartOptions);
            chartViewModel.chartOptions = chartOptions;

            self.chartViewModel = chartViewModel;

            //Store the chart object as a data attribute so that the chart can be updated dynamically
            $(selector).data('chart', chartViewModel);

            /*$(selector).find('svg').bind("refresh", function () {
                self.updateChart(selector, viewConfig, chartDataModel);
            });

            self.resizeFn = _.debounce(function () {
                chUtils.updateChartOnResize($(self.$el), self.chartViewModel);
            }, 500);
            nv.utils.windowResize(self.resizeFn);*/

            if ($(selector).is(':visible')) {
                setData2Chart(self, chartViewConfig, chartDataModel, chartViewModel);
            }
            if (chartOptions.showTextAtCenter) {
                self.showText(data, viewConfig);
            }
            updateDataStatusMessage(self, chartViewConfig, chartDataModel);

            //Seems like in d3 chart renders with some delay so this deferred object helps in that situation,which resolves once the chart is rendered
            if (chartOptions['deferredObj'] != null)
                chartOptions['deferredObj'].resolve();

            if (widgetConfig !== null) {
                this.renderView4Config(selector.find('.chart-container'), chartDataModel, widgetConfig, null, null, null, function(){
                    chUtils.updateChartOnResize(selector, chartViewModel);
                });
            }

        },

        getChartViewConfig: function(chartData, viewConfig, isRequestInProgress) {
            var chartViewConfig = {},
                chartOptions = ifNull(viewConfig['chartOptions'], {}),
                chartAxesOptionKey = contrail.checkIfExist(chartOptions.chartAxesOptionKey) ? chartOptions.chartAxesOptionKey : null,
                chartAxesOption = (contrail.checkIfExist(chartOptions.chartAxesOptions) && chartAxesOptionKey !== null)? chartOptions.chartAxesOptions[chartAxesOptionKey] : {};

            chartOptions = $.extend(true, {}, covdc.lineWithFocusChartConfig, chartOptions, chartAxesOption);

            chartOptions['forceY'] = getForceYAxis(chartData, chartOptions, isRequestInProgress);

            if (chartData.length > 0) {
                if (chartOptions['spliceAtBorders'] != false) {
                    spliceBorderPoints(chartData);
                }

                var values = chartData[0].values,
                    brushExtent = null,
                    hideFocusChart = getValueByJsonPath(chartOptions,'hideFocusChart', false),
                    start, end;
                end = values[values.length - 1];
                if (values.length >= 20) {
                    start = values[values.length - 20];
                    if(!hideFocusChart){
                        chartOptions['brushExtent'] = [chUtils.getViewFinderPoint(start.x),
                            chUtils.getViewFinderPoint(end.x)];
                    }
                } else if (chartOptions['defaultSelRange'] != null &&
                    values.length >= parseInt(chartOptions['defaultSelRange'])) {
                    var selectionRange = parseInt(chartOptions['defaultSelRange']);
                    start = values[values.length - selectionRange];
                    if(!hideFocusChart){
                        chartOptions['brushExtent'] = [chUtils.getViewFinderPoint(start.x),
                            chUtils.getViewFinderPoint(end.x)];
                    }
                }
            }

            chartViewConfig['chartData'] = chartData;
            chartViewConfig['chartOptions'] = chartOptions;

            return chartViewConfig;
        },

        updateChart: function(selector, viewConfig, dataModel) {
            var self = this,
                dataModel = dataModel ? dataModel : self.model(),
                data = dataModel.getItems();

            //Todo 'parseFn' may not be defined always. May need to make chartDataFormatter with a config.
            if (_.isFunction(viewConfig.parseFn)) {
                data = viewConfig['parseFn'](data, viewConfig['chartOptions']);
            }
            //Todo remove the dependency to calculate the chartData and chartOptions via below function.
            var chartViewConfig = self.getChartViewConfig(data, viewConfig, dataModel.isRequestInProgress());
            //If legendView exist, update with new config built from new data.
            //if (self.legendView) self.legendView.update(getLegendViewConfig(chartViewConfig.chartOptions, data));
            ChartView.prototype.renderLegend(selector, chartViewConfig['chartOptions'],
                 getLegendViewConfig(chartViewConfig['chartOptions'], data));
            setData2Chart(self, chartViewConfig, dataModel, self.chartViewModel);
            if (cowu.getValueByJsonPath(viewConfig, 'chartOptions;showTextAtCenter', false)) {
                self.showText(data, viewConfig);
            }
            updateDataStatusMessage(self, chartViewConfig, dataModel);
        }
    });
    function setData2Chart(self, chartViewConfig, chartDataModel, chartViewModel) {
        var chartDataObj = {
            data: chartViewConfig.chartData,
            requestState: getDataRequestState(chartViewConfig, chartDataModel)
        };
        if(contrail.checkIfExist(chartViewConfig.chartOptions.forceY)) {
            chartViewModel.lines.forceY(chartViewConfig.chartOptions.forceY);
            chartViewModel.lines2.forceY(chartViewConfig.chartOptions.forceY);
        }
        d3.select($(self.$el)[0]).select('svg').datum(chartDataObj).call(chartViewModel);
    }

    function getDataRequestState(chartViewConfig, chartDataModel) {
        var chartData = chartViewConfig.chartData,
            checkEmptyDataCB = function (data) {
                if(chartDataModel instanceof Backbone.Model) {
                    return !chartDataModel.get('data');
                } else {
                    return (!data || data.length === 0 || !data.filter(function (d) { return d.values.length; }).length);
                }
            };
        return cowu.getRequestState4Model(chartDataModel, chartData, checkEmptyDataCB);
    }

    function updateDataStatusMessage(self, chartViewConfig, dataModel) {
        var chartDataModel = dataModel || self.model(),
            chartOptions = chartViewConfig.chartOptions,
            chartDataRequestState = getDataRequestState(chartViewConfig, chartDataModel);
        if (chartOptions.defaultDataStatusMessage) {
            var messageHandler = chartOptions.statusMessageHandler;
            self.renderMessage(messageHandler(chartDataRequestState));
        } else {
            self.removeMessage();
        }
    }

    function spliceBorderPoints(chartData) {
        var lineChart;
        for(var i = 0; i < chartData.length; i++) {
            lineChart = chartData[i];
            //Taking out first and last value as it may be incomplete sample.
            if (lineChart.values.length > 2) {
                lineChart['values'] = lineChart['values'].slice(1, -1);
            }
        }
    };

    function getForceYAxis(chartData, chartOptions, isRequestInProgress) {
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

    function formatLegendData(data) {
        var lineData = [];
        _.each(data, function(obj) {
            lineData.push({
                name: obj['key'],
                color: obj['color']
            });
        });
        return {line: lineData};
    };

    function getLegendViewConfig(chartOptions, data) {
        return {
            showLegend: chartOptions['showLegend'],
            legendData: [{
                label: getValueByJsonPath(chartOptions, 'title'),
                legend: formatLegendData(data).line
            }]
        };
    }

    return LineWithFocusChartView;
});

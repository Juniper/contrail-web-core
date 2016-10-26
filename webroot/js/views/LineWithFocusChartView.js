/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'core-basedir/js/models/LineWithFocusChartModel',
    'contrail-list-model',
    'nv.d3',
    'chart-utils'
], function (_, ContrailView, LineWithFocusChartModel, ContrailListModel, nv, chUtils) {
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
                    self.updateChart(selector, viewConfig, self.model);
                }

                self.model.onAllRequestsComplete.subscribe(function() {
                    self.updateChart(selector, viewConfig, self.model);
                });

                if(viewConfig.loadChartInChunks) {
                    self.model.onDataUpdate.subscribe(function() {
                        self.updateChart(selector, viewConfig, self.model);
                    });
                }
                var prevDimensions = chUtils.getDimensionsObj(self.$el);
                self.resizeFunction = _.debounce(function (e) {
                    if(!chUtils.isReRenderRequired({
                        prevDimensions:prevDimensions,
                        elem:self.$el})) {
                        return;
                    }
                     self.renderChart($(self.$el), viewConfig, self.model);
                 },cowc.THROTTLE_RESIZE_EVENT_TIME);

                $(self.$el).parents('.custom-grid-stack-item').on('resize',self.resizeFunction);
            }
        },

        renderChart: function (selector, viewConfig, chartViewModel) {
            var self = this,
                modelData = chartViewModel.getItems(),
                data = modelData.slice(0),
                chartTemplate = contrail.getTemplate4Id(cowc.TMPL_CHART),
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ? viewConfig.widgetConfig : null,
                chartViewConfig, chartOptions, chartModel,
                showLegend = getValueByJsonPath(viewConfig,'chartOptions;showLegend',false),
                defaultZeroLineDisplay = getValueByJsonPath(viewConfig,'chartOptions;defaultZeroLineDisplay', false);

            if (contrail.checkIfFunction(viewConfig['parseFn'])) {
                data = viewConfig['parseFn'](data, viewConfig['chartOptions']);
            }

            //plot default line
            if(data.length === 0 && defaultZeroLineDisplay){
                var defData = {key:'', color:cowc.DEFAULT_COLOR, values:[]},
                    start = Date.now() - (2 * 60 * 60 * 1000),
                    end = Date.now();

                defData.values.push({x:start, y:0.01, tooltip:false});
                defData.values.push({x:start, y:0.01, tooltip:false});
                defData.values.push({x:end, y:0.01, tooltip:false});
                viewConfig.chartOptions.forceY = [0, 1];
                viewConfig.chartOptions.defaultDataStatusMessage = false;
                data.push(defData);
            }
            if ($(selector).parents('.custom-grid-stack-item').length != 0) {
                viewConfig['chartOptions']['height'] = $(selector).parents('.custom-grid-stack-item').height() - 40;
            }
            chartViewConfig = self.getChartViewConfig(data, viewConfig);
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

            if (chartOptions['showLegend'] && chartOptions['legendView'] != null) {
                self.legendView = new chartOptions['legendView']({
                    el: $(selector),
                    viewConfig: getLegendViewConfig(chartOptions, data)
                });
                self.legendView.render();
            }

            if (!($(selector).is(':visible'))) {
                $(selector).find('svg').bind("refresh", function () {
                    setData2Chart(self, chartViewConfig, chartViewModel, chartModel);
                });
            } else {
                setData2Chart(self, chartViewConfig, chartViewModel, chartModel);
            }

            self.resizeFn = _.debounce(function () {
                chUtils.updateChartOnResize($(self.$el), self.chartModel);
            }, 500);
            nv.utils.windowResize(self.resizeFn);

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
        },

        resize: function() {
            var self = this;
            _.isFuntion(self.resizeFn) && self.resizeFn();
        },

        getChartViewConfig: function(chartData, viewConfig) {
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
            var chartViewConfig = self.getChartViewConfig(data, viewConfig);
            //If legendView exist, update with new config built from new data.
            if (self.legendView) self.legendView.update(getLegendViewConfig(chartViewConfig.chartOptions, data));

            setData2Chart(self, chartViewConfig, dataModel, self.chartModel);
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

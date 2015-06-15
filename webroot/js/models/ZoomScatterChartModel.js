/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var ZoomScatterChartModel = function (dataListModel, chartConfig) {
        var self = this, forceX = chartConfig.forceX,
            forceY = chartConfig.forceY, margin = chartConfig.margin,
            rawData = dataListModel.getFilteredItems(),
            chartData, d3Scale;

        self.data = chartConfig['dataParser'](rawData);
        self.margin = margin,
        chartData = self.data;
        self.sizeFieldName = contrail.handleIfNull(chartConfig['sizeFieldName'], 'size');

        self.sizeMinMax = getSizeMinMax(chartData, self.sizeFieldName);

        d3Scale = d3.scale.linear().range([6, 10]).domain(self.sizeMinMax);

        $.each(chartData, function (idx, chartDataPoint) {
            chartDataPoint['size'] = contrail.handleIfNaN(d3Scale(chartDataPoint[self.sizeFieldName]), 6);
        });

        self.width = chartConfig['width'] - margin.left - margin.right;
        self.height = chartConfig['height'] - margin.top - margin.bottom;

        self.xMin = 0;
        self.yMin = 0;

        if(chartData.length > 0) {
            self.xMax = Math.ceil(d3.max(chartData, function (d) {
                return +d[chartConfig.xField];
            }) * 1.1);

            self.yMax = Math.ceil(d3.max(chartData, function (d) {
                return +d[chartConfig.yField];
            }) * 1.1);

            if (self.xMax <= 0) {
                self.xMax = 1;
            }

            if (self.yMax <= 0) {
                self.yMax = 1;
            }

        } else {
            self.xMax = 0;
            self.yMax = 0;
        }

        if (forceX) {
            if (self.xMin > forceX[0]) {
                self.xMin = forceX[0];
            }

            if (self.xMax < forceX[1]) {
                self.xMax = forceX[1];
            }
        }

        if (forceY) {
            if (self.yMin > forceY[0]) {
                self.yMin = forceY[0];
            }

            if (self.yMax < forceY[1]) {
                self.yMax = forceY[1];
            }
        }

        self.xScale = d3.scale.linear().domain([self.xMin, self.xMax]).range([0, self.width]);
        self.yScale = d3.scale.linear().domain([self.yMin, self.yMax]).range([self.height, 0]);

        self.zoomBehavior = d3.behavior.zoom().x(self.xScale).y(self.yScale).scaleExtent([1, 4]);

        self.maxColorFilterFields = d3.max(chartData, function (d) {
            return +d[chartConfig.colorFilterFields]
        });

        self.classes = ['error', 'warning', 'medium', 'okay', 'default'];

        self.xAxis = d3.svg.axis().scale(self.xScale).orient("bottom").ticks(10)
            .tickSize(-self.height)
            .tickFormat(contrail.checkIfFunction(chartConfig.xLabelFormat) ? chartConfig.xLabelFormat : d3.format("d"));
        self.yAxis = d3.svg.axis().scale(self.yScale).orient("left").ticks(5)
            .tickSize(-self.width)
            .tickFormat(contrail.checkIfFunction(chartConfig.yLabelFormat) ? chartConfig.yLabelFormat : d3.format("d"))

        self.xMed = median(_.map(chartData, function (d) {
            return d[chartConfig.xField];
        }));

        self.yMed = median(_.map(chartData, function (d) {
            return d[chartConfig.yField];
        }));

        self.getNoDataMessage = function() {
            updateNoDataMessage(dataListModel, self);
            return self.noDataMessage;
        };

        return self;
    };

    function updateNoDataMessage (dataListModel, chartModel) {
        var error = dataListModel.error,
            noDataMessage = cowc.CHART_LOADING_MESSAGE;

        if (dataListModel.isRequestInProgress()) {
            chartModel.noDataMessage = cowc.CHART_LOADING_MESSAGE;
        } else if (chartModel['noDataMessage']) {
            chartModel.noDataMessage = chartModel['noDataMessage'];
        } else if (error) {
            chartModel.noDataMessage = cowc.DATA_ERROR_MESSAGE;
        } else if(dataListModel.getItems().length == 0) {
            chartModel.noDataMessage = cowc.CHART_NO_DATA_MESSAGE;
        }

        return noDataMessage;
    };

    function median(values) {
        values.sort(function (a, b) {
            return a - b;
        });
        var half = Math.floor(values.length / 2);

        if (values.length % 2)
            return values[half];
        else
            return (parseFloat(values[half - 1]) + parseFloat(values[half])) / 2.0;
    };

    function getSizeMinMax(chartData, sizeFieldName) {
        //Merge the data values array if there are multiple categories plotted in chart, to get min/max values
        var sizeMinMax, dValues;

        dValues = flattenList(chartData);

        sizeMinMax = getBubbleSizeRange(dValues, sizeFieldName);
        return sizeMinMax;
    }

    function getBubbleSizeRange(values, sizeFieldName) {
        var sizeMinMax = [];
        sizeMinMax = d3.extent(values, function (obj) {
            return  contrail.handleIfNaN(obj[sizeFieldName], 0)
        });
        if (sizeMinMax[0] == sizeMinMax[1]) {
            sizeMinMax = [sizeMinMax[0] * .9, sizeMinMax[0] * 1.1];
        } else {
            sizeMinMax = [sizeMinMax[0], sizeMinMax[1]];
        }
        return sizeMinMax;
    }

    return ZoomScatterChartModel;
});

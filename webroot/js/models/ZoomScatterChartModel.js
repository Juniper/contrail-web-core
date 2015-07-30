/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var ZoomScatterChartModel = function (dataListModel, chartConfig) {
        var self = this, forceX = chartConfig.forceX,
            forceY = chartConfig.forceY, margin = chartConfig.margin,
            chartData, d3Scale;

        self.margin = margin;
        self.noDataMessage = chartConfig['noDataMessage'];

        self.classes = ['error', 'warning', 'medium', 'okay', 'default'];

        self.loadedFromCache = dataListModel.loadedFromCache;

        self.isRequestInProgress = function() {
            return dataListModel.isRequestInProgress()
        };

        self.isPrimaryRequestInProgress = function() {
            return dataListModel.isPrimaryRequestInProgress()
        };

        self.isError = function() {
            if (contrail.checkIfExist(dataListModel.error) && dataListModel.error === true && dataListModel.errorList.length > 0) {
                var xhr = dataListModel.errorList[0];
                if(!(xhr.status === 0 && xhr.statusText === 'abort')) {
                    return true;
                }
            }
            return false;
        };

        self.isEmpty = function() {
            if (contrail.checkIfExist(dataListModel.empty)) {
                return (dataListModel.empty) ? true : ((dataListModel.getFilteredItems().length == 0) ? true : false);
            }
            return false;
        };

        self.refresh = function(chartConfig) {
            var rawData = dataListModel.getFilteredItems();
            self.data = contrail.checkIfFunction(chartConfig['dataParser']) ? chartConfig['dataParser'](rawData) : rawData;

            chartData = self.data;
            self.sizeFieldName = contrail.handleIfNull(chartConfig['sizeFieldName'], 'size');
            self.sizeMinMax = getSizeMinMax(chartData, self.sizeFieldName);

            d3Scale = d3.scale.linear().range([6, 10]).domain(self.sizeMinMax);

            $.each(chartData, function (idx, chartDataPoint) {
                chartDataPoint['size'] = contrail.handleIfNaN(d3Scale(chartDataPoint[self.sizeFieldName]), 6);
            });

            self.width = chartConfig['width'] - margin.left - margin.right;
            self.height = chartConfig['height'] - margin.top - margin.bottom;

            forceX = cowu.getForceAxis4Chart(chartData, chartConfig.xField, forceX);
            forceY = cowu.getForceAxis4Chart(chartData, chartConfig.yField, forceY);

            self.xMin = forceX[0];
            self.xMax = forceX[1];

            self.yMin = forceY[0];
            self.yMax = forceY[1];

            self.xScale = d3.scale.linear().domain([self.xMin, self.xMax]).range([0, self.width]);
            self.yScale = d3.scale.linear().domain([self.yMin, self.yMax]).range([self.height, 0]);

            self.zoomBehavior = d3.behavior.zoom().x(self.xScale).y(self.yScale).scaleExtent([1, 4]);

            self.maxColorFilterFields = d3.max(chartData, function (d) {
                return +d[chartConfig.colorFilterFields]
            });

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
        };

        self.refresh(chartConfig);

        return self;
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

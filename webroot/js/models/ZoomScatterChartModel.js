/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var ZoomScatterChartModel = function(rawData, modelConfig) {
        var self = this, chartData;

        self.data = modelConfig['dataParser'](rawData);
        chartData = self.data;

        self.width = modelConfig['width'];
        self.height = modelConfig['height'];

        self.xMax = d3.max(chartData, function (d) {
                    return +d[modelConfig.xField];
                }) * 1.05;

        if (self.xMax <=0)
            self.xMax = 1;

        self.xMin = -0.01;

        self.yMax = d3.max(chartData, function (d) {
                    return +d[modelConfig.yField];
                }) * 1.05;

        if (self.yMax <=0)
            self.yMax = 1;

        self.yMin = -0.05;

        self.xScale = d3.scale.linear().domain([self.xMin, self.xMax]).range([0, self.width]);
        self.yScale = d3.scale.linear().domain([self.yMin, self.yMax]).range([self.height, 0]);

        self.zoomBehavior = d3.behavior.zoom().x(self.xScale).y(self.yScale).scaleExtent([1, 4]);

        self.maxColorFilterFields = d3.max(chartData, function (d) {
            return +d[modelConfig.colorFilterFields]
        });

        self.classes = ['high', 'medium', 'low', 'negative'];

        self.xAxis = d3.svg.axis().scale(self.xScale).orient("bottom").ticks(5)
                            .tickSize(-self.height)
                            .tickFormat(d3.format(".02f"));

        self.yAxis = d3.svg.axis().scale(self.yScale).orient("left").ticks(5)
                            .tickSize(-self.width)
                            .tickFormat(d3.format(".02f"));

        self.xMed = median(_.map(chartData, function (d) {
            return d[modelConfig.xField];
        }));

        self.yMed = median(_.map(chartData, function (d) {
            return d[modelConfig.yField];
        }));

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

    return ZoomScatterChartModel;
});

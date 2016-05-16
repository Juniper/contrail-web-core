/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'core-basedir/js/charts/base/BarChartStrategy'
], function (BarChartStrategy) {

    /**
     *
     */
    var BarChartStackedStrategy = function (charts) {

        coCharts.BarChartStrategy.call(this, charts);
    }


    BarChartStackedStrategy.prototype = Object.create(BarChartStrategy.prototype);


    /**
     * @override
     */
    BarChartStackedStrategy.prototype.getYDomain = function(axis, number) {
        /*
         * Define arrays of chart's data min and max values.
         */
        var dataSet = [];
        /*
         * Fill arrays.
         */
        this.getCharts().forEach(function(context) {
            dataSet.push(context.chart.getData().map(context.chart._yAccessor));
        });
        /*
         * Call parent method if arrays empty.
         */
        if (dataSet.length === 0) {
            return contrailD3.BarChartStrategy.prototype.getYDomain.call(this, axis, number);
        }
        /*
         * Get very max value.
         */
        var length = d3.max(dataSet.map(function(data) {
            return data.length
        }));
        /*
         * Define domain variable.
         */
        var domain = [Infinity, - Infinity];
        /*
         * Calculate actual domain extent.
         */
        for (var i = 0; i < length; i ++) {
            domain[0] = Math.min(d3.min(dataSet.map(function(data) {
                return data[i]
            })), domain[0]);
            domain[1] = Math.max(d3.sum(dataSet.map(function(data) {
                return data[i]
            })), domain[1]);
        }

        return domain;
    };


    /**
     * @override
     */
    BarChartStackedStrategy.prototype.getWidth = function (chart) {

        return chart.getWidth() / chart.getData().length - this.getGap(chart);
    };


    /**
     * @override
     */
    BarChartStackedStrategy.prototype.getX = function (chart, d, i) {

        var delimeter = chart.getData().length > 1 ? 1 : 0;
        return chart._xScale(chart._xAccessor(d)) - this.getWidth(chart) / (chart.getData().length - delimeter) * i;
    };


    /**
     * @override
     */
    BarChartStackedStrategy.prototype.getY = function (chart, d, i) {

        var y = chart._height - this.getHeight(chart, d, i);
        var charts = this.getCharts();

        for (var j = 0; j < charts.length; j ++) {
            if (chart == charts[j].chart) {
                break;
            }

            y -= this.getHeight(charts[j].chart, charts[j].chart.getData()[i], i);
        }

        return y;
    };

    return BarChartStackedStrategy;
});
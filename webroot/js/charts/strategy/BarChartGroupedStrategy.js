/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'core-basedir/js/charts/base/BarChartStrategy'
], function (BarChartStrategy) {

    /**
     *
     */
    var BarChartGroupedStrategy = function (charts) {

        coCharts.BarChartStrategy.call(this, charts);
    }


    BarChartGroupedStrategy.prototype = Object.create(BarChartStrategy.prototype);


    /**
     * @override
     */
    BarChartGroupedStrategy.prototype.getWidth = function (chart) {

        return (chart.getWidth() / chart.getData().length - this.getGap(chart)) / this.getSize();
    };


    /**
     * @override
     */
    BarChartGroupedStrategy.prototype.getX = function (chart, d, i) {

        var charts = this.getCharts();
        /*
         * Get chart number.
         */
        var j;
        for (j = 0; j < charts.length; j ++) {
            if (chart == charts[j].chart) {
                break;
            }
        }
        /*
         * Get bar width.
         */
        var barWidth = this.getWidth(chart);
        /*
         * Calculate and return bar x position.
         */
        var delimeter = chart.getData().length > 1 ? 1 : 0;
        return chart._xScale(chart._xAccessor(d)) - barWidth * charts.length / (chart.getData().length - delimeter) * i + barWidth * j;
    };


    /**
     * @override
     */
    BarChartGroupedStrategy.prototype.getY = function (chart, d, i) {

        return chart._yScale(chart._yAccessor(d));
    };


    /**
     * @override
     */
    BarChartGroupedStrategy.prototype.getHeight = function (chart, d, i) {

        return chart._height - chart._yScale(chart._yAccessor(d));
    };
    
    return BarChartGroupedStrategy;
});
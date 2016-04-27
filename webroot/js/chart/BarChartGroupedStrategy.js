/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'core-basedir/js/chart/BarChartStrategy'
], function (BarChartStrategy) {

    /**
     *
     */
    var BarChartGroupedStrategy = function (charts) {

        contrailD3.BarChartStrategy.call(this, charts);
    }


    BarChartGroupedStrategy.prototype = Object.create(BarChartStrategy.prototype);


    /**
     * @override
     */
    BarChartGroupedStrategy.prototype.getGap = function (chart) {

        return chart.getWidth() / chart.getData().length / this._charts.length / 5;
    };


    /**
     * @override
     */
    BarChartGroupedStrategy.prototype.getWidth = function (chart) {

        return (chart.getWidth() / chart.getData().length / this._charts.length) -
            (this.getGap(chart) / this._charts.length);
    };


    /**
     * @override
     */
    BarChartGroupedStrategy.prototype.getX = function (chart, d, i) {
        /*
         * Get chart number.
         */
        var j;
        for (j = 0; j < this._charts.length; j++) {
            if (chart == this._charts[j]) {
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
        return barWidth * i + barWidth * (this._charts.length - 1) * i + barWidth * j + this.getGap(chart) * i;
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
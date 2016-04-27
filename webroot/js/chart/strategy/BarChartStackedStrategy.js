/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'core-basedir/js/chart/base/BarChartStrategy'
], function (BarChartStrategy) {

    /**
     *
     */
    var BarChartStackedStrategy = function (charts) {

        contrailD3.BarChartStrategy.call(this, charts);
    }


    BarChartStackedStrategy.prototype = Object.create(BarChartStrategy.prototype);


    /**
     * @override
     */
    BarChartStackedStrategy.prototype.getGap = function (chart) {

        return chart.getWidth() / chart.getData().length / 20;
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

        for (var j = 0; j < this._charts.length; j++) {
            if (chart == this._charts[j]) {
                break;
            } else {
                y -= this.getHeight(this._charts[j], this._charts[j].getData()[i], i);
            }
        }

        return y;
    };


    /**
     * @override
     */
    BarChartStackedStrategy.prototype.getHeight = function (chart, d, i) {

        return (chart._height - chart._yScale(chart._yAccessor(d))) / this._charts.length;
    };
    
    return BarChartStackedStrategy;
});
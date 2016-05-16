/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([], function () {

    /**
     * @public
     * @constructor
     */
    var BarChartStrategy = function (charts) {

        this._charts = charts;
    }


    /**
     * Get axis domain.
     * This method returns sensible domain if strategy has it's own
     * algorithm to calculate axis domain like stacked strategy.
     * @public
     * @param {String} axis
     * @param {number} number
     */
    BarChartStrategy.prototype.getYDomain = function(axis, number) {

        return [undefined, undefined];
    };


    /**
     * Get bar chart's context list.
     * @public
     * @returns {Object[]}
     */
    BarChartStrategy.prototype.getCharts = function() {

        return this._charts.filter(function(context) {
            return context.chart.isBarChart();
        });
    };


    /**
     * Get managed bar charts amount.
     * @public
     * @returns {Integer}
     */
    BarChartStrategy.prototype.getSize = function() {

        return this._charts.reduce(function(number, context) {
            if (context.chart.isBarChart()) {
                return ++ number;
            } else {
                return number;
            }
        }, 0);
    };


    /**
     * Get gap value.
     * Method calculate necessary gap value between bars or bars groups.
     * @public
     * @param {coCharts.BarChart} chart
     * @returns {Number}
     */
    BarChartStrategy.prototype.getGap = function (chart) {

        return chart.getWidth() / chart.getData().length / 20;
    };


    /**
     * Get bar width.
     * @public
     * @param {coCharts.BarChart} chart
     * @returns {Number}
     */
    BarChartStrategy.prototype.getWidth = function (chart) {

        throw new Error("Not implemented");
    };


    /**
     * Get bar x position.
     * @public
     * @param {coCharts.BarChart} chart
     * @param {Mixed} d
     * @param {Integer} i
     * @returns {Number}
     */
    BarChartStrategy.prototype.getX = function (chart, d, i) {

        throw new Error("Not implemented");
    };


    /**
     * Get bar y position.
     * @public
     * @param {coCharts.BarChart} chart
     * @param {Mixed} d
     * @param {Integer} i
     * @returns {Number}
     */
    BarChartStrategy.prototype.getY = function (chart, d, i) {

        throw new Error("Not implemented");
    };


    /**
     * Get bar y height.
     * @public
     * @param {coCharts.BarChart} chart
     * @param {Integer} i
     * @param {Mixed} d
     * @returns {Number}
     */
    BarChartStrategy.prototype.getHeight = function (chart, d, i) {

        return chart._height - chart._yScale(chart._yAccessor(d));
    };
    
    return BarChartStrategy;
});
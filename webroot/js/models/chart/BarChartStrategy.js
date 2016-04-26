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
     * Get gap value.
     * Method calculate necessary gap value between bars or bars groups.
     * @public
     * @param {contrailD3.charts.BarChart} chart
     * @returns {Number}
     */
    BarChartStrategy.prototype.getGap = function (chart) {

        throw new Error("Not implemented");
    };


    /**
     * Get bar width.
     * @public
     * @param {contrailD3.charts.BarChart} chart
     * @returns {Number}
     */
    BarChartStrategy.prototype.getWidth = function (chart) {

        throw new Error("Not implemented");
    };


    /**
     * Get bar x position.
     * @public
     * @param {contrailD3.charts.BarChart} chart
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
     * @param {contrailD3.charts.BarChart} chart
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
     * @param {contrailD3.charts.BarChart} chart
     * @param {Integer} i
     * @param {Mixed} d
     * @returns {Number}
     */
    BarChartStrategy.prototype.getHeight = function (chart, d, i) {

        throw new Error("Not implemented");
    };
    
    return BarChartStrategy;
});
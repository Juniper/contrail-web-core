/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([], function () {

    /**
     * Bar chart manager.
     * @public
     * @constructor
     */
    var BarChartManager = function (chart) {
        /**
         * List of managed bar charts.
         * @private
         * @member {coCharts.BarChart[]}
         */
        this._charts = [];
        /**
         * Reference to the main chart.
         * @private
         * @member {coCharts.Chart}
         */
        this._chart = chart;
        /**
         * Manager strategy.
         * @private
         * @member {coCharts.BarChartManagerStrategy}
         */
        this._strategy = new coCharts.BarChartStackedStrategy(this._charts);
    }


    /**
     * Set strategy.
     * @public
     * @param {Function} strategy - strategy class.
     */
    BarChartManager.prototype.setStrategy = function (strategy) {

        this._strategy = new strategy(this._charts);
    };


    /**
     * Remove bar chart.
     * @public
     * @param {coCharts.BarChart} chart
     */
    BarChartManager.prototype.remove = function (chart) {
        /*
         * Check chart class.
         */
        if (chart.getClassName() != "coCharts.BarChart") {
            return;
        }
        /*
         * Find and remove chart.
         */
        for (var i = 0; i < this._charts.length; i++) {
            if (chart == this._charts[i]) {
                this._charts.splice(i, 1);
                break;
            }
        }
    };


    /**
     * Add bar chart.
     * @public
     * @param {coCharts.BarChart} chart
     */
    BarChartManager.prototype.add = function (chart) {
        /*
         * Check chart class.
         */
        if (chart.getClassName() != "coCharts.BarChart") {
            return;
        }
        /*
         * Check chart already registered.
         */
        for (var i = 0; i < this._charts.length; i++) {
            if (chart == this._charts[i]) {
                return;
            }
        }
        /*
         * Add chart.
         */
        this._charts.push(chart);
    };


    /**
     * Get gap value.
     * Method calculate necessary gap value between bars or bars groups.
     * @public
     * @param {coCharts.BarChart} chart
     * @returns {Number}
     */
    BarChartManager.prototype.getGap = function (chart) {

        return this._strategy.getGap(chart);
    };


    /**
     * Get bar width.
     * @public
     * @param {coCharts.BarChart} chart
     * @returns {Number}
     */
    BarChartManager.prototype.getWidth = function (chart) {

        return this._strategy.getWidth(chart);
    };


    /**
     * Get bar x position.
     * @public
     * @param {coCharts.BarChart} chart
     * @param {Integer} i
     * @param {Mixed} d
     * @returns {Number}
     */
    BarChartManager.prototype.getX = function (chart, d, i) {

        return this._strategy.getX(chart, d, i);
    };


    /**
     * Get bar y position.
     * @public
     * @param {coCharts.BarChart} chart
     * @param {Integer} i
     * @param {Mixed} d
     * @returns {Number}
     */
    BarChartManager.prototype.getY = function (chart, d, i) {

        return this._strategy.getY(chart, d, i);
    };


    /**
     * Get bar y height.
     * @public
     * @param {coCharts.BarChart} chart
     * @param {Integer} i
     * @param {Mixed} d
     * @returns {Number}
     */
    BarChartManager.prototype.getHeight = function (chart, d, i) {

        return this._strategy.getHeight(chart, d, i);
    };
    
    return BarChartManager;
});
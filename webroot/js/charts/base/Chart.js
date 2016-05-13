/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'core-basedir/js/charts/base/Component'
], function (Component) {

    /**
     * Contrail chart abstract class.
     * @public
     * @constructor
     */
    var Chart = function () {
        /**
         * @private
         * @member {Object[]}
         */
        this._data = undefined;
    }


    Chart.prototype = Object.create(Component.prototype);


    /**
     * Update chart.
     * @private
     * @param {Selection} container
     * @param {Object[]} data
     */
    Chart.prototype._update = function (container, data) {

        throw new Error("coCharts.Chart._update() not implemented");
    };


    /**
     * Check chart is bar chart.
     * @public
     * @returns {Boolean}
     */
    Chart.prototype.isBarChart = function() {
    
        return this.getClassName() === "coCharts.BarChart";
    };


    /**
     * Set chart data.
     * @public
     * @param {Object[]} data
     */
    Chart.prototype.setData = function (data) {
        /*
         * Clone data to prevent it from modifications be reference.
         */
        this._data = data.slice(0);
    };


    /**
     * Get width.
     * @public
     * @returns {Number}
     */
    Chart.prototype.getWidth = function () {

        return this._width;
    };


    /**
     * Get chart data.
     * @public
     * @returns {Object[]}
     */
    Chart.prototype.getData = function () {

        return this._data;
    };


    /**
     * Check chart data is defined.
     * @public
     * @returns {Boolean}
     */
    Chart.prototype.hasData = function () {

        return this._data !== undefined;
    };
    
    return Chart;
});
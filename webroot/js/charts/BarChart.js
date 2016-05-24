/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'core-basedir/js/charts/base/Chart'
], function (Chart) {

    /**
     * Bar chart.
     * @public
     * @constructor
     */
    var BarChart = function () {
        /**
         * Bar chart manager.
         * @private
         * @member {coCharts.BarChartManager}
         */
        this._manager = undefined;
    }


    BarChart.prototype = Object.create(Chart.prototype);


    /**
     * @override
     */
    BarChart.prototype.getClassName = function () {

        return "coCharts.BarChart";
    };


    /**
     * Set chart manager.
     * @param {coCharts.BarChartManager} manager
     */
    BarChart.prototype.setManager = function (manager) {

        this._manager = manager;
    };


    /**
     * @override
     */
    BarChart.prototype._update = function (container, enable) {
        /*
         * Remove all bars.
         */
        container.selectAll(".bar").remove();
        /*
         * Append bars.
         */
        if (enable !== false) {
            this._render(container);
        }
    };


    /**
     * @override
     */
    BarChart.prototype._render = function (container) {
        /*
         * Set CSS class to the container.
         */
        container.attr("class", "chart bar-chart");
        /*
         * Append bars.
         */
        this._appendBars(container);
    };


    /**
     * Append bars to the canvas.
     * @private
     * @param {Number} barWidth
     */
    BarChart.prototype._appendBars = function (container) {
        /*
         * Stash reference to this object.
         */
        var self = this;
        /*
         * Get bar width.
         */
        var barWidth = this._manager.getWidth(this);
        /*
         * Append bars.
         */
        container.selectAll(".bar")
            .data(this._data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", function (d, i) {
                return self._manager.getX(self, d, i);
            }).attr("y", function (d, i) {
            return self._manager.getY(self, d, i);
        }).attr("width", barWidth)
            .attr("height", function (d, i) {
                return self._manager.getHeight(self, d, i);
            }).attr("fill", this._color);
    };
    
    return BarChart;
});

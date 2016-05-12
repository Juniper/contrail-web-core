/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'core-basedir/js/charts/base/Chart'
], function (Chart) {

    /**
     * Line chart.
     * @public
     * @constructor
     */
    var LineChart = function () {
        /*
         * Call parent class constructor.
         */
        coCharts.Chart.call(this);
        /*
         * Stash reference to this object.
         */
        var self = this;
        /**
         * Chart line generator.
         * @private
         * @member {Function}
         */
        this._lineGenerator = d3.svg.line()
            .x(function (d) {
                return self._xScale(self._xAccessor(d));
            }).y(function (d) {
                return self._yScale(self._yAccessor(d));
            });
    }


    LineChart.prototype = Object.create(Chart.prototype);


    /**
     * @override
     */
    LineChart.prototype.getClassName = function () {

        return "coCharts.LineChart";
    };


    /**
     * @override
     */
    LineChart.prototype._update = function (container, data, isEnabled) {
        /*
         * Update data.
         */
        this._data = data;
        /*
         * Remove line.
         */
        container.selectAll(".line").remove();
        /*
         * Append line.
         */
        if (isEnabled !== false) {
            this._render(container);
        }
    };


    /**
     * @override
     */
    LineChart.prototype._render = function (container) {
        /*
         * Set CSS class to the container.
         */
        container.attr("class", "chart line-chart");
        /*
         * Append line.
         */
        this._appendLine(container);
    };


    /**
     * Append line to the canvas.
     * @private
     */
    LineChart.prototype._appendLine = function (container) {

        this._lineGenerator.interpolate(this._interpolate || "basis");

        container.selectAll(".line")
            .data([this._data])
            .enter()
            .append("path")
            .attr("class", "line")
            .attr("d", this._lineGenerator)
            .style("stroke", this._color)
            .style("stroke-width", 2);
    };
    
    return LineChart;
});
/**
 * @public
 * @constructor
 */
contrailD3.BarChartStrategy = function(charts) {

    this._charts = charts;
}


/**
 * Get gap value.
 * Method calculate necessary gap value between bars or bars groups.
 * @public
 * @param {contrailD3.charts.BarChart} chart
 * @returns {Number} 
 */
contrailD3.BarChartStrategy.prototype.getGap = function(chart) {

    throw new Error("Not implemented");
};


/**
 * Get bar width.
 * @public
 * @param {contrailD3.charts.BarChart} chart
 * @returns {Number}
 */
contrailD3.BarChartStrategy.prototype.getWidth = function(chart) {

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
contrailD3.BarChartStrategy.prototype.getX = function(chart, d, i) {

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
contrailD3.BarChartStrategy.prototype.getY = function(chart, d, i) {

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
contrailD3.BarChartStrategy.prototype.getHeight = function(chart, d, i) {

    throw new Error("Not implemented");
};
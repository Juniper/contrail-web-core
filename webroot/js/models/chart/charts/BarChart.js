/**
 * Bar chart.
 * @public
 * @constructor
 */
contrailD3.charts.BarChart = function() {
    /**
     * Bar chart manager.
     * @private
     * @member {contrailD3.BarChartManager}
     */
    this._manager = undefined;
}


contrailD3.charts.BarChart.prototype = Object.create(contrailD3.Chart.prototype);


/**
 * @override
 */
contrailD3.charts.BarChart.prototype.getClassName = function() {

    return "contrailD3.charts.BarChart";
};


/**
 * Set chart manager.
 * @param {contrailD3.BarChartManager} manager
 */
contrailD3.charts.BarChart.prototype.setManager = function(manager) {

    this._manager = manager;
};


/**
 * @override
 */
contrailD3.charts.BarChart.prototype._update = function(container, data) {
    /*
     * Update data.
     */
    this._data = data;
    /*
     * Remove all bars.
     */
    container.selectAll(".bar").remove();
    /*
     * Append bars.
     */
    this._render(container);
};


/**
 * @override
 */
contrailD3.charts.BarChart.prototype._render = function(container) {
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
contrailD3.charts.BarChart.prototype._appendBars = function(container) {
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
        .attr("x", function(d, i) {
            return self._manager.getX(self, d, i);
        }).attr("y", function(d, i) {
            return self._manager.getY(self, d, i);
        }).attr("width", barWidth)
        .attr("height", function(d, i) {
            return self._manager.getHeight(self, d, i);
        }).attr("fill", this._color);
};
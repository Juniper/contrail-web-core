/**
 * 
 */
contrailD3.BarChartGroupedStrategy = function(charts) {

    contrailD3.BarChartStrategy.call(this, charts);
}


contrailD3.BarChartGroupedStrategy.prototype = Object.create(contrailD3.BarChartStrategy.prototype);


/**
 * @override
 */
contrailD3.BarChartGroupedStrategy.prototype.getGap = function(chart) {

    return chart.getWidth() / chart.getData().length / this._charts.length / 5;
};


/**
 * @override
 */
contrailD3.BarChartGroupedStrategy.prototype.getWidth = function(chart) {

    return (chart.getWidth() / chart.getData().length / this._charts.length) -
        (this.getGap(chart) / this._charts.length);
};


/**
 * @override
 */
contrailD3.BarChartGroupedStrategy.prototype.getX = function(chart, d, i) {
    /*
     * Get chart number.
     */
    var j;
    for (j = 0; j < this._charts.length; j ++) {
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
contrailD3.BarChartGroupedStrategy.prototype.getY = function(chart, d, i) {

    return chart._yScale(chart._yAccessor(d));
};


/**
 * @override
 */
contrailD3.BarChartGroupedStrategy.prototype.getHeight = function(chart, d, i) {

    return chart._height - chart._yScale(chart._yAccessor(d));
};
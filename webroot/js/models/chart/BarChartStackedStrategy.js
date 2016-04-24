/**
 * 
 */
contrailD3.BarChartStackedStrategy = function(charts) {

    contrailD3.BarChartStrategy.call(this, charts);
}


contrailD3.BarChartStackedStrategy.prototype = Object.create(contrailD3.BarChartStrategy.prototype);


/**
 * @override 
 */
contrailD3.BarChartStackedStrategy.prototype.getGap = function(chart) {

    return chart.getWidth() / chart.getData().length / 20;
};


/**
 * @override
 */
contrailD3.BarChartStackedStrategy.prototype.getWidth = function(chart) {

    return chart.getWidth() / chart.getData().length - this.getGap(chart);
};


/**
 * @override
 */
contrailD3.BarChartStackedStrategy.prototype.getX = function(chart, d, i) {

    var delimeter = chart.getData().length > 1 ? 1 : 0;
    return chart._xScale(chart._xAccessor(d)) - this.getWidth(chart) / (chart.getData().length - delimeter) * i;
};


/**
 * @override
 */
contrailD3.BarChartStackedStrategy.prototype.getY = function(chart, d, i) {

    var y = chart._height - this.getHeight(chart, d, i);

    for (var j = 0; j < this._charts.length; j ++) {
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
contrailD3.BarChartStackedStrategy.prototype.getHeight = function(chart, d, i) {

    return (chart._height - chart._yScale(chart._yAccessor(d))) / this._charts.length;
};
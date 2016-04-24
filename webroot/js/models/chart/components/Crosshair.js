/**
 * Crosshair component.
 * @public
 * @constructor
 */
contrailD3.components.Crosshair = function() {
    /**
     * Mouse move event detector.
     * @private
     * @member {Selection}
     */
    this._surface = undefined;
    /**
     * Current point position line.
     * @private
     * @member {Selection}
     */
    this._line = undefined;
    /**
     * Data bisector.
     * @private
     * @member {Function}
     */
    this._bisector = d3.bisector(function(d) {
        return d;
    }).left;;
    /**
     * Bisector x-axis/input data.
     * @private
     * @member {Object[]}
     */
    this._values = undefined;
    /**
     * Line color.
     * @private
     * @member {String}
     */
    this._color = "red";
    /*
     * Create tooltip.
     */
    this._tooltip = new contrailD3.components.Tooltip();
}


contrailD3.components.Crosshair.prototype = Object.create(contrailD3.Component.prototype);


/**
 * @override
 */
contrailD3.components.Crosshair.prototype.getClassName = function() {

    return "contrailD3.components.Crosshair";
};


contrailD3.components.Crosshair.prototype._resize = function() {

    this._surface.select("rect")
        .attr("width", this._container._width);
};


/**
 * @override
 */
contrailD3.components.Crosshair.prototype._render = function() {

    this._values = this._container.getValues("x", 1);

    this._surface = this._container._canvas.append("g")
        .attr("class", "crosshair");

    var self = this;
    this._surface.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", this._container._width)
        .attr("height", this._container._height)
        .style("fill", "transparent")
        .on("mousemove", function() {
            self._mouseMoveEventHandler();
        }).on("mouseout", function() {
            self._mouseOutEventHandler();
        });

    this._line = this._surface.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", this._container._height)
        .style("stroke", this._color)
        .style("stroke-width", 2)
        .style("visibility", "hidden");
};


/**
 * Mouse out event handler.
 * @private
 */
contrailD3.components.Crosshair.prototype._mouseOutEventHandler = function() {

    this._tooltip.hide();
    this._line.style("visibility", "hidden");
};


/**
 * Mouse mover event handler.
 * @private
 */
contrailD3.components.Crosshair.prototype._mouseMoveEventHandler = function() {
    /*
     * Hide previously opened tooltip.
     */
    this._tooltip.hide();
    /*
     * Get mouse coordinates.
     */
    var coordinate = d3.mouse(this._surface.node());
    /*
     * Convert mouse x coordinate to the time.
     */
    var xValue = this._container._x1Scale.invert(coordinate[0]);
    /*
     * Find nearest element within values array.
     */
    var i = this._bisector(this._values, xValue);
    /*
     * Get x coordinate of the element.
     */
    var x = this._container._x1Scale(this._values[i]);
    /*
     * Move line.
     */
    this._line.style("visibility", "visible")
        .attr("x1", x)
        .attr("x2", x);

    /*
     * Find particular chart current point.
     */
    var points = this._container._charts.map(function(chartContext) {

        var chartData = chartContext.chart.getData();

        var xAccessor = this._container._getProperty("x", chartContext.x, "Accessor");
        var yAccessor = this._container._getProperty("y", chartContext.y, "Accessor");

        var xValues = chartData.map(xAccessor);

        var j = this._bisector(xValues, xValue);
        var dataPoint = chartData[j];

        var value = yAccessor.call(undefined, dataPoint);

        return {
            name : this._container._config.get("options.axes.y" + chartContext.y + "Accessor"),
            value : value,
            color: chartContext.chart.getColor()
        };
    }, this);

    var dimension = this._container.getSvg().node().getBoundingClientRect();

    x = x + dimension.left + this._container._margin.left;
    var y = dimension.top + this._container._height / 2 + this._container._margin.top;

    this._tooltip.setContent(this._getTooltipContent(points))
        .show(x, y);
};


/**
 * Get point name.
 * If tooltipNameFormatter option was provided in metaData, will
 * return formatted name, otherwise returns input value.
 * @private
 * @param {String} name
 * @returns {String}
 */
contrailD3.components.Crosshair.prototype._getFieldName = function(name) {

    if (this._container._config.get("metaData")[name] &&
        "tooltip" in this._container._config.get("metaData")[name] &&
        "nameFormatter" in this._container._config.get("metaData")[name].tooltip) {
        return this._container._config.get("metaData")[name].tooltip.nameFormatter.call(undefined, name);
    } else {
        return name;
    }
};


/**
 * Get point value.
 * If tooltipValueFormatter option was provided in metaData, will
 * return formatted value, otherwise returns input value.
 * @private
 * @param {String} name
 * @param {Mixed} value
 * @returns {Mixed}
 */
contrailD3.components.Crosshair.prototype._getFieldValue = function(name, value) {

    if (this._container._config.get("metaData")[name] &&
        "tooltip" in this._container._config.get("metaData")[name] &&
        "valueFormatter" in this._container._config.get("metaData")[name].tooltip) {
        return this._container._config.get("metaData")[name].tooltip.valueFormatter.call(undefined, value);
    } else {
        return value;
    }
};


contrailD3.components.Crosshair.prototype._getTooltipContent = function(points) {

    var content = '<table>';

    points.forEach(function(point) {
        content += '<tr class="contrail-tooltip-row">' +
            '<td><div class="contrail-tooltip-color" style="background-color:' + point.color + '"></div></td>' +
            '<td>' + this._getFieldName(point.name) + '</td>' +
            '<td>' + this._getFieldValue(point.name, point.value) + '</td>' +
        '</tr>';
    }, this);

    return content += '</table>';
};
/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'core-basedir/js/charts/base/Component'
], function (Component) {

    /**
     * Crosshair component.
     * @public
     * @constructor
     */
    var Crosshair = function () {
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
        this._bisector = d3.bisector(function (d) {
            return d;
        }).left;
        ;
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
        this._color = "#808080";
        /*
         * Create tooltip.
         */
        this._tooltip = new coCharts.components.Tooltip();

    }


    Crosshair.prototype = Object.create(Component.prototype);


    /**
     * @override
     */
    Crosshair.prototype.setContainer = function (container) {

        this._container = container;

        //Also set the tooltip container
        this._tooltip.setContainer(container);
    };

    /**
     * @override
     */
    Crosshair.prototype.getClassName = function () {

        return "coCharts.components.Crosshair";
    };


    Crosshair.prototype._resize = function () {

        this._surface.select("rect")
            .attr("width", this._container._width);
    };


    /**
     * @override
     */
    Crosshair.prototype._update = function() {

        this._values = this._container.getAxisValues("x", 1);
    };


    /**
     * @override
     */
    Crosshair.prototype._render = function () {

        this._values = this._container.getAxisValues("x", 1);

        this._surface = this._container._canvas.append("g")
            .attr("class", "crosshair");

        var self = this;
        this._surface.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", this._container._width)
            .attr("height", this._container._height)
            .style("fill", "transparent")
            .on("mousemove", function () {
                self._mouseMoveEventHandler();
            }).on("mouseout", function () {
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
    Crosshair.prototype._mouseOutEventHandler = function () {

        this._tooltip.hide();
        this._line.style("visibility", "hidden");
    };


    /**
     * Mouse mover event handler.
     * @private
     */
    Crosshair.prototype._mouseMoveEventHandler = function () {
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
            if (isNaN(x)) {
            return;
        }
        /*
         * Move line.
         */
        this._line.style("visibility", "visible")
            .attr("x1", x)
            .attr("x2", x);

        /*
         * Find particular chart current point.
         */
        var points = this._container._charts.map(function (chartContext) {

            var chartData = chartContext.chart.getData();

            var xAccessor = this._container.getAccessor(chartContext, "x");
            var yAccessor = this._container.getAccessor(chartContext, "y");

            var xValues = chartData.map(xAccessor);

            var j = this._bisector(xValues, xValue);
            var dataPoint = chartData[j];

            var value = yAccessor.call(undefined, dataPoint);

            return {
                name: this._container._config.get("options.axes.y" + chartContext.y + "Accessor", chartContext.yField),
                value: value,
                color: chartContext.chart.getColor()
            };
        }, this);

        var svg = this._container.getSvg().node();
        var poistion = jQuery(svg.parentNode).position();

        var tooltipX = poistion.left + this._container._margin.left + x;
        var tooltipY = poistion.top + this._container._height / 2;

        this._tooltip.setContent(this._getTooltipContent(points))
            .show(tooltipX, tooltipY);
    };


    /**
     * Get point name.
     * If tooltipNameFormatter option was provided in metaData, will
     * return formatted name, otherwise returns input value.
     * @private
     * @param {String} name
     * @returns {String}
     */
    Crosshair.prototype._getFieldName = function (name) {

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
    Crosshair.prototype._getFieldValue = function (name, value) {

        if (this._container._config.get("metaData")[name] &&
            "tooltip" in this._container._config.get("metaData")[name] &&
            "valueFormatter" in this._container._config.get("metaData")[name].tooltip) {
            return this._container._config.get("metaData")[name].tooltip.valueFormatter.call(undefined, value);
        } else {
            return value;
        }
    };


    Crosshair.prototype._getTooltipContent = function (points) {

        var content = '<table>';

        points.forEach(function (point) {
            content += '<tr class="coCharts-tooltip-row">' +
                '<td><div class="coCharts-tooltip-color" style="background-color:' + point.color + '"></div></td>' +
                '<td>' + this._getFieldName(point.name) + '</td>' +
                '<td>' + this._getFieldValue(point.name, point.value) + '</td>' +
                '</tr>';
        }, this);

        return content += '</table>';
    };
    
    return Crosshair;
});

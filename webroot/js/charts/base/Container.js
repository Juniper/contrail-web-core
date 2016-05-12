/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([], function () {

    /**
     * Contrail charts container class.
     * @public
     * @constructor
     * @param {Object} config
     * @param {Object[][]} data
     */
    Container = function (config, data) {
        /**
         * Chart data.
         * @member {Object[]}
         */
        this._data = data.slice(0);
        /**
         * Chart config.
         * @protected
         * @member {coCharts.utils.ConfigUtil}
         */
        this._config = new coCharts.utils.ConfigUtil(config);
        /**
         * Chart height;
         * @member {Number}
         */
        this._width = undefined;
        /**
         * Chart width.
         * @member {Number}
         */
        this._height = undefined;
        /**
         * Container parent element.
         * @member {Selection}
         */
        this._container = undefined;
        /**
         * Chart's container.
         * @member {Selection}
         */
        this._chartsContainer = undefined;
        /**
         * Inner charts set.
         * @member {coCharts.Chart[]}
         */
        this._charts = [];
        /**
         * Container components set.
         * @member {coCharts.Component[]}
         */
        this._components = {};
        /**
         * Child charts color set.
         * @private
         * @member {String[]}
         */
        this._colorSet = d3.scale.category10().range();
        /**
         * Chart margins.
         * @member {Object}
         */
        this._margin = {
            top: 20,
            right: 10,
            bottom: 20,
            left: 10
        };
        /**
         * @private
         * @member {coCharts.utils.ClassUtil}
         */
        this._classUtil = new coCharts.utils.ClassUtil();
        /**
         * @protected
         * @member {coCharts.utils.StringUtil}
         */
        this._stringUtil = new coCharts.utils.StringUtil();
        /**
         * Chart unique id.
         * @private
         * @member {String}
         */
        this._chartId = this._stringUtil.getUniqueId();
        /*
         * Register window resize event handler.
         */
        this.setResizeEventHandler();
    };

    /**
     * Register resize handler.
     * A lot of child containers inherit this class functionality but
     * they should escape registering their own resize handlers.
     * So override this method in child classes with empty body.
     * @public
     * @param {Function} handler
     */
    Container.prototype.setResizeEventHandler = function(handler) {

        var self = this;

        handler = handler || function() {
            self.resize();
        };

        d3.select(window).on('resize.' + this._chartId, handler);
    };


    /**
     * Update bar chart manager strategy.
     * @public
     * @param {Function} strategy - strategy class
     */
    Container.prototype.setBarChartStrategy = function (strategy) {

        this._barChartManager.setStrategy(strategy);
    };


    /**
     * Resize chart according with parent element dimension.
     */
    Container.prototype.resize = function () {

        var dimension = this._container.node().getBoundingClientRect();
        this._width = dimension.width - this._margin.left - this._margin.right;
        /*
         * Update base chart.
         */
        this._updateBaseChart(true);
        this.update();

        $.map(this._components, function(component, key){
            component._resize();
        });

        this._svg.selectAll("text.axis-label").remove();
        this._renderAxesLabels();
    };


    /**
     * Get chart main SVG container.
     * @public
     * @returns {Selection}
     */
    Container.prototype.getSvg = function () {

        return this._svg;
    };


    /**
     * Get chart canvas.
     * @public
     * @returns {Selection}
     */
    Container.prototype.getCanvas = function () {

        return this._canvas;
    };


    /**
     * Get chart height.
     * @public
     * @returns {Number}
     */
    Container.prototype.getHeight = function () {

        return this._height;
    };


    /**
     * Get chart width.
     * @public
     * @returns {Number}
     */
    Container.prototype.getWidth = function () {

        return this._width;
    };


    /**
     * Set x axis label.
     * @public
     * @param {String} label
     * @returns {coCharts.Chart}
     */
    Container.prototype.setXLabel = function (label) {

        return this.setX1Label();
    };


    /**
     * Set x1 axis label.
     * @public
     * @param {String} label
     * @returns {coCharts.Chart}
     */
    Container.prototype.setX1Label = function (label) {

        this._x1Label = label;
        return this;
    };


    /**
     * Set x2 axis label.
     * @public
     * @param {String} label
     * @returns {coCharts.Chart}
     */
    Container.prototype.setX2Label = function (label) {

        this._x2Label = label;
        return this;
    };


    /**
     * Set y axis label.
     * @public
     * @param {String} label
     * @returns {coCharts.Chart}
     */
    Container.prototype.setYLabel = function (label) {

        return this.setY1Label();
    };


    /**
     * Set y1 axis label.
     * @public
     * @param {String} label
     * @returns {coCharts.Chart}
     */
    Container.prototype.setY1Label = function (label) {

        this._y1Label = label;
        return this;
    };


    /**
     * Set y2 axis label.
     * @public
     * @param {String} label
     * @returns {coCharts.Chart}
     */
    Container.prototype.setY2Label = function (label) {

        this._y2Label = label;
        return this;
    };


    /**
     * Set chart height.
     * @public
     * @param {Number} width
     * @returns {coCharts.Chart}
     */
    Container.prototype.setWidth = function (width) {

        this._width = width;
        return this;
    };


    /**
     * Set chart width.
     * @public
     * @param {Number} height
     * @returns {coCharts.Chart}
     */
    Container.prototype.setHeight = function (height) {

        this._height = height;
        return this;
    };


    /**
     * Get chart data.
     * @public
     * @returns {Object[]}
     */
    Container.prototype.getData = function () {

        return this._data;
    };


    /**
     * Set chart margins.
     * @public
     * @param {Object} margin
     * @returns {coCharts.Chart}
     */
    Container.prototype.setMargin = function (margin) {

        for (i in margin) {
            this._margin[i] = margin[i];
        }

        return this;
    };


    /**
     * Update chart with new data set.
     * @public
     * @param {Object[]} data
     * @returns {coCharts.Chart}
     */
    Container.prototype.update = function (data) {
        /*
         * If data not provided use current.
         */
        if (data) {
            this._data = data;
        }
        /*
         * Order rendering queue.
         */
        this._sortChartsByType();
        /*
         * Update axis.
         */
        this._updateAxes();
        /*
         * Loop through child charts.
         */
        this._charts.forEach(function(context, i) {
            /*
             * Copy main properties to the updated chart.
             * This is necessary if one chart rendered in several
             * containers and each of them has its own set of
             * settings, main of which is scale functions.
             */
            this._copyChart(this, context.chart);
            /*
             * Update child chart.
             */
            context.chart._update(context.container, this._data[i], context.isEnabled);
        }, this);
    };


    /**
     * Change axis field.
     * @public
     * @param {String} name - axis name
     * @param {Integer} number - axis number
     * @param {String} field - axis field
     */
    Container.prototype.updateYAxis = function (name, number, field) {
        /*
         * Change config "Accessor" option for axis.
         */
        this._config.set("options.axes." + name + number + "Accessor", field);
        /*
         * Run chart update procedure.
         */
        this.update();
    };


    /**
     * Update bar charts manager.
     * @private
     * @returns {coCharts.BarChartManager}
     */
    Container.prototype._updateBarChartManager = function () {
        /*
         * Create bar chart manager if not yet.
         */
        if (!this._barChartManager) {
            this._barChartManager = new coCharts.BarChartManager(this);
        }
        /*
         * Add all charts to the manager. It will reject unnecessary automatically.
         */
        this._charts.forEach(function (chartData) {
            this._barChartManager.add(chartData.chart);
        }, this);
        /*
         * Return manager.
         */
        return this._barChartManager;
    };


    /**
     * Add component to the canvas.
     * @param {coCharts.Component} component
     * @param {String} [context]
     * @param {Integer} [index]
     * @param {Selection} [container]
     * @returns {coCharts.Chart}
     */
    Container.prototype.add = function (component, options, index, container) {
        /*
         * 
         */
        if (this._classUtil.isComponent(component)) {
            this._components[component.getClassName()] = component;
            return;
        }
        /*
         * Create component context.
         */
        var context = {
            chart: component,
            x: options.x || 1,
            y: options.y || 1,
            container: container,
            isEnabled: true
        };
        /*
         * Copy other options.
         */
        for (var i in options) {
            if (["chart", "x", "y", "container"].indexOf(i) < 0) {
                context[i] = options[i];
                component["_" + i] = options[i];
            }
        }
        /*
         * Try to find chart with index in the current set and replace it.
         * Add new one if not found.
         */
        if (index in this._charts) {
            this._charts[index] = context;
        } else {
            this._charts.push(context);
            /*
             * Set up color for new chart if necessary.
             */
            if (!context.chart.getColor()) {
                context.chart.setColor(this._colorSet[(this._charts.length - 1) % this._colorSet.length]);
            }
        }
        /*
         * Set a manager if this bar chart.
         */
        if (component.getClassName() == "coCharts.BarChart") {
            var manager = this._updateBarChartManager();
            component.setManager(manager);
        }

        return this;
    };


    /**
     * Remove child chart from the canvas.
     * @param {coCharts.Chart} chart
     * @param {Boolean} keepData
     *
     */
    Container.prototype.remove = function (chart, keepData) {
        /*
         * Find chart index within charts pool.
         */
        var index = this._getChartIndex(chart);
        /*
         * Remove chart from manager.
         */
        this._barChartManager.remove(chart);
        /*
         * Remove chart.
         */
        chart._remove(d3.select(this._canvas.selectAll(".chart")[0][index]));
        /*
         * Rarefy data and charts pool if required.
         */
        if (keepData !== true) {
            this._data.splice(i, 1);
            this._charts.splice(i, 1);
        }
    };


    /**
     * Get chart index.
     * Returns chart index in the charts pool.
     * @private
     * @param {coCharts.Chart} chart
     * @returns {Integer}
     */
    Container.prototype._getChartIndex = function (chart) {

        for (var i = 0; i < this._charts.length; i++) {
            if (chart == this._charts[i].chart) {
                return i;
            }
        }
    };


    /**
     * Get chart context.
     * @private
     * @param {coCharts.Chart} chart
     * @returns {Object}
     */
    Container.prototype._getChartContext = function (chart) {

        return this._charts[this._getChartIndex(chart)];
    };


    /**
     * Replace one chart to another.
     * @param {coCharts.Chart} fromChart
     * @param {coCharts.Chart} toChart
     * @returns {Object}
     */
    Container.prototype.replace = function (fromChart, toChart) {
        /*
         * Copy chart settings from old to new.
         */
        this._copyChart(fromChart, toChart);
        /*
         * Get old chart index and context.
         */
        var index = this._getChartIndex(fromChart);
        var context = this._getChartContext(fromChart);
        /*
         * Remove old chart.
         */
        this.remove(fromChart, true);
        /*
         * Add new chart to the pool.
         */
        this.add(toChart, context, index, context.container);
        /*
         * Return new chart context.
         */
        return this._getChartContext(toChart);
    };


    /**
     * Copy one chart main properties to another.
     * fromChart parameter may be as coCharts.Chart as coCharts.Component.
     * In second case it has no context and toChart context will be used.
     * @param {Mixed} fromChart
     * @param {coCharts.Chart} toChart
     */
    Container.prototype._copyChart = function (fromChart, toChart) {
        /*
         * Copy data if necessary.
         */
        if (!toChart.hasData()) {
            toChart.setData(fromChart.getData());
        }
        /*
         * Get context.
         */
        var context = this._getChartContext(fromChart);
        if (context === undefined) {
            context = this._getChartContext(toChart);
        } else {
            toChart._color = fromChart._color;
        }
        /*
         * Copy main properties.
         */
        this._copyChartProperties(toChart, context);
    };


    /**
     * Copy set of main properties from one chart to another.
     * @private
     * @param {coCharts.Chart} chart
     * @param {Object} context
     */
    Container.prototype._copyChartProperties = function (chart, context) {

        chart._width = this._width;
        chart._height = this._height;
        chart._xAccessor = this.getAccessor(context, "x");
        chart._yAccessor = this.getAccessor(context, "y");
        chart._xScale = this._getProperty("x", context.x, "Scale");
        chart._yScale = this._getProperty("y", context.y, "Scale");
    };


    /**
     * Get x accessor.
     * @returns {Function}
     */
    Container.prototype.getXAccessor = function() {

        return function(d) {
            return d["x"];
        }
    };


    /**
     * Get chart x scale function.
     * @returns {Function}
     */
    Container.prototype.getXScale = function () {

        return this.getX1Scale();
    };


    /**
     * Set x scale function.
     * @param {Function} scale
     * @returns {coCharts.Chart}
     */
    Container.prototype.setXScale = function (scale) {

        return this.setX1Scale(scale);
    };


    /**
     * Set x1 scale function.
     * @param {Function} scale
     * @returns {coCharts.Chart}
     */
    Container.prototype.setX1Scale = function (scale) {

        this._x1Scale = scale;
        return this;
    };


    /**
     * Get chart x1 scale function.
     * @param {String} type
     * @returns {Function}
     */
    Container.prototype.getX1Scale = function (type) {

        if (this._x1Scale) {
            return this._x1Scale;
        }

        type = type || "linear";
        return this._x1Scale = d3.scale[type]();
    };


    /**
     * Set x scale function.
     * @param {Function} scale
     * @returns {coCharts.Chart}
     */
    Container.prototype.setX2Scale = function (scale) {

        this._x2Scale = scale;
        return this;
    };


    /**
     * Get chart x2 scale function.
     * @param {String} type
     * @returns {Function}
     */
    Container.prototype.getX2Scale = function (type) {

        if (this._x2Scale) {
            return this._x2Scale;
        }

        type = type || "linear";
        return this._x2Scale = d3.scale[type]();
    };


    /**
     * Get chart y scale function.
     * @returns {Function}
     */
    Container.prototype.getYScale = function () {

        return this.getY1Scale();
    };


    /**
     * Set y scale function.
     * @param {Function} scale
     * @returns {coCharts.Chart}
     */
    Container.prototype.setYScale = function (scale) {

        return this.setY1Scale(scale);
    };


    /**
     * Get chart y1 scale function.
     * @param {String} type
     * @returns {Function}
     */
    Container.prototype.getY1Scale = function (type) {

        if (this._y1Scale) {
            return this._y1Scale;
        }

        type = type || "linear";
        return this._y1Scale = d3.scale[type]();
    };


    /**
     * Set y1 scale function.
     * @param {Function} scale
     * @returns {coCharts.Chart}
     */
    Container.prototype.setY1Scale = function (scale) {

        this._y1Scale = scale;
        return this;
    };


    /**
     * Get chart y2 scale function.
     * @param {String} type
     * @returns {Function}
     */
    Container.prototype.getY2Scale = function (type) {

        if (this._y2Scale) {
            return this._y2Scale;
        }

        type = type || "linear";
        return this._y2Scale = d3.scale[type]();
    };


    /**
     * Set y2 scale function.
     * @param {Function} scale
     * @returns {coCharts.Chart}
     */
    Container.prototype.setY2Scale = function (scale) {

        this._y2Scale = scale;
        return this;
    };


    /**
     * Set x axis.
     * @param {Fuction} axis
     * @returns {coCharts.Chart}
     */
    Container.prototype.setXAxis = function (axis) {

        return this.setX1Axis(axis);
    };


    /**
     * Set x1 axis.
     * @param {Fuction} axis
     * @returns {coCharts.Chart}
     */
    Container.prototype.setX1Axis = function (axis) {

        this._x1Axis = axis;
        return this;
    };


    /**
     * Set x2 axis.
     * @param {Fuction} axis
     * @returns {coCharts.Chart}
     */
    Container.prototype.setX2Axis = function (axis) {

        this._x2Axis = axis;
        return this;
    };


    /**
     * Set y axis.
     * @param {Fuction} axis
     * @returns {coCharts.Chart}
     */
    Container.prototype.setYAxis = function (axis) {

        return this.setY1Axis(axis);
    };


    /**
     * Set y1 axis.
     * @param {Fuction} axis
     * @returns {coCharts.Chart}
     */
    Container.prototype.setY1Axis = function (axis) {

        this._y1Axis = axis;
        return this;
    };


    /**
     * Set y2 axis.
     * @param {Fuction} axis
     * @returns {coCharts.Chart}
     */
    Container.prototype.setY2Axis = function (axis) {

        this._y2Axis = axis;
        return this;
    };


    /**
     * Sort charts by type.
     * Method perform charts and corresponding data sorting to order
     * charts rendering sequence. Charts which occupy more space
     * should be rendered first. For instance barcharts should be rendered
     * before line charts. Otherwise bars will obscure lines.
     * @private
     */
    Container.prototype._sortChartsByType = function () {
        /*
         * Merge charts and its data into single array of objects.
         */
        var list = this._charts.map(function (chartData, i) {
            return {
                chartData: chartData,
                data: this._data[i]
            }
        }, this);
        /*
         * Sort list depending on charts class name.
         */
        var self = this;
        list = list.sort(function (a, b) {
            if (a.chartData.chart.getClassName() == "coCharts.BarChart") {
                return -1;
            } else if (a.chartData.chart.getClassName() == b.chartData.chart.getClassName()) {
                return 0;
            } else {
                /*
                 * Here we should physically replace chart container in front of
                 * chart containers because of SVG limitations - if you want to render
                 * something over other SVG elements - it should be rendered last in
                 * the sequence of elements. So here we first remove container and 
                 * then add it again. 
                 */
                if (a.chartData.container) {
                    a.chartData.container.remove();
                    a.chartData.container = self._chartsContainer.append("g").attr("class", a.chartData.container.attr("class"));
                }

                return 1;
            }
        });
        /*
         * Modify initial data and charts arrays.
         */
        for (var i = 0; i < list.length; i++) {
            this._data[i] = list[i].data;
            this._charts[i] = list[i].chartData;
        }
    };


    /**
     * Render chart
     * @param {String} container - chart's container CSS selector or HTMLElement
     * @returns {coCharts.Chart}
     */
    Container.prototype.render = function (selector) {
        /*
         * Convert selector to the d3.js selection of necessary.
         */
        if (typeof selector == "string") {
            this._container = d3.select(selector);
        } else if (typeof selector == "object" && selector.length == 1) {
            this._container = selector;
        } else if (typeof selector == "object" && selector.length == undefined) {
            this._container = d3.select(selector);
        } else {
            throw new Error("Cannot coerce selector");
        }

        /*
         * Get container dimensions.
         */
        var dimension = this._container.node().getBoundingClientRect();
        /*
         * Evaluate width and height.
         */
        this._width = (this._width || dimension.width || 500) - this._margin.left - this._margin.right;
        this._height = (this._height || dimension.height || 400) - this._margin.top - this._margin.bottom;
        /*
         * Order rendering queue.
         */
        this._sortChartsByType();
        /*
         * Create scales functions.
         */
        this._prepareScales();
        /*
         * Render axes.
         */
        this._updateBaseChart();
        /*
         * Loop through child charts set.
         */
        this._charts.forEach(function (chartContext, i) {
            /*
             * Create chart container.
             */
            chartContext["container"] = this._chartsContainer.append("g").attr("class", "chart");
            /*
             * Get chart from its context.
             */
            var chart = chartContext.chart;
            /*
             * Set data if necessary.
             */
            if (!chart.hasData()) {
                chart.setData(this.getData()[i]);
            }
            /*
             * Copy main properties.
             */
            this._copyChartProperties(chart, chartContext);
            /*
             * Render chart.
             */
            chart._render(chartContext.container);
        }, this);
        /*
         * Render components.
         */
        for (var i in this._components) {
            this._components[i].setContainer(this); //Todo confusing as this sets the ._container of component.
            this._components[i]._render(this._canvas);
        }
        /*
         * Render axis labels.
         */
        this._renderAxesLabels();

        return this;
    };


    /**
     * Disable inner chart.
     * @public
     * @param {Integer} number - chart number
     */
    Container.prototype.disable = function(number) {
        /*
         * Reset isEnabled flag.
         */
        this._charts[number].isEnabled = false;
        /*
         * Update container.
         */
        this.update();
    };


    /**
     * Enable inner chart.
     * @public
     * @param {Integer} number - chart number
     */
    Container.prototype.enable = function(number) {
        /*
         * Reset isEnabled flag.
         */
        this._charts[number].isEnabled = true;
        /*
         * Update container.
         */
        this.update();
    };


    /**
     * Get axis values.
     * @public
     * @param {String} axis
     * @param {Number} number
     * @return {Mixed[]}
     */
    Container.prototype.getAxisValues = function(axis, number) {

        var values = [];

        this._data.forEach(function(series, i) {
            var context = this._charts[i];
            if (context[axis] === number) {
                var accessor = this.getAccessor(context, axis);
                series.forEach(function(d) {
                    values.push(accessor.call(undefined, d));
                });
            }
        }, this);

        return values;
    };


    /**
     * Prepare chart scale functions,
     * Create axis scales function depending on input data.
     */
    Container.prototype._prepareScales = function () {

        ["x", "y"].forEach(function (axis) {
            [1, 2].forEach(function (number) {
                /*
                 * Get input domain.
                 */
                var domain = this._getDomain(axis, number);
                if (domain === null) {
                    return;
                }
                /*
                 * Get axis scale.
                 */
                var scale = this["_" + axis + number + "Scale"] || this["get" + axis.toUpperCase() + number + "Scale"]();
                /*
                 * Set scale input domain.
                 */
                scale.domain(domain);
            }, this);
        }, this);
    };


    /**
     * Get chart property.
     * @param {String} axis
     * @param {Integer} number
     * @param {String} property
     * @returns {Mixed}
     */
    Container.prototype._getProperty = function (axis, number, property) {

        property = property.slice(0, 1).toUpperCase() + property.slice(1).toLowerCase();

        if (property == "Accessor") {
            var value = this._getAxisOption(axis, number, "Accessor");
            return function (d) {
                return d[value];
            };
        } else {
            return this["_" + axis + number + property];
        }
    };


    /**
     * Set chart property.
     * @param {String} axis
     * @param {Integer} number
     * @param {String} property
     * @param {Mixed} value
     */
    Container.prototype._setProperty = function (axis, number, property, value) {

        property = property.slice(0, 1).toUpperCase() + property.slice(1).toLowerCase();
        this["_" + axis + number + property] = value;
    };


    /**
     * Render axes labels.
     * @private
     */
    Container.prototype._renderAxesLabels = function () {

        var xLabelMargin = 20;
        var xShift = (this._height + this._margin.top + this._margin.bottom) / 2;

        if (this._y1Label) {
            this._renderXLabel(this._y1Label, -xShift, xLabelMargin, 270);
        }

        if (this._y2Label) {
            this._renderXLabel(this._y2Label, xShift, -(this._width + this._margin.left + this._margin.right - xLabelMargin), 90);
        }
    };


    /**
     * Render x label.
     * @private
     * @param {String} label
     * @param {Number} x
     * @param {Number} y
     * @param {Number} angle
     */
    Container.prototype._renderXLabel = function (label, x, y, angle) {

        this._svg.append("text")
            .attr("x", x)
            .attr("y", y)
            .attr("class", "axis-label")
            .attr("transform", "rotate(" + angle + ")")
            .text(label);
    };


    /**
     * @private
     * Render chart canvas.
     */
    Container.prototype._updateBaseChart = function () {
        /*
         * Append top level SVG tag.
         */
        var svg = this._container.selectAll("svg")
            .data([0], function (d) {
                return d;
            }).attr("width", this._width + this._margin.left + this._margin.right)
            .enter()
            .append("svg")
            .attr("class", "coCharts-svg")
            .attr("width", this._width + this._margin.left + this._margin.right)
            .attr("height", this._height + this._margin.top + this._margin.bottom);
        if (svg.size() == 1) {
            this._svg = svg;
        }
        /*
         * Append chart canvas to the SVG tag.
         */
        var canvas = this._svg.selectAll("g.canvas")
            .data([0], function (d) {
                return d;
            }).enter()
            .append("g")
            .attr("class", "canvas")
            .attr("transform", "translate(" + this._margin.left + ", " + this._margin.top + ")");
        if (canvas.size() == 1) {
            this._canvas = canvas;
        } 

        var chartsContainer = this._canvas.selectAll("g.charts-container")
            .data([0], function (d) {
                return d;
            }).enter()
            .append("g")
            .attr("class", "charts-container");
        if (chartsContainer.size() == 1) {
            this._chartsContainer = chartsContainer;
        }
        /*
         * Append x axes.
         */
        this._renderAxis([0, this._width], "x", 1, "bottom", [0, this._height], -this._height);
        if (this._x2Scale) {
            this._renderAxis([0, this._width], "x", 2, "top", [0, 0], -this._height);
        }
        /*
         * Append y axes.
         */
        this._renderAxis([this._height, 0], "y", 1, "left", [0, 0], -this._width);
        if (this._y2Scale) {
            this._renderAxis([this._height, 0], "y", 2, "right", [this._width, 0], -this._width);
        }
    };


    /**
     * Update base chart.
     * The main function of this method is rescale axes depending on new data.
     * @private
     */
    Container.prototype._updateAxes = function () {

        ["x", "y"].forEach(function (name) {
            [1, 2].forEach(function (number) {
                /*
                 * Get data and calculate new data extent.
                 */
                var domain = this._getDomain(name, number);
                if (domain === null || domain[0] == domain[1]) {
                    return;
                }
                /*
                 * Compose axis CSS class.
                 */
                var axisClass = name + number + "-axis";
                /*
                 * Select container by CSS class.
                 */
                var axisContainer = this._container.select("." + axisClass);
                /*
                 * Update scale function with new domain.
                 */
                var scale = this["_" + name + number + "Scale"].domain(domain);
                /*
                 * Get axis object.
                 */
                var axis = this["_" + name + number + "Axis"]
                    .tickFormat(this._getFieldFormatterByAxis(name, number));
                /*
                 * Rescale axis.
                 */
                axisContainer.call(axis);
            }, this);
        }, this);
    };


    /**
     * Get axis option.
     * Method try to find any configuration within "options.axes" config section.
     * @private
     */
    Container.prototype._getAxisOption = function (name, number, property) {

        var option = this._config.get("options.axes." + name + number + property);

        if (option === undefined) {
            option = this._config.get("options.axes." + name + property);
        }

        return option;
    };


    /**
     * Get chart y accessor.
     * @private
     * @param {Object} context
     * @param {String} axis
     * @returns {Function}
     */
    Container.prototype.getAccessor = function(context, axis) {

        var field = context[axis + "Field"];
        return function(d) {
            return d[field];
        };
    };


    /**
     * Get domain for the scale function.
     * Method returns two dimensional array of input domain
     * depending on predefined scale boundaries, if any was provided.
     * @protected
     * @param {String} axis
     * @param {Integer} number
     * @returns {Number[]}
     */
    Container.prototype._getDomain = function (axis, number) {
        /*
         * Check force option first.
         */
        var extent = this._config.get("options.axes.force" + axis.toUpperCase() + number, false);
        if (extent !== false && extent[0] !== undefined && extent[1] !== undefined) {
            return extent;
        }
        /*
         * Declare axis data.
         */
        var axisData = [];
        /*
         * Acquire axis data.
         */
        this._charts.forEach(function(context, i) {
            if (context[axis] == number) {
                axisData = axisData.concat(
                    this._data[i].map(this.getAccessor(context, axis))
                );
            }
        }, this);
        /*
         * Return null if no data for the axis/number combination.
         */
        if (axisData.length == 0) {
            return null;
        }
        /*
         * Check if domain boundaries are specified.
         */
        var min = extent[0];
        var max = extent[1];
        /*
         * Evaluate domain.
         */
        var domain;
        if (min != undefined && max != undefined) {
            domain = [min, max];
        } else if (min != undefined) {
            domain = [min, d3.max(axisData)];
        } else if (max != undefined) {
            domain = [d3.min(axisData), max];
        } else {
            domain = d3.extent(axisData);
        }

        return domain;
    };


    /**
     * Render axis.
     * Also this method assign range value to corresponding scale functions.
     * @private
     * @param {Number[]} range - scale function range
     * @param {String} name - axis name
     * @param {Integer} number - axis number
     * @param {String} orientation - axis orientation
     * @param {Number[]} translate - axis translate offset
     * @param {Number} tickSize - outer tick size
     */
    Container.prototype._renderAxis = function (range, name, number, orientation, translate, tickSize) {
        /*
         * Get chart axis.
         */
        var axis;
        if ("_" + name + "" + number + "Axis" in this) {
            axis = this["_" + name + "" + number + "Axis"]
        } else {
            axis = d3.svg.axis();
        }
        /*
         * Get corresponding scale function and set up it's range.
         */
        var scale = this._getProperty(name, number, "Scale")
            .range(range);
        /*
         * Configure axis.
         */
        axis.scale(scale)
            .orient(orientation)
            .tickFormat(this._getFieldFormatterByAxis(name, number));
        if (name === "y" && axis.tickValues() === null) {
            axis.tickValues(this._getTickValues(scale, name, number));
        }
        /*
         * Show axis grid if required.
         */
        if (this._config.get("options.axes.grid", false)) {
            axis.innerTickSize(tickSize);
        }
        /**
         * Configure ticks
         */
        if (name == 'y') {
            axis.ticks(this._config.get("options.axes." + name + "Ticks"));
        }

        /*
         * Append axis to the canvas.
         */
        var selection = this._canvas.selectAll("g." + name + number + "-axis")
            .data([name + "" + number], function (d) {
                return d;
            }).attr("transform", "translate(" + translate[0] + ", " + translate[1] + ")")
            .call(axis)
            .enter()
            .append("g")
            .attr("transform", "translate(" + translate[0] + ", " + translate[1] + ")")
            .attr("class", "axis " + name + "-axis " + name + number + "-axis")
            .call(axis);
        /*
         * Assign axis as property.
         */
        this["_" + name + number + "Axis"] = axis;
    };


    /**
     * Get axis ticks.
     * @private
     * @param {Function} scale
     * @param {String} name
     * @param {Integer} number
     * @returns {Number[]}
     */
    Container.prototype._getTickValues = function(scale, name, number) {

        var height = scale.range()[0];
        var amount = height / 25;

        var domain = scale.domain();
        var min = domain[0];
        var max = domain[1];
        var step = (max - min) / amount;
        var formatter = this._getFieldFormatterByAxis(name, number);

        var ticks = [];

        for (var i = min; i <= max; i += step ) {
            ticks.push(i);
        }

        return ticks;
    };


    /**
     * Get field format function related with axis.
     * @private
     * @param {String} name - axis name
     * @param {Integer} number - axis number
     * @returns {Function}
     */
    Container.prototype._getFieldFormatterByAxis = function (name, number) {

        return this._config.get("options.axes." + name + number + "Formatter", function(d) {
            return d;
        });
    };


    /**
     * Get field config related with axis.
     * @private
     * @param {String} name - axis name
     * @param {Integer} number - axis number
     * @returns {Object}
     */
    Container.prototype._getFieldConfigByAxis = function (name, number) {

        var field = this._getAxisOption(name, number, "Accessor");
        return this._config.get("metaData")[field];
    };

    Container.prototype.refreshView = function() {

    };
    
    return Container;
});
/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'core-basedir/js/charts/base/Container'
], function (Container) {

    /**
     * @public
     * @constructor
     * @param {Object} config
     * @param {Object[][]} data
     */
    var NavigationChart = function (config, charts) {
        /*
         * Extract data from each chart config.
         */
        var data = charts.map(function(chart) {
            return chart.data;
        });

        coCharts.Container.call(this, config, data);
        /**
         * Main chart.
         * @protected
         * @member {coCharts.Chart}
         */
        this._mainChart = undefined;
        /**
         * Navigation chart.
         * @protected
         * @member {coCharts.Chart}
         */
        this._navigationChart = undefined;
        /**
         * Main chart container.
         * @private
         * @member {Selection}
         */
        this._mainContainer = undefined;
        /**
         * Navigation chart container.
         * @private
         * @member {Selection}
         */
        this._navigationContainer = undefined;
        /**
         * Main chart components.
         * @protected
         * @member {coCharts.Components[]}
         */
        this._components = [];
        /**
         * Main chart options with default values.
         * @protected
         * @member {Object}
         */
        this._mainChartOptions = {
            height: this._config.get("options.container.mainChartHeight", 300),
            margin: this._config.get("options.container.mainChartMargin", {top: 20, right: 70, bottom: 50, left: 70})
        };
        /**
         * Navigation chart options with default values.
         * @protected
         * @member {Object}
         */
        this._navChartOptions = {
            height: this._config.get("options.container.navChartHeight", 80),
            margin: this._config.get("options.container.navChartMargin", {top: 0, right: 70, bottom: 40, left: 70})
        };
        /*
         * Fetch required charts list.
         */
        charts.forEach(function(context) {
            var clazz = this._classUtil.getClassByType(context.type, "charts");
            var chart = new clazz();

            context.color && chart.setColor(context.color);

            this.add(chart, context);
        }, this);
        /*
         * Fetch required components list.
         */
        if (config.components) {
            config.components.forEach(function (componentConfig) {
                var clazz = this._classUtil.getClassByType(componentConfig.type, "components");
                this.add(new clazz());
            }, this);
        }
        /*
         * Process options.
         */
        for (var i in config.options.axes) {
            if (this._config.isAccessor(i)) {
                this._mainChartOptions[i] = config.options.axes[i];
                this._navChartOptions[i] = config.options.axes[i];
            } else if (this._config.isLabel(i)) {
                this._mainChartOptions[i] = config.options.axes[i];
            }
        }
        ;
    };


    NavigationChart.prototype = Object.create(Container.prototype);


    /**
     * Render navigation chart.
     * @returns {coCharts.Chart}
     */
    NavigationChart.prototype._renderNavigationChart = function () {

        return this._renderSubChart(this._navigationContainer, this._navChartOptions, true);
    };


    /**
     * Render main chart.
     * @returns {coCharts.Chart}
     */
    NavigationChart.prototype._renderMainChart = function () {

        return this._renderSubChart(this._mainContainer, this._mainChartOptions, false);
    };


    /**
     * Render chart.
     * @param {String} selector - chart's container CSS selector
     * @returns {coCharts.NavigationChart}
     */
    NavigationChart.prototype.render = function (selector) {
        /*
         * Select chart container.
         */
        this._container = d3.select(selector);
        /*
         * Render sub charts.
         */
        this._renderInnerMarkdown();
        /*
         * Render main and navigation charts.
         */
        this._mainChart = this._renderMainChart();
        this._navigationChart = this._renderNavigationChart();
        /*
         * Hide navigation chart x axes grid/ticks.
         */
        this._navigationChart.getCanvas()
            .selectAll(".y-axis line, .y-axis text")
            .style("visibility", "hidden");
        /*
         * Replace their resize event handler with empty function.
         * We will use our own resize handler.
         */
        this._mainChart.setResizeEventHandler(new Function());
        this._navigationChart.setResizeEventHandler(new Function());
        /*
         * Create brush and set corresponding event handler.
         * See https://github.com/mbostock/d3/wiki/SVG-Controls
         * First let's calculate brush default extent.
         */
        var domain = this._navigationChart.getXScale().domain(),
            extent;

        if (this._config.has("options.brush.extent")) {
            extent = this._config.get("options.brush.extent");
        } else {
            extent = [domain[0].getTime(), domain[1].getTime()];
            if (this._config.has("options.brush.size")) {
                extent[0] = domain[1] - this._config.get("options.brush.size") * 1000 * 60;
            }
        }

        /*
         * Create brush.
         */
        var self = this;
        this._brush = d3.svg.brush()
            .x(this._navigationChart.getXScale())
            .extent(extent)
            .on("brush", function() {
                self._brushEventHandler();
            });
        /*
         * Append brush to the navigation chart.
         */
        this._brushContainer = this._navigationChart.getCanvas()
            .append("g")
            .attr("class", "brush")
            .style("fill", "transparent");
        this._brushContainer.call(this._brush)
            .selectAll("rect")
            .attr("height", this._navigationChart.getHeight());
        /*
         * Initialize brush mask.
         */
        this._brushMask = new coCharts.components.BrushMask(this._brush, this._brushContainer);
        /*
         * Call brush event handler to apply extent.
         */
        this._brushEventHandler();

        return this;
    };

    /**
     * Brush event handler.
     * @private
     */
    NavigationChart.prototype._brushEventHandler = function() {
        /*
         * Update brush mask.
         */
        this._brushMask.update();
        /*
         * Filter data by brush boundaries.
         */
        var data = this._applyBrush(this._navigationChart.getData());
        /*
         * Update main chart.
         */
        this._mainChart.update(data);
    };


    /**
     * Disable inner charts.
     * @public
     * @param {String} field - x field
     * @param {Integer} number - y axis number
     */
    NavigationChart.prototype.disable = function(field, number) {
        /*
         * Redraw charts.
         */
        this._mainChart.disable(field, number);
        this._navigationChart.disable(field, number);
    };


    /**
     * Enable inner charts.
     * @public
     * @param {String} field - x field
     * @param {Integer} number - y axis number
     */
    NavigationChart.prototype.enable = function(field, number) {
        /*
         * Redraw charts.
         */
        this._mainChart.enable(field, number);
        this._navigationChart.enable(field, number);
    };


    /**
     * @override
     */
    NavigationChart.prototype.resize = function() {
        /*
         * Get brush extent before we redraw charts.
         */
        var extent = this._brush.extent();
        /*
         * Redraw charts.
         */
        this._mainChart.resize();
        this._navigationChart.resize();
        /*
         * Update brush using previously saved extent.
         */
        this._brushContainer.call(this._brush.extent(extent));
        /*
         * Move brush mask corresponding with it's new position.
         */
        this._brushMask.update();
    };


    /**
     * Filter input data according with brush boundaries.
     * @param {Object[]}
     */
    NavigationChart.prototype._applyBrush = function(data) {
        /*
         * Do nothing with empty selection.
         */
        if (this._brush.empty()) {
            return data;
        }
        /*
         * Get brush extent.
         */
        var extent = this._brush.extent();
        var left = extent[0];
        var right = extent[1];
        var accessor = this._mainChart.getXAccessor();
        /*
         * Filter data.
         */
        return data.map(function(series) {
            return series.filter(function(d) {
                var x = accessor(d);
                if (left == right) {
                    return x;
                } else {
                    return x >= left && x <= right;
                }
            });
        });
    };


    /**
     * @override
     */
    NavigationChart.prototype.update = function(data) {
        /*
         * Use current data if not provided.
         */
        data = data || this._data;
        /*
         * Update main chart with brush-filtered data.
         */
        this._mainChart.update(this._applyBrush(data));
        /*
         * Update navigation chart with full data set.
         */
        this._navigationChart.update(data);
    };

    /**
     * Render chart markdown.
     * Navigation chart consist of two child charts:
     * - main chart
     * - navigation chart
     * Each chart should be rendered at separate container. This method
     * render this containers.
     * @protected
     */
    NavigationChart.prototype._renderInnerMarkdown = function () {

        this._mainContainer = this._container.append("div").attr("class", "coCharts-main-container row-fluid");
        this._navigationContainer = this._container.append("div").attr("class", "coCharts-nav-container row-fluid");
    };


    NavigationChart.prototype._renderSubChart = function (selector, options, hideTicks) {
        /*
         * Configure x axis.
         */
        var xScale = d3.time.scale();
        var xAxis = d3.svg.axis()
            .scale(xScale);

        /*
         * Configure y1 axis.
         */
        var y1Axis = d3.svg.axis();
        if (hideTicks) {
            y1Axis.tickValues([])
                .tickSize(0, 0);
        }

        /*
         * Configure y2 axis.
         */
        var y2Axis = d3.svg.axis();
        if (hideTicks) {
            y2Axis.tickValues([])
                .tickSize(0, 0);
        }

        /*
         * Create and configure main chart.
         */
        var container = new coCharts.Container(this._config.getOptions(), this._data);
        container.setMargin(options.margin).setXScale(xScale)
            .setXAxis(xAxis)
            .setY1Axis(y1Axis)
            .setY2Axis(y2Axis)
            .setWidth(this._width);

        for (var i in options) {
            var option = this._stringUtil.ucFirst(i);
            var method = this._classUtil.getSetter(option, container);
            method.call(container, options[i])
        }

        this._charts.forEach(function(context) {
            container.add(context.chart, context);
        });

        if (!hideTicks) {
            this._components.forEach(function (component) {
                container.add(component);
            });
        }
        /*
         * Render and return container.
         */
        return container.render(selector);
    };


    /**
     * Set main/top chart height.
     * @public
     * @param {Number} height
     * @returns {CpuVsMemoryChart}
     */
    NavigationChart.prototype.setMainChartHeight = function (height) {

        this._navChartOptions.height = height;
        return this;
    };


    /**
     * Set navigation/bottom chart height.
     * @public
     * @param {Number} height
     * @returns {CpuVsMemoryChart}
     */
    NavigationChart.prototype.setNavigationChartHeight = function (height) {

        this._mainChartOptions.height = height;
        return this;
    };


    /**
     * Add chart to the canvas.
     * @param {Component} component
     * @param {Object} context
     * @returns {CpuVsMemoryChart}
     */
    NavigationChart.prototype.add = function (component, context) {

        if (this._classUtil.isComponent(component)) {
            this._addComponent(component);
        } else {
            this._addChart(component, context);
        }

        return this;
    };


    NavigationChart.prototype._addChart = function (chart, context) {

        context.chart = chart
        this._charts.push(context);
    };


    NavigationChart.prototype._addComponent = function (component) {

        this._components.push(component);
    };

    return NavigationChart;
});
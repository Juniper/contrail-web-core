/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'core-basedir/js/models/chart/Container'
], function (Container) {

    /**
     * @public
     * @constructor
     * @param {Object} config
     * @param {Object[][]} data
     */
    var NavigationChart = function (config, data) {

        contrailD3.Container.call(this, config, data);
        /**
         * Main chart.
         * @protected
         * @member {contrailD3.Chart}
         */
        this._mainChart = undefined;
        /**
         * Navigation chart.
         * @protected
         * @member {contrailD3.Chart}
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
         * @member {contrailD3.Components[]}
         */
        this._components = [];
        /**
         * Main chart options with default values.
         * @protected
         * @member {Object}
         */
        this._mainChartOptions = {
            height: this._config.get("options.container.mainChartHeight", 300)
        };
        /**
         * Navigation chart options with default values.
         * @protected
         * @member {Object}
         */
        this._navChartOptions = {
            height: this._config.get("options.container.navChartHeight", 80)
        };
        /*
         * Fetch required charts list.
         */
        config.charts.forEach(function (chartConfig) {
            var clazz = this._classUtil.getClassByType(chartConfig.type, "charts");
            var chart = new clazz();

            !chartConfig.color || chart.setColor(chartConfig.color);

            this.add(chart, chartConfig.x ? chartConfig.x : 1, chartConfig.y ? chartConfig.y : 1);
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
     * @returns {contrailD3.Chart}
     */
    NavigationChart.prototype._renderNavigationChart = function () {

        return this._renderSubChart(this._navigationContainer, this._navChartOptions, true);
    };


    /**
     * Render main chart.
     * @returns {contrailD3.Chart}
     */
    NavigationChart.prototype._renderMainChart = function () {

        return this._renderSubChart(this._mainContainer, this._mainChartOptions, false);
    };


    /**
     * Render chart.
     * @param {String} selector - chart's container CSS selector
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
         * Render main chart.
         */
        this._mainChart = this._renderMainChart();
        /*
         * Render navigation chart.
         */
        this._navigationChart = this._renderNavigationChart();

        var mainChart = this._mainChart;
        var canvas = this._navigationChart.getCanvas();
        var currentData = this._mainChart.getData();
        /*
         * Create brush and set corresponding event handler.
         * See https://github.com/mbostock/d3/wiki/SVG-Controls
         */
        var brush = d3.svg.brush()
            .x(this._navigationChart.getXScale())
            .on("brush", function () {
                if (!brush.empty()) {
                    /*
                     * Get brush extent.
                     */
                    var extent = brush.extent();
                    var left = extent[0];
                    var right = extent[1]
                    var accessor = mainChart.getXAccessor();
                    /*
                     * Create data subset depending on extent.
                     */
                    var newData = [];
                    for (var i = 0; i < currentData.length; i++) {
                        newData.push(currentData[i].filter(function (d) {
                            var x = accessor(d);
                            if (x >= left && x <= right) {
                                return true;
                            }
                        }));
                    }
                    /*
                     * Update main chart.
                     */
                    mainChart.update(newData);
                }
            });
        /*
         * Append brush to the navigation chart.
         */
        canvas.append("g")
            .attr("class", "brush")
            .call(brush)
            .selectAll("rect")
            .attr("height", this._navigationChart.getHeight());
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

        this._mainContainer = this._container.append("div").attr("class", "contrailD3-main-container row-fluid");
        this._navigationContainer = this._container.append("div").attr("class", "contrailD3-nav-container row-fluid");
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
        var y1Scale = d3.scale.linear();
        var y1Axis = d3.svg.axis();

        if (hideTicks) {
            y1Axis.tickValues([])
                .tickSize(0, 0);
        }

        /*
         * Configure y2 axis.
         */
        var y2Scale = d3.scale.linear();
        var y2Axis = d3.svg.axis();

        if (hideTicks) {
            y2Axis.tickValues([])
                .tickSize(0, 0);
        }

        /*
         * Create and configure main chart.
         */
        var container = new contrailD3.Container(this._config.getOptions(), this._data);
        container.setMargin({
            top: 20,
            right: 110,
            bottom: 20,
            left: 70
        }).setXScale(xScale)
            .setXAxis(xAxis)
            .setY1Axis(y1Axis)
            .setY2Axis(y2Axis)
            .setWidth(this._width);

        for (var i in options) {
            var option = this._stringUtil.ucFirst(i);
            var method = this._classUtil.getSetter(option, container);
            method.call(container, options[i])
        }

        this._charts.forEach(function (chartData) {
            container.add(chartData.chart, chartData.x, chartData.y);
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
     * @param {String} x
     * @param {String} y
     * @returns {CpuVsMemoryChart}
     */
    NavigationChart.prototype.add = function (component, x, y) {

        if (this._classUtil.isComponent(component)) {
            this._addComponent(component);
        } else {
            this._addChart(component, x, y);
        }

        return this;
    };


    NavigationChart.prototype._addChart = function (chart, x, y) {

        this._charts.push({
            chart: chart,
            x: x,
            y: y
        });
    };


    NavigationChart.prototype._addComponent = function (component) {

        this._components.push(component);
    };

    return NavigationChart;
});
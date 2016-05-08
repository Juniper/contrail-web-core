/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

/**
 * File will be renamed once the Model and view related functions are separated.
 * Following the current naming of model as this is part of models directory. 
 */
define([
    'contrailD3',
    'core-basedir/js/chart/NavigationChart'
], function(contrailD3, NavigationChart) {

    //Add NavigationChart part of namespace.
    contrailD3.NavigationChart = NavigationChart;

    /**
     * Hack for now. When a class is extended, dependencies to extend required during declaration are 'require'-d within
     * each file. But some of the function definition directly access the class from Namespace.
     * This forces to put contrailD3 in global scope.
     */
    window.contrailD3 = contrailD3;

    /**
     * @public
     * @constructor
     */
    var LineBarChart = function(options, data) {
        
        /**
         * Chart controls container.
         * @private
         * @member {Selection}
         */
        this._controlsContainer = undefined;

        contrailD3.NavigationChart.call(this, options, data);
    }


    LineBarChart.prototype = Object.create(NavigationChart.prototype);


    /**
     * @override
     */
    LineBarChart.prototype._renderInnerMarkdown = function() {

        /*
         * Check control panel required.
         */
        if (this._config.get("options.container.showControls", false)) {
            /*
             * Append controls container.
             */
            this._controlsContainer = this._container.append("div")
                .attr("class", "control-panel");
            /*
             * Render controls in appended container.
             */
            this._renderControls();
        }
        /*
         * Call parent class method.
         */
        contrailD3.NavigationChart.prototype._renderInnerMarkdown.call(this);
    };


    /**
     * Convert child charts to type.
     * @private
     * @param {String} type - convert to type
     * @param {Interger} axis - y axis number
     * @param {String} [manager] - bar chart manager type
     */
    LineBarChart.prototype._convertTo = function(type, axis, manager) {
        /*
         * Create BarChartManager if required and update navigation charts strategy.
         * Should be updated exactly navigation container/charts because all inner
         * charts initialized with his barChartManager instance, not main.
         */
        if (manager) {
            var name = this._stringUtil.ucFirst(manager),
            managerClass = this._classUtil.getClassByName("contrailD3.BarChart" + name + "Strategy");
            this._navigationChart.setBarChartStrategy(managerClass);
        }
        /*
         * Loop through child chart list.
         */
        this._charts.forEach(function(chartContext, i) {
            /*
             * Convert only charts which are not desired type.
             */
            if (chartContext.chart.getClassName() != type && chartContext.y === axis) {
                /*
                 * Get class by type/name.
                 */
                var clazz = this._classUtil.getClassByName(type);
                /*
                 * Create instance of class.
                 */
                var newChart = new clazz();
                /*
                 * Replace old with new chart and get new chart context on main chart.
                 */
                var chart = this._mainChart.replace(chartContext.chart, newChart);
                /*
                 * Replace old with new chart on navigation chart.
                 */
                this._navigationChart.replace(chartContext.chart, newChart);
                /*
                 * Update charts context list.
                 */
                this._charts[i] = chart;
            }
        }, this);

        /*
         * Update both containers.
         */
        this._mainChart.update();
        this._navigationChart.update();
    };


    /**
     * Render chart controls.
     */
    LineBarChart.prototype._renderControls = function() {
        /*
         * Stash reference to this object.
         */
        var self = this;
        /*
         * Load controls HTML markdown snippet.
         */
        var controlsContainerHtml = contrail.getTemplate4Id("d3-linebar-chart-controls")();
        
        d3.select(self._controlsContainer.node()).html(controlsContainerHtml);
        /*
         * Set event handlers to appended markdown.
         */
        self._setUpChartSwitchers();
        self._setUpFieldSelectors();
        
    };


    LineBarChart.prototype._setUpChartSwitchers = function() {
        /*
         * Set up buttons events handlers.
         */
        var self = this;
        this._controlsContainer.selectAll(".controls-button")
            .on("mouseover", function() {
                d3.select(this).style("background-color", "#a6c9e2")
            }).on("mouseout", function() {
            d3.select(this).style("background-color", null)
        }).on("click", function() {

            var button = d3.select(this);

            var chartClass = button.attr("data-chart");
            var axis = Number(button.attr("data-x-axis"));
            var type = button.attr("data-type");

            self._convertTo(chartClass, axis, type);
        });
    };


    LineBarChart.prototype._updateYAxis = function(number, field) {

        this._mainChart.updateYAxis("y", number, field);
        this._navigationChart.updateYAxis("y", number, field);
    };


    LineBarChart.prototype._setUpFieldSelectors = function() {

        var self = this;

        var options = this._config.find("metaData", "isAvailable", function(d) {
            return d === true;
        }, "id");

        this._controlsContainer.selectAll(".field-select")
            .data([1, 2])
            .append("select")
            .on("change", function(axis) {
                self._updateYAxis(axis, this.options[this.selectedIndex].value);
            }).attr("data-x-axis", function(d) {
            return d;
        }).selectAll("option")
            .data(options)
            .enter()
            .append("option")
            .each(function(d, i, j) {
                if (d.id == self._config.get("options.axes.y" + (j + 1) + "Accessor")) {
                    d3.select(this).attr("selected", true);
                }
            }).text(function(d) {
            return d.id;
        })
    };
    
    return LineBarChart;
});

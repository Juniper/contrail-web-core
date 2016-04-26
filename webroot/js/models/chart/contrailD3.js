/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'core-basedir/js/models/chart/utils/ClassUtil',
    'core-basedir/js/models/chart/utils/StringUtil',
    'core-basedir/js/models/chart/Config',
    'core-basedir/js/models/chart/Component',
    'core-basedir/js/models/chart/Container',
    'core-basedir/js/models/chart/Chart',
    
    'core-basedir/js/models/chart/components/Tooltip',
    'core-basedir/js/models/chart/components/Crosshair',
    'core-basedir/js/models/chart/charts/BarChart',
    'core-basedir/js/models/chart/charts/LineChart',

    'core-basedir/js/models/chart/BarChartStrategy',
    'core-basedir/js/models/chart/BarChartGroupedStrategy',
    'core-basedir/js/models/chart/BarChartStackedStrategy',
    'core-basedir/js/models/chart/BarChartManager'
    
], function (ClassUtil, StringUtil, Config, Component, Container, Chart, 
             Tooltip, Crosshair, BarChart, LineChart,
             BarChartStrategy, BarChartGroupedStrategy, BarChartStackedStrategy, BarChartManager) {
    
    /**
     * Define library namespace.
     */
    var contrailD3 = {};

    contrailD3.utils = {};
    contrailD3.components = {};
    contrailD3.charts = {};
    contrailD3.examples = {};
    
    contrailD3.utils.ClassUtil = ClassUtil;
    contrailD3.utils.StringUtil = StringUtil;
    
    contrailD3.Config = Config;
    contrailD3.Component = Component;
    contrailD3.Container = Container;
    contrailD3.Chart = Chart;
    
    contrailD3.components.Tooltip = Tooltip;
    contrailD3.components.Crosshair = Crosshair;
    
    contrailD3.charts.BarChart = BarChart;
    contrailD3.charts.LineChart = LineChart;
    
    contrailD3.BarChartStrategy = BarChartStrategy;
    contrailD3.BarChartGroupedStrategy = BarChartGroupedStrategy;
    contrailD3.BarChartStackedStrategy = BarChartStackedStrategy;
    contrailD3.BarChartManager = BarChartManager;
    
    return contrailD3;
});
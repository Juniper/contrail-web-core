/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'core-basedir/js/chart/base/utils/ClassUtil',
    'core-basedir/js/chart/base/utils/StringUtil',
    'core-basedir/js/chart/base/Config',
    'core-basedir/js/chart/base/Component',
    'core-basedir/js/chart/base/Container',
    'core-basedir/js/chart/base/Chart',
    'core-basedir/js/chart/base/BarChartStrategy',
    
    'core-basedir/js/chart/BarChart',
    'core-basedir/js/chart/LineChart',
    'core-basedir/js/chart/BarChartManager',
    'core-basedir/js/chart/components/Tooltip',
    'core-basedir/js/chart/components/Crosshair',
    'core-basedir/js/chart/strategy/BarChartGroupedStrategy',
    'core-basedir/js/chart/strategy/BarChartStackedStrategy'
    
], function (ClassUtil, StringUtil, Config, Component, Container, Chart, BarChartStrategy,
             BarChart, LineChart, BarChartManager, Tooltip, Crosshair,
             BarChartGroupedStrategy, BarChartStackedStrategy) {
    
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
/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'core-basedir/js/charts/base/utils/ClassUtil',
    'core-basedir/js/charts/base/utils/StringUtil',
    'core-basedir/js/charts/base/utils/ConfigUtil',
    'core-basedir/js/charts/base/Component',
    'core-basedir/js/charts/base/Container',
    'core-basedir/js/charts/base/Chart',
    'core-basedir/js/charts/base/BarChartStrategy',
    
    'core-basedir/js/charts/BarChart',
    'core-basedir/js/charts/LineChart',
    'core-basedir/js/charts/BarChartManager',
    'core-basedir/js/charts/components/BrushMask',
    'core-basedir/js/charts/components/Tooltip',
    'core-basedir/js/charts/components/Crosshair',
    'core-basedir/js/charts/strategy/BarChartGroupedStrategy',
    'core-basedir/js/charts/strategy/BarChartStackedStrategy'
    
], function (ClassUtil, StringUtil, ConfigUtil, Component, Container, Chart, BarChartStrategy,
             BarChart, LineChart, BarChartManager, BrushMask, Tooltip, Crosshair,
             BarChartGroupedStrategy, BarChartStackedStrategy) {
    
    /**
     * Define library namespace.
     */
    var coCharts = {};

    coCharts.utils = {};
    coCharts.components = {};
    coCharts.charts = {};
    coCharts.examples = {};
    
    coCharts.utils.ClassUtil = ClassUtil;
    coCharts.utils.StringUtil = StringUtil;
    coCharts.utils.ConfigUtil = ConfigUtil;
    
    coCharts.Component = Component;
    coCharts.Container = Container;
    coCharts.Chart = Chart;
    
    coCharts.components.BrushMask = BrushMask;
    coCharts.components.Tooltip = Tooltip;
    coCharts.components.Crosshair = Crosshair;
    
    coCharts.BarChart = BarChart;
    coCharts.LineChart = LineChart;
    
    coCharts.BarChartStrategy = BarChartStrategy;
    coCharts.BarChartGroupedStrategy = BarChartGroupedStrategy;
    coCharts.BarChartStackedStrategy = BarChartStackedStrategy;
    coCharts.BarChartManager = BarChartManager;
    
    return coCharts;
});
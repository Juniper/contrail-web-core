/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var LineWithFocusChartModel = function (chartOptions) {
        var chartModel = nv.models.lineWithExtendedFocusChart()
                        .height2(chartOptions.height == 250 ? 70 : 90)
                        .margin2({ top: 10, right: 30, bottom: 20, left: 60 })
                        .brushExtent(chartOptions['brushExtent']);

        chartModel.interpolate(interpolateSankey);

        chartModel.xAxis.tickFormat(function (d) {
            return d3.time.format('%H:%M:%S')(new Date(d));
        });

        chartModel.x2Axis.tickFormat(function (d) {
            return d3.time.format('%H:%M:%S')(new Date(d));
        });

        chartModel.yAxis.axisLabel(chartOptions.yAxisLabel).tickFormat(window[chartOptions['yFormatter']]);

        chartModel.y2Axis.axisLabel(chartOptions.y2AxisLabel).tickFormat(window[chartOptions['y2Formatter']]);

        chartModel.lines.forceY([0]);
        chartModel.lines2.forceY([0]);

        return chartModel;
    }
    return LineWithFocusChartModel;
});
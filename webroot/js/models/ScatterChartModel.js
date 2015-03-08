/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var ScatterChartModel = function(chartData, chartOptions) {
        var chartModel = nv.models.scatterChart()
            .showDistX(false)
            .showDistY(false)
            .sizeDomain([0.7,2])
            .tooltipXContent(null)
            .tooltipYContent(null)
            .showTooltipLines(false);

        var d3Scale = d3.scale.linear().range([1, 2]).domain(chartOptions['sizeMinMax']);

        //Adjust the size domain to have limit on minumum bubble size
        $.each(chartData, function (idx, currSeries) {
            currSeries['values'] = $.each(currSeries['values'], function (idx, obj) {
                obj['size'] = d3Scale(obj['size']);
            });
        });

        chartModel.tooltipContent(chartOptions['tooltipFn']);

        if (chartOptions['tooltipRenderedFn'] != null)
            chartModel.tooltipRenderedFn(chartOptions['tooltipRenderedFn']);
        if (chartOptions['forceX'] != null)
            chartModel.forceX(chartOptions['forceX']);
        if (chartOptions['forceY'] != null)
            chartModel.forceY(chartOptions['forceY']);
        if (chartOptions['seriesMap'] != null)
            chartModel.seriesMap(chartOptions['seriesMap']);
        if (chartOptions['xPositive'] != null && chartModel.scatter != null)
            chartModel.scatter.xPositive(chartOptions['xPositive']);
        if (chartOptions['yPositive'] != null && chartModel.scatter != null)
            chartModel.scatter.yPositive(chartOptions['yPositive']);
        if (chartOptions['addDomainBuffer'] != null && chartModel.scatter != null)
            chartModel.scatter.addDomainBuffer(chartOptions['addDomainBuffer']);
        if (chartOptions['useVoronoi'] != null && chartModel.scatter != null)
            chartModel.scatter.useVoronoi(chartOptions['useVoronoi']);

        //If more than one category is displayed,enable showLegend
        if (chartData.length == 1) {
            chartModel.showLegend(false);
        }

        chartModel.xAxis.tickFormat(chartOptions['xLblFormat']);
        chartModel.yAxis.tickFormat(chartOptions['yLblFormat']);
        chartModel.xAxis.showMaxMin(false);
        chartModel.yAxis.showMaxMin(false);
        chartModel.yAxis.axisLabel(chartOptions['yLbl']);
        chartModel.xAxis.axisLabel(chartOptions['xLbl']);
        chartModel.yAxis.ticks(3);

        chartModel.dispatch.on('stateChange', chartOptions['stateChangeFunction']);
        chartModel.scatter.dispatch.on('elementClick', chartOptions['elementClickFunction']);
        chartModel.scatter.dispatch.on('elementMouseout', chartOptions['elementMouseoutFn']);
        chartModel.scatter.dispatch.on('elementMouseover', chartOptions['elementMouseoverFn']);

        return chartModel;
    };

    return ScatterChartModel;
});
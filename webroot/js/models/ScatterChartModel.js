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
            // .sizeDomain([4,14])
            // .sizeRange([4,14])
            .sizeDomain([0.7,2])
            // .sizeRange([200,1500])
            .tooltipXContent(null)
            .tooltipYContent(null)
            .showTooltipLines(false)
            .tooltipContent(chartOptions['tooltipFn']);

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
        if (chartOptions['useSizeAsRadius'] != null && chartModel.scatter != null)
            chartModel.scatter.useSizeAsRadius(chartOptions['useSizeAsRadius']);
        if (chartOptions['sizeDomain'] != null && chartModel.scatter != null)
            chartModel.scatter.sizeDomain(chartOptions['sizeDomain']);
        if (chartOptions['sizeRange'] != null && chartModel.scatter != null)
            chartModel.scatter.sizeRange(chartOptions['sizeRange']);

        //If more than one category is displayed,enable showLegend
        if (chartData.length == 1 || chartOptions['showLegend'] == false) {
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
        chartModel.legend.dispatch.on('legendDblclick', function(e) { 
            console.info('legendDblclick');
            d3.event.stopPropagation();
            });
        chartModel.scatter.dispatch.on('elementClick', chartOptions['elementClickFunction']);
        chartModel.scatter.dispatch.on('elementDblClick', chartOptions['elementDoubleClickFunction']);
        chartModel.scatter.dispatch.on('elementMouseout', chartOptions['elementMouseoutFn']);
        chartModel.scatter.dispatch.on('elementMouseover', chartOptions['elementMouseoverFn']);

        chartModel.scatter.dispatch.on('elementMouseout.tooltip', chartOptions['elementMouseoutFn']);

        return chartModel;
    };

    return ScatterChartModel;
});

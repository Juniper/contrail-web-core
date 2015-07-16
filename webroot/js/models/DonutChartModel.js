/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([], function () {
    /**
     * This chart model accepts data in following format:
     * [{label: '', value: },{..}]
     * @param chartOptions
     * @returns DonutChartModel
     */
    var DonutChartModel = function (chartOptions) {
        var chartModel = nvd3v181.models.pieChart()
            .donut(true)
            .x(function(d) { return d.label })
            .y(function(d) { return d.value })
            .margin(chartOptions.margin)
            .height(chartOptions.height)
            .donutRatio(chartOptions.donutRatio)
            .showLegend(chartOptions.showLegend)
            .legendPosition(chartOptions.legendPosition)
            .showLabels(chartOptions.showLabels)
            .noData(chartOptions.noDataMessage);

        chartModel.tooltip.enabled(chartOptions.showTooltips);
        chartModel.pie.valueFormat(chartOptions.valueFormat);
        chartModel.legend.rightAlign(chartOptions.legendRightAlign)
            .padding(chartOptions.legendPadding);

        return chartModel;
    }
    return DonutChartModel;
});
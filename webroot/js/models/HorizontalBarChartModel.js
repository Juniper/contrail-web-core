/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    /**
     * This chart model accepts data in following format:
     *  [{key: '', values: [{label: '', value: },{..}]},{..}]
     * @param chartOptions
     * @returns multiBarHorizontalChartModel
     */
    var HorizontalBarChartModel = function (chartOptions) {
        var chartModel = nvd3v181.models.multiBarHorizontalChart()
            .height(chartOptions.height)
            .margin(chartOptions.margin)
            .x(function (d) {
                return d.label;
            })
            .y(function (d) {
                return d.value;
            })
            .showLegend(chartOptions.showLegend)
            .showValues(chartOptions.showValues)
            .stacked(chartOptions.stacked)
            .showControls(chartOptions.showControls)
            .tooltips(chartOptions.showTooltips)
            .color(function (d) {
                return chartOptions.barColor(d.key);
            });

        chartModel.xAxis.axisLabel(chartOptions.xAxisLabel);
        chartModel.xAxis.tickPadding(chartOptions.xAxisTickPadding);
        chartModel.yAxis.axisLabel(chartOptions.yAxisLabel).tickFormat(chartOptions.yFormatter);
        chartModel.yAxis.tickPadding(chartOptions.yAxisTickPadding);

        return chartModel;
    }
    return HorizontalBarChartModel;
});
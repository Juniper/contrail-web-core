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
     * @returns multiBarChartModel
     */
    var MultiBarChartModel = function (chartOptions) {
        var chartModel = nvd3v181.models.multiBarChart()
            .duration(chartOptions.transitionDuration)
            .height(chartOptions.height)
            .margin(chartOptions.margin)
            .x(function (d) {
                return d.label;
            })
            .y(function (d) {
                return d.value;
            })
            .tooltips(chartOptions.showTooltips)
            .reduceXTicks(chartOptions.reduceXTicks)
            .rotateLabels(chartOptions.rotateLabels)
            .color(function (d) {
                return chartOptions.barColor(d.key);
            })
            .showLegend(chartOptions.showLegend)
            .stacked(chartOptions.stacked)
            .showControls(chartOptions.showControls)
            .groupSpacing(chartOptions.groupSpacing);

        chartModel.legend.rightAlign(chartOptions.legendRightAlign)
            .padding(chartOptions.legendPadding);

        chartModel.xAxis.axisLabel(chartOptions.xAxisLabel);
        chartModel.xAxis.tickPadding(chartOptions.xAxisTickPadding);
        chartModel.yAxis.axisLabel(chartOptions.yAxisLabel).tickFormat(chartOptions.yFormatter);
        chartModel.yAxis.tickPadding(chartOptions.yAxisTickPadding);

        return chartModel;
    }
    return MultiBarChartModel;
});
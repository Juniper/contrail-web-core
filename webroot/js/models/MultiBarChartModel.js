/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'lodash'
], function (_) {
    /**
     * This chart model accepts data in following format:
     *  [{key: '', values: [{label: '', value: },{..}]},{..}]
     * @param chartOptions
     * @returns multiBarChartModel
     */
    var MultiBarChartModel = function (chartOptions) {
        var chartClassMap = {
            'horizontal': nv.models.multiBarHorizontalChart,
            'vertical': nv.models.multiBarChart
        };
        var chartModel = chartClassMap[_.result(chartOptions, 'barOrientation')]()
            .duration(chartOptions.transitionDuration)
            .height(chartOptions.height)
            .margin(chartOptions.margin)
            .x(function (d) {
                return d.label;
            })
            .y(function (d) {
                return d.value;
            })
            .color(function (d) {
                return chartOptions.barColor(d.key);
            })
            .showLegend(chartOptions.showLegend)
            .stacked(chartOptions.stacked)
            .showControls(chartOptions.showControls)
            .groupSpacing(chartOptions.groupSpacing);
        if (_.result(chartOptions, 'barOrientation') == 'vertical') {
            chartModel.tooltips(chartOptions.showTooltips)
                .reduceXTicks(chartOptions.reduceXTicks)
                .rotateLabels(chartOptions.rotateLabels)
                .staggerLabels(chartOptions.staggerLabels);
        }
        if (chartOptions['yDomain'] != null) {
            chartModel.yDomain(chartOptions['yDomain']);
        }
        chartModel.legend.rightAlign(chartOptions.legendRightAlign)
            .padding(chartOptions.legendPadding);
        chartModel.xAxis.axisLabel(chartOptions.xAxisLabel);
        chartModel.xAxis.tickPadding(chartOptions.xAxisTickPadding);
        chartModel.yAxis.axisLabel(chartOptions.yAxisLabel).tickFormat(chartOptions.yFormatter);
        if(chartOptions['yUnit'] == 'bytes' || chartOptions['yUnit'] == 'bps') {
            chartModel.yAxis.showMaxMin(false);
        }
        chartModel.yAxis.tickPadding(chartOptions.yAxisTickPadding);
        if (chartOptions.tooltipContent != null) {
            chartModel.tooltipContent(chartOptions.tooltipContent);
        }
        if (chartOptions['xLblFormatter'] != null) {
            chartModel.xAxis.tickFormat(function (xLabel) {
                return chartOptions['xLblFormatter'](xLabel, chartOptions['chartData']);
            });
        }

        return chartModel;
    }
    return MultiBarChartModel;
});
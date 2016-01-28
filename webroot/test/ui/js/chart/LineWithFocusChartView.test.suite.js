/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'co-test-utils',
    'co-test-messages',
    'co-test-constants',
    'co-test-runner'
], function (_, cotu, cotm, cotc, cotr) {

    var testSuiteClass = function (viewObj, suiteConfig){

        var viewConfig = cotu.getViewConfigObj(viewObj),
            el = viewObj.el,
            chartOptions = viewConfig.chartOptions,
            chartOptions = $.extend(true, {}, covdc.lineWithFocusChartConfig, chartOptions),
            color = nv.utils.defaultColor();

        var chartData = (viewObj.mockData || viewObj.model.getItems());
        if (contrail.checkIfExist(viewConfig.parseFn)) {
            chartData = viewConfig.parseFn(chartData);
        }

        /**
         * To access the chart data on the DOM which is used to plot the graph.
         */
        //var domChartData = d3.select(viewObj.$el.find('svg')[0]).data()['data'];

        module(cotu.formatTestModuleMessage(cotm.TEST_CHARTVIEW_LINE, el.id));

        var chartViewTestSuite = cotr.createTestSuite('LineWithFocusChartViewTest');

        /**
         * Chart basic group test cases
         */
        var basicTestGroup = chartViewTestSuite.createTestGroup('basic');

        /**
         * Test axis labels.
         */
        basicTestGroup.registerTest(cotr.test(cotm.CHARTVIEW_AXIS_LABEL, function () {
            equal($(el).find('.nv-lineWithFocusChart .nv-focus .nv-y .nv-axislabel').text().trim(), chartOptions.yAxisLabel,
                "Y1 axis title should be equal to the title set");
            if (chartOptions.y2AxisLabel != "") {
                equal($(el).find('.nv-lineWithFocusChart .nv-focus .nv-y2 .nv-axislabel').text().trim(), chartOptions.y2AxisLabel,
                    "Y2 axis title should be equal to the title set");
            }
            equal($(el).find('.nv-lineWithFocusChart .nv-context .nv-x .nv-axislabel').text().trim(), "Time",
                "X axis title should be set as Time");
        }, cotc.SEVERITY_LOW));

        /**
         * Test number of lines
         *
         */
        basicTestGroup.registerTest(cotr.test(cotm.CHARTVIEW_COUNT_LINES, function () {
            expect(1);
            equal($(el).find('.nv-lineWithFocusChart .nv-focus .nv-groups .nv-line').length, 2,
                "Number of lines in chart equal to number of lines set");
        }, cotc.SEVERITY_LOW));

        /**
         * Test color of lines
         *
         */
        basicTestGroup.registerTest(cotr.test(cotm.CHARTVIEW_COLOR_LINES, function () {
            expect(chartData.length);
            _.each(chartData, function(series, idx) {
                var cssId = '.nv-lineWithFocusChart .nv-focus .nv-groups .nv-series-'+ idx +' .nv-line';
                if(contrail.checkIfExist(series.color)) {
                    equal(
                        d3.rgb($(el).find(cssId).parent().css('fill')).toString(), d3.rgb(series.color).toString(),
                        "Color of lines in chart equal to color of lines set"
                    );
                } else {
                    equal(
                        d3.rgb($(el).find(cssId).parent().css('fill')).toString(), color(series, idx),
                        "Color of lines in chart equal to color of lines set"
                    );
                }
            });
        }, cotc.SEVERITY_LOW));

        chartViewTestSuite.run(suiteConfig.groups, suiteConfig.severity);

    };

    return testSuiteClass;
});
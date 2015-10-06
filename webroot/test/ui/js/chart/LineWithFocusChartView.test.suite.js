/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'co-test-utils',
    'co-test-messages',
    'co-test-constants',
    'co-test-unit'
], function (_, cotu, cotm, cotc, CUnit) {

    var testSuiteClass = function (viewObj, suiteConfig){

        var viewConfig = cotu.getViewConfigObj(viewObj),
            el = viewObj.el,
            chartItems = viewObj.model.getItems(),
            chartOptions = viewConfig.chartOptions,
            chartOptions = $.extend(true, {}, covdc.lineWithFocusChartConfig, chartOptions);

        module(cotu.formatTestModuleMessage(cotm.TEST_CHARTVIEW_LINE, el.id));

        var chartViewTestSuite = CUnit.createTestSuite('LineWithFocusChartViewTest');

        /**
         * Chart basic group test cases
         */
        var basicTestGroup = chartViewTestSuite.createTestGroup('basic');

        /**
         * Test axis labels.
         */
        basicTestGroup.registerTest(CUnit.test(cotm.CHARTVIEW_AXIS_LABEL, function () {
            equal($(el).find('.nv-lineWithFocusChart .nv-focus .nv-y .nv-axislabel').text().trim(), chartOptions.yAxisLabel,
                "Y1 axis title should be equal to the title set");
            if (chartOptions.y2AxisLabel != "") {
                equal($(el).find('.nv-lineWithFocusChart .nv-focus .nv-y2 .nv-axislabel').text().trim(), chartOptions.y2AxisLabel,
                    "Y2 axis title should be equal to the title set");
            }
            equal($(el).find('.nv-lineWithFocusChart .nv-context .nv-x .nv-axislabel').text().trim(), "Time",
                "X axis title should be set as Time");
        }, cotc.SEVERITY_LOW));

        chartViewTestSuite.run(suiteConfig.groups, suiteConfig.severity);

    };

    return testSuiteClass;
});
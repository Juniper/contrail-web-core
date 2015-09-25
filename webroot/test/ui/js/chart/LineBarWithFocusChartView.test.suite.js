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
            chartOptions = $.extend(true, {}, covdc.lineBarWithFocusChartConfig, chartOptions);

        module(cotu.formatTestModuleMessage(cotm.TEST_CHARTVIEW_LINE_BAR, el.id));

        var chartViewTestSuite = CUnit.createTestSuite('LineBarWithFocusChartViewTest');

        /**
         * Chart basic group test cases
         */
        var basicTestGroup = chartViewTestSuite.createTestGroup('basic');

        /**
         * Test axis labels.
         */
        basicTestGroup.registerTest(CUnit.test(cotm.CHARTVIEW_AXIS_LABEL, function () {
            expect(2);
            equal($(el).find('.nv-linePlusBar .nv-focus .nv-y1 .nv-axislabel').text().trim(), chartOptions.y1AxisLabel,
                "Y1 axis title should be equal to the title set");
            equal($(el).find('.nv-linePlusBar .nv-focus .nv-y2 .nv-axislabel').text().trim(), chartOptions.y2AxisLabel,
                "Y2 axis title should be equal to the title set");
        }, cotc.SEVERITY_LOW));

        chartViewTestSuite.run(suiteConfig.groups, suiteConfig.severity);

    };

    return testSuiteClass;
});
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
            chartModel = viewObj.chartModel;

        module(cotu.formatTestModuleMessage(cotm.TEST_CHARTVIEW_ZOOM_SCATTER, el.id));

        var chartViewTestSuite = CUnit.createTestSuite('ZoomScatterChartViewTest');

        /**
         * Chart basic group test cases
         */
        var basicTestGroup = chartViewTestSuite.createTestGroup('basic');

        /**
         * Test axis labels.
         */
        basicTestGroup.registerTest(CUnit.test(cotm.CHARTVIEW_AXIS_LABEL, function () {
            expect(2);
            equal($(el).find('.zoom-scatter-chart .x.label').text().trim(), chartOptions.xLabel.trim(),
                "X axis title should be equal to the title set");
            equal($(el).find('.zoom-scatter-chart .y.label').text().trim(), chartOptions.yLabel.trim(),
                "Y axis title should be equal to the title set");
        }, cotc.SEVERITY_LOW));

        basicTestGroup.registerTest(CUnit.test(cotm.CHARTVIEW_BUBBLE_COUNT, function () {
            expect(1);
            equal($(el).find('.zoom-scatter-chart').find('circle').length, chartItems.length,
                "Number of bubbles in chart should be equal to the chart data");
        }, cotc.SEVERITY_LOW));

        basicTestGroup.registerTest(CUnit.test(cotm.CHARTMODEL_BUBBLE_COLOR, function () {
            expect(1);
            var chartData = chartModel.data,
                expectedColorObj = [], actualColorObj = [];

            for(var i=0; i< chartData.length; i++) {
                expectedColorObj.push(chartData[i].color);
            }

            $(el).find('.zoom-scatter-chart').find('circle').each(
                function (k, v) {
                    actualColorObj.push($(v).attr('class'));
                }
            );

            equal($(expectedColorObj).not(actualColorObj).get().length, [],
                "Color of bubbles in chart should be equal to the chart data");
        }, cotc.SEVERITY_LOW));

        basicTestGroup.registerTest(CUnit.test(cotm.CHARTMODEL_BUBBLE_SIZE, function () {
            expect(1);
            var chartData = chartModel.data,
                expectedSizeArr = [], actualSizeArr = [];

            for(var i=0; i< chartData.length; i++) {
                expectedSizeArr.push(chartData[i].size);
            }
            $(el).find('.zoom-scatter-chart').find('circle').each(
                function (k, v) {
                    actualSizeArr.push(
                        parseFloat($(v).attr('r'))
                    );
                }
            );
            equal($(expectedSizeArr).not(actualSizeArr).get().length, [],
                "Size of bubbles in chart should be equal to the size in chart data");
        }, cotc.SEVERITY_LOW));

        chartViewTestSuite.run(suiteConfig.groups, suiteConfig.severity);

    };

    return testSuiteClass;
});
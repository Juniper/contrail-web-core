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

        var testSuiteClass = function (viewObj, suiteConfig) {

        var viewConfig = cotu.getViewConfigObj(viewObj),
            el = viewObj.el;
        module(cotu.formatTestModuleMessage(cotm.TEST_GRIDVIEW_GRID, el.id));

        var gridViewErrorTestSuite = cotr.createTestSuite('GridViewErrorTest');

        /**
         * Grid error group test cases
         */
        var errorTestGroup = gridViewErrorTestSuite.createTestGroup('error');

        //Remote ajax datasource failure scenario
        errorTestGroup.registerTest(cotr.test("Error scenario in case of remote ajax datasource fails", function () {
            expect(1);
            var isPresent = $($(el).find('.slick-viewport .grid-canvas')).text().trim().indexOf("Error") > -1 ? true : false;

            equal(isPresent, true, "Error message should be present");

        }, cotc.SEVERITY_HIGH));

        gridViewErrorTestSuite.run(suiteConfig.groups, suiteConfig.severity);

    };

    return testSuiteClass;
});

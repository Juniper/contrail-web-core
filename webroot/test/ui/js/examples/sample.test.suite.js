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

        module("sample test suite");

        var sampleTestSuite = CUnit.createTestSuite('TestSuiteName');

        /**
         * Sample test group in suite
         */
        var sampleTestGroup = sampleTestSuite.createTestGroup('TestGroupName');

        /**
         * Sample Test.
         */
        sampleTestGroup.registerTest(CUnit.test("Sample Test message", function () {
            // add assertions
            //expect(1);
            //equal();
        }, cotc.SEVERITY_LOW));

        sampleTestSuite.run(suiteConfig.groups, suiteConfig.severity);

    };

    return testSuiteClass;
});
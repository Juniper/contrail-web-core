/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'jquery',
    'underscore',
    'co-test-utils',
    'co-test-messages',
    'co-test-constants',
    'co-test-runner'
], function ($, _, cotu, cotm, cotc, cotr) {

    var testSuiteClass = function (modelObj, suiteConfig){

        var mockData = suiteConfig.modelConfig.mockData,
            validationData = mockData.validations;

        //module("sample test suite");

        var formEditModelTestSuite = cotr.createTestSuite('FormEditModelTestSuite');

        /**
         * Test group for form validations
         */
        var validationTestGroup = formEditModelTestSuite.createTestGroup('Validation');

        /**
         * Test each data sample for successful validation.
         */
        validationTestGroup.registerTest(cotr.test("Test successful validations", function () {
            expect(validationData.success.length);
            _.each(validationData.success, function(data) {
                var formDataModel = $.extend(true, {}, modelObj);
                equal(formDataModel.model().set(data).isValid(true, suiteConfig.modelConfig.validationKey), true, "assert equal isValid true for data set");
            })

        }, cotc.SEVERITY_HIGH));

        /**
         * Test each data sample for invalid input.
         */
            //validationTestGroup.registerTest(cotr.test("Test non-successful validations", function () {
            //
            //}, cotc.SEVERITY_HIGH));

        formEditModelTestSuite.run(suiteConfig.groups, suiteConfig.severity);

    };

    return testSuiteClass;
});
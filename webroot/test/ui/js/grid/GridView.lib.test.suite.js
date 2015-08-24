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

    var libTestSuiteClass = function (suiteConfig){

        var gridViewTestSuite = CUnit.createTestSuite('LibGridViewTest');

        //TODO add test groups and test cases


        gridViewTestSuite.run(suiteConfig.groups, suiteConfig.severity);

    };

    return libTestSuiteClass;
});
/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-runner',
    'co-test-constants',
    'co-grid-contrail-list-model-lib-test-suite',
    'co-grid-view-lib-test-suite'
], function (cotr, cotc, ContrailListModelLibTestSuite, GridViewLibTestSuite) {

    var moduleId = "Test GridView Library";

    var testType = cotc.LIB_API_TEST;

    var testInitFn = function(defObj) {
        same = QUnit.deepEqual;
        $('#content-container').append('<div id="container"/>');
        defObj.resolve();
    };

    var getTestConfig = function() {
        return {
            libName: "GridView",
            tests: [
                {
                    suites: [
                        {
                            class: ContrailListModelLibTestSuite,
                            groups: ['all'],
                            severity: cotc.SEVERITY_LOW
                        },
                        {
                            class: GridViewLibTestSuite,
                            groups: ['all'],
                            severity: cotc.SEVERITY_LOW
                        }
                    ]
                }
            ]
        };
    };

    cotr.startTestRunner({moduleId: moduleId, testType: testType, getTestConfig: getTestConfig, testInitFn: testInitFn});
    //cotr.startLibTestRunner(libTestConfig);

});
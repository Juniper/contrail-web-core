/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-grid-contrail-list-model-lib-test-suite',
    'co-grid-view-lib-test-suite',
    'co-test-unit'
], function (cotc, ContrailListModelLibTestSuite, GridViewLibTestSuite, CUnit) {

    var libTestConfig = {
        libName: "GridView",
        testInitFn : function() {
            same = QUnit.deepEqual;
            $('#content-container').append('<div id="container"/>');
        },
        suites: [
            {
                class: ContrailListModelLibTestSuite,
                groups: ['all'],
                severity: cotc.SEVERITY_LOW
            }
        ]
    };

    CUnit.startLibTestRunner(libTestConfig);

});
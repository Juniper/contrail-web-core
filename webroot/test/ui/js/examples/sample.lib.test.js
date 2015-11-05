/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-sample-view-lib-test-suite',
    'co-test-runner'
], function (cotc, SampleLibTestSuite, cotr) {

    var libTestConfig = {
        libName: "libraryName",
        testInitFn : function() {
            // use this to do any custom initialization prior to test.
        },
        suites: [
            {
                class: SampleLibTestSuite,
                groups: ['all'],
                severity: cotc.SEVERITY_LOW
            },
        ]
    };

    cotr.startLibTestRunner(libTestConfig);

});
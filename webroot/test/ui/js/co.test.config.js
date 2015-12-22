/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([], function () {

    var testConfig = {};

    /**
     * set the env at which test scripts should execute.
     * will be set from make targets 'dev-env' or 'prod-env'
     */
    testConfig.env = 'prod';

    /**
     * Minimum severity to run the tests.
     * for severity set to low, all the tests set to severity above low will be executed.
     * if this is set to empty, the severity set in the test config will be used.
     */
    testConfig.run_severity = 'low';

    /**
     * Timeouts
     * following global timeouts are available to configure various stage of test execution.
     * a multiple of following timeouts are implemented in each test page depending on initial testing.
     * altering following will have multiple factor effect depending on the test page.
     */

    //timeout for the test page to load
    testConfig.page_load_timeout = 1000;

    //timeout for page initialization actions to complete before test execution.
    testConfig.page_init_timeout = 50;

    //timeout for
    testConfig.assert_timeout = 1000;

    return testConfig;
});

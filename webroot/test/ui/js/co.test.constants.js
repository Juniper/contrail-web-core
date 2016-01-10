/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([], function () {
    var COTestConstants = function () {
        var testConfig = globalObj.testConf ? globalObj.testConf : {};
        this.TYPE_CONTRAIL_TEST = 'CONTRAIL_TEST';
        this.TYPE_CONTRAIL_TEST_SUITE = 'CONTRAIL_TEST_SUITE';
        this.TYPE_CONTRAIL_TEST_GROUP = 'CONTRAIL_TEST_GROUP';

        this.VIEW_TEST = 'VIEW_TEST'; //Tests ContrailView implementations
        this.MODEL_TEST = 'MODEL_TEST'; //Tests ContrailModel implementations
        this.UNIT_TEST = 'UNIT_TEST'; //Basic Unit tests
        this.API_TEST = 'API_TEST'; //Tests the API section of UI
        this.LIB_API_TEST = 'LIB_API_TEST'; //Tests third party library APIs

        this.SEVERITY_HIGH = 'high';
        this.SEVERITY_MEDIUM = 'medium';
        this.SEVERITY_LOW = 'low';
        /**
         * Minimum severity to run the tests.
         * for severity set to low, all the tests set to severity above low will be executed.
         * if this is set to empty, the severity set in the test config will be used.
         */
        this.RUN_SEVERITY = testConfig.run_severity ? testConfig.run_severity : this.SEVERITY_LOW;

        this.PAGE_LOAD_TIMEOUT = testConfig.page_load_timeout ? testConfig.page_load_timeout : 1000;
        this.PAGE_INIT_TIMEOUT = testConfig.page_init_timeout ? testConfig.page_init_timeout : 50; // keep 50 or more.
        this.ASSERT_TIMEOUT = testConfig.assert_timeout ? testConfig.assert_timeout : 1000;

        this.MONITOR_NETWORKING_PAGE_LOADER = 'mnPageLoader';
        this.MONITOR_NETWORKING_ROOT_VIEW = this.MONITOR_NETWORKING_PAGE_LOADER + '.mnView';
        this.MONITOR_STORAGE_PAGE_LOADER = 'msPageLoader';
        this.MONITOR_STORAGE_ROOT_VIEW = this.MONITOR_STORAGE_PAGE_LOADER + '.msView';
        this.MONITOR_SERVER_MANAGER_PAGE_LOADER = 'smPageLoader';
        this.MONITOR_SERVER_MANAGER_ROOT_VIEW = this.MONITOR_SERVER_MANAGER_PAGE_LOADER + '.smView';

    };
    return new COTestConstants();
});
/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([], function () {
    var COTestConstants = function () {

        this.TYPE_CONTRAIL_TEST = 'CONTRAIL_TEST';
        this.TYPE_CONTRAIL_TEST_SUITE = 'CONTRAIL_TEST_SUITE';
        this.TYPE_CONTRAIL_TEST_GROUP = 'CONTRAIL_TEST_GROUP';

        this.SEVERITY_HIGH = 'high';
        this.SEVERITY_MEDIUM = 'medium';
        this.SEVERITY_LOW = 'low';

        this.MONITOR_NETWORKING_PAGE_LOADER = 'mnPageLoader';
        this.MONITOR_NETWORKING_ROOT_VIEW = this.MONITOR_NETWORKING_PAGE_LOADER + '.mnView';
        this.MONITOR_STORAGE_PAGE_LOADER = 'msPageLoader';
        this.MONITOR_STORAGE_ROOT_VIEW = this.MONITOR_STORAGE_PAGE_LOADER + '.msView';
        this.MONITOR_SERVER_MANAGER_PAGE_LOADER = 'smPageLoader';
        this.MONITOR_SERVER_MANAGER_ROOT_VIEW = this.MONITOR_SERVER_MANAGER_PAGE_LOADER + '.smView';

    };
    return new COTestConstants();
})
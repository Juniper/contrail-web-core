/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([], function () {
    var COTestConstants = function () {

        this.MONITOR_NETWORKING_PAGES = ['mon_networking_networks'];
        this.MONITOR_STORAGE_PAGES = [];
        this.MONITOR_SERVER_MANAGER_PAGES = [];

        this.MONITOR_NETWORKING_VIEW_MAIN = 'mnPageLoader';
        this.MONITOR_NETWORKING_VIEW_TEST_OBJ = this.MONITOR_NETWORKING_VIEW_MAIN + '.mnView';
        this.MONITOR_STORAGE_VIEW_MAIN = 'msPageLoader';
        this.MONITOR_STORAGE_VIEW_TEST_OBJ = this.MONITOR_STORAGE_VIEW_MAIN + '.msView';
        this.MONITOR_SERVER_MANAGER_VIEW_MAIN = 'msmPageLoader';
        this.MONITOR_SERVER_MANAGER_VIEW_TEST_OBJ = this.MONITOR_SERVER_MANAGER_VIEW_MAIN + '.msmView';

        this.TYPE_GRID_VIEW_TEST = 'GridView';
        this.TYPE_CHART_VIEW_TEST = 'ChartView';
        this.TYPE_GRAPH_VIEW_TEST = 'GraphView';

        this.GRID_VIEW_DATAVIEW_TEST = 'gridview-dataview-test';
        this.GRID_VIEW_GRID_TEST = 'gridview-grid-test';

    };
    return COTestConstants;
})
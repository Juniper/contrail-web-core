/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([], function () {

    var TMessages = function() {
        this.TEST_SLICKGRID_DATAVIEW = 'Test SlickGrid Dataview.';
        this.TEST_SLICKGRID_GRID = 'Test SlickGrid Grid.';

        this.SLICKGRID_DATAVIEW_INITIAL_SETUP = 'Test SlickGrid dataview setup, rows initialization';
        this.SLICKGRID_DATAVIEW_REFRESH = 'Test SlickGrid dataview refresh, check data items';

        this.SLICKGRID_GRIDVIEW_ROWS_LOADED = 'Test rows loaded in grid view.';
        this.SLICKGRID_GRIDVIEW_COLUMNS_LOADED = 'Test columns loaded in grid view.';

        this.get = function () {
            var args = arguments;
            return args[0].replace(/\{(\d+)\}/g, function (m, n) {
                n = parseInt(n) + 1;
                return args[n];
            });
        };
    };

    return new TMessages();
});
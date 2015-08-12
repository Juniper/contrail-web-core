/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([], function () {

    var TMessages = function() {
        this.TEST_SLICKGRID_LISTMODEL = 'Test SlickGrid data model';
        this.TEST_SLICKGRID_GRID = 'Test SlickGrid Grid';

        this.SLICKGRID_LISTMODEL_INITIAL_SETUP = 'Test SlickGrid listmodel setup, rows initialization';
        this.SLICKGRID_LISTMODEL_REFRESH = 'Test SlickGrid listmodel refresh, check data items';

        //header
        this.SLICKGRID_GRIDVIEW_GRID_TITLE = 'Test grid title set to the configured.';
        this.SLICKGRID_GRIDVIEW_DEFAULT_CONTROLS_DATA_ACTION = 'Test default controls data-action configured.';
        this.SLICKGRID_GRIDVIEW_DEFAULT_CONTROLS_ICONS = 'Test default controls icons are present.';
        this.SLICKGRID_GRIDVIEW_COLUMNS_LOADED = 'Test columns loaded in grid view.';
        this.SLICKGRID_GRIDVIEW_COLUMN_TITLE = 'Test column title with column config';
        this.SLICKGRID_GRIDVIEW_HEADER_COLUMN_CHECKBOX = 'Test header column checkbox';
        //body
        this.SLICKGRID_GRIDVIEW_ROWS_LOADED = 'Test rows loaded in grid view.';
        this.SLICKGRID_GRIDVIEW_DETAIL_ROWS_ICON = 'Test rows toggle detail icon';
        this.SLICKGRID_GRIDVIEW_DETAIL_ROW_TOGGLE = 'Toggle the detail icon and check the details html generated';
        this.SLICKGRID_GRIDVIEW_ROWS_CHECKBOX = 'Test rows checkbox input';
        this.SLICKGRID_GRIDVIEW_ROW_FIXED_HEIGHT = 'Test row height';
        //footer
        this.SLICKGRID_GRIDVIEW_FOOTER_PAGER_SIZE = 'Test pager sizes loaded';
        this.SLICKGRID_GRIDVIEW_FOOTER_PAGER_INFO = 'Test pager info shown';

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
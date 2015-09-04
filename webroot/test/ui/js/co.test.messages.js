/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([], function () {

    var TMessages = function() {
        this.TEST_GRIDVIEW_LIST_MODEL = 'Test GridView data model';
        this.TEST_GRIDVIEW_GRID = 'Test GridView Grid';

        this.GRIDVIEW_LIST_MODEL_INITIAL_SETUP = 'Test GridView list model setup, rows initialization';
        this.GRIDVIEW_LIST_MODEL_REFRESH = 'Test GridView list model refresh, check data items';

        //header
        this.GRIDVIEW_GRID_TITLE = 'Test grid title set to the configured.';
        this.GRIDVIEW_DEFAULT_CONTROLS_DATA_ACTION = 'Test default controls data-action configured.';
        this.GRIDVIEW_DEFAULT_CONTROLS_ICONS = 'Test default controls icons are present.';
        this.GRIDVIEW_COLUMNS_LOADED = 'Test columns loaded in grid view.';
        this.GRIDVIEW_COLUMN_TITLE = 'Test column title with column config';
        this.GRIDVIEW_HEADER_COLUMN_CHECKBOX = 'Test header column checkbox';
        //body
        this.GRIDVIEW_ROWS_LOADED = 'Test rows loaded in grid view.';
        this.GRIDVIEW_DETAIL_ROWS_ICON = 'Test rows toggle detail icon';
        this.GRIDVIEW_DETAIL_ROW_TOGGLE = 'Toggle the detail icon and check the details html generated';
        this.GRIDVIEW_ROWS_CHECKBOX = 'Test rows checkbox input';
        this.GRIDVIEW_ROW_FIXED_HEIGHT = 'Test row height';
        //footer
        this.GRIDVIEW_FOOTER_PAGER_SIZE = 'Test pager sizes loaded';
        this.GRIDVIEW_FOOTER_PAGER_INFO = 'Test pager info shown';

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
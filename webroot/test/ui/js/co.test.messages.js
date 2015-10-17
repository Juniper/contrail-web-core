/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([], function () {

    var TMessages = function() {
        this.TEST_GRIDVIEW_LIST_MODEL = 'Test Grid View data model';
        this.TEST_GRIDVIEW_GRID = 'Test Grid View Grid';
        this.TEST_CHARTVIEW_ZOOM_SCATTER = 'Test ZoomScatter Chart View';
        this.TEST_CHARTVIEW_LINE = 'Test Line Chart View';
        this.TEST_CHARTVIEW_LINE_BAR = 'Test LineBar Chart View';
        this.TEST_DETAILSVIEW = 'Test Details View';
        this.TEST_TABSVIEW = 'Test Tabs View';

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

        this.CHARTVIEW_AXIS_LABEL = 'Test chart axis labels set to the configured';
        this.CHARTVIEW_BUBBLE_COUNT = 'Test count of bubbles set to the configured';
        this.CHARTMODEL_BUBBLE_SIZE = 'Test size of bubbles set to the configured';
        this.CHARTMODEL_BUBBLE_COLOR = 'Test color of bubbles set to the configured';

        this.DETAILSVIEW_TMPL_HTML = 'Test details view html is same as generated html';
        this.DETAILSVIEW_BASIC_ADVANCED_TOGGLE = 'Test basic and advanced view';
        this.DETAILSVIEW_ACTIONS_BASIC = 'Test details view actions';
        this.DETAILSVIEW_ACTIONS_OPTIONLIST = 'Test details view actions options list';

        this.TABSVIEW_TAB_TITLE = 'Test tab tiles set to the configured';
        this.TABSVIEW_TAB_ACTIVATE = 'Test activating each tab';

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
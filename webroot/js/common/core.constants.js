/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var CoreConstants = function () {
        this.TMPL_SUFFIX_ID = "-template";
        this.RESULTS_SUFFIX_ID = "-results";
        this.ERROR_SUFFIX_ID = "_error";
        this.LOCKED_SUFFIX_ID = "_locked";
        this.FORM_SUFFIX_ID = "_form";

        this.PATTERN_IP_ADDRESS  = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
        this.PATTERN_SUBNET_MASK = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(\d|[1-2]\d|3[0-2]))?$/;
        this.PATTERN_MAC_ADDRESS = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;

        this.LIST_CACHE_UPDATE_INTERVAL = 60000;
        this.GRAPH_CACHE_UPDATE_INTERVAL = 60000;
        this.VIEWMODEL_CACHE_UPDATE_INTERVAL = 60000;

        this.DOMAIN_CACHE_UPDATE_INTERVAL = 15 * 60000;
        this.PROJECT_CACHE_UPDATE_INTERVAL = 7 * 60000;
        this.NETWORK_CACHE_UPDATE_INTERVAL = 4 * 60000;

        this.KEY_MODEL_ERRORS = 'errors';
        this.KEY_MODEL_LOCKS = 'locks';
        this.KEY_ELEMENT_ID = 'elementId';
        this.KEY_ROWS = 'rows';
        this.KEY_COLUMNS = 'columns';
        this.KEY_CHILD_VIEW = 'childView';
        this.KEY_VIEW_CONFIG = 'viewConfig';
        this.KEY_PATH = 'path';
        this.KEY_ELEMENT_CONFIG = 'elementConfig';
        this.KEY_DATABIND_VALUE = 'dataBindValue';
        this.KEY_TYPE = 'type';
        this.KEY_UI_ADDED_PARAMS = 'ui_added_parameters';

        this.KEY_VALIDATION = 'validation';

        this.TMPL_2ROW_CONTENT_VIEW = "core-2-row-content-template";
        this.TMPL_2COLUMN_1ROW_2ROW_CONTENT_VIEW = "core-2-column-1-row-2row-content-template";

        this.TMPL_ACCORDIAN_VIEW = "core-accordian-view-template";
        this.TMPL_INPUT_VIEW = "core-input-view-template";
        this.TMPL_EDITABLE_GRID_INPUT_VIEW = "core-editable-grid-input-view-template";
        this.TMPL_DROPDOWN_VIEW = "core-dropdown-view-template";
        this.TMPL_EDITABLE_GRID_DROPDOWN_VIEW = "core-editable-grid-dropdown-view-template";
        this.TMPL_MULTISELECT_VIEW = "core-multiselect-view-template";
        this.TMPL_EDITABLE_GRID_MULTISELECT_VIEW = "core-editable-grid-multiselect-view-template";
        this.TMPL_COMBOBOX_VIEW = "core-combobox-view-template";
        this.TMPL_EDITABLE_GRID_COMBOBOX_VIEW = "core-editable-grid-combobox-view-template";
        this.TMPL_CHECKBOX_VIEW = "core-checkbox-view-template";
        this.TMPL_EDITABLE_GRID_CHECKBOX_VIEW = "core-editable-grid-checkbox-view-template";
        this.TMPL_DATETIMEPICKER_VIEW = "core-datetimepicker-view-template";
        this.TMPL_NUMERICTEXTBOX_VIEW = "core-numerictextbox-view-template";
        this.TMPL_TEXTAREA_VIEW = "core-textarea-view-template";
        this.TMPL_BUTTON_VIEW = "core-button-view-template";
        this.TMPL_COMPOSITE_VIEW = "core-composite-view-template";
        this.TMPL_RADIO_BUTTON_VIEW = "core-radio-button-view-template";
        this.TMPL_EDITABLE_GRID_VIEW = "core-editable-grid-view-template";
        this.TMPL_TEXT_VIEW = "core-text-view-template";

        this.TMPL_COLLECTION_VIEW = "core-collection-view-template";
        this.TMPL_QUERY_OR_COLLECTION_VIEW = "query-or-collection-view-template";

        this.TMPL_SECTION_VIEW = "core-section-view-template";
        this.TMPL_EDIT_FORM = "core-edit-form-template";
        this.TMPL_GENERIC_EDIT_FORM = "core-generic-edit-form-template";
        this.TMPL_2ROW_GROUP_DETAIL = "core-grid-2-row-group-detail-template";
        this.TMPL_DETAIL_PAGE = "core-detail-page-template";
        this.TMPL_DETAIL_PAGE_ACTION = "core-detail-page-action-template";
        this.TMPL_WIZARD_VIEW = "core-wizard-view-template";
        this.TMPL_NETWORKING_GRAPH_VIEW = "core-networking-graph-template";
        this.TMPL_CONTROL_PANEL = "core-control-panel-template";
        this.TMPL_TABS_VIEW = "core-tabs-template";
        this.TMPL_CHART_VIEW = "core-pd-chart-template";
        this.TMPL_DETAIL_FOUNDATION = "core-detail-foundation-template";
        this.TMPL_DETAIL_SECTION = "core-detail-section-template";
        this.TMPL_DETAIL_SECTION_COLUMN = "core-detail-section-column-template";
        this.TMPL_DETAIL_SECTION_ROW = "core-detail-section-row-template";
        this.TMPL_CHART = "core-chart-template";
        this.TMPL_ZOOMED_SCATTER_CHART = "core-zoomed-scatter-chart-template";
        this.TMPL_ZOOMED_SCATTER_CHART_CONTROL_PANEL_FILTER = "core-zoomed-scatter-chart-control-panel-filter-template";
        this.TMPL_ZOOMED_SCATTER_CHART_CONTROL_PANEL_LEGEND = "core-zoomed-scatter-chart-control-panel-legend-template";
        this.TMPL_WIDGET_VIEW = "core-widget-view-template";
        this.TMPL_LOADING_SPINNER = "core-loading-spinner-template";
        this.TMPL_NOT_FOUND_MESSAGE = "core-not-found-message-template";

        //Top boxes in Monitor > Infra > Dashboard that show the summary count of
        //each node type
        this.TMPL_INFOBOX = "infobox-summary-template";
        //Boxes in vRouter Tab of "Monitor > Infra > Dashboard" that shows bar chart
        //along with total count and title
        this.TMPL_CHARTINFO = "barchart-info-template";

        this.TMPL_ELEMENT_TOOLTIP = "element-tooltip-template";
        this.TMPL_ELEMENT_TOOLTIP_TITLE = "element-tooltip-title-template";
        this.TMPL_ELEMENT_TOOLTIP_CONTENT = "element-tooltip-content-template";

        this.APP_CONTRAIL_CONTROLLER = "contrail-controller";
        this.APP_CONTRAIL_SM = "contrail-sm";
        this.APP_CONTRAIL_STORAGE = "contrail-storage";

        this.COOKIE_DOMAIN = 'domain';
        this.COOKIE_PROJECT = 'project';
        this.COOKIE_VIRTUAL_NETWORK = 'virtual-network';

        this.THEME_DETAIL_WIDGET = 'widget-box';
        this.THEME_DETAIL_DEFAULT = 'default';

        this.GRAPH_MARGIN_LEFT = 1050;
        this.GRAPH_MARGIN_RIGHT = 1050;
        this.GRAPH_MARGIN_TOP = 1075;
        this.GRAPH_MARGIN_BOTTOM = 1050;

        this.TOOLTIP_DELAY = 1000;

        this.DEFAULT_CONFIG_ELEMENT_TOOLTIP = {
            dimension: {
                width: 275
            },
            delay: this.TOOLTIP_DELAY
        };

        this.DEFAULT_CONFIG_NOT_FOUND_PAGE = {
            title: 'Page not found.',
            iconClass: 'icon-warning-sign',
            defaultNavLinks: false,
        };

        this.DEFAULT_CONFIG_ERROR_PAGE = {
            title: "Error in getting data.",
            iconClass: 'icon-warning-sign',
            defaultErrorMessage: false,
            defaultNavLinks: false
        };

        this.TAB_THEME_CLASSIC = "classic";
        this.TAB_THEME_OVERCAST = "overcast";

        this.DATA_REQUEST_STATE_FETCHING = 'fetching';
        this.DATA_REQUEST_STATE_ERROR = 'error';
        this.DATA_REQUEST_STATE_SUCCESS_EMPTY = 'success-empty';
        this.DATA_REQUEST_STATE_SUCCESS_NOT_EMPTY = 'success-not-empty';

        this.QE_RESULT_CHUNK_SIZE = 10000;
    };
    return CoreConstants;
});

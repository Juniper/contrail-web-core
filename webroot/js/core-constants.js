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
        this.CHART_CACHE_UPDATE_INTERVAL = 60000;

        this.KEY_MODEL_ERRORS = 'errors';
        this.KEY_MODEL_LOCKS = 'locks';
        this.KEY_ELEMENT_ID = 'elementId';
        this.KEY_ROWS = 'rows';
        this.KEY_COLUMNS = 'columns';
        this.KEY_VIEW_CONFIG = 'viewConfig';
        this.KEY_PATH = 'path';
        this.KEY_ELEMENT_CONFIG = 'elementConfig';
        this.KEY_DATABIND_VALUE = 'dataBindValue';
        this.KEY_TYPE = 'type';
        this.KEY_UI_ADDED_PARAMS = 'ui_added_parameters';

        this.KEY_VALIDATION = 'validation';

        this.TMPL_2ROW_CONTENT_VIEW = "core-2-row-content-template";

        this.TMPL_ACCORDIAN_VIEW = "core-accordian-view-template";
        this.TMPL_DROPDOWN_VIEW = "core-dropdown-view-template";
        this.TMPL_SELECT2_DROPDOWN_VIEW = "core-select2-dropdown-view-template";
        this.TMPL_GRID_DROPDOWN_VIEW = "core-grid-dropdown-view-template";
        this.TMPL_INPUT_VIEW = "core-input-view-template";
        this.TMPL_GRID_INPUT_VIEW = "core-grid-input-view-template";
        this.TMPL_CHECKBOX_VIEW = "core-checkbox-view-template";
        this.TMPL_GRID_CHECKBOX_VIEW = "core-grid-checkbox-view-template";
        this.TMPL_EDITABLE_GRID_VIEW = "core-editable-grid-view-template";
        this.TMPL_MULTISELECT_VIEW = "core-multiselect-view-template";
        this.TMPL_GRID_MULTISELECT_VIEW = "core-grid-multiselect-view-template";
        this.TMPL_SECTION_VIEW = "core-section-view-template";
        this.TMPL_EDIT_FORM = "core-edit-form-template";
        this.TMPL_2ROW_GROUP_DETAIL = "core-grid-2-row-group-detail-template";
        this.TMPL_DETAIL_PAGE = "core-detail-page-template";
        this.TMPL_DETAIL_PAGE_ACTION = "core-detail-page-action-template";
        this.TMPL_WIZARD_VIEW = "core-wizard-view-template";
        this.TMPL_NETWORKING_GRAPH_VIEW = "core-networking-graph-template";
        this.TMPL_GRAPH_CONTROL_PANEL = "graph-control-panel-template";
        this.TMPL_TABS_VIEW = "core-tabs-template";
        this.TMPL_CHART_VIEW = "core-pd-chart-template";
        this.TMPL_DETAIL_FOUNDATION = "core-detail-foundation-template";
        this.TMPL_DETAIL_SECTION = "core-detail-section-template";
        this.TMPL_DETAIL_SECTION_COLUMN = "core-detail-section-column-template";
        this.TMPL_DETAIL_SECTION_ROW = "core-detail-section-row-template";
        this.TMPL_LOADING_SPINNER = "core-loading-spinner-template";

        this.TMPL_ELEMENT_TOOLTIP = "element-tooltip-template";
        this.TMPL_ELEMENT_TOOLTIP_TITLE = "element-tooltip-title-template";
        this.TMPL_ELEMENT_TOOLTIP_CONTENT = "element-tooltip-content-template";

        this.APP_CONTRAIL_CONTROLLER = "contrail-controller";
        this.APP_CONTRAIL_SM = "contrail-sm";

        this.COOKIE_DOMAIN = 'domain';
        this.COOKIE_PROJECT = 'project';
        this.COOKIE_VIRTUAL_NETWORK = 'virtual-network';

        this.GRAPH_MARGIN_LEFT = 350;
        this.GRAPH_MARGIN_RIGHT = 350;
        this.GRAPH_MARGIN_TOP = 350;
        this.GRAPH_MARGIN_BOTTOM = 350;
    };
    return CoreConstants;
});

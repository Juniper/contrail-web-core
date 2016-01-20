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

        this.SEV_LEVELS = {
                ERROR   : 3, //Red
                WARNING : 4, //Orange
//                NOTICE  : 2, //Blue
//                INFO    : 3, //Green
            }

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
        this.OBJECT_TYPE_COLLECTION = 'collection';
        this.OBJECT_TYPE_MODEL = 'model';
        this.OBJECT_TYPE_COLLECTION_OF_COLLECTION = "collection_of_collection";

        this.TMPL_2ROW_CONTENT_VIEW = "core-2-row-content-template";
        this.TMPL_2COLUMN_1ROW_2ROW_CONTENT_VIEW = "core-2-column-1-row-2row-content-template";

        this.TMPL_ACCORDIAN_VIEW = "core-accordian-view-template";
        this.TMPL_INPUT_VIEW = "core-input-view-template";
        this.TMPL_EDITABLE_GRID_INPUT_VIEW = "core-editable-grid-input-view-template";
        this.TMP_EDITABLE_GRID_ACTION_VIEW = "core-editable-grid-action-view-template";
        this.TMPL_DROPDOWN_VIEW = "core-dropdown-view-template";
        this.TMPL_EDITABLE_GRID_DROPDOWN_VIEW = "core-editable-grid-dropdown-view-template";
        this.TMPL_EDITABLE_GRID_DROPDOWN_LEFT_LABEL_VIEW = "core-editable-grid-label-left-dropdown-view-template";
        this.TMPL_MULTISELECT_VIEW = "core-multiselect-view-template";
        this.TMPL_EDITABLE_GRID_MULTISELECT_LEFT_LABEL_VIEW = "core-editable-grid-label-left-multiselect-view-template";
        this.TMPL_EDITABLE_GRID_MULTISELECT_VIEW = "core-editable-grid-multiselect-view-template";
        this.TMPL_COMBOBOX_VIEW = "core-combobox-view-template";
        this.TMPL_EDITABLE_GRID_COMBOBOX_VIEW = "core-editable-grid-combobox-view-template";
        this.TMPL_CHECKBOX_VIEW = "core-checkbox-view-template";
        this.TMPL_EDITABLE_GRID_CHECKBOX_VIEW = "core-editable-grid-checkbox-view-template";
        this.TMPL_TEXTAREA_VIEW = "core-textarea-view-template";
        this.TMPL_EDITABLE_GRID_TEXTAREA_VIEW = "core-editable-grid-textarea-view-template";
        this.TMPL_DATETIMEPICKER_VIEW = "core-datetimepicker-view-template";
        this.TMPL_NUMERICTEXTBOX_VIEW = "core-numerictextbox-view-template";
        this.TMPL_AUTOCOMPLETETEXTBOX_VIEW = "core-autocompletetextbox-view-template";
        this.TMPL_BUTTON_VIEW = "core-button-view-template";
        this.TMPL_COMPOSITE_VIEW = "core-composite-view-template";
        this.TMPL_RADIO_BUTTON_VIEW = "core-radio-button-view-template";
        this.TMPL_EDITABLE_GRID_VIEW = "core-editable-grid-view-template";
        this.TMPL_TEXT_VIEW = "core-text-view-template";

        this.TMPL_ELEMENT_NAME = 'core-element-name-template';

        this.TMPL_GRID_VIEW = "core-grid-view-template";

        this.TMPL_COLLECTION_VIEW = "core-collection-view-template";
        this.TMPL_GEN_COLLECTION_VIEW = "core-generic-collection-view-template";
        this.TMPL_QUERY_OR_COLLECTION_VIEW = "query-or-collection-view-template";
        this.TMPL_COLLECTION_HEADING_VIEW = "core-collection-view-heading-template";
        this.TMPL_COLLECTION_GRIDACTION_HEADING_VIEW = "core-collection-view-grid-action-heading-template";
        this.TMPL_SECTION_VIEW = "core-section-view-template";
        this.TMPL_EDIT_FORM = "core-edit-form-template";
        this.TMPL_GENERIC_EDIT_FORM = "core-generic-edit-form-template";
        this.TMPL_2ROW_GROUP_DETAIL = "core-grid-2-row-group-detail-template";
        this.TMPL_DETAIL_PAGE = "core-detail-page-template";
        this.TMPL_DETAIL_PAGE_ACTION = "core-detail-page-action-template";
        this.TMPL_WIZARD_VIEW = "core-wizard-view-template";
        this.TMPL_NETWORKING_GRAPH_VIEW = "core-networking-graph-template";
        this.TMPL_CONTROL_PANEL = "core-control-panel-template";
        this.TMPL_CONTROL_PANEL_FILTER = "core-control-panel-filter-template";
        this.TMPL_TABS_VIEW = "core-tabs-template";
        this.TMPL_TAB_LINK_VIEW = "core-tabs-link-template";
        this.TMPL_TAB_CONTENT_VIEW = "core-tabs-content-template";
        this.TMPL_CHART_VIEW = "core-pd-chart-template";
        this.TMPL_DETAIL_FOUNDATION = "core-detail-foundation-template";
        this.TMPL_DETAIL_SECTION = "core-detail-section-template";
        this.TMPL_DETAIL_SECTION_COLUMN = "core-detail-section-column-template";
        this.TMPL_DETAIL_SECTION_ROW = "core-detail-section-row-template";
        this.TMPL_CHART = "core-chart-template";
        this.TMPL_ZOOMED_SCATTER_CHART = "core-zoomed-scatter-chart-template";
        this.TMPL_ZOOMED_SCATTER_CHART_CONTROL_PANEL_LEGEND = "core-zoomed-scatter-chart-control-panel-legend-template";
        this.TMPL_WIDGET_VIEW = "core-widget-view-template";
        this.TMPL_LOADING_SPINNER = "core-loading-spinner-template";
        this.TMPL_NOT_FOUND_MESSAGE = "core-not-found-message-template";
        this.TMPL_INFOBOXES_VIEW = "core-infobox-template";

        this.TMPL_NODE_DETAIL_SPARKLINE_BOX = 'node-details-sparkline-template';
        this.TMPL_NODE_DETAIL_INFOBOXES_BOX = 'node-details-infoboxes-template';
        //Top boxes in Monitor > Infra > Dashboard that show the summary count of
        //each node type
        this.TMPL_INFOBOX = "infobox-summary-template";
        //Boxes in vRouter Tab of "Monitor > Infra > Dashboard" that shows bar chart
        //along with total count and title
        this.TMPL_CHARTINFO = "barchart-info-template";
        this.TMPL_DASHBOARD_STATS = "dashboard-stats";
        this.TMPL_INFRA_DASHBOARD = "mon-infra-dashboard";
        this.DASHBOARD_ALERTS_GRID_SECTION_ID = "infra-dashboard-alerts-section";
        this.DASHBOARD_ALERTS_GRID_ID = "infra-dashboard-alerts-grid";
        this.DASHBOARD_ALERTS_GRID_TITLE = "Alerts";

        this.NODE_DETAILS_CHARTS = 'mon-infra-node-details-chart';

        this.TMPL_ELEMENT_TOOLTIP = "element-tooltip-template";
        this.TMPL_UNDERLAY_ELEMENT_TOOLTIP = "element-underlay-tooltip-template";
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
        this.TAB_THEME_WIDGET_CLASSIC = "widget-classic";

        this.DATA_REQUEST_STATE_FETCHING = 'fetching';
        this.DATA_REQUEST_STATE_ERROR = 'error';
        this.DATA_REQUEST_STATE_SUCCESS_EMPTY = 'success-empty';
        this.DATA_REQUEST_STATE_SUCCESS_NOT_EMPTY = 'success-not-empty';

        // QE Constants - Start
        this.QE_TIMEOUT = 12000;
        this.QE_RESULT_CHUNK_SIZE_10K = 10000;
        this.QE_RESULT_CHUNK_SIZE_1K = 1000;
        this.QE_MODAL_CLASS_700 = 'modal-700';
        this.QE_DEFAULT_MODAL_CLASSNAME = 'modal-840';
        this.QE_FLOW_TABLE_TYPE = "FLOW";
        this.QE_OBJECT_TABLE_TYPE = "OBJECT";
        this.QE_STAT_TABLE_TYPE = "STAT";
        this.QE_LOG_TABLE_TYPE = "LOG";
        this.QE_HASH_ELEMENT_PREFIX = "#qe-";
        this.QE_FORM_SUFFIX = "-form";
        this.QE_TEXT_SUFFIX = "-text-";
        this.QE_RESULTS_SUFFIX = "-results";
        this.QE_QUEUE_GRID_SUFFIX = "-queue-grid";
        this.QE_QUEUE_RESULT_SUFFIX = "-queue-result";

        this.QE_LOG_LEVELS = [
            { value: "0", name: "SYS_EMERG" },
            { value: "1", name: "SYS_ALERT" },
            { value: "2", name: "SYS_CRIT" },
            { value: "3", name: "SYS_ERR" },
            { value: "4", name: "SYS_WARN" },
            { value: "5", name: "SYS_NOTICE" },
            { value: "6", name: "SYS_INFO" },
            { value: "7", name: "SYS_DEBUG" }
        ],

        this.QE_SORT_ORDER_DROPDOWN_VALUES = [
            {'id' : 'asc', 'text' : 'ASC'},
            {'id' : 'desc', 'text' : 'DESC'}
        ];

        this.QE_DEFAULT_LIMIT_150K = "150000";
        this.QE_DEFAULT_LIMIT_50K = "50000";

        this.QE_DEFAULT_SORT_ORDER = "asc";
        this.QE_TITLE_SORT_ORDER = "Sort Order";
        this.QE_TITLE_SORT_BY = "Sort By";

        this.QE_FLOW_QUERY_QUEUE = "fqq";
        this.QE_LOG_QUERY_QUEUE = "lqq";
        this.QE_STAT_QUERY_QUEUE = "sqq";

        this.FS_QUERY_PREFIX = "fs";
        this.FC_QUERY_PREFIX = "fc";
        this.FR_QUERY_PREFIX = "fr";
        this.STAT_QUERY_PREFIX = "stat";
        this.OBJECT_LOGS_PREFIX = "ol";
        this.SYSTEM_LOGS_PREFIX = "sl";

        this.FS_HASH_P = 'query_flow_series';
        this.FR_HASH_P = 'query_flow_record';
        this.SL_HASH_P = 'query_log_system';
        this.OL_HASH_P = 'query_log_object';
        this.STAT_HASH_P = 'query_stat_query';

        this.CONSOLE_LOGS_PREFIX = "cl";

        this.DEFAULT_QUERY_PREFIX = 'query';

        this.QUERY_TYPE_MODIFY = 'modify';
        this.QUERY_TYPE_RERUN = 'rerun';

        this.FLOW_SERIES_TABLE = "FlowSeriesTable";
        this.FLOW_RECORD_TABLE = "FlowRecordTable";
        this.FLOW_CLASS = "FlowClass";
        this.MESSAGE_TABLE = "MessageTable";

        this.KEY_RUN_QUERY_VALIDATION = 'runQueryValidation';

        this.TIMERANGE_DROPDOWN_VALUES = [
            {'id': 600, 'text': 'Last 10 Mins'},
            {'id': 1800, 'text': 'Last 30 Mins'},
            {'id': 3600, 'text': 'Last 1 Hr'},
            {'id': 21600, 'text': 'Last 6 Hrs'},
            {'id': 43200, 'text': 'Last 12 Hrs'},
            {'id': -1, 'text': 'Custom'}
        ];

        this.CONSOLE_LOGS_LIMITS =  [
            {id: "All", text: "All" },
            {id: "10", text: "10 Messages" },
            {id: "50", text: "50 Messages" },
            {id: "100", text: "100 Messages" },
            {id: "200", text: "200 Messages" },
            {id: "500", text: "500 Messages" },
        ];

        this.DIRECTION_DROPDOWN_VALUES = [
            {'id': '1', 'text': 'INGRESS'},
            {'id': '0', 'text': 'EGRESS'}
        ];

        this.TIME_GRANULARITY_INTERVAL_VALUES = {
            secs: 1000,
            mins: 60 * 1000,
            hrs: 60 * 60 * 1000,
            days: 24 * 60 * 60 * 1000
        };

        this.OPERATOR_CODES = {
            1: '=',
            2: '!=',
            5: '<=',
            6: '>=',
            7: 'Starts with',
            8: 'RegEx='
        };

        this.URL_TABLES = "/api/qe/tables";
        this.URL_PREFIX_TABLE_SCHEMA = "/api/qe/table/schema/";

        this.TENANT_API_URL = "/api/tenant/get-data";

        this.URL_QUERY_FLOW_QUEUE = '#p=query_flow_queue';
        this.URL_QUERY_LOG_QUEUE = '#p=query_log_queue';
        this.URL_QUERY_STAT_QUEUE = '#p=query_stat_queue';

        this.UMID_QUERY_RESULT_CHART_MODEL = "qe:query-result-chart-model";
        this.UMID_QUERY_RESULT_LINE_CHART_MODEL = "qe:query-result-line-chart-model";
        this.UMID_QUERY_RESULT_LIST_MODEL = "qe:query-result-list-model";

        this.MAP_Y_FORMATTER = {
            "sum(bytes)": "bytes",
            "SUM(cpu_info.mem_virt)": "bytes"
        };

        this.DEFAULT_FR_SELECT_FIELDS = "vrouter, sourcevn, sourceip, destvn, destip, protocol, sport, dport, setup_time, teardown_time, agg-packets, agg-bytes, action";
        this.DEFAULT_FS_SELECT_FIELDS = "vrouter, sourcevn, sourceip, destvn, destip, protocol, sport, dport, T=, sum(packets), sum(bytes)";
        this.DEFAULT_SL_SELECT_FIELDS = "MessageTS, Source, ModuleId, Category, Level, NodeType, Messagetype, Xmlmessage";

        this.D3_COLOR_CATEGORY2 = [ "#1f77b4", "#2ca02c"];
        this.D3_COLOR_CATEGORY5 = [ '#1f77b4', '#6baed6' , '#ff7f0e', '#2ca02c', '#9e9ac8'];
        this.D3_COLOR_CATEGORY7 = [ '#1f77b4' , '#ff7f0e', '#2ca02c', '#a55194', '#9e9ac8', '#6baed6', '#bcbd22'];

        // QE Constants - End

        //Alarm constants
        this.URL_ALARM_DETAILS_IN_CHUNKS =
            '/api/tenant/monitoring/alarms?count={0}&startAt={1}';

        this.get = function () {
            var args = arguments;
            return cowu.getValueFromTemplate(args);
        };
    };
    return CoreConstants;
});

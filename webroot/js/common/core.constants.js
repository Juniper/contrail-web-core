/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var CoreConstants = function () {
        var self = this;

        this.THROTTLE_RESIZE_EVENT_TIME = 500;
        this.TMPL_SUFFIX_ID = "-template";
        this.RESULTS_SUFFIX_ID = "-results";
        this.ERROR_SUFFIX_ID = "_error";
        this.LOCKED_SUFFIX_ID = "_locked";
        this.FORM_SUFFIX_ID = "_form";
        this.JSON_SUFFIX_ID = "_json";

        this.SEV_LEVELS = {
            ERROR   : 3, //Red
            WARNING : 4, //Orange
//          NOTICE  : 2, //Blue
//          INFO    : 3, //Green
        };
        this.SEVERITY_TO_TEXT_MAP = {
           0 : "Critical",
           1 : "Major",
           2 : "Minor"
        };
        this.COLOR_SEVERITY_MAP = {
            red : 'error',
            orange : 'warning',
            blue : 'default',
            green : 'okay'
        };
        this.SEV_TO_COLOR_MAP = {
            0 : 'red',
            1 : 'red',
            2 : 'orange'
        };
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

        this.TYPE_NUMBER = 'number';
        this.TYPE_INTEGER = 'integer';
        this.TYPE_BOOLEAN = 'boolean';

        this.KEY_VALIDATION = 'validation';
        this.OBJECT_TYPE_COLLECTION = 'collection';
        this.OBJECT_TYPE_MODEL = 'model';
        this.OBJECT_TYPE_COLLECTION_OF_COLLECTION = "collection_of_collection";

        this.ID_JSON_EDITOR = "json-editor";
        this.JSON_EDITOR_MODE_TREE = "tree";
        this.JSON_EDITOR_MODE_CODE = "code";
        this.JSON_EDITOR_MODE_FORM = "form";
        this.JSON_EDITOR_MODE_TEXT = "text";

        this.TMPL_2ROW_CONTENT_VIEW = "core-2-row-content-template";
        this.TMPL_2COLUMN_1ROW_2ROW_CONTENT_VIEW = "core-2-column-1-row-2row-content-template";
        //anlytics node template
        //core-2-row-4-column-template
        this.TMPL_4COLUMN__2ROW_CONTENT_VIEW = "core-2-row-4-column-template";
        this.TMPL_1COLUMN__1ROW_CONTENT_VIEW = "core-1-row-1-column-template";

        this.TMPL_ACCORDIAN_VIEW = "core-accordian-view-template";
        this.TMPL_JSON_EDITOR_VIEW = "core-json-editor-view-template";
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
        this.TMPL_CHECKBOX_LABEL_RIGHT_VIEW = "core-checkbox-label-right-view-template";
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
        this.TMPL_GRID_GROUP_DELETE_MODAL_BODY = "core-grid-group-delete-modal-body-template";

        this.TMPL_COLLECTION_VIEW = "core-collection-view-template";
        this.TMPL_GEN_COLLECTION_VIEW = "core-generic-collection-view-template";
        this.TMPL_COLLECTION_COMMON_HEADING_VIEW="core-collection-common-heading-view-template";
        this.TMPL_QUERY_OR_COLLECTION_VIEW = "query-or-collection-view-template";
        this.TMPL_COLLECTION_HEADING_VIEW = "core-collection-view-heading-template";
        this.TMPL_COLLECTION_GRIDACTION_HEADING_VIEW = "core-collection-view-grid-action-heading-template";
        this.TMPL_SECTION_VIEW = "core-section-view-template";
        this.TMPL_EDIT_FORM = "core-edit-form-template";
        this.TMPL_EDIT_JSON = "core-edit-json-template";
        this.TMPL_GENERIC_EDIT_FORM = "core-generic-edit-form-template";
        this.TMPL_2ROW_GROUP_DETAIL = "core-grid-2-row-group-detail-template";
        // this.TMPL_DETAIL_PAGE = "core-detail-page-template";
        // this.TMPL_DETAIL_PAGE_ACTION = "core-detail-page-action-template";
        this.TMPL_WIZARD_VIEW = "core-wizard-view-template";
        this.TMPL_NETWORKING_GRAPH_VIEW = "core-networking-graph-template";
        this.TMPL_CONTROL_PANEL = "core-control-panel-template";
        this.TMPL_CONTROL_PANEL_FILTER = "core-control-panel-filter-template";
        this.TMPL_CONTROL_PANEL_FILTER_2_COL = "core-control-panel-filter-2-col-template";
        this.TMPL_TABS_VIEW = "core-tabs-template";
        this.TMPL_TAB_LINK_VIEW = "core-tabs-link-template";
        this.TMPL_TAB_MENU_VIEW = "core-tabs-menu-template";
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
        /* Color Settings - Begin */
        this.TMPL_SETTINGS_COLOR_VIEW = "core-settings-color-template";
        this.TMPL_SETTINGS_COLOR_MORE = "core-settings-color-more-template";
        this.SETTINGS_COLOR_MODAL_ID = 'settings-color';
        this.SETTINGS_COLOR_PREFIX_ID = 'cs';
        this.COOKIE_COLOR_SCHEME = "color_scheme";
        this.COOKIE_CHART_SETTINGS = "chartData";
        this.NUM_OF_COLORS = "6";
        /* Color Settings - End */

        //stacked bar chart
        this.TMPL_CUSTOM_CHART_LEGEND = 'custom-chart-legend';

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

        this.GRAPH_MARGIN_LEFT = 4000;
        this.GRAPH_MARGIN_RIGHT = 4000;
        this.GRAPH_MARGIN_TOP = 4000;
        this.GRAPH_MARGIN_BOTTOM = 4000;

        this.VIEW_FORM_DROPDOWN_VIEW = "FormDropdownView";
        this.VIEW_SECTION_VIEW = "SectionView";
        this.VIEW_FORM_EDITABLE_GRID_VIEW = "FormEditableGridView";
        this.VIEW_FORM_INPUT_VIEW = "FormInputView";

        this.TOOLTIP_DELAY = 1000;

        this.DEFAULT_CONFIG_ELEMENT_TOOLTIP = {
            dimension: {
                width: 275
            },
            delay: this.TOOLTIP_DELAY
        };

        this.DEFAULT_CONFIG_NOT_FOUND_PAGE = {
            title: 'Page not found.',
            iconClass: 'fa fa-exclamation-triangle',
            defaultNavLinks: false
        };

        this.DEFAULT_CONFIG_ERROR_PAGE = {
            title: "Error in getting data.",
            iconClass: 'fa fa-exclamation-triangle',
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
        this.DATA_REQUEST_STATE_INITIAL_EMPTY = 'inital-empty';

        //Toolbar Constants
        this.COLOR_PALETTE = 'color_palette';
        this.CHART_SETTINGS = 'chart_settings';
        this.COLOR_PALETTE_CLASS = 'contrailGlyph-palette';
        this.CHART_SETTINGS_CLASS = 'fa-bar-chart-o';
        this.SETTINGS_MODAL_ID = 'settings_modal';
        this.SETTINGS_PREFIX_ID = 'toolbar_settings';

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

        this.SELECT_FIELDS_GROUPS = ["Time Range", "Non Aggregate", "Sum", "Avg", "Count", "Min", "Max", "Percentiles"];
        this.DEFAULT_FS_SELECT_FIELDS = "T=, vrouter, sourcevn, sourceip, destvn, destip, protocol, sport, dport, sum(packets), sum(bytes)";
        this.DEFAULT_FR_SELECT_FIELDS = "vrouter, sourcevn, sourceip, destvn, destip, protocol, sport, dport, setup_time, agg-packets, agg-bytes, action";
        this.DEFAULT_SL_SELECT_FIELDS = "MessageTS, Source, ModuleId, Category, Level, NodeType, Messagetype, Xmlmessage";

        this.QE_DEFAULT_FILTER = "limit: 150000 & sort_fields:  & sort: asc";

        this.QE_DEFAULT_SORT_ORDER = "asc";
        this.QE_TITLE_SORT_ORDER = "Sort Order";
        this.QE_TITLE_SORT_BY = "Sort By";

        this.QE_FLOW_QUERY_QUEUE = "fqq";
        this.QE_LOG_QUERY_QUEUE = "lqq";
        this.QE_STAT_QUERY_QUEUE = "sqq";

        this.FS_QUERY_PREFIX = "fs";
        this.FC_QUERY_PREFIX = "fc";
        this.FR_QUERY_PREFIX = "fr";
        this.SA_QUERY_PREFIX = "sa";
        this.STAT_QUERY_PREFIX = "stat";
        this.OBJECT_LOGS_PREFIX = "ol";
        this.SYSTEM_LOGS_PREFIX = "sl";

        this.TABLE_TYPES = [
            this.QE_STAT_TABLE_TYPE,
            this.QE_FLOW_TABLE_TYPE,
            this.QE_OBJECT_TABLE_TYPE,
            this.QE_LOG_TABLE_TYPE
        ];

        this.FS_HASH_P = 'query_flow_series';
        this.FR_HASH_P = 'query_flow_record';
        this.SL_HASH_P = 'query_log_system';
        this.OL_HASH_P = 'query_log_object';
        this.STAT_HASH_P = 'query_stat_query';

        this.CONSOLE_LOGS_PREFIX = "cl";

        this.DEFAULT_QUERY_PREFIX = 'query';

        this.QUERY_TYPE_MODIFY = 'modify';
        this.QUERY_TYPE_RERUN = 'rerun';
        this.QUERY_TYPE_ANALYZE = 'analyze';

        this.FLOW_SERIES_TABLE = "FlowSeriesTable";
        this.FLOW_RECORD_TABLE = "FlowRecordTable";
        this.FLOW_CLASS = "FlowClass";
        this.MESSAGE_TABLE = "MessageTable";
        this.SESSION_ANALYZER_TABLE = "SessionAnalyzerTable";

        this.KEY_RUN_QUERY_VALIDATION = 'runQueryValidation';

        this.TIMERANGE_DROPDOWN_VALUES = [
            {'id': 600, 'text': 'Last 10 Mins'},
            {'id': 1800, 'text': 'Last 30 Mins'},
            {'id': 3600, 'text': 'Last 1 Hr'},
            {'id': 21600, 'text': 'Last 6 Hrs'},
            {'id': 43200, 'text': 'Last 12 Hrs'},
            {'id': -1, 'text': 'Custom'}
        ];

        this.TIMERANGE_DROPDOWN_VALUES_WO_CUSTOM = [
            {'id': 600, 'text': 'Last 10 Mins'},
            {'id': 1800, 'text': 'Last 30 Mins'},
            {'id': 3600, 'text': 'Last 1 Hr'},
            {'id': 21600, 'text': 'Last 6 Hrs'},
            {'id': 43200, 'text': 'Last 12 Hrs'}
        ];

        this.CONSOLE_LOGS_LIMITS =  [
            {id: "All", text: "All" },
            {id: "10", text: "10 Messages" },
            {id: "50", text: "50 Messages" },
            {id: "100", text: "100 Messages" },
            {id: "200", text: "200 Messages" },
            {id: "500", text: "500 Messages" }
        ];

        this.DIRECTION_DROPDOWN_VALUES = [
            {'id': '1', 'text': 'INGRESS'},
            {'id': '0', 'text': 'EGRESS'}
        ];

        this.INFERRED_UNIT_TYPES = [
            {"id": "temperature", "text": "Temperature"},
            {"id": "rotationSpeed", "text": "Rotation Speed"}
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

        this.QE_FS_DEFAULT_MODEL_CONFIG = {
            table_name: self.FLOW_SERIES_TABLE,
            table_type: self.QE_FLOW_TABLE_TYPE,
            query_prefix: self.FS_QUERY_PREFIX,
            select: self.DEFAULT_FS_SELECT_FIELDS,
        };

        this.QE_FR_DEFAULT_MODEL_CONFIG = {
            table_name: self.FLOW_RECORD_TABLE,
            table_type: self.QE_FLOW_TABLE_TYPE,
            query_prefix: self.FR_QUERY_PREFIX,
            select: self.DEFAULT_FR_SELECT_FIELDS,
        };

        this.QE_SL_DEFAULT_MODEL_CONFIG = {
            table_name: self.MESSAGE_TABLE,
            table_type: self.QE_LOG_TABLE_TYPE,
            query_prefix: self.SYSTEM_LOGS_PREFIX,
            keywords: "",
            log_level: "7",
            limit: self.QE_DEFAULT_LIMIT_50K,
            select: self.DEFAULT_SL_SELECT_FIELDS,
        };

        this.QE_OL_DEFAULT_MODEL_CONFIG = {
            table_type: self.QE_OBJECT_TABLE_TYPE,
            query_prefix: self.OBJECT_LOGS_PREFIX,
            limit: self.QE_DEFAULT_LIMIT_50K,
        };

        this.QE_STAT_DEFAULT_MODEL_CONFIG = {
            table_type: self.QE_STAT_TABLE_TYPE,
            query_prefix: self.STAT_QUERY_PREFIX,
        };

        this.BYTE_PREFIX = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        this.URL_QE_QUERY = '/api/qe/query';
        this.URL_TABLES = "/api/qe/tables";
        this.URL_PREFIX_TABLE_SCHEMA = "/api/qe/table/schema/";

        this.TENANT_API_URL = "/api/tenant/get-data";

        this.URL_QUERY_FLOW_QUEUE = '#p=query_flow_queue';
        this.URL_QUERY_LOG_QUEUE = '#p=query_log_queue';
        this.URL_QUERY_STAT_QUEUE = '#p=query_stat_queue';

        this.UMID_QUERY_RESULT_CHART_MODEL = "qe:query-result-chart-model";
        this.UMID_QUERY_RESULT_LINE_CHART_MODEL = "qe:query-result-line-chart-model";
        this.UMID_QUERY_RESULT_LIST_MODEL = "qe:query-result-list-model";

        this.SESSION_ANALYZER_KEY = "summary";
        this.SESSION_ANALYZER_INGRESS_KEY = "ingress";
        this.SESSION_ANALYZER_REVERSE_INGRESS_KEY = "reverse_ingress";
        this.SESSION_ANALYZER_EGRESS_KEY = "egress";
        this.SESSION_ANALYZER_REVERSE_EGRESS_KEY = "reverse_egress";

        this.UMID_SA_SUMMARY_MODEL = "qe:sa:" + this.SESSION_ANALYZER_KEY + "-model";
        this.UMID_SA_SUMMARY_LIST_MODEL = "qe:sa:" + this.SESSION_ANALYZER_KEY + "-list-model";
        this.UMID_SA_INGRESS_LIST_MODEL = "qe:sa:" + this.SESSION_ANALYZER_INGRESS_KEY + "-list-model";
        this.UMID_SA_EGRESS_LIST_MODEL = "qe:sa:" + this.SESSION_ANALYZER_EGRESS_KEY + "-list-model";
        this.UMID_SA_REVERSE_INGRESS_LIST_MODEL = "qe:sa:" + this.SESSION_ANALYZER_REVERSE_INGRESS_KEY + "-list-model";
        this.UMID_SA_REVERSE_EGRESS_LIST_MODEL = "qe:sa:" + this.SESSION_ANALYZER_REVERSE_EGRESS_KEY + "-list-model";
        this.UMID_SA_SUMMARY_LINE_CHART_MODEL = "qe:sa:" + this.SESSION_ANALYZER_KEY + "-line-chart-model";

        this.SESSION_ANALYZER_CHART_DATA_KEY = ["ingress", "egress", "reverse_ingress", "reverse_egress"];

        //order of the key matters. should match with the above chart data key.
        this.MAP_SESSION_ANALYZER_DATA_KEY = {
            summary: {
                label: "Summary"
            },
            ingress: {
                label: "Ingress",
                query: {
                    type: 'ingress',
                    reverse : false
                }
            },
            egress: {
                label: "Egress",
                query: {
                    type: 'egress',
                    reverse : false
                }
            },
            reverse_ingress: {
                label: "Reverse Ingress",
                query: {
                    type: 'ingress',
                    reverse : true
                }
            },
            reverse_egress: {
                label: "Reverse Egress",
                query: {
                    type: 'egress',
                    reverse : true
                }
            }
        };

        this.QUERY_COLUMN_FORMATTER = {
            "T": "micro-date",
            "T=": "micro-date",
            "MessageTS": "micro-date",
            "setup_time": "micro-date",
            "protocol": "protocol",
            "direction_ing": "query-direction",

            "bytes": "byte",
            "sum(bytes)": "byte",
            "packets": "number",
            "sum(packets)": "number",
            "flow_count": "number",

            "agg-bytes": "byte",
            "agg-packets": "number",

            // cpu_info
            "COUNT(cpu_info)": "number",

            // "cpu_info.inst_id": "",
            // "cpu_info.module_id": "",

            "cpu_info.mem_virt": "kilo-byte",
            "AVG(cpu_info.mem_virt)": "kilo-byte",
            "SUM(cpu_info.mem_virt)": "kilo-byte",
            "MAX(cpu_info.mem_virt)": "kilo-byte",
            "MIN(cpu_info.mem_virt)": "kilo-byte",

            "cpu_info.mem_res": "kilo-byte",
            "AVG(cpu_info.mem_res)": "kilo-byte",
            "SUM(cpu_info.mem_res)": "kilo-byte",
            "MAX(cpu_info.mem_res)": "kilo-byte",
            "MIN(cpu_info.mem_res)": "kilo-byte",

            "cpu_info.used_sys_mem": "kilo-byte",
            "AVG(cpu_info.used_sys_mem)": "kilo-byte",
            "SUM(cpu_info.used_sys_mem)": "kilo-byte",
            "MAX(cpu_info.used_sys_mem)": "kilo-byte",
            "MIN(cpu_info.used_sys_mem)": "kilo-byte",

            "cpu_info.cpu_share": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "AVG(cpu_info.cpu_share)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "SUM(cpu_info.cpu_share)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "MAX(cpu_info.cpu_share)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "MIN(cpu_info.cpu_share)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],


            "cpu_info.one_min_cpuload": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "AVG(cpu_info.one_min_cpuload)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "SUM(cpu_info.one_min_cpuload)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "MAX(cpu_info.one_min_cpuload)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "MIN(cpu_info.one_min_cpuload)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],

            // cpu_stats
            "COUNT(cpu_stats)": "number",

            "cpu_stats.rss": "byte",
            "SUM(cpu_stats.rss)": "byte",
            "MAX(cpu_stats.rss)": "byte",
            "MIN(cpu_stats.rss)": "byte",
            "AVG(cpu_stats.rss)": "byte",

            "cpu_stats.cpu_one_min_avg": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "AVG(cpu_stats.cpu_one_min_avg)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "SUM(cpu_stats.cpu_one_min_avg)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "MAX(cpu_stats.cpu_one_min_avg)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "MIN(cpu_stats.cpu_one_min_avg)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],

            "cpu_stats.vm_memory_quota": "byte",
            "AVG(cpu_stats.vm_memory_quota)": "byte",
            "SUM(cpu_stats.vm_memory_quota)": "byte",
            "MAX(cpu_stats.vm_memory_quota)": "byte",
            "MIN(cpu_stats.vm_memory_quota)": "byte",

            "cpu_stats.virt_memory": "byte",
            "AVG(cpu_stats.virt_memory)": "byte",
            "SUM(cpu_stats.virt_memory)": "byte",
            "MAX(cpu_stats.virt_memory)": "byte",
            "MIN(cpu_stats.virt_memory)": "byte",

            "cpu_stats.peak_virt_memory": "byte",
            "AVG(cpu_stats.peak_virt_memory)": "byte",
            "SUM(cpu_stats.peak_virt_memory)": "byte",
            "MAX(cpu_stats.peak_virt_memory)": "byte",
            "MIN(cpu_stats.peak_virt_memory)": "byte",

            "cpu_stats.disk_allocated_bytes": "byte",
            "AVG(cpu_stats.disk_allocated_bytes)": "byte",
            "SUM(cpu_stats.disk_allocated_bytes)": "byte",
            "MAX(cpu_stats.disk_allocated_bytes)": "byte",
            "MIN(cpu_stats.disk_allocated_bytes)": "byte",

            "cpu_stats.disk_used_bytes": "byte",
            "AVG(cpu_stats.disk_used_bytes)": "byte",
            "SUM(cpu_stats.disk_used_bytes)": "byte",
            "MAX(cpu_stats.disk_used_bytes)": "byte",
            "MIN(cpu_stats.disk_used_bytes)": "byte",

            // system mem/cpu
            "COUNT(system_mem_cpu_usage)": "number",

            "system_mem_cpu_usage.mem_info.total": "byte",
            "SUM(system_mem_cpu_usage.mem_info.total)": "byte",
            "MAX(system_mem_cpu_usage.mem_info.total)": "byte",
            "MIN(system_mem_cpu_usage.mem_info.total)": "byte",
            "AVG(system_mem_cpu_usage.mem_info.total)": "byte",

            "system_mem_cpu_usage.mem_info.used": "byte",
            "SUM(system_mem_cpu_usage.mem_info.used)": "byte",
            "MAX(system_mem_cpu_usage.mem_info.used)": "byte",
            "MIN(system_mem_cpu_usage.mem_info.used)": "byte",
            "AVG(system_mem_cpu_usage.mem_info.used)": "byte",

            "system_mem_cpu_usage.mem_info.free": "byte",
            "SUM(system_mem_cpu_usage.mem_info.free)": "byte",
            "MAX(system_mem_cpu_usage.mem_info.free)": "byte",
            "MIN(system_mem_cpu_usage.mem_info.free)": "byte",
            "AVG(system_mem_cpu_usage.mem_info.free)": "byte",

            "system_mem_cpu_usage.mem_info.buffers": "byte",
            "SUM(system_mem_cpu_usage.mem_info.buffers)": "byte",
            "MAX(system_mem_cpu_usage.mem_info.buffers)": "byte",
            "MIN(system_mem_cpu_usage.mem_info.buffers)": "byte",
            "AVG(system_mem_cpu_usage.mem_info.buffers)": "byte",

            "system_mem_cpu_usage.mem_info.cached": "byte",
            "SUM(system_mem_cpu_usage.mem_info.cached)": "byte",
            "MAX(system_mem_cpu_usage.mem_info.cached)": "byte",
            "MIN(system_mem_cpu_usage.mem_info.cached)": "byte",
            "AVG(system_mem_cpu_usage.mem_info.cached)": "byte",

            "system_mem_cpu_usage.cpu_load.one_min_avg": "byte",
            "SUM(system_mem_cpu_usage.cpu_load.one_min_avg)": "byte",
            "MAX(system_mem_cpu_usage.cpu_load.one_min_avg)": "byte",
            "MIN(system_mem_cpu_usage.cpu_load.one_min_avg)": "byte",
            "AVG(system_mem_cpu_usage.cpu_load.one_min_avg)": "byte",

            "system_mem_cpu_usage.cpu_load.five_min_avg": "byte",
            "SUM(system_mem_cpu_usage.cpu_load.five_min_avg)": "byte",
            "MAX(system_mem_cpu_usage.cpu_load.five_min_avg)": "byte",
            "MIN(system_mem_cpu_usage.cpu_load.five_min_avg)": "byte",
            "AVG(system_mem_cpu_usage.cpu_load.five_min_avg)": "byte",

            "system_mem_cpu_usage.cpu_load.fifteen_min_avg": "byte",
            "SUM(system_mem_cpu_usage.cpu_load.fifteen_min_avg)": "byte",
            "MAX(system_mem_cpu_usage.cpu_load.fifteen_min_avg)": "byte",
            "MIN(system_mem_cpu_usage.cpu_load.fifteen_min_avg)": "byte",
            "AVG(system_mem_cpu_usage.cpu_load.fifteen_min_avg)": "byte",

            "system_mem_cpu_usage.cpu_share": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "SUM(system_mem_cpu_usage.cpu_share)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "MAX(system_mem_cpu_usage.cpu_share)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "MIN(system_mem_cpu_usage.cpu_share)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "AVG(system_mem_cpu_usage.cpu_share)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],

            // process mem/cpu
            "COUNT(process_mem_cpu_usage)": "number",

            "process_mem_cpu_usage.__key": "number",

            "process_mem_cpu_usage.mem_virt": "byte",
            "SUM(process_mem_cpu_usage.mem_virt)": "byte",
            "MAX(process_mem_cpu_usage.mem_virt)": "byte",
            "MIN(process_mem_cpu_usage.mem_virt)": "byte",
            "AVG(process_mem_cpu_usage.mem_virt)": "byte",

            "process_mem_cpu_usage.cpu_share": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "SUM(process_mem_cpu_usage.cpu_share)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "MAX(process_mem_cpu_usage.cpu_share)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "MIN(process_mem_cpu_usage.cpu_share)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "AVG(process_mem_cpu_usage.cpu_share)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],

            "process_mem_cpu_usage.mem_res": "byte",
            "SUM(process_mem_cpu_usage.mem_res)": "byte",
            "MAX(process_mem_cpu_usage.mem_res)": "byte",
            "MIN(process_mem_cpu_usage.mem_res)": "byte",
            "AVG(process_mem_cpu_usage.mem_res)": "byte",

            // msg_info
            "COUNT(msg_info)": "number",

            "msg_info.bytes": "byte",
            "AVG(msg_info.bytes)": "byte",
            "SUM(msg_info.bytes)": "byte",
            "MAX(msg_info.bytes)": "byte",
            "MIN(msg_info.bytes)": "byte",

            "msg_info.messages": "number",
            "AVG(msg_info.messages)": "number",
            "SUM(msg_info.messages)": "number",
            "MAX(msg_info.messages)": "number",
            "MIN(msg_info.messages)": "number",

            // vn_stats
            "COUNT(vn_stats)": "number",

            // "vn_stats.other_vn": "",
            // "vn_stats.vrouter": "",

            "vn_stats.in_bytes": "byte",
            "SUM(vn_stats.in_bytes)": "byte",
            "MAX(vn_stats.in_bytes)": "byte",
            "MIN(vn_stats.in_bytes)": "byte",
            "AVG(vn_stats.in_bytes)": "byte",

            "vn_stats.out_bytes": "byte",
            "SUM(vn_stats.out_bytes)": "byte",
            "MAX(vn_stats.out_bytes)": "byte",
            "MIN(vn_stats.out_bytes)": "byte",
            "AVG(vn_stats.out_bytes)": "byte",

            "vn_stats.in_tpkts": "number",
            "SUM(vn_stats.in_tpkts)": "number",
            "MAX(vn_stats.in_tpkts)": "number",
            "MIN(vn_stats.in_tpkts)": "number",
            "AVG(vn_stats.in_tpkts)": "number",

            "vn_stats.out_tpkts": "number",
            "SUM(vn_stats.out_tpkts)": "number",
            "MAX(vn_stats.out_tpkts)": "number",
            "MIN(vn_stats.out_tpkts)": "number",
            "AVG(vn_stats.out_tpkts)": "number",

            // tx_socket_stats
            "tx_socket_stats.bytes": "byte",
            "SUM(tx_socket_stats.bytes)": "byte",
            "MAX(tx_socket_stats.bytes)": "byte",
            "MIN(tx_socket_stats.bytes)": "byte",

            "tx_socket_stats.average_bytes": "byte",
            "SUM(tx_socket_stats.average_bytes)": "byte",
            "MAX(tx_socket_stats.average_bytes)": "byte",
            "MIN(tx_socket_stats.average_bytes)": "byte",

            // rx_socket_stats
            "rx_socket_stats.bytes": "byte",
            "SUM(rx_socket_stats.bytes)": "byte",
            "MAX(rx_socket_stats.bytes)": "byte",
            "MIN(rx_socket_stats.bytes)": "byte",

            "rx_socket_stats.average_bytes": "byte",
            "SUM(rx_socket_stats.average_bytes)": "byte",
            "MAX(rx_socket_stats.average_bytes)": "byte",
            "MIN(rx_socket_stats.average_bytes)": "byte",

            //counters
            "counters": "number",
            "COUNT(counters)": "number",

            "counters.keys": "number",
            "SUM(counters.keys)": "number",
            "MAX(counters.keys)": "number",
            "MIN(counters.keys)": "number",
            "AVG(counters.keys)": "number",

            "updates": "number",
            "counters.updates": "number",
            "SUM(counters.updates)": "number",
            "MAX(counters.updates)": "number",
            "MIN(counters.updates)": "number",
            "AVG(counters.updates)": "number",

            "partitions": "number",
            "counters.partitions": "number",
            "SUM(counters.partitions)": "number",
            "MAX(counters.partitions)": "number",
            "MIN(counters.partitions)": "number",
            "AVG(counters.partitions)": "number",

            "counters.instance": "number",

            // cql
            "COUNT(cql_stats)": "number",

            "cql_stats.requests_one_minute_rate": "number",
            "SUM(cql_stats.requests_one_minute_rate)": "number",
            "MAX(cql_stats.requests_one_minute_rate)": "number",
            "MIN(cql_stats.requests_one_minute_rate)": "number",
            "AVG(cql_stats.requests_one_minute_rate)": "number",

            // cql errors
            "COUNT(cql_stats.errors)": "number",

            "cql_stats.errors.connection_timeouts": "number",
            "SUM(cql_stats.errors.connection_timeouts)": "number",
            "MAX(cql_stats.errors.connection_timeouts)": "number",
            "MIN(cql_stats.errors.connection_timeouts)": "number",
            "AVG(cql_stats.errors.connection_timeouts)": "number",

            "cql_stats.errors.pending_request_timeouts": "number",
            "SUM(cql_stats.errors.pending_request_timeouts)": "number",
            "MAX(cql_stats.errors.pending_request_timeouts)": "number",
            "MIN(cql_stats.errors.pending_request_timeouts)": "number",
            "AVG(cql_stats.errors.pending_request_timeouts)": "number",

            "cql_stats.errors.request_timeouts": "number",
            "SUM(cql_stats.errors.request_timeouts)": "number",
            "MAX(cql_stats.errors.request_timeouts)": "number",
            "MIN(cql_stats.errors.request_timeouts)": "number",
            "AVG(cql_stats.errors.request_timeouts)": "number",

            //cql stats
            "cql_stats.stats": "number",
            "COUNT(cql_stats.stats)": "number",

            "cql_stats.stats.total_connections": "number",
            "SUM(cql_stats.stats.total_connections)": "number",
            "MAX(cql_stats.stats.total_connections)": "number",
            "MIN(cql_stats.stats.total_connections)": "number",
            "AVG(cql_stats.stats.total_connections)": "number",

            "cql_stats.stats.available_connections": "number",
            "SUM(cql_stats.stats.available_connections)": "number",
            "MAX(cql_stats.stats.available_connections)": "number",
            "MIN(cql_stats.stats.available_connections)": "number",
            "AVG(cql_stats.stats.available_connections)": "number",

            "cql_stats.stats.exceeded_pending_requests_water_mark": "number",
            "SUM(cql_stats.stats.exceeded_pending_requests_water_mark)": "number",
            "MAX(cql_stats.stats.exceeded_pending_requests_water_mark)": "number",
            "MIN(cql_stats.stats.exceeded_pending_requests_water_mark)": "number",
            "AVG(cql_stats.stats.exceeded_pending_requests_water_mark)": "number",

            "cql_stats.stats.exceeded_write_bytes_water_mark": "number",
            "SUM(cql_stats.stats.exceeded_write_bytes_water_mark)": "number",
            "MAX(cql_stats.stats.exceeded_write_bytes_water_mark)": "number",
            "MIN(cql_stats.stats.exceeded_write_bytes_water_mark)": "number",
            "AVG(cql_stats.stats.exceeded_write_bytes_water_mark)": "number",

            // CollectorDbStats table_info
            "COUNT(table_info)": "number",

            // "table_info.table_name": "",

            "table_info.reads": "number",
            "SUM(table_info.reads)": "number",
            "MAX(table_info.reads)": "number",
            "MIN(table_info.reads)": "number",
            "AVG(table_info.reads)": "number",

            "table_info.read_fails": "number",
            "SUM(table_info.read_fails)": "number",
            "MAX(table_info.read_fails)": "number",
            "MIN(table_info.read_fails)": "number",
            "AVG(table_info.read_fails)": "number",

            "table_info.writes": "number",
            "SUM(table_info.writes)": "number",
            "MAX(table_info.writes)": "number",
            "MIN(table_info.writes)": "number",
            "AVG(table_info.writes)": "number",

            "table_info.write_fails": "number",
            "SUM(table_info.write_fails)": "number",
            "MAX(table_info.write_fails)": "number",
            "MIN(table_info.write_fails)": "number",
            "AVG(table_info.write_fails)": "number",

            "table_info.write_back_pressure_fails": "number",
            "SUM(table_info.write_back_pressure_fails)": "number",
            "MAX(table_info.write_back_pressure_fails)": "number",
            "MIN(table_info.write_back_pressure_fails)": "number",
            "AVG(table_info.write_back_pressure_fails)": "number",

            // flow rate
            "COUNT(flow_rate)": "number",
            "flow_rate": "number",

            "flow_rate.added_flows": "number",
            "SUM(flow_rate.added_flows)": "number",
            "MAX(flow_rate.added_flows)": "number",
            "MIN(flow_rate.added_flows)": "number",
            "AVG(flow_rate.added_flows)": "number",

            "flow_rate.max_flow_adds_per_second": "number",
            "SUM(flow_rate.max_flow_adds_per_second)": "number",
            "MAX(flow_rate.max_flow_adds_per_second)": "number",
            "MIN(flow_rate.max_flow_adds_per_second)": "number",
            "AVG(flow_rate.max_flow_adds_per_second)": "number",

            "flow_rate.min_flow_adds_per_second": "number",
            "SUM(flow_rate.min_flow_adds_per_second)": "number",
            "MAX(flow_rate.min_flow_adds_per_second)": "number",
            "MIN(flow_rate.min_flow_adds_per_second)": "number",
            "AVG(flow_rate.min_flow_adds_per_second)": "number",

            "flow_rate.deleted_flows": "number",
            "SUM(flow_rate.deleted_flows)": "number",
            "MAX(flow_rate.deleted_flows)": "number",
            "MIN(flow_rate.deleted_flows)": "number",
            "AVG(flow_rate.deleted_flows)": "number",

            "flow_rate.max_flow_deletes_per_second": "number",
            "SUM(flow_rate.max_flow_deletes_per_second)": "number",
            "MAX(flow_rate.max_flow_deletes_per_second)": "number",
            "MIN(flow_rate.max_flow_deletes_per_second)": "number",
            "AVG(flow_rate.max_flow_deletes_per_second)": "number",

            "flow_rate.min_flow_deletes_per_second": "number",
            "SUM(flow_rate.min_flow_deletes_per_second)": "number",
            "MAX(flow_rate.min_flow_deletes_per_second)": "number",
            "MIN(flow_rate.min_flow_deletes_per_second)": "number",
            "AVG(flow_rate.min_flow_deletes_per_second)": "number",

            "flow_rate.active_flows": "number",
            "SUM(flow_rate.active_flows)": "number",
            "MAX(flow_rate.active_flows)": "number",
            "MIN(flow_rate.active_flows)": "number",
            "AVG(flow_rate.active_flows)": "number",

            // errors
            "COUNT(errors)": "number",

            "errors.write_tablespace_fails": "number",
            "SUM(errors.write_tablespace_fails)": "number",
            "MAX(errors.write_tablespace_fails)": "number",
            "MIN(errors.write_tablespace_fails)": "number",
            "AVG(errors.write_tablespace_fails)": "number",

            "errors.read_tablespace_fails": "number",
            "SUM(errors.read_tablespace_fails)": "number",
            "MAX(errors.read_tablespace_fails)": "number",
            "MIN(errors.read_tablespace_fails)": "number",
            "AVG(errors.read_tablespace_fails)": "number",

            "errors.write_table_fails": "number",
            "SUM(errors.write_table_fails)": "number",
            "MAX(errors.write_table_fails)": "number",
            "MIN(errors.write_table_fails)": "number",
            "AVG(errors.write_table_fails)": "number",

            "errors.read_table_fails": "number",
            "SUM(errors.read_table_fails)": "number",
            "MAX(errors.read_table_fails)": "number",
            "MIN(errors.read_table_fails)": "number",
            "AVG(errors.read_table_fails)": "number",

            "errors.write_column_fails": "number",
            "SUM(errors.write_column_fails)": "number",
            "MAX(errors.write_column_fails)": "number",
            "MIN(errors.write_column_fails)": "number",
            "AVG(errors.write_column_fails)": "number",

            "errors.write_batch_column_fails": "number",
            "SUM(errors.write_batch_column_fails)": "number",
            "MAX(errors.write_batch_column_fails)": "number",
            "MIN(errors.write_batch_column_fails)": "number",
            "AVG(errors.write_batch_column_fails)": "number",

            "errors.read_column_fails": "number",
            "SUM(errors.read_column_fails)": "number",
            "MAX(errors.read_column_fails)": "number",
            "MIN(errors.read_column_fails)": "number",
            "AVG(errors.read_column_fails)": "number",

            // rx_message_stats
            "rx_message_stats.bytes": "byte",
            "SUM(rx_message_stats.bytes)": "byte",
            "MAX(rx_message_stats.bytes)": "byte",
            "MIN(rx_message_stats.bytes)": "byte",

            // virtual_ip_stats
            "virtual_ip_stats.bytes_in": "byte",
            "SUM(virtual_ip_stats.bytes_in)": "byte",
            "MAX(virtual_ip_stats.bytes_in)": "byte",
            "MIN(virtual_ip_stats.bytes_in)": "byte",

            "virtual_ip_stats.bytes_out": "byte",
            "SUM(virtual_ip_stats.bytes_out)": "byte",
            "MAX(virtual_ip_stats.bytes_out)": "byte",
            "MIN(virtual_ip_stats.bytes_out)": "byte",

            // pool_stats
            "pool_stats.bytes_in": "byte",
            "SUM(pool_stats.bytes_in)": "byte",
            "MAX(pool_stats.bytes_in)": "byte",
            "MIN(pool_stats.bytes_in)": "byte",

            "pool_stats.bytes_out": "byte",
            "SUM(pool_stats.bytes_out)": "byte",
            "MAX(pool_stats.bytes_out)": "byte",
            "MIN(pool_stats.bytes_out)": "byte",

            // member_stats
            "member_stats.bytes_in": "byte",
            "SUM(member_stats.bytes_in)": "byte",
            "MAX(member_stats.bytes_in)": "byte",
            "MIN(member_stats.bytes_in)": "byte",

            "member_stats.bytes_out": "byte",
            "SUM(member_stats.bytes_out)": "byte",
            "MAX(member_stats.bytes_out)": "byte",
            "MIN(member_stats.bytes_out)": "byte",

            // fip_diff_stats
            "fip_diff_stats.in_bytes": "byte",
            "SUM(fip_diff_stats.in_bytes)": "byte",
            "MAX(fip_diff_stats.in_bytes)": "byte",
            "MIN(fip_diff_stats.in_bytes)": "byte",

            "fip_diff_stats.out_bytes": "byte",
            "SUM(fip_diff_stats.out_bytes)": "byte",
            "MAX(fip_diff_stats.out_bytes)": "byte",
            "MIN(fip_diff_stats.out_bytes)": "byte",

            // if_stats
            "COUNT(if_stats)": "number",

            "if_stats.in_bytes": "byte",
            "SUM(if_stats.in_bytes)": "byte",
            "MAX(if_stats.in_bytes)": "byte",
            "MIN(if_stats.in_bytes)": "byte",
            "AVG(if_stats.in_bytes)": "byte",

            "if_stats.out_bytes": "byte",
            "SUM(if_stats.out_bytes)": "byte",
            "MAX(if_stats.out_bytes)": "byte",
            "MIN(if_stats.out_bytes)": "byte",
            "AVG(if_stats.out_bytes)": "byte",

            "if_stats.in_pkts": "number",
            "SUM(if_stats.in_pkts)": "number",
            "MAX(if_stats.in_pkts)": "number",
            "MIN(if_stats.in_pkts)": "number",
            "AVG(if_stats.in_pkts)": "number",

            "if_stats.out_pkts": "number",
            "SUM(if_stats.out_pkts)": "number",
            "MAX(if_stats.out_pkts)": "number",
            "MIN(if_stats.out_pkts)": "number",
            "AVG(if_stats.out_pkts)": "number",

            // statistics_table_info
            "COUNT(statistics_table_info)": "number",

            "statistics_table_info.reads": "number",
            "SUM(statistics_table_info.reads)": "number",
            "MAX(statistics_table_info.reads)": "number",
            "MIN(statistics_table_info.reads)": "number",
            "AVG(statistics_table_info.reads)": "number",

            "statistics_table_info.read_fails": "number",
            "SUM(statistics_table_info.read_fails)": "number",
            "MAX(statistics_table_info.read_fails)": "number",
            "MIN(statistics_table_info.read_fails)": "number",
            "AVG(statistics_table_info.read_fails)": "number",

            "statistics_table_info.writes": "number",
            "SUM(statistics_table_info.writes)": "number",
            "MAX(statistics_table_info.writes)": "number",
            "MIN(statistics_table_info.writes)": "number",
            "AVG(statistics_table_info.writes)": "number",

            "statistics_table_info.write_fails": "number",
            "SUM(statistics_table_info.write_fails)": "number",
            "MAX(statistics_table_info.write_fails)": "number",
            "MIN(statistics_table_info.write_fails)": "number",
            "AVG(statistics_table_info.write_fails)": "number",

            "statistics_table_info.write_back_pressure_fails": "number",
            "SUM(statistics_table_info.write_back_pressure_fails)": "number",
            "MAX(statistics_table_info.write_back_pressure_fails)": "number",
            "MIN(statistics_table_info.write_back_pressure_fails)": "number",
            "AVG(statistics_table_info.write_back_pressure_fails)": "number",

            // phy_band_in_bps
            "COUNT(phy_band_in_bps)": "number",

            "phy_band_in_bps.__value": "throughput",
            "SUM(phy_band_in_bps.__value)": "throughput",
            "MAX(phy_band_in_bps.__value)": "throughput",
            "MIN(phy_band_in_bps.__value)": "throughput",
            "AVG(phy_band_in_bps.__value)": "throughput",

            // phy_band_out_bps
            "COUNT(phy_band_out_bps)": "number",

            "phy_band_out_bps.__value": "throughput",
            "SUM(phy_band_out_bps.__value)": "throughput",
            "MAX(phy_band_out_bps.__value)": "throughput",
            "MIN(phy_band_out_bps.__value)": "throughput",
            "AVG(phy_band_out_bps.__value)": "throughput",

            //phy_if_band
            "phy_if_band.in_bandwidth_usage": "byte",
            "SUM(phy_if_band.in_bandwidth_usage)": "byte",
            "MAX(phy_if_band.in_bandwidth_usage)": "byte",
            "MIN(phy_if_band.in_bandwidth_usage)": "byte",

            "phy_if_band.out_bandwidth_usage": "byte",
            "SUM(phy_if_band.out_bandwidth_usage)": "byte",
            "MAX(phy_if_band.out_bandwidth_usage)": "byte",
            "MIN(phy_if_band.out_bandwidth_usage)": "byte",

            // info_stats
            "info_stats.read_kbytes": "kilo-byte",
            "AVG(info_stats.read_kbytes)": "kilo-byte",
            "SUM(info_stats.read_kbytes)": "kilo-byte",
            "MAX(info_stats.read_kbytes)": "kilo-byte",
            "MIN(info_stats.read_kbytes)": "kilo-byte",

            "info_stats.write_kbytes": "kilo-byte",
            "AVG(info_stats.write_kbytes)": "kilo-byte",
            "SUM(info_stats.write_kbytes)": "kilo-byte",
            "MAX(info_stats.write_kbytes)": "kilo-byte",
            "MIN(info_stats.write_kbytes)": "kilo-byte",

            //network_info_stats
            "network_info.rx_packets": "number",
            "AVG(network_info.rx_packets)": "number",
            "SUM(network_info.rx_packets)": "number",
            "MAX(network_info.rx_packets)": "number",
            "MIN(network_info.rx_packets)": "number",

            "network_info.tx_packets": "number",
            "AVG(network_info.tx_packets)": "number",
            "SUM(network_info.tx_packets)": "number",
            "MAX(network_info.tx_packets)": "number",
            "MIN(network_info.tx_packets)": "number",

            "network_info.rx_bytes": "bytes",
            "AVG(network_info.rx_bytes)": "bytes",
            "SUM(network_info.rx_bytes)": "bytes",
            "MAX(network_info.rx_bytes)": "bytes",
            "MIN(network_info.rx_bytes)": "bytes",

            "network_info.tx_bytes": "bytes",
            "AVG(network_info.tx_bytes)": "bytes",
            "SUM(network_info.tx_bytes)": "bytes",
            "MAX(network_info.tx_bytes)": "bytes",
            "MIN(network_info.tx_bytes)": "bytes",

            // resource_info_stats
            "resource_info_stats.mem_usage_mb": "mega-byte",
            "AVG(resource_info_stats.mem_usage_mb)": "mega-byte",
            "SUM(resource_info_stats.mem_usage_mb)": "mega-byte",
            "MAX(resource_info_stats.mem_usage_mb)": "mega-byte",
            "MIN(resource_info_stats.mem_usage_mb)": "mega-byte",

            //egressRqe
            "egressRqeQueue.rqeBufferCount": "number",
            "AVG(egressRqeQueue.rqeBufferCount)": "number",
            "SUM(egressRqeQueue.rqeBufferCount)": "number",
            "MAX(egressRqeQueue.rqeBufferCount)": "number",
            "MIN(egressRqeQueue.rqeBufferCount)": "number",

            //egressCpuQueue
            "egressCpuQueue.cpuBufferCount": "number",
            "AVG(egressCpuQueue.cpuBufferCount)": "number",
            "SUM(egressCpuQueue.cpuBufferCount)": "number",
            "MAX(egressCpuQueue.cpuBufferCount)": "number",
            "MIN(egressCpuQueue.cpuBufferCount)": "number",

            //egressMcQueue
            "egressMcQueue.mcQueueEntries": "number",
            "AVG(egressMcQueue.mcQueueEntries)": "number",
            "SUM(egressMcQueue.mcQueueEntries)": "number",
            "MAX(egressMcQueue.mcQueueEntries)": "number",
            "MIN(egressMcQueue.mcQueueEntries)": "number",

            "egressMcQueue.mcBufferCount": "number",
            "AVG(egressMcQueue.mcBufferCount)": "number",
            "SUM(egressMcQueue.mcBufferCount)": "number",
            "MAX(egressMcQueue.mcBufferCount)": "number",
            "MIN(egressMcQueue.mcBufferCount)": "number",

            //egressUcQueue
            "egressUcQueue.ucBufferCount": "number",
            "AVG(egressUcQueue.ucBufferCount)": "number",
            "SUM(egressUcQueue.ucBufferCount)": "number",
            "MAX(egressUcQueue.ucBufferCount)": "number",
            "MIN(egressUcQueue.ucBufferCount)": "number",

            //egressServicePool
            "egressServicePool.mcShareQueueEntries": "number",
            "AVG(egressServicePool.mcShareQueueEntries)": "number",
            "SUM(egressServicePool.mcShareQueueEntries)": "number",
            "MAX(egressServicePool.mcShareQueueEntries)": "number",
            "MIN(egressServicePool.mcShareQueueEntries)": "number",

            "egressServicePool.mcShareBufferCount": "number",
            "AVG(egressServicePool.mcShareBufferCount)": "number",
            "SUM(egressServicePool.mcShareBufferCount)": "number",
            "MAX(egressServicePool.mcShareBufferCount)": "number",
            "MIN(egressServicePool.mcShareBufferCount)": "number",

            //ingressServicePool
            "ingressServicePool.umShareBufferCount": "number",
            "AVG(ingressServicePool.umShareBufferCount)": "number",
            "SUM(ingressServicePool.umShareBufferCount)": "number",
            "MAX(ingressServicePool.umShareBufferCount)": "number",
            "MIN(ingressServicePool.umShareBufferCount)": "number",

            //ingressPortServicePool
            "ingressPortServicePool.umShareBufferCount": "number",
            "AVG(ingressPortServicePool.umShareBufferCount)": "number",
            "SUM(ingressPortServicePool.umShareBufferCount)": "number",
            "MAX(ingressPortServicePool.umShareBufferCount)": "number",
            "MIN(ingressPortServicePool.umShareBufferCount)": "number",

            //ingressPortPriorityGroup
            "ingressPortPriorityGroup.umHeadroomBufferCount": "number",
            "AVG(ingressPortPriorityGroup.umHeadroomBufferCount)":"number",
            "SUM(ingressPortPriorityGroup.umHeadroomBufferCount)":"number",
            "MAX(ingressPortPriorityGroup.umHeadroomBufferCount)":"number",
            "MIN(ingressPortPriorityGroup.umHeadroomBufferCount)":"number",

            "ingressPortPriorityGroup.umShareBufferCount": "number",
            "AVG(ingressPortPriorityGroup.umShareBufferCount)": "number",
            "SUM(ingressPortPriorityGroup.umShareBufferCount)": "number",
            "MAX(ingressPortPriorityGroup.umShareBufferCount)": "number",
            "MIN(ingressPortPriorityGroup.umShareBufferCount)": "number",

            //disk_usage_stats
            "disk_usage_stats.write_bytes": "byte",
            "AVG(disk_usage_stats.write_bytes)": "byte",
            "SUM(disk_usage_stats.write_bytes)": "byte",
            "MAX(disk_usage_stats.write_bytes)": "byte",
            "MIN(disk_usage_stats.write_bytes)": "byte",

            "disk_usage_stats.read_bytes": "byte",
            "AVG(disk_usage_stats.read_bytes)": "byte",
            "SUM(disk_usage_stats.read_bytes)": "byte",
            "MAX(disk_usage_stats.read_bytes)": "byte",
            "MIN(disk_usage_stats.read_bytes)": "byte",

            // file_system_view_stats
            "file_system_view_stats.size_kb": "kilo-byte",
            "AVG(file_system_view_stats.size_kb)": "kilo-byte",
            "SUM(file_system_view_stats.size_kb)": "kilo-byte",
            "MAX(file_system_view_stats.size_kb)": "kilo-byte",
            "MIN(file_system_view_stats.size_kb)": "kilo-byte",

            "file_system_view_stats.used_kb": "kilo-byte",
            "AVG(file_system_view_stats.used_kb)": "kilo-byte",
            "SUM(file_system_view_stats.used_kb)": "kilo-byte",
            "MAX(file_system_view_stats.used_kb)": "kilo-byte",
            "MIN(file_system_view_stats.used_kb)": "kilo-byte",

            "file_system_view_stats.available_kb": "kilo-byte",
            "AVG(file_system_view_stats.available_kb)": "kilo-byte",
            "SUM(file_system_view_stats.available_kb)": "kilo-byte",
            "MAX(file_system_view_stats.available_kb)": "kilo-byte",
            "MIN(file_system_view_stats.available_kb)": "kilo-byte",

            "file_system_view_stats.physical_disks.disk_size_kb": "kilo-byte",
            "AVG(file_system_view_stats.physical_disks.disk_size_kb)": "kilo-byte",
            "SUM(file_system_view_stats.physical_disks.disk_size_kb)": "kilo-byte",
            "MAX(file_system_view_stats.physical_disks.disk_size_kb)": "kilo-byte",
            "MIN(file_system_view_stats.physical_disks.disk_size_kb)": "kilo-byte",

            "file_system_view_stats.physical_disks.disk_used_kb": "kilo-byte",
            "AVG(file_system_view_stats.physical_disks.disk_used_kb)": "kilo-byte",
            "SUM(file_system_view_stats.physical_disks.disk_used_kb)": "kilo-byte",
            "MAX(file_system_view_stats.physical_disks.disk_used_kb)": "kilo-byte",
            "MIN(file_system_view_stats.physical_disks.disk_used_kb)": "kilo-byte",

            "file_system_view_stats.physical_disks.disk_available_kb": "kilo-byte",
            "AVG(file_system_view_stats.physical_disks.disk_available_kb)": "kilo-byte",
            "SUM(file_system_view_stats.physical_disks.disk_available_kb)": "kilo-byte",
            "MAX(file_system_view_stats.physical_disks.disk_available_kb)": "kilo-byte",
            "MIN(file_system_view_stats.physical_disks.disk_available_kb)": "kilo-byte",

            // sensor_stats
            "sensor_stats.reading": "inferred",
            "SUM(sensor_stats.reading)": "inferred",
            "AVG(sensor_stats.reading)": "inferred",
            "MIN(sensor_stats.reading)": "inferred",
            "MAX(sensor_stats.reading)": "inferred",

            // database usage
            "COUNT(database_usage)": "number",

            "database_usage.disk_space_used_1k": "kilo-byte",
            "AVG(database_usage.disk_space_used_1k)": "kilo-byte",
            "SUM(database_usage.disk_space_used_1k)": "kilo-byte",
            "MAX(database_usage.disk_space_used_1k)": "kilo-byte",
            "MIN(database_usage.disk_space_used_1k)": "kilo-byte",

            "database_usage.disk_space_available_1k": "kilo-byte",
            "AVG(database_usage.disk_space_available_1k)": "kilo-byte",
            "SUM(database_usage.disk_space_available_1k)": "kilo-byte",
            "MAX(database_usage.disk_space_available_1k)": "kilo-byte",
            "MIN(database_usage.disk_space_available_1k)": "kilo-byte",

            "database_usage.analytics_db_size_1k": "kilo-byte",
            "AVG(database_usage.analytics_db_size_1k)": "kilo-byte",
            "SUM(database_usage.analytics_db_size_1k)": "kilo-byte",
            "MAX(database_usage.analytics_db_size_1k)": "kilo-byte",
            "MIN(database_usage.analytics_db_size_1k)": "kilo-byte",

            // disk usage
            "COUNT(disk_usage_info)": "number",

            // "disk_usage_info.partition_type": "",
            // "disk_usage_info.__key": "",

            "disk_usage_info.partition_space_used_1k": "kilo-byte",
            "AVG(disk_usage_info.partition_space_used_1k)": "kilo-byte",
            "SUM(disk_usage_info.partition_space_used_1k)": "kilo-byte",
            "MAX(disk_usage_info.partition_space_used_1k)": "kilo-byte",
            "MIN(disk_usage_info.partition_space_used_1k)": "kilo-byte",

            "disk_usage_info.partition_space_available_1k": "kilo-byte",
            "AVG(disk_usage_info.partition_space_available_1k)": "kilo-byte",
            "SUM(disk_usage_info.partition_space_available_1k)": "kilo-byte",
            "MAX(disk_usage_info.partition_space_available_1k)": "kilo-byte",
            "MIN(disk_usage_info.partition_space_available_1k)": "kilo-byte",

            // API
            "COUNT(api_stats)": "number",

            // "api_stats.operation_type": "",
            // "api_stats.user": "",
            // "api_stats.useragent": "",
            // "api_stats.remote_ip": "",
            // "api_stats.domain_name": "",
            // "api_stats.project_name": "",
            // "api_stats.object_type": "",
            // "api_stats.resp_code": "",
            // "api_stats.node": "",

            "api_stats.response_time_in_usec": "micro-second",
            "SUM(api_stats.response_time_in_usec)": "micro-second",
            "MAX(api_stats.response_time_in_usec)": "micro-second",
            "MIN(api_stats.response_time_in_usec)": "micro-second",
            "AVG(api_stats.response_time_in_usec)": "micro-second",

            "api_stats.response_size": "byte",
            "SUM(api_stats.response_size)": "byte",
            "MAX(api_stats.response_size)": "byte",
            "MIN(api_stats.response_size)": "byte",
            "AVG(api_stats.response_size)": "byte",

            "api_stats.response_size_objects": "number",
            "SUM(api_stats.response_size_objects)": "number",
            "MAX(api_stats.response_size_objects)": "number",
            "MIN(api_stats.response_size_objects)": "number",
            "AVG(api_stats.response_size_objects)": "number",

            "api_stats.response_size_bytes": "byte",
            "SUM(api_stats.response_size_bytes)": "byte",
            "MAX(api_stats.response_size_bytes)": "byte",
            "MIN(api_stats.response_size_bytes)": "byte",
            "AVG(api_stats.response_size_bytes)": "byte",

            // alarmgenUpdate.o and alarmgenUpdate.i
            "COUNT(o)": "number",

            // "table": "",

            "partition": "number",
            "SUM(partition)": "number",
            "MAX(partition)": "number",
            "MIN(partition)": "number",
            "AVG(partition)": "number",

            "o.keys": "number",
            "SUM(o.keys)": "number",
            "MAX(o.keys)": "number",
            "MIN(o.keys)": "number",
            "AVG(o.keys)": "number",

            "o.count": "number",
            "SUM(o.count)": "number",
            "MAX(o.count)": "number",
            "MIN(o.count)": "number",
            "AVG(o.count)": "number",

            "COUNT(i)": "number",

            // "i.collector": "",
            // "i.generator": "",
            // "i.type": "",

            "i.count": "number",
            "SUM(i.count)": "number",
            "MAX(i.count)": "number",
            "MIN(i.count)": "number",
            "AVG(i.count)": "number",

            // Cassandra thread pool
            "COUNT(thread_pool_stats)": "number",

            "thread_pool_stats.pool_name": "number",
            "SUM(thread_pool_stats.pool_name)": "number",
            "MAX(thread_pool_stats.pool_name)": "number",
            "MIN(thread_pool_stats.pool_name)": "number",
            "AVG(thread_pool_stats.pool_name)": "number",

            "thread_pool_stats.active": "number",
            "SUM(thread_pool_stats.active)": "number",
            "MAX(thread_pool_stats.active)": "number",
            "MIN(thread_pool_stats.active)": "number",
            "AVG(thread_pool_stats.active)": "number",

            "thread_pool_stats.pending": "number",
            "SUM(thread_pool_stats.pending)": "number",
            "MAX(thread_pool_stats.pending)": "number",
            "MIN(thread_pool_stats.pending)": "number",
            "AVG(thread_pool_stats.pending)": "number",

            "thread_pool_stats.all_time_blocked": "number",
            "SUM(thread_pool_stats.all_time_blocked)": "number",
            "MAX(thread_pool_stats.all_time_blocked)": "number",
            "MIN(thread_pool_stats.all_time_blocked)": "number",
            "AVG(thread_pool_stats.all_time_blocked)": "number",

            // Cassandra compaction task
            "COUNT(cassandra_compaction_task)": "number",

            "cassandra_compaction_task.pending_compaction_tasks": "number",
            "SUM(cassandra_compaction_task.pending_compaction_tasks)": "number",
            "MAX(cassandra_compaction_task.pending_compaction_tasks)": "number",
            "MIN(cassandra_compaction_task.pending_compaction_tasks)": "number",
            "AVG(cassandra_compaction_task.pending_compaction_tasks)": "number",

            // query stats
            "COUNT(query_stats)": "number",

            "query_stats.time": "milli-second",
            "SUM(query_stats.time)": "milli-second",
            "MAX(query_stats.time)": "milli-second",
            "MIN(query_stats.time)": "milli-second",
            "AVG(query_stats.time)": "milli-second",

            "query_stats.rows": "number",
            "SUM(query_stats.rows)": "number",
            "MAX(query_stats.rows)": "number",
            "MIN(query_stats.rows)": "number",
            "AVG(query_stats.rows)": "number",

            "query_stats.time_span": "milli-second",
            "SUM(query_stats.time_span)": "milli-second",
            "MAX(query_stats.time_span)": "milli-second",
            "MIN(query_stats.time_span)": "milli-second",
            "AVG(query_stats.time_span)": "milli-second",

            "query_stats.chunks": "number",
            "SUM(query_stats.chunks)": "number",
            "MAX(query_stats.chunks)": "number",
            "MIN(query_stats.chunks)": "number",
            "AVG(query_stats.chunks)": "number",

            // "query_stats.chunk_where_time": "",
            // "query_stats.chunk_select_time": "",
            // "query_stats.chunk_merge_time": "",
            // "query_stats.chunk_postproc_time": "number",

            "query_stats.final_merge_time": "milli-second",
            "SUM(query_stats.final_merge_time)": "milli-second",
            "MAX(query_stats.final_merge_time)": "milli-second",
            "MIN(query_stats.final_merge_time)": "milli-second",
            "AVG(query_stats.final_merge_time)": "milli-second",

            "query_stats.enq_delay": "milli-second",
            "SUM(query_stats.enq_delay)": "milli-second",
            "MAX(query_stats.enq_delay)": "milli-second",
            "MIN(query_stats.enq_delay)": "milli-second",
            "AVG(query_stats.enq_delay)": "milli-second",

            // StatTable.PeerStatsData.rx_update_stats
            "COUNT(rx_update_stats)": "number",

            "rx_update_stats.total": "number",
            "SUM(rx_update_stats.total)": "number",
            "MAX(rx_update_stats.total)": "number",
            "MIN(rx_update_stats.total)": "number",
            "AVG(rx_update_stats.total)": "number",

            "rx_update_stats.reach": "number",
            "SUM(rx_update_stats.reach)": "number",
            "MAX(rx_update_stats.reach)": "number",
            "MIN(rx_update_stats.reach)": "number",
            "AVG(rx_update_stats.reach)": "number",

            "rx_update_stats.unreach": "number",
            "SUM(rx_update_stats.unreach)": "number",
            "MAX(rx_update_stats.unreach)": "number",
            "MIN(rx_update_stats.unreach)": "number",
            "AVG(rx_update_stats.unreach)": "number",

            "rx_update_stats.end_of_rib": "number",
            "SUM(rx_update_stats.end_of_rib)": "number",
            "MAX(rx_update_stats.end_of_rib)": "number",
            "MIN(rx_update_stats.end_of_rib)": "number",
            "AVG(rx_update_stats.end_of_rib)": "number",

            // StatTable.VrouterStatsAgent.phy_flow_rate
            "COUNT(phy_flow_rate)": "number",

            "phy_flow_rate.added_flows": "number",
            "SUM(phy_flow_rate.added_flows)": "number",
            "MAX(phy_flow_rate.added_flows)": "number",
            "MIN(phy_flow_rate.added_flows)": "number",
            "AVG(phy_flow_rate.added_flows)": "number",

            "phy_flow_rate.max_flow_adds_per_second": "number",
            "SUM(phy_flow_rate.max_flow_adds_per_second)": "number",
            "MAX(phy_flow_rate.max_flow_adds_per_second)": "number",
            "MIN(phy_flow_rate.max_flow_adds_per_second)": "number",
            "AVG(phy_flow_rate.max_flow_adds_per_second)": "number",

            "phy_flow_rate.min_flow_adds_per_second": "number",
            "SUM(phy_flow_rate.min_flow_adds_per_second)": "number",
            "MAX(phy_flow_rate.min_flow_adds_per_second)": "number",
            "MIN(phy_flow_rate.min_flow_adds_per_second)": "number",
            "AVG(phy_flow_rate.min_flow_adds_per_second)": "number",

            "phy_flow_rate.deleted_flows": "number",
            "SUM(phy_flow_rate.deleted_flows)": "number",
            "MAX(phy_flow_rate.deleted_flows)": "number",
            "MIN(phy_flow_rate.deleted_flows)": "number",
            "AVG(phy_flow_rate.deleted_flows)": "number",

            "phy_flow_rate.max_flow_deletes_per_second": "number",
            "SUM(phy_flow_rate.max_flow_deletes_per_second)": "number",
            "MAX(phy_flow_rate.max_flow_deletes_per_second)": "number",
            "MIN(phy_flow_rate.max_flow_deletes_per_second)": "number",
            "AVG(phy_flow_rate.max_flow_deletes_per_second)": "number",

            "phy_flow_rate.min_flow_deletes_per_second": "number",
            "SUM(phy_flow_rate.min_flow_deletes_per_second)": "number",
            "MAX(phy_flow_rate.min_flow_deletes_per_second)": "number",
            "MIN(phy_flow_rate.min_flow_deletes_per_second)": "number",
            "AVG(phy_flow_rate.min_flow_deletes_per_second)": "number",

            "phy_flow_rate.active_flows": "number",
            "SUM(phy_flow_rate.active_flows)": "number",
            "MAX(phy_flow_rate.active_flows)": "number",
            "MIN(phy_flow_rate.active_flows)": "number",
            "AVG(phy_flow_rate.active_flows)": "number",

            // StatTable.NodeStatus.system_mem_usage
            "COUNT(system_mem_usage)": "number",

            "system_mem_usage.total": "kilo-byte",
            "SUM(system_mem_usage.total)": "kilo-byte",
            "MAX(system_mem_usage.total)": "kilo-byte",
            "MIN(system_mem_usage.total)": "kilo-byte",
            "AVG(system_mem_usage.total)": "kilo-byte",

            "system_mem_usage.used": "kilo-byte",
            "SUM(system_mem_usage.used)": "kilo-byte",
            "MAX(system_mem_usage.used)": "kilo-byte",
            "MIN(system_mem_usage.used)": "kilo-byte",
            "AVG(system_mem_usage.used)": "kilo-byte",

            "system_mem_usage.free": "kilo-byte",
            "SUM(system_mem_usage.free)": "kilo-byte",
            "MAX(system_mem_usage.free)": "kilo-byte",
            "MIN(system_mem_usage.free)": "kilo-byte",
            "AVG(system_mem_usage.free)": "kilo-byte",

            "system_mem_usage.buffers": "kilo-byte",
            "SUM(system_mem_usage.buffers)": "kilo-byte",
            "MAX(system_mem_usage.buffers)": "kilo-byte",
            "MIN(system_mem_usage.buffers)": "kilo-byte",
            "AVG(system_mem_usage.buffers)": "kilo-byte",

            "system_mem_usage.cached": "kilo-byte",
            "SUM(system_mem_usage.cached)": "kilo-byte",
            "MAX(system_mem_usage.cached)": "kilo-byte",
            "MIN(system_mem_usage.cached)": "kilo-byte",
            "AVG(system_mem_usage.cached)": "kilo-byte",

            // StatTable.NodeStatus.system_cpu_usage
            "COUNT(system_cpu_usage)": "number",

            "system_cpu_usage.one_min_avg": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "SUM(system_cpu_usage.one_min_avg)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "MAX(system_cpu_usage.one_min_avg)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "MIN(system_cpu_usage.one_min_avg)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "AVG(system_cpu_usage.one_min_avg)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],

            "system_cpu_usage.five_min_avg": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "SUM(system_cpu_usage.five_min_avg)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "MAX(system_cpu_usage.five_min_avg)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "MIN(system_cpu_usage.five_min_avg)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "AVG(system_cpu_usage.five_min_avg)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],

            "system_cpu_usage.fifteen_min_avg": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "SUM(system_cpu_usage.fifteen_min_avg)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "MAX(system_cpu_usage.fifteen_min_avg)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "MIN(system_cpu_usage.fifteen_min_avg)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "AVG(system_cpu_usage.fifteen_min_avg)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],

            "system_cpu_usage.cpu_share": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "SUM(system_cpu_usage.cpu_share)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "MAX(system_cpu_usage.cpu_share)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "MIN(system_cpu_usage.cpu_share)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],
            "AVG(system_cpu_usage.cpu_share)": [{format: 'number', options: {formatSpecifier: '.3n'}}, {format: 'percentage'}],

            // StatTable.VrouterStatsAgent.drop_stats
            "COUNT(drop_stats)": "number",

            "drop_stats.__value": "number",
            "SUM(drop_stats.__value)": "number",
            "MAX(drop_stats.__value)": "number",
            "MIN(drop_stats.__value)": "number",
            "AVG(drop_stats.__value)": "number",

            // StatTable.VrouterStatsAgent.phy_if_stats
            "COUNT(phy_if_stats)": "number",

            "phy_if_stats.in_pkts": "number",
            "SUM(phy_if_stats.in_pkts)": "number",
            "MAX(phy_if_stats.in_pkts)": "number",
            "MIN(phy_if_stats.in_pkts)": "number",
            "AVG(phy_if_stats.in_pkts)": "number",

            "phy_if_stats.in_bytes": "bytes",
            "SUM(phy_if_stats.in_bytes)": "bytes",
            "MAX(phy_if_stats.in_bytes)": "bytes",
            "MIN(phy_if_stats.in_bytes)": "bytes",
            "AVG(phy_if_stats.in_bytes)": "bytes",

            "phy_if_stats.out_pkts": "number",
            "SUM(phy_if_stats.out_pkts)": "number",
            "MAX(phy_if_stats.out_pkts)": "number",
            "MIN(phy_if_stats.out_pkts)": "number",
            "AVG(phy_if_stats.out_pkts)": "number",

            "phy_if_stats.out_bytes": "bytes",
            "SUM(phy_if_stats.out_bytes)": "bytes",
            "MAX(phy_if_stats.out_bytes)": "bytes",
            "MIN(phy_if_stats.out_bytes)": "bytes",
            "AVG(phy_if_stats.out_bytes)": "bytes",

            // StatTable.ModuleClientState.msg_type_diff
            "COUNT(msg_type_diff)": "number",

            "msg_type_diff.messages_sent": "number",
            "SUM(msg_type_diff.messages_sent)": "number",
            "MAX(msg_type_diff.messages_sent)": "number",
            "MIN(msg_type_diff.messages_sent)": "number",
            "AVG(msg_type_diff.messages_sent)": "number",

            "msg_type_diff.bytes_sent": "bytes",
            "SUM(msg_type_diff.bytes_sent)": "bytes",
            "MAX(msg_type_diff.bytes_sent)": "bytes",
            "MIN(msg_type_diff.bytes_sent)": "bytes",
            "AVG(msg_type_diff.bytes_sent)": "bytes",

            "msg_type_diff.messages_received": "number",
            "SUM(msg_type_diff.messages_received)": "number",
            "MAX(msg_type_diff.messages_received)": "number",
            "MIN(msg_type_diff.messages_received)": "number",
            "AVG(msg_type_diff.messages_received)": "number",

            "msg_type_diff.bytes_received": "bytes",
            "SUM(msg_type_diff.bytes_received)": "bytes",
            "MAX(msg_type_diff.bytes_received)": "bytes",
            "MIN(msg_type_diff.bytes_received)": "bytes",
            "AVG(msg_type_diff.bytes_received)": "bytes",

            "msg_type_diff.messages_sent_dropped": "number",
            "SUM(msg_type_diff.messages_sent_dropped)": "number",
            "MAX(msg_type_diff.messages_sent_dropped)": "number",
            "MIN(msg_type_diff.messages_sent_dropped)": "number",
            "AVG(msg_type_diff.messages_sent_dropped)": "number",

            "msg_type_diff.bytes_sent_dropped": "bytes",
            "SUM(msg_type_diff.bytes_sent_dropped)": "bytes",
            "MAX(msg_type_diff.bytes_sent_dropped)": "bytes",
            "MIN(msg_type_diff.bytes_sent_dropped)": "bytes",
            "AVG(msg_type_diff.bytes_sent_dropped)": "bytes",

            "msg_type_diff.messages_received_dropped": "number",
            "SUM(msg_type_diff.messages_received_dropped)": "number",
            "MAX(msg_type_diff.messages_received_dropped)": "number",
            "MIN(msg_type_diff.messages_received_dropped)": "number",
            "AVG(msg_type_diff.messages_received_dropped)": "number",

            "msg_type_diff.bytes_received_dropped": "bytes",
            "SUM(msg_type_diff.bytes_received_dropped)": "bytes",
            "MAX(msg_type_diff.bytes_received_dropped)": "bytes",
            "MIN(msg_type_diff.bytes_received_dropped)": "bytes",
            "AVG(msg_type_diff.bytes_received_dropped)": "bytes",

            "msg_type_diff.messages_sent_dropped_no_queue": "number",
            "SUM(msg_type_diff.messages_sent_dropped_no_queue)": "number",
            "MAX(msg_type_diff.messages_sent_dropped_no_queue)": "number",
            "MIN(msg_type_diff.messages_sent_dropped_no_queue)": "number",
            "AVG(msg_type_diff.messages_sent_dropped_no_queue)": "number",

            "msg_type_diff.messages_sent_dropped_no_client": "number",
            "SUM(msg_type_diff.messages_sent_dropped_no_client)": "number",
            "MAX(msg_type_diff.messages_sent_dropped_no_client)": "number",
            "MIN(msg_type_diff.messages_sent_dropped_no_client)": "number",
            "AVG(msg_type_diff.messages_sent_dropped_no_client)": "number",

            "msg_type_diff.messages_sent_dropped_no_session": "number",
            "SUM(msg_type_diff.messages_sent_dropped_no_session)": "number",
            "MAX(msg_type_diff.messages_sent_dropped_no_session)": "number",
            "MIN(msg_type_diff.messages_sent_dropped_no_session)": "number",
            "AVG(msg_type_diff.messages_sent_dropped_no_session)": "number",

            "msg_type_diff.messages_sent_dropped_queue_level": "number",
            "SUM(msg_type_diff.messages_sent_dropped_queue_level)": "number",
            "MAX(msg_type_diff.messages_sent_dropped_queue_level)": "number",
            "MIN(msg_type_diff.messages_sent_dropped_queue_level)": "number",
            "AVG(msg_type_diff.messages_sent_dropped_queue_level)": "number",

            "msg_type_diff.messages_sent_dropped_client_send_failed": "number",
            "SUM(msg_type_diff.messages_sent_dropped_client_send_failed)": "number",
            "MAX(msg_type_diff.messages_sent_dropped_client_send_failed)": "number",
            "MIN(msg_type_diff.messages_sent_dropped_client_send_failed)": "number",
            "AVG(msg_type_diff.messages_sent_dropped_client_send_failed)": "number",

            "msg_type_diff.messages_sent_dropped_session_not_connected": "number",
            "SUM(msg_type_diff.messages_sent_dropped_session_not_connected)": "number",
            "MAX(msg_type_diff.messages_sent_dropped_session_not_connected)": "number",
            "MIN(msg_type_diff.messages_sent_dropped_session_not_connected)": "number",
            "AVG(msg_type_diff.messages_sent_dropped_session_not_connected)": "number",

            "msg_type_diff.messages_sent_dropped_header_write_failed": "number",
            "SUM(msg_type_diff.messages_sent_dropped_header_write_failed)": "number",
            "MAX(msg_type_diff.messages_sent_dropped_header_write_failed)": "number",
            "MIN(msg_type_diff.messages_sent_dropped_header_write_failed)": "number",
            "AVG(msg_type_diff.messages_sent_dropped_header_write_failed)": "number",

            "msg_type_diff.messages_sent_dropped_write_failed": "number",
            "SUM(msg_type_diff.messages_sent_dropped_write_failed)": "number",
            "MAX(msg_type_diff.messages_sent_dropped_write_failed)": "number",
            "MIN(msg_type_diff.messages_sent_dropped_write_failed)": "number",
            "AVG(msg_type_diff.messages_sent_dropped_write_failed)": "number",

            "msg_type_diff.messages_sent_dropped_wrong_client_sm_state": "number",
            "SUM(msg_type_diff.messages_sent_dropped_wrong_client_sm_state)": "number",
            "MAX(msg_type_diff.messages_sent_dropped_wrong_client_sm_state)": "number",
            "MIN(msg_type_diff.messages_sent_dropped_wrong_client_sm_state)": "number",
            "AVG(msg_type_diff.messages_sent_dropped_wrong_client_sm_state)": "number",

            "msg_type_diff.messages_sent_dropped_validation_failed": "number",
            "SUM(msg_type_diff.messages_sent_dropped_validation_failed)": "number",
            "MAX(msg_type_diff.messages_sent_dropped_validation_failed)": "number",
            "MIN(msg_type_diff.messages_sent_dropped_validation_failed)": "number",
            "AVG(msg_type_diff.messages_sent_dropped_validation_failed)": "number",

            "msg_type_diff.messages_sent_dropped_rate_limited": "number",
            "SUM(msg_type_diff.messages_sent_dropped_rate_limited)": "number",
            "MAX(msg_type_diff.messages_sent_dropped_rate_limited)": "number",
            "MIN(msg_type_diff.messages_sent_dropped_rate_limited)": "number",
            "AVG(msg_type_diff.messages_sent_dropped_rate_limited)": "number",

            "msg_type_diff.bytes_sent_dropped_no_queue": "bytes",
            "SUM(msg_type_diff.bytes_sent_dropped_no_queue)": "bytes",
            "MAX(msg_type_diff.bytes_sent_dropped_no_queue)": "bytes",
            "MIN(msg_type_diff.bytes_sent_dropped_no_queue)": "bytes",
            "AVG(msg_type_diff.bytes_sent_dropped_no_queue)": "bytes",

            "msg_type_diff.bytes_sent_dropped_no_client": "bytes",
            "SUM(msg_type_diff.bytes_sent_dropped_no_client)": "bytes",
            "MAX(msg_type_diff.bytes_sent_dropped_no_client)": "bytes",
            "MIN(msg_type_diff.bytes_sent_dropped_no_client)": "bytes",
            "AVG(msg_type_diff.bytes_sent_dropped_no_client)": "bytes",

            "msg_type_diff.bytes_sent_dropped_no_session": "bytes",
            "SUM(msg_type_diff.bytes_sent_dropped_no_session)": "bytes",
            "MAX(msg_type_diff.bytes_sent_dropped_no_session)": "bytes",
            "MIN(msg_type_diff.bytes_sent_dropped_no_session)": "bytes",
            "AVG(msg_type_diff.bytes_sent_dropped_no_session)": "bytes",

            "msg_type_diff.bytes_sent_dropped_queue_level": "bytes",
            "SUM(msg_type_diff.bytes_sent_dropped_queue_level)": "bytes",
            "MAX(msg_type_diff.bytes_sent_dropped_queue_level)": "bytes",
            "MIN(msg_type_diff.bytes_sent_dropped_queue_level)": "bytes",
            "AVG(msg_type_diff.bytes_sent_dropped_queue_level)": "bytes",

            "msg_type_diff.bytes_sent_dropped_client_send_failed": "bytes",
            "SUM(msg_type_diff.bytes_sent_dropped_client_send_failed)": "bytes",
            "MAX(msg_type_diff.bytes_sent_dropped_client_send_failed)": "bytes",
            "MIN(msg_type_diff.bytes_sent_dropped_client_send_failed)": "bytes",
            "AVG(msg_type_diff.bytes_sent_dropped_client_send_failed)": "bytes",

            "msg_type_diff.bytes_sent_dropped_session_not_connected": "bytes",
            "SUM(msg_type_diff.bytes_sent_dropped_session_not_connected)": "bytes",
            "MAX(msg_type_diff.bytes_sent_dropped_session_not_connected)": "bytes",
            "MIN(msg_type_diff.bytes_sent_dropped_session_not_connected)": "bytes",
            "AVG(msg_type_diff.bytes_sent_dropped_session_not_connected)": "bytes",

            "msg_type_diff.bytes_sent_dropped_header_write_failed": "bytes",
            "SUM(msg_type_diff.bytes_sent_dropped_header_write_failed)": "bytes",
            "MAX(msg_type_diff.bytes_sent_dropped_header_write_failed)": "bytes",
            "MIN(msg_type_diff.bytes_sent_dropped_header_write_failed)": "bytes",
            "AVG(msg_type_diff.bytes_sent_dropped_header_write_failed)": "bytes",

            "msg_type_diff.bytes_sent_dropped_write_failed": "bytes",
            "SUM(msg_type_diff.bytes_sent_dropped_write_failed)": "bytes",
            "MAX(msg_type_diff.bytes_sent_dropped_write_failed)": "bytes",
            "MIN(msg_type_diff.bytes_sent_dropped_write_failed)": "bytes",
            "AVG(msg_type_diff.bytes_sent_dropped_write_failed)": "bytes",

            "msg_type_diff.bytes_sent_dropped_wrong_client_sm_state": "bytes",
            "SUM(msg_type_diff.bytes_sent_dropped_wrong_client_sm_state)": "bytes",
            "MAX(msg_type_diff.bytes_sent_dropped_wrong_client_sm_state)": "bytes",
            "MIN(msg_type_diff.bytes_sent_dropped_wrong_client_sm_state)": "bytes",
            "AVG(msg_type_diff.bytes_sent_dropped_wrong_client_sm_state)": "bytes",

            "msg_type_diff.bytes_sent_dropped_validation_failed": "bytes",
            "SUM(msg_type_diff.bytes_sent_dropped_validation_failed)": "bytes",
            "MAX(msg_type_diff.bytes_sent_dropped_validation_failed)": "bytes",
            "MIN(msg_type_diff.bytes_sent_dropped_validation_failed)": "bytes",
            "AVG(msg_type_diff.bytes_sent_dropped_validation_failed)": "bytes",

            "msg_type_diff.bytes_sent_dropped_rate_limited": "bytes",
            "SUM(msg_type_diff.bytes_sent_dropped_rate_limited)": "bytes",
            "MAX(msg_type_diff.bytes_sent_dropped_rate_limited)": "bytes",
            "MIN(msg_type_diff.bytes_sent_dropped_rate_limited)": "bytes",
            "AVG(msg_type_diff.bytes_sent_dropped_rate_limited)": "bytes",

            "msg_type_diff.messages_received_dropped_no_queue": "number",
            "SUM(msg_type_diff.messages_received_dropped_no_queue)": "number",
            "MAX(msg_type_diff.messages_received_dropped_no_queue)": "number",
            "MIN(msg_type_diff.messages_received_dropped_no_queue)": "number",
            "AVG(msg_type_diff.messages_received_dropped_no_queue)": "number",

            "msg_type_diff.messages_received_dropped_queue_level": "number",
            "SUM(msg_type_diff.messages_received_dropped_queue_level)": "number",
            "MAX(msg_type_diff.messages_received_dropped_queue_level)": "number",
            "MIN(msg_type_diff.messages_received_dropped_queue_level)": "number",
            "AVG(msg_type_diff.messages_received_dropped_queue_level)": "number",

            "msg_type_diff.messages_received_dropped_create_failed": "number",
            "SUM(msg_type_diff.messages_received_dropped_create_failed)": "number",
            "MAX(msg_type_diff.messages_received_dropped_create_failed)": "number",
            "MIN(msg_type_diff.messages_received_dropped_create_failed)": "number",
            "AVG(msg_type_diff.messages_received_dropped_create_failed)": "number",

            "msg_type_diff.messages_received_dropped_control_msg_failed": "number",
            "SUM(msg_type_diff.messages_received_dropped_control_msg_failed)": "number",
            "MAX(msg_type_diff.messages_received_dropped_control_msg_failed)": "number",
            "MIN(msg_type_diff.messages_received_dropped_control_msg_failed)": "number",
            "AVG(msg_type_diff.messages_received_dropped_control_msg_failed)": "number",

            "msg_type_diff.messages_received_dropped_decoding_failed": "number",
            "SUM(msg_type_diff.messages_received_dropped_decoding_failed)": "number",
            "MAX(msg_type_diff.messages_received_dropped_decoding_failed)": "number",
            "MIN(msg_type_diff.messages_received_dropped_decoding_failed)": "number",
            "AVG(msg_type_diff.messages_received_dropped_decoding_failed)": "number",

            "msg_type_diff.bytes_received_dropped_no_queue": "bytes",
            "SUM(msg_type_diff.bytes_received_dropped_no_queue)": "bytes",
            "MAX(msg_type_diff.bytes_received_dropped_no_queue)": "bytes",
            "MIN(msg_type_diff.bytes_received_dropped_no_queue)": "bytes",
            "AVG(msg_type_diff.bytes_received_dropped_no_queue)": "bytes",

            "msg_type_diff.bytes_received_dropped_queue_level": "bytes",
            "SUM(msg_type_diff.bytes_received_dropped_queue_level)": "bytes",
            "MAX(msg_type_diff.bytes_received_dropped_queue_level)": "bytes",
            "MIN(msg_type_diff.bytes_received_dropped_queue_level)": "bytes",
            "AVG(msg_type_diff.bytes_received_dropped_queue_level)": "bytes",

            "msg_type_diff.bytes_received_dropped_create_failed": "bytes",
            "SUM(msg_type_diff.bytes_received_dropped_create_failed)": "bytes",
            "MAX(msg_type_diff.bytes_received_dropped_create_failed)": "bytes",
            "MIN(msg_type_diff.bytes_received_dropped_create_failed)": "bytes",
            "AVG(msg_type_diff.bytes_received_dropped_create_failed)": "bytes",

            "msg_type_diff.bytes_received_dropped_control_msg_failed": "bytes",
            "SUM(msg_type_diff.bytes_received_dropped_control_msg_failed)": "bytes",
            "MAX(msg_type_diff.bytes_received_dropped_control_msg_failed)": "bytes",
            "MIN(msg_type_diff.bytes_received_dropped_control_msg_failed)": "bytes",
            "AVG(msg_type_diff.bytes_received_dropped_control_msg_failed)": "bytes",

            "msg_type_diff.bytes_received_dropped_decoding_failed": "bytes",
            "SUM(msg_type_diff.bytes_received_dropped_decoding_failed)": "bytes",
            "MAX(msg_type_diff.bytes_received_dropped_decoding_failed)": "bytes",
            "MIN(msg_type_diff.bytes_received_dropped_decoding_failed)": "bytes",
            "AVG(msg_type_diff.bytes_received_dropped_decoding_failed)": "bytes",

            // StatTable.CollectorDbStats.stats_info
            "COUNT(stats_info)": "number",

            "stats_info.reads": "number",
            "SUM(stats_info.reads)": "number",
            "MAX(stats_info.reads)": "number",
            "MIN(stats_info.reads)": "number",
            "AVG(stats_info.reads)": "number",

            "stats_info.read_fails": "number",
            "SUM(stats_info.read_fails)": "number",
            "MAX(stats_info.read_fails)": "number",
            "MIN(stats_info.read_fails)": "number",
            "AVG(stats_info.read_fails)": "number",

            "stats_info.writes": "number",
            "SUM(stats_info.writes)": "number",
            "MAX(stats_info.writes)": "number",
            "MIN(stats_info.writes)": "number",
            "AVG(stats_info.writes)": "number",

            "stats_info.write_fails": "number",
            "SUM(stats_info.write_fails)": "number",
            "MAX(stats_info.write_fails)": "number",
            "MIN(stats_info.write_fails)": "number",
            "AVG(stats_info.write_fails)": "number",

            "stats_info.write_back_pressure_fails": "number",
            "SUM(stats_info.write_back_pressure_fails)": "number",
            "MAX(stats_info.write_back_pressure_fails)": "number",
            "MIN(stats_info.write_back_pressure_fails)": "number",
            "AVG(stats_info.write_back_pressure_fails)": "number",

            // StatTable.PeerStatsData.tx_update_stats
            "COUNT(tx_update_stats)": "number",

            "tx_update_stats.total": "number",
            "SUM(tx_update_stats.total)": "number",
            "MAX(tx_update_stats.total)": "number",
            "MIN(tx_update_stats.total)": "number",
            "AVG(tx_update_stats.total)": "number",

            "tx_update_stats.reach": "number",
            "SUM(tx_update_stats.reach)": "number",
            "MAX(tx_update_stats.reach)": "number",
            "MIN(tx_update_stats.reach)": "number",
            "AVG(tx_update_stats.reach)": "number",

            "tx_update_stats.unreach": "number",
            "SUM(tx_update_stats.unreach)": "number",
            "MAX(tx_update_stats.unreach)": "number",
            "MIN(tx_update_stats.unreach)": "number",
            "AVG(tx_update_stats.unreach)": "number",

            "tx_update_stats.end_of_rib": "number",
            "SUM(tx_update_stats.end_of_rib)": "number",
            "MAX(tx_update_stats.end_of_rib)": "number",
            "MIN(tx_update_stats.end_of_rib)": "number",
            "AVG(tx_update_stats.end_of_rib)": "number",

            // StatTable.ModuleClientState.tx_msg_diff
            "COUNT(tx_msg_diff)": "number",

            "tx_msg_diff.__value": "number",
            "SUM(tx_msg_diff.__value)": "number",
            "MAX(tx_msg_diff.__value)": "number",
            "MIN(tx_msg_diff.__value)": "number",
            "AVG(tx_msg_diff.__value)": "number"
        };

        this.D3_COLOR_CATEGORY2 = [ "#1f77b4", "#2ca02c"];
        this.D3_COLOR_CATEGORY5 = [ '#1f77b4', '#6baed6' , '#ff7f0e', '#2ca02c', '#9e9ac8'];
        this.D3_COLOR_CATEGORY7 = [ '#1f77b4' , '#ff7f0e', '#2ca02c', '#a55194', '#9e9ac8', '#6baed6', '#bcbd22'];

        // QE Constants - End

        //Alarm constants
        this.URL_ALARM_DETAILS = '/api/tenant/monitoring/alarms';
        this.ALARM_REFRESH_DURATION = 300000;//5 MINUTES
        this.ALARM_BUCKET_DURATION = 300000000;//5 MINUTES
        this.TMPL_ALARM_SEVERITY = 'alarm-severity-template';

        this.DEFAULT_BUCKET_DURATION = 5; //MINUTES

        this.DROPDOWN_VALUE_SEPARATOR = ";";

        this.GRAPH_IMAGE_MAP = {
            'physical-router': 'prouter',
            'virtual-router': 'vrouter',
            'virtual-network': 'vpn',
            'network-policy': 'policy',
            'service-instance-l2': 'l2',
            'service-instance-analyzer': 'analyzer',
            'service-instance-firewall': 'firewall',
            'service-instance-nat': 'nat',
            'service-instance-lb': 'lb',
            'service-instance': 'nat',
            'security-group': 'sg',
            'floating-ip': 'fip',
            'network-ipam': 'ipam',
            'router': 'router',
            'virtual-machine': 'vm'
        };
        this.GRAPH_MARGIN = 35;

        this.BYTES_PER_SECOND_PREFIXES = ['B/s', 'KB/s', 'MB/s', 'GB/s', 'TB/s', 'PB/s', 'EB/s', 'ZB/s'];
        this.DROPDOWN_VALUE_SEPARATOR = ";";
        this.ALARMGEN_PROCESS = 'contrail-alarm-gen';
        this.ANALYTICS_API_PROCESS = 'contrail-analytics-api';
        this.ANALYTICS_DOWN_ALARM_TEXT = 'Alarms Generator Down. Alarms may not be reported correctly.';

        this.ALARMGEN_PROCESS = 'contrail-alarm-gen';
        this.ANALYTICS_API_PROCESS = 'contrail-analytics-api';
        this.ALARM_GEN_DOWN_ALARM_TEXT = 'Alarms Generator Down. Alarms may not be reported correctly.';
        this.ANALYTICS_API_DOWN_ALARM_TEXT = 'Analytics API Down. Alarms may not be reported correctly.';
        this.ANALYTICS_PROCESSES_DOWN_ALARM_TEXT = 'Analytics Processes Down. Alarms may not be reported correctly.';
        this.UI_GENERATED_ALARM = 'UIGeneratedAlarm';

        //RBAC constants
        this.RBAC_ACCESS_TYPE_LIST = [{text: "Read", value: "4"},
                                      {text: "Write", value: "2"},
                                      {text: "Refer", value: "1"}];
        this.PERMISSIONS_TITLE = 'Permissions';
        this.PERMISSIONS_TAB_ID = 'permission_tab';
        this.PERMISSIONS_SECTION_ID = 'permissions_config_tab';
        this.RBAC_PERMISSIONS_ID = 'rbac_permissions';
        this.TAB_FORM_TYPE = 'form';

        this.get = function () {
            var args = arguments;
            return cowu.getValueFromTemplate(args);
        };
        this.DEFAULT_COLOR = '#6f97ae';
        this.HTTP_STATUS_CODE_AUTHORIZATION_FAILURE = 401;

        //Node color schemes
        this.SINGLE_NODE_COLOR = ['#6f97ae'];
        this.THREE_NODE_COLOR = ['#a8c0d1', '#6f97ae', '#617683'];
        this.FIVE_NODE_COLOR = ['#819eb5', '#6b8295', '#876f8a', '#b2a198', '#eccc9b'];
        this.FAILURE_COLOR = '#d95436';
        this.OTHERS_COLORS = '#a3b8a0';

        this.OTHERS = 'Others';
        this.FAILURE_LABEL = 'Failures';

        // Query Engine constants
        this.TMPL_QUERY_PAGE = "query-page-template";
        this.TMPL_QUERY_QUEUE_PAGE = "query-queue-page-template";
        this.TMPL_QUERY_TEXT = "query-text-template";
        this.TMPL_QUERY_SELECT = "query-select-popup-template";
    };
    //Export to global scope
    cowc = new CoreConstants();
    return cowc;
});

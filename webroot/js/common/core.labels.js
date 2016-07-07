/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var CoreLabels = function () {
        this.get = function (key, app) {

            var label = null,
                featurePackages = globalObj.webServerInfo.featurePkg;

            if(contrail.checkIfExist(app)) {
                if (app == cowc.APP_CONTRAIL_CONTROLLER) {
                    label = ctwl.get(key)
                } else if (app == cowc.APP_CONTRAIL_SM) {
                    label = smwl.get(key);
                } else if (app == cowc.APP_CONTRAIL_STORAGE) {
                    label = swl.get(key);
                }
            } else {
                label = this.getCoreLabel(key);

                if (!contrail.checkIfExist(label) && featurePackages.webController && typeof ctwl !== 'undefined' && ctwl.isExistKey(key)) {
                    label = ctwl.get(key);
                }

                if (!contrail.checkIfExist(label) && featurePackages.serverManager && typeof smwl !== 'undefined' && smwl.isExistKey(key)) {
                    label = smwl.get(key);
                }

                if (!contrail.checkIfExist(label) && featurePackages.webStorage && typeof swl !== 'undefined' && swl.isExistKey(key)) {
                    label = swl.get(key);
                }

                if (!contrail.checkIfExist(label)) {
                    var keyArray = key.split('.'),
                        newKey = keyArray[keyArray.length - 1];

                    label = capitalizeSentence(cowu.replaceAll("_", " ", newKey));
                    label = capitalizeSentence(cowu.replaceAll("-", " ", label));
                }
            }

            return label;
        };

        this.getCoreLabel = function(key) {
            var keyArray, newKey;
            if (_.has(labelMap, key)) {
                return labelMap[key];
            } else {
                keyArray = key.split('.');
                newKey = keyArray[keyArray.length - 1];
                if (keyArray.length > 1 && _.has(labelMap, newKey)) {
                    return labelMap[newKey];
                }
            }

            return null;
        };

        this.getInLowerCase = function (key) {
            var label = this.get(key);
            return label.toLowerCase();
        };

        this.getInUpperCase = function (key) {
            var label = this.get(key);
            return label.toUpperCase();
        };

        this.getFirstCharUpperCase = function (key) {
            var label = this.get(key);

            label = label.toLowerCase().replace(/\b[a-z]/g, function(letter) {
                return letter.toUpperCase();
            });
            return label;
        };

        var labelMap = {};

        this.BREADCRUMB_ID = "breadcrumb";

        // Query Engine labels
        this.QE_QUERY_RESULT_GRID_ID = 'qe-query-result-grid';
        this.QE_QUERY_RESULT_TEXT_ID = 'qe-query-result-text';
        this.QE_QUERY_RESULT_CHART_PAGE_ID = 'qe-query-result-chart-page';
        this.QE_QUERY_RESULT_CHART_ID = 'qe-query-result-chart';
        this.QE_QUERY_RESULT_CHART_GRID_ID = 'qe-query-result-chart-grid';
        this.QE_QUERY_RESULT_LINE_CHART_ID = 'qe-query-result-line-chart';

        this.QE_QUERY_QUEUE_TABS_ID = "qe-query-queue-tabs";
        this.QE_QUERY_QUEUE_RESULT_GRID_TAB_ID = "qe-query-queue-result-grid-tab";
        this.QE_QUERY_QUEUE_RESULT_CHART_TAB_ID = "qe-query-queue-result-chart-tab";
        this.QE_QUERY_QUEUE_GRID_ID = "qe-query-queue-grid";

        this.QE_FLOW_SERIES_ID = "qe-flow-series";
        this.QE_FLOW_SERIES_SECTION_ID = "qe-flow-series-section";
        this.QE_FLOW_SERIES_TAB_ID = "qe-flow-series-tab";
        this.QE_FLOW_SERIES_GRID_ID = "qe-flow-series-grid";
        this.QE_FLOW_SERIES_CHART_ID = "qe-flow-series-chart";
        this.QE_FLOW_SERIES_CHART_PAGE_ID = 'qe-flow-series-chart-page';
        this.QE_FLOW_SERIES_LINE_CHART_ID = "qe-flow-series-line-chart"
        this.QE_FLOW_SERIES_CHART_GRID_ID = "qe-flow-series-chart-grid";

        this.QE_FLOW_DETAILS_TAB_VIEW__ID = "qe-flow-details-tab-view";
        this.QE_FLOW_DETAILS_TAB_ID = "qe-flow-details-tab";
        this.QE_FLOW_DETAILS_GRID_ID = "qe-flow-details-grid";

        this.QE_FLOW_RECORD_ID = "qe-flow-record";
        this.QE_FLOW_RECORD_SECTION_ID = "qe-flow-record-section";
        this.QE_FLOW_RECORD_TAB_ID = "qe-flow-record-tab";
        this.QE_FLOW_RECORD_GRID_ID = "qe-flow-record-grid";

        this.QE_SESSION_ANALYZER_VIEW_ID = "qe-sa-view";
        this.QE_SESSION_ANALYZER_RESULT_TAB_ID = "qe-sa-result-tab";
        this.QE_SESSION_ANALYZER_RESULT_CHART_ID = "qe-sa-result-chart";
        this.QE_SESSION_ANALYZER_RESULT_GRID_TAB_ID = "qe-sa-result-grid-tab";
        this.QE_SESSION_ANALYZER_RESULT_GRID_ID = "qe-sa-result-grid";
        this.QE_SESSION_ANALYZER_RESULT_TEXT_ID = "qe-sa-result-text";

        this.QE_FLOW_QUEUE_ID = "qe-flow-queue";
        this.QE_FLOW_QUEUE_GRID_ID = "qe-flow-queue-grid";
        this.QE_FLOW_QUEUE_TAB_ID = "qe-flow-queue-tab";
        this.QE_DELETE_MULTIPLE_QUERY_QUEUE_CONTROL_ID = "qe-delete-multiple-query-queue-control";
        this.TITLE_VIEW_QUERY_RESULT = "View Query Result";
        this.TITLE_MODIFY_QUERY = "Modify Query";
        this.TITLE_VIEW_QUERY_ERROR = "View Query Error";
        this.TITLE_RERUN_QUERY = "Rerun Query";
        this.TITLE_DELETE_QUERY = "Delete Query";
        this.TITLE_QUERY_QUEUE = "Query Queue";
        this.TITLE_DELETE_ALL_QUERY_QUEUE = "Delete All Query Queue";

        this.QE_SELECT_STAT_TABLE = "Select Statistic Table";
        this.QE_STAT_QUERY_ID = "qe-stat-query";
        this.QE_STAT_QUERY_SECTION_ID = "qe-stat-query-section";
        this.QE_STAT_QUERY_TAB_ID = "qe-stat-query-tab";
        this.QE_STAT_QUERY_GRID_ID = "qe-stat-query-grid";
        this.QE_STAT_QUERY_CHART_ID = "qe-stat-query-chart";
        this.QE_STAT_QUERY_CHART_PAGE_ID = 'qe-stat-query-chart-page';
        this.QE_STAT_QUERY_LINE_CHART_ID = "qe-stat-query-line-chart";
        this.QE_STAT_QUERY_CHART_GRID_ID = "qe-stat-query-chart-grid";

        this.QE_OBJECT_LOGS_ID = "qe-object-logs";
        this.QE_OBJECT_LOGS_SECTION_ID = "qe-object-logs-section";
        this.QE_OBJECT_LOGS_TAB_ID = "qe-object-logs-tab";
        this.QE_OBJECT_LOGS_GRID_ID = "qe-object-logs-grid";
        this.QE_SELECT_OBJECT_TABLE = "Select Object Table";

        this.QE_SYSTEM_LOGS_ID = "qe-system-logs";
        this.QE_SYSTEM_LOGS_SECTION_ID = "qe-system-logs-section";
        this.QE_SYSTEM_LOGS_TAB_ID = "qe-system-logs-tab";
        this.QE_SYSTEM_LOGS_GRID_ID = "qe-system-logs-grid";

        this.QE_SESSION_ANALYZER_SUMMARY_SUFFIX_ID = "-sa-summary";
        this.QE_INGRESS_SUFFIX_ID = "-ingress";
        this.QE_EGRESS_SUFFIX_ID = "-egress";
        this.QE_REVERSE_INGRESS_SUFFIX_ID = "-reverse-ingress";
        this.QE_REVERSE_EGRESS_SUFFIX_ID = "-reverse-egress";

        this.TITLE_DETAILS = "Details";
        this.TITLE_OVERVIEW = "Overview";
        this.TITLE_ERROR = "Error";
        this.TITLE_QE_SELECT = "Select";
        this.TITLE_CHART = "Chart";
        this.TITLE_QE_WHERE = "Where";
        this.TITLE_QE_FILTER = "Filter";

        this.TITLE_QUERY = "Query";
        this.TITLE_QUERY_STATUS = "Query Status";
        this.TITLE_QUERY_PARAMETERS = "Query Parameters";
        this.TITLE_QUERY_STATISTICS = "Query Statistics";
        this.TITLE_RESULTS = "Results";
        this.TITLE_CHART = "Chart";
        this.TITLE_FLOW = "Flow";
        this.TITLE_LOG = "Log";
        this.TITLE_STATS = "Statistics";
        this.TITLE_FLOW_SERIES = "Flow Series";
        this.TITLE_FLOW_RECORD = "Flow Record";
        this.TITLE_SESSION_ANALYZER = "Session Analysis";
        this.TITLE_ACTION_SESSION_ANALYZER = "Analyze Session";
        this.TITLE_SESSION_ANALYZER_SUMMARY = "Session Summary";
        this.TITLE_SESSION_DETAILS = "Session Details";
        this.TITLE_FLOW_SERIES_RESULTS = "Flow Series Results";
        this.TITLE_STATS_QUERY = "Statistics Query";
        this.TITLE_OBJECT_LOGS = "Object Logs";
        this.TITLE_SYSTEM_LOGS = "System Logs";
        this.TITLE_CONSOLE_LOGS = "Console Logs";

        this.TITLE_INGRESS = "Ingress";
        this.TITLE_EGRESS = "Egress";
        this.TITLE_REVERSE_INGRESS = "Reverse Ingress";
        this.TITLE_REVERSE_EGRESS = "Reverse Egress";

        this.QE_SELECT_MODAL_SUFFIX = '-select-modal';
        this.QE_CHART_ID = 'qe-chart';
        this.QE_CHART_GRID_ID = 'qe-chart-grid';
        this.QE_CHART_PAGE_ID = 'qe-chart-page';
        this.QE_WHERE_MODAL_SUFFIX = '-where-modal';

        this.QE_RECORD_DETAILS_MODAL_SUFFIX = '-record-details-modal';

        this.QE_FILTER_MODAL_SUFFIX = '-filter-modal';

        //Alarms labels
        this.ALARM_PREFIX_ID = 'alarms';
        this.ALARMS_BREADCRUMB_DROPDOWN = "alarms-breadcrumb-dropdown";
        this.ALARMS_LIST_ID = 'alarms-list-view';
        this.MONITOR_ALARMS_PAGE_ID = "monitor-alarms-page";
        this.ALARMS_GRID_ID = "monitor-alarms-grid";
        this.TITLE_ALARMS = "Alarms Dashboard";
        this.TITLE_ALARMS_SUMMARY = "Alarms";
        this.MONITOR_ALARM_LIST_ID = "monitor-alarm-list";
        this.MONITOR_ALARM_LIST_VIEW_ID = "monitor-alarm-list-view";
        this.TITLE_ACKNOWLEDGE = 'Acknowledge';
        this.TITLE_ALARM_HISTORY = 'Alarm History';
        this.TITLE_ALARM_DETAILS = 'Alarm Details';

        this.DASHBOARD_LOGS_URL = '/api/admin/reports/query?where=&filters=&level=4' + '&fromTimeUTC=now-10m&toTimeUTC=now&table=MessageTable&limit=10';
        this.CACHE_DASHBORAD_LOGS = 'cache-dashboard-logs';
    };

    function capitalizeSentence(sentence) {
        var word = sentence.split(" ");
        for ( var i = 0; i < word.length; i++ ) {
            word[i] = word[i].charAt(0).toUpperCase() + word[i].slice(1);
        }
        return word.join(" ");
    };

    return CoreLabels;
});
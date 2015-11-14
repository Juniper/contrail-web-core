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

        this.QE_FLOW_QUEUE_ID = "qe-flow-queue";
        this.QE_FLOW_QUEUE_GRID_ID = "qe-flow-queue-grid";
        this.QE_FLOW_QUEUE_TAB_ID = "qe-flow-queue-tab";
        this.TITLE_FLOW_QUERY_QUEUE = "Flow Query Queue";


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

        this.TITLE_DETAILS = "Details";
        this.TITLE_OVERVIEW = "Overview";
        this.TITLE_QE_SELECT = "Select";
        this.TITLE_CHART = "Chart";
        this.TITLE_QE_WHERE = "Where";
        this.TITLE_QE_FILTER = "Filter";

        this.TITLE_QUERY = "Query";
        this.TITLE_RESULTS = "Results";
        this.TITLE_CHART = "Chart";
        this.TITLE_FLOWS = "Flows";
        this.TITLE_FLOW_SERIES = "Flow Series";
        this.TITLE_FLOW_RECORD = "Flow Record";
        this.TITLE_FLOW_RECORD_DETAILS = "Flow Record Details";
        this.TITLE_FLOW_SERIES_RESULTS = "Flow Series Results";
        this.TITLE_STATS_QUERY = "Statistics Query";
        this.TITLE_OBJECT_LOGS = "Object Logs";
        this.TITLE_SYSTEM_LOGS = "System Logs";
        this.TITLE_CONSOLE_LOGS = "Console Logs";

        this.QE_SELECT_MODAL_SUFFIX = '-select-modal';
        this.QE_CHART_ID = 'qe-chart';
        this.QE_CHART_GRID_ID = 'qe-chart-grid';
        this.QE_CHART_PAGE_ID = 'qe-chart-page';
        this.QE_WHERE_MODAL_SUFFIX = '-where-modal';

        this.QE_RECORD_DETAILS_MODAL_SUFFIX = '-record-details-modal';

        this.QE_FILTER_MODAL_SUFFIX = '-filter-modal';
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
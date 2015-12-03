/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var CoreMessages = function () {
        this.getInvalidErrorMessage = function (fieldKey) {
            return "Please enter a valid " + cowl.getInLowerCase(fieldKey) + '.';
        };
        this.getShortInvalidErrorMessage = function (fieldKey) {
            return "Invalid " + cowl.getInLowerCase(fieldKey) + '.';
        };
        this.getRequiredMessage = function (fieldKey) {
            return cowl.getFirstCharUpperCase(fieldKey) + ' is required.';
        };
        this.getResolveErrorsMessage = function (fieldKey) {
            return "Please resolve all " + fieldKey + " errors.";
        };

        this.SHOULD_BE_VALID = '{0} should have valid ';

        this.get = function () {
            var args = arguments;
            return args[0].replace(/\{(\d+)\}/g, function (m, n) {
                n = parseInt(n) + 1;
                return args[n];
            });
        };

        this.DATA_FETCHING = "Fetching data..";
        this.DATA_ERROR = "Error in getting data.";
        this.DATA_SUCCESS_EMPTY = "No data available.";

        this.getRequestMessage = function(requestState) {
            if (requestState === cowc.DATA_REQUEST_STATE_FETCHING) {
                return cowm.DATA_FETCHING;
            } else if (requestState === cowc.DATA_REQUEST_STATE_ERROR) {
                return cowm.DATA_ERROR;
            } else if (requestState === cowc.DATA_REQUEST_STATE_SUCCESS_EMPTY) {
                return cowm.DATA_SUCCESS_EMPTY
            }
        };

        this.DEPRECATION_WARNING_PREFIX = "Contrail WebUI Warning: ";

        this.QE_MAX_QUERY_QUEUE_RESULT_VIEW_INFO = "Maximum 5 Query Results can be viewed. Please close the existing query results to view new queries from queue.";
        this.QE_QUERY_QUEUE_RESULT_ALREADY_LOADED = "Query Result has already been loaded.";
        this.QE_DELETE_QUERY_CONFIRM = "Are you sure you want to remove this query?";
        this.getQueryQueuedMessage = function(queueURL, queueType) {
            return 'Your query has been queued. <a class="hyperlink" href="' + queueURL + '">View ' + queueType + ' Queue</a>';
        }

    };
    return CoreMessages;
});
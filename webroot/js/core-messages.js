/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var CoreMessages = function () {
        this.getInvalidErrorMessage = function(fieldKey) {
            return "Please enter a valid " + cowl.getInLowerCase(fieldKey) + '.';
        };
        this.getShortInvalidErrorMessage = function(fieldKey) {
            return "Invalid " + cowl.getInLowerCase(fieldKey) + '.';
        };
        this.getRequiredMessage = function(fieldKey) {
            return cowl.getFirstCharUpperCase(fieldKey) + ' is required.';
        };
        this.getResolveErrorsMessage = function(fieldKey) {
            return "Please resolve all " + fieldKey + " errors.";
        };
        this.NO_PROJECT_FOUND = 'No Project Found.';
        this.NO_DOMAIN_FOUND = 'No Domain Found.';
        this.SHOULD_BE_VALID = '{0} should have a valid ';

        this.get = function () {
            var args = arguments;
            return args[0].replace(/\{(\d+)\}/g, function (m, n) {
                n = parseInt(n) + 1;
                return args[n];
            });
        };
    };
    return CoreMessages;
});
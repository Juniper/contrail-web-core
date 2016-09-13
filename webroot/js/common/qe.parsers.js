/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    return {
        fsQueryDataParser: function(response) {
            var chartData = [];

            $.each(response, function(fcKey, fcValue) {
                chartData.push({chart_group_id: fcKey, values: fcValue});

            });

            return chartData;
        }
    };
});

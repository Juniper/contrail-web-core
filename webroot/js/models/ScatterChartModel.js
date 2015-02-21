/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var ScatterChartModel = function() {
        var chart = nv.models.scatterChart()
            .showDistX(false)
            .showDistY(false)
            .sizeDomain([0.7,2])
            .tooltipXContent(null)
            .tooltipYContent(null)
            .showTooltipLines(false);

        return chart;
    };

    return ScatterChartModel;
});
/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var LineWithFocusChartModel = function () {
        var chart = nv.models.lineWithExtendedFocusChart()
                             .height2(options.height == 250 ? 70 : 90)
                             .margin2({top:10, right:30, bottom:20, left:60});

        return chart;
    }
    return LineWithFocusChartModel;
});
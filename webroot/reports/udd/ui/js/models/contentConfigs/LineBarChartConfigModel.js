/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define(function (require) {
    var ContentConfigModel = require("reports/udd/ui/js/models/ContentConfigModel.js");
    var cowc = require("core-constants");
    var cowf = new (require("core-formatters"));

    return ContentConfigModel.extend({
        defaultConfig: {
            barColor: "1f77b4",
            lineColor: "green",
            barLabel: "",
            barValue: "",
            lineLabel: "",
            lineValue: "",
            yAxisValues: [],
        },

        validations: {
            validation: {
                "barValue": {
                    required: true,
                },
                "lineValue": {
                    required: true,
                },
            },
        },

        // update fields dependent on data model
        onDataModelChange: function (viewModel) {
            var self = this;
            self.yAxisValues(viewModel.timeSeries());
        },

        toJSON: function () {
            var self = this;
            return {
                barColor: self.barColor(),
                lineColor: self.lineColor(),
                barLabel: self.barLabel(),
                barValue: self.barValue(),
                lineLabel: self.lineLabel(),
                lineValue: self.lineValue(),
            };
        },

        getParserOptions: function () {
            var self = this;
            return {
                parserName: "timeSeriesParser",
                dataFields: [self.barValue(), self.lineValue()],
            };
        },

        getContentViewOptions: function () {
            var self = this;
            return {
                chartOptions: {
                    axisLabelDistance: 5,
                    height: 300,
                    yAxisLabels: [self.barLabel(), self.lineLabel()],
                    colors: [self.barColor(), self.lineColor()],
                    forceY: [0, 10],
                    y1Formatter: cowf.getFormattedValue.bind(cowf, cowc.QUERY_COLUMN_FORMATTER[self.barValue()]),
                    y2Formatter: cowf.getFormattedValue.bind(cowf, cowc.QUERY_COLUMN_FORMATTER[self.lineValue()]),
                },
            };
        },
    });
});

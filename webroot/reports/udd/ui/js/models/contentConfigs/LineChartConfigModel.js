/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define(function(require) {
    var ContentConfigModel = require("reports/udd/ui/js/models/ContentConfigModel.js");
    var cowc = require("core-constants");
    var cowf = new(require("core-formatters"));

    return ContentConfigModel.extend({
        defaultConfig: {
            color: "1f77b4",
            yAxisLabel: "",
            yAxisValue: "",
            yAxisValueUnit: "",
            isInferredYAxisUnit: false,
            yAxisValues: [],
        },

        validations: {
            validation: {
                yAxisValue: {
                    required: true,
                },
            },
        },

        // update fields dependent on data model
        onDataModelChange: function(viewModel) {
            var self = this;
            self.yAxisValues(viewModel.timeSeries());
        },

        toJSON: function() {
            var self = this;
            return {
                color: self.color(),
                yAxisLabel: self.yAxisLabel(),
                yAxisValue: self.yAxisValue(),
                yAxisValueUnit: self.yAxisValueUnit(),
                isInferredYAxisUnit: self.isInferredYAxisUnit()
            };
        },

        getParserOptions: function() {
            var self = this;
            return {
                parserName: "timeSeriesParser",
                dataFields: [self.yAxisValue()],
            };
        },

        getContentViewOptions: function() {
            var self = this;
            return {
                chartOptions: {
                    axisLabelDistance: 5,
                    height: 300,
                    yAxisLabel: self.yAxisLabel(),
                    colors: [self.color()],
                    forceY: [0, 10],
                    yFormatter: cowf.getFormattedValue.bind(cowf, [{
                        format: cowc.QUERY_COLUMN_FORMATTER[self.yAxisValue()],
                        options: {
                            unit: self.yAxisValueUnit()
                        }
                    }]),
                },
            };
        },
    });
});

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
            this.yAxisValues(this.timeSeries(viewModel.get("select")));
        },

        toJSON: function() {
            return {
                color: this.color(),
                yAxisLabel: this.yAxisLabel(),
                yAxisValue: this.yAxisValue(),
                yAxisValueUnit: this.yAxisValueUnit(),
                isInferredYAxisUnit: this.isInferredYAxisUnit()
            };
        },

        getParserOptions: function() {
            return {
                dataFields: [this.yAxisValue()],
            };
        },

        chartDataParser: function(data) {
            var dataSeries = cowu.timeSeriesParser({dataFields: [this.yAxisValue()]}, data);

            if (dataSeries.length === 0) {
                dataSeries[0] = {};
                dataSeries[0].values = [];
            }
            dataSeries[0].key = this.yAxisLabel();
            dataSeries[0].color = this.color();

            return dataSeries;
        },

        getContentViewOptions: function() {
            return {
                parseFn: this.chartDataParser.bind(this),
                chartOptions: {
                    axisLabelDistance: 5,
                    height: 300,
                    yAxisLabel: this.yAxisLabel(),
                    colors: [this.color()],
                    forceY: [0, 10],
                    yFormatter: cowf.getFormattedValue.bind(cowf, [{
                        format: cowc.QUERY_COLUMN_FORMATTER[this.yAxisValue()],
                        options: {
                            unit: this.yAxisValueUnit()
                        }
                    }]),
                },
            };
        },
    });
});

/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define(function(require) {
    var ContentConfigModel = require("reports/udd/ui/js/models/ContentConfigModel.js");
    var cowc = require("core-constants");
    var cowf = new(require("core-formatters"));

    return ContentConfigModel.extend({
        defaultConfig: {
            barColor: "1f77b4",
            lineColor: "green",
            barLabel: "",
            barValue: "",
            barValueUnit: "",
            isInferredBarUnit: false,
            lineLabel: "",
            lineValue: "",
            lineValueUnit: "",
            isInferredLineUnit: false,
            yAxisValues: []
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
        onDataModelChange: function(viewModel) {
            this.yAxisValues(this.timeSeries(viewModel.get("select")));
        },

        toJSON: function() {
            return {
                barColor: this.barColor(),
                lineColor: this.lineColor(),
                barLabel: this.barLabel(),
                barValue: this.barValue(),
                barValueUnit: this.barValueUnit(),
                isInferredBarUnit: this.isInferredBarUnit(),
                lineLabel: this.lineLabel(),
                lineValue: this.lineValue(),
                lineValueUnit: this.lineValueUnit(),
                isInferredLineUnit: this.isInferredLineUnit()
            };
        },

        // Todo: do we need this parserOptions?
        getParserOptions: function() {
            return {
                dataFields: [this.barValue(), this.lineValue()],
            };
        },

        chartDataParser: function(data) {
            // Todo: have better definition of timeSeriesParser
            var dataSeries = cowu.timeSeriesParser({dataFields: [this.barValue(), this.lineValue()]}, data);
            
            if (dataSeries.length === 0) {
                dataSeries[0] = {values: []};
                dataSeries[1] = {values: []};
            }

            // Since we passed bar value as first index in dataFields, return dataSeries maintains the order.
            dataSeries[0].key = this.barLabel();
            dataSeries[0].color = this.barColor();
            dataSeries[0].bar = true;
            dataSeries[1].key = this.lineLabel();
            dataSeries[1].color = this.lineColor();

            return dataSeries;
        },

        getContentViewOptions: function() {
            return {
                // loadChartInChunks: true,
                parseFn: this.chartDataParser.bind(this),
                chartOptions: {
                    axisLabelDistance: 5,
                    height: 300,
                    yAxisLabels: [this.barLabel(), this.lineLabel()],
                    colors: [this.barColor(), this.lineColor()],
                    forceY: [0, 10],
                    y1Formatter: cowf.getFormattedValue.bind(cowf, [{
                        format: cowc.QUERY_COLUMN_FORMATTER[this.barValue()],
                        options: {
                            unit: this.barValueUnit()
                        }
                    }]),
                    y2Formatter: cowf.getFormattedValue.bind(cowf, [{
                        format: cowc.QUERY_COLUMN_FORMATTER[this.lineValue()],
                        options: {
                            unit: this.lineValueUnit()
                        }
                    }]),
                }
            };
        }
    });
});

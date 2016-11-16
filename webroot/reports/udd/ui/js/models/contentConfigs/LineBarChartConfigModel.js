/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    "core-constants",
    "core-basedir/reports/udd/ui/js/common/udd.form.validation.config",
    "core-basedir/reports/udd/ui/js/models/ContentConfigModel"
], function(cowc, formValidationConfig, ContentConfigModel) {

    return ContentConfigModel.extend({
        constructor: function(modelConfig, modelRemoteDataConfig) {
            ContentConfigModel.prototype.constructor.call(this, modelConfig, modelRemoteDataConfig);
            
            if (this.barLabel() === "") {
                this.barValue.subscribe(function(newValue) {
                    this.barLabel(newValue);
                }, this);
            }

            if (this.lineLabel() === "") {
                this.lineValue.subscribe(function(newValue) {
                    this.lineLabel(newValue);
                }, this);
            }
        },
        defaultConfig: {
            barColor:  cowc.D3_COLOR_CATEGORY5[1],
            lineColor: cowc.D3_COLOR_CATEGORY5[3],
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
            var UIAddedParams = viewModel.get("ui_added_parameters"),
                plottableFields = viewModel.get("select");

            if (UIAddedParams) {
                var columnSchemaMap = viewModel.get("ui_added_parameters").table_schema_column_names_map;
                
                plottableFields = formValidationConfig
                    .getPlottableFields(plottableFields, columnSchemaMap);
            }

            this.yAxisValues(this.timeSeries(plottableFields));
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
                    y1AxisLabel: this.barLabel(),
                    y2AxisLabel: this.lineLabel(),
                    colors: [this.barColor(), this.lineColor()],
                    forceY: [0, 10],
                    y1Formatter: window.cowf.getFormattedValue.bind(window.cowf, [{
                        format: cowc.QUERY_COLUMN_FORMATTER[this.barValue()],
                        options: {
                            unit: this.barValueUnit()
                        }
                    }]),
                    y2Formatter: window.cowf.getFormattedValue.bind(window.cowf, [{
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

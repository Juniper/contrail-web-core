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
            
            if (this.yAxisLabel() === "") {
                this.yAxisValue.subscribe(function(newValue) {
                    this.yAxisLabel(newValue);
                }, this);
            }
        },
        defaultConfig: {
            color: cowc.D3_COLOR_CATEGORY5[3],
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
                    height: 288,
                    yAxisLabel: this.yAxisLabel(),
                    colors: [this.color()],
                    forceY: [0, 10],
                    yFormatter: window.cowf.getFormattedValue.bind(window.cowf, [{
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

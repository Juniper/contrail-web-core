/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
/*
 * Configuration View for customizing LineWithFocusChartView
 */
define([
    "knockout",
    "knockback",
    "validation",
    "core-constants",
    "/reports/udd/ui/js/views/BaseContentConfigView.js"
], function(ko, kb, kbValidation, coreConstants, BaseContentConfigView) {
    return BaseContentConfigView.extend({
        render: function() {
            this.renderView4Config(this.$el, this.model, this.getViewConfig(), "validation",
                null, null,
                function() {
                    var inferredFormatterKey = "inferred";

                    kb.applyBindings(this.model, this.$el[0]);
                    kbValidation.bind(this);

                    this.model.yAxisValue.subscribe(function(newValue) {
                        this.model.isInferredYAxisUnit(coreConstants.QUERY_COLUMN_FORMATTER[newValue] === inferredFormatterKey);
                    }, this);
                }.bind(this));
        },

        getViewConfig: function() {
            return {
                view: "SectionView",
                viewConfig: {
                    rows: [{
                        columns: [{
                            elementId: "color",
                            view: "FormInputView",
                            viewConfig: {
                                label: window.cowl.CHART_LINE_COLOR,
                                path: "color",
                                dataBindValue: "color",
                                class: "col-xs-6"
                            }
                        }, {
                            elementId: "yAxisLabel",
                            view: "FormInputView",
                            viewConfig: {
                                label: window.cowl.CHART_Y_AXIS_LABEL,
                                path: "yAxisLabel",
                                dataBindValue: "yAxisLabel",
                                class: "col-xs-6"
                            }
                        }]
                    }, {
                        columns: [{
                            elementId: "yAxisValue",
                            view: "FormDropdownView",
                            viewConfig: {
                                label: window.cowl.CHART_Y_AXIS_VALUE,
                                path: "yAxisValue",
                                dataBindValue: "yAxisValue",
                                dataBindOptionList: "yAxisValues",
                                class: "col-xs-6",
                                elementConfig: {
                                    placeholder: window.cowl.CHART_Y_AXIS_VALUE_PLACEHOLDER,
                                    defaultValueId: 0
                                }
                            }
                        }, {
                            elementId: "yAxisValueUnit",
                            view: "FormDropdownView",
                            viewConfig: {
                                visible: "isInferredYAxisUnit",
                                label: window.cowl.CHART_Y_AXIS_VALUE_UNIT,
                                path: "yAxisValueUnit",
                                dataBindValue: "yAxisValueUnit",
                                class: "col-xs-6",
                                elementConfig: {
                                    dataTextField: "text",
                                    dataValueField: "id",
                                    data: coreConstants.INFERRED_UNIT_TYPES,
                                    placeholder: window.cowl.CHART_Y_AXIS_VALUE_UNIT_PLACEHOLDER,
                                    defaultValueId: 1
                                }
                            }
                        }]
                    }]
                }
            };
        }
    });
});

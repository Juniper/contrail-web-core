/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
/*
 * Configuration View for customizing LineBarWithFocusChartView
 */
define([
    "knockout",
    "knockback",
    "validation",
    "core-constants",
    "core-basedir/reports/udd/ui/js/views/BaseContentConfigView"
], function(ko, kb, kbValidation, coreConstants, BaseContentConfigView) {
    return BaseContentConfigView.extend({
        render: function() {
            this.renderView4Config(this.$el, this.model, this.getViewConfig(), "validation",
                null, null,
                function() {
                    var inferredFormatterKey = "inferred";

                    kb.applyBindings(this.model, this.$el[0]);
                    kbValidation.bind(this);

                    this.model.barValue.subscribe(function(newValue) {
                        this.model.isInferredBarUnit(coreConstants.QUERY_COLUMN_FORMATTER[newValue] === inferredFormatterKey);
                    }, this);
                    this.model.lineValue.subscribe(function(newValue) {
                        this.model.isInferredLineUnit(coreConstants.QUERY_COLUMN_FORMATTER[newValue] === inferredFormatterKey);
                    }, this);
                }.bind(this));
        },

        getViewConfig: function() {
            return {
                view: "SectionView",
                viewConfig: {
                    rows: [{
                        columns: [{
                            elementId: "barColor",
                            view: "FormInputView",
                            viewConfig: {
                                label: window.cowl.CHART_BAR_COLOR,
                                path: "barColor",
                                dataBindValue: "barColor",
                                class: "col-xs-6"
                            }
                        }, {
                            elementId: "lineColor",
                            view: "FormInputView",
                            viewConfig: {
                                label: window.cowl.CHART_LINE_COLOR,
                                path: "lineColor",
                                dataBindValue: "lineColor",
                                class: "col-xs-6"
                            }
                        }]
                    }, {
                        columns: [{
                            elementId: "barLabel",
                            view: "FormInputView",
                            viewConfig: {
                                label: window.cowl.CHART_BAR_LABEL,
                                path: "barLabel",
                                dataBindValue: "barLabel",
                                class: "col-xs-6"
                            }
                        }, {
                            elementId: "lineLabel",
                            view: "FormInputView",
                            viewConfig: {
                                label: window.cowl.CHART_LINE_LABEL,
                                path: "lineLabel",
                                dataBindValue: "lineLabel",
                                class: "col-xs-6"
                            }
                        }]
                    }, {
                        columns: [{
                            elementId: "barValue",
                            view: "FormDropdownView",
                            viewConfig: {
                                label: window.cowl.CHART_BAR_VALUE,
                                path: "barValue",
                                dataBindValue: "barValue",
                                dataBindOptionList: "yAxisValues",
                                class: "col-xs-6",
                                elementConfig: {
                                    placeholder: window.cowl.CHART_BAR_VALUE_PLACEHOLDER,
                                    defaultValueId: 0
                                }
                            }
                        }, {
                            elementId: "lineValue",
                            view: "FormDropdownView",
                            viewConfig: {
                                label: window.cowl.CHART_LINE_VALUE,
                                path: "lineValue",
                                dataBindValue: "lineValue",
                                dataBindOptionList: "yAxisValues",
                                class: "col-xs-6",
                                elementConfig: {
                                    placeholder: window.cowl.CHART_LINE_VALUE_PLACEHOLDER,
                                    defaultValueId: 1
                                }
                            }
                        }]
                    }, {
                        columns: [{
                            elementId: "barValueUnit",
                            view: "FormDropdownView",
                            viewConfig: {
                                visible: "isInferredBarUnit",
                                label: window.cowl.CHART_BAR_VALUE_UNIT,
                                path: "barValueUnit",
                                dataBindValue: "barValueUnit",
                                class: "col-xs-6",
                                elementConfig: {
                                    dataTextField: "text",
                                    dataValueField: "id",
                                    data: coreConstants.INFERRED_UNIT_TYPES,
                                    placeholder: window.cowl.CHART_BAR_VALUE_UNIT_PLACEHOLDER,
                                    defaultValueId: 1
                                }
                            }
                        }, {
                            elementId: "lineValueUnit",
                            view: "FormDropdownView",
                            viewConfig: {
                                visible: "isInferredLineUnit",
                                label: window.cowl.CHART_LINE_VALUE_UNIT,
                                path: "lineValueUnit",
                                dataBindValue: "lineValueUnit",
                                class: "col-xs-6",
                                elementConfig: {
                                    dataTextField: "text",
                                    dataValueField: "id",
                                    data: coreConstants.INFERRED_UNIT_TYPES,
                                    placeholder: window.cowl.CHART_LINE_VALUE_UNIT_PLACEHOLDER,
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

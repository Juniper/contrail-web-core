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
    "contrail-view"
], function(ko, kb, kbValidation, coreConstants, ContrailView) {
    var LineChartConfigView = ContrailView.extend({
        render: function() {
            var self = this;

            self.renderView4Config(self.$el, self.model, self.getViewConfig(), "validation",
                null, null,
                function() {
                    var inferredFormatterKey = "inferred";

                    kb.applyBindings(self.model, self.$el[0]);
                    kbValidation.bind(self);

                    self.model.yAxisValue.subscribe(function(newValue) {
                        self.model.isInferredYAxisUnit(cowc.QUERY_COLUMN_FORMATTER[newValue] === inferredFormatterKey);
                    });
                });
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
                                label: cowl.CHART_LINE_COLOR,
                                path: "color",
                                dataBindValue: "color",
                                class: "col-xs-6",
                            },
                        }, {
                            elementId: "yAxisLabel",
                            view: "FormInputView",
                            viewConfig: {
                                label: cowl.CHART_Y_AXIS_LABEL,
                                path: "yAxisLabel",
                                dataBindValue: "yAxisLabel",
                                class: "col-xs-6",
                            },
                        }],
                    }, {
                        columns: [{
                            elementId: "yAxisValue",
                            view: "FormDropdownView",
                            viewConfig: {
                                label: cowl.CHART_Y_AXIS_VALUE,
                                path: "yAxisValue",
                                dataBindValue: "yAxisValue",
                                dataBindOptionList: "yAxisValues",
                                class: "col-xs-6",
                                elementConfig: {
                                    placeholder: cowl.CHART_Y_AXIS_VALUE_PLACEHOLDER,
                                    defaultValueId: 0,
                                },
                            },
                        }, {
                            elementId: "yAxisValueUnit",
                            view: "FormDropdownView",
                            viewConfig: {
                                visible: "isInferredYAxisUnit",
                                label: cowl.CHART_Y_AXIS_VALUE_UNIT,
                                path: "yAxisValueUnit",
                                dataBindValue: "yAxisValueUnit",
                                class: "col-xs-6",
                                elementConfig: {
                                    dataTextField: "text",
                                    dataValueField: "id",
                                    data: coreConstants.INFERRED_UNIT_TYPES,
                                    placeholder: cowl.CHART_Y_AXIS_VALUE_UNIT_PLACEHOLDER,
                                    defaultValueId: 1
                                }
                            }
                        }],
                    }],
                },
            };
        },

        remove: function() {
            var self = this;
            kb.release(self.model, self.$el[0]);
            ko.cleanNode(self.$el[0]);
            kbValidation.unbind(self);
            self.$el.empty().off(); // off to unbind the events
            self.stopListening();
            return self;
        },
    });
    return LineChartConfigView;
});

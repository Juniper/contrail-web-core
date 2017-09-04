/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
define([
    "lodash",
    "knockout",
    "knockback",
    "validation",
    "core-constants",
    "core-labels",
    "query-form-view",
    "core-basedir/reports/udd/ui/js/common/udd.constants",
    "core-basedir/reports/qe/ui/js/common/qe.utils"
], function(_, ko, kb, kbValidation, coreConstants, coreLabelProcessor, QueryFormView, uddConstants, qeUtils) {
    var advancedFormFields = ["where", "filters"];

    var QueryConfigView = QueryFormView.extend({
        initialize: function() {
            this.listenTo(this.model.model(), "validated:invalid", function(model, errors) {
                var invalidFields = _.keys(errors),
                    invalidAdvanced = _.intersection(advancedFormFields, invalidFields);

                if (!_.isEmpty(invalidAdvanced)
                    && !model.show_advanced_options) {
                    model.set("show_advanced_options", true);
                }
            });
        },
        render: function() {
            this.renderView4Config(this.$el, this.model, this.getViewConfig(),
                coreConstants.KEY_RUN_QUERY_VALIDATION, null, null,
                function() {
                    kb.applyBindings(this.model, this.$el[0]);
                    kbValidation.bind(this, {
                        valid: function(view, attr, selector) {
                            view.$("[" + selector + "~='" + attr + "']")
                                .removeClass("invalid")
                                .trigger("change")
                                .trigger("focusout");
                            // Trigger "change" and "focusout" events to
                            // force ContrailModel update the errors observable.
                            // For example, check FormDropDown's template,
                            // it has a change event binding whose handler is defined
                            // by ContrailModel and updates the errors observable.
                        }
                    });
                }.bind(this));
        },

        getViewConfig: function() {
            return {
                view: "SectionView",
                viewConfig: {
                    rows: [{
                        columns: [{
                            elementId: "table_type",
                            view: "FormDropdownView",
                            viewConfig: {
                                path: "table_type",
                                dataBindValue: "table_type",
                                class: "col-xs-6",
                                elementConfig: {
                                    dataTextField: "text",
                                    dataValueField: "id",
                                    data: coreConstants.TABLE_TYPES,
                                },
                            },
                        }, {
                            elementId: "time_range",
                            view: "FormDropdownView",
                            viewConfig: {
                                path: "time_range",
                                dataBindValue: "time_range",
                                class: "col-xs-6",
                                elementConfig: {
                                    dataTextField: "text",
                                    dataValueField: "id",
                                    data: uddConstants.uddWidget.TIMERANGE_DROPDOWN_VALUES_WO_CUSTOM,
                                },
                            },
                        }],
                    }, {
                        viewConfig: {
                            visible: 'isAttrAvailable("table_type") && (table_type() === "'
                                + coreConstants.QE_STAT_TABLE_TYPE
                                + '" || table_type() === "'
                                + coreConstants.QE_FLOW_TABLE_TYPE
                                + '" || table_type() === "'
                                + coreConstants.QE_OBJECT_TABLE_TYPE
                                + '")',
                        },
                        columns: [{
                            elementId: "table_name",
                            view: "FormComboboxView",
                            viewConfig: {
                                label: coreLabelProcessor.TITLE_QE_ACTIVE_TABLE,
                                path: "table_name",
                                dataBindValue: "table_name",
                                dataBindOptionList: "table_name_data_object().data",
                                class: "col-xs-12",
                                disabled: "table_name_data_object().data.length === 0",
                                dataState: {
                                    fetching: {
                                        visible: "table_name_data_object().status === '" + coreConstants.DATA_REQUEST_STATE_FETCHING + "'",
                                        text: "Fetching Data"
                                    },
                                    error: {
                                        visible: "table_name_data_object().status === '" + coreConstants.DATA_REQUEST_STATE_ERROR + "'",
                                        text: "Error in Fetching Data"
                                    }
                                },
                                elementConfig: {
                                    defaultValueId: 0,
                                    allowClear: false,
                                    placeholder: coreLabelProcessor.QE_SELECT_STAT_TABLE,
                                    dataTextField: "name",
                                    dataValueField: "name"
                                },
                            },
                        } ],
                    }, {
                        viewConfig: {
                            visible: 'isAttrAvailable("table_type") && table_type() === "' + coreConstants.QE_LOG_TABLE_TYPE + '"',
                        },
                        columns: [{
                            elementId: "log_level",
                            view: "FormDropdownView",
                            viewConfig: {
                                path: "log_level",
                                dataBindValue: "log_level",
                                class: "col-xs-6",
                                elementConfig: {
                                    dataTextField: "name",
                                    dataValueField: "value",
                                    data: coreConstants.QE_LOG_LEVELS,
                                },
                            },
                        }],
                    }, {
                        viewConfig: {
                            visible: 'isAttrAvailable("table_name")',
                        },
                        columns: [{
                            elementId: "select",
                            view: "FormTextAreaView",
                            viewConfig: {
                                path: "select",
                                dataBindValue: "select",
                                class: "col-xs-12",
                                editPopupConfig: {
                                    renderEditFn: function() {
                                        var tableName = this.model.table_name();
                                        this.renderSelect({ className: qeUtils.getModalClass4Table(tableName) });
                                    }.bind(this),
                                },
                            },
                        }, {
                            elementId: "time-granularity-section",
                            view: "FormCompositeView",
                            viewConfig: {
                                class: "col-xs-6",
                                style: "display: none;",
                                path: "time_granularity",
                                label: coreLabelProcessor.TITLE_QE_TIME_GRANULARITY,
                                visible: "isSelectTimeChecked()",
                                childView: [{
                                    elementId: "time_granularity",
                                    view: "FormNumericTextboxView",
                                    viewConfig: {
                                        label: false,
                                        path: "time_granularity",
                                        dataBindValue: "time_granularity",
                                        class: "col-xs-6",
                                        elementConfig: { min: 1 },
                                    },
                                }, {
                                    elementId: "time_granularity_unit",
                                    view: "FormDropdownView",
                                    viewConfig: {
                                        visibile: '(table_type() !== "'
                                            + coreConstants.QE_FLOW_TABLE_TYPE
                                            + '" && table_name() !== "'
                                            + coreConstants.QE_OBJECT_TABLE_TYPE
                                            + '") || table_name() !== "'
                                            + coreConstants.FLOW_RECORD_TABLE + '"',
                                        label: false,
                                        path: "time_granularity_unit",
                                        dataBindValue: "time_granularity_unit",
                                        dataBindOptionList: "getTimeGranularityUnits()",
                                        class: "col-xs-6",
                                        elementConfig: {},
                                    },
                                } ],
                            },
                        } ],
                    }, {
                        viewConfig: {
                            visible: 'show_advanced_options() && isAttrAvailable("table_name")',
                        },
                        columns: [{
                            elementId: "where",
                            view: "FormTextAreaView",
                            viewConfig: {
                                path: "where",
                                dataBindValue: "where",
                                class: "col-xs-12",
                                placeHolder: "*",
                                editPopupConfig: {
                                    renderEditFn: function() {
                                        this.renderWhere({ className: coreConstants.QE_MODAL_CLASS_700 });
                                    }.bind(this),
                                },
                            },
                        } ],
                    }, {
                        viewConfig: {
                            visible: 'show_advanced_options() && isAttrAvailable("table_name")',
                        },
                        columns: [{
                            elementId: "filters",
                            view: "FormTextAreaView",
                            viewConfig: {
                                path: "filters",
                                dataBindValue: "filters",
                                class: "col-xs-12",
                                label: coreLabelProcessor.TITLE_QE_FILTER,
                                editPopupConfig: {
                                    renderEditFn: function() {
                                        this.renderFilters({ className: coreConstants.QE_MODAL_CLASS_700 });
                                    }.bind(this),
                                },
                            },
                        } ],
                    }, {
                        viewConfig: {
                            visible: 'show_advanced_options() && isAttrAvailable("table_name") && table_type() === "' + coreConstants.QE_FLOW_TABLE_TYPE + '"'
                        },
                        columns: [{
                            elementId: "direction",
                            view: "FormDropdownView",
                            viewConfig: {
                                path: "direction",
                                dataBindValue: "direction",
                                class: "col-xs-12",
                                elementConfig: {
                                    dataTextField: "text",
                                    dataValueField: "id",
                                    data: coreConstants.DIRECTION_DROPDOWN_VALUES
                                }
                            }
                        }]
                    }, {
                        viewConfig: {
                            visible: 'isAttrAvailable("table_name")',
                        },
                        columns: [{
                            elementId: "advanced_options",
                            view: "FormTextView",
                            viewConfig: {
                                text: "getAdvancedOptionsText()",
                                class: "col-xs-6 margin-0-0-10",
                                elementConfig: {
                                    class: "advanced-options-link",
                                },
                                click: "toggleAdvancedFields"
                            },
                        } ],
                    } ],
                },
            };
        },

        remove: function() {
            kb.release(this.model, this.$el[0]);
            
            kbValidation.unbind(this);
            
            this.$el.empty().off(); // off to unbind the events
            
            ko.cleanNode(this.$el[0]);
            
            this.stopListening();
            
            return this;
        },
    });

    return QueryConfigView;
});

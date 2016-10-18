/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
define([
    "knockout",
    "knockback",
    "validation",
    "core-constants",
    "core-labels",
    "core-basedir/reports/qe/ui/js/common/qe.utils",
    "query-form-view"
], function(ko, kb, kbValidation, coreConstants, coreLabelProcessor,
    qeUtils, QueryFormView) {
    var QueryConfigView = QueryFormView.extend({
        render: function() {
            var self = this;

            self.renderView4Config(self.$el, self.model, self.getViewConfig(),
                coreConstants.KEY_RUN_QUERY_VALIDATION, null, null,
                function() {
                    kb.applyBindings(self.model, self.$el[0]);
                    kbValidation.bind(self);
                });
        },

        getViewConfig: function() {
            var self = this;
            return {
                view: "SectionView",
                viewConfig: {
                    rows: [{
                        columns: [{
                            elementId: "time_range",
                            view: "FormDropdownView",
                            viewConfig: {
                                path: "time_range",
                                dataBindValue: "time_range",
                                class: "col-xs-6",
                                elementConfig: {
                                    dataTextField: "text",
                                    dataValueField: "id",
                                    data: coreConstants.TIMERANGE_DROPDOWN_VALUES_WO_CUSTOM,
                                },
                            },
                        }],
                    }, {
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
                                        visible: "table_name_data_object().status === '" + cowc.DATA_REQUEST_STATE_FETCHING + "'",
                                        text: "Fetching Data"
                                    },
                                    error: {
                                        visible: "table_name_data_object().status === '" + cowc.DATA_REQUEST_STATE_ERROR + "'",
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
                        }, {
                            elementId: "keywords",
                            view: "FormInputView",
                            viewConfig: {
                                path: "keywords",
                                dataBindValue: "keywords",
                                class: "col-xs-6",
                                placeholder: coreLabelProcessor.TITLE_QE_KEYWORDS_PLACEHOLDER,
                            },
                        } ],
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
                                        var tableName = self.model.table_name();
                                        self.renderSelect({ className: qeUtils.getModalClass4Table(tableName) });
                                    },
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
                                        self.renderWhere({ className: coreConstants.QE_MODAL_CLASS_700 });
                                    },
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
                                        self.renderFilters({ className: coreConstants.QE_MODAL_CLASS_700 });
                                    },
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
            var self = this;
            kb.release(self.model, self.$el[0]);
            kbValidation.unbind(self);
            self.$el.empty().off(); // off to unbind the events
            ko.cleanNode(self.$el[0]);
            self.stopListening();
            return self;
        },
    });

    return QueryConfigView;
});

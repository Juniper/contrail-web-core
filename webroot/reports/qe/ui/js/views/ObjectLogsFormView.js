/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    "knockback",
    "validation",
    "layout-handler",
    "query-form-view",
    "core-basedir/reports/qe/ui/js/models/ObjectLogsFormModel",
    "core-basedir/reports/qe/ui/js/common/qe.utils"
], function(kb, kbValidation, LayoutHandler, QueryFormView, ObjectLogsFormModel, qeUtils) {
    var layoutHandler = new LayoutHandler();

    var ObjectLogsFormView = QueryFormView.extend({
        render: function() {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                queryPageTmpl = contrail.getTemplate4Id(ctwc.TMPL_QUERY_PAGE),
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                hashParams = layoutHandler.getURLHashParams(),
                queryPrefix = cowc.OBJECT_LOGS_PREFIX,
                queryType = contrail.checkIfExist(hashParams.queryType) ? hashParams.queryType : null,
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ? viewConfig.widgetConfig : null,
                queryFormId = cowc.QE_HASH_ELEMENT_PREFIX + cowc.OBJECT_LOGS_PREFIX + cowc.QE_FORM_SUFFIX,
                objectLogsId = cowl.QE_OBJECT_LOGS_ID,
                queryFormAttributes = contrail.checkIfExist(hashParams.queryFormAttributes) ? hashParams.queryFormAttributes : {};

            if (queryType === cowc.QUERY_TYPE_MODIFY) {
                queryFormAttributes.time_range = parseInt(queryFormAttributes.time_range);
                queryFormAttributes.from_time = parseInt(queryFormAttributes.from_time_utc);
                queryFormAttributes.to_time = parseInt(queryFormAttributes.to_time_utc);
            }

            self.model = new ObjectLogsFormModel(queryFormAttributes);
            self.$el.append(queryPageTmpl({ queryPrefix: cowc.OBJECT_LOGS_PREFIX }));

            self.renderView4Config($(self.$el).find(queryFormId), this.model, self.getViewConfig(),
                cowc.KEY_RUN_QUERY_VALIDATION, null, modelMap,
                function() {
                    self.model.showErrorAttr(objectLogsId, false);
                    kb.applyBindings(self.model, document.getElementById(objectLogsId));
                    kbValidation.bind(self);
                    $("#run_query").on("click", function() {
                        if (self.model.model().isValid(true, cowc.KEY_RUN_QUERY_VALIDATION)) {
                            self.renderQueryResult();
                        }
                    });

                    qeUtils.adjustHeight4FormTextarea(queryPrefix);

                    if (queryType === cowc.QUERY_TYPE_RERUN) {
                        self.renderQueryResult();
                    }
                });

            if (widgetConfig !== null) {
                self.renderView4Config($(queryFormId), self.model, widgetConfig, null, null, null);
            }
        },

        renderQueryResult: function() {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ? viewConfig.widgetConfig : null,
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                queryFormModel = self.model,
                queryFormId = cowc.QE_HASH_ELEMENT_PREFIX + cowc.OBJECT_LOGS_PREFIX + cowc.QE_FORM_SUFFIX,
                queryResultId = cowc.QE_HASH_ELEMENT_PREFIX + cowc.OBJECT_LOGS_PREFIX + cowc.QE_RESULTS_SUFFIX,
                queryResultTabId = cowl.QE_OBJECT_LOGS_TAB_ID;

            if (widgetConfig !== null) {
                $(queryFormId).parents(".widget-box").data("widget-action").collapse();
            }

            queryFormModel.is_request_in_progress(true);
            qeUtils.fetchServerCurrentTime(function(serverCurrentTime) {
                var queryRequestPostData = queryFormModel.getQueryRequestPostData(serverCurrentTime);

                self.renderView4Config($(queryResultId), self.model,
                    getQueryResultTabViewConfig(queryRequestPostData, queryResultTabId), null, null, modelMap,
                    function() {
                        var queryResultListModel = modelMap[cowc.UMID_QUERY_RESULT_LIST_MODEL];

                        queryResultListModel.onAllRequestsComplete.subscribe(function() {
                            queryFormModel.is_request_in_progress(false);
                        });
                    });
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
                                class: "col-xs-3",
                                elementConfig: { dataTextField: "text", dataValueField: "id", data: cowc.TIMERANGE_DROPDOWN_VALUES }
                            }
                        }, {
                            elementId: "from_time",
                            view: "FormDateTimePickerView",
                            viewConfig: {
                                style: "display: none;",
                                path: "from_time",
                                dataBindValue: "from_time",
                                class: "col-xs-3",
                                elementConfig: qeUtils.getFromTimeElementConfig("from_time", "to_time"),
                                visible: "isTimeRangeCustom()"
                            }
                        }, {
                            elementId: "to_time",
                            view: "FormDateTimePickerView",
                            viewConfig: {
                                style: "display: none;",
                                path: "to_time",
                                dataBindValue: "to_time",
                                class: "col-xs-3",
                                elementConfig: qeUtils.getToTimeElementConfig("from_time", "to_time"),
                                visible: "isTimeRangeCustom()"
                            }
                        }]
                    }, {
                        columns: [{
                            elementId: "table_name",
                            view: "FormComboboxView",
                            viewConfig: {
                                label: "Active Table",
                                path: "table_name",
                                dataBindValue: "table_name",
                                dataBindOptionList: "table_name_data_object().data",
                                class: "col-xs-6",
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
                                    placeholder: cowl.QE_SELECT_OBJECT_TABLE,
                                    dataTextField: "name",
                                    dataValueField: "name",
                                }
                            }
                        }]
                    }, {
                        viewConfig: {
                            visible: "isTableNameAvailable()"
                        },
                        columns: [{
                            elementId: "select",
                            view: "FormTextAreaView",
                            viewConfig: {
                                path: "select",
                                dataBindValue: "select",
                                class: "col-xs-9",
                                editPopupConfig: {
                                    renderEditFn: function() {
                                        var tableName = self.model.table_name();
                                        self.renderSelect({ className: qeUtils.getModalClass4Table(tableName) });
                                    }
                                }
                            }
                        }]
                    }, {
                        viewConfig: {
                            visible: "show_advanced_options() && isTableNameAvailable()"
                        },
                        columns: [{
                            elementId: "where",
                            view: "FormTextAreaView",
                            viewConfig: {
                                path: "where",
                                dataBindValue: "where",
                                class: "col-xs-9",
                                placeHolder: "*",
                                editPopupConfig: {
                                    renderEditFn: function() {
                                        self.renderWhere({ className: cowc.QE_MODAL_CLASS_700 });
                                    }
                                }
                            }
                        }]
                    }, {
                        viewConfig: {
                            visible: "show_advanced_options() && isTableNameAvailable()"
                        },
                        columns: [{
                            elementId: "filters",
                            view: "FormTextAreaView",
                            viewConfig: {
                                path: "filters",
                                dataBindValue: "filters",
                                class: "col-xs-9",
                                label: cowl.TITLE_QE_FILTER,
                                editPopupConfig: {
                                    renderEditFn: function() {
                                        self.renderFilters({ className: cowc.QE_MODAL_CLASS_700 });
                                    }
                                }
                            }
                        }]
                    }, {
                        viewConfig: {
                            visible: "isTableNameAvailable()"
                        },
                        columns: [{
                            elementId: "advanced_options",
                            view: "FormTextView",
                            viewConfig: {
                                text: "getAdvancedOptionsText()",
                                class: "col-xs-6 margin-0-0-10",
                                elementConfig: {
                                    class: "advanced-options-link"
                                },
                                click: "toggleAdvancedFields"
                            }
                        }]
                    }, {
                        columns: [{
                            elementId: "run_query",
                            view: "FormButtonView",
                            label: "Run Query",
                            viewConfig: {
                                class: "display-inline-block margin-0-0-0-15",
                                disabled: "is_request_in_progress()",
                                elementConfig: {
                                    btnClass: "btn-primary"
                                }
                            }
                        }, {
                            elementId: "reset_query",
                            view: "FormButtonView",
                            label: "Reset",
                            viewConfig: {
                                label: "Reset",
                                class: "display-inline-block margin-0-0-0-15",
                                elementConfig: {
                                    onClick: "function(data, event) { reset(data, event, true, true); }"
                                }
                            }
                        }]
                    }]
                }
            };
        }
    });

    function getQueryResultTabViewConfig(queryRequestPostData, queryResultTabId) {
        return {
            elementId: queryResultTabId,
            view: "TabsView",
            viewConfig: {
                theme: cowc.TAB_THEME_WIDGET_CLASSIC,
                tabs: [getQueryResultGridViewConfig(queryRequestPostData)]
            }
        };
    }

    function getQueryResultGridViewConfig(queryRequestPostData) {
        var queryResultGridId = cowl.QE_QUERY_RESULT_GRID_ID;

        return {
            elementId: queryResultGridId,
            title: cowl.TITLE_RESULTS,
            iconClass: "fa fa-table",
            view: "QueryResultGridView",
            tabConfig: {
                activate: function() {
                    if ($("#" + queryResultGridId).data("contrailGrid")) {
                        $("#" + queryResultGridId).data("contrailGrid").refreshView();
                    }
                }
            },
            viewConfig: {
                queryRequestPostData: queryRequestPostData,
                gridOptions: {
                    titleText: cowl.TITLE_OBJECT_LOGS,
                    queryQueueUrl: cowc.URL_QUERY_LOG_QUEUE,
                    queryQueueTitle: cowl.TITLE_LOG,
                    fixedRowHeight: false
                }
            }
        };
    }

    return ObjectLogsFormView;
});

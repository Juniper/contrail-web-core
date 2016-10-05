/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    "knockback",
    "validation",
    "layout-handler",
    "query-form-view",
    "core-basedir/reports/qe/ui/js/models/SystemLogsFormModel",
    "core-basedir/reports/qe/ui/js/common/qe.utils"
], function(kb, kbValidation, LayoutHandler, QueryFormView, SystemLogsFormModel, qeUtils) {
    var layoutHandler = new LayoutHandler();

    var SystemLogsFormView = QueryFormView.extend({
        render: function() {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                hashParams = layoutHandler.getURLHashParams(),
                queryPrefix = cowc.SYSTEM_LOGS_PREFIX,
                queryPageTmpl = contrail.getTemplate4Id(ctwc.TMPL_QUERY_PAGE),
                queryType = contrail.checkIfExist(hashParams.queryType) ? hashParams.queryType : null,
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ? viewConfig.widgetConfig : null,
                queryFormId = cowc.QE_HASH_ELEMENT_PREFIX + cowc.SYSTEM_LOGS_PREFIX + cowc.QE_FORM_SUFFIX,
                systemLogsId = cowl.QE_SYSTEM_LOGS_ID,
                queryFormAttributes = contrail.checkIfExist(hashParams.queryFormAttributes) ? hashParams.queryFormAttributes : {};

            if (queryType === cowc.QUERY_TYPE_MODIFY) {
                queryFormAttributes.from_time = parseInt(queryFormAttributes.from_time_utc);
                queryFormAttributes.to_time = parseInt(queryFormAttributes.to_time_utc);
            }
            self.model = new SystemLogsFormModel(queryFormAttributes);
            self.$el.append(queryPageTmpl({ queryPrefix: cowc.SYSTEM_LOGS_PREFIX }));

            self.renderView4Config($(self.$el).find(queryFormId), this.model, self.getViewConfig(),
                cowc.KEY_RUN_QUERY_VALIDATION, null, modelMap,
                function() {
                    self.model.showErrorAttr(systemLogsId, false);
                    kb.applyBindings(self.model, document.getElementById(systemLogsId));
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
                queryFormId = cowc.QE_HASH_ELEMENT_PREFIX + cowc.SYSTEM_LOGS_PREFIX + cowc.QE_FORM_SUFFIX,
                queryResultId = cowc.QE_HASH_ELEMENT_PREFIX + cowc.SYSTEM_LOGS_PREFIX + cowc.QE_RESULTS_SUFFIX,
                queryResultTabId = cowl.QE_SYSTEM_LOGS_TAB_ID;

            if (widgetConfig !== null) {
                $(queryFormId).parents(".widget-box").data("widget-action").collapse();
            }

            queryFormModel.is_request_in_progress(true);
            qeUtils.fetchServerCurrentTime(function(serverCurrentTime) {
                var queryRequestPostData = queryFormModel.getQueryRequestPostData(serverCurrentTime);

                queryRequestPostData.chunkSize = cowc.QE_RESULT_CHUNK_SIZE_10K;
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
                                visible: "time_range() == -1"
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
                                visible: "time_range() == -1"
                            }
                        }]
                    }, {
                        columns: [{
                            elementId: "log_level",
                            view: "FormDropdownView",
                            viewConfig: { path: "log_level", dataBindValue: "log_level", class: "col-xs-3", elementConfig: { dataTextField: "name", dataValueField: "value", data: cowc.QE_LOG_LEVELS } }
                        }, {
                            elementId: "keywords",
                            view: "FormInputView",
                            viewConfig: { path: "keywords", dataBindValue: "keywords", class: "col-xs-6", placeholder: "Comma separated keywords" }
                        }]
                    }, {
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
                            visible: "show_advanced_options()"
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
                            visible: "show_advanced_options()"
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
                                    onClick: "function(data, event) {reset(data, event, true, false);}"
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
                    titleText: cowl.TITLE_SYSTEM_LOGS,
                    queryQueueUrl: cowc.URL_QUERY_LOG_QUEUE,
                    queryQueueTitle: cowl.TITLE_LOG
                }
            }
        };
    }

    return SystemLogsFormView;
});

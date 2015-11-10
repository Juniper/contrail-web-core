/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'query-form-view',
    'knockback',
    'core-basedir/js/models/NodeConsoleLogsModel'
], function (_, QueryFormView, Knockback, NodeConsoleLogsModel) {

    var NodeConsoleLogsView = QueryFormView.extend({
        render: function () {
            var self = this, viewConfig = self.attributes.viewConfig,
                elementId = self.attributes.elementId,
                queryPageTmpl = contrail.getTemplate4Id(ctwc.TMPL_QUERY_PAGE),
                consoleLogsModel = new NodeConsoleLogsModel(),
                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ? viewConfig.widgetConfig : null,
                queryFormId = cowc.QE_HASH_ELEMENT_PREFIX + cowc.CONSOLE_LOGS_PREFIX + cowc.QE_FORM_SUFFIX;

            self.model = consoleLogsModel;
            self.$el.append(queryPageTmpl({queryPrefix: cowc.CONSOLE_LOGS_PREFIX }));

            self.renderView4Config($(self.$el).find(queryFormId), this.model, self.getViewConfig(), null, null, null, function () {
                self.model.showErrorAttr(elementId, false);
                Knockback.applyBindings(self.model, document.getElementById(elementId));
                kbValidation.bind(self);
                $("#display_logs").on('click', function() {
                    self.renderQueryResult();
                });
            });

            if (widgetConfig !== null) {
                self.renderView4Config($(self.$el).find(queryFormId), self.model, widgetConfig, null, null, null);
            }
        },

        renderQueryResult: function() {
            var self = this,
                queryResultId = cowc.QE_HASH_ELEMENT_PREFIX + cowc.CONSOLE_LOGS_PREFIX + cowc.QE_RESULTS_SUFFIX,
                responseViewConfig = {
                    view: "SystemLogsResultView",
                    viewPathPrefix: "reports/qe/ui/js/views/",
                    app: cowc.APP_CONTRAIL_CONTROLLER,
                    viewConfig: {
                        title: cowl.TITLE_CONSOLE_LOGS
                    }
                };

            self.renderView4Config($(self.$el).find(queryResultId), this.model, responseViewConfig);
        },

        getViewConfig: function () {
            var self = this;

            return {
                view: "SectionView",
                viewConfig: {
                    rows: [
                        {
                            columns: [
                                {
                                    elementId: 'time_range', view: "FormDropdownView",
                                    viewConfig: {
                                        path: 'time_range', dataBindValue: 'time_range', class: "span2",
                                        elementConfig: {dataTextField: "text", dataValueField: "id", data: cowc.TIMERANGE_DROPDOWN_VALUES}}
                                },
                                {
                                    elementId: 'from_time', view: "FormDateTimePickerView",
                                    viewConfig: {
                                        style: 'display: none;',
                                        path: 'from_time', dataBindValue: 'from_time', class: "span4",
                                        elementConfig: qewu.getFromTimeElementConfig('from_time', 'to_time'),
                                        visible: "time_range() == -1"
                                    }
                                },
                                {
                                    elementId: 'to_time', view: "FormDateTimePickerView",
                                    viewConfig: {
                                        style: 'display: none;',
                                        path: 'to_time', dataBindValue: 'to_time', class: "span4",
                                        elementConfig: qewu.getToTimeElementConfig('from_time', 'to_time'),
                                        visible: "time_range() == -1"
                                    }
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'log_category', view: "FormDropdownView",
                                    viewConfig: {
                                        path: 'log_category', dataBindValue: 'log_category', class: "span2",
                                        elementConfig: {dataTextField: "text", dataValueField: "id", data: [{id: "", text: "All" }]}}
                                },
                                {
                                    elementId: 'log_type', view: "FormComboboxView",
                                    viewConfig: {
                                        path: 'log_type', dataBindValue: 'log_type', class: "span2",
                                        elementConfig: {dataTextField: "text", dataValueField: "id", data: [{id: "", text: "Any" }]}}
                                },
                                {
                                    elementId: 'log_level', view: "FormDropdownView",
                                    viewConfig: { path: 'log_level', dataBindValue: 'log_level', class: "span2", elementConfig: {dataTextField: "name", dataValueField: "value", data: cowc.QE_LOG_LEVELS}}
                                },
                                {
                                    elementId: 'limit', view: "FormDropdownView",
                                    viewConfig: { path: 'limit', dataBindValue: 'limit', class: "span2", elementConfig: {dataTextField: "text", dataValueField: "id", data: [{id: "50", text: "50 Messages" }]}}
                                },

                                {
                                    elementId: 'keywords', view: "FormInputView",
                                    viewConfig: { path: 'keywords', dataBindValue: 'keywords', class: "span2", placeholder: "Enter keyword(s)"}
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'display_logs', view: "FormButtonView", label: "Display Logs",
                                    viewConfig: {
                                        class: 'display-inline-block margin-0-10-0-0',
                                        elementConfig: {
                                            btnClass: 'btn-primary'
                                        }
                                    }
                                },
                                {
                                    elementId: 'reset_query', view: "FormButtonView", label: "Reset",
                                    viewConfig: {
                                        label: "Reset",
                                        class: 'display-inline-block margin-0-10-0-0',
                                        elementConfig: {
                                            onClick: "reset"
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                }
            };
        }
    });

    return NodeConsoleLogsView;
});
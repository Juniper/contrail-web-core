/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {

    var QueryWhereView = ContrailView.extend({
        render: function (renderConfig) {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                editTemplate = contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM),
                queryPrefix = self.model.query_prefix(),
                modalId = queryPrefix + cowl.QE_WHERE_MODAL_SUFFIX,
                whereTmplHtml = editTemplate({prefixId: queryPrefix}),
                className = viewConfig['className'];

            cowu.createModal({
                'modalId': modalId, 'className': className, 'title': cowl.TITLE_QE_WHERE, 'body': whereTmplHtml, 'onSave': function () {
                    self.model.saveWhere({
                        init: function () {
                            self.model.showErrorAttr(queryPrefix + cowc.FORM_SUFFIX_ID, false);
                            cowu.enableModalLoading(modalId);
                        },
                        success: function () {
                            if (contrail.checkIfExist(renderConfig) && contrail.checkIfFunction(renderConfig['callback'])) {
                                renderConfig['callback']();
                            }

                            //TODO - Quick Fix to adjust the height of where textarea; Can be done in cleaner way
                            $(self.$el).find('[name="where"]')
                                .height(0)
                                .height($(self.$el).find('[name="where"]').get(0).scrollHeight - 5);

                            $("#" + modalId).modal('hide');
                            $("#" + modalId).remove();
                        },
                        error: function (error) {
                            cowu.disableModalLoading(modalId, function () {
                                self.model.showErrorAttr(queryPrefix + cowc.FORM_SUFFIX_ID, error.responseText);
                            });
                        }
                    }); // TODO: Release binding on successful configure
                }, 'onCancel': function () {
                    $("#" + modalId).modal('hide');
                    $("#" + modalId).remove();
                }
            });

            self.renderView4Config($("#" + queryPrefix + "-form"), this.model, getWhereCollectionViewConfig(queryPrefix), null, null, null, function () {
                self.model.showErrorAttr(queryPrefix + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self.model, document.getElementById(modalId));
                kbValidation.bind(self);
            });
        }
    });

    function getWhereCollectionViewConfig(queryPrefix) {
        return {
            elementId: 'or-clause-collection',
            view: "FormCollectionView",
            viewConfig: {
                collection: 'where_or_clauses()',
                templateId: cowc.TMPL_QUERY_OR_COLLECTION_VIEW,
                accordionable: true,
                accordionConfig: {
                    header: '.or-clause-header'
                },
                rows: [
                    {
                        rowActions: [
                            {
                                onClick: 'addOrClauseAtIndex()', iconClass: 'fa fa-plus',
                                viewConfig: {width: 20}
                            },
                            {
                                onClick: "deleteWhereOrClause()", iconClass: 'fa fa-remove',
                                viewConfig: {width: 20}
                            },
                        ],
                        columns: [
                            {
                                elementId: 'and-clause-collection',
                                view: "FormCollectionView",
                                viewConfig: {
                                    collection: 'and_clauses()',
                                    rows: [
                                        {
                                            rowActions: [
                                                {
                                                    onClick: "deleteWhereAndClause()", iconClass: 'fa fa-remove',
                                                    viewConfig: {width: 20}
                                                },
                                                {
                                                    onClick: "addAndClauseAtIndex()", iconClass: 'fa fa-plus',
                                                    viewConfig: {width: 20}
                                                }
                                            ],
                                            columns: [
                                                {
                                                    elementId: 'and-text',
                                                    view: "FormTextView",
                                                    viewConfig: {
                                                        width: 40,
                                                        value: "AND",
                                                        class: "and-clause-text"
                                                    }
                                                },
                                                {
                                                    elementId: 'name',
                                                    name: 'Name',
                                                    view: "FormDropdownView",
                                                    class: "",
                                                    viewConfig: {
                                                        templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                        path: "name",
                                                        dataBindValue: "name",
                                                        dataBindOptionList: 'getNameOptionList',
                                                        width: 150,
                                                        elementConfig: {
                                                            placeholder: 'Select Name',
                                                            defaultValueId: 0
                                                        }
                                                    }
                                                },
                                                {
                                                    elementId: 'operator',
                                                    name: 'operator',
                                                    view: "FormDropdownView",
                                                    class: "",
                                                    viewConfig: {
                                                        templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                        path: "operator",
                                                        dataBindValue: "operator",
                                                        dataBindOptionList: 'getWhereOperatorOptionList',
                                                        width: 80,
                                                        elementConfig: {
                                                            defaultValueId: 0
                                                        }
                                                    }
                                                },
                                                {
                                                    elementId: 'value',
                                                    name: 'value',
                                                    view: "FormComboboxView",
                                                    class: "",
                                                    viewConfig: {
                                                        templateId: cowc.TMPL_EDITABLE_GRID_COMBOBOX_VIEW,
                                                        path: "value",
                                                        dataBindValue: "value()",
                                                        dataBindOptionList: 'getValueOptionList',
                                                        width: 200,
                                                        elementConfig: {
                                                            placeholder: 'Select Value'
                                                        }
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            visible: "$root.isSuffixVisible(name())",
                                            columns: [
                                                {
                                                    elementId: 'suffix-and-text',
                                                    view: "FormTextView",
                                                    viewConfig: {
                                                        width: 40,
                                                        value: "",
                                                        class: 'suffix-and-clause-text'
                                                    }
                                                }, {
                                                    elementId: 'suffix-name',
                                                    name: 'suffix_name',
                                                    view: "FormDropdownView",
                                                    class: "",
                                                    viewConfig: {
                                                        templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                        path: "suffix_name",
                                                        dataBindValue: "suffix_name",
                                                        dataBindOptionList: 'getSuffixNameOptionList',
                                                        width: 150,
                                                        elementConfig: {
                                                            placeholder: 'Select Suffix Name',
                                                            defaultValueId: 0
                                                        }
                                                    }
                                                },
                                                {
                                                    elementId: 'suffix-operator',
                                                    name: 'suffix_operator',
                                                    view: "FormDropdownView",
                                                    class: "",
                                                    viewConfig: {
                                                        templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                        path: "suffix_operator",
                                                        dataBindValue: "suffix_operator",
                                                        width: 80,
                                                        elementConfig: {
                                                            data: [{id: '=', text: '='}],
                                                            defaultValueId: 0
                                                        }
                                                    }
                                                },
                                                {
                                                    elementId: 'suffix-value',
                                                    name: 'suffix_value',
                                                    view: "FormComboboxView",
                                                    class: "",
                                                    viewConfig: {
                                                        templateId: cowc.TMPL_EDITABLE_GRID_COMBOBOX_VIEW,
                                                        path: "suffix_value",
                                                        dataBindValue: "suffix_value()",
                                                        width: 200,
                                                        elementConfig: {
                                                            placeholder: 'Select Suffix Value'
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                ]
            }

        };
    };

    return QueryWhereView;
});
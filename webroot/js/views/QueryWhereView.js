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
                        },
                        error: function (error) {
                            cowu.disableModalLoading(modalId, function () {
                                self.model.showErrorAttr(queryPrefix + cowc.FORM_SUFFIX_ID, error.responseText);
                            });
                        }
                    }); // TODO: Release binding on successful configure
                }, 'onCancel': function () {
                    $("#" + modalId).modal('hide');
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
                path: 'where_or_clauses',
                collection: 'where_or_clauses()',
                templateId: cowc.TMPL_QUERY_OR_COLLECTION_VIEW,
                accordionable: true,
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'and-clause-collection',
                                view: "FormCollectionView",
                                viewConfig: {
                                    path: 'and_clauses',
                                    collection: 'and_clauses()',
                                    rows: [
                                        {
                                            rowActions: [
                                                {onClick: "deleteWhereAndClause()", iconClass: 'icon-remove'}
                                            ],
                                            columns: [
                                                {
                                                    elementId: 'and-text',
                                                    view: "FormTextView",
                                                    width: 40,
                                                    viewConfig: {
                                                        value: "AND",
                                                        class: "and-clause-text"
                                                    }
                                                },
                                                {
                                                    elementId: 'name',
                                                    name: 'Name',
                                                    view: "FormDropdownView",
                                                    class: "",
                                                    width: 200,
                                                    viewConfig: {
                                                        templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                        path: "name",
                                                        dataBindValue: "name",
                                                        dataBindOptionList: 'getNameOptionList',
                                                        elementConfig: {
                                                            placeholder: 'Select Name'
                                                        }
                                                    }
                                                },
                                                {
                                                    elementId: 'operator',
                                                    name: 'operator',
                                                    view: "FormDropdownView",
                                                    class: "",
                                                    width: 100,
                                                    viewConfig: {
                                                        templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                        path: "operator",
                                                        dataBindValue: "operator",
                                                        elementConfig: {
                                                            data: [{id: '=', text: '='}],
                                                            defaultValueId: 0
                                                        }
                                                    }
                                                },
                                                {
                                                    elementId: 'value',
                                                    name: 'value',
                                                    view: "FormComboboxView",
                                                    class: "",
                                                    width: 200,
                                                    viewConfig: {
                                                        templateId: cowc.TMPL_EDITABLE_GRID_COMBOBOX_VIEW,
                                                        path: "value",
                                                        dataBindValue: "value()",
                                                        elementConfig: {
                                                            placeholder: 'Select Value'
                                                        }
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            columns: [
                                                {
                                                    elementId: 'suffix-and-text',
                                                    view: "FormTextView",
                                                    width: 40,
                                                    viewConfig: {
                                                        value: "",
                                                        class: 'suffix-and-clause-text'
                                                    }
                                                }, {
                                                    elementId: 'suffix-name',
                                                    name: 'suffix_name',
                                                    view: "FormDropdownView",
                                                    class: "",
                                                    width: 200,
                                                    viewConfig: {
                                                        templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                        visible: "$root.isSuffixVisible(name())",
                                                        path: "suffix_name",
                                                        dataBindValue: "suffix_name",
                                                        dataBindOptionList: 'getSuffixNameOptionList',
                                                        elementConfig: {
                                                            placeholder: 'Select Suffix Name'
                                                        }
                                                    }
                                                },
                                                {
                                                    elementId: 'suffix-operator',
                                                    name: 'suffix_operator',
                                                    view: "FormDropdownView",
                                                    class: "",
                                                    width: 100,
                                                    viewConfig: {
                                                        templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                        path: "suffix_operator",
                                                        visible: "$root.isSuffixVisible(name())",
                                                        dataBindValue: "suffix_operator",
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
                                                    width: 200,
                                                    viewConfig: {
                                                        templateId: cowc.TMPL_EDITABLE_GRID_COMBOBOX_VIEW,
                                                        visible: "$root.isSuffixVisible(name())",
                                                        path: "suffix_value",
                                                        dataBindValue: "suffix_value()",
                                                        elementConfig: {
                                                            placeholder: 'Select Suffix Value'
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    ],
                                    collectionActions: {
                                        add: {onClick: "addWhereAndClause()", iconClass: 'icon-plus', buttonTitle: "AND"}
                                    }
                                }
                            }
                        ]
                    }
                ],
                collectionActions: {
                    add: {onClick: 'addWhereOrClause("' + queryPrefix + '-form")', iconClass: 'icon-plus', buttonTitle: "OR"},
                    delete: {onClick: "deleteWhereOrClause()", iconClass: 'icon-remove'}
                }
            }

        };
    };

    return QueryWhereView;
});
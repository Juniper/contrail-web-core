/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var QueryFilterView = ContrailView.extend({
        render: function (renderConfig) {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                editTemplate = contrail.getTemplate4Id(cowc.TMPL_EDIT_FORM),
                queryPrefix = self.model.query_prefix(),
                modalId = queryPrefix + cowl.QE_FILTER_MODAL_SUFFIX,
                filterTmplHtml = editTemplate({prefixId: queryPrefix}),
                className = viewConfig['className'];

            cowu.createModal({
                'modalId': modalId, 'className': className, 'title': cowl.TITLE_QE_FILTER, 'body': filterTmplHtml, 'onSave': function () {
                    self.model.saveFilter({
                        init: function () {
                            self.model.showErrorAttr(queryPrefix + cowc.FORM_SUFFIX_ID, false);
                            cowu.enableModalLoading(modalId);
                        },
                        success: function () {
                            if (contrail.checkIfExist(renderConfig) && contrail.checkIfFunction(renderConfig['callback'])) {
                                renderConfig['callback']();
                            }

                            //TODO - Quick Fix to adjust the height of filter textarea; Can be done in cleaner way
                            $(self.$el).find('[name="filters"]')
                                .height(0)
                                .height($(self.$el).find('[name="filters"]').get(0).scrollHeight - 5);

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

            self.renderView4Config($("#" + queryPrefix + "-form"), this.model, getFilterCollectionViewConfig(queryPrefix), null, null, null, function () {
                self.model.showErrorAttr(queryPrefix + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self.model, document.getElementById(modalId));
                kbValidation.bind(self);
            });
        }
    });

    function getFilterCollectionViewConfig(queryPrefix) {


        var viewConfig = {
            elementId: 'and-clause-collection',
            title: "Filter By",
            view: "FormCollectionView",
            viewConfig: {
                class: 'and-clause-collection',
                path: 'filter_and_clauses',
                collection: 'filter_and_clauses()',
                rows: [
                    {
                        rowActions: [
                            {onClick: "deleteFilterAndClause()", iconClass: 'icon-remove'},
                            {onClick: "addAndClauseAtIndex()", iconClass: 'icon-plus'}
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
                                    dataBindOptionList: 'getFilterNameOptionList',
                                    width: 200,
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
                                    width: 100,
                                    elementConfig: {
                                        data: [{id: '!=', text: '!='}, {id: 'RegEx=', text: 'RegEx='}],
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
                                    dataBindOptionList: 'getFilterValueOptionList',
                                    width: 200,
                                    elementConfig: {
                                        placeholder: 'Select Value'
                                    }
                                }
                            }
                        ]
                    }
                ],
                collectionActions: {
                    add: {onClick: "addFilterAndClause()", iconClass: 'icon-plus', buttonTitle: "AND"}
                }
            }

        };

        return {
            elementId : 'filter-accordian',
            view      : "AccordianView",
            viewConfig: [
                {
                    elementId: 'filter_by',
                    title: 'Filter',
                    view: "SectionView",
                    viewConfig:
                    {
                        rows: [
                            {
                                columns: [viewConfig]
                            }
                        ]
                    }
                },
                {
                    elementId: 'limit_by',
                    title: 'Limit',
                    view: "SectionView",
                    viewConfig:
                    {
                        rows: [
                            {
                                columns: [{
                                    elementId: 'limit', view: "FormInputView",
                                    viewConfig: {path: 'limit', dataBindValue: 'limit', class: "span6"}
                                }]
                            }
                        ]
                    }
                },
                {
                    elementId: 'sort',
                    title: 'Sort',
                    view: "SectionView",
                    viewConfig:
                    {
                        rows: [
                            {
                                columns: [
                                    {
                                        elementId : 'sort_by', view: "FormMultiselectView",
                                        viewConfig: {
                                            path: 'sort_by', dataBindValue: 'sort_by', class: "span9",
                                            dataBindOptionList: 'getSortByOptionList()',
                                            elementConfig: {
                                                placeholder: cowc.QE_TITLE_SORT_BY
                                            }
                                        }
                                    },
                                    {
                                        elementId : 'sort_order', view: "FormDropdownView",
                                        viewConfig: {
                                            path: 'sort_order', dataBindValue: 'sort_order', class: "span3",
                                            elementConfig: {
                                                placeholder: cowc.QE_TITLE_SORT_ORDER,
                                                data: cowc.QE_SORT_ORDER_DROPDOWN_VALUES
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

    };

    return QueryFilterView;
});
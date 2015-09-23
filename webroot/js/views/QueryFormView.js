/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {

    var QueryFormView = ContrailView.extend({

        renderSelect: function (options) {
            this.renderView4Config(this.$el, this.model, getSelectViewConfig());
        },

        renderWhere: function (options) {
            this.renderView4Config(this.$el, this.model, getWhereViewConfig());
        },

        renderFilter: function (options) {
            alert('filter');
        }
    });

    function getSelectViewConfig() {
        return {
            view: "QuerySelectView",
            viewConfig: {}
        };
    };

    function getWhereViewConfig() {
        return {
            view: "QueryWhereView",
            viewConfig: {
                elementId: 'or-clause-collection',
                view: "FormCollectionView",
                viewConfig: {
                    path: 'or_clauses',
                    collection: 'or_clauses()',
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
                                                        elementId: 'name',
                                                        name: 'Name',
                                                        view: "FormDropdownView",
                                                        class: "",
                                                        width: 200,
                                                        viewConfig: {
                                                            templateId: cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                                            path: "name",
                                                            dataBindValue: "name",
                                                            dataBindOptionList: '$root.getNameOptionList()',
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
                                                        width: 55,
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
                                                            dataBindOptionList: '$root.getSuffixNameOptionList(name())',
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
                                                        width: 55,
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
                        add: {onClick: "addWhereOrClause('fs-form')", iconClass: 'icon-plus', buttonTitle: "OR"},
                        delete: {onClick: "deleteWhereOrClause()", iconClass: 'icon-remove'}
                    }
                }

            }
        };
    };

    return QueryFormView;
});
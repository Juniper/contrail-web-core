/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

/*
 * Configuration View for customizing GridView
 */

define([
    "lodash",
    "knockout",
    "knockback",
    "validation",
    "/reports/udd/ui/js/views/BaseContentConfigView.js"
], function(_, ko, kb, kbValidation, BaseContentConfigView) {

    return BaseContentConfigView.extend({
        render: function() {
            this.renderView4Config(this.$el, this.model, this.getViewConfig(), "validation",
                null, null,
                function() {
                    kb.applyBindings(this.model, this.$el[0]);
                    kbValidation.bind(this);
                }.bind(this));
        },

        getViewConfig: function() {
            return {
                view: "SectionView",
                viewConfig: {
                    rows: [{
                        columns: [{
                            elementId: "gridTitle",
                            view: "FormInputView",
                            viewConfig: {
                                label: window.cowl.GRID_TITLE,
                                path: "gridTitle",
                                dataBindValue: "gridTitle",
                                class: "col-xs-4"
                            }
                        }, {
                            elementId: "pageSize",
                            view: "FormDropdownView",
                            viewConfig: {
                                label: window.cowl.GRID_PAGE_SIZE,
                                path: "pageSize",
                                dataBindValue: "pageSize",
                                class: "col-xs-4",
                                elementConfig: {
                                    dataTextField: "text",
                                    dataValueField: "id",
                                    data: [8, 25, 50, 100]
                                }
                            }
                        }, {
                            elementId: "detailedEntry",
                            view: "FormCheckboxView",
                            viewConfig: {
                                label: window.cowl.GRID_ENTRY_WITH_DETAILS,
                                path: "detailedEntry",
                                dataBindValue: "detailedEntry",
                                class: "col-xs-4"
                            }
                        }]
                    }, {
                        columns: [{
                            elementId: "visibleColumns",
                            view: "FormMultiselectView",
                            viewConfig: {
                                label: window.cowl.GRID_VISIBLE_COLUMNS,
                                path: "visibleColumns",
                                dataBindValue: "visibleColumns",
                                dataBindOptionList: "availableColumns",
                                class: "col-xs-12",
                                elementConfig: {}
                            }
                        }]
                    }]
                }
            };
        }
    });
});

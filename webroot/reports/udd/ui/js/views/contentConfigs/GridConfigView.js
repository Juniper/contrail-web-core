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
    "core-basedir/reports/udd/ui/js/common/udd.constants",
    "core-basedir/reports/udd/ui/js/views/BaseContentConfigView"
], function(_, ko, kb, kbValidation, uddConstants, BaseContentConfigView) {

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
                                    data: uddConstants.uddWidget.gridPageSizeList
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

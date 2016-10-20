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
    "contrail-view"
], function(_, ko, kb, kbValidation, ContrailView) {

    return ContrailView.extend({
        render: function() {
            var self = this;

            self.renderView4Config(self.$el, self.model, self.getViewConfig(), "validation",
                null, null,
                function() {
                    kb.applyBindings(self.model, self.$el[0]);
                    kbValidation.bind(self);
                });
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
                                label: cowl.GRID_TITLE,
                                path: "gridTitle",
                                dataBindValue: "gridTitle",
                                class: "col-xs-4",
                            }
                        }, {
                            elementId: "pageSize",
                            view: "FormDropdownView",
                            viewConfig: {
                                label: cowl.GRID_PAGE_SIZE,
                                path: "pageSize",
                                dataBindValue: "pageSize",
                                class: "col-xs-4",
                                elementConfig: {
                                    dataTextField: "text",
                                    dataValueField: "id",
                                    data: [8, 25, 50, 100],
                                },
                            }
                        }, {
                            elementId: "detailedEntry",
                            view: "FormCheckboxView",
                            viewConfig: {
                                label: cowl.GRID_ENTRY_WITH_DETAILS,
                                path: "detailedEntry",
                                dataBindValue: "detailedEntry",
                                class: "col-xs-4"
                            },
                        }]
                    }, {
                        columns: [{
                            elementId: "visibleColumns",
                            view: "FormMultiselectView",
                            viewConfig: {
                                label: cowl.GRID_VISIBLE_COLUMNS,
                                path: "visibleColumns",
                                dataBindValue: "visibleColumns",
                                dataBindOptionList: "availableColumns",
                                class: "col-xs-12",
                                elementConfig: {}
                            },
                        }]
                    }],
                },
            };
        },
        remove: function() {
            var self = this;
            kb.release(self.model, self.$el[0]);
            ko.cleanNode(self.$el[0]);
            kbValidation.unbind(self);
            self.$el.empty().off(); // off to unbind the events
            self.stopListening();
            return self;
        },
    });
});

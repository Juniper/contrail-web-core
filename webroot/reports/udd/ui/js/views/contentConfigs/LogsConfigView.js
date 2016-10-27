/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
/*
 * Configuration View for customizing LogsView
 */
define([
    "knockout",
    "knockback",
    "validation",
    "/reports/udd/ui/js/views/BaseContentConfigView.js"
], function(ko, kb, kbValidation, BaseContentConfigView) {
    return BaseContentConfigView.extend({
        render: function() {
            this.renderView4Config(this.$el, this.model, this.getViewConfig(), "validation",
                null, null, function() {
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
                            elementId: "records",
                            view: "FormInputView",
                            viewConfig: {
                                label: window.cowl.LOGS_NUMBER_OF_RECORDS,
                                path: "records",
                                dataBindValue: "records",
                                class: "col-xs-6"
                            }
                        }]
                    }]
                }
            };
        }
    });
});

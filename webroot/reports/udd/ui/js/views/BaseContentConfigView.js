/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    "knockout",
    "knockback",
    "validation",
    "contrail-view"
], function(ko, kb, kbValidation, ContrailView) {
    return ContrailView.extend({
        getViewConfig: function() {
            return {};
        },

        remove: function() {
            kb.release(this.model, this.$el[0]);
            
            ko.cleanNode(this.$el[0]);
            
            kbValidation.unbind(this);
            
            this.$el.empty().off(); // off to unbind the events
            
            this.stopListening();
            
            return this;
        },
    });
});

/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

/*
 * Configuration View for customizing GridView
 */

define([
  "knockout",
  "knockback",
  "validation",
  "contrail-view"
], function(ko, kb, kbValidation, ContrailView) {
  return ContrailView.extend({
    render: function() {
      var self = this;

      self.renderView4Config(self.$el, self.model, self.getViewConfig(), "validation", null, null, function() {
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
              elementId: "detailed_entry",
              view: "FormCheckboxView",
              viewConfig: {
                label: cowl.GRID_ENTRY_WITH_DETAILS,
                path: "detailedEntry",
                dataBindValue: "detailedEntry",
                class: "col-xs-6"
              },
            }, {
              elementId: "checkable_entry",
              view: "FormCheckboxView",
              viewConfig: {
                label: cowl.GRID_ENTRY_WITH_CHECKBOX,
                path: "checkableEntry",
                dataBindValue: "checkableEntry",
                class: "col-xs-6"
              }
            }],
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

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
  "contrail-view"
], function(ko, kb, kbValidation, ContrailView) {
  var LineChartConfigView = ContrailView.extend({
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
              elementId: "records",
              view: "FormInputView",
              viewConfig: {
                label: cowl.LOGS_NUMBER_OF_RECORDS,
                path: "records",
                dataBindValue: "records",
                class: "col-xs-6",
              },
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
  return LineChartConfigView;
});

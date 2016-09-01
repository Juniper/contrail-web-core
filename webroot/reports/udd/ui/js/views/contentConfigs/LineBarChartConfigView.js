/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
/*
 * Configuration View for customizing LineBarWithFocusChartView
 */
define([
  "knockout",
  "knockback",
  "validation",
  "contrail-view"
], function(ko, kb, kbValidation, ContrailView) {
  var LineBarChartConfigView = ContrailView.extend({
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
              elementId: "barColor",
              view: "FormInputView",
              viewConfig: {
                label: cowl.CHART_BAR_COLOR,
                path: "barColor",
                dataBindValue: "barColor",
                class: "col-xs-6",
              },
            }, {
              elementId: "lineColor",
              view: "FormInputView",
              viewConfig: {
                label: cowl.CHART_LINE_COLOR,
                path: "lineColor",
                dataBindValue: "lineColor",
                class: "col-xs-6",
              },
            }],
          }, {
            columns: [{
              elementId: "barLabel",
              view: "FormInputView",
              viewConfig: {
                label: cowl.CHART_BAR_LABEL,
                path: "barLabel",
                dataBindValue: "barLabel",
                class: "col-xs-6",
              },
            }, {
              elementId: "lineLabel",
              view: "FormInputView",
              viewConfig: {
                label: cowl.CHART_LINE_LABEL,
                path: "lineLabel",
                dataBindValue: "lineLabel",
                class: "col-xs-6",
              },
            }],
          }, {
            columns: [{
              elementId: "barValue",
              view: "FormDropdownView",
              viewConfig: {
                label: cowl.CHART_BAR_VALUE,
                path: "barValue",
                dataBindValue: "barValue",
                dataBindOptionList: "yAxisValues",
                class: "col-xs-6",
                elementConfig: {
                  placeholder: cowl.CHART_BAR_VALUE_PLACEHOLDER,
                  defaultValueId: 0,
                },
              },
            }, {
              elementId: "lineValue",
              view: "FormDropdownView",
              viewConfig: {
                label: cowl.CHART_LINE_VALUE,
                path: "lineValue",
                dataBindValue: "lineValue",
                dataBindOptionList: "yAxisValues",
                class: "col-xs-6",
                elementConfig: {
                  placeholder: cowl.CHART_LINE_VALUE_PLACEHOLDER,
                  defaultValueId: 1,
                },
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
  return LineBarChartConfigView;
});

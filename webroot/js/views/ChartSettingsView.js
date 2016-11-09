/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var chartSettingsView = ContrailView.extend({
        render: function(options) {
            var self = this;
            self.renderView4Config(self.$el, self.model,
                getChartSettingsViewConfig(),
                null, null, null, function() {
                Knockback.applyBindings(self.model,
                    document.getElementById(options.modalId));
                //it is required to make checkbox label as hyperlink
                $("#showControls label.ace-lbl").click(function(){
                $("#showControls input.ace-input").trigger('click');
                    return false;
                });
                $("#showLegend label.ace-lbl").click(function(){
                $("#showLegend input.ace-input").trigger('click');
                    return false;
                });
            });

            self.model.__kb.view_model.model().on('change:showControls',
                    function(model, newValue) {
                        cowu.notifySettingsChange({showControls: newValue});
                    }
            );

            self.model.__kb.view_model.model().on('change:showLegend',
                    function(model, newValue) {
                        cowu.notifySettingsChange({showLegend: newValue});
                    }
            );
        }
    });

    function getChartSettingsViewConfig() {
        var csViewConfig = {
            elementId: "chartSettingsSection",
            view: "SectionView",
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: 'showControls',
                        view: 'FormCheckboxView',
                        viewConfig: {
                            label: 'Controls',
                            path: 'showControls',
                            dataBindValue: 'showControls',
                            templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                            class: 'showicon col-xs-12'
                        }
                    }]
                },{
                    columns: [{
                        elementId: 'showLegend',
                        view: 'FormCheckboxView',
                        viewConfig: {
                            label: 'Legends',
                            path: 'showLegend',
                            dataBindValue: 'showLegend',
                            templateId: cowc.TMPL_CHECKBOX_LABEL_RIGHT_VIEW,
                            class: 'showicon col-xs-12'
                        }
                    }]
                }]
            }
        }
        return csViewConfig;
    }

    return chartSettingsView;
});

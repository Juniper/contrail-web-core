/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var containerSettingsView = ContrailView.extend({
         render: function(options) {
            var self = this;
            self.renderView4Config(self.$el, self.model,
                getContainerSettingsViewConfig(options.optionsConfig),
                null, null, null, function() {
                Knockback.applyBindings(self.model,
                    document.getElementById(options.modalId));
            });
            self.model.__kb.view_model.model().on('change',
                    function(model, newValue) {
                        self.model.saveSettings();
                        cowu.notifySettingsChange(model.changed, 'updateContainerSettings');
                    }
            );
        }
    });

    function getContainerSettingsViewConfig(optionsConfig) {
        var csViewConfig = {
            elementId: "containerSettingsSection",
            view: "SectionView",
            viewConfig: optionsConfig()
        }
        return csViewConfig;
    }

    return containerSettingsView;
});

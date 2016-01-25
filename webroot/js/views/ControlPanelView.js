/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var ControlPanelView = ContrailView.extend({
        render: function() {
            var self = this,
                controlPanelTemplate = contrail.getTemplate4Id(cowc.TMPL_CONTROL_PANEL),
                viewConfig = self.attributes.viewConfig,
                controlPanelSelector = self.el;

            $(controlPanelSelector).html(controlPanelTemplate(viewConfig));

            if ((contrail.checkIfKeyExistInObject(true, viewConfig, 'default.zoom.enabled') && viewConfig.default.zoom.enabled) || 
                    (viewConfig.default.zoom.doBucketize != null && viewConfig.default.zoom.doBucketize == true)) {
                viewConfig.default.zoom.events(controlPanelSelector);
            }

            if (contrail.checkIfExist(viewConfig.custom)) {
                $.each(viewConfig.custom, function(configKey, configValue) {
                    var controlPanelElementSelector = $(controlPanelSelector).find('.' + configKey);

                    $.each(configValue.events, function(eventKey, eventValue) {
                        controlPanelElementSelector
                            .off(eventKey)
                            .on(eventKey, function(e) {
                                if (!$(this).hasClass('disabled') && !$(this).hasClass('refreshing')) {
                                    $(controlPanelSelector).find('.control-panel-item').addClass('disabled');
                                    $(this).removeClass('disabled').addClass('refreshing');
                                    eventValue(e, this, controlPanelSelector);
                                }
                            });
                    });
                });
            }
        }
    });

    return ControlPanelView;
});

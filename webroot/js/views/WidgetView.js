/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var WidgetView = ContrailView.extend({
        render: function() {
            var self = this,
                widgetTemplate = contrail.getTemplate4Id(cowc.TMPL_WIDGET_VIEW),
                viewAttributes = self.attributes,
                viewConfig = viewAttributes.viewConfig,
                elementId = viewAttributes.elementId,
                selector = $(self.el),
                defaultWidgetConfig = getDefaultWidgetConfig(elementId),
                viewConfig = $.extend(true, {}, defaultWidgetConfig, viewConfig);

            if ((viewConfig.header !== false && viewConfig.controls.top !== false) || viewConfig.controls.right !== false) {
                selector.parent().append(widgetTemplate(viewConfig));

                var widgetElement = $('#' + elementId),
                    widgetContentContainer = null;

                if (viewConfig.header !== false && viewConfig.controls.top !== false) {
                    var topControls = viewConfig.controls.top;

                    if (topControls.default.collapseable === true) {
                        widgetElement.find('[data-action="widget-collapse"]')
                            .off('click')
                            .on('click', function (event) {
                                $(this).find('i').toggleClass('icon-chevron-up').toggleClass('icon-chevron-down');
                                widgetElement.find('.widget-body').toggle()
                            });

                        widgetElement.data('widget-action', {
                            collapse: function() {
                                widgetElement.find('[data-action="widget-collapse"]').find('i').removeClass('icon-chevron-up').addClass('icon-chevron-down');
                                widgetElement.find('.widget-body').hide()
                            },
                            expand: function() {
                                widgetElement.find('[data-action="widget-collapse"]').find('i').removeClass('icon-chevron-down').addClass('icon-chevron-up');
                                widgetElement.find('.widget-body').show()
                            }
                        });
                    }

                    widgetContentContainer = widgetElement.find('.widget-main');
                }

                if (viewConfig.controls.right !== false) {
                    var controlPanelTemplate = contrail.getTemplate4Id(cowc.TMPL_CONTROL_PANEL),
                        rightControls = viewConfig.controls.right,
                        controlPanelSelector = widgetElement.find('.control-panel-container');

                    $(controlPanelSelector).html(controlPanelTemplate(rightControls));

                    if (contrail.checkIfKeyExistInObject(true, rightControls, 'default.zoom.enabled') && rightControls.default.zoom.enabled) {
                        rightControls.default.zoom.events(controlPanelSelector);
                    }

                    if (contrail.checkIfExist(rightControls.custom)) {
                        $.each(rightControls.custom, function(configKey, configValue) {
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

                    widgetContentContainer = widgetElement.find('.widget-main').find('.col1');
                }

                selector.appendTo(widgetContentContainer)
            }
        }
    });

    function getDefaultWidgetConfig(elementId) {
        return {
            elementId: elementId,
            header: false,
            controls: {
                top: false,
                right: false
            }
        }
    }

    return WidgetView;
});
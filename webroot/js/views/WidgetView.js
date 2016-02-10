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
                                widgetElement.find('.widget-toolbar').find('i')
                                    .toggleClass('icon-chevron-up').toggleClass('icon-chevron-down');
                                widgetElement.find('.widget-body').toggle()
                                widgetElement.find('.widget-body-collapsed').toggle()
                            });

                        widgetElement.data('widget-action', {
                            collapse: function() {
                                widgetElement.find('.widget-toolbar').find('i')
                                    .removeClass('icon-chevron-up').addClass('icon-chevron-down');
                                widgetElement.find('.widget-body').hide()
                                widgetElement.find('.widget-body-collapsed').show()
                            },
                            expand: function() {
                                widgetElement.find('.widget-toolbar').find('i')
                                    .removeClass('icon-chevron-down').addClass('icon-chevron-up');
                                widgetElement.find('.widget-body').show()
                                widgetElement.find('.widget-body-collapsed').hide()
                            }
                        });
                    }

                    widgetContentContainer = widgetElement.find('.widget-main');
                }

                if (viewConfig.controls.right !== false) {
                    var controlPanelTemplate = contrail.getTemplate4Id(cowc.TMPL_CONTROL_PANEL),
                        rightControls = viewConfig.controls.right,
                        controlPanelSelector = widgetElement.find('.control-panel-container');

                    $.each(rightControls.custom, function(configKey, configValue) {
                        if (configKey === 'filterChart' && configValue.enable === true) {
                            rightControls.custom.filterChart = getFilterChartConfig(configValue);
                        }
                    });

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
                                    .on(eventKey, function(event) {
                                        if (!$(this).hasClass('disabled') && !$(this).hasClass('refreshing')) {
                                            $(controlPanelSelector).find('.control-panel-item').addClass('disabled');
                                            $(this).removeClass('disabled').addClass('refreshing');
                                            eventValue(event, this, controlPanelSelector);
                                        }
                                    });
                            });
                        });

                        var closeFn = function(event) {
                            var chartControlPanelExpandedSelector = $(controlPanelSelector).parent().find('.control-panel-expanded-container');

                            if (chartControlPanelExpandedSelector.is(':visible') && $(event.target).closest(chartControlPanelExpandedSelector).length == 0) {
                                chartControlPanelExpandedSelector.hide();
                                controlPanelSelector.find('.control-panel-item')
                                    .removeClass('active')
                                    .removeClass('refreshing')
                                    .removeClass('disabled');
                            }
                        };

                        $(document)
                            .off('click', closeFn)
                            .on('click', closeFn);
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

    function getFilterChartConfig(filterConfig) {
        return {
            iconClass: 'icon-filter',
            title: 'Filter',
            events: {
                click: function (event, self, controlPanelSelector) {
                    var controlPanelExpandedTemplateConfig = filterConfig.viewConfig,
                        chartControlPanelExpandedSelector = $(controlPanelSelector).parent().find('.control-panel-expanded-container');

                    if (chartControlPanelExpandedSelector.find('.control-panel-filter-container').length == 0) {
                        var controlPanelExpandedTemplate = contrail.getTemplate4Id(cowc.TMPL_CONTROL_PANEL_FILTER);

                        chartControlPanelExpandedSelector.html(controlPanelExpandedTemplate(controlPanelExpandedTemplateConfig));
                    }

                    $(self).toggleClass('active');
                    $(self).toggleClass('refreshing');

                    chartControlPanelExpandedSelector.toggle();

                    if (chartControlPanelExpandedSelector.is(':visible')) {
                        $.each(controlPanelExpandedTemplateConfig.groups, function (groupKey, groupValue) {
                            $.each(groupValue.items, function (itemKey, itemValue) {
                                $($('#control-panel-filter-group-items-' + groupValue.id).find('input')[itemKey])
                                    .off('click')
                                    .on('click', function (event) {
                                        if (contrail.checkIfKeyExistInObject(true, itemValue, 'events.click')) {
                                            itemValue.events.click(event)
                                        }
                                    });
                            });
                        });

                        chartControlPanelExpandedSelector.find('.control-panel-filter-close')
                            .off('click')
                            .on('click', function() {
                                chartControlPanelExpandedSelector.hide();
                                $(self).removeClass('active');
                                $(self).removeClass('refreshing');
                                $(controlPanelSelector).find('.control-panel-item').removeClass('disabled');
                            });

                    } else {
                        $(controlPanelSelector).find('.control-panel-item').removeClass('disabled');
                    }

                    event.stopPropagation();
                }
            }
        }
    }

    return WidgetView;
});
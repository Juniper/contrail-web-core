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
                widgetTemplate = contrail.getTemplate4Id(cowc.TMPL_WIDGET),
                viewAttributes = self.attributes,
                viewConfig = viewAttributes.viewConfig,
                elementId = viewAttributes.elementId,
                selector = $(self.el),
                defaultWidgetConfig = getDefaultWidgetConfig(elementId),
                extendedWidgetConfig = $.extend(true, {}, defaultWidgetConfig, viewConfig);


            if(viewConfig.header !== false) {
                selector.parent().append(widgetTemplate(extendedWidgetConfig));

                if (viewConfig.controls.top !== false) {
                    var topControls = viewConfig.controls.top,
                        widgetElement = $('#' + elementId);
                    if (topControls.default.collapseable === true) {
                        widgetElement.find('[data-action="widget-collapse"]')
                            .off('click')
                            .on('click', function (event) {
                                widgetElement.find('.widget-header').find('i').toggleClass('icon-chevron-up').toggleClass('icon-chevron-down');
                                widgetElement.find('.widget-body').toggle()
                            });
                    }
                }
            }

            selector.appendTo($('#' + elementId).find('.widget-main'));
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
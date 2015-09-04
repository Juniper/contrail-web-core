/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var BreadcrumbTextView = ContrailView.extend({
        render: function () {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                textOptions = viewConfig.textOptions,
                parentSelectedValueData = textOptions.parentSelectedValueData,
                textElementId = self.attributes.elementId,
                childViewConfig = null;

            if (contrail.checkIfExist(textOptions.childView)) {
                if (contrail.checkIfFunction(textOptions.childView.init)) {
                    childViewConfig = textOptions.childView.init({}, parentSelectedValueData);
                } else if (!$.isEmptyObject(textOptions.childView.init)) {
                    childViewConfig = textOptions.childView.init;
                }
            };

            constructBreadcrumbText(textElementId, textOptions);

            self.renderView4Config(self.$el, null, childViewConfig);
        },
    });

    function constructBreadcrumbText (breadcrumbTextId, textOptions) {
        var breadcrumbElement = $('#' + cowl.BREADCRUMB_ID),
            urlValue = textOptions.urlValue;

        destroyBreadcrumbText(breadcrumbTextId);

        breadcrumbElement.children('li').removeClass('active');
        breadcrumbElement.children('li:last').append('<span class="divider breadcrumb-divider"><i class="icon-angle-right"></i></span>');
        breadcrumbElement.append('<li class="active breadcrumb-item"><a id="' + breadcrumbTextId + '">' + urlValue + '</a></li>');

        return $('#' + breadcrumbTextId);
    };

    function destroyBreadcrumbText (breadcrumbTextId){
        if ($('#' + breadcrumbTextId).length > 0) {

            var breadcrumbLiElement = $('#' + breadcrumbTextId).parent(),
                breadcrumbDivider = breadcrumbLiElement.prev().find('.divider');

            if(breadcrumbLiElement.hasClass('active')) {
                breadcrumbLiElement.prev().addClass('active')
            }
            breadcrumbDivider.remove();
            breadcrumbLiElement.remove();
        }
    };

    return BreadcrumbTextView;
});
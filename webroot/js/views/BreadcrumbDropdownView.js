/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {
    var BreadcrumbDropdownView = ContrailView.extend({
        render: function () {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                ajaxConfig = viewConfig['ajaxConfig'],
                deferredObj = $.Deferred();

            if (self.model === null && viewConfig['modelConfig'] !== null) {
                self.model = new ContrailListModel(viewConfig['modelConfig']);
            }

            if (self.model !== null) {
                if(self.model.loadedFromCache || !(self.model.isRequestInProgress())) {
                    self.renderBreadcrumbDropdown();
                }

                self.model.onAllRequestsComplete.subscribe(function() {
                    self.renderBreadcrumbDropdown();
                });

                if(viewConfig.loadChartInChunks) {
                    self.model.onDataUpdate.subscribe(function() {
                        self.renderBreadcrumbDropdown();
                    });
                }
            } else {
                self.renderBreadcrumbDropdown();
            }
        },

        renderBreadcrumbDropdown: function() {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                dropdownOptions = viewConfig.dropdownOptions,
                parentSelectedValueData = contrail.checkIfExist(dropdownOptions.parentSelectedValueData) ? dropdownOptions.parentSelectedValueData : null,
                dropdownData = (self.model === null) ? [] : self.model.getItems(),
                dropdownElementId = self.attributes.elementId;

            if (contrail.checkIfExist(dropdownOptions.allDropdownOption)) {
                dropdownData = dropdownOptions.allDropdownOption.concat(dropdownData);
            }

            if (dropdownData.length > 0) {
                var selectedValueData = null,
                    urlValue = contrail.checkIfExist(dropdownOptions.urlValue) ? dropdownOptions.urlValue : null,
                    cookieKey = contrail.checkIfExist(dropdownOptions.cookieKey) ? dropdownOptions.cookieKey : null,
                    cookieValue = contrail.getCookie(cookieKey),
                    urlDataKey = null, cookieDataKey = null;

                $.each(dropdownData, function (key, value) {
                    if (urlValue == value.name) {
                        urlDataKey = key;
                    }

                    if (cookieValue == value.name) {
                        cookieDataKey = key;
                    }
                });

                if(urlValue != null && urlDataKey == null) {
                    var notFoundTemplate = contrail.getTemplate4Id(cowc.TMPL_NOT_FOUND_MESSAGE),
                        notFoundConfig = $.extend(true, {}, cowc.DEFAULT_CONFIG_NOT_FOUND_PAGE, {errorMessage: urlValue + ' was not found.'});

                    $(contentContainer).html(notFoundTemplate(notFoundConfig));
                } else {
                    var onBreadcrumbDropdownChange = function(selectedValueData, dropdownOptions, type) {
                            var cookieKey = contrail.checkIfExist(dropdownOptions.cookieKey) ? dropdownOptions.cookieKey : null,
                                childViewConfig = null;

                            selectedValueData.parentSelectedValueData = parentSelectedValueData;

                            if (contrail.checkIfExist(dropdownOptions.childView)) {
                                type = (contrail.checkIfExist(dropdownOptions.childView[type]) ? type : 'init');
                                if (contrail.checkIfFunction(dropdownOptions.childView[type])) {
                                    childViewConfig = dropdownOptions.childView[type](selectedValueData);
                                } else if (!$.isEmptyObject(dropdownOptions.childView[type])) {
                                    childViewConfig = dropdownOptions.childView[type];
                                }
                            }

                            if (cookieKey !== null) {
                                contrail.setCookie(cookieKey, selectedValueData.name);
                            }

                            if (childViewConfig !== null) {
                                self.renderView4Config(self.$el, null, childViewConfig);
                            }
                        },
                        dropdownElement = constructBreadcrumbDropdownDOM(dropdownElementId, dropdownData, dropdownOptions, onBreadcrumbDropdownChange);

                    selectedValueData = (selectedValueData == null && urlDataKey != null) ? dropdownData[urlDataKey] : selectedValueData;
                    selectedValueData = (selectedValueData == null && cookieDataKey != null) ? dropdownData[cookieDataKey] : selectedValueData;
                    selectedValueData = (selectedValueData == null) ? dropdownData[0] : selectedValueData;

                    dropdownElement.data('contrailDropdown').text(selectedValueData.name);

                    onBreadcrumbDropdownChange(selectedValueData, dropdownOptions, 'init')
                }


            } else {
                var notFoundTemplate = contrail.getTemplate4Id(cowc.TMPL_NOT_FOUND_MESSAGE),
                    notFoundConfig = $.extend(true, {}, cowc.DEFAULT_CONFIG_NOT_FOUND_PAGE, {title: cowm.DATA_SUCCESS_EMPTY});

                $(contentContainer).html(notFoundTemplate(notFoundConfig));
            }
        }
    });

    function constructBreadcrumbDropdownDOM (breadcrumbDropdownId, dropdownData, dropdownOptions, onBreadcrumbDropdownChange) {
        var breadcrumbElement = $('#' + cowl.BREADCRUMB_ID);

        destroyBreadcrumbDropdownDOM(breadcrumbDropdownId);

        breadcrumbElement.children('li').removeClass('active');
        breadcrumbElement.children('li:last').append('<span class="divider breadcrumb-divider"><i class="icon-angle-right"></i></span>');
        breadcrumbElement.append('<li class="active breadcrumb-item"><div id="' + breadcrumbDropdownId + '"></div></li>');

        return $('#' + breadcrumbDropdownId).contrailDropdown({
            dataTextField: "name",
            dataValueField: "value",
            data: dropdownData,
            dropdownCssClass: 'min-width-150',
            selecting: function (e) {
                var selectedValueData = {
                    name: e.object['name'],
                    value: e.object['value']
                };

                if(contrail.checkIfFunction(dropdownOptions.changeCB)) {
                    dropdownOptions.changeCB(selectedValueData)
                }

                destroyNextAllBreadcrumbDropdown (breadcrumbDropdownId);
                onBreadcrumbDropdownChange(selectedValueData, dropdownOptions, 'change');

            }
        });
    };

    function destroyBreadcrumbDropdownDOM (breadcrumbDropdownId){
        if (contrail.checkIfExist($('#' + breadcrumbDropdownId).data('contrailDropdown'))) {

            var breadcrumbLiElement = $('#' + breadcrumbDropdownId).parent(),
                breadcrumbDivider = breadcrumbLiElement.prev().find('.divider');

            breadcrumbLiElement.find('.breadcrumb-divider').remove();
            breadcrumbLiElement.nextAll('.breadcrumb-item').remove();

            $('#' + breadcrumbDropdownId).data('contrailDropdown').destroy();
            if(breadcrumbLiElement.hasClass('active')) {
                breadcrumbLiElement.prev().addClass('active')
            }
            breadcrumbDivider.remove();
            breadcrumbLiElement.remove();
        }
    };

    function destroyNextAllBreadcrumbDropdown (breadcrumbDropdownId){
        if (contrail.checkIfExist($('#' + breadcrumbDropdownId).data('contrailDropdown'))) {

            var breadcrumbLiElement = $('#' + breadcrumbDropdownId).parent();
            breadcrumbLiElement.find('.breadcrumb-divider').remove();
            breadcrumbLiElement.nextAll('.breadcrumb-item').remove();
        }
    };

    return BreadcrumbDropdownView;
});
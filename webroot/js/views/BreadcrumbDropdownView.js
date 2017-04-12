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
                dropdownElementId = self.attributes.elementId,
                defaultValueIndex = ((contrail.checkIfExist(dropdownOptions.defaultValueIndex) && dropdownData.length > 0) ? dropdownOptions.defaultValueIndex : 0);

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
                    if (urlValue == value.display_name) {
                        urlDataKey = key;
                    }

                    if (cookieValue == value.display_name) {
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
                            var cookieVal = selectedValueData.display_name;
                            if ((null != cookieKey) && (null != cookieVal)) {
                                if (null != selectedValueData.error_string) {
                                    /* Do not set the error string in cookie,
                                     * error_string is only for display
                                     */
                                    var cookieVal =
                                        (selectedValueData.display_name.split(selectedValueData.error_string)[0]).trim();
                                }
                                contrail.setCookie(cookieKey, cookieVal);
                            }

                            if (childViewConfig !== null) {
                                self.renderView4Config(self.$el, null, childViewConfig);
                            }
                        },
                        dropdownElement = constructBreadcrumbDropdownDOM(dropdownElementId, dropdownData, dropdownOptions, onBreadcrumbDropdownChange);

                    selectedValueData = (selectedValueData == null && urlDataKey != null) ? dropdownData[urlDataKey] : selectedValueData;
                    selectedValueData = (selectedValueData == null && cookieDataKey != null) ? dropdownData[cookieDataKey] : selectedValueData;
                    selectedValueData = (selectedValueData == null) ? dropdownData[defaultValueIndex] : selectedValueData;

                    dropdownElement.data('contrailDropdown').text(selectedValueData.display_name);
                    if(dropdownOptions.preSelectCB != null && typeof(dropdownOptions.preSelectCB) == 'function') {
                        $.when(dropdownOptions.preSelectCB(selectedValueData)).always(function() {
                            onBreadcrumbDropdownChange(selectedValueData, dropdownOptions, 'init')
                        });
                    } else {
                            onBreadcrumbDropdownChange(selectedValueData, dropdownOptions, 'init')
                    }
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
        breadcrumbElement.append('<li class="active breadcrumb-item"><div id="' + breadcrumbDropdownId + '" class="breadcrumb-dropdown"></div></li>');

        return $('#' + breadcrumbDropdownId).contrailDropdown({
            dataTextField: "display_name",
            dataValueField: "value",
            data: dropdownData,
            dropdownCssClass: 'min-width-150',
            selecting: function (e) {
                var fqName = getValueByJsonPath(e.object, "fq_name");
                var displayName = getValueByJsonPath(e.object, "display_name",
                                                     fqName);
                var errorStr = getValueByJsonPath(e.object, "error_string",
                                                  null);
                var selectedValueData = {
                    name: e.object['name'],
                    value: e.object['value'],
                    display_name: displayName,
                    fq_name: e.object['fq_name']
                };
                if (null != errorStr) {
                    selectedValueData["error_string"] = errorStr;
                }
                selectedValueData.parentSelectedValueData =
                    (null != dropdownOptions) ?
                        dropdownOptions.parentSelectedValueData : null;

                if(dropdownOptions.preSelectCB != null && typeof(dropdownOptions.preSelectCB) == 'function') {
                    //Wrapping the return value inside $.when to handle the case if the function doesn't return a deferred object
                    $.when(dropdownOptions.preSelectCB(selectedValueData)).done(function() {
                        if(contrail.checkIfFunction(dropdownOptions.changeCB)) {
                            dropdownOptions.changeCB(selectedValueData)
                        }

                        destroyNextAllBreadcrumbDropdown (breadcrumbDropdownId);
                        onBreadcrumbDropdownChange(selectedValueData, dropdownOptions, 'change');

                    });
                } else {
                    if(contrail.checkIfFunction(dropdownOptions.changeCB)) {
                        dropdownOptions.changeCB(selectedValueData)
                    }

                    destroyNextAllBreadcrumbDropdown (breadcrumbDropdownId);
                    onBreadcrumbDropdownChange(selectedValueData, dropdownOptions, 'change');
                }

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

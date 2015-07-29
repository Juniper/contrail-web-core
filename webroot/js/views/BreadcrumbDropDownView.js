/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-list-model',
    'contrail-view'
], function (_, Backbone, ContrailListModel, ContrailView) {
    var self;
    var BreadcrumbSelectedData = {};
    var BreadcrumbDropDownView = ContrailView.extend({
        renderEachBreadcrumbDropdown: function(allOptions) {
            self = this;
            var options = allOptions,
                url = options.url,
                parser = options.parser,
                contrailListModel = self.fetchDataforDropDown(url, parser);
            contrailListModel.onAllRequestsComplete.subscribe(function() {
                self.populateBreadcrumbDropdown(contrailListModel, allOptions);
            });
        },
        fetchDataforDropDown: function(url, dropDownDataParser) {
            var listModelConfig = {
                remote: {
                    ajaxConfig: {
                        url: url
                    },
                    dataParser:dropDownDataParser,
                    failureCallback: function(xhr, ContrailListModel) {
                        var dataErrorTemplate =
                                              contrail.getTemplate4Id(
                                                cowc.TMPL_NOT_FOUND_MESSAGE),
                            dataErrorConfig = $.extend(
                                                true, {},
                                                cowc.DEFAULT_CONFIG_ERROR_PAGE,
                                                {errorMessage: xhr.responseText}
                                              );
                        $(contentContainer).html(
                                            dataErrorTemplate(dataErrorConfig));
                    }
                }
            };
            var contrailListModel = new ContrailListModel(listModelConfig);
            return contrailListModel;
        },
        populateBreadcrumbDropdown: function(contrailListModel, allOptions) {
            var options = allOptions;
            var elementID = options.elementID,
                key = options.key,
                child = options.child,
                cookie = options.cookie,
                noDataMsg = options.noDataMsg,
                initCB = options.initCB,
                changeCB = options.changeCB;
            var dropdownData = contrailListModel.getItems();
            if (dropdownData.length > 0) {
                var selectedValueData = null,
                    elementCookie = contrail.getCookie(cookie),
                    urlDataKey = null, cookieDataKey = null;
                $.each(dropdownData, function (key, value) {
                    if (elementCookie == value.name) {
                        cookieDataKey = key;
                    }
                });
                var dropdownElementId = elementID,
                    dropdownElement = self.constructBreadcrumbDropdownDOM(
                                      dropdownElementId);

                selectedValueData = (selectedValueData == null &&
                                    urlDataKey != null) ?
                                    dropdownData[urlDataKey] :
                                    selectedValueData;
                selectedValueData = (selectedValueData == null &&
                                    cookieDataKey != null) ?
                                    dropdownData[cookieDataKey] :
                                    selectedValueData;
                selectedValueData = (selectedValueData == null) ?
                                    dropdownData[0] : selectedValueData;
                BreadcrumbSelectedData[key] = selectedValueData;
                var elementDropdown = dropdownElement.contrailDropdown({
                    dataTextField: "name",
                    dataValueField: "value",
                    data: dropdownData,
                    allOptions: allOptions,
                    dropdownCssClass: 'min-width-150',
                    change: function (e) {
                        console.log(this.allOptions);
                        var loc_allOptions = $.extend([], this.allOptions);
                        var selectedValueData = {
                            name: e.added.name,
                            value: e.added.value
                        };
                        contrail.setCookie(cookie, e.added.name);
                        setTimeout(function() {
                            BreadcrumbSelectedData[loc_allOptions.key] =
                                          selectedValueData;
                            if("child" in loc_allOptions &&
                                ifNullOrEmptyObject(loc_allOptions.child)
                                                   != null) {
                                loc_allOptions = loc_allOptions.child;
                                self.renderEachBreadcrumbDropdown
                                              (loc_allOptions);
                            } else {
                                (contrail.checkIfFunction(changeCB) ?
                                      changeCB(BreadcrumbSelectedData) :
                                      initCB(BreadcrumbSelectedData));
                            }
                        }, 100);

                        var remove_allOptions = $.extend([], this.allOptions);
                        while("child" in remove_allOptions &&
                              ifNullOrEmptyObject(remove_allOptions.child)
                                                 != null){
                            remove_allOptions = remove_allOptions.child;
                            self.destroyBreadcrumbDropdownDOM(
                                              remove_allOptions.elementID);
                        }
                    }
                }).data('contrailDropdown');
                elementDropdown.text(selectedValueData.name);
                setTimeout(function() {
                    if("child" in options &&
                       ifNullOrEmptyObject(options.child) != null) {
                            options = options.child;
                             BreadcrumbSelectedData[key] = selectedValueData;
                             self.renderEachBreadcrumbDropdown(options);
                    } else {
                        (contrail.checkIfFunction(changeCB) ?
                              changeCB(BreadcrumbSelectedData) :
                              initCB(BreadcrumbSelectedData));
                    }
                }, 100);
            } else {
                var dropdownElementId = elementID,
                    dropdownElement = self.constructBreadcrumbDropdownDOM(
                                      dropdownElementId);
                    dropdownElement.html(noDataMsg);
                setTimeout(function() {
                    contrail.checkIfFunction(changeCB) ? changeCB("") :
                                                         initCB("");
                }, 100);
            }
        },
        constructBreadcrumbDropdownDOM: function(breadcrumbDropdownId) {
            var breadcrumbElement = $('#' + cowl.BREADCRUMB_ID);

            self.destroyBreadcrumbDropdownDOM(breadcrumbDropdownId);

            breadcrumbElement.children('li').removeClass('active');
            breadcrumbElement.children('li:last').append(
                              '<span class="divider">' +
                                  '<i class="icon-angle-right"></i>' +
                              '</span>');
            breadcrumbElement.append('<li class="active ' +
                              breadcrumbDropdownId + '"><div id="' +
                              breadcrumbDropdownId + '"></div></li>');
            return $('#' + breadcrumbDropdownId);
        },
        destroyBreadcrumbDropdownDOM: function(breadcrumbDropdownId) {
            if (contrail.checkIfExist($('#' +
                breadcrumbDropdownId).data('contrailDropdown'))) {
                $('#' +
                   breadcrumbDropdownId).data('contrailDropdown').destroy();
                    if($('li.' + breadcrumbDropdownId).hasClass('active')) {
                        $('li.' +
                           breadcrumbDropdownId).prev().addClass('active')
                    }
                $('li.' +
                   breadcrumbDropdownId).prev().find('.divider').remove();
                $('li.' +
                   breadcrumbDropdownId).remove();
            } else if(contrail.checkIfExist($('#' +breadcrumbDropdownId))) {
                $('li.' +
                   breadcrumbDropdownId).prev().find('.divider').remove();
                $('li.' + breadcrumbDropdownId).remove();
            }
        },
        getSelectedValue : function(key) {
            if(key != null)
                return BreadcrumbSelectedData[key];
            else
                return BreadcrumbSelectedData;
        }
    });
    return BreadcrumbDropDownView;
});
/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-list-model'
], function (_, Backbone, ContrailListModel) {
    var BreadcrumbDropDownView = Backbone.View.extend({
        renderEachBreadcrumbDropdown: function(fqName, url, elementID, key,
                                      children, cookie, noDataMsg,
                                      initCB, changeCB) {
            var mapfield = "";
            var urlFQN;
            switch (key) {
                case "domain": {
                    urlFQN = ((contrail.checkIfExist(fqName)) ?
                             fqName.split(':').splice(0,1).join(':') : null);
                    break;
                }
                case "project": {
                    urlFQN = ((contrail.checkIfExist(fqName)) ?
                             fqName.split(':').splice(0,2).join(':') : null);
                    break;
                }
            }
            var contrailListModel = fetchURLforDropDown(url, key);

            if(contrailListModel.loadedFromCache ||
               !(contrailListModel.isRequestInProgress())) {
                populateBreadcrumbDropdown(contrailListModel, urlFQN,
                                           elementID, children, cookie,
                                           noDataMsg, initCB, changeCB);
            }

            contrailListModel.onAllRequestsComplete.subscribe(function() {
                populateBreadcrumbDropdown(contrailListModel, urlFQN,
                                           elementID, children, cookie,
                                           noDataMsg, initCB, changeCB);
            });
        }
    });

    var fetchURLforDropDown = function(url, key) {
        var listModelConfig = {
            remote: {
                ajaxConfig: {
                    url: url
                },
                dataParser: function(response) {
                    switch (key) {
                        case "domain": {
                            return  $.map(response.domains, function (n, i) {
                                return {
                                    fq_name: n.fq_name.join(':'),
                                    name: n.fq_name[0],
                                    value: n.uuid
                                };
                            });
                            break;
                        }
                        case "project": {
                            return  $.map(response.projects, function (n, i) {
                                return {
                                    fq_name: n.fq_name.join(':'),
                                    name: n.fq_name[1],
                                    value: n.uuid
                                };
                            });
                            break;
                        }
                    }
                },
                failureCallback: function(xhr, ContrailListModel) {
                    var dataErrorTemplate =
                        contrail.getTemplate4Id(cowc.TMPL_NOT_FOUND_MESSAGE),
                        dataErrorConfig = $.extend(true, {},
                                          cowc.DEFAULT_CONFIG_ERROR_PAGE,
                                          {errorMessage: xhr.responseText});

                    $(contentContainer).html(
                                        dataErrorTemplate(dataErrorConfig));
                }
            }
        };

        var contrailListModel = new ContrailListModel(listModelConfig);

        return contrailListModel;
    }

    var populateBreadcrumbDropdown = function(contrailListModel, urlFQN,
                                     elementID, children, cookie, noDataMsg,
                                     initCB, changeCB) {
        var dropdownData = contrailListModel.getItems();
        if (dropdownData.length > 0) {
            var selectedValueData = null,
                elementCookie = contrail.getCookie(cookie),
                urlDataKey = null, cookieDataKey = null;

            $.each(dropdownData, function (key, value) {
                if (urlFQN == value.fq_name) {
                    urlDataKey = key;
                }

                if (elementCookie == value.name) {
                    cookieDataKey = key;
                }
            });

            if(urlFQN != null && urlDataKey == null) {
                var notFoundTemplate =
                       contrail.getTemplate4Id(cowc.TMPL_NOT_FOUND_MESSAGE),
                    notFoundConfig = $.extend(true, {},
                                    cowc.DEFAULT_CONFIG_NOT_FOUND_PAGE,
                                    {errorMessage: urlFQN + ' was not found.'});

                $(contentContainer).html(notFoundTemplate(notFoundConfig));
            } else {
                var dropdownElementId = elementID,
                    dropdownElement = constructBreadcrumbDropdownDOM(
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

                var elementDropdown = dropdownElement.contrailDropdown({
                    dataTextField: "name",
                    dataValueField: "value",
                    data: dropdownData,
                    dropdownCssClass: 'min-width-150',
                    change: function (e) {
                        var selectedValueData = {
                            name: e.added.name,
                            value: e.added.value
                        };
                        setTimeout(function() {
                            (contrail.checkIfFunction(changeCB) ?
                                      changeCB(selectedValueData, true) :
                                      initCB(selectedValueData, true));
                        }, 100);
                        if(children.length > 0){
                            var children_length = children.length;
                            for(i = 0; i < children_length; i++) {
                                destroyBreadcrumbDropdownDOM(children[i]);
                            }
                        }
                    }
                }).data('contrailDropdown');

                elementDropdown.text(selectedValueData.name);
                setTimeout(function() {
                    initCB(selectedValueData, false);
                }, 100);
            }
        } else {
            var dropdownElementId = elementID,
                dropdownElement = constructBreadcrumbDropdownDOM(
                                  dropdownElementId);
                dropdownElement.html(noDataMsg);
            setTimeout(function() {
                contrail.checkIfFunction(changeCB) ? changeCB("", true) :
                                                     initCB("", true);
            }, 100);
        }

    };

    var constructBreadcrumbDropdownDOM = function(breadcrumbDropdownId) {
        var breadcrumbElement = $('#' + ctwl.BREADCRUMB_ID);

        destroyBreadcrumbDropdownDOM(breadcrumbDropdownId);

        breadcrumbElement.children('li').removeClass('active');
        breadcrumbElement.children('li:last').append(
            '<span class="divider"><i class="icon-angle-right"></i></span>');
        breadcrumbElement.append('<li class="active ' + breadcrumbDropdownId +
            '"><div id="' + breadcrumbDropdownId + '"></div></li>');
        return $('#' + breadcrumbDropdownId);
    };

    var destroyBreadcrumbDropdownDOM = function(breadcrumbDropdownId){
        if (contrail.checkIfExist($('#' +
            breadcrumbDropdownId).data('contrailDropdown'))) {
            $('#' + breadcrumbDropdownId).data('contrailDropdown').destroy();
                if($('li.' + breadcrumbDropdownId).hasClass('active')) {
                    $('li.' + breadcrumbDropdownId).prev().addClass('active')
                }
            $('li.' + breadcrumbDropdownId).prev().find('.divider').remove();
            $('li.' + breadcrumbDropdownId).remove();
        } else if(contrail.checkIfExist($('#' +breadcrumbDropdownId))) {
            $('li.' + breadcrumbDropdownId).prev().find('.divider').remove();
            $('li.' + breadcrumbDropdownId).remove();
        }
    };

    return BreadcrumbDropDownView;
});
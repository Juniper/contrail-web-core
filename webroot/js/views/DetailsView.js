/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var DetailsView = ContrailView.extend({
        render: function () {
            var viewConfig = this.attributes.viewConfig,
                data = viewConfig['data'],
                ajaxConfig = viewConfig['ajaxConfig'],
                templateConfig = viewConfig['templateConfig'],
                dataParser = viewConfig['dataParser'],
                app = viewConfig['app'],
                detailsTemplate = cowu.generateDetailTemplate(templateConfig, app),
                self = this, modelMap = this.modelMap;

            if(contrail.checkIfExist(data)) {
                self.$el.html(detailsTemplate({data: data, requestState: cowc.DATA_REQUEST_STATE_SUCCESS_NOT_EMPTY}));
                initActionClickEvents(self.$el, templateConfig.actions, data);
            } else {
                self.$el.html(detailsTemplate({data: [], requestState: cowc.DATA_REQUEST_STATE_FETCHING}));

                if (modelMap != null && modelMap[viewConfig['modelKey']] != null) {
                    var contrailViewModel = modelMap[viewConfig['modelKey']],
                        attributes, requestState;

                    if (!contrailViewModel.isRequestInProgress()) {
                        requestState = cowu.getRequestState4Model(contrailViewModel);
                        attributes = contrailViewModel.attributes;
                        self.$el.html(detailsTemplate({data: attributes, requestState: requestState}));

                        if (requestState !== 'error') {
                            initClickEvents(self.$el, templateConfig.actions, attributes);
                        }
                    } else {
                        contrailViewModel.onAllRequestsComplete.subscribe(function () {
                            requestState = cowu.getRequestState4Model(contrailViewModel);
                            attributes = contrailViewModel.attributes;
                            self.$el.html(detailsTemplate({data: attributes, requestState: requestState}));

                            if (requestState !== 'error') {
                                initClickEvents(self.$el, templateConfig.actions, attributes);
                            }
                        });
                    }
                } else {
                    contrail.ajaxHandler(ajaxConfig, null, function (response) {
                        var parsedData = dataParser(response),
                            requestState = cowc.DATA_REQUEST_STATE_SUCCESS_NOT_EMPTY;

                        if ($.isEmptyObject(parsedData)) {
                            requestState = cowc.DATA_REQUEST_STATE_SUCCESS_EMPTY;
                        }

                        self.$el.html(detailsTemplate({data: parsedData, requestState: requestState}));
                        initClickEvents(self.$el, templateConfig.actions, parsedData);
                    }, function (error) {
                        self.$el.html(detailsTemplate({data: [], requestState: cowc.DATA_REQUEST_STATE_ERROR}));
                    });
                }
            }
        }
    });

    function initClickEvents(detailEl, actions, data) {
        initActionClickEvents(detailEl, actions, data);
        initWidgetViewEvents(detailEl)
    };

    function initActionClickEvents(detailEl, actions, data) {
        if (_.isArray(actions)) {
            $.each(actions, function(actionKey, actionValue) {
                if(actionValue.type == 'dropdown') {
                    $.each(actionValue.optionList, function(optionListKey, optionListValue) {
                        $(detailEl).find('[data-title="' + actionValue.title + '"]').find('[data-title="' + optionListValue.title + '"]')
                            .off('click')
                            .on('click', function(e) {
                                optionListValue.onClick(data);
                            })

                    });
                }
            })
        }
    };

    function initWidgetViewEvents(detailEl) {
        $(detailEl).find('[data-action="list-view"]')
            .off('click')
            .on('click', function (event) {
                $(this).parents('.widget-box').find('.list-view').show();
                $(this).parents('.widget-box').find('.advanced-view').hide();
            });

        $(detailEl).find('[data-action="advanced-view"]')
            .off('click')
            .on('click', function (event) {
                $(this).parents('.widget-box').find('.advanced-view').show();
                $(this).parents('.widget-box').find('.list-view').hide();
            })
    };

    return DetailsView;
});
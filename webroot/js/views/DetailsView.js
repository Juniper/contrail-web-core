/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var DetailsView = ContrailView.extend({
        render: function () {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                data = viewConfig['data'],
                ajaxConfig = viewConfig['ajaxConfig'],
                dataParser = viewConfig['dataParser'],
                modelMap = this.modelMap;

            if(contrail.checkIfExist(data)) {
                self.renderDetailView({data: data, requestState: cowc.DATA_REQUEST_STATE_SUCCESS_NOT_EMPTY});
            } else {
                self.renderDetailView({data: [], requestState: cowc.DATA_REQUEST_STATE_FETCHING});

                if (modelMap != null && modelMap[viewConfig['modelKey']] != null) {
                    var contrailViewModel = modelMap[viewConfig['modelKey']],
                        attributes, requestState;

                    if (!contrailViewModel.isRequestInProgress()) {
                        requestState = cowu.getRequestState4Model(contrailViewModel);
                        attributes = contrailViewModel.attributes;
                        self.renderDetailView({data: attributes, requestState: requestState});

                    } else {
                        contrailViewModel.onAllRequestsComplete.subscribe(function () {
                            requestState = cowu.getRequestState4Model(contrailViewModel);
                            attributes = contrailViewModel.attributes;
                            self.renderDetailView({data: attributes, requestState: requestState});
                        });
                    }
                } else {
                    contrail.ajaxHandler(ajaxConfig, null, function (response) {
                        var parsedData = dataParser(response),
                            requestState = cowc.DATA_REQUEST_STATE_SUCCESS_NOT_EMPTY;

                        if ($.isEmptyObject(parsedData)) {
                            requestState = cowc.DATA_REQUEST_STATE_SUCCESS_EMPTY;
                        }

                        self.renderDetailView({data: parsedData, requestState: requestState});
                    }, function (error) {
                        self.renderDetailView({data: [], requestState: cowc.DATA_REQUEST_STATE_ERROR});
                    });
                }
            }
        },

        renderDetailView: function(detailDataObj) {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                app = viewConfig['app'],
                templateConfig = viewConfig['templateConfig'],
                detailsTemplate = cowu.generateDetailTemplate(templateConfig, app);

            self.$el.html(detailsTemplate(detailDataObj));

            if (detailDataObj.requestState !== cowc.DATA_REQUEST_STATE_ERROR) {
                initClickEvents(self.$el, templateConfig, detailDataObj.data, self);
            }
        }
    });

    function initClickEvents(detailEl, templateConfig, data, self) {
        initActionClickEvents(detailEl, templateConfig, data);
        initWidgetViewEvents(detailEl, self);
        initDetailDataClickEvents(detailEl, templateConfig, data);

    };

    function initActionClickEvents(detailEl, templateConfig, data) {
        var actions = templateConfig.actions
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

    function initWidgetViewEvents(detailEl, self) {
        $(detailEl).find('[data-action="list-view"]')
            .off('click')
            .on('click', function (event) {
                $(this).parents('.widget-box').find('.list-view').show();
                $(this).parents('.widget-box').find('.advanced-view').hide();
                $(this).parents('.widget-box').find('.contrail-status-view').hide();
            });

        $(detailEl).find('[data-action="advanced-view"]')
            .off('click')
            .on('click', function (event) {
                var ele = this;
                if (getValueByJsonPath(self,'attributes;viewConfig;advancedViewConfig') != null) {
                    var deferredObj = $.Deferred();
                    getDetailsAdvancedData 
                                            (getValueByJsonPath(self,
                                                'attributes;viewConfig;advancedViewConfig'),
                                             deferredObj);
                    deferredObj.done(function(advancedTemplate){
                        var advancedDiv = $(ele).parents('.widget-box').find('.advanced-view');
                        advancedDiv.empty();
                        advancedDiv.append(advancedTemplate);
                    })
                }
                $(this).parents('.widget-box').find('.advanced-view').show();
                $(this).parents('.widget-box').find('.list-view').hide();
                $(this).parents('.widget-box').find('.contrail-status-view').hide();
            })
    };

    function getDetailsAdvancedData (advancedViewConfig, deferredObj) {
        if (advancedViewConfig !== null && advancedViewConfig.ajaxConfig !== false) {
            var ajaxConfig = advancedViewConfig.ajaxConfig;
            var dataParser = advancedViewConfig.dataParser;
            contrail.ajaxHandler(ajaxConfig, null, function (response) {
                var parsedData = (dataParser != null)? dataParser(response) : response;
                var template = contrail.formatJSON2HTML(parsedData,2);
                deferredObj.resolve(template);
                return template;
            }, function (error) {
                //Nothing to do the default json will still remain shown
            });
        }
    }

    function initDetailDataClickEvents (detailEl, templateConfig, data) {
        if (templateConfig.templateGenerator === 'ColumnSectionTemplateGenerator') {
            $.each(templateConfig.templateGeneratorConfig.columns, function (columnKey, columnValue) {
                $.each(columnValue.rows, function (rowKey, rowValue) {
                    initDetailDataClickEvents(detailEl, rowValue, data)
                });
            });
        }

        if (templateConfig.templateGenerator === 'BlockListTemplateGenerator') {
            $.each(templateConfig.templateGeneratorConfig, function (configKey, configValue) {
                initDetailDataClickEvents(detailEl, configValue, data)
            });
        }

        if (templateConfig.templateGenerator === 'TextGenerator') {
            if (contrail.checkIfExist(templateConfig.events)) {
                $.each(templateConfig.events, function (eventKey, eventValue) {
                    $(detailEl).find('.' + templateConfig.key + '-value')
                        .off(eventKey)
                        .on(eventKey, function (event) {
                            eventValue(event, data);
                        });
                });
            }
        }

        if (templateConfig.templateGenerator === 'LinkGenerator') {
            //TODO
        }
    }

    return DetailsView;
});
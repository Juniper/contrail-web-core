/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var DetailsView = ContrailView.extend({
        render: function () {
            var loadingSpinnerTemplate = contrail.getTemplate4Id(cowc.TMPL_LOADING_SPINNER),
                viewConfig = this.attributes.viewConfig,
                data = viewConfig['data'],
                ajaxConfig = viewConfig['ajaxConfig'],
                templateConfig = viewConfig['templateConfig'],
                dataParser = viewConfig['dataParser'],
                app = viewConfig['app'],
                detailsTemplate = cowu.generateDetailTemplate(templateConfig, app),
                self = this, modelMap = this.modelMap;

            if(contrail.checkIfExist(data)) {
                self.$el.html(detailsTemplate(data));
                initActionClickEvents(self.$el, templateConfig.actions, data);
            } else {
                self.$el.append(loadingSpinnerTemplate);

                if (modelMap != null && modelMap[viewConfig['modelKey']] != null) {
                    var contrailViewModel = modelMap[viewConfig['modelKey']],
                        attributes;

                    if (!contrailViewModel.isRequestInProgress()) {
                        attributes = contrailViewModel.attributes;
                        self.$el.html(detailsTemplate(attributes));
                        initActionClickEvents(self.$el, templateConfig.actions, attributes);
                    } else {
                        contrailViewModel.onAllRequestsComplete.subscribe(function () {
                            attributes = contrailViewModel.attributes;
                            self.$el.html(detailsTemplate(attributes));
                            initActionClickEvents(self.$el, templateConfig.actions, attributes);
                        });
                    }
                } else {
                    contrail.ajaxHandler(ajaxConfig, null, function (response) {
                        var parsedData = dataParser(response);
                        self.$el.html(detailsTemplate(parsedData));
                        initActionClickEvents(self.$el, templateConfig.actions, parsedData);
                    });
                }
            }
        }
    });

    var initActionClickEvents = function(detailEl, actions, data) {
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

    return DetailsView;
});
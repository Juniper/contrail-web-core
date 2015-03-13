/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var DetailsView = Backbone.View.extend({
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
            } else {
                self.$el.append(loadingSpinnerTemplate);

                if (modelMap != null && modelMap[viewConfig['modelKey']] != null) {
                    var contrailViewModel = modelMap[viewConfig['modelKey']],
                        attributes;

                    if (!contrailViewModel.isRequestInProgress()) {
                        attributes = contrailViewModel.attributes;
                        self.$el.html(detailsTemplate(attributes));
                    } else {
                        contrailViewModel.onAllRequestsComplete.subscribe(function () {
                            attributes = contrailViewModel.attributes;
                            self.$el.html(detailsTemplate(attributes));
                        });
                    }
                } else {
                    contrail.ajaxHandler(ajaxConfig, null, function (response) {
                        self.$el.html(detailsTemplate(dataParser(response)));
                    });
                }
            }
        }
    });

    return DetailsView;
});
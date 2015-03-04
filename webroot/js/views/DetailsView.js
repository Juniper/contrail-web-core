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
                ajaxConfig = viewConfig['ajaxConfig'],
                templateConfig = viewConfig['templateConfig'],
                dataParser = viewConfig['dataParser'],
                app = viewConfig['app'],
                detailsTemplate = cowu.generateDetailTemplate(templateConfig, app),
                self = this;

            self.$el.append(loadingSpinnerTemplate);

            contrail.ajaxHandler(ajaxConfig, null, function(response) {
                self.$el.html(detailsTemplate(dataParser(response)));
            });
        }
    });

    return DetailsView;
});
/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var FormTextView = ContrailView.extend({
        render: function () {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                elementConfig = viewConfig.elementConfig,
                textTemplate = contrail.getTemplate4Id((viewConfig.templateId) ? viewConfig.templateId: cowc.TMPL_TEXT_VIEW),
                tmplParameters;

            tmplParameters = {
                viewConfig: viewConfig
            };

            self.$el.html(textTemplate(tmplParameters));
        }
    });

    return FormTextView;
});

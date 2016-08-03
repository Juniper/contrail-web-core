/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var FormButtonView = ContrailView.extend({
        render: function () {
            var self = this,
                buttonTemplate = contrail.getTemplate4Id(cowc.TMPL_BUTTON_VIEW),
                viewConfig = self.attributes.viewConfig,
                elId = self.attributes.elementId,
                app = self.attributes.app,
                elementConfig = viewConfig.elementConfig, tmplParameters;

            viewConfig.label = (viewConfig.label != null)? viewConfig.label : ((elId != null)? cowl.get(elId, app) : cowl.get(path, app));

            tmplParameters = { id: elId, name: elId, class: "col-xs-3", viewConfig: viewConfig };

            self.$el.html(buttonTemplate(tmplParameters));
        }
    });

    return FormButtonView;
});

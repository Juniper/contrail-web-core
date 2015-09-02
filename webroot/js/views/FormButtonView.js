/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var FormInputView = ContrailView.extend({
        render: function () {
            var self = this,
                buttonTemplate = contrail.getTemplate4Id(cowc.TMPL_BUTTON_VIEW),
                viewConfig = self.attributes.viewConfig,
                label = self.attributes.label,
                elId = self.attributes.elementId,
                app = self.attributes.app,
                visible = self.attributes.visible,
                elementConfig = viewConfig.elementConfig,
                labelValue = (label != null)? label :((elId != null) ? cowl.get(elId, app) : cowl.get(path, app)),
                tmplParameters;

            tmplParameters = {
                label: labelValue, id: elId, name: elId, visible: visible, class: "span3", elementConfig: elementConfig
            };

            self.$el.html(buttonTemplate(tmplParameters));
        }
    });

    return FormInputView;
});

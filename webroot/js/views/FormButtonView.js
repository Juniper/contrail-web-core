/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var FormInputView = ContrailView.extend({
        render: function () {
            var buttonTemplate = contrail.getTemplate4Id(cowc.TMPL_BUTTON_VIEW),
                viewConfig = this.attributes.viewConfig,
                label = this.attributes.label,
                elId = this.attributes.elementId,
                app = this.attributes.app,
                visible = this.attributes.visible,
                labelValue = (label != null)? label :((elId != null) ? cowl.get(elId, app) : cowl.get(path, app)),
                tmplParameters;

            tmplParameters = {
                label: labelValue, id: elId, name: elId, visible: visible, class: "span3"
            };

            this.$el.html(buttonTemplate(tmplParameters));
        }
    });

    return FormInputView;
});

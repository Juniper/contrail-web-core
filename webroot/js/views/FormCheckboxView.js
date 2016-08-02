/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var FormCheckboxView = ContrailView.extend({
        render: function () {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                checkBoxTemplate = contrail.getTemplate4Id((viewConfig.templateId) ? viewConfig.templateId: cowc.TMPL_CHECKBOX_VIEW),
                elId = self.attributes.elementId,
                app = self.attributes.app,
                validation = self.attributes.validation,
                path = viewConfig['path'],
                type = (viewConfig['type'] != null) ? viewConfig['type'] : 'checkbox',
                label = viewConfig.label,
                lockEditingByDefault = self.attributes.lockEditingByDefault,
                labelValue = (label != null)? label :((elId != null)? cowl.get(elId, app) : cowl.get(path, app)),
                tmplParameters;

            if (!(contrail.checkIfExist(lockEditingByDefault) && lockEditingByDefault)) {
                lockEditingByDefault = false;
            }
            self.model.initLockAttr(path, lockEditingByDefault);

            tmplParameters = {
                id: elId, name: elId, type: type, class: "col-xs-12",
                label: labelValue,  viewConfig: viewConfig,
                lockAttr: lockEditingByDefault, validation: validation
            };
            self.$el.html(checkBoxTemplate(tmplParameters));
        }
    });

    return FormCheckboxView;
});
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
                viewConfig = self.attributes.viewConfig,
                inputTemplate = contrail.getTemplate4Id((viewConfig.templateId) ? viewConfig.templateId: cowc.TMPL_INPUT_VIEW),
                elId = self.attributes.elementId,
                app = self.attributes.app,
                validation = self.attributes.validation,
                path = viewConfig[cowc.KEY_PATH],
                type = (viewConfig[cowc.KEY_TYPE] != null) ? viewConfig[cowc.KEY_TYPE] : 'text',
                lockEditingByDefault = self.attributes.lockEditingByDefault,
                label = viewConfig.label,
                labelValue = (label != null)? label :((elId != null)? cowl.get(elId, app) : cowl.get(path, app)),
                tmplParameters,
                onBlur = viewConfig.onBlur;

            if (!(contrail.checkIfExist(lockEditingByDefault) && lockEditingByDefault)) {
                lockEditingByDefault = false;
            }

            self.model.initLockAttr(path, lockEditingByDefault);

            tmplParameters = {
                id: elId, name: elId, type: type, class: "span12",
                label: labelValue, viewConfig: viewConfig,
                lockAttr: lockEditingByDefault, validation: validation
            };

            self.$el.html(inputTemplate(tmplParameters));
            if (onBlur) {
                self.$el.find('input').blur(onBlur);
            }
        }
    });

    return FormInputView;
});

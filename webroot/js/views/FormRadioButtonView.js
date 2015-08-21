/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var FormRadioButtonView = ContrailView.extend({
        render: function () {
            var radioButtonTemplate = contrail.getTemplate4Id(cowc.TMPL_RADIO_BUTTON_VIEW),
                viewConfig = this.attributes.viewConfig,
                elementConfig = viewConfig[cowc.KEY_ELEMENT_CONFIG],
                elId = this.attributes.elementId,
                app = this.attributes.app,
                validation = this.attributes.validation,
                path = viewConfig['path'],
                type = (viewConfig['type'] != null) ? viewConfig['type'] : 'radio',
                lockEditingByDefault = this.attributes.lockEditingByDefault,
                labelValue = (elId != null) ? cowl.get(elId, app) : cowl.get(path, app),
                tmplParameters;

            if (!(contrail.checkIfExist(lockEditingByDefault) && lockEditingByDefault)) {
                lockEditingByDefault = false;
            }
            this.model.initLockAttr(path, lockEditingByDefault);

            tmplParameters = {
                label: labelValue, id: elId, name: elId,
                dataBindValue: viewConfig['dataBindValue'],
                lockAttr: lockEditingByDefault,
                isChecked: viewConfig['dataBindValue'],
                path: path, validation: validation,
                elementConfig: elementConfig
            };

            this.$el.html(radioButtonTemplate(tmplParameters));
        }
    });

    return FormRadioButtonView;
});

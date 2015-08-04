/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var FormCheckboxView = ContrailView.extend({
        render: function () {
            var checkBoxTemplate = contrail.getTemplate4Id(cowc.TMPL_CHECKBOX_VIEW),
                viewConfig = this.attributes.viewConfig,
                label = this.attributes.label,
                elId = this.attributes.elementId,
                app = this.attributes.app,
                validation = this.attributes.validation,
                path = viewConfig['path'],
                type = (viewConfig['type'] != null) ? viewConfig['type'] : 'checkbox',
                lockEditingByDefault = this.attributes.lockEditingByDefault,
                labelValue = (label != null)? label :((elId != null)?
                    cowl.get(elId, app) : cowl.get(path, app)),
                tmplParameters;

            if (!(contrail.checkIfExist(lockEditingByDefault) && lockEditingByDefault)) {
                lockEditingByDefault = false;
            }
            this.model.initLockAttr(path, lockEditingByDefault);

            tmplParameters = {
                label: labelValue, id: elId, name: elId, disabled: viewConfig['disabled'],
                dataBindValue: viewConfig['dataBindValue'],
                lockAttr: lockEditingByDefault, type: type,
                isChecked: viewConfig['dataBindValue'],
                class: "span12", path: path, validation: validation
            };
            this.$el.html(checkBoxTemplate(tmplParameters));
        }
    });

    return FormCheckboxView;
});
/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var FormInputView = ContrailView.extend({
        render: function () {
            var inputTemplate = contrail.getTemplate4Id(cowc.TMPL_INPUT_VIEW),
                viewConfig = this.attributes.viewConfig,
                elId = this.attributes.elementId,
                app = this.attributes.app,
                validation = this.attributes.validation,
                path = viewConfig[cowc.KEY_PATH],
                visible = this.attributes.visible,
                placeHolder = (viewConfig['placeHolder'] != null) ? viewConfig['placeHolder'] : null,
                type = (viewConfig[cowc.KEY_TYPE] != null) ? viewConfig[cowc.KEY_TYPE] : 'text',
                lockEditingByDefault = this.attributes.lockEditingByDefault,
                labelValue = (elId != null) ? cowl.get(elId, app) : cowl.get(path, app),
                tmplParameters;

            if (!(contrail.checkIfExist(lockEditingByDefault) && lockEditingByDefault)) {
                lockEditingByDefault = false;
            }
            this.model.initLockAttr(path, lockEditingByDefault);

            tmplParameters = {
                label: labelValue, id: elId, name: elId, placeHolder: placeHolder, disabled: viewConfig['disabled'],
                dataBindValue: viewConfig[cowc.KEY_DATABIND_VALUE],
                lockAttr: lockEditingByDefault, type: type, visible: visible,
                class: "span12", path: path, validation: validation
            };

            this.$el.html(inputTemplate(tmplParameters));
        }
    });

    return FormInputView;
});

/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var FormInputView = Backbone.View.extend({
        render: function () {
            var inputTemplate = contrail.getTemplate4Id(cowc.TMPL_INPUT_VIEW),
                viewConfig = this.attributes.viewConfig,
                elId = this.attributes.elementId,
                validation = this.attributes.validation,
                path = viewConfig[cowc.KEY_PATH],
                type = (viewConfig[cowc.KEY_TYPE] != null) ? viewConfig[cowc.KEY_TYPE] : 'text',
                lockEditingByDefault = this.attributes.lockEditingByDefault,
                labelValue = (elId != null) ? smwl.get(elId) : smwl.get(path),
                tmplParameters;

            if (!(contrail.checkIfExist(lockEditingByDefault) && lockEditingByDefault)) {
                lockEditingByDefault = false;
            }
            this.model.initLockAttr(path, lockEditingByDefault);

            tmplParameters = {
                label: labelValue, id: elId, name: elId, disabled: viewConfig['disabled'],
                dataBindValue: viewConfig[cowc.KEY_DATABIND_VALUE],
                lockAttr: lockEditingByDefault, type: type,
                class: "span12", path: path, validation: validation
            };

            this.$el.html(inputTemplate(tmplParameters));
        }
    });

    return FormInputView;
});
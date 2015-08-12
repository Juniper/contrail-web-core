/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var FormTextareaView = Backbone.View.extend({
        render: function () {
            var inputTemplate = contrail.getTemplate4Id(cowc.TMPL_TEXTAREA_VIEW),
                viewConfig = this.attributes.viewConfig,
                elementConfig = viewConfig.elementConfig;
                elId = this.attributes.elementId,
                app = this.attributes.app,
                validation = this.attributes.validation,
                path = viewConfig[cowc.KEY_PATH],
                type = (viewConfig[cowc.KEY_TYPE] != null) ? viewConfig[cowc.KEY_TYPE] : 'text',
                lockEditingByDefault = this.attributes.lockEditingByDefault,
                labelValue = (elId != null) ? cowl.get(elId, app) : cowl.get(path, app),
                eleclass = (elementConfig['class'] != null)? 'span12 ' + elementConfig['class'] : 'span12';
            var tmplParameters;

            if (!(contrail.checkIfExist(lockEditingByDefault) && lockEditingByDefault)) {
                lockEditingByDefault = false;
            }
            this.model.initLockAttr(path, lockEditingByDefault);

            tmplParameters = {
                label: labelValue, id: elId, name: elId, disabled: viewConfig['disabled'],
                dataBindValue: viewConfig[cowc.KEY_DATABIND_VALUE],
                lockAttr: lockEditingByDefault, type: type,
                class: eleclass, path: path, validation: validation
            };

            this.$el.html(inputTemplate(tmplParameters));
        }
    });

    return FormTextareaView;
});
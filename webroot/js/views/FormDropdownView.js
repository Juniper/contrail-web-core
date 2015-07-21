/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var FormDropdownView = Backbone.View.extend({
        render: function () {
            var dropdownTemplate = contrail.getTemplate4Id(cowc.TMPL_DROPDOWN_VIEW),
                viewConfig = this.attributes.viewConfig,
                elId = this.attributes.elementId,
                app = this.attributes.app,
                elementConfig = viewConfig[cowc.KEY_ELEMENT_CONFIG],
                path = viewConfig[cowc.KEY_PATH],
                lockEditingByDefault = this.attributes.lockEditingByDefault,
                labelValue = (elId != null) ? cowl.get(elId, app) : cowl.get(path, app),
                tmplParameters;

            if (!(contrail.checkIfExist(lockEditingByDefault) && lockEditingByDefault)) {
                lockEditingByDefault = false;
            }
            this.model.initLockAttr(path, lockEditingByDefault);

            tmplParameters = {
                label: labelValue, id: elId + '_dropdown', name: elId,
                dataBindValue: viewConfig[cowc.KEY_DATABIND_VALUE],
                lockAttr: lockEditingByDefault,
                class: "span12", elementConfig: elementConfig
            };

            this.$el.html(dropdownTemplate(tmplParameters));

            if (contrail.checkIfFunction(elementConfig.onInit)) {
                elementConfig.onInit(this.model.model());
            }
        }
    });

    return FormDropdownView;
});
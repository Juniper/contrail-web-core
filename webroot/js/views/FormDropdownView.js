/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var FormDropdownView = Backbone.View.extend({
        render: function () {
            var dropdownTemplate = contrail.getTemplate4Id(smwc.TMPL_DROPDOWN_VIEW),
                viewConfig = this.attributes.viewConfig,
                elId = this.attributes.elementId,
                elementConfig = viewConfig[smwc.KEY_ELEMENT_CONFIG],
                path = viewConfig[smwc.KEY_PATH],
                lockEditingByDefault = this.attributes.lockEditingByDefault,
                labelValue = (elId != null) ? smwl.get(elId) : smwl.get(path),
                tmplParameters;

            if (!(contrail.checkIfExist(lockEditingByDefault) && lockEditingByDefault)) {
                lockEditingByDefault = false;
            }
            this.model.initLockAttr(path, lockEditingByDefault);

            tmplParameters = {
                label: labelValue, id: elId + '_dropdown', name: elId,
                dataBindValue: viewConfig[smwc.KEY_DATABIND_VALUE],
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
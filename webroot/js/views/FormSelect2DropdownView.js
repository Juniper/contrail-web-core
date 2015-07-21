/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var FormSelect2DropdownView = Backbone.View.extend({
        render: function () {
            var dropdownTemplate = contrail.getTemplate4Id(cowc.TMPL_SELECT2_DROPDOWN_VIEW),
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
                label: labelValue, id: elId, name: elId,
                dataBindValue: viewConfig[cowc.KEY_DATABIND_VALUE],
                class: "span12",
                lockAttr: lockEditingByDefault,
                elementConfig: elementConfig
            };

            this.$el.html(dropdownTemplate(tmplParameters));

        }
    });

    return FormSelect2DropdownView;
});
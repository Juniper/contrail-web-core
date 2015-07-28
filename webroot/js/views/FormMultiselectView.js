/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var FormMultiselectView = ContrailView.extend({
        render: function () {
            var msTemplate = contrail.getTemplate4Id(cowc.TMPL_MULTISELECT_VIEW),
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
                lockAttr: lockEditingByDefault,
                dataBindValue: viewConfig[cowc.KEY_DATABIND_VALUE],
                class: "span12", elementConfig: elementConfig
            };

            this.$el.html(msTemplate(tmplParameters));
        }
    });

    return FormMultiselectView;
});
/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var FormMultiselectView = Backbone.View.extend({
        render: function () {
            var msTemplate = contrail.getTemplate4Id(smwc.TMPL_MULTISELECT_VIEW),
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
                label: labelValue, id: elId, name: elId,
                lockAttr: lockEditingByDefault,
                dataBindValue: viewConfig[smwc.KEY_DATABIND_VALUE],
                class: "span12", elementConfig: elementConfig
            };

            this.$el.html(msTemplate(tmplParameters));
        }
    });

    return FormMultiselectView;
});
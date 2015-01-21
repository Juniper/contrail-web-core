/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var FormDropdownView = Backbone.View.extend({
        render: function () {
            var dropdownTemplate = contrail.getTemplate4Id(smwc.TMPL_GRID_DROPDOWN_VIEW),
                viewConfig = this.attributes.viewConfig,
                elId = this.attributes.elementId,
                elementConfig = viewConfig[smwc.KEY_ELEMENT_CONFIG],
                tmplParameters;

            tmplParameters = { id: elId, name: elId, dataBindValue: viewConfig[smwc.KEY_DATABIND_VALUE], class: "span12",
                elementConfig: elementConfig, width: contrail.checkIfExist(viewConfig.width) ? viewConfig.width : 200};

            this.$el.html(dropdownTemplate(tmplParameters));
        }
    });

    return FormDropdownView;
});
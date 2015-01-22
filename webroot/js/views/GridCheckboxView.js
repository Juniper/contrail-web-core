/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var GridCheckboxView = Backbone.View.extend({
        render: function () {
            var checkBoxTemplate = contrail.getTemplate4Id(cowc.TMPL_GRID_CHECKBOX_VIEW),
                viewConfig = this.attributes.viewConfig,
                elId = this.attributes.elementId,
                validation = this.attributes.validation,
                path = viewConfig['path'],
                type = (viewConfig['type'] != null) ? viewConfig['type'] : 'checkbox',
                tmplParameters;

            tmplParameters = { id: elId, name: elId, type: type, dataBindValue: viewConfig['dataBindValue'], class: "span12", path: path, validation: validation };

            this.$el.html(checkBoxTemplate(tmplParameters));
        }
    });

    return GridCheckboxView;
});
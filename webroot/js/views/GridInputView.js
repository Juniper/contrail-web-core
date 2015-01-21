/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var GridInputView = Backbone.View.extend({
        render: function () {
            var inputTemplate = contrail.getTemplate4Id(smwc.TMPL_GRID_INPUT_VIEW),
                viewConfig = this.attributes.viewConfig,
                elId = this.attributes.elementId,
                validation = this.attributes.validation,
                path = viewConfig[smwc.KEY_PATH],
                type = (viewConfig[smwc.KEY_TYPE] != null) ? viewConfig[smwc.KEY_TYPE] : 'text',
                tmplParameters;

            tmplParameters = { id: elId, name: elId, dataBindValue: viewConfig[smwc.KEY_DATABIND_VALUE], type: type, class: "span12", path: path, validation: validation };

            this.$el.html(inputTemplate(tmplParameters));
        }
    });

    return GridInputView;
});
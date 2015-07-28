/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var GridInputView = ContrailView.extend({
        render: function () {
            var inputTemplate = contrail.getTemplate4Id(cowc.TMPL_GRID_INPUT_VIEW),
                viewConfig = this.attributes.viewConfig,
                elId = this.attributes.elementId,
                validation = this.attributes.validation,
                path = viewConfig[cowc.KEY_PATH],
                type = (viewConfig[cowc.KEY_TYPE] != null) ? viewConfig[cowc.KEY_TYPE] : 'text',
                tmplParameters;

            tmplParameters = { id: elId, name: elId, dataBindValue: viewConfig[cowc.KEY_DATABIND_VALUE], type: type, class: "span12", path: path, validation: validation };

            this.$el.html(inputTemplate(tmplParameters));
        }
    });

    return GridInputView;
});
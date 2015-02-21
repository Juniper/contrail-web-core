/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var GridMultiselectView = Backbone.View.extend({
        render: function () {
            var msTemplate = contrail.getTemplate4Id(cowc.TMPL_GRID_MULTISELECT_VIEW),
                viewConfig = this.attributes.viewConfig,
                elId = this.attributes.elementId,
                elementConfig = viewConfig[cowc.KEY_ELEMENT_CONFIG],
                path = viewConfig[cowc.KEY_PATH],
                tmplParameters;

            tmplParameters = { id: elId, name: elId, dataBindValue: viewConfig[cowc.KEY_DATABIND_VALUE], class: "span12",
                                elementConfig: elementConfig, width: contrail.checkIfExist(viewConfig.width) ? viewConfig.width : 200 };

            this.$el.html(msTemplate(tmplParameters));
        }
    });

    return GridMultiselectView;
});
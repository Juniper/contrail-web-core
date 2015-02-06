/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var VisualizationView = Backbone.View.extend({
        render: function () {
            var vTemplate = contrail.getTemplate4Id(cowc.TMPL_VISUALIZATION_VIEW),
                viewConfig = this.attributes.viewConfig,
                vConfig = viewConfig['elementConfig'];

            this.$el.html(vTemplate);

            drawVisualization(vConfig);
        }
    });

    return VisualizationView;
});
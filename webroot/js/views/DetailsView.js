/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var DetailsView = Backbone.View.extend({
        render: function () {
            var detailsTemplate = contrail.getTemplate4Id(cowc.TMPL_TABS_VIEW),
                viewConfig = this.attributes.viewConfig,
                self = this;

            this.$el.html('');
        }
    });

    return DetailsView;
});
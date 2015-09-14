/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {

    var QueryFormView = ContrailView.extend({

        renderSelect: function (options) {
            this.renderView4Config(this.$el, this.model, getSelectViewConfig());
        },

        renderWhere: function (options) {
            alert('where');
        },

        renderFilter: function (options) {
            alert('filter');
        }
    });

    function getSelectViewConfig() {
        return {
            view: "QuerySelectView",
            viewConfig: {}
        };
    };

    return QueryFormView;
});
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
            this.renderView4Config(this.$el, this.model, getSelectViewConfig(contrail.checkIfExist(options) ? options : {}));
        },

        renderWhere: function (options) {
            this.renderView4Config(this.$el, this.model, getWhereViewConfig(contrail.checkIfExist(options) ? options : {}));
        },

        renderFilter: function (options) {
            alert('filter');
        }
    });

    function getSelectViewConfig(options) {
        return {
            view: "QuerySelectView",
            viewConfig: {
                className: contrail.checkIfExist(options.className) ? options.className : cowc.QE_DEFAULT_MODAL_CLASSNAME
            }
        };
    };

    function getWhereViewConfig(options) {
        return {
            view: "QueryWhereView",
            viewConfig: {
                className: contrail.checkIfExist(options.className) ? options.className : cowc.QE_DEFAULT_MODAL_CLASSNAME
            }
        };
    };

    return QueryFormView;
});
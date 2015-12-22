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
            qewu.parseSelectString2Array(this.model);
            this.renderView4Config(this.$el, this.model, getSelectViewConfig(contrail.checkIfExist(options) ? options : {}));
        },

        renderWhere: function (options) {
            qewu.parseWhereString2Collection(this.model);
            this.model.addNewOrClauses([{}]);
            this.renderView4Config(this.$el, this.model, getWhereViewConfig(contrail.checkIfExist(options) ? options : {}));
        },

        renderFilters: function (options) {
            // need to parseSelectString as filter is dependent on select
            qewu.parseSelectString2Array(this.model);
            qewu.parseFilterString2Collection(this.model);
            this.renderView4Config(this.$el, this.model, getFilterViewConfig(contrail.checkIfExist(options) ? options : {}));
            this.model.addFilterAndClause([]);
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

    function getFilterViewConfig(options) {
        return {
            view: "QueryFilterView",
            viewConfig: {
                className: contrail.checkIfExist(options.className) ? options.className : cowc.QE_DEFAULT_MODAL_CLASSNAME
            }
        };
    };

    return QueryFormView;
});
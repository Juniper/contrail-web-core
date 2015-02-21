/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-list-model'
], function (_, Backbone, ContrailListModel) {
    var GridView = Backbone.View.extend({
        render: function () {
            var viewConfig = this.attributes.viewConfig,
                model = this.model, elId = this.attributes.elementId,
                listModelConfig = $.extend(true, {}, viewConfig.elementConfig['body']['dataSource']),
                contrailListModel = new ContrailListModel(listModelConfig),
                gridConfig;

            delete viewConfig.elementConfig['body']['dataSource']['remote'];
            viewConfig.elementConfig['body']['dataSource'] = {dataView: contrailListModel};
            gridConfig = $.extend(true, {}, defaultGridConfig, viewConfig.elementConfig);

            cowu.renderGrid(this.$el, gridConfig);
        }
    });

    var defaultGridConfig = {
        header: {
            defaultControls: {
                exportable: false,
                refreshable: true,
                searchable: true
            }
        },
        body: {
            options: {
                checkboxSelectable: true,
                detail: false
            }
        },
        footer: {
            pager: {
                options: {
                    pageSize: 5,
                    pageSizeSelect: [5, 10, 50]
                }

            }
        }
    };

    return GridView;
});
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
                elId = this.attributes.elementId,
                listModelConfig = $.extend(true, {}, viewConfig.elementConfig['body']['dataSource']),
                contrailListModel, gridConfig,
                self = this;

            if(this.model != null) {
                contrailListModel =  this.model;
            } else {
                contrailListModel = new ContrailListModel(listModelConfig);
            }

            delete viewConfig.elementConfig['body']['dataSource']['remote'];
            viewConfig.elementConfig['body']['dataSource'] = {dataView: contrailListModel};
            gridConfig = $.extend(true, {}, defaultGridConfig, viewConfig.elementConfig);

            cowu.renderGrid(this.$el, gridConfig);

            if(contrailListModel.loadedFromCache || !(contrailListModel.isRequestInProgress())) {
                if(contrail.checkIfExist($(self.$el).data('contrailGrid'))) {
                    $(self.$el).data('contrailGrid').removeGridLoading();
                    if (contrailListModel.getItems().length == 0) {
                        $(self.$el).data('contrailGrid').showGridMessage('empty')
                    }
                }
            }

            contrailListModel.onAllRequestsComplete.subscribe(function() {
                if(contrail.checkIfExist($(self.$el).data('contrailGrid'))) {
                    $(self.$el).data('contrailGrid').removeGridLoading();
                    if (contrailListModel.getItems().length == 0) {
                        $(self.$el).data('contrailGrid').showGridMessage('empty')
                    }
                }
            });
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
                detail: false,
                lazyLoading: true
            }
        },
        footer: {
            pager: {
                options: {
                    pageSize: 5,
                    pageSizeSelect: [5, 10, 50, 100]
                }

            }
        }
    };

    return GridView;
});
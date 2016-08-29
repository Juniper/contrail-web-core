/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    //TODO: Make it generic for any kind of form edit.
    var FormGridView = ContrailView.extend({
        render: function () {
            console.warn('Contrail WebUI Warning: FormGridView is deprecated. Please use GridView instead.');
            var viewConfig = this.attributes.viewConfig,
                model = this.model,
                elId = this.attributes.elementId;

            var defaultFormGridConfig = {
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

            var gridConfig = $.extend(true, {}, defaultFormGridConfig, viewConfig.elementConfig);

            cowu.renderGrid(this.$el, gridConfig);
        }
    });

    return FormGridView;
});
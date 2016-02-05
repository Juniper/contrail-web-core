/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {

    var QueryResultGridView = ContrailView.extend({
        render: function () {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                queryRequestPostData = viewConfig.queryRequestPostData,
                queryFormAttributes = contrail.checkIfExist(viewConfig.queryFormAttributes) ? viewConfig.queryFormAttributes.formModelAttrs : queryRequestPostData.formModelAttrs,
                formQueryIdSuffix = contrail.checkIfKeyExistInObject(true, viewConfig.queryFormAttributes, 'queryId') ? '-' + viewConfig.queryFormAttributes.queryId : '',
                queryResultGridId = contrail.checkIfExist(viewConfig.queryResultGridId) ? viewConfig.queryResultGridId : cowl.QE_QUERY_RESULT_GRID_ID + formQueryIdSuffix,
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                gridOptions = viewConfig['gridOptions'],
                queryGridListModel = null,
                queryResultRemoteConfig,
                listModelConfig;

            //self.model here is QueryFormModel. for rendering Grid we will use the list model from model map or create new one.
            if (contrail.checkIfExist(viewConfig.modelKey) && contrail.checkIfExist(modelMap[viewConfig.modelKey])) {
                queryGridListModel = modelMap[viewConfig.modelKey]
            }

            if (queryGridListModel === null && contrail.checkIfExist(viewConfig.modelConfig)) {
                listModelConfig = viewConfig['modelConfig'];
                queryResultRemoteConfig = listModelConfig['remote'].ajaxConfig;
                queryGridListModel = new ContrailListModel(listModelConfig);
            }

            //Create listModel config using the viewConfig parameters.
            if (queryGridListModel === null && !contrail.checkIfExist(viewConfig.modelConfig)) {
                queryResultRemoteConfig = {
                    url: "/api/qe/query",
                    type: 'POST',
                    data: JSON.stringify(queryRequestPostData)
                };

                listModelConfig = {
                    remote: {
                        ajaxConfig: queryResultRemoteConfig,
                        dataParser: function(response) {
                            return response['data'];
                        },
                        successCallback: function(resultJSON, contrailListModel, response) {
                            if (response.status === 'queued') {
                                $('#' + queryResultGridId).data('contrailGrid').showGridMessage(response.status)
                            } else if (contrailListModel.getItems().length == 0) {
                                //TODO - get rid of this
                                setTimeout(function(){
                                    $('#' + queryResultGridId).data('contrailGrid').showGridMessage('empty')
                                }, 1000);
                            }
                        }
                    }
                };

                queryGridListModel = new ContrailListModel(listModelConfig);
            }

            modelMap[cowc.UMID_QUERY_RESULT_LIST_MODEL] = queryGridListModel;

            self.renderView4Config(self.$el, queryGridListModel, getQueryResultGridViewConfig(queryResultRemoteConfig, queryResultGridId, queryFormAttributes, gridOptions), null, null, modelMap);
        }
    });

    function getQueryResultGridViewConfig(queryResultRemoteConfig, queryResultGridId, queryFormAttributes, gridOptions) {
        return {
            elementId: queryResultGridId,
            title: cowl.TITLE_RESULTS,
            iconClass: 'icon-table',
            view: "GridView",
            tabConfig: {
                activate: function(event, ui) {
                    if ($('#' + queryResultGridId).data('contrailGrid')) {
                        $('#' + queryResultGridId).data('contrailGrid').refreshView();
                    }
                }
            },
            viewConfig: {
                elementConfig: getQueryResultGridConfig(queryResultRemoteConfig, queryFormAttributes, gridOptions)
            }
        };
    }

    function getQueryResultGridConfig(queryResultRemoteConfig, queryFormAttributes, gridOptions) {
        var selectArray = queryFormAttributes.select.replace(/ /g, "").split(","),
            queryResultGridColumns = qewgc.getColumnDisplay4Grid(queryFormAttributes.table_name, queryFormAttributes.table_type, selectArray);

        if (contrail.checkIfExist(gridOptions.gridColumns)) {
            queryResultGridColumns = gridOptions.gridColumns.concat(queryResultGridColumns)
        }

        return {
            header: {
                title: {
                    text: gridOptions.titleText
                },
                defaultControls: {
                    collapseable: true,
                    refreshable: false,
                    columnPickable: true
                }
            },
            body: {
                options: {
                    checkboxSelectable: false,
                    fixedRowHeight: contrail.checkIfExist(gridOptions.fixedRowHeight) ? gridOptions.fixedRowHeight : 30,
                    forceFitColumns: false,
                    defaultDataStatusMessage: false
                },
                dataSource: {
                    remote: {
                        ajaxConfig: queryResultRemoteConfig,
                        dataParser: function(response) {
                            return response['data'];
                        }
                    }
                },
                statusMessages: {
                    queued: {
                        type: 'status',
                        iconClasses: '',
                        text: cowm.getQueryQueuedMessage(gridOptions.queryQueueUrl, gridOptions.queryQueueTitle)
                    }
                }
            },
            columnHeader: {
                columns: queryResultGridColumns
            },
            footer: {
                pager: contrail.handleIfNull(gridOptions.pagerOptions, { options: { pageSize: 100, pageSizeSelect: [100, 200, 500] } })
            }
        };
    };

    return QueryResultGridView;
});
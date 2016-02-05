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
                queryResultPostData = viewConfig.queryResultPostData,
                queryFormAttributes = contrail.checkIfExist(viewConfig.queryFormAttributes) ? viewConfig.queryFormAttributes.formModelAttrs : queryResultPostData.formModelAttrs,
                formQueryIdSuffix = contrail.checkIfKeyExistInObject(true, viewConfig.queryFormAttributes, 'queryId') ? '-' + viewConfig.queryFormAttributes.queryId : '',
                queryResultGridId = contrail.checkIfExist(viewConfig.queryResultGridId) ? viewConfig.queryResultGridId : cowl.QE_QUERY_RESULT_GRID_ID + formQueryIdSuffix,
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                gridOptions = viewConfig['gridOptions'],
                contrailListModel,
                queryResultRemoteConfig = {
                    url: "/api/qe/query",
                    type: 'POST',
                    data: JSON.stringify(queryResultPostData)
                },
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

            contrailListModel = new ContrailListModel(listModelConfig);
            modelMap[cowc.UMID_QUERY_RESULT_LIST_MODEL] = contrailListModel;

            self.renderView4Config(self.$el, contrailListModel, getQueryResultGridViewConfig(queryResultRemoteConfig, queryResultGridId, queryFormAttributes, gridOptions), null, null, modelMap);
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
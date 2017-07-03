/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'core-basedir/reports/qe/ui/js/common/qe.grid.config'
], function (_, ContrailView, ContrailListModel, qeGridConfig) {

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
                    data: JSON.stringify(queryRequestPostData),
                    dataFilter:function(data) {
                        return data;
                    }
                };

                listModelConfig = {
                    remote: {
                        ajaxConfig: queryResultRemoteConfig,
                        dataParser: function(response) {
                            return response['data'];
                        },
                        successCallback: function(resultJSON, contrailListModel, response) {
                            var grid = $('#' + queryResultGridId).data('contrailGrid');
                            if (response.status === 'queued') {
                                if (viewConfig.pollHere 
                                        && viewConfig.pollQueue && viewConfig.pollQueue.length > 0) {
                                    grid.showGridMessage('Your query has been queued, 0% Complete');
                                    self.initiatePollingForResult(grid, queryRequestPostData.queryId, viewConfig.pollQueue);
                                } else {
                                    grid.showGridMessage(response.status);
                                }
                            } else if (contrailListModel.getItems().length == 0) {
                                //TODO - get rid of this
                                setTimeout(function(){
                                    grid.showGridMessage('empty')
                                }, 1000);
                            }
                        }
                    }
                };

                queryGridListModel = new ContrailListModel(listModelConfig);
            }

            modelMap[cowc.UMID_QUERY_RESULT_LIST_MODEL] = queryGridListModel;

            self.renderView4Config(self.$el, queryGridListModel, 
                    getQueryResultGridViewConfig(queryResultRemoteConfig, 
                            queryResultGridId, queryFormAttributes, gridOptions), null, null, modelMap);
        },

        initiatePollingForResult : function (grid, queryId, queue) {
            var self = this,
                ajaxConfig = {
                   url: "/api/qe/query/queue?queryQueue="+queue+"&_="+(new Date().getTime()),
                   type:'GET',
                   async: false
                },
                checkProgress = function () {
                    contrail.ajaxHandler(ajaxConfig, null, function (response) {
                        var len = response.length, idx = 0;
                        for (idx = 0; idx < len; idx ++) {
                            if (response[idx].queryReqObj.queryId === queryId) {
                                grid.showGridMessage('Your query has been queued, '
                                        +response[idx].progress+'% Complete');
                                if (response[idx].progress == 100) {
                                    clearInterval(poll);
                                    self.render();
                                }
                            }
                        }
                    });
                },
                poll = setInterval(function () {checkProgress()}, 5000);
        }
    });

    function getQueryResultGridViewConfig(queryResultRemoteConfig, queryResultGridId, queryFormAttributes, gridOptions) {
        return {
            elementId: queryResultGridId,
            title: cowl.TITLE_RESULTS,
            iconClass: 'fa fa-table',
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
            queryResultGridColumns = qeGridConfig.getColumnDisplay4Grid(queryFormAttributes.table_name, queryFormAttributes.table_type, selectArray);

        if (contrail.checkIfExist(gridOptions.gridColumns)) {
            queryResultGridColumns = gridOptions.gridColumns.concat(queryResultGridColumns)
        }

        return qeGridConfig.getQueryGridConfig(queryResultRemoteConfig, queryResultGridColumns, gridOptions);
    };

    return QueryResultGridView;
});

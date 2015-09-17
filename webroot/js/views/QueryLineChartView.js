/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {

    var QueryLineChartView = ContrailView.extend({
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig,
                queryId = viewConfig['queryId'],
                contrailListModel = this.model;

            if(!(contrailListModel.isRequestInProgress())) {
                self.renderView4Config(self.$el, null, getQueryChartViewConfig(queryId));
            }

            contrailListModel.onAllRequestsComplete.subscribe(function() {
                self.renderView4Config(self.$el, null, getQueryChartViewConfig(queryId));
            });
        }
    });

    function getQueryChartViewConfig(queryId) {
        var chartUrl = '/api/admin/reports/query/chart-data?queryId=' + queryId,
            flowUrl = '/api/admin/reports/query/flow-classes?queryId=' + queryId;

        return {
            elementId: cowl.QE_CHART_PAGE_ID,
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: cowl.QE_CHART_ID,
                                title: cowl.TITLE_CHART,
                                view: "LineWithFocusChartView",
                                viewConfig: {
                                    chartOptions: {
                                        axisLabelDistance: 5,
                                        yAxisLabel: 'Sum(Bytes)',
                                        forceY: [0, 60],
                                        yFormatter: function(d) { return cowu.addUnits2Bytes(d, false, false, 1); }
                                    },
                                    modelConfig: {
                                        remote: {
                                            ajaxConfig: {
                                                url: chartUrl,
                                                type: 'GET'
                                            },
                                            dataParser: qewp.fsQueryDataParser
                                        }
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return QueryLineChartView;
});
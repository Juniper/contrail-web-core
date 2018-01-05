/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view'],
        function(
                _, ContrailView) {
            var DashboardListView = ContrailView.extend({
                render : function() {
                    var self = this;
                    self.renderView4Config($(contentContainer), null,
                            getDashboardListViewConfig());
                }
            });
            function getDashboardListViewConfig() {
                var controllerEnabled = cowu.getValueByJsonPath(globalObj, 'webServerInfo;featurePkgsInfo;webController;enable', false);
                var carouselpages = [];
                if (controllerEnabled && cowc.panelLayout) {
                    carouselpages.push({
                                    page: {
                                        elementId: 'dashboard-grid-stackview-0',
                                        view: 'GridStackView',
                                        viewConfig: {
                                            elementId: 'dashboard-grid-stackview-0',
                                            gridAttr: {
                                                 widthMultiplier: 24,
                                                heightMultiplier: 10
                                            },
                                            widgetCfgList: [{
                                                id: 'dashboard-resource-utilization-view',
                                                itemAttr: {
                                                    cssClass: 'panel panel-default',
                                                    height: 0.9,
                                                    width: 1/2
                                                }
                                            },{
                                                id: 'dashboard-virtualization-view',
                                                itemAttr: {
                                                    cssClass: 'panel panel-default',
                                                    height: 0.9,
                                                    width: 1/2,
                                                }
                                            },{
                                                id:'monitor-infra-scatterchart-view',
                                                itemAttr:{
                                                    height: 0.9,
                                                    width: 1/3,
                                                    cssClass: 'monitor-infra-all-node-chart panel panel-default',
                                                }
                                            },{
                                                id:'vrouter-active-drop-flows-chart',
                                                itemAttr: {
                                                    cssClass: 'panel panel-default',
                                                    width: 2/3,
                                                    height: 0.9
                                                }
                                            },{
                                                id: 'confignode-requests-served',
                                                itemAttr: {
                                                    height: 0.9,
                                                    width: 1/3,
                                                    cssClass: 'panel panel-default'
                                                }
                                            },{
                                                id: 'analyticsnode-sandesh-message-info',
                                                itemAttr: {
                                                    height: 0.9,
                                                    width: 1/3,
                                                    cssClass: 'panel panel-default'
                                                }
                                            },{
                                                id:'databasenode-disk-usage-info',
                                                itemAttr:{
                                                    height: 0.9,
                                                    width: 1/3,
                                                    cssClass: 'panel panel-default',
                                                }
                                            }]
                                        }
                                    }
                                }
                    );
                }
                carouselpages.push({
                    page: {
                        elementId: 'dashboard-grid-stackview-1',
                        view: "MonitorInfraDashboardView",
                        // viewPathPrefix: 'monitor/infrastructure/dashboard/ui/js/views/',
                        viewConfig: {
                            elementId: 'dashboard-grid-stackview-1',
                        }
                    }
                });
                var viewConfig = {
                    rows: [{
                        columns: [{
                            elementId: 'dashboard-carousel-view',
                            view: "CarouselView",
                            viewConfig: {
                                pages: carouselpages
                            }
                        }]
                    }]
                };
                return {
                    elementId : cowu.formatElementId([cowc.DASHBOARD_LIST_SECTION_ID ]),
                    view : "SectionView",
                    viewConfig : viewConfig
                };
            }
            return DashboardListView;
        });

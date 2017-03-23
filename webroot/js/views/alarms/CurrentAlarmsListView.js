/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view'],
        function(
                _, ContrailView) {
            var CurrentAlarmsListView = ContrailView.extend({
                render : function() {
                    this.renderView4Config(this.$el, null,
                            getCurrentAlarmsListViewConfig());
                }
            });
            function getCurrentAlarmsListViewConfig() {
                var viewConfig = {
                        rows : [
//                                monitorInfraUtils.getToolbarViewConfig(),
                                {
                                    columns : [
                                               {
                                        elementId: 'current-alarms-carousel-view',
                                        view: "CarouselView",
                                        viewConfig: {
                                            pages : [
                                                 {
                                                     page: {
                                                         elementId : 'current-alarms-grid-stackview',
                                                         view : "GridStackView",
                                                         viewConfig : {
                                                            elementId : 'current-alarms-gridstackview-page1',
                                                            gridAttr : {
//                                                                defaultWidth : 12,
//                                                                defaultHeight : 8
                                                            },
                                                            widgetCfgList: [
                                                                {
                                                                    id:'alarms-active-alarm-chart',
                                                                    itemAttr: {"height":11,"width":24,"x":0,"y":0}
                                                                },
                                                                {
                                                                    id:'alarms-grid-view',
                                                                    "itemAttr":{"height":31,"width":24,"x":0,"y":13}
                                                                }
                                                            ]
                                                         }
                                                     }
                                                 }
                                            ]
                                        }
                                    }]
                                }]
                       };
                return {
                    elementId : cowu.formatElementId([
                         ctwl.ANALYTICSNODE_SUMMARY_LIST_SECTION_ID ]),
                    view : "SectionView",
                    viewConfig : viewConfig
                };
            }
            return CurrentAlarmsListView;
        });

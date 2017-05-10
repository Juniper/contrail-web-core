/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define(
        [ 'underscore', 'contrail-view'],
        function(
                _, ContrailView) {
            var AlarmsListView = ContrailView.extend({
                render : function() {
                    this.renderView4Config(this.$el, null,
                            getAlarmsListViewConfig());
                }
            });
            function getAlarmsListViewConfig() {
                var viewConfig = {
                        rows : [
//                                monitorInfraUtils.getToolbarViewConfig(),
                                {
                                    columns : [
                                               {
                                        elementId: 'historical-alarms-carousel-view',
                                        view: "CarouselView",
                                        viewConfig: {
                                            pages : [
                                                 {
                                                     page: {
                                                         elementId : 'historical-alarms-grid-stackview',
                                                         view : "GridStackView",
                                                         viewConfig : {
                                                            elementId : 'historical-alarms-gridstackview-page1',
                                                            gridAttr : {
//                                                                defaultWidth : 12,
//                                                                defaultHeight : 8
                                                            },
                                                            disableResize: true,
                                                            disableDrag: true,
                                                            widgetCfgList: [
                                                                {id:'alarms-historical-chart'},
                                                                {id:'alarms-notification-view'},
                                                                {id:'alarms-active-alarm-filter-chart'},
                                                                {id:'alarms-event-drops'},
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
            return AlarmsListView;
        });

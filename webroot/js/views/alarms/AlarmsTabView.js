/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var AlarmsTabView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;

            self.renderView4Config(self.$el, null,
                    getAlarmsTabsViewConfig(viewConfig));
        }
    });

    var getAlarmsTabsViewConfig = function (viewConfig) {

        return {
            elementId: 'alarms-tab-section',
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'alarms-tabs',
                                view: "TabsView",
                                viewConfig: getAlarmsTabViewConfig(
                                                viewConfig)
                            }
                        ]
                    }
                ]
            }
        }
    };

    function getAlarmsTabViewConfig (viewConfig) {
        return {
            theme: 'default',
            active: 0,
            tabs: [
                    {
                        elementId:'historical-alarms-tab',
                        title: 'Events',
                        view: "AlarmsHistoryListView",
                        viewPathPrefix: cowc.ALARMS_VIEWPATH_PREFIX,
                        viewConfig: viewConfig,
                        tabConfig: {
                            activate: function(event, ui) {
                                if ( $('#historical-alarms-carousel-view')) {
                                    $('#historical-alarms-carousel-view').
                                                        trigger('refresh');
                                }
                                $('#historical-alarms-carousel-view').find('.grid-stack-item-content > .item-content').trigger('refresh');
                            }
                        }
                    },
                   {
                       elementId: 'current-alarms-tab',
                       title: 'Alarms',
                       view: "CurrentAlarmsListView",
                       viewPathPrefix: cowc.ALARMS_VIEWPATH_PREFIX,
                       viewConfig: viewConfig,
                       tabConfig: {
                           activate: function(event, ui) {
                               if ( $('#current-alarms-carousel-view')) {
                                   $('#current-alarms-carousel-view').
                                                       trigger('refresh');
                               }
                               //A hack to render the chart.
                               $('#current-alarms-carousel-view').find('.grid-stack-item-content > .item-content').trigger('refresh');
                               if ($('#' + cowl.ALARMS_GRID_ID).data('contrailGrid')) {
                                   $('#' + cowl.ALARMS_GRID_ID).data('contrailGrid').refreshView();
                               }
                           },
                           renderOnActivate: false
                       }
                   }
            ]
        }
    }
    return AlarmsTabView;
});

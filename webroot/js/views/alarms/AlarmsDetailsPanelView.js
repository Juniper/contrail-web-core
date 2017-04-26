/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
], function (_, ContrailView, ContrailListModel) {
    var AlarmsDetailsPanelView = ContrailView.extend({
//        initialize: function (args) {
//            var self = this;
//            self.selector = getValueByJsonPath(args, 'el');
//            self.viewConfig = getValueByJsonPath(args, 'viewConfig');
//        },
        render: function () {
            var self = this,
                template = cowu.getValueByJsonPath(self, 'viewConfig;template', 'alarms-dashboard-details-panel-template'),
                elementId = cowu.getValueByJsonPath(self, 'viewConfig;elementId', 'alarms-details-panel');
            var template = contrail.getTemplate4Id(template);
            $($(self.$el)).html(template);
            self.renderView4Config($('div.notification-content'), self.model,
                    getAlarmsDetailsPanelViewConfig()
            );
//            self.model.onDataUpdate.subscribe(function(){
//                $(targetSelector).parent().children().hide();
//            });
            $('.alarms-event-log-container').hide();
        }
    });

    var getAlarmsDetailsPanelViewConfig = function (viewConfig) {

        return {
            elementId: 'alarms-tab-section',
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'current-alarms-tab',
                                view: "NotificationTextView",
                                viewConfig: $.extend(viewConfig,{title: 'Active Alarms'}),
                                tabConfig: {
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    var getAlarmsDetailsPanelTabsViewConfig = function (viewConfig) {

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
                       elementId: 'current-alarms-tab',
                       title: 'Current Alarms',
                       view: "NotificationTextView",
                       viewConfig: viewConfig,
                       tabConfig: {
                       }
                   },
                   {
                       elementId:'alarm-event-log-tab',
                       title: 'Alarm Event Logs',
                       view: "AlarmEventsView",
                       viewPathPrefix: cowc.ALARMS_VIEWPATH_PREFIX,
                       viewConfig: $.extend(viewConfig,{
                                       title: 'Alarm Event Logs',
                                       target:'alarms-event-log-container'
                                   }),
                       tabConfig: {
                           renderOnActivate: true
                       }
                   },
            ]
        }
    }

    return AlarmsDetailsPanelView;
});
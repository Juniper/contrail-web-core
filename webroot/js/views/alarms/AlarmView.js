/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var MonitorAlarmsView = ContrailView.extend({
        el: $(contentContainer),

        renderAlarms: function (viewConfig) {
            var self = this;

            var currentHashParams = layoutHandler.getURLHashParams(),
                tabConfig = {};

            tabConfig = getAlarmsTabsViewConfig (currentHashParams);
            this.renderView4Config(this.$el, null, tabConfig, null, null, null);
        }
    });

    function getAlarmsTabsViewConfig(currHashParams) {
        return {
            elementId: 'alarms-tabs-section-id',
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'alarms-tab-view',
                                view: "AlarmsTabView",
                                viewPathPrefix: cowc.ALARMS_VIEWPATH_PREFIX
                            }
                        ]
                    }
                ]
            }
        };
    };

    return MonitorAlarmsView;

});
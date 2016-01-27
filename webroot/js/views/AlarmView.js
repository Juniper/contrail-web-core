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
            this.renderView4Config(this.$el, null, getAlarmsConfig());
        }
    });

    function getAlarmsConfig() {
        return {
            elementId: cowu.formatElementId([cowl.MONITOR_ALARMS_PAGE_ID]),
            view: "AlarmListView",
            viewPathPrefix: "js/views/",
            viewConfig: {}
        }
    };
    return MonitorAlarmsView;
});
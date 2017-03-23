/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
], function (_, ContrailView, ContrailListModel) {
    var AlarmEventsView = ContrailView.extend({
        render: function () {
            var self = this,
                template = cowu.getValueByJsonPath(self, 'viewConfig;template', 'alarms-event-logs-template'),
                elementId = cowu.getValueByJsonPath(self, 'viewConfig;elementId', 'alarms-event-log-panel');
            var template = contrail.getTemplate4Id(template);
            $($(self.$el)).html(template);
        }
    });


    return AlarmEventsView;
});
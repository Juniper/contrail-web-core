/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
], function (_, ContrailView, ContrailListModel) {
    var NotificationView = ContrailView.extend({
        initialize: function (args) {
            var self = this;
            self.selector = getValueByJsonPath(args, 'el');
            self.viewConfig = getValueByJsonPath(args, 'viewConfig');
        },
        render: function () {
            var self = this,
                template = cowu.getValueByJsonPath(self, 'viewConfig;template', 'notification-popover-template'),
                elementId = cowu.getValueByJsonPath(self, 'viewConfig;elementId', 'alarms-popup-link');
            var template = contrail.getTemplate4Id(template);
            var popover = $("#"+elementId).popover({
                            title: self.viewConfig['title'] || '',
                            placement: 'bottom',
                            container: 'body',
                            trigger: 'manual',
                            template: template()
            });
            var popoverContent = popover.data('bs.popover').tip();
            popoverContent.addClass('custom-popover');
            $("#"+elementId).popover('show');
            popoverContent.find('.notification-heading a.close_btn').on('click', function () {
                $("#"+elementId).popover('hide');
            });
            popoverContent.find('.notification-menu .monitor-alarms').on('click', function () {
                layoutHandler.setURLHashObj({p:'mon_alarms_dashboard'})
            });
            popoverContent.find('.notification-menu .config-alarms').on('click', function () {
                layoutHandler.setURLHashObj({p:'config_infra_gblconfig', q: {tab: {'global-config-tab': 'alarm_rule_global_tab'}}})
            });
            self.renderView4Config($('div.notification-content'), null,
                getNotificationViewConfig()
            );
        }

    });

    function getNotificationViewConfig () {
        return {
           elementId : cowc.NOTIFICATION_SECTION_ID,
           view : "SectionView",
           viewConfig : {
               rows : [ {
                   columns : [ {
                       elementId : cowc.NOTIFICATION_CHART_SECTION_ID,
                       view : "NotificationChartView",
                       viewConfig : {

                       }
                   } ]
               }, {
                   columns: [{
                       elementId : cowc.NOTIFICATION_TEXT_SECTION_ID,
                       view : "NotificationTextView",
                       viewConfig : {

                       }
                   }]
               }]
           }
       }
    };

    return NotificationView;
});
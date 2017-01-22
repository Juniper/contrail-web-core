/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'core-alarm-parsers',
    'core-alarm-utils',
    'contrail-list-model'
], function (_, ContrailView, coreAlarmParsers, coreAlarmUtils, ContrailListModel) {
    var NotificationTextView = ContrailView.extend({
        el: $(contentContainer),

        render: function (viewConfig) {
            var self = this,
                modelConfig = cowu.getValueByJsonPath(viewConfig, modelConfig, getAlarmModelConfig()),
                alarmListModel = new ContrailListModel(modelConfig);
            self.model = alarmListModel;
            self.renderView4Config(self.$el, self.model,
                    getNotificationTextViewConfig(viewConfig));
            alarmListModel.onDataUpdate.subscribe(function () {
                var alarms = self.model.getItems();
                var ack_newAlarms = coreAlarmUtils.getNewAndAcknowledgedAlarms(alarms);
                $('.custom-popover .notification-menu .ack-info').html(contrail.format('(<strong> {0}</strong> New, <strong> {1}</strong> Acknowledged)',
                     ack_newAlarms['new'].length, ack_newAlarms['ackAlarms'].length))
            });
        }
    });

    var getNotificationTextViewConfig = function (viewConfig) {

        return {
            elementId: cowc.NOTIFICATION_SECTION_TEXT_ID,
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: cowc.NOTIFICATION_TEXT_ID,
                                view: "TextView",
                                viewConfig: {
                                    template: 'notification-template'
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };
    function getAlarmModelConfig () {
        return {
            remote: {
                ajaxConfig: {
                    url: cowc.URL_ALARM_DETAILS,
                    type: "GET",
                },
                dataParser: coreAlarmParsers.alarmDataParser
            },
            vlRemoteConfig : {
                vlRemoteList : [{
                    getAjaxConfig : function() {
                        return {
                            url:ctwl.ANALYTICSNODE_SUMMARY_URL
                        };
                    },
                    successCallback : function(response, contrailListModel) {
                        coreAlarmUtils
                            .parseAndAddDerivedAnalyticsAlarms(
                                response, contrailListModel);
                    }
                }
                ]
            },
            cacheConfig: {
            }
        }
    }
    return NotificationTextView;
});
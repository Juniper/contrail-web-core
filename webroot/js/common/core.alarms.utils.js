/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(
       [ 'underscore',
         'core-constants'],
       function(_,cowc) {
            var CoreAlarmUtils = function() {
                var self = this;
                self.BUCKET_DURATION = 300000000;//5 MINS

                self.getAlarmCounts = function (response) {
                    var acked = 0, unacked = 0;
                    if(response != null && _.keys(response).length > 0) {
                         for(var currNodeType in response) {
                             for(var i = 0; i < response[currNodeType].length; i++) {
                                 var currItem = response[currNodeType][i];
                                 if(currItem.value != null && currItem.value.UVEAlarms != null && currItem.value.UVEAlarms.alarms != null
                                     && currItem.value.UVEAlarms.alarms.length > 0) {
                                     for(var j=0; j < currItem.value.UVEAlarms.alarms.length; j++) {
                                         var currObject = {};
                                         var alarmInfo = currItem.value.UVEAlarms.alarms[j];
                                         (alarmInfo.ack)? acked++ : unacked++;
                                     }
                                 }
                             }
                         }
                    }
                    return {acked:acked, unacked:unacked};
                }

                self.fetchAlarms = function (deferredObj) {
                    $.ajax({
                        url:'/api/tenant/monitoring/alarms',
                        type:'GET'
                    }).done(function(result) {
                        deferredObj.resolve(self.getAlarmCounts(result));
                    }).fail(function(err) {
                        deferredObj.resolve({acked:0,unacked:0});
                    });
                };

                self.fetchAndUpdateAlarmBell = function () {
                    var alarmDeferredObj = $.Deferred();

                    alarmDeferredObj.done( function(alarmCounts) {
                        self.updateAlarmBell(alarmCounts);
                        self.startUpdateBellTimer();
                    });
                    self.fetchAlarms(alarmDeferredObj);
                };

                self.updateAlarmBell = function (alarmCounts) {
                    if (alarmCounts != null && alarmCounts.unacked > 0) {
                        //update the icon
//                        $('#pageHeader').find('.icon-bell-alt').addClass('red');
                        $('#pageHeader').find('#alert_info').text('Alarms ('+ alarmCounts.unacked +')');
                    } else {
//                        $('#pageHeader').find('.icon-bell-alt').removeClass('red');
                        $('#pageHeader').find('#alert_info').text('Alarms');
                    }
                };

                self.startUpdateBellTimer = function () {
                    setTimeout(self.fetchAndUpdateAlarmBell,cowc.ALARM_REFRESH_DURATION);
                };
                //Call the update alarm bell
                self.fetchAndUpdateAlarmBell();

                self.mapSeverityToColor = function (severity) {
                    if (severity != -1) {
                        if (severity >= 2) {
                            return cowc.COLOR_SEVERITY_MAP['orange'];
                        } else {
                            return cowc.COLOR_SEVERITY_MAP['red'];
                        }
                    } else {
                        return false;
                    }
                }

                //Given an alarmType and other params fetch the correct message to be displayed.
                self.getFormattedAlarmMessage = function (options) {
                    var alarmInfo = options.alarm;
                    var alarmType = getValueByJsonPath(options, 'alarm;type','');
                    var n = 0;
                    if(getValueByJsonPath(options, 'detailed', false)) {
                        n = 1;
                    }
                    var alarmMsgs = getValueByJsonPath(alarmInfo,'description','').split('.');
                    var alarmTxt = (alarmMsgs.length > 0 && alarmMsgs[n])?
                                        alarmMsgs[n] : alarmMsgs[0];
                    return alarmTxt;
                }

                self.getAlertsFromAnalytics = function (options) {
                    var data = options.data;
                    var UVEAlarms = options.alarms;
//                    var nodeType = options.nodeType;
                    var processPath = options.processPath;
                    var alarms = [];
                    //If Alarms are present use this to show status else fetch the UP time and show
                    if (UVEAlarms != null && UVEAlarms.length > 0){
                        $.each(UVEAlarms, function (i, alarm) {
                            //If we need now show the acknowledged alarms keep this if block
                              if(!alarm.ack) {
                                var alarmObj = self.getAlarmObjectFromAnalyticsAlarm (options,alarm);
                                alarms.push(alarmObj);
                              }
                        })

                    } else {
                        //return the Up time
                    }
                    return alarms;
                };

                self.getAlarmObjectFromAnalyticsAlarm = function (options, alarm) {
                    var data = options.data;
                    var infoObj = {type:data['display_type'],link:data['link']};
                    var alarmMsg = (alarm.alarm_msg) ? alarm.alarm_msg:
                                    self.getFormattedAlarmMessage ({nodeType:options.nodeType, alarm:alarm});
                    return $.extend({
                        sevLevel: alarm.severity,
                        name: data['name'],
                        pName: data['display_type'],
                        msg: alarmMsg,
                    }, infoObj);
                };

                self.checkAndAddAnalyticsDownOrAlarmProcessDownAlarms = function (uve,alarmUVE) {
                    var processStatus = getValueByJsonPath(uve,
                            'value;NodeStatus;process_status');
                    var isAnalyticsApiDown = isAlarmGenDown = true;
                    // var alarmObjs = [];
                    if (processStatus != null) {
                        $.each(
                            processStatus,
                            function(i, proc) {
                                if (proc.module_id == cowc.ANALYTICS_API_PROCESS) {
                                    if (proc.state == 'Functional') {
                                        isAnalyticsApiDown = false;
                                    }
                                } else if (proc.module_id == cowc.ALARMGEN_PROCESS) {
                                    if (proc.state == 'Functional') {
                                        isAlarmGenDown = false;
                                    }
                                }
                            });
                        if (isAnalyticsApiDown) {
                            alarmUVE.push(self.createUserGeneratedAlarm({
                                severity : 1,
                                alarmText : cowc.ANALYTICS_API_DOWN_ALARM_TEXT,
                                display_name: getValueByJsonPath(uve,'name') +
                                                ' (Analytics Node)'
                            }));
                        }
                        if (isAlarmGenDown) {
                            alarmUVE.push(self.createUserGeneratedAlarm({
                                severity : 1,
                                alarmText : cowc.ALARM_GEN_DOWN_ALARM_TEXT,
                                display_name: getValueByJsonPath(uve,'name') +
                                                ' (Analytics Node)'
                            }));
                        }
                    }
                    if (processStatus == null) {
                        alarmUVE.push(self.createUserGeneratedAlarm({
                            severity : 1,
                            alarmText : cowc.ANALYTICS_PROCESSES_DOWN_ALARM_TEXT,
                            display_name: getValueByJsonPath(uve,'name') +
                                            ' (Analytics Node)'
                        }));
                    }
                    return self.alarmsSort(alarmUVE);
                };

                self.parseAndAddDerivedAnalyticsAlarms = function(uve, primaryDS) {

                    var alarmUVE = primaryDS.getItems();
                    $.each(uve,function(i,d){
                        alarmUVE = self.checkAndAddAnalyticsDownOrAlarmProcessDownAlarms(d, alarmUVE);
                    });

                    primaryDS.setData(alarmUVE);
                };

                self.createUserGeneratedAlarm = function (options) {
                    return {
                        severity: options['severity'] ? options['severity'] : 1,
                        type: cowc.UI_GENERATED_ALARM,
                        timestamp: new Date().getTime() * 1000,
                        alarm_msg: options['alarmText'],
                        display_name: options['display_name']
                    }
                };

                //Use this function to add alarms which are not coming from analytics.
                //E.g if analytics-gen itself is down we need to manually add them to the list
                //which can be done using this function
                self.addAdditionalAlarms = function (alarmObjs, alarmUVE) {
                    $.each (alarmObjs, function (i, newAlarmObj) {
                        if(alarmUVE == null) {
                            alarmUVE = [];
                        }
                        var newAlarm = {
                                severity : newAlarmObj.severity,
                                ackable : false,
                                type : newAlarmObj.type,
                                alarmText : newAlarmObj.alarmText
                        }
                        alarmUVE.push (newAlarm);
                    });
                    return alarmUVE;
                };

                //Node colors

                self.getNodeColor = function (data) {
                    var maxSeverity = -1;
                    var alarms = data['alerts'];
                    if(alarms != null && alarms.length > 0) {
                        $.each(alarms, function (i, alarm) {
                            if(maxSeverity == -1 || maxSeverity > alarm.sevLevel) {
                                maxSeverity = alarm.sevLevel;
                            }
                        });
                        return self.mapSeverityToColor(maxSeverity);
                    }
                    return false;
                }

                self.alarmsSort = function (alarms) {
                    var sortedAlarms = alarms.sort(alarmsComparator);
                    return alarms;
                };
                //Sort algorithm for Alarms
                //1. Unacknowleged red ones on top
                //2. Unacknowleged orange ones
                //3. Acknowledged reds
                //4. Acknowleged oranges.
                //5. Sort by timestamp for each category
                function alarmsComparator (a,b) {
                    if(a.ack && !b.ack) {
                        return 1;
                    } else if (!a.ack && b.ack){
                        return -1;
                    } else {
                        if(a.severity < b.severity) {
                            return -1;
                        } else if (a.severity > b.severity){
                            return 1;
                        } else {
                            if (a.timestamp > b.timestamp) {
                                return -1;
                            } else {
                                return 1;
                            }
                        }
                    }
                }

                self.wrapUVEAlarms = function (nodeType,hostname,UVEAlarms) {
                    var obj = {}
                    var alarm = {};
                    obj[nodeType] = [];
                    alarm['name'] = hostname;
                    alarm['value'] = {};
                    alarm['value']['UVEAlarms'] = UVEAlarms;
                    obj[nodeType].push(alarm);
                    return obj;
                };

                self.getAlarmSeverityText = function (sev) {
                    var sevText = cowc.SEVERITY_TO_TEXT_MAP[sev];
                    return (sevText == null)? sev : sevText;
                }

            }
            return new CoreAlarmUtils();
       }
);

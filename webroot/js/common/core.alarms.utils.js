/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(
       [ 'underscore' ],
       function(_) {
            var CoreAlarmUtils = function() {
                var self = this;
                var alarmTypesMap = {};
                self.BUCKET_DURATION = 300000000;//5 MINS
                // If required fetch the alarmtypes .
                self.fetchAlarmTypes = function () {
                    $.ajax({
                        url:'/api/tenant/monitoring/alarmtypes',
                        // async:false,
                        type:'GET'
                    }).done(function(result) {
                        if(result != null){
                            alarmTypesMap = result;
                        }
                    }).fail(function(result) {
                    });
                };
                self.fetchAlarmTypes ();

                self.mapSeverityToColor = function (severity) {
                    if (severity != -1) {
                        if (severity == 4) {
                            return cowc.COLOR_SEVERITY_MAP['orange'];
                        } else if (severity ==3) {
                            return cowc.COLOR_SEVERITY_MAP['red'];
                        }
                    } else {
                        return false;
                    }
                }
                var infraAlertMsgs = {
                        'UVE_MISSING'           : "System Information unavailable",
                        'PARTIAL_UVE_MISSING'   : "Partial System Information",
                        'CONFIG_MISSING'        : "Configuration unavailable",
                        'CONFIG_IP_MISMATCH'    : "Configured IP mismatch",
                        'IFMAP_DOWN'            : "Ifmap connection down",
                        'BGP_CONFIG_MISMATCH'   : "BGP peer configuration mismatch",
                        'PROCESS_STATES_MISSING': "Process States unavailable",
                        'DOWN_CNT'              : "{0} Down",        //Used for displaying "XMPP Peers" & "BGP Peers" in node tooltip
                        'BGP_PEER_DOWN'         : "{0:BGP Peer;BGP Peers} down",
                        'XMPP_PEER_DOWN'        : "{0:XMPP Peer;XMPP Peers} down",
                        'INTERFACE_DOWN'        : "{0:Interface;Interfaces} down",
                        'TIMESTAMP_MISMATCH_BEHIND'   : "Browser is {0} behind system time",
                        'TIMESTAMP_MISMATCH_AHEAD'    : "Browser is {0} ahead of system time",
                        'IFMAP_DOWN'            : "Ifmap Connection down",
                        'PROCESS_DOWN'          : "{0:Process;Processes} down",
                        'PROCESS_STARTING'      : "{0:Process;Processes} starting",
                        'PROCESS_STOPPED'       : "{0} stopped",
                        'PROCESS_DOWN_MSG'      : "{0} down",
                        'PROCESS_STARTING_MSG'  : "{0} starting",
                        'PROCESS_COREDUMP'      : "{0:core dump;core dumps}",
                        'PROCESS_RESTART'       : "{0:restart;restarts}",
                        'SPACE_THRESHOLD_EXCEEDED'  : '{0} space usage exceeds threshold',
                        'SPACE_USAGE_WARNING'   : '{0} space usage warning',
                        'NTP_UNSYNCED_ERROR'    : 'NTP state unsynchronized'
                    };

                //Given an alarmType and other params fetch the correct message to be displayed.
                self.getFormattedAlarmMessage = function (options) {
                    var alarmInfo = options.alarm;
                    if (alarmInfo.alarmText != null && alarmInfo.alarmText != '') {
                        return alarmInfo.alarmText;
                    }
                    var alarmType = getValueByJsonPath(options, 'alarm;type','');
                    var nodeType = options.nodeType;
                    var n = 0;
                    if(getValueByJsonPath(options, 'detailed', false)) {
                        n = 1;
                    }
                    var alarmTxt = getValueByJsonPath(alarmTypesMap, nodeType + ';' + alarmType,'');
                    if(alarmTxt != null && alarmTxt != '' && alarmTxt.split('.').length > 1){
                        return alarmTxt.split('.')[n];
                    }
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
//                            if(!alarm.ack) {
                                var alarmObj = self.getAlarmObjectFromAnalyticsAlarm (options,alarm);
                                alarms.push(alarmObj);
//                            }
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
                                severity : 3,
                                alarmText : cowc.ANALYTICS_API_DOWN_ALARM_TEXT,
                                display_name: getValueByJsonPath(uve,'name') +
                                                ' (Analytics Node)'
                            }));
                        }
                        if (isAlarmGenDown) {
                            alarmUVE.push(self.createUserGeneratedAlarm({
                                severity : 3,
                                alarmText : cowc.ALARM_GEN_DOWN_ALARM_TEXT,
                                display_name: getValueByJsonPath(uve,'name') +
                                                ' (Analytics Node)'
                            }));
                        }
                    }
                    if (processStatus == null) {
                        alarmUVE.push(self.createUserGeneratedAlarm({
                            severity : 3,
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
                        severity: options['severity'] ? options['severity'] : 3,
                        type: cowc.USER_GENERATED_ALARM,
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
                }

            }
            return new CoreAlarmUtils();
       }
);

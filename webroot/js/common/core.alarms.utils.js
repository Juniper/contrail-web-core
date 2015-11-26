/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(
       [ 'underscore' ],
       function(_) {
            var CoreAlarmUtils = function() {
                var self = this;
                var alarmTypesMap = {};

                // If required fetch the alarmtypes .
                self.fetchAlarmTypes = function () {
                    $.ajax({
                        url:'/api/tenant/monitoring/alarmtypes',
                        type:'GET'
                    }).done(function(result) {
                        if(result != null){
                            alarmTypesMap = result;
                        }
//                        deferredObj.resolve(res);
                    }).fail(function(result) {
//                        deferredObj.resolve(res);
                    });
                };
                self.fetchAlarmTypes ();

                self.mapSeverityToColor = function (severity) {
                    if (severity != -1) {
                        if (severity == 4) {
                            return ctwc.COLOR_SEVERITY_MAP['orange'];
                        } else if (severity ==3) {
                            return ctwc.COLOR_SEVERITY_MAP['red'];
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
//                self.getFormattedAlarmMessage = function (options, alarm) {
//                    var msg = '';
//                    var nodeType = alarm['nodeType'];
//                    var alarmType = alarm['alarmType'];
//                    //Two ways create our own mesg as below or use the messages from the types.
//                    /*switch (nodeType) {
//
//                        case 'ProcessConnectivity' :
//                            if (value.indexOf('NTP state unsynchronized') != -1) {
//                                msg = infraAlertMsgs['NTP_UNSYNCED_ERROR'];
//                            } else {
//                                msg = infraAlertMsgs['PROCESS_STATES_MISSING'];
//                            }
//                            break;
//
//                        case 'BgpConnectivity' :
//
//                    }*/
//                    return alarmTypesMap[nodeType][alarmType];
////                    return contrail.format(alarmTypesMap[nodeType][alarmType],value);//TODO
//
//                };

                //Given an alarmType and other params fetch the correct message to be displayed.
                self.getFormattedAlarmMessage = function (options) {
                    var alarm = options.alarm;
                    var nodeType = options.nodeType;
                    var alarmType = alarm.type;
                    return alarmTypesMap[nodeType][alarmType].split('.')[0];
                }

                self.getFormattedDetailedAlarmMessage = function (options) {
                    var alarm = options.alarm;
                    var nodeType = options.nodeType;
                    var alarmType = alarm.type;
                    return alarmTypesMap[nodeType][alarmType].split('.')[1];
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
                    var type = alarm.type;
                    var value = alarm.value;
                    var alarmText = alarm.rules[0].operand2 + alarm.rules[0].oper + alarm.rules[0].operand1;//TODO need to change this to summary when available
                    var timestamp = alarm.timestamp;
                    var infoObj = {type:data['display_type'],link:data['link']};
                    var alarmMsg = self.getFormattedAlarmMessage ({nodeType:options.nodeType, alarm:alarm});
                    return $.extend({
                        sevLevel: alarm.severity,
                        name: data['name'],
                        pName: data['display_type'],
                        msg: alarmMsg,
                    }, infoObj);
                };

                self.getControlNodeColor = function(alarms) {

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

                self.getControlNodeColor = function (d, obj) {
                    obj= ifNull(obj,{});
                    var nodeColor = self.getNodeColor(obj);
                    if(nodeColor != false)
                        return nodeColor;
                    //If connected to atleast one XMPP Peer
                    if(obj['totalXMPPPeerCnt'] - obj['downXMPPPeerCnt'] > 0)
                        return ctwc.COLOR_SEVERITY_MAP['green'];
                    else if(obj['downBgpPeerCnt'] == 0 && obj['downXMPPPeerCnt'] == 0)
                        return ctwc.COLOR_SEVERITY_MAP['blue'];    //Default color
                }

                self.getvRouterColor = function(d, obj) {
                    obj= ifNull(obj,{});
                    var nodeColor = self.getNodeColor(obj);
                    if(nodeColor != false)
                        return nodeColor;
                    obj = ifNull(obj,{});
                    var instCnt = obj['instCnt'];
                    if(instCnt == 0)
                        return ctwc.COLOR_SEVERITY_MAP['blue'];
                    else if(instCnt > 0)
                        return ctwc.COLOR_SEVERITY_MAP['green'];
                };

                self.getAnalyticsNodeColor = function (d, obj) {
                    obj= ifNull(obj,{});
                    var nodeColor = self.getNodeColor(obj);
                    if(nodeColor != false)
                        return nodeColor;
                    return ctwc.COLOR_SEVERITY_MAP['blue'];
                };

                self.getConfigNodeColor = function (d, obj) {
                    obj= ifNull(obj,{});
                    var nodeColor = self.getNodeColor(obj);
                    if(nodeColor != false)
                        return nodeColor;
                    return ctwc.COLOR_SEVERITY_MAP['blue'];
                };

                self.getDatabaseNodeColor = function (d, obj) {
                    obj= ifNull(obj,{});
                    var nodeColor = self.getNodeColor(obj);
                    if(nodeColor != false)
                        return nodeColor;
                    return ctwc.COLOR_SEVERITY_MAP['blue'];
                };

                //End Node colors

            }
            return CoreAlarmUtils;
       }
);
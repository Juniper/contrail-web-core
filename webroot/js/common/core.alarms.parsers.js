/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([ 'underscore' ,
        'core-alarm-utils',
        ],
       function(_,coreAlarmUtils) {
            var sevColorMap = {
                    '0': '#dc6660',//Critical Red
                    '1': '#dc6660',//Major Red
                    '2': '#ffbf87'//Minor Orange
            };
            var CoreAlarmParsers = function() {
                var self = this;
                self.alarmDataParser = function(response) {
                    var retArr = [];
                    if(response != null && _.keys(response).length > 0) {
                         for(var currNodeType in response) {
                             for(var i = 0; i < response[currNodeType].length; i++) {
                                 var currItem = response[currNodeType][i];

                                 if(currItem.value != null && currItem.value.UVEAlarms != null && currItem.value.UVEAlarms.alarms != null
                                     && currItem.value.UVEAlarms.alarms.length > 0) {
                                     for(var j=0; j < currItem.value.UVEAlarms.alarms.length; j++) {
                                         var currObject = {};
                                         var alarmInfo = currItem.value.UVEAlarms.alarms[j];
                                         currObject.rawJson = alarmInfo;
                                         currObject.display_name = currItem.name + ' (' + getDisplayType(currNodeType) + ')';
                                         currObject.name = currItem.name;
                                         currObject.table = currNodeType;
                                         currObject.type = alarmInfo.type;
                                         currObject.ack = alarmInfo.ack;
                                         currObject.status = ((alarmInfo.ack == null) || (alarmInfo.ack == false)) ? 'Unacknowledged' : 'Acknowledged';
                                         currObject.T = alarmInfo.timestamp;
                                         currObject.severity = alarmInfo.severity;
                                         currObject.description = alarmInfo.description;
                                         currObject.alarm_msg = coreAlarmUtils.getFormattedAlarmMessage({alarm:alarmInfo, nodeType:currNodeType});
                                         currObject.alarm_detailed = coreAlarmUtils.getFormattedAlarmMessage({alarm:alarmInfo, nodeType:currNodeType, detailed:true});
                                         currObject.token = alarmInfo.token;
                                         retArr.push(currObject);
                                     }
                                 }
                             }
                         }
                    }
                    return coreAlarmUtils.alarmsSort(retArr);
                 };

                 /**
                  * Private functions
                  */
                 function getDisplayType(nodeType) {
                     switch(nodeType) {
                         case 'vrouter' :
                             return 'Virtual Router';

                         case 'vRouter' :
                             return 'Virtual Router';

                         case 'control-node' :
                             return 'Control Node';

                         case 'analytics-node' :
                             return 'Analytics Node';

                         case 'config-node' :
                             return 'Config Node';

                         case 'database-node' :
                             return 'Database Node';

                         default :
                             return nodeType;
                     }
                 }
            }
            return new CoreAlarmParsers();
       }
);

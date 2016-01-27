/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([ 'underscore' ],
       function(_) {
            var sevColorMap = {
                    '3': '#dc6660',
                    '4': '#ffbf87'
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
                                         currObject.timestamp = alarmInfo.timestamp;
                                         currObject.severity = alarmInfo.severity;
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

                 self.parseAlarmsDataForStackChart = function(alarms) {
                     var minMaxTS = d3.extent(alarms,function(obj){
                         return obj['timestamp'];
                     });
                     //If only 1 value extend the range by 5 mins on both sides
                     if(minMaxTS[0] == minMaxTS[1]) {
                         minMaxTS[0] -= cowc.ALARM_BUCKET_DURATION;
                         minMaxTS[1] += cowc.ALARM_BUCKET_DURATION;
                     }
                     /* Bucketizes timestamp every 5 minutes */
                     var xBucketScale = d3.scale.quantize().domain(minMaxTS).range(d3.range(minMaxTS[0],minMaxTS[1],cowc.ALARM_BUCKET_DURATION));//5mins
//                     var xBucketScale = d3.scale.quantize().domain(minMaxTS).range(d3.range(minMaxTS[0],minMaxTS[1],(minMaxTS[1]-minMaxTS[0])/50 ));//5mins
                     var buckets = {};
                     //Group nodes into buckets
                     $.each(alarms,function(idx,obj) {
                         var xBucket = xBucketScale(obj['timestamp']);
                         if(buckets[xBucket] == null) {
                             var timestampExtent = xBucketScale.invertExtent(xBucket);
                             buckets[xBucket] = {timestampExtent:timestampExtent,
                                                 data:[]};
                         }

                         buckets[xBucket]['data'].push(obj);
                     });

                   //Now parse this data to be usable in the chart
                     var parsedData = [];
                     for(var timestampTick in buckets) {
                         parsedData.push(self.prepareDataForChart(timestampTick,buckets[timestampTick]));
                     }
                     return parsedData
                 }

                 self.prepareDataForChart = function (timestamp,options) {
                     var data = options.data;
                     var value = { date: new Date(timestamp/1000) }; // turn the date string into a date object
                     // adding calculated data to each count in preparation for stacking
                     var severityBuckets = {};
                     $.each(data,function(i,d){
                         var sev = d.severity;
                         if(severityBuckets[sev] == null) {
                             severityBuckets[sev] = [];
                         }
                         severityBuckets[sev].push(d);
                     });
                     var counts = [];
                     var overviewColor = sevColorMap['4'];//default yellow
                     var y0 = 0;
                     for(var sevkey in severityBuckets) {

                         counts.push({
                             name : 'severity_' + sevkey,
                             color : sevColorMap[sevkey],
                             y0: y0,
                             y1: y0 += +severityBuckets[sevkey].length,
                             items: severityBuckets[sevkey]
                         });
                         if(sevkey <= 3) {
                             overviewColor = sevColorMap[sevkey];
                         }
                     }
                     value.timestampExtent = options.timestampExtent;
                     value.counts = counts;
                     value.total = data.length;
                     value.overviewColor = overviewColor;
                     return value;
                 }

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
            return CoreAlarmParsers;
       }
);
/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore',
    'contrail-view',
    'contrail-list-model',
    'cf-datasource',
    'core-alarm-parsers',
    'core-alarm-utils'],
        function(_, ContrailView, ContrailListModel, CFDataSource,
                coreAlarmParsers, coreAlarmUtils){
    var AlarmsViewConfig = function () {
        var self = this;
        var alarmsListModel, alarmsUIListModel;
        self.populateAlarmModels = function () {
            var self = this;
            //var viewConfig = this.attributes.viewConfig;
            var remoteAjaxConfig = {
                    remote: {
                        ajaxConfig: {
                            url: cowc.get(cowc.URL_ALARM_DETAILS),
                            type: "GET",
                        },
                        dataParser:coreAlarmParsers.alarmDataParser
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
            alarmsListModel = new ContrailListModel(remoteAjaxConfig);
            self.alarmsListModel = alarmsListModel;

            alarmsUIListModel = new ContrailListModel({data:[]});
            var cfDataSource = new CFDataSource();
            self.cfDataSource = cfDataSource;
            if(cfDataSource.getDimension('gridFilter') == null) {
                cfDataSource.addDimension('gridFilter',function(d) {
                    return d['token'];//token is used as unique key
                });
            }
            if(cfDataSource.getDimension('timeFilter') == null) {
                cfDataSource.addDimension('timeFilter',function(d) {
                    return d['T'];
                });
            }
            if(cfDataSource.getDimension('severityFilter') == null) {
                cfDataSource.addDimension('severityFilter',function(d) {
                    return d['severity'];
                });
            }
            if(cfDataSource.getDimension('statusFilter') == null) {
                cfDataSource.addDimension('statusFilter',function(d) {
                    return d['status'];
                });
            }

            function onUpdateAlarmsListModel() {
                cfDataSource.updateData(alarmsListModel.getItems());
                cfDataSource.fireCallBacks({source:'fetch'});
            }

            function onUpdateAlarmsUIListModel() {
                var selRecords = alarmsUIListModel.getFilteredItems();
                var selIds = $.map(selRecords,function(obj,idx) {
                    return obj.token;
                });

                //Apply filter only if filteredRows is < totalRows else remove the filter
                if(alarmsUIListModel.getFilteredItems().length < alarmsUIListModel.getItems().length) {
                    cfDataSource.applyFilter('gridFilter',function(d) {
                        return $.inArray(d,selIds) > -1;
                    });
                    cfDataSource.fireCallBacks({source:'grid'});
                } else {
                    //Remove if an earlier filter exists
                    if(cfDataSource.getFilter('gridFilter') != null) {
                        cfDataSource.removeFilter('gridFilter');
                        cfDataSource.fireCallBacks({source:'grid'});
                    }
                }
            }

            //As cfDataSource is core one,triggered whenever filters applied/removed
            //If update is triggered from
            //  1. alarmListModel, update both crossfilter & grid
            //  2. crossfilter, update grid
            //  3. grid, update crossfilter
            cfDataSource.addCallBack('updateCFListModel',function(data) {
                //Update listUIModel with crossfilter data
                if(data['cfg']['source'] != 'grid') {
                    //Need to get the data after filtering from dimensions other than gridFilter
                    var currGridFilter = cfDataSource.removeFilter('gridFilter');
                    alarmsUIListModel.setData(coreAlarmUtils.alarmsSort(cfDataSource.getDimension('gridFilter').top(Infinity)));
                    if(currGridFilter != null) {
                        cfDataSource.applyFilter('gridFilter',currGridFilter);
                    }
                }
            });
            //Need to trigger/register the event once callbacks are registered
            alarmsListModel.onDataUpdate.subscribe(onUpdateAlarmsListModel);
            //Adding grid search filter
            alarmsUIListModel.onDataUpdate.subscribe(onUpdateAlarmsUIListModel);
            if(alarmsListModel.loadedFromCache) {
                onUpdateAlarmsListModel();
            }
        };

        self.populateObjectLogsModel = function(timeRange) {
            var self = this;
            var queryConfig = [];
            var currTime = _.now();
            timeRange = (timeRange) ? timeRange : [currTime - 2 * 60 * 60 * 1000, currTime];
            var postDataForGettingChangedObjects = {
                    "fromTimeUTC" : timeRange[0],
                    "toTimeUTC" : timeRange[1],
                    "table_name" : "StatTable.FieldNames.fields",
                    "select" : [ "name", "fields.value" ],
                    "where" : [ [ {
                        "name" : "name",
                        "value" : "OBJECT",
                        "op" : 7
                    } ] ]
                };
            var ajaxConfig = {
                    url: "/api/qe/table/column/values",
                    data : JSON.stringify(postDataForGettingChangedObjects),
                    type: 'POST'
            };
            contrail.ajaxHandler(ajaxConfig,null, function(response){
                var values = cowu.getValueByJsonPath(response,'data',[]);
                $.each(values, function(i,value) {
                    var tableName = cowu.getValueByJsonPath(value,'fields.value');
                    var config = {
                            table_name: tableName,
                            table_type: 'OBJECT',
                            select: 'MessageTS,ObjectId,Source,ModuleId,Messagetype,ObjectLog',
                            where:'Messagetype=AlarmTrace'
                        };
                    if(i != 0) {
                        config['mergeFn'] = cowu.parseAndMergeObjectLogs
                    }
                    queryConfig.push(config);
                });
                var objLogQueryConfig = cowu.getStatsModelConfig (queryConfig);
                var newObjModel = new ContrailListModel(objLogQueryConfig);
                newObjModel.onAllRequestsComplete.subscribe(function () {
                    self.objectLogsModel.setItems(newObjModel.getItems());
                });
            });
            self.objectLogsModel = new ContrailListModel({data:[]}) ;
        }

        var activeAlarmViewConfig = {
                    title: 'Alarm Chart',
                    view: "StackedBarChartWithFocusView",
                    viewConfig: {
                        chartOptions:{
                            addOverviewChart:false,
                            updateToHistory:true,
                            xAxisOffset: 30,
                            barWidth: 6,
                            onClickBar : true,
                            showLegend: false,
                            yAxisLabel: "Active Alarms",
                            showControls: false,
                            groupBy: 'severity',
                            insertEmptyBuckets:false,
                            yAxisFormatter: d3.format('d'),
                            title: 'Active Alarms',
//                            subTitle:"Severity",
                            stripLastBucket: false,
                            showXMinMax: false,
                            showYMinMax: false,
                            useCustomTimeFormat: true,
//                            hideTicks:true,
//                            ticks:1,
                            applySettings: false,
                            colors: {
                                '0': '#dc6660',//Critical Red
                                '1': '#dc6660',//Major Red
                                '2': '#ffbf87'//Minor Orange
                            },
                            brush: true,
                            tooltipDataFormatter: function (data) {
                                var newData = _.map(data, function (d){
                                    d['key'] = cowc.SEVERITY_TO_TEXT_MAP[d['key']];
                                    var value = d['values'];
                                    var dateTime;
                                    value['name'] = cowc.SEVERITY_TO_TEXT_MAP[value['name']];
                                    d['dateTime'] = (value['date'].getMonth() + 1) + '/' + value['date'].getDate() + '/' +  value['date'].getFullYear()
                                                    + " " + ('0'+value['date'].getHours()).slice(-2) + ':'
                                                    + value['date'].getMinutes();
                                    d['values'] = value;
                                    return d;
                                });
                                return newData;
                            }
                        }
                    }
                }

        self.viewConfig = {
            "alarms-historical-chart" : function() {
                return {
                    modelCfg: {
                       modelId: 'alarms-table-stats-model',
                       source:"STATTABLE",
                       config: {
                           table_name: 'StatTable.AlarmgenStatus.counters.table_stats',
                           select: 'T=, SUM(counters.table_stats.set_count), SUM(counters.table_stats.reset_count), MAX(counters.table_stats.active_count)',
                           time_granularity: 60
                       }
                   },
                   viewCfg: {
                     elementId : 'alarms-historical-line-chart',
                     view: "StackedBarChartWithFocusView",
                     viewConfig: {
                         parseFn : function(data, chartOptions) {
                               var data = cowu.parsePercentilesDataForStack(data,chartOptions);
                               return cowu.chartDataFormatter(data, chartOptions);
                         },
                         title: 'Historical Alarms',
                         chartOptions: {
                             colors: [
                                 cowc.SINGLE_NODE_COLOR,
                                 cowc.FAILURE_COLOR,
                                 '#7dc48a',//Green
                             ],
                             showLegend: false,
                             listenToHistory:true,
                             applySettings: false,
                             barWidth: 6,
                             title: 'Historical Alarms',
//                             subTitle: 'Alarms count',
                             xAxisLabel: '',
                             yAxisLabel: 'Alarm Events',
                             groupBy: 'Source',
//                             grouped: true,
                             yLabels: ['Added','Cleared','Active'],
                             yField:'plotValue',
                             yFields: ['SUM(counters.table_stats.set_count)','SUM(counters.table_stats.reset_count)','MAX(counters.table_stats.active_count)']
                         }
                     }
                   },
                   itemAttr: {
                     title: 'Alarm Events',
                     height: 8,
                     width:16,
                     x:0,
                     y:0
                   }
                }
            },
            //Event logs with object logs query
            'alarms-object-logs': function () {
                if(self.objectLogsModel == null) {
                    self.populateObjectLogsModel();
                }
                return {
                    modelCfg: {
                        modelId: 'alarms-object-logs-model',
                        source:'OBJECT',
                        config: getModelConfigForObjectLogs()
                    },
//                    modelCfg: {listModel: self.objectLogsModel},
                    viewCfg: {
                        view : "eventDropsView",
                        groupBy: 'queryJSON.table',
                        viewConfig: {
                            groupBy: 'queryJSON.table',
                            title: 'Event Logs',
                            target: 'alarms-event-log-content',//div where we want to show the tooltip content
                            chartOptions: {
                                listenToHistory:true,
                                tooltipFn: objectLogsTooltipContent,
                                detailsFn: objectLogsDetailsContent
                            }
                        },
                        tooltip:{
                            tooltipColumns: [
                                { field:'MessageTS',
                                    label: 'Time',
                                    formatter: function(d) {
                                      return d3.time.format("%d/%m/%y %H:%M:%S")(new Date(d/1000))
                                    }
                                  }
                            ]
                        }
                    },
                    itemAttr: {
                        title: "Event Logs",
                        width: 16,
                        height: 31,
                        x:0,
                        y:19
                    }
                }
            },
            //Event drops chart with stats data
            'alarms-event-drops': function () {
                return {
                    modelCfg: {
                        modelId: 'alarms-table-stats-model-non-aggregate',
                        source:"STATTABLE",
                        config: {
                            type: 'NonAggregate',
                            table_name: 'StatTable.AlarmgenStatus.counters.table_stats',
                            select: 'T, Source, counters.table_stats.table_name, counters.table_stats.alarm_name, counters.table_stats.set_count, counters.table_stats.reset_count, counters.table_stats.active_count',
                            parser: function(response) {
                                var data = response['data'];
                                data = _.filter(data, function(d){
                                    //include only with set or reset count
                                    if(d['counters.table_stats.set_count'] > 0 || d['counters.table_stats.reset_count'] > 0){
                                        if(d['counters.table_stats.reset_count'] > 0) {
                                            d['color'] = '#7dc48a';//Green
                                        }
                                        if(d['counters.table_stats.set_count'] > 0) {
                                            d['color'] = cowc.FAILURE_COLOR//Major Red
                                        }
                                        return d;
                                    }
                                });
                                return data;
                            }
                        }
                    },
                    viewCfg: {
                        view : "eventDropsView",
                        groupBy: 'counters.table_stats.table_name',
                        viewConfig: {
                            groupBy: 'counters.table_stats.table_name',
                            timeField:'T',
                            title: 'Events',
                            target: 'alarms-event-log-content',//div where we want to show the tooltip content
                            chartOptions: {
                                listenToHistory:true,
                                tooltipFn: eventDropsTooltipContent,
                                detailsFn: eventDropsDetailsContent,
                                isDetailsFromRemoteCall:true
                            }
                        },
                        tooltip:{
                            tooltipColumns: [
                                { field:'T',
                                    label: 'Time',
                                    formatter: function(d) {
                                      return d3.time.format("%d/%m/%y %H:%M:%S")(new Date(d/1000))
                                    }
                                  }
                            ]
                        }
                    },
                    itemAttr: {
                        title: "Event Logs",
                        width: 16,
                        height: 31,
                        x:0,
                        y:19
                    }
                }
            },
            "alarms-active-alarm-chart" : function() {
                if (self.alarmsListModel == null) {
                    self.populateAlarmModels();
                }
                return {
                    modelCfg: {listModel: alarmsUIListModel},
                    viewCfg: $.extend(true,{},activeAlarmViewConfig,{
                        elementId: 'active-alarms-chart-id',
                        viewConfig: {
                            widgetConfig: {
                                elementId: 'monitor-alarm-chart-widget',
                                view: "WidgetView",
                                viewConfig: {
                                    header: {
                                        title: 'Alarms',
                                    },
                                    controls: {
                                        top: {
                                            default: {
                                                collapseable: false
                                            }
                                        }
                                    }
                                }
                            },
                            cfDataSource : self.cfDataSource
                        }
                    }),
                    itemAttr: {
                        height: 11,
                        width: 24
                    }
                };
            },

            "alarms-active-alarm-filter-chart" : function() {
                if (self.alarmsListModel == null) {
                    self.populateAlarmModels();
                }
                return {
                    modelCfg: {listModel: alarmsUIListModel},
                    viewCfg: $.extend(true,{},activeAlarmViewConfig,{
                        elementId: 'active-alarms-filter-chart-id',
                        viewConfig: {
                            chartOptions: {
                                hideTicks:true,
                                zoomIn: false,
                                brushRangeLimit: 7200,
                                minTimeRange: 48 * 60 * 60, //2 days,
                                fixedTimeRange: 48 * 60 * 60,
                                useCustomTimeFormat: true,
                                showXMinMax: false
                            }
                        }
                    }),
                    itemAttr: {
                        height: 4,
                        width: 16,
                        x:0,
                        y:11
                    },
                }
            },

            "alarms-grid-view" : function() {
                if(self.alarmsListModel == null)
                   self.populateAlarmModels();
                return {
                    modelCfg: {listModel: alarmsUIListModel},
                    viewCfg: {
                        elementId: cowl.TITLE_ALARMS_SUMMARY + '_grid',
                        class:"y-overflow-scroll",
                        title: cowl.TITLE_ALARMS_SUMMARY,
                        view: "AlarmGridView",
                        viewPathPrefix: cowc.ALARMS_VIEWPATH_PREFIX,
                        viewConfig: {
                            cfDataSource : self.cfDataSource,
                            colorFn: {},
                            cssClass:"y-overflow-scroll"
                        }
                    },
                    itemAttr: {
                        height: 31,
                        width: 24,
                        x:0,
                        y:15
                    }
                }
            },

            "alarms-notification-view" : function() {
                if(self.alarmsListModel == null)
                   self.populateAlarmModels();
                return {
                    modelCfg: {listModel: alarmsListModel},
                    viewCfg: {
                        elementId: 'alarms-notification-id',
                        title: 'Alarms',
                        view: "AlarmsDetailsPanelView",
                        viewPathPrefix: cowc.ALARMS_VIEWPATH_PREFIX,
//                        viewConfig: {
//                            template: 'notification-template'
//                        }
                    },
                    itemAttr: {
                        height: 50,
                        width: 8,
                        x:10,
                        y:0
                    }
                }
            }
         };
        self.getViewConfig = function(id) {
            return self.viewConfig[id];
        };
        self.alarmsObjectLogsMergeFn = function () {
            var primaryData = primaryDS.getItems();
            if(primaryData.length == 0) {
                primaryDS.setData(response);
                return;
            }
            if(response.length == 0) {
                return;
            }
            //If both arrays are not having first element at same time
            //remove one item accordingly
            while (primaryData[0]['T='] != response[0]['T=']) {
                if(primaryData[0]['T='] > response[0]['T=']) {
                    response = response.slice(1,response.length-1);
                } else {
                    primaryData = primaryData.slice(1,primaryData.length-1);
                }
            }
            var cnt = primaryData.length;
            var responseKeys = _.keys(response[0]);
            for (var i = 0; i < cnt ; i++) {
//                primaryData[i]['T'] = primaryData[i]['T='];
                for (var j = 0; j < responseKeys.length; j++) {
                    if (response[i] != null && response[i][responseKeys[j]] != null) {
                        primaryData[i][responseKeys[j]] =
                            response[i][responseKeys[j]];
                    } else if (i > 0){
                        primaryData[i][responseKeys[j]] =
                            primaryData[i-1][responseKeys[j]];
                    }
                }
            }
            primaryDS.updateData(primaryData);
        };
        function getModelConfigForObjectLogs (objectList) {
            var queryConfig = [];
            if(objectList != null && objectList.length > 0) {
                objectList = _.map(objectList,function(d){
                    return (cowc.OBJECT_TYPE_MAP[d] != null)? cowc.OBJECT_TYPE_MAP[d]: d;
                });
            } else {
                objectList = cowc.OBJECT_TABLE_LIST;
            }
            $.each(objectList, function(i,tableName) {
                var config = {
                        table_name: tableName,
                        table_type: 'OBJECT',
                        select: 'MessageTS,ObjectId,Source,ModuleId,Messagetype,ObjectLog',
                        where:'Messagetype=AlarmTrace',
                        no_sanitize: true,
                        timeout: 300000
                    };
                if(i != 0) {
                    config['mergeFn'] = cowu.parseAndMergeObjectLogs
                }
                queryConfig.push(config);
            });
            return queryConfig;
        }
        function getTooltipContent (d) {
            var jsonField = '';
            if(d['ObjectLog'] != null) {
                jsonField = 'ObjectLog';
                // var xmlMessageJSON = cowu.formatXML2JSON(d.Xmlmessage);
                // tooltip.html('<div>' + d3.time.format("%d/%m/%y %H:%M:%S")(new Date(d['MessageTS']/1000)) + '</div>' +
                //             '<div>' + d.Source + '</div>' +
                //             '<div>' + d.Category + '</div>' +
                //             '<div>' + xmlMessage.join(' ') + '</div>')
            } else if(d['body'] != null) {
                jsonField = 'body';
            } else {
                jsonField = 'Xmlmessage';
            }
            var xmlMessageJSON;
            if(typeof(d[jsonField]) == 'string') {
                try{
                    xmlMessageJSON = JSON.parse(d[jsonField]);
                }catch(e) {
                    xmlMessageJSON = cowu.formatXML2JSON(d[jsonField]);
                }
            } else {
                xmlMessageJSON = cowu.formatXML2JSON(d[jsonField]);
            }
            var tooltipColumns = [
                { field:'MessageTS',
                  label: 'Time',
                  formatter: function(d) {
                    return d3.time.format("%d/%m/%y %H:%M:%S")(new Date(d/1000))
                  }
                }
            ]
            var xmlMessage = '<pre class="pre-format-JSON2HTML">' + contrail.formatJsonObject(xmlMessageJSON) + '</pre>';
            var tooltipContent = '';
            tooltipContent += '<div class="event-drops popover-remove">' +
                '<i class="fa fa-remove pull-right popover-remove-icon"></i>'+
            '</div>';
            $.each(tooltipColumns,function(idx,tooltipCfg) {
                tooltipContent += '<div>';
                tooltipContent += '<b>' + tooltipCfg['label'] + ': </b>';
                if(typeof(tooltipCfg['formatter']) == 'function') {
                    tooltipContent += tooltipCfg['formatter'](d[tooltipCfg['field']]);
                } else {
                    tooltipContent += d[tooltipCfg['field']];
                }
                tooltipContent += '</div>';
            });
            return tooltipContent +
                '<hr/>' +
                '<div><b>' + title  + '</b></div>' +
                '<div>' + xmlMessage  + '</div>';
        }

        function getXMLJson(d) {
             var jsonField = '';
             if(d['ObjectLog'] != null) {
                 jsonField = 'ObjectLog';
                 // var xmlMessageJSON = cowu.formatXML2JSON(d.Xmlmessage);
                 // tooltip.html('<div>' + d3.time.format("%d/%m/%y %H:%M:%S")(new Date(d['MessageTS']/1000)) + '</div>' +
                 //             '<div>' + d.Source + '</div>' +
                 //             '<div>' + d.Category + '</div>' +
                 //             '<div>' + xmlMessage.join(' ') + '</div>')
             } else if(d['body'] != null) {
                 jsonField = 'body';
             } else {
                 jsonField = 'Xmlmessage';
             }
             var xmlMessageJSON;
             if(typeof(d[jsonField]) == 'string') {
                 try{
                     xmlMessageJSON = JSON.parse(d[jsonField]);
                 }catch(e) {
                     xmlMessageJSON = cowu.formatXML2JSON(d[jsonField]);
                 }
             } else {
                 xmlMessageJSON = cowu.formatXML2JSON(d[jsonField]);
             }
             return xmlMessageJSON;
         }
        function getAlarmInfoFromJson (xmlMessageJSON) {
            var alarmInfo = cowu.getValueByJsonPath(xmlMessageJSON, 'UVEAlarms;alarms;UVEAlarmInfo',[]);
            var deleted = cowu.getValueByJsonPath(xmlMessageJSON, 'UVEAlarms;deleted',false);
            if(deleted) {
                return [{'description': cowc.ALARM_CLEARED_MESSAGE}];
            }
            if(!_.isArray(alarmInfo)) {
                alarmInfo = [alarmInfo];
            }
            alarmInfo = $.map(alarmInfo,function(d){
                d['color'] = cowc.SEV_TO_COLOR_MAP[d.severity];
                d['severityText'] = cowc.SEVERITY_TO_TEXT_MAP[d.severity];
                d['ack'] = (d.ack == "false") ? false : true;
                return d;
            });
            return alarmInfo;
        }
        function objectLogsTooltipContent(d) {
            var xmlMessageJSON = getXMLJson(d);
            var xmlMessage = '<pre class="pre-format-JSON2HTML">' + contrail.formatJsonObject(xmlMessageJSON) + '</pre>';
            var date = d3.time.format("%d/%m/%y %H:%M:%S")(new Date(d.MessageTS / 1000));
            var title = d.ObjectId;
            var tooltipData = [];
            var toolTipTemplate = contrail.getTemplate4Id('alarms-eventdrop-tooltip-template');
            return toolTipTemplate({
              subTitle: date,
              title:title,
              time:date,
              tooltipData: getAlarmInfoFromJson(xmlMessageJSON)
          });
        }
        function eventDropsTooltipContent(d) {
            var date = d3.time.format("%d/%m/%y %H:%M:%S")(new Date(d.T / 1000));
            var title = d.Source + ' (' + d['counters.table_stats.table_name'] + ')';
            var tooltipData = [];
            var toolTipTemplate = contrail.getTemplate4Id('alarms-history-eventdrop-tooltip-template');
            return toolTipTemplate({
              subTitle: date,
              title:title,
              time:date,
              tooltipData: getAlarmTooltipData(d)
          });
        }
        function getAlarmTooltipData (d) {
            return [
                {
                    label: 'Source',
                    value: d.Source
                },
                {
                    label: 'Table',
                    value: d['counters.table_stats.table_name']
                },
                {
                    label: 'Added',
                    value: d['counters.table_stats.set_count']
                },
                {
                    label: 'Cleared',
                    value: d['counters.table_stats.reset_count']
                }
            ]
        }
        function objectLogsDetailsContent(d) {
            var xmlMessageJSON = getXMLJson(d);
            var xmlMessage = '<pre class="pre-format-JSON2HTML">' + contrail.formatJsonObject(xmlMessageJSON,5) + '</pre>';
            var tooltipContent = '';
            tooltipContent += '<div class="event-drops popover-remove">' +
                '<i class="fa fa-remove pull-right popover-remove-icon"></i>'+
            '</div>';
            //Get tooltip contents
            var dataTmpl= contrail.getTemplate4Id('alarms-tooltip-data-template');
            var date = d3.time.format("%d/%m/%y %H:%M:%S")(new Date(d.MessageTS / 1000));
            var title = d.ObjectId;
            tooltipContent += dataTmpl({
                subTitle: date,
                title:title,
                time:date,
                tooltipData: getAlarmInfoFromJson(xmlMessageJSON),
                xmlMessage:xmlMessage});
            return tooltipContent;
        }
        function eventDropsDetailsContent(d,deferredObj) {
            //make the call to fetch the object logs for a duration a min range
            var selectedTime = d.T/1000;
            var timeRange = [selectedTime - 30 * 1000, selectedTime + 30 * 1000];
            var eventsListModel = new ContrailListModel(cowu.getStatsModelConfig(getModelConfigForObjectLogs([d['counters.table_stats.table_name']]),timeRange));
            eventsListModel.onAllRequestsComplete.subscribe(function(){
                var objectData = eventsListModel.getItems();
                var tooltipContent = '';
                tooltipContent += '<div class="event-drops popover-remove">' +
                    '<i class="fa fa-remove pull-right popover-remove-icon"></i>'+
                '</div>';
                var dataTmpl= contrail.getTemplate4Id('alarms-tooltip-data-template');
                if(objectData == null || objectData.length == 0) {
                    tooltipContent += dataTmpl({
                        subTitle: d3.time.format("%d/%m/%y %H:%M:%S")(new Date(selectedTime)),
                        title:'Event Log',
                        time: d3.time.format("%d/%m/%y %H:%M:%S")(new Date(selectedTime)),
                        tooltipData: getAlarmInfoFromJson(xmlMessageJSON),
                        xmlMessage:"No Data Found"});
                    deferredObj.resolve(tooltipContent);
                    return;
                } else {
                    objectData = objectData[0];
                }
                var xmlMessageJSON = getXMLJson(objectData);
                var xmlMessage = '<pre class="pre-format-JSON2HTML">' + contrail.formatJsonObject(xmlMessageJSON,5) + '</pre>';
                //Get tooltip contents
                var date = d3.time.format("%d/%m/%y %H:%M:%S")(new Date(objectData.MessageTS / 1000));
                var title = objectData.ObjectId;
                tooltipContent += dataTmpl({
                    subTitle: date,
                    title:title,
                    time:date,
                    tooltipData: getAlarmInfoFromJson(xmlMessageJSON),
                    xmlMessage:xmlMessage});
                deferredObj.resolve(tooltipContent);
            });
        }
    };
    return (new AlarmsViewConfig()).viewConfig;
});

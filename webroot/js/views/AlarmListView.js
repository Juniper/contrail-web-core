/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'cf-datasource',
    'core-alarm-parsers',
    'core-alarm-utils'
], function (_, ContrailView, ContrailListModel, CFDataSource,coreAlarmParsers,coreAlarmUtils) {
    var AlarmListView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this, viewConfig = this.attributes.viewConfig;
            var remoteAjaxConfig = {
                    remote: {
                        ajaxConfig: {
                            url: cowc.get(cowc.URL_ALARM_DETAILS_IN_CHUNKS, 50, $.now()),
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
            var alarmsListModel = new ContrailListModel(remoteAjaxConfig);
            self.alarmsListModel = alarmsListModel;

            var alarmsUIListModel = new ContrailListModel({data:[]});
            var cfDataSource = new CFDataSource();
            self.cfDataSource = cfDataSource;
            if(cfDataSource.getDimension('gridFilter') == null) {
                cfDataSource.addDimension('gridFilter',function(d) {
                    return d['token'];//token is used as unique key
                });
            }
            if(cfDataSource.getDimension('timeFilter') == null) {
                cfDataSource.addDimension('timeFilter',function(d) {
                    return d['timestamp'];
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
            self.renderView4Config(this.$el, alarmsUIListModel,
                    getAlarmsListViewConfig(self,alarmsListModel));
        }
    });

    var getAlarmsListViewConfig = function (self,parentModel) {
        return {
            elementId: cowu.formatElementId([cowl.ALARMS_LIST_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: 'monitor-alarm-chart',
                                title: 'Alarm Chart',
                                view: "StackedBarChartWithFocusView",
                                viewConfig: {
                                    widgetConfig: {
                                        elementId: 'monitor-alarm-chart-widget',
                                        view: "WidgetView",
                                        viewConfig: {
                                            header: {
                                                title: 'Alarms',
                                                // iconClass: "icon-search"
                                            },
                                            controls: {
                                                top: {
                                                    default: {
                                                        collapseable: true
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    chartOptions:{
                                        addOverviewChart:false,
                                        xAxisOffset: 30,
                                        barWidth: 6,
                                    },
                                    parseFn : coreAlarmParsers.parseAlarmsDataForStackChart,
                                    cfDataSource : self.cfDataSource
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: cowl.MONITOR_ALARM_LIST_ID,
                                title: cowl.TITLE_ALARMS,
                                view: "AlarmGridView",
                                viewPathPrefix: "js/views/",
                                viewConfig: {
                                    projectFQN: null, 
                                    parentType: 'project',
                                    parentModel:parentModel
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return AlarmListView;
});

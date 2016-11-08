/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'chart-utils'
], function (_, ContrailView, chartUtils) {
    var NotificationChartView = ContrailView.extend({
        el: $(contentContainer),

        render: function (viewConfig) {
            var self = this;

            self.renderView4Config(this.$el, this.model,
                    getNotificationChartViewConfig(viewConfig));
        }
    });

    var getNotificationChartViewConfig = function (viewConfig, endTime) {
        var postData = {
            "autoSort": true,
            "async": false,
            "formModelAttrs": {
                "table_type": "STAT",
                "query_prefix": "stat",
                "from_time": Date.now() - (cowc.DEFAULT_CHART_DURATION * 60 * 60 * 1000),
                "from_time_utc": Date.now() - (cowc.DEFAULT_CHART_DURATION * 60 * 60 * 1000),
                "to_time": Date.now(),
                "to_time_utc": Date.now(),
                "time_granularity_unit": "secs",
                "time_granularity": 150,
                "limit": "150000",
                "select": 'T=, SUM(uve_stats.add_count)',
                "table_name": 'StatTable.AlarmgenUpdate.uve_stats',
            }
        };
        return {
            elementId: cowc.NOTIFICATION_SECTION_CHART_ID,
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: cowc.NOTIFICATION_CHART_ID,
                                view: "LineWithFocusChartView",
                                viewConfig: {
                                    modelConfig: {
                                        remote: {
                                            ajaxConfig : {
                                                url : "/api/qe/query",
                                                type: 'POST',
                                                data: JSON.stringify(postData)
                                            },
                                            dataParser : function(response) {
                                                return cowu.getValueByJsonPath(response, 'data', []);
                                            }
                                        }
                                    },
                                    parseFn: cowu.chartDataFormatter,
                                    chartOptions: {
                                        yAxisLabel: 'Alarms Added',
                                        xAxisLabel: '',
                                        yField: 'SUM(uve_stats.add_count)',
                                        showTicks: false,
                                        height: 60,
                                        area: true,
                                        brush: false,
                                        spliceAtBorders: false,
                                        bucketSize: 2.5,
                                        defaultDataStatusMessage: false,
                                        hideFocusChart: true,
                                        showYaxis: false,
                                        margin: {
                                            left: 10,
                                            top: 5,
                                            right: 10,
                                            bottom: 10
                                        },
                                        yFormatter: function(d){
                                            return d;
                                        },
                                        xFormatter: function(xValue, tickCnt) {
                                            var date = xValue > 1 ? new Date(xValue) : new Date();
                                            return d3.time.format('%H:%M')(date);
                                        }
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    return NotificationChartView;
});
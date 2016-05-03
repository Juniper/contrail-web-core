/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model'
], function (_, ContrailView, ContrailListModel) {

    var QueryResultLineChartView = ContrailView.extend({
        render: function() {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                queryId = viewConfig['queryId'],
                queryFormAttributes = viewConfig['queryFormAttributes'],
                queryResultChartGridId = viewConfig.queryResultChartGridId,
                modelMap = contrail.handleIfNull(self.modelMap, {});

            var clickOutView = (contrail.checkIfExist(viewConfig.clickOutElementId)) ? self.rootView.viewMap[viewConfig.clickOutElementId] : self;

            modelMap[cowc.UMID_QUERY_RESULT_LINE_CHART_MODEL] = new ContrailListModel({data: []});
            modelMap[cowc.UMID_QUERY_RESULT_CHART_MODEL] = getChartDataModel(queryId, queryFormAttributes, modelMap);
            self.renderView4Config(self.$el, null, getQueryChartViewConfig(queryId, queryFormAttributes, modelMap, clickOutView, queryResultChartGridId), null, null, modelMap);
        }
    });

    function getQueryChartViewConfig(queryId, queryFormAttributes, modelMap, parentView, queryResultChartGridId) {
        var queryResultChartGroupUrl = '/api/qe/query/chart-groups?queryId=' + queryId,
            selectArray = queryFormAttributes.select.replace(/ /g, "").split(","),
            queryIdSuffix = '-' + queryId,
            aggregateSelectFields = qewu.getAggregateSelectFields(selectArray),
            queryResultLineChartId = cowl.QE_QUERY_RESULT_LINE_CHART_ID + queryIdSuffix,
            chartAxesOptions = {};

        $.each(aggregateSelectFields, function(selectFieldKey, selectFieldValue) {
            var yFormatterKey = cowc.QUERY_COLUMN_FORMATTER[selectFieldValue];

            chartAxesOptions[selectFieldValue] = {
                axisLabelDistance: 5,
                yAxisLabel: selectFieldValue,
                yAxisDataField: selectFieldValue,
                forceY: [0, 10],
                yFormatter: function (d) {
                    return cowf.getFormattedValue(yFormatterKey, d)
                }
            };
        });

        return {
            elementId: cowl.QE_QUERY_RESULT_CHART_PAGE_ID + queryIdSuffix,
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: queryResultLineChartId,
                                title: cowl.TITLE_CHART,
                                view: "LineWithFocusChartView",
                                viewConfig: {
                                    widgetConfig: {
                                        elementId: queryResultLineChartId + '-widget',
                                        view: "WidgetView",
                                        viewConfig: {
                                            header: false,
                                            controls: {
                                                top: false,
                                                right: {
                                                    custom: {
                                                        filterY: {
                                                            enable: true,
                                                            iconClass: 'icon-filter',
                                                            title: 'Filter',
                                                            events: cowu.getFilterEvent(),
                                                            viewConfig: getFilterConfig(queryId, aggregateSelectFields, queryResultLineChartId)
                                                        }
                                                    },
                                                    expandedContainerWidth: (queryFormAttributes.query_prefix === cowc.FS_QUERY_PREFIX) ? 200 : 245
                                                }
                                            }
                                        }
                                    },
                                    chartOptions: {
                                        chartAxesOptions: chartAxesOptions,
                                        chartAxesOptionKey: aggregateSelectFields[0]
                                    },
                                    loadChartInChunks: true,
                                    modelKey: cowc.UMID_QUERY_RESULT_LINE_CHART_MODEL
                                }
                            }
                        ]
                    },
                    {
                        columns: [
                            {
                                elementId: queryResultChartGridId,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getChartGridViewConfig(queryId, queryResultChartGroupUrl, queryFormAttributes, modelMap, parentView)
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    function getBadgeColorkey(chartColorAvailableKeys) {
        var badgeColorKey = null;

        $.each(chartColorAvailableKeys, function(colorKey, colorValue) {
           if (colorValue === null) {
               badgeColorKey = colorKey;
               return false;
           }
        });

        return badgeColorKey
    }

    function getChartGridViewConfig(queryId, queryResultChartGroupUrl, queryFormAttributes, modelMap, parentView) {
        var selectArray = queryFormAttributes.select.replace(/ /g, "").split(","),
            lineWithFocusChartModel = modelMap[cowc.UMID_QUERY_RESULT_LINE_CHART_MODEL],
            chartColorAvailableKeys = ['id_0', null, null, null, null],
            actionCell = [],
            display = [
                {
                    id: 'fc-badge', field:"", name:"", resizable: false, sortable: false, width: 30, minWidth: 30, searchable: false, exportConfig: { allow: false },
                    formatter: function(r, c, v, cd, dc){
                        return '<span class="label-icon-badge label-icon-badge-' + dc.cgrid + ((r === 0) ? ' icon-badge-color-0' : '') + '" data-color_key="' + ((r === 0) ? 0 : -1) + '"><i class="icon-sign-blank"></i></span>';
                    },
                    events: {
                        onClick: function(e, dc) {
                            var badgeElement = $(e.target).parent(),
                                badgeColorKey = badgeElement.data('color_key');

                            if (badgeColorKey >= 0 && _.compact(chartColorAvailableKeys).length > 1) {
                                badgeElement.data('color_key', -1);
                                badgeElement.removeClass('icon-badge-color-' + badgeColorKey);
                                chartColorAvailableKeys[badgeColorKey] = null;
                                lineWithFocusChartModel.setData(formatChartData(modelMap, queryFormAttributes, chartColorAvailableKeys));
                            } else if (badgeColorKey < 0) {
                                badgeColorKey =  getBadgeColorkey(chartColorAvailableKeys);

                                if (badgeColorKey !== null) {
                                    badgeElement.data('color_key', badgeColorKey);
                                    badgeElement.addClass('icon-badge-color-' + badgeColorKey);
                                    chartColorAvailableKeys[badgeColorKey] = dc.cgrid;
                                    lineWithFocusChartModel.setData(formatChartData(modelMap, queryFormAttributes, chartColorAvailableKeys));
                                }
                            }
                        }
                    }
                }
            ],
            columnDisplay = qewgc.getColumnDisplay4ChartGroupGrid(queryFormAttributes.table_name, queryFormAttributes.table_type, selectArray);

        if (queryFormAttributes.query_prefix === cowc.FS_QUERY_PREFIX) {

            if (qewu.enableSessionAnalyzer(null, queryFormAttributes)) {
                actionCell = [
                    {
                        title: 'Analyze Session',
                        iconClass: 'icon-external-link-sign',
                        onClick: qewgc.getOnClickSessionAnalyzer(parentView, queryId, queryFormAttributes)
                    }
                ]
            }
        }

        columnDisplay = display.concat(columnDisplay);

        var viewConfig = {
            header: {},
            columnHeader: {
                columns: columnDisplay
            },
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: false,
                    fixedRowHeight: 30,
                    actionCell: actionCell
                },
                dataSource:{
                    remote: {
                        ajaxConfig: {
                            url: queryResultChartGroupUrl,
                            type: 'GET'
                        }
                    }
                }
            },
            footer: {
                pager: {
                    options: {
                        pageSize: 100,
                        pageSizeSelect: [100, 200, 500]
                    }
                }
            }
        };

        return viewConfig;
    };

    function getChartDataModel(queryId, queryFormAttributes, modelMap) {
        var lineWithFocusChartModel = modelMap[cowc.UMID_QUERY_RESULT_LINE_CHART_MODEL],
            chartUrl = '/api/admin/reports/query/chart-data?queryId=' + queryId,
            chartListModel = new ContrailListModel({
            remote: {
                ajaxConfig: {
                    url: chartUrl,
                    type: 'GET'
                },
                dataParser: qewp.fsQueryDataParser
            }
        });

        chartListModel.onAllRequestsComplete.subscribe(function() {
            if (chartListModel.getLength() > 0) {
                var chartColorAvailableKeys = ['id_0', null, null, null, null];
                lineWithFocusChartModel.setData(formatChartData(modelMap, queryFormAttributes, chartColorAvailableKeys));
            } else {
                lineWithFocusChartModel.setData([])
            }

        });

        return chartListModel;
    };

    function formatChartData(modelMap, queryFormAttributes, chartColorAvailableKeys) {
        var chartListModel = modelMap[cowc.UMID_QUERY_RESULT_CHART_MODEL],
            selectArray = queryFormAttributes.select.replace(/ /g, "").split(","),
            aggregateSelectFields = qewu.getAggregateSelectFields(selectArray),
            chartData = [];

        $.each(chartColorAvailableKeys, function(colorKey, colorValue) {
            if (colorValue !== null) {

                var chartDataRow = chartListModel.getItemById(colorValue),
                    chartDataValue = {
                        cgrid: 'id_' + colorKey,
                        key: colorKey,
                        values: [],
                        color: cowc.D3_COLOR_CATEGORY7[colorKey]
                    };

                qewu.addChartMissingPoints(chartDataRow, queryFormAttributes, aggregateSelectFields);

                $.each(chartDataRow.values, function (fcItemKey, fcItemValue) {
                    var ts = parseInt(fcItemKey),
                        chartDataValueItemObj = {x: ts};

                    $.each(aggregateSelectFields, function(selectFieldKey, selectFieldValue) {
                        chartDataValueItemObj[selectFieldValue] = fcItemValue[selectFieldValue]
                    });

                    chartDataValue.values.push(chartDataValueItemObj);
                });

                chartData.push(chartDataValue);
            }
        });

        return chartData
    };

    function getFilterConfig(queryId, aggregateSelectFields, queryResultLineChartId, modelMap) {
        var filterConfig = {
            groupType: '1-cols',
            groups: [
                {
                    id: 'by-node-color-' + queryId,
                    title: false,
                    type: 'radio',
                    items: []
                }
            ]
        };

        $.each(aggregateSelectFields, function(selectFieldKey, selectFieldValue) {
            filterConfig.groups[0].items.push({
                text: selectFieldValue,
                events: {
                    click: function(event) {
                        var chartModel = $('#' + queryResultLineChartId).data('chart'),
                            chartOptions = chartModel.chartOptions,
                            chartAxesOption = chartOptions.chartAxesOptions[selectFieldValue];

                        chartModel.yAxis.axisLabel(chartAxesOption.yAxisLabel)
                            .axisLabelDistance(chartAxesOption.axisLabelDistance)
                            .tickFormat(chartAxesOption['yFormatter'])
                            .showMaxMin(false);

                        chartModel.lines.forceY(chartAxesOption.forceY);
                        chartModel.lines2.forceY(chartAxesOption.forceY);

                        chartModel.chartOptions.chartAxesOptionKey = selectFieldValue;
                        chartModel.update();
                    }
                }
            })
        });

        return filterConfig
    };

    return QueryResultLineChartView;
});
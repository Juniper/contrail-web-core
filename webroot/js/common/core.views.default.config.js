
/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var CoreViewsDefaultConfig = function () {
        this.gridConfig = {
            header: {
                title: {
                    cssClass: 'blue',
                    icon: '',
                    iconCssClass: 'blue'
                },
                icon: false,
                defaultControls: {
                    collapseable: false,
                    exportable: true,
                    refreshable: true,
                    searchable: true,
                    columnPickable: false
                },
                customControls: false
            },
            columnHeader: {
                columns: {}
            },
            body: {
                options: {
                    actionCell: false,
                    autoHeight: true,
                    autoRefresh: false,
                    checkboxSelectable: true,
                    forceFitColumns: true,
                    detail: {
                        template: '<pre>{{{formatJSON2HTML this.data this.ignoreKeys}}}</pre>'
                    },
                    enableCellNavigation: true,
                    enableColumnReorder: false,
                    enableTextSelectionOnCells: true,
                    fullWidthRows: true,
                    multiColumnSort: true,
                    rowHeight: 30,
                    fixedRowHeight: false,
                    gridHeight: 500,
                    rowSelectable: false,
                    sortable: true,
                    lazyLoading: true,
                    defaultDataStatusMessage: true,
                    actionCellPosition: 'end', //actionCellPosition indicates position of the settings icon whether it should be on row start and end
                    multiRowSelection: true, //This property will enable/disable selecting multiple rows of the grid, but the checkbox in the header should be removed by the client because as of now, we don't have way in api to remove the checkbox in header
                    disableRowsOnLoading: false
                },
                dataSource: {
                    remote: null,
                    data: null,
                    events: {}
                },
                statusMessages: {
                    loading: {
                        type: 'status',
                        iconClasses: '',
                        text: 'Loading...'
                    },
                    empty: {
                        type: 'status',
                        iconClasses: '',
                        text: 'No data available.'
                    },
                    error: {
                        type: 'error',
                        iconClasses: 'icon-warning-sign',
                        text: 'Error in getting data.'
                    }
                }
            },
            footer: {
                pager: {
                    options: {
                        pageSize: 50,
                        pageSizeSelect: [10, 50, 100, 200]
                    }
                }
            }
        };

        this.lineWithFocusChartConfig = {
            margin: {top: 10, right: 30, bottom: 50, left: 65},
            margin2: {top: 0, right: 30, bottom: 40, left: 65},
            axisLabelDistance: 5,
                height: 300,
            yAxisLabel: 'Traffic',
            y2AxisLabel: '',
            forceY: [0, 60],
            defaultDataStatusMessage: true,
            statusMessageHandler: cowm.getRequestMessage,
            yFormatter: function(d) { return cowu.addUnits2Bytes(d, false, false, 1, 60); },
            y2Formatter: function(d) { return cowu.addUnits2Bytes(d, false, false, 1, 60); }
        };

        this.lineBarWithFocusChartConfig = {
            margin: {top: 20, right: 70, bottom: 50, left: 70},
            margin2: {top: 0, right: 70, bottom: 40, left: 70},
            height: 300,
            axisLabelDistance: 5,
            y1AxisLabel: 'CPU Utilization (%)',
            y2AxisLabel: 'Memory Usage',
            forceY1: [0, 5],
            forceY2: [0, 5],
            defaultDataStatusMessage: true,
            statusMessageHandler: cowm.getRequestMessage,
            y2Formatter: function (y2Value) {
                var formattedValue = formatBytes(y2Value * 1024, true);
                return formattedValue;
            },
            y1Formatter: d3.format(".01f"),
            showLegend: true,
            xFormatter: function(value) {
                return d3.time.format('%H:%M:%S')(new Date(value));;
            }
        };

        this.lineBarChartConfig = {
            margin: {top: 20, right: 70, bottom: 50, left: 70},
            margin2: {top: 0, right: 70, bottom: 40, left: 70},
            height: 300,
            axisLabelDistance: 5,
            y1AxisLabel: 'CPU Utilization (%)',
            y2AxisLabel: 'Memory Usage',
            defaultDataStatusMessage: true,
            statusMessageHandler: cowm.getRequestMessage,
            y2Formatter: function (y2Value) {
                var formattedValue = formatBytes(y2Value * 1024, true);
                return formattedValue;
            },
            y1Formatter: d3.format(".01f"),
            xFormatter: function(value) {
                return d3.time.format("%H:%M")(value);
            }
        };
    };

    return CoreViewsDefaultConfig;
});

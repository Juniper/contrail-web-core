
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
                    searchable: true
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
                        template: '<pre>{{{formatJSON2HTML this.data}}}</pre>'
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
                    multiRowSelection: true //This property will enable/disable selecting multiple rows of the grid, but the checkbox in the header should be removed by the client because as of now, we don't have way in api to remove the checkbox in header
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
                        text: 'No Records Found.'
                    },
                    error: {
                        type: 'error',
                        iconClasses: 'icon-warning',
                        text: 'Error - Please try again later.'
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
            margin: {top: 20, right: 70, bottom: 50, left: 70},
            margin2: {top: 0, right: 70, bottom: 40, left: 70},
            axisLabelDistance: 5,
                height: 300,
            yAxisLabel: 'Traffic',
            y2AxisLabel: '',
            forceY: [0, 60],
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
            y2Formatter: function (y2Value) {
                var formattedValue = formatBytes(y2Value * 1024, true);
                return formattedValue;
            },
            y1Formatter: d3.format(".01f"),
            showLegend: true
        };
    };

    return CoreViewsDefaultConfig;
});

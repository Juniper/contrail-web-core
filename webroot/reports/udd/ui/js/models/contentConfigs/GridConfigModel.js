/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    "lodash",
    "core-constants",
    "core-basedir/js/common/qe.grid.config",
    "reports/udd/ui/js/models/ContentConfigModel.js"
], function(_, coreConstants, QEGridConfigBuilders, ContentConfigModel) {
    return ContentConfigModel.extend({
        defaultConfig: {
            table: "",
            tableType: "",
            fields: [],
            detailedEntry: true,
            checkableEntry: true
        },

        validations: {
            validation: {}
        },
        // update fields dependent on data model
        onDataModelChange: function(viewModel) {
            var tableName = viewModel.table_name(),
                tableType = viewModel.table_type();

            if (!tableName) {
                return;
            }

            var selectedFields = viewModel.select().replace(/\s+/g, "").split(",");

            this.table(tableName);
            this.tableType(tableType);
            this.fields(selectedFields);
        },

        toJSON: function() {
            var self = this;
            return {
                detailedEntry: self.detailedEntry(),
                checkableEntry: self.checkableEntry()
            };
        },

        getParserOptions: function() {
            return {
                parserName: "gridEntryParser",
                dataFields: this.fields(),
            };
        },

        getContentViewOptions: function() {
            var customGridConfig = {
                body: {
                    options: {
                        checkboxSelectable: this.checkableEntry(),
                        autoHeight: false,
                        gridHeight: 274
                    }
                }
            };

            // This is attribute is handled separately, since its value should be an object when enabled.
            // Refer to core.views.default.config.js
            // Only include this attribute when it's disabled with false.
            if (!this.detailedEntry()) {
                customGridConfig.body.options.detail = this.detailedEntry();
            }

            customGridConfig = _.merge(
                QEGridConfigBuilders.getQueryGridConfig({},
                    QEGridConfigBuilders.getColumnDisplay4Grid(this.table(), this.tableType(), this.fields()), {
                        titleText: "test Title",
                        fixedRowHeight: 40,
                        actionCell: false,
                        actionCellPosition: "end",
                        queryQueueUrl: cowc.URL_QUERY_STAT_QUEUE,
                        queryQueueTitle: cowl.TITLE_STATS
                    }
                ),
                customGridConfig
            );

            return {
                elementConfig: customGridConfig
            };
            // return {
            //     elementConfig: {
            //         header: {
            //             title: {
            //                 cssClass: 'blue',
            //                 icon: '',
            //                 iconCssClass: 'blue'
            //             },
            //             icon: false,
            //             defaultControls: {
            //                 collapseable: true,
            //                 exportable: true,
            //                 refreshable: false,
            //                 searchable: true
            //             },
            //             customControls: false
            //         },
            //         columnHeader: {
            //             columns: QEGridConfigBuilders.getColumnDisplay4Grid(this.table(), this.tableType(), this.fields())
            //         },
            //         body: {
            //             options: {
            //                 actionCell: false,
            //                 autoHeight: true,
            //                 autoRefresh: false,
            //                 checkboxSelectable: this.checkableEntry(),
            //                 detail: this.detailedEntry(),
            //                 enableCellNavigation: true,
            //                 enableColumnReorder: false,
            //                 enableTextSelectionOnCells: true,
            //                 fullWidthRows: true,
            //                 multiColumnSort: true,
            //                 rowHeight: 30,
            //                 fixedRowHeight: false,
            //                 gridHeight: 500,
            //                 rowSelectable: false,
            //                 sortable: true,
            //                 lazyLoading: false,
            //                 actionCellPosition: "end", //actionCellPosition indicates position of the settings icon whether it should be on row start and end
            //                 multiRowSelection: true, //This property will enable/disable selecting multiple rows of the grid
            //                 //but the checkbox in the header should be removed by the client because as of now
            //                 //we don't have way in api to remove the checkbox in header
            //             },
            //             dataSource: {
            //                 remote: null,
            //                 data: null,
            //                 events: {}
            //             },
            //             statusMessages: {
            //                 loading: {
            //                     type: 'status',
            //                     iconClasses: '',
            //                     text: 'Loading...'
            //                 },
            //                 empty: {
            //                     type: 'status',
            //                     iconClasses: '',
            //                     text: 'No Records Found.'
            //                 },
            //                 error: {
            //                     type: 'error',
            //                     iconClasses: 'fa fa-warning',
            //                     text: 'Error - Please try again later.'
            //                 }
            //             }
            //         },
            //         footer: {
            //             pager: {
            //                 options: {
            //                     pageSize: 50,
            //                     pageSizeSelect: [10, 50, 100, 200]
            //                 }
            //             }
            //         }
            //     }
            // };
        },
    });
});

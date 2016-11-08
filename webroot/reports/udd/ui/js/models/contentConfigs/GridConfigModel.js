/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    "lodash",
    "core-constants",
    "core-basedir/reports/udd/ui/js/common/udd.constants",
    "core-basedir/reports/qe/ui/js/common/qe.utils",
    "core-basedir/reports/qe/ui/js/common/qe.grid.config",
    "core-basedir/reports/udd/ui/js/models/ContentConfigModel"
], function(_, coreConstants, uddConstants, qeUtils, qeGridConfig, ContentConfigModel) {
    var delimiter = ",";

    return ContentConfigModel.extend({
        canUseSelectChange: false, // a flag indicating if the select field
                                   // change can be used to update visible columns
        defaultConfig: {
            gridTitle: "",
            tableName: "",
            tableType: "",
            fields: [],
            detailedEntry: true,
            visibleColumns: "",
            availableColumns: [],
            pageSize: 8
        },

        validations: {
            validation: {
                "visibleColumns": {
                    required: true
                }
            }
        },
        // update fields dependent on data model
        onDataModelChange: function(viewModel) {
            var tableName = viewModel.get("table_name"),
                tableType = viewModel.get("table_type");

            if (!tableName) {
                return;
            }

            var selectedFields = viewModel.get("select").replace(/\s+/g, ""),
                selectedFieldArray = selectedFields.split(delimiter);

            this.tableName(tableName);
            this.tableType(tableType);
            this.fields(selectedFieldArray);
            // this is a ViewModel which doesn't need to be saved on backend
            this.availableColumns(_.map(selectedFieldArray, function(field) {
                return {
                    id: field,
                    text: qeUtils.formatNameForGrid(field)
                };
            }));

            var columnsToShow = this.visibleColumns().split(delimiter),
                newColumnsToShowByDefault = [];

            /** 
             * when data source config form's select field is updated,
             * find and delete those removed DB fields from visible columns.
             * Then, by default, add any new DB fields to the visible columns.
             */
            if (!_.isEmpty(viewModel.changed.select)) {
                if (!this.canUseSelectChange && _.isUndefined(viewModel.previous("select"))) {
                    // This takes advantage of the truth that
                    // on widget initialization, select field will be updated once
                    // based on server response. And this initialization change
                    // should be omitted. The else-clause should be enabled for all following 
                    // select field changes.
                    this.canUseSelectChange = true;
                } else {
                    var invalidColumnsToRemove = _.difference(columnsToShow, selectedFieldArray);

                    newColumnsToShowByDefault = _.difference(selectedFieldArray, columnsToShow);

                    // TODO: When Lodash@4.x.x is available, replace this whole line with _.pullAll(columnsToShow, invalidColumnsToRemove);
                    columnsToShow = _.difference(columnsToShow, invalidColumnsToRemove);
                }
            }

            // TODO: When Lodash^4.x.x is available, replace this whole line with this.visibleColumns(_.concat(columnsToShow, newColumnsToShowByDefault).join(delimiter));
            this.visibleColumns(columnsToShow.concat(newColumnsToShowByDefault).join(delimiter));
        },

        toJSON: function() {
            return {
                gridTitle: this.gridTitle(),
                detailedEntry: this.detailedEntry(),
                visibleColumns: this.visibleColumns(),
                pageSize: this.pageSize()
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
                header: {
                    defaultControls: {
                        collapseable: false
                    }
                },
                body: {
                    options: {
                        checkboxSelectable: false,
                    }
                },
                footer: {
                    pager: {
                        options: {
                            pageSize: this.pageSize(),
                            pageSizeSelect: uddConstants.uddWidget.gridPageSizeList
                        }
                    }
                }
            };

            // This attribute is handled separately, since its value should be an object when enabled.
            // Refer to core.views.default.config.js
            // Only include this attribute when it's disabled with false.
            if (!this.detailedEntry()) {
                customGridConfig.body.options.detail = this.detailedEntry();
            }

            customGridConfig = _.merge(
                qeGridConfig.getQueryGridConfig({},
                    qeGridConfig.getColumnDisplay4Grid(this.tableName(), this.tableType(), this.fields()),
                    {
                        titleText: this.gridTitle(),
                        fixedRowHeight: false,
                        actionCell: false,
                        actionCellPosition: "end",
                        queryQueueUrl: cowc.URL_QUERY_STAT_QUEUE,
                        queryQueueTitle: cowl.TITLE_STATS,
                        lazyLoading: false,
                        defaultDataStatusMessage: true
                    }
                ),
                customGridConfig
            );

            var colToShow = this.visibleColumns().split(delimiter);
                /**
                 * A code snippet that specially handles `T=` for `FlowSeriesTable`.
                 * Refer to columnDisplayMap in qe.grid.config.js.
                 * 
                 * Without this code, the "Time" column won't be shown properly in GridView in UDD Widget.
                 * 
                 * NOTE: this is due to a potential implementation issue of qe.grid.config.js
                 */
                if (this.tableName() === "FlowSeriesTable") {
                    var idx = colToShow.indexOf("T=");
                    if (~idx) {
                        colToShow[idx] = "T";
                    }
                }

            var len = colToShow.length,
                shouldShow = _.zipObject(colToShow, _.times(len, function() {
                    // TODO: When Lodash@4.13.x and above are available, replace this anonymous function with _.stubTrue
                    return true;
                }));

            _.forEach(customGridConfig.columnHeader.columns, function(columnConfig) {
                if (!shouldShow[columnConfig.field]) {
                    columnConfig.hide = true;
                }
            });

            return {
                elementConfig: customGridConfig
            };
        },
    });
});

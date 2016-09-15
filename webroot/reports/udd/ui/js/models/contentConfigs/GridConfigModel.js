/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    "lodash",
    "core-constants",
    "core-basedir/js/common/qe.utils",
    "core-basedir/js/common/qe.grid.config",
    "reports/udd/ui/js/models/ContentConfigModel.js"
], function(_, coreConstants, QEUtils, QEGridConfigBuilders, ContentConfigModel) {
    var delimiter = ",";

    return ContentConfigModel.extend({
        defaultConfig: {
            gridTitle: "",
            tableName: "",
            tableType: "",
            fields: [],
            detailedEntry: true,
            selectableEntry: true,
            visibleColumns: "",
            availableColumns: [],
            pageSize: covdc.gridConfig.footer.pager.options.pageSize
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

            var selectedFields = viewModel.select().replace(/\s+/g, ""),
                selectedFieldArray = selectedFields.split(delimiter);

            this.tableName(tableName);
            this.tableType(tableType);
            this.fields(selectedFieldArray);
            // this is a ViewModel which doesn't need to be saved on backend
            this.availableColumns(_.map(selectedFieldArray, function(field) {
                return {
                    id: field,
                    text: QEUtils.formatNameForGrid(field)
                };
            }));

            var columnsToShow = this.visibleColumns().split(delimiter),
                invalidColumnsToRemove = _.difference(columnsToShow, selectedFieldArray),
                newColumnsToShowByDefault = _.difference(selectedFieldArray, columnsToShow);

            // TODO: When Lodash@4.x.x is available, replace this whole line with _.pullAll(columnsToShow, invalidColumnsToRemove);
            columnsToShow = _.difference(columnsToShow, invalidColumnsToRemove);

            // TODO: When Lodash^4.x.x is available, replace this whole line with this.visibleColumns(_.concat(columnsToShow, newColumnsToShowByDefault).join(delimiter));
            this.visibleColumns(columnsToShow.concat(newColumnsToShowByDefault).join(delimiter));
        },

        toJSON: function() {
            var self = this;
            return {
                gridTitle: self.gridTitle(),
                detailedEntry: self.detailedEntry(),
                selectableEntry: self.selectableEntry(),
                visibleColumns: self.visibleColumns(),
                pageSize: self.pageSize()
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
                        checkboxSelectable: this.selectableEntry(),
                        autoHeight: false,
                        gridHeight: 274
                    }
                },
                footer: {
                    pager: {
                        options: {
                            pageSize: this.pageSize()
                        }
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
                    QEGridConfigBuilders.getColumnDisplay4Grid(this.tableName(), this.tableType(), this.fields()),
                    {
                        titleText: this.gridTitle(),
                        fixedRowHeight: false,
                        actionCell: false,
                        actionCellPosition: "end",
                        queryQueueUrl: cowc.URL_QUERY_STAT_QUEUE,
                        queryQueueTitle: cowl.TITLE_STATS
                    }
                ),
                customGridConfig
            );

            var colToShow = this.visibleColumns().split(delimiter),
                len = colToShow.length,
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

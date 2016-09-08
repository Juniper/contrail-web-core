/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
  "lodash",
  "core-constants",
  "core-formatters",
  "reports/udd/ui/js/models/ContentConfigModel.js"
],function (_, coreConstants, CoreFormatters, ContentConfigModel) {
  var coreFormatters = new CoreFormatters();

  function getColumnsConfig(table, fieldsList) {
    var configuration = [];

    if (!_.isArray(fieldsList)) {
      console.error("Fields list must be an array of strings.\n", "An invalid format was passed in as: " + fieldsList + "\n");
    } else {
      console.log(table, fieldsList);
      configuration = _.map(fieldsList, function(field) {
        return getColumnConfig(table, field);
      });
    }

    return configuration;
  }

  function getColumnConfig(table, field) {
    return _.get(QueryField2GridColumnMap, table + "." + field, {
      field: field,
      name: field,
      formatter: function(row, cell, value) {
        console.debug(field, row, cell, value);
        return coreFormatters.formatElementName({
          name: field,
          value: value,
          cssClass: "cell-hyperlink-blue"
        });
      },
      minWidth: 80
    });
  }

  // TODO: this global constant should be defined in some core file <== ask someone that if there is a proper location
  var QueryField2GridColumnMap = {
    "StatTable_ServerMonitoringInfo_sensor_stats": {

    }
  };

  return ContentConfigModel.extend({
    defaultConfig: {
      table: "",
      fields: [],
      detailedEntry: true,
      checkableEntry: true
    },

    validations: {
      validation: {
      }
    },

    // update fields dependent on data model
    onDataModelChange: function (viewModel) {
      var tableName = viewModel.table_name();

      if (!tableName) {
        return;
      }

      var tableID = tableName.split(".").pop(),
        selectedFields = viewModel.select().replace(/\s+/g, "").split(","),
        tableScopedFields = _.map(selectedFields, function(field) {
          return tableID + "." + field;
        });

      this.table(tableName);
      this.fields(tableScopedFields);
    },

    toJSON: function () {
      var self = this;
      return {
        detailedEntry: self.detailedEntry(),
        checkableEntry: self.checkableEntry()
      };
    },

    getParserOptions: function () {
      return {
        parserName: "gridEntryParser",
        dataFields: this.fields(),
      };
    },

    getContentViewOptions: function () {
      return {
        elementConfig: {
          header: {
            title: {
              cssClass : 'blue',
              icon : '',
              iconCssClass : 'blue'
            },
            icon: false,
            defaultControls: {
              collapseable: true,
              exportable: true,
              refreshable: false,
              searchable: true
            },
            customControls: false
          },
          columnHeader: {
            columns: getColumnsConfig(this.table(), this.fields())
          },
          body: {
            options: {
              actionCell: false,
              autoHeight: true,
              autoRefresh: false,
              checkboxSelectable: this.checkableEntry(),
              detail: this.detailedEntry(),
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
              lazyLoading: false,
              actionCellPosition: "end", //actionCellPosition indicates position of the settings icon whether it should be on row start and end
              multiRowSelection: true,//This property will enable/disable selecting multiple rows of the grid
                                      //but the checkbox in the header should be removed by the client because as of now
                                      //we don't have way in api to remove the checkbox in header
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
                iconClasses: 'fa fa-warning',
                text: 'Error - Please try again later.'
              }
            }
          },
          footer : {
            pager : {
              options : {
                pageSize : 50,
                pageSizeSelect : [10, 50, 100, 200]
              }
            }
          }
        }
      };
    }
  });
});

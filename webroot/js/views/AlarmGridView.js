/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'js/views/AlarmsEditView',
    'js/models/AlarmsModel'
], function (_, ContrailView, ContrailListModel, AlarmsEditView, AlarmsModel) {
    var alarmsEditView = new AlarmsEditView();
    var GridDS;
    var AlarmGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this;
            var viewConfig = (this.attributes)? this.attributes.viewConfig : null;
            var contrailListModel;
            if(self.model == null) {
                var remoteAjaxConfig = {
                        remote: {
                            ajaxConfig: {
                                url: cowc.get(cowc.URL_ALARM_DETAILS_IN_CHUNKS, 50, $.now()),
                                type: "GET",
                            },
                            dataParser: coreAlarmUtils.alarmDataParser
                        },
                        cacheConfig: {
                        }
                }
                contrailListModel = new ContrailListModel(remoteAjaxConfig);
            } else {
                contrailListModel = self.model;
            }
            self.renderView4Config(self.$el, contrailListModel, getAlarmGridViewConfig());
        }
    });

    function wrapUVEAlarms (nodeType,hostname,UVEAlarms) {
        var obj = {}
        var alarm = {};
        obj[nodeType] = [];
        alarm['name'] = hostname;
        alarm['value'] = {};
        alarm['value']['UVEAlarms'] = UVEAlarms;
        obj[nodeType].push(alarm);
        return obj;
    }

    function onSeverityChanged(e) {
        filterGridDataBySeverity(e.added.value);
    }

    function filterGridDataBySeverity(severity) {
        var filterdDS = [];
        if (severity !== 'all') {
            for (var i = 0; i < GridDS.length; i++) {
                if (GridDS[i].severity === parseInt(severity, 10)) {
                    filterdDS.push(GridDS[i]);
                }
            }
        } else {
            filterdDS = GridDS;
        }
        var gridAlarms = $('#' + cowl.ALARMS_GRID_ID).data('contrailGrid');
        gridAlarms._dataView.setData(filterdDS)
    }

    var getAlarmGridViewConfig = function () {
        return {
            elementId: cowu.formatElementId([cowl.MONITOR_ALARM_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: cowl.ALARMS_GRID_ID,
                                title: cowl.TITLE_ALARMS,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getConfiguration()
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };

    var getConfiguration = function () {
        var alarmColumns = [
                              {
                                  field: 'severity',
                                  name: '',
                                  width: 1,
                                  searchFn: function (d) {
                                      return d['severity'];
                                  },
                                  searchable: true,
                                  formatter : function (r, c, v, cd, dc) {
                                      var formattedDiv;
                                      if(dc['ack']) {
                                          if(dc['severity'] === 4) {
                                              formattedDiv = '<div data-color="orange" class="circle orange alarms-circle-grid-style"></div>';
                                          } else if (dc['severity'] === 3) {
                                              formattedDiv = '<div data-color="red" class="circle red alarms-circle-grid-style"></div>';
                                          }
                                      } else {
                                          if(dc['severity'] === 3) {
                                              formattedDiv = '<div data-color="red" class="circle red filled alarms-circle-grid-style"></div>';
                                          } else if (dc['severity'] === 4) {
                                              formattedDiv = '<div data-color="orange" class="circle orange filled alarms-circle-grid-style"></div>';
                                          }
                                      }
                                      return formattedDiv;
                                  }
                              },
                              {
                                  field: 'timestamp',
                                  name: 'Time',
                                  minWidth: 50,
                                  formatter : function (r,c,v,cd,dc) {
                                      return getFormattedDate(v/1000);
                                  }
                              },
                              {
                                  field: 'alarm_msg',
                                  name: 'Alarm',
                                  minWidth: 200,
                              },
                              {
                                  field: 'display_name',
                                  name: 'Source',
                                  minWidth: 100
                              },
                              {
                                  field: 'acknowledge',
                                  name:'',
                                  formatter : function (r,c,v,cd,dc) {
                                      var formattedDiv = '';
                                      if(!dc['ack']) {
                                          formattedDiv = '<span title="Acknowledge"><i class="icon-ok-circle"></i></span>';
                                      }
                                      return formattedDiv;
                                  },
                                  events: {
                                      onClick: onAcknowledgeActionClicked
                                  },
                                  width:1
                              }
                          ];
        var gridElementConfig = {
            header: {
                title: {
                    text: cowl.TITLE_ALARMS_SUMMARY
                },
                defaultControls: {
                    collapseable: false,
                    exportable: true,
                    refreshable: true,
                    searchable: true
                },
                advanceControls: getHeaderActionConfig()
            },
            body: {
                options: {
                    autoRefresh: false,
                    checkboxSelectable: {
                        onNothingChecked: function (e) {
                            $('#btnAcknowledge').addClass('disabled-link');
                        },
                        onSomethingChecked: function (e) {
                            $('#btnAcknowledge').removeClass('disabled-link');
                        }
                    },
                    detail: {
                        template: cowu.generateDetailTemplateHTML(getAlarmDetailsTemplateConfig(), cowc.APP_CONTRAIL_CONTROLLER)
                    }
                },
                dataSource : {
                    data : []
                },
            },
            columnHeader: {
                columns: alarmColumns
            }
        };
        return gridElementConfig;
    };

    function onAcknowledge (checkedRows) {
        alarmsEditView.model = new AlarmsModel();
        alarmsEditView.renderAckAlarms  ({
                              "title": 'Acknowledge Alarms',
                              checkedRows:checkedRows,
                              callback: function () {
                                  var alarmGrid = $('#' + cowl.ALARMS_GRID_ID).data("contrailGrid");
                                  alarmGrid.refreshData();
                                  alarmGrid.setCheckedRows([]);//Clear the selected items
                              }
            });
    }

    function onAcknowledgeActionClicked (e,rowData) {
        onAcknowledge ([rowData]);
    }

    function getHeaderActionConfig() {
        var headerActionConfig = [
            {
                "type": "link",
                "title": 'Acknowledge',
                "linkElementId": "btnAcknowledge",
                "iconClass": "icon-ok-circle",
                "onClick": function () {
                    var gridElId = '#' + cowl.ALARMS_GRID_ID;
                    var checkedRows = $(gridElId).data("contrailGrid").getCheckedRows();
                    if(checkedRows.length == 0) {
                        return;
                    }
                    onAcknowledge (checkedRows);
                }
            },
            {
                type: 'checked-multiselect',
                iconClass: 'icon-filter',
                placeholder: 'Filter Alarms',
                elementConfig: {
                    elementId: 'alarmsFilterMultiselect',
                    dataTextField: 'text',
                    dataValueField: 'id',
                    noneSelectedText: 'Filter Alarms',
                    filterConfig: {
                        placeholder: 'Search Filter'
                    },
                    minWidth: 150,
                    height: 205,
                     data : [
                            {
                                id:"severity",
                                text:"Severity",
                                children: [
                                    {
                                        id:"4",
                                        text:'Minor',
                                        iconClass:'icon-download-alt'
                                    },
                                    {
                                        id:"3",
                                        text:"Major",
                                        icon:'<div data-color="orange" class="circle orange filled" style="opacity:1"></div>'
                                    }
                                ]
                            },
                            {
                                id:"status",
                                text:"Status",
                                children: [
                                    {
                                        id: 'Acknowledged',
                                        text:"Acknowledged"
                                    },
                                    {
                                        id: 'Unacknowledged',
                                        text: "Unacknowledged"
                                    }
                                ]
                            }
                       ],
                    click: applyAlarmsFilter,
                    optgrouptoggle: applyAlarmsFilter,
                    control: false
                }
            }
        ];
        return headerActionConfig;
    }

    function getAcknowledgeAction (onClickFunction, divider) {
        return {
            title: cowl.TITLE_ACKNOWLEDGE,
            iconClass: 'icon-ok-circle',
            width: 80,
            disabled:true,
            divider: contrail.checkIfExist(divider) ? divider : false,
            onClick: onClickFunction
        };
    };

    function getAlertHistoryAction (onClickFunction, divider) {
        return {
            title: cowl.TITLE_ALARM_HISTORY,
            iconClass: 'icon-th',
            width: 80,
            divider: contrail.checkIfExist(divider) ? divider : false,
            onClick: onClickFunction
        };
    };

    function alarmsGridFilter(item, args) {
        if (args.checkedRows.length == 0) {
            return true;
        } else {
            var returnObj = {},
                returnFlag = true;
            $.each(args.checkedRows, function (checkedRowKey, checkedRowValue) {
                var checkedRowValueObj = $.parseJSON(unescape($(checkedRowValue).val()));
                if(!contrail.checkIfExist(returnObj[checkedRowValueObj.parent])){
                    returnObj[checkedRowValueObj.parent] = false;
                }
                returnObj[checkedRowValueObj.parent] = returnObj[checkedRowValueObj.parent] || (item[checkedRowValueObj.parent] == checkedRowValueObj.value);
            });

            $.each(returnObj, function(returnObjKey, returnObjValue) {
                returnFlag = returnFlag && returnObjValue;
            });

            return returnFlag;
        }
    };

    function applyAlarmsFilter(event, ui) {
        var checkedRows = $('#alarmsFilterMultiselect').data('contrailCheckedMultiselect').getChecked();
        var gridElId = '#' + cowl.ALARMS_GRID_ID;
        $(gridElId).data('contrailGrid')._dataView.setFilterArgs({
            checkedRows: checkedRows
        });
        $(gridElId).data('contrailGrid')._dataView.setFilter(alarmsGridFilter);
    };

    function getAlarmDetailsTemplateConfig() {
        return {
            templateGenerator: 'RowSectionTemplateGenerator',
            templateGeneratorConfig: {
                rows: [
                    {
                        templateGenerator: 'ColumnSectionTemplateGenerator',
                        templateGeneratorConfig: {
                            columns: [
                                {
                                    class: 'row-fluid',
                                    rows: [
                                        {
                                            title: cowl.TITLE_ALARM_DETAILS,
                                            templateGenerator: 'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    key: 'severity',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'alarmSeverityFormatter'
                                                    }
                                                },
                                                {
                                                    key: 'timestamp',
                                                    templateGenerator: 'TextGenerator',
                                                    templateGeneratorConfig: {
                                                        formatter: 'timestampFormatter'
                                                    }
                                                },
                                                {
                                                    key: 'type',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'display_name',
                                                    label:'Source',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'status',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'alarm_detailed',
                                                    label:'Alarm',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'rawJson.any_of',
                                                    label:'',
                                                    templateGenerator: 'json'
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            }
        };
    };

    this.alarmSeverityFormatter = function (v, dc) {
        var cirle;
        if(v == 3) {
            circle = '<div data-color="red" class="circle red filled alarms-circle-grid-style"></div>';
        } else if (v == 4) {
            circle = '<div data-color="orange" class="circle orange filled alarms-circle-grid-style"></div>';
        }
        return circle;
    }

    this.timestampFormatter = function (v, dc) {
        return getFormattedDate(v/1000);
    }
    return AlarmGridView;
});

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

//            var alarmURL = getAlarmURL(viewConfig);
//            var alarmRemoteConfig = {
//                url: alarmURL,
//                type: 'GET'
//            };

            var remoteAjaxConfig = {
                    remote: {//TODO need to verify if the pagination is actually working
                        ajaxConfig: {
                            url: getAlarmURL(viewConfig),
                            type: "GET",
                        },
                        dataParser: function(response) {
                            if(viewConfig == null || viewConfig.nodeType == null) {
                                return coreAlarmUtils.alarmDataParser(response);
                            }
                            return parseAlarmInfo(response,viewConfig);
                        }
                    },
                    cacheConfig: {
                    }
            }
            var contrailListModel = new ContrailListModel(remoteAjaxConfig);

            // TODO: Handle multi-tenancy
            //var ucid = projectFQN != null ? (ctwc.UCID_PREFIX_MN_LISTS + projectFQN + ":virtual-networks") : ctwc.UCID_ALL_VN_LIST;

           /* self.renderView4Config(self.$el, contrailListModel, getAlarmGridViewConfig(),
                                    null,null,null,
                                    function() {
                                        //inialize the severity dropdown
//                                         $('#ddSeverity').contrailDropdown({
//                                             dataTextField: 'text',
//                                             dataValueField: 'value',
//                                             change: onSeverityChanged
//                                         });
//                                         var ddSeverity = $('#ddSeverity').data('contrailDropdown');
//                                         ddSeverity.setData([{text: 'All', value: 'all'}, {text: 'Major', value: '3'}, {text: 'Minor', value: '4'}]);
//                                         ddSeverity.value('all');
//                                        GridDS = $('#' + ctwl.ALARMS_GRID_ID).data('contrailGrid')._dataView.getItems()
                                    });*/
            self.renderView4Config(self.$el, contrailListModel, getAlarmGridViewConfig());
        }
    });

    function parseAlarmInfo (response, viewConfig) {
      //TODO check why monitorInfraConstants is not intialized
        try {
            if(monitorInfraConstants == undefined || monitorInfraConstants == null) {
                return coreAlarmUtils.alarmDataParser(response);
            }
        } catch (e) {
            return coreAlarmUtils.alarmDataParser(response);
        }
        var nodeType = viewConfig['nodeType'],
            hostname = viewConfig['hostname'];
        var alarmsObj = {};
        switch (nodeType) {

            case monitorInfraConstants.CONTROL_NODE:
                if(response.UVEAlarms != null){
                    alarmsObj =  wrapUVEAlarms('control-node',hostname,response.UVEAlarms);
                }
                break;

            case monitorInfraConstants.COMPUTE_NODE:
                if(response != null && response.UVEAlarms != null) {
                    alarmsObj =  wrapUVEAlarms('vrouter',hostname,response.UVEAlarms);
                }
                break;

            case monitorInfraConstants.ANALYTICS_NODE:
                if(response != null && response.UVEAlarms != null) {
                    alarmsObj =  wrapUVEAlarms('analytics-node',hostname,response.UVEAlarms);
                }
                break;

            case monitorInfraConstants.CONFIG_NODE:
                if(response != null && response.configNode != null && response.configNode.UVEAlarms != null) {
                    alarmsObj =  wrapUVEAlarms('config-node',hostname,response.configNode.UVEAlarms);
                }
                break;

            case monitorInfraConstants.DATABASE_NODE:
                if(response != null && response.databaseNode != null && response.databaseNode.UVEAlarms != null) {
                    alarmsObj =  wrapUVEAlarms('database-node',hostname,response.databaseNode.UVEAlarms);
                }
                break;

        }

        return coreAlarmUtils.alarmDataParser (alarmsObj);
    }

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

    function getAlarmURL(viewConfig){
        if(viewConfig == null) {
            return ctwc.get(ctwc.URL_ALARM_DETAILS_IN_CHUNKS, 50, $.now());
        }

        //TODO check why monitorInfraConstants is not intialized
        try {
            if(monitorInfraConstants == undefined || monitorInfraConstants == null) {
                return ctwc.get(ctwc.URL_ALARM_DETAILS_IN_CHUNKS, 50, $.now());
            }
        } catch (e) {
            return ctwc.get(ctwc.URL_ALARM_DETAILS_IN_CHUNKS, 50, $.now());
        }
        var nodeType = viewConfig['nodeType'],
            hostname = viewConfig['hostname'];
        switch (nodeType) {

            case monitorInfraConstants.CONTROL_NODE:
                return contrail.format(
                        monitorInfraConstants.
                        monitorInfraUrls['CONTROLNODE_DETAILS'],
                    hostname);

            case monitorInfraConstants.COMPUTE_NODE:
                return contrail.format(monitorInfraConstants.
                        monitorInfraUrls['VROUTER_DETAILS'],
                        hostname,true);

            case monitorInfraConstants.ANALYTICS_NODE:
                return contrail.format(
                        monitorInfraConstants.
                        monitorInfraUrls['ANALYTICS_DETAILS'], hostname);

            case monitorInfraConstants.CONFIG_NODE:
                return contrail.format(
                        monitorInfraConstants.
                        monitorInfraUrls['CONFIG_DETAILS'], hostname);

            case monitorInfraConstants.DATABASE_NODE:
                return contrail.format(
                        monitorInfraConstants.
                        monitorInfraUrls['DATABASE_DETAILS'], hostname);

            default :
                return ctwc.get(ctwc.URL_ALARM_DETAILS_IN_CHUNKS, 50, $.now());
        }
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
        var gridAlarms = $('#' + ctwl.ALARMS_GRID_ID).data('contrailGrid');
        gridAlarms._dataView.setData(filterdDS)
    }

    var getAlarmGridViewConfig = function () {
        return {
            elementId: cowu.formatElementId([ctwl.MONITOR_ALARM_LIST_VIEW_ID]),
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwl.ALARMS_GRID_ID,
                                title: ctwl.TITLE_ALARMS,
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
                                  minWidth: 30,
                                  searchFn: function (d) {
                                      return d['severity'];
                                  },
                                  searchable: true,
                                  formatter : function (r, c, v, cd, dc) {
                                      var formattedDiv;
                                      if(dc['ack']) {
                                          if(dc['severity'] === 4) {
                                              formattedDiv = '<div data-color="orange" class="circle orange" style="opacity:1"></div>';
                                          } else if (dc['severity'] === 3) {
                                              formattedDiv = '<div data-color="red" class="circle red" style="opacity:1"></div>';
                                          }
                                      } else {
                                          if(dc['severity'] === 3) {
                                              formattedDiv = '<div data-color="red" class="circle red filled" style="opacity:1"></div>';
                                          } else if (dc['severity'] === 4) {
                                              formattedDiv = '<div data-color="orange" class="circle orange filled" style="opacity:1"></div>';
                                          }
                                      }
                                      return formattedDiv;
                                  }
                              },
                              {
                                  field: 'timestamp',
                                  name: 'Time',
                                  minWidth: 50
                              },
                              {
                                  field: 'alarm_msg',
                                  name: 'Alarm',
                                  minWidth: 250,
//                                  formatter : function (r, c, v, cd, dc) {
//                                      return dc.description[0].rule;
//                                  }
                              },
                              {
                                  field: 'display_name',
                                  name: 'Source',
                                  minWidth: 100
                              }
                          ];
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_ALARMS_SUMMARY
                },
                defaultControls: {
                    collapseable: false,
                    exportable: true,
                    refreshable: true,
                    searchable: true
                },
//                customControls: ['<a id="btnAcknowledge" class="disabled-link" title="Acknowledge"><i class="  icon-check-sign"></i></a>', 
//                                 '<div data-color="red" class="circle red" style="opacity:1" onclick=""></div>',
//                                 '<div data-color="orange" class="circle orange" style="opacity:1"></div>',
//                                 '<div data-color="red" class="circle red filled" style="opacity:1"></div>',
//                                 '<div data-color="orange" class="circle orange filled" style="opacity:1"></div>']
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
                    actionCell: getRowActionConfig,
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

    function getRowActionConfig(rowData) {
        var ret = [];
        var dataView = $('#' + ctwl.ALARMS_GRID_ID).data("contrailGrid")._dataView;
        if(!rowData.ack) {
            ret.push(ctwgc.getAcknowledgeAction(function (rowIndex) {
                alarmsEditView.model = new AlarmsModel();
                alarmsEditView.renderAckAlarms  ({
                                      "title": 'Acknowledge Alarms',
                                      checkedRows: [dataView.getItem(rowIndex)],
                                      callback: function () {
                                          dataView.refreshData();
                                          $('#' + ctwl.ALARMS_GRID_ID).data("contrailGrid").refreshView();
                                      }
                    });
                })
            );
        }
        return ret;
    };

    function getHeaderActionConfig() {
        var headerActionConfig = [
            {
                "type": "link",
                "title": 'Acknowledge',
                "linkElementId": "btnAcknowledge",
                "iconClass": "icon-check-sign",
                "onClick": function () {
                    var gridElId = '#' + ctwl.ALARMS_GRID_ID;
                    var checkedRows = $(gridElId).data("contrailGrid").getCheckedRows();
                    alarmsEditView.model = new AlarmsModel();
                    alarmsEditView.renderAckAlarms  ({
                                          "title": 'Acknowledge Alarms',
                                          checkedRows:checkedRows,
                                          callback: function () {
                                              $('#' + ctwl.ALARMS_GRID_ID).data("contrailGrid").refreshData();
                                          }
                        });
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
//                    parse: formatData4Ajax,
                    minWidth: 150,
                    height: 205,
//                    emptyOptionText: 'No Tags found.',
//                    dataSource: {
//                        type: 'GET',
//                        url: smwu.getTagsUrl(queryString)
//                    },
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
        var gridElId = '#' + ctwl.ALARMS_GRID_ID;
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
                                            title: ctwl.TITLE_ALARM_DETAILS,
                                            templateGenerator: 'BlockListTemplateGenerator',
                                            templateGeneratorConfig: [
                                                {
                                                    key: 'severity',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'timestamp',
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
                                                },
                                                {
                                                    key: 'type',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'name',
                                                    templateGenerator: 'TextGenerator'
                                                },
                                                {
                                                    key: 'status',
                                                    templateGenerator: 'TextGenerator'
                                                }
//                                                {
//                                                    key: 'ack',
//                                                    label:'Acknowledged'
//                                                    templateGenerator: 'TextGenerator'
//                                                },
                                                // {
                                                // key: 'description',
                                                // templateGenerator: 'TextGenerator'
                                                // }
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

    return AlarmGridView;
});

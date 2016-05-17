/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var QEGridConfig = function () {
        this.getColumnDisplay4Grid = function(tableName, tableType, selectArray) {
            var newColumnDisplay = [], columnDisplaySelect,
                columnDisplay = getColumnDisplay4Query(tableName, tableType);

            $.each(columnDisplay, function(columnKey, columnValue){
                if (selectArray.indexOf(columnValue.select) != -1) {
                    if (_.isUndefined(columnValue.display.formatter)) {
                        columnValue.display.formatter = {
                            format: cowc.QUERY_COLUMN_FORMATTER[columnValue.select]
                        };
                    }
                    newColumnDisplay.push(columnValue.display);
                }
            });

            columnDisplaySelect = $.map(columnDisplay, function(selectValue, selectKey) {
                return selectValue.select;
            });

            $.each(selectArray, function(selectKey, selectValue) {
                if(columnDisplaySelect.indexOf(selectValue) == -1) {
                    var columnName = selectValue;
                    newColumnDisplay.push({
                        id: selectValue, field: selectValue,
                        name: columnName,
                        width: columnName.length * 8,  groupable:false,
                        formatter: {
                            format: cowc.QUERY_COLUMN_FORMATTER[selectValue]
                        }
                    })
                }

            });

            return newColumnDisplay;
        };

        this.getColumnDisplay4ChartGroupGrid = function(tableName, tableType, selectArray) {
            var newColumnDisplay = [], columnDisplaySelect,
                columnDisplay = getColumnDisplay4Query(tableName, tableType);

            $.each(columnDisplay, function(columnKey, columnValue){
                if (selectArray.indexOf(columnValue.select) != -1 && !qewu.isAggregateField(columnValue.select) && columnValue.select !== 'T' && columnValue.select !== 'T=' && columnValue.select !== 'UUID') {
                    if (_.isUndefined(columnValue.display.formatter)) {
                        columnValue.display.formatter = {
                            format: cowc.QUERY_COLUMN_FORMATTER[columnValue.select]
                        };
                    }
                    newColumnDisplay.push(columnValue.display);
                }
            });

            columnDisplaySelect = $.map(columnDisplay, function(selectValue, selectKey) {
                return selectValue.select;
            });

            $.each(selectArray, function(selectKey, selectValue) {
                if(columnDisplaySelect.indexOf(selectValue) == -1 && !qewu.isAggregateField(selectValue) &&
                    selectValue !== 'T' && selectValue !== 'T=' && selectValue !== 'UUID' &&
                    (selectValue.indexOf("PERCENTILES(") == -1)) {
                    var columnName = selectValue;
                    newColumnDisplay.push({
                        id: selectValue, field: selectValue,
                        name: columnName,
                        width: columnName.length * 8,  groupable:false,
                        formatter: {
                            format: cowc.QUERY_COLUMN_FORMATTER[selectValue]
                        }
                    })
                }

            });

            return newColumnDisplay;
        };

        this.getQueueColumnDisplay = function(viewQueryResultCB) {
            return [
                {
                    id: 'fqq-badge', field: "", name: "", resizable: false, sortable: false,
                    width: 30, width: 30, searchable: false, exportConfig: {allow: false},
                    allowColumnPickable: false,
                    formatter: function (r, c, v, cd, dc) {
                        if(dc.status === 'completed') {
                            var queryId = dc.queryReqObj.queryId,
                                tabLinkId = cowl.QE_QUERY_QUEUE_RESULT_GRID_TAB_ID + '-' + queryId + '-tab-link',
                                labelIconBadgeClass = '';

                            if ($('#' + tabLinkId).length > 0) {
                                labelIconBadgeClass = 'icon-queue-badge-color-' + $('#' + tabLinkId).data('badge_color_key');
                            }

                            return '<span id="label-icon-badge-' + queryId + '" class="label-icon-badge label-icon-badge-queue ' + labelIconBadgeClass + '"><i class="icon-sign-blank"></i></span>';
                        }
                    },
                    events: {
                        onClick: function (e, dc) {
                            viewQueryResultCB(dc);
                        }
                    }
                },
                {
                    id:"startTime", field:"startTime", name:"Time Issued", width: 140,
                    formatter: {
                        format: 'date',
                        options: {formatSpecifier: 'llll'}
                    }
                },
                {
                    id:"table_name", field:"", name:"Table Name", width: 200, sortable:false,
                    formatter: function(r, c, v, cd, dc) {
                        return dc.queryReqObj.formModelAttrs.table_name;
                    }
                },
                {
                    id:"time_range", field:"time_range", name:"Time Range", width: 100, sortable:false,
                    formatter: {
                        format: 'query-time-range',
                        path: 'queryReqObj.formModelAttrs.time_range'
                    }
                },
                {
                    id:"fromTime", field:"fromTime", name:"From Time", width: 140,
                    formatter: {
                        format: 'date',
                        path: 'queryReqObj.formModelAttrs.from_time_utc',
                        options: {
                            formatSpecifier: 'lll'
                        }
                    }
                },
                {
                    id:"toTime", field:"toTime", name:"To Time", width: 140,
                    formatter: {
                        format: 'date',
                        path: 'queryReqObj.formModelAttrs.to_time_utc',
                        options: {
                            formatSpecifier: 'lll'
                        }
                    }
                },
                { id:"progress", field:"progress", name:"Progress", width:75, formatter: function(r, c, v, cd, dc) { return (dc.status != 'error' && dc.progress != '' && parseInt(dc.progress) > 0) ? (dc.progress + '%') : '-'; } },
                {   id:"count", field:"count", name:"Records", width:75,
                    formatter: {
                        format: 'number'
                    }
                },
                { id:"status", field:"status", name:"Status", width:90 },
                {
                    id:"timeTaken", field:"timeTaken", name:"Time Taken", width:100, sortable:true,
                    formatter: {
                        format:'time-period'
                    }
                }
            ];
        };

        this.getOnClickFlowRecord = function(parentView, queryFormAttributes) {
            return function (e, selRowDataItem) {
                var elementId = parentView.$el,
                    flowRecordDetailsConfig = {
                        elementId: cowl.QE_FLOW_DETAILS_TAB_VIEW__ID,
                        view: "FlowDetailsTabView",
                        viewPathPrefix: "reports/qe/ui/js/views/",
                        app: cowc.APP_CONTRAIL_CONTROLLER,
                        viewConfig: {
                            className: 'modal-980',
                            queryFormAttributes: queryFormAttributes,
                            selectedFlowRecord: selRowDataItem
                        }
                    };

                parentView.renderView4Config(elementId, null, flowRecordDetailsConfig);
            }
        };

        this.getOnClickSessionAnalyzer = function(clickOutView, queryId, queryFormAttributes, elementId) {
            return function (e, targetElement, selRowDataItem) {
                var elementId = $(elementId),
                    saElementId = cowl.QE_SESSION_ANALYZER_VIEW_ID + '-' + queryId + '-' + selRowDataItem.cgrid,
                    sessionAnalyzerConfig = {
                        elementId: saElementId,
                        title: cowl.TITLE_SESSION_ANALYZER,
                        iconClass: 'icon-bar-chart',
                        app: cowc.APP_CONTRAIL_CONTROLLER,
                        viewPathPrefix: "controller-basedir/reports/qe/ui/js/views/",
                        view: "SessionAnalyzerView",
                        tabConfig: {
                            removable: true,
                        },
                        viewConfig: {
                            queryType: cowc.QUERY_TYPE_ANALYZE,
                            flowRecordQueryId: queryId,
                            queryFormAttributes: queryFormAttributes,
                            selectedFlowRecord: selRowDataItem
                        }
                    };
                clickOutView.renderSessionAnalyzer(elementId, sessionAnalyzerConfig);
            }
        };

        this.setAnalyzerIconFormatter = function(r, c, v, cd, dc) {
            return '<i class="icon-external-link-sign" title="Analyze Session"></i>';
        };

        //this.setSessionAnalyzerOnClick = function(parentView, queryFormAttributes, elementId) {
        //    return function(e, selRowDataItem) {
        //        if (qewu.enableSessionAnalyzer(selRowDataItem)) {
        //            this.getOnClickSessionAnalyzer(parentView, queryFormAttributes, elementId)(e, selRowDataItem);
        //        }
        //    };
        //};

        this.getQueryGridConfig = function(remoteConfig, gridColumns, gridOptions) {
            return {
                header: {
                    title: {
                        text: gridOptions.titleText
                    },
                    defaultControls: {
                        collapseable: true,
                        refreshable: false,
                        columnPickable: true
                    }
                },
                body: {
                    options: {
                        checkboxSelectable: false,
                        fixedRowHeight: contrail.checkIfExist(gridOptions.fixedRowHeight) ? gridOptions.fixedRowHeight : 30,
                        forceFitColumns: false,
                        defaultDataStatusMessage: false,
                        actionCell: contrail.checkIfExist(gridOptions.actionCell) ? gridOptions.actionCell : false,
                        actionCellPosition: contrail.checkIfExist(gridOptions.actionCellPosition) ? gridOptions.actionCellPosition : 'end'
                    },
                    dataSource: {
                        remote: {
                            ajaxConfig: remoteConfig,
                            dataParser: function (response) {
                                return response['data'];
                            }
                        }
                    },
                    statusMessages: {
                        queued: {
                            type: 'status',
                            iconClasses: '',
                            text: cowm.getQueryQueuedMessage(gridOptions.queryQueueUrl, gridOptions.queryQueueTitle)
                        },
                        loading: {
                             text: 'Loading Results..',
                         },
                         empty: {
                             text: 'No Results Found.'
                         }
                    }
                },
                columnHeader: {
                    columns: gridColumns
                }
            };
        }
    };

    function getColumnDisplay4Query(tableName, tableType) {
        if(tableType == cowc.QE_STAT_TABLE_TYPE) {
            return columnDisplayMap["defaultStatColumns"].concat(contrail.checkIfExist(columnDisplayMap[tableName]) ? columnDisplayMap[tableName] : []);
        } else if (tableType == cowc.QE_OBJECT_TABLE_TYPE) {
            return columnDisplayMap["defaultObjectColumns"].concat(contrail.checkIfExist(columnDisplayMap[tableName]) ? columnDisplayMap[tableName] : []);
        } else {
            return contrail.checkIfExist(columnDisplayMap[tableName]) ? columnDisplayMap[tableName] : []
        }
    };

    var columnDisplayMap  = {
        "FlowSeriesTable": [
            {select:"T", display:{id:"T", field:"T", width:210, name:"Time", filterable:false, groupable:false}},
            {select:"T=", display:{id:"T", field:"T", width:210, name:"Time", filterable:false, groupable:false}},
            {select:"vrouter", display:{id:"vrouter",field:"vrouter", width:100, name:"Virtual Router", groupable:false}},
            {select:"sourcevn", display:{id:"sourcevn",field:"sourcevn", width:240, name:"Source VN", groupable:false}},
            {select:"destvn", display:{id:"destvn", field:"destvn", width:240, name:"Destination VN", groupable:false}},
            {select:"sourceip", display:{id:"sourceip", field:"sourceip", width:100, name:"Source IP", groupable:false}},
            {select:"destip", display:{id:"destip", field:"destip", width:120, name:"Destination IP", groupable:false}},
            {select:"sport", display:{id:"sport", field:"sport", width:100, name:"Source Port", groupable:false}},
            {select:"dport", display:{id:"dport", field:"dport", width:130, name:"Destination Port", groupable:false}},
            {select:"direction_ing", display:{id:"direction_ing", field:"direction_ing", width:100, name:"Direction", groupable:true}},
            {select:"protocol", display:{id:"protocol", field:"protocol", width:100, name:"Protocol", groupable:true}},
            {select:"bytes", display:{id:"bytes", field:"bytes", width:120, name:"Bytes", groupable:false}},
            {select:"sum(bytes)", display:{id:"sum(bytes)", field:"sum(bytes)", width:100, name:"SUM (Bytes)", groupable:false}},
            {select:"avg(bytes)", display:{id:"avg(bytes)", field:"avg(bytes)", width:100, name:"AVG (Bytes)", groupable:false}},
            {select:"packets", display:{id:"packets", field:"packets", width:100, name:"Packets", groupable:false}},
            {select:"sum(packets)", display:{id:"sum(packets)", field:"sum(packets)", width:120, name:"SUM (Packets)", groupable:false}},
            {select:"avg(packets)", display:{id:"avg(packets)", field:"avg(packets)", width:120, name:"AVG (Packets)", groupable:false}},
            {select:"flow_count", display:{id:"flow_count", field:"flow_count", width:120, name:"Flow Count", groupable:false}}
        ],
        "FlowRecordTable": [
            {select:"action", display:{id:"action", field:"action", width:60, name:"Action", groupable:true}},
            {select:"setup_time", display:{id:"setup_time", field:"setup_time", width:210, name:"Setup Time", filterable:false, groupable:false}},
            {select:"teardown_time", display:{id:"teardown_time", field:"teardown_time", width:210, name:"Teardown Time", filterable:false, groupable:false}},
            {select:"vrouter", display:{id:"vrouter", field:"vrouter", width:100, name:"Virtual Router", groupable:false}},
            {select:"vrouter_ip", display:{id:"vrouter_ip", field:"vrouter_ip", width:120, name:"Virtual Router IP", groupable:true}},
            {select:"other_vrouter_ip", display:{id:"other_vrouter_ip", field:"other_vrouter_ip", width:170, name:"Other Virtual Router IP", groupable:true}},
            {select:"sourcevn", display:{id:"sourcevn", field:"sourcevn", width:240, name:"Source VN", groupable:true}},
            {select:"destvn", display:{id:"destvn", field:"destvn", width:240, name:"Destination VN", groupable:true}},
            {select:"sourceip", display:{id:"sourceip", field:"sourceip", width:100, name:"Source IP", groupable:true}},
            {select:"destip", display:{id:"destip", field:"destip", width:120, name:"Destination IP", groupable:true}},
            {select:"sport", display:{id:"sport", field:"sport", width:100, name:"Source Port", groupable:true}},
            {select:"dport", display:{id:"dport", field:"dport", width:130, name:"Destination Port", groupable:true}},
            {select:"direction_ing", display:{id:"direction_ing", field:"direction_ing", width:100, name:"Direction", groupable:true}},
            {select:"protocol", display:{id:"protocol", field:"protocol", width:100, name:"Protocol", groupable:true}},
            {select:"underlay_proto", display:{id:"underlay_proto", field:"underlay_proto", width:150, name:"Underlay Protocol", groupable:true}},
            {select:"underlay_source_port", display:{id:"underlay_source_port", field:"underlay_source_port", width:150, name:"Underlay Source Port", groupable:true}},
            {select:"UuidKey", display:{id:"UuidKey", field:"UuidKey", width:280, name:"UUID", groupable:true}},
            {select:"sg_rule_uuid", display:{id:"sg_rule_uuid", field:"sg_rule_uuid", width:280, name:"Rule UUID", groupable:true}},
            {select:"nw_ace_uuid", display:{id:"nw_ace_uuid", field:"nw_ace_uuid", width:280, name:"Network UUID", groupable:true}},
            {select:"agg-bytes", display:{id:"agg-bytes", field:"agg-bytes", width:120, name:"Aggregate Bytes",  groupable:false}},
            {select:"agg-packets", display:{id:"agg-packets", field:"agg-packets", width:140, name:"Aggregate Packets",  groupable:false}},
            {select:"vmi_uuid", display:{id:"vmi_uuid", field:"vmi_uuid", width:140, name:"VMI UUID",  groupable:false}},
            {select:"drop_reason", display:{id:"drop_reason", field:"drop_reason", width:140, name:"Drop Reason",  groupable:false}}
        ],
        "StatTable.AnalyticsCpuState.cpu_info" : [
            {select:"cpu_info.module_id", display:{id:'cpu_info.module_id', field:'cpu_info.module_id', width:150, name:"Module Id", groupable:false}},
            {select:"cpu_info.inst_id", display:{id:'cpu_info.inst_id', field:'cpu_info.inst_id', width:150, name:"Instance Id", groupable:false}},
            {select:"COUNT(cpu_info)", display:{id:'COUNT(cpu_info)', field:'COUNT(cpu_info)', width:120, name:"Count (CPU Info)", groupable:false}},

            {select:"cpu_info.mem_virt", display:{id:'cpu_info.mem_virt', field:'cpu_info.mem_virt', width:150, name:"Virtual Memory", groupable:false}},
            {select:"SUM(cpu_info.mem_virt)", display:{id:'SUM(cpu_info.mem_virt)', field:'SUM(cpu_info.mem_virt)', width:150, name:"SUM (Virtual Memory)", groupable:false}},
            {select:"MIN(cpu_info.mem_virt)", display:{id:'MIN(cpu_info.mem_virt)', field:'MIN(cpu_info.mem_virt)', width:150, name:"MIN (Virtual Memory)", groupable:false}},
            {select:"MAX(cpu_info.mem_virt)", display:{id:'MAX(cpu_info.mem_virt)', field:'MAX(cpu_info.mem_virt)', width:150, name:"MAX (Virtual Memory)", groupable:false}},

            {select:"cpu_info.cpu_share", display:{id:'cpu_info.cpu_share', field:'cpu_info.cpu_share', width:120, name:"CPU Share", groupable:false}},
            {select:"SUM(cpu_info.cpu_share)", display:{id:'SUM(cpu_info.cpu_share)', field:'SUM(cpu_info.cpu_share)', width:150, name:"SUM (CPU Share)", groupable:false}},
            {select:"MIN(cpu_info.cpu_share)", display:{id:'MIN(cpu_info.cpu_share)', field:'MIN(cpu_info.cpu_share)', width:150, name:"MIN (CPU Share)", groupable:false}},
            {select:"MAX(cpu_info.cpu_share)", display:{id:'MAX(cpu_info.cpu_share)', field:'MAX(cpu_info.cpu_share)', width:150, name:"MAX (CPU Share)", groupable:false}},

            {select:"cpu_info.mem_res", display:{id:'cpu_info.mem_res', field:'cpu_info.mem_res', width:170, name:"CPU Resident Mem", groupable:false}},
            {select:"SUM(cpu_info.mem_res)", display:{id:'SUM(cpu_info.mem_res)', field:'SUM(cpu_info.mem_res)', width:190, name:"SUM (CPU Resident Mem)", groupable:false}},
            {select:"MIN(cpu_info.mem_res)", display:{id:'MIN(cpu_info.mem_res)', field:'MIN(cpu_info.mem_res)', width:190, name:"MIN (CPU Resident Mem)", groupable:false}},
            {select:"MAX(cpu_info.mem_res)", display:{id:'MAX(cpu_info.mem_res)', field:'MAX(cpu_info.mem_res)', width:190, name:"MAX (CPU Resident Mem)", groupable:false}}
        ],
        "StatTable.ConfigCpuState.cpu_info" : [
            {select:"cpu_info.module_id", display:{id:'cpu_info.module_id', field:'cpu_info.module_id', width:150, name:"Module Id", groupable:false}},
            {select:"cpu_info.inst_id", display:{id:'cpu_info.inst_id', field:'cpu_info.inst_id', width:150, name:"Instance Id", groupable:false}},
            {select:"COUNT(cpu_info)", display:{id:'COUNT(cpu_info)', field:'COUNT(cpu_info)', width:120, name:"Count (CPU Info)", groupable:false}},
            {select:"cpu_info.mem_virt", display:{id:'cpu_info.mem_virt', field:'cpu_info.mem_virt', width:150, name:"Virtual Memory", groupable:false}},
            {select:"SUM(cpu_info.mem_virt)", display:{id:'SUM(cpu_info.mem_virt)', field:'SUM(cpu_info.mem_virt)', width:150, name:"SUM (Virtual Memory)", groupable:false}},
            {select:"MIN(cpu_info.mem_virt)", display:{id:'MIN(cpu_info.mem_virt)', field:'MIN(cpu_info.mem_virt)', width:150, name:"MIN (Virtual Memory)", groupable:false}},
            {select:"MAX(cpu_info.mem_virt)", display:{id:'MAX(cpu_info.mem_virt)', field:'MAX(cpu_info.mem_virt)', width:150, name:"MAX (Virtual Memory)", groupable:false}},

            {select:"cpu_info.cpu_share", display:{id:'cpu_info.cpu_share', field:'cpu_info.cpu_share', width:150, name:"CPU Share", groupable:false}},
            {select:"SUM(cpu_info.cpu_share)", display:{id:'SUM(cpu_info.cpu_share)', field:'SUM(cpu_info.cpu_share)', width:150, name:"SUM (CPU Share)", groupable:false}},
            {select:"MIN(cpu_info.cpu_share)", display:{id:'MIN(cpu_info.cpu_share)', field:'MIN(cpu_info.cpu_share)', width:150, name:"MIN (CPU Share)", groupable:false}},
            {select:"MAX(cpu_info.cpu_share)", display:{id:'MAX(cpu_info.cpu_share)', field:'MAX(cpu_info.cpu_share)', width:150, name:"MAX (CPU Share)", groupable:false}},

            {select:"cpu_info.mem_res", display:{id:'cpu_info.mem_res', field:'cpu_info.mem_res', width:170, name:"CPU Resident Mem", groupable:false}},
            {select:"SUM(cpu_info.mem_res)", display:{id:'SUM(cpu_info.mem_res)', field:'SUM(cpu_info.mem_res)', width:190, name:"SUM (CPU Resident Mem)", groupable:false}},
            {select:"MIN(cpu_info.mem_res)", display:{id:'MIN(cpu_info.mem_res)', field:'MIN(cpu_info.mem_res)', width:190, name:"MIN (CPU Resident Mem)", groupable:false}},
            {select:"MAX(cpu_info.mem_res)", display:{id:'MAX(cpu_info.mem_res)', field:'MAX(cpu_info.mem_res)', width:190, name:"MAX (CPU Resident Mem)", groupable:false}}
        ],
        "StatTable.ControlCpuState.cpu_info" : [
            {select:"COUNT(cpu_info)", display:{id:'COUNT(cpu_info)', field:'COUNT(cpu_info)', width:120, name:"Count (CPU Info)", groupable:false}},
            {select:"cpu_info.mem_virt", display:{id:'cpu_info.mem_virt', field:'cpu_info.mem_virt', width:120, name:"Virtual Memory", groupable:false}},
            {select:"SUM(cpu_info.mem_virt)", display:{id:'SUM(cpu_info.mem_virt)', field:'SUM(cpu_info.mem_virt)', width:150, name:"SUM (Virtual Memory)", groupable:false}},
            {select:"MIN(cpu_info.mem_virt)", display:{id:'MIN(cpu_info.mem_virt)', field:'MIN(cpu_info.mem_virt)', width:150, name:"MIN (Virtual Memory)", groupable:false}},
            {select:"MAX(cpu_info.mem_virt)", display:{id:'MAX(cpu_info.mem_virt)', field:'MAX(cpu_info.mem_virt)', width:150, name:"MAX (Virtual Memory)", groupable:false}},

            {select:"cpu_info.cpu_share", display:{id:'cpu_info.cpu_share', field:'cpu_info.cpu_share', width:120, name:"CPU Share", groupable:false}},
            {select:"SUM(cpu_info.cpu_share)", display:{id:'SUM(cpu_info.cpu_share)', field:'SUM(cpu_info.cpu_share)', width:120, name:"SUM (CPU Share)", groupable:false}},
            {select:"MIN(cpu_info.cpu_share)", display:{id:'MIN(cpu_info.cpu_share)', field:'MIN(cpu_info.cpu_share)', width:120, name:"MIN (CPU Share)", groupable:false}},
            {select:"MAX(cpu_info.cpu_share)", display:{id:'MAX(cpu_info.cpu_share)', field:'MAX(cpu_info.cpu_share)', width:120, name:"MAX (CPU Share)", groupable:false}},

            {select:"cpu_info.mem_res", display:{id:'cpu_info.mem_res', field:'cpu_info.mem_res', width:170, name:"CPU Resident Mem", groupable:false}},
            {select:"SUM(cpu_info.mem_res)", display:{id:'SUM(cpu_info.mem_res)', field:'SUM(cpu_info.mem_res)', width:190, name:"SUM (CPU Resident Mem)", groupable:false}},
            {select:"MIN(cpu_info.mem_res)", display:{id:'MIN(cpu_info.mem_res)', field:'MIN(cpu_info.mem_res)', width:190, name:"MIN (CPU Resident Mem)", groupable:false}},
            {select:"MAX(cpu_info.mem_res)", display:{id:'MAX(cpu_info.mem_res)', field:'MAX(cpu_info.mem_res)', width:190, name:"MAX (CPU Resident Mem)", groupable:false}},

            {select:"cpu_info.inst_id", display:{id:'cpu_info.inst_id', field:'cpu_info.inst_id', width:120, name:"Instance Id", groupable:false}},
            {select:"cpu_info.module_id", display:{id:'cpu_info.module_id', field:'cpu_info.module_id', width:150, name:"Module Id", groupable:false}}

        ],
        "StatTable.PRouterEntry.ifStats" : [
            {select:"COUNT(ifStats)", display:{id:'COUNT(ifStats)', field:'COUNT(Stats)', width:120, name:"Count (Intf Stats)", groupable:false}},
            {select:"ifStats.ifInUcastPkts", display:{id:'ifStats.ifInUcastPkts', field:'ifStats.ifInUcastPkts', width:120, name:"In Unicast Pkts", groupable:false}},
            {select:"SUM(ifStats.ifInUcastPkts)", display:{id:'SUM(ifStats.ifInUcastPkts)', field:'SUM(ifStats.ifInUcastPkts)', width:160, name:"SUM (In Unicast Pkts)", groupable:false}},
            {select:"MAX(ifStats.ifInUcastPkts)", display:{id:'MAX(ifStats.ifInUcastPkts)', field:'MAX(ifStats.ifInUcastPkts)', width:160, name:"MAX (In Unicast Pkts)", groupable:false}},
            {select:"MIN(ifStats.ifInUcastPkts)", display:{id:'MIN(ifStats.ifInUcastPkts)', field:'MIN(ifStats.ifInUcastPkts)', width:160, name:"MIN (In Unicast Pkts)", groupable:false}},

            {select:"ifStats.ifInMulticastPkts", display:{id:'ifStats.ifInMulticastPkts', field:'ifStats.ifInMulticastPkts', width:120, name:"In Multicast Pkts", groupable:false}},
            {select:"SUM(ifStats.ifInMulticastPkts)", display:{id:'SUM(ifStats.ifInMulticastPkts)', field:'SUM(ifStats.ifInMulticastPkts)', width:160, name:"SUM (In Unicast Pkts)", groupable:false}},
            {select:"MAX(ifStats.ifInMulticastPkts)", display:{id:'MAX(ifStats.ifInMulticastPkts)', field:'MAX(ifStats.ifInMulticastPkts)', width:160, name:"MAX (In Unicast Pkts)", groupable:false}},
            {select:"MIN(ifStats.ifInMulticastPkts)", display:{id:'MIN(ifStats.ifInMulticastPkts)', field:'MIN(ifStats.ifInMulticastPkts)', width:160, name:"MIN (In Unicast Pkts)", groupable:false}},

            {select:"ifStats.ifInBroadcastPkts", display:{id:'ifStats.ifInBroadcastPkts', field:'ifStats.ifInBroadcastPkts', width:120, name:"In Broadcast Pkts", groupable:false}},
            {select:"SUM(ifStats.ifInBroadcastPkts)", display:{id:'SUM(ifStats.ifInBroadcastPkts)', field:'SUM(ifStats.ifInBroadcastPkts)', width:160, name:"SUM (In Broadcast Pkts)", groupable:false}},
            {select:"MAX(ifStats.ifInBroadcastPkts)", display:{id:'MAX(ifStats.ifInBroadcastPkts)', field:'MAX(ifStats.ifInBroadcastPkts)', width:160, name:"MAX (In Broadcast Pkts)", groupable:false}},
            {select:"MIN(ifStats.ifInBroadcastPkts)", display:{id:'MIN(ifStats.ifInBroadcastPkts)', field:'MIN(ifStats.ifInBroadcastPkts)', width:160, name:"MIN (In Broadcast Pkts)", groupable:false}},

            {select:"ifStats.ifInDiscards", display:{id:'ifStats.ifInDiscards', field:'ifStats.ifInDiscards', width:120, name:"Intf In Discards", groupable:false}},
            {select:"SUM(ifStats.ifInDiscards)", display:{id:'SUM(ifStats.ifInDiscards)', field:'SUM(ifStats.ifInDiscards)', width:160, name:"SUM (Intf In Discards)", groupable:false}},
            {select:"MAX(ifStats.ifInDiscards)", display:{id:'MAX(ifStats.ifInDiscards)', field:'MAX(ifStats.ifInDiscards)', width:160, name:"MAX (Intf In Discards)", groupable:false}},
            {select:"MIN(ifStats.ifInDiscards)", display:{id:'MIN(ifStats.ifInDiscards)', field:'MIN(ifStats.ifInDiscards)', width:160, name:"MIN (Intf In Discards)", groupable:false}},

            {select:"ifStats.ifInErrors", display:{id:'ifStats.ifInErrors', field:'ifStats.ifInErrors', width:120, name:"Intf In Errors", groupable:false}},
            {select:"SUM(ifStats.ifInErrors)", display:{id:'SUM(ifStats.ifInErrors)', field:'SUM(ifStats.ifInErrors)', width:160, name:"SUM (Intf In Errors)", groupable:false}},
            {select:"MAX(ifStats.ifInErrors)", display:{id:'MAX(ifStats.ifInErrors)', field:'MAX(ifStats.ifInErrors)', width:160, name:"MAX (Intf In Errors)", groupable:false}},
            {select:"MIN(ifStats.ifInErrors)", display:{id:'MIN(ifStats.ifInErrors)', field:'MIN(ifStats.ifInErrors)', width:160, name:"MIN (Intf In Errors)", groupable:false}},

            {select:"ifStats.ifOutUcastPkts", display:{id:'ifStats.ifOutUcastPkts', field:'ifStats.ifOutUcastPkts', width:120, name:"Out Unicast Pkts", groupable:false}},
            {select:"SUM(ifStats.ifOutUcastPkts)", display:{id:'SUM(ifStats.ifOutUcastPkts)', field:'SUM(ifStats.ifOutUcastPkts)', width:160, name:"SUM (Out Unicast Pkts)", groupable:false}},
            {select:"MAX(ifStats.ifOutUcastPkts)", display:{id:'MAX(ifStats.ifOutUcastPkts)', field:'MAX(ifStats.ifOutUcastPkts)', width:160, name:"MAX (Out Unicast Pkts)", groupable:false}},
            {select:"MIN(ifStats.ifOutUcastPkts)", display:{id:'MIN(ifStats.ifOutUcastPkts)', field:'MIN(ifStats.ifOutUcastPkts)', width:160, name:"MIN (Out Unicast Pkts)", groupable:false}},

            {select:"ifStats.ifOutMulticastPkts", display:{id:'ifStats.ifOutMulticastPkts', field:'ifStats.ifOutMulticastPkts', width:120, name:"Out Multicast Pkts", groupable:false}},
            {select:"SUM(ifStats.ifOutMulticastPkts)", display:{id:'SUM(ifStats.ifOutMulticastPkts)', field:'SUM(ifStats.ifOutMulticastPkts)', width:160, name:"SUM (Out Multicast Pkts)", groupable:false}},
            {select:"MAX(ifStats.ifOutMulticastPkts)", display:{id:'MAX(ifStats.ifOutMulticastPkts)', field:'MAX(ifStats.ifOutMulticastPkts)', width:160, name:"MAX (Out Multicast Pkts)", groupable:false}},
            {select:"MIN(ifStats.ifOutMulticastPkts)", display:{id:'MIN(ifStats.ifOutMulticastPkts)', field:'MIN(ifStats.ifOutMulticastPkts)', width:160, name:"MIN (Out Multicast Pkts)", groupable:false}},

            {select:"ifStats.ifOutBroadcastPkts", display:{id:'ifStats.ifOutBroadcastPkts', field:'ifStats.ifOutBroadcastPkts', width:120, name:"Out Broadcast Pkts", groupable:false}},
            {select:"SUM(ifStats.ifOutBroadcastPkts)", display:{id:'SUM(ifStats.ifOutBroadcastPkts)', field:'SUM(ifStats.ifOutBroadcastPkts)', width:160, name:"SUM (Out Broadcast Pkts)", groupable:false}},
            {select:"MAX(ifStats.ifOutBroadcastPkts)", display:{id:'MAX(ifStats.ifOutBroadcastPkts)', field:'MAX(ifStats.ifOutBroadcastPkts)', width:160, name:"MAX (Out Broadcast Pkts)", groupable:false}},
            {select:"MIN(ifStats.ifOutBroadcastPkts)", display:{id:'MIN(ifStats.ifOutBroadcastPkts)', field:'MIN(ifStats.ifOutBroadcastPkts)', width:160, name:"MIN (Out Broadcast Pkts)", groupable:false}},

            {select:"ifStats.ifOutDiscards", display:{id:'ifStats.ifOutDiscards', field:'ifStats.ifOutDiscards', width:120, name:"Intf Out Discards", groupable:false}},
            {select:"SUM(ifStats.ifOutDiscards)", display:{id:'SUM(ifStats.ifOutDiscards)', field:'SUM(ifStats.ifOutDiscards)', width:160, name:"SUM (Intf Out Discards)", groupable:false}},
            {select:"MAX(ifStats.ifOutDiscards)", display:{id:'MAX(ifStats.ifOutDiscards)', field:'MAX(ifStats.ifOutDiscards)', width:160, name:"MAX (Intf Out Discards)", groupable:false}},
            {select:"MIN(ifStats.ifOutDiscards)", display:{id:'MIN(ifStats.ifOutDiscards)', field:'MIN(ifStats.ifOutDiscards)', width:160, name:"MIN (Intf Out Discards)", groupable:false}},

            {select:"ifStats.ifOutErrors", display:{id:'ifStats.ifOutErrors', field:'ifStats.ifOutErrors', width:120, name:"Intf Out Errors", groupable:false}},
            {select:"SUM(ifStats.ifOutErrors)", display:{id:'SUM(ifStats.ifOutErrors)', field:'SUM(ifStats.ifOutErrors)', width:160, name:"SUM (Intf Out Errors)", groupable:false}},
            {select:"MAX(ifStats.ifOutErrors)", display:{id:'MAX(ifStats.ifOutErrors)', field:'MAX(ifStats.ifOutErrors)', width:160, name:"MAX (Intf Out Errors)", groupable:false}},
            {select:"MIN(ifStats.ifOutErrors)", display:{id:'MIN(ifStats.ifOutErrors)', field:'MIN(ifStats.ifOutErrors)', width:160, name:"MIN (Intf Out Errors)", groupable:false}},

            {select:"ifStats.ifIndex", display:{id:'ifStats.ifIndex', field:'ifStats.ifIndex', width:120, name:"Intf Index", groupable:false}},
            {select:"SUM(ifStats.ifIndex)", display:{id:'SUM(ifStats.ifIndex)', field:'SUM(ifStats.ifIndex)', width:160, name:"SUM (Intf Index)", groupable:false}},
            {select:"MAX(ifStats.ifIndex)", display:{id:'MAX(ifStats.ifIndex)', field:'MAX(ifStats.ifIndex)', width:160, name:"MAX (Intf Index)", groupable:false}},
            {select:"MIN(ifStats.ifIndex)", display:{id:'MIN(ifStats.ifIndex)', field:'MIN(ifStats.ifIndex)', width:160, name:"MIN (Intf Index)", groupable:false}}
        ],
        "StatTable.ComputeCpuState.cpu_info" : [
            {select:"COUNT(cpu_info)", display:{id:'COUNT(cpu_info)', field:'COUNT(cpu_info)', width:120, name:"Count (CPU Info)", groupable:false}},

            {select:"cpu_info.mem_virt", display:{id:'cpu_info.mem_virt', field:'cpu_info.mem_virt', width:160, name:"Virtual Memory", groupable:false}},
            {select:"SUM(cpu_info.mem_virt)", display:{id:'SUM(cpu_info.mem_virt)', field:'SUM(cpu_info.mem_virt)', width:160, name:"SUM (Virtual Memory)", groupable:false}},
            {select:"MAX(cpu_info.mem_virt)", display:{id:'MAX(cpu_info.mem_virt)', field:'MAX(cpu_info.mem_virt)', width:160, name:"MAX (Virtual Memory)", groupable:false}},
            {select:"MIN(cpu_info.mem_virt)", display:{id:'MIN(cpu_info.mem_virt)', field:'MIN(cpu_info.mem_virt)', width:160, name:"MIN (Virtual Memory)", groupable:false}},

            {select:"cpu_info.cpu_share", display:{id:'cpu_info.cpu_share', field:'cpu_info.cpu_share', width:160, name:"CPU Share", groupable:false}},
            {select:"SUM(cpu_info.cpu_share)", display:{id:'SUM(cpu_info.cpu_share)', field:'SUM(cpu_info.cpu_share)', width:160, name:"SUM (CPU Share)", groupable:false}},
            {select:"MAX(cpu_info.cpu_share)", display:{id:'MAX(cpu_info.cpu_share)', field:'MAX(cpu_info.cpu_share)', width:160, name:"MAX (CPU Share)", groupable:false}},
            {select:"MIN(cpu_info.cpu_share)", display:{id:'MIN(cpu_info.cpu_share)', field:'MIN(cpu_info.cpu_share)', width:160, name:"MIN (CPU Share)", groupable:false}},


            {select:"cpu_info.used_sys_mem", display:{id:'cpu_info.used_sys_mem', field:'cpu_info.used_sys_mem', width:190, name:"CPU Sys Mem Used", groupable:false}},
            {select:"SUM(cpu_info.used_sys_mem)", display:{id:'SUM(cpu_info.used_sys_mem)', field:'SUM(cpu_info.used_sys_mem)', width:190, name:"SUM (CPU Sys Mem Used)", groupable:false}},
            {select:"MAX(cpu_info.used_sys_mem)", display:{id:'MAX(cpu_info.used_sys_mem)', field:'MAX(cpu_info.used_sys_mem)', width:190, name:"MAX (CPU Sys Mem Used)", groupable:false}},
            {select:"MIN(cpu_info.used_sys_mem)", display:{id:'MIN(cpu_info.used_sys_mem)', field:'MIN(cpu_info.used_sys_mem)', width:190, name:"MIN (CPU Sys Mem Used)", groupable:false}},

            {select:"cpu_info.one_min_cpuload", display:{id:'cpu_info.one_min_cpuload', field:'cpu_info.one_min_cpuload', width:160, name:"CPU 1 Min Load", groupable:false}},
            {select:"SUM(cpu_info.one_min_cpuload)", display:{id:'SUM(cpu_info.one_min_cpuload)', field:'SUM(cpu_info.one_min_cpuload)', width:160, name:"SUM (CPU 1 Min Load)", groupable:false}},
            {select:"MAX(cpu_info.one_min_cpuload)", display:{id:'MAX(cpu_info.one_min_cpuload)', field:'MAX(cpu_info.one_min_cpuload)', width:160, name:"MAX (CPU 1 Min Load)", groupable:false}},
            {select:"MIN(cpu_info.one_min_cpuload)", display:{id:'MIN(cpu_info.one_min_cpuload)', field:'MIN(cpu_info.one_min_cpuload)', width:160, name:"MIN (CPU 1 Min Load)", groupable:false}},

            {select:"cpu_info.mem_res", display:{id:'cpu_info.mem_res', field:'cpu_info.mem_res', width:170, name:"CPU Resident Mem", groupable:false}},
            {select:"SUM(cpu_info.mem_res)", display:{id:'SUM(cpu_info.mem_res)', field:'SUM(cpu_info.mem_res)', width:190, name:"SUM (CPU Resident Mem)", groupable:false}},
            {select:"MIN(cpu_info.mem_res)", display:{id:'MIN(cpu_info.mem_res)', field:'MIN(cpu_info.mem_res)', width:190, name:"MIN (CPU Resident Mem)", groupable:false}},
            {select:"MAX(cpu_info.mem_res)", display:{id:'MAX(cpu_info.mem_res)', field:'MAX(cpu_info.mem_res)', width:190, name:"MAX (CPU Resident Mem)", groupable:false}}
        ],
        "StatTable.VirtualMachineStats.cpu_stats" : [
            {select:"COUNT(cpu_stats)", display:{id:'COUNT(cpu_stats)', field:'COUNT(cpu_stats)', width:150, name:"Count (CPU Stats)", groupable:false}},

            {select:"cpu_stats.cpu_one_min_avg", display:{id:'cpu_stats.cpu_one_min_avg', field:'cpu_stats.cpu_one_min_avg', width:170, name:"Cpu One Min Avg", groupable:false}},
            {select:"SUM(cpu_stats.cpu_one_min_avg)", display:{id:'SUM(cpu_stats.cpu_one_min_avg)', field:'SUM(cpu_stats.cpu_one_min_avg)', width:170, name:"SUM (Cpu One Min Avg)", groupable:false}},
            {select:"MAX(cpu_stats.cpu_one_min_avg)", display:{id:'MAX(cpu_stats.cpu_one_min_avg)', field:'MAX(cpu_stats.cpu_one_min_avg)', width:170, name:"MAX (Cpu One Min Avg)", groupable:false}},
            {select:"MIN(cpu_stats.cpu_one_min_avg)", display:{id:'MIN(cpu_stats.cpu_one_min_avg)', field:'MIN(cpu_stats.cpu_one_min_avg)', width:170, name:"MIN (Cpu One Min Avg)", groupable:false}},

            {select:"cpu_stats.vm_memory_quota", display:{id:'cpu_stats.vm_memory_quota', field:'cpu_stats.vm_memory_quota', width:190, name:"Vm Memory Quota", groupable:false}},
            {select:"SUM(cpu_stats.vm_memory_quota)", display:{id:'SUM(cpu_stats.vm_memory_quota)', field:'SUM(cpu_stats.vm_memory_quota)', width:190, name:"SUM (Vm Memory Quota)", groupable:false}},
            {select:"MAX(cpu_stats.vm_memory_quota)", display:{id:'MAX(cpu_stats.vm_memory_quota)', field:'MAX(cpu_stats.vm_memory_quota)', width:190, name:"MAX (Vm Memory Quota)", groupable:false}},
            {select:"MIN(cpu_stats.vm_memory_quota)", display:{id:'MIN(cpu_stats.vm_memory_quota)', field:'MIN(cpu_stats.vm_memory_quota)', width:190, name:"MIN (Vm Memory Quota)", groupable:false}},

            {select:"cpu_stats.rss", display:{id:'cpu_stats.rss', field:'cpu_stats.rss', width:150, name:"Rss", groupable:false}},
            {select:"SUM(cpu_stats.rss)", display:{id:'SUM(cpu_stats.rss)', field:'SUM(cpu_stats.rss)', width:150, name:"SUM (Rss)", groupable:false}},
            {select:"MAX(cpu_stats.rss)", display:{id:'MAX(cpu_stats.rss)', field:'MAX(cpu_stats.rss)', width:150, name:"MAX (Rss)", groupable:false}},
            {select:"MIN(cpu_stats.rss)", display:{id:'MIN(cpu_stats.rss)', field:'MIN(cpu_stats.rss)', width:150, name:"MIN (Rss)", groupable:false}},

            {select:"cpu_stats.virt_memory", display:{id:'cpu_stats.virt_memory', field:'cpu_stats.virt_memory', width:150, name:"Virtual Mem", groupable:false}},
            {select:"SUM(cpu_stats.virt_memory)", display:{id:'SUM(cpu_stats.virt_memory)', field:'SUM(cpu_stats.virt_memory)', width:150, name:"SUM (Virtual Mem)", groupable:false}},
            {select:"MAX(cpu_stats.virt_memory)", display:{id:'MAX(cpu_stats.virt_memory)', field:'MAX(cpu_stats.virt_memory)', width:150, name:"MAX (Virtual Mem)", groupable:false}},
            {select:"MIN(cpu_stats.virt_memory)", display:{id:'MIN(cpu_stats.virt_memory)', field:'MIN(cpu_stats.virt_memory)', width:150, name:"MIN (Virtual Mem)", groupable:false}},

            {select:"cpu_stats.peak_virt_memory", display:{id:'cpu_stats.peak_virt_memory', field:'cpu_stats.peak_virt_memory', width:170, name:"Peak Virtual Mem", groupable:false}},
            {select:"SUM(cpu_stats.peak_virt_memory)", display:{id:'SUM(cpu_stats.peak_virt_memory)', field:'SUM(cpu_stats.peak_virt_memory)', width:170, name:"SUM (Peak Virtual Mem)", groupable:false}},
            {select:"MAX(cpu_stats.peak_virt_memory)", display:{id:'MAX(cpu_stats.peak_virt_memory)', field:'MAX(cpu_stats.peak_virt_memory)', width:170, name:"MAX (Peak Virtual Mem)", groupable:false}},
            {select:"MIN(cpu_stats.peak_virt_memory)", display:{id:'MIN(cpu_stats.peak_virt_memory)', field:'MIN(cpu_stats.peak_virt_memory)', width:170, name:"MIN (Peak Virtual Mem)", groupable:false}},
        ],
        "StatTable.ComputeStoragePool.info_stats" : [
            {select:"COUNT(info_stats)", display:{id:'COUNT(info_stats)', field:'COUNT(info_stats)', width:150, name:"Count (Info Stats)", groupable:false}},

            {select:"info_stats.writes", display:{id:'info_stats.reads', field:'info_stats.reads', width:150, name:"Reads", groupable:false}},
            {select:"SUM(info_stats.reads)", display:{id:'SUM(info_stats.reads)', field:'SUM(info_stats.reads)', width:150, name:"SUM (Reads)", groupable:false}},
            {select:"MAX(info_stats.reads)", display:{id:'MAX(info_stats.reads)', field:'MAX(info_stats.reads)', width:150, name:"MAX (Reads)", groupable:false}},
            {select:"MIN(info_stats.reads)", display:{id:'MIN(info_stats.reads)', field:'MIN(info_stats.reads)', width:150, name:"MIN (Reads)", groupable:false}},

            {select:"info_stats.writes", display:{id:'info_stats.writes', field:'info_stats.writes', width:150, name:"Writes", groupable:false}},
            {select:"SUM(info_stats.writes)", display:{id:'SUM(info_stats.writes)', field:'SUM(info_stats.writes)', width:150, name:"SUM (writes)", groupable:false}},
            {select:"MAX(info_stats.writes)", display:{id:'MAX(info_stats.writes)', field:'MAX(info_stats.writes)', width:150, name:"MAX (writes)", groupable:false}},
            {select:"MIN(info_stats.writes)", display:{id:'MIN(info_stats.writes)', field:'MIN(info_stats.writes)', width:150, name:"MIN (writes)", groupable:false}},

            {select:"info_stats.read_kbytes", display:{id:'info_stats.read_kbytes', field:'info_stats.read_kbytes', width:150, name:"Read kbytes", groupable:false}},
            {select:"SUM(info_stats.read_kbytes)", display:{id:'SUM(info_stats.read_kbytes)', field:'SUM(info_stats.read_kbytes)', width:150, name:"SUM (Read kbytes)", groupable:false}},
            {select:"MAX(info_stats.read_kbytes)", display:{id:'MAX(info_stats.read_kbytes)', field:'MAX(info_stats.read_kbytes)', width:150, name:"MAX (Read kbytes)", groupable:false}},
            {select:"MIN(info_stats.read_kbytes)", display:{id:'MIN(info_stats.read_kbytes)', field:'MIN(info_stats.read_kbytes)', width:150, name:"MIN (Read kbytes)", groupable:false}},

            {select:"info_stats.write_kbytes", display:{id:'info_stats.write_kbytes', field:'info_stats.write_kbytes', width:150, name:"Write kbytes", groupable:false}},
            {select:"SUM(info_stats.write_kbytes)", display:{id:'SUM(info_stats.write_kbytes)', field:'SUM(info_stats.write_kbytes)', width:150, name:"SUM (Write kbytes)", groupable:false}},
            {select:"MAX(info_stats.write_kbytes)", display:{id:'MAX(info_stats.write_kbytes)', field:'MAX(info_stats.write_kbytes)', width:150, name:"MAX (Write kbytes)", groupable:false}},
            {select:"MIN(info_stats.write_kbytes)", display:{id:'MIN(info_stats.write_kbytes)', field:'MIN(info_stats.write_kbytes)', width:150, name:"MIN (Write kbytes)", groupable:false}}

        ],
        "StatTable.ComputeStorageOsd.info_stats" : [
            {select:"COUNT(info_stats)", display:{id:'COUNT(info_stats)', field:'COUNT(info_stats)', width:150, name:"Count (Info Stats)", groupable:false}},

            {select:"info_stats.reads", display:{id:'info_stats.reads', field:'info_stats.reads', width:150, name:"Reads", groupable:false}},
            {select:"SUM(info_stats.reads)", display:{id:'SUM(info_stats.reads)', field:'SUM(info_stats.reads)', width:150, name:"SUM (Reads)", groupable:false}},
            {select:"MAX(info_stats.reads)", display:{id:'MAX(info_stats.reads)', field:'MAX(info_stats.reads)', width:150, name:"MAX (Reads)", groupable:false}},
            {select:"MIN(info_stats.reads)", display:{id:'MIN(info_stats.reads)', field:'MIN(info_stats.reads)', width:150, name:"MIN (Reads)", groupable:false}},

            {select:"info_stats.writes", display:{id:'info_stats.writes', field:'info_stats.writes', width:150, name:"Writes", groupable:false}},
            {select:"SUM(info_stats.writes)", display:{id:'SUM(info_stats.writes)', field:'SUM(info_stats.writes)', width:150, name:"SUM (Writes)", groupable:false}},
            {select:"MAX(info_stats.writes)", display:{id:'MAX(info_stats.writes)', field:'MAX(info_stats.writes)', width:150, name:"MAX (Writes)", groupable:false}},
            {select:"MIN(info_stats.writes)", display:{id:'MIN(info_stats.writes)', field:'MIN(info_stats.writes)', width:150, name:"MIN (Writes)", groupable:false}},

            {select:"info_stats.read_kbytes", display:{id:'info_stats.read_kbytes', field:'info_stats.read_kbytes', width:150, name:"Read kbytes", groupable:false}},
            {select:"SUM(info_stats.read_kbytes)", display:{id:'SUM(info_stats.read_kbytes)', field:'SUM(info_stats.read_kbytes)', width:150, name:"SUM (Read kbytes)", groupable:false}},
            {select:"MAX(info_stats.read_kbytes)", display:{id:'MAX(info_stats.read_kbytes)', field:'MAX(info_stats.read_kbytes)', width:150, name:"MAX (Read kbytes)", groupable:false}},
            {select:"MIN(info_stats.read_kbytes)", display:{id:'MIN(info_stats.read_kbytes)', field:'MIN(info_stats.read_kbytes)', width:150, name:"MIN (Read kbytes)", groupable:false}},

            {select:"info_stats.write_kbytes", display:{id:'info_stats.write_kbytes', field:'info_stats.write_kbytes', width:150, name:"Write kbytes", groupable:false}},
            {select:"SUM(info_stats.write_kbytes)", display:{id:'SUM(info_stats.write_kbytes)', field:'SUM(info_stats.write_kbytes)', width:150, name:"SUM (Write kbytes)", groupable:false}},
            {select:"MAX(info_stats.write_kbytes)", display:{id:'MAX(info_stats.write_kbytes)', field:'MAX(info_stats.write_kbytes)', width:150, name:"MAX (Write kbytes)", groupable:false}},
            {select:"MIN(info_stats.write_kbytes)", display:{id:'MIN(info_stats.write_kbytes)', field:'MIN(info_stats.write_kbytes)', width:150, name:"MIN (Write kbytes)", groupable:false}},

            {select:"info_stats.op_r_latency", display:{id:'info_stats.op_r_latency', field:'info_stats.op_r_latency', width:150, name:"Read Latency", groupable:false}},
            {select:"SUM(info_stats.op_r_latency)", display:{id:'SUM(info_stats.op_r_latency)', field:'SUM(info_stats.op_r_latency)', width:150, name:"SUM (Read Latency)", groupable:false}},
            {select:"MAX(info_stats.op_r_latency)", display:{id:'MAX(info_stats.op_r_latency)', field:'MAX(info_stats.op_r_latency)', width:150, name:"MAX (Read Latency)", groupable:false}},
            {select:"MIN(info_stats.op_r_latency)", display:{id:'MIN(info_stats.op_r_latency)', field:'MIN(info_stats.op_r_latency)', width:150, name:"MIN (Read Latency)", groupable:false}},

            {select:"info_stats.op_w_latency", display:{id:'info_stats.op_w_latency', field:'info_stats.op_w_latency', width:150, name:"Read Latency", groupable:false}},
            {select:"SUM(info_stats.op_w_latency)", display:{id:'SUM(info_stats.op_w_latency)', field:'SUM(info_stats.op_w_latency)', width:150, name:"SUM (Read Latency)", groupable:false}},
            {select:"MAX(info_stats.op_w_latency)", display:{id:'MAX(info_stats.op_w_latency)', field:'MAX(info_stats.op_w_latency)', width:150, name:"MAX (Read Latency)", groupable:false}},
            {select:"MIN(info_stats.op_w_latency)", display:{id:'MIN(info_stats.op_w_latency)', field:'MIN(info_stats.op_w_latency)', width:150, name:"MIN (Read Latency)", groupable:false}}
        ],
        "StatTable.ComputeStorageDisk.info_stats" : [
            {select:"COUNT(info_stats)", display:{id:'COUNT(info_stats)', field:'COUNT(info_stats)', width:150, name:"Count (Info Stats)", groupable:false}},

            {select:"info_stats.reads", display:{id:'info_stats.reads', field:'info_stats.reads', width:150, name:"Reads", groupable:false}},
            {select:"SUM(info_stats.reads)", display:{id:'SUM(info_stats.reads)', field:'SUM(info_stats.reads)', width:150, name:"SUM (Reads)", groupable:false}},
            {select:"MAX(info_stats.reads)", display:{id:'MAX(info_stats.reads)', field:'MAX(info_stats.reads)', width:150, name:"MAX (Reads)", groupable:false}},
            {select:"MIN(info_stats.reads)", display:{id:'MIN(info_stats.reads)', field:'MIN(info_stats.reads)', width:150, name:"MIN (Reads)", groupable:false}},

            {select:"info_stats.writes", display:{id:'info_stats.writes', field:'info_stats.writes', width:150, name:"Writes", groupable:false}},
            {select:"SUM(info_stats.writes)", display:{id:'SUM(info_stats.writes)', field:'SUM(info_stats.writes)', width:150, name:"SUM (Writes)", groupable:false}},
            {select:"MAX(info_stats.writes)", display:{id:'MAX(info_stats.writes)', field:'MAX(info_stats.writes)', width:150, name:"MAX (Writes)", groupable:false}},
            {select:"MIN(info_stats.writes)", display:{id:'MIN(info_stats.writes)', field:'MIN(info_stats.writes)', width:150, name:"MIN (Writes)", groupable:false}},

            {select:"info_stats.read_kbytes", display:{id:'info_stats.read_kbytes', field:'info_stats.read_kbytes', width:150, name:"Read kbytes", groupable:false}},
            {select:"SUM(info_stats.read_kbytes)", display:{id:'SUM(info_stats.read_kbytes)', field:'SUM(info_stats.read_kbytes)', width:150, name:"SUM (Read kbytes)", groupable:false}},
            {select:"MAX(info_stats.read_kbytes)", display:{id:'MAX(info_stats.read_kbytes)', field:'MAX(info_stats.read_kbytes)', width:150, name:"MAX (Read kbytes)", groupable:false}},
            {select:"MIN(info_stats.read_kbytes)", display:{id:'MIN(info_stats.read_kbytes)', field:'MIN(info_stats.read_kbytes)', width:150, name:"MIN (Read kbytes)", groupable:false}},

            {select:"info_stats.write_kbytes", display:{id:'info_stats.write_kbytes', field:'info_stats.write_kbytes', width:150, name:"Write kbytes", groupable:false}},
            {select:"SUM(info_stats.write_kbytes)", display:{id:'SUM(info_stats.write_kbytes)', field:'SUM(info_stats.write_kbytes)', width:150, name:"SUM (Write kbytes)", groupable:false}},
            {select:"MAX(info_stats.write_kbytes)", display:{id:'MAX(info_stats.write_kbytes)', field:'MAX(info_stats.write_kbytes)', width:150, name:"MAX (Write kbytes)", groupable:false}},
            {select:"MIN(info_stats.write_kbytes)", display:{id:'MIN(info_stats.write_kbytes)', field:'MIN(info_stats.write_kbytes)', width:150, name:"MIN (Write kbytes)", groupable:false}},

            {select:"info_stats.iops", display:{id:'info_stats.iops', field:'info_stats.iops', width:150, name:"IOPS", groupable:false}},
            {select:"SUM(info_stats.iops)", display:{id:'SUM(info_stats.iops)', field:'SUM(info_stats.iops)', width:150, name:"SUM (IOPS)", groupable:false}},
            {select:"MAX(info_stats.iops)", display:{id:'MAX(info_stats.iops)', field:'MAX(info_stats.iops)', width:150, name:"MAX (IOPS)", groupable:false}},
            {select:"MIN(info_stats.iops)", display:{id:'MIN(info_stats.iops)', field:'MIN(info_stats.iops)', width:150, name:"MIN (IOPS)", groupable:false}},

            {select:"info_stats.bw", display:{id:'info_stats.bw', field:'info_stats.bw', width:150, name:"Bandwidth", groupable:false}},
            {select:"SUM(info_stats.bw)", display:{id:'SUM(info_stats.bw)', field:'SUM(info_stats.bw)', width:150, name:"SUM (Bandwidth)", groupable:false}},
            {select:"MAX(info_stats.bw)", display:{id:'MAX(info_stats.bw)', field:'MAX(info_stats.bw)', width:150, name:"MAX (Bandwidth)", groupable:false}},
            {select:"MIN(info_stats.bw)", display:{id:'MIN(info_stats.bw)', field:'MIN(info_stats.bw)', width:150, name:"MIN (Bandwidth)", groupable:false}},

            {select:"info_stats.op_r_latency", display:{id:'info_stats.op_r_latency', field:'info_stats.op_r_latency', width:170, name:"Op Read Latency", groupable:false}},
            {select:"SUM(info_stats.op_r_latency)", display:{id:'SUM(info_stats.op_r_latency)', field:'SUM(info_stats.op_r_latency)', width:170, name:"SUM (Op Read Latency)", groupable:false}},
            {select:"MAX(info_stats.op_r_latency)", display:{id:'MAX(info_stats.op_r_latency)', field:'MAX(info_stats.op_r_latency)', width:170, name:"MAX (Op Read Latency)", groupable:false}},
            {select:"MIN(info_stats.op_r_latency)", display:{id:'MIN(info_stats.op_r_latency)', field:'MIN(info_stats.op_r_latency)', width:170, name:"MIN (Op Read Latency)", groupable:false}},

            {select:"info_stats.op_w_latency", display:{id:'info_stats.op_w_latency', field:'info_stats.op_w_latency', width:170, name:"Op Write Latency", groupable:false}},
            {select:"SUM(info_stats.op_w_latency)", display:{id:'SUM(info_stats.op_w_latency)', field:'SUM(info_stats.op_w_latency)', width:170, name:"SUM (Op Write Latency)", groupable:false}},
            {select:"MAX(info_stats.op_w_latency)", display:{id:'MAX(info_stats.op_w_latency)', field:'MAX(info_stats.op_w_latency)', width:170, name:"MAX (Op Write Latency)", groupable:false}},
            {select:"MIN(info_stats.op_w_latency)", display:{id:'MIN(info_stats.op_w_latency)', field:'MIN(info_stats.op_w_latency)', width:170, name:"MIN (Op Write Latency)", groupable:false}}

        ],
        "StatTable.ServerMonitoringInfo.sensor_stats" : [
            {select:"COUNT(sensor_stats)", display:{id:'COUNT(sensor_stats)', field:'COUNT(sensor_stats)', width:150, name:"Count (Sensor Stats)", groupable:false}},
            {select:"sensor_stats.sensor", display:{id:'sensor_stats.sensor', field:'sensor_stats.sensor', width:150, name:"Sensor", groupable:false}},
            {select:"sensor_stats.status", display:{id:'sensor_stats.status', field:'sensor_stats.status', width:150, name:"Sensor Status", groupable:false}},

            {select:"sensor_stats.reading", display:{id:'sensor_stats.reading', field:'sensor_stats.reading', width:150, name:"Reading", groupable:false}},
            {select:"SUM(sensor_stats.reading)", display:{id:'SUM(sensor_stats.reading)', field:'SUM(sensor_stats.reading)', width:150, name:"SUM (Reading)", groupable:false}},
            {select:"MAX(sensor_stats.reading)", display:{id:'MAX(sensor_stats.reading)', field:'MAX(sensor_stats.reading)', width:150, name:"MAX (Reading)", groupable:false}},
            {select:"MIN(sensor_stats.reading)", display:{id:'MIN(sensor_stats.reading)', field:'MIN(sensor_stats.reading)', width:150, name:"MIN (Reading)", groupable:false}},

            {select:"sensor_stats.unit", display:{id:'sensor_stats.unit', field:'sensor_stats.unit', width:150, name:"Unit", groupable:false}},
            {select:"sensor_stats.sensor_type", display:{id:'sensor_stats.sensor_type', field:'sensor_stats.sensor_type', width:150, name:"Sensor Type", groupable:false}}
        ],
        "StatTable.ServerMonitoringInfo.disk_usage_stats" : [
            {select:"COUNT(disk_usage_stats)", display:{id:'COUNT(disk_usage_stats)', field:'COUNT(disk_usage_stats)', width:150, name:"Count (Disk Usage)", groupable:false}},
            {select:"disk_usage_stats.disk_name", display:{id:'disk_usage_stats.disk_name', field:'disk_usage_stats.disk_name', width:150, name:"Disk Name", groupable:false}},

            {select:"disk_usage_stats.read_bytes", display:{id:'disk_usage_stats.read_bytes', field:'disk_usage_stats.read_bytes', width:150, name:"Read MB", groupable:false}},
            {select:"SUM(disk_usage_stats.read_bytes)", display:{id:'SUM(disk_usage_stats.read_bytes)', field:'SUM(disk_usage_stats.read_bytes)', width:150, name:"SUM (Read MB)", groupable:false}},
            {select:"MAX(disk_usage_stats.read_bytes)", display:{id:'MAX(disk_usage_stats.read_bytes)', field:'MAX(disk_usage_stats.read_bytes)', width:150, name:"MAX (Read MB)", groupable:false}},
            {select:"MIN(disk_usage_stats.read_bytes)", display:{id:'MIN(disk_usage_stats.read_bytes)', field:'MIN(disk_usage_stats.read_bytes)', width:150, name:"MIN (Read MB)", groupable:false}},

            {select:"disk_usage_stats.write_bytes", display:{id:'disk_usage_stats.write_bytes', field:'disk_usage_stats.write_bytes', width:150, name:"Read MB", groupable:false}},
            {select:"SUM(disk_usage_stats.write_bytes)", display:{id:'SUM(disk_usage_stats.write_bytes)', field:'SUM(disk_usage_stats.write_bytes)', width:150, name:"SUM (Write MB)", groupable:false}},
            {select:"MAX(disk_usage_stats.write_bytes)", display:{id:'MAX(disk_usage_stats.write_bytes)', field:'MAX(disk_usage_stats.write_bytes)', width:150, name:"MAX (Write MB)", groupable:false}},
            {select:"MIN(disk_usage_stats.write_bytes)", display:{id:'MIN(disk_usage_stats.write_bytes)', field:'MIN(disk_usage_stats.write_bytes)', width:150, name:"MIN (Write MB)", groupable:false}},
        ],
        "StatTable.ServerMonitoringSummary.network_info_stats" : [
            {select:"COUNT(network_info_stats)", display:{id:'COUNT(network_info_stats)', field:'COUNT(network_info_stats)', width:170, name:"Count (Network Info)", groupable:false}},
            {select:"network_info_stats.interface_name", display:{id:'network_info_stats.interface_name', field:'network_info_stats.interface_name', width:150, name:"Interface Name", groupable:false}},

            {select:"network_info.tx_bytes", display:{id:'network_info.tx_bytes', field:'network_info.tx_bytes', width:150, name:"Tx Bytes", groupable:false}},
            {select:"SUM(network_info.tx_bytes)", display:{id:'SUM(network_info.tx_bytes)', field:'SUM(network_info.tx_bytes)', width:150, name:"SUM (Tx Bytes)", groupable:false}},
            {select:"MIN(network_info.tx_bytes)", display:{id:'MIN(network_info.tx_bytes)', field:'MIN(network_info.tx_bytes)', width:150, name:"MIN (Tx Bytes)", groupable:false}},
            {select:"MAX(network_info.tx_bytes)", display:{id:'MAX(network_info.tx_bytes)', field:'MAX(network_info.tx_bytes)', width:150, name:"MAX (Tx Bytes)", groupable:false}},

            {select:"network_info.tx_packets", display:{id:'network_info.tx_packets', field:'network_info.tx_packets', width:150, name:"Tx Bytes", groupable:false}},
            {select:"SUM(network_info.tx_packets)", display:{id:'SUM(network_info.tx_packets)', field:'SUM(network_info.tx_packets)', width:150, name:"SUM (Tx Packets)", groupable:false}},
            {select:"MIN(network_info.tx_packets)", display:{id:'MIN(network_info.tx_packets)', field:'MIN(network_info.tx_packets)', width:150, name:"MIN (Tx Packets)", groupable:false}},
            {select:"MAX(network_info.tx_packets)", display:{id:'MAX(network_info.tx_packets)', field:'MAX(network_info.tx_packets)', width:150, name:"MAX (Tx Packets)", groupable:false}},

            {select:"network_info.rx_bytes", display:{id:'network_info.rx_bytes', field:'network_info.rx_bytes', width:150, name:"Tx Bytes", groupable:false}},
            {select:"SUM(network_info.rx_bytes)", display:{id:'SUM(network_info.rx_bytes)', field:'SUM(network_info.rx_bytes)', width:150, name:"SUM (Rx Bytes)", groupable:false}},
            {select:"MIN(network_info.rx_bytes)", display:{id:'MIN(network_info.rx_bytes)', field:'MIN(network_info.rx_bytes)', width:150, name:"MIN (Rx Bytes)", groupable:false}},
            {select:"MAX(network_info.rx_bytes)", display:{id:'MAX(network_info.rx_bytes)', field:'MAX(network_info.rx_bytes)', width:150, name:"MAX (Rx Bytes)", groupable:false}},

            {select:"network_info.rx_packets", display:{id:'network_info.rx_packets', field:'network_info.rx_packets', width:150, name:"Tx Bytes", groupable:false}},
            {select:"SUM(network_info.rx_packets)", display:{id:'SUM(network_info.rx_packets)', field:'SUM(network_info.rx_packets)', width:150, name:"SUM (Rx Packets)", groupable:false}},
            {select:"MIN(network_info.rx_packets)", display:{id:'MIN(network_info.rx_packets)', field:'MIN(network_info.rx_packets)', width:150, name:"MIN (Rx Packets)", groupable:false}},
            {select:"MAX(network_info.rx_packets)", display:{id:'MAX(network_info.rx_packets)', field:'MAX(network_info.rx_packets)', width:150, name:"MAX (Rx Packets)", groupable:false}},
        ],
        "StatTable.ServerMonitoringSummary.resource_info_stats" : [
            {select:"COUNT(resource_info_stats)", display:{id:'COUNT(resource_info_stats)', field:'COUNT(resource_info_stats)', width:150, name:"Count (Resource Info)", groupable:false}},

            {select:"resource_info_stats.cpu_usage_percentage", display:{id:'resource_info_stats.cpu_usage_percentage', field:'resource_info_stats.cpu_usage_percentage', width:150, name:"Tx Bytes", groupable:false}},
            {select:"SUM(resource_info_stats.cpu_usage_percentage)", display:{id:'SUM(resource_info_stats.cpu_usage_percentage)', field:'SUM(resource_info_stats.cpu_usage_percentage)', width:150, name:"SUM (CPU Usage %)", groupable:false}},
            {select:"MIN(resource_info_stats.cpu_usage_percentage)", display:{id:'MIN(resource_info_stats.cpu_usage_percentage)', field:'MIN(resource_info_stats.cpu_usage_percentage)', width:150, name:"MIN (CPU Usage %)", groupable:false}},
            {select:"MAX(resource_info_stats.cpu_usage_percentage)", display:{id:'MAX(resource_info_stats.cpu_usage_percentage)', field:'MAX(resource_info_stats.cpu_usage_percentage)', width:150, name:"MAX (CPU Usage %)", groupable:false}},

            {select:"resource_info_stats.mem_usage_mb", display:{id:'resource_info_stats.mem_usage_mb', field:'resource_info_stats.mem_usage_mb', width:170, name:"Mem Usage Mb", groupable:false}},
            {select:"SUM(resource_info_stats.mem_usage_mb)", display:{id:'SUM(resource_info_stats.mem_usage_mb)', field:'SUM(resource_info_stats.mem_usage_mb)', width:170, name:"SUM (Mem Usage Mb)", groupable:false}},
            {select:"MIN(resource_info_stats.mem_usage_mb)", display:{id:'MIN(resource_info_stats.mem_usage_mb)', field:'MIN(resource_info_stats.mem_usage_mb)', width:170, name:"MIN (Mem Usage Mb)", groupable:false}},
            {select:"MAX(resource_info_stats.mem_usage_mb)", display:{id:'MAX(resource_info_stats.mem_usage_mb)', field:'MAX(resource_info_stats.mem_usage_mb)', width:170, name:"MAX (Mem Usage Mb)", groupable:false}},

            {select:"resource_info_stats.mem_usage_percent", display:{id:'resource_info_stats.mem_usage_percent', field:'resource_info_stats.mem_usage_percent', width:150, name:"Mem Usage %", groupable:false}},
            {select:"SUM(resource_info_stats.mem_usage_percent)", display:{id:'SUM(resource_info_stats.mem_usage_percent)', field:'SUM(resource_info_stats.mem_usage_percent)', width:150, name:"SUM (Mem Usage %)", groupable:false}},
            {select:"MIN(resource_info_stats.mem_usage_percent)", display:{id:'MIN(resource_info_stats.mem_usage_percent)', field:'MIN(resource_info_stats.mem_usage_percent)', width:150, name:"MIN (Mem Usage %)", groupable:false}},
            {select:"MAX(resource_info_stats.mem_usage_percent)", display:{id:'MAX(resource_info_stats.mem_usage_percent)', field:'MAX(resource_info_stats.mem_usage_percent)', width:150, name:"MAX (Mem Usage %)", groupable:false}},
        ],
        "StatTable.ServerMonitoringInfo.file_system_view_stats.physical_disks" : [
            {select:"COUNT(file_system_view_stats.physical_disks)", display:{id:'COUNT(file_system_view_stats.physical_disks)', field:'COUNT(file_system_view_stats.physical_disks)', width:150, name:"Count (Physical Disks)", groupable:false}},
            {select:"file_system_view_stats.fs_name", display:{id:'file_system_view_stats.fs_name', field:'file_system_view_stats.fs_name', width:150, name:"Fs Name", groupable:false}},
            {select:"file_system_view_stats.mountpoint", display:{id:'file_system_view_stats.mountpoint', field:'file_system_view_stats.mountpoint', width:150, name:"Mount Point", groupable:false}},
            {select:"file_system_view_stats.type", display:{id:'file_system_view_stats.type', field:'file_system_view_stats.type', width:150, name:"Type", groupable:false}},

            {select:"file_system_view_stats.size_kb", display:{id:'file_system_view_stats.size_kb', field:'file_system_view_stats.size_kb', width:150, name:"Fs Size Kb", groupable:false}},
            {select:"SUM(file_system_view_stats.size_kb)", display:{id:'SUM(file_system_view_stats.size_kb)', field:'SUM(file_system_view_stats.size_kb)', width:150, name:"SUM (Fs Size Kb)", groupable:false}},
            {select:"MIN(file_system_view_stats.size_kb)", display:{id:'MIN(file_system_view_stats.size_kb)', field:'MIN(file_system_view_stats.size_kb)', width:150, name:"MIN (Fs Size Kb)", groupable:false}},
            {select:"MAX(file_system_view_stats.size_kb)", display:{id:'MAX(file_system_view_stats.size_kb)', field:'MAX(file_system_view_stats.size_kb)', width:150, name:"MAX (Fs Size Kb)", groupable:false}},

            {select:"file_system_view_stats.used_kb", display:{id:'file_system_view_stats.used_kb', field:'file_system_view_stats.used_kb', width:150, name:"Fs Used Kb", groupable:false}},
            {select:"SUM(file_system_view_stats.used_kb)", display:{id:'SUM(file_system_view_stats.used_kb)', field:'SUM(file_system_view_stats.used_kb)', width:150, name:"SUM (Fs Used Kb)", groupable:false}},
            {select:"MIN(file_system_view_stats.used_kb)", display:{id:'MIN(file_system_view_stats.used_kb)', field:'MIN(file_system_view_stats.used_kb)', width:150, name:"MIN (Fs Used Kb)", groupable:false}},
            {select:"MAX(file_system_view_stats.used_kb)", display:{id:'MAX(file_system_view_stats.used_kb)', field:'MAX(file_system_view_stats.used_kb)', width:150, name:"MAX (Fs Used Kb)", groupable:false}},

            {select:"file_system_view_stats.available_kb", display:{id:'file_system_view_stats.available_kb', field:'file_system_view_stats.available_kb', width:150, name:"Fs Available Kb", groupable:false}},
            {select:"SUM(file_system_view_stats.available_kb)", display:{id:'SUM(file_system_view_stats.available_kb)', field:'SUM(file_system_view_stats.available_kb)', width:150, name:"SUM (Fs Available Kb)", groupable:false}},
            {select:"MIN(file_system_view_stats.available_kb)", display:{id:'MIN(file_system_view_stats.available_kb)', field:'MIN(file_system_view_stats.available_kb)', width:150, name:"MIN (Fs Available Kb)", groupable:false}},
            {select:"MAX(file_system_view_stats.available_kb)", display:{id:'MAX(file_system_view_stats.available_kb)', field:'MAX(file_system_view_stats.available_kb)', width:150, name:"MAX (Fs Available Kb)", groupable:false}},

            {select:"file_system_view_stats.used_percentage", display:{id:'file_system_view_stats.used_percentage', field:'file_system_view_stats.used_percentage', width:150, name:"Fs Used %", groupable:false}},
            {select:"SUM(file_system_view_stats.used_percentage)", display:{id:'SUM(file_system_view_stats.used_percentage)', field:'SUM(file_system_view_stats.used_percentage)', width:150, name:"SUM (Fs Used %)", groupable:false}},
            {select:"MIN(file_system_view_stats.used_percentage)", display:{id:'MIN(file_system_view_stats.used_percentage)', field:'MIN(file_system_view_stats.used_percentage)', width:150, name:"MIN (Fs Used %)", groupable:false}},
            {select:"MAX(file_system_view_stats.used_percentage)", display:{id:'MAX(file_system_view_stats.used_percentage)', field:'MAX(file_system_view_stats.used_percentage)', width:150, name:"MAX (Fs Used %)", groupable:false}},


            {select:"file_system_view_stats.physical_disks.disk_name", display:{id:'file_system_view_stats.physical_disks.disk_name', field:'file_system_view_stats.physical_disks.disk_name', width:150, name:"Physical Disk Name", groupable:false}},

            {select:"file_system_view_stats.physical_disks.disk_size_kb", display:{id:'file_system_view_stats.physical_disks.disk_size_kb', field:'file_system_view_stats.physical_disks.disk_size_kb', width:190, name:"Physical Size Kb", groupable:false}},
            {select:"SUM(file_system_view_stats.physical_disks.disk_size_kb)", display:{id:'SUM(file_system_view_stats.physical_disks.disk_size_kb)', field:'SUM(file_system_view_stats.physical_disks.disk_size_kb)', width:190, name:"SUM (Physical Size Kb)", groupable:false}},
            {select:"MIN(file_system_view_stats.physical_disks.disk_size_kb)", display:{id:'MIN(file_system_view_stats.physical_disks.disk_size_kb)', field:'MIN(file_system_view_stats.physical_disks.disk_size_kb)', width:190, name:"MIN (Physical Size Kb)", groupable:false}},
            {select:"MAX(file_system_view_stats.physical_disks.disk_size_kb)", display:{id:'MAX(file_system_view_stats.physical_disks.disk_size_kb)', field:'MAX(file_system_view_stats.physical_disks.disk_size_kb)', width:190, name:"MAX (Physical Size Kb)", groupable:false}},

            {select:"file_system_view_stats.physical_disks.disk_used_kb", display:{id:'file_system_view_stats.physical_disks.disk_used_kb', field:'file_system_view_stats.physical_disks.disk_used_kb', width:190, name:"Physical Disk Used Kb", groupable:false}},
            {select:"SUM(file_system_view_stats.physical_disks.disk_used_kb)", display:{id:'SUM(file_system_view_stats.physical_disks.disk_used_kb)', field:'SUM(file_system_view_stats.physical_disks.disk_used_kb)', width:190, name:"SUM (Physical Disk Used Kb)", groupable:false}},
            {select:"MIN(file_system_view_stats.physical_disks.disk_used_kb)", display:{id:'MIN(file_system_view_stats.physical_disks.disk_used_kb)', field:'MIN(file_system_view_stats.physical_disks.disk_used_kb)', width:190, name:"MIN (Physical Disk Used Kb)", groupable:false}},
            {select:"MAX(file_system_view_stats.physical_disks.disk_used_kb)", display:{id:'MAX(file_system_view_stats.physical_disks.disk_used_kb)', field:'MAX(file_system_view_stats.physical_disks.disk_used_kb)', width:190, name:"MAX (Physical Disk Used Kb)", groupable:false}},

            {select:"file_system_view_stats.physical_disks.disk_available_kb", display:{id:'file_system_view_stats.physical_disks.disk_available_kb', field:'file_system_view_stats.physical_disks.disk_available_kb', width:220, name:"Physical Disk Available Kb", groupable:false}},
            {select:"SUM(file_system_view_stats.physical_disks.disk_available_kb)", display:{id:'SUM(file_system_view_stats.physical_disks.disk_available_kb)', field:'SUM(file_system_view_stats.physical_disks.disk_available_kb)', width:220, name:"SUM (Physical Disk Available Kb)", groupable:false}},
            {select:"MIN(file_system_view_stats.physical_disks.disk_available_kb)", display:{id:'MIN(file_system_view_stats.physical_disks.disk_available_kb)', field:'MIN(file_system_view_stats.physical_disks.disk_available_kb)', width:220, name:"MIN (Physical Disk Available Kb)", groupable:false}},
            {select:"MAX(file_system_view_stats.physical_disks.disk_available_kb)", display:{id:'MAX(file_system_view_stats.physical_disks.disk_available_kb)', field:'MAX(file_system_view_stats.physical_disks.disk_available_kb)', width:220, name:"MAX (Physical Disk Available Kb)", groupable:false}},

            {select:"file_system_view_stats.physical_disks.disk_used_percentage", display:{id:'file_system_view_stats.physical_disks.disk_used_percentage', field:'file_system_view_stats.physical_disks.disk_used_percentage', width:190, name:"Physical Disk Used %", groupable:false}},
            {select:"SUM(file_system_view_stats.physical_disks.disk_used_percentage)", display:{id:'SUM(file_system_view_stats.physical_disks.disk_used_percentage)', field:'SUM(file_system_view_stats.physical_disks.disk_used_percentage)', width:190, name:"SUM (Physical Disk Used %)", groupable:false}},
            {select:"MIN(file_system_view_stats.physical_disks.disk_used_percentage)", display:{id:'MIN(file_system_view_stats.physical_disks.disk_used_percentage)', field:'MIN(file_system_view_stats.physical_disks.disk_used_percentage)', width:190, name:"MIN (Physical Disk Used %)", groupable:false}},
            {select:"MAX(file_system_view_stats.physical_disks.disk_used_percentage)", display:{id:'MAX(file_system_view_stats.physical_disks.disk_used_percentage)', field:'MAX(file_system_view_stats.physical_disks.disk_used_percentage)', width:190, name:"MAX (Physical Disk Used %)", groupable:false}},
        ],

        "StatTable.SandeshMessageStat.msg_info" : [
            {select:"COUNT(msg_info)", display:{id:'COUNT(msg_info)', field:'COUNT(msg_info)', width:150, name:"Count (Msg Info)", groupable:false}},
            {select:"msg_info.type", display:{id:'msg_info.type', field:'msg_info.type', width:210, name:"Message Type", groupable:false}},
            {select:"msg_info.level", display:{id:'msg_info.level', field:'msg_info.level', width:150, name:"Message Level", groupable:false}},

            {select:"msg_info.messages", display:{id:'msg_info.messages', field:'msg_info.messages', width:150, name:"Messages", groupable:false}},
            {select:"SUM(msg_info.messages)", display:{id:'SUM(msg_info.messages)', field:'SUM(msg_info.messages)', width:150, name:"SUM (Messages)", groupable:false}},
            {select:"MIN(msg_info.messages)", display:{id:'MIN(msg_info.messages)', field:'MIN(msg_info.messages)', width:150, name:"MIN (Messages)", groupable:false}},
            {select:"MAX(msg_info.messages)", display:{id:'MAX(msg_info.messages)', field:'MAX(msg_info.messages)', width:150, name:"MAX (Messages)", groupable:false}},

            {select:"msg_info.bytes", display:{id:'msg_info.bytes', field:'msg_info.messages', width:150, name:"Bytes", groupable:false}},
            {select:"SUM(msg_info.bytes)", display:{id:'SUM(msg_info.bytes)', field:'SUM(msg_info.bytes)', width:150, name:"SUM (Bytes)", groupable:false}},
            {select:"MIN(msg_info.bytes)", display:{id:'MIN(msg_info.bytes)', field:'MIN(msg_info.bytes)', width:150, name:"MIN (Bytes)", groupable:false}},
            {select:"MAX(msg_info.bytes)", display:{id:'MAX(msg_info.bytes)', field:'MAX(msg_info.bytes)', width:150, name:"MAX (Bytes)", groupable:false}}

        ],
        "StatTable.GeneratorDbStats.table_info" : [
            {select:"COUNT(table_info)", display:{id:'COUNT(table_info)', field:'COUNT(table_info)', width:150, name:"Count (Table Info)", groupable:false}},
            {select:"table_info.table_name", display:{id:'table_info.table_name', field:'table_info.table_name', width:150, name:"Table Name", groupable:false}},

            {select:"table_info.reads", display:{id:'table_info.reads', field:'table_info.reads', width:150, name:"Reads", groupable:false}},
            {select:"SUM(table_info.reads)", display:{id:'SUM(table_info.reads)', field:'SUM(table_info.reads)', width:150, name:"SUM (Reads)", groupable:false}},
            {select:"MIN(table_info.reads)", display:{id:'MIN(table_info.reads)', field:'MIN(table_info.reads)', width:150, name:"MIN (Reads)", groupable:false}},
            {select:"MAX(table_info.reads)", display:{id:'MAX(table_info.reads)', field:'MAX(table_info.reads)', width:150, name:"MAX (Reads)", groupable:false}},

            {select:"table_info.read_fails", display:{id:'table_info.read_fails', field:'table_info.read_fails', width:150, name:"Read Fails", groupable:false}},
            {select:"SUM(table_info.read_fails)", display:{id:'SUM(table_info.read_fails)', field:'SUM(table_info.read_fails)', width:150, name:"SUM (Read Fails)", groupable:false}},
            {select:"MIN(table_info.read_fails)", display:{id:'MIN(table_info.read_fails)', field:'MIN(table_info.read_fails)', width:150, name:"MIN (Read Fails)", groupable:false}},
            {select:"MAX(table_info.read_fails)", display:{id:'MAX(table_info.read_fails)', field:'MAX(table_info.read_fails)', width:150, name:"MAX (Read Fails)", groupable:false}},

            {select:"table_info.writes", display:{id:'table_info.writes', field:'table_info.writes', width:150, name:"Writes", groupable:false}},
            {select:"SUM(table_info.writes)", display:{id:'SUM(table_info.writes)', field:'SUM(table_info.writes)', width:150, name:"SUM (Writes)", groupable:false}},
            {select:"MIN(table_info.writes)", display:{id:'MIN(table_info.writes)', field:'MIN(table_info.writes)', width:150, name:"MIN (Writes)", groupable:false}},
            {select:"MAX(table_info.writes)", display:{id:'MAX(table_info.writes)', field:'MAX(table_info.writes)', width:150, name:"MAX (Writes)", groupable:false}},

            {select:"table_info.write_fails", display:{id:'table_info.write_fails', field:'table_info.write_fails', width:150, name:"Write Fails", groupable:false}},
            {select:"SUM(table_info.write_fails)", display:{id:'SUM(table_info.write_fails)', field:'SUM(table_info.write_fails)', width:150, name:"SUM (Write Fails)", groupable:false}},
            {select:"MIN(table_info.write_fails)", display:{id:'MIN(table_info.write_fails)', field:'MIN(table_info.write_fails)', width:150, name:"MIN (Write Fails)", groupable:false}},
            {select:"MAX(table_info.write_fails)", display:{id:'MAX(table_info.write_fails)', field:'MAX(table_info.write_fails)', width:150, name:"MAX (Write Fails)", groupable:false}}
        ],
        "StatTable.GeneratorDbStats.statistics_table_info" : [
            {select:"COUNT(statistics_table_info)", display:{id:'COUNT(statistics_table_info)', field:'COUNT(statistics_table_info)', width:150, name:"Count (Table Info)", groupable:false}},
            {select:"statistics_table_info.table_name", display:{id:'statistics_table_info.table_name', field:'statistics_table_info.table_name', width:250, name:"Table Name", groupable:false}},

            {select:"statistics_table_info.reads", display:{id:'statistics_table_info.reads', field:'statistics_table_info.reads', width:150, name:"Reads", groupable:false}},
            {select:"SUM(statistics_table_info.reads)", display:{id:'SUM(statistics_table_info.reads)', field:'SUM(statistics_table_info.reads)', width:150, name:"SUM (Reads)", groupable:false}},
            {select:"MIN(statistics_table_info.reads)", display:{id:'MIN(statistics_table_info.reads)', field:'MIN(statistics_table_info.reads)', width:150, name:"MIN (Reads)", groupable:false}},
            {select:"MAX(statistics_table_info.reads)", display:{id:'MAX(statistics_table_info.reads)', field:'MAX(statistics_table_info.reads)', width:150, name:"MAX (Reads)", groupable:false}},

            {select:"statistics_table_info.read_fails", display:{id:'statistics_table_info.read_fails', field:'statistics_table_info.read_fails', width:150, name:"Read Fails", groupable:false}},
            {select:"SUM(statistics_table_info.read_fails)", display:{id:'SUM(statistics_table_info.read_fails)', field:'SUM(statistics_table_info.read_fails)', width:150, name:"SUM (Read Fails)", groupable:false}},
            {select:"MIN(statistics_table_info.read_fails)", display:{id:'MIN(statistics_table_info.read_fails)', field:'MIN(statistics_table_info.read_fails)', width:150, name:"MIN (Read Fails)", groupable:false}},
            {select:"MAX(statistics_table_info.read_fails)", display:{id:'MAX(statistics_table_info.read_fails)', field:'MAX(statistics_table_info.read_fails)', width:150, name:"MAX (Read Fails)", groupable:false}},

            {select:"statistics_table_info.writes", display:{id:'statistics_table_info.writes', field:'statistics_table_info.writes', width:150, name:"Writes", groupable:false}},
            {select:"SUM(statistics_table_info.writes)", display:{id:'SUM(statistics_table_info.writes)', field:'SUM(statistics_table_info.writes)', width:150, name:"SUM (Writes)", groupable:false}},
            {select:"MIN(statistics_table_info.writes)", display:{id:'MIN(statistics_table_info.writes)', field:'MIN(statistics_table_info.writes)', width:150, name:"MIN (Writes)", groupable:false}},
            {select:"MAX(statistics_table_info.writes)", display:{id:'MAX(statistics_table_info.writes)', field:'MAX(statistics_table_info.writes)', width:150, name:"MAX (Writes)", groupable:false}},

            {select:"statistics_table_info.write_fails", display:{id:'statistics_table_info.write_fails', field:'statistics_table_info.write_fails', width:150, name:"Write Fails", groupable:false}},
            {select:"SUM(statistics_table_info.write_fails)", display:{id:'SUM(statistics_table_info.write_fails)', field:'SUM(statistics_table_info.write_fails)', width:150, name:"SUM (Write Fails)", groupable:false}},
            {select:"MIN(statistics_table_info.write_fails)", display:{id:'MIN(statistics_table_info.write_fails)', field:'MIN(statistics_table_info.write_fails)', width:150, name:"MIN (Write Fails)", groupable:false}},
            {select:"MAX(statistics_table_info.write_fails)", display:{id:'MAX(statistics_table_info.write_fails)', field:'MAX(statistics_table_info.write_fails)', width:150, name:"MAX (Write Fails)", groupable:false}}
        ],
        "StatTable.GeneratorDbStats.errors" : [
            {select:"COUNT(errors)", display:{id:'COUNT(errors)', field:'COUNT(errors)', width:150, name:"Count (Errors)", groupable:false}},

            {select:"errors.write_tablespace_fails", display:{id:'errors.write_tablespace_fails', field:'errors.write_tablespace_fails', width:180, name:"Write Tablespace Fails", groupable:false}},
            {select:"SUM(errors.write_tablespace_fails)", display:{id:'SUM(errors.write_tablespace_fails)', field:'SUM(errors.write_tablespace_fails)', width:200, name:"SUM (Write Tablespace Fails)", groupable:false}},
            {select:"MIN(errors.write_tablespace_fails)", display:{id:'MIN(errors.write_tablespace_fails)', field:'MIN(errors.write_tablespace_fails)', width:200, name:"MIN (Write Tablespace Fails)", groupable:false}},
            {select:"MAX(errors.write_tablespace_fails)", display:{id:'MAX(errors.write_tablespace_fails)', field:'MAX(errors.write_tablespace_fails)', width:200, name:"MAX (Write Tablespace Fails)", groupable:false}},

            {select:"errors.read_tablespace_fails", display:{id:'errors.read_tablespace_fails', field:'errors.read_tablespace_fails', width:200, name:"Read Tablespace Fails", groupable:false}},
            {select:"SUM(errors.read_tablespace_fails)", display:{id:'SUM(errors.read_tablespace_fails)', field:'SUM(errors.read_tablespace_fails)', width:200, name:"SUM (Read Tablespace Fails)", groupable:false}},
            {select:"MIN(errors.read_tablespace_fails)", display:{id:'MIN(errors.read_tablespace_fails)', field:'MIN(errors.read_tablespace_fails)', width:200, name:"MIN (Read Tablespace Fails)", groupable:false}},
            {select:"MAX(errors.read_tablespace_fails)", display:{id:'MAX(errors.read_tablespace_fails)', field:'MAX(errors.read_tablespace_fails)', width:200, name:"MAX (Read Tablespace Fails)", groupable:false}},

            {select:"errors.write_table_fails", display:{id:'errors.write_table_fails', field:'errors.write_table_fails', width:180, name:"Write Table Fails", groupable:false}},
            {select:"SUM(errors.write_table_fails)", display:{id:'SUM(errors.write_table_fails)', field:'SUM(errors.write_table_fails)', width:160, name:"SUM (Write Table Fails)", groupable:false}},
            {select:"MIN(errors.write_table_fails)", display:{id:'MIN(errors.write_table_fails)', field:'MIN(errors.write_table_fails)', width:160, name:"MIN (Write Table Fails)", groupable:false}},
            {select:"MAX(errors.write_table_fails)", display:{id:'MAX(errors.write_table_fails)', field:'MAX(errors.write_table_fails)', width:160, name:"MAX (Write Table Fails)", groupable:false}},

            {select:"errors.read_table_fails", display:{id:'errors.read_table_fails', field:'errors.read_table_fails', width:160, name:"Read Table Fails", groupable:false}},
            {select:"SUM(errors.read_table_fails)", display:{id:'SUM(errors.read_table_fails)', field:'SUM(errors.read_table_fails)', width:160, name:"SUM (Read Table Fails)", groupable:false}},
            {select:"MIN(errors.read_table_fails)", display:{id:'MIN(errors.read_table_fails)', field:'MIN(errors.read_table_fails)', width:160, name:"MIN (Read Table Fails)", groupable:false}},
            {select:"MAX(errors.read_table_fails)", display:{id:'MAX(errors.read_table_fails)', field:'MAX(errors.read_table_fails)', width:160, name:"MAX (Read Table Fails)", groupable:false}},

            {select:"errors.write_column_fails", display:{id:'errors.write_column_fails', field:'errors.write_column_fails', width:180, name:"Write Column Fails", groupable:false}},
            {select:"SUM(errors.write_column_fails)", display:{id:'SUM(errors.write_column_fails)', field:'SUM(errors.write_column_fails)', width:180, name:"SUM (Write Column Fails)", groupable:false}},
            {select:"MIN(errors.write_column_fails)", display:{id:'MIN(errors.write_column_fails)', field:'MIN(errors.write_column_fails)', width:180, name:"MIN (Write Column Fails)", groupable:false}},
            {select:"MAX(errors.write_column_fails)", display:{id:'MAX(errors.write_column_fails)', field:'MAX(errors.write_column_fails)', width:180, name:"MAX (Write Column Fails)", groupable:false}},

            {select:"errors.write_batch_column_fails", display:{id:'errors.write_batch_column_fails', field:'errors.write_batch_column_fails', width:220, name:"Write Column Batch Fails", groupable:false}},
            {select:"SUM(errors.write_batch_column_fails)", display:{id:'SUM(errors.write_batch_column_fails)', field:'SUM(errors.write_batch_column_fails)', width:220, name:"SUM (Write Column Batch Fails)", groupable:false}},
            {select:"MIN(errors.write_batch_column_fails)", display:{id:'MIN(errors.write_batch_column_fails)', field:'MIN(errors.write_batch_column_fails)', width:220, name:"MIN (Write Column Batch Fails)", groupable:false}},
            {select:"MAX(errors.write_batch_column_fails)", display:{id:'MAX(errors.write_batch_column_fails)', field:'MAX(errors.write_batch_column_fails)', width:220, name:"MAX (Write Column Batch Fails)", groupable:false}},

            {select:"errors.read_column_fails", display:{id:'errors.read_column_fails', field:'errors.read_column_fails', width:180, name:"Read Column Fails", groupable:false}},
            {select:"SUM(errors.read_column_fails)", display:{id:'SUM(errors.read_column_fails)', field:'SUM(errors.read_column_fails)', width:180, name:"SUM (Read Column Fails)", groupable:false}},
            {select:"MIN(errors.read_column_fails)", display:{id:'MIN(errors.read_column_fails)', field:'MIN(errors.read_column_fails)', width:180, name:"MIN (Read Column Fails)", groupable:false}},
            {select:"MAX(errors.read_column_fails)", display:{id:'MAX(errors.read_column_fails)', field:'MAX(errors.read_column_fails)', width:180, name:"MAX (Read Column Fails)", groupable:false}}
        ],
        "StatTable.FieldNames.fields" : [
            {select:"COUNT(fields)", display:{id:'COUNT(fields)', field:'COUNT(fields)', width:150, name:"Count (Field String)", groupable:false}},
            {select:"fields.value", display:{id:'fields.value', field:'fields.value', width:500, name:"Value", groupable:false}}
        ],
        "StatTable.FieldNames.fieldi" : [
            {select:"COUNT(fieldi)", display:{id:'COUNT(fieldi)', field:'COUNT(fieldi)', width:150, name:"Count (Field Integer)", groupable:false}},
            {select:"fieldi.value", display:{id:'fieldi.value', field:'fieldi.value', width:150, name:"Value", groupable:false}},
            {select:"SUM(fieldi.value)", display:{id:'SUM(fieldi.value)', field:'SUM(fieldi.value)', width:150, name:"SUM (Value)", groupable:false}},
            {select:"MIN(fieldi.value)", display:{id:'MIN(fieldi.value)', field:'MIN(fieldi.value)', width:150, name:"MIN (Value)", groupable:false}},
            {select:"MAX(fieldi.value)", display:{id:'MAX(fieldi.value)', field:'MAX(fieldi.value)', width:150, name:"MAX (Value)", groupable:false}}
        ],
        "StatTable.QueryPerfInfo.query_stats" : [
            {select:"COUNT(query_stats)", display:{id:'COUNT(query_stats)', field:'COUNT(query_stats)', width:150, name:"Count (Query Stats)", groupable:false}},
            {select:"table", display:{id:'table', field:'table', width:150, name:"Table", groupable:false}},

            {select:"query_stats.time", display:{id:'query_stats.time', field:'query_stats.time', width:150, name:"Query Time", groupable:false}},
            {select:"SUM(query_stats.time)", display:{id:'SUM(query_stats.time)', field:'SUM(query_stats.time)', width:150, name:"SUM (Time Taken)", groupable:false}},
            {select:"MIN(query_stats.time)", display:{id:'MIN(query_stats.time)', field:'MIN(query_stats.time)', width:150, name:"MIN (Time Taken)", groupable:false}},
            {select:"MAX(query_stats.time)", display:{id:'MAX(query_stats.time)', field:'MAX(query_stats.time)', width:150, name:"MAX (Time Taken)", groupable:false}},

            {select:"query_stats.rows", display:{id:'query_stats.rows', field:'query_stats.rows', width:120, name:"Rows Returned", groupable:false}},
            {select:"SUM(query_stats.rows)", display:{id:'SUM(query_stats.rows)', field:'SUM(query_stats.rows)', width:150, name:"SUM (Rows Returned)", groupable:false}},
            {select:"MIN(query_stats.rows)", display:{id:'MIN(query_stats.rows)', field:'MIN(query_stats.rows)', width:150, name:"MIN (Rows Returned)", groupable:false}},
            {select:"MAX(query_stats.rows)", display:{id:'MAX(query_stats.rows)', field:'MAX(query_stats.rows)', width:150, name:"MAX (Rows Returned)", groupable:false}},

            {select:"query_stats.qid", display:{id:'query_stats.qid', field:'query_stats.qid', width:280, name:"Query Id", groupable:false}},
            {select:"query_stats.where", display:{id:'query_stats.where', field:'query_stats.where', width:300, name:"Where", groupable:false}},
            {select:"query_stats.select", display:{id:'query_stats.select', field:'query_stats.select', width:300, name:"Select", groupable:false}},
            {select:"query_stats.post", display:{id:'query_stats.post', field:'query_stats.post', width:300, name:"Filter", groupable:false}},

            {select:"query_stats.time_span", display:{id:'query_stats.time_span', field:'query_stats.time_span', width:150, name:"Time Span", groupable:false}},
            {select:"SUM(query_stats.time_span)", display:{id:'SUM(query_stats.time_span)', field:'SUM(query_stats.time_span)', width:150, name:"SUM (Time Span)", groupable:false}},
            {select:"MIN(query_stats.time_span)", display:{id:'MIN(query_stats.time_span)', field:'MIN(query_stats.time_span)', width:150, name:"MIN (Time Span)", groupable:false}},
            {select:"MAX(query_stats.time_span)", display:{id:'MAX(query_stats.time_span)', field:'MAX(query_stats.time_span)', width:150, name:"MAX (Time Span)", groupable:false}},

            {select:"query_stats.chunks", display:{id:'query_stats.chunks', field:'query_stats.chunks', width:150, name:"Chunks", groupable:false}},
            {select:"SUM(query_stats.chunks)", display:{id:'SUM(query_stats.chunks)', field:'SUM(query_stats.chunks)', width:150, name:"SUM (Chunks)", groupable:false}},
            {select:"MIN(query_stats.chunks)", display:{id:'MIN(query_stats.chunks)', field:'MIN(query_stats.chunks)', width:150, name:"MIN (Chunks)", groupable:false}},
            {select:"MAX(query_stats.chunks)", display:{id:'MAX(query_stats.chunks)', field:'MAX(query_stats.chunks)', width:150, name:"MAX (Chunks)", groupable:false}},

            {select:"query_stats.chunk_where_time", display:{id:'query_stats.chunk_where_time', field:'query_stats.chunk_where_time', width:170, name:"Chunk Where Time", groupable:false}},
            {select:"query_stats.chunk_select_time", display:{id:'query_stats.chunk_select_time', field:'query_stats.chunk_select_time', width:170, name:"Chunk Select Time", groupable:false}},
            {select:"query_stats.chunk_postproc_time", display:{id:'query_stats.chunk_postproc_time', field:'query_stats.chunk_postproc_time', width:170, name:"Chunk Postproc Time", groupable:false}},
            {select:"query_stats.chunk_merge_time", display:{id:'query_stats.chunk_merge_time', field:'query_stats.chunk_merge_time', width:170, name:"Chunk Merge Time", groupable:false}},

            {select:"query_stats.final_merge_time", display:{id:'query_stats.final_merge_time', field:'query_stats.final_merge_time', width:170, name:"Final Merge Time", groupable:false}},
            {select:"SUM(query_stats.final_merge_time)", display:{id:'SUM(query_stats.final_merge_time)', field:'SUM(query_stats.final_merge_time)', width:170, name:"SUM (Final Merge Time)", groupable:false}},
            {select:"MIN(query_stats.final_merge_time)", display:{id:'MIN(query_stats.final_merge_time)', field:'MIN(query_stats.final_merge_time)', width:170, name:"MIN (Final Merge Time)", groupable:false}},
            {select:"MAX(query_stats.final_merge_time)", display:{id:'MAX(query_stats.final_merge_time)', field:'MAX(query_stats.final_merge_time)', width:170, name:"MAX (Final Merge Time)", groupable:false}},

            {select:"query_stats.enq_delay", display:{id:'query_stats.enq_delay', field:'query_stats.enq_delay', width:170, name:"Enq Delay", groupable:false}},
            {select:"SUM(query_stats.enq_delay)", display:{id:'SUM(query_stats.enq_delay)', field:'SUM(query_stats.enq_delay)', width:170, name:"SUM (Enq Delay)", groupable:false}},
            {select:"MIN(query_stats.enq_delay)", display:{id:'MIN(query_stats.enq_delay)', field:'MIN(query_stats.enq_delay)', width:170, name:"MIN (Enq Delay)", groupable:false}},
            {select:"MAX(query_stats.enq_delay)", display:{id:'MAX(query_stats.enq_delay)', field:'MAX(query_stats.enq_delay)', width:170, name:"MAX (Enq Delay)", groupable:false}},

            {select:"query_stats.error", display:{id:'query_stats.error', field:'query_stats.error', width:100, name:"Error", groupable:false}}
        ],
        "StatTable.UveVirtualNetworkAgent.vn_stats" : [
            {select:"COUNT(vn_stats)", display:{id:'COUNT(vn_stats)', field:'COUNT(vn_stats)', width:120, name:"Count (VN Stats)", groupable:false}},
            {select:"vn_stats.other_vn", display:{id:'vn_stats.other_vn', field:'vn_stats.other_vn', width:250, name:"Other VN", groupable:false}},
            {select:"vn_stats.vrouter", display:{id:'vn_stats.vrouter', field:'vn_stats.vrouter', width:120, title:"vRouter", groupable:false}},

            {select:"vn_stats.in_tpkts", display:{id:'vn_stats.in_tpkts', field:'vn_stats.in_tpkts', width:150, name:"In Packets", groupable:false}},
            {select:"SUM(vn_stats.in_tpkts)", display:{id:'SUM(vn_stats.in_tpkts)', field:'SUM(vn_stats.in_tpkts)', width:150, name:"SUM (In Packets)", groupable:false}},
            {select:"MIN(vn_stats.in_tpkts)", display:{id:'MIN(vn_stats.in_tpkts)', field:'MIN(vn_stats.in_tpkts)', width:150, name:"MIN (In Packets)", groupable:false}},
            {select:"MAX(vn_stats.in_tpkts)", display:{id:'MAX(vn_stats.in_tpkts)', field:'MAX(vn_stats.in_tpkts)', width:150, name:"MAX (In Packets)", groupable:false}},

            {select:"vn_stats.in_bytes", display:{id:'vn_stats.in_bytes', field:'vn_stats.in_bytes', width:120, name:"In Bytes", groupable:false}},
            {select:"SUM(vn_stats.in_bytes)", display:{id:'SUM(vn_stats.in_bytes)', field:'SUM(vn_stats.in_bytes)', width:120, name:"SUM (In Bytes)", groupable:false}},
            {select:"MIN(vn_stats.in_bytes)", display:{id:'MIN(vn_stats.in_bytes)', field:'MIN(vn_stats.in_bytes)', width:120, name:"MIN (In Bytes)", groupable:false}},
            {select:"MAX(vn_stats.in_bytes)", display:{id:'MAX(vn_stats.in_bytes)', field:'MAX(vn_stats.in_bytes)', width:120, name:"MAX (In Bytes)", groupable:false}},


            {select:"vn_stats.out_tpkts", display:{id:'vn_stats.out_tpkts', field:'vn_stats.out_tpkts', width:150, name:"Out Packets", groupable:false}},
            {select:"SUM(vn_stats.out_tpkts)", display:{id:'SUM(vn_stats.out_tpkts)', field:'SUM(vn_stats.out_tpkts)', width:150, name:"SUM (Out Packets)", groupable:false}},
            {select:"MIN(vn_stats.out_tpkts)", display:{id:'MIN(vn_stats.out_tpkts)', field:'MIN(vn_stats.out_tpkts)', width:150, name:"MIN (Out Packets)", groupable:false}},
            {select:"MAX(vn_stats.out_tpkts)", display:{id:'MAX(vn_stats.out_tpkts)', field:'MAX(vn_stats.out_tpkts)', width:150, name:"MAX (Out Packets)", groupable:false}},

            {select:"vn_stats.out_bytes", display:{id:'vn_stats.out_bytes', field:'vn_stats.out_bytes', width:120, name:"Out Bytes", groupable:false}},
            {select:"SUM(vn_stats.out_bytes)", display:{id:'SUM(vn_stats.out_bytes)', field:'SUM(vn_stats.out_bytes)', width:120, name:"SUM (Out Bytes)", groupable:false}},
            {select:"MIN(vn_stats.out_bytes)", display:{id:'MIN(vn_stats.out_bytes)', field:'MIN(vn_stats.out_bytes)', width:120, name:"MIN (Out Bytes)", groupable:false}},
            {select:"MAX(vn_stats.out_bytes)", display:{id:'MAX(vn_stats.out_bytes)', field:'MAX(vn_stats.out_bytes)', width:120, name:"MAX (Out Bytes)", groupable:false}}
        ],
        "StatTable.DatabasePurgeInfo.stats" : [
            {select:"COUNT(stats)", display:{id:'COUNT(stats)', field:'COUNT(stats)', width:120, name:"Count (Stats)", groupable:false}},
            {select:"stats.purge_id", display:{id:'stats.purge_id', field:'stats.purge_id', width:280, name:"Purge Id", groupable:false}},
            {select:"stats.purge_status", display:{id:'stats.purge_status', field:'stats.purge_status', width:280, name:"Purge Status", groupable:false}},
            {select:"stats.purge_status_details", display:{id:'stats.purge_status_details', field:'stats.purge_status_details', width:280, name:"Purge Status Details", groupable:false}},

            {select:"stats.request_time", display:{id:'stats.request_time', field:'stats.request_time', width:280, name:"Request Time", groupable:false}},
            {select:"SUM(stats.request_time)", display:{id:'SUM(stats.request_time)', field:'SUM(stats.request_time)', width:280, name:"SUM (Request Time)", groupable:false}},
            {select:"MIN(stats.request_time)", display:{id:'MIN(stats.request_time)', field:'MIN(stats.request_time)', width:280, name:"MIN (Request Time)", groupable:false}},
            {select:"MAX(stats.request_time)", display:{id:'MAX(stats.request_time)', field:'MAX(stats.request_time)', width:280, name:"MAX (Request Time)", groupable:false}},

            {select:"stats.rows_deleted", display:{id:'stats.rows_deleted', field:'stats.rows_deleted', width:150, name:"Rows Deleted", groupable:false}},
            {select:"SUM(stats.rows_deleted)", display:{id:'SUM(stats.rows_deleted)', field:'SUM(stats.rows_deleted)', width:150, name:"SUM (Rows Deleted)", groupable:false}},
            {select:"MIN(stats.rows_deleted)", display:{id:'MIN(stats.rows_deleted)', field:'MIN(stats.rows_deleted)', width:150, name:"MIN (Rows Deleted)", groupable:false}},
            {select:"MAX(stats.rows_deleted)", display:{id:'MAX(stats.rows_deleted)', field:'MAX(stats.rows_deleted)', width:150, name:"MAX (Rows Deleted)", groupable:false}},

            {select:"stats.duration", display:{id:'stats.duration', field:'stats.duration', width:280, name:"Time Duration", groupable:false}},
            {select:"SUM(stats.duration)", display:{id:'SUM(stats.duration)', field:'SUM(stats.duration)', width:280, name:"SUM (Time Duration)", groupable:false}},
            {select:"MIN(stats.duration)", display:{id:'MIN(stats.duration)', field:'MIN(stats.duration)', width:280, name:"MIN (Time Duration)", groupable:false}},
            {select:"MAX(stats.duration)", display:{id:'MAX(stats.duration)', field:'MAX(stats.duration)', width:280, name:"MAX (Time Duration)", groupable:false}}
        ],
        "StatTable.DatabaseUsageInfo.database_usage" : [
            {select:"COUNT(database_usage)", display:{id:'COUNT(database_usage)', field:'COUNT(database_usage)', width:170, name:"Count (DB Usage Stats)", groupable:false}},

            {select:"database_usage.disk_space_used_1k", display:{id:'database_usage.disk_space_used_1k', field:'database_usage.disk_space_used_1k', width:200, name:"Disk Space Used 1k", groupable:false}},
            {select:"SUM(database_usage.disk_space_used_1k)", display:{id:'SUM(database_usage.disk_space_used_1k)', field:'SUM(database_usage.disk_space_used_1k)', width:200, name:"SUM (Disk Space Used 1k)", groupable:false}},
            {select:"MIN(database_usage.disk_space_used_1k)", display:{id:'MIN(database_usage.disk_space_used_1k)', field:'MIN(database_usage.disk_space_used_1k)', width:200, name:"MIN (Disk Space Used 1k)", groupable:false}},
            {select:"MAX(database_usage.disk_space_used_1k)", display:{id:'MAX(database_usage.disk_space_used_1k)', field:'MAX(database_usage.disk_space_used_1k)', width:200, name:"MAX (Disk Space Used 1k)", groupable:false}},

            {select:"database_usage.disk_space_available_1k", display:{id:'database_usage.disk_space_available_1k', field:'database_usage.disk_space_available_1k', width:200, name:"Disk Space Avail 1k", groupable:false}},
            {select:"SUM(database_usage.disk_space_available_1k)", display:{id:'SUM(database_usage.disk_space_available_1k)', field:'SUM(database_usage.disk_space_available_1k)', width:200, name:"SUM (Disk Space Avail 1k)", groupable:false}},
            {select:"MIN(database_usage.disk_space_available_1k)", display:{id:'MIN(database_usage.disk_space_available_1k)', field:'MIN(database_usage.disk_space_available_1k)', width:200, name:"MIN (Disk Space Avail 1k)", groupable:false}},
            {select:"MAX(database_usage.disk_space_available_1k)", display:{id:'MAX(database_usage.disk_space_available_1k)', field:'MAX(database_usage.disk_space_available_1k)', width:200, name:"MAX (Disk Space Avail 1k)", groupable:false}},

            {select:"database_usage.analytics_db_size_1k", display:{id:'database_usage.analytics_db_size_1k', field:'database_usage.analytics_db_size_1k', width:200, name:"Analytics DB Size 1k", groupable:false}},
            {select:"SUM(database_usage.analytics_db_size_1k)", display:{id:'SUM(database_usage.analytics_db_size_1k)', field:'SUM(database_usage.analytics_db_size_1k)', width:200, name:"SUM (Analytics DB Size 1k)", groupable:false}},
            {select:"MIN(database_usage.analytics_db_size_1k)", display:{id:'MIN(database_usage.analytics_db_size_1k)', field:'MIN(database_usage.analytics_db_size_1k)', width:200, name:"MIN (Analytics DB Size 1k)", groupable:false}},
            {select:"MAX(database_usage.analytics_db_size_1k)", display:{id:'MAX(database_usage.analytics_db_size_1k)', field:'MAX(database_usage.analytics_db_size_1k)', width:200, name:"MAX (Analytics DB Size 1k)", groupable:false}}
        ],
        "StatTable.ProtobufCollectorStats.tx_socket_stats" : [
            {select:"COUNT(tx_socket_stats)", display:{id:'COUNT(tx_socket_stats)', field:'COUNT(tx_socket_stats)', width:200, name:"Count (Send Socket Stats)", groupable:false}},
            {select:"tx_socket_stats.average_blocked_duration", display:{id:'tx_socket_stats.average_blocked_duration', field:'tx_socket_stats.average_blocked_duration', width:150, name:"Avg Blocked Duration", groupable:false}},
            {select:"tx_socket_stats.blocked_duration", display:{id:'tx_socket_stats.average_blocked_duration', field:'tx_socket_stats.average_blocked_duration', width:150, name:"Blocked Duration", groupable:false}},

            {select:"tx_socket_stats.bytes", display:{id:'tx_socket_stats.bytes', field:'tx_socket_stats.bytes', width:150, name:"Bytes", groupable:false}},
            {select:"SUM(tx_socket_stats.bytes)", display:{id:'SUM(tx_socket_stats.bytes)', field:'SUM(tx_socket_stats.bytes)', width:150, name:"SUM (Bytes)", groupable:false}},
            {select:"MIN(tx_socket_stats.bytes)", display:{id:'MIN(tx_socket_stats.bytes)', field:'MIN(tx_socket_stats.bytes)', width:150, name:"MIN (Bytes)", groupable:false}},
            {select:"MAX(tx_socket_stats.bytes)", display:{id:'MAX(tx_socket_stats.bytes)', field:'MAX(tx_socket_stats.bytes)', width:150, name:"MAX (Bytes)", groupable:false}},

            {select:"tx_socket_stats.calls", display:{id:'tx_socket_stats.calls', field:'tx_socket_stats.calls', width:150, name:"Calls", groupable:false}},
            {select:"SUM(tx_socket_stats.calls)", display:{id:'SUM(tx_socket_stats.calls)', field:'SUM(tx_socket_stats.calls)', width:150, name:"SUM (Calls)", groupable:false}},
            {select:"MIN(tx_socket_stats.calls)", display:{id:'MIN(tx_socket_stats.calls)', field:'MIN(tx_socket_stats.calls)', width:150, name:"MIN (Calls)", groupable:false}},
            {select:"MAX(tx_socket_stats.calls)", display:{id:'MAX(tx_socket_stats.calls)', field:'MAX(tx_socket_stats.calls)', width:150, name:"MAX (Calls)", groupable:false}},

            {select:"tx_socket_stats.average_bytes", display:{id:'tx_socket_stats.average_bytes', field:'tx_socket_stats.average_bytes', width:180, name:"Avg Bytes", groupable:false}},
            {select:"SUM(tx_socket_stats.average_bytes)", display:{id:'SUM(tx_socket_stats.average_bytes)', field:'SUM(tx_socket_stats.average_bytes)', width:180, name:"SUM (Avg Bytes)", groupable:false}},
            {select:"MIN(tx_socket_stats.average_bytes)", display:{id:'MIN(tx_socket_stats.average_bytes)', field:'MIN(tx_socket_stats.average_bytes)', width:180, name:"MIN (Avg Bytes)", groupable:false}},
            {select:"MAX(tx_socket_stats.average_bytes)", display:{id:'MAX(tx_socket_stats.average_bytes)', field:'MAX(tx_socket_stats.average_bytes)', width:180, name:"MAX (Avg Bytes)", groupable:false}},

            {select:"tx_socket_stats.errors", display:{id:'tx_socket_stats.errors', field:'tx_socket_stats.errors', width:150, name:"Errors", groupable:false}},
            {select:"SUM(tx_socket_stats.errors)", display:{id:'SUM(tx_socket_stats.errors)', field:'SUM(tx_socket_stats.errors)', width:150, name:"SUM (Errors)", groupable:false}},
            {select:"MIN(tx_socket_stats.errors)", display:{id:'MIN(tx_socket_stats.errors)', field:'MIN(tx_socket_stats.errors)', width:150, name:"MIN (Errors)", groupable:false}},
            {select:"MAX(tx_socket_stats.errors)", display:{id:'MAX(tx_socket_stats.errors)', field:'MAX(tx_socket_stats.errors)', width:150, name:"MAX (Errors)", groupable:false}},

            {select:"tx_socket_stats.blocked_count", display:{id:'tx_socket_stats.blocked_count', field:'tx_socket_stats.blocked_count', width:180, name:"Blocked Count", groupable:false}},
            {select:"SUM(tx_socket_stats.blocked_count)", display:{id:'SUM(tx_socket_stats.blocked_count)', field:'SUM(tx_socket_stats.blocked_count)', width:180, name:"SUM (Blocked Count)", groupable:false}},
            {select:"MIN(tx_socket_stats.blocked_count)", display:{id:'MIN(tx_socket_stats.blocked_count)', field:'MIN(tx_socket_stats.blocked_count)', width:180, name:"MIN (Blocked Count)", groupable:false}},
            {select:"MAX(tx_socket_stats.blocked_count)", display:{id:'MAX(tx_socket_stats.blocked_count)', field:'MAX(tx_socket_stats.blocked_count)', width:180, name:"MAX (Blocked Count)", groupable:false}}
        ],
        "StatTable.ProtobufCollectorStats.rx_socket_stats" : [
            {select:"COUNT(rx_socket_stats)", display:{id:'COUNT(rx_socket_stats)', field:'COUNT(rx_socket_stats)', width:200, name:"Count (Receive Socket Stats)", groupable:false}},
            {select:"rx_socket_stats.blocked_duration", display:{id:'rx_socket_stats.average_blocked_duration', field:'rx_socket_stats.blocked_duration', width:180, name:"Blocked Duration", groupable:false}},
            {select:"rx_socket_stats.average_blocked_duration", display:{id:'rx_socket_stats.average_blocked_duration', field:'rx_socket_stats.average_blocked_duration', width:160, name:"Avg Blocked Duration", groupable:false}},

            {select:"rx_socket_stats.bytes", display:{id:'rx_socket_stats.bytes', field:'rx_socket_stats.bytes', width:150, name:"Bytes", groupable:false}},
            {select:"SUM(rx_socket_stats.bytes)", display:{id:'SUM(rx_socket_stats.bytes)', field:'SUM(rx_socket_stats.bytes)', width:150, name:"SUM (Bytes)", groupable:false}},
            {select:"MIN(rx_socket_stats.bytes)", display:{id:'MIN(rx_socket_stats.bytes)', field:'MIN(rx_socket_stats.bytes)', width:150, name:"MIN (Bytes)", groupable:false}},
            {select:"MAX(rx_socket_stats.bytes)", display:{id:'MAX(rx_socket_stats.bytes)', field:'MAX(rx_socket_stats.bytes)', width:150, name:"MAX (Bytes)", groupable:false}},

            {select:"rx_socket_stats.calls", display:{id:'rx_socket_stats.calls', field:'rx_socket_stats.calls', width:150, name:"Calls", groupable:false}},
            {select:"SUM(rx_socket_stats.calls)", display:{id:'SUM(rx_socket_stats.calls)', field:'SUM(rx_socket_stats.calls)', width:150, name:"SUM (Calls)", groupable:false}},
            {select:"MIN(rx_socket_stats.calls)", display:{id:'MIN(rx_socket_stats.calls)', field:'MIN(rx_socket_stats.calls)', width:150, name:"MIN (Calls)", groupable:false}},
            {select:"MAX(rx_socket_stats.calls)", display:{id:'MAX(rx_socket_stats.calls)', field:'MAX(rx_socket_stats.calls)', width:150, name:"MAX (Calls)", groupable:false}},

            {select:"rx_socket_stats.average_bytes", display:{id:'rx_socket_stats.average_bytes', field:'rx_socket_stats.average_bytes', width:180, name:"Avg Bytes", groupable:false}},
            {select:"SUM(rx_socket_stats.average_bytes)", display:{id:'SUM(rx_socket_stats.average_bytes)', field:'SUM(rx_socket_stats.average_bytes)', width:180, name:"SUM (Avg Bytes)", groupable:false}},
            {select:"MIN(rx_socket_stats.average_bytes)", display:{id:'MIN(rx_socket_stats.average_bytes)', field:'MIN(rx_socket_stats.average_bytes)', width:180, name:"MIN (Avg Bytes)", groupable:false}},
            {select:"MAX(rx_socket_stats.average_bytes)", display:{id:'MAX(rx_socket_stats.average_bytes)', field:'MAX(rx_socket_stats.average_bytes)', width:180, name:"MAX (Avg Bytes)", groupable:false}},

            {select:"rx_socket_stats.errors", display:{id:'rx_socket_stats.errors', field:'rx_socket_stats.errors', width:150, name:"Errors", groupable:false}},
            {select:"SUM(rx_socket_stats.errors)", display:{id:'SUM(rx_socket_stats.errors)', field:'SUM(rx_socket_stats.errors)', width:150, name:"SUM (Errors)", groupable:false}},
            {select:"MIN(rx_socket_stats.errors)", display:{id:'MIN(rx_socket_stats.errors)', field:'MIN(rx_socket_stats.errors)', width:150, name:"MIN (Errors)", groupable:false}},
            {select:"MAX(rx_socket_stats.errors)", display:{id:'MAX(rx_socket_stats.errors)', field:'MAX(rx_socket_stats.errors)', width:150, name:"MAX (Errors)", groupable:false}},

            {select:"rx_socket_stats.blocked_count", display:{id:'rx_socket_stats.blocked_count', field:'rx_socket_stats.blocked_count', width:180, name:"Blocked Count", groupable:false}},
            {select:"SUM(rx_socket_stats.blocked_count)", display:{id:'SUM(rx_socket_stats.blocked_count)', field:'SUM(rx_socket_stats.blocked_count)', width:180, name:"SUM (Blocked Count)", groupable:false}},
            {select:"MIN(rx_socket_stats.blocked_count)", display:{id:'MIN(rx_socket_stats.blocked_count)', field:'MIN(rx_socket_stats.blocked_count)', width:180, name:"MIN (Blocked Count)", groupable:false}},
            {select:"MAX(rx_socket_stats.blocked_count)", display:{id:'MAX(rx_socket_stats.blocked_count)', field:'MAX(rx_socket_stats.blocked_count)', width:180, name:"MAX (Blocked Count)", groupable:false}}
        ],
        "StatTable.ProtobufCollectorStats.rx_message_stats" : [
            {select:"COUNT(rx_message_stats)", display:{id:'COUNT(rx_message_stats)', field:'COUNT(rx_message_stats)', width:200, name:"Count (Receive Message Stats)", groupable:false}},
            {select:"rx_message_stats.endpoint_name", display:{id:'rx_message_stats.endpoint_name', field:'rx_message_stats.endpoint_name', width:180, name:"Endpoint Name", groupable:false}},
            {select:"rx_message_stats.message_name", display:{id:'rx_message_stats.message_name', field:'rx_message_stats.message_name', width:180, name:"Message Name", groupable:false}},

            {select:"rx_message_stats.messages", display:{id:'rx_message_stats.messages', field:'rx_message_stats.messages', width:180, name:"Messages", groupable:false}},
            {select:"SUM(rx_message_stats.messages)", display:{id:'SUM(rx_message_stats.messages)', field:'SUM(rx_message_stats.messages)', width:180, name:"SUM (Messages)", groupable:false}},
            {select:"MIN(rx_message_stats.messages)", display:{id:'MIN(rx_message_stats.messages)', field:'MIN(rx_message_stats.messages)', width:180, name:"MIN (Messages)", groupable:false}},
            {select:"MAX(rx_message_stats.messages)", display:{id:'MAX(rx_message_stats.messages)', field:'MAX(rx_message_stats.messages)', width:180, name:"MAX (Messages)", groupable:false}},

            {select:"rx_message_stats.bytes", display:{id:'rx_message_stats.bytes', field:'rx_message_stats.bytes', width:150, name:"Bytes", groupable:false}},
            {select:"SUM(rx_message_stats.bytes)", display:{id:'SUM(rx_message_stats.bytes)', field:'SUM(rx_message_stats.bytes)', width:150, name:"SUM (Bytes)", groupable:false}},
            {select:"MIN(rx_message_stats.bytes)", display:{id:'MIN(rx_message_stats.bytes)', field:'MIN(rx_message_stats.bytes)', width:150, name:"MIN (Bytes)", groupable:false}},
            {select:"MAX(rx_message_stats.bytes)", display:{id:'MAX(rx_message_stats.bytes)', field:'MAX(rx_message_stats.bytes)', width:150, name:"MAX (Bytes)", groupable:false}},

            {select:"rx_message_stats.errors", display:{id:'rx_message_stats.errors', field:'rx_message_stats.errors', width:150, name:"Errors", groupable:false}},
            {select:"SUM(rx_message_stats.errors)", display:{id:'SUM(rx_message_stats.errors)', field:'SUM(rx_message_stats.errors)', width:150, name:"SUM (Errors)", groupable:false}},
            {select:"MIN(rx_message_stats.errors)", display:{id:'MIN(rx_message_stats.errors)', field:'MIN(rx_message_stats.errors)', width:150, name:"MIN (Errors)", groupable:false}},
            {select:"MAX(rx_message_stats.errors)", display:{id:'MAX(rx_message_stats.errors)', field:'MAX(rx_message_stats.errors)', width:150, name:"MAX (Errors)", groupable:false}},

            {select:"rx_message_stats.last_timestamp", display:{id:'rx_message_stats.last_timestamp', field:'rx_message_stats.last_timestamp', width:180, name:"Last Timestamp", groupable:false}},
            {select:"SUM(rx_message_stats.last_timestamp)", display:{id:'SUM(rx_message_stats.last_timestamp)', field:'SUM(rx_message_stats.last_timestamp)', width:180, name:"SUM (Last Timestamp)", groupable:false}},
            {select:"MIN(rx_message_stats.last_timestamp)", display:{id:'MIN(rx_message_stats.last_timestamp)', field:'MIN(rx_message_stats.last_timestamp)', width:180, name:"MIN (Last Timestamp)", groupable:false}},
            {select:"MAX(rx_message_stats.last_timestamp)", display:{id:'MAX(rx_message_stats.last_timestamp)', field:'MAX(rx_message_stats.last_timestamp)', width:180, name:"MAX (Last Timestamp)", groupable:false}}
        ],

        "StatTable.ProtobufCollectorStats.db_table_info" : [
            {select:"COUNT(db_table_info)", display:{id:'COUNT(db_table_info)', field:'COUNT(db_table_info)', width:150, name:"Count (Table Info)", groupable:false}},
            {select:"db_table_info.table_name", display:{id:'db_table_info.table_name', field:'db_table_info.table_name', width:150, name:"Table Name", groupable:false}},

            {select:"db_table_info.reads", display:{id:'db_table_info.reads', field:'db_table_info.reads', width:150, name:"Reads", groupable:false}},
            {select:"SUM(db_table_info.reads)", display:{id:'SUM(db_table_info.reads)', field:'SUM(db_table_info.reads)', width:150, name:"SUM (Reads)", groupable:false}},
            {select:"MIN(db_table_info.reads)", display:{id:'MIN(db_table_info.reads)', field:'MIN(db_table_info.reads)', width:150, name:"MIN (Reads)", groupable:false}},
            {select:"MAX(db_table_info.reads)", display:{id:'MAX(db_table_info.reads)', field:'MAX(db_table_info.reads)', width:150, name:"MAX (Reads)", groupable:false}},

            {select:"db_table_info.read_fails", display:{id:'db_table_info.read_fails', field:'db_table_info.read_fails', width:150, name:"read_fails", groupable:false}},
            {select:"SUM(db_table_info.read_fails)", display:{id:'SUM(db_table_info.read_fails)', field:'SUM(db_table_info.read_fails)', width:150, name:"SUM (Read Fails)", groupable:false}},
            {select:"MIN(db_table_info.read_fails)", display:{id:'MIN(db_table_info.read_fails)', field:'MIN(db_table_info.read_fails)', width:150, name:"MIN (Read Fails)", groupable:false}},
            {select:"MAX(db_table_info.read_fails)", display:{id:'MAX(db_table_info.read_fails)', field:'MAX(db_table_info.read_fails)', width:150, name:"MAX (Read Fails)", groupable:false}},

            {select:"db_table_info.writes", display:{id:'db_table_info.writes', field:'db_table_info.writes', width:150, name:"Writes", groupable:false}},
            {select:"SUM(db_table_info.writes)", display:{id:'SUM(db_table_info.writes)', field:'SUM(db_table_info.writes)', width:150, name:"SUM (Writes)", groupable:false}},
            {select:"MIN(db_table_info.writes)", display:{id:'MIN(db_table_info.writes)', field:'MIN(db_table_info.writes)', width:150, name:"MIN (Writes)", groupable:false}},
            {select:"MAX(db_table_info.writes)", display:{id:'MAX(db_table_info.writes)', field:'MAX(db_table_info.writes)', width:150, name:"MAX (Writes)", groupable:false}},

            {select:"db_table_info.write_fails", display:{id:'db_table_info.write_fails', field:'db_table_info.write_fails', width:150, name:"Write Fails", groupable:false}},
            {select:"SUM(db_table_info.write_fails)", display:{id:'SUM(db_table_info.write_fails)', field:'SUM(db_table_info.write_fails)', width:180, name:"SUM (Write Fails)", groupable:false}},
            {select:"MIN(db_table_info.write_fails)", display:{id:'MIN(db_table_info.write_fails)', field:'MIN(db_table_info.write_fails)', width:180, name:"MIN (Write Fails)", groupable:false}},
            {select:"MAX(db_table_info.write_fails)", display:{id:'MAX(db_table_info.write_fails)', field:'MAX(db_table_info.write_fails)', width:180, name:"MAX (Write Fails)", groupable:false}},

        ],
        "StatTable.ProtobufCollectorStats.db_statistics_table_info" : [
            {select:"COUNT(db_statistics_table_info)", display:{id:'COUNT(db_statistics_table_info)', field:'COUNT(db_statistics_table_info)', width:150, name:"Count (Table Info)", groupable:false}},
            {select:"db_statistics_table_info.table_name", display:{id:'db_statistics_table_info.table_name', field:'db_statistics_table_info.table_name', width:150, name:"Table Name", groupable:false}},

            {select:"db_statistics_table_info.reads", display:{id:'db_statistics_table_info.reads', field:'db_statistics_table_info.reads', width:150, name:"Reads", groupable:false}},
            {select:"SUM(db_statistics_table_info.reads)", display:{id:'SUM(db_statistics_table_info.reads)', field:'SUM(db_statistics_table_info.reads)', width:150, name:"SUM (Reads)", groupable:false}},
            {select:"MIN(db_statistics_table_info.reads)", display:{id:'MIN(db_statistics_table_info.reads)', field:'MIN(db_statistics_table_info.reads)', width:150, name:"MIN (Reads)", groupable:false}},
            {select:"MAX(db_statistics_table_info.reads)", display:{id:'MAX(db_statistics_table_info.reads)', field:'MAX(db_statistics_table_info.reads)', width:150, name:"MAX (Reads)", groupable:false}},

            {select:"db_statistics_table_info.read_fails", display:{id:'db_statistics_table_info.read_fails', field:'db_statistics_table_info.read_fails', width:180, name:"read_fails", groupable:false}},
            {select:"SUM(db_statistics_table_info.read_fails)", display:{id:'SUM(db_statistics_table_info.read_fails)', field:'SUM(db_statistics_table_info.read_fails)', width:180, name:"SUM (Read Fails)", groupable:false}},
            {select:"MIN(db_statistics_table_info.read_fails)", display:{id:'MIN(db_statistics_table_info.read_fails)', field:'MIN(db_statistics_table_info.read_fails)', width:180, name:"MIN (Read Fails)", groupable:false}},
            {select:"MAX(db_statistics_table_info.read_fails)", display:{id:'MAX(db_statistics_table_info.read_fails)', field:'MAX(db_statistics_table_info.read_fails)', width:180, name:"MAX (Read Fails)", groupable:false}},

            {select:"db_statistics_table_info.writes", display:{id:'db_statistics_table_info.writes', field:'db_statistics_table_info.writes', width:150, name:"Writes", groupable:false}},
            {select:"SUM(db_statistics_table_info.writes)", display:{id:'SUM(db_statistics_table_info.writes)', field:'SUM(db_statistics_table_info.writes)', width:150, name:"SUM (Writes)", groupable:false}},
            {select:"MIN(db_statistics_table_info.writes)", display:{id:'MIN(db_statistics_table_info.writes)', field:'MIN(db_statistics_table_info.writes)', width:150, name:"MIN (Writes)", groupable:false}},
            {select:"MAX(db_statistics_table_info.writes)", display:{id:'MAX(db_statistics_table_info.writes)', field:'MAX(db_statistics_table_info.writes)', width:150, name:"MAX (Writes)", groupable:false}},

            {select:"db_statistics_table_info.write_fails", display:{id:'db_statistics_table_info.write_fails', field:'db_statistics_table_info.write_fails', width:180, name:"Write Fails", groupable:false}},
            {select:"SUM(db_statistics_table_info.write_fails)", display:{id:'SUM(db_statistics_table_info.write_fails)', field:'SUM(db_statistics_table_info.write_fails)', width:180, name:"SUM (Write Fails)", groupable:false}},
            {select:"MIN(db_statistics_table_info.write_fails)", display:{id:'MIN(db_statistics_table_info.write_fails)', field:'MIN(db_statistics_table_info.write_fails)', width:180, name:"MIN (Write Fails)", groupable:false}},
            {select:"MAX(db_statistics_table_info.write_fails)", display:{id:'MAX(db_statistics_table_info.write_fails)', field:'MAX(db_statistics_table_info.write_fails)', width:180, name:"MAX (Write Fails)", groupable:false}},

        ],
        "StatTable.ProtobufCollectorStats.db_errors" : [
            {select:"COUNT(db_errors)", display:{id:'COUNT(db_errors)', field:'COUNT(db_errors)', width:150, name:"Count (DB Errors)", groupable:false}},

            {select:"db_errors.write_tablespace_fails", display:{id:'db_errors.write_tablespace_fails', field:'db_errors.write_tablespace_fails', width:190, name:"Write Tablespace Fails", groupable:false}},
            {select:"SUM(db_errors.write_tablespace_fails)", display:{id:'SUM(db_errors.write_tablespace_fails)', field:'SUM(db_errors.write_tablespace_fails)', width:190, name:"SUM (Write Tablespace Fails)", groupable:false}},
            {select:"MIN(db_errors.write_tablespace_fails)", display:{id:'MIN(db_errors.write_tablespace_fails)', field:'MIN(db_errors.write_tablespace_fails)', width:190, name:"MIN (Write Tablespace Fails)", groupable:false}},
            {select:"MAX(db_errors.write_tablespace_fails)", display:{id:'MAX(db_errors.write_tablespace_fails)', field:'MAX(db_errors.write_tablespace_fails)', width:190, name:"MAX (Write Tablespace Fails)", groupable:false}},

            {select:"db_errors.read_tablespace_fails", display:{id:'db_errors.read_tablespace_fails', field:'db_errors.read_tablespace_fails', width:190, name:"Read Tablespace Fails", groupable:false}},
            {select:"SUM(db_errors.read_tablespace_fails)", display:{id:'SUM(db_errors.read_tablespace_fails)', field:'SUM(db_errors.read_tablespace_fails)', width:190, name:"SUM (Read Tablespace Fails)", groupable:false}},
            {select:"MIN(db_errors.read_tablespace_fails)", display:{id:'MIN(db_errors.read_tablespace_fails)', field:'MIN(db_errors.read_tablespace_fails)', width:190, name:"MIN (Read Tablespace Fails)", groupable:false}},
            {select:"MAX(db_errors.read_tablespace_fails)", display:{id:'MAX(db_errors.read_tablespace_fails)', field:'MAX(db_errors.read_tablespace_fails)', width:190, name:"MAX (Read Tablespace Fails)", groupable:false}},

            {select:"db_errors.write_table_fails", display:{id:'db_errors.write_table_fails', field:'db_errors.write_table_fails', width:180, name:"Write Table Fails", groupable:false}},
            {select:"SUM(db_errors.write_table_fails)", display:{id:'SUM(db_errors.write_table_fails)', field:'SUM(db_errors.write_table_fails)', width:180, name:"SUM (Write Table Fails)", groupable:false}},
            {select:"MIN(db_errors.write_table_fails)", display:{id:'MIN(db_errors.write_table_fails)', field:'MIN(db_errors.write_table_fails)', width:180, name:"MIN (Write Table Fails)", groupable:false}},
            {select:"MAX(db_errors.write_table_fails)", display:{id:'MAX(db_errors.write_table_fails)', field:'MAX(db_errors.write_table_fails)', width:180, name:"MAX (Write Table Fails)", groupable:false}},

            {select:"db_errors.read_table_fails", display:{id:'db_errors.read_table_fails', field:'db_errors.read_table_fails', width:180, name:"Read Table Fails", groupable:false}},
            {select:"SUM(db_errors.read_table_fails)", display:{id:'SUM(db_errors.read_table_fails)', field:'SUM(db_errors.read_table_fails)', width:180, name:"SUM (Read Table Fails)", groupable:false}},
            {select:"MIN(db_errors.read_table_fails)", display:{id:'MIN(db_errors.read_table_fails)', field:'MIN(db_errors.read_table_fails)', width:180, name:"MIN (Read Table Fails)", groupable:false}},
            {select:"MAX(db_errors.read_table_fails)", display:{id:'MAX(db_errors.read_table_fails)', field:'MAX(db_errors.read_table_fails)', width:180, name:"MAX (Read Table Fails)", groupable:false}},

            {select:"db_errors.write_column_fails", display:{id:'db_errors.write_column_fails', field:'db_errors.write_column_fails', width:190, name:"Write Column Fails", groupable:false}},
            {select:"SUM(db_errors.write_column_fails)", display:{id:'SUM(db_errors.write_column_fails)', field:'SUM(db_errors.write_column_fails)', width:190, name:"SUM (Write Column Fails)", groupable:false}},
            {select:"MIN(db_errors.write_column_fails)", display:{id:'MIN(db_errors.write_column_fails)', field:'MIN(db_errors.write_column_fails)', width:190, name:"MIN (Write Column Fails)", groupable:false}},
            {select:"MAX(db_errors.write_column_fails)", display:{id:'MAX(db_errors.write_column_fails)', field:'MAX(db_errors.write_column_fails)', width:190, name:"MAX (Write Column Fails)", groupable:false}},

            {select:"db_errors.write_batch_column_fails", display:{id:'db_errors.write_batch_column_fails', field:'db_errors.write_batch_column_fails', width:210, name:"Write Batch Column Fails", groupable:false}},
            {select:"SUM(db_errors.write_batch_column_fails)", display:{id:'SUM(db_errors.write_batch_column_fails)', field:'SUM(db_errors.write_batch_column_fails)', width:210, name:"SUM (Write Batch Column Fails)", groupable:false}},
            {select:"MIN(db_errors.write_batch_column_fails)", display:{id:'MIN(db_errors.write_batch_column_fails)', field:'MIN(db_errors.write_batch_column_fails)', width:210, name:"MIN (Write Batch Column Fails)", groupable:false}},
            {select:"MAX(db_errors.write_batch_column_fails)", display:{id:'MAX(db_errors.write_batch_column_fails)', field:'MAX(db_errors.write_batch_column_fails)', width:210, name:"MAX (Write Batch Column Fails)", groupable:false}},

            {select:"db_errors.read_column_fails", display:{id:'db_errors.read_column_fails', field:'db_errors.read_column_fails', width:190, name:"Read Column Fails", groupable:false}},
            {select:"SUM(db_errors.read_column_fails)", display:{id:'SUM(db_errors.read_column_fails)', field:'SUM(db_errors.read_column_fails)', width:190, name:"SUM (Read Column Fails)", groupable:false}},
            {select:"MIN(db_errors.read_column_fails)", display:{id:'MIN(db_errors.read_column_fails)', field:'MIN(db_errors.read_column_fails)', width:190, name:"MIN (Read Column Fails)", groupable:false}},
            {select:"MAX(db_errors.read_column_fails)", display:{id:'MAX(db_errors.read_column_fails)', field:'MAX(db_errors.read_column_fails)', width:190, name:"MAX (Read Column Fails)", groupable:false}},
        ],


        "StatTable.PFEHeapInfo.heap_info" : [
            {select:"heap_info.name", display:{id:'heap_info.name', field:'heap_info.name', width:150, name:"Heap Info Name", groupable:false}},
            {select:"COUNT(heap_info)", display:{id:'COUNT(heap_info)', field:'COUNT(heap_info)', width:120, name:"Count (Heap Info)", groupable:false}},

            {select:"heap_info.size", display:{id:'heap_info.size', field:'heap_info.size', width:150, name:"Size", groupable:false}},
            {select:"SUM(heap_info.size)", display:{id:'SUM(heap_info.size)', field:'SUM(heap_info.size)', width:150, name:"SUM (Size)", groupable:false}},
            {select:"MIN(heap_info.size)", display:{id:'MIN(heap_info.size)', field:'MIN(heap_info.size)', width:150, name:"MIN (Size)", groupable:false}},
            {select:"MAX(heap_info.size)", display:{id:'MAX(heap_info.size)', field:'MAX(heap_info.size)', width:150, name:"MAX (Size)", groupable:false}},

            {select:"heap_info.allocated", display:{id:'heap_info.allocated', field:'heap_info.allocated', width:150, name:"Allocated", groupable:false}},
            {select:"MIN(heap_info.allocated)", display:{id:'MIN(heap_info.allocated)', field:'MIN(heap_info.allocated)', width:150, name:"MIN (Allocated)", groupable:false}},
            {select:"SUM(heap_info.allocated)", display:{id:'SUM(heap_info.allocated)', field:'SUM(heap_info.allocated)', width:150, name:"SUM (Allocated)", groupable:false}},
            {select:"MAX(heap_info.allocated)", display:{id:'MAX(heap_info.allocated)', field:'MAX(heap_info.allocated)', width:150, name:"MAX (Allocated)", groupable:false}},

            {select:"heap_info.utilization", display:{id:'heap_info.utilization', field:'heap_info.utilization', width:150, name:"Heap Info Utilization", groupable:false}},
            {select:"SUM(heap_info.utilization)", display:{id:'SUM(heap_info.utilization)', field:'SUM(heap_info.utilization)', width:150, name:"SUM (Utilization)", groupable:false}},
            {select:"MIN(heap_info.utilization)", display:{id:'MIN(heap_info.utilization)', field:'MIN(heap_info.utilization)', width:150, name:"MIN (Utilization)", groupable:false}},
            {select:"MAX(heap_info.utilization)", display:{id:'MAX(heap_info.utilization)', field:'MAX(heap_info.utilization)', width:150, name:"MAX (Utilization)", groupable:false}}
        ],
        "StatTable.npu_mem.stats" : [
            {select:"COUNT(stats)", display:{id:'COUNT(stats)', field:'COUNT(stats)', width:120, name:"Count (Stats)", groupable:false}},
            {select:"stats.pfe_identifier", display:{id:'stats.pfe_identifier', field:'stats.pfe_identifier', width:150, name:"PFE Identifier", groupable:false}},
            {select:"stats.resource_name", display:{id:'stats.resource_name', field:'stats.resource_name', width:150, name:"Resource Name", groupable:false}},

            {select:"stats.size", display:{id:'stats.size', field:'stats.size', width:150, name:"Size", groupable:false}},
            {select:"SUM(stats.size)", display:{id:'SUM(stats.size)', field:'SUM(stats.size)', width:150, name:"SUM (Size)", groupable:false}},
            {select:"MIN(stats.size)", display:{id:'MIN(stats.size)', field:'MIN(stats.size)', width:150, name:"MIN (Size)", groupable:false}},
            {select:"MAX(stats.size)", display:{id:'MAX(stats.size)', field:'MAX(stats.size)', width:150, name:"MAX (Size)", groupable:false}},

            {select:"stats.allocated", display:{id:'stats.allocated', field:'stats.allocated', width:150, name:"Allocated", groupable:false}},
            {select:"SUM(stats.allocated)", display:{id:'SUM(stats.allocated)', field:'SUM(stats.allocated)', width:150, name:"SUM (Allocated)", groupable:false}},
            {select:"MIN(stats.allocated)", display:{id:'MIN(stats.allocated)', field:'MIN(stats.allocated)', width:150, name:"MIN (Allocated)", groupable:false}},
            {select:"MAX(stats.allocated)", display:{id:'MAX(stats.allocated)', field:'MAX(stats.allocated)', width:150, name:"MAX (Allocated)", groupable:false}},

            {select:"stats.utilization", display:{id:'stats.utilization', field:'stats.utilization', width:150, name:"Utilization", groupable:false}},
            {select:"SUM(stats.utilization)", display:{id:'SUM(stats.utilization)', field:'SUM(stats.utilization)', width:150, name:"SUM (Utilization)", groupable:false}},
            {select:"MIN(stats.utilization)", display:{id:'MIN(stats.utilization)', field:'MIN(stats.utilization)', width:150, name:"MIN (Utilization)", groupable:false}},
            {select:"MAX(stats.utilization)", display:{id:'MAX(stats.utilization)', field:'MAX(stats.utilization)', width:150, name:"MAX (Utilization)", groupable:false}},
        ],
        "StatTable.fabric_message.edges.class_stats.transmit_counts" : [
            {select:"COUNT(edges)", display:{id:'COUNT(edges)', field:'COUNT(edges)', width:120, name:"Count (Edges)", groupable:false}},
            {select:"edges.src_type", display:{id:'edges.src_type', field:'edges.src_type', width:150, name:"Src Type", groupable:false}},
            {select:"edges.src_slot", display:{id:'edges.src_slot', field:'edges.src_slot', width:150, name:"Src Slot", groupable:false}},
            {select:"edges.src_pfe", display:{id:'edges.src_pfe', field:'edges.src_pfe', width:150, name:"Src PFE", groupable:false}},
            {select:"edges.dst_type", display:{id:'edges.dst_type', field:'edges.dst_type', width:150, name:"Dest Type", groupable:false}},
            {select:"edges.dst_slot", display:{id:'edges.dst_slot', field:'edges.dst_slot', width:150, name:"Dest Slot", groupable:false}},
            {select:"edges.dst_pfe", display:{id:'edges.dst_pfe', field:'edges.dst_pfe', width:150, name:"Dest PFE", groupable:false}},
            {select:"edges.class_stats.priority", display:{id:'edges.class_stats.priority', field:'edges.class_stats.priority', width:150, name:"Priority", groupable:false}},

            {select:"edges.class_stats.transmit_counts.packets", display:{id:'edges.class_stats.transmit_counts.packets', field:'edges.class_stats.transmit_counts.packets', width:150, name:"Trans Pkt Cnt", groupable:false}},
            {select:"SUM(edges.class_stats.transmit_counts.packets)", display:{id:'SUM(edges.class_stats.transmit_counts.packets)', field:'SUM(edges.class_stats.transmit_counts.packets)', width:150, name:"SUM (Trans Pkt Cnt)", groupable:false}},
            {select:"MIN(edges.class_stats.transmit_counts.packets)", display:{id:'MIN(edges.class_stats.transmit_counts.packets)', field:'MIN(edges.class_stats.transmit_counts.packets)', width:150, name:"MIN (Trans Pkt Cnt)", groupable:false}},
            {select:"MAX(edges.class_stats.transmit_counts.packets)", display:{id:'MAX(edges.class_stats.transmit_counts.packets)', field:'MAX(edges.class_stats.transmit_counts.packets)', width:150, name:"MAX (Trans Pkt Cnt)", groupable:false}},

            {select:"edges.class_stats.transmit_counts.pps", display:{id:'edges.class_stats.transmit_counts.pps', field:'edges.class_stats.transmit_counts.pps', width:150, name:"Trans PPS Cnt", groupable:false}},
            {select:"SUM(edges.class_stats.transmit_counts.pps)", display:{id:'SUM(edges.class_stats.transmit_counts.pps)', field:'SUM(edges.class_stats.transmit_counts.pps)', width:150, name:"SUM (Trans PPS Cnt)", groupable:false}},
            {select:"MIN(edges.class_stats.transmit_counts.pps)", display:{id:'MIN(edges.class_stats.transmit_counts.pps)', field:'MIN(edges.class_stats.transmit_counts.pps)', width:150, name:"MIN (Trans PPS Cnt)", groupable:false}},
            {select:"MAX(edges.class_stats.transmit_counts.pps)", display:{id:'MAX(edges.class_stats.transmit_counts.pps)', field:'MAX(edges.class_stats.transmit_counts.pps)', width:150, name:"MAX (Trans PPS Cnt)", groupable:false}},

            {select:"edges.class_stats.transmit_counts.bytes", display:{id:'edges.class_stats.transmit_counts.bytes', field:'edges.class_stats.transmit_counts.bytes', width:150, name:"Trans Bytes Cnt", groupable:false}},
            {select:"SUM(edges.class_stats.transmit_counts.bytes)", display:{id:'SUM(edges.class_stats.transmit_counts.bytes)', field:'SUM(edges.class_stats.transmit_counts.bytes)', width:150, name:"SUM (Trans Bytes Cnt)", groupable:false}},
            {select:"MIN(edges.class_stats.transmit_counts.bytes)", display:{id:'MIN(edges.class_stats.transmit_counts.bytes)', field:'MIN(edges.class_stats.transmit_counts.bytes)', width:150, name:"MIN (Trans Bytes Cnt)", groupable:false}},
            {select:"MAX(edges.class_stats.transmit_counts.bytes)", display:{id:'MAX(edges.class_stats.transmit_counts.bytes)', field:'MAX(edges.class_stats.transmit_counts.bytes)', width:150, name:"MAX (Trans Bytes Cnt)", groupable:false}},

            {select:"edges.class_stats.transmit_counts.bps", display:{id:'edges.class_stats.transmit_counts.bps', field:'edges.class_stats.transmit_counts.bps', width:150, name:"Trans BPS Cnt", groupable:false}},
            {select:"SUM(edges.class_stats.transmit_counts.bps)", display:{id:'SUM(edges.class_stats.transmit_counts.bps)', field:'SUM(edges.class_stats.transmit_counts.bps)', width:150, name:"SUM (Trans BPS Cnt)", groupable:false}},
            {select:"MIN(edges.class_stats.transmit_counts.bps)", display:{id:'MIN(edges.class_stats.transmit_counts.bps)', field:'MIN(edges.class_stats.transmit_counts.bps)', width:150, name:"MIN (Trans BPS Cnt)", groupable:false}},
            {select:"MAX(edges.class_stats.transmit_counts.bps)", display:{id:'MAX(edges.class_stats.transmit_counts.bps)', field:'MAX(edges.class_stats.transmit_counts.bps)', width:150, name:"MAX (Trans BPS Cnt)", groupable:false}},

            {select:"edges.class_stats.transmit_counts.drop_packets", display:{id:'edges.class_stats.transmit_counts.drop_packets', field:'edges.class_stats.transmit_counts.drop_packets', width:150, name:"Trans Drop Pkts Cnt", groupable:false}},
            {select:"SUM(edges.class_stats.transmit_counts.drop_packets)", display:{id:'SUM(edges.class_stats.transmit_counts.drop_packets)', field:'SUM(edges.class_stats.transmit_counts.drop_packets)', width:150, name:"SUM (Trans Drop Pkts Cnt)", groupable:false}},
            {select:"MIN(edges.class_stats.transmit_counts.drop_packets)", display:{id:'MIN(edges.class_stats.transmit_counts.drop_packets)', field:'MIN(edges.class_stats.transmit_counts.drop_packets)', width:150, name:"MIN (Trans Drop Pkts Cnt)", groupable:false}},
            {select:"MAX(edges.class_stats.transmit_counts.drop_packets)", display:{id:'MAX(edges.class_stats.transmit_counts.drop_packets)', field:'MAX(edges.class_stats.transmit_counts.drop_packets)', width:150, name:"MAX (Trans Drop Pkts Cnt)", groupable:false}},

            {select:"edges.class_stats.transmit_counts.drop_bytes", display:{id:'edges.class_stats.transmit_counts.drop_bytes', field:'edges.class_stats.transmit_counts.drop_bytes', width:150, name:"Trans Drop Bytes Cnt", groupable:false}},
            {select:"SUM(edges.class_stats.transmit_counts.drop_bytes)", display:{id:'SUM(edges.class_stats.transmit_counts.drop_bytes)', field:'SUM(edges.class_stats.transmit_counts.drop_bytes)', width:150, name:"SUM (Trans Drop Bytes Cnt)", groupable:false}},
            {select:"MIN(edges.class_stats.transmit_counts.drop_bytes)", display:{id:'MIN(edges.class_stats.transmit_counts.drop_bytes)', field:'MIN(edges.class_stats.transmit_counts.drop_bytes)', width:150, name:"MIN (Trans Drop Bytes Cnt)", groupable:false}},
            {select:"MAX(edges.class_stats.transmit_counts.drop_bytes)", display:{id:'MAX(edges.class_stats.transmit_counts.drop_bytes)', field:'MAX(edges.class_stats.transmit_counts.drop_bytes)', width:150, name:"MAX (Trans Drop Bytes Cnt)", groupable:false}},

            {select:"edges.class_stats.transmit_counts.drop_bps", display:{id:'edges.class_stats.transmit_counts.drop_bps', field:'edges.class_stats.transmit_counts.drop_bps', width:150, name:"Trans Drop BPS Cnt", groupable:false}},
            {select:"SUM(edges.class_stats.transmit_counts.drop_bps)", display:{id:'SUM(edges.class_stats.transmit_counts.drop_bps)', field:'SUM(edges.class_stats.transmit_counts.drop_bps)', width:150, name:"SUM (Trans Drop BPS Cnt)", groupable:false}},
            {select:"MIN(edges.class_stats.transmit_counts.drop_bps)", display:{id:'MIN(edges.class_stats.transmit_counts.drop_bps)', field:'MIN(edges.class_stats.transmit_counts.drop_bps)', width:150, name:"MIN (Trans Drop BPS Cnt)", groupable:false}},
            {select:"MAX(edges.class_stats.transmit_counts.drop_bps)", display:{id:'MAX(edges.class_stats.transmit_counts.drop_bps)', field:'MAX(edges.class_stats.transmit_counts.drop_bps)', width:150, name:"MAX (Trans Drop BPS Cnt)", groupable:false}},

            {select:"edges.class_stats.transmit_counts.drop_pps", display:{id:'edges.class_stats.transmit_counts.drop_pps', field:'edges.class_stats.transmit_counts.drop_pps', width:150, name:"Trans Drop PPS Cnt", groupable:false}},
            {select:"SUM(edges.class_stats.transmit_counts.drop_pps)", display:{id:'SUM(edges.class_stats.transmit_counts.drop_pps)', field:'SUM(edges.class_stats.transmit_counts.drop_pps)', width:150, name:"SUM (Trans Drop PPS Cnt)", groupable:false}},
            {select:"MIN(edges.class_stats.transmit_counts.drop_pps)", display:{id:'MIN(edges.class_stats.transmit_counts.drop_pps)', field:'MIN(edges.class_stats.transmit_counts.drop_pps)', width:150, name:"MIN (Trans Drop PPS Cnt)", groupable:false}},
            {select:"MAX(edges.class_stats.transmit_counts.drop_pps)", display:{id:'MAX(edges.class_stats.transmit_counts.drop_pps)', field:'MAX(edges.class_stats.transmit_counts.drop_pps)', width:150, name:"MAX (Trans Drop PPS Cnt)", groupable:false}},

            {select:"edges.class_stats.transmit_counts.q_depth_avg", display:{id:'edges.class_stats.transmit_counts.q_depth_avg', field:'edges.class_stats.transmit_counts.q_depth_avg', width:150, name:"Trans Avg Q Depth", groupable:false}},
            {select:"SUM(edges.class_stats.transmit_counts.q_depth_avg)", display:{id:'SUM(edges.class_stats.transmit_counts.q_depth_avg)', field:'SUM(edges.class_stats.transmit_counts.q_depth_avg)', width:150, name:"SUM (Trans Avg Q Depth)", groupable:false}},
            {select:"MIN(edges.class_stats.transmit_counts.q_depth_avg)", display:{id:'MIN(edges.class_stats.transmit_counts.q_depth_avg)', field:'MIN(edges.class_stats.transmit_counts.q_depth_avg)', width:150, name:"MIN (Trans Avg Q Depth)", groupable:false}},
            {select:"MAX(edges.class_stats.transmit_counts.q_depth_avg)", display:{id:'MAX(edges.class_stats.transmit_counts.q_depth_avg)', field:'MAX(edges.class_stats.transmit_counts.q_depth_avg)', width:150, name:"MAX (Trans Avg Q Depth)", groupable:false}},

            {select:"edges.class_stats.transmit_counts.q_depth_cur", display:{id:'edges.class_stats.transmit_counts.q_depth_cur', field:'edges.class_stats.transmit_counts.q_depth_cur', width:150, name:"Trans Cur Q Depth", groupable:false}},
            {select:"SUM(edges.class_stats.transmit_counts.q_depth_cur)", display:{id:'SUM(edges.class_stats.transmit_counts.q_depth_cur)', field:'SUM(edges.class_stats.transmit_counts.q_depth_cur)', width:150, name:"SUM (Trans Cur Q Depth)", groupable:false}},
            {select:"MIN(edges.class_stats.transmit_counts.q_depth_cur)", display:{id:'MIN(edges.class_stats.transmit_counts.q_depth_cur)', field:'MIN(edges.class_stats.transmit_counts.q_depth_cur)', width:150, name:"MIN (Trans Cur Q Depth)", groupable:false}},
            {select:"MAX(edges.class_stats.transmit_counts.q_depth_cur)", display:{id:'MAX(edges.class_stats.transmit_counts.q_depth_cur)', field:'MAX(edges.class_stats.transmit_counts.q_depth_cur)', width:150, name:"MAX (Trans Cur Q Depth)", groupable:false}},

            {select:"edges.class_stats.transmit_counts.q_depth_peak", display:{id:'edges.class_stats.transmit_counts.q_depth_peak', field:'edges.class_stats.transmit_counts.q_depth_peak', width:150, name:"Trans Peak Q Depth", groupable:false}},
            {select:"SUM(edges.class_stats.transmit_counts.q_depth_peak)", display:{id:'SUM(edges.class_stats.transmit_counts.q_depth_peak)', field:'SUM(edges.class_stats.transmit_counts.q_depth_peak)', width:150, name:"SUM (Trans Peak Q Depth)", groupable:false}},
            {select:"MIN(edges.class_stats.transmit_counts.q_depth_peak)", display:{id:'MIN(edges.class_stats.transmit_counts.q_depth_peak)', field:'MIN(edges.class_stats.transmit_counts.q_depth_peak)', width:150, name:"MIN (Trans Peak Q Depth)", groupable:false}},
            {select:"MAX(edges.class_stats.transmit_counts.q_depth_peak)", display:{id:'MAX(edges.class_stats.transmit_counts.q_depth_peak)', field:'MAX(edges.class_stats.transmit_counts.q_depth_peak)', width:150, name:"MAX (Trans PeakQ Depth)", groupable:false}},

            {select:"edges.class_stats.transmit_counts.q_depth_max", display:{id:'edges.class_stats.transmit_counts.q_depth_max', field:'edges.class_stats.transmit_counts.q_depth_max', width:150, name:"Trans Max Q Depth", groupable:false}},
            {select:"SUM(edges.class_stats.transmit_counts.q_depth_max)", display:{id:'SUM(edges.class_stats.transmit_counts.q_depth_max)', field:'SUM(edges.class_stats.transmit_counts.q_depth_max)', width:150, name:"SUM (Trans Max Q Depth)", groupable:false}},
            {select:"MIN(edges.class_stats.transmit_counts.q_depth_max)", display:{id:'MIN(edges.class_stats.transmit_counts.q_depth_max)', field:'MIN(edges.class_stats.transmit_counts.q_depth_max)', width:150, name:"MIN (Trans Max Q Depth)", groupable:false}},
            {select:"MAX(edges.class_stats.transmit_counts.q_depth_max)", display:{id:'MAX(edges.class_stats.transmit_counts.q_depth_max)', field:'MAX(edges.class_stats.transmit_counts.q_depth_max)', width:150, name:"MAX (Trans Max Q Depth)", groupable:false}},

        ],
        "StatTable.g_lsp_stats.lsp_records" : [
            {select:"COUNT(lsp_records)", display:{id:'COUNT(lsp_records)', field:'COUNT(lsp_records)', width:120, name:"Count (LSP Records)", groupable:false}},
            {select:"system_name", display:{id:'system_name', field:'system_name', width:150, name:"System Name", groupable:false}},
            {select:"sensor_name", display:{id:'sensor_name', field:'sensor_name', width:150, name:"Sensor Name", groupable:false}},
            {select:"lsp_records.name", display:{id:'lsp_records.name', field:'lsp_records.name', width:150, name:"Lsp Records Name", groupable:false}},

            {select:"slot", display:{id:'slot', field:'slot', width:150, name:"Slot", groupable:false}},
            {select:"SUM(slot)", display:{id:'SUM(slot)', field:'SUM(slot)', width:150, name:"SUM (Slot)", groupable:false}},
            {select:"MIN(slot)", display:{id:'MIN(slot)', field:'MIN(slot)', width:150, name:"MIN (Slot)", groupable:false}},
            {select:"MAX(slot)", display:{id:'MAX(slot)', field:'MAX(slot)', width:150, name:"MAX (Slot)", groupable:false}},

            {select:"timestamp", display:{id:'timestamp', field:'timestamp', width:150, name:"Timestamp", groupable:false}},
            {select:"SUM(timestamp)", display:{id:'SUM(timestamp)', field:'SUM(timestamp)', width:150, name:"SUM (Timestamp)", groupable:false}},
            {select:"MIN(timestamp)", display:{id:'MIN(timestamp)', field:'MIN(timestamp)', width:150, name:"MIN (Timestamp)", groupable:false}},
            {select:"MAX(timestamp)", display:{id:'MAX(timestamp)', field:'MAX(timestamp)', width:150, name:"MAX (Timestamp)", groupable:false}},

            {select:"lsp_records.instance_identifier", display:{id:'lsp_records.instance_identifier', field:'lsp_records.instance_identifier', width:150, name:"Instance Identifier", groupable:false}},
            {select:"SUM(lsp_records.instance_identifier)", display:{id:'SUM(lsp_records.instance_identifier)', field:'SUM(lsp_records.instance_identifier)', width:150, name:"SUM (Instance Identifier)", groupable:false}},
            {select:"MIN(lsp_records.instance_identifier)", display:{id:'MIN(lsp_records.instance_identifier)', field:'MIN(lsp_records.instance_identifier)', width:150, name:"MIN (Instance Identifier)", groupable:false}},
            {select:"MAX(lsp_records.instance_identifier)", display:{id:'MAX(lsp_records.instance_identifier)', field:'MAX(lsp_records.instance_identifier)', width:150, name:"MAX (Instance Identifier)", groupable:false}},

            {select:"lsp_records.counter_name", display:{id:'lsp_records.counter_name', field:'lsp_records.counter_name', width:150, name:"Counter Name", groupable:false}},
            {select:"SUM(lsp_records.counter_name)", display:{id:'SUM(lsp_records.counter_name)', field:'SUM(lsp_records.counter_name)', width:150, name:"SUM (Counter Name)", groupable:false}},
            {select:"MIN(lsp_records.counter_name)", display:{id:'MIN(lsp_records.counter_name)', field:'MIN(lsp_records.counter_name)', width:150, name:"MIN (Counter Name)", groupable:false}},
            {select:"MAX(lsp_records.counter_name)", display:{id:'MAX(lsp_records.counter_name)', field:'MAX(lsp_records.counter_name)', width:150, name:"MAX (Counter Name)", groupable:false}},

            {select:"lsp_records.packets", display:{id:'lsp_records.packets', field:'lsp_records.packets', width:150, name:"Packets", groupable:false}},
            {select:"SUM(lsp_records.packets)", display:{id:'SUM(lsp_records.packets)', field:'SUM(lsp_records.packets)', width:150, name:"SUM (Packets)", groupable:false}},
            {select:"MIN(lsp_records.packets)", display:{id:'MIN(lsp_records.packets)', field:'MIN(lsp_records.packets)', width:150, name:"MIN (Packets)", groupable:false}},
            {select:"MAX(lsp_records.packets)", display:{id:'MAX(lsp_records.packets)', field:'MAX(lsp_records.packets)', width:150, name:"MAX (Packets)", groupable:false}},

            {select:"lsp_records.packet_rates", display:{id:'lsp_records.packet_rates', field:'lsp_records.packet_rates', width:150, name:"Packet Rates", groupable:false}},
            {select:"SUM(lsp_records.packet_rates)", display:{id:'SUM(lsp_records.packet_rates)', field:'SUM(lsp_records.packet_rates)', width:150, name:"SUM (Packet Rates)", groupable:false}},
            {select:"MIN(lsp_records.packet_rates)", display:{id:'MIN(lsp_records.packet_rates)', field:'MIN(lsp_records.packet_rates)', width:150, name:"MIN (Packet Rates)", groupable:false}},
            {select:"MAX(lsp_records.packet_rates)", display:{id:'MAX(lsp_records.packet_rates)', field:'MAX(lsp_records.packet_rates)', width:150, name:"MAX (Packet Rates)", groupable:false}},

            {select:"lsp_records.bytes", display:{id:'lsp_records.bytes', field:'lsp_records.bytes', width:150, name:"Bytes", groupable:false}},
            {select:"SUM(lsp_records.bytes)", display:{id:'SUM(lsp_records.bytes)', field:'SUM(lsp_records.bytes)', width:150, name:"SUM (Bytes)", groupable:false}},
            {select:"MIN(lsp_records.bytes)", display:{id:'MIN(lsp_records.bytes)', field:'MIN(lsp_records.bytes)', width:150, name:"MIN (Bytes)", groupable:false}},
            {select:"MAX(lsp_records.bytes)", display:{id:'MAX(lsp_records.bytes)', field:'MAX(lsp_records.bytes)', width:150, name:"MAX (Bytes)", groupable:false}},

            {select:"lsp_records.byte_rates", display:{id:'lsp_records.byte_rates', field:'lsp_records.byte_rates', width:150, name:"Byte Rates", groupable:false}},
            {select:"SUM(lsp_records.byte_rates)", display:{id:'SUM(lsp_records.byte_rates)', field:'SUM(lsp_records.byte_rates)', width:150, name:"SUM (Byte Rates)", groupable:false}},
            {select:"MIN(lsp_records.byte_rates)", display:{id:'MIN(lsp_records.byte_rates)', field:'MIN(lsp_records.byte_rates)', width:150, name:"MIN (Byte Rates)", groupable:false}},
            {select:"MAX(lsp_records.byte_rates)", display:{id:'MAX(lsp_records.byte_rates)', field:'MAX(lsp_records.byte_rates)', width:150, name:"MAX (Byte Rates)", groupable:false}}
        ],
        "StatTable.UFlowData.flow" : [
            {select:"COUNT(flow)", display:{id:'COUNT(flow)', field:'COUNT(flow)', width:120, name:"Count (Flow)", groupable:false}},

            {select:"flow.pifindex", display:{id:'flow.pifindex', field:'flow.pifindex', width:150, name:"PIF Index", groupable:false}},
            {select:"SUM(flow.pifindex)", display:{id:'SUM(flow.pifindex)', field:'SUM(flow.pifindex)', width:150, name:"SUM (PIF Index)", groupable:false}},
            {select:"MIN(flow.pifindex)", display:{id:'MIN(flow.pifindex)', field:'MIN(flow.pifindex)', width:150, name:"MIN (PIF Index)", groupable:false}},
            {select:"MAX(flow.pifindex)", display:{id:'MAX(flow.pifindex)', field:'MAX(flow.pifindex)', width:150, name:"MAX (PIF Index)", groupable:false}},

            {select:"flow.sport", display:{id:'flow.sport', field:'flow.sport', width:150, name:"Src Port", groupable:false}},
            {select:"SUM(flow.sport)", display:{id:'SUM(flow.sport)', field:'SUM(flow.sport)', width:150, name:"SUM (Src Port)", groupable:false}},
            {select:"MIN(flow.sport)", display:{id:'MIN(flow.sport)', field:'MIN(flow.sport)', width:150, name:"MIN (Src Port)", groupable:false}},
            {select:"MAX(flow.sport)", display:{id:'MAX(flow.sport)', field:'MAX(flow.sport)', width:150, name:"MAX (Src Port)", groupable:false}},

            {select:"flow.dport", display:{id:'flow.dport', field:'flow.dport', width:150, name:"Dest Port", groupable:false}},
            {select:"SUM(flow.dport)", display:{id:'SUM(flow.dport)', field:'SUM(flow.dport)', width:150, name:"SUM (Dest Port)", groupable:false}},
            {select:"MIN(flow.dport)", display:{id:'MIN(flow.dport)', field:'MIN(flow.dport)', width:150, name:"MIN (Dest Port)", groupable:false}},
            {select:"MAX(flow.dport)", display:{id:'MAX(flow.dport)', field:'MAX(flow.dport)', width:150, name:"MAX (Dest Port)", groupable:false}},

            {select:"flow.protocol", display:{id:'flow.protocol', field:'flow.protocol', width:150, name:"Protocol", groupable:false}},
            {select:"SUM(flow.protocol)", display:{id:'SUM(flow.protocol)', field:'SUM(flow.protocol)', width:150, name:"SUM (Protocol)", groupable:false}},
            {select:"MIN(flow.protocol)", display:{id:'MIN(flow.protocol)', field:'MIN(flow.protocol)', width:150, name:"MIN (Protocol)", groupable:false}},
            {select:"MAX(flow.protocol)", display:{id:'MAX(flow.protocol)', field:'MAX(flow.protocol)', width:150, name:"MAX (Protocol)", groupable:false}},

            {select:"flow.sip", display:{id:'flow.sip', field:'flow.sip', width:150, name:"Src IP", groupable:false}},
            {select:"flow.dip", display:{id:'flow.dip', field:'flow.dip', width:150, name:"Dest IP", groupable:false}},
            {select:"flow.vlan", display:{id:'flow.vlan', field:'flow.vlan', width:150, name:"Virtual LAN", groupable:false}},
            {select:"flow.flowtype", display:{id:'flow.flowtype', field:'flow.flowtype', width:150, name:"Flow Type", groupable:false}},
            {select:"flow.otherinfo", display:{id:'flow.otherinfo', field:'flow.otherinfo', width:150, name:"Other Info", groupable:false}}
        ],
        "StatTable.AlarmgenUpdate.o" : [
            {select:"COUNT(o)", display:{id:'COUNT(o)', field:'COUNT(o)', width:120, name:"Count (o)", groupable:false}},
            {select:"instance", display:{id:'instance', field:'instance', width:150, name:"Instance", groupable:false}},
            {select:"table", display:{id:'table', field:'table', width:150, name:"Table", groupable:false}},
            {select:"o.key", display:{id:'o.key', field:'o.key', width:150, name:"Key", groupable:false}},

            {select:"partition", display:{id:'partition', field:'partition', width:150, name:"Partition", groupable:false}},
            {select:"SUM(partition)", display:{id:'SUM(partition)', field:'SUM(partition)', width:150, name:"SUM (Partition)", groupable:false}},
            {select:"MIN(partition)", display:{id:'MIN(partition)', field:'MIN(partition)', width:150, name:"MIN (Partition)", groupable:false}},
            {select:"MAX(partition)", display:{id:'MAX(partition)', field:'MAX(partition)', width:150, name:"MAX (Partition)", groupable:false}},

            {select:"o.count", display:{id:'o.count', field:'o.count', width:150, name:"o Cnt", groupable:false}},
            {select:"SUM(o.count)", display:{id:'SUM(o.count)', field:'SUM(o.count)', width:150, name:"SUM (o Cnt)", groupable:false}},
            {select:"MIN(o.count)", display:{id:'MIN(o.count)', field:'MIN(o.count)', width:150, name:"MIN (o Cnt)", groupable:false}},
            {select:"MAX(o.count)", display:{id:'MAX(o.count)', field:'MAX(o.count)', width:150, name:"MAX (o Cnt)", groupable:false}},
        ],
        "StatTable.AlarmgenUpdate.i" : [
            {select:"COUNT(i)", display:{id:'COUNT(i)', field:'COUNT(i)', width:120, name:"Count (i)", groupable:false}},
            {select:"instance", display:{id:'instance', field:'instance', width:150, name:"Instance", groupable:false}},
            {select:"table", display:{id:'table', field:'table', width:150, name:"Table", groupable:false}},
            {select:"i.generator", display:{id:'i.generator', field:'i.generator', width:150, name:"Generator", groupable:false}},
            {select:"i.collector", display:{id:'i.collector', field:'i.collector', width:150, name:"Collector", groupable:false}},
            {select:"i.type", display:{id:'i.type', field:'i.type', width:150, name:"Type", groupable:false}},

            {select:"partition", display:{id:'partition', field:'partition', width:150, name:"Partition", groupable:false}},
            {select:"SUM(partition)", display:{id:'SUM(partition)', field:'SUM(partition)', width:150, name:"SUM (Partition)", groupable:false}},
            {select:"MIN(partition)", display:{id:'MIN(partition)', field:'MIN(partition)', width:150, name:"MIN (Partition)", groupable:false}},
            {select:"MAX(partition)", display:{id:'MAX(partition)', field:'MAX(partition)', width:150, name:"MAX (Partition)", groupable:false}},

            {select:"i.count", display:{id:'i.count', field:'i.count', width:150, name:"i Cnt", groupable:false}},
            {select:"SUM(i.count)", display:{id:'SUM(i.count)', field:'SUM(i.count)', width:150, name:"SUM (i Cnt)", groupable:false}},
            {select:"MIN(i.count)", display:{id:'MIN(i.count)', field:'MIN(i.count)', width:150, name:"MIN (i Cnt)", groupable:false}},
            {select:"MAX(i.count)", display:{id:'MAX(i.count)', field:'MAX(i.count)', width:150, name:"MAX (i Cnt)", groupable:false}}
        ],

        "StatTable.AlarmgenStatus.counters" : [
            {select:"COUNT(counters)", display:{id:'COUNT(counters)', field:'COUNT(counters)', width:120, name:"Count (Counters)", groupable:false}},
            {select:"counters.instance", display:{id:'counters.instance', field:'counters.instance', width:150, name:"Instance", groupable:false}},

            {select:"counters.partitions", display:{id:'counters.partitions', field:'counters.partitions', width:150, name:"Partitions", groupable:false}},
            {select:"SUM(counters.partitions)", display:{id:'SUM(counters.partitions)', field:'SUM(counters.partitions)', width:150, name:"SUM (Partitions)", groupable:false}},
            {select:"MIN(counters.partitions)", display:{id:'MIN(counters.partitions)', field:'MIN(counters.partitions)', width:150, name:"MIN (Partitions)", groupable:false}},
            {select:"MAX(counters.partitions)", display:{id:'MAX(counters.partitions)', field:'MAX(counters.partitions)', width:150, name:"MAX (Partitions)", groupable:false}},

            {select:"counters.keys", display:{id:'counters.keys', field:'counters.keys', width:150, name:"Keys", groupable:false}},
            {select:"SUM(counters.keys)", display:{id:'SUM(counters.keys)', field:'SUM(counters.keys)', width:150, name:"SUM (Keys)", groupable:false}},
            {select:"MIN(counters.keys)", display:{id:'MIN(counters.keys)', field:'MIN(counters.keys)', width:150, name:"MIN (Keys)", groupable:false}},
            {select:"MAX(counters.keys)", display:{id:'MAX(counters.keys)', field:'MAX(counters.keys)', width:150, name:"MAX (Keys)", groupable:false}},

            {select:"counters.updates", display:{id:'counters.updates', field:'counters.updates', width:150, name:"Updates", groupable:false}},
            {select:"SUM(counters.updates)", display:{id:'SUM(counters.updates)', field:'SUM(counters.updates)', width:150, name:"SUM (Updates)", groupable:false}},
            {select:"MIN(counters.updates)", display:{id:'MIN(counters.updates)', field:'MIN(counters.updates)', width:150, name:"MIN (Updates)", groupable:false}},
            {select:"MAX(counters.updates)", display:{id:'MAX(counters.updates)', field:'MAX(counters.updates)', width:150, name:"MAX (Updates)", groupable:false}}
        ],

        "StatTable.UveLoadbalancer.virtual_ip_stats" : [
            {select:"COUNT(virtual_ip_stats)", display:{id:'COUNT(virtual_ip_stats)', field:'COUNT(virtual_ip_stats)', width:170, name:"Count (Virtual IP Stats)", groupable:false}},
            {select:"virtual_ip_stats.obj_name", display:{id:'virtual_ip_stats.obj_name', field:'virtual_ip_stats.obj_name', width:150, name:"Object Name", groupable:false}},
            {select:"virtual_ip_stats.uuid", display:{id:"virtual_ip_stats.uuid", field:"virtual_ip_stats.uuid", name:"Virtual IP Stats UUID",  width:280, groupable:true}},
            {select:"virtual_ip_stats.status", display:{id:"virtual_ip_stats.status", field:"virtual_ip_stats.status", name:"Status",  width:150, groupable:true}},
            {select:"virtual_ip_stats.vrouter", display:{id:"virtual_ip_stats.vrouter", field:"virtual_ip_stats.vrouter", name:"Vrouter",  width:150, groupable:true}},

            {select:"virtual_ip_stats.active_connections", display:{id:'virtual_ip_stats.active_connections', field:'virtual_ip_stats.active_connections', width:180, name:"Active Connections", groupable:false}},
            {select:"SUM(virtual_ip_stats.active_connections)", display:{id:'SUM(virtual_ip_stats.active_connections)', field:'SUM(virtual_ip_stats.active_connections)', width:180, name:"SUM (Active Connections)", groupable:false}},
            {select:"MIN(virtual_ip_stats.active_connections)", display:{id:'MIN(virtual_ip_stats.active_connections)', field:'MIN(virtual_ip_stats.active_connections)', width:180, name:"MIN (Active Connections)", groupable:false}},
            {select:"MAX(virtual_ip_stats.active_connections)", display:{id:'MAX(virtual_ip_stats.active_connections)', field:'MAX(virtual_ip_stats.active_connections)', width:180, name:"MAX (Active Connections)", groupable:false}},

            {select:"virtual_ip_stats.max_connections", display:{id:'virtual_ip_stats.max_connections', field:'virtual_ip_stats.max_connections', width:180, name:"Max Connections", groupable:false}},
            {select:"SUM(virtual_ip_stats.max_connections)", display:{id:'SUM(virtual_ip_stats.max_connections)', field:'SUM(virtual_ip_stats.max_connections)', width:180, name:"SUM (Max Connections)", groupable:false}},
            {select:"MIN(virtual_ip_stats.max_connections)", display:{id:'MIN(virtual_ip_stats.max_connections)', field:'MIN(virtual_ip_stats.max_connections)', width:180, name:"MIN (Max Connections)", groupable:false}},
            {select:"MAX(virtual_ip_stats.max_connections)", display:{id:'MAX(virtual_ip_stats.max_connections)', field:'MAX(virtual_ip_stats.max_connections)', width:180, name:"MAX (Max Connections)", groupable:false}},

            {select:"virtual_ip_stats.current_sessions", display:{id:'virtual_ip_stats.current_sessions', field:'virtual_ip_stats.current_sessions', width:180, name:"Current Sessions", groupable:false}},
            {select:"SUM(virtual_ip_stats.current_sessions)", display:{id:'SUM(virtual_ip_stats.current_sessions)', field:'SUM(virtual_ip_stats.current_sessions)', width:180, name:"SUM (Current Sessions)", groupable:false}},
            {select:"MIN(virtual_ip_stats.current_sessions)", display:{id:'MIN(virtual_ip_stats.current_sessions)', field:'MIN(virtual_ip_stats.current_sessions)', width:180, name:"MIN (Current Sessions)", groupable:false}},
            {select:"MAX(virtual_ip_stats.current_sessions)", display:{id:'MAX(virtual_ip_stats.current_sessions)', field:'MAX(virtual_ip_stats.current_sessions)', width:180, name:"MAX (Current Sessions)", groupable:false}},

            {select:"virtual_ip_stats.max_sessions", display:{id:'virtual_ip_stats.max_sessions', field:'virtual_ip_stats.max_sessions', width:180, name:"Max Sessions", groupable:false}},
            {select:"SUM(virtual_ip_stats.max_sessions)", display:{id:'SUM(virtual_ip_stats.max_sessions)', field:'SUM(virtual_ip_stats.max_sessions)', width:180, name:"SUM (Max Sessions)", groupable:false}},
            {select:"MIN(virtual_ip_stats.max_sessions)", display:{id:'MIN(virtual_ip_stats.max_sessions)', field:'MIN(virtual_ip_stats.max_sessions)', width:180, name:"MIN (Max Sessions)", groupable:false}},
            {select:"MAX(virtual_ip_stats.max_sessions)", display:{id:'MAX(virtual_ip_stats.max_sessions)', field:'MAX(virtual_ip_stats.max_sessions)', width:180, name:"MAX (Max Sessions)", groupable:false}},

            {select:"virtual_ip_stats.total_sessions", display:{id:'virtual_ip_stats.total_sessions', field:'virtual_ip_stats.total_sessions', width:180, name:"Total Sessions", groupable:false}},
            {select:"SUM(virtual_ip_stats.total_sessions)", display:{id:'SUM(virtual_ip_stats.total_sessions)', field:'SUM(virtual_ip_stats.total_sessions)', width:180, name:"SUM (Total Sessions)", groupable:false}},
            {select:"MIN(virtual_ip_stats.total_sessions)", display:{id:'MIN(virtual_ip_stats.total_sessions)', field:'MIN(virtual_ip_stats.total_sessions)', width:180, name:"MIN (Total Sessions)", groupable:false}},
            {select:"MAX(virtual_ip_stats.total_sessions)", display:{id:'MAX(virtual_ip_stats.total_sessions)', field:'MAX(virtual_ip_stats.total_sessions)', width:180, name:"MAX (Total Sessions)", groupable:false}},

            {select:"virtual_ip_stats.bytes_in", display:{id:'virtual_ip_stats.bytes_in', field:'virtual_ip_stats.bytes_in', width:150, name:"Bytes In", groupable:false}},
            {select:"SUM(virtual_ip_stats.bytes_in)", display:{id:'SUM(virtual_ip_stats.bytes_in)', field:'SUM(virtual_ip_stats.bytes_in)', width:150, name:"SUM (Bytes In)", groupable:false}},
            {select:"MIN(virtual_ip_stats.bytes_in)", display:{id:'MIN(virtual_ip_stats.bytes_in)', field:'MIN(virtual_ip_stats.bytes_in)', width:150, name:"MIN (Bytes In)", groupable:false}},
            {select:"MAX(virtual_ip_stats.bytes_in)", display:{id:'MAX(virtual_ip_stats.bytes_in)', field:'MAX(virtual_ip_stats.bytes_in)', width:150, name:"MAX (Bytes In)", groupable:false}},

            {select:"virtual_ip_stats.bytes_out", display:{id:'virtual_ip_stats.bytes_out', field:'virtual_ip_stats.bytes_out', width:150, name:"Bytes Out", groupable:false}},
            {select:"SUM(virtual_ip_stats.bytes_out)", display:{id:'SUM(virtual_ip_stats.bytes_out)', field:'SUM(virtual_ip_stats.bytes_out)', width:150, name:"SUM (Bytes Out)", groupable:false}},
            {select:"MIN(virtual_ip_stats.bytes_out)", display:{id:'MIN(virtual_ip_stats.bytes_out)', field:'MIN(virtual_ip_stats.bytes_out)', width:150, name:"MIN (Bytes Out)", groupable:false}},
            {select:"MAX(virtual_ip_stats.bytes_out)", display:{id:'MAX(virtual_ip_stats.bytes_out)', field:'MAX(virtual_ip_stats.bytes_out)', width:150, name:"MAX (Bytes Out)", groupable:false}},

            {select:"virtual_ip_stats.connection_errors", display:{id:'virtual_ip_stats.connection_errors', field:'virtual_ip_stats.connection_errors', width:180, name:"Connection Errors", groupable:false}},
            {select:"SUM(virtual_ip_stats.connection_errors)", display:{id:'SUM(virtual_ip_stats.connection_errors)', field:'SUM(virtual_ip_stats.connection_errors)', width:180, name:"SUM (Connection Errors)", groupable:false}},
            {select:"MIN(virtual_ip_stats.connection_errors)", display:{id:'MIN(virtual_ip_stats.connection_errors)', field:'MIN(virtual_ip_stats.connection_errors)', width:180, name:"MIN (Connection Errors)", groupable:false}},
            {select:"MAX(virtual_ip_stats.connection_errors)", display:{id:'MAX(virtual_ip_stats.connection_errors)', field:'MAX(virtual_ip_stats.connection_errors)', width:180, name:"MAX (Connection Errors)", groupable:false}},

            {select:"virtual_ip_stats.reponse_errors", display:{id:'virtual_ip_stats.reponse_errors', field:'virtual_ip_stats.reponse_errors', width:180, name:"Reponse Errors", groupable:false}},
            {select:"SUM(virtual_ip_stats.reponse_errors)", display:{id:'SUM(virtual_ip_stats.reponse_errors)', field:'SUM(virtual_ip_stats.reponse_errors)', width:180, name:"SUM (Reponse Errors)", groupable:false}},
            {select:"MIN(virtual_ip_stats.reponse_errors)", display:{id:'MIN(virtual_ip_stats.reponse_errors)', field:'MIN(virtual_ip_stats.reponse_errors)', width:180, name:"MIN (Reponse Errors)", groupable:false}},
            {select:"MAX(virtual_ip_stats.reponse_errors)", display:{id:'MAX(virtual_ip_stats.reponse_errors)', field:'MAX(virtual_ip_stats.reponse_errors)', width:180, name:"MAX (Reponse Errors)", groupable:false}},
        ],
        "StatTable.UveLoadbalancer.listener_stats": [
            {select:"COUNT(listener_stats)", display:{id:'COUNT(listener_stats)', field:'COUNT(listener_stats)', width:170, name:"Count (Listener Stats)", groupable:false}},
            {select:"listener_stats.obj_name", display:{id:'listener_stats.obj_name', field:'listener_stats.obj_name', width:150, name:"Object Name", groupable:false}},
            {select:"listener_stats.uuid", display:{id:"listener_stats.uuid", field:"listener_stats.uuid", name:"Listener Stats UUID",  width:280, groupable:true}},
            {select:"listener_stats.status", display:{id:"listener_stats.status", field:"listener_stats.status", name:"Status",  width:150, groupable:true}},
            {select:"listener_stats.vrouter", display:{id:"listener_stats.vrouter", field:"listener_stats.vrouter", name:"Vrouter",  width:150, groupable:true}},

            {select:"listener_stats.active_connections", display:{id:'listener_stats.active_connections', field:'listener_stats.active_connections', width:180, name:"Active Connections", groupable:false}},
            {select:"SUM(listener_stats.active_connections)", display:{id:'SUM(listener_stats.active_connections)', field:'SUM(listener_stats.active_connections)', width:180, name:"SUM (Active Connections)", groupable:false}},
            {select:"MIN(listener_stats.active_connections)", display:{id:'MIN(listener_stats.active_connections)', field:'MIN(listener_stats.active_connections)', width:180, name:"MIN (Active Connections)", groupable:false}},
            {select:"MAX(listener_stats.active_connections)", display:{id:'MAX(listener_stats.active_connections)', field:'MAX(listener_stats.active_connections)', width:180, name:"MAX (Active Connections)", groupable:false}},

            {select:"listener_stats.max_connections", display:{id:'listener_stats.max_connections', field:'listener_stats.max_connections', width:180, name:"Max Connections", groupable:false}},
            {select:"SUM(listener_stats.max_connections)", display:{id:'SUM(listener_stats.max_connections)', field:'SUM(listener_stats.max_connections)', width:180, name:"SUM (Max Connections)", groupable:false}},
            {select:"MIN(listener_stats.max_connections)", display:{id:'MIN(listener_stats.max_connections)', field:'MIN(listener_stats.max_connections)', width:180, name:"MIN (Max Connections)", groupable:false}},
            {select:"MAX(listener_stats.max_connections)", display:{id:'MAX(listener_stats.max_connections)', field:'MAX(listener_stats.max_connections)', width:180, name:"MAX (Max Connections)", groupable:false}},

            {select:"listener_stats.current_sessions", display:{id:'listener_stats.current_sessions', field:'listener_stats.current_sessions', width:180, name:"Current Sessions", groupable:false}},
            {select:"SUM(listener_stats.current_sessions)", display:{id:'SUM(listener_stats.current_sessions)', field:'SUM(listener_stats.current_sessions)', width:180, name:"SUM (Current Sessions)", groupable:false}},
            {select:"MIN(listener_stats.current_sessions)", display:{id:'MIN(listener_stats.current_sessions)', field:'MIN(listener_stats.current_sessions)', width:180, name:"MIN (Current Sessions)", groupable:false}},
            {select:"MAX(listener_stats.current_sessions)", display:{id:'MAX(listener_stats.current_sessions)', field:'MAX(listener_stats.current_sessions)', width:180, name:"MAX (Current Sessions)", groupable:false}},

            {select:"listener_stats.max_sessions", display:{id:'listener_stats.max_sessions', field:'listener_stats.max_sessions', width:180, name:"Max Sessions", groupable:false}},
            {select:"SUM(listener_stats.max_sessions)", display:{id:'SUM(listener_stats.max_sessions)', field:'SUM(listener_stats.max_sessions)', width:180, name:"SUM (Max Sessions)", groupable:false}},
            {select:"MIN(listener_stats.max_sessions)", display:{id:'MIN(listener_stats.max_sessions)', field:'MIN(listener_stats.max_sessions)', width:180, name:"MIN (Max Sessions)", groupable:false}},
            {select:"MAX(listener_stats.max_sessions)", display:{id:'MAX(listener_stats.max_sessions)', field:'MAX(listener_stats.max_sessions)', width:180, name:"MAX (Max Sessions)", groupable:false}},

            {select:"listener_stats.total_sessions", display:{id:'listener_stats.total_sessions', field:'listener_stats.total_sessions', width:180, name:"Total Sessions", groupable:false}},
            {select:"SUM(listener_stats.total_sessions)", display:{id:'SUM(listener_stats.total_sessions)', field:'SUM(listener_stats.total_sessions)', width:180, name:"SUM (Total Sessions)", groupable:false}},
            {select:"MIN(listener_stats.total_sessions)", display:{id:'MIN(listener_stats.total_sessions)', field:'MIN(listener_stats.total_sessions)', width:180, name:"MIN (Total Sessions)", groupable:false}},
            {select:"MAX(listener_stats.total_sessions)", display:{id:'MAX(listener_stats.total_sessions)', field:'MAX(listener_stats.total_sessions)', width:180, name:"MAX (Total Sessions)", groupable:false}},

            {select:"listener_stats.bytes_in", display:{id:'listener_stats.bytes_in', field:'listener_stats.bytes_in', width:150, name:"Bytes In", groupable:false}},
            {select:"SUM(listener_stats.bytes_in)", display:{id:'SUM(listener_stats.bytes_in)', field:'SUM(listener_stats.bytes_in)', width:150, name:"SUM (Bytes In)", groupable:false}},
            {select:"MIN(listener_stats.bytes_in)", display:{id:'MIN(listener_stats.bytes_in)', field:'MIN(listener_stats.bytes_in)', width:150, name:"MIN (Bytes In)", groupable:false}},
            {select:"MAX(listener_stats.bytes_in)", display:{id:'MAX(listener_stats.bytes_in)', field:'MAX(listener_stats.bytes_in)', width:150, name:"MAX (Bytes In)", groupable:false}},

            {select:"listener_stats.bytes_out", display:{id:'listener_stats.bytes_out', field:'listener_stats.bytes_out', width:150, name:"Bytes Out", groupable:false}},
            {select:"SUM(listener_stats.bytes_out)", display:{id:'SUM(listener_stats.bytes_out)', field:'SUM(listener_stats.bytes_out)', width:150, name:"SUM (Bytes Out)", groupable:false}},
            {select:"MIN(listener_stats.bytes_out)", display:{id:'MIN(listener_stats.bytes_out)', field:'MIN(listener_stats.bytes_out)', width:150, name:"MIN (Bytes Out)", groupable:false}},
            {select:"MAX(listener_stats.bytes_out)", display:{id:'MAX(listener_stats.bytes_out)', field:'MAX(listener_stats.bytes_out)', width:150, name:"MAX (Bytes Out)", groupable:false}},

            {select:"listener_stats.connection_errors", display:{id:'listener_stats.connection_errors', field:'listener_stats.connection_errors', width:180, name:"Connection Errors", groupable:false}},
            {select:"SUM(listener_stats.connection_errors)", display:{id:'SUM(listener_stats.connection_errors)', field:'SUM(listener_stats.connection_errors)', width:180, name:"SUM (Connection Errors)", groupable:false}},
            {select:"MIN(listener_stats.connection_errors)", display:{id:'MIN(listener_stats.connection_errors)', field:'MIN(listener_stats.connection_errors)', width:180, name:"MIN (Connection Errors)", groupable:false}},
            {select:"MAX(listener_stats.connection_errors)", display:{id:'MAX(listener_stats.connection_errors)', field:'MAX(listener_stats.connection_errors)', width:180, name:"MAX (Connection Errors)", groupable:false}},

            {select:"listener_stats.reponse_errors", display:{id:'listener_stats.reponse_errors', field:'listener_stats.reponse_errors', width:180, name:"Reponse Errors", groupable:false}},
            {select:"SUM(listener_stats.reponse_errors)", display:{id:'SUM(listener_stats.reponse_errors)', field:'SUM(listener_stats.reponse_errors)', width:180, name:"SUM (Reponse Errors)", groupable:false}},
            {select:"MIN(listener_stats.reponse_errors)", display:{id:'MIN(listener_stats.reponse_errors)', field:'MIN(listener_stats.reponse_errors)', width:180, name:"MIN (Reponse Errors)", groupable:false}},
            {select:"MAX(listener_stats.reponse_errors)", display:{id:'MAX(listener_stats.reponse_errors)', field:'MAX(listener_stats.reponse_errors)', width:180, name:"MAX (Reponse Errors)", groupable:false}},
        ],
        "StatTable.UveLoadbalancer.pool_stats" : [
            {select:"COUNT(pool_stats)", display:{id:'COUNT(pool_stats)', field:'COUNT(pool_stats)', width:150, name:"Count (Pool Stats)", groupable:false}},
            {select:"pool_stats.obj_name", display:{id:'pool_stats.obj_name', field:'pool_stats.obj_name', width:150, name:"Object Name", groupable:false}},
            {select:"pool_stats.uuid", display:{id:"pool_stats.uuid", field:"pool_stats.uuid", name:"Pool Stats UUID",  width:280, groupable:true}},
            {select:"pool_stats.status", display:{id:"pool_stats.status", field:"pool_stats.status", name:"Status",  width:150, groupable:true}},
            {select:"pool_stats.vrouter", display:{id:"pool_stats.vrouter", field:"pool_stats.vrouter", name:"Vrouter",  width:150, groupable:true}},

            {select:"pool_stats.active_connections", display:{id:'pool_stats.active_connections', field:'pool_stats.active_connections', width:180, name:"Active Connections", groupable:false}},
            {select:"SUM(pool_stats.active_connections)", display:{id:'SUM(pool_stats.active_connections)', field:'SUM(pool_stats.active_connections)', width:180, name:"SUM (Active Connections)", groupable:false}},
            {select:"MIN(pool_stats.active_connections)", display:{id:'MIN(pool_stats.active_connections)', field:'MIN(pool_stats.active_connections)', width:180, name:"MIN (Active Connections)", groupable:false}},
            {select:"MAX(pool_stats.active_connections)", display:{id:'MAX(pool_stats.active_connections)', field:'MAX(pool_stats.active_connections)', width:180, name:"MAX (Active Connections)", groupable:false}},

            {select:"pool_stats.max_connections", display:{id:'pool_stats.max_connections', field:'pool_stats.max_connections', width:180, name:"Max Connections", groupable:false}},
            {select:"SUM(pool_stats.max_connections)", display:{id:'SUM(pool_stats.max_connections)', field:'SUM(pool_stats.max_connections)', width:180, name:"SUM (Max Connections)", groupable:false}},
            {select:"MIN(pool_stats.max_connections)", display:{id:'MIN(pool_stats.max_connections)', field:'MIN(pool_stats.max_connections)', width:180, name:"MIN (Max Connections)", groupable:false}},
            {select:"MAX(pool_stats.max_connections)", display:{id:'MAX(pool_stats.max_connections)', field:'MAX(pool_stats.max_connections)', width:180, name:"MAX (Max Connections)", groupable:false}},

            {select:"pool_stats.current_sessions", display:{id:'pool_stats.current_sessions', field:'pool_stats.current_sessions', width:180, name:"Current Sessions", groupable:false}},
            {select:"SUM(pool_stats.current_sessions)", display:{id:'SUM(pool_stats.current_sessions)', field:'SUM(pool_stats.current_sessions)', width:180, name:"SUM (Current Sessions)", groupable:false}},
            {select:"MIN(pool_stats.current_sessions)", display:{id:'MIN(pool_stats.current_sessions)', field:'MIN(pool_stats.current_sessions)', width:180, name:"MIN (Current Sessions)", groupable:false}},
            {select:"MAX(pool_stats.current_sessions)", display:{id:'MAX(pool_stats.current_sessions)', field:'MAX(pool_stats.current_sessions)', width:180, name:"MAX (Current Sessions)", groupable:false}},

            {select:"pool_stats.max_sessions", display:{id:'pool_stats.max_sessions', field:'pool_stats.max_sessions', width:180, name:"Max Sessions", groupable:false}},
            {select:"SUM(pool_stats.max_sessions)", display:{id:'SUM(pool_stats.max_sessions)', field:'SUM(pool_stats.max_sessions)', width:180, name:"SUM (Max Sessions)", groupable:false}},
            {select:"MIN(pool_stats.max_sessions)", display:{id:'MIN(pool_stats.max_sessions)', field:'MIN(pool_stats.max_sessions)', width:180, name:"MIN (Max Sessions)", groupable:false}},
            {select:"MAX(pool_stats.max_sessions)", display:{id:'MAX(pool_stats.max_sessions)', field:'MAX(pool_stats.max_sessions)', width:180, name:"MAX (Max Sessions)", groupable:false}},

            {select:"pool_stats.total_sessions", display:{id:'pool_stats.total_sessions', field:'pool_stats.total_sessions', width:180, name:"Total Sessions", groupable:false}},
            {select:"SUM(pool_stats.total_sessions)", display:{id:'SUM(pool_stats.total_sessions)', field:'SUM(pool_stats.total_sessions)', width:180, name:"SUM (Total Sessions)", groupable:false}},
            {select:"MIN(pool_stats.total_sessions)", display:{id:'MIN(pool_stats.total_sessions)', field:'MIN(pool_stats.total_sessions)', width:180, name:"MIN (Total Sessions)", groupable:false}},
            {select:"MAX(pool_stats.total_sessions)", display:{id:'MAX(pool_stats.total_sessions)', field:'MAX(pool_stats.total_sessions)', width:180, name:"MAX (Total Sessions)", groupable:false}},

            {select:"pool_stats.bytes_in", display:{id:'pool_stats.bytes_in', field:'pool_stats.bytes_in', width:150, name:"Bytes In", groupable:false}},
            {select:"SUM(pool_stats.bytes_in)", display:{id:'SUM(pool_stats.bytes_in)', field:'SUM(pool_stats.bytes_in)', width:150, name:"SUM (Bytes In)", groupable:false}},
            {select:"MIN(pool_stats.bytes_in)", display:{id:'MIN(pool_stats.bytes_in)', field:'MIN(pool_stats.bytes_in)', width:150, name:"MIN (Bytes In)", groupable:false}},
            {select:"MAX(pool_stats.bytes_in)", display:{id:'MAX(pool_stats.bytes_in)', field:'MAX(pool_stats.bytes_in)', width:150, name:"MAX (Bytes In)", groupable:false}},

            {select:"pool_stats.bytes_out", display:{id:'pool_stats.bytes_out', field:'pool_stats.bytes_out', width:150, name:"Bytes Out", groupable:false}},
            {select:"SUM(pool_stats.bytes_out)", display:{id:'SUM(pool_stats.bytes_out)', field:'SUM(pool_stats.bytes_out)', width:150, name:"SUM (Bytes Out)", groupable:false}},
            {select:"MIN(pool_stats.bytes_out)", display:{id:'MIN(pool_stats.bytes_out)', field:'MIN(pool_stats.bytes_out)', width:150, name:"MIN (Bytes Out)", groupable:false}},
            {select:"MAX(pool_stats.bytes_out)", display:{id:'MAX(pool_stats.bytes_out)', field:'MAX(pool_stats.bytes_out)', width:150, name:"MAX (Bytes Out)", groupable:false}},

            {select:"pool_stats.connection_errors", display:{id:'pool_stats.connection_errors', field:'pool_stats.connection_errors', width:180, name:"Connection Errors", groupable:false}},
            {select:"SUM(pool_stats.connection_errors)", display:{id:'SUM(pool_stats.connection_errors)', field:'SUM(pool_stats.connection_errors)', width:180, name:"SUM (Connection Errors)", groupable:false}},
            {select:"MIN(pool_stats.connection_errors)", display:{id:'MIN(pool_stats.connection_errors)', field:'MIN(pool_stats.connection_errors)', width:180, name:"MIN (Connection Errors)", groupable:false}},
            {select:"MAX(pool_stats.connection_errors)", display:{id:'MAX(pool_stats.connection_errors)', field:'MAX(pool_stats.connection_errors)', width:180, name:"MAX (Connection Errors)", groupable:false}},

            {select:"pool_stats.reponse_errors", display:{id:'pool_stats.reponse_errors', field:'pool_stats.reponse_errors', width:180, name:"Reponse Errors", groupable:false}},
            {select:"SUM(pool_stats.reponse_errors)", display:{id:'SUM(pool_stats.reponse_errors)', field:'SUM(pool_stats.reponse_errors)', width:180, name:"SUM (Reponse Errors)", groupable:false}},
            {select:"MIN(pool_stats.reponse_errors)", display:{id:'MIN(pool_stats.reponse_errors)', field:'MIN(pool_stats.reponse_errors)', width:180, name:"MIN (Reponse Errors)", groupable:false}},
            {select:"MAX(pool_stats.reponse_errors)", display:{id:'MAX(pool_stats.reponse_errors)', field:'MAX(pool_stats.reponse_errors)', width:180, name:"MAX (Reponse Errors)", groupable:false}},
        ],
        "StatTable.UveLoadbalancer.member_stats": [
            {select:"COUNT(member_stats)", display:{id:'COUNT(member_stats)', field:'COUNT(member_stats)', width:170, name:"Count (Member Stats)", groupable:false}},
            {select:"member_stats.obj_name", display:{id:'member_stats.obj_name', field:'member_stats.obj_name', width:150, name:"Object Name", groupable:false}},
            {select:"member_stats.uuid", display:{id:"member_stats.uuid", field:"member_stats.uuid", name:"Pool Stats UUID",  width:280, groupable:true}},
            {select:"member_stats.status", display:{id:"member_stats.status", field:"member_stats.status", name:"Status",  width:150, groupable:true}},
            {select:"member_stats.vrouter", display:{id:"member_stats.vrouter", field:"member_stats.vrouter", name:"Vrouter",  width:150, groupable:true}},

            {select:"member_stats.active_connections", display:{id:'member_stats.active_connections', field:'member_stats.active_connections', width:180, name:"Active Connections", groupable:false}},
            {select:"SUM(member_stats.active_connections)", display:{id:'SUM(member_stats.active_connections)', field:'SUM(member_stats.active_connections)', width:180, name:"SUM (Active Connections)", groupable:false}},
            {select:"MIN(member_stats.active_connections)", display:{id:'MIN(member_stats.active_connections)', field:'MIN(member_stats.active_connections)', width:180, name:"MIN (Active Connections)", groupable:false}},
            {select:"MAX(member_stats.active_connections)", display:{id:'MAX(member_stats.active_connections)', field:'MAX(member_stats.active_connections)', width:180, name:"MAX (Active Connections)", groupable:false}},

            {select:"member_stats.max_connections", display:{id:'member_stats.max_connections', field:'member_stats.max_connections', width:180, name:"Max Connections", groupable:false}},
            {select:"SUM(member_stats.max_connections)", display:{id:'SUM(member_stats.max_connections)', field:'SUM(member_stats.max_connections)', width:180, name:"SUM (Max Connections)", groupable:false}},
            {select:"MIN(member_stats.max_connections)", display:{id:'MIN(member_stats.max_connections)', field:'MIN(member_stats.max_connections)', width:180, name:"MIN (Max Connections)", groupable:false}},
            {select:"MAX(member_stats.max_connections)", display:{id:'MAX(member_stats.max_connections)', field:'MAX(member_stats.max_connections)', width:180, name:"MAX (Max Connections)", groupable:false}},

            {select:"member_stats.current_sessions", display:{id:'member_stats.current_sessions', field:'member_stats.current_sessions', width:180, name:"Current Sessions", groupable:false}},
            {select:"SUM(member_stats.current_sessions)", display:{id:'SUM(member_stats.current_sessions)', field:'SUM(member_stats.current_sessions)', width:180, name:"SUM (Current Sessions)", groupable:false}},
            {select:"MIN(member_stats.current_sessions)", display:{id:'MIN(member_stats.current_sessions)', field:'MIN(member_stats.current_sessions)', width:180, name:"MIN (Current Sessions)", groupable:false}},
            {select:"MAX(member_stats.current_sessions)", display:{id:'MAX(member_stats.current_sessions)', field:'MAX(member_stats.current_sessions)', width:180, name:"MAX (Current Sessions)", groupable:false}},

            {select:"member_stats.max_sessions", display:{id:'member_stats.max_sessions', field:'member_stats.max_sessions', width:180, name:"Max Sessions", groupable:false}},
            {select:"SUM(member_stats.max_sessions)", display:{id:'SUM(member_stats.max_sessions)', field:'SUM(member_stats.max_sessions)', width:180, name:"SUM (Max Sessions)", groupable:false}},
            {select:"MIN(member_stats.max_sessions)", display:{id:'MIN(member_stats.max_sessions)', field:'MIN(member_stats.max_sessions)', width:180, name:"MIN (Max Sessions)", groupable:false}},
            {select:"MAX(member_stats.max_sessions)", display:{id:'MAX(member_stats.max_sessions)', field:'MAX(member_stats.max_sessions)', width:180, name:"MAX (Max Sessions)", groupable:false}},

            {select:"member_stats.total_sessions", display:{id:'member_stats.total_sessions', field:'member_stats.total_sessions', width:180, name:"Total Sessions", groupable:false}},
            {select:"SUM(member_stats.total_sessions)", display:{id:'SUM(member_stats.total_sessions)', field:'SUM(member_stats.total_sessions)', width:180, name:"SUM (Total Sessions)", groupable:false}},
            {select:"MIN(member_stats.total_sessions)", display:{id:'MIN(member_stats.total_sessions)', field:'MIN(member_stats.total_sessions)', width:180, name:"MIN (Total Sessions)", groupable:false}},
            {select:"MAX(member_stats.total_sessions)", display:{id:'MAX(member_stats.total_sessions)', field:'MAX(member_stats.total_sessions)', width:180, name:"MAX (Total Sessions)", groupable:false}},

            {select:"member_stats.bytes_in", display:{id:'member_stats.bytes_in', field:'member_stats.bytes_in', width:150, name:"Bytes In", groupable:false}},
            {select:"SUM(member_stats.bytes_in)", display:{id:'SUM(member_stats.bytes_in)', field:'SUM(member_stats.bytes_in)', width:150, name:"SUM (Bytes In)", groupable:false}},
            {select:"MIN(member_stats.bytes_in)", display:{id:'MIN(member_stats.bytes_in)', field:'MIN(member_stats.bytes_in)', width:150, name:"MIN (Bytes In)", groupable:false}},
            {select:"MAX(member_stats.bytes_in)", display:{id:'MAX(member_stats.bytes_in)', field:'MAX(member_stats.bytes_in)', width:150, name:"MAX (Bytes In)", groupable:false}},

            {select:"member_stats.bytes_out", display:{id:'member_stats.bytes_out', field:'member_stats.bytes_out', width:150, name:"Bytes Out", groupable:false}},
            {select:"SUM(member_stats.bytes_out)", display:{id:'SUM(member_stats.bytes_out)', field:'SUM(member_stats.bytes_out)', width:150, name:"SUM (Bytes Out)", groupable:false}},
            {select:"MIN(member_stats.bytes_out)", display:{id:'MIN(member_stats.bytes_out)', field:'MIN(member_stats.bytes_out)', width:150, name:"MIN (Bytes Out)", groupable:false}},
            {select:"MAX(member_stats.bytes_out)", display:{id:'MAX(member_stats.bytes_out)', field:'MAX(member_stats.bytes_out)', width:150, name:"MAX (Bytes Out)", groupable:false}},

            {select:"member_stats.connection_errors", display:{id:'member_stats.connection_errors', field:'member_stats.connection_errors', width:180, name:"Connection Errors", groupable:false}},
            {select:"SUM(member_stats.connection_errors)", display:{id:'SUM(member_stats.connection_errors)', field:'SUM(member_stats.connection_errors)', width:180, name:"SUM (Connection Errors)", groupable:false}},
            {select:"MIN(member_stats.connection_errors)", display:{id:'MIN(member_stats.connection_errors)', field:'MIN(member_stats.connection_errors)', width:180, name:"MIN (Connection Errors)", groupable:false}},
            {select:"MAX(member_stats.connection_errors)", display:{id:'MAX(member_stats.connection_errors)', field:'MAX(member_stats.connection_errors)', width:180, name:"MAX (Connection Errors)", groupable:false}},

            {select:"member_stats.reponse_errors", display:{id:'member_stats.reponse_errors', field:'member_stats.reponse_errors', width:180, name:"Reponse Errors", groupable:false}},
            {select:"SUM(member_stats.reponse_errors)", display:{id:'SUM(member_stats.reponse_errors)', field:'SUM(member_stats.reponse_errors)', width:180, name:"SUM (Reponse Errors)", groupable:false}},
            {select:"MIN(member_stats.reponse_errors)", display:{id:'MIN(member_stats.reponse_errors)', field:'MIN(member_stats.reponse_errors)', width:180, name:"MIN (Reponse Errors)", groupable:false}},
            {select:"MAX(member_stats.reponse_errors)", display:{id:'MAX(member_stats.reponse_errors)', field:'MAX(member_stats.reponse_errors)', width:180, name:"MAX (Reponse Errors)", groupable:false}},
        ],
        "StatTable.NodeStatus.disk_usage_info": [
            {select:"COUNT(disk_usage_info)", display:{id:'COUNT(disk_usage_info)', field:'COUNT(disk_usage_info)', width:180, name:"Count (Disk Usage Info)", groupable:false}},
            {select:"disk_usage_info.partition_type", display:{id:'disk_usage_info.partition_type', field:'disk_usage_info.partition_type', width:150, name:"Partition Type", groupable:false}},
            {select:"disk_usage_info.partition_name", display:{id:'disk_usage_info.partition_name', field:'disk_usage_info.partition_name', width:150, name:"Partition Name", groupable:false}},

            {select:"disk_usage_info.partition_space_used_1k", display:{id:'disk_usage_info.partition_space_used_1k', field:'disk_usage_info.partition_space_used_1k', width:200, name:"Partition Space Used (1k)", groupable:false}},
            {select:"SUM(disk_usage_info.partition_space_used_1k)", display:{id:'SUM(disk_usage_info.partition_space_used_1k)', field:'SUM(disk_usage_info.partition_space_used_1k)', width:240, name:"SUM (Partition Space Used (1k))", groupable:false}},
            {select:"MIN(disk_usage_info.partition_space_used_1k)", display:{id:'MIN(disk_usage_info.partition_space_used_1k)', field:'MIN(disk_usage_info.partition_space_used_1k)', width:240, name:"MIN (Partition Space Used (1k))", groupable:false}},
            {select:"MAX(disk_usage_info.partition_space_used_1k)", display:{id:'MAX(disk_usage_info.partition_space_used_1k)', field:'MAX(disk_usage_info.partition_space_used_1k)', width:240, name:"MAX (Partition Space Used (1k))", groupable:false}},

            {select:"disk_usage_info.partition_space_available_1k", display:{id:'disk_usage_info.partition_space_available_1k', field:'disk_usage_info.partition_space_available_1k', width:260, name:"Partition Space Available (1k)", groupable:false}},
            {select:"SUM(disk_usage_info.partition_space_available_1k)", display:{id:'SUM(disk_usage_info.partition_space_available_1k)', field:'SUM(disk_usage_info.partition_space_available_1k)', width:260, name:"SUM (Partition Space Available (1k))", groupable:false}},
            {select:"MIN(disk_usage_info.partition_space_available_1k)", display:{id:'MIN(disk_usage_info.partition_space_available_1k)', field:'MIN(disk_usage_info.partition_space_available_1k)', width:260, name:"MIN (Partition Space Available (1k))", groupable:false}},
            {select:"MAX(disk_usage_info.partition_space_available_1k)", display:{id:'MAX(disk_usage_info.partition_space_available_1k)', field:'MAX(disk_usage_info.partition_space_available_1k)', width:260, name:"MAX (Partition Space Available (1k))", groupable:false}},
        ],
        "StatTable.UveVMInterfaceAgent.fip_diff_stats": [
            {select:"COUNT(fip_diff_stats)", display:{id:'COUNT(fip_diff_stats)', field:'COUNT(fip_diff_stats)', width:150, name:"Count (FIP Diff Stats)", groupable:false}},
            {select:"virtual_network", display:{id:'virtual_network', field:'virtual_network', width:150, name:"Virtual Network", groupable:false}},
            {select:"fip_diff_stats.other_vn", display:{id:'fip_diff_stats.other_vn', field:'fip_diff_stats.other_vn', width:150, name:"Other VN", groupable:false}},
            {select:"fip_diff_stats.ip_address", display:{id:'fip_diff_stats.ip_address', field:'fip_diff_stats.ip_address', width:150, name:"IP Address", groupable:false}},

            {select:"fip_diff_stats.in_pkts", display:{id:'fip_diff_stats.in_pkts', field:'fip_diff_stats.in_pkts', width:150, name:"In Pkts", groupable:false}},
            {select:"SUM(fip_diff_stats.in_pkts)", display:{id:'SUM(fip_diff_stats.in_pkts)', field:'SUM(fip_diff_stats.in_pkts)', width:150, name:"SUM (In Pkts)", groupable:false}},
            {select:"MIN(fip_diff_stats.in_pkts)", display:{id:'MIN(fip_diff_stats.in_pkts)', field:'MIN(fip_diff_stats.in_pkts)', width:150, name:"MIN (In Pkts)", groupable:false}},
            {select:"MAX(fip_diff_stats.in_pkts)", display:{id:'MAX(fip_diff_stats.in_pkts)', field:'MAX(fip_diff_stats.in_pkts)', width:150, name:"MAX (In Pkts)", groupable:false}},

            {select:"fip_diff_stats.in_pkts", display:{id:'fip_diff_stats.in_bytes', field:'fip_diff_stats.in_bytes', width:150, name:"In Bytes", groupable:false}},
            {select:"SUM(fip_diff_stats.in_bytes)", display:{id:'SUM(fip_diff_stats.in_bytes)', field:'SUM(fip_diff_stats.in_bytes)', width:150, name:"SUM (In Bytes)", groupable:false}},
            {select:"MIN(fip_diff_stats.in_bytes)", display:{id:'MIN(fip_diff_stats.in_bytes)', field:'MIN(fip_diff_stats.in_bytes)', width:150, name:"MIN (In Bytes)", groupable:false}},
            {select:"MAX(fip_diff_stats.in_bytes)", display:{id:'MAX(fip_diff_stats.in_bytes)', field:'MAX(fip_diff_stats.in_bytes)', width:150, name:"MAX (In Bytes)", groupable:false}},

            {select:"fip_diff_stats.out_pkts", display:{id:'fip_diff_stats.out_pkts', field:'fip_diff_stats.out_pkts', width:150, name:"Out Pkts", groupable:false}},
            {select:"SUM(fip_diff_stats.out_pkts)", display:{id:'SUM(fip_diff_stats.out_pkts)', field:'SUM(fip_diff_stats.out_pkts)', width:150, name:"SUM (Out Pkts)", groupable:false}},
            {select:"MIN(fip_diff_stats.out_pkts)", display:{id:'MIN(fip_diff_stats.out_pkts)', field:'MIN(fip_diff_stats.out_pkts)', width:150, name:"MIN (Out Pkts)", groupable:false}},
            {select:"MAX(fip_diff_stats.out_pkts)", display:{id:'MAX(fip_diff_stats.out_pkts)', field:'MAX(fip_diff_stats.out_pkts)', width:150, name:"MAX (Out Pkts)", groupable:false}},

            {select:"fip_diff_stats.out_bytes", display:{id:'fip_diff_stats.out_bytes', field:'fip_diff_stats.out_bytes', width:150, name:"Out Bytes", groupable:false}},
            {select:"SUM(fip_diff_stats.out_bytes)", display:{id:'SUM(fip_diff_stats.out_bytes)', field:'SUM(fip_diff_stats.out_bytes)', width:150, name:"SUM (Out Bytes)", groupable:false}},
            {select:"MIN(fip_diff_stats.out_bytes)", display:{id:'MIN(fip_diff_stats.out_bytes)', field:'MIN(fip_diff_stats.out_bytes)', width:150, name:"MIN (Out Bytes)", groupable:false}},
            {select:"MAX(fip_diff_stats.out_bytes)", display:{id:'MAX(fip_diff_stats.out_bytes)', field:'MAX(fip_diff_stats.out_bytes)', width:150, name:"MAX (Out Bytes)", groupable:false}},
        ],
        "StatTable.UveVMInterfaceAgent.if_stats" : [
            {select:"COUNT(if_stats)", display:{id:'COUNT(if_stats)', field:'COUNT(if_stats)', width:180, name:"Count (Interface Stats)", groupable:false}},
            {select:"virtual_network", display:{id:'virtual_network', field:'virtual_network', width:150, name:"Virtual Network", groupable:false}},
            {select:"if_stats.other_vn", display:{id:'if_stats.other_vn', field:'if_stats.other_vn', width:150, name:"Other VN", groupable:false}},
            {select:"if_stats.ip_address", display:{id:'if_stats.ip_address', field:'if_stats.ip_address', width:150, name:"IP Address", groupable:false}},

            {select:"if_stats.in_pkts", display:{id:'if_stats.in_pkts', field:'if_stats.in_pkts', width:150, name:"In Pkts", groupable:false}},
            {select:"SUM(if_stats.in_pkts)", display:{id:'SUM(if_stats.in_pkts)', field:'SUM(if_stats.in_pkts)', width:150, name:"SUM (In Pkts)", groupable:false}},
            {select:"MIN(if_stats.in_pkts)", display:{id:'MIN(if_stats.in_pkts)', field:'MIN(if_stats.in_pkts)', width:150, name:"MIN (In Pkts)", groupable:false}},
            {select:"MAX(if_stats.in_pkts)", display:{id:'MAX(if_stats.in_pkts)', field:'MAX(if_stats.in_pkts)', width:150, name:"MAX (In Pkts)", groupable:false}},

            {select:"if_stats.in_pkts", display:{id:'if_stats.in_bytes', field:'if_stats.in_bytes', width:150, name:"In Bytes", groupable:false}},
            {select:"SUM(if_stats.in_bytes)", display:{id:'SUM(if_stats.in_bytes)', field:'SUM(if_stats.in_bytes)', width:150, name:"SUM (In Bytes)", groupable:false}},
            {select:"MIN(if_stats.in_bytes)", display:{id:'MIN(if_stats.in_bytes)', field:'MIN(if_stats.in_bytes)', width:150, name:"MIN (In Bytes)", groupable:false}},
            {select:"MAX(if_stats.in_bytes)", display:{id:'MAX(if_stats.in_bytes)', field:'MAX(if_stats.in_bytes)', width:150, name:"MAX (In Bytes)", groupable:false}},

            {select:"if_stats.out_pkts", display:{id:'if_stats.out_pkts', field:'if_stats.out_pkts', width:150, name:"Out Pkts", groupable:false}},
            {select:"SUM(if_stats.out_pkts)", display:{id:'SUM(if_stats.out_pkts)', field:'SUM(if_stats.out_pkts)', width:150, name:"SUM (Out Pkts)", groupable:false}},
            {select:"MIN(if_stats.out_pkts)", display:{id:'MIN(if_stats.out_pkts)', field:'MIN(if_stats.out_pkts)', width:150, name:"MIN (Out Pkts)", groupable:false}},
            {select:"MAX(if_stats.out_pkts)", display:{id:'MAX(if_stats.out_pkts)', field:'MAX(if_stats.out_pkts)', width:150, name:"MAX (Out Pkts)", groupable:false}},

            {select:"if_stats.out_bytes", display:{id:'if_stats.out_bytes', field:'if_stats.out_bytes', width:150, name:"Out Bytes", groupable:false}},
            {select:"SUM(if_stats.out_bytes)", display:{id:'SUM(if_stats.out_bytes)', field:'SUM(if_stats.out_bytes)', width:150, name:"SUM (Out Bytes)", groupable:false}},
            {select:"MIN(if_stats.out_bytes)", display:{id:'MIN(if_stats.out_bytes)', field:'MIN(if_stats.out_bytes)', width:150, name:"MIN (Out Bytes)", groupable:false}},
            {select:"MAX(if_stats.out_bytes)", display:{id:'MAX(if_stats.out_bytes)', field:'MAX(if_stats.out_bytes)', width:150, name:"MAX (Out Bytes)", groupable:false}},

            {select:"vm_name", display:{id:'vm_name', field:'vm_name', width:150, name:"VM Name", groupable:false}},
            {select:"vm_uuid", display:{id:'vm_uuid', field:'vm_uuid', width:150, name:"VM uuid", groupable:false}},

            {select:"if_stats.in_bw_usage", display:{id:'if_stats.in_bw_usage', field:'if_stats.in_bw_usage', width:180, name:"In BW Usage", groupable:false}},
            {select:"SUM(if_stats.in_bw_usage)", display:{id:'SUM(if_stats.in_bw_usage)', field:'SUM(if_stats.in_bw_usage)', width:180, name:"SUM (In BW Usage)", groupable:false}},
            {select:"MIN(if_stats.in_bw_usage)", display:{id:'MIN(if_stats.in_bw_usage)', field:'MIN(if_stats.in_bw_usage)', width:180, name:"MIN (In BW Usage)", groupable:false}},
            {select:"MAX(if_stats.in_bw_usage)", display:{id:'MAX(if_stats.in_bw_usage)', field:'MAX(if_stats.in_bw_usage)', width:180, name:"MAX (In BW Usage)", groupable:false}},

            {select:"if_stats.out_bw_usage", display:{id:'if_stats.out_bw_usage', field:'if_stats.out_bw_usage', width:180, name:"Out BW Usage", groupable:false}},
            {select:"SUM(if_stats.out_bw_usage)", display:{id:'SUM(if_stats.out_bw_usage)', field:'SUM(if_stats.out_bw_usage)', width:180, name:"SUM (Out BW Usage)", groupable:false}},
            {select:"MIN(if_stats.out_bw_usage)", display:{id:'MIN(if_stats.out_bw_usage)', field:'MIN(if_stats.out_bw_usage)', width:180, name:"MIN (Out BW Usage)", groupable:false}},
            {select:"MAX(if_stats.out_bw_usage)", display:{id:'MAX(if_stats.out_bw_usage)', field:'MAX(if_stats.out_bw_usage)', width:180, name:"MAX (Out BW Usage)", groupable:false}}
        ],

        "StatTable.VrouterStatsAgent.flow_rate" : [
            {select:"COUNT(flow_rate)", display:{id:'COUNT(flow_rate)', field:'COUNT(flow_rate)', width:150, name:"Count (Flow Rate)", groupable:false}},

            {select:"flow_rate.added_flows", display:{id:'flow_rate.added_flows', field:'flow_rate.added_flows', width:170, name:"Added Flows", groupable:false}},
            {select:"SUM(flow_rate.added_flows)", display:{id:'SUM(flow_rate.added_flows)', field:'SUM(flow_rate.added_flows)', width:170, name:"SUM (Added Flows)", groupable:false}},
            {select:"MIN(flow_rate.added_flows)", display:{id:'MIN(flow_rate.added_flows)', field:'MIN(flow_rate.added_flows)', width:170, name:"MIN (Added Flows)", groupable:false}},
            {select:"MAX(flow_rate.added_flows)", display:{id:'MAX(flow_rate.added_flows)', field:'MAX(flow_rate.added_flows)', width:170, name:"MAX (Added Flows)", groupable:false}},

            {select:"flow_rate.deleted_flows", display:{id:'flow_rate.deleted_flows', field:'flow_rate.deleted_flows', width:170, name:"Deleted Flows", groupable:false}},
            {select:"SUM(flow_rate.deleted_flows)", display:{id:'SUM(flow_rate.deleted_flows)', field:'SUM(flow_rate.deleted_flows)', width:170, name:"SUM (Deleted Flows)", groupable:false}},
            {select:"MIN(flow_rate.deleted_flows)", display:{id:'MIN(flow_rate.deleted_flows)', field:'MIN(flow_rate.deleted_flows)', width:170, name:"MIN (Deleted Flows)", groupable:false}},
            {select:"MAX(flow_rate.deleted_flows)", display:{id:'MAX(flow_rate.deleted_flows)', field:'MAX(flow_rate.deleted_flows)', width:170, name:"MAX (Deleted Flows)", groupable:false}},

            {select:"flow_rate.max_flow_adds_per_second", display:{id:'flow_rate.max_flow_adds_per_second', field:'flow_rate.max_flow_adds_per_second', width:200, name:"Max Flow Adds Per Sec", groupable:false}},
            {select:"SUM(flow_rate.max_flow_adds_per_second)", display:{id:'SUM(flow_rate.max_flow_adds_per_second)', field:'SUM(flow_rate.max_flow_adds_per_second)', width:220, name:"SUM (Max Flow Adds Per Sec)", groupable:false}},
            {select:"MIN(flow_rate.max_flow_adds_per_second)", display:{id:'MIN(flow_rate.max_flow_adds_per_second)', field:'MIN(flow_rate.max_flow_adds_per_second)', width:220, name:"MIN (Max Flow Adds Per Sec)", groupable:false}},
            {select:"MAX(flow_rate.max_flow_adds_per_second)", display:{id:'MAX(flow_rate.max_flow_adds_per_second)', field:'MAX(flow_rate.max_flow_adds_per_second)', width:220, name:"MAX (Max Flow Adds Per Sec)", groupable:false}},

            {select:"flow_rate.min_flow_adds_per_second", display:{id:'flow_rate.min_flow_adds_per_second', field:'flow_rate.min_flow_adds_per_second', width:200, name:"Min Flow Adds Per Sec", groupable:false}},
            {select:"SUM(flow_rate.min_flow_adds_per_second)", display:{id:'SUM(flow_rate.min_flow_adds_per_second)', field:'SUM(flow_rate.min_flow_adds_per_second)', width:220, name:"SUM (Min Flow Adds Per Sec)", groupable:false}},
            {select:"MIN(flow_rate.min_flow_adds_per_second)", display:{id:'MIN(flow_rate.min_flow_adds_per_second)', field:'MIN(flow_rate.min_flow_adds_per_second)', width:220, name:"MIN (Min Flow Adds Per Sec)", groupable:false}},
            {select:"MAX(flow_rate.min_flow_adds_per_second)", display:{id:'MAX(flow_rate.min_flow_adds_per_second)', field:'MAX(flow_rate.min_flow_adds_per_second)', width:220, name:"MAX (Min Flow Adds Per Sec)", groupable:false}},

            {select:"flow_rate.max_flow_deletes_per_second", display:{id:'flow_rate.max_flow_deletes_per_second', field:'flow_rate.max_flow_deletes_per_second', width:200, name:"Max Flow Dels Per Sec", groupable:false}},
            {select:"SUM(flow_rate.max_flow_deletes_per_second)", display:{id:'SUM(flow_rate.max_flow_deletes_per_second)', field:'SUM(flow_rate.max_flow_deletes_per_second)', width:220, name:"SUM (Max Flow Dels Per Sec)", groupable:false}},
            {select:"MIN(flow_rate.max_flow_deletes_per_second)", display:{id:'MIN(flow_rate.max_flow_deletes_per_second)', field:'MIN(flow_rate.max_flow_deletes_per_second)', width:220, name:"MIN (Max Flow Dels Per Sec)", groupable:false}},
            {select:"MAX(flow_rate.max_flow_deletes_per_second)", display:{id:'MAX(flow_rate.max_flow_deletes_per_second)', field:'MAX(flow_rate.max_flow_deletes_per_second)', width:220, name:"MAX (Max Flow Dels Per Sec)", groupable:false}},

            {select:"flow_rate.min_flow_deletes_per_second", display:{id:'flow_rate.min_flow_deletes_per_second', field:'flow_rate.min_flow_deletes_per_second', width:200, name:"Min Flow Dels Per Sec", groupable:false}},
            {select:"SUM(flow_rate.min_flow_deletes_per_second)", display:{id:'SUM(flow_rate.min_flow_deletes_per_second)', field:'SUM(flow_rate.min_flow_deletes_per_second)', width:220, name:"SUM (Min Flow Dels Per Sec)", groupable:false}},
            {select:"MIN(flow_rate.min_flow_deletes_per_second)", display:{id:'MIN(flow_rate.min_flow_deletes_per_second)', field:'MIN(flow_rate.min_flow_deletes_per_second)', width:220, name:"MIN (Min Flow Dels Per Sec)", groupable:false}},
            {select:"MAX(flow_rate.min_flow_deletes_per_second)", display:{id:'MAX(flow_rate.min_flow_deletes_per_second)', field:'MAX(flow_rate.min_flow_deletes_per_second)', width:220, name:"MAX (Min Flow Dels Per Sec)", groupable:false}},
        ],

        "StatTable.AnalyticsApiStats.api_stats" : [
            {select:"COUNT(api_stats)", display:{id:'COUNT(api_stats)', field:'COUNT(api_stats)', width:150, name:"Count (Api Stats)", groupable:false}},
            {select:"api_stats.operation_type", display:{id:'api_stats.operation_type', field:'api_stats.operation_type', width:150, name:"Operation Type", groupable:false}},
            {select:"api_stats.remote_ip", display:{id:'api_stats.remote_ip', field:'api_stats.remote_ip', width:100, name:"Remote IP", groupable:false}},
            {select:"api_stats.object_type", display:{id:'api_stats.object_type', field:'api_stats.object_type', width:100, name:"Object Type", groupable:false}},
            {select:"api_stats.request_url", display:{id:'api_stats.request_url', field:'api_stats.request_url', width:100, name:"Request Url", groupable:false}},
            {select:"api_stats.node", display:{id:'api_stats.node', field:'api_stats.node', width:100, name:"Node", groupable:false}},

            {select:"api_stats.response_time_in_usec", display:{id:'api_stats.response_time_in_usec', field:'api_stats.response_time_in_usec', width:200, name:"Response Time in usec", groupable:false}},
            {select:"SUM(api_stats.response_time_in_usec)", display:{id:'SUM(api_stats.response_time_in_usec)', field:'SUM(api_stats.response_time_in_usec)', width:220, name:"SUM (Response Time in usec)", groupable:false}},
            {select:"MIN(api_stats.response_time_in_usec)", display:{id:'MIN(api_stats.response_time_in_usec)', field:'MIN(api_stats.response_time_in_usec)', width:220, name:"MIN (Response Time in usec)", groupable:false}},
            {select:"MAX(api_stats.response_time_in_usec)", display:{id:'MAX(api_stats.response_time_in_usec)', field:'MAX(api_stats.response_time_in_usec)', width:220, name:"MAX (Response Time in usec)", groupable:false}},

            {select:"api_stats.response_size", display:{id:'api_stats.response_size', field:'api_stats.response_size', width:200, name:"Response Time in usec", groupable:false}},
            {select:"SUM(api_stats.response_size)", display:{id:'SUM(api_stats.response_size)', field:'SUM(api_stats.response_size)', width:220, name:"SUM (Response Size)", groupable:false}},
            {select:"MIN(api_stats.response_size)", display:{id:'MIN(api_stats.response_size)', field:'MIN(api_stats.response_size)', width:220, name:"MIN (Response Size)", groupable:false}},
            {select:"MAX(api_stats.response_size)", display:{id:'MAX(api_stats.response_size)', field:'MAX(api_stats.response_size)', width:220, name:"MAX (Response Size)", groupable:false}}
        ],

        "StatTable.VncApiStatsLog.api_stats" : [
            {select:"COUNT(api_stats)", display:{id:'COUNT(api_stats)', field:'COUNT(api_stats)', width:150, name:"Count (Api Stats)", groupable:false}},
            {select:"api_stats.operation_type", display:{id:'api_stats.operation_type', field:'api_stats.operation_type', width:150, name:"Operation Type", groupable:false}},
            {select:"api_stats.user", display:{id:'api_stats.user', field:'api_stats.user', width:100, name:"User", groupable:false}},
            {select:"api_stats.useragent", display:{id:'api_stats.useragent', field:'api_stats.useragent', width:100, name:"Useragent", groupable:false}},
            {select:"api_stats.remote_ip", display:{id:'api_stats.remote_ip', field:'api_stats.remote_ip', width:100, name:"Remote IP", groupable:false}},
            {select:"api_stats.domain_name", display:{id:'api_stats.domain_name', field:'api_stats.domain_name', width:120, name:"Domain Name", groupable:false}},
            {select:"api_stats.project_name", display:{id:'api_stats.project_name', field:'api_stats.project_name', width:100, name:"Project Name", groupable:false}},
            {select:"api_stats.object_type", display:{id:'api_stats.object_type', field:'api_stats.object_type', width:100, name:"Object Type", groupable:false}},

            {select:"api_stats.response_time_in_usec", display:{id:'api_stats.response_time_in_usec', field:'api_stats.response_time_in_usec', width:200, name:"Response Time in usec", groupable:false}},
            {select:"SUM(api_stats.response_time_in_usec)", display:{id:'SUM(api_stats.response_time_in_usec)', field:'SUM(api_stats.response_time_in_usec)', width:220, name:"SUM (Response Time in usec)", groupable:false}},
            {select:"MIN(api_stats.response_time_in_usec)", display:{id:'MIN(api_stats.response_time_in_usec)', field:'MIN(api_stats.response_time_in_usec)', width:220, name:"MIN (Response Time in usec)", groupable:false}},
            {select:"MAX(api_stats.response_time_in_usec)", display:{id:'MAX(api_stats.response_time_in_usec)', field:'MAX(api_stats.response_time_in_usec)', width:220, name:"MAX (Response Time in usec)", groupable:false}},

            {select:"api_stats.response_size", display:{id:'api_stats.response_size', field:'api_stats.response_size', width:200, name:"Response Size", groupable:false}},
            {select:"SUM(api_stats.response_size)", display:{id:'SUM(api_stats.response_size)', field:'SUM(api_stats.response_size)', width:220, name:"SUM (Response Size)", groupable:false}},
            {select:"MIN(api_stats.response_size)", display:{id:'MIN(api_stats.response_size)', field:'MIN(api_stats.response_size)', width:220, name:"MIN (Response Size)", groupable:false}},
            {select:"MAX(api_stats.response_size)", display:{id:'MAX(api_stats.response_size)', field:'MAX(api_stats.response_size)', width:220, name:"MAX (Response Size)", groupable:false}},

            {select:"api_stats.response_code", display:{id:'api_stats.response_code', field:'api_stats.response_code', width:200, name:"Response Code", groupable:false}},
            {select:"SUM(api_stats.response_code)", display:{id:'SUM(api_stats.response_code)', field:'SUM(api_stats.response_code)', width:220, name:"SUM (Response Code)", groupable:false}},
            {select:"MIN(api_stats.response_code)", display:{id:'MIN(api_stats.response_code)', field:'MIN(api_stats.response_code)', width:220, name:"MIN (Response Code)", groupable:false}},
            {select:"MAX(api_stats.response_code)", display:{id:'MAX(api_stats.response_code)', field:'MAX(api_stats.response_code)', width:220, name:"MAX (Response Code)", groupable:false}}

        ],

        "StatTable.VrouterStatsAgent.phy_if_band" : [
            {select:"COUNT(phy_if_band)", display:{id:'COUNT(phy_if_band)', field:'COUNT(phy_if_band)', width:150, name:"Count (Phy If Band)", groupable:false}},
            {select:"phy_if_band.name", display:{id:'phy_if_band.name', field:'phy_if_band.name', width:100, name:"Name", groupable:false}},

            {select:"phy_if_band.in_bandwidth_usage", display:{id:'phy_if_band.in_bandwidth_usage', field:'phy_if_band.in_bandwidth_usage', width:200, name:"Phy In BW Usage", groupable:false}},
            {select:"SUM(phy_if_band.in_bandwidth_usage)", display:{id:'SUM(phy_if_band.in_bandwidth_usage)', field:'SUM(phy_if_band.in_bandwidth_usage)', width:220, name:"SUM (Phy In BW Usage)", groupable:false}},
            {select:"MIN(phy_if_band.in_bandwidth_usage)", display:{id:'MIN(phy_if_band.in_bandwidth_usage)', field:'MIN(phy_if_band.in_bandwidth_usage)', width:220, name:"MIN (Phy In BW Usage)", groupable:false}},
            {select:"MAX(phy_if_band.in_bandwidth_usage)", display:{id:'MAX(phy_if_band.in_bandwidth_usage)', field:'MAX(phy_if_band.in_bandwidth_usage)', width:220, name:"MAX (Phy In BW Usage)", groupable:false}},

            {select:"phy_if_band.out_bandwidth_usage", display:{id:'phy_if_band.out_bandwidth_usage', field:'phy_if_band.out_bandwidth_usage', width:200, name:"Phy Out BW Usage", groupable:false}},
            {select:"SUM(phy_if_band.out_bandwidth_usage)", display:{id:'SUM(phy_if_band.out_bandwidth_usage)', field:'SUM(phy_if_band.out_bandwidth_usage)', width:220, name:"SUM (Phy Out BW Usage)", groupable:false}},
            {select:"MIN(phy_if_band.out_bandwidth_usage)", display:{id:'MIN(phy_if_band.out_bandwidth_usage)', field:'MIN(phy_if_band.out_bandwidth_usage)', width:220, name:"MIN (Phy Out BW Usage)", groupable:false}},
            {select:"MAX(phy_if_band.out_bandwidth_usage)", display:{id:'MAX(phy_if_band.out_bandwidth_usage)', field:'MAX(phy_if_band.out_bandwidth_usage)', width:220, name:"MAX (Phy Out BW Usage)", groupable:false}}
        ],

        "StatTable.PRouterBroadViewInfo.ingressPortPriorityGroup" : [
            {select:"COUNT(ingressPortPriorityGroup)", display:{id:'COUNT(ingressPortPriorityGroup)', field:'COUNT(ingressPortPriorityGroup)', width:240, name:"Count (Ingress Port Priority Group)", groupable:false}},
            {select:"asic_id", display:{id:'asic_id', field:'asic_id', width:100, name:"Asic Id", groupable:false}},
            {select:"ingressPortPriorityGroup.port", display:{id:'ingressPortPriorityGroup.port', field:'ingressPortPriorityGroup.port', width:100, name:"Port", groupable:false}},

            {select:"ingressPortPriorityGroup.priorityGroup", display:{id:'ingressPortPriorityGroup.priorityGroup', field:'ingressPortPriorityGroup.priorityGroup', width:180, name:"Priority Group", groupable:false}},
            {select:"SUM(ingressPortPriorityGroup.priorityGroup)", display:{id:'SUM(ingressPortPriorityGroup.priorityGroup)', field:'SUM(ingressPortPriorityGroup.priorityGroup)', width:200, name:"SUM (Priority Group)", groupable:false}},
            {select:"MIN(ingressPortPriorityGroup.priorityGroup)", display:{id:'MIN(ingressPortPriorityGroup.priorityGroup)', field:'MIN(ingressPortPriorityGroup.priorityGroup)', width:200, name:"MIN (Priority Group)", groupable:false}},
            {select:"MAX(ingressPortPriorityGroup.priorityGroup)", display:{id:'MAX(ingressPortPriorityGroup.priorityGroup)', field:'MAX(ingressPortPriorityGroup.priorityGroup)', width:200, name:"MAX (Priority Group)", groupable:false}},

            {select:"ingressPortPriorityGroup.umShareBufferCount", display:{id:'ingressPortPriorityGroup.umShareBufferCount', field:'ingressPortPriorityGroup.umShareBufferCount', width:200, name:"um Shared Buffer Count", groupable:false}},
            {select:"SUM(ingressPortPriorityGroup.umShareBufferCount)", display:{id:'SUM(ingressPortPriorityGroup.umShareBufferCount)', field:'SUM(ingressPortPriorityGroup.umShareBufferCount)', width:220, name:"SUM (um Shared Buffer Count)", groupable:false}},
            {select:"MIN(ingressPortPriorityGroup.umShareBufferCount)", display:{id:'MIN(ingressPortPriorityGroup.umShareBufferCount)', field:'MIN(ingressPortPriorityGroup.umShareBufferCount)', width:220, name:"MIN (um Shared Buffer Count)", groupable:false}},
            {select:"MAX(ingressPortPriorityGroup.umShareBufferCount)", display:{id:'MAX(ingressPortPriorityGroup.umShareBufferCount)', field:'MAX(ingressPortPriorityGroup.umShareBufferCount)', width:220, name:"MAX (um Shared Buffer Count)", groupable:false}},

            {select:"ingressPortPriorityGroup.umHeadroomBufferCount", display:{id:'ingressPortPriorityGroup.umHeadroomBufferCount', field:'ingressPortPriorityGroup.umHeadroomBufferCount', width:220, name:"um Headroom Buffer Count", groupable:false}},
            {select:"SUM(ingressPortPriorityGroup.umHeadroomBufferCount)", display:{id:'SUM(ingressPortPriorityGroup.umHeadroomBufferCount)', field:'SUM(ingressPortPriorityGroup.umHeadroomBufferCount)', width:240, name:"SUM (um Headroom Buffer Count)", groupable:false}},
            {select:"MIN(ingressPortPriorityGroup.umHeadroomBufferCount)", display:{id:'MIN(ingressPortPriorityGroup.umHeadroomBufferCount)', field:'MIN(ingressPortPriorityGroup.umHeadroomBufferCount)', width:240, name:"MIN (um Headroom Buffer Count)", groupable:false}},
            {select:"MAX(ingressPortPriorityGroup.umHeadroomBufferCount)", display:{id:'MAX(ingressPortPriorityGroup.umHeadroomBufferCount)', field:'MAX(ingressPortPriorityGroup.umHeadroomBufferCount)', width:240, name:"MAX (um Headroom Buffer Count)", groupable:false}},
        ],

        "StatTable.PRouterBroadViewInfo.ingressPortServicePool" : [
            {select:"COUNT(ingressPortServicePool)", display:{id:'COUNT(ingressPortServicePool)', field:'COUNT(ingressPortServicePool)', width:220, name:"Count (Ingress Port Service Pool)", groupable:false}},
            {select:"asic_id", display:{id:'asic_id', field:'asic_id', width:100, name:"Asic Id", groupable:false}},
            {select:"ingressPortServicePool.port", display:{id:'ingressPortServicePool.port', field:'ingressPortServicePool.port', width:100, name:"Port", groupable:false}},

            {select:"ingressPortServicePool.servicePool", display:{id:'ingressPortServicePool.servicePool', field:'ingressPortServicePool.servicePool', width:180, name:"Service Pool", groupable:false}},
            {select:"SUM(ingressPortServicePool.servicePool)", display:{id:'SUM(ingressPortServicePool.servicePool)', field:'SUM(ingressPortServicePool.servicePool)', width:200, name:"SUM (Service Pool)", groupable:false}},
            {select:"MIN(ingressPortServicePool.servicePool)", display:{id:'MIN(ingressPortServicePool.servicePool)', field:'MIN(ingressPortServicePool.servicePool)', width:200, name:"MIN (Service Pool)", groupable:false}},
            {select:"MAX(ingressPortServicePool.servicePool)", display:{id:'MAX(ingressPortServicePool.servicePool)', field:'MAX(ingressPortServicePool.servicePool)', width:200, name:"MAX (Service Pool)", groupable:false}},

            {select:"ingressPortServicePool.umShareBufferCount", display:{id:'ingressPortServicePool.umShareBufferCount', field:'ingressPortServicePool.umShareBufferCount', width:200, name:"um Share Buffer Count", groupable:false}},
            {select:"SUM(ingressPortServicePool.umShareBufferCount)", display:{id:'SUM(ingressPortServicePool.umShareBufferCount)', field:'SUM(ingressPortServicePool.umShareBufferCount)', width:220, name:"SUM (um Share Buffer Count)", groupable:false}},
            {select:"MIN(ingressPortServicePool.umShareBufferCount)", display:{id:'MIN(ingressPortServicePool.umShareBufferCount)', field:'MIN(ingressPortServicePool.umShareBufferCount)', width:220, name:"MIN (um Share Buffer Count)", groupable:false}},
            {select:"MAX(ingressPortServicePool.umShareBufferCount)", display:{id:'MAX(ingressPortServicePool.umShareBufferCount)', field:'MAX(ingressPortServicePool.umShareBufferCount)', width:220, name:"MAX (um Share Buffer Count)", groupable:false}}
        ],

        "StatTable.PRouterBroadViewInfo.ingressServicePool" : [
            {select:"COUNT(ingressServicePool)", display:{id:'COUNT(ingressServicePool)', field:'COUNT(ingressServicePool)', width:220, name:"Count (Ingress Port Service Pool)", groupable:false}},
            {select:"asic_id", display:{id:'asic_id', field:'asic_id', width:100, name:"Asic Id", groupable:false}},
            {select:"ingressServicePool.port", display:{id:'ingressServicePool.port', field:'ingressServicePool.port', width:100, name:"Port", groupable:false}},

            {select:"ingressServicePool.servicePool", display:{id:'ingressServicePool.servicePool', field:'ingressServicePool.servicePool', width:180, name:"Service Pool", groupable:false}},
            {select:"SUM(ingressServicePool.servicePool)", display:{id:'SUM(ingressServicePool.servicePool)', field:'SUM(ingressServicePool.servicePool)', width:200, name:"SUM (Service Pool)", groupable:false}},
            {select:"MIN(ingressServicePool.servicePool)", display:{id:'MIN(ingressServicePool.servicePool)', field:'MIN(ingressServicePool.servicePool)', width:200, name:"MIN (Service Pool)", groupable:false}},
            {select:"MAX(ingressServicePool.servicePool)", display:{id:'MAX(ingressServicePool.servicePool)', field:'MAX(ingressServicePool.servicePool)', width:200, name:"MAX (Service Pool)", groupable:false}},

            {select:"ingressServicePool.umShareBufferCount", display:{id:'ingressServicePool.umShareBufferCount', field:'ingressServicePool.umShareBufferCount', width:200, name:"um Share Buffer Count", groupable:false}},
            {select:"SUM(ingressServicePool.umShareBufferCount)", display:{id:'SUM(ingressServicePool.umShareBufferCount)', field:'SUM(ingressServicePool.umShareBufferCount)', width:220, name:"SUM (um Share Buffer Count)", groupable:false}},
            {select:"MIN(ingressServicePool.umShareBufferCount)", display:{id:'MIN(ingressServicePool.umShareBufferCount)', field:'MIN(ingressServicePool.umShareBufferCount)', width:220, name:"MIN (um Share Buffer Count)", groupable:false}},
            {select:"MAX(ingressServicePool.umShareBufferCount)", display:{id:'MAX(ingressServicePool.umShareBufferCount)', field:'MAX(ingressServicePool.umShareBufferCount)', width:220, name:"MAX (um Share Buffer Count)", groupable:false}}
        ],
        "StatTable.PRouterBroadViewInfo.egressPortServicePool" : [
            {select:"COUNT(egressPortServicePool)", display:{id:'COUNT(egressPortServicePool)', field:'COUNT(egressPortServicePool)', width:220, name:"Count (Egress Port Service Pool)", groupable:false}},
            {select:"asic_id", display:{id:'asic_id', field:'asic_id', width:100, name:"Asic Id", groupable:false}},
            {select:"egressPortServicePool.port", display:{id:'egressPortServicePool.port', field:'egressPortServicePool.port', width:100, name:"Port", groupable:false}},

            {select:"egressPortServicePool.servicePool", display:{id:'egressPortServicePool.servicePool', field:'egressPortServicePool.servicePool', width:180, name:"Service Pool", groupable:false}},
            {select:"SUM(egressPortServicePool.servicePool)", display:{id:'SUM(egressPortServicePool.servicePool)', field:'SUM(egressPortServicePool.servicePool)', width:200, name:"SUM (Service Pool)", groupable:false}},
            {select:"MIN(egressPortServicePool.servicePool)", display:{id:'MIN(egressPortServicePool.servicePool)', field:'MIN(egressPortServicePool.servicePool)', width:200, name:"MIN (Service Pool)", groupable:false}},
            {select:"MAX(egressPortServicePool.servicePool)", display:{id:'MAX(egressPortServicePool.servicePool)', field:'MAX(egressPortServicePool.servicePool)', width:200, name:"MAX (Service Pool)", groupable:false}},

            {select:"egressPortServicePool.ucShareBufferCount", display:{id:'egressPortServicePool.ucShareBufferCount', field:'egressPortServicePool.ucShareBufferCount', width:180, name:"um Share Buffer Count", groupable:false}},
            {select:"SUM(egressPortServicePool.ucShareBufferCount)", display:{id:'SUM(egressPortServicePool.ucShareBufferCount)', field:'SUM(egressPortServicePool.ucShareBufferCount)', width:200, name:"SUM (um Share Buffer Count)", groupable:false}},
            {select:"MIN(egressPortServicePool.ucShareBufferCount)", display:{id:'MIN(egressPortServicePool.ucShareBufferCount)', field:'MIN(egressPortServicePool.ucShareBufferCount)', width:200, name:"MIN (um Share Buffer Count)", groupable:false}},
            {select:"MAX(egressPortServicePool.ucShareBufferCount)", display:{id:'MAX(egressPortServicePool.ucShareBufferCount)', field:'MAX(egressPortServicePool.ucShareBufferCount)', width:200, name:"MAX (um Share Buffer Count)", groupable:false}},

            {select:"egressPortServicePool.umShareBufferCount", display:{id:'egressPortServicePool.umShareBufferCount', field:'egressPortServicePool.umShareBufferCount', width:180, name:"um Share Buffer Count", groupable:false}},
            {select:"SUM(egressPortServicePool.umShareBufferCount)", display:{id:'SUM(egressPortServicePool.umShareBufferCount)', field:'SUM(egressPortServicePool.umShareBufferCount)', width:200, name:"SUM (um Share Buffer Count)", groupable:false}},
            {select:"MIN(egressPortServicePool.umShareBufferCount)", display:{id:'MIN(egressPortServicePool.umShareBufferCount)', field:'MIN(egressPortServicePool.umShareBufferCount)', width:200, name:"MIN (um Share Buffer Count)", groupable:false}},
            {select:"MAX(egressPortServicePool.umShareBufferCount)", display:{id:'MAX(egressPortServicePool.umShareBufferCount)', field:'MAX(egressPortServicePool.umShareBufferCount)', width:200, name:"MAX (um Share Buffer Count)", groupable:false}},

            {select:"egressPortServicePool.mcShareBufferCount", display:{id:'egressPortServicePool.mcShareBufferCount', field:'egressPortServicePool.mcShareBufferCount', width:180, name:"mc Share Buffer Count", groupable:false}},
            {select:"SUM(egressPortServicePool.mcShareBufferCount)", display:{id:'SUM(egressPortServicePool.mcShareBufferCount)', field:'SUM(egressPortServicePool.mcShareBufferCount)', width:200, name:"SUM (mc Share Buffer Count)", groupable:false}},
            {select:"MIN(egressPortServicePool.mcShareBufferCount)", display:{id:'MIN(egressPortServicePool.mcShareBufferCount)', field:'MIN(egressPortServicePool.mcShareBufferCount)', width:200, name:"MIN (mc Share Buffer Count)", groupable:false}},
            {select:"MAX(egressPortServicePool.mcShareBufferCount)", display:{id:'MAX(egressPortServicePool.mcShareBufferCount)', field:'MAX(egressPortServicePool.mcShareBufferCount)', width:200, name:"MAX (mc Share Buffer Count)", groupable:false}},

            {select:"egressPortServicePool.mcShareQueueEntries", display:{id:'egressPortServicePool.mcShareQueueEntries', field:'egressPortServicePool.mcShareQueueEntries', width:200, name:"mc Share Queue Entries", groupable:false}},
            {select:"SUM(egressPortServicePool.mcShareQueueEntries)", display:{id:'SUM(egressPortServicePool.mcShareQueueEntries)', field:'SUM(egressPortServicePool.mcShareQueueEntries)', width:220, name:"SUM (mc Share Queue Entries)", groupable:false}},
            {select:"MIN(egressPortServicePool.mcShareQueueEntries)", display:{id:'MIN(egressPortServicePool.mcShareQueueEntries)', field:'MIN(egressPortServicePool.mcShareQueueEntries)', width:220, name:"MIN (mc Share Queue Entries)", groupable:false}},
            {select:"MAX(egressPortServicePool.mcShareQueueEntries)", display:{id:'MAX(egressPortServicePool.mcShareQueueEntries)', field:'MAX(egressPortServicePool.mcShareQueueEntries)', width:220, name:"MAX (mc Share Queue Entries)", groupable:false}}
        ],

        "StatTable.PRouterBroadViewInfo.egressServicePool" : [
            {select:"COUNT(egressServicePool)", display:{id:'COUNT(egressServicePool)', field:'COUNT(egressServicePool)', width:220, name:"Count (Egress Port Service Pool)", groupable:false}},
            {select:"asic_id", display:{id:'asic_id', field:'asic_id', width:100, name:"Asic Id", groupable:false}},
            {select:"egressServicePool.port", display:{id:'egressServicePool.port', field:'egressServicePool.port', width:100, name:"Port", groupable:false}},

            {select:"egressServicePool.servicePool", display:{id:'egressServicePool.servicePool', field:'egressServicePool.servicePool', width:180, name:"Service Pool", groupable:false}},
            {select:"SUM(egressServicePool.servicePool)", display:{id:'SUM(egressServicePool.servicePool)', field:'SUM(egressServicePool.servicePool)', width:200, name:"SUM (Service Pool)", groupable:false}},
            {select:"MIN(egressServicePool.servicePool)", display:{id:'MIN(egressServicePool.servicePool)', field:'MIN(egressServicePool.servicePool)', width:200, name:"MIN (Service Pool)", groupable:false}},
            {select:"MAX(egressServicePool.servicePool)", display:{id:'MAX(egressServicePool.servicePool)', field:'MAX(egressServicePool.servicePool)', width:200, name:"MAX (Service Pool)", groupable:false}},

            {select:"egressServicePool.umShareBufferCount", display:{id:'egressServicePool.umShareBufferCount', field:'egressServicePool.umShareBufferCount', width:180, name:"um Share Buffer Count", groupable:false}},
            {select:"SUM(egressServicePool.umShareBufferCount)", display:{id:'SUM(egressServicePool.umShareBufferCount)', field:'SUM(egressServicePool.umShareBufferCount)', width:200, name:"SUM (um Share Buffer Count)", groupable:false}},
            {select:"MIN(egressServicePool.umShareBufferCount)", display:{id:'MIN(egressServicePool.umShareBufferCount)', field:'MIN(egressServicePool.umShareBufferCount)', width:200, name:"MIN (um Share Buffer Count)", groupable:false}},
            {select:"MAX(egressServicePool.umShareBufferCount)", display:{id:'MAX(egressServicePool.umShareBufferCount)', field:'MAX(egressServicePool.umShareBufferCount)', width:200, name:"MAX (um Share Buffer Count)", groupable:false}},

            {select:"egressServicePool.mcShareBufferCount", display:{id:'egressServicePool.mcShareBufferCount', field:'egressServicePool.mcShareBufferCount', width:180, name:"mc Share Buffer Count", groupable:false}},
            {select:"SUM(egressServicePool.mcShareBufferCount)", display:{id:'SUM(egressServicePool.mcShareBufferCount)', field:'SUM(egressServicePool.mcShareBufferCount)', width:200, name:"SUM (mc Share Buffer Count)", groupable:false}},
            {select:"MIN(egressServicePool.mcShareBufferCount)", display:{id:'MIN(egressServicePool.mcShareBufferCount)', field:'MIN(egressServicePool.mcShareBufferCount)', width:200, name:"MIN (mc Share Buffer Count)", groupable:false}},
            {select:"MAX(egressServicePool.mcShareBufferCount)", display:{id:'MAX(egressServicePool.mcShareBufferCount)', field:'MAX(egressServicePool.mcShareBufferCount)', width:200, name:"MAX (mc Share Buffer Count)", groupable:false}},

            {select:"egressServicePool.mcShareQueueEntries", display:{id:'egressServicePool.mcShareQueueEntries', field:'egressServicePool.mcShareQueueEntries', width:200, name:"mc Share Queue Entries", groupable:false}},
            {select:"SUM(egressServicePool.mcShareQueueEntries)", display:{id:'SUM(egressServicePool.mcShareQueueEntries)', field:'SUM(egressServicePool.mcShareQueueEntries)', width:220, name:"SUM (mc Share Queue Entries)", groupable:false}},
            {select:"MIN(egressServicePool.mcShareQueueEntries)", display:{id:'MIN(egressServicePool.mcShareQueueEntries)', field:'MIN(egressServicePool.mcShareQueueEntries)', width:220, name:"MIN (mc Share Queue Entries)", groupable:false}},
            {select:"MAX(egressServicePool.mcShareQueueEntries)", display:{id:'MAX(egressServicePool.mcShareQueueEntries)', field:'MAX(egressServicePool.mcShareQueueEntries)', width:220, name:"MAX (mc Share Queue Entries)", groupable:false}}
        ],

        "StatTable.PRouterBroadViewInfo.egressUcQueue" : [
            {select:"COUNT(egressUcQueue)", display:{id:'COUNT(egressUcQueue)', field:'COUNT(egressUcQueue)', width:220, name:"Count (Egress Uc Queue)", groupable:false}},
            {select:"asic_id", display:{id:'asic_id', field:'asic_id', width:100, name:"Asic Id", groupable:false}},

            {select:"egressUcQueue.queue", display:{id:'egressUcQueue.queue', field:'egressUcQueue.queue', width:180, name:"Queue", groupable:false}},
            {select:"SUM(egressUcQueue.queue)", display:{id:'SUM(egressUcQueue.queue)', field:'SUM(egressUcQueue.queue)', width:200, name:"SUM (Queue)", groupable:false}},
            {select:"MIN(egressUcQueue.queue)", display:{id:'MIN(egressUcQueue.queue)', field:'MIN(egressUcQueue.queue)', width:200, name:"MIN (Queue)", groupable:false}},
            {select:"MAX(egressUcQueue.queue)", display:{id:'MAX(egressUcQueue.queue)', field:'MAX(egressUcQueue.queue)', width:200, name:"MAX (Queue)", groupable:false}},

            {select:"egressUcQueue.queue", display:{id:'egressUcQueue.ucBufferCount', field:'egressUcQueue.ucBufferCount', width:180, name:"uc Buffer Count", groupable:false}},
            {select:"SUM(egressUcQueue.ucBufferCount)", display:{id:'SUM(egressUcQueue.ucBufferCount)', field:'SUM(egressUcQueue.ucBufferCount)', width:200, name:"SUM (uc Buffer Count)", groupable:false}},
            {select:"MIN(egressUcQueue.ucBufferCount)", display:{id:'MIN(egressUcQueue.ucBufferCount)', field:'MIN(egressUcQueue.ucBufferCount)', width:200, name:"MIN (uc Buffer Count)", groupable:false}},
            {select:"MAX(egressUcQueue.ucBufferCount)", display:{id:'MAX(egressUcQueue.ucBufferCount)', field:'MAX(egressUcQueue.ucBufferCount)', width:200, name:"MAX (uc Buffer Count)", groupable:false}},
        ],
        "StatTable.PRouterBroadViewInfo.egressUcQueueGroup" : [
            {select:"COUNT(egressUcQueueGroup)", display:{id:'COUNT(egressUcQueueGroup)', field:'COUNT(egressUcQueueGroup)', width:220, name:"Count (Egress Uc QueueGroup)", groupable:false}},
            {select:"asic_id", display:{id:'asic_id', field:'asic_id', width:100, name:"Asic Id", groupable:false}},

            {select:"egressUcQueueGroup.queueGroup", display:{id:'egressUcQueueGroup.queueGroup', field:'egressUcQueueGroup.queueGroup', width:180, name:"Queue Group", groupable:false}},
            {select:"SUM(egressUcQueueGroup.queueGroup)", display:{id:'SUM(egressUcQueueGroup.queueGroup)', field:'SUM(egressUcQueueGroup.queueGroup)', width:200, name:"SUM (Queue Group)", groupable:false}},
            {select:"MIN(egressUcQueueGroup.queueGroup)", display:{id:'MIN(egressUcQueueGroup.queueGroup)', field:'MIN(egressUcQueueGroup.queueGroup)', width:200, name:"MIN (Queue Group)", groupable:false}},
            {select:"MAX(egressUcQueueGroup.queueGroup)", display:{id:'MAX(egressUcQueueGroup.queueGroup)', field:'MAX(egressUcQueueGroup.queueGroup)', width:200, name:"MAX (Queue Group)", groupable:false}},

            {select:"egressUcQueueGroup.ucBufferCount", display:{id:'egressUcQueueGroup.ucBufferCount', field:'egressUcQueueGroup.ucBufferCount', width:180, name:"uc Buffer Count", groupable:false}},
            {select:"SUM(egressUcQueueGroup.ucBufferCount)", display:{id:'SUM(egressUcQueueGroup.ucBufferCount)', field:'SUM(egressUcQueueGroup.ucBufferCount)', width:200, name:"SUM (uc Buffer Count)", groupable:false}},
            {select:"MIN(egressUcQueueGroup.ucBufferCount)", display:{id:'MIN(egressUcQueueGroup.ucBufferCount)', field:'MIN(egressUcQueueGroup.ucBufferCount)', width:200, name:"MIN (uc Buffer Count)", groupable:false}},
            {select:"MAX(egressUcQueueGroup.ucBufferCount)", display:{id:'MAX(egressUcQueueGroup.ucBufferCount)', field:'MAX(egressUcQueueGroup.ucBufferCount)', width:200, name:"MAX (uc Buffer Count)", groupable:false}}
        ],
        "StatTable.PRouterBroadViewInfo.egressMcQueue" : [
            {select:"COUNT(egressMcQueue)", display:{id:'COUNT(egressMcQueue)', field:'COUNT(egressMcQueue)', width:220, name:"Count (Egress Mc Queue)", groupable:false}},
            {select:"asic_id", display:{id:'asic_id', field:'asic_id', width:100, name:"Asic Id", groupable:false}},

            {select:"egressMcQueue.queue", display:{id:'egressMcQueue.queue', field:'egressMcQueue.queue', width:180, name:"Queue", groupable:false}},
            {select:"SUM(egressMcQueue.queue)", display:{id:'SUM(egressMcQueue.queue)', field:'SUM(egressMcQueue.queue)', width:200, name:"SUM (Queue)", groupable:false}},
            {select:"MIN(egressMcQueue.queue)", display:{id:'MIN(egressMcQueue.queue)', field:'MIN(egressMcQueue.queue)', width:200, name:"MIN (Queue)", groupable:false}},
            {select:"MAX(egressMcQueue.queue)", display:{id:'MAX(egressMcQueue.queue)', field:'MAX(egressMcQueue.queue)', width:200, name:"MAX (Queue)", groupable:false}},

            {select:"egressMcQueue.mcBufferCount", display:{id:'egressMcQueue.mcBufferCount', field:'egressMcQueue.mcBufferCount', width:180, name:"mc Buffer Count", groupable:false}},
            {select:"SUM(egressMcQueue.mcBufferCount)", display:{id:'SUM(egressMcQueue.mcBufferCount)', field:'SUM(egressMcQueue.mcBufferCount)', width:200, name:"SUM (mc Buffer Count)", groupable:false}},
            {select:"MIN(egressMcQueue.mcBufferCount)", display:{id:'MIN(egressMcQueue.mcBufferCount)', field:'MIN(egressMcQueue.mcBufferCount)', width:200, name:"MIN (mc Buffer Count)", groupable:false}},
            {select:"MAX(egressMcQueue.mcBufferCount)", display:{id:'MAX(egressMcQueue.mcBufferCount)', field:'MAX(egressMcQueue.mcBufferCount)', width:200, name:"MAX (mc Buffer Count)", groupable:false}},

            {select:"egressMcQueue.mcQueueEntries", display:{id:'egressMcQueue.mcQueueEntries', field:'egressMcQueue.mcQueueEntries', width:180, name:"mc Queue Entries", groupable:false}},
            {select:"SUM(egressMcQueue.mcQueueEntries)", display:{id:'SUM(egressMcQueue.mcQueueEntries)', field:'SUM(egressMcQueue.mcQueueEntries)', width:200, name:"SUM (mc Queue Entries)", groupable:false}},
            {select:"MIN(egressMcQueue.mcQueueEntries)", display:{id:'MIN(egressMcQueue.mcQueueEntries)', field:'MIN(egressMcQueue.mcQueueEntries)', width:200, name:"MIN (mc Queue Entries)", groupable:false}},
            {select:"MAX(egressMcQueue.mcQueueEntries)", display:{id:'MAX(egressMcQueue.mcQueueEntries)', field:'MAX(egressMcQueue.mcQueueEntries)', width:200, name:"MAX (mc Queue Entries)", groupable:false}},
        ],
        "StatTable.PRouterBroadViewInfo.egressCpuQueue" : [
            {select:"COUNT(egressCpuQueue)", display:{id:'COUNT(egressCpuQueue)', field:'COUNT(egressCpuQueue)', width:220, name:"Count (Egress Cpu Queue)", groupable:false}},
            {select:"asic_id", display:{id:'asic_id', field:'asic_id', width:100, name:"Asic Id", groupable:false}},

            {select:"egressCpuQueue.queue", display:{id:'egressCpuQueue.queue', field:'egressCpuQueue.queue', width:180, name:"Queue", groupable:false}},
            {select:"SUM(egressCpuQueue.queue)", display:{id:'SUM(egressCpuQueue.queue)', field:'SUM(egressCpuQueue.queue)', width:200, name:"SUM (Queue)", groupable:false}},
            {select:"MIN(egressCpuQueue.queue)", display:{id:'MIN(egressCpuQueue.queue)', field:'MIN(egressCpuQueue.queue)', width:200, name:"MIN (Queue)", groupable:false}},
            {select:"MAX(egressCpuQueue.queue)", display:{id:'MAX(egressCpuQueue.queue)', field:'MAX(egressCpuQueue.queue)', width:200, name:"MAX (Queue)", groupable:false}},

            {select:"egressCpuQueue.cpuBufferCount", display:{id:'egressCpuQueue.cpuBufferCount', field:'egressCpuQueue.cpuBufferCount', width:180, name:"CPU Buffer Count", groupable:false}},
            {select:"SUM(egressCpuQueue.cpuBufferCount)", display:{id:'SUM(egressCpuQueue.cpuBufferCount)', field:'SUM(egressCpuQueue.cpuBufferCount)', width:200, name:"SUM (CPU Buffer Count)", groupable:false}},
            {select:"MIN(egressCpuQueue.cpuBufferCount)", display:{id:'MIN(egressCpuQueue.cpuBufferCount)', field:'MIN(egressCpuQueue.cpuBufferCount)', width:200, name:"MIN (CPU Buffer Count)", groupable:false}},
            {select:"MAX(egressCpuQueue.cpuBufferCount)", display:{id:'MAX(egressCpuQueue.cpuBufferCount)', field:'MAX(egressCpuQueue.cpuBufferCount)', width:200, name:"MAX (CPU Buffer Count)", groupable:false}},
        ],
        "StatTable.PRouterBroadViewInfo.egressRqeQueue" : [
            {select:"COUNT(egressRqeQueue)", display:{id:'COUNT(egressRqeQueue)', field:'COUNT(egressRqeQueue)', width:220, name:"Count (Egress Rqe Queue)", groupable:false}},
            {select:"asic_id", display:{id:'asic_id', field:'asic_id', width:100, name:"Asic Id", groupable:false}},

            {select:"egressRqeQueue.queue", display:{id:'egressRqeQueue.queue', field:'egressRqeQueue.queue', width:180, name:"Queue", groupable:false}},
            {select:"SUM(egressRqeQueue.queue)", display:{id:'SUM(egressRqeQueue.queue)', field:'SUM(egressRqeQueue.queue)', width:200, name:"SUM (Queue)", groupable:false}},
            {select:"MIN(egressRqeQueue.queue)", display:{id:'MIN(egressRqeQueue.queue)', field:'MIN(egressRqeQueue.queue)', width:200, name:"MIN (Queue)", groupable:false}},
            {select:"MAX(egressRqeQueue.queue)", display:{id:'MAX(egressRqeQueue.queue)', field:'MAX(egressRqeQueue.queue)', width:200, name:"MAX (Queue)", groupable:false}},

            {select:"egressRqeQueue.rqeBufferCount", display:{id:'egressRqeQueue.rqeBufferCount', field:'egressRqeQueue.rqeBufferCount', width:180, name:"Rqe Buffer Count", groupable:false}},
            {select:"SUM(egressRqeQueue.rqeBufferCount)", display:{id:'SUM(egressRqeQueue.rqeBufferCount)', field:'SUM(egressRqeQueue.rqeBufferCount)', width:200, name:"SUM (Rqe Buffer Count)", groupable:false}},
            {select:"MIN(egressRqeQueue.rqeBufferCount)", display:{id:'MIN(egressRqeQueue.rqeBufferCount)', field:'MIN(egressRqeQueue.rqeBufferCount)', width:200, name:"MIN (Rqe Buffer Count)", groupable:false}},
            {select:"MAX(egressRqeQueue.rqeBufferCount)", display:{id:'MAX(egressRqeQueue.rqeBufferCount)', field:'MAX(egressRqeQueue.rqeBufferCount)', width:200, name:"MAX (Rqe Buffer Count)", groupable:false}},
        ],
        "defaultStatColumns": [
            {select:"T", display:{id:"T", field:"T", width:210, name:"Time", filterable:false, groupable:false}},
            {select:"T=", display:{id: 'T=', field:'T=', width:210, name:"Time", filterable:false, groupable:false}},
            {select:"UUID", display:{id:"UUID", field:"UUID", name:"UUID",  width:150, groupable:true}},
            {select:"name", display:{id:'name', field:'name', width:150, name:"Name", groupable:false}},
            {select:"Source", display:{id:'Source', field:'Source', width:70, name:"Source", groupable:false}}
        ],
        "defaultObjectColumns": [
            {select: "MessageTS", display:{id: "MessageTS", field: "MessageTS", name: "Time", width:210, filterable:false, groupable:false}},
            {select: "ObjectId", display:{id:"ObjectId", field:"ObjectId", name:"Object Id", width:150, searchable: true, hide: true}},
            {select: "Source", display:{id:"Source", field:"Source", name:"Source", width:150, searchable: true}},
            {select: "ModuleId", display:{id: "ModuleId", field: "ModuleId", name: "Module Id", width: 200, searchable:true}},
            {select: "Messagetype", display:{id:"Messagetype", field:"Messagetype", name:"Message Type", width:150, searchable:true}},
            {
                select: "ObjectLog",
                display:{
                    id:"ObjectLog", field:"ObjectLog", name:"Object Log", width:300, searchable:true,
                    formatter: {
                        format: [
                            {format: 'xml2json', options: {jsonValuePath: 'ObjectLogJSON'}},
                            {format: 'json2html', options: {jsonValuePath: 'ObjectLogJSON', htmlValuePath: 'ObjectLogHTML', expandLevel: 0}}
                        ]
                    },
                    exportConfig: {
                        allow: true,
                        stdFormatter: false
                    }
                }
            },
            {
                select: "SystemLog",
                display:{
                    id:"SystemLog", field:"SystemLog", name:"System Log", width:300, searchable:true,
                    formatter: {
                        format: [
                            {format: 'xml2json', options: {jsonValuePath: 'SystemLogJSON'}},
                            {format: 'json2html', options: {jsonValuePath: 'SystemLogJSON', htmlValuePath: 'SystemLogHTML', expandLevel: 0}}
                        ]
                    },
                    exportConfig: {
                        allow: true,
                        stdFormatter: false
                    }
                }
            }
        ],
        "MessageTable": [
            {select: "MessageTS", display:{id: "MessageTS", field: "MessageTS", name: "Time", width:210, filterable:false, groupable:false}},
            {select: "Source", display:{id:"Source", field:"Source", name:"Source", width:150, searchable: true}},
            {select: "NodeType", display:{id:"NodeType", field:"NodeType", name:"Node Type", width:100, searchable: true}},
            {select: "ModuleId", display:{id: "ModuleId", field: "ModuleId", name: "Module Id", width: 200, searchable:true}},
            {select: "Messagetype", display:{id:"Messagetype", field:"Messagetype", name:"Message Type", width:150, searchable:true}},
            {select: "Keyword", display:{id:"Keyword", field:"Keyword", name:"Keyword", width:150, searchable:true}},
            {select: "Level", display:{id:"Level", field:"Level", name:"Level", width:100, searchable:true, formatter: function(r, c, v, cd, dc) { return qewu.getLevelName4Value(dc.Level); }}},
            {select: "Category", display:{id: "Category", field: "Category", name: "Category", width: 150, searchable:true}},
            {select: "Context", display:{id:"Context", field:"Context", name:"Context", width:150, searchable:true}},
            {
                select: "Xmlmessage",
                display:{
                    id:"Xmlmessage", field:"Xmlmessage", name:"Log Message", width:500, searchable:true,
                    formatter: function(r, c, v, cd, dc) {
                        var xmlMessage = [];
                        if (contrail.checkIfExist(dc.Xmlmessage)) {
                            if (!$.isPlainObject(dc.Xmlmessage)) {
                                dc.XmlmessageJSON = cowu.formatXML2JSON(dc.Xmlmessage);

                                xmlMessage = $.map(dc.XmlmessageJSON, function(messageValue, messageKey) {
                                    return messageValue;
                                });
                                dc.formattedXmlMessage = xmlMessage.join(' ');
                            }


                        }

                        return dc.formattedXmlMessage
                    },
                    exportConfig: {
                        allow: true,
                        stdFormatter: false
                    }
                }
            },
            {select: "InstanceId", display:{id: "InstanceId", field: "InstanceId", name: "Instance Id", width: 150, searchable:true}}
        ],
        init: function() {
            this.SessionAnalyzerTable = this.FlowSeriesTable;
            delete this.init;
            return this;
        }
    }.init();

    return QEGridConfig;
});

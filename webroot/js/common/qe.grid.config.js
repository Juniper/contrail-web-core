/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'core-basedir/js/common/qe.utils',
], function (_, qewu) {
    var QEGridConfig = function () {
        this.getColumnDisplay4Grid = function(tableName, tableType, selectArray) {
            
            var self = this,
                newColumnDisplay = [],
                columnDisplay = getColumnDisplay4Query(tableName, tableType);

            $.each(selectArray, function(selectKey, selectValue) {

                var columnName = self.formatNameForGrid(selectValue);
                newColumnDisplay.push({
                    id: selectValue, field: selectValue,
                    name: columnName,
                    width: columnName.length * 8,
                    formatter: {
                        format: cowc.QUERY_COLUMN_FORMATTER[selectValue]
                    }
                });

                if(tableType == "STAT"){
                    $.each(columnDisplayMap["defaultStatColumns"], function(statKey, statValue) {
                        if(statValue.select == selectValue) {
                            $.extend(newColumnDisplay[newColumnDisplay.length-1], statValue.display);
                        }
                    });
                }
                else if(tableType == "OBJECT"){
                    $.each(columnDisplayMap["defaultObjectColumns"], function(statKey, statValue) {
                        if(statValue.select == selectValue) {
                            $.extend(newColumnDisplay[newColumnDisplay.length-1], statValue.display);
                        }
                    });
                }
                
                if(contrail.checkIfExist(columnDisplayMap[tableName])) {
                    $.each(columnDisplayMap[tableName], function (fieldIndex, fieldValue) {
                        if (fieldValue.select == selectValue) {
                            $.extend(newColumnDisplay[newColumnDisplay.length - 1], fieldValue.display);
                        }

                    });
                }
            });

            return newColumnDisplay;
        };


        this.formatNameForGrid = function(columnName) {
            var firstIndex = columnName.indexOf('('),
                lastIndex = columnName.indexOf(')'),
                aggregateType = columnName.substr(0,firstIndex),
                aggregateColumnName = columnName.substr(firstIndex + 1,lastIndex - firstIndex - 1);

            if(qewu.isAggregateField(columnName) || aggregateType == "AVG" || aggregateType == "PERCENTILES") {
                return aggregateType + " (" + cowl.get(aggregateColumnName) + ")";
            } else {
                return cowl.get(columnName).replace(')', '');
            }
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
            {select:"T", display:{width:210, filterable:false}},
            {select:"T=", display:{width:210, filterable:false}},
            {select:"vrouter", display:{width:100}},
            {select:"sourcevn", display:{width:240}},
            {select:"destvn", display:{width:240}},
            {select:"sourceip", display:{width:100}},
            {select:"destip", display:{width:120}},
            {select:"sport", display:{width:100}},
            {select:"dport", display:{width:130}},
            {select:"direction_ing", display:{width:100}},
            {select:"protocol", display:{width:100}},
            {select:"bytes", display:{width:120}},
            {select:"sum(bytes)", display:{width:100}},
            {select:"avg(bytes)", display:{width:100}},
            {select:"packets", display:{width:100}},
            {select:"sum(packets)", display:{width:120}},
            {select:"avg(packets)", display:{width:120}},
            {select:"flow_count", display:{width:120}}
        ],
        "FlowRecordTable": [
            {select:"action", display:{width:60}},
            {select:"setup_time", display:{width:210, filterable:false}},
            {select:"teardown_time", display:{width:210, filterable:false}},
            {select:"vrouter", display:{width:100}},
            {select:"vrouter_ip", display:{width:120}},
            {select:"other_vrouter_ip", display:{width:170}},
            {select:"sourcevn", display:{width:240}},
            {select:"destvn", display:{width:240}},
            {select:"sourceip", display:{width:100}},
            {select:"destip", display:{width:120}},
            {select:"sport", display:{ width:100}},
            {select:"dport", display:{width:130}},
            {select:"direction_ing", display:{width:100}},
            {select:"protocol", display:{width:100}},
            {select:"underlay_proto", display:{width:150}},
            {select:"underlay_source_port", display:{width:150}},
            {select:"UuidKey", display:{width:280}},
            {select:"sg_rule_uuid", display:{width:280}},
            {select:"nw_ace_uuid", display:{width:280}},
            {select:"agg-bytes", display:{width:120}},
            {select:"agg-packets", display:{ width:140}},
            {select:"vmi_uuid", display:{width:140}},
            {select:"drop_reason", display:{ width:140}}
        ],
        "StatTable.AnalyticsCpuState.cpu_info" : [
            {select:"cpu_info.module_id", display:{width:150}},
            {select:"cpu_info.inst_id", display:{width:150}},
            {select:"COUNT(cpu_info)", display:{width:120}},

            {select:"cpu_info.mem_virt", display:{width:150}},
            {select:"SUM(cpu_info.mem_virt)", display:{ width:150}},
            {select:"MIN(cpu_info.mem_virt)", display:{ width:150}},
            {select:"MAX(cpu_info.mem_virt)", display:{ width:150}},

            {select:"cpu_info.cpu_share", display:{width:120}},
            {select:"SUM(cpu_info.cpu_share)", display:{width:150}},
            {select:"MIN(cpu_info.cpu_share)", display:{ width:150}},
            {select:"MAX(cpu_info.cpu_share)", display:{ width:150}},

            {select:"cpu_info.mem_res", display:{ width:170}},
            {select:"SUM(cpu_info.mem_res)", display:{ width:190}},
            {select:"MIN(cpu_info.mem_res)", display:{width:190}},
            {select:"MAX(cpu_info.mem_res)", display:{ width:190}}
        ],
        "StatTable.ConfigCpuState.cpu_info" : [
            {select:"cpu_info.module_id", display:{width:150}},
            {select:"cpu_info.inst_id", display:{width:150}},
            {select:"COUNT(cpu_info)", display:{ width:120}},
            {select:"cpu_info.mem_virt", display:{ width:150}},
            {select:"SUM(cpu_info.mem_virt)", display:{width:150}},
            {select:"MIN(cpu_info.mem_virt)", display:{ width:150}},
            {select:"MAX(cpu_info.mem_virt)", display:{ width:150}},

            {select:"cpu_info.cpu_share", display:{width:150}},
            {select:"SUM(cpu_info.cpu_share)", display:{ width:150}},
            {select:"MIN(cpu_info.cpu_share)", display:{ width:150}},
            {select:"MAX(cpu_info.cpu_share)", display:{ width:150}},

            {select:"cpu_info.mem_res", display:{width:170}},
            {select:"SUM(cpu_info.mem_res)", display:{width:190}},
            {select:"MIN(cpu_info.mem_res)", display:{width:190}},
            {select:"MAX(cpu_info.mem_res)", display:{width:190}}
        ],
        "StatTable.ControlCpuState.cpu_info" : [
            {select:"COUNT(cpu_info)", display:{ width:120}},
            {select:"cpu_info.mem_virt", display:{width:120}},
            {select:"SUM(cpu_info.mem_virt)", display:{ width:150}},
            {select:"MIN(cpu_info.mem_virt)", display:{ width:150}},
            {select:"MAX(cpu_info.mem_virt)", display:{ width:150}},

            {select:"cpu_info.cpu_share", display:{ width:120}},
            {select:"SUM(cpu_info.cpu_share)", display:{ width:120}},
            {select:"MIN(cpu_info.cpu_share)", display:{ width:120}},
            {select:"MAX(cpu_info.cpu_share)", display:{ width:120}},

            {select:"cpu_info.mem_res", display:{ width:170}},
            {select:"SUM(cpu_info.mem_res)", display:{width:190}},
            {select:"MIN(cpu_info.mem_res)", display:{ width:190}},
            {select:"MAX(cpu_info.mem_res)", display:{ width:190}},

            {select:"cpu_info.inst_id", display:{ width:120}},
            {select:"cpu_info.module_id", display:{ width:150}}

        ],
        "StatTable.PRouterEntry.ifStats" : [
            {select:"COUNT(ifStats)", display:{width:120,}},
            {select:"ifStats.ifInUcastPkts", display:{ width:120}},
            {select:"SUM(ifStats.ifInUcastPkts)", display:{width:160}},
            {select:"MAX(ifStats.ifInUcastPkts)", display:{width:160}},
            {select:"MIN(ifStats.ifInUcastPkts)", display:{width:160}},

            {select:"ifStats.ifInMulticastPkts", display:{ width:120}},
            {select:"SUM(ifStats.ifInMulticastPkts)", display:{width:160}},
            {select:"MAX(ifStats.ifInMulticastPkts)", display:{width:160}},
            {select:"MIN(ifStats.ifInMulticastPkts)", display:{width:160}},

            {select:"ifStats.ifInBroadcastPkts", display:{width:120}},
            {select:"SUM(ifStats.ifInBroadcastPkts)", display:{width:160}},
            {select:"MAX(ifStats.ifInBroadcastPkts)", display:{width:160}},
            {select:"MIN(ifStats.ifInBroadcastPkts)", display:{width:160}},

            {select:"ifStats.ifInDiscards", display:{width:120}},
            {select:"SUM(ifStats.ifInDiscards)", display:{width:160}},
            {select:"MAX(ifStats.ifInDiscards)", display:{width:160}},
            {select:"MIN(ifStats.ifInDiscards)", display:{width:160}},

            {select:"ifStats.ifInErrors", display:{width:120}},
            {select:"SUM(ifStats.ifInErrors)", display:{width:160}},
            {select:"MAX(ifStats.ifInErrors)", display:{width:160}},
            {select:"MIN(ifStats.ifInErrors)", display:{width:160}},

            {select:"ifStats.ifOutUcastPkts", display:{width:120}},
            {select:"SUM(ifStats.ifOutUcastPkts)", display:{width:160}},
            {select:"MAX(ifStats.ifOutUcastPkts)", display:{width:160}},
            {select:"MIN(ifStats.ifOutUcastPkts)", display:{width:160}},

            {select:"ifStats.ifOutMulticastPkts", display:{width:120}},
            {select:"SUM(ifStats.ifOutMulticastPkts)", display:{width:160}},
            {select:"MAX(ifStats.ifOutMulticastPkts)", display:{width:160}},
            {select:"MIN(ifStats.ifOutMulticastPkts)", display:{width:160}},

            {select:"ifStats.ifOutBroadcastPkts", display:{ width:120}},
            {select:"SUM(ifStats.ifOutBroadcastPkts)", display:{width:160}},
            {select:"MAX(ifStats.ifOutBroadcastPkts)", display:{width:160}},
            {select:"MIN(ifStats.ifOutBroadcastPkts)", display:{width:160}},

            {select:"ifStats.ifOutDiscards", display:{ width:120}},
            {select:"SUM(ifStats.ifOutDiscards)", display:{width:160}},
            {select:"MAX(ifStats.ifOutDiscards)", display:{ width:160}},
            {select:"MIN(ifStats.ifOutDiscards)", display:{ width:160}},

            {select:"ifStats.ifOutErrors", display:{width:120}},
            {select:"SUM(ifStats.ifOutErrors)", display:{width:160}},
            {select:"MAX(ifStats.ifOutErrors)", display:{width:160}},
            {select:"MIN(ifStats.ifOutErrors)", display:{width:160}},

            {select:"ifStats.ifIndex", display:{width:120}},
            {select:"SUM(ifStats.ifIndex)", display:{width:160}},
            {select:"MAX(ifStats.ifIndex)", display:{width:160}},
            {select:"MIN(ifStats.ifIndex)", display:{width:160}}
        ],
        "StatTable.ComputeCpuState.cpu_info" : [
            {select:"COUNT(cpu_info)", display:{width:120}},

            {select:"cpu_info.mem_virt", display:{width:160}},
            {select:"SUM(cpu_info.mem_virt)", display:{width:160}},
            {select:"MAX(cpu_info.mem_virt)", display:{width:160}},
            {select:"MIN(cpu_info.mem_virt)", display:{width:160}},

            {select:"cpu_info.cpu_share", display:{width:160}},
            {select:"SUM(cpu_info.cpu_share)", display:{width:160}},
            {select:"MAX(cpu_info.cpu_share)", display:{width:160}},
            {select:"MIN(cpu_info.cpu_share)", display:{width:160}},


            {select:"cpu_info.used_sys_mem", display:{width:190}},
            {select:"SUM(cpu_info.used_sys_mem)", display:{width:190}},
            {select:"MAX(cpu_info.used_sys_mem)", display:{width:190}},
            {select:"MIN(cpu_info.used_sys_mem)", display:{width:190}},

            {select:"cpu_info.one_min_cpuload", display:{width:160}},
            {select:"SUM(cpu_info.one_min_cpuload)", display:{width:160}},
            {select:"MAX(cpu_info.one_min_cpuload)", display:{width:160}},
            {select:"MIN(cpu_info.one_min_cpuload)", display:{width:160}},

            {select:"cpu_info.mem_res", display:{width:170}},
            {select:"SUM(cpu_info.mem_res)", display:{ width:190}},
            {select:"MIN(cpu_info.mem_res)", display:{width:190}},
            {select:"MAX(cpu_info.mem_res)", display:{width:190}}
        ],
        "StatTable.VirtualMachineStats.cpu_stats" : [
            {select:"COUNT(cpu_stats)", display:{width:150}},

            {select:"cpu_stats.cpu_one_min_avg", display:{width:170}},
            {select:"SUM(cpu_stats.cpu_one_min_avg)", display:{width:170}},
            {select:"MAX(cpu_stats.cpu_one_min_avg)", display:{width:170}},
            {select:"MIN(cpu_stats.cpu_one_min_avg)", display:{width:170}},

            {select:"cpu_stats.vm_memory_quota", display:{width:190}},
            {select:"SUM(cpu_stats.vm_memory_quota)", display:{width:190}},
            {select:"MAX(cpu_stats.vm_memory_quota)", display:{width:190}},
            {select:"MIN(cpu_stats.vm_memory_quota)", display:{width:190}},

            {select:"cpu_stats.rss", display:{width:150}},
            {select:"SUM(cpu_stats.rss)", display:{width:150}},
            {select:"MAX(cpu_stats.rss)", display:{width:150}},
            {select:"MIN(cpu_stats.rss)", display:{width:150}},

            {select:"cpu_stats.virt_memory", display:{width:150}},
            {select:"SUM(cpu_stats.virt_memory)", display:{width:150}},
            {select:"MAX(cpu_stats.virt_memory)", display:{width:150}},
            {select:"MIN(cpu_stats.virt_memory)", display:{width:150}},

            {select:"cpu_stats.peak_virt_memory", display:{width:170}},
            {select:"SUM(cpu_stats.peak_virt_memory)", display:{width:170}},
            {select:"MAX(cpu_stats.peak_virt_memory)", display:{width:170}},
            {select:"MIN(cpu_stats.peak_virt_memory)", display:{width:170}},
        ],
        "StatTable.ComputeStoragePool.info_stats" : [
            {select:"COUNT(info_stats)", display:{width:150}},

            {select:"info_stats.writes", display:{width:150}},
            {select:"SUM(info_stats.reads)", display:{width:150}},
            {select:"MAX(info_stats.reads)", display:{width:150}},
            {select:"MIN(info_stats.reads)", display:{width:150}},

            {select:"info_stats.writes", display:{width:150}},
            {select:"SUM(info_stats.writes)", display:{width:150}},
            {select:"MAX(info_stats.writes)", display:{width:150}},
            {select:"MIN(info_stats.writes)", display:{width:150}},

            {select:"info_stats.read_kbytes", display:{width:150}},
            {select:"SUM(info_stats.read_kbytes)", display:{width:150}},
            {select:"MAX(info_stats.read_kbytes)", display:{width:150}},
            {select:"MIN(info_stats.read_kbytes)", display:{width:150}},

            {select:"info_stats.write_kbytes", display:{width:150}},
            {select:"SUM(info_stats.write_kbytes)", display:{width:150}},
            {select:"MAX(info_stats.write_kbytes)", display:{width:150}},
            {select:"MIN(info_stats.write_kbytes)", display:{width:150}},

        ],
        "StatTable.ComputeStorageOsd.info_stats" : [
            {select:"COUNT(info_stats)", display:{width:150}},

            {select:"info_stats.reads", display:{width:150}},
            {select:"SUM(info_stats.reads)", display:{width:150}},
            {select:"MAX(info_stats.reads)", display:{width:150}},
            {select:"MIN(info_stats.reads)", display:{width:150}},

            {select:"info_stats.writes", display:{width:150}},
            {select:"SUM(info_stats.writes)", display:{width:150}},
            {select:"MAX(info_stats.writes)", display:{width:150}},
            {select:"MIN(info_stats.writes)", display:{width:150}},

            {select:"info_stats.read_kbytes", display:{width:150}},
            {select:"SUM(info_stats.read_kbytes)", display:{width:150}},
            {select:"MAX(info_stats.read_kbytes)", display:{width:150}},
            {select:"MIN(info_stats.read_kbytes)", display:{width:150}},

            {select:"info_stats.write_kbytes", display:{width:150}},
            {select:"SUM(info_stats.write_kbytes)", display:{width:150}},
            {select:"MAX(info_stats.write_kbytes)", display:{width:150}},
            {select:"MIN(info_stats.write_kbytes)", display:{width:150}},

            {select:"info_stats.op_r_latency", display:{width:150}},
            {select:"SUM(info_stats.op_r_latency)", display:{width:150}},
            {select:"MAX(info_stats.op_r_latency)", display:{width:150}},
            {select:"MIN(info_stats.op_r_latency)", display:{width:150}},

            {select:"info_stats.op_w_latency", display:{width:150}},
            {select:"SUM(info_stats.op_w_latency)", display:{width:150}},
            {select:"MAX(info_stats.op_w_latency)", display:{width:150}},
            {select:"MIN(info_stats.op_w_latency)", display:{width:150}}
        ],
        "StatTable.ComputeStorageDisk.info_stats" : [
            {select:"COUNT(info_stats)", display:{width:150}},

            {select:"info_stats.reads", display:{width:150}},
            {select:"SUM(info_stats.reads)", display:{width:150}},
            {select:"MAX(info_stats.reads)", display:{width:150}},
            {select:"MIN(info_stats.reads)", display:{width:150}},

            {select:"info_stats.writes", display:{width:150}},
            {select:"SUM(info_stats.writes)", display:{width:150}},
            {select:"MAX(info_stats.writes)", display:{width:150}},
            {select:"MIN(info_stats.writes)", display:{width:150}},

            {select:"info_stats.read_kbytes", display:{width:150}},
            {select:"SUM(info_stats.read_kbytes)", display:{width:150}},
            {select:"MAX(info_stats.read_kbytes)", display:{width:150}},
            {select:"MIN(info_stats.read_kbytes)", display:{width:150}},

            {select:"info_stats.write_kbytes", display:{width:150}},
            {select:"SUM(info_stats.write_kbytes)", display:{width:150}},
            {select:"MAX(info_stats.write_kbytes)", display:{width:150}},
            {select:"MIN(info_stats.write_kbytes)", display:{width:150}},

            {select:"info_stats.iops", display:{width:150}},
            {select:"SUM(info_stats.iops)", display:{width:150}},
            {select:"MAX(info_stats.iops)", display:{width:150}},
            {select:"MIN(info_stats.iops)", display:{width:150}},

            {select:"info_stats.bw", display:{width:150}},
            {select:"SUM(info_stats.bw)", display:{width:150}},
            {select:"MAX(info_stats.bw)", display:{width:150}},
            {select:"MIN(info_stats.bw)", display:{width:150}},

            {select:"info_stats.op_r_latency", display:{width:170}},
            {select:"SUM(info_stats.op_r_latency)", display:{width:170}},
            {select:"MAX(info_stats.op_r_latency)", display:{width:170}},
            {select:"MIN(info_stats.op_r_latency)", display:{width:170}},

            {select:"info_stats.op_w_latency", display:{width:170}},
            {select:"SUM(info_stats.op_w_latency)", display:{width:170}},
            {select:"MAX(info_stats.op_w_latency)", display:{width:170}},
            {select:"MIN(info_stats.op_w_latency)", display:{width:170}}

        ],
        "StatTable.ServerMonitoringInfo.sensor_stats" : [
            {select:"COUNT(sensor_stats)", display:{width:150}},
            {select:"sensor_stats.sensor", display:{width:150}},
            {select:"sensor_stats.status", display:{width:150}},

            {select:"sensor_stats.reading", display:{width:150}},
            {select:"SUM(sensor_stats.reading)", display:{width:150}},
            {select:"MAX(sensor_stats.reading)", display:{width:150}},
            {select:"MIN(sensor_stats.reading)", display:{width:150}},

            {select:"sensor_stats.unit", display:{width:150}},
            {select:"sensor_stats.sensor_type", display:{width:150}}
        ],
        "StatTable.ServerMonitoringInfo.disk_usage_stats" : [
            {select:"COUNT(disk_usage_stats)", display:{width:150}},
            {select:"disk_usage_stats.disk_name", display:{width:150}},

            {select:"disk_usage_stats.read_bytes", display:{width:150}},
            {select:"SUM(disk_usage_stats.read_bytes)", display:{width:150}},
            {select:"MAX(disk_usage_stats.read_bytes)", display:{width:150}},
            {select:"MIN(disk_usage_stats.read_bytes)", display:{width:150}},

            {select:"disk_usage_stats.write_bytes", display:{width:150}},
            {select:"SUM(disk_usage_stats.write_bytes)", display:{width:150}},
            {select:"MAX(disk_usage_stats.write_bytes)", display:{width:150}},
            {select:"MIN(disk_usage_stats.write_bytes)", display:{width:150}},
        ],
        "StatTable.ServerMonitoringSummary.network_info_stats" : [
            {select:"COUNT(network_info_stats)", display:{width:170}},
            {select:"network_info_stats.interface_name", display:{width:150}},

            {select:"network_info.tx_bytes", display:{width:150}},
            {select:"SUM(network_info.tx_bytes)", display:{width:150}},
            {select:"MIN(network_info.tx_bytes)", display:{width:150}},
            {select:"MAX(network_info.tx_bytes)", display:{width:150}},

            {select:"network_info.tx_packets", display:{width:150}},
            {select:"SUM(network_info.tx_packets)", display:{width:150}},
            {select:"MIN(network_info.tx_packets)", display:{width:150}},
            {select:"MAX(network_info.tx_packets)", display:{width:150}},

            {select:"network_info.rx_bytes", display:{width:150}},
            {select:"SUM(network_info.rx_bytes)", display:{width:150}},
            {select:"MIN(network_info.rx_bytes)", display:{width:150}},
            {select:"MAX(network_info.rx_bytes)", display:{width:150}},

            {select:"network_info.rx_packets", display:{width:150}},
            {select:"SUM(network_info.rx_packets)", display:{width:150}},
            {select:"MIN(network_info.rx_packets)", display:{width:150}},
            {select:"MAX(network_info.rx_packets)", display:{width:150}},
        ],
        "StatTable.ServerMonitoringSummary.resource_info_stats" : [
            {select:"COUNT(resource_info_stats)", display:{width:150}},

            {select:"resource_info_stats.cpu_usage_percentage", display:{width:150}},
            {select:"SUM(resource_info_stats.cpu_usage_percentage)", display:{width:150}},
            {select:"MIN(resource_info_stats.cpu_usage_percentage)", display:{width:150}},
            {select:"MAX(resource_info_stats.cpu_usage_percentage)", display:{width:150}},

            {select:"resource_info_stats.mem_usage_mb", display:{width:170}},
            {select:"SUM(resource_info_stats.mem_usage_mb)", display:{width:170}},
            {select:"MIN(resource_info_stats.mem_usage_mb)", display:{width:170}},
            {select:"MAX(resource_info_stats.mem_usage_mb)", display:{width:170}},

            {select:"resource_info_stats.mem_usage_percent", display:{width:150}},
            {select:"SUM(resource_info_stats.mem_usage_percent)", display:{width:150}},
            {select:"MIN(resource_info_stats.mem_usage_percent)", display:{width:150}},
            {select:"MAX(resource_info_stats.mem_usage_percent)", display:{width:150}},
        ],
        "StatTable.ServerMonitoringInfo.file_system_view_stats.physical_disks" : [
            {select:"COUNT(file_system_view_stats.physical_disks)", display:{width:150}},
            {select:"file_system_view_stats.fs_name", display:{width:150}},
            {select:"file_system_view_stats.mountpoint", display:{width:150}},
            {select:"file_system_view_stats.type", display:{width:150}},

            {select:"file_system_view_stats.size_kb", display:{width:150}},
            {select:"SUM(file_system_view_stats.size_kb)", display:{width:150}},
            {select:"MIN(file_system_view_stats.size_kb)", display:{width:150}},
            {select:"MAX(file_system_view_stats.size_kb)", display:{width:150}},

            {select:"file_system_view_stats.used_kb", display:{width:150}},
            {select:"SUM(file_system_view_stats.used_kb)", display:{width:150}},
            {select:"MIN(file_system_view_stats.used_kb)", display:{width:150}},
            {select:"MAX(file_system_view_stats.used_kb)", display:{width:150}},

            {select:"file_system_view_stats.available_kb", display:{width:150}},
            {select:"SUM(file_system_view_stats.available_kb)", display:{width:150}},
            {select:"MIN(file_system_view_stats.available_kb)", display:{width:150}},
            {select:"MAX(file_system_view_stats.available_kb)", display:{width:150}},

            {select:"file_system_view_stats.used_percentage", display:{width:150}},
            {select:"SUM(file_system_view_stats.used_percentage)", display:{width:150}},
            {select:"MIN(file_system_view_stats.used_percentage)", display:{width:150}},
            {select:"MAX(file_system_view_stats.used_percentage)", display:{width:150}},


            {select:"file_system_view_stats.physical_disks.disk_name", display:{width:150}},

            {select:"file_system_view_stats.physical_disks.disk_size_kb", display:{width:190}},
            {select:"SUM(file_system_view_stats.physical_disks.disk_size_kb)", display:{width:190}},
            {select:"MIN(file_system_view_stats.physical_disks.disk_size_kb)", display:{width:190}},
            {select:"MAX(file_system_view_stats.physical_disks.disk_size_kb)", display:{width:190}},

            {select:"file_system_view_stats.physical_disks.disk_used_kb", display:{width:190}},
            {select:"SUM(file_system_view_stats.physical_disks.disk_used_kb)", display:{width:190}},
            {select:"MIN(file_system_view_stats.physical_disks.disk_used_kb)", display:{width:190}},
            {select:"MAX(file_system_view_stats.physical_disks.disk_used_kb)", display:{width:190}},

            {select:"file_system_view_stats.physical_disks.disk_available_kb", display:{width:220}},
            {select:"SUM(file_system_view_stats.physical_disks.disk_available_kb)", display:{width:220}},
            {select:"MIN(file_system_view_stats.physical_disks.disk_available_kb)", display:{width:220}},
            {select:"MAX(file_system_view_stats.physical_disks.disk_available_kb)", display:{width:220}},

            {select:"file_system_view_stats.physical_disks.disk_used_percentage", display:{width:190}},
            {select:"SUM(file_system_view_stats.physical_disks.disk_used_percentage)", display:{width:190}},
            {select:"MIN(file_system_view_stats.physical_disks.disk_used_percentage)", display:{width:190}},
            {select:"MAX(file_system_view_stats.physical_disks.disk_used_percentage)", display:{width:190}},
        ],

        "StatTable.SandeshMessageStat.msg_info" : [
            {select:"COUNT(msg_info)", display:{width:150}},
            {select:"msg_info.type", display:{width:210}},
            {select:"msg_info.level", display:{width:150}},

            {select:"msg_info.messages", display:{width:150}},
            {select:"SUM(msg_info.messages)", display:{width:150}},
            {select:"MIN(msg_info.messages)", display:{width:150}},
            {select:"MAX(msg_info.messages)", display:{width:150}},

            {select:"msg_info.bytes", display:{width:150}},
            {select:"SUM(msg_info.bytes)", display:{width:150}},
            {select:"MIN(msg_info.bytes)", display:{width:150}},
            {select:"MAX(msg_info.bytes)", display:{width:150}}

        ],
        "StatTable.GeneratorDbStats.table_info" : [
            {select:"COUNT(table_info)", display:{width:150}},
            {select:"table_info.table_name", display:{width:150}},

            {select:"table_info.reads", display:{width:150}},
            {select:"SUM(table_info.reads)", display:{width:150}},
            {select:"MIN(table_info.reads)", display:{width:150}},
            {select:"MAX(table_info.reads)", display:{width:150}},

            {select:"table_info.read_fails", display:{width:150}},
            {select:"SUM(table_info.read_fails)", display:{width:150}},
            {select:"MIN(table_info.read_fails)", display:{width:150}},
            {select:"MAX(table_info.read_fails)", display:{width:150}},

            {select:"table_info.writes", display:{width:150}},
            {select:"SUM(table_info.writes)", display:{width:150}},
            {select:"MIN(table_info.writes)", display:{width:150}},
            {select:"MAX(table_info.writes)", display:{width:150}},

            {select:"table_info.write_fails", display:{width:150}},
            {select:"SUM(table_info.write_fails)", display:{width:150}},
            {select:"MIN(table_info.write_fails)", display:{width:150}},
            {select:"MAX(table_info.write_fails)", display:{width:150}}
        ],
        "StatTable.GeneratorDbStats.statistics_table_info" : [
            {select:"COUNT(statistics_table_info)", display:{width:150}},
            {select:"statistics_table_info.table_name", display:{width:250}},

            {select:"statistics_table_info.reads", display:{width:150}},
            {select:"SUM(statistics_table_info.reads)", display:{width:150}},
            {select:"MIN(statistics_table_info.reads)", display:{width:150}},
            {select:"MAX(statistics_table_info.reads)", display:{width:150}},

            {select:"statistics_table_info.read_fails", display:{width:150}},
            {select:"SUM(statistics_table_info.read_fails)", display:{width:150}},
            {select:"MIN(statistics_table_info.read_fails)", display:{width:150}},
            {select:"MAX(statistics_table_info.read_fails)", display:{width:150}},

            {select:"statistics_table_info.writes", display:{width:150}},
            {select:"SUM(statistics_table_info.writes)", display:{width:150}},
            {select:"MIN(statistics_table_info.writes)", display:{width:150}},
            {select:"MAX(statistics_table_info.writes)", display:{width:150}},

            {select:"statistics_table_info.write_fails", display:{width:150}},
            {select:"SUM(statistics_table_info.write_fails)", display:{width:150}},
            {select:"MIN(statistics_table_info.write_fails)", display:{width:150}},
            {select:"MAX(statistics_table_info.write_fails)", display:{width:150}}
        ],
        "StatTable.GeneratorDbStats.errors" : [
            {select:"COUNT(errors)", display:{width:150}},

            {select:"errors.write_tablespace_fails", display:{width:180}},
            {select:"SUM(errors.write_tablespace_fails)", display:{width:200}},
            {select:"MIN(errors.write_tablespace_fails)", display:{width:200}},
            {select:"MAX(errors.write_tablespace_fails)", display:{width:200}},

            {select:"errors.read_tablespace_fails", display:{width:200}},
            {select:"SUM(errors.read_tablespace_fails)", display:{width:200}},
            {select:"MIN(errors.read_tablespace_fails)", display:{width:200}},
            {select:"MAX(errors.read_tablespace_fails)", display:{width:200}},

            {select:"errors.write_table_fails", display:{width:180}},
            {select:"SUM(errors.write_table_fails)", display:{width:160}},
            {select:"MIN(errors.write_table_fails)", display:{width:160}},
            {select:"MAX(errors.write_table_fails)", display:{width:160}},

            {select:"errors.read_table_fails", display:{width:160}},
            {select:"SUM(errors.read_table_fails)", display:{width:160}},
            {select:"MIN(errors.read_table_fails)", display:{width:160}},
            {select:"MAX(errors.read_table_fails)", display:{width:160}},

            {select:"errors.write_column_fails", display:{width:180}},
            {select:"SUM(errors.write_column_fails)", display:{width:180}},
            {select:"MIN(errors.write_column_fails)", display:{width:180}},
            {select:"MAX(errors.write_column_fails)", display:{width:180}},

            {select:"errors.write_batch_column_fails", display:{width:220}},
            {select:"SUM(errors.write_batch_column_fails)", display:{width:220}},
            {select:"MIN(errors.write_batch_column_fails)", display:{width:220}},
            {select:"MAX(errors.write_batch_column_fails)", display:{width:220}},

            {select:"errors.read_column_fails", display:{width:180}},
            {select:"SUM(errors.read_column_fails)", display:{width:180}},
            {select:"MIN(errors.read_column_fails)", display:{width:180}},
            {select:"MAX(errors.read_column_fails)", display:{width:180}}
        ],
        "StatTable.FieldNames.fields" : [
            {select:"COUNT(fields)", display:{width:150}},
            {select:"fields.value", display:{width:500}}
        ],
        "StatTable.FieldNames.fieldi" : [
            {select:"COUNT(fieldi)", display:{width:150}},
            {select:"fieldi.value", display:{width:150}},
            {select:"SUM(fieldi.value)", display:{width:150}},
            {select:"MIN(fieldi.value)", display:{width:150}},
            {select:"MAX(fieldi.value)", display:{width:150}}
        ],
        "StatTable.QueryPerfInfo.query_stats" : [
            {select:"COUNT(query_stats)", display:{width:150}},
            {select:"table", display:{width:150}},

            {select:"query_stats.time", display:{width:150}},
            {select:"SUM(query_stats.time)", display:{width:150}},
            {select:"MIN(query_stats.time)", display:{width:150}},
            {select:"MAX(query_stats.time)", display:{width:150}},

            {select:"query_stats.rows", display:{width:120}},
            {select:"SUM(query_stats.rows)", display:{width:150}},
            {select:"MIN(query_stats.rows)", display:{width:150}},
            {select:"MAX(query_stats.rows)", display:{width:150}},

            {select:"query_stats.qid", display:{width:280}},
            {select:"query_stats.where", display:{width:300}},
            {select:"query_stats.select", display:{width:300}},
            {select:"query_stats.post", display:{width:300}},

            {select:"query_stats.time_span", display:{width:150}},
            {select:"SUM(query_stats.time_span)", display:{width:150}},
            {select:"MIN(query_stats.time_span)", display:{width:150}},
            {select:"MAX(query_stats.time_span)", display:{width:150}},

            {select:"query_stats.chunks", display:{width:150}},
            {select:"SUM(query_stats.chunks)", display:{width:150}},
            {select:"MIN(query_stats.chunks)", display:{width:150}},
            {select:"MAX(query_stats.chunks)", display:{width:150}},

            {select:"query_stats.chunk_where_time", display:{width:170}},
            {select:"query_stats.chunk_select_time", display:{width:170}},
            {select:"query_stats.chunk_postproc_time", display:{width:170}},
            {select:"query_stats.chunk_merge_time", display:{width:170}},

            {select:"query_stats.final_merge_time", display:{width:170}},
            {select:"SUM(query_stats.final_merge_time)", display:{width:170}},
            {select:"MIN(query_stats.final_merge_time)", display:{width:170}},
            {select:"MAX(query_stats.final_merge_time)", display:{width:170}},

            {select:"query_stats.enq_delay", display:{width:170}},
            {select:"SUM(query_stats.enq_delay)", display:{width:170}},
            {select:"MIN(query_stats.enq_delay)", display:{width:170}},
            {select:"MAX(query_stats.enq_delay)", display:{width:170}},

            {select:"query_stats.error", display:{width:100}}
        ],
        "StatTable.UveVirtualNetworkAgent.vn_stats" : [
            {select:"COUNT(vn_stats)", display:{width:120}},
            {select:"vn_stats.other_vn", display:{width:250}},
            {select:"vn_stats.vrouter", display:{width:120, title:"vRouter"}},

            {select:"vn_stats.in_tpkts", display:{width:150}},
            {select:"SUM(vn_stats.in_tpkts)", display:{width:150}},
            {select:"MIN(vn_stats.in_tpkts)", display:{width:150}},
            {select:"MAX(vn_stats.in_tpkts)", display:{width:150}},

            {select:"vn_stats.in_bytes", display:{width:120}},
            {select:"SUM(vn_stats.in_bytes)", display:{width:120}},
            {select:"MIN(vn_stats.in_bytes)", display:{width:120}},
            {select:"MAX(vn_stats.in_bytes)", display:{width:120}},


            {select:"vn_stats.out_tpkts", display:{width:150}},
            {select:"SUM(vn_stats.out_tpkts)", display:{width:150}},
            {select:"MIN(vn_stats.out_tpkts)", display:{width:150}},
            {select:"MAX(vn_stats.out_tpkts)", display:{width:150}},

            {select:"vn_stats.out_bytes", display:{width:120}},
            {select:"SUM(vn_stats.out_bytes)", display:{width:120}},
            {select:"MIN(vn_stats.out_bytes)", display:{width:120}},
            {select:"MAX(vn_stats.out_bytes)", display:{width:120}}
        ],
        "StatTable.DatabasePurgeInfo.stats" : [
            {select:"COUNT(stats)", display:{width:120}},
            {select:"stats.purge_id", display:{width:280}},
            {select:"stats.purge_status", display:{width:280}},
            {select:"stats.purge_status_details", display:{width:280}},

            {select:"stats.request_time", display:{width:280}},
            {select:"SUM(stats.request_time)", display:{width:280}},
            {select:"MIN(stats.request_time)", display:{width:280}},
            {select:"MAX(stats.request_time)", display:{width:280}},

            {select:"stats.rows_deleted", display:{width:150}},
            {select:"SUM(stats.rows_deleted)", display:{width:150}},
            {select:"MIN(stats.rows_deleted)", display:{width:150}},
            {select:"MAX(stats.rows_deleted)", display:{width:150}},

            {select:"stats.duration", display:{width:280}},
            {select:"SUM(stats.duration)", display:{width:280}},
            {select:"MIN(stats.duration)", display:{width:280}},
            {select:"MAX(stats.duration)", display:{width:280}}
        ],
        "StatTable.DatabaseUsageInfo.database_usage" : [
            {select:"COUNT(database_usage)", display:{width:170}},

            {select:"database_usage.disk_space_used_1k", display:{width:200}},
            {select:"SUM(database_usage.disk_space_used_1k)", display:{width:200}},
            {select:"MIN(database_usage.disk_space_used_1k)", display:{width:200}},
            {select:"MAX(database_usage.disk_space_used_1k)", display:{width:200}},

            {select:"database_usage.disk_space_available_1k", display:{width:200}},
            {select:"SUM(database_usage.disk_space_available_1k)", display:{width:200}},
            {select:"MIN(database_usage.disk_space_available_1k)", display:{width:200}},
            {select:"MAX(database_usage.disk_space_available_1k)", display:{width:200}},

            {select:"database_usage.analytics_db_size_1k", display:{width:200}},
            {select:"SUM(database_usage.analytics_db_size_1k)", display:{width:200}},
            {select:"MIN(database_usage.analytics_db_size_1k)", display:{width:200}},
            {select:"MAX(database_usage.analytics_db_size_1k)", display:{width:200}}
        ],
        "StatTable.ProtobufCollectorStats.tx_socket_stats" : [
            {select:"COUNT(tx_socket_stats)", display:{width:200}},
            {select:"tx_socket_stats.average_blocked_duration", display:{width:150}},
            {select:"tx_socket_stats.blocked_duration", display:{width:150}},

            {select:"tx_socket_stats.bytes", display:{width:150}},
            {select:"SUM(tx_socket_stats.bytes)", display:{width:150}},
            {select:"MIN(tx_socket_stats.bytes)", display:{width:150}},
            {select:"MAX(tx_socket_stats.bytes)", display:{width:150}},

            {select:"tx_socket_stats.calls", display:{width:150}},
            {select:"SUM(tx_socket_stats.calls)", display:{width:150}},
            {select:"MIN(tx_socket_stats.calls)", display:{width:150}},
            {select:"MAX(tx_socket_stats.calls)", display:{width:150}},

            {select:"tx_socket_stats.average_bytes", display:{width:180}},
            {select:"SUM(tx_socket_stats.average_bytes)", display:{width:180}},
            {select:"MIN(tx_socket_stats.average_bytes)", display:{width:180}},
            {select:"MAX(tx_socket_stats.average_bytes)", display:{width:180}},

            {select:"tx_socket_stats.errors", display:{width:150}},
            {select:"SUM(tx_socket_stats.errors)", display:{width:150}},
            {select:"MIN(tx_socket_stats.errors)", display:{width:150}},
            {select:"MAX(tx_socket_stats.errors)", display:{width:150}},

            {select:"tx_socket_stats.blocked_count", display:{width:180}},
            {select:"SUM(tx_socket_stats.blocked_count)", display:{width:180}},
            {select:"MIN(tx_socket_stats.blocked_count)", display:{width:180}},
            {select:"MAX(tx_socket_stats.blocked_count)", display:{width:180}}
        ],
        "StatTable.ProtobufCollectorStats.rx_socket_stats" : [
            {select:"COUNT(rx_socket_stats)", display:{width:200}},
            {select:"rx_socket_stats.blocked_duration", display:{width:180}},
            {select:"rx_socket_stats.average_blocked_duration", display:{width:160}},

            {select:"rx_socket_stats.bytes", display:{width:150}},
            {select:"SUM(rx_socket_stats.bytes)", display:{width:150}},
            {select:"MIN(rx_socket_stats.bytes)", display:{width:150}},
            {select:"MAX(rx_socket_stats.bytes)", display:{width:150}},

            {select:"rx_socket_stats.calls", display:{width:150}},
            {select:"SUM(rx_socket_stats.calls)", display:{width:150}},
            {select:"MIN(rx_socket_stats.calls)", display:{width:150}},
            {select:"MAX(rx_socket_stats.calls)", display:{width:150}},

            {select:"rx_socket_stats.average_bytes", display:{width:180}},
            {select:"SUM(rx_socket_stats.average_bytes)", display:{width:180}},
            {select:"MIN(rx_socket_stats.average_bytes)", display:{width:180}},
            {select:"MAX(rx_socket_stats.average_bytes)", display:{width:180}},

            {select:"rx_socket_stats.errors", display:{width:150}},
            {select:"SUM(rx_socket_stats.errors)", display:{width:150}},
            {select:"MIN(rx_socket_stats.errors)", display:{width:150}},
            {select:"MAX(rx_socket_stats.errors)", display:{width:150}},

            {select:"rx_socket_stats.blocked_count", display:{width:180}},
            {select:"SUM(rx_socket_stats.blocked_count)", display:{width:180}},
            {select:"MIN(rx_socket_stats.blocked_count)", display:{width:180}},
            {select:"MAX(rx_socket_stats.blocked_count)", display:{width:180}}
        ],
        "StatTable.ProtobufCollectorStats.rx_message_stats" : [
            {select:"COUNT(rx_message_stats)", display:{width:200}},
            {select:"rx_message_stats.endpoint_name", display:{width:180}},
            {select:"rx_message_stats.message_name", display:{width:180}},

            {select:"rx_message_stats.messages", display:{width:180}},
            {select:"SUM(rx_message_stats.messages)", display:{width:180}},
            {select:"MIN(rx_message_stats.messages)", display:{width:180}},
            {select:"MAX(rx_message_stats.messages)", display:{width:180}},

            {select:"rx_message_stats.bytes", display:{width:150}},
            {select:"SUM(rx_message_stats.bytes)", display:{width:150}},
            {select:"MIN(rx_message_stats.bytes)", display:{width:150}},
            {select:"MAX(rx_message_stats.bytes)", display:{width:150}},

            {select:"rx_message_stats.errors", display:{width:150}},
            {select:"SUM(rx_message_stats.errors)", display:{width:150}},
            {select:"MIN(rx_message_stats.errors)", display:{width:150}},
            {select:"MAX(rx_message_stats.errors)", display:{width:150}},

            {select:"rx_message_stats.last_timestamp", display:{width:180}},
            {select:"SUM(rx_message_stats.last_timestamp)", display:{width:180}},
            {select:"MIN(rx_message_stats.last_timestamp)", display:{width:180}},
            {select:"MAX(rx_message_stats.last_timestamp)", display:{width:180}}
        ],

        "StatTable.ProtobufCollectorStats.db_table_info" : [
            {select:"COUNT(db_table_info)", display:{width:150}},
            {select:"db_table_info.table_name", display:{width:150}},

            {select:"db_table_info.reads", display:{width:150}},
            {select:"SUM(db_table_info.reads)", display:{width:150}},
            {select:"MIN(db_table_info.reads)", display:{width:150}},
            {select:"MAX(db_table_info.reads)", display:{width:150}},

            {select:"db_table_info.read_fails", display:{width:150}},
            {select:"SUM(db_table_info.read_fails)", display:{width:150}},
            {select:"MIN(db_table_info.read_fails)", display:{width:150}},
            {select:"MAX(db_table_info.read_fails)", display:{width:150}},

            {select:"db_table_info.writes", display:{width:150}},
            {select:"SUM(db_table_info.writes)", display:{width:150}},
            {select:"MIN(db_table_info.writes)", display:{width:150}},
            {select:"MAX(db_table_info.writes)", display:{width:150}},

            {select:"db_table_info.write_fails", display:{width:150}},
            {select:"SUM(db_table_info.write_fails)", display:{width:180}},
            {select:"MIN(db_table_info.write_fails)", display:{width:180}},
            {select:"MAX(db_table_info.write_fails)", display:{width:180}},

        ],
        "StatTable.ProtobufCollectorStats.db_statistics_table_info" : [
            {select:"COUNT(db_statistics_table_info)", display:{width:150}},
            {select:"db_statistics_table_info.table_name", display:{width:150}},

            {select:"db_statistics_table_info.reads", display:{width:150}},
            {select:"SUM(db_statistics_table_info.reads)", display:{width:150}},
            {select:"MIN(db_statistics_table_info.reads)", display:{width:150}},
            {select:"MAX(db_statistics_table_info.reads)", display:{width:150}},

            {select:"db_statistics_table_info.read_fails", display:{width:180}},
            {select:"SUM(db_statistics_table_info.read_fails)", display:{width:180}},
            {select:"MIN(db_statistics_table_info.read_fails)", display:{width:180}},
            {select:"MAX(db_statistics_table_info.read_fails)", display:{width:180}},

            {select:"db_statistics_table_info.writes", display:{width:150}},
            {select:"SUM(db_statistics_table_info.writes)", display:{width:150}},
            {select:"MIN(db_statistics_table_info.writes)", display:{width:150}},
            {select:"MAX(db_statistics_table_info.writes)", display:{width:150}},

            {select:"db_statistics_table_info.write_fails", display:{width:180}},
            {select:"SUM(db_statistics_table_info.write_fails)", display:{width:180}},
            {select:"MIN(db_statistics_table_info.write_fails)", display:{width:180}},
            {select:"MAX(db_statistics_table_info.write_fails)", display:{width:180}},

        ],
        "StatTable.ProtobufCollectorStats.db_errors" : [
            {select:"COUNT(db_errors)", display:{width:150}},

            {select:"db_errors.write_tablespace_fails", display:{width:190}},
            {select:"SUM(db_errors.write_tablespace_fails)", display:{width:190}},
            {select:"MIN(db_errors.write_tablespace_fails)", display:{width:190}},
            {select:"MAX(db_errors.write_tablespace_fails)", display:{width:190}},

            {select:"db_errors.read_tablespace_fails", display:{width:190}},
            {select:"SUM(db_errors.read_tablespace_fails)", display:{width:190}},
            {select:"MIN(db_errors.read_tablespace_fails)", display:{width:190}},
            {select:"MAX(db_errors.read_tablespace_fails)", display:{width:190}},

            {select:"db_errors.write_table_fails", display:{width:180}},
            {select:"SUM(db_errors.write_table_fails)", display:{width:180}},
            {select:"MIN(db_errors.write_table_fails)", display:{width:180}},
            {select:"MAX(db_errors.write_table_fails)", display:{width:180}},

            {select:"db_errors.read_table_fails", display:{width:180}},
            {select:"SUM(db_errors.read_table_fails)", display:{width:180}},
            {select:"MIN(db_errors.read_table_fails)", display:{width:180}},
            {select:"MAX(db_errors.read_table_fails)", display:{width:180}},

            {select:"db_errors.write_column_fails", display:{width:190}},
            {select:"SUM(db_errors.write_column_fails)", display:{width:190}},
            {select:"MIN(db_errors.write_column_fails)", display:{width:190}},
            {select:"MAX(db_errors.write_column_fails)", display:{width:190}},

            {select:"db_errors.write_batch_column_fails", display:{width:210}},
            {select:"SUM(db_errors.write_batch_column_fails)", display:{width:210}},
            {select:"MIN(db_errors.write_batch_column_fails)", display:{width:210}},
            {select:"MAX(db_errors.write_batch_column_fails)", display:{width:210}},

            {select:"db_errors.read_column_fails", display:{width:190}},
            {select:"SUM(db_errors.read_column_fails)", display:{width:190}},
            {select:"MIN(db_errors.read_column_fails)", display:{width:190}},
            {select:"MAX(db_errors.read_column_fails)", display:{width:190}},
        ],


        "StatTable.PFEHeapInfo.heap_info" : [
            {select:"heap_info.name", display:{width:150}},
            {select:"COUNT(heap_info)", display:{width:120}},

            {select:"heap_info.size", display:{width:150}},
            {select:"SUM(heap_info.size)", display:{width:150}},
            {select:"MIN(heap_info.size)", display:{width:150}},
            {select:"MAX(heap_info.size)", display:{width:150}},

            {select:"heap_info.allocated", display:{width:150}},
            {select:"MIN(heap_info.allocated)", display:{width:150}},
            {select:"SUM(heap_info.allocated)", display:{width:150}},
            {select:"MAX(heap_info.allocated)", display:{width:150}},

            {select:"heap_info.utilization", display:{width:150}},
            {select:"SUM(heap_info.utilization)", display:{width:150}},
            {select:"MIN(heap_info.utilization)", display:{width:150}},
            {select:"MAX(heap_info.utilization)", display:{width:150}}
        ],
        "StatTable.npu_mem.stats" : [
            {select:"COUNT(stats)", display:{width:120}},
            {select:"stats.pfe_identifier", display:{width:150}},
            {select:"stats.resource_name", display:{width:150}},

            {select:"stats.size", display:{width:150}},
            {select:"SUM(stats.size)", display:{width:150}},
            {select:"MIN(stats.size)", display:{width:150}},
            {select:"MAX(stats.size)", display:{width:150}},

            {select:"stats.allocated", display:{width:150}},
            {select:"SUM(stats.allocated)", display:{width:150}},
            {select:"MIN(stats.allocated)", display:{width:150}},
            {select:"MAX(stats.allocated)", display:{width:150}},

            {select:"stats.utilization", display:{width:150}},
            {select:"SUM(stats.utilization)", display:{width:150}},
            {select:"MIN(stats.utilization)", display:{width:150}},
            {select:"MAX(stats.utilization)", display:{width:150}},
        ],
        "StatTable.fabric_message.edges.class_stats.transmit_counts" : [
            {select:"COUNT(edges)", display:{width:120}},
            {select:"edges.src_type", display:{width:150}},
            {select:"edges.src_slot", display:{width:150}},
            {select:"edges.src_pfe", display:{width:150}},
            {select:"edges.dst_type", display:{width:150}},
            {select:"edges.dst_slot", display:{width:150}},
            {select:"edges.dst_pfe", display:{width:150}},
            {select:"edges.class_stats.priority", display:{width:150}},

            {select:"edges.class_stats.transmit_counts.packets", display:{width:150}},
            {select:"SUM(edges.class_stats.transmit_counts.packets)", display:{width:150}},
            {select:"MIN(edges.class_stats.transmit_counts.packets)", display:{width:150}},
            {select:"MAX(edges.class_stats.transmit_counts.packets)", display:{width:150}},

            {select:"edges.class_stats.transmit_counts.pps", display:{width:150}},
            {select:"SUM(edges.class_stats.transmit_counts.pps)", display:{width:150}},
            {select:"MIN(edges.class_stats.transmit_counts.pps)", display:{width:150}},
            {select:"MAX(edges.class_stats.transmit_counts.pps)", display:{width:150}},

            {select:"edges.class_stats.transmit_counts.bytes", display:{width:150}},
            {select:"SUM(edges.class_stats.transmit_counts.bytes)", display:{width:150}},
            {select:"MIN(edges.class_stats.transmit_counts.bytes)", display:{width:150}},
            {select:"MAX(edges.class_stats.transmit_counts.bytes)", display:{width:150}},

            {select:"edges.class_stats.transmit_counts.bps", display:{width:150}},
            {select:"SUM(edges.class_stats.transmit_counts.bps)", display:{width:150}},
            {select:"MIN(edges.class_stats.transmit_counts.bps)", display:{width:150}},
            {select:"MAX(edges.class_stats.transmit_counts.bps)", display:{width:150}},

            {select:"edges.class_stats.transmit_counts.drop_packets", display:{width:150}},
            {select:"SUM(edges.class_stats.transmit_counts.drop_packets)", display:{width:150}},
            {select:"MIN(edges.class_stats.transmit_counts.drop_packets)", display:{width:150}},
            {select:"MAX(edges.class_stats.transmit_counts.drop_packets)", display:{width:150}},

            {select:"edges.class_stats.transmit_counts.drop_bytes", display:{width:150}},
            {select:"SUM(edges.class_stats.transmit_counts.drop_bytes)", display:{width:150}},
            {select:"MIN(edges.class_stats.transmit_counts.drop_bytes)", display:{width:150}},
            {select:"MAX(edges.class_stats.transmit_counts.drop_bytes)", display:{width:150}},

            {select:"edges.class_stats.transmit_counts.drop_bps", display:{width:150}},
            {select:"SUM(edges.class_stats.transmit_counts.drop_bps)", display:{width:150}},
            {select:"MIN(edges.class_stats.transmit_counts.drop_bps)", display:{width:150}},
            {select:"MAX(edges.class_stats.transmit_counts.drop_bps)", display:{width:150}},

            {select:"edges.class_stats.transmit_counts.drop_pps", display:{width:150}},
            {select:"SUM(edges.class_stats.transmit_counts.drop_pps)", display:{width:150}},
            {select:"MIN(edges.class_stats.transmit_counts.drop_pps)", display:{width:150}},
            {select:"MAX(edges.class_stats.transmit_counts.drop_pps)", display:{width:150}},

            {select:"edges.class_stats.transmit_counts.q_depth_avg", display:{width:150}},
            {select:"SUM(edges.class_stats.transmit_counts.q_depth_avg)", display:{width:150}},
            {select:"MIN(edges.class_stats.transmit_counts.q_depth_avg)", display:{width:150}},
            {select:"MAX(edges.class_stats.transmit_counts.q_depth_avg)", display:{width:150}},

            {select:"edges.class_stats.transmit_counts.q_depth_cur", display:{width:150}},
            {select:"SUM(edges.class_stats.transmit_counts.q_depth_cur)", display:{width:150}},
            {select:"MIN(edges.class_stats.transmit_counts.q_depth_cur)", display:{width:150}},
            {select:"MAX(edges.class_stats.transmit_counts.q_depth_cur)", display:{width:150}},

            {select:"edges.class_stats.transmit_counts.q_depth_peak", display:{width:150}},
            {select:"SUM(edges.class_stats.transmit_counts.q_depth_peak)", display:{width:150}},
            {select:"MIN(edges.class_stats.transmit_counts.q_depth_peak)", display:{width:150}},
            {select:"MAX(edges.class_stats.transmit_counts.q_depth_peak)", display:{width:150}},

            {select:"edges.class_stats.transmit_counts.q_depth_max", display:{width:150}},
            {select:"SUM(edges.class_stats.transmit_counts.q_depth_max)", display:{width:150}},
            {select:"MIN(edges.class_stats.transmit_counts.q_depth_max)", display:{width:150}},
            {select:"MAX(edges.class_stats.transmit_counts.q_depth_max)", display:{width:150}},

        ],
        "StatTable.g_lsp_stats.lsp_records" : [
            {select:"COUNT(lsp_records)", display:{width:120}},
            {select:"system_name", display:{width:150}},
            {select:"sensor_name", display:{width:150}},
            {select:"lsp_records.name", display:{width:150}},

            {select:"slot", display:{width:150}},
            {select:"SUM(slot)", display:{width:150}},
            {select:"MIN(slot)", display:{width:150}},
            {select:"MAX(slot)", display:{width:150}},

            {select:"timestamp", display:{width:150}},
            {select:"SUM(timestamp)", display:{width:150}},
            {select:"MIN(timestamp)", display:{width:150}},
            {select:"MAX(timestamp)", display:{width:150}},

            {select:"lsp_records.instance_identifier", display:{width:150}},
            {select:"SUM(lsp_records.instance_identifier)", display:{width:150}},
            {select:"MIN(lsp_records.instance_identifier)", display:{width:150}},
            {select:"MAX(lsp_records.instance_identifier)", display:{width:150}},

            {select:"lsp_records.counter_name", display:{width:150}},
            {select:"SUM(lsp_records.counter_name)", display:{width:150}},
            {select:"MIN(lsp_records.counter_name)", display:{width:150}},
            {select:"MAX(lsp_records.counter_name)", display:{width:150}},

            {select:"lsp_records.packets", display:{width:150}},
            {select:"SUM(lsp_records.packets)", display:{width:150}},
            {select:"MIN(lsp_records.packets)", display:{width:150}},
            {select:"MAX(lsp_records.packets)", display:{width:150}},

            {select:"lsp_records.packet_rates", display:{width:150}},
            {select:"SUM(lsp_records.packet_rates)", display:{width:150}},
            {select:"MIN(lsp_records.packet_rates)", display:{width:150}},
            {select:"MAX(lsp_records.packet_rates)", display:{width:150}},

            {select:"lsp_records.bytes", display:{width:150}},
            {select:"SUM(lsp_records.bytes)", display:{width:150}},
            {select:"MIN(lsp_records.bytes)", display:{width:150}},
            {select:"MAX(lsp_records.bytes)", display:{width:150}},

            {select:"lsp_records.byte_rates", display:{width:150}},
            {select:"SUM(lsp_records.byte_rates)", display:{width:150}},
            {select:"MIN(lsp_records.byte_rates)", display:{width:150}},
            {select:"MAX(lsp_records.byte_rates)", display:{width:150}}
        ],
        "StatTable.UFlowData.flow" : [
            {select:"COUNT(flow)", display:{width:120}},

            {select:"flow.pifindex", display:{width:150}},
            {select:"SUM(flow.pifindex)", display:{width:150}},
            {select:"MIN(flow.pifindex)", display:{width:150}},
            {select:"MAX(flow.pifindex)", display:{width:150}},

            {select:"flow.sport", display:{width:150}},
            {select:"SUM(flow.sport)", display:{width:150}},
            {select:"MIN(flow.sport)", display:{width:150}},
            {select:"MAX(flow.sport)", display:{width:150}},

            {select:"flow.dport", display:{width:150}},
            {select:"SUM(flow.dport)", display:{width:150}},
            {select:"MIN(flow.dport)", display:{width:150}},
            {select:"MAX(flow.dport)", display:{width:150}},

            {select:"flow.protocol", display:{width:150}},
            {select:"SUM(flow.protocol)", display:{width:150}},
            {select:"MIN(flow.protocol)", display:{width:150}},
            {select:"MAX(flow.protocol)", display:{width:150}},

            {select:"flow.sip", display:{width:150}},
            {select:"flow.dip", display:{width:150}},
            {select:"flow.vlan", display:{width:150}},
            {select:"flow.flowtype", display:{width:150}},
            {select:"flow.otherinfo", display:{width:150}}
        ],
        "StatTable.AlarmgenUpdate.o" : [
            {select:"COUNT(o)", display:{width:120}},
            {select:"instance", display:{width:150}},
            {select:"table", display:{width:150}},
            {select:"o.key", display:{width:150}},

            {select:"partition", display:{width:150}},
            {select:"SUM(partition)", display:{width:150}},
            {select:"MIN(partition)", display:{width:150}},
            {select:"MAX(partition)", display:{width:150}},

            {select:"o.count", display:{width:150}},
            {select:"SUM(o.count)", display:{width:150}},
            {select:"MIN(o.count)", display:{width:150}},
            {select:"MAX(o.count)", display:{width:150}},
        ],
        "StatTable.AlarmgenUpdate.i" : [
            {select:"COUNT(i)", display:{width:120}},
            {select:"instance", display:{width:150}},
            {select:"table", display:{width:150}},
            {select:"i.generator", display:{width:150}},
            {select:"i.collector", display:{width:150}},
            {select:"i.type", display:{width:150}},

            {select:"partition", display:{width:150}},
            {select:"SUM(partition)", display:{width:150}},
            {select:"MIN(partition)", display:{width:150}},
            {select:"MAX(partition)", display:{width:150}},

            {select:"i.count", display:{width:150}},
            {select:"SUM(i.count)", display:{width:150}},
            {select:"MIN(i.count)", display:{width:150}},
            {select:"MAX(i.count)", display:{width:150}}
        ],

        "StatTable.AlarmgenStatus.counters" : [
            {select:"COUNT(counters)", display:{width:120}},
            {select:"counters.instance", display:{width:150}},

            {select:"counters.partitions", display:{width:150}},
            {select:"SUM(counters.partitions)", display:{width:150}},
            {select:"MIN(counters.partitions)", display:{width:150}},
            {select:"MAX(counters.partitions)", display:{width:150}},

            {select:"counters.keys", display:{width:150}},
            {select:"SUM(counters.keys)", display:{width:150}},
            {select:"MIN(counters.keys)", display:{width:150}},
            {select:"MAX(counters.keys)", display:{width:150}},

            {select:"counters.updates", display:{width:150}},
            {select:"SUM(counters.updates)", display:{width:150}},
            {select:"MIN(counters.updates)", display:{width:150}},
            {select:"MAX(counters.updates)", display:{width:150}}
        ],

        "StatTable.UveLoadbalancer.virtual_ip_stats" : [
            {select:"COUNT(virtual_ip_stats)", display:{width:170}},
            {select:"virtual_ip_stats.obj_name", display:{width:150}},
            {select:"virtual_ip_stats.uuid", display:{width:280}},
            {select:"virtual_ip_stats.status", display:{width:150}},
            {select:"virtual_ip_stats.vrouter", display:{width:150}},

            {select:"virtual_ip_stats.active_connections", display:{width:180}},
            {select:"SUM(virtual_ip_stats.active_connections)", display:{width:180}},
            {select:"MIN(virtual_ip_stats.active_connections)", display:{width:180}},
            {select:"MAX(virtual_ip_stats.active_connections)", display:{width:180}},

            {select:"virtual_ip_stats.max_connections", display:{width:180}},
            {select:"SUM(virtual_ip_stats.max_connections)", display:{width:180}},
            {select:"MIN(virtual_ip_stats.max_connections)", display:{width:180}},
            {select:"MAX(virtual_ip_stats.max_connections)", display:{width:180}},

            {select:"virtual_ip_stats.current_sessions", display:{width:180}},
            {select:"SUM(virtual_ip_stats.current_sessions)", display:{width:180}},
            {select:"MIN(virtual_ip_stats.current_sessions)", display:{width:180}},
            {select:"MAX(virtual_ip_stats.current_sessions)", display:{width:180}},

            {select:"virtual_ip_stats.max_sessions", display:{width:180}},
            {select:"SUM(virtual_ip_stats.max_sessions)", display:{width:180}},
            {select:"MIN(virtual_ip_stats.max_sessions)", display:{width:180}},
            {select:"MAX(virtual_ip_stats.max_sessions)", display:{width:180}},

            {select:"virtual_ip_stats.total_sessions", display:{width:180}},
            {select:"SUM(virtual_ip_stats.total_sessions)", display:{width:180}},
            {select:"MIN(virtual_ip_stats.total_sessions)", display:{width:180}},
            {select:"MAX(virtual_ip_stats.total_sessions)", display:{width:180}},

            {select:"virtual_ip_stats.bytes_in", display:{width:150}},
            {select:"SUM(virtual_ip_stats.bytes_in)", display:{width:150}},
            {select:"MIN(virtual_ip_stats.bytes_in)", display:{width:150}},
            {select:"MAX(virtual_ip_stats.bytes_in)", display:{width:150}},

            {select:"virtual_ip_stats.bytes_out", display:{width:150}},
            {select:"SUM(virtual_ip_stats.bytes_out)", display:{width:150}},
            {select:"MIN(virtual_ip_stats.bytes_out)", display:{width:150}},
            {select:"MAX(virtual_ip_stats.bytes_out)", display:{width:150}},

            {select:"virtual_ip_stats.connection_errors", display:{width:180}},
            {select:"SUM(virtual_ip_stats.connection_errors)", display:{width:180}},
            {select:"MIN(virtual_ip_stats.connection_errors)", display:{width:180}},
            {select:"MAX(virtual_ip_stats.connection_errors)", display:{width:180}},

            {select:"virtual_ip_stats.reponse_errors", display:{width:180}},
            {select:"SUM(virtual_ip_stats.reponse_errors)", display:{width:180}},
            {select:"MIN(virtual_ip_stats.reponse_errors)", display:{width:180}},
            {select:"MAX(virtual_ip_stats.reponse_errors)", display:{width:180}},
        ],
        "StatTable.UveLoadbalancer.listener_stats": [
            {select:"COUNT(listener_stats)", display:{width:170}},
            {select:"listener_stats.obj_name", display:{width:150}},
            {select:"listener_stats.uuid", display:{width:280}},
            {select:"listener_stats.status", display:{width:150}},
            {select:"listener_stats.vrouter", display:{width:150}},

            {select:"listener_stats.active_connections", display:{width:180}},
            {select:"SUM(listener_stats.active_connections)", display:{width:180}},
            {select:"MIN(listener_stats.active_connections)", display:{width:180}},
            {select:"MAX(listener_stats.active_connections)", display:{width:180}},

            {select:"listener_stats.max_connections", display:{width:180}},
            {select:"SUM(listener_stats.max_connections)", display:{width:180}},
            {select:"MIN(listener_stats.max_connections)", display:{width:180}},
            {select:"MAX(listener_stats.max_connections)", display:{width:180}},

            {select:"listener_stats.current_sessions", display:{width:180}},
            {select:"SUM(listener_stats.current_sessions)", display:{width:180}},
            {select:"MIN(listener_stats.current_sessions)", display:{width:180}},
            {select:"MAX(listener_stats.current_sessions)", display:{width:180}},

            {select:"listener_stats.max_sessions", display:{width:180}},
            {select:"SUM(listener_stats.max_sessions)", display:{width:180}},
            {select:"MIN(listener_stats.max_sessions)", display:{width:180}},
            {select:"MAX(listener_stats.max_sessions)", display:{width:180}},

            {select:"listener_stats.total_sessions", display:{width:180}},
            {select:"SUM(listener_stats.total_sessions)", display:{width:180}},
            {select:"MIN(listener_stats.total_sessions)", display:{width:180}},
            {select:"MAX(listener_stats.total_sessions)", display:{width:180}},

            {select:"listener_stats.bytes_in", display:{width:150}},
            {select:"SUM(listener_stats.bytes_in)", display:{width:150}},
            {select:"MIN(listener_stats.bytes_in)", display:{width:150}},
            {select:"MAX(listener_stats.bytes_in)", display:{width:150}},

            {select:"listener_stats.bytes_out", display:{width:150}},
            {select:"SUM(listener_stats.bytes_out)", display:{width:150}},
            {select:"MIN(listener_stats.bytes_out)", display:{width:150}},
            {select:"MAX(listener_stats.bytes_out)", display:{width:150}},

            {select:"listener_stats.connection_errors", display:{width:180}},
            {select:"SUM(listener_stats.connection_errors)", display:{width:180}},
            {select:"MIN(listener_stats.connection_errors)", display:{width:180}},
            {select:"MAX(listener_stats.connection_errors)", display:{width:180}},

            {select:"listener_stats.reponse_errors", display:{width:180}},
            {select:"SUM(listener_stats.reponse_errors)", display:{width:180}},
            {select:"MIN(listener_stats.reponse_errors)", display:{width:180}},
            {select:"MAX(listener_stats.reponse_errors)", display:{width:180}},
        ],
        "StatTable.UveLoadbalancer.pool_stats" : [
            {select:"COUNT(pool_stats)", display:{width:150}},
            {select:"pool_stats.obj_name", display:{width:150}},
            {select:"pool_stats.uuid", display:{width:280}},
            {select:"pool_stats.status", display:{width:150}},
            {select:"pool_stats.vrouter", display:{width:150}},

            {select:"pool_stats.active_connections", display:{width:180}},
            {select:"SUM(pool_stats.active_connections)", display:{width:180}},
            {select:"MIN(pool_stats.active_connections)", display:{width:180}},
            {select:"MAX(pool_stats.active_connections)", display:{width:180}},

            {select:"pool_stats.max_connections", display:{width:180}},
            {select:"SUM(pool_stats.max_connections)", display:{width:180}},
            {select:"MIN(pool_stats.max_connections)", display:{width:180}},
            {select:"MAX(pool_stats.max_connections)", display:{width:180}},

            {select:"pool_stats.current_sessions", display:{width:180}},
            {select:"SUM(pool_stats.current_sessions)", display:{width:180}},
            {select:"MIN(pool_stats.current_sessions)", display:{width:180}},
            {select:"MAX(pool_stats.current_sessions)", display:{width:180}},

            {select:"pool_stats.max_sessions", display:{width:180}},
            {select:"SUM(pool_stats.max_sessions)", display:{width:180}},
            {select:"MIN(pool_stats.max_sessions)", display:{width:180}},
            {select:"MAX(pool_stats.max_sessions)", display:{width:180}},

            {select:"pool_stats.total_sessions", display:{width:180}},
            {select:"SUM(pool_stats.total_sessions)", display:{width:180}},
            {select:"MIN(pool_stats.total_sessions)", display:{width:180}},
            {select:"MAX(pool_stats.total_sessions)", display:{width:180}},

            {select:"pool_stats.bytes_in", display:{width:150}},
            {select:"SUM(pool_stats.bytes_in)", display:{width:150}},
            {select:"MIN(pool_stats.bytes_in)", display:{width:150}},
            {select:"MAX(pool_stats.bytes_in)", display:{width:150}},

            {select:"pool_stats.bytes_out", display:{width:150}},
            {select:"SUM(pool_stats.bytes_out)", display:{width:150}},
            {select:"MIN(pool_stats.bytes_out)", display:{width:150}},
            {select:"MAX(pool_stats.bytes_out)", display:{width:150}},

            {select:"pool_stats.connection_errors", display:{width:180}},
            {select:"SUM(pool_stats.connection_errors)", display:{width:180}},
            {select:"MIN(pool_stats.connection_errors)", display:{width:180}},
            {select:"MAX(pool_stats.connection_errors)", display:{width:180}},

            {select:"pool_stats.reponse_errors", display:{width:180}},
            {select:"SUM(pool_stats.reponse_errors)", display:{width:180}},
            {select:"MIN(pool_stats.reponse_errors)", display:{width:180}},
            {select:"MAX(pool_stats.reponse_errors)", display:{width:180}},
        ],
        "StatTable.UveLoadbalancer.member_stats": [
            {select:"COUNT(member_stats)", display:{width:170}},
            {select:"member_stats.obj_name", display:{width:150}},
            {select:"member_stats.uuid", display:{width:280}},
            {select:"member_stats.status", display:{width:150}},
            {select:"member_stats.vrouter", display:{width:150}},

            {select:"member_stats.active_connections", display:{width:180}},
            {select:"SUM(member_stats.active_connections)", display:{width:180}},
            {select:"MIN(member_stats.active_connections)", display:{width:180}},
            {select:"MAX(member_stats.active_connections)", display:{width:180}},

            {select:"member_stats.max_connections", display:{width:180}},
            {select:"SUM(member_stats.max_connections)", display:{width:180}},
            {select:"MIN(member_stats.max_connections)", display:{width:180}},
            {select:"MAX(member_stats.max_connections)", display:{width:180}},

            {select:"member_stats.current_sessions", display:{width:180}},
            {select:"SUM(member_stats.current_sessions)", display:{width:180}},
            {select:"MIN(member_stats.current_sessions)", display:{width:180}},
            {select:"MAX(member_stats.current_sessions)", display:{width:180}},

            {select:"member_stats.max_sessions", display:{width:180}},
            {select:"SUM(member_stats.max_sessions)", display:{width:180}},
            {select:"MIN(member_stats.max_sessions)", display:{width:180}},
            {select:"MAX(member_stats.max_sessions)", display:{width:180}},

            {select:"member_stats.total_sessions", display:{width:180}},
            {select:"SUM(member_stats.total_sessions)", display:{width:180}},
            {select:"MIN(member_stats.total_sessions)", display:{width:180}},
            {select:"MAX(member_stats.total_sessions)", display:{width:180}},

            {select:"member_stats.bytes_in", display:{width:150}},
            {select:"SUM(member_stats.bytes_in)", display:{width:150}},
            {select:"MIN(member_stats.bytes_in)", display:{width:150}},
            {select:"MAX(member_stats.bytes_in)", display:{width:150}},

            {select:"member_stats.bytes_out", display:{width:150}},
            {select:"SUM(member_stats.bytes_out)", display:{width:150}},
            {select:"MIN(member_stats.bytes_out)", display:{width:150}},
            {select:"MAX(member_stats.bytes_out)", display:{width:150}},

            {select:"member_stats.connection_errors", display:{width:180}},
            {select:"SUM(member_stats.connection_errors)", display:{width:180}},
            {select:"MIN(member_stats.connection_errors)", display:{width:180}},
            {select:"MAX(member_stats.connection_errors)", display:{width:180}},

            {select:"member_stats.reponse_errors", display:{width:180}},
            {select:"SUM(member_stats.reponse_errors)", display:{width:180}},
            {select:"MIN(member_stats.reponse_errors)", display:{width:180}},
            {select:"MAX(member_stats.reponse_errors)", display:{width:180}},
        ],
        "StatTable.NodeStatus.disk_usage_info": [
            {select:"COUNT(disk_usage_info)", display:{width:180}},
            {select:"disk_usage_info.partition_type", display:{width:150}},
            {select:"disk_usage_info.partition_name", display:{width:150}},

            {select:"disk_usage_info.partition_space_used_1k", display:{width:200}},
            {select:"SUM(disk_usage_info.partition_space_used_1k)", display:{width:240}},
            {select:"MIN(disk_usage_info.partition_space_used_1k)", display:{width:240}},
            {select:"MAX(disk_usage_info.partition_space_used_1k)", display:{width:240}},

            {select:"disk_usage_info.partition_space_available_1k", display:{width:260}},
            {select:"SUM(disk_usage_info.partition_space_available_1k)", display:{width:260}},
            {select:"MIN(disk_usage_info.partition_space_available_1k)", display:{width:260}},
            {select:"MAX(disk_usage_info.partition_space_available_1k)", display:{width:260}},
        ],
        "StatTable.UveVMInterfaceAgent.fip_diff_stats": [
            {select:"COUNT(fip_diff_stats)", display:{width:150}},
            {select:"virtual_network", display:{width:150}},
            {select:"fip_diff_stats.other_vn", display:{width:150}},
            {select:"fip_diff_stats.ip_address", display:{width:150}},

            {select:"fip_diff_stats.in_pkts", display:{width:150}},
            {select:"SUM(fip_diff_stats.in_pkts)", display:{width:150}},
            {select:"MIN(fip_diff_stats.in_pkts)", display:{width:150}},
            {select:"MAX(fip_diff_stats.in_pkts)", display:{width:150}},

            {select:"fip_diff_stats.in_pkts", display:{width:150}},
            {select:"SUM(fip_diff_stats.in_bytes)", display:{width:150}},
            {select:"MIN(fip_diff_stats.in_bytes)", display:{width:150}},
            {select:"MAX(fip_diff_stats.in_bytes)", display:{width:150}},

            {select:"fip_diff_stats.out_pkts", display:{width:150}},
            {select:"SUM(fip_diff_stats.out_pkts)", display:{width:150}},
            {select:"MIN(fip_diff_stats.out_pkts)", display:{width:150}},
            {select:"MAX(fip_diff_stats.out_pkts)", display:{width:150}},

            {select:"fip_diff_stats.out_bytes", display:{width:150}},
            {select:"SUM(fip_diff_stats.out_bytes)", display:{width:150}},
            {select:"MIN(fip_diff_stats.out_bytes)", display:{width:150}},
            {select:"MAX(fip_diff_stats.out_bytes)", display:{width:150}},
        ],
        "StatTable.UveVMInterfaceAgent.if_stats" : [
            {select:"COUNT(if_stats)", display:{width:180}},
            {select:"virtual_network", display:{width:150}},
            {select:"if_stats.other_vn", display:{width:150}},
            {select:"if_stats.ip_address", display:{width:150}},

            {select:"if_stats.in_pkts", display:{width:150}},
            {select:"SUM(if_stats.in_pkts)", display:{width:150}},
            {select:"MIN(if_stats.in_pkts)", display:{width:150}},
            {select:"MAX(if_stats.in_pkts)", display:{width:150}},

            {select:"if_stats.in_pkts", display:{width:150}},
            {select:"SUM(if_stats.in_bytes)", display:{width:150}},
            {select:"MIN(if_stats.in_bytes)", display:{width:150}},
            {select:"MAX(if_stats.in_bytes)", display:{width:150}},

            {select:"if_stats.out_pkts", display:{width:150}},
            {select:"SUM(if_stats.out_pkts)", display:{width:150}},
            {select:"MIN(if_stats.out_pkts)", display:{width:150}},
            {select:"MAX(if_stats.out_pkts)", display:{width:150}},

            {select:"if_stats.out_bytes", display:{width:150}},
            {select:"SUM(if_stats.out_bytes)", display:{width:150}},
            {select:"MIN(if_stats.out_bytes)", display:{width:150}},
            {select:"MAX(if_stats.out_bytes)", display:{width:150}},

            {select:"vm_name", display:{width:150}},
            {select:"vm_uuid", display:{width:150}},

            {select:"if_stats.in_bw_usage", display:{width:180}},
            {select:"SUM(if_stats.in_bw_usage)", display:{width:180}},
            {select:"MIN(if_stats.in_bw_usage)", display:{width:180}},
            {select:"MAX(if_stats.in_bw_usage)", display:{width:180}},

            {select:"if_stats.out_bw_usage", display:{width:180}},
            {select:"SUM(if_stats.out_bw_usage)", display:{width:180}},
            {select:"MIN(if_stats.out_bw_usage)", display:{width:180}},
            {select:"MAX(if_stats.out_bw_usage)", display:{width:180}}
        ],

        "StatTable.VrouterStatsAgent.flow_rate" : [
            {select:"COUNT(flow_rate)", display:{width:150}},

            {select:"flow_rate.added_flows", display:{width:170}},
            {select:"SUM(flow_rate.added_flows)", display:{width:170}},
            {select:"MIN(flow_rate.added_flows)", display:{width:170}},
            {select:"MAX(flow_rate.added_flows)", display:{width:170}},

            {select:"flow_rate.deleted_flows", display:{width:170}},
            {select:"SUM(flow_rate.deleted_flows)", display:{width:170}},
            {select:"MIN(flow_rate.deleted_flows)", display:{width:170}},
            {select:"MAX(flow_rate.deleted_flows)", display:{width:170}},

            {select:"flow_rate.max_flow_adds_per_second", display:{width:200}},
            {select:"SUM(flow_rate.max_flow_adds_per_second)", display:{width:220}},
            {select:"MIN(flow_rate.max_flow_adds_per_second)", display:{width:220}},
            {select:"MAX(flow_rate.max_flow_adds_per_second)", display:{width:220}},

            {select:"flow_rate.min_flow_adds_per_second", display:{width:200}},
            {select:"SUM(flow_rate.min_flow_adds_per_second)", display:{width:220}},
            {select:"MIN(flow_rate.min_flow_adds_per_second)", display:{width:220}},
            {select:"MAX(flow_rate.min_flow_adds_per_second)", display:{width:220}},

            {select:"flow_rate.max_flow_deletes_per_second", display:{width:200}},
            {select:"SUM(flow_rate.max_flow_deletes_per_second)", display:{width:220}},
            {select:"MIN(flow_rate.max_flow_deletes_per_second)", display:{width:220}},
            {select:"MAX(flow_rate.max_flow_deletes_per_second)", display:{width:220}},

            {select:"flow_rate.min_flow_deletes_per_second", display:{width:200}},
            {select:"SUM(flow_rate.min_flow_deletes_per_second)", display:{width:220}},
            {select:"MIN(flow_rate.min_flow_deletes_per_second)", display:{width:220}},
            {select:"MAX(flow_rate.min_flow_deletes_per_second)", display:{width:220}},
        ],

        "StatTable.AnalyticsApiStats.api_stats" : [
            {select:"COUNT(api_stats)", display:{width:150}},
            {select:"api_stats.operation_type", display:{width:150}},
            {select:"api_stats.remote_ip", display:{width:100}},
            {select:"api_stats.object_type", display:{width:100}},
            {select:"api_stats.request_url", display:{width:100}},
            {select:"api_stats.node", display:{width:100}},

            {select:"api_stats.response_time_in_usec", display:{width:200}},
            {select:"SUM(api_stats.response_time_in_usec)", display:{width:220}},
            {select:"MIN(api_stats.response_time_in_usec)", display:{width:220}},
            {select:"MAX(api_stats.response_time_in_usec)", display:{width:220}},

            {select:"api_stats.response_size", display:{width:200}},
            {select:"SUM(api_stats.response_size)", display:{width:220}},
            {select:"MIN(api_stats.response_size)", display:{width:220}},
            {select:"MAX(api_stats.response_size)", display:{width:220}}
        ],

        "StatTable.VncApiStatsLog.api_stats" : [
            {select:"COUNT(api_stats)", display:{width:150}},
            {select:"api_stats.operation_type", display:{width:150}},
            {select:"api_stats.user", display:{width:100}},
            {select:"api_stats.useragent", display:{width:100}},
            {select:"api_stats.remote_ip", display:{width:100}},
            {select:"api_stats.domain_name", display:{width:120}},
            {select:"api_stats.project_name", display:{width:100}},
            {select:"api_stats.object_type", display:{width:100}},

            {select:"api_stats.response_time_in_usec", display:{width:200}},
            {select:"SUM(api_stats.response_time_in_usec)", display:{width:220}},
            {select:"MIN(api_stats.response_time_in_usec)", display:{width:220}},
            {select:"MAX(api_stats.response_time_in_usec)", display:{width:220}},

            {select:"api_stats.response_size", display:{width:200}},
            {select:"SUM(api_stats.response_size)", display:{width:220}},
            {select:"MIN(api_stats.response_size)", display:{width:220}},
            {select:"MAX(api_stats.response_size)", display:{width:220}},

            {select:"api_stats.response_code", display:{width:200}},
            {select:"SUM(api_stats.response_code)", display:{width:220}},
            {select:"MIN(api_stats.response_code)", display:{width:220}},
            {select:"MAX(api_stats.response_code)", display:{width:220}}

        ],

        "StatTable.VrouterStatsAgent.phy_if_band" : [
            {select:"COUNT(phy_if_band)", display:{width:150}},
            {select:"phy_if_band.name", display:{width:100}},

            {select:"phy_if_band.in_bandwidth_usage", display:{width:200}},
            {select:"SUM(phy_if_band.in_bandwidth_usage)", display:{width:220}},
            {select:"MIN(phy_if_band.in_bandwidth_usage)", display:{width:220}},
            {select:"MAX(phy_if_band.in_bandwidth_usage)", display:{width:220}},

            {select:"phy_if_band.out_bandwidth_usage", display:{width:200}},
            {select:"SUM(phy_if_band.out_bandwidth_usage)", display:{width:220}},
            {select:"MIN(phy_if_band.out_bandwidth_usage)", display:{width:220}},
            {select:"MAX(phy_if_band.out_bandwidth_usage)", display:{width:220}}
        ],

        "StatTable.PRouterBroadViewInfo.ingressPortPriorityGroup" : [
            {select:"COUNT(ingressPortPriorityGroup)", display:{width:240}},
            {select:"asic_id", display:{width:100}},
            {select:"ingressPortPriorityGroup.port", display:{width:100}},

            {select:"ingressPortPriorityGroup.priorityGroup", display:{width:180}},
            {select:"SUM(ingressPortPriorityGroup.priorityGroup)", display:{width:200}},
            {select:"MIN(ingressPortPriorityGroup.priorityGroup)", display:{width:200}},
            {select:"MAX(ingressPortPriorityGroup.priorityGroup)", display:{width:200}},

            {select:"ingressPortPriorityGroup.umShareBufferCount", display:{width:200}},
            {select:"SUM(ingressPortPriorityGroup.umShareBufferCount)", display:{width:220}},
            {select:"MIN(ingressPortPriorityGroup.umShareBufferCount)", display:{width:220}},
            {select:"MAX(ingressPortPriorityGroup.umShareBufferCount)", display:{width:220}},

            {select:"ingressPortPriorityGroup.umHeadroomBufferCount", display:{width:220}},
            {select:"SUM(ingressPortPriorityGroup.umHeadroomBufferCount)", display:{width:240}},
            {select:"MIN(ingressPortPriorityGroup.umHeadroomBufferCount)", display:{width:240}},
            {select:"MAX(ingressPortPriorityGroup.umHeadroomBufferCount)", display:{width:240}},
        ],

        "StatTable.PRouterBroadViewInfo.ingressPortServicePool" : [
            {select:"COUNT(ingressPortServicePool)", display:{width:220}},
            {select:"asic_id", display:{width:100}},
            {select:"ingressPortServicePool.port", display:{width:100}},

            {select:"ingressPortServicePool.servicePool", display:{width:180}},
            {select:"SUM(ingressPortServicePool.servicePool)", display:{width:200}},
            {select:"MIN(ingressPortServicePool.servicePool)", display:{width:200}},
            {select:"MAX(ingressPortServicePool.servicePool)", display:{width:200}},

            {select:"ingressPortServicePool.umShareBufferCount", display:{width:200}},
            {select:"SUM(ingressPortServicePool.umShareBufferCount)", display:{width:220}},
            {select:"MIN(ingressPortServicePool.umShareBufferCount)", display:{width:220}},
            {select:"MAX(ingressPortServicePool.umShareBufferCount)", display:{width:220}}
        ],

        "StatTable.PRouterBroadViewInfo.ingressServicePool" : [
            {select:"COUNT(ingressServicePool)", display:{width:220}},
            {select:"asic_id", display:{width:100}},
            {select:"ingressServicePool.port", display:{width:100}},

            {select:"ingressServicePool.servicePool", display:{width:180}},
            {select:"SUM(ingressServicePool.servicePool)", display:{width:200}},
            {select:"MIN(ingressServicePool.servicePool)", display:{width:200}},
            {select:"MAX(ingressServicePool.servicePool)", display:{width:200}},

            {select:"ingressServicePool.umShareBufferCount", display:{width:200}},
            {select:"SUM(ingressServicePool.umShareBufferCount)", display:{width:220}},
            {select:"MIN(ingressServicePool.umShareBufferCount)", display:{width:220}},
            {select:"MAX(ingressServicePool.umShareBufferCount)", display:{width:220}}
        ],
        "StatTable.PRouterBroadViewInfo.egressPortServicePool" : [
            {select:"COUNT(egressPortServicePool)", display:{width:220}},
            {select:"asic_id", display:{width:100}},
            {select:"egressPortServicePool.port", display:{width:100}},

            {select:"egressPortServicePool.servicePool", display:{width:180}},
            {select:"SUM(egressPortServicePool.servicePool)", display:{width:200}},
            {select:"MIN(egressPortServicePool.servicePool)", display:{width:200}},
            {select:"MAX(egressPortServicePool.servicePool)", display:{width:200}},

            {select:"egressPortServicePool.ucShareBufferCount", display:{width:180}},
            {select:"SUM(egressPortServicePool.ucShareBufferCount)", display:{width:200}},
            {select:"MIN(egressPortServicePool.ucShareBufferCount)", display:{width:200}},
            {select:"MAX(egressPortServicePool.ucShareBufferCount)", display:{width:200}},

            {select:"egressPortServicePool.umShareBufferCount", display:{width:180}},
            {select:"SUM(egressPortServicePool.umShareBufferCount)", display:{width:200}},
            {select:"MIN(egressPortServicePool.umShareBufferCount)", display:{width:200}},
            {select:"MAX(egressPortServicePool.umShareBufferCount)", display:{width:200}},

            {select:"egressPortServicePool.mcShareBufferCount", display:{width:180}},
            {select:"SUM(egressPortServicePool.mcShareBufferCount)", display:{width:200}},
            {select:"MIN(egressPortServicePool.mcShareBufferCount)", display:{width:200}},
            {select:"MAX(egressPortServicePool.mcShareBufferCount)", display:{width:200}},

            {select:"egressPortServicePool.mcShareQueueEntries", display:{width:200}},
            {select:"SUM(egressPortServicePool.mcShareQueueEntries)", display:{width:220}},
            {select:"MIN(egressPortServicePool.mcShareQueueEntries)", display:{width:220}},
            {select:"MAX(egressPortServicePool.mcShareQueueEntries)", display:{width:220}}
        ],

        "StatTable.PRouterBroadViewInfo.egressServicePool" : [
            {select:"COUNT(egressServicePool)", display:{width:220}},
            {select:"asic_id", display:{width:100}},
            {select:"egressServicePool.port", display:{width:100}},

            {select:"egressServicePool.servicePool", display:{width:180}},
            {select:"SUM(egressServicePool.servicePool)", display:{width:200}},
            {select:"MIN(egressServicePool.servicePool)", display:{width:200}},
            {select:"MAX(egressServicePool.servicePool)", display:{width:200}},

            {select:"egressServicePool.umShareBufferCount", display:{width:180}},
            {select:"SUM(egressServicePool.umShareBufferCount)", display:{width:200}},
            {select:"MIN(egressServicePool.umShareBufferCount)", display:{width:200}},
            {select:"MAX(egressServicePool.umShareBufferCount)", display:{width:200}},

            {select:"egressServicePool.mcShareBufferCount", display:{width:180}},
            {select:"SUM(egressServicePool.mcShareBufferCount)", display:{width:200}},
            {select:"MIN(egressServicePool.mcShareBufferCount)", display:{width:200}},
            {select:"MAX(egressServicePool.mcShareBufferCount)", display:{width:200}},

            {select:"egressServicePool.mcShareQueueEntries", display:{width:200}},
            {select:"SUM(egressServicePool.mcShareQueueEntries)", display:{width:220}},
            {select:"MIN(egressServicePool.mcShareQueueEntries)", display:{width:220}},
            {select:"MAX(egressServicePool.mcShareQueueEntries)", display:{width:220}}
        ],

        "StatTable.PRouterBroadViewInfo.egressUcQueue" : [
            {select:"COUNT(egressUcQueue)", display:{width:220}},
            {select:"asic_id", display:{width:100}},

            {select:"egressUcQueue.queue", display:{width:180}},
            {select:"SUM(egressUcQueue.queue)", display:{width:200}},
            {select:"MIN(egressUcQueue.queue)", display:{width:200}},
            {select:"MAX(egressUcQueue.queue)", display:{width:200}},

            {select:"egressUcQueue.queue", display:{width:180}},
            {select:"SUM(egressUcQueue.ucBufferCount)", display:{width:200}},
            {select:"MIN(egressUcQueue.ucBufferCount)", display:{width:200}},
            {select:"MAX(egressUcQueue.ucBufferCount)", display:{width:200}},
        ],
        "StatTable.PRouterBroadViewInfo.egressUcQueueGroup" : [
            {select:"COUNT(egressUcQueueGroup)", display:{width:220}},
            {select:"asic_id", display:{width:100}},

            {select:"egressUcQueueGroup.queueGroup", display:{width:180}},
            {select:"SUM(egressUcQueueGroup.queueGroup)", display:{width:200}},
            {select:"MIN(egressUcQueueGroup.queueGroup)", display:{width:200}},
            {select:"MAX(egressUcQueueGroup.queueGroup)", display:{width:200}},

            {select:"egressUcQueueGroup.ucBufferCount", display:{width:180}},
            {select:"SUM(egressUcQueueGroup.ucBufferCount)", display:{width:200}},
            {select:"MIN(egressUcQueueGroup.ucBufferCount)", display:{width:200}},
            {select:"MAX(egressUcQueueGroup.ucBufferCount)", display:{width:200}}
        ],
        "StatTable.PRouterBroadViewInfo.egressMcQueue" : [
            {select:"COUNT(egressMcQueue)", display:{width:220}},
            {select:"asic_id", display:{width:100}},

            {select:"egressMcQueue.queue", display:{width:180}},
            {select:"SUM(egressMcQueue.queue)", display:{width:200}},
            {select:"MIN(egressMcQueue.queue)", display:{width:200}},
            {select:"MAX(egressMcQueue.queue)", display:{width:200}},

            {select:"egressMcQueue.mcBufferCount", display:{width:180}},
            {select:"SUM(egressMcQueue.mcBufferCount)", display:{width:200}},
            {select:"MIN(egressMcQueue.mcBufferCount)", display:{width:200}},
            {select:"MAX(egressMcQueue.mcBufferCount)", display:{width:200}},

            {select:"egressMcQueue.mcQueueEntries", display:{width:180}},
            {select:"SUM(egressMcQueue.mcQueueEntries)", display:{width:200}},
            {select:"MIN(egressMcQueue.mcQueueEntries)", display:{width:200}},
            {select:"MAX(egressMcQueue.mcQueueEntries)", display:{width:200}},
        ],
        "StatTable.PRouterBroadViewInfo.egressCpuQueue" : [
            {select:"COUNT(egressCpuQueue)", display:{width:220}},
            {select:"asic_id", display:{width:100}},

            {select:"egressCpuQueue.queue", display:{width:180}},
            {select:"SUM(egressCpuQueue.queue)", display:{width:200}},
            {select:"MIN(egressCpuQueue.queue)", display:{width:200}},
            {select:"MAX(egressCpuQueue.queue)", display:{width:200}},

            {select:"egressCpuQueue.cpuBufferCount", display:{width:180}},
            {select:"SUM(egressCpuQueue.cpuBufferCount)", display:{width:200}},
            {select:"MIN(egressCpuQueue.cpuBufferCount)", display:{width:200}},
            {select:"MAX(egressCpuQueue.cpuBufferCount)", display:{width:200}},
        ],
        "StatTable.PRouterBroadViewInfo.egressRqeQueue" : [
            {select:"COUNT(egressRqeQueue)", display:{width:220}},
            {select:"asic_id", display:{width:100}},

            {select:"egressRqeQueue.queue", display:{width:180}},
            {select:"SUM(egressRqeQueue.queue)", display:{width:200}},
            {select:"MIN(egressRqeQueue.queue)", display:{width:200}},
            {select:"MAX(egressRqeQueue.queue)", display:{width:200}},

            {select:"egressRqeQueue.rqeBufferCount", display:{width:180}},
            {select:"SUM(egressRqeQueue.rqeBufferCount)", display:{width:200}},
            {select:"MIN(egressRqeQueue.rqeBufferCount)", display:{width:200}},
            {select:"MAX(egressRqeQueue.rqeBufferCount)", display:{width:200}},
        ],
        "defaultStatColumns": [
            {select:"T", display:{width:210, filterable:false}},
            {select:"T=", display:{width:210, filterable:false}},
            {select:"UUID", display:{width:150}},
            {select:"name", display:{width:150}},
            {select:"Source", display:{width:70}}
        ],
        "defaultObjectColumns": [
            {select: "MessageTS", display:{ width:210, filterable:false}},
            {select: "ObjectId", display:{width:150, searchable: true, hide: true}},
            {select: "Source", display:{width:150, searchable: true}},
            {select: "ModuleId", display:{width: 200, searchable:true}},
            {select: "Messagetype", display:{width:150, searchable:true}},
            {
                select: "ObjectLog",
                display:{
                    width:300, searchable:true,
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
                    width:300, searchable:true,
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
            {select: "MessageTS", display:{width:210, filterable:false}},
            {select: "Source", display:{width:150, searchable: true}},
            {select: "NodeType", display:{width:100, searchable: true}},
            {select: "ModuleId", display:{width: 200, searchable:true}},
            {select: "Messagetype", display:{width:150, searchable:true}},
            {select: "Keyword", display:{width:150, searchable:true}},
            {select: "Level", display:{width:100, searchable:true, formatter: function(r, c, v, cd, dc) { return qewu.getLevelName4Value(dc.Level); }}},
            {select: "Category", display:{width: 150, searchable:true}},
            {select: "Context", display:{width:150, searchable:true}},
            {
                select: "Xmlmessage",
                display:{
                    width:500, searchable:true,
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
            {select: "InstanceId", display:{width: 150, searchable:true}}
        ],
        init: function() {
            this.SessionAnalyzerTable = this.FlowSeriesTable;
            delete this.init;
            return this;
        }
    }.init();

    return new QEGridConfig();
});

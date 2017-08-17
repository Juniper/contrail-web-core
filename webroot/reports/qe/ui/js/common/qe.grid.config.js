/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    "lodash",
    "core-basedir/reports/qe/ui/js/common/qe.utils"
], function (_, qeUtils) {
    function _getColumnDisplay4Grid(tableName, tableType, selectArray) {
        var columnDisplay = [], defaultColumnDisplayMap = [];

        if(tableType === cowc.QE_STAT_TABLE_TYPE){
            _.forEach(columnDisplayMap.defaultStatColumns, function(value) {
                defaultColumnDisplayMap[value.select] = value.display;
            });
        } else if (tableType === cowc.QE_OBJECT_TABLE_TYPE) {
            _.forEach(columnDisplayMap.defaultObjectColumns, function(value) {
                defaultColumnDisplayMap[value.select] = value.display;
            });
        }

        $.each(selectArray, function(selectKey, selectValue) {
            var columnName = qeUtils.formatNameForGrid(selectValue),
                columnConfig = {
                    id: selectValue, field: selectValue,
                    name: columnName,
                    width: 150,
                    formatter: {
                        format: cowc.QUERY_COLUMN_FORMATTER[selectValue]
                    }
                };

            if(tableType === cowc.QE_STAT_TABLE_TYPE || tableType === cowc.QE_OBJECT_TABLE_TYPE){
                if (contrail.checkIfExist(defaultColumnDisplayMap[selectValue])) {
                    $.extend(columnConfig, defaultColumnDisplayMap[selectValue]);
                }
            }

            if (contrail.checkIfExist(columnDisplayMap[tableName])) {
                _.forEach(columnDisplayMap[tableName], function (fieldValue) {
                    if (fieldValue.select === selectValue) {
                        _.merge(columnConfig, fieldValue.display);
                    }
                });
            }

            columnDisplay.push(columnConfig);
        });

        return columnDisplay;
    }

    var columnDisplayMap  = {
        "FlowSeriesTable": [
            {select:"T", display:{width:210, filterable:false}},
            {select:"T=", display:{id: "T", field: "T", width:210, filterable:false}}, // Data received has key : 'T'
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
            {select:"UuidKey", display:{width:280}},
            {select:"sg_rule_uuid", display:{width:280}},
            {select:"nw_ace_uuid", display:{width:280}},
            {select:"agg-bytes", display:{width:120}},
            {select:"agg-packets", display:{ width:140}},
            {select:"vmi_uuid", display:{width:140}},
            {select:"drop_reason", display:{ width:140}}
            {select:"mirror-id", display:{ width:60}}
            {select:"agg-mir-bytes", display:{width:120}},
            {select:"agg-mir-packets", display:{ width:140}},
            {select:"sec-mirror-id", display:{ width:60}}
            {select:"agg-sec-mir-bytes", display:{width:120}},
            {select:"agg-sec-mir-packets", display:{ width:140}},
        ],
        "StatTable.PRouterEntry.ifStats" : [
            {select:"COUNT(ifStats)", display:{width:120}},
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
        "StatTable.VirtualMachineStats.cpu_stats" : [
            {select:"cpu_stats.cpu_one_min_avg", display:{width:170}},
            {select:"SUM(cpu_stats.cpu_one_min_avg)", display:{width:170}},
            {select:"MAX(cpu_stats.cpu_one_min_avg)", display:{width:170}},
            {select:"MIN(cpu_stats.cpu_one_min_avg)", display:{width:170}},

            {select:"cpu_stats.vm_memory_quota", display:{width:190}},
            {select:"SUM(cpu_stats.vm_memory_quota)", display:{width:190}},
            {select:"MAX(cpu_stats.vm_memory_quota)", display:{width:190}},
            {select:"MIN(cpu_stats.vm_memory_quota)", display:{width:190}},

            {select:"cpu_stats.peak_virt_memory", display:{width:170}},
            {select:"SUM(cpu_stats.peak_virt_memory)", display:{width:170}},
            {select:"MAX(cpu_stats.peak_virt_memory)", display:{width:170}},
            {select:"MIN(cpu_stats.peak_virt_memory)", display:{width:170}}
        ],
        "StatTable.ComputeStoragePool.info_stats" : [],
        "StatTable.ComputeStorageOsd.info_stats" : [],
        "StatTable.ComputeStorageDisk.info_stats" : [
            {select:"info_stats.op_r_latency", display:{width:170}},
            {select:"SUM(info_stats.op_r_latency)", display:{width:170}},
            {select:"MAX(info_stats.op_r_latency)", display:{width:170}},
            {select:"MIN(info_stats.op_r_latency)", display:{width:170}},

            {select:"info_stats.op_w_latency", display:{width:170}},
            {select:"SUM(info_stats.op_w_latency)", display:{width:170}},
            {select:"MAX(info_stats.op_w_latency)", display:{width:170}},
            {select:"MIN(info_stats.op_w_latency)", display:{width:170}}
        ],
        "StatTable.ServerMonitoringInfo.sensor_stats" : [],
        "StatTable.ServerMonitoringInfo.disk_usage_stats" : [],
        "StatTable.ServerMonitoringSummary.network_info_stats" : [
            {select:"COUNT(network_info_stats)", display:{width:170}}
        ],
        "StatTable.ServerMonitoringSummary.resource_info_stats" : [
            {select:"resource_info_stats.mem_usage_mb", display:{width:170}},
            {select:"SUM(resource_info_stats.mem_usage_mb)", display:{width:170}},
            {select:"MIN(resource_info_stats.mem_usage_mb)", display:{width:170}},
            {select:"MAX(resource_info_stats.mem_usage_mb)", display:{width:170}}
        ],
        "StatTable.ServerMonitoringInfo.file_system_view_stats.physical_disks" : [
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
            {select:"MAX(file_system_view_stats.physical_disks.disk_used_percentage)", display:{width:190}}
        ],

        "StatTable.SandeshMessageStat.msg_info" : [
            {select:"msg_info.type", display:{width:210}}
        ],
        "StatTable.GeneratorDbStats.table_info" : [],
        "StatTable.GeneratorDbStats.statistics_table_info" : [
            {select:"statistics_table_info.table_name", display:{width:250}}
        ],
        "StatTable.GeneratorDbStats.errors" : [
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
            {select:"fields.value", display:{width:500}}
        ],
        "StatTable.FieldNames.fieldi" : [],
        "StatTable.QueryPerfInfo.query_stats" : [
            {select:"query_stats.rows", display:{width:120}},

            {select:"query_stats.qid", display:{width:280}},
            {select:"query_stats.where", display:{width:300}},
            {select:"query_stats.select", display:{width:300}},
            {select:"query_stats.post", display:{width:300}},

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

            {select:"vn_stats.in_bytes", display:{width:120}},
            {select:"SUM(vn_stats.in_bytes)", display:{width:120}},
            {select:"MIN(vn_stats.in_bytes)", display:{width:120}},
            {select:"MAX(vn_stats.in_bytes)", display:{width:120}},

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

            {select:"tx_socket_stats.average_bytes", display:{width:180}},
            {select:"SUM(tx_socket_stats.average_bytes)", display:{width:180}},
            {select:"MIN(tx_socket_stats.average_bytes)", display:{width:180}},
            {select:"MAX(tx_socket_stats.average_bytes)", display:{width:180}},

            {select:"tx_socket_stats.blocked_count", display:{width:180}},
            {select:"SUM(tx_socket_stats.blocked_count)", display:{width:180}},
            {select:"MIN(tx_socket_stats.blocked_count)", display:{width:180}},
            {select:"MAX(tx_socket_stats.blocked_count)", display:{width:180}}
        ],
        "StatTable.ProtobufCollectorStats.rx_socket_stats" : [
            {select:"COUNT(rx_socket_stats)", display:{width:200}},
            {select:"rx_socket_stats.blocked_duration", display:{width:180}},
            {select:"rx_socket_stats.average_blocked_duration", display:{width:160}},

            {select:"rx_socket_stats.average_bytes", display:{width:180}},
            {select:"SUM(rx_socket_stats.average_bytes)", display:{width:180}},
            {select:"MIN(rx_socket_stats.average_bytes)", display:{width:180}},
            {select:"MAX(rx_socket_stats.average_bytes)", display:{width:180}},

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

            {select:"rx_message_stats.last_timestamp", display:{width:180}},
            {select:"SUM(rx_message_stats.last_timestamp)", display:{width:180}},
            {select:"MIN(rx_message_stats.last_timestamp)", display:{width:180}},
            {select:"MAX(rx_message_stats.last_timestamp)", display:{width:180}}
        ],

        "StatTable.ProtobufCollectorStats.db_table_info" : [
            {select:"SUM(db_table_info.write_fails)", display:{width:180}},
            {select:"MIN(db_table_info.write_fails)", display:{width:180}},
            {select:"MAX(db_table_info.write_fails)", display:{width:180}}

        ],
        "StatTable.ProtobufCollectorStats.db_statistics_table_info" : [
            {select:"db_statistics_table_info.read_fails", display:{width:180}},
            {select:"SUM(db_statistics_table_info.read_fails)", display:{width:180}},
            {select:"MIN(db_statistics_table_info.read_fails)", display:{width:180}},
            {select:"MAX(db_statistics_table_info.read_fails)", display:{width:180}},

            {select:"db_statistics_table_info.write_fails", display:{width:180}},
            {select:"SUM(db_statistics_table_info.write_fails)", display:{width:180}},
            {select:"MIN(db_statistics_table_info.write_fails)", display:{width:180}},
            {select:"MAX(db_statistics_table_info.write_fails)", display:{width:180}}
        ],
        "StatTable.ProtobufCollectorStats.db_errors" : [
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
            {select:"COUNT(heap_info)", display:{width:120}},
        ],
        "StatTable.npu_mem.stats" : [
            {select:"COUNT(stats)", display:{width:120}}
        ],
        "StatTable.fabric_message.edges.class_stats.transmit_counts" : [
            {select:"COUNT(edges)", display:{width:120}}
        ],
        "StatTable.g_lsp_stats.lsp_records" : [
            {select:"COUNT(lsp_records)", display:{width:120}}
        ],
        "StatTable.UFlowData.flow" : [
            {select:"COUNT(flow)", display:{width:120}}
        ],
        "StatTable.AlarmgenUpdate.o" : [
            {select:"COUNT(o)", display:{width:120}}
        ],
        "StatTable.AlarmgenUpdate.i" : [
            {select:"COUNT(i)", display:{width:120}}
        ],

        "StatTable.AlarmgenStatus.counters" : [
            {select:"COUNT(counters)", display:{width:120}}
        ],

        "StatTable.UveLoadbalancer.virtual_ip_stats" : [
            {select:"COUNT(virtual_ip_stats)", display:{width:170}},
            {select:"virtual_ip_stats.uuid", display:{width:280}},

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

            {select:"virtual_ip_stats.connection_errors", display:{width:180}},
            {select:"SUM(virtual_ip_stats.connection_errors)", display:{width:180}},
            {select:"MIN(virtual_ip_stats.connection_errors)", display:{width:180}},
            {select:"MAX(virtual_ip_stats.connection_errors)", display:{width:180}},

            {select:"virtual_ip_stats.reponse_errors", display:{width:180}},
            {select:"SUM(virtual_ip_stats.reponse_errors)", display:{width:180}},
            {select:"MIN(virtual_ip_stats.reponse_errors)", display:{width:180}},
            {select:"MAX(virtual_ip_stats.reponse_errors)", display:{width:180}}
        ],
        "StatTable.UveLoadbalancer.listener_stats": [
            {select:"COUNT(listener_stats)", display:{width:170}},
            {select:"listener_stats.uuid", display:{width:280}},

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
            {select:"pool_stats.uuid", display:{width:280}},

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

            {select:"pool_stats.connection_errors", display:{width:180}},
            {select:"SUM(pool_stats.connection_errors)", display:{width:180}},
            {select:"MIN(pool_stats.connection_errors)", display:{width:180}},
            {select:"MAX(pool_stats.connection_errors)", display:{width:180}},

            {select:"pool_stats.reponse_errors", display:{width:180}},
            {select:"SUM(pool_stats.reponse_errors)", display:{width:180}},
            {select:"MIN(pool_stats.reponse_errors)", display:{width:180}},
            {select:"MAX(pool_stats.reponse_errors)", display:{width:180}}
        ],
        "StatTable.UveLoadbalancer.member_stats": [
            {select:"COUNT(member_stats)", display:{width:170}},
            {select:"member_stats.uuid", display:{width:280}},

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

            {select:"member_stats.connection_errors", display:{width:180}},
            {select:"SUM(member_stats.connection_errors)", display:{width:180}},
            {select:"MIN(member_stats.connection_errors)", display:{width:180}},
            {select:"MAX(member_stats.connection_errors)", display:{width:180}},

            {select:"member_stats.reponse_errors", display:{width:180}},
            {select:"SUM(member_stats.reponse_errors)", display:{width:180}},
            {select:"MIN(member_stats.reponse_errors)", display:{width:180}},
            {select:"MAX(member_stats.reponse_errors)", display:{width:180}}
        ],
        "StatTable.NodeStatus.disk_usage_info": [
            {select:"COUNT(disk_usage_info)", display:{width:180}},

            {select:"disk_usage_info.partition_space_used_1k", display:{width:200}},
            {select:"SUM(disk_usage_info.partition_space_used_1k)", display:{width:240}},
            {select:"MIN(disk_usage_info.partition_space_used_1k)", display:{width:240}},
            {select:"MAX(disk_usage_info.partition_space_used_1k)", display:{width:240}},

            {select:"disk_usage_info.partition_space_available_1k", display:{width:260}},
            {select:"SUM(disk_usage_info.partition_space_available_1k)", display:{width:260}},
            {select:"MIN(disk_usage_info.partition_space_available_1k)", display:{width:260}},
            {select:"MAX(disk_usage_info.partition_space_available_1k)", display:{width:260}}
        ],
        "StatTable.UveVMInterfaceAgent.fip_diff_stats": [],
        "StatTable.UveVMInterfaceAgent.if_stats" : [
            {select:"COUNT(if_stats)", display:{width:180}},

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
            {select:"MAX(flow_rate.min_flow_deletes_per_second)", display:{width:220}}
        ],

        "StatTable.AnalyticsApiStats.api_stats" : [
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
            {select:"MAX(ingressPortPriorityGroup.umHeadroomBufferCount)", display:{width:240}}
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
            {select:"MAX(egressUcQueue.ucBufferCount)", display:{width:200}}
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
            {select:"MAX(egressMcQueue.mcQueueEntries)", display:{width:200}}
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
            {select:"MAX(egressCpuQueue.cpuBufferCount)", display:{width:200}}
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
            {select:"MAX(egressRqeQueue.rqeBufferCount)", display:{width:200}}
        ],
        "StatTable.CollectorDbStats.cql_stats.errors": [],
        "StatTable.UveVMInterfaceAgent.flow_rate": [],
        "StatTable.CollectorDbStats.cql_stats.stats": [],
        "StatTable.CollectorDbStats.cql_stats": [],
        "StatTable.NodeStatus.process_mem_cpu_usage": [],
        "StatTable.PeerStatsData.rx_update_stats": [],
        "StatTable.VrouterStatsAgent.phy_flow_rate": [],
        "StatTable.NodeStatus.system_mem_usage": [],
        "StatTable.NodeStatus.system_cpu_usage": [],
        "StatTable.CollectorDbStats.table_info": [],
        "StatTable.VrouterStatsAgent.drop_stats": [],
        "StatTable.CassandraStatusData.thread_pool_stats": [],
        "StatTable.VrouterStatsAgent.phy_if_stats": [],
        "StatTable.CollectorDbStats.errors": [],
        "StatTable.ModuleClientState.msg_type_diff": [],
        "StatTable.CassandraStatusData.cassandra_compaction_task": [],
        "StatTable.CollectorDbStats.stats_info": [],
        "StatTable.PeerStatsData.tx_update_stats": [],
        "StatTable.ModuleClientState.tx_msg_diff": [],
        "defaultStatColumns": [
            {select:"T", display:{width:210, filterable:false}},
            {select:"T=", display:{width:210, filterable:false}},
            {select:"Source", display:{width:70}}
        ],
        "defaultObjectColumns": [
            {select: "MessageTS", display:{ width:210, filterable:false}},
            {select: "ObjectId", display:{searchable: true, hide: true}},
            {select: "Source", display:{searchable: true}},
            {select: "ModuleId", display:{width: 200, searchable:true}},
            {select: "Messagetype", display:{width:230, searchable:true}},
            {
                select: "ObjectLog",
                display:{
                    width:300, searchable:true,
                    formatter: {
                        format: [
                            {format: "xml2json", options: {jsonValuePath: "ObjectLogJSON"}},
                            {format: "json2html", options: {jsonValuePath: "ObjectLogJSON", htmlValuePath: "ObjectLogHTML", expandLevel: 0}}
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
                            {format: "xml2json", options: {jsonValuePath: "SystemLogJSON"}},
                            {format: "json2html", options: {jsonValuePath: "SystemLogJSON", htmlValuePath: "SystemLogHTML", expandLevel: 0}}
                        ]
                    },
                    exportConfig: {allow: true, stdFormatter: false}
                }
            }
        ],
        "MessageTable": [
            {select: "MessageTS", display:{width:210, filterable:false}},
            {select: "Source", display:{searchable: true}},
            {select: "NodeType", display:{width:100, searchable: true}},
            {select: "ModuleId", display:{width: 200, searchable:true}},
            {select: "Messagetype", display:{width:230, searchable:true}},
            {select: "Keyword", display:{searchable:true}},
            {select: "Level", display:{width:100, searchable:true, formatter: function(r, c, v, cd, dc) { return qeUtils.getLevelName4Value(dc.Level); }}},
            {select: "Category", display:{searchable:true}},
            {select: "Context", display:{searchable:true}},
            {
                select: "Xmlmessage",
                display:{
                    width:500, searchable:true,
                    formatter: function(r, c, v, cd, dc) {
                        var xmlMessage = [];
                        if (contrail.checkIfExist(dc.Xmlmessage)) {
                            if (!$.isPlainObject(dc.Xmlmessage)) {
                                dc.XmlmessageJSON = cowu.formatXML2JSON(dc.Xmlmessage);

                                xmlMessage = $.map(dc.XmlmessageJSON, function(messageValue) {
                                    return messageValue;
                                });
                                dc.formattedXmlMessage = xmlMessage.join(" ");
                            }
                        }

                        return dc.formattedXmlMessage;
                    },
                    exportConfig: {allow: true, stdFormatter: false}
                }
            },
            {select: "InstanceId", display:{searchable:true}}
        ],
        init: function() {
            this.SessionAnalyzerTable = this.FlowSeriesTable;
            delete this.init;
            return this;
        }
    }.init();

    return {
        getColumnDisplay4Grid: _getColumnDisplay4Grid,

        getColumnDisplay4ChartGroupGrid: function(tableName, tableType, selectArray) {
            var newColumnDisplay = [],
                columnDisplay = _getColumnDisplay4Grid(tableName, tableType, selectArray);

            $.each(columnDisplay, function(columnKey, columnValue){
                if (!qeUtils.isAggregateField(columnValue.id)
                    && columnValue.id !== "T"
                    && columnValue.id !== "T="
                    && columnValue.id !== "UUID"
                    && columnValue.id.indexOf("PERCENTILES(") === -1) {
                    newColumnDisplay.push(columnValue);
                }
            });

            return newColumnDisplay;
        },

        getQueueColumnDisplay: function(viewQueryResultCB) {
            return [
                {
                    id: "fqq-badge",
                    field: "",
                    name: "",
                    resizable: false,
                    sortable: false,
                    width: 30,
                    searchable: false,
                    exportConfig: {allow: false},
                    allowColumnPickable: false,
                    cssClass: "center",
                    formatter: function (r, c, v, cd, dc) {
                        if (dc.status === "completed") {
                            var queryId = dc.queryReqObj.queryId,
                                tabLinkId = cowl.QE_QUERY_QUEUE_RESULT_GRID_TAB_ID + "-" + queryId + "-tab-link",
                                labelIconBadgeClass = "";

                            if ($("#" + tabLinkId).length > 0) {
                                labelIconBadgeClass = "icon-queue-badge-color-" + $("#" + tabLinkId).data("badge_color_key");
                            }

                            return '<span id="label-icon-badge-' + queryId + '" class="label-icon-badge label-icon-badge-queue ' + labelIconBadgeClass + '"><i class="fa fa-square"></i></span>';
                        } else {
                            return "";
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
                        format: "date",
                        options: {formatSpecifier: "llll"}
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
                        format: "query-time-range",
                        path: "queryReqObj.formModelAttrs.time_range"
                    }
                },
                {
                    id:"fromTime", field:"fromTime", name:"From Time", width: 140,
                    formatter: {
                        format: "date",
                        path: "queryReqObj.formModelAttrs.from_time_utc",
                        options: {
                            formatSpecifier: "lll"
                        }
                    }
                },
                {
                    id:"toTime", field:"toTime", name:"To Time", width: 140,
                    formatter: {
                        format: "date",
                        path: "queryReqObj.formModelAttrs.to_time_utc",
                        options: {
                            formatSpecifier: "lll"
                        }
                    }
                },
                {
                    id:"progress", field:"progress", name:"Progress", width:75,
                    formatter: function(r, c, v, cd, dc) {
                        return (dc.status !== "error" && dc.progress !== "" && parseInt(dc.progress) > 0) ? (dc.progress + "%") : "-";
                    }
                },
                { id:"count", field:"count", name:"Records", width:75,
                    formatter: {
                        format: "number"
                    }
                },
                { id:"status", field:"status", name:"Status", width:90 },
                {
                    id:"timeTaken", field:"timeTaken", name:"Time Taken", width:100, sortable:true,
                    formatter: {
                        format:"time-period"
                    }
                }
            ];
        },

        getOnClickFlowRecord: function(parentView, queryFormAttributes) {
            return function (e, selRowDataItem) {
                var elementId = parentView.$el,
                    flowRecordDetailsConfig = {
                        elementId: cowl.QE_FLOW_DETAILS_TAB_VIEW__ID,
                        view: "FlowDetailsTabView",
                        viewPathPrefix: "reports/qe/ui/js/views/",
                        app: cowc.APP_CONTRAIL_CONTROLLER,
                        viewConfig: {
                            className: "modal-980",
                            queryFormAttributes: queryFormAttributes,
                            selectedFlowRecord: selRowDataItem
                        }
                    };

                parentView.renderView4Config(elementId, null, flowRecordDetailsConfig);
            };
        },

        getOnClickSessionAnalyzer: function(clickOutView, queryId, queryFormAttributes) {
            return function (e, targetElement, selRowDataItem) {
                var elementId = $(elementId),
                    saElementId = cowl.QE_SESSION_ANALYZER_VIEW_ID + "-" + queryId + "-" + selRowDataItem.cgrid,
                    sessionAnalyzerConfig = {
                        elementId: saElementId,
                        title: cowl.TITLE_SESSION_ANALYZER,
                        iconClass: "fa fa-bar-chart-o",
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
            };
        },

        setAnalyzerIconFormatter: function() {
            return '<i class="fa fa-external-link-square" title="Analyze Session"></i>';
        },

        getQueryGridConfig: function(remoteConfig, gridColumns, gridOptions) {
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
                        actionCellPosition: contrail.checkIfExist(gridOptions.actionCellPosition) ? gridOptions.actionCellPosition : "end"
                    },
                    dataSource: {
                        remote: {
                            ajaxConfig: remoteConfig,
                            dataParser: function (response) {
                                return response.data;
                            }
                        }
                    },
                    statusMessages: {
                        queued: {
                            type: "status",
                            iconClasses: "",
                            text: cowm.getQueryQueuedMessage(gridOptions.queryQueueUrl, gridOptions.queryQueueTitle)
                        },
                        loading: {
                            text: "Loading Results..",
                        },
                        empty: {
                            text: "No Results Found."
                        }
                    }
                },
                columnHeader: {
                    columns: gridColumns
                }
            };
        }
    };
});

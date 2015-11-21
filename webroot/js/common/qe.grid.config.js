/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var QEGridConfig = function () {
        this.getColumnDisplay4Grid = function(tableName, tableType, selectArray) {
            var newColumnDisplay = [],
                columnDisplay = getColumnDisplay4Query(tableName, tableType);

            $.each(columnDisplay, function(key, val){
                if (selectArray.indexOf(val.select) != -1) {
                    newColumnDisplay.push(val.display);
                }
            });

            return newColumnDisplay;
        };

        this.getColumnDisplay4ChartGroupGrid = function(tableName, tableType, selectArray) {
            var newColumnDisplay = [],
                columnDisplay = getColumnDisplay4Query(tableName, tableType);

            $.each(columnDisplay, function(key, val){
                if (selectArray.indexOf(val.select) != -1 && !qewu.isAggregateField(val.select) && val.select !== 'T' && val.select !== 'T=') {
                    newColumnDisplay.push(val.display);
                }
            });

            return newColumnDisplay;
        };

        this.getQueueColumnDisplay = function() {
            return [
                {
                    id: 'fqq-badge', field: "", name: "", resizable: false, sortable: false,
                    width: 30, minWidth: 30, searchable: false, exportConfig: {allow: false},
                    formatter: function (r, c, v, cd, dc) {
                        var queryId = dc.queryReqObj.queryId,
                            tabLinkId = cowl.QE_FLOW_QUEUE_TAB_ID + '-' + queryId + '-tab-link',
                            labelIconBadgeClass = '';

                        if ($('#' + tabLinkId).length > 0) {
                            labelIconBadgeClass = 'icon-badge-color-' + $('#' + tabLinkId).data('badge_color_key');
                        }

                        return '<span id="label-icon-badge-' + queryId + '" class="label-icon-badge ' + labelIconBadgeClass + '"><i class="icon-sign-blank"></i></span>';
                    },
                },
                { id:"startTime", field:"startTime", name:"Time", minWidth: 150, formatter: function(r, c, v, cd, dc) { return moment(dc.startTime).format('YYYY-MM-DD HH:mm:ss'); } },
                { id:"opsQueryId", field:"opsQueryId", name:"Analytics Query Id", minWidth:200, sortable:false },
                {
                    id:"", field:"", name:"Time Range", minWidth: 100, sortable:false,
                    formatter: function(r, c, v, cd, dc) {
                        return qewu.formatTimeRange(dc.queryReqObj.formModelAttrs.time_range);
                    }
                },
                { id:"engQuery", field:"engQueryStr", name: "Query", minWidth: 400, formatter: function(r, c, v, cd, dc) {
                        if(!contrail.checkIfExist(dc.queryReqObj.engQueryStr)) {
                            return "";
                        }
                        var engQueryObj = JSON.parse(dc.queryReqObj.engQueryStr),
                            engQueryStr = '';

                        $.each(engQueryObj, function(key, val){
                            if(key == 'select' && (!contrail.checkIfExist(val) || val == "")){
                                engQueryStr += '<div class="row-fluid"><span class="bolder">' + key.toUpperCase() + '</span> &nbsp;*</div>';
                            } else if((key == 'where' || key == 'filter') && (!contrail.checkIfExist(val) || val == "")){
                                engQueryStr += '';
                            } else {
                                var formattedKey = key;
                                if(key == 'from_time' || key == 'to_time'){
                                    formattedKey = key.split('_').join(' ');
                                }
                                engQueryStr += '<div class="row-fluid word-break-normal"><span class="bolder">' + formattedKey.toUpperCase() + '</span> &nbsp;' + val + '</div>';
                            }
                        });
                        return engQueryStr;
                    },
                    sortable:false,
                    exportConfig: {
                        allow: true,
                        advFormatter: function(dc) {
                            var engQueryObj = JSON.parse(dc.queryReqObj.engQueryStr),
                                engQueryStr = '';
                            $.each(engQueryObj, function(key, val){
                                if(key == 'select' && (!contrail.checkIfExist(val) || val == "")){
                                    engQueryStr += key.toUpperCase() + ' * ';
                                } else if((key == 'where' || key == 'filter') && (!contrail.checkIfExist(val) || val == "")){
                                    engQueryStr += '';
                                } else {
                                    var formattedKey = key;
                                    if(key == 'from_time' || key == 'to_time'){
                                        formattedKey = key.split('_').join(' ');
                                    }
                                    engQueryStr += formattedKey.toUpperCase() + ' ' + val + ' ';
                                }
                            });
                            return engQueryStr;
                        }
                    }
                },
                { id:"progress", field:"progress", name:"Progress", minWidth:75, formatter: function(r, c, v, cd, dc) { return (dc.status != 'error' && dc.progress != '' && parseInt(dc.progress) > 0) ? (dc.progress + '%') : '-'; } },
                { id:"count", field:"count", name:"Records", minWidth:75 },
                { id:"status", field:"status", name:"Status", minWidth:100 },
                { id:"timeTaken", field:"timeTaken", name:"Time Taken", minWidth:100, sortable:true, formatter: function(r, c, v, cd, dc) { return ((dc.timeTaken == -1) ? '-' : (parseInt(dc.timeTaken) + ' secs')); } }
            ];
        };

        this.getOnClickFlowRecord = function(parentView, queryFormModel) {
            return function (e, selRowDataItem) {
                var elementId = parentView.$el,
                    flowRecordDetailsConfig = {
                        elementId: cowl.QE_FLOW_DETAILS_TAB_VIEW__ID,
                        view: "FlowDetailsTabView",
                        viewPathPrefix: "reports/qe/ui/js/views/",
                        app: cowc.APP_CONTRAIL_CONTROLLER,
                        viewConfig: {
                            className: 'modal-980',
                            queryFormAttributes: queryFormModel.getFormModelAttributes(),
                            selectedFlowRecord: selRowDataItem
                        }
                    };

                parentView.renderView4Config(elementId, null, flowRecordDetailsConfig);
            }
        };
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
            {select:"T", display:{id:"T", field:"T", minWidth:210, name:"Time", formatter: function(r, c, v, cd, dc){ return formatMicroDate(dc.T);}, filterable:false, groupable:false}},
            {select:"T=", display:{id:"T", field:"T", minWidth:210, name:"Time", formatter: function(r, c, v, cd, dc){ return formatMicroDate(dc.T);}, filterable:false, groupable:false}},
            {select:"vrouter", display:{id:"vrouter",field:"vrouter", minWidth:150, name:"Virtual Router", groupable:false, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.vrouter);}}},
            {select:"sourcevn", display:{id:"sourcevn",field:"sourcevn", minWidth:250, name:"Source VN", groupable:false, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.sourcevn);}}},
            {select:"destvn", display:{id:"destvn", field:"destvn", minWidth:250, name:"Destination VN", groupable:false, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.destvn);}}},
            {select:"sourceip", display:{id:"sourceip", field:"sourceip", minWidth:120, name:"Source IP", groupable:false, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.sourceip);}}},
            {select:"destip", display:{id:"destip", field:"destip", minWidth:120, name:"Destination IP", groupable:false, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.destip);}}},
            {select:"sport", display:{id:"sport", field:"sport", minWidth:120, name:"Source Port", groupable:false, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.sport);}}},
            {select:"dport", display:{id:"dport", field:"dport", minWidth:130, name:"Destination Port", groupable:false, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.dport);}}},
            {select:"direction_ing", display:{id:"direction_ing", field:"direction_ing", minWidth:120, name:"Direction", groupable:true, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(getDirName(dc.direction_ing));}}},
            {select:"protocol", display:{id:"protocol", field:"protocol", minWidth:100, name:"Protocol", groupable:true, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(getProtocolName(dc.protocol));}}},
            {select:"bytes", display:{id:"bytes", field:"bytes", minWidth:120, name:"Bytes", groupable:false}},
            {select:"sum(bytes)", display:{id:"sum(bytes)", field:"sum(bytes)", minWidth:100, name:"SUM (Bytes)", groupable:false}},
            {select:"avg(bytes)", display:{id:"avg(bytes)", field:"avg(bytes)", minWidth:100, name:"AVG (Bytes)", groupable:false}},
            {select:"packets", display:{id:"packets", field:"packets", minWidth:100, name:"Packets", groupable:false}},
            {select:"sum(packets)", display:{id:"sum(packets)", field:"sum(packets)", minWidth:100, name:"SUM (Packets)", groupable:false}},
            {select:"avg(packets)", display:{id:"avg(packets)", field:"avg(packets)", minWidth:100, name:"AVG (Packets)", groupable:false}}
        ],
        "FlowRecordTable": [
            {select:"action", display:{id:"action", field:"action", minWidth:90, name:"Action", groupable:true}},
            {select:"setup_time", display:{id:"setup_time", field:"setup_time", minWidth:180, name:"Setup Time", formatter: function(r, c, v, cd, dc){ return formatMicroDate(dc.setup_time); }, filterable:false, groupable:false}},
            {select:"teardown_time", display:{id:"teardown_time", field:"teardown_time", minWidth:180, name:"Teardown Time", formatter: function(r, c, v, cd, dc){ return formatMicroDate(dc.teardown_time); }, filterable:false, groupable:false}},
            {select:"vrouter", display:{id:"vrouter", field:"vrouter", minWidth:150, name:"Virtual Router", groupable:false, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.vrouter);}}},
            {select:"vrouter_ip", display:{id:"vrouter_ip", field:"vrouter_ip", minWidth:120, name:"Virtual Router IP", groupable:true, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.vrouter_ip);}}},
            {select:"other_vrouter_ip", display:{id:"other_vrouter_ip", field:"other_vrouter_ip", minWidth:120, name:"Other Virtual Router IP", groupable:true, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.other_vrouter_ip);}}},
            {select:"sourcevn", display:{id:"sourcevn", field:"sourcevn", minWidth:250, name:"Source VN", groupable:true, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.sourcevn);}}},
            {select:"destvn", display:{id:"destvn", field:"destvn", minWidth:250, name:"Destination VN", groupable:true, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.destvn);}}},
            {select:"sourceip", display:{id:"sourceip", field:"sourceip", minWidth:120, name:"Source IP", groupable:true, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.sourceip);}}},
            {select:"destip", display:{id:"destip", field:"destip", minWidth:120, name:"Destination IP", groupable:true, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.destip);}}},
            {select:"sport", display:{id:"sport", field:"sport", minWidth:120, name:"Source Port", groupable:true, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.sport);}}},
            {select:"dport", display:{id:"dport", field:"dport", minWidth:120, name:"Destination Port", groupable:true, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.dport);}}},
            {select:"direction_ing", display:{id:"direction_ing", field:"direction_ing", minWidth:120, name:"Direction", groupable:true, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(getDirName(dc.direction_ing));}}},
            {select:"protocol", display:{id:"protocol", field:"protocol", minWidth:120, name:"Protocol", groupable:true, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(getProtocolName(dc.protocol));}}},
            {select:"underlay_proto", display:{id:"underlay_proto", field:"underlay_proto", minWidth:120, name:"Underlay Protocol", groupable:true, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.underlay_proto);}}},
            {select:"underlay_source_port", display:{id:"underlay_source_port", field:"underlay_source_port", minWidth:120, name:"Underlay Source Port", groupable:true, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.underlay_source_port);}}},
            {select:"UuidKey", display:{id:"UuidKey", field:"UuidKey", minWidth:280, name:"UUID", groupable:true, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.UuidKey);}}},
            {select:"sg_rule_uuid", display:{id:"sg_rule_uuid", field:"sg_rule_uuid", minWidth:280, name:"Rule UUID", groupable:true, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.sg_rule_uuid);}}},
            {select:"nw_ace_uuid", display:{id:"nw_ace_uuid", field:"nw_ace_uuid", minWidth:280, name:"Network UUID", groupable:true, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.nw_ace_uuid);}}},
            {select:"agg-bytes", display:{id:"agg-bytes", field:"agg-bytes", minWidth:120, name:"Aggregate Bytes",  groupable:false}},
            {select:"agg-packets", display:{id:"agg-packets", field:"agg-packets", minWidth:120, name:"Aggregate Packets",  groupable:false}}
        ],
        "FlowClass":[
            {select:"sourcevn", display:{id:"sourcevn", field:"sourcevn", name:"Source VN", minWidth: 250, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.sourcevn);}}},
            {select:"destvn", display:{id:"destvn", field:"destvn", name:"Destination VN", minWidth: 250, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.destvn);}}},
            {select:"sourceip", display:{id:"sourceip", field:"sourceip", name:"Source IP", minWidth: 120, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.sourceip);}}},
            {select:"destip", display:{id:"destip", field:"destip", name:"Destination IP", minWidth: 120, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.destip);}}},
            {select:"sport", display:{id:"sport", field:"sport", name:"Source Port", minWidth: 80, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.sport);}}},
            {select:"dport", display:{id:"dport", field:"dport", name:"Destination Port", minWidth: 80, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(dc.dport);}}},
            {select:"protocol", display:{id:"protocol", field:"protocol", name:"Protocol", minWidth: 80, formatter: function(r, c, v, cd, dc){ return handleNull4Grid(getProtocolName(dc.protocol));}}}
        ],
        "StatTable.AnalyticsCpuState.cpu_info" : [
            {select:"cpu_info.module_id", display:{id:'cpu_info.module_id', field:'cpu_info.module_id', minWidth:150, name:"Module Id", groupable:false}},
            {select:"cpu_info.inst_id", display:{id:'cpu_info.inst_id', field:'cpu_info.inst_id', minWidth:150, name:"Instance Id", groupable:false}},
            {select:"COUNT(cpu_info)", display:{id:'COUNT(cpu_info)', field:'COUNT(cpu_info)', minWidth:120, name:"Count (CPU Info)", groupable:false}},

            {select:"cpu_info.mem_virt", display:{id:'cpu_info.mem_virt', field:'cpu_info.mem_virt', minWidth:150, name:"Virtual Memory", groupable:false}},
            {select:"SUM(cpu_info.mem_virt)", display:{id:'SUM(cpu_info.mem_virt)', field:'SUM(cpu_info.mem_virt)', minWidth:150, name:"SUM (Virtual Memory)", groupable:false}},
            {select:"MIN(cpu_info.mem_virt)", display:{id:'MIN(cpu_info.mem_virt)', field:'MIN(cpu_info.mem_virt)', minWidth:150, name:"MIN (Virtual Memory)", groupable:false}},
            {select:"MAX(cpu_info.mem_virt)", display:{id:'MAX(cpu_info.mem_virt)', field:'MAX(cpu_info.mem_virt)', minWidth:150, name:"MAX (Virtual Memory)", groupable:false}},

            {select:"cpu_info.cpu_share", display:{id:'cpu_info.cpu_share', field:'cpu_info.cpu_share', minWidth:120, name:"CPU Share", groupable:false}},
            {select:"SUM(cpu_info.cpu_share)", display:{id:'SUM(cpu_info.cpu_share)', field:'SUM(cpu_info.cpu_share)', minWidth:150, name:"SUM (CPU Share)", groupable:false}},
            {select:"MIN(cpu_info.cpu_share)", display:{id:'MIN(cpu_info.cpu_share)', field:'MIN(cpu_info.cpu_share)', minWidth:150, name:"MIN (CPU Share)", groupable:false}},
            {select:"MAX(cpu_info.cpu_share)", display:{id:'MAX(cpu_info.cpu_share)', field:'MAX(cpu_info.cpu_share)', minWidth:150, name:"MAX (CPU Share)", groupable:false}}
        ],
        "StatTable.ConfigCpuState.cpu_info" : [
            {select:"cpu_info.module_id", display:{id:'cpu_info.module_id', field:'cpu_info.module_id', minWidth:150, name:"Module Id", groupable:false}},
            {select:"cpu_info.inst_id", display:{id:'cpu_info.inst_id', field:'cpu_info.inst_id', minWidth:150, name:"Instance Id", groupable:false}},
            {select:"COUNT(cpu_info)", display:{id:'COUNT(cpu_info)', field:'COUNT(cpu_info)', minWidth:120, name:"Count (CPU Info)", groupable:false}},
            {select:"cpu_info.mem_virt", display:{id:'cpu_info.mem_virt', field:'cpu_info.mem_virt', minWidth:150, name:"Virtual Memory", groupable:false}},
            {select:"SUM(cpu_info.mem_virt)", display:{id:'SUM(cpu_info.mem_virt)', field:'SUM(cpu_info.mem_virt)', minWidth:150, name:"SUM (Virtual Memory)", groupable:false}},
            {select:"MIN(cpu_info.mem_virt)", display:{id:'MIN(cpu_info.mem_virt)', field:'MIN(cpu_info.mem_virt)', minWidth:150, name:"MIN (Virtual Memory)", groupable:false}},
            {select:"MAX(cpu_info.mem_virt)", display:{id:'MAX(cpu_info.mem_virt)', field:'MAX(cpu_info.mem_virt)', minWidth:150, name:"MAX (Virtual Memory)", groupable:false}},

            {select:"cpu_info.cpu_share", display:{id:'cpu_info.cpu_share', field:'cpu_info.cpu_share', minWidth:150, name:"CPU Share", groupable:false}},
            {select:"SUM(cpu_info.cpu_share)", display:{id:'SUM(cpu_info.cpu_share)', field:'SUM(cpu_info.cpu_share)', minWidth:150, name:"SUM (CPU Share)", groupable:false}},
            {select:"MIN(cpu_info.cpu_share)", display:{id:'MIN(cpu_info.cpu_share)', field:'MIN(cpu_info.cpu_share)', minWidth:150, name:"MIN (CPU Share)", groupable:false}},
            {select:"MAX(cpu_info.cpu_share)", display:{id:'MAX(cpu_info.cpu_share)', field:'MAX(cpu_info.cpu_share)', minWidth:150, name:"MAX (CPU Share)", groupable:false}}
        ],
        "StatTable.ControlCpuState.cpu_info" : [
            {select:"COUNT(cpu_info)", display:{id:'COUNT(cpu_info)', field:'COUNT(cpu_info)', minWidth:120, name:"Count (CPU Info)", groupable:false}},
            {select:"cpu_info.mem_virt", display:{id:'cpu_info.mem_virt', field:'cpu_info.mem_virt', minWidth:120, name:"Virtual Memory", groupable:false}},
            {select:"SUM(cpu_info.mem_virt)", display:{id:'SUM(cpu_info.mem_virt)', field:'SUM(cpu_info.mem_virt)', minWidth:150, name:"SUM (Virtual Memory)", groupable:false}},
            {select:"MIN(cpu_info.mem_virt)", display:{id:'MIN(cpu_info.mem_virt)', field:'MIN(cpu_info.mem_virt)', minWidth:150, name:"MIN (Virtual Memory)", groupable:false}},
            {select:"MAX(cpu_info.mem_virt)", display:{id:'MAX(cpu_info.mem_virt)', field:'MAX(cpu_info.mem_virt)', minWidth:150, name:"MAX (Virtual Memory)", groupable:false}},

            {select:"cpu_info.cpu_share", display:{id:'cpu_info.cpu_share', field:'cpu_info.cpu_share', minWidth:120, name:"CPU Share", groupable:false}},
            {select:"SUM(cpu_info.cpu_share)", display:{id:'SUM(cpu_info.cpu_share)', field:'SUM(cpu_info.cpu_share)', minWidth:120, name:"SUM (CPU Share)", groupable:false}},
            {select:"MIN(cpu_info.cpu_share)", display:{id:'MIN(cpu_info.cpu_share)', field:'MIN(cpu_info.cpu_share)', minWidth:120, name:"MIN (CPU Share)", groupable:false}},
            {select:"MAX(cpu_info.cpu_share)", display:{id:'MAX(cpu_info.cpu_share)', field:'MAX(cpu_info.cpu_share)', minWidth:120, name:"MAX (CPU Share)", groupable:false}},
            {select:"cpu_info.inst_id", display:{id:'cpu_info.inst_id', field:'cpu_info.inst_id', minWidth:120, name:"Instance Id", groupable:false}},
            {select:"cpu_info.module_id", display:{id:'cpu_info.module_id', field:'cpu_info.module_id', minWidth:150, name:"Module Id", groupable:false}}

        ],
        "StatTable.PRouterEntry.ifStats" : [
            {select:"COUNT(ifStats)", display:{id:'COUNT(ifStats)', field:'COUNT(Stats)', minWidth:120, name:"Count (Intf Stats)", groupable:false}},
            {select:"ifStats.ifInUcastPkts", display:{id:'ifStats.ifInUcastPkts', field:'ifStats.ifInUcastPkts', minWidth:120, name:"In Unicast Pkts", groupable:false}},
            {select:"SUM(ifStats.ifInUcastPkts)", display:{id:'SUM(ifStats.ifInUcastPkts)', field:'SUM(ifStats.ifInUcastPkts)', minWidth:160, name:"SUM (In Unicast Pkts)", groupable:false}},
            {select:"MAX(ifStats.ifInUcastPkts)", display:{id:'MAX(ifStats.ifInUcastPkts)', field:'MAX(ifStats.ifInUcastPkts)', minWidth:160, name:"MAX (In Unicast Pkts)", groupable:false}},
            {select:"MIN(ifStats.ifInUcastPkts)", display:{id:'MIN(ifStats.ifInUcastPkts)', field:'MIN(ifStats.ifInUcastPkts)', minWidth:160, name:"MIN (In Unicast Pkts)", groupable:false}},

            {select:"ifStats.ifInMulticastPkts", display:{id:'ifStats.ifInMulticastPkts', field:'ifStats.ifInMulticastPkts', minWidth:120, name:"In Multicast Pkts", groupable:false}},
            {select:"SUM(ifStats.ifInMulticastPkts)", display:{id:'SUM(ifStats.ifInMulticastPkts)', field:'SUM(ifStats.ifInMulticastPkts)', minWidth:160, name:"SUM (In Unicast Pkts)", groupable:false}},
            {select:"MAX(ifStats.ifInMulticastPkts)", display:{id:'MAX(ifStats.ifInMulticastPkts)', field:'MAX(ifStats.ifInMulticastPkts)', minWidth:160, name:"MAX (In Unicast Pkts)", groupable:false}},
            {select:"MIN(ifStats.ifInMulticastPkts)", display:{id:'MIN(ifStats.ifInMulticastPkts)', field:'MIN(ifStats.ifInMulticastPkts)', minWidth:160, name:"MIN (In Unicast Pkts)", groupable:false}},

            {select:"ifStats.ifInBroadcastPkts", display:{id:'ifStats.ifInBroadcastPkts', field:'ifStats.ifInBroadcastPkts', minWidth:120, name:"In Broadcast Pkts", groupable:false}},
            {select:"SUM(ifStats.ifInBroadcastPkts)", display:{id:'SUM(ifStats.ifInBroadcastPkts)', field:'SUM(ifStats.ifInBroadcastPkts)', minWidth:160, name:"SUM (In Broadcast Pkts)", groupable:false}},
            {select:"MAX(ifStats.ifInBroadcastPkts)", display:{id:'MAX(ifStats.ifInBroadcastPkts)', field:'MAX(ifStats.ifInBroadcastPkts)', minWidth:160, name:"MAX (In Broadcast Pkts)", groupable:false}},
            {select:"MIN(ifStats.ifInBroadcastPkts)", display:{id:'MIN(ifStats.ifInBroadcastPkts)', field:'MIN(ifStats.ifInBroadcastPkts)', minWidth:160, name:"MIN (In Broadcast Pkts)", groupable:false}},

            {select:"ifStats.ifInDiscards", display:{id:'ifStats.ifInDiscards', field:'ifStats.ifInDiscards', minWidth:120, name:"Intf In Discards", groupable:false}},
            {select:"SUM(ifStats.ifInDiscards)", display:{id:'SUM(ifStats.ifInDiscards)', field:'SUM(ifStats.ifInDiscards)', minWidth:160, name:"SUM (Intf In Discards)", groupable:false}},
            {select:"MAX(ifStats.ifInDiscards)", display:{id:'MAX(ifStats.ifInDiscards)', field:'MAX(ifStats.ifInDiscards)', minWidth:160, name:"MAX (Intf In Discards)", groupable:false}},
            {select:"MIN(ifStats.ifInDiscards)", display:{id:'MIN(ifStats.ifInDiscards)', field:'MIN(ifStats.ifInDiscards)', minWidth:160, name:"MIN (Intf In Discards)", groupable:false}},

            {select:"ifStats.ifInErrors", display:{id:'ifStats.ifInErrors', field:'ifStats.ifInErrors', minWidth:120, name:"Intf In Errors", groupable:false}},
            {select:"SUM(ifStats.ifInErrors)", display:{id:'SUM(ifStats.ifInErrors)', field:'SUM(ifStats.ifInErrors)', minWidth:160, name:"SUM (Intf In Errors)", groupable:false}},
            {select:"MAX(ifStats.ifInErrors)", display:{id:'MAX(ifStats.ifInErrors)', field:'MAX(ifStats.ifInErrors)', minWidth:160, name:"MAX (Intf In Errors)", groupable:false}},
            {select:"MIN(ifStats.ifInErrors)", display:{id:'MIN(ifStats.ifInErrors)', field:'MIN(ifStats.ifInErrors)', minWidth:160, name:"MIN (Intf In Errors)", groupable:false}},

            {select:"ifStats.ifOutUcastPkts", display:{id:'ifStats.ifOutUcastPkts', field:'ifStats.ifOutUcastPkts', minWidth:120, name:"Out Unicast Pkts", groupable:false}},
            {select:"SUM(ifStats.ifOutUcastPkts)", display:{id:'SUM(ifStats.ifOutUcastPkts)', field:'SUM(ifStats.ifOutUcastPkts)', minWidth:160, name:"SUM (Out Unicast Pkts)", groupable:false}},
            {select:"MAX(ifStats.ifOutUcastPkts)", display:{id:'MAX(ifStats.ifOutUcastPkts)', field:'MAX(ifStats.ifOutUcastPkts)', minWidth:160, name:"MAX (Out Unicast Pkts)", groupable:false}},
            {select:"MIN(ifStats.ifOutUcastPkts)", display:{id:'MIN(ifStats.ifOutUcastPkts)', field:'MIN(ifStats.ifOutUcastPkts)', minWidth:160, name:"MIN (Out Unicast Pkts)", groupable:false}},

            {select:"ifStats.ifOutMulticastPkts", display:{id:'ifStats.ifOutMulticastPkts', field:'ifStats.ifOutMulticastPkts', minWidth:120, name:"Out Multicast Pkts", groupable:false}},
            {select:"SUM(ifStats.ifOutMulticastPkts)", display:{id:'SUM(ifStats.ifOutMulticastPkts)', field:'SUM(ifStats.ifOutMulticastPkts)', minWidth:160, name:"SUM (Out Multicast Pkts)", groupable:false}},
            {select:"MAX(ifStats.ifOutMulticastPkts)", display:{id:'MAX(ifStats.ifOutMulticastPkts)', field:'MAX(ifStats.ifOutMulticastPkts)', minWidth:160, name:"MAX (Out Multicast Pkts)", groupable:false}},
            {select:"MIN(ifStats.ifOutMulticastPkts)", display:{id:'MIN(ifStats.ifOutMulticastPkts)', field:'MIN(ifStats.ifOutMulticastPkts)', minWidth:160, name:"MIN (Out Multicast Pkts)", groupable:false}},

            {select:"ifStats.ifOutBroadcastPkts", display:{id:'ifStats.ifOutBroadcastPkts', field:'ifStats.ifOutBroadcastPkts', minWidth:120, name:"Out Broadcast Pkts", groupable:false}},
            {select:"SUM(ifStats.ifOutBroadcastPkts)", display:{id:'SUM(ifStats.ifOutBroadcastPkts)', field:'SUM(ifStats.ifOutBroadcastPkts)', minWidth:160, name:"SUM (Out Broadcast Pkts)", groupable:false}},
            {select:"MAX(ifStats.ifOutBroadcastPkts)", display:{id:'MAX(ifStats.ifOutBroadcastPkts)', field:'MAX(ifStats.ifOutBroadcastPkts)', minWidth:160, name:"MAX (Out Broadcast Pkts)", groupable:false}},
            {select:"MIN(ifStats.ifOutBroadcastPkts)", display:{id:'MIN(ifStats.ifOutBroadcastPkts)', field:'MIN(ifStats.ifOutBroadcastPkts)', minWidth:160, name:"MIN (Out Broadcast Pkts)", groupable:false}},

            {select:"ifStats.ifOutDiscards", display:{id:'ifStats.ifOutDiscards', field:'ifStats.ifOutDiscards', minWidth:120, name:"Intf Out Discards", groupable:false}},
            {select:"SUM(ifStats.ifOutDiscards)", display:{id:'SUM(ifStats.ifOutDiscards)', field:'SUM(ifStats.ifOutDiscards)', minWidth:160, name:"SUM (Intf Out Discards)", groupable:false}},
            {select:"MAX(ifStats.ifOutDiscards)", display:{id:'MAX(ifStats.ifOutDiscards)', field:'MAX(ifStats.ifOutDiscards)', minWidth:160, name:"MAX (Intf Out Discards)", groupable:false}},
            {select:"MIN(ifStats.ifOutDiscards)", display:{id:'MIN(ifStats.ifOutDiscards)', field:'MIN(ifStats.ifOutDiscards)', minWidth:160, name:"MIN (Intf Out Discards)", groupable:false}},

            {select:"ifStats.ifOutErrors", display:{id:'ifStats.ifOutErrors', field:'ifStats.ifOutErrors', minWidth:120, name:"Intf Out Errors", groupable:false}},
            {select:"SUM(ifStats.ifOutErrors)", display:{id:'SUM(ifStats.ifOutErrors)', field:'SUM(ifStats.ifOutErrors)', minWidth:160, name:"SUM (Intf Out Errors)", groupable:false}},
            {select:"MAX(ifStats.ifOutErrors)", display:{id:'MAX(ifStats.ifOutErrors)', field:'MAX(ifStats.ifOutErrors)', minWidth:160, name:"MAX (Intf Out Errors)", groupable:false}},
            {select:"MIN(ifStats.ifOutErrors)", display:{id:'MIN(ifStats.ifOutErrors)', field:'MIN(ifStats.ifOutErrors)', minWidth:160, name:"MIN (Intf Out Errors)", groupable:false}},

            {select:"ifStats.ifIndex", display:{id:'ifStats.ifIndex', field:'ifStats.ifIndex', minWidth:120, name:"Intf Index", groupable:false}},
            {select:"SUM(ifStats.ifIndex)", display:{id:'SUM(ifStats.ifIndex)', field:'SUM(ifStats.ifIndex)', minWidth:160, name:"SUM (Intf Index)", groupable:false}},
            {select:"MAX(ifStats.ifIndex)", display:{id:'MAX(ifStats.ifIndex)', field:'MAX(ifStats.ifIndex)', minWidth:160, name:"MAX (Intf Index)", groupable:false}},
            {select:"MIN(ifStats.ifIndex)", display:{id:'MIN(ifStats.ifIndex)', field:'MIN(ifStats.ifIndex)', minWidth:160, name:"MIN (Intf Index)", groupable:false}}
        ],
        "StatTable.ComputeCpuState.cpu_info" : [
            {select:"COUNT(cpu_info)", display:{id:'COUNT(cpu_info)', field:'COUNT(cpu_info)', minWidth:120, name:"Count (CPU Info)", groupable:false}},

            {select:"cpu_info.mem_virt", display:{id:'cpu_info.mem_virt', field:'cpu_info.mem_virt', minWidth:160, name:"Virtual Memory", groupable:false}},
            {select:"SUM(cpu_info.mem_virt)", display:{id:'SUM(cpu_info.mem_virt)', field:'SUM(cpu_info.mem_virt)', minWidth:160, name:"SUM (Virtual Memory)", groupable:false}},
            {select:"MAX(cpu_info.mem_virt)", display:{id:'MAX(cpu_info.mem_virt)', field:'MAX(cpu_info.mem_virt)', minWidth:160, name:"MAX (Virtual Memory)", groupable:false}},
            {select:"MIN(cpu_info.mem_virt)", display:{id:'MIN(cpu_info.mem_virt)', field:'MIN(cpu_info.mem_virt)', minWidth:160, name:"MIN (Virtual Memory)", groupable:false}},

            {select:"cpu_info.cpu_share", display:{id:'cpu_info.cpu_share', field:'cpu_info.cpu_share', minWidth:160, name:"CPU Share", groupable:false}},
            {select:"SUM(cpu_info.cpu_share)", display:{id:'SUM(cpu_info.cpu_share)', field:'SUM(cpu_info.cpu_share)', minWidth:160, name:"SUM (CPU Share)", groupable:false}},
            {select:"MAX(cpu_info.cpu_share)", display:{id:'MAX(cpu_info.cpu_share)', field:'MAX(cpu_info.cpu_share)', minWidth:160, name:"MAX (CPU Share)", groupable:false}},
            {select:"MIN(cpu_info.cpu_share)", display:{id:'MIN(cpu_info.cpu_share)', field:'MIN(cpu_info.cpu_share)', minWidth:160, name:"MIN (CPU Share)", groupable:false}},


            {select:"cpu_info.used_sys_mem", display:{id:'cpu_info.used_sys_mem', field:'cpu_info.used_sys_mem', minWidth:160, name:"CPU Sys Memory Used", groupable:false}},
            {select:"SUM(cpu_info.used_sys_mem)", display:{id:'SUM(cpu_info.used_sys_mem)', field:'SUM(cpu_info.used_sys_mem)', minWidth:160, name:"SUM (CPU Sys Memory Used)", groupable:false}},
            {select:"MAX(cpu_info.used_sys_mem)", display:{id:'MAX(cpu_info.used_sys_mem)', field:'MAX(cpu_info.used_sys_mem)', minWidth:160, name:"MAX (CPU Sys Memory Used)", groupable:false}},
            {select:"MIN(cpu_info.used_sys_mem)", display:{id:'MIN(cpu_info.used_sys_mem)', field:'MIN(cpu_info.used_sys_mem)', minWidth:160, name:"MIN (CPU Sys Memory Used)", groupable:false}},

            {select:"cpu_info.one_min_cpuload", display:{id:'cpu_info.one_min_cpuload', field:'cpu_info.one_min_cpuload', minWidth:160, name:"CPU 1 Min Load", groupable:false}},
            {select:"SUM(cpu_info.one_min_cpuload)", display:{id:'SUM(cpu_info.one_min_cpuload)', field:'SUM(cpu_info.one_min_cpuload)', minWidth:160, name:"SUM (CPU 1 Min Load)", groupable:false}},
            {select:"MAX(cpu_info.one_min_cpuload)", display:{id:'MAX(cpu_info.one_min_cpuload)', field:'MAX(cpu_info.one_min_cpuload)', minWidth:160, name:"MAX (CPU 1 Min Load)", groupable:false}},
            {select:"MIN(cpu_info.one_min_cpuload)", display:{id:'MIN(cpu_info.one_min_cpuload)', field:'MIN(cpu_info.one_min_cpuload)', minWidth:160, name:"MIN (CPU 1 Min Load)", groupable:false}}
        ],
        "StatTable.VirtualMachineStats.cpu_stats" : [
            {select:"COUNT(cpu_stats)", display:{id:'COUNT(cpu_stats)', field:'COUNT(cpu_stats)', minWidth:120, name:"Count (CPU Stats)", groupable:false}},

            {select:"cpu_stats.cpu_one_min_avg", display:{id:'cpu_stats.cpu_one_min_avg', field:'cpu_stats.cpu_one_min_avg', minWidth:150, name:"Cpu One Min Avg", groupable:false}},
            {select:"SUM(cpu_stats.cpu_one_min_avg)", display:{id:'SUM(cpu_stats.cpu_one_min_avg)', field:'SUM(cpu_stats.cpu_one_min_avg)', minWidth:150, name:"SUM (Cpu One Min Avg)", groupable:false}},
            {select:"MAX(cpu_stats.cpu_one_min_avg)", display:{id:'MAX(cpu_stats.cpu_one_min_avg)', field:'MAX(cpu_stats.cpu_one_min_avg)', minWidth:150, name:"MAX (Cpu One Min Avg)", groupable:false}},
            {select:"MIN(cpu_stats.cpu_one_min_avg)", display:{id:'MIN(cpu_stats.cpu_one_min_avg)', field:'MIN(cpu_stats.cpu_one_min_avg)', minWidth:150, name:"MIN (Cpu One Min Avg)", groupable:false}},

            {select:"cpu_stats.vm_memory_quota", display:{id:'cpu_stats.vm_memory_quota', field:'cpu_stats.vm_memory_quota', minWidth:150, name:"Vm Memory Quota", groupable:false}},
            {select:"SUM(cpu_stats.vm_memory_quota)", display:{id:'SUM(cpu_stats.vm_memory_quota)', field:'SUM(cpu_stats.vm_memory_quota)', minWidth:150, name:"SUM (Vm Memory Quota)", groupable:false}},
            {select:"MAX(cpu_stats.vm_memory_quota)", display:{id:'MAX(cpu_stats.vm_memory_quota)', field:'MAX(cpu_stats.vm_memory_quota)', minWidth:150, name:"MAX (Vm Memory Quota)", groupable:false}},
            {select:"MIN(cpu_stats.vm_memory_quota)", display:{id:'MIN(cpu_stats.vm_memory_quota)', field:'MIN(cpu_stats.vm_memory_quota)', minWidth:150, name:"MIN (Vm Memory Quota)", groupable:false}},

            {select:"cpu_stats.rss", display:{id:'cpu_stats.rss', field:'cpu_stats.rss', minWidth:150, name:"Rss", groupable:false}},
            {select:"SUM(cpu_stats.rss)", display:{id:'SUM(cpu_stats.rss)', field:'SUM(cpu_stats.rss)', minWidth:150, name:"SUM (Rss)", groupable:false}},
            {select:"MAX(cpu_stats.rss)", display:{id:'MAX(cpu_stats.rss)', field:'MAX(cpu_stats.rss)', minWidth:150, name:"MAX (Rss)", groupable:false}},
            {select:"MIN(cpu_stats.rss)", display:{id:'MIN(cpu_stats.rss)', field:'MIN(cpu_stats.rss)', minWidth:150, name:"MIN (Rss)", groupable:false}},

            {select:"cpu_stats.virt_memory", display:{id:'cpu_stats.virt_memory', field:'cpu_stats.virt_memory', minWidth:150, name:"virt_memory", groupable:false}},
            {select:"SUM(cpu_stats.virt_memory)", display:{id:'SUM(cpu_stats.virt_memory)', field:'SUM(cpu_stats.virt_memory)', minWidth:150, name:"SUM (virt_memory)", groupable:false}},
            {select:"MAX(cpu_stats.virt_memory)", display:{id:'MAX(cpu_stats.virt_memory)', field:'MAX(cpu_stats.virt_memory)', minWidth:150, name:"MAX (virt_memory)", groupable:false}},
            {select:"MIN(cpu_stats.virt_memory)", display:{id:'MIN(cpu_stats.virt_memory)', field:'MIN(cpu_stats.virt_memory)', minWidth:150, name:"MIN (virt_memory)", groupable:false}},
        ],
        "StatTable.ComputeStoragePool.info_stats" : [
            {select:"COUNT(info_stats)", display:{id:'COUNT(info_stats)', field:'COUNT(info_stats)', minWidth:120, name:"Count (Info Stats)", groupable:false}},

            {select:"info_stats.writes", display:{id:'info_stats.reads', field:'info_stats.reads', minWidth:150, name:"Reads", groupable:false}},
            {select:"SUM(info_stats.reads)", display:{id:'SUM(info_stats.reads)', field:'SUM(info_stats.reads)', minWidth:150, name:"SUM (Reads)", groupable:false}},
            {select:"MAX(info_stats.reads)", display:{id:'MAX(info_stats.reads)', field:'MAX(info_stats.reads)', minWidth:150, name:"MAX (Reads)", groupable:false}},
            {select:"MIN(info_stats.reads)", display:{id:'MIN(info_stats.reads)', field:'MIN(info_stats.reads)', minWidth:150, name:"MIN (Reads)", groupable:false}},

            {select:"info_stats.writes", display:{id:'info_stats.writes', field:'info_stats.writes', minWidth:150, name:"Writes", groupable:false}},
            {select:"SUM(info_stats.writes)", display:{id:'SUM(info_stats.writes)', field:'SUM(info_stats.writes)', minWidth:150, name:"SUM (writes)", groupable:false}},
            {select:"MAX(info_stats.writes)", display:{id:'MAX(info_stats.writes)', field:'MAX(info_stats.writes)', minWidth:150, name:"MAX (writes)", groupable:false}},
            {select:"MIN(info_stats.writes)", display:{id:'MIN(info_stats.writes)', field:'MIN(info_stats.writes)', minWidth:150, name:"MIN (writes)", groupable:false}},

            {select:"info_stats.read_kbytes", display:{id:'info_stats.read_kbytes', field:'info_stats.read_kbytes', minWidth:150, name:"Read kbytes", groupable:false}},
            {select:"SUM(info_stats.read_kbytes)", display:{id:'SUM(info_stats.read_kbytes)', field:'SUM(info_stats.read_kbytes)', minWidth:150, name:"SUM (Read kbytes)", groupable:false}},
            {select:"MAX(info_stats.read_kbytes)", display:{id:'MAX(info_stats.read_kbytes)', field:'MAX(info_stats.read_kbytes)', minWidth:150, name:"MAX (Read kbytes)", groupable:false}},
            {select:"MIN(info_stats.read_kbytes)", display:{id:'MIN(info_stats.read_kbytes)', field:'MIN(info_stats.read_kbytes)', minWidth:150, name:"MIN (Read kbytes)", groupable:false}},

            {select:"info_stats.write_kbytes", display:{id:'info_stats.write_kbytes', field:'info_stats.write_kbytes', minWidth:150, name:"Write kbytes", groupable:false}},
            {select:"SUM(info_stats.write_kbytes)", display:{id:'SUM(info_stats.write_kbytes)', field:'SUM(info_stats.write_kbytes)', minWidth:150, name:"SUM (Write kbytes)", groupable:false}},
            {select:"MAX(info_stats.write_kbytes)", display:{id:'MAX(info_stats.write_kbytes)', field:'MAX(info_stats.write_kbytes)', minWidth:150, name:"MAX (Write kbytes)", groupable:false}},
            {select:"MIN(info_stats.write_kbytes)", display:{id:'MIN(info_stats.write_kbytes)', field:'MIN(info_stats.write_kbytes)', minWidth:150, name:"MIN (Write kbytes)", groupable:false}}

        ],
        "StatTable.ComputeStorageOsd.info_stats" : [
            {select:"COUNT(info_stats)", display:{id:'COUNT(info_stats)', field:'COUNT(info_stats)', minWidth:120, name:"Count (Info Stats)", groupable:false}},

            {select:"info_stats.reads", display:{id:'info_stats.reads', field:'info_stats.reads', minWidth:150, name:"Reads", groupable:false}},
            {select:"SUM(info_stats.reads)", display:{id:'SUM(info_stats.reads)', field:'SUM(info_stats.reads)', minWidth:150, name:"SUM (Reads)", groupable:false}},
            {select:"MAX(info_stats.reads)", display:{id:'MAX(info_stats.reads)', field:'MAX(info_stats.reads)', minWidth:150, name:"MAX (Reads)", groupable:false}},
            {select:"MIN(info_stats.reads)", display:{id:'MIN(info_stats.reads)', field:'MIN(info_stats.reads)', minWidth:150, name:"MIN (Reads)", groupable:false}},

            {select:"info_stats.writes", display:{id:'info_stats.writes', field:'info_stats.writes', minWidth:150, name:"Writes", groupable:false}},
            {select:"SUM(info_stats.writes)", display:{id:'SUM(info_stats.writes)', field:'SUM(info_stats.writes)', minWidth:150, name:"SUM (Writes)", groupable:false}},
            {select:"MAX(info_stats.writes)", display:{id:'MAX(info_stats.writes)', field:'MAX(info_stats.writes)', minWidth:150, name:"MAX (Writes)", groupable:false}},
            {select:"MIN(info_stats.writes)", display:{id:'MIN(info_stats.writes)', field:'MIN(info_stats.writes)', minWidth:150, name:"MIN (Writes)", groupable:false}},

            {select:"info_stats.read_kbytes", display:{id:'info_stats.read_kbytes', field:'info_stats.read_kbytes', minWidth:150, name:"Read kbytes", groupable:false}},
            {select:"SUM(info_stats.read_kbytes)", display:{id:'SUM(info_stats.read_kbytes)', field:'SUM(info_stats.read_kbytes)', minWidth:150, name:"SUM (Read kbytes)", groupable:false}},
            {select:"MAX(info_stats.read_kbytes)", display:{id:'MAX(info_stats.read_kbytes)', field:'MAX(info_stats.read_kbytes)', minWidth:150, name:"MAX (Read kbytes)", groupable:false}},
            {select:"MIN(info_stats.read_kbytes)", display:{id:'MIN(info_stats.read_kbytes)', field:'MIN(info_stats.read_kbytes)', minWidth:150, name:"MIN (Read kbytes)", groupable:false}},

            {select:"info_stats.write_kbytes", display:{id:'info_stats.write_kbytes', field:'info_stats.write_kbytes', minWidth:150, name:"Write kbytes", groupable:false}},
            {select:"SUM(info_stats.write_kbytes)", display:{id:'SUM(info_stats.write_kbytes)', field:'SUM(info_stats.write_kbytes)', minWidth:150, name:"SUM (Write kbytes)", groupable:false}},
            {select:"MAX(info_stats.write_kbytes)", display:{id:'MAX(info_stats.write_kbytes)', field:'MAX(info_stats.write_kbytes)', minWidth:150, name:"MAX (Write kbytes)", groupable:false}},
            {select:"MIN(info_stats.write_kbytes)", display:{id:'MIN(info_stats.write_kbytes)', field:'MIN(info_stats.write_kbytes)', minWidth:150, name:"MIN (Write kbytes)", groupable:false}},

            {select:"info_stats.op_r_latency", display:{id:'info_stats.op_r_latency', field:'info_stats.op_r_latency', minWidth:150, name:"Read Latency", groupable:false}},
            {select:"SUM(info_stats.op_r_latency)", display:{id:'SUM(info_stats.op_r_latency)', field:'SUM(info_stats.op_r_latency)', minWidth:150, name:"SUM (Read Latency)", groupable:false}},
            {select:"MAX(info_stats.op_r_latency)", display:{id:'MAX(info_stats.op_r_latency)', field:'MAX(info_stats.op_r_latency)', minWidth:150, name:"MAX (Read Latency)", groupable:false}},
            {select:"MIN(info_stats.op_r_latency)", display:{id:'MIN(info_stats.op_r_latency)', field:'MIN(info_stats.op_r_latency)', minWidth:150, name:"MIN (Read Latency)", groupable:false}},

            {select:"info_stats.op_w_latency", display:{id:'info_stats.op_w_latency', field:'info_stats.op_w_latency', minWidth:150, name:"Read Latency", groupable:false}},
            {select:"SUM(info_stats.op_w_latency)", display:{id:'SUM(info_stats.op_w_latency)', field:'SUM(info_stats.op_w_latency)', minWidth:150, name:"SUM (Read Latency)", groupable:false}},
            {select:"MAX(info_stats.op_w_latency)", display:{id:'MAX(info_stats.op_w_latency)', field:'MAX(info_stats.op_w_latency)', minWidth:150, name:"MAX (Read Latency)", groupable:false}},
            {select:"MIN(info_stats.op_w_latency)", display:{id:'MIN(info_stats.op_w_latency)', field:'MIN(info_stats.op_w_latency)', minWidth:150, name:"MIN (Read Latency)", groupable:false}}
        ],
        "StatTable.ComputeStorageDisk.info_stats" : [
            {select:"COUNT(info_stats)", display:{id:'COUNT(info_stats)', field:'COUNT(info_stats)', minWidth:120, name:"Count (Info Stats)", groupable:false}},

            {select:"info_stats.reads", display:{id:'info_stats.reads', field:'info_stats.reads', minWidth:150, name:"Reads", groupable:false}},
            {select:"SUM(info_stats.reads)", display:{id:'SUM(info_stats.reads)', field:'SUM(info_stats.reads)', minWidth:150, name:"SUM (Reads)", groupable:false}},
            {select:"MAX(info_stats.reads)", display:{id:'MAX(info_stats.reads)', field:'MAX(info_stats.reads)', minWidth:150, name:"MAX (Reads)", groupable:false}},
            {select:"MIN(info_stats.reads)", display:{id:'MIN(info_stats.reads)', field:'MIN(info_stats.reads)', minWidth:150, name:"MIN (Reads)", groupable:false}},

            {select:"info_stats.writes", display:{id:'info_stats.writes', field:'info_stats.writes', minWidth:150, name:"Writes", groupable:false}},
            {select:"SUM(info_stats.writes)", display:{id:'SUM(info_stats.writes)', field:'SUM(info_stats.writes)', minWidth:150, name:"SUM (Writes)", groupable:false}},
            {select:"MAX(info_stats.writes)", display:{id:'MAX(info_stats.writes)', field:'MAX(info_stats.writes)', minWidth:150, name:"MAX (Writes)", groupable:false}},
            {select:"MIN(info_stats.writes)", display:{id:'MIN(info_stats.writes)', field:'MIN(info_stats.writes)', minWidth:150, name:"MIN (Writes)", groupable:false}},

            {select:"info_stats.read_kbytes", display:{id:'info_stats.read_kbytes', field:'info_stats.read_kbytes', minWidth:150, name:"Read kbytes", groupable:false}},
            {select:"SUM(info_stats.read_kbytes)", display:{id:'SUM(info_stats.read_kbytes)', field:'SUM(info_stats.read_kbytes)', minWidth:150, name:"SUM (Read kbytes)", groupable:false}},
            {select:"MAX(info_stats.read_kbytes)", display:{id:'MAX(info_stats.read_kbytes)', field:'MAX(info_stats.read_kbytes)', minWidth:150, name:"MAX (Read kbytes)", groupable:false}},
            {select:"MIN(info_stats.read_kbytes)", display:{id:'MIN(info_stats.read_kbytes)', field:'MIN(info_stats.read_kbytes)', minWidth:150, name:"MIN (Read kbytes)", groupable:false}},

            {select:"info_stats.write_kbytes", display:{id:'info_stats.write_kbytes', field:'info_stats.write_kbytes', minWidth:150, name:"Write kbytes", groupable:false}},
            {select:"SUM(info_stats.write_kbytes)", display:{id:'SUM(info_stats.write_kbytes)', field:'SUM(info_stats.write_kbytes)', minWidth:150, name:"SUM (Write kbytes)", groupable:false}},
            {select:"MAX(info_stats.write_kbytes)", display:{id:'MAX(info_stats.write_kbytes)', field:'MAX(info_stats.write_kbytes)', minWidth:150, name:"MAX (Write kbytes)", groupable:false}},
            {select:"MIN(info_stats.write_kbytes)", display:{id:'MIN(info_stats.write_kbytes)', field:'MIN(info_stats.write_kbytes)', minWidth:150, name:"MIN (Write kbytes)", groupable:false}},

            {select:"info_stats.iops", display:{id:'info_stats.iops', field:'info_stats.iops', minWidth:150, name:"IOPS", groupable:false}},
            {select:"SUM(info_stats.iops)", display:{id:'SUM(info_stats.iops)', field:'SUM(info_stats.iops)', minWidth:150, name:"SUM (IOPS)", groupable:false}},
            {select:"MAX(info_stats.iops)", display:{id:'MAX(info_stats.iops)', field:'MAX(info_stats.iops)', minWidth:150, name:"MAX (IOPS)", groupable:false}},
            {select:"MIN(info_stats.iops)", display:{id:'MIN(info_stats.iops)', field:'MIN(info_stats.iops)', minWidth:150, name:"MIN (IOPS)", groupable:false}},

            {select:"info_stats.bw", display:{id:'info_stats.bw', field:'info_stats.bw', minWidth:150, name:"Bandwidth", groupable:false}},
            {select:"SUM(info_stats.bw)", display:{id:'SUM(info_stats.bw)', field:'SUM(info_stats.bw)', minWidth:150, name:"SUM (Bandwidth)", groupable:false}},
            {select:"MAX(info_stats.bw)", display:{id:'MAX(info_stats.bw)', field:'MAX(info_stats.bw)', minWidth:150, name:"MAX (Bandwidth)", groupable:false}},
            {select:"MIN(info_stats.bw)", display:{id:'MIN(info_stats.bw)', field:'MIN(info_stats.bw)', minWidth:150, name:"MIN (Bandwidth)", groupable:false}}
        ],
        "StatTable.ServerMonitoringInfo.sensor_stats" : [
            {select:"COUNT(sensor_stats)", display:{id:'COUNT(sensor_stats)', field:'COUNT(sensor_stats)', minWidth:120, name:"Count (Sensor Stats)", groupable:false}},
            {select:"sensor_stats.sensor", display:{id:'sensor_stats.sensor', field:'sensor_stats.sensor', minWidth:150, name:"Sensor", groupable:false}},
            {select:"sensor_stats.status", display:{id:'sensor_stats.status', field:'sensor_stats.status', minWidth:150, name:"Sensor Status", groupable:false}},

            {select:"sensor_stats.reading", display:{id:'sensor_stats.reading', field:'sensor_stats.reading', minWidth:150, name:"Reading", groupable:false}},
            {select:"SUM(sensor_stats.reading)", display:{id:'SUM(sensor_stats.reading)', field:'SUM(sensor_stats.reading)', minWidth:150, name:"SUM (Reading)", groupable:false}},
            {select:"MAX(sensor_stats.reading)", display:{id:'MAX(sensor_stats.reading)', field:'MAX(sensor_stats.reading)', minWidth:150, name:"MAX (Reading)", groupable:false}},
            {select:"MIN(sensor_stats.reading)", display:{id:'MIN(sensor_stats.reading)', field:'MIN(sensor_stats.reading)', minWidth:150, name:"MIN (Reading)", groupable:false}},

            {select:"sensor_stats.unit", display:{id:'sensor_stats.unit', field:'sensor_stats.unit', minWidth:150, name:"Unit", groupable:false}},
            {select:"sensor_stats.sensor_type", display:{id:'sensor_stats.sensor_type', field:'sensor_stats.sensor_type', minWidth:150, name:"Sensor Type", groupable:false}}
        ],
        "StatTable.ServerMonitoringInfo.disk_usage_stats" : [
            {select:"COUNT(disk_usage_stats)", display:{id:'COUNT(disk_usage_stats)', field:'COUNT(disk_usage_stats)', minWidth:120, name:"Count (Disk Usage)", groupable:false}},
            {select:"disk_usage_stats.disk_name", display:{id:'disk_usage_stats.disk_name', field:'disk_usage_stats.disk_name', minWidth:150, name:"Disk Name", groupable:false}},

            {select:"disk_usage_stats.read_bytes", display:{id:'disk_usage_stats.read_bytes', field:'disk_usage_stats.read_bytes', minWidth:150, name:"Read MB", groupable:false}},
            {select:"SUM(disk_usage_stats.read_bytes)", display:{id:'SUM(disk_usage_stats.read_bytes)', field:'SUM(disk_usage_stats.read_bytes)', minWidth:150, name:"SUM (Read MB)", groupable:false}},
            {select:"MAX(disk_usage_stats.read_bytes)", display:{id:'MAX(disk_usage_stats.read_bytes)', field:'MAX(disk_usage_stats.read_bytes)', minWidth:150, name:"MAX (Read MB)", groupable:false}},
            {select:"MIN(disk_usage_stats.read_bytes)", display:{id:'MIN(disk_usage_stats.read_bytes)', field:'MIN(disk_usage_stats.read_bytes)', minWidth:150, name:"MIN (Read MB)", groupable:false}},

            {select:"disk_usage_stats.write_bytes", display:{id:'disk_usage_stats.write_bytes', field:'disk_usage_stats.write_bytes', minWidth:150, name:"Read MB", groupable:false}},
            {select:"SUM(disk_usage_stats.write_bytes)", display:{id:'SUM(disk_usage_stats.write_bytes)', field:'SUM(disk_usage_stats.write_bytes)', minWidth:150, name:"SUM (Write MB)", groupable:false}},
            {select:"MAX(disk_usage_stats.write_bytes)", display:{id:'MAX(disk_usage_stats.write_bytes)', field:'MAX(disk_usage_stats.write_bytes)', minWidth:150, name:"MAX (Write MB)", groupable:false}},
            {select:"MIN(disk_usage_stats.write_bytes)", display:{id:'MIN(disk_usage_stats.write_bytes)', field:'MIN(disk_usage_stats.write_bytes)', minWidth:150, name:"MIN (Write MB)", groupable:false}},
        ],
        "StatTable.ServerMonitoringSummary.network_info_stats" : [
            {select:"COUNT(network_info_stats)", display:{id:'COUNT(network_info_stats)', field:'COUNT(network_info_stats)', minWidth:120, name:"Count (Network Info)", groupable:false}},
            {select:"network_info_stats.interface_name", display:{id:'network_info_stats.interface_name', field:'network_info_stats.interface_name', minWidth:150, name:"interface Name", groupable:false}},

            {select:"network_info.tx_bytes", display:{id:'network_info.tx_bytes', field:'network_info.tx_bytes', minWidth:150, name:"Tx Bytes", groupable:false}},
            {select:"SUM(network_info.tx_bytes)", display:{id:'SUM(network_info.tx_bytes)', field:'SUM(network_info.tx_bytes)', minWidth:150, name:"SUM (Tx Bytes)", groupable:false}},
            {select:"MIN(network_info.tx_bytes)", display:{id:'MIN(network_info.tx_bytes)', field:'MIN(network_info.tx_bytes)', minWidth:150, name:"MIN (Tx Bytes)", groupable:false}},
            {select:"MAX(network_info.tx_bytes)", display:{id:'MAX(network_info.tx_bytes)', field:'MAX(network_info.tx_bytes)', minWidth:150, name:"MAX (Tx Bytes)", groupable:false}},

            {select:"network_info.tx_packets", display:{id:'network_info.tx_packets', field:'network_info.tx_packets', minWidth:150, name:"Tx Bytes", groupable:false}},
            {select:"SUM(network_info.tx_packets)", display:{id:'SUM(network_info.tx_packets)', field:'SUM(network_info.tx_packets)', minWidth:150, name:"SUM (Tx Packets)", groupable:false}},
            {select:"MIN(network_info.tx_packets)", display:{id:'MIN(network_info.tx_packets)', field:'MIN(network_info.tx_packets)', minWidth:150, name:"MIN (Tx Packets)", groupable:false}},
            {select:"MAX(network_info.tx_packets)", display:{id:'MAX(network_info.tx_packets)', field:'MAX(network_info.tx_packets)', minWidth:150, name:"MAX (Tx Packets)", groupable:false}},

            {select:"network_info.rx_bytes", display:{id:'network_info.rx_bytes', field:'network_info.rx_bytes', minWidth:150, name:"Tx Bytes", groupable:false}},
            {select:"SUM(network_info.rx_bytes)", display:{id:'SUM(network_info.rx_bytes)', field:'SUM(network_info.rx_bytes)', minWidth:150, name:"SUM (Rx Bytes)", groupable:false}},
            {select:"MIN(network_info.rx_bytes)", display:{id:'MIN(network_info.rx_bytes)', field:'MIN(network_info.rx_bytes)', minWidth:150, name:"MIN (Rx Bytes)", groupable:false}},
            {select:"MAX(network_info.rx_bytes)", display:{id:'MAX(network_info.rx_bytes)', field:'MAX(network_info.rx_bytes)', minWidth:150, name:"MAX (Rx Bytes)", groupable:false}},

            {select:"network_info.rx_packets", display:{id:'network_info.rx_packets', field:'network_info.rx_packets', minWidth:150, name:"Tx Bytes", groupable:false}},
            {select:"SUM(network_info.rx_packets)", display:{id:'SUM(network_info.rx_packets)', field:'SUM(network_info.rx_packets)', minWidth:150, name:"SUM (Rx Packets)", groupable:false}},
            {select:"MIN(network_info.rx_packets)", display:{id:'MIN(network_info.rx_packets)', field:'MIN(network_info.rx_packets)', minWidth:150, name:"MIN (Rx Packets)", groupable:false}},
            {select:"MAX(network_info.rx_packets)", display:{id:'MAX(network_info.rx_packets)', field:'MAX(network_info.rx_packets)', minWidth:150, name:"MAX (Rx Packets)", groupable:false}},
        ],
        "StatTable.ServerMonitoringSummary.resource_info_stats" : [
            {select:"COUNT(resource_info_stats)", display:{id:'COUNT(resource_info_stats)', field:'COUNT(resource_info_stats)', minWidth:120, name:"Count (Resource Info)", groupable:false}},

            {select:"resource_info_stats.cpu_usage_percentage", display:{id:'resource_info_stats.cpu_usage_percentage', field:'resource_info_stats.cpu_usage_percentage', minWidth:150, name:"Tx Bytes", groupable:false}},
            {select:"SUM(resource_info_stats.cpu_usage_percentage)", display:{id:'SUM(resource_info_stats.cpu_usage_percentage)', field:'SUM(resource_info_stats.cpu_usage_percentage)', minWidth:150, name:"SUM (CPU Usage %)", groupable:false}},
            {select:"MIN(resource_info_stats.cpu_usage_percentage)", display:{id:'MIN(resource_info_stats.cpu_usage_percentage)', field:'MIN(resource_info_stats.cpu_usage_percentage)', minWidth:150, name:"MIN (CPU Usage %)", groupable:false}},
            {select:"MAX(resource_info_stats.cpu_usage_percentage)", display:{id:'MAX(resource_info_stats.cpu_usage_percentage)', field:'MAX(resource_info_stats.cpu_usage_percentage)', minWidth:150, name:"MAX (CPU Usage %)", groupable:false}},

            {select:"resource_info_stats.mem_usage_mb", display:{id:'resource_info_stats.mem_usage_mb', field:'resource_info_stats.mem_usage_mb', minWidth:150, name:"Mem Usage Mb", groupable:false}},
            {select:"SUM(resource_info_stats.mem_usage_mb)", display:{id:'SUM(resource_info_stats.mem_usage_mb)', field:'SUM(resource_info_stats.mem_usage_mb)', minWidth:150, name:"SUM (Mem Usage Mb)", groupable:false}},
            {select:"MIN(resource_info_stats.mem_usage_mb)", display:{id:'MIN(resource_info_stats.mem_usage_mb)', field:'MIN(resource_info_stats.mem_usage_mb)', minWidth:150, name:"MIN (Mem Usage Mb)", groupable:false}},
            {select:"MAX(resource_info_stats.mem_usage_mb)", display:{id:'MAX(resource_info_stats.mem_usage_mb)', field:'MAX(resource_info_stats.mem_usage_mb)', minWidth:150, name:"MAX (Mem Usage Mb)", groupable:false}},

            {select:"resource_info_stats.mem_usage_percent", display:{id:'resource_info_stats.mem_usage_percent', field:'resource_info_stats.mem_usage_percent', minWidth:150, name:"Mem Usage %", groupable:false}},
            {select:"SUM(resource_info_stats.mem_usage_percent)", display:{id:'SUM(resource_info_stats.mem_usage_percent)', field:'SUM(resource_info_stats.mem_usage_percent)', minWidth:150, name:"SUM (Mem Usage %)", groupable:false}},
            {select:"MIN(resource_info_stats.mem_usage_percent)", display:{id:'MIN(resource_info_stats.mem_usage_percent)', field:'MIN(resource_info_stats.mem_usage_percent)', minWidth:150, name:"MIN (Mem Usage %)", groupable:false}},
            {select:"MAX(resource_info_stats.mem_usage_percent)", display:{id:'MAX(resource_info_stats.mem_usage_percent)', field:'MAX(resource_info_stats.mem_usage_percent)', minWidth:150, name:"MAX (Mem Usage %)", groupable:false}},
        ],
        "StatTable.ServerMonitoringInfo.file_system_view_stats.physical_disks" : [
            {select:"COUNT(file_system_view_stats.physical_disks)", display:{id:'COUNT(file_system_view_stats.physical_disks)', field:'COUNT(file_system_view_stats.physical_disks)', minWidth:120, name:"Count (Physical Disks)", groupable:false}},
            {select:"file_system_view_stats.fs_name", display:{id:'file_system_view_stats.fs_name', field:'file_system_view_stats.fs_name', minWidth:150, name:"Fs Name", groupable:false}},
            {select:"file_system_view_stats.mountpoint", display:{id:'file_system_view_stats.mountpoint', field:'file_system_view_stats.mountpoint', minWidth:150, name:"Mount Point", groupable:false}},
            {select:"file_system_view_stats.type", display:{id:'file_system_view_stats.type', field:'file_system_view_stats.type', minWidth:150, name:"Type", groupable:false}},

            {select:"file_system_view_stats.size_kb", display:{id:'file_system_view_stats.size_kb', field:'file_system_view_stats.size_kb', minWidth:150, name:"Fs Size Kb", groupable:false}},
            {select:"SUM(file_system_view_stats.size_kb)", display:{id:'SUM(file_system_view_stats.size_kb)', field:'SUM(file_system_view_stats.size_kb)', minWidth:150, name:"SUM (Fs Size Kb)", groupable:false}},
            {select:"MIN(file_system_view_stats.size_kb)", display:{id:'MIN(file_system_view_stats.size_kb)', field:'MIN(file_system_view_stats.size_kb)', minWidth:150, name:"MIN (Fs Size Kb)", groupable:false}},
            {select:"MAX(file_system_view_stats.size_kb)", display:{id:'MAX(file_system_view_stats.size_kb)', field:'MAX(file_system_view_stats.size_kb)', minWidth:150, name:"MAX (Fs Size Kb)", groupable:false}},

            {select:"file_system_view_stats.used_kb", display:{id:'file_system_view_stats.used_kb', field:'file_system_view_stats.used_kb', minWidth:150, name:"Fs Used Kb", groupable:false}},
            {select:"SUM(file_system_view_stats.used_kb)", display:{id:'SUM(file_system_view_stats.used_kb)', field:'SUM(file_system_view_stats.used_kb)', minWidth:150, name:"SUM (Fs Used Kb)", groupable:false}},
            {select:"MIN(file_system_view_stats.used_kb)", display:{id:'MIN(file_system_view_stats.used_kb)', field:'MIN(file_system_view_stats.used_kb)', minWidth:150, name:"MIN (Fs Used Kb)", groupable:false}},
            {select:"MAX(file_system_view_stats.used_kb)", display:{id:'MAX(file_system_view_stats.used_kb)', field:'MAX(file_system_view_stats.used_kb)', minWidth:150, name:"MAX (Fs Used Kb)", groupable:false}},

            {select:"file_system_view_stats.available_kb", display:{id:'file_system_view_stats.available_kb', field:'file_system_view_stats.available_kb', minWidth:150, name:"Fs Available Kb", groupable:false}},
            {select:"SUM(file_system_view_stats.available_kb)", display:{id:'SUM(file_system_view_stats.available_kb)', field:'SUM(file_system_view_stats.available_kb)', minWidth:150, name:"SUM (Fs Available Kb)", groupable:false}},
            {select:"MIN(file_system_view_stats.available_kb)", display:{id:'MIN(file_system_view_stats.available_kb)', field:'MIN(file_system_view_stats.available_kb)', minWidth:150, name:"MIN (Fs Available Kb)", groupable:false}},
            {select:"MAX(file_system_view_stats.available_kb)", display:{id:'MAX(file_system_view_stats.available_kb)', field:'MAX(file_system_view_stats.available_kb)', minWidth:150, name:"MAX (Fs Available Kb)", groupable:false}},

            {select:"file_system_view_stats.used_percentage", display:{id:'file_system_view_stats.used_percentage', field:'file_system_view_stats.used_percentage', minWidth:150, name:"Fs Used %", groupable:false}},
            {select:"SUM(file_system_view_stats.used_percentage)", display:{id:'SUM(file_system_view_stats.used_percentage)', field:'SUM(file_system_view_stats.used_percentage)', minWidth:150, name:"SUM (Fs Used %)", groupable:false}},
            {select:"MIN(file_system_view_stats.used_percentage)", display:{id:'MIN(file_system_view_stats.used_percentage)', field:'MIN(file_system_view_stats.used_percentage)', minWidth:150, name:"MIN (Fs Used %)", groupable:false}},
            {select:"MAX(file_system_view_stats.used_percentage)", display:{id:'MAX(file_system_view_stats.used_percentage)', field:'MAX(file_system_view_stats.used_percentage)', minWidth:150, name:"MAX (Fs Used %)", groupable:false}},


            {select:"file_system_view_stats.physical_disks.disk_name", display:{id:'file_system_view_stats.physical_disks.disk_name', field:'file_system_view_stats.physical_disks.disk_name', minWidth:150, name:"Physical Disk Name", groupable:false}},

            {select:"file_system_view_stats.physical_disks.disk_size_kb", display:{id:'file_system_view_stats.physical_disks.disk_size_kb', field:'file_system_view_stats.physical_disks.disk_size_kb', minWidth:150, name:"Physical Size Kb", groupable:false}},
            {select:"SUM(file_system_view_stats.physical_disks.disk_size_kb)", display:{id:'SUM(file_system_view_stats.physical_disks.disk_size_kb)', field:'SUM(file_system_view_stats.physical_disks.disk_size_kb)', minWidth:150, name:"SUM (Physical Size Kb)", groupable:false}},
            {select:"MIN(file_system_view_stats.physical_disks.disk_size_kb)", display:{id:'MIN(file_system_view_stats.physical_disks.disk_size_kb)', field:'MIN(file_system_view_stats.physical_disks.disk_size_kb)', minWidth:150, name:"MIN (Physical Size Kb)", groupable:false}},
            {select:"MAX(file_system_view_stats.physical_disks.disk_size_kb)", display:{id:'MAX(file_system_view_stats.physical_disks.disk_size_kb)', field:'MAX(file_system_view_stats.physical_disks.disk_size_kb)', minWidth:150, name:"MAX (Physical Size Kb)", groupable:false}},

            {select:"file_system_view_stats.physical_disks.disk_used_kb", display:{id:'file_system_view_stats.physical_disks.disk_used_kb', field:'file_system_view_stats.physical_disks.disk_used_kb', minWidth:150, name:"Physical Disk Used Kb", groupable:false}},
            {select:"SUM(file_system_view_stats.physical_disks.disk_used_kb)", display:{id:'SUM(file_system_view_stats.physical_disks.disk_used_kb)', field:'SUM(file_system_view_stats.physical_disks.disk_used_kb)', minWidth:150, name:"SUM (Physical Disk Used Kb)", groupable:false}},
            {select:"MIN(file_system_view_stats.physical_disks.disk_used_kb)", display:{id:'MIN(file_system_view_stats.physical_disks.disk_used_kb)', field:'MIN(file_system_view_stats.physical_disks.disk_used_kb)', minWidth:150, name:"MIN (Physical Disk Used Kb)", groupable:false}},
            {select:"MAX(file_system_view_stats.physical_disks.disk_used_kb)", display:{id:'MAX(file_system_view_stats.physical_disks.disk_used_kb)', field:'MAX(file_system_view_stats.physical_disks.disk_used_kb)', minWidth:150, name:"MAX (Physical Disk Used Kb)", groupable:false}},

            {select:"file_system_view_stats.physical_disks.disk_available_kb", display:{id:'file_system_view_stats.physical_disks.disk_available_kb', field:'file_system_view_stats.physical_disks.disk_available_kb', minWidth:150, name:"Physical Disk Available Kb", groupable:false}},
            {select:"SUM(file_system_view_stats.physical_disks.disk_available_kb)", display:{id:'SUM(file_system_view_stats.physical_disks.disk_available_kb)', field:'SUM(file_system_view_stats.physical_disks.disk_available_kb)', minWidth:150, name:"SUM (Physical Disk Available Kb)", groupable:false}},
            {select:"MIN(file_system_view_stats.physical_disks.disk_available_kb)", display:{id:'MIN(file_system_view_stats.physical_disks.disk_available_kb)', field:'MIN(file_system_view_stats.physical_disks.disk_available_kb)', minWidth:150, name:"MIN (Physical Disk Available Kb)", groupable:false}},
            {select:"MAX(file_system_view_stats.physical_disks.disk_available_kb)", display:{id:'MAX(file_system_view_stats.physical_disks.disk_available_kb)', field:'MAX(file_system_view_stats.physical_disks.disk_available_kb)', minWidth:150, name:"MAX (Physical Disk Available Kb)", groupable:false}},

            {select:"file_system_view_stats.physical_disks.disk_used_percentage", display:{id:'file_system_view_stats.physical_disks.disk_used_percentage', field:'file_system_view_stats.physical_disks.disk_used_percentage', minWidth:150, name:"Physical Disk Used %", groupable:false}},
            {select:"SUM(file_system_view_stats.physical_disks.disk_used_percentage)", display:{id:'SUM(file_system_view_stats.physical_disks.disk_used_percentage)', field:'SUM(file_system_view_stats.physical_disks.disk_used_percentage)', minWidth:150, name:"SUM (Physical Disk Used %)", groupable:false}},
            {select:"MIN(file_system_view_stats.physical_disks.disk_used_percentage)", display:{id:'MIN(file_system_view_stats.physical_disks.disk_used_percentage)', field:'MIN(file_system_view_stats.physical_disks.disk_used_percentage)', minWidth:150, name:"MIN (Physical Disk Used %)", groupable:false}},
            {select:"MAX(file_system_view_stats.physical_disks.disk_used_percentage)", display:{id:'MAX(file_system_view_stats.physical_disks.disk_used_percentage)', field:'MAX(file_system_view_stats.physical_disks.disk_used_percentage)', minWidth:150, name:"MAX (Physical Disk Used %)", groupable:false}},
        ],

        "StatTable.SandeshMessageStat.msg_info" : [
            {select:"COUNT(msg_info)", display:{id:'COUNT(msg_info)', field:'COUNT(msg_info)', minWidth:150, name:"Count (Msg Info)", groupable:false}},
            {select:"msg_info.type", display:{id:'msg_info.type', field:'msg_info.type', minWidth:210, name:"Message Type", groupable:false}},
            {select:"msg_info.level", display:{id:'msg_info.level', field:'msg_info.level', minWidth:210, name:"Message Level", groupable:false}},

            {select:"msg_info.messages", display:{id:'msg_info.messages', field:'msg_info.messages', minWidth:150, name:"Messages", groupable:false}},
            {select:"SUM(msg_info.messages)", display:{id:'SUM(msg_info.messages)', field:'SUM(msg_info.messages)', minWidth:150, name:"SUM (Messages)", groupable:false}},
            {select:"MIN(msg_info.messages)", display:{id:'MIN(msg_info.messages)', field:'MIN(msg_info.messages)', minWidth:150, name:"MIN (Messages)", groupable:false}},
            {select:"MAX(msg_info.messages)", display:{id:'MAX(msg_info.messages)', field:'MAX(msg_info.messages)', minWidth:150, name:"MAX (Messages)", groupable:false}},

            {select:"msg_info.bytes", display:{id:'msg_info.bytes', field:'msg_info.messages', minWidth:150, name:"Bytes", groupable:false}},
            {select:"SUM(msg_info.bytes)", display:{id:'SUM(msg_info.bytes)', field:'SUM(msg_info.bytes)', minWidth:150, name:"SUM (Bytes)", groupable:false}},
            {select:"MIN(msg_info.bytes)", display:{id:'MIN(msg_info.bytes)', field:'MIN(msg_info.bytes)', minWidth:150, name:"MIN (Bytes)", groupable:false}},
            {select:"MAX(msg_info.bytes)", display:{id:'MAX(msg_info.bytes)', field:'MAX(msg_info.bytes)', minWidth:150, name:"MAX (Bytes)", groupable:false}}

        ],
        "StatTable.GeneratorDbStats.table_info" : [
            {select:"COUNT(table_info)", display:{id:'COUNT(table_info)', field:'COUNT(table_info)', minWidth:120, name:"Count (Table Info)", groupable:false}},
            {select:"table_info.table_name", display:{id:'table_info.table_name', field:'table_info.table_name', minWidth:150, name:"Table Name", groupable:false}},

            {select:"table_info.reads", display:{id:'table_info.reads', field:'table_info.reads', minWidth:150, name:"Reads", groupable:false}},
            {select:"SUM(table_info.reads)", display:{id:'SUM(table_info.reads)', field:'SUM(table_info.reads)', minWidth:150, name:"SUM (Reads)", groupable:false}},
            {select:"MIN(table_info.reads)", display:{id:'MIN(table_info.reads)', field:'MIN(table_info.reads)', minWidth:150, name:"MIN (Reads)", groupable:false}},
            {select:"MAX(table_info.reads)", display:{id:'MAX(table_info.reads)', field:'MAX(table_info.reads)', minWidth:150, name:"MAX (Reads)", groupable:false}},

            {select:"table_info.read_fails", display:{id:'table_info.read_fails', field:'table_info.read_fails', minWidth:150, name:"Read Fails", groupable:false}},
            {select:"SUM(table_info.read_fails)", display:{id:'SUM(table_info.read_fails)', field:'SUM(table_info.read_fails)', minWidth:150, name:"SUM (Read Fails)", groupable:false}},
            {select:"MIN(table_info.read_fails)", display:{id:'MIN(table_info.read_fails)', field:'MIN(table_info.read_fails)', minWidth:150, name:"MIN (Read Fails)", groupable:false}},
            {select:"MAX(table_info.read_fails)", display:{id:'MAX(table_info.read_fails)', field:'MAX(table_info.read_fails)', minWidth:150, name:"MAX (Read Fails)", groupable:false}},

            {select:"table_info.writes", display:{id:'table_info.writes', field:'table_info.writes', minWidth:150, name:"Writes", groupable:false}},
            {select:"SUM(table_info.writes)", display:{id:'SUM(table_info.writes)', field:'SUM(table_info.writes)', minWidth:150, name:"SUM (Writes)", groupable:false}},
            {select:"MIN(table_info.writes)", display:{id:'MIN(table_info.writes)', field:'MIN(table_info.writes)', minWidth:150, name:"MIN (Writes)", groupable:false}},
            {select:"MAX(table_info.writes)", display:{id:'MAX(table_info.writes)', field:'MAX(table_info.writes)', minWidth:150, name:"MAX (Writes)", groupable:false}},

            {select:"table_info.write_fails", display:{id:'table_info.write_fails', field:'table_info.write_fails', minWidth:150, name:"Write Fails", groupable:false}},
            {select:"SUM(table_info.write_fails)", display:{id:'SUM(table_info.write_fails)', field:'SUM(table_info.write_fails)', minWidth:150, name:"SUM (Write Fails)", groupable:false}},
            {select:"MIN(table_info.write_fails)", display:{id:'MIN(table_info.write_fails)', field:'MIN(table_info.write_fails)', minWidth:150, name:"MIN (Write Fails)", groupable:false}},
            {select:"MAX(table_info.write_fails)", display:{id:'MAX(table_info.write_fails)', field:'MAX(table_info.write_fails)', minWidth:150, name:"MAX (Write Fails)", groupable:false}}
        ],
        "StatTable.GeneratorDbStats.statistics_table_info" : [
            {select:"COUNT(statistics_table_info)", display:{id:'COUNT(statistics_table_info)', field:'COUNT(statistics_table_info)', minWidth:120, name:"Count (Table Info)", groupable:false}},
            {select:"statistics_table_info.table_name", display:{id:'statistics_table_info.table_name', field:'statistics_table_info.table_name', minWidth:150, name:"Table Name", groupable:false}},

            {select:"statistics_table_info.reads", display:{id:'statistics_table_info.reads', field:'statistics_table_info.reads', minWidth:150, name:"Reads", groupable:false}},
            {select:"SUM(statistics_table_info.reads)", display:{id:'SUM(statistics_table_info.reads)', field:'SUM(statistics_table_info.reads)', minWidth:150, name:"SUM (Reads)", groupable:false}},
            {select:"MIN(statistics_table_info.reads)", display:{id:'MIN(statistics_table_info.reads)', field:'MIN(statistics_table_info.reads)', minWidth:150, name:"MIN (Reads)", groupable:false}},
            {select:"MAX(statistics_table_info.reads)", display:{id:'MAX(statistics_table_info.reads)', field:'MAX(statistics_table_info.reads)', minWidth:150, name:"MAX (Reads)", groupable:false}},

            {select:"statistics_table_info.read_fails", display:{id:'statistics_table_info.read_fails', field:'statistics_table_info.read_fails', minWidth:150, name:"Read Fails", groupable:false}},
            {select:"SUM(statistics_table_info.read_fails)", display:{id:'SUM(statistics_table_info.read_fails)', field:'SUM(statistics_table_info.read_fails)', minWidth:150, name:"SUM (Read Fails)", groupable:false}},
            {select:"MIN(statistics_table_info.read_fails)", display:{id:'MIN(statistics_table_info.read_fails)', field:'MIN(statistics_table_info.read_fails)', minWidth:150, name:"MIN (Read Fails)", groupable:false}},
            {select:"MAX(statistics_table_info.read_fails)", display:{id:'MAX(statistics_table_info.read_fails)', field:'MAX(statistics_table_info.read_fails)', minWidth:150, name:"MAX (Read Fails)", groupable:false}},

            {select:"statistics_table_info.writes", display:{id:'statistics_table_info.writes', field:'statistics_table_info.writes', minWidth:150, name:"Writes", groupable:false}},
            {select:"SUM(statistics_table_info.writes)", display:{id:'SUM(statistics_table_info.writes)', field:'SUM(statistics_table_info.writes)', minWidth:150, name:"SUM (Writes)", groupable:false}},
            {select:"MIN(statistics_table_info.writes)", display:{id:'MIN(statistics_table_info.writes)', field:'MIN(statistics_table_info.writes)', minWidth:150, name:"MIN (Writes)", groupable:false}},
            {select:"MAX(statistics_table_info.writes)", display:{id:'MAX(statistics_table_info.writes)', field:'MAX(statistics_table_info.writes)', minWidth:150, name:"MAX (Writes)", groupable:false}},

            {select:"statistics_table_info.write_fails", display:{id:'statistics_table_info.write_fails', field:'statistics_table_info.write_fails', minWidth:150, name:"Write Fails", groupable:false}},
            {select:"SUM(statistics_table_info.write_fails)", display:{id:'SUM(statistics_table_info.write_fails)', field:'SUM(statistics_table_info.write_fails)', minWidth:150, name:"SUM (Write Fails)", groupable:false}},
            {select:"MIN(statistics_table_info.write_fails)", display:{id:'MIN(statistics_table_info.write_fails)', field:'MIN(statistics_table_info.write_fails)', minWidth:150, name:"MIN (Write Fails)", groupable:false}},
            {select:"MAX(statistics_table_info.write_fails)", display:{id:'MAX(statistics_table_info.write_fails)', field:'MAX(statistics_table_info.write_fails)', minWidth:150, name:"MAX (Write Fails)", groupable:false}}
        ],
        "StatTable.GeneratorDbStats.errors" : [
            {select:"COUNT(errors)", display:{id:'COUNT(errors)', field:'COUNT(errors)', minWidth:120, name:"Count (Errors)", groupable:false}},

            {select:"errors.write_tablespace_fails", display:{id:'errors.write_tablespace_fails', field:'errors.write_tablespace_fails', minWidth:160, name:"Write Tablespace Fails", groupable:false}},
            {select:"SUM(errors.write_tablespace_fails)", display:{id:'SUM(errors.write_tablespace_fails)', field:'SUM(errors.write_tablespace_fails)', minWidth:160, name:"SUM (Write Tablespace Fails)", groupable:false}},
            {select:"MIN(errors.write_tablespace_fails_fails)", display:{id:'MIN(errors.write_tablespace_fails)', field:'MIN(errors.write_tablespace_fails)', minWidth:160, name:"MIN (Write Tablespace Fails)", groupable:false}},
            {select:"MAX(errors.write_tablespace_fails)", display:{id:'MAX(errors.write_tablespace_fails)', field:'MAX(errors.write_tablespace_fails)', minWidth:160, name:"MAX (Write Tablespace Fails)", groupable:false}},

            {select:"errors.read_tablespace_fails", display:{id:'errors.read_tablespace_fails', field:'errors.read_tablespace_fails', minWidth:160, name:"Read Tablespace Fails", groupable:false}},
            {select:"SUM(errors.read_tablespace_fails)", display:{id:'SUM(errors.read_tablespace_fails)', field:'SUM(errors.read_tablespace_fails)', minWidth:160, name:"SUM (Read Tablespace Fails)", groupable:false}},
            {select:"MIN(errors.read_tablespace_fails_fails)", display:{id:'MIN(errors.read_tablespace_fails)', field:'MIN(errors.read_tablespace_fails)', minWidth:160, name:"MIN (Read Tablespace Fails)", groupable:false}},
            {select:"MAX(errors.read_tablespace_fails)", display:{id:'MAX(errors.read_tablespace_fails)', field:'MAX(errors.read_tablespace_fails)', minWidth:160, name:"MAX (Read Tablespace Fails)", groupable:false}},

            {select:"errors.write_table_fails", display:{id:'errors.write_table_fails', field:'errors.write_table_fails', minWidth:160, name:"Write Table Fails", groupable:false}},
            {select:"SUM(errors.write_table_fails)", display:{id:'SUM(errors.write_table_fails)', field:'SUM(errors.write_table_fails)', minWidth:160, name:"SUM (Write Table Fails)", groupable:false}},
            {select:"MIN(errors.write_table_fails_fails)", display:{id:'MIN(errors.write_table_fails)', field:'MIN(errors.write_table_fails)', minWidth:160, name:"MIN (Write Table Fails)", groupable:false}},
            {select:"MAX(errors.write_table_fails)", display:{id:'MAX(errors.write_table_fails)', field:'MAX(errors.write_table_fails)', minWidth:160, name:"MAX (Write Table Fails)", groupable:false}},

            {select:"errors.read_table_fails", display:{id:'errors.read_table_fails', field:'errors.read_table_fails', minWidth:160, name:"Read Table Fails", groupable:false}},
            {select:"SUM(errors.read_table_fails)", display:{id:'SUM(errors.read_table_fails)', field:'SUM(errors.read_table_fails)', minWidth:160, name:"SUM (Read Table Fails)", groupable:false}},
            {select:"MIN(errors.read_table_fails_fails)", display:{id:'MIN(errors.read_table_fails)', field:'MIN(errors.read_table_fails)', minWidth:160, name:"MIN (Read Table Fails)", groupable:false}},
            {select:"MAX(errors.read_table_fails)", display:{id:'MAX(errors.read_table_fails)', field:'MAX(errors.read_table_fails)', minWidth:160, name:"MAX (Read Table Fails)", groupable:false}},

            {select:"errors.write_column_fails", display:{id:'errors.write_column_fails', field:'errors.write_column_fails', minWidth:160, name:"Write Column Fails", groupable:false}},
            {select:"SUM(errors.write_column_fails)", display:{id:'SUM(errors.write_column_fails)', field:'SUM(errors.write_column_fails)', minWidth:160, name:"SUM (Write Column Fails)", groupable:false}},
            {select:"MIN(errors.write_column_fails_fails)", display:{id:'MIN(errors.write_column_fails)', field:'MIN(errors.write_column_fails)', minWidth:160, name:"MIN (Write Column Fails)", groupable:false}},
            {select:"MAX(errors.write_column_fails)", display:{id:'MAX(errors.write_column_fails)', field:'MAX(errors.write_column_fails)', minWidth:160, name:"MAX (Write Column Fails)", groupable:false}},

            {select:"errors.write_batch_column_fails", display:{id:'errors.write_batch_column_fails', field:'errors.write_batch_column_fails', minWidth:160, name:"Write Column Batch Fails", groupable:false}},
            {select:"SUM(errors.write_batch_column_fails)", display:{id:'SUM(errors.write_batch_column_fails)', field:'SUM(errors.write_batch_column_fails)', minWidth:160, name:"SUM (Write Column Batch Fails)", groupable:false}},
            {select:"MIN(errors.write_batch_column_fails_fails)", display:{id:'MIN(errors.write_batch_column_fails)', field:'MIN(errors.write_batch_column_fails)', minWidth:160, name:"MIN (Write Column Batch Fails)", groupable:false}},
            {select:"MAX(errors.write_batch_column_fails)", display:{id:'MAX(errors.write_batch_column_fails)', field:'MAX(errors.write_batch_column_fails)', minWidth:160, name:"MAX (Write Column Batch Fails)", groupable:false}},

            {select:"errors.read_column_fails", display:{id:'errors.read_column_fails', field:'errors.read_column_fails', minWidth:160, name:"Read Column Fails", groupable:false}},
            {select:"SUM(errors.read_column_fails)", display:{id:'SUM(errors.read_column_fails)', field:'SUM(errors.read_column_fails)', minWidth:160, name:"SUM (Read Column Fails)", groupable:false}},
            {select:"MIN(errors.read_column_fails_fails)", display:{id:'MIN(errors.read_column_fails)', field:'MIN(errors.read_column_fails)', minWidth:160, name:"MIN (Read Column Fails)", groupable:false}},
            {select:"MAX(errors.read_column_fails)", display:{id:'MAX(errors.read_column_fails)', field:'MAX(errors.read_column_fails)', minWidth:160, name:"MAX (Read Column Fails)", groupable:false}}
        ],
        "StatTable.FieldNames.fields" : [
            {select:"COUNT(fields)", display:{id:'COUNT(fields)', field:'COUNT(fields)', minWidth:120, name:"Count (Field String)", groupable:false}},
            {select:"fields.value", display:{id:'fields.value', field:'fields.value', minWidth:150, name:"Value", groupable:false}}
        ],
        "StatTable.FieldNames.fieldi" : [
            {select:"COUNT(fieldi)", display:{id:'COUNT(fieldi)', field:'COUNT(fieldi)', minWidth:120, name:"Count (Field Integer)", groupable:false}},
            {select:"fieldi.value", display:{id:'fieldi.value', field:'fieldi.value', minWidth:150, name:"Value", groupable:false}},
            {select:"SUM(fieldi.value)", display:{id:'SUM(fieldi.value)', field:'SUM(fieldi.value)', minWidth:150, name:"SUM (Value)", groupable:false}},
            {select:"MIN(fieldi.value)", display:{id:'MIN(fieldi.value)', field:'MIN(fieldi.value)', minWidth:150, name:"MIN (Value)", groupable:false}},
            {select:"MAX(fieldi.value)", display:{id:'MAX(fieldi.value)', field:'MAX(fieldi.value)', minWidth:150, name:"MAX (Value)", groupable:false}}
        ],
        "StatTable.QueryPerfInfo.query_stats" : [
            {select:"COUNT(query_stats)", display:{id:'COUNT(query_stats)', field:'COUNT(query_stats)', minWidth:120, name:"Count (Query Stats)", groupable:false}},
            {select:"table", display:{id:'table', field:'table', minWidth:150, name:"Table", groupable:false}},

            {select:"query_stats.time", display:{id:'query_stats.time', field:'query_stats.time', minWidth:150, name:"Query Time", groupable:false}},
            {select:"SUM(query_stats.time)", display:{id:'SUM(query_stats.time)', field:'SUM(query_stats.time)', minWidth:150, name:"SUM (Time Taken)", groupable:false}},
            {select:"MIN(query_stats.time)", display:{id:'MIN(query_stats.time)', field:'MIN(query_stats.time)', minWidth:150, name:"MIN (Time Taken)", groupable:false}},
            {select:"MAX(query_stats.time)", display:{id:'MAX(query_stats.time)', field:'MAX(query_stats.time)', minWidth:150, name:"MAX (Time Taken)", groupable:false}},

            {select:"query_stats.rows", display:{id:'query_stats.rows', field:'query_stats.rows', minWidth:120, name:"Rows Returned", groupable:false}},
            {select:"SUM(query_stats.rows)", display:{id:'SUM(query_stats.rows)', field:'SUM(query_stats.rows)', minWidth:150, name:"SUM (Rows Returned)", groupable:false}},
            {select:"MIN(query_stats.rows)", display:{id:'MIN(query_stats.rows)', field:'MIN(query_stats.rows)', minWidth:150, name:"MIN (Rows Returned)", groupable:false}},
            {select:"MAX(query_stats.rows)", display:{id:'MAX(query_stats.rows)', field:'MAX(query_stats.rows)', minWidth:150, name:"MAX (Rows Returned)", groupable:false}},

            {select:"query_stats.qid", display:{id:'query_stats.qid', field:'query_stats.qid', minWidth:280, name:"Query Id", groupable:false}},
            {select:"query_stats.where", display:{id:'query_stats.where', field:'query_stats.where', minWidth:300, name:"Where", groupable:false}},
            {select:"query_stats.select", display:{id:'query_stats.select', field:'query_stats.select', minWidth:300, name:"Select", groupable:false}},
            {select:"query_stats.post", display:{id:'query_stats.post', field:'query_stats.post', minWidth:300, name:"Filter", groupable:false}},

            {select:"query_stats.time_span", display:{id:'query_stats.time_span', field:'query_stats.time_span', minWidth:150, name:"Time Span", groupable:false}},
            {select:"SUM(query_stats.time_span)", display:{id:'SUM(query_stats.time_span)', field:'SUM(query_stats.time_span)', minWidth:150, name:"SUM (Time Span)", groupable:false}},
            {select:"MIN(query_stats.time_span)", display:{id:'MIN(query_stats.time_span)', field:'MIN(query_stats.time_span)', minWidth:150, name:"MIN (Time Span)", groupable:false}},
            {select:"MAX(query_stats.time_span)", display:{id:'MAX(query_stats.time_span)', field:'MAX(query_stats.time_span)', minWidth:150, name:"MAX (Time Span)", groupable:false}},

            {select:"query_stats.chunks", display:{id:'query_stats.chunks', field:'query_stats.chunks', minWidth:150, name:"Chunks", groupable:false}},
            {select:"SUM(query_stats.chunks)", display:{id:'SUM(query_stats.chunks)', field:'SUM(query_stats.chunks)', minWidth:150, name:"SUM (Chunks)", groupable:false}},
            {select:"MIN(query_stats.chunks)", display:{id:'MIN(query_stats.chunks)', field:'MIN(query_stats.chunks)', minWidth:150, name:"MIN (Chunks)", groupable:false}},
            {select:"MAX(query_stats.chunks)", display:{id:'MAX(query_stats.chunks)', field:'MAX(query_stats.chunks)', minWidth:150, name:"MAX (Chunks)", groupable:false}},

            {select:"query_stats.chunk_where_time", display:{id:'query_stats.chunk_where_time', field:'query_stats.chunk_where_time', minWidth:130, name:"Chunk Where Time", groupable:false}},
            {select:"query_stats.chunk_select_time", display:{id:'query_stats.chunk_select_time', field:'query_stats.chunk_select_time', minWidth:130, name:"Chunk Select Time", groupable:false}},
            {select:"query_stats.chunk_postproc_time", display:{id:'query_stats.chunk_postproc_time', field:'query_stats.chunk_postproc_time', minWidth:140, name:"Chunk Postproc Time", groupable:false}},
            {select:"query_stats.chunk_merge_time", display:{id:'query_stats.chunk_merge_time', field:'query_stats.chunk_merge_time', minWidth:130, name:"Chunk Merge Time", groupable:false}},
            {select:"query_stats.final_merge_time", display:{id:'query_stats.final_merge_time', field:'query_stats.final_merge_time', minWidth:130, name:"Final Merge Time", groupable:false}},
            {select:"SUM(query_stats.final_merge_time)", display:{id:'SUM(query_stats.final_merge_time)', field:'SUM(query_stats.final_merge_time)', minWidth:150, name:"SUM (Final Merge Time)", groupable:false}},
            {select:"MIN(query_stats.final_merge_time)", display:{id:'MIN(query_stats.final_merge_time)', field:'MIN(query_stats.final_merge_time)', minWidth:150, name:"MIN (Final Merge Time)", groupable:false}},
            {select:"MAX(query_stats.final_merge_time)", display:{id:'MAX(query_stats.final_merge_time)', field:'MAX(query_stats.final_merge_time)', minWidth:150, name:"MAX (Final Merge Time)", groupable:false}}
        ],
        "StatTable.UveVirtualNetworkAgent.vn_stats" : [
            {select:"COUNT(vn_stats)", display:{id:'COUNT(vn_stats)', field:'COUNT(vn_stats)', minWidth:120, name:"Count (VN Stats)", groupable:false}},
            {select:"vn_stats.other_vn", display:{id:'vn_stats.other_vn', field:'vn_stats.other_vn', minWidth:250, name:"Other VN", groupable:false}},
            {select:"vn_stats.vrouter", display:{id:'vn_stats.vrouter', field:'vn_stats.vrouter', minWidth:120, title:"vRouter", groupable:false}},

            {select:"vn_stats.in_tpkts", display:{id:'vn_stats.in_tpkts', field:'vn_stats.in_tpkts', minWidth:120, name:"In Packets", groupable:false}},
            {select:"SUM(vn_stats.in_tpkts)", display:{id:'SUM(vn_stats.in_tpkts)', field:'SUM(vn_stats.in_tpkts)', minWidth:120, name:"SUM (In Packets)", groupable:false}},
            {select:"MIN(vn_stats.in_tpkts)", display:{id:'MIN(vn_stats.in_tpkts)', field:'MIN(vn_stats.in_tpkts)', minWidth:120, name:"MIN (In Packets)", groupable:false}},
            {select:"MAX(vn_stats.in_tpkts)", display:{id:'MAX(vn_stats.in_tpkts)', field:'MAX(vn_stats.in_tpkts)', minWidth:120, name:"MAX (In Packets)", groupable:false}},

            {select:"vn_stats.in_bytes", display:{id:'vn_stats.in_bytes', field:'vn_stats.in_bytes', minWidth:120, name:"In Bytes", groupable:false}},
            {select:"SUM(vn_stats.in_bytes)", display:{id:'SUM(vn_stats.in_bytes)', field:'SUM(vn_stats.in_bytes)', minWidth:120, name:"SUM (In Bytes)", groupable:false}},
            {select:"MIN(vn_stats.in_bytes)", display:{id:'MIN(vn_stats.in_bytes)', field:'MIN(vn_stats.in_bytes)', minWidth:120, name:"MIN (In Bytes)", groupable:false}},
            {select:"MAX(vn_stats.in_bytes)", display:{id:'MAX(vn_stats.in_bytes)', field:'MAX(vn_stats.in_bytes)', minWidth:120, name:"MAX (In Bytes)", groupable:false}},


            {select:"vn_stats.out_tpkts", display:{id:'vn_stats.out_tpkts', field:'vn_stats.out_tpkts', minWidth:120, name:"Out Packets", groupable:false}},
            {select:"SUM(vn_stats.out_tpkts)", display:{id:'SUM(vn_stats.out_tpkts)', field:'SUM(vn_stats.out_tpkts)', minWidth:120, name:"SUM (Out Packets)", groupable:false}},
            {select:"MIN(vn_stats.out_tpkts)", display:{id:'MIN(vn_stats.out_tpkts)', field:'MIN(vn_stats.out_tpkts)', minWidth:120, name:"MIN (Out Packets)", groupable:false}},
            {select:"MAX(vn_stats.out_tpkts)", display:{id:'MAX(vn_stats.out_tpkts)', field:'MAX(vn_stats.out_tpkts)', minWidth:120, name:"MAX (Out Packets)", groupable:false}},

            {select:"vn_stats.out_bytes", display:{id:'vn_stats.out_bytes', field:'vn_stats.out_bytes', minWidth:120, name:"Out Bytes", groupable:false}},
            {select:"SUM(vn_stats.out_bytes)", display:{id:'SUM(vn_stats.out_bytes)', field:'SUM(vn_stats.out_bytes)', minWidth:120, name:"SUM (Out Bytes)", groupable:false}},
            {select:"MIN(vn_stats.out_bytes)", display:{id:'MIN(vn_stats.out_bytes)', field:'MIN(vn_stats.out_bytes)', minWidth:120, name:"MIN (Out Bytes)", groupable:false}},
            {select:"MAX(vn_stats.out_bytes)", display:{id:'MAX(vn_stats.out_bytes)', field:'MAX(vn_stats.out_bytes)', minWidth:120, name:"MAX (Out Bytes)", groupable:false}}
        ],
        "StatTable.DatabasePurgeInfo.stats" : [
            {select:"COUNT(stats)", display:{id:'COUNT(stats)', field:'COUNT(stats)', minWidth:120, name:"Count (Stats)", groupable:false}},
            {select:"stats.purge_id", display:{id:'stats.purge_id', field:'stats.purge_id', minWidth:280, name:"Purge Id", groupable:false}},
            {select:"stats.purge_status", display:{id:'stats.purge_status', field:'stats.purge_status', minWidth:280, name:"Purge Status", groupable:false}},

            {select:"stats.request_time", display:{id:'stats.request_time', field:'stats.request_time', minWidth:280, name:"Request Time", groupable:false}},
            {select:"SUM(stats.request_time)", display:{id:'SUM(stats.request_time)', field:'SUM(stats.request_time)', minWidth:280, name:"SUM (Request Time)", groupable:false}},
            {select:"MIN(stats.request_time)", display:{id:'MIN(stats.request_time)', field:'MIN(stats.request_time)', minWidth:280, name:"MIN (Request Time)", groupable:false}},
            {select:"MAX(stats.request_time)", display:{id:'MAX(stats.request_time)', field:'MAX(stats.request_time)', minWidth:280, name:"MAX (Request Time)", groupable:false}},

            {select:"stats.rows_deleted", display:{id:'stats.rows_deleted', field:'stats.rows_deleted', minWidth:150, name:"Rows Deleted", groupable:false}},
            {select:"SUM(stats.rows_deleted)", display:{id:'SUM(stats.rows_deleted)', field:'SUM(stats.rows_deleted)', minWidth:150, name:"SUM (Rows Deleted)", groupable:false}},
            {select:"MIN(stats.rows_deleted)", display:{id:'MIN(stats.rows_deleted)', field:'MIN(stats.rows_deleted)', minWidth:150, name:"MIN (Rows Deleted)", groupable:false}},
            {select:"MAX(stats.rows_deleted)", display:{id:'MAX(stats.rows_deleted)', field:'MAX(stats.rows_deleted)', minWidth:150, name:"MAX (Rows Deleted)", groupable:false}},

            {select:"stats.duration", display:{id:'stats.duration', field:'stats.duration', minWidth:280, name:"Time Duration", groupable:false}},
            {select:"SUM(stats.duration)", display:{id:'SUM(stats.duration)', field:'SUM(stats.duration)', minWidth:280, name:"SUM (Time Duration)", groupable:false}},
            {select:"MIN(stats.duration)", display:{id:'MIN(stats.duration)', field:'MIN(stats.duration)', minWidth:280, name:"MIN (Time Duration)", groupable:false}},
            {select:"MAX(stats.duration)", display:{id:'MAX(stats.duration)', field:'MAX(stats.duration)', minWidth:280, name:"MAX (Time Duration)", groupable:false}}
        ],
        "StatTable.DatabaseUsageInfo.database_usage_stats" : [
            {select:"COUNT(database_usage_stats)", display:{id:'COUNT(database_usage_stats)', field:'COUNT(database_usage_stats)', minWidth:120, name:"Count (DB Usage Stats)", groupable:false}},

            {select:"database_usage_stats.disk_space_used_1k", display:{id:'database_usage_stats.disk_space_used_1k', field:'database_usage_stats.disk_space_used_1k', minWidth:160, name:"Disk Space Used 1k", groupable:false}},
            {select:"SUM(database_usage_stats.disk_space_used_1k)", display:{id:'SUM(database_usage_stats.disk_space_used_1k)', field:'SUM(database_usage_stats.disk_space_used_1k)', minWidth:160, name:"SUM (Disk Space Used 1k)", groupable:false}},
            {select:"MIN(database_usage_stats.disk_space_used_1k)", display:{id:'MIN(database_usage_stats.disk_space_used_1k)', field:'MIN(database_usage_stats.disk_space_used_1k)', minWidth:160, name:"MIN (Disk Space Used 1k)", groupable:false}},
            {select:"MAX(database_usage_stats.disk_space_used_1k)", display:{id:'MAX(database_usage_stats.disk_space_used_1k)', field:'MAX(database_usage_stats.disk_space_used_1k)', minWidth:160, name:"MAX (Disk Space Used 1k)", groupable:false}},

            {select:"database_usage_stats.disk_space_available_1k", display:{id:'database_usage_stats.disk_space_available_1k', field:'database_usage_stats.disk_space_available_1k', minWidth:160, name:"Disk Space Avail 1k", groupable:false}},
            {select:"SUM(database_usage_stats.disk_space_available_1k)", display:{id:'SUM(database_usage_stats.disk_space_available_1k)', field:'SUM(database_usage_stats.disk_space_available_1k)', minWidth:160, name:"SUM (Disk Space Avail 1k)", groupable:false}},
            {select:"MIN(database_usage_stats.disk_space_available_1k)", display:{id:'MIN(database_usage_stats.disk_space_available_1k)', field:'MIN(database_usage_stats.disk_space_available_1k)', minWidth:160, name:"MIN (Disk Space Avail 1k)", groupable:false}},
            {select:"MAX(database_usage_stats.disk_space_available_1k)", display:{id:'MAX(database_usage_stats.disk_space_available_1k)', field:'MAX(database_usage_stats.disk_space_available_1k)', minWidth:160, name:"MAX (Disk Space Avail 1k)", groupable:false}},

            {select:"database_usage_stats.analytics_db_size_1k", display:{id:'database_usage_stats.analytics_db_size_1k', field:'database_usage_stats.analytics_db_size_1k', minWidth:160, name:"Analytics DB Size 1k", groupable:false}},
            {select:"SUM(database_usage_stats.analytics_db_size_1k)", display:{id:'SUM(database_usage_stats.analytics_db_size_1k)', field:'SUM(database_usage_stats.analytics_db_size_1k)', minWidth:160, name:"SUM (Analytics DB Size 1k)", groupable:false}},
            {select:"MIN(database_usage_stats.analytics_db_size_1k)", display:{id:'MIN(database_usage_stats.analytics_db_size_1k)', field:'MIN(database_usage_stats.analytics_db_size_1k)', minWidth:160, name:"MIN (Analytics DB Size 1k)", groupable:false}},
            {select:"MAX(database_usage_stats.analytics_db_size_1k)", display:{id:'MAX(database_usage_stats.analytics_db_size_1k)', field:'MAX(database_usage_stats.analytics_db_size_1k)', minWidth:160, name:"MAX (Analytics DB Size 1k)", groupable:false}}
        ],
        "StatTable.ProtobufCollectorStats.tx_socket_stats" : [
            {select:"COUNT(tx_socket_stats)", display:{id:'COUNT(tx_socket_stats)', field:'COUNT(tx_socket_stats)', minWidth:160, name:"Count (Send Socket Stats)", groupable:false}},
            {select:"tx_socket_stats.average_blocked_duration", display:{id:'tx_socket_stats.average_blocked_duration', field:'tx_socket_stats.average_blocked_duration', minWidth:150, name:"Avg Blocked Duration", groupable:false}},
            {select:"tx_socket_stats.blocked_duration", display:{id:'tx_socket_stats.average_blocked_duration', field:'tx_socket_stats.average_blocked_duration', minWidth:150, name:"Blocked Duration", groupable:false}},

            {select:"tx_socket_stats.bytes", display:{id:'tx_socket_stats.bytes', field:'tx_socket_stats.bytes', minWidth:150, name:"Bytes", groupable:false}},
            {select:"SUM(tx_socket_stats.bytes)", display:{id:'SUM(tx_socket_stats.bytes)', field:'SUM(tx_socket_stats.bytes)', minWidth:150, name:"SUM (Bytes)", groupable:false}},
            {select:"MIN(tx_socket_stats.bytes)", display:{id:'MIN(tx_socket_stats.bytes)', field:'MIN(tx_socket_stats.bytes)', minWidth:150, name:"MIN (Bytes)", groupable:false}},
            {select:"MAX(tx_socket_stats.bytes)", display:{id:'MAX(tx_socket_stats.bytes)', field:'MAX(tx_socket_stats.bytes)', minWidth:150, name:"MAX (Bytes)", groupable:false}},

            {select:"tx_socket_stats.calls", display:{id:'tx_socket_stats.calls', field:'tx_socket_stats.calls', minWidth:150, name:"Calls", groupable:false}},
            {select:"SUM(tx_socket_stats.calls)", display:{id:'SUM(tx_socket_stats.calls)', field:'SUM(tx_socket_stats.calls)', minWidth:150, name:"SUM (Calls)", groupable:false}},
            {select:"MIN(tx_socket_stats.calls)", display:{id:'MIN(tx_socket_stats.calls)', field:'MIN(tx_socket_stats.calls)', minWidth:150, name:"MIN (Calls)", groupable:false}},
            {select:"MAX(tx_socket_stats.calls)", display:{id:'MAX(tx_socket_stats.calls)', field:'MAX(tx_socket_stats.calls)', minWidth:150, name:"MAX (Calls)", groupable:false}},

            {select:"tx_socket_stats.average_bytes", display:{id:'tx_socket_stats.average_bytes', field:'tx_socket_stats.average_bytes', minWidth:150, name:"Avg Bytes", groupable:false}},
            {select:"SUM(tx_socket_stats.average_bytes)", display:{id:'SUM(tx_socket_stats.average_bytes)', field:'SUM(tx_socket_stats.average_bytes)', minWidth:150, name:"SUM (Avg Bytes)", groupable:false}},
            {select:"MIN(tx_socket_stats.average_bytes)", display:{id:'MIN(tx_socket_stats.average_bytes)', field:'MIN(tx_socket_stats.average_bytes)', minWidth:150, name:"MIN (Avg Bytes)", groupable:false}},
            {select:"MAX(tx_socket_stats.average_bytes)", display:{id:'MAX(tx_socket_stats.average_bytes)', field:'MAX(tx_socket_stats.average_bytes)', minWidth:150, name:"MAX (Avg Bytes)", groupable:false}},

            {select:"tx_socket_stats.errors", display:{id:'tx_socket_stats.errors', field:'tx_socket_stats.errors', minWidth:150, name:"Errors", groupable:false}},
            {select:"SUM(tx_socket_stats.errors)", display:{id:'SUM(tx_socket_stats.errors)', field:'SUM(tx_socket_stats.errors)', minWidth:150, name:"SUM (Errors)", groupable:false}},
            {select:"MIN(tx_socket_stats.errors)", display:{id:'MIN(tx_socket_stats.errors)', field:'MIN(tx_socket_stats.errors)', minWidth:150, name:"MIN (Errors)", groupable:false}},
            {select:"MAX(tx_socket_stats.errors)", display:{id:'MAX(tx_socket_stats.errors)', field:'MAX(tx_socket_stats.errors)', minWidth:150, name:"MAX (Errors)", groupable:false}},

            {select:"tx_socket_stats.blocked_count", display:{id:'tx_socket_stats.blocked_count', field:'tx_socket_stats.blocked_count', minWidth:150, name:"Blocked Count", groupable:false}},
            {select:"SUM(tx_socket_stats.blocked_count)", display:{id:'SUM(tx_socket_stats.blocked_count)', field:'SUM(tx_socket_stats.blocked_count)', minWidth:150, name:"SUM (Blocked Count)", groupable:false}},
            {select:"MIN(tx_socket_stats.blocked_count)", display:{id:'MIN(tx_socket_stats.blocked_count)', field:'MIN(tx_socket_stats.blocked_count)', minWidth:150, name:"MIN (Blocked Count)", groupable:false}},
            {select:"MAX(tx_socket_stats.blocked_count)", display:{id:'MAX(tx_socket_stats.blocked_count)', field:'MAX(tx_socket_stats.blocked_count)', minWidth:150, name:"MAX (Blocked Count)", groupable:false}}
        ],
        "StatTable.ProtobufCollectorStats.rx_socket_stats" : [
            {select:"COUNT(rx_socket_stats)", display:{id:'COUNT(rx_socket_stats)', field:'COUNT(rx_socket_stats)', minWidth:160, name:"Count (Receive Socket Stats)", groupable:false}},
            {select:"rx_socket_stats.blocked_duration", display:{id:'rx_socket_stats.average_blocked_duration', field:'rx_socket_stats.blocked_duration', minWidth:150, name:"Blocked Duration", groupable:false}},
            {select:"rx_socket_stats.average_blocked_duration", display:{id:'rx_socket_stats.average_blocked_duration', field:'rx_socket_stats.average_blocked_duration', minWidth:160, name:"Avg Blocked Duration", groupable:false}},

            {select:"rx_socket_stats.bytes", display:{id:'rx_socket_stats.bytes', field:'rx_socket_stats.bytes', minWidth:150, name:"Bytes", groupable:false}},
            {select:"SUM(rx_socket_stats.bytes)", display:{id:'SUM(rx_socket_stats.bytes)', field:'SUM(rx_socket_stats.bytes)', minWidth:150, name:"SUM (Bytes)", groupable:false}},
            {select:"MIN(rx_socket_stats.bytes)", display:{id:'MIN(rx_socket_stats.bytes)', field:'MIN(rx_socket_stats.bytes)', minWidth:150, name:"MIN (Bytes)", groupable:false}},
            {select:"MAX(rx_socket_stats.bytes)", display:{id:'MAX(rx_socket_stats.bytes)', field:'MAX(rx_socket_stats.bytes)', minWidth:150, name:"MAX (Bytes)", groupable:false}},

            {select:"rx_socket_stats.calls", display:{id:'rx_socket_stats.calls', field:'rx_socket_stats.calls', minWidth:150, name:"Calls", groupable:false}},
            {select:"SUM(rx_socket_stats.calls)", display:{id:'SUM(rx_socket_stats.calls)', field:'SUM(rx_socket_stats.calls)', minWidth:150, name:"SUM (Calls)", groupable:false}},
            {select:"MIN(rx_socket_stats.calls)", display:{id:'MIN(rx_socket_stats.calls)', field:'MIN(rx_socket_stats.calls)', minWidth:150, name:"MIN (Calls)", groupable:false}},
            {select:"MAX(rx_socket_stats.calls)", display:{id:'MAX(rx_socket_stats.calls)', field:'MAX(rx_socket_stats.calls)', minWidth:150, name:"MAX (Calls)", groupable:false}},

            {select:"rx_socket_stats.average_bytes", display:{id:'rx_socket_stats.average_bytes', field:'rx_socket_stats.average_bytes', minWidth:150, name:"Avg Bytes", groupable:false}},
            {select:"SUM(rx_socket_stats.average_bytes)", display:{id:'SUM(rx_socket_stats.average_bytes)', field:'SUM(rx_socket_stats.average_bytes)', minWidth:150, name:"SUM (Avg Bytes)", groupable:false}},
            {select:"MIN(rx_socket_stats.average_bytes)", display:{id:'MIN(rx_socket_stats.average_bytes)', field:'MIN(rx_socket_stats.average_bytes)', minWidth:150, name:"MIN (Avg Bytes)", groupable:false}},
            {select:"MAX(rx_socket_stats.average_bytes)", display:{id:'MAX(rx_socket_stats.average_bytes)', field:'MAX(rx_socket_stats.average_bytes)', minWidth:150, name:"MAX (Avg Bytes)", groupable:false}},

            {select:"rx_socket_stats.errors", display:{id:'rx_socket_stats.errors', field:'rx_socket_stats.errors', minWidth:150, name:"Errors", groupable:false}},
            {select:"SUM(rx_socket_stats.errors)", display:{id:'SUM(rx_socket_stats.errors)', field:'SUM(rx_socket_stats.errors)', minWidth:150, name:"SUM (Errors)", groupable:false}},
            {select:"MIN(rx_socket_stats.errors)", display:{id:'MIN(rx_socket_stats.errors)', field:'MIN(rx_socket_stats.errors)', minWidth:150, name:"MIN (Errors)", groupable:false}},
            {select:"MAX(rx_socket_stats.errors)", display:{id:'MAX(rx_socket_stats.errors)', field:'MAX(rx_socket_stats.errors)', minWidth:150, name:"MAX (Errors)", groupable:false}},

            {select:"rx_socket_stats.blocked_count", display:{id:'rx_socket_stats.blocked_count', field:'rx_socket_stats.blocked_count', minWidth:150, name:"Blocked Count", groupable:false}},
            {select:"SUM(rx_socket_stats.blocked_count)", display:{id:'SUM(rx_socket_stats.blocked_count)', field:'SUM(rx_socket_stats.blocked_count)', minWidth:150, name:"SUM (Blocked Count)", groupable:false}},
            {select:"MIN(rx_socket_stats.blocked_count)", display:{id:'MIN(rx_socket_stats.blocked_count)', field:'MIN(rx_socket_stats.blocked_count)', minWidth:150, name:"MIN (Blocked Count)", groupable:false}},
            {select:"MAX(rx_socket_stats.blocked_count)", display:{id:'MAX(rx_socket_stats.blocked_count)', field:'MAX(rx_socket_stats.blocked_count)', minWidth:150, name:"MAX (Blocked Count)", groupable:false}}
        ],
        "StatTable.ProtobufCollectorStats.rx_message_stats" : [
            {select:"COUNT(rx_message_stats)", display:{id:'COUNT(rx_message_stats)', field:'COUNT(rx_message_stats)', minWidth:160, name:"Count (Receive Socket Stats)", groupable:false}},
            {select:"rx_message_stats.endpoint_name", display:{id:'rx_message_stats.endpoint_name', field:'rx_message_stats.endpoint_name', minWidth:150, name:"Endpoint Name", groupable:false}},
            {select:"rx_message_stats.message_name", display:{id:'rx_message_stats.message_name', field:'rx_message_stats.message_name', minWidth:150, name:"Message Name", groupable:false}},

            {select:"rx_message_stats.messages", display:{id:'rx_message_stats.messages', field:'rx_message_stats.messages', minWidth:150, name:"Messages", groupable:false}},
            {select:"SUM(rx_message_stats.messages)", display:{id:'SUM(rx_message_stats.messages)', field:'SUM(rx_message_stats.messages)', minWidth:150, name:"SUM (Messages)", groupable:false}},
            {select:"MIN(rx_message_stats.messages)", display:{id:'MIN(rx_message_stats.messages)', field:'MIN(rx_message_stats.messages)', minWidth:150, name:"MIN (Messages)", groupable:false}},
            {select:"MAX(rx_message_stats.messages)", display:{id:'MAX(rx_message_stats.messages)', field:'MAX(rx_message_stats.messages)', minWidth:150, name:"MAX (Messages)", groupable:false}},

            {select:"rx_message_stats.bytes", display:{id:'rx_message_stats.bytes', field:'rx_message_stats.bytes', minWidth:150, name:"Bytes", groupable:false}},
            {select:"SUM(rx_message_stats.bytes)", display:{id:'SUM(rx_message_stats.bytes)', field:'SUM(rx_message_stats.bytes)', minWidth:150, name:"SUM (Bytes)", groupable:false}},
            {select:"MIN(rx_message_stats.bytes)", display:{id:'MIN(rx_message_stats.bytes)', field:'MIN(rx_message_stats.bytes)', minWidth:150, name:"MIN (Bytes)", groupable:false}},
            {select:"MAX(rx_message_stats.bytes)", display:{id:'MAX(rx_message_stats.bytes)', field:'MAX(rx_message_stats.bytes)', minWidth:150, name:"MAX (Bytes)", groupable:false}},

            {select:"rx_message_stats.errors", display:{id:'rx_message_stats.errors', field:'rx_message_stats.errors', minWidth:150, name:"Errors", groupable:false}},
            {select:"SUM(rx_message_stats.errors)", display:{id:'SUM(rx_message_stats.errors)', field:'SUM(rx_message_stats.errors)', minWidth:150, name:"SUM (Errors)", groupable:false}},
            {select:"MIN(rx_message_stats.errors)", display:{id:'MIN(rx_message_stats.errors)', field:'MIN(rx_message_stats.errors)', minWidth:150, name:"MIN (Errors)", groupable:false}},
            {select:"MAX(rx_message_stats.errors)", display:{id:'MAX(rx_message_stats.errors)', field:'MAX(rx_message_stats.errors)', minWidth:150, name:"MAX (Errors)", groupable:false}},

            {select:"rx_message_stats.last_timestamp", display:{id:'rx_message_stats.last_timestamp', field:'rx_message_stats.last_timestamp', minWidth:150, name:"Last Timestamp", groupable:false}},
            {select:"SUM(rx_message_stats.last_timestamp)", display:{id:'SUM(rx_message_stats.last_timestamp)', field:'SUM(rx_message_stats.last_timestamp)', minWidth:150, name:"SUM (Last Timestamp)", groupable:false}},
            {select:"MIN(rx_message_stats.last_timestamp)", display:{id:'MIN(rx_message_stats.last_timestamp)', field:'MIN(rx_message_stats.last_timestamp)', minWidth:150, name:"MIN (Last Timestamp)", groupable:false}},
            {select:"MAX(rx_message_stats.last_timestamp)", display:{id:'MAX(rx_message_stats.last_timestamp)', field:'MAX(rx_message_stats.last_timestamp)', minWidth:150, name:"MAX (Last Timestamp)", groupable:false}}
        ],

        "StatTable.ProtobufCollectorStats.db_table_info" : [
            {select:"COUNT(db_table_info)", display:{id:'COUNT(db_table_info)', field:'COUNT(db_table_info)', minWidth:120, name:"Count (Table Info)", groupable:false}},
            {select:"db_table_info.table_name", display:{id:'db_table_info.table_name', field:'db_table_info.table_name', minWidth:150, name:"Table Name", groupable:false}},

            {select:"db_table_info.reads", display:{id:'db_table_info.reads', field:'db_table_info.reads', minWidth:150, name:"Reads", groupable:false}},
            {select:"SUM(db_table_info.reads)", display:{id:'SUM(db_table_info.reads)', field:'SUM(db_table_info.reads)', minWidth:150, name:"SUM (Reads)", groupable:false}},
            {select:"MIN(db_table_info.reads)", display:{id:'MIN(db_table_info.reads)', field:'MIN(db_table_info.reads)', minWidth:150, name:"MIN (Reads)", groupable:false}},
            {select:"MAX(db_table_info.reads)", display:{id:'MAX(db_table_info.reads)', field:'MAX(db_table_info.reads)', minWidth:150, name:"MAX (Reads)", groupable:false}},

            {select:"db_table_info.read_fails", display:{id:'db_table_info.read_fails', field:'db_table_info.read_fails', minWidth:150, name:"read_fails", groupable:false}},
            {select:"SUM(db_table_info.read_fails)", display:{id:'SUM(db_table_info.read_fails)', field:'SUM(db_table_info.read_fails)', minWidth:150, name:"SUM (Read Fails)", groupable:false}},
            {select:"MIN(db_table_info.read_fails)", display:{id:'MIN(db_table_info.read_fails)', field:'MIN(db_table_info.read_fails)', minWidth:150, name:"MIN (Read Fails)", groupable:false}},
            {select:"MAX(db_table_info.read_fails)", display:{id:'MAX(db_table_info.read_fails)', field:'MAX(db_table_info.read_fails)', minWidth:150, name:"MAX (Read Fails)", groupable:false}},

            {select:"db_table_info.writes", display:{id:'db_table_info.writes', field:'db_table_info.writes', minWidth:150, name:"Writes", groupable:false}},
            {select:"SUM(db_table_info.writes)", display:{id:'SUM(db_table_info.writes)', field:'SUM(db_table_info.writes)', minWidth:150, name:"SUM (Writes)", groupable:false}},
            {select:"MIN(db_table_info.writes)", display:{id:'MIN(db_table_info.writes)', field:'MIN(db_table_info.writes)', minWidth:150, name:"MIN (Writes)", groupable:false}},
            {select:"MAX(db_table_info.writes)", display:{id:'MAX(db_table_info.writes)', field:'MAX(db_table_info.writes)', minWidth:150, name:"MAX (Writes)", groupable:false}},

            {select:"db_table_info.write_fails", display:{id:'db_table_info.write_fails', field:'db_table_info.write_fails', minWidth:150, name:"Write Fails", groupable:false}},
            {select:"SUM(db_table_info.write_fails)", display:{id:'SUM(db_table_info.write_fails)', field:'SUM(db_table_info.write_fails)', minWidth:150, name:"SUM (Write Fails)", groupable:false}},
            {select:"MIN(db_table_info.write_fails)", display:{id:'MIN(db_table_info.write_fails)', field:'MIN(db_table_info.write_fails)', minWidth:150, name:"MIN (Write Fails)", groupable:false}},
            {select:"MAX(db_table_info.write_fails)", display:{id:'MAX(db_table_info.write_fails)', field:'MAX(db_table_info.write_fails)', minWidth:150, name:"MAX (Write Fails)", groupable:false}},

        ],
        "StatTable.ProtobufCollectorStats.db_statistics_table_info" : [
            {select:"COUNT(db_statistics_table_info)", display:{id:'COUNT(db_statistics_table_info)', field:'COUNT(db_statistics_table_info)', minWidth:120, name:"Count (Table Info)", groupable:false}},
            {select:"db_statistics_table_info.table_name", display:{id:'db_statistics_table_info.table_name', field:'db_statistics_table_info.table_name', minWidth:150, name:"Table Name", groupable:false}},

            {select:"db_statistics_table_info.reads", display:{id:'db_statistics_table_info.reads', field:'db_statistics_table_info.reads', minWidth:150, name:"Reads", groupable:false}},
            {select:"SUM(db_statistics_table_info.reads)", display:{id:'SUM(db_statistics_table_info.reads)', field:'SUM(db_statistics_table_info.reads)', minWidth:150, name:"SUM (Reads)", groupable:false}},
            {select:"MIN(db_statistics_table_info.reads)", display:{id:'MIN(db_statistics_table_info.reads)', field:'MIN(db_statistics_table_info.reads)', minWidth:150, name:"MIN (Reads)", groupable:false}},
            {select:"MAX(db_statistics_table_info.reads)", display:{id:'MAX(db_statistics_table_info.reads)', field:'MAX(db_statistics_table_info.reads)', minWidth:150, name:"MAX (Reads)", groupable:false}},

            {select:"db_statistics_table_info.read_fails", display:{id:'db_statistics_table_info.read_fails', field:'db_statistics_table_info.read_fails', minWidth:150, name:"read_fails", groupable:false}},
            {select:"SUM(db_statistics_table_info.read_fails)", display:{id:'SUM(db_statistics_table_info.read_fails)', field:'SUM(db_statistics_table_info.read_fails)', minWidth:150, name:"SUM (Read Fails)", groupable:false}},
            {select:"MIN(db_statistics_table_info.read_fails)", display:{id:'MIN(db_statistics_table_info.read_fails)', field:'MIN(db_statistics_table_info.read_fails)', minWidth:150, name:"MIN (Read Fails)", groupable:false}},
            {select:"MAX(db_statistics_table_info.read_fails)", display:{id:'MAX(db_statistics_table_info.read_fails)', field:'MAX(db_statistics_table_info.read_fails)', minWidth:150, name:"MAX (Read Fails)", groupable:false}},

            {select:"db_statistics_table_info.writes", display:{id:'db_statistics_table_info.writes', field:'db_statistics_table_info.writes', minWidth:150, name:"Writes", groupable:false}},
            {select:"SUM(db_statistics_table_info.writes)", display:{id:'SUM(db_statistics_table_info.writes)', field:'SUM(db_statistics_table_info.writes)', minWidth:150, name:"SUM (Writes)", groupable:false}},
            {select:"MIN(db_statistics_table_info.writes)", display:{id:'MIN(db_statistics_table_info.writes)', field:'MIN(db_statistics_table_info.writes)', minWidth:150, name:"MIN (Writes)", groupable:false}},
            {select:"MAX(db_statistics_table_info.writes)", display:{id:'MAX(db_statistics_table_info.writes)', field:'MAX(db_statistics_table_info.writes)', minWidth:150, name:"MAX (Writes)", groupable:false}},

            {select:"db_statistics_table_info.write_fails", display:{id:'db_statistics_table_info.write_fails', field:'db_statistics_table_info.write_fails', minWidth:150, name:"Write Fails", groupable:false}},
            {select:"SUM(db_statistics_table_info.write_fails)", display:{id:'SUM(db_statistics_table_info.write_fails)', field:'SUM(db_statistics_table_info.write_fails)', minWidth:150, name:"SUM (Write Fails)", groupable:false}},
            {select:"MIN(db_statistics_table_info.write_fails)", display:{id:'MIN(db_statistics_table_info.write_fails)', field:'MIN(db_statistics_table_info.write_fails)', minWidth:150, name:"MIN (Write Fails)", groupable:false}},
            {select:"MAX(db_statistics_table_info.write_fails)", display:{id:'MAX(db_statistics_table_info.write_fails)', field:'MAX(db_statistics_table_info.write_fails)', minWidth:150, name:"MAX (Write Fails)", groupable:false}},

        ],
        "StatTable.ProtobufCollectorStats.db_errors" : [
            {select:"COUNT(db_errors)", display:{id:'COUNT(db_errors)', field:'COUNT(db_errors)', minWidth:120, name:"Count (DB Errors)", groupable:false}},

            {select:"db_errors.write_tablespace_fails", display:{id:'db_errors.write_tablespace_fails', field:'db_errors.write_tablespace_fails', minWidth:150, name:"Write Tablespace Fails", groupable:false}},
            {select:"SUM(db_errors.write_tablespace_fails)", display:{id:'SUM(db_errors.write_tablespace_fails)', field:'SUM(db_errors.write_tablespace_fails)', minWidth:150, name:"SUM (Write Tablespace Fails)", groupable:false}},
            {select:"MIN(db_errors.write_tablespace_fails)", display:{id:'MIN(db_errors.write_tablespace_fails)', field:'MIN(db_errors.write_tablespace_fails)', minWidth:150, name:"MIN (Write Tablespace Fails)", groupable:false}},
            {select:"MAX(db_errors.write_tablespace_fails)", display:{id:'MAX(db_errors.write_tablespace_fails)', field:'MAX(db_errors.write_tablespace_fails)', minWidth:150, name:"MAX (Write Tablespace Fails)", groupable:false}},

            {select:"db_errors.read_tablespace_fails", display:{id:'db_errors.read_tablespace_fails', field:'db_errors.read_tablespace_fails', minWidth:150, name:"Read Tablespace Fails", groupable:false}},
            {select:"SUM(db_errors.read_tablespace_fails)", display:{id:'SUM(db_errors.read_tablespace_fails)', field:'SUM(db_errors.read_tablespace_fails)', minWidth:150, name:"SUM (Read Tablespace Fails)", groupable:false}},
            {select:"MIN(db_errors.read_tablespace_fails)", display:{id:'MIN(db_errors.read_tablespace_fails)', field:'MIN(db_errors.read_tablespace_fails)', minWidth:150, name:"MIN (Read Tablespace Fails)", groupable:false}},
            {select:"MAX(db_errors.read_tablespace_fails)", display:{id:'MAX(db_errors.read_tablespace_fails)', field:'MAX(db_errors.read_tablespace_fails)', minWidth:150, name:"MAX (Read Tablespace Fails)", groupable:false}},

            {select:"db_errors.write_table_fails", display:{id:'db_errors.write_table_fails', field:'db_errors.write_table_fails', minWidth:150, name:"Write Table Fails", groupable:false}},
            {select:"SUM(db_errors.write_table_fails)", display:{id:'SUM(db_errors.write_table_fails)', field:'SUM(db_errors.write_table_fails)', minWidth:150, name:"SUM (Write Table Fails)", groupable:false}},
            {select:"MIN(db_errors.write_table_fails)", display:{id:'MIN(db_errors.write_table_fails)', field:'MIN(db_errors.write_table_fails)', minWidth:150, name:"MIN (Write Table Fails)", groupable:false}},
            {select:"MAX(db_errors.write_table_fails)", display:{id:'MAX(db_errors.write_table_fails)', field:'MAX(db_errors.write_table_fails)', minWidth:150, name:"MAX (Write Table Fails)", groupable:false}},

            {select:"db_errors.read_table_fails", display:{id:'db_errors.read_table_fails', field:'db_errors.read_table_fails', minWidth:150, name:"Read Table Fails", groupable:false}},
            {select:"SUM(db_errors.read_table_fails)", display:{id:'SUM(db_errors.read_table_fails)', field:'SUM(db_errors.read_table_fails)', minWidth:150, name:"SUM (Read Table Fails)", groupable:false}},
            {select:"MIN(db_errors.read_table_fails)", display:{id:'MIN(db_errors.read_table_fails)', field:'MIN(db_errors.read_table_fails)', minWidth:150, name:"MIN (Read Table Fails)", groupable:false}},
            {select:"MAX(db_errors.read_table_fails)", display:{id:'MAX(db_errors.read_table_fails)', field:'MAX(db_errors.read_table_fails)', minWidth:150, name:"MAX (Read Table Fails)", groupable:false}},

            {select:"db_errors.write_column_fails", display:{id:'db_errors.write_column_fails', field:'db_errors.write_column_fails', minWidth:150, name:"Write Column Fails", groupable:false}},
            {select:"SUM(db_errors.write_column_fails)", display:{id:'SUM(db_errors.write_column_fails)', field:'SUM(db_errors.write_column_fails)', minWidth:150, name:"SUM (Write Column Fails)", groupable:false}},
            {select:"MIN(db_errors.write_column_fails)", display:{id:'MIN(db_errors.write_column_fails)', field:'MIN(db_errors.write_column_fails)', minWidth:150, name:"MIN (Write Column Fails)", groupable:false}},
            {select:"MAX(db_errors.write_column_fails)", display:{id:'MAX(db_errors.write_column_fails)', field:'MAX(db_errors.write_column_fails)', minWidth:150, name:"MAX (Write Column Fails)", groupable:false}},

            {select:"db_errors.write_batch_column_fails", display:{id:'db_errors.write_batch_column_fails', field:'db_errors.write_batch_column_fails', minWidth:150, name:"Write Batch Column Fails", groupable:false}},
            {select:"SUM(db_errors.write_batch_column_fails)", display:{id:'SUM(db_errors.write_batch_column_fails)', field:'SUM(db_errors.write_batch_column_fails)', minWidth:150, name:"SUM (Write Batch Column Fails)", groupable:false}},
            {select:"MIN(db_errors.write_batch_column_fails)", display:{id:'MIN(db_errors.write_batch_column_fails)', field:'MIN(db_errors.write_batch_column_fails)', minWidth:150, name:"MIN (Write Batch Column Fails)", groupable:false}},
            {select:"MAX(db_errors.write_batch_column_fails)", display:{id:'MAX(db_errors.write_batch_column_fails)', field:'MAX(db_errors.write_batch_column_fails)', minWidth:150, name:"MAX (Write Batch Column Fails)", groupable:false}},

            {select:"db_errors.read_column_fails", display:{id:'db_errors.read_column_fails', field:'db_errors.read_column_fails', minWidth:150, name:"Read Column Fails", groupable:false}},
            {select:"SUM(db_errors.read_column_fails)", display:{id:'SUM(db_errors.read_column_fails)', field:'SUM(db_errors.read_column_fails)', minWidth:150, name:"SUM (Read Column Fails)", groupable:false}},
            {select:"MIN(db_errors.read_column_fails)", display:{id:'MIN(db_errors.read_column_fails)', field:'MIN(db_errors.read_column_fails)', minWidth:150, name:"MIN (Read Column Fails)", groupable:false}},
            {select:"MAX(db_errors.read_column_fails)", display:{id:'MAX(db_errors.read_column_fails)', field:'MAX(db_errors.read_column_fails)', minWidth:150, name:"MAX (Read Column Fails)", groupable:false}},
        ],


        "StatTable.PFEHeapInfo.heap_info" : [
            {select:"heap_info.name", display:{id:'heap_info.name', field:'heap_info.name', minWidth:150, name:"Heap Info Name", groupable:false}},
            {select:"COUNT(heap_info)", display:{id:'COUNT(heap_info)', field:'COUNT(heap_info)', minWidth:120, name:"Count (Heap Info)", groupable:false}},

            {select:"heap_info.size", display:{id:'heap_info.size', field:'heap_info.size', minWidth:150, name:"Size", groupable:false}},
            {select:"SUM(heap_info.size)", display:{id:'SUM(heap_info.size)', field:'SUM(heap_info.size)', minWidth:150, name:"SUM (Size)", groupable:false}},
            {select:"MIN(heap_info.size)", display:{id:'MIN(heap_info.size)', field:'MIN(heap_info.size)', minWidth:150, name:"MIN (Size)", groupable:false}},
            {select:"MAX(heap_info.size)", display:{id:'MAX(heap_info.size)', field:'MAX(heap_info.size)', minWidth:150, name:"MAX (Size)", groupable:false}},

            {select:"heap_info.allocated", display:{id:'heap_info.allocated', field:'heap_info.allocated', minWidth:150, name:"Allocated", groupable:false}},
            {select:"MIN(heap_info.allocated)", display:{id:'MIN(heap_info.allocated)', field:'MIN(heap_info.allocated)', minWidth:150, name:"MIN (Allocated)", groupable:false}},
            {select:"SUM(heap_info.allocated)", display:{id:'SUM(heap_info.allocated)', field:'SUM(heap_info.allocated)', minWidth:150, name:"SUM (Allocated)", groupable:false}},
            {select:"MAX(heap_info.allocated)", display:{id:'MAX(heap_info.allocated)', field:'MAX(heap_info.allocated)', minWidth:150, name:"MAX (Allocated)", groupable:false}},

            {select:"heap_info.utilization", display:{id:'heap_info.utilization', field:'heap_info.utilization', minWidth:150, name:"Heap Info Utilization", groupable:false}},
            {select:"SUM(heap_info.utilization)", display:{id:'SUM(heap_info.utilization)', field:'SUM(heap_info.utilization)', minWidth:150, name:"SUM (Utilization)", groupable:false}},
            {select:"MIN(heap_info.utilization)", display:{id:'MIN(heap_info.utilization)', field:'MIN(heap_info.utilization)', minWidth:150, name:"MIN (Utilization)", groupable:false}},
            {select:"MAX(heap_info.utilization)", display:{id:'MAX(heap_info.utilization)', field:'MAX(heap_info.utilization)', minWidth:150, name:"MAX (Utilization)", groupable:false}}
        ],
        "StatTable.npu_mem.stats" : [
            {select:"COUNT(stats)", display:{id:'COUNT(stats)', field:'COUNT(stats)', minWidth:120, name:"Count (Stats)", groupable:false}},
            {select:"stats.pfe_identifier", display:{id:'stats.pfe_identifier', field:'stats.pfe_identifier', minWidth:150, name:"PFE Identifier", groupable:false}},
            {select:"stats.resource_name", display:{id:'stats.resource_name', field:'stats.resource_name', minWidth:150, name:"Resource Name", groupable:false}},

            {select:"stats.size", display:{id:'stats.size', field:'stats.size', minWidth:150, name:"Size", groupable:false}},
            {select:"SUM(stats.size)", display:{id:'SUM(stats.size)', field:'SUM(stats.size)', minWidth:150, name:"SUM (Size)", groupable:false}},
            {select:"MIN(stats.size)", display:{id:'MIN(stats.size)', field:'MIN(stats.size)', minWidth:150, name:"MIN (Size)", groupable:false}},
            {select:"MAX(stats.size)", display:{id:'MAX(stats.size)', field:'MAX(stats.size)', minWidth:150, name:"MAX (Size)", groupable:false}},

            {select:"stats.allocated", display:{id:'stats.allocated', field:'stats.allocated', minWidth:150, name:"Allocated", groupable:false}},
            {select:"SUM(stats.allocated)", display:{id:'SUM(stats.allocated)', field:'SUM(stats.allocated)', minWidth:150, name:"SUM (Allocated)", groupable:false}},
            {select:"MIN(stats.allocated)", display:{id:'MIN(stats.allocated)', field:'MIN(stats.allocated)', minWidth:150, name:"MIN (Allocated)", groupable:false}},
            {select:"MAX(stats.allocated)", display:{id:'MAX(stats.allocated)', field:'MAX(stats.allocated)', minWidth:150, name:"MAX (Allocated)", groupable:false}},

            {select:"stats.utilization", display:{id:'stats.utilization', field:'stats.utilization', minWidth:150, name:"Utilization", groupable:false}},
            {select:"SUM(stats.utilization)", display:{id:'SUM(stats.utilization)', field:'SUM(stats.utilization)', minWidth:150, name:"SUM (Utilization)", groupable:false}},
            {select:"MIN(stats.utilization)", display:{id:'MIN(stats.utilization)', field:'MIN(stats.utilization)', minWidth:150, name:"MIN (Utilization)", groupable:false}},
            {select:"MAX(stats.utilization)", display:{id:'MAX(stats.utilization)', field:'MAX(stats.utilization)', minWidth:150, name:"MAX (Utilization)", groupable:false}},
        ],
        "StatTable.fabric_message.edges.class_stats.transmit_counts" : [
            {select:"COUNT(edges)", display:{id:'COUNT(edges)', field:'COUNT(edges)', minWidth:120, name:"Count (Edges)", groupable:false}},
            {select:"edges.src_type", display:{id:'edges.src_type', field:'edges.src_type', minWidth:150, name:"Src Type", groupable:false}},
            {select:"edges.src_slot", display:{id:'edges.src_slot', field:'edges.src_slot', minWidth:150, name:"Src Slot", groupable:false}},
            {select:"edges.src_pfe", display:{id:'edges.src_pfe', field:'edges.src_pfe', minWidth:150, name:"Src PFE", groupable:false}},
            {select:"edges.dst_type", display:{id:'edges.dst_type', field:'edges.dst_type', minWidth:150, name:"Dest Type", groupable:false}},
            {select:"edges.dst_slot", display:{id:'edges.dst_slot', field:'edges.dst_slot', minWidth:150, name:"Dest Slot", groupable:false}},
            {select:"edges.dst_pfe", display:{id:'edges.dst_pfe', field:'edges.dst_pfe', minWidth:150, name:"Dest PFE", groupable:false}},
            {select:"edges.class_stats.priority", display:{id:'edges.class_stats.priority', field:'edges.class_stats.priority', minWidth:150, name:"Priority", groupable:false}},

            {select:"edges.class_stats.transmit_counts.packets", display:{id:'edges.class_stats.transmit_counts.packets', field:'edges.class_stats.transmit_counts.packets', minWidth:150, name:"Trans Pkt Cnt", groupable:false}},
            {select:"SUM(edges.class_stats.transmit_counts.packets)", display:{id:'SUM(edges.class_stats.transmit_counts.packets)', field:'SUM(edges.class_stats.transmit_counts.packets)', minWidth:150, name:"SUM (Trans Pkt Cnt)", groupable:false}},
            {select:"MIN(edges.class_stats.transmit_counts.packets)", display:{id:'MIN(edges.class_stats.transmit_counts.packets)', field:'MIN(edges.class_stats.transmit_counts.packets)', minWidth:150, name:"MIN (Trans Pkt Cnt)", groupable:false}},
            {select:"MAX(edges.class_stats.transmit_counts.packets)", display:{id:'MAX(edges.class_stats.transmit_counts.packets)', field:'MAX(edges.class_stats.transmit_counts.packets)', minWidth:150, name:"MAX (Trans Pkt Cnt)", groupable:false}},

            {select:"edges.class_stats.transmit_counts.pps", display:{id:'edges.class_stats.transmit_counts.pps', field:'edges.class_stats.transmit_counts.pps', minWidth:150, name:"Trans PPS Cnt", groupable:false}},
            {select:"SUM(edges.class_stats.transmit_counts.pps)", display:{id:'SUM(edges.class_stats.transmit_counts.pps)', field:'SUM(edges.class_stats.transmit_counts.pps)', minWidth:150, name:"SUM (Trans PPS Cnt)", groupable:false}},
            {select:"MIN(edges.class_stats.transmit_counts.pps)", display:{id:'MIN(edges.class_stats.transmit_counts.pps)', field:'MIN(edges.class_stats.transmit_counts.pps)', minWidth:150, name:"MIN (Trans PPS Cnt)", groupable:false}},
            {select:"MAX(edges.class_stats.transmit_counts.pps)", display:{id:'MAX(edges.class_stats.transmit_counts.pps)', field:'MAX(edges.class_stats.transmit_counts.pps)', minWidth:150, name:"MAX (Trans PPS Cnt)", groupable:false}},

            {select:"edges.class_stats.transmit_counts.bytes", display:{id:'edges.class_stats.transmit_counts.bytes', field:'edges.class_stats.transmit_counts.bytes', minWidth:150, name:"Trans Bytes Cnt", groupable:false}},
            {select:"SUM(edges.class_stats.transmit_counts.bytes)", display:{id:'SUM(edges.class_stats.transmit_counts.bytes)', field:'SUM(edges.class_stats.transmit_counts.bytes)', minWidth:150, name:"SUM (Trans Bytes Cnt)", groupable:false}},
            {select:"MIN(edges.class_stats.transmit_counts.bytes)", display:{id:'MIN(edges.class_stats.transmit_counts.bytes)', field:'MIN(edges.class_stats.transmit_counts.bytes)', minWidth:150, name:"MIN (Trans Bytes Cnt)", groupable:false}},
            {select:"MAX(edges.class_stats.transmit_counts.bytes)", display:{id:'MAX(edges.class_stats.transmit_counts.bytes)', field:'MAX(edges.class_stats.transmit_counts.bytes)', minWidth:150, name:"MAX (Trans Bytes Cnt)", groupable:false}},

            {select:"edges.class_stats.transmit_counts.bps", display:{id:'edges.class_stats.transmit_counts.bps', field:'edges.class_stats.transmit_counts.bps', minWidth:150, name:"Trans BPS Cnt", groupable:false}},
            {select:"SUM(edges.class_stats.transmit_counts.bps)", display:{id:'SUM(edges.class_stats.transmit_counts.bps)', field:'SUM(edges.class_stats.transmit_counts.bps)', minWidth:150, name:"SUM (Trans BPS Cnt)", groupable:false}},
            {select:"MIN(edges.class_stats.transmit_counts.bps)", display:{id:'MIN(edges.class_stats.transmit_counts.bps)', field:'MIN(edges.class_stats.transmit_counts.bps)', minWidth:150, name:"MIN (Trans BPS Cnt)", groupable:false}},
            {select:"MAX(edges.class_stats.transmit_counts.bps)", display:{id:'MAX(edges.class_stats.transmit_counts.bps)', field:'MAX(edges.class_stats.transmit_counts.bps)', minWidth:150, name:"MAX (Trans BPS Cnt)", groupable:false}},

            {select:"edges.class_stats.transmit_counts.drop_packets", display:{id:'edges.class_stats.transmit_counts.drop_packets', field:'edges.class_stats.transmit_counts.drop_packets', minWidth:150, name:"Trans Drop Pkts Cnt", groupable:false}},
            {select:"SUM(edges.class_stats.transmit_counts.drop_packets)", display:{id:'SUM(edges.class_stats.transmit_counts.drop_packets)', field:'SUM(edges.class_stats.transmit_counts.drop_packets)', minWidth:150, name:"SUM (Trans Drop Pkts Cnt)", groupable:false}},
            {select:"MIN(edges.class_stats.transmit_counts.drop_packets)", display:{id:'MIN(edges.class_stats.transmit_counts.drop_packets)', field:'MIN(edges.class_stats.transmit_counts.drop_packets)', minWidth:150, name:"MIN (Trans Drop Pkts Cnt)", groupable:false}},
            {select:"MAX(edges.class_stats.transmit_counts.drop_packets)", display:{id:'MAX(edges.class_stats.transmit_counts.drop_packets)', field:'MAX(edges.class_stats.transmit_counts.drop_packets)', minWidth:150, name:"MAX (Trans Drop Pkts Cnt)", groupable:false}},

            {select:"edges.class_stats.transmit_counts.drop_bytes", display:{id:'edges.class_stats.transmit_counts.drop_bytes', field:'edges.class_stats.transmit_counts.drop_bytes', minWidth:150, name:"Trans Drop Bytes Cnt", groupable:false}},
            {select:"SUM(edges.class_stats.transmit_counts.drop_bytes)", display:{id:'SUM(edges.class_stats.transmit_counts.drop_bytes)', field:'SUM(edges.class_stats.transmit_counts.drop_bytes)', minWidth:150, name:"SUM (Trans Drop Bytes Cnt)", groupable:false}},
            {select:"MIN(edges.class_stats.transmit_counts.drop_bytes)", display:{id:'MIN(edges.class_stats.transmit_counts.drop_bytes)', field:'MIN(edges.class_stats.transmit_counts.drop_bytes)', minWidth:150, name:"MIN (Trans Drop Bytes Cnt)", groupable:false}},
            {select:"MAX(edges.class_stats.transmit_counts.drop_bytes)", display:{id:'MAX(edges.class_stats.transmit_counts.drop_bytes)', field:'MAX(edges.class_stats.transmit_counts.drop_bytes)', minWidth:150, name:"MAX (Trans Drop Bytes Cnt)", groupable:false}},

            {select:"edges.class_stats.transmit_counts.drop_bps", display:{id:'edges.class_stats.transmit_counts.drop_bps', field:'edges.class_stats.transmit_counts.drop_bps', minWidth:150, name:"Trans Drop BPS Cnt", groupable:false}},
            {select:"SUM(edges.class_stats.transmit_counts.drop_bps)", display:{id:'SUM(edges.class_stats.transmit_counts.drop_bps)', field:'SUM(edges.class_stats.transmit_counts.drop_bps)', minWidth:150, name:"SUM (Trans Drop BPS Cnt)", groupable:false}},
            {select:"MIN(edges.class_stats.transmit_counts.drop_bps)", display:{id:'MIN(edges.class_stats.transmit_counts.drop_bps)', field:'MIN(edges.class_stats.transmit_counts.drop_bps)', minWidth:150, name:"MIN (Trans Drop BPS Cnt)", groupable:false}},
            {select:"MAX(edges.class_stats.transmit_counts.drop_bps)", display:{id:'MAX(edges.class_stats.transmit_counts.drop_bps)', field:'MAX(edges.class_stats.transmit_counts.drop_bps)', minWidth:150, name:"MAX (Trans Drop BPS Cnt)", groupable:false}},

            {select:"edges.class_stats.transmit_counts.drop_pps", display:{id:'edges.class_stats.transmit_counts.drop_pps', field:'edges.class_stats.transmit_counts.drop_pps', minWidth:150, name:"Trans Drop PPS Cnt", groupable:false}},
            {select:"SUM(edges.class_stats.transmit_counts.drop_pps)", display:{id:'SUM(edges.class_stats.transmit_counts.drop_pps)', field:'SUM(edges.class_stats.transmit_counts.drop_pps)', minWidth:150, name:"SUM (Trans Drop PPS Cnt)", groupable:false}},
            {select:"MIN(edges.class_stats.transmit_counts.drop_pps)", display:{id:'MIN(edges.class_stats.transmit_counts.drop_pps)', field:'MIN(edges.class_stats.transmit_counts.drop_pps)', minWidth:150, name:"MIN (Trans Drop PPS Cnt)", groupable:false}},
            {select:"MAX(edges.class_stats.transmit_counts.drop_pps)", display:{id:'MAX(edges.class_stats.transmit_counts.drop_pps)', field:'MAX(edges.class_stats.transmit_counts.drop_pps)', minWidth:150, name:"MAX (Trans Drop PPS Cnt)", groupable:false}},

            {select:"edges.class_stats.transmit_counts.q_depth_avg", display:{id:'edges.class_stats.transmit_counts.q_depth_avg', field:'edges.class_stats.transmit_counts.q_depth_avg', minWidth:150, name:"Trans Avg Q Depth", groupable:false}},
            {select:"SUM(edges.class_stats.transmit_counts.q_depth_avg)", display:{id:'SUM(edges.class_stats.transmit_counts.q_depth_avg)', field:'SUM(edges.class_stats.transmit_counts.q_depth_avg)', minWidth:150, name:"SUM (Trans Avg Q Depth)", groupable:false}},
            {select:"MIN(edges.class_stats.transmit_counts.q_depth_avg)", display:{id:'MIN(edges.class_stats.transmit_counts.q_depth_avg)', field:'MIN(edges.class_stats.transmit_counts.q_depth_avg)', minWidth:150, name:"MIN (Trans Avg Q Depth)", groupable:false}},
            {select:"MAX(edges.class_stats.transmit_counts.q_depth_avg)", display:{id:'MAX(edges.class_stats.transmit_counts.q_depth_avg)', field:'MAX(edges.class_stats.transmit_counts.q_depth_avg)', minWidth:150, name:"MAX (Trans Avg Q Depth)", groupable:false}},

            {select:"edges.class_stats.transmit_counts.q_depth_cur", display:{id:'edges.class_stats.transmit_counts.q_depth_cur', field:'edges.class_stats.transmit_counts.q_depth_cur', minWidth:150, name:"Trans Cur Q Depth", groupable:false}},
            {select:"SUM(edges.class_stats.transmit_counts.q_depth_cur)", display:{id:'SUM(edges.class_stats.transmit_counts.q_depth_cur)', field:'SUM(edges.class_stats.transmit_counts.q_depth_cur)', minWidth:150, name:"SUM (Trans Cur Q Depth)", groupable:false}},
            {select:"MIN(edges.class_stats.transmit_counts.q_depth_cur)", display:{id:'MIN(edges.class_stats.transmit_counts.q_depth_cur)', field:'MIN(edges.class_stats.transmit_counts.q_depth_cur)', minWidth:150, name:"MIN (Trans Cur Q Depth)", groupable:false}},
            {select:"MAX(edges.class_stats.transmit_counts.q_depth_cur)", display:{id:'MAX(edges.class_stats.transmit_counts.q_depth_cur)', field:'MAX(edges.class_stats.transmit_counts.q_depth_cur)', minWidth:150, name:"MAX (Trans Cur Q Depth)", groupable:false}},

            {select:"edges.class_stats.transmit_counts.q_depth_peak", display:{id:'edges.class_stats.transmit_counts.q_depth_peak', field:'edges.class_stats.transmit_counts.q_depth_peak', minWidth:150, name:"Trans Peak Q Depth", groupable:false}},
            {select:"SUM(edges.class_stats.transmit_counts.q_depth_peak)", display:{id:'SUM(edges.class_stats.transmit_counts.q_depth_peak)', field:'SUM(edges.class_stats.transmit_counts.q_depth_peak)', minWidth:150, name:"SUM (Trans Peak Q Depth)", groupable:false}},
            {select:"MIN(edges.class_stats.transmit_counts.q_depth_peak)", display:{id:'MIN(edges.class_stats.transmit_counts.q_depth_peak)', field:'MIN(edges.class_stats.transmit_counts.q_depth_peak)', minWidth:150, name:"MIN (Trans Peak Q Depth)", groupable:false}},
            {select:"MAX(edges.class_stats.transmit_counts.q_depth_peak)", display:{id:'MAX(edges.class_stats.transmit_counts.q_depth_peak)', field:'MAX(edges.class_stats.transmit_counts.q_depth_peak)', minWidth:150, name:"MAX (Trans PeakQ Depth)", groupable:false}},

            {select:"edges.class_stats.transmit_counts.q_depth_max", display:{id:'edges.class_stats.transmit_counts.q_depth_max', field:'edges.class_stats.transmit_counts.q_depth_max', minWidth:150, name:"Trans Max Q Depth", groupable:false}},
            {select:"SUM(edges.class_stats.transmit_counts.q_depth_max)", display:{id:'SUM(edges.class_stats.transmit_counts.q_depth_max)', field:'SUM(edges.class_stats.transmit_counts.q_depth_max)', minWidth:150, name:"SUM (Trans Max Q Depth)", groupable:false}},
            {select:"MIN(edges.class_stats.transmit_counts.q_depth_max)", display:{id:'MIN(edges.class_stats.transmit_counts.q_depth_max)', field:'MIN(edges.class_stats.transmit_counts.q_depth_max)', minWidth:150, name:"MIN (Trans Max Q Depth)", groupable:false}},
            {select:"MAX(edges.class_stats.transmit_counts.q_depth_max)", display:{id:'MAX(edges.class_stats.transmit_counts.q_depth_max)', field:'MAX(edges.class_stats.transmit_counts.q_depth_max)', minWidth:150, name:"MAX (Trans Max Q Depth)", groupable:false}},

        ],
        "StatTable.g_lsp_stats.lsp_records" : [
            {select:"COUNT(lsp_records)", display:{id:'COUNT(lsp_records)', field:'COUNT(lsp_records)', minWidth:120, name:"Count (LSP Records)", groupable:false}},
            {select:"system_name", display:{id:'system_name', field:'system_name', minWidth:150, name:"System Name", groupable:false}},
            {select:"sensor_name", display:{id:'sensor_name', field:'sensor_name', minWidth:150, name:"Sensor Name", groupable:false}},
            {select:"lsp_records.name", display:{id:'lsp_records.name', field:'lsp_records.name', minWidth:150, name:"Lsp Records Name", groupable:false}},

            {select:"slot", display:{id:'slot', field:'slot', minWidth:150, name:"Slot", groupable:false}},
            {select:"SUM(slot)", display:{id:'SUM(slot)', field:'SUM(slot)', minWidth:150, name:"SUM (Slot)", groupable:false}},
            {select:"MIN(slot)", display:{id:'MIN(slot)', field:'MIN(slot)', minWidth:150, name:"MIN (Slot)", groupable:false}},
            {select:"MAX(slot)", display:{id:'MAX(slot)', field:'MAX(slot)', minWidth:150, name:"MAX (Slot)", groupable:false}},

            {select:"timestamp", display:{id:'timestamp', field:'timestamp', minWidth:150, name:"Timestamp", groupable:false}},
            {select:"SUM(timestamp)", display:{id:'SUM(timestamp)', field:'SUM(timestamp)', minWidth:150, name:"SUM (Timestamp)", groupable:false}},
            {select:"MIN(timestamp)", display:{id:'MIN(timestamp)', field:'MIN(timestamp)', minWidth:150, name:"MIN (Timestamp)", groupable:false}},
            {select:"MAX(timestamp)", display:{id:'MAX(timestamp)', field:'MAX(timestamp)', minWidth:150, name:"MAX (Timestamp)", groupable:false}},

            {select:"lsp_records.instance_identifier", display:{id:'lsp_records.instance_identifier', field:'lsp_records.instance_identifier', minWidth:150, name:"Instance Identifier", groupable:false}},
            {select:"SUM(lsp_records.instance_identifier)", display:{id:'SUM(lsp_records.instance_identifier)', field:'SUM(lsp_records.instance_identifier)', minWidth:150, name:"SUM (Instance Identifier)", groupable:false}},
            {select:"MIN(lsp_records.instance_identifier)", display:{id:'MIN(lsp_records.instance_identifier)', field:'MIN(lsp_records.instance_identifier)', minWidth:150, name:"MIN (Instance Identifier)", groupable:false}},
            {select:"MAX(lsp_records.instance_identifier)", display:{id:'MAX(lsp_records.instance_identifier)', field:'MAX(lsp_records.instance_identifier)', minWidth:150, name:"MAX (Instance Identifier)", groupable:false}},

            {select:"lsp_records.counter_name", display:{id:'lsp_records.counter_name', field:'lsp_records.counter_name', minWidth:150, name:"Counter Name", groupable:false}},
            {select:"SUM(lsp_records.counter_name)", display:{id:'SUM(lsp_records.counter_name)', field:'SUM(lsp_records.counter_name)', minWidth:150, name:"SUM (Counter Name)", groupable:false}},
            {select:"MIN(lsp_records.counter_name)", display:{id:'MIN(lsp_records.counter_name)', field:'MIN(lsp_records.counter_name)', minWidth:150, name:"MIN (Counter Name)", groupable:false}},
            {select:"MAX(lsp_records.counter_name)", display:{id:'MAX(lsp_records.counter_name)', field:'MAX(lsp_records.counter_name)', minWidth:150, name:"MAX (Counter Name)", groupable:false}},

            {select:"lsp_records.packets", display:{id:'lsp_records.packets', field:'lsp_records.packets', minWidth:150, name:"Packets", groupable:false}},
            {select:"SUM(lsp_records.packets)", display:{id:'SUM(lsp_records.packets)', field:'SUM(lsp_records.packets)', minWidth:150, name:"SUM (Packets)", groupable:false}},
            {select:"MIN(lsp_records.packets)", display:{id:'MIN(lsp_records.packets)', field:'MIN(lsp_records.packets)', minWidth:150, name:"MIN (Packets)", groupable:false}},
            {select:"MAX(lsp_records.packets)", display:{id:'MAX(lsp_records.packets)', field:'MAX(lsp_records.packets)', minWidth:150, name:"MAX (Packets)", groupable:false}},

            {select:"lsp_records.packet_rates", display:{id:'lsp_records.packet_rates', field:'lsp_records.packet_rates', minWidth:150, name:"Packet Rates", groupable:false}},
            {select:"SUM(lsp_records.packet_rates)", display:{id:'SUM(lsp_records.packet_rates)', field:'SUM(lsp_records.packet_rates)', minWidth:150, name:"SUM (Packet Rates)", groupable:false}},
            {select:"MIN(lsp_records.packet_rates)", display:{id:'MIN(lsp_records.packet_rates)', field:'MIN(lsp_records.packet_rates)', minWidth:150, name:"MIN (Packet Rates)", groupable:false}},
            {select:"MAX(lsp_records.packet_rates)", display:{id:'MAX(lsp_records.packet_rates)', field:'MAX(lsp_records.packet_rates)', minWidth:150, name:"MAX (Packet Rates)", groupable:false}},

            {select:"lsp_records.bytes", display:{id:'lsp_records.bytes', field:'lsp_records.bytes', minWidth:150, name:"Bytes", groupable:false}},
            {select:"SUM(lsp_records.bytes)", display:{id:'SUM(lsp_records.bytes)', field:'SUM(lsp_records.bytes)', minWidth:150, name:"SUM (Bytes)", groupable:false}},
            {select:"MIN(lsp_records.bytes)", display:{id:'MIN(lsp_records.bytes)', field:'MIN(lsp_records.bytes)', minWidth:150, name:"MIN (Bytes)", groupable:false}},
            {select:"MAX(lsp_records.bytes)", display:{id:'MAX(lsp_records.bytes)', field:'MAX(lsp_records.bytes)', minWidth:150, name:"MAX (Bytes)", groupable:false}},

            {select:"lsp_records.byte_rates", display:{id:'lsp_records.byte_rates', field:'lsp_records.byte_rates', minWidth:150, name:"Byte Rates", groupable:false}},
            {select:"SUM(lsp_records.byte_rates)", display:{id:'SUM(lsp_records.byte_rates)', field:'SUM(lsp_records.byte_rates)', minWidth:150, name:"SUM (Byte Rates)", groupable:false}},
            {select:"MIN(lsp_records.byte_rates)", display:{id:'MIN(lsp_records.byte_rates)', field:'MIN(lsp_records.byte_rates)', minWidth:150, name:"MIN (Byte Rates)", groupable:false}},
            {select:"MAX(lsp_records.byte_rates)", display:{id:'MAX(lsp_records.byte_rates)', field:'MAX(lsp_records.byte_rates)', minWidth:150, name:"MAX (Byte Rates)", groupable:false}}
        ],
        "StatTable.UFlowData.flow" : [
            {select:"COUNT(flow)", display:{id:'COUNT(flow)', field:'COUNT(flow)', minWidth:120, name:"Count (Flow)", groupable:false}},

            {select:"flow.pifindex", display:{id:'flow.pifindex', field:'flow.pifindex', minWidth:150, name:"PIF Index", groupable:false}},
            {select:"SUM(flow.pifindex)", display:{id:'SUM(flow.pifindex)', field:'SUM(flow.pifindex)', minWidth:150, name:"SUM (PIF Index)", groupable:false}},
            {select:"MIN(flow.pifindex)", display:{id:'MIN(flow.pifindex)', field:'MIN(flow.pifindex)', minWidth:150, name:"MIN (PIF Index)", groupable:false}},
            {select:"MAX(flow.pifindex)", display:{id:'MAX(flow.pifindex)', field:'MAX(flow.pifindex)', minWidth:150, name:"MAX (PIF Index)", groupable:false}},

            {select:"flow.sport", display:{id:'flow.sport', field:'flow.sport', minWidth:150, name:"Src Port", groupable:false}},
            {select:"SUM(flow.sport)", display:{id:'SUM(flow.sport)', field:'SUM(flow.sport)', minWidth:150, name:"SUM (Src Port)", groupable:false}},
            {select:"MIN(flow.sport)", display:{id:'MIN(flow.sport)', field:'MIN(flow.sport)', minWidth:150, name:"MIN (Src Port)", groupable:false}},
            {select:"MAX(flow.sport)", display:{id:'MAX(flow.sport)', field:'MAX(flow.sport)', minWidth:150, name:"MAX (Src Port)", groupable:false}},

            {select:"flow.dport", display:{id:'flow.dport', field:'flow.dport', minWidth:150, name:"Dest Port", groupable:false}},
            {select:"SUM(flow.dport)", display:{id:'SUM(flow.dport)', field:'SUM(flow.dport)', minWidth:150, name:"SUM (Dest Port)", groupable:false}},
            {select:"MIN(flow.dport)", display:{id:'MIN(flow.dport)', field:'MIN(flow.dport)', minWidth:150, name:"MIN (Dest Port)", groupable:false}},
            {select:"MAX(flow.dport)", display:{id:'MAX(flow.dport)', field:'MAX(flow.dport)', minWidth:150, name:"MAX (Dest Port)", groupable:false}},

            {select:"flow.protocol", display:{id:'flow.protocol', field:'flow.protocol', minWidth:150, name:"Protocol", groupable:false}},
            {select:"SUM(flow.protocol)", display:{id:'SUM(flow.protocol)', field:'SUM(flow.protocol)', minWidth:150, name:"SUM (Protocol)", groupable:false}},
            {select:"MIN(flow.protocol)", display:{id:'MIN(flow.protocol)', field:'MIN(flow.protocol)', minWidth:150, name:"MIN (Protocol)", groupable:false}},
            {select:"MAX(flow.protocol)", display:{id:'MAX(flow.protocol)', field:'MAX(flow.protocol)', minWidth:150, name:"MAX (Protocol)", groupable:false}},

            {select:"flow.sip", display:{id:'flow.sip', field:'flow.sip', minWidth:150, name:"Src IP", groupable:false}},
            {select:"flow.dip", display:{id:'flow.dip', field:'flow.dip', minWidth:150, name:"Dest IP", groupable:false}},
            {select:"flow.vlan", display:{id:'flow.vlan', field:'flow.vlan', minWidth:150, name:"Virtual LAN", groupable:false}},
            {select:"flow.flowtype", display:{id:'flow.flowtype', field:'flow.flowtype', minWidth:150, name:"Flow Type", groupable:false}},
            {select:"flow.otherinfo", display:{id:'flow.otherinfo', field:'flow.otherinfo', minWidth:150, name:"Other Info", groupable:false}}
        ],
        "StatTable.AlarmgenUpdate.keys" : [
            {select:"COUNT(keys)", display:{id:'COUNT(keys)', field:'COUNT(keys)', minWidth:120, name:"Count (keys)", groupable:false}},
            {select:"instance", display:{id:'instance', field:'instance', minWidth:150, name:"Instance", groupable:false}},
            {select:"table", display:{id:'table', field:'table', minWidth:150, name:"Table", groupable:false}},
            {select:"keys.key", display:{id:'keys.key', field:'keys.key', minWidth:150, name:"Key", groupable:false}},

            {select:"partition", display:{id:'partition', field:'partition', minWidth:150, name:"Partition", groupable:false}},
            {select:"SUM(partition)", display:{id:'SUM(partition)', field:'SUM(partition)', minWidth:150, name:"SUM (Partition)", groupable:false}},
            {select:"MIN(partition)", display:{id:'MIN(partition)', field:'MIN(partition)', minWidth:150, name:"MIN (Partition)", groupable:false}},
            {select:"MAX(partition)", display:{id:'MAX(partition)', field:'MAX(partition)', minWidth:150, name:"MAX (Partition)", groupable:false}},

            {select:"keys.count", display:{id:'keys.count', field:'keys.count', minWidth:150, name:"Keys Cnt", groupable:false}},
            {select:"SUM(keys.count)", display:{id:'SUM(keys.count)', field:'SUM(keys.count)', minWidth:150, name:"SUM (Keys Cnt)", groupable:false}},
            {select:"MIN(keys.count)", display:{id:'MIN(keys.count)', field:'MIN(keys.count)', minWidth:150, name:"MIN (Keys Cnt)", groupable:false}},
            {select:"MAX(keys.count)", display:{id:'MAX(keys.count)', field:'MAX(keys.count)', minWidth:150, name:"MAX (Keys Cnt)", groupable:false}},
        ],
        "StatTable.AlarmgenUpdate.notifs" : [
            {select:"COUNT(notifs)", display:{id:'COUNT(notifs)', field:'COUNT(notifs)', minWidth:120, name:"Count (notifs)", groupable:false}},
            {select:"instance", display:{id:'instance', field:'instance', minWidth:150, name:"Instance", groupable:false}},
            {select:"table", display:{id:'table', field:'table', minWidth:150, name:"Table", groupable:false}},
            {select:"notifs.generator", display:{id:'notifs.generator', field:'notifs.generator', minWidth:150, name:"Generator", groupable:false}},
            {select:"notifs.collector", display:{id:'notifs.collector', field:'notifs.collector', minWidth:150, name:"Collector", groupable:false}},
            {select:"notifs.type", display:{id:'notifs.type', field:'notifs.type', minWidth:150, name:"Type", groupable:false}},

            {select:"partition", display:{id:'partition', field:'partition', minWidth:150, name:"Partition", groupable:false}},
            {select:"SUM(partition)", display:{id:'SUM(partition)', field:'SUM(partition)', minWidth:150, name:"SUM (Partition)", groupable:false}},
            {select:"MIN(partition)", display:{id:'MIN(partition)', field:'MIN(partition)', minWidth:150, name:"MIN (Partition)", groupable:false}},
            {select:"MAX(partition)", display:{id:'MAX(partition)', field:'MAX(partition)', minWidth:150, name:"MAX (Partition)", groupable:false}},

            {select:"notifs.count", display:{id:'notifs.count', field:'notifs.count', minWidth:150, name:"Notifs Cnt", groupable:false}},
            {select:"SUM(notifs.count)", display:{id:'SUM(notifs.count)', field:'SUM(notifs.count)', minWidth:150, name:"SUM (Notifs Cnt)", groupable:false}},
            {select:"MIN(notifs.count)", display:{id:'MIN(notifs.count)', field:'MIN(notifs.count)', minWidth:150, name:"MIN (Notifs Cnt)", groupable:false}},
            {select:"MAX(notifs.count)", display:{id:'MAX(notifs.count)', field:'MAX(notifs.count)', minWidth:150, name:"MAX (Notifs Cnt)", groupable:false}}
        ],

        "StatTable.UveLoadbalancer.virtual_ip_stats" : [
            {select:"COUNT(virtual_ip_stats)", display:{id:'COUNT(virtual_ip_stats)', field:'COUNT(virtual_ip_stats)', minWidth:120, name:"Count (Virtual IP Stats)", groupable:false}},
            {select:"virtual_ip_stats.obj_name", display:{id:'virtual_ip_stats.obj_name', field:'virtual_ip_stats.obj_name', minWidth:150, name:"Object Name", groupable:false}},
            {select:"virtual_ip_stats.uuid", display:{id:"virtual_ip_stats.uuid", field:"virtual_ip_stats.uuid", name:"Virtual IP Stats UUID",  minWidth:280, groupable:true}},
            {select:"virtual_ip_stats.status", display:{id:"virtual_ip_stats.status", field:"virtual_ip_stats.status", name:"Status",  minWidth:150, groupable:true}},
            {select:"virtual_ip_stats.vrouter", display:{id:"virtual_ip_stats.vrouter", field:"virtual_ip_stats.vrouter", name:"Vrouter",  minWidth:150, groupable:true}},

            {select:"virtual_ip_stats.active_connections", display:{id:'virtual_ip_stats.active_connections', field:'virtual_ip_stats.active_connections', minWidth:150, name:"Active Connections", groupable:false}},
            {select:"SUM(virtual_ip_stats.active_connections)", display:{id:'SUM(virtual_ip_stats.active_connections)', field:'SUM(virtual_ip_stats.active_connections)', minWidth:150, name:"SUM (Active Connections)", groupable:false}},
            {select:"MIN(virtual_ip_stats.active_connections)", display:{id:'MIN(virtual_ip_stats.active_connections)', field:'MIN(virtual_ip_stats.active_connections)', minWidth:150, name:"MIN (Active Connections)", groupable:false}},
            {select:"MAX(virtual_ip_stats.active_connections)", display:{id:'MAX(virtual_ip_stats.active_connections)', field:'MAX(virtual_ip_stats.active_connections)', minWidth:150, name:"MAX (Active Connections)", groupable:false}},

            {select:"virtual_ip_stats.max_connections", display:{id:'virtual_ip_stats.max_connections', field:'virtual_ip_stats.max_connections', minWidth:150, name:"Max Connections", groupable:false}},
            {select:"SUM(virtual_ip_stats.max_connections)", display:{id:'SUM(virtual_ip_stats.max_connections)', field:'SUM(virtual_ip_stats.max_connections)', minWidth:150, name:"SUM (Max Connections)", groupable:false}},
            {select:"MIN(virtual_ip_stats.max_connections)", display:{id:'MIN(virtual_ip_stats.max_connections)', field:'MIN(virtual_ip_stats.max_connections)', minWidth:150, name:"MIN (Max Connections)", groupable:false}},
            {select:"MAX(virtual_ip_stats.max_connections)", display:{id:'MAX(virtual_ip_stats.max_connections)', field:'MAX(virtual_ip_stats.max_connections)', minWidth:150, name:"MAX (Max Connections)", groupable:false}},

            {select:"virtual_ip_stats.current_sessions", display:{id:'virtual_ip_stats.current_sessions', field:'virtual_ip_stats.current_sessions', minWidth:150, name:"Current Sessions", groupable:false}},
            {select:"SUM(virtual_ip_stats.current_sessions)", display:{id:'SUM(virtual_ip_stats.current_sessions)', field:'SUM(virtual_ip_stats.current_sessions)', minWidth:150, name:"SUM (Current Sessions)", groupable:false}},
            {select:"MIN(virtual_ip_stats.current_sessions)", display:{id:'MIN(virtual_ip_stats.current_sessions)', field:'MIN(virtual_ip_stats.current_sessions)', minWidth:150, name:"MIN (Current Sessions)", groupable:false}},
            {select:"MAX(virtual_ip_stats.current_sessions)", display:{id:'MAX(virtual_ip_stats.current_sessions)', field:'MAX(virtual_ip_stats.current_sessions)', minWidth:150, name:"MAX (Current Sessions)", groupable:false}},

            {select:"virtual_ip_stats.max_sessions", display:{id:'virtual_ip_stats.max_sessions', field:'virtual_ip_stats.max_sessions', minWidth:150, name:"Max Sessions", groupable:false}},
            {select:"SUM(virtual_ip_stats.max_sessions)", display:{id:'SUM(virtual_ip_stats.max_sessions)', field:'SUM(virtual_ip_stats.max_sessions)', minWidth:150, name:"SUM (Max Sessions)", groupable:false}},
            {select:"MIN(virtual_ip_stats.max_sessions)", display:{id:'MIN(virtual_ip_stats.max_sessions)', field:'MIN(virtual_ip_stats.max_sessions)', minWidth:150, name:"MIN (Max Sessions)", groupable:false}},
            {select:"MAX(virtual_ip_stats.max_sessions)", display:{id:'MAX(virtual_ip_stats.max_sessions)', field:'MAX(virtual_ip_stats.max_sessions)', minWidth:150, name:"MAX (Max Sessions)", groupable:false}},

            {select:"virtual_ip_stats.total_sessions", display:{id:'virtual_ip_stats.total_sessions', field:'virtual_ip_stats.total_sessions', minWidth:150, name:"Total Sessions", groupable:false}},
            {select:"SUM(virtual_ip_stats.total_sessions)", display:{id:'SUM(virtual_ip_stats.total_sessions)', field:'SUM(virtual_ip_stats.total_sessions)', minWidth:150, name:"SUM (Total Sessions)", groupable:false}},
            {select:"MIN(virtual_ip_stats.total_sessions)", display:{id:'MIN(virtual_ip_stats.total_sessions)', field:'MIN(virtual_ip_stats.total_sessions)', minWidth:150, name:"MIN (Total Sessions)", groupable:false}},
            {select:"MAX(virtual_ip_stats.total_sessions)", display:{id:'MAX(virtual_ip_stats.total_sessions)', field:'MAX(virtual_ip_stats.total_sessions)', minWidth:150, name:"MAX (Total Sessions)", groupable:false}},

            {select:"virtual_ip_stats.bytes_in", display:{id:'virtual_ip_stats.bytes_in', field:'virtual_ip_stats.bytes_in', minWidth:150, name:"Bytes In", groupable:false}},
            {select:"SUM(virtual_ip_stats.bytes_in)", display:{id:'SUM(virtual_ip_stats.bytes_in)', field:'SUM(virtual_ip_stats.bytes_in)', minWidth:150, name:"SUM (Bytes In)", groupable:false}},
            {select:"MIN(virtual_ip_stats.bytes_in)", display:{id:'MIN(virtual_ip_stats.bytes_in)', field:'MIN(virtual_ip_stats.bytes_in)', minWidth:150, name:"MIN (Bytes In)", groupable:false}},
            {select:"MAX(virtual_ip_stats.bytes_in)", display:{id:'MAX(virtual_ip_stats.bytes_in)', field:'MAX(virtual_ip_stats.bytes_in)', minWidth:150, name:"MAX (Bytes In)", groupable:false}},

            {select:"virtual_ip_stats.bytes_out", display:{id:'virtual_ip_stats.bytes_out', field:'virtual_ip_stats.bytes_out', minWidth:150, name:"Bytes Out", groupable:false}},
            {select:"SUM(virtual_ip_stats.bytes_out)", display:{id:'SUM(virtual_ip_stats.bytes_out)', field:'SUM(virtual_ip_stats.bytes_out)', minWidth:150, name:"SUM (Bytes Out)", groupable:false}},
            {select:"MIN(virtual_ip_stats.bytes_out)", display:{id:'MIN(virtual_ip_stats.bytes_out)', field:'MIN(virtual_ip_stats.bytes_out)', minWidth:150, name:"MIN (Bytes Out)", groupable:false}},
            {select:"MAX(virtual_ip_stats.bytes_out)", display:{id:'MAX(virtual_ip_stats.bytes_out)', field:'MAX(virtual_ip_stats.bytes_out)', minWidth:150, name:"MAX (Bytes Out)", groupable:false}},

            {select:"virtual_ip_stats.connection_errors", display:{id:'virtual_ip_stats.connection_errors', field:'virtual_ip_stats.connection_errors', minWidth:150, name:"Connection Errors", groupable:false}},
            {select:"SUM(virtual_ip_stats.connection_errors)", display:{id:'SUM(virtual_ip_stats.connection_errors)', field:'SUM(virtual_ip_stats.connection_errors)', minWidth:150, name:"SUM (Connection Errors)", groupable:false}},
            {select:"MIN(virtual_ip_stats.connection_errors)", display:{id:'MIN(virtual_ip_stats.connection_errors)', field:'MIN(virtual_ip_stats.connection_errors)', minWidth:150, name:"MIN (Connection Errors)", groupable:false}},
            {select:"MAX(virtual_ip_stats.connection_errors)", display:{id:'MAX(virtual_ip_stats.connection_errors)', field:'MAX(virtual_ip_stats.connection_errors)', minWidth:150, name:"MAX (Connection Errors)", groupable:false}},

            {select:"virtual_ip_stats.reponse_errors", display:{id:'virtual_ip_stats.reponse_errors', field:'virtual_ip_stats.reponse_errors', minWidth:150, name:"Reponse Errors", groupable:false}},
            {select:"SUM(virtual_ip_stats.reponse_errors)", display:{id:'SUM(virtual_ip_stats.reponse_errors)', field:'SUM(virtual_ip_stats.reponse_errors)', minWidth:150, name:"SUM (Reponse Errors)", groupable:false}},
            {select:"MIN(virtual_ip_stats.reponse_errors)", display:{id:'MIN(virtual_ip_stats.reponse_errors)', field:'MIN(virtual_ip_stats.reponse_errors)', minWidth:150, name:"MIN (Reponse Errors)", groupable:false}},
            {select:"MAX(virtual_ip_stats.reponse_errors)", display:{id:'MAX(virtual_ip_stats.reponse_errors)', field:'MAX(virtual_ip_stats.reponse_errors)', minWidth:150, name:"MAX (Reponse Errors)", groupable:false}},
        ],
        "StatTable.UveLoadbalancer.listener_stats": [
            {select:"COUNT(listener_stats)", display:{id:'COUNT(listener_stats)', field:'COUNT(listener_stats)', minWidth:120, name:"Count (Listener Stats)", groupable:false}},
            {select:"listener_stats.obj_name", display:{id:'listener_stats.obj_name', field:'listener_stats.obj_name', minWidth:150, name:"Object Name", groupable:false}},
            {select:"listener_stats.uuid", display:{id:"listener_stats.uuid", field:"listener_stats.uuid", name:"Listener Stats UUID",  minWidth:280, groupable:true}},
            {select:"listener_stats.status", display:{id:"listener_stats.status", field:"listener_stats.status", name:"Status",  minWidth:150, groupable:true}},
            {select:"listener_stats.vrouter", display:{id:"listener_stats.vrouter", field:"listener_stats.vrouter", name:"Vrouter",  minWidth:150, groupable:true}},

            {select:"listener_stats.active_connections", display:{id:'listener_stats.active_connections', field:'listener_stats.active_connections', minWidth:150, name:"Active Connections", groupable:false}},
            {select:"SUM(listener_stats.active_connections)", display:{id:'SUM(listener_stats.active_connections)', field:'SUM(listener_stats.active_connections)', minWidth:150, name:"SUM (Active Connections)", groupable:false}},
            {select:"MIN(listener_stats.active_connections)", display:{id:'MIN(listener_stats.active_connections)', field:'MIN(listener_stats.active_connections)', minWidth:150, name:"MIN (Active Connections)", groupable:false}},
            {select:"MAX(listener_stats.active_connections)", display:{id:'MAX(listener_stats.active_connections)', field:'MAX(listener_stats.active_connections)', minWidth:150, name:"MAX (Active Connections)", groupable:false}},

            {select:"listener_stats.max_connections", display:{id:'listener_stats.max_connections', field:'listener_stats.max_connections', minWidth:150, name:"Max Connections", groupable:false}},
            {select:"SUM(listener_stats.max_connections)", display:{id:'SUM(listener_stats.max_connections)', field:'SUM(listener_stats.max_connections)', minWidth:150, name:"SUM (Max Connections)", groupable:false}},
            {select:"MIN(listener_stats.max_connections)", display:{id:'MIN(listener_stats.max_connections)', field:'MIN(listener_stats.max_connections)', minWidth:150, name:"MIN (Max Connections)", groupable:false}},
            {select:"MAX(listener_stats.max_connections)", display:{id:'MAX(listener_stats.max_connections)', field:'MAX(listener_stats.max_connections)', minWidth:150, name:"MAX (Max Connections)", groupable:false}},

            {select:"listener_stats.current_sessions", display:{id:'listener_stats.current_sessions', field:'listener_stats.current_sessions', minWidth:150, name:"Current Sessions", groupable:false}},
            {select:"SUM(listener_stats.current_sessions)", display:{id:'SUM(listener_stats.current_sessions)', field:'SUM(listener_stats.current_sessions)', minWidth:150, name:"SUM (Current Sessions)", groupable:false}},
            {select:"MIN(listener_stats.current_sessions)", display:{id:'MIN(listener_stats.current_sessions)', field:'MIN(listener_stats.current_sessions)', minWidth:150, name:"MIN (Current Sessions)", groupable:false}},
            {select:"MAX(listener_stats.current_sessions)", display:{id:'MAX(listener_stats.current_sessions)', field:'MAX(listener_stats.current_sessions)', minWidth:150, name:"MAX (Current Sessions)", groupable:false}},

            {select:"listener_stats.max_sessions", display:{id:'listener_stats.max_sessions', field:'listener_stats.max_sessions', minWidth:150, name:"Max Sessions", groupable:false}},
            {select:"SUM(listener_stats.max_sessions)", display:{id:'SUM(listener_stats.max_sessions)', field:'SUM(listener_stats.max_sessions)', minWidth:150, name:"SUM (Max Sessions)", groupable:false}},
            {select:"MIN(listener_stats.max_sessions)", display:{id:'MIN(listener_stats.max_sessions)', field:'MIN(listener_stats.max_sessions)', minWidth:150, name:"MIN (Max Sessions)", groupable:false}},
            {select:"MAX(listener_stats.max_sessions)", display:{id:'MAX(listener_stats.max_sessions)', field:'MAX(listener_stats.max_sessions)', minWidth:150, name:"MAX (Max Sessions)", groupable:false}},

            {select:"listener_stats.total_sessions", display:{id:'listener_stats.total_sessions', field:'listener_stats.total_sessions', minWidth:150, name:"Total Sessions", groupable:false}},
            {select:"SUM(listener_stats.total_sessions)", display:{id:'SUM(listener_stats.total_sessions)', field:'SUM(listener_stats.total_sessions)', minWidth:150, name:"SUM (Total Sessions)", groupable:false}},
            {select:"MIN(listener_stats.total_sessions)", display:{id:'MIN(listener_stats.total_sessions)', field:'MIN(listener_stats.total_sessions)', minWidth:150, name:"MIN (Total Sessions)", groupable:false}},
            {select:"MAX(listener_stats.total_sessions)", display:{id:'MAX(listener_stats.total_sessions)', field:'MAX(listener_stats.total_sessions)', minWidth:150, name:"MAX (Total Sessions)", groupable:false}},

            {select:"listener_stats.bytes_in", display:{id:'listener_stats.bytes_in', field:'listener_stats.bytes_in', minWidth:150, name:"Bytes In", groupable:false}},
            {select:"SUM(listener_stats.bytes_in)", display:{id:'SUM(listener_stats.bytes_in)', field:'SUM(listener_stats.bytes_in)', minWidth:150, name:"SUM (Bytes In)", groupable:false}},
            {select:"MIN(listener_stats.bytes_in)", display:{id:'MIN(listener_stats.bytes_in)', field:'MIN(listener_stats.bytes_in)', minWidth:150, name:"MIN (Bytes In)", groupable:false}},
            {select:"MAX(listener_stats.bytes_in)", display:{id:'MAX(listener_stats.bytes_in)', field:'MAX(listener_stats.bytes_in)', minWidth:150, name:"MAX (Bytes In)", groupable:false}},

            {select:"listener_stats.bytes_out", display:{id:'listener_stats.bytes_out', field:'listener_stats.bytes_out', minWidth:150, name:"Bytes Out", groupable:false}},
            {select:"SUM(listener_stats.bytes_out)", display:{id:'SUM(listener_stats.bytes_out)', field:'SUM(listener_stats.bytes_out)', minWidth:150, name:"SUM (Bytes Out)", groupable:false}},
            {select:"MIN(listener_stats.bytes_out)", display:{id:'MIN(listener_stats.bytes_out)', field:'MIN(listener_stats.bytes_out)', minWidth:150, name:"MIN (Bytes Out)", groupable:false}},
            {select:"MAX(listener_stats.bytes_out)", display:{id:'MAX(listener_stats.bytes_out)', field:'MAX(listener_stats.bytes_out)', minWidth:150, name:"MAX (Bytes Out)", groupable:false}},

            {select:"listener_stats.connection_errors", display:{id:'listener_stats.connection_errors', field:'listener_stats.connection_errors', minWidth:150, name:"Connection Errors", groupable:false}},
            {select:"SUM(listener_stats.connection_errors)", display:{id:'SUM(listener_stats.connection_errors)', field:'SUM(listener_stats.connection_errors)', minWidth:150, name:"SUM (Connection Errors)", groupable:false}},
            {select:"MIN(listener_stats.connection_errors)", display:{id:'MIN(listener_stats.connection_errors)', field:'MIN(listener_stats.connection_errors)', minWidth:150, name:"MIN (Connection Errors)", groupable:false}},
            {select:"MAX(listener_stats.connection_errors)", display:{id:'MAX(listener_stats.connection_errors)', field:'MAX(listener_stats.connection_errors)', minWidth:150, name:"MAX (Connection Errors)", groupable:false}},

            {select:"listener_stats.reponse_errors", display:{id:'listener_stats.reponse_errors', field:'listener_stats.reponse_errors', minWidth:150, name:"Reponse Errors", groupable:false}},
            {select:"SUM(listener_stats.reponse_errors)", display:{id:'SUM(listener_stats.reponse_errors)', field:'SUM(listener_stats.reponse_errors)', minWidth:150, name:"SUM (Reponse Errors)", groupable:false}},
            {select:"MIN(listener_stats.reponse_errors)", display:{id:'MIN(listener_stats.reponse_errors)', field:'MIN(listener_stats.reponse_errors)', minWidth:150, name:"MIN (Reponse Errors)", groupable:false}},
            {select:"MAX(listener_stats.reponse_errors)", display:{id:'MAX(listener_stats.reponse_errors)', field:'MAX(listener_stats.reponse_errors)', minWidth:150, name:"MAX (Reponse Errors)", groupable:false}},
        ],
        "StatTable.UveLoadbalancer.pool_stats" : [
            {select:"COUNT(pool_stats)", display:{id:'COUNT(pool_stats)', field:'COUNT(pool_stats)', minWidth:120, name:"Count (Pool Stats)", groupable:false}},
            {select:"pool_stats.obj_name", display:{id:'pool_stats.obj_name', field:'pool_stats.obj_name', minWidth:150, name:"Object Name", groupable:false}},
            {select:"pool_stats.uuid", display:{id:"pool_stats.uuid", field:"pool_stats.uuid", name:"Pool Stats UUID",  minWidth:280, groupable:true}},
            {select:"pool_stats.status", display:{id:"pool_stats.status", field:"pool_stats.status", name:"Status",  minWidth:150, groupable:true}},
            {select:"pool_stats.vrouter", display:{id:"pool_stats.vrouter", field:"pool_stats.vrouter", name:"Vrouter",  minWidth:150, groupable:true}},

            {select:"pool_stats.active_connections", display:{id:'pool_stats.active_connections', field:'pool_stats.active_connections', minWidth:150, name:"Active Connections", groupable:false}},
            {select:"SUM(pool_stats.active_connections)", display:{id:'SUM(pool_stats.active_connections)', field:'SUM(pool_stats.active_connections)', minWidth:150, name:"SUM (Active Connections)", groupable:false}},
            {select:"MIN(pool_stats.active_connections)", display:{id:'MIN(pool_stats.active_connections)', field:'MIN(pool_stats.active_connections)', minWidth:150, name:"MIN (Active Connections)", groupable:false}},
            {select:"MAX(pool_stats.active_connections)", display:{id:'MAX(pool_stats.active_connections)', field:'MAX(pool_stats.active_connections)', minWidth:150, name:"MAX (Active Connections)", groupable:false}},

            {select:"pool_stats.max_connections", display:{id:'pool_stats.max_connections', field:'pool_stats.max_connections', minWidth:150, name:"Max Connections", groupable:false}},
            {select:"SUM(pool_stats.max_connections)", display:{id:'SUM(pool_stats.max_connections)', field:'SUM(pool_stats.max_connections)', minWidth:150, name:"SUM (Max Connections)", groupable:false}},
            {select:"MIN(pool_stats.max_connections)", display:{id:'MIN(pool_stats.max_connections)', field:'MIN(pool_stats.max_connections)', minWidth:150, name:"MIN (Max Connections)", groupable:false}},
            {select:"MAX(pool_stats.max_connections)", display:{id:'MAX(pool_stats.max_connections)', field:'MAX(pool_stats.max_connections)', minWidth:150, name:"MAX (Max Connections)", groupable:false}},

            {select:"pool_stats.current_sessions", display:{id:'pool_stats.current_sessions', field:'pool_stats.current_sessions', minWidth:150, name:"Current Sessions", groupable:false}},
            {select:"SUM(pool_stats.current_sessions)", display:{id:'SUM(pool_stats.current_sessions)', field:'SUM(pool_stats.current_sessions)', minWidth:150, name:"SUM (Current Sessions)", groupable:false}},
            {select:"MIN(pool_stats.current_sessions)", display:{id:'MIN(pool_stats.current_sessions)', field:'MIN(pool_stats.current_sessions)', minWidth:150, name:"MIN (Current Sessions)", groupable:false}},
            {select:"MAX(pool_stats.current_sessions)", display:{id:'MAX(pool_stats.current_sessions)', field:'MAX(pool_stats.current_sessions)', minWidth:150, name:"MAX (Current Sessions)", groupable:false}},

            {select:"pool_stats.max_sessions", display:{id:'pool_stats.max_sessions', field:'pool_stats.max_sessions', minWidth:150, name:"Max Sessions", groupable:false}},
            {select:"SUM(pool_stats.max_sessions)", display:{id:'SUM(pool_stats.max_sessions)', field:'SUM(pool_stats.max_sessions)', minWidth:150, name:"SUM (Max Sessions)", groupable:false}},
            {select:"MIN(pool_stats.max_sessions)", display:{id:'MIN(pool_stats.max_sessions)', field:'MIN(pool_stats.max_sessions)', minWidth:150, name:"MIN (Max Sessions)", groupable:false}},
            {select:"MAX(pool_stats.max_sessions)", display:{id:'MAX(pool_stats.max_sessions)', field:'MAX(pool_stats.max_sessions)', minWidth:150, name:"MAX (Max Sessions)", groupable:false}},

            {select:"pool_stats.total_sessions", display:{id:'pool_stats.total_sessions', field:'pool_stats.total_sessions', minWidth:150, name:"Total Sessions", groupable:false}},
            {select:"SUM(pool_stats.total_sessions)", display:{id:'SUM(pool_stats.total_sessions)', field:'SUM(pool_stats.total_sessions)', minWidth:150, name:"SUM (Total Sessions)", groupable:false}},
            {select:"MIN(pool_stats.total_sessions)", display:{id:'MIN(pool_stats.total_sessions)', field:'MIN(pool_stats.total_sessions)', minWidth:150, name:"MIN (Total Sessions)", groupable:false}},
            {select:"MAX(pool_stats.total_sessions)", display:{id:'MAX(pool_stats.total_sessions)', field:'MAX(pool_stats.total_sessions)', minWidth:150, name:"MAX (Total Sessions)", groupable:false}},

            {select:"pool_stats.bytes_in", display:{id:'pool_stats.bytes_in', field:'pool_stats.bytes_in', minWidth:150, name:"Bytes In", groupable:false}},
            {select:"SUM(pool_stats.bytes_in)", display:{id:'SUM(pool_stats.bytes_in)', field:'SUM(pool_stats.bytes_in)', minWidth:150, name:"SUM (Bytes In)", groupable:false}},
            {select:"MIN(pool_stats.bytes_in)", display:{id:'MIN(pool_stats.bytes_in)', field:'MIN(pool_stats.bytes_in)', minWidth:150, name:"MIN (Bytes In)", groupable:false}},
            {select:"MAX(pool_stats.bytes_in)", display:{id:'MAX(pool_stats.bytes_in)', field:'MAX(pool_stats.bytes_in)', minWidth:150, name:"MAX (Bytes In)", groupable:false}},

            {select:"pool_stats.bytes_out", display:{id:'pool_stats.bytes_out', field:'pool_stats.bytes_out', minWidth:150, name:"Bytes Out", groupable:false}},
            {select:"SUM(pool_stats.bytes_out)", display:{id:'SUM(pool_stats.bytes_out)', field:'SUM(pool_stats.bytes_out)', minWidth:150, name:"SUM (Bytes Out)", groupable:false}},
            {select:"MIN(pool_stats.bytes_out)", display:{id:'MIN(pool_stats.bytes_out)', field:'MIN(pool_stats.bytes_out)', minWidth:150, name:"MIN (Bytes Out)", groupable:false}},
            {select:"MAX(pool_stats.bytes_out)", display:{id:'MAX(pool_stats.bytes_out)', field:'MAX(pool_stats.bytes_out)', minWidth:150, name:"MAX (Bytes Out)", groupable:false}},

            {select:"pool_stats.connection_errors", display:{id:'pool_stats.connection_errors', field:'pool_stats.connection_errors', minWidth:150, name:"Connection Errors", groupable:false}},
            {select:"SUM(pool_stats.connection_errors)", display:{id:'SUM(pool_stats.connection_errors)', field:'SUM(pool_stats.connection_errors)', minWidth:150, name:"SUM (Connection Errors)", groupable:false}},
            {select:"MIN(pool_stats.connection_errors)", display:{id:'MIN(pool_stats.connection_errors)', field:'MIN(pool_stats.connection_errors)', minWidth:150, name:"MIN (Connection Errors)", groupable:false}},
            {select:"MAX(pool_stats.connection_errors)", display:{id:'MAX(pool_stats.connection_errors)', field:'MAX(pool_stats.connection_errors)', minWidth:150, name:"MAX (Connection Errors)", groupable:false}},

            {select:"pool_stats.reponse_errors", display:{id:'pool_stats.reponse_errors', field:'pool_stats.reponse_errors', minWidth:150, name:"Reponse Errors", groupable:false}},
            {select:"SUM(pool_stats.reponse_errors)", display:{id:'SUM(pool_stats.reponse_errors)', field:'SUM(pool_stats.reponse_errors)', minWidth:150, name:"SUM (Reponse Errors)", groupable:false}},
            {select:"MIN(pool_stats.reponse_errors)", display:{id:'MIN(pool_stats.reponse_errors)', field:'MIN(pool_stats.reponse_errors)', minWidth:150, name:"MIN (Reponse Errors)", groupable:false}},
            {select:"MAX(pool_stats.reponse_errors)", display:{id:'MAX(pool_stats.reponse_errors)', field:'MAX(pool_stats.reponse_errors)', minWidth:150, name:"MAX (Reponse Errors)", groupable:false}},
        ],
        "StatTable.UveLoadbalancer.member_stats": [
            {select:"COUNT(member_stats)", display:{id:'COUNT(member_stats)', field:'COUNT(member_stats)', minWidth:120, name:"Count (Pool Stats)", groupable:false}},
            {select:"member_stats.obj_name", display:{id:'member_stats.obj_name', field:'member_stats.obj_name', minWidth:150, name:"Object Name", groupable:false}},
            {select:"member_stats.uuid", display:{id:"member_stats.uuid", field:"member_stats.uuid", name:"Pool Stats UUID",  minWidth:280, groupable:true}},
            {select:"member_stats.status", display:{id:"member_stats.status", field:"member_stats.status", name:"Status",  minWidth:150, groupable:true}},
            {select:"member_stats.vrouter", display:{id:"member_stats.vrouter", field:"member_stats.vrouter", name:"Vrouter",  minWidth:150, groupable:true}},

            {select:"member_stats.active_connections", display:{id:'member_stats.active_connections', field:'member_stats.active_connections', minWidth:150, name:"Active Connections", groupable:false}},
            {select:"SUM(member_stats.active_connections)", display:{id:'SUM(member_stats.active_connections)', field:'SUM(member_stats.active_connections)', minWidth:150, name:"SUM (Active Connections)", groupable:false}},
            {select:"MIN(member_stats.active_connections)", display:{id:'MIN(member_stats.active_connections)', field:'MIN(member_stats.active_connections)', minWidth:150, name:"MIN (Active Connections)", groupable:false}},
            {select:"MAX(member_stats.active_connections)", display:{id:'MAX(member_stats.active_connections)', field:'MAX(member_stats.active_connections)', minWidth:150, name:"MAX (Active Connections)", groupable:false}},

            {select:"member_stats.max_connections", display:{id:'member_stats.max_connections', field:'member_stats.max_connections', minWidth:150, name:"Max Connections", groupable:false}},
            {select:"SUM(member_stats.max_connections)", display:{id:'SUM(member_stats.max_connections)', field:'SUM(member_stats.max_connections)', minWidth:150, name:"SUM (Max Connections)", groupable:false}},
            {select:"MIN(member_stats.max_connections)", display:{id:'MIN(member_stats.max_connections)', field:'MIN(member_stats.max_connections)', minWidth:150, name:"MIN (Max Connections)", groupable:false}},
            {select:"MAX(member_stats.max_connections)", display:{id:'MAX(member_stats.max_connections)', field:'MAX(member_stats.max_connections)', minWidth:150, name:"MAX (Max Connections)", groupable:false}},

            {select:"member_stats.current_sessions", display:{id:'member_stats.current_sessions', field:'member_stats.current_sessions', minWidth:150, name:"Current Sessions", groupable:false}},
            {select:"SUM(member_stats.current_sessions)", display:{id:'SUM(member_stats.current_sessions)', field:'SUM(member_stats.current_sessions)', minWidth:150, name:"SUM (Current Sessions)", groupable:false}},
            {select:"MIN(member_stats.current_sessions)", display:{id:'MIN(member_stats.current_sessions)', field:'MIN(member_stats.current_sessions)', minWidth:150, name:"MIN (Current Sessions)", groupable:false}},
            {select:"MAX(member_stats.current_sessions)", display:{id:'MAX(member_stats.current_sessions)', field:'MAX(member_stats.current_sessions)', minWidth:150, name:"MAX (Current Sessions)", groupable:false}},

            {select:"member_stats.max_sessions", display:{id:'member_stats.max_sessions', field:'member_stats.max_sessions', minWidth:150, name:"Max Sessions", groupable:false}},
            {select:"SUM(member_stats.max_sessions)", display:{id:'SUM(member_stats.max_sessions)', field:'SUM(member_stats.max_sessions)', minWidth:150, name:"SUM (Max Sessions)", groupable:false}},
            {select:"MIN(member_stats.max_sessions)", display:{id:'MIN(member_stats.max_sessions)', field:'MIN(member_stats.max_sessions)', minWidth:150, name:"MIN (Max Sessions)", groupable:false}},
            {select:"MAX(member_stats.max_sessions)", display:{id:'MAX(member_stats.max_sessions)', field:'MAX(member_stats.max_sessions)', minWidth:150, name:"MAX (Max Sessions)", groupable:false}},

            {select:"member_stats.total_sessions", display:{id:'member_stats.total_sessions', field:'member_stats.total_sessions', minWidth:150, name:"Total Sessions", groupable:false}},
            {select:"SUM(member_stats.total_sessions)", display:{id:'SUM(member_stats.total_sessions)', field:'SUM(member_stats.total_sessions)', minWidth:150, name:"SUM (Total Sessions)", groupable:false}},
            {select:"MIN(member_stats.total_sessions)", display:{id:'MIN(member_stats.total_sessions)', field:'MIN(member_stats.total_sessions)', minWidth:150, name:"MIN (Total Sessions)", groupable:false}},
            {select:"MAX(member_stats.total_sessions)", display:{id:'MAX(member_stats.total_sessions)', field:'MAX(member_stats.total_sessions)', minWidth:150, name:"MAX (Total Sessions)", groupable:false}},

            {select:"member_stats.bytes_in", display:{id:'member_stats.bytes_in', field:'member_stats.bytes_in', minWidth:150, name:"Bytes In", groupable:false}},
            {select:"SUM(member_stats.bytes_in)", display:{id:'SUM(member_stats.bytes_in)', field:'SUM(member_stats.bytes_in)', minWidth:150, name:"SUM (Bytes In)", groupable:false}},
            {select:"MIN(member_stats.bytes_in)", display:{id:'MIN(member_stats.bytes_in)', field:'MIN(member_stats.bytes_in)', minWidth:150, name:"MIN (Bytes In)", groupable:false}},
            {select:"MAX(member_stats.bytes_in)", display:{id:'MAX(member_stats.bytes_in)', field:'MAX(member_stats.bytes_in)', minWidth:150, name:"MAX (Bytes In)", groupable:false}},

            {select:"member_stats.bytes_out", display:{id:'member_stats.bytes_out', field:'member_stats.bytes_out', minWidth:150, name:"Bytes Out", groupable:false}},
            {select:"SUM(member_stats.bytes_out)", display:{id:'SUM(member_stats.bytes_out)', field:'SUM(member_stats.bytes_out)', minWidth:150, name:"SUM (Bytes Out)", groupable:false}},
            {select:"MIN(member_stats.bytes_out)", display:{id:'MIN(member_stats.bytes_out)', field:'MIN(member_stats.bytes_out)', minWidth:150, name:"MIN (Bytes Out)", groupable:false}},
            {select:"MAX(member_stats.bytes_out)", display:{id:'MAX(member_stats.bytes_out)', field:'MAX(member_stats.bytes_out)', minWidth:150, name:"MAX (Bytes Out)", groupable:false}},

            {select:"member_stats.connection_errors", display:{id:'member_stats.connection_errors', field:'member_stats.connection_errors', minWidth:150, name:"Connection Errors", groupable:false}},
            {select:"SUM(member_stats.connection_errors)", display:{id:'SUM(member_stats.connection_errors)', field:'SUM(member_stats.connection_errors)', minWidth:150, name:"SUM (Connection Errors)", groupable:false}},
            {select:"MIN(member_stats.connection_errors)", display:{id:'MIN(member_stats.connection_errors)', field:'MIN(member_stats.connection_errors)', minWidth:150, name:"MIN (Connection Errors)", groupable:false}},
            {select:"MAX(member_stats.connection_errors)", display:{id:'MAX(member_stats.connection_errors)', field:'MAX(member_stats.connection_errors)', minWidth:150, name:"MAX (Connection Errors)", groupable:false}},

            {select:"member_stats.reponse_errors", display:{id:'member_stats.reponse_errors', field:'member_stats.reponse_errors', minWidth:150, name:"Reponse Errors", groupable:false}},
            {select:"SUM(member_stats.reponse_errors)", display:{id:'SUM(member_stats.reponse_errors)', field:'SUM(member_stats.reponse_errors)', minWidth:150, name:"SUM (Reponse Errors)", groupable:false}},
            {select:"MIN(member_stats.reponse_errors)", display:{id:'MIN(member_stats.reponse_errors)', field:'MIN(member_stats.reponse_errors)', minWidth:150, name:"MIN (Reponse Errors)", groupable:false}},
            {select:"MAX(member_stats.reponse_errors)", display:{id:'MAX(member_stats.reponse_errors)', field:'MAX(member_stats.reponse_errors)', minWidth:150, name:"MAX (Reponse Errors)", groupable:false}},
        ],
        "StatTable.NodeStatus.disk_usage_info": [
            {select:"COUNT(disk_usage_info)", display:{id:'COUNT(disk_usage_info)', field:'COUNT(disk_usage_info)', minWidth:120, name:"Count (Disk Usage Info)", groupable:false}},
            {select:"disk_usage_info.partition_type", display:{id:'disk_usage_info.partition_type', field:'disk_usage_info.partition_type', minWidth:150, name:"Partition Type", groupable:false}},
            {select:"disk_usage_info.partition_name", display:{id:'disk_usage_info.partition_name', field:'disk_usage_info.partition_name', minWidth:150, name:"Partition Name", groupable:false}},

            {select:"disk_usage_info.partition_space_used_1k", display:{id:'disk_usage_info.partition_space_used_1k', field:'disk_usage_info.partition_space_used_1k', minWidth:150, name:"Partition Space Used (1k)", groupable:false}},
            {select:"SUM(disk_usage_info.partition_space_used_1k)", display:{id:'SUM(disk_usage_info.partition_space_used_1k)', field:'SUM(disk_usage_info.partition_space_used_1k)', minWidth:150, name:"SUM (Partition Space Used (1k))", groupable:false}},
            {select:"MIN(disk_usage_info.partition_space_used_1k)", display:{id:'MIN(disk_usage_info.partition_space_used_1k)', field:'MIN(disk_usage_info.partition_space_used_1k)', minWidth:150, name:"MIN (Partition Space Used (1k))", groupable:false}},
            {select:"MAX(disk_usage_info.partition_space_used_1k)", display:{id:'MAX(disk_usage_info.partition_space_used_1k)', field:'MAX(disk_usage_info.partition_space_used_1k)', minWidth:150, name:"MAX (Partition Space Used (1k))", groupable:false}},
        ],
        "StatTable.UveVMInterfaceAgent.fip_diff_stats": [
            {select:"COUNT(fip_diff_stats)", display:{id:'COUNT(fip_diff_stats)', field:'COUNT(fip_diff_stats)', minWidth:120, name:"Count (FIP Diff Stats)", groupable:false}},
            {select:"virtual_network", display:{id:'virtual_network', field:'virtual_network', minWidth:150, name:"Virtual Network", groupable:false}},
            {select:"fip_diff_stats.other_vn", display:{id:'fip_diff_stats.other_vn', field:'fip_diff_stats.other_vn', minWidth:150, name:"Other VN", groupable:false}},
            {select:"fip_diff_stats.ip_address", display:{id:'fip_diff_stats.ip_address', field:'fip_diff_stats.ip_address', minWidth:150, name:"IP Address", groupable:false}},

            {select:"fip_diff_stats.in_pkts", display:{id:'fip_diff_stats.in_pkts', field:'fip_diff_stats.in_pkts', minWidth:150, name:"In Pkts", groupable:false}},
            {select:"SUM(fip_diff_stats.in_pkts)", display:{id:'SUM(fip_diff_stats.in_pkts)', field:'SUM(fip_diff_stats.in_pkts)', minWidth:150, name:"SUM (In Pkts)", groupable:false}},
            {select:"MIN(fip_diff_stats.in_pkts)", display:{id:'MIN(fip_diff_stats.in_pkts)', field:'MIN(fip_diff_stats.in_pkts)', minWidth:150, name:"MIN (In Pkts)", groupable:false}},
            {select:"MAX(fip_diff_stats.in_pkts)", display:{id:'MAX(fip_diff_stats.in_pkts)', field:'MAX(fip_diff_stats.in_pkts)', minWidth:150, name:"MAX (In Pkts)", groupable:false}},

            {select:"fip_diff_stats.in_pkts", display:{id:'fip_diff_stats.in_bytes', field:'fip_diff_stats.in_bytes', minWidth:150, name:"In Bytes", groupable:false}},
            {select:"SUM(fip_diff_stats.in_bytes)", display:{id:'SUM(fip_diff_stats.in_bytes)', field:'SUM(fip_diff_stats.in_bytes)', minWidth:150, name:"SUM (In Bytes)", groupable:false}},
            {select:"MIN(fip_diff_stats.in_bytes)", display:{id:'MIN(fip_diff_stats.in_bytes)', field:'MIN(fip_diff_stats.in_bytes)', minWidth:150, name:"MIN (In Bytes)", groupable:false}},
            {select:"MAX(fip_diff_stats.in_bytes)", display:{id:'MAX(fip_diff_stats.in_bytes)', field:'MAX(fip_diff_stats.in_bytes)', minWidth:150, name:"MAX (In Bytes)", groupable:false}},

            {select:"fip_diff_stats.out_pkts", display:{id:'fip_diff_stats.out_pkts', field:'fip_diff_stats.out_pkts', minWidth:150, name:"Out Pkts", groupable:false}},
            {select:"SUM(fip_diff_stats.out_pkts)", display:{id:'SUM(fip_diff_stats.out_pkts)', field:'SUM(fip_diff_stats.out_pkts)', minWidth:150, name:"SUM (Out Pkts)", groupable:false}},
            {select:"MIN(fip_diff_stats.out_pkts)", display:{id:'MIN(fip_diff_stats.out_pkts)', field:'MIN(fip_diff_stats.out_pkts)', minWidth:150, name:"MIN (Out Pkts)", groupable:false}},
            {select:"MAX(fip_diff_stats.out_pkts)", display:{id:'MAX(fip_diff_stats.out_pkts)', field:'MAX(fip_diff_stats.out_pkts)', minWidth:150, name:"MAX (Out Pkts)", groupable:false}},

            {select:"fip_diff_stats.out_bytes", display:{id:'fip_diff_stats.out_bytes', field:'fip_diff_stats.out_bytes', minWidth:150, name:"Out Bytes", groupable:false}},
            {select:"SUM(fip_diff_stats.out_bytes)", display:{id:'SUM(fip_diff_stats.out_bytes)', field:'SUM(fip_diff_stats.out_bytes)', minWidth:150, name:"SUM (Out Bytes)", groupable:false}},
            {select:"MIN(fip_diff_stats.out_bytes)", display:{id:'MIN(fip_diff_stats.out_bytes)', field:'MIN(fip_diff_stats.out_bytes)', minWidth:150, name:"MIN (Out Bytes)", groupable:false}},
            {select:"MAX(fip_diff_stats.out_bytes)", display:{id:'MAX(fip_diff_stats.out_bytes)', field:'MAX(fip_diff_stats.out_bytes)', minWidth:150, name:"MAX (Out Bytes)", groupable:false}},
        ],
        "StatTable.UveVMInterfaceAgent.if_stats" : [
            {select:"COUNT(if_stats)", display:{id:'COUNT(if_stats)', field:'COUNT(if_stats)', minWidth:120, name:"Count (Interface Stats)", groupable:false}},
            {select:"virtual_network", display:{id:'virtual_network', field:'virtual_network', minWidth:150, name:"Virtual Network", groupable:false}},
            {select:"if_stats.other_vn", display:{id:'if_stats.other_vn', field:'if_stats.other_vn', minWidth:150, name:"Other VN", groupable:false}},
            {select:"if_stats.ip_address", display:{id:'if_stats.ip_address', field:'if_stats.ip_address', minWidth:150, name:"IP Address", groupable:false}},

            {select:"if_stats.in_pkts", display:{id:'if_stats.in_pkts', field:'if_stats.in_pkts', minWidth:150, name:"In Pkts", groupable:false}},
            {select:"SUM(if_stats.in_pkts)", display:{id:'SUM(if_stats.in_pkts)', field:'SUM(if_stats.in_pkts)', minWidth:150, name:"SUM (In Pkts)", groupable:false}},
            {select:"MIN(if_stats.in_pkts)", display:{id:'MIN(if_stats.in_pkts)', field:'MIN(if_stats.in_pkts)', minWidth:150, name:"MIN (In Pkts)", groupable:false}},
            {select:"MAX(if_stats.in_pkts)", display:{id:'MAX(if_stats.in_pkts)', field:'MAX(if_stats.in_pkts)', minWidth:150, name:"MAX (In Pkts)", groupable:false}},

            {select:"if_stats.in_pkts", display:{id:'if_stats.in_bytes', field:'if_stats.in_bytes', minWidth:150, name:"In Bytes", groupable:false}},
            {select:"SUM(if_stats.in_bytes)", display:{id:'SUM(if_stats.in_bytes)', field:'SUM(if_stats.in_bytes)', minWidth:150, name:"SUM (In Bytes)", groupable:false}},
            {select:"MIN(if_stats.in_bytes)", display:{id:'MIN(if_stats.in_bytes)', field:'MIN(if_stats.in_bytes)', minWidth:150, name:"MIN (In Bytes)", groupable:false}},
            {select:"MAX(if_stats.in_bytes)", display:{id:'MAX(if_stats.in_bytes)', field:'MAX(if_stats.in_bytes)', minWidth:150, name:"MAX (In Bytes)", groupable:false}},

            {select:"if_stats.out_pkts", display:{id:'if_stats.out_pkts', field:'if_stats.out_pkts', minWidth:150, name:"Out Pkts", groupable:false}},
            {select:"SUM(if_stats.out_pkts)", display:{id:'SUM(if_stats.out_pkts)', field:'SUM(if_stats.out_pkts)', minWidth:150, name:"SUM (Out Pkts)", groupable:false}},
            {select:"MIN(if_stats.out_pkts)", display:{id:'MIN(if_stats.out_pkts)', field:'MIN(if_stats.out_pkts)', minWidth:150, name:"MIN (Out Pkts)", groupable:false}},
            {select:"MAX(if_stats.out_pkts)", display:{id:'MAX(if_stats.out_pkts)', field:'MAX(if_stats.out_pkts)', minWidth:150, name:"MAX (Out Pkts)", groupable:false}},

            {select:"if_stats.out_bytes", display:{id:'if_stats.out_bytes', field:'if_stats.out_bytes', minWidth:150, name:"Out Bytes", groupable:false}},
            {select:"SUM(if_stats.out_bytes)", display:{id:'SUM(if_stats.out_bytes)', field:'SUM(if_stats.out_bytes)', minWidth:150, name:"SUM (Out Bytes)", groupable:false}},
            {select:"MIN(if_stats.out_bytes)", display:{id:'MIN(if_stats.out_bytes)', field:'MIN(if_stats.out_bytes)', minWidth:150, name:"MIN (Out Bytes)", groupable:false}},
            {select:"MAX(if_stats.out_bytes)", display:{id:'MAX(if_stats.out_bytes)', field:'MAX(if_stats.out_bytes)', minWidth:150, name:"MAX (Out Bytes)", groupable:false}},
        ],
        "defaultStatColumns": [
            {select:"T", display:{id:"T", field:"T", minWidth:210, name:"Time", formatter: function(r, c, v, cd, dc) { return formatMicroDate(dc.T); }, filterable:false, groupable:false}},
            {select:"T=", display:{id: 'T=', field:'["T="]', minWidth:210, name:"Time", formatter: function(r, c, v, cd, dc) { return formatMicroDate(dc['T=']); }, filterable:false, groupable:false}},
            {select:"UUID", display:{id:"UUID", field:"UUID", name:"UUID",  minWidth:280, groupable:true}},
            {select:"name", display:{id:'name', field:'name', minWidth:150, name:"Name", groupable:false}},
            {select:"Source", display:{id:'Source', field:'Source', minWidth:150, name:"Source", groupable:false}}
        ],
        "defaultObjectColumns": [
            {select: "MessageTS", display:{id: "MessageTS", field: "MessageTS", name: "Time", minWidth:210, filterable:false, groupable:false, formatter: function(r, c, v, cd, dc) { return (dc.MessageTS && dc.MessageTS != '')  ? (formatMicroDate(dc.MessageTS)) : ''; }}},
            {select: "ObjectId", display:{id:"ObjectId", field:"ObjectId", name:"Object Id", minWidth:150, searchable: true, formatter: function(r, c, v, cd, dc) { return handleNull4Grid(dc.ObjectId);}}},
            {select: "Source", display:{id:"Source", field:"Source", name:"Source", minWidth:150, searchable: true, formatter: function(r, c, v, cd, dc) { return handleNull4Grid(dc.Source);}}},
            {select: "ModuleId", display:{id: "ModuleId", field: "ModuleId", name: "Module Id", minWidth: 150, searchable:true, formatter: function(r, c, v, cd, dc) { return handleNull4Grid(dc.ModuleId);}}},
            {select: "Messagetype", display:{id:"Messagetype", field:"Messagetype", name:"Message Type", minWidth:300, searchable:true, formatter: function(r, c, v, cd, dc) { return handleNull4Grid(dc.Messagetype); }}},
            {select: "SystemLog", display:{id:"SystemLog", field:"SystemLog", name:"System Log", minWidth:300, searchable:true, formatter: function(r, c, v, cd, dc) { return contrail.checkIfExist(dc.SystemLog) ? contrail.formatJSON2HTML(dc.SystemLog, 0) : null}}},
            {select: "ObjectLog", display:{id:"ObjectLog", field:"ObjectLog", name:"Object Log", minWidth:300, searchable:true, formatter: function(r, c, v, cd, dc) { return contrail.checkIfExist(dc.ObjectLog) ? contrail.formatJSON2HTML(dc.ObjectLog, 0) : null}}}
        ],
        "MessageTable": [
            {select: "MessageTS", display:{id: "MessageTS", field: "MessageTS", name: "Time", minWidth:210, filterable:false, groupable:false, formatter: function(r, c, v, cd, dc) { return (dc.MessageTS && dc.MessageTS != '')  ? (formatMicroDate(dc.MessageTS)) : ''; }}},
            {select: "Source", display:{id:"Source", field:"Source", name:"Source", minWidth:150, searchable: true, formatter: function(r, c, v, cd, dc) { return handleNull4Grid(dc.Source);}}},
            {select: "NodeType", display:{id:"NodeType", field:"NodeType", name:"Node Type", minWidth:150, searchable: true, formatter: function(r, c, v, cd, dc) { return handleNull4Grid(dc.NodeType);}}},
            {select: "ModuleId", display:{id: "ModuleId", field: "ModuleId", name: "Module Id", minWidth: 150, searchable:true, formatter: function(r, c, v, cd, dc) { return handleNull4Grid(dc.ModuleId);}}},
            {select: "Category", display:{id: "Category", field: "Category", name: "Category", minWidth: 150, searchable:true, formatter: function(r, c, v, cd, dc) { return handleNull4Grid(dc.Category);}}},
            {select: "Messagetype", display:{id:"Messagetype", field:"Messagetype", name:"Message Type", minWidth:200, searchable:true, formatter: function(r, c, v, cd, dc) { return handleNull4Grid(dc.Messagetype); }}},
            {select: "Level", display:{id:"Level", field:"Level", name:"Level", minWidth:150, searchable:true, formatter: function(r, c, v, cd, dc) { return qewu.getLevelName4Value(dc.Level); }}},
            {select: "Context", display:{id:"Context", field:"Context", name:"Context", minWidth:150, searchable:true, formatter: function(r, c, v, cd, dc) { return handleNull4Grid(dc.Context); }}},
            {select: "Keyword", display:{id:"Keyword", field:"Keyword", name:"Keyword", minWidth:150, searchable:true, formatter: function(r, c, v, cd, dc) { return handleNull4Grid(dc.Keyword); }}},
            {select: "Xmlmessage", display:{id:"Xmlmessage", field:"Xmlmessage", name:"Log Message", minWidth:500, searchable:true, formatter: function(r, c, v, cd, dc) { return '<span class="word-break-normal">' + contrail.checkIfExist(dc.Xmlmessage) ? handleNull4Grid(contrail.checkIfExist(dc.Xmlmessage['Message']) ? dc.Xmlmessage['Message'] : dc.Xmlmessage['log_msg']) : '' + '</span>'; }, exportConfig: { allow: true, advFormatter: function(dc) { return dc.Xmlmessage } }}},
        ]
    };

    return QEGridConfig;
});
/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['contrail-list-model'], function(ContrailListModel) {
    var LogListModel = function() {
        var listModelConfig = {
            remote : {
                ajaxConfig : {
                    url : cowl.DASHBOARD_LOGS_URL
                },
                dataParser : parseDashboardLogs,
            },
            cacheConfig : {
                ucid : cowl.CACHE_DASHBORAD_LOGS
            }
        };

        function parseDashboardLogs(result) {
            var UVEModuleIds = monitorInfraConstants.UVEModuleIds;
            retArr = $.map(getValueByJsonPath(result,'data',[]),function(obj,idx) {
                obj['message'] = cowu.formatXML2JSON(obj['Xmlmessage']);
                obj['timeStr'] = diffDates(new XDate(obj['MessageTS']/1000),new XDate());
                if(obj['Source'] == null)
                    obj['moduleId'] = contrail.format('{0}',obj['ModuleId']);
                else
                    obj['moduleId'] = contrail.format('{0} ({1})',obj['ModuleId'],obj['Source']);
                if($.inArray(obj['ModuleId'],[UVEModuleIds['DISCOVERY_SERVICE'],
                    UVEModuleIds['SERVICE_MONITOR'],UVEModuleIds['SCHEMA'],
                    UVEModuleIds['APISERVER']]) != -1) {
                    obj['link'] = {
                        p: 'mon_infra_config',
                        q: {
                            view: "details",
                            focusedElement: {
                                node: obj['Source'],
                                tab: 'details'
                            }
                        }
                    };
                } else if($.inArray(obj['ModuleId'],[UVEModuleIds['COLLECTOR'],
                    UVEModuleIds['OPSERVER'],UVEModuleIds['QUERYENGINE']],
                    obj['ModuleId']) != -1) {
                    obj['link'] = {
                        p: 'mon_infra_analytics',
                        q: {
                            view: 'details',
                            focusedElement: {
                                node: obj['Source'],
                                tab:'details'
                            }
                        },
                    };
                } else if($.inArray(obj['ModuleId'],[UVEModuleIds['VROUTER_AGENT']]) != -1) {
                    obj['link'] = {
                        p: 'mon_infra_vrouter',
                        q: {
                            view: "details",
                            focusedElement: {
                                node: obj['Source'],
                                tab: 'details'
                            }
                        }
                    };
                } else if($.inArray(obj['ModuleId'],[UVEModuleIds['CONTROLNODE']]) != -1) {
                    obj['link'] = {
                        p: 'mon_infra_control',
                        q: {
                            view: 'details',
                            focusedElement: {
                                node: obj['Source'],
                                tab:'details'
                            }
                        },
                    };
                } else if($.inArray(obj['ModuleId'],[UVEModuleIds['DATABASE']]) != -1) {
                    obj['link'] = {
                        p: 'mon_infra_database',
                        q: {
                            view: 'details',
                            focusedElement: {
                                node: obj['Source'],
                                tab:'details'
                            }
                        },
                    };
                };
                return obj;
            });
            return retArr;
        };
        return ContrailListModel(listModelConfig);
    };
    return LogListModel;
});

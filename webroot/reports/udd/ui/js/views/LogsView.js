/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    "lodash",
    "contrail-view"
], function(_, ContrailView) {
    var LogsView = ContrailView.extend({

        initialize: function() {
            var self = this;
            self.model.onDataUpdate.subscribe(function() {
                // TODO remove timeout
                // self.model.isRequestInProgress should return false here
                setTimeout(function() {
                    self.render();
                });
            });
            self.template = window.contrail.getTemplate4Id(ctwl.TMPL_LOG_LIST);
        },

        render: function() {
            var self = this;
            var data;
            var list = self.model.getItems();
            if (self.model.isRequestInProgress()) {
                data = window.cowm.DATA_FETCHING;
            } else {
                data = self._format(list.slice(0, self.attributes.viewConfig.totalRecords));
                if (_.isEmpty(data)) {
                    if (!_.isEmpty(list)) {
                        data = window.cowm.DATA_COMPATIBILITY_ERROR;
                    } else {
                        data = window.cowm.DATA_SUCCESS_EMPTY;
                    }
                }
            }
            self.$el.html(self.template(data));
        },

        _format: function(data) {
            if (!data || data.length === 0 || !_.isString(data[0].Xmlmessage) || !_.isNumber(data[0].MessageTS)) {
                return [];
            }

            var UVEModuleIds = window.monitorInfraConstants.UVEModuleIds;
            var retArr = $.map(data, function(obj) {
                obj.message = window.cowu.formatXML2JSON(obj.Xmlmessage);
                obj.timeStr = window.diffDates(new window.XDate(obj.MessageTS / 1000), new window.XDate());
                if (obj.Source === null) {
                    obj.moduleId = window.contrail.format("{0}", obj.ModuleId);
                } else {
                    obj.moduleId = window.contrail.format("{0} ({1})", obj.ModuleId, obj.Source);
                }
                if ($.inArray(obj.ModuleId, [UVEModuleIds.DISCOVERY_SERVICE,
                        UVEModuleIds.SERVICE_MONITOR, UVEModuleIds.SCHEMA,
                        UVEModuleIds.CONFIG_NODE
                    ]) !== -1) {
                    obj.link = {
                        p: "mon_infra_config",
                        q: {
                            type: "configNode",
                            view: "details",
                            focusedElement: {
                                node: obj.Source,
                                tab: "details",
                            },
                        },
                    };
                } else if ($.inArray(obj.ModuleId, [UVEModuleIds.COLLECTOR,
                            UVEModuleIds.OPSERVER, UVEModuleIds.QUERYENGINE
                        ],
                        obj.ModuleId) !== -1) {
                    obj.link = {
                        p: "mon_infra_analytics",
                        q: {
                            type: "controlNode",
                            view: "details",
                            focusedElement: {
                                node: obj.Source,
                                tab: "details",
                            },
                        },
                    };
                } else if ($.inArray(obj.ModuleId, [UVEModuleIds.VROUTER_AGENT]) !== -1) {
                    obj.link = {
                        p: "mon_infra_vrouter",
                        q: {
                            type: "vRouter",
                            view: "details",
                            focusedElement: {
                                node: obj.Source,
                                tab: "details",
                            },
                        },
                    };
                } else if ($.inArray(obj.ModuleId, [UVEModuleIds.CONTROLNODE]) !== -1) {
                    obj.link = {
                        p: "mon_infra_control",
                        q: {
                            type: "controlNode",
                            view: "details",
                            focusedElement: {
                                node: obj.Source,
                                tab: "details",
                            },
                        },
                    };
                }
                return obj;
            });
            return retArr;
        },
    });
    return LogsView;
});

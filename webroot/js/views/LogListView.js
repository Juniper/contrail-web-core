/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    "lodash",
    "core-constants",
    "contrail-view"
], function(_, cowc, ContrailView) {
    function parser(data) {
        if (!data || data.length === 0 || !_.isString(data[0].Xmlmessage) || !_.isNumber(data[0].MessageTS)) {
            return [];
        }

        var UVEModuleIds = window.monitorInfraConstants.UVEModuleIds,
            retArr = $.map(data, function(obj) {
                obj.message = window.cowu.formatXML2JSON(obj.Xmlmessage);

                _.forEach(obj.message, function(value, key, obj) {
                    obj[key] = value.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\\"/g, "\"");
                });

                obj.timeStr = window.diffDates(new window.XDate(obj.MessageTS / 1000), new window.XDate());

                if (obj.Source === null) {
                    obj.moduleId = window.contrail.format("{0}", obj.ModuleId);
                } else {
                    obj.moduleId = window.contrail.format("{0} ({1})", obj.ModuleId, obj.Source);
                }

                obj.link = {
                    q: {
                        view: "details",
                        focusedElement: {
                            node: obj.Source,
                            tab: "details",
                        }
                    }
                };

                switch(obj.ModuleId) {
                    case UVEModuleIds.DISCOVERY_SERVICE:
                    case UVEModuleIds.SERVICE_MONITOR:
                    case UVEModuleIds.SCHEMA:
                    case UVEModuleIds.CONFIG_NODE:
                        obj.link = _.merge(obj.link, {
                            p: "mon_infra_config",
                            q: {
                                type: "configNode"
                            },
                        });
                        break;
                    case UVEModuleIds.COLLECTOR:
                    case UVEModuleIds.OPSERVER:
                    case UVEModuleIds.QUERYENGINE:
                        obj.link = _.merge(obj.link, {
                            p: "mon_infra_config",
                            q: {
                                type: "configNode"
                            },
                        });
                        break;
                    case UVEModuleIds.VROUTER_AGENT:
                        obj.link = _.merge(obj.link, {
                            p: "mon_infra_vrouter",
                            q: {
                                type: "vRouter"
                            },
                        });
                        break;
                    case UVEModuleIds.CONTROLNODE:
                        obj.link = _.merge(obj.link, {
                            p: "mon_infra_control",
                            q: {
                                type: "controlNode"
                            },
                        });
                        break;
                    case UVEModuleIds.DATABASE:
                        obj.link = _.merge(obj.link, {
                            p: "mon_infra_database",
                            q: {
                                type: "dbNode"
                            },
                        });
                        break;
                }
                return obj;
            });

        return retArr;
    }

    var LogListView = ContrailView.extend({
        initialize: function() {
            var self = this;
            
            self.model.onDataUpdate.subscribe(function() {
                setTimeout(function() { // timer is needed due to irregular event execution sequence.
                                        // Without timer, render() will read the old value of
                                        // model.isRequestInProgress()
                    self.render();
                });
            });

            self.template = window.contrail.getTemplate4Id(cowc.TMPL_LOG_LIST);
        },
        render: function() {
            var data,
                list = this.model.getItems();

            if (this.model.isRequestInProgress()) {
                data = window.cowm.DATA_FETCHING;
            } else {
                data = parser(list.slice(0, _.get(this, ["attributes", "viewConfig", "totalRecords"], 3)));
                if (_.isEmpty(data)) {
                    if (!_.isEmpty(list)) {
                        data = window.cowm.DATA_COMPATIBILITY_ERROR;
                    } else {
                        data = window.cowm.DATA_SUCCESS_EMPTY;
                    }
                }
            }
            this.$el.html(this.template(data));
        }
    });
    return LogListView;
});

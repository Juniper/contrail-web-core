/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    "contrail-view"
], function(ContrailView) {
    var QueryEngineView = ContrailView.extend({
        el: $(window.contentContainer),

        renderFlowSeries: function (viewConfig) {
            this.renderView4Config(this.$el, null, getFlowSeriesViewConfig(viewConfig));
        },

        renderFlowRecord: function (viewConfig) {
            this.renderView4Config(this.$el, null, getFlowRecordViewConfig(viewConfig));
        },

        renderFlowQueue: function (viewConfig) {
            this.renderView4Config(this.$el, null, getQueueViewConfig(viewConfig, cowc.QE_FLOW_QUERY_QUEUE));
        },

        renderSystemLogs: function(viewConfig) {
            this.renderView4Config(this.$el, null, getSystemLogsViewConfig(viewConfig));
        },

        renderObjectLogs: function(viewConfig) {
            this.renderView4Config(this.$el, null, getObjectLogsViewConfig(viewConfig));
        },

        renderLogQueue: function(viewConfig) {
            this.renderView4Config(this.$el, null, getQueueViewConfig(viewConfig, cowc.QE_LOG_QUERY_QUEUE));
        },

        renderStatQuery: function(viewConfig) {
            this.renderView4Config(this.$el, null, getStatQueryViewConfig(viewConfig));
        },

        renderStatQueue: function(viewConfig) {
            this.renderView4Config(this.$el, null, getQueueViewConfig(viewConfig, cowc.QE_STAT_QUERY_QUEUE));
        }
    });

    function getFlowSeriesViewConfig() {
        return {
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: cowl.QE_FLOW_SERIES_ID,
                                view: "FlowSeriesFormView",
                                viewPathPrefix: "reports/qe/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    widgetConfig: {
                                        elementId: cowl.QE_FLOW_SERIES_ID + "-widget",
                                        view: "WidgetView",
                                        viewConfig: {
                                            header: {
                                                title: cowl.TITLE_QUERY,
                                                iconClass: "fa fa-search"
                                            },
                                            controls: {
                                                top: {
                                                    default: {
                                                        collapseable: true
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        };
    }

    function getFlowRecordViewConfig() {
        return {
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: cowl.QE_FLOW_RECORD_ID,
                                view: "FlowRecordFormView",
                                viewPathPrefix: "reports/qe/ui/js/views/",
                                app: cowc.APP_CONTRAIL_CONTROLLER,
                                viewConfig: {
                                    widgetConfig: {
                                        elementId: cowl.QE_FLOW_RECORD_ID + "-widget",
                                        view: "WidgetView",
                                        viewConfig: {
                                            header: {
                                                title: cowl.TITLE_QUERY,
                                                iconClass: "fa fa-search"
                                            },
                                            controls: {
                                                top: {
                                                    default: {
                                                        collapseable: true
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        };
    }

    function getStatQueryViewConfig() {
        return {
            view: "SectionView",
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: cowl.QE_STAT_QUERY_ID,
                        view: "StatQueryFormView",
                        viewPathPrefix: "reports/qe/ui/js/views/",
                        app: cowc.APP_CONTRAIL_CONTROLLER,
                        viewConfig: {
                            widgetConfig: {
                                elementId: cowl.QE_STAT_QUERY_ID + "-widget",
                                view: "WidgetView",
                                viewConfig: {
                                    header: {
                                        title: cowl.TITLE_QUERY,
                                        iconClass: "fa fa-search"
                                    },
                                    controls: {
                                        top: {
                                            default: {
                                                collapseable: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }]
                }]
            }
        };
    }

    function getSystemLogsViewConfig() {
        return {
            view: "SectionView",
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: cowl.QE_SYSTEM_LOGS_ID,
                        view: "SystemLogsFormView",
                        viewPathPrefix: "reports/qe/ui/js/views/",
                        app: cowc.APP_CONTRAIL_CONTROLLER,
                        viewConfig: {
                            widgetConfig: {
                                elementId: cowl.QE_SYSTEM_LOGS_ID + "-widget",
                                view: "WidgetView",
                                viewConfig: {
                                    header: {
                                        title: cowl.TITLE_QUERY,
                                        iconClass: "fa fa-search"
                                    },
                                    controls: {
                                        top: {
                                            default: {
                                                collapseable: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }]
                }]
            }
        };
    }

    function getObjectLogsViewConfig() {
        return {
            view: "SectionView",
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: cowl.QE_OBJECT_LOGS_ID,
                        view: "ObjectLogsFormView",
                        viewPathPrefix: "reports/qe/ui/js/views/",
                        app: cowc.APP_CONTRAIL_CONTROLLER,
                        viewConfig: {
                            widgetConfig: {
                                elementId: cowl.QE_OBJECT_LOGS_ID + "-widget",
                                view: "WidgetView",
                                viewConfig: {
                                    header: {
                                        title: cowl.TITLE_QUERY,
                                        iconClass: "fa fa-search"
                                    },
                                    controls: {
                                        top: {
                                            default: {
                                                collapseable: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }]
                }]
            }
        };
    }

    function getQueueViewConfig(config, queueType) {
        return {
            view: "SectionView",
            viewConfig: {
                rows: [{
                    columns: [{
                        elementId: cowl.QE_FLOW_QUEUE_ID,
                        view: "QueryQueueView",
                        viewPathPrefix: "reports/qe/ui/js/views/",
                        app: cowc.APP_CONTRAIL_CONTROLLER,
                        viewConfig: {
                            queueType: queueType
                        }
                    }]
                }]
            }
        };
    }

    return QueryEngineView;
});

/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'query-form-view',
    'knockback',
    'core-basedir/js/models/NodeConsoleLogsModel'
], function (_, QueryFormView, Knockback, NodeConsoleLogsModel) {
    var nodeType,hostname;
    var NodeConsoleLogsView = QueryFormView.extend({
        render: function () {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                elementId = self.attributes.elementId,
                queryPageTmpl = contrail.getTemplate4Id(ctwc.TMPL_QUERY_PAGE),
                consoleLogsModel = new NodeConsoleLogsModel(),
                queryFormId = cowc.QE_HASH_ELEMENT_PREFIX + cowc.CONSOLE_LOGS_PREFIX + cowc.QE_FORM_SUFFIX;

            hostname = viewConfig.hostname;
            nodeType = viewConfig.nodeType;
            consoleLogsModel.node_type(nodeType);
            consoleLogsModel.hostname(hostname);
            self.model = consoleLogsModel;

            self.$el.append(queryPageTmpl({queryPrefix: cowc.CONSOLE_LOGS_PREFIX }));

            self.renderView4Config($(self.$el).find(queryFormId), this.model, self.getViewConfig(), null, null, modelMap, function () {
                self.model.showErrorAttr(elementId, false);
                Knockback.applyBindings(self.model, document.getElementById(elementId));
                kbValidation.bind(self);
                $("#display_logs").on('click', function() {
                    self.renderQueryResult();
                });

                self.renderQueryResult();
            });
        },

        renderQueryResult: function() {
            var self = this,
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                queryFormModel = self.model,
                queryResultId = cowc.QE_HASH_ELEMENT_PREFIX + cowc.CONSOLE_LOGS_PREFIX + cowc.QE_RESULTS_SUFFIX,
                queryResultTabId = cowl.QE_SYSTEM_LOGS_TAB_ID;

            formatQueryParams(queryFormModel);

            queryFormModel.is_request_in_progress(true);
            qewu.fetchServerCurrentTime(function(serverCurrentTime) {
                var timeRange = parseInt(queryFormModel.time_range()),
                    queryResultPostData;

                if (timeRange !== -1) {
                    queryFormModel.to_time(serverCurrentTime);
                    queryFormModel.from_time(serverCurrentTime - (timeRange * 1000));
                }

                queryResultPostData = queryFormModel.getQueryRequestPostData(serverCurrentTime);
                queryResultPostData.chunkSize = cowc.QE_RESULT_CHUNK_SIZE_10K;
                self.renderView4Config($(queryResultId), queryFormModel,
                    getQueryResultTabViewConfig(queryResultPostData, queryResultTabId), null, null, modelMap,
                    function() {
                        var queryResultListModel = modelMap[cowc.UMID_QUERY_RESULT_LIST_MODEL];

                        queryResultListModel.onAllRequestsComplete.subscribe(function () {
                            queryFormModel.is_request_in_progress(false);
                        });
                    });
            });
        },

        getViewConfig: function () {
            var self = this;
            return {
                view: "SectionView",
                viewConfig: {
                    rows: [
                        {
                            columns: [
                                {
                                    elementId: 'time_range', view: "FormDropdownView",
                                    viewConfig: {
                                        path: 'time_range', dataBindValue: 'time_range', class: "span2",
                                        elementConfig: {dataTextField: "text", dataValueField: "id", data: cowc.TIMERANGE_DROPDOWN_VALUES}}
                                },
                                {
                                    elementId: 'from_time', view: "FormDateTimePickerView",
                                    viewConfig: {
                                        style: 'display: none;',
                                        path: 'from_time', dataBindValue: 'from_time', class: "span4",
                                        elementConfig: qewu.getFromTimeElementConfig('from_time', 'to_time'),
                                        visible: "time_range() == -1"
                                    }
                                },
                                {
                                    elementId: 'to_time', view: "FormDateTimePickerView",
                                    viewConfig: {
                                        style: 'display: none;',
                                        path: 'to_time', dataBindValue: 'to_time', class: "span4",
                                        elementConfig: qewu.getToTimeElementConfig('from_time', 'to_time'),
                                        visible: "time_range() == -1"
                                    }
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'log_category', view: "FormDropdownView",
                                    viewConfig: {
                                        path: 'log_category', dataBindValue: 'log_category', class: "span2",
                                        elementConfig: {
                                            dataTextField: "text",
                                            dataValueField: "value",
                                            defaultValueId: 0,
                                            dataSource: {
                                                type:'remote',
                                                url: monitorInfraConstants.
                                                        monitorInfraUrls
                                                            ['MSGTABLE_CATEGORY'],
                                                async:true,
                                                parse:function(response){
                                                    var ret = [{text:'All',value:'All'}];
                                                    var catList = [];
                                                    if (nodeType == monitorInfraConstants.CONTROL_NODE){
                                                        catList = ifNull(response[monitorInfraConstants.UVEModuleIds['CONTROLNODE']], []);
                                                    } else if (nodeType == monitorInfraConstants.COMPUTE_NODE) {
                                                        catList = ifNull(response[monitorInfraConstants.UVEModuleIds['VROUTER_AGENT']], []);
                                                    } else if (nodeType == monitorInfraConstants.ANALYTICS_NODE) {
                                                        catList = ifNull(response[monitorInfraConstants.UVEModuleIds['COLLECTOR']], []);
                                                    } else if (nodeType == monitorInfraConstants.CONFIG_NODE) {
                                                        catList = ifNull(response[monitorInfraConstants.UVEModuleIds['APISERVER']], []);
                                                    }
                                                    $.each(catList, function (key, value) {
                                                        if(key != '')
                                                            ret.push({text:value, value:value});
                                                    });
                                                    return ret;
                                                }
                                            }
                                        }
                                    }
                                },
                                {
                                    elementId: 'log_type', view: "FormDropdownView",
                                    viewConfig: {
                                        path: 'log_type', dataBindValue: 'log_type', class: "span2",
                                        elementConfig: {
                                            dataTextField: "text",
                                            dataValueField: "value",
                                            defaultValueId: 0,
                                            dataSource: {
                                                type :'remote',
                                                url : monitorInfraConstants.
                                                        monitorInfraUrls
                                                            ['TENANT_API_URL'],
                                                requestType : 'post',
                                                postData : function(){
                                                    return monitorInfraUtils.getPostDataForGeneratorType(
                                                                {
                                                                    nodeType:nodeType,
                                                                    cfilt:"ModuleServerState:msg_stats",
                                                                    hostname:hostname
                                                                }
                                                                );
                                                            }(),
                                                dataType : 'json',
                                                async : true,
                                                parse : function (result){
                                                    var msgTypeStatsList = [{text:'Any',value:'any'}];
                                                    var msgStats = [];
                                                    try{
                                                        msgStats =  ifNullOrEmptyObject(jsonPath(result,"$..msgtype_stats"),[]);
                                                    }catch(e){}
                                                    if(msgStats instanceof Array){
                                                        for(var i = 0; i < msgStats.length;i++){
                                                            if(!($.isEmptyObject(msgStats[i]))){
                                                                if( msgStats[i] instanceof Array){
                                                                    $.each(msgStats[i],function(i,msgStat){
                                                                        var msgType = msgStat['message_type'];
                                                                        msgTypeStatsList.push({text:msgType,value:msgType});
                                                                    });
                                                                } else {
                                                                    msgTypeStatsList.push({text:msgStats[i]['message_type'],value:msgStats[i]['message_type']});
                                                                }
                                                            }
                                                        }
                                                    }
                                                    return msgTypeStatsList;
                                                }
                                            }
                                        }
                                    }
                                },
                                {
                                    elementId: 'log_level', view: "FormDropdownView",
                                    viewConfig: { path: 'log_level', dataBindValue: 'log_level', class: "span2", elementConfig: {dataTextField: "name", dataValueField: "value", data: cowc.QE_LOG_LEVELS}}
                                },
                                {
                                    elementId: 'limit', view: "FormDropdownView",
                                    viewConfig: { path: 'limit', dataBindValue: 'limit', class: "span2", elementConfig: {dataTextField: "text", dataValueField: "id", data:cowc.CONSOLE_LOGS_LIMITS}}
                                },

                                {
                                    elementId: 'keywords', view: "FormInputView",
                                    viewConfig: { path: 'keywords', dataBindValue: 'keywords', class: "span2", placeholder: "Enter keyword(s)"}
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'display_logs', view: "FormButtonView", label: "Display Logs",
                                    viewConfig: {
                                        class: 'display-inline-block margin-0-10-0-0',
                                        disabled: 'is_request_in_progress()',
                                        elementConfig: {
                                            btnClass: 'btn-primary'
                                        }
                                    }
                                },
                                {
                                    elementId: 'reset_query', view: "FormButtonView", label: "Reset",
                                    viewConfig: {
                                        label: "Reset",
                                        class: 'display-inline-block margin-0-10-0-0',
                                        elementConfig: {
                                            onClick: "reset"
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                }
            };
        }
    });

    function formatQueryParams(model) {
        var limit = model.limit();
        var keywords = model.keywords();
        var filters = "limit:" + limit;
        var msgType = model.log_type();
        var hostname = model.hostname();
        var nodeType = model.node_type();
        if(msgType == 'any'){
            msgType = '';
        }
        if(keywords != '') {
            filters += ",keywords:" + keywords;
        }
        if(nodeType == monitorInfraConstants.CONTROL_NODE) {
            if(msgType != ''){
                model.where ('(ModuleId=' + monitorInfraConstants.UVEModuleIds['CONTROLNODE']
                    + ' AND Source='+ hostname +' AND Messagetype='+ msgType +')');
            } else {
                model.where( '(ModuleId=' + monitorInfraConstants.UVEModuleIds['CONTROLNODE']
                    + ' AND Source='+ hostname +')' );
            }
        } else if (nodeType == monitorInfraConstants.COMPUTE_NODE) {
            var moduleId = monitorInfraConstants.UVEModuleIds['VROUTER_AGENT'];
            var msgType = model.log_type();
            var hostname = model.hostname();
            //TODO check if the below is needed
//            if(obj['vrouterModuleId'] != null && obj['vrouterModuleId'] != ''){
//                moduleId = obj['vrouterModuleId'];
//            }
            if(msgType != ''){
                model.where('(ModuleId=' + moduleId + ' AND Source='+ hostname
                        +' AND Messagetype='+ msgType +')' );
            } else {
                model.where( '(ModuleId=' + moduleId + ' AND Source='+ hostname +')' );
            }
        } else if (nodeType == monitorInfraConstants.CONFIG_NODE) {
            if(msgType != ''){
                model.where( '(ModuleId=' + monitorInfraConstants.UVEModuleIds['SCHEMA']
                    + ' AND Source='+hostname+' AND Messagetype='+ msgType
                    +') OR (ModuleId=' + monitorInfraConstants.UVEModuleIds['APISERVER']
                    + ' AND Source='+hostname+' AND Messagetype='+ msgType
                    +') OR (ModuleId=' + monitorInfraConstants.UVEModuleIds['SERVICE_MONITOR']
                    + ' AND Source='+hostname+' AND Messagetype='+ msgType
                    +') OR (ModuleId=' + monitorInfraConstants.UVEModuleIds['DISCOVERY_SERVICE']
                    + ' AND Source='+hostname+' AND Messagetype='+ msgType +')');
            } else {
                model.where( '(ModuleId=' + monitorInfraConstants.UVEModuleIds['SCHEMA']
                    + ' AND Source='+hostname+') OR (ModuleId='
                    + monitorInfraConstants.UVEModuleIds['APISERVER']
                    + ' AND Source='+hostname+') OR (ModuleId='
                    + monitorInfraConstants.UVEModuleIds['SERVICE_MONITOR']
                    + ' AND Source='+hostname+') OR (ModuleId='
                    + monitorInfraConstants.UVEModuleIds['DISCOVERY_SERVICE']
                    + ' AND Source='+hostname+')' );
            }
        } else if (nodeType == monitorInfraConstants.ANALYTICS_NODE) {
            if(msgType != ''){
                model.where( '(ModuleId=' + monitorInfraConstants.UVEModuleIds['OPSERVER']
                    + ' AND Source='+hostname+' AND Messagetype='+ msgType
                    +') OR (ModuleId=' + monitorInfraConstants.UVEModuleIds['COLLECTOR']
                    + ' AND Source='+hostname+' AND Messagetype='+ msgType +')' );
            } else {
                model.where( '(ModuleId=' + monitorInfraConstants.UVEModuleIds['OPSERVER']
                    + ' AND Source='+hostname+') OR (ModuleId='
                    + monitorInfraConstants.UVEModuleIds['COLLECTOR']
                    + ' AND Source='+hostname+')');
            }
        }
        model.filters(filters);

        //TODO: Add where clause for category, type, and keywords. Add where clause corresponding to node type.
    };

    function getQueryResultTabViewConfig(queryResultPostData, queryResultTabId) {
        return {
            elementId: queryResultTabId,
            view: "TabsView",
            viewConfig: {
                theme: cowc.TAB_THEME_WIDGET_CLASSIC,
                tabs: [getQueryResultGridViewConfig(queryResultPostData)]
            }
        };
    }

    function getQueryResultGridViewConfig(queryResultPostData) {
        return {
            elementId: cowl.QE_QUERY_RESULT_GRID_ID,
            title: cowl.TITLE_RESULTS,
            iconClass: 'icon-table',
            view: 'QueryResultGridView',
            tabConfig: {
                //TODO
            },
            viewConfig: {
                queryResultPostData: queryResultPostData,
                gridOptions: {
                    titleText: cowl.TITLE_SYSTEM_LOGS,
                    queryQueueUrl: cowc.URL_QUERY_LOG_QUEUE,
                    queryQueueTitle: cowl.TITLE_LOG
                }
            }
        }
    }

    return NodeConsoleLogsView;
});

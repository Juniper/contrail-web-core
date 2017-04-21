/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'moment',
    'query-form-view',
    'knockback',
    "core-constants",
    'core-basedir/js/models/NodeConsoleLogsModel',
    'core-basedir/reports/qe/ui/js/common/qe.utils'
], function (_, moment, QueryFormView, Knockback, coreConstants, NodeConsoleLogsModel, qeUtils) {
    var nodeType,hostname;
    var NodeConsoleLogsView = QueryFormView.extend({
        render: function () {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                elementId = self.attributes.elementId,
                queryPageTmpl = contrail.getTemplate4Id(coreConstants.TMPL_QUERY_PAGE),
                consoleLogsModel = new NodeConsoleLogsModel(),
                queryFormId = coreConstants.QE_HASH_ELEMENT_PREFIX + coreConstants.CONSOLE_LOGS_PREFIX + coreConstants.QE_FORM_SUFFIX;

            hostname = viewConfig.hostname;
            nodeType = viewConfig.nodeType;
            consoleLogsModel.node_type(nodeType);
            consoleLogsModel.hostname(hostname);
            self.model = consoleLogsModel;

            self.$el.append(queryPageTmpl({queryPrefix: coreConstants.CONSOLE_LOGS_PREFIX }));

            self.renderView4Config($(self.$el).find(queryFormId), this.model, self.getViewConfig(), null, null, modelMap, function () {
                self.model.showErrorAttr(elementId, false);
                Knockback.applyBindings(self.model, document.getElementById(elementId));
                kbValidation.bind(self);
                $("#display_logs").on('click', function() {
                    self.renderQueryResult();
                });
                self.getLastLogTimeStampAndRenderResults(self,consoleLogsModel);
                subscribeCustomTimeChangeEvent(self.model);
            });
        },

        getLastLogTimeStampAndRenderResults : function(self,consoleLogsModel) {
            var postData = monitorInfraUtils.getPostDataForGeneratorType(
                                {
                                    nodeType:nodeType,
                                    cfilt:"ModuleServerState:msg_stats",
                                    hostname:hostname
                                }
                            );
            $.ajax({
                url:coreConstants.TENANT_API_URL,
                type:'post',
                data:postData,
                dataType:'json'
            }).done(function (result) {
                //Update the logtype combobox which is dependent on the same results.
                self.updateLogTypeDropdown(result);
                var logLevelStats = [], lastLog, lastMsgLogTime, lastTimeStamp,
                    allStats = [],defaultTimeRange = 600;
                try{
                    allStats =  ifNullOrEmptyObject(jsonPath(result,"$..log_level_stats"),[]);
                }catch(e){}
                if(allStats instanceof Array){
                    for(var i = 0; i < allStats.length;i++){
                        if(!($.isEmptyObject(allStats[i]))){
                            if( allStats[i] instanceof Array){
                                logLevelStats = logLevelStats.concat(allStats[i]);
                            } else {
                                logLevelStats.push(allStats[i]);
                            }
                        }
                    }
                }
                if(logLevelStats != null){
                    lastLog = monitorInfraUtils.getMaxGeneratorValueInArray(logLevelStats,"last_msg_timestamp");
                    if(lastLog != null){
                        lastTimeStamp = parseInt(lastLog.last_msg_timestamp)/1000 + 1000;
                        lastLogLevel = lastLog.level;
                    }
                }
                if(lastTimeStamp == null || lastMsgLogTime != lastTimeStamp){
                    lastMsgLogTime = lastTimeStamp;
                    if(lastMsgLogTime != null && lastLogLevel != null){
                        consoleLogsModel.to_time(new Date(lastMsgLogTime));
                        consoleLogsModel.from_time(moment(new Date(lastMsgLogTime)).subtract(defaultTimeRange, 's'));
                        consoleLogsModel.log_level(self.getLogLevelValueFromLogLevel(lastLogLevel));
                        consoleLogsModel.time_range('-1');
                    }
                    self.renderQueryResult();
                }
            });

        },

        updateLogTypeDropdown : function(result) {

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
            var logTypeDd = $('#log_type_dropdown').data('contrailDropdown');
            if(logTypeDd != null) {
                logTypeDd.setData(msgTypeStatsList);
                logTypeDd.value('any');
            }
        },

        getLogLevelValueFromLogLevel : function (logLevel) {
            var qeLevels = coreConstants.QE_LOG_LEVELS;
            $.each(qeLevels, function(key,levelObj) {
                if(levelObj.name == logLevel) {
                    return levelObj.value;
                }
            })
        },

        renderQueryResult: function() {
            var self = this,
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                queryFormModel = self.model,
                queryResultId = coreConstants.QE_HASH_ELEMENT_PREFIX + coreConstants.CONSOLE_LOGS_PREFIX + coreConstants.QE_RESULTS_SUFFIX,
                queryResultTabId = cowl.QE_SYSTEM_LOGS_TAB_ID;

            formatQueryParams(queryFormModel);

            queryFormModel.is_request_in_progress(true);
            qeUtils.fetchServerCurrentTime(function(serverCurrentTime) {
                var timeRange = parseInt(queryFormModel.time_range()),
                    queryRequestPostData;

                if (timeRange !== -1) {
                    queryFormModel.to_time(serverCurrentTime);
                    queryFormModel.from_time(serverCurrentTime - (timeRange * 1000));
                }

                queryRequestPostData = queryFormModel.getQueryRequestPostData(serverCurrentTime);
                queryRequestPostData.chunkSize = coreConstants.QE_RESULT_CHUNK_SIZE_10K;
                self.renderView4Config($(queryResultId), queryFormModel,
                    getQueryResultTabViewConfig(queryRequestPostData, queryResultTabId), null, null, modelMap,
                    function() {
                        var queryResultListModel = modelMap[coreConstants.UMID_QUERY_RESULT_LIST_MODEL];

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
                                    elementId: 'keywords', view: "FormInputView",
                                    viewConfig: { path: 'keywords', dataBindValue: 'keywords', class: "col-xs-6", placeholder: "Enter keyword(s)"}
                                }
                            ]
                        },
                        {
                            viewConfig: {
                                visible: 'show_advanced_options()'
                            },
                            columns: [
                                {
                                    elementId: 'time_range', view: "FormDropdownView",
                                    viewConfig: {
                                        path: 'time_range',
                                        dataBindValue: 'time_range',
                                        class: "col-xs-2",
                                        elementConfig: {
                                            dataTextField: "text",
                                            dataValueField: "id",
                                            data: coreConstants.TIMERANGE_DROPDOWN_VALUES,
                                            change: function(e){
                                                var from = moment().subtract(e.val,'s'),
                                                     to = moment();
                                                if (e.val !== '-1')
                                                 getLogCategory(from.valueOf(), to.valueOf(), self.model);
                                             }
                                        }
                                    }
                                },
                                {
                                    elementId: 'from_time', view: "FormDateTimePickerView",
                                    viewConfig: {
                                        style: 'display: none;',
                                        path: 'from_time', dataBindValue: 'from_time', class: "col-xs-4",
                                        elementConfig: qeUtils.getFromTimeElementConfig('from_time', 'to_time'),
                                        visible: "isTimeRangeCustom()"
                                    }
                                },
                                {
                                    elementId: 'to_time', view: "FormDateTimePickerView",
                                    viewConfig: {
                                        style: 'display: none;',
                                        path: 'to_time', dataBindValue: 'to_time', class: "col-xs-4",
                                        elementConfig: qeUtils.getToTimeElementConfig('from_time', 'to_time'),
                                        visible: "isTimeRangeCustom()"
                                    }
                                }
                            ]
                        },
                        {
                            viewConfig: {
                                visible: 'show_advanced_options()'
                            },
                            columns: [
                                {
                                    elementId: 'log_category', view: "FormDropdownView",
                                    viewConfig: {
                                        path: 'log_category', 
                                        dataBindValue: 'log_category', 
                                        class: "col-xs-2",
                                        dataBindOptionList : "logCategorySource()",
                                        elementConfig: {
                                            dataTextField: "text",
                                            dataValueField: "value",
                                            defaultValueId: 0
                                        }
                                    }
                                },
                                {
                                    elementId: 'log_type', view: "FormDropdownView",
                                    viewConfig: {
                                        path: 'log_type', dataBindValue: 'log_type', class: "col-xs-2",
                                        elementConfig: {
                                            dataTextField: "text",
                                            dataValueField: "value",
                                            defaultValueId: 0,
                                            dataSource: {
                                                data:[{text:'Any',value:'any'}]
                                            }
                                        }
                                    }
                                },
                                {
                                    elementId: 'log_level', view: "FormDropdownView",
                                    viewConfig: { path: 'log_level', dataBindValue: 'log_level', class: "col-xs-2", elementConfig: {dataTextField: "name", dataValueField: "value", data: coreConstants.QE_LOG_LEVELS}}
                                },
                                {
                                    elementId: 'limit', view: "FormDropdownView",
                                    viewConfig: { path: 'limit', dataBindValue: 'limit', class: "col-xs-2", elementConfig: {dataTextField: "text", dataValueField: "id", data:coreConstants.CONSOLE_LOGS_LIMITS}}
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'advanced_options', view: "FormTextView",
                                    viewConfig: {
                                        text: 'getAdvancedOptionsText()',
                                        class: "col-xs-6 margin-0-0-10",
                                        elementConfig : {
                                            class: "advanced-options-link"
                                        },
                                        click: 'toggleAdvancedFields'
                                    }
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'display_logs', view: "FormButtonView", label: "Display Logs",
                                    viewConfig: {
                                        class: 'display-inline-block margin-0-0-0-15',
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
                                        class: 'display-inline-block margin-0-0-0-15',
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
        var logCateg = model.log_category();
        var whereClauseStr = '';

        if(msgType == 'any'){
            msgType = '';
        }
        if (logCateg === 'All') {
            logCateg = '';
        }
        if(keywords != '') {
            filters += ",keywords:" + keywords;
        }
        if(nodeType == monitorInfraConstants.CONTROL_NODE) {
            whereClauseStr = '(ModuleId=' +coreConstants.UVEModuleIds['CONTROLNODE']+' AND Source='+ hostname+
                ((msgType !== '') ? ' AND Messagetype='+msgType : '')+
                ((logCateg !== '') ? ' AND Category='+logCateg : '' )+')';
            model.where(whereClauseStr);
        } else if (nodeType == monitorInfraConstants.COMPUTE_NODE) {
            var moduleId = coreConstants.UVEModuleIds['VROUTER_AGENT'];
            var msgType = model.log_type();
            var hostname = model.hostname();

            whereClauseStr = '(ModuleId=' +moduleId+' AND Source='+ hostname+
                ((msgType !== '') ? ' AND Messagetype='+msgType : '')+
                ((logCateg !== '') ? ' AND Category='+logCateg : '' )+')';
            model.where(whereClauseStr);
        } else if (nodeType == monitorInfraConstants.CONFIG_NODE) {
            whereClauseStr = '(ModuleId='+coreConstants.UVEModuleIds['SCHEMA']+
                ' AND Source='+hostname+ ((msgType !== '') ? ' AND Messagetype='+msgType : '')+
                ((logCateg !== '') ? ' AND Category='+logCateg : '' )+') OR '+
                ' (ModuleId='+coreConstants.UVEModuleIds['APISERVER']+
                'AND Source='+hostname+ ((msgType !== '') ? ' AND Messagetype='+msgType : '')+
                ((logCateg !== '') ? ' AND Category='+logCateg : '' )+') OR '+
                '(ModuleId='+coreConstants.UVEModuleIds['SERVICE_MONITOR']+
                ' AND Source='+hostname+ ((msgType !== '') ? ' AND Messagetype='+msgType : '')+
                ((logCateg !== '') ? ' AND Category='+logCateg : '' )+') OR '+
                '(ModuleId='+coreConstants.UVEModuleIds['DISCOVERY_SERVICE']+
                ' AND Source='+hostname+ ((msgType !== '') ? ' AND Messagetype='+msgType : '')+
                ((logCateg !== '') ? ' AND Category='+logCateg : '' )+')';

            model.where(whereClauseStr);
        } else if (nodeType == monitorInfraConstants.ANALYTICS_NODE) {
            whereClauseStr = '(ModuleId='+coreConstants.UVEModuleIds['OPSERVER']+
                ' AND Source='+hostname+((msgType !== '') ? ' AND Messagetype='+msgType : '')+
                ((logCateg !== '') ? ' AND Category='+logCateg : '' )+') OR '+
                '(ModuleId=' + coreConstants.UVEModuleIds['COLLECTOR']+' AND Source='+hostname+
                ((msgType !== '') ? ' AND Messagetype='+msgType : '')+
                ((logCateg !== '') ? ' AND Category='+logCateg : '' )+')';
            model.where(whereClauseStr);
        }
        model.filters(filters);

        //TODO: Add where clause for category, type, and keywords. Add where clause corresponding to node type.
    };

    function getQueryResultTabViewConfig(queryRequestPostData, queryResultTabId) {
        return {
            elementId: queryResultTabId,
            view: "TabsView",
            viewConfig: {
                theme: coreConstants.TAB_THEME_WIDGET_CLASSIC,
                tabs: [getQueryResultGridViewConfig(queryRequestPostData)]
            }
        };
    }

    function getQueryResultGridViewConfig(queryRequestPostData) {
        return {
            elementId: cowl.QE_QUERY_RESULT_GRID_ID,
            title: cowl.TITLE_RESULTS,
            iconClass: 'fa fa-table',
            view: 'QueryResultGridView',
            tabConfig: {
                //TODO
            },
            viewConfig: {
                queryRequestPostData: queryRequestPostData,
                gridOptions: {
                    titleText: cowl.TITLE_SYSTEM_LOGS,
                    queryQueueUrl: coreConstants.URL_QUERY_LOG_QUEUE,
                    queryQueueTitle: cowl.TITLE_LOG
                }
            }
        }
    }

    function subscribeCustomTimeChangeEvent(model){
        var from, to;
        model.__kb.view_model.model().on('change:from_time', function(m, newValue) {
            from = m.attributes.from_time_utc;
            to = m.attributes.to_time_utc;
            if (from < to)
                getLogCategory(from, to, model);
        });
        model.__kb.view_model.model().on('change:to_time', function(m, newValue) {
            from = m.attributes.from_time_utc;
            to = m.attributes.to_time_utc;
            if (from < to)
                getLogCategory(from, to, model);
        });
    }

    function getLogCategory(from, to, model) {
        var postData = {fromTimeUTC: from, toTimeUTC: to,
                table_name: "StatTable.FieldNames.fields", 
                select: ["name", "fields.value"], 
                where: [[{name: "name", value: "MessageTable:Category", op: 7 }]]},
            ajaxConfig = {
                url: "/api/qe/table/column/values",
                type: "POST",
                data: JSON.stringify(postData)
            };

        contrail.ajaxHandler(ajaxConfig, null, function (response) {
            var ret = [{text:'All',value:'All'}];
            $.each(response['data'], function (key, value) {
                if(value['fields.value'])
                    ret.push({text:value['fields.value'], value:value['fields.value']});
            });
            model.logCategorySource(ret);
        }, function (error) {
            console.log("Failed to get data: ", error);
        });
    }

    return NodeConsoleLogsView;
});

/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([
        'core-utils',
        'core-constants',
        'core-formatters',
        'core-cache',
        'core-labels',
        'core-messages',
        'core-views-default-config',
        'chart-utils',
        'text!core-basedir/templates/core.common.tmpl',
        'core-basedir/js/common/graph.utils',
        // 'core-alarm-utils',
        // 'core.app.utils',
        'contrail-remote-data-handler',
        'cf-datasource',
        'contrail-view',
        'contrail-model',
        'contrail-view-model',
        'contrail-list-model',
        'lodash',
        'crossfilter',
        'backbone',
        'text',
        'knockout',
        'moment',
        'layout-handler',
        'menu-handler',
        'content-handler',
        'validation',
        'core-basedir/js/views/BarChartInfoView',
        'core-basedir/js/views/BreadcrumbDropdownView',
        'core-basedir/js/views/BreadcrumbTextView',
        'core-basedir/js/views/ChartView',
        'core-basedir/js/views/ControlPanelView',
        'core-basedir/js/views/InfoboxesView',
        'core-basedir/js/views/SectionView',
        'core-basedir/js/views/WidgetView',
        'core-basedir/js/views/ZoomScatterChartView',
        //Dashboard
        'mon-infra-node-list-model',
        'mon-infra-log-list-model',    
        'mon-infra-alert-list-view',   
        'mon-infra-alert-grid-view',   
        'mon-infra-log-list-view',     
        'mon-infra-sysinfo-view',      
        'mon-infra-dashboard-view',
        ],function(CoreUtils, CoreConstants, CoreFormatters, Cache, CoreLabels, CoreMessages, CoreViewsDefaultConfig,ChartUtils,CoreCommonTmpls, GraphUtils) {
            cowc = CoreConstants();
            cowf = new CoreFormatters();
            cowl = new CoreLabels();
            cowm = new CoreMessages();
            covdc = new CoreViewsDefaultConfig();
            cowch = new Cache();
            chUtils = new ChartUtils();
            grUtils = new GraphUtils()
            webServerInfoDefObj.done(function() {
                require(['nonamd-libs'],function() {
                    cowc.DROPDOWN_VALUE_SEPARATOR = getValueByJsonPath(globalObj,
                        "webServerInfo;uiConfig;dropdown_value_separator",
                        cowc.DROPDOWN_VALUE_SEPARATOR);
                });
            });
            $("body").append(CoreCommonTmpls);
        });



        
       

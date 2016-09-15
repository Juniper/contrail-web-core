/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([
    'core-handlebars-utils',
    'core-utils',
    'core-hash-utils',
    'core-constants',
    'core-formatters',
    'core-cache',
    'core-labels',
    'core-messages',
    'core-views-default-config',
    'contrail-common',
    'core-contrail-form-elements',
    'chart-utils',
    'text!core-basedir/common/ui/templates/core.common.tmpl',
    'core-basedir/js/common/graph.utils',
    // 'core-alarm-utils',
    // 'core.app.utils',
    'contrail-remote-data-handler',
    'cf-datasource',
    'contrail-view',
    'contrail-model',
    'contrail-view-model',
    'contrail-list-model',
    'contrail-element',
    'lodash',
    'crossfilter',
    'backbone',
    'text',
    'knockout',
    'layout-handler',
    'menu-handler',
    'help-handler',
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
    'mon-infra-dashboard-view'
], function (CoreHandlebarsUtils, CoreUtils, CoreHashUtils, CoreConstants, CoreFormatters, Cache, CoreLabels,
             CoreMessages, CoreViewsDefaultConfig, Contrail, CoreContrailFormElements, ChartUtils, CoreCommonTmpls) {
    cowc = CoreConstants;
    cowf = new CoreFormatters();
    cowl = new CoreLabels();
    cowm = new CoreMessages();
    covdc = new CoreViewsDefaultConfig();
    contrail = new Contrail();
    cowch = new Cache();
    webServerInfoDefObj.done(function () {
        require(['nonamd-libs'], function () {
            cowc.DROPDOWN_VALUE_SEPARATOR = getValueByJsonPath(globalObj,
                "webServerInfo;uiConfig;dropdown_value_separator",
                cowc.DROPDOWN_VALUE_SEPARATOR);
        });
    });
    $("body").append(CoreCommonTmpls);
});



        
       

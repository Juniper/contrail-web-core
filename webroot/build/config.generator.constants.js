/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var constants = {};

/**
 * Build config generator script specific constants.
 */
constants.defaultBaseDir = ".";
constants.defaultVcenterBaseDIr = "./../";

constants.defaultBuildDir = "dist/";
constants.defaultBuildConfigFile = "webroot/build/default.build.config.js";
constants.defaultFileExclusionRegExp = /(.*node_modules|.*api|.*jobs|.*test|.*examples|.*build|.*vis-v4.9.0)/;

/**
 * constants for contrail-web-core.
 */
constants.coreAppDir = "./../"
constants.coreOutDir = constants.coreAppDir + constants.defaultBuildDir;
constants.coreBaseUrl = "./"

constants.coreModules  = [
    {
        enabled: true,
        name: 'core-bundle',
        exclude: [
            'jquery','jquery-ui'
        ]
    },{
        enabled: true,
        name: './js/common/contrail.core.views',
        exclude: [
            'lodash','jquery','backbone','knockback','knockout','contrail-remote-data-handler','contrail-view',
            'contrail-list-model','contrail-model','contrail-view-model','d3','nv.d3','slick.checkboxselectcolumn','jquery.event.drag',
            'slick.grid','slick.rowselectionmodel','select2','jquery-ui','jquery.multiselect','jquery.multiselect.filter'
        ]
    },{
        enabled: true,
        name: './js/common/chart.libs',
        exclude: [
            'jquery','lodash','backbone'
        ]
    },{
        enabled: true,
        name: './js/common/thirdparty.libs',
        exclude: [
            'jquery','jquery.event.drag','knockout','backbone','knockback','validation'
        ]
    },{
        enabled: true,
        name: './js/common/jquery.dep.libs',
        exclude: [
            'jquery'
        ],
        override: {
            wrapShim: false
        }
    },{
        enabled: true,
        name: './js/common/nonamd.libs',
        exclude: [
            'jquery','jquery-ui','knockout','bootstrap','jquery.xml2json',
            'jquery.json','d3','backbone','validation',
            'core-bundle'
        ],
        override: {
            wrapShim: false
        }
    },
    {
        enabled: true,
        name: 'qe-module',
        include: [
            'core-basedir/reports/qe/ui/js/common/qe.utils',
            'core-basedir/reports/qe/ui/js/common/qe.parsers',
            'core-basedir/reports/qe/ui/js/common/qe.grid.config',
            'core-basedir/reports/qe/ui/js/common/qe.model.config',
            'core-basedir/reports/qe/ui/js/views/QueryEngineView',
            'core-basedir/reports/qe/ui/js/views/QueryQueueView',
            'core-basedir/reports/qe/ui/js/views/QueryTextView',
            'core-basedir/reports/qe/ui/js/views/ObjectLogsFormView',
            'core-basedir/reports/qe/ui/js/views/SystemLogsFormView',
            'core-basedir/reports/qe/ui/js/views/StatQueryFormView',
            'core-basedir/reports/qe/ui/js/models/ContrailListModelGroup',
            'core-basedir/reports/qe/ui/js/models/ObjectLogsFormModel',
            'core-basedir/reports/qe/ui/js/models/StatQueryFormModel',
            'core-basedir/reports/qe/ui/js/models/SystemLogsFormModel'
        ],
        exclude: [
            'underscore',
            'moment',
            'contrail-view',
            'contrail-model',
            'core-basedir/js/views/ZoomScatterChartView',
            'core-basedir/js/views/LineWithFocusChartView',
            'text!core-basedir/reports/qe/ui/templates/qe.tmpl'
        ]
    }
];
constants.coreFileExclusionRegExp = constants.defaultFileExclusionRegExp;

/**
 * constants for contrail-web-controller.
 */
constants.controllerDir = "./../contrail-web-controller/";
constants.controllerBuildConfigFile = constants.controllerDir + "webroot/build/controller.build.config.js";

constants.controllerAppDir = constants.coreAppDir;
constants.controllerOutDir = constants.coreAppDir + constants.defaultBuildDir;
constants.controllerBaseUrl = constants.coreBaseUrl;
constants.controllerCoreRelativePath = "./../../contrail-web-core/webroot/";

constants.controllerModules = [
    {
        enabled: true,
        name: 'controller-init',
        exclude: [
            "underscore",
            "contrail-view",
            "contrail-model",
            "contrail-view-model",
            "contrail-list-model",
            "contrail-graph-model",
            "query-form-model",
            "query-or-model",
            "query-and-model",
            "core-basedir/js/views/LoginWindowView"
        ]
    },
    {
        enabled: true,
        name: 'monitor-infra-module',
        include: [
            'mon-infra-controller-dashboard',

            'controller-basedir/monitor/infrastructure/common/ui/js/views/VRouterScatterChartView',
            'controller-basedir/monitor/infrastructure/common/ui/js/views/ConfigNodeChartsView',
            'controller-basedir/monitor/infrastructure/common/ui/js/views/ControlNodeScatterChartView',
            'controller-basedir/monitor/infrastructure/common/ui/js/views/DatabaseNodeScatterChartView',
            'controller-basedir/monitor/infrastructure/common/ui/js/views/AnalyticsNodeScatterChartView',
            'vrouter-dashboard-view',

            'monitor-infra-analyticsnode-model',
            'monitor-infra-databasenode-model',
            'monitor-infra-confignode-model',
            'monitor-infra-controlnode-model',
            'monitor-infra-vrouter-model',
            'monitor-infra-confignode-charts-model',

            'monitor-infra-parsers',
            'monitor-infra-utils',
            'monitor-infra-constants'
        ],
        exclude: [
            'underscore',
            'cf-datasource',
            'contrail-view',
            'controller-init',
            'contrail-model',
            'mon-infra-dashboard-view',
            "core-basedir/js/views/LoginWindowView"
        ]
    },
    {
        enabled: true,
        name: 'nm-module',
        include: [
            'controller-basedir/monitor/networking/ui/js/views/MonitorNetworkingView',
            'controller-basedir/monitor/networking/ui/js/views/NetworkingGraphView',
            'controller-basedir/monitor/networking/ui/js/views/NetworkGridView',
            'controller-basedir/monitor/networking/ui/js/views/NetworkListView',
            'controller-basedir/monitor/networking/ui/js/views/NetworkTabView',
            'controller-basedir/monitor/networking/ui/js/views/NetworkView',
            'controller-basedir/monitor/networking/ui/js/views/ProjectGridView',
            'controller-basedir/monitor/networking/ui/js/views/ProjectListView',
            'controller-basedir/monitor/networking/ui/js/views/ProjectTabView',
            'controller-basedir/monitor/networking/ui/js/views/ProjectView',
            'controller-basedir/monitor/networking/ui/js/views/InstanceGridView',
            'controller-basedir/monitor/networking/ui/js/views/InstanceListView',
            'controller-basedir/monitor/networking/ui/js/views/InstanceTabView',
            'controller-basedir/monitor/networking/ui/js/views/InstanceTrafficStatsView',
            'controller-basedir/monitor/networking/ui/js/views/InstancePortDistributionView',
            'controller-basedir/monitor/networking/ui/js/views/InstanceView',
            'controller-basedir/monitor/networking/ui/js/views/ConnectedNetworkTabView',
            'controller-basedir/monitor/networking/ui/js/views/ConnectedNetworkTrafficStatsView',
            'controller-basedir/monitor/networking/ui/js/views/FlowGridView',
            'controller-basedir/monitor/networking/ui/js/views/FlowListView',
            'controller-basedir/monitor/networking/ui/js/views/InterfaceGridView'
        ],
        exclude: [
            'underscore',
            'dagre',
            'joint',
            'joint.contrail',
            'contrail-view',
            'contrail-view-model',
            'core-basedir/js/views/ZoomScatterChartView',
            'core-basedir/js/views/LineWithFocusChartView',
            'controller-init'
        ]
    },
    {
        enabled: true,
        name: 'controller-qe-module',
        include: [
            'controller-basedir/reports/qe/ui/js/views/ControllerQEView',
            'controller-basedir/reports/qe/ui/js/views/FlowSeriesFormView',
            'controller-basedir/reports/qe/ui/js/views/FlowRecordFormView',
            'controller-basedir/reports/qe/ui/js/views/FlowDetailsTabView',
            'controller-basedir/reports/qe/ui/js/views/SessionAnalyzerView',
            'controller-basedir/reports/qe/ui/js/models/SessionAnalyzerModel',
            'controller-basedir/reports/qe/ui/js/models/FlowRecordFormModel',
            'controller-basedir/reports/qe/ui/js/models/FlowSeriesFormModel'
        ],
        exclude: [
            'underscore',
            'contrail-view',
            'contrail-model',
            'core-basedir/js/views/ZoomScatterChartView',
            'core-basedir/js/views/LineWithFocusChartView',
            'controller-init',
            'core-basedir/reports/qe/ui/js/models/ContrailListModelGroup'
        ]
    }
];
constants.controllerFileExclusionRegExp = constants.defaultFileExclusionRegExp;

/**
 * constants for contrail-web-server-manager
 */
constants.smCoreRelativePath = "./../../contrail-web-core/webroot/";
constants.smModules = [
    {
        enabled: true,
        name: 'sm-init',
        include:[],
        exclude: [
            'underscore'
        ] 
    }
];

/**
 * constants for contrail-web-storage
 */
constants.storageCoreRelativePath = "./../../contrail-web-core/webroot/";
constants.storageModules = [
    {
        enabled: true,
        name: 'storage-init',
        include:[],
        exclude: [
            'underscore',
            'contrail-view-model'
        ]
    }
];

/**
 * Build base config JSON.
 * will build on top of this base default.
 * non-default values are individually defined as above.
 */
constants.buildBaseConfJson = {
    appDir: '',
    dir: '',
    baseUrl: '',
    paths: {},
    map: {},
    shim: {},
    waitSeconds: 0,
    optimizeCss: 'default',
    // skipModuleInsertion: true,
    keepAmdefine: true,
    modules: [],
    optimize: 'none',
    uglify2: {
        output: {
            beautify: false
        },
        compress: {
            sequences: false,
            global_defs: {
                DEBUG: false
            }
        },
        warnings: false,
        mangle: false
    },
    keepBuildDir: false,
    throwWhen: {
        optimize: true
    },
    fileExclusionRegExp: ''
};

module.exports = constants;

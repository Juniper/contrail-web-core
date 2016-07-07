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
        name: './js/common/core.init',
        include: [
            'core-utils',
            'core-constants',
            'core-formatters',
            'core-cache',
            'core-labels',
            'core-messages',
            'core-views-default-config',

            'core-basedir/js/common/qe.utils',
            'core-basedir/js/common/qe.model.config',
            'core-basedir/js/common/qe.grid.config',
            'core-basedir/js/common/qe.parsers',
            'core-basedir/js/common/chart.utils',
            'text!templates/core.common.tmpl',

            'contrail-remote-data-handler',
            'layout-handler',
            'menu-handler',
            'content-handler',

            'contrail-view',
            'graph-view',
            'query-form-view',

            'contrail-model',
            'contrail-view-model',
            'contrail-list-model',
            'contrail-graph-model',
            'query-form-model',
            'query-or-model',
            'query-and-model',
            'mon-infra-node-list-model',
            'mon-infra-log-list-model',

            //TODO following views that access these refs, change to path and update this.
            //'infoboxes-view',
            'barchart-cf',
            'mon-infra-alert-list-view',
            'mon-infra-alert-grid-view',
            'mon-infra-log-list-view',
            'mon-infra-sysinfo-view',
            'mon-infra-dashboard-view',

            'server-schema',
            'cluster-schema',
            'json-model',
            'json-editor-view',

            'core-basedir/js/views/AccordianView',
            'core-basedir/js/views/BarChartInfoView',
            'core-basedir/js/views/BreadcrumbDropdownView',
            'core-basedir/js/views/BreadcrumbTextView',
            'core-basedir/js/views/ChartView',
            'core-basedir/js/views/ControlPanelView',
            'core-basedir/js/views/DetailsView',
            'core-basedir/js/views/DonutChartView',
            'core-basedir/js/views/FormAutoCompleteTextBoxView',
            'core-basedir/js/views/FormButtonView',
            'core-basedir/js/views/FormCheckboxView',
            'core-basedir/js/views/FormCollectionView',
            'core-basedir/js/views/FormComboboxView',
            'core-basedir/js/views/FormCompositeView',
            'core-basedir/js/views/FormDateTimePickerView',
            'core-basedir/js/views/FormDropdownView',
            'core-basedir/js/views/FormEditableGridView',
            'core-basedir/js/views/FormGridView',
            'core-basedir/js/views/FormHierarchicalDropdownView',
            'core-basedir/js/views/FormInputView',
            'core-basedir/js/views/FormMultiselectView',
            'core-basedir/js/views/FormNumericTextboxView',
            'core-basedir/js/views/FormRadioButtonView',
            'core-basedir/js/views/FormTextAreaView',
            'core-basedir/js/views/FormTextView',
            'core-basedir/js/views/GridView',
            'core-basedir/js/views/GridFooterView',
            'core-basedir/js/views/HeatChartView',
            'core-basedir/js/views/HorizontalBarChartView',
            'core-basedir/js/views/InfoboxesView',
            'core-basedir/js/views/LineBarWithFocusChartView',
            'core-basedir/js/views/LineWithFocusChartView',
            'core-basedir/js/views/LoginWindowView',
            'core-basedir/js/views/MultiBarChartView',
            'core-basedir/js/views/MultiDonutChartView',
            'core-basedir/js/views/NodeConsoleLogsView',
            'core-basedir/js/views/QueryFilterView',
            'core-basedir/js/views/QueryResultGridView',
            'core-basedir/js/views/QueryResultLineChartView',
            'core-basedir/js/views/QuerySelectView',
            'core-basedir/js/views/QueryWhereView',
            'core-basedir/js/views/ScatterChartView',
            'core-basedir/js/views/SectionView',
            'core-basedir/js/views/SparklineView',
            'core-basedir/js/views/TabsView',
            'core-basedir/js/views/WidgetView',
            'core-basedir/js/views/WizardView',
            'core-basedir/js/views/ZoomScatterChartView',
            'core-basedir/js/views/MonitorInfraDashboardView',
        ],
        exclude: [
            './js/common/core.app',
            'underscore',
            'backbone',
            'knockout',
            'knockback'
        ]
    },{
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
            'jquery.ba-bbq','jquery.json','d3','backbone','validation',
            'core-bundle'
        ],
        override: {
            wrapShim: false
        }
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
            // "core-init",
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
            // 'core-init',
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
            // 'core-init',
            'contrail-view',
            'contrail-view-model',
            'core-basedir/js/views/ZoomScatterChartView',
            'core-basedir/js/views/LineWithFocusChartView',
            'controller-init'
        ]
    },
    {
        enabled: true,
        name: 'qe-module',
        include: [
            'controller-basedir/reports/qe/ui/js/views/QueryEngineView',
            'controller-basedir/reports/qe/ui/js/views/QueryQueueView',
            'controller-basedir/reports/qe/ui/js/views/QueryTextView',
            'controller-basedir/reports/qe/ui/js/views/FlowSeriesFormView',
            'controller-basedir/reports/qe/ui/js/views/FlowRecordFormView',
            'controller-basedir/reports/qe/ui/js/views/FlowDetailsTabView',
            'controller-basedir/reports/qe/ui/js/views/ObjectLogsFormView',
            'controller-basedir/reports/qe/ui/js/views/SystemLogsFormView',
            'controller-basedir/reports/qe/ui/js/views/SessionAnalyzerView',
            'controller-basedir/reports/qe/ui/js/views/StatQueryFormView',
            'controller-basedir/reports/qe/ui/js/models/ContrailListModelGroup',
            'controller-basedir/reports/qe/ui/js/models/SessionAnalyzerModel',
            'controller-basedir/reports/qe/ui/js/models/FlowRecordFormModel',
            'controller-basedir/reports/qe/ui/js/models/FlowSeriesFormModel',
            'controller-basedir/reports/qe/ui/js/models/ObjectLogsFormModel',
            'controller-basedir/reports/qe/ui/js/models/StatQueryFormModel',
            'controller-basedir/reports/qe/ui/js/models/SystemLogsFormModel'
        ],
        exclude: [
            'underscore',
            // 'core-init',
            'contrail-view',
            'contrail-model',
            'core-basedir/js/views/ZoomScatterChartView',
            'core-basedir/js/views/LineWithFocusChartView',
            'controller-init'
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

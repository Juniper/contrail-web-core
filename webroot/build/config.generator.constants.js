var constants = {};

/**
 * Build config generator script specific constants.
 */
constants.defaultBaseDir = ".";
constants.defaultVcenterBaseDIr = "./../";

constants.defaultBuildDir = "built/";
constants.defaultBuildConfigFile = "webroot/build/default.build.config.js";
constants.defaultFileExclusionRegExp = /(.*node_modules|.*api|.*jobs|.*test|.*examples|.*build)/;

/**
 * constants for contrail-web-core.
 */
constants.coreAppDir = "./../"
constants.coreOutDir = constants.coreAppDir + constants.defaultBuildDir;
constants.coreBaseUrl = "./"

constants.coreInitModuleName = './js/common/core.init';
constants.coreInitModuleInclude = [
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
    //'contrail-layout',

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

    'core-basedir/js/views/AccordianView',
    //'core-basedir/js/views/AlertGridView',
    //'core-basedir/js/views/AlertListView',
    'core-basedir/js/views/BarChartInfoView',
    //'core-basedir/js/views/BarChartView',
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
    //'core-basedir/js/views/GraphView',
    'core-basedir/js/views/GridFooterView',
    //'core-basedir/js/views/GridView',
    'core-basedir/js/views/HeatChartView',
    'core-basedir/js/views/HorizontalBarChartView',
    'core-basedir/js/views/InfoboxesView',
    'core-basedir/js/views/LineBarWithFocusChartView',
    'core-basedir/js/views/LineWithFocusChartView',
    //'core-basedir/js/views/LogListView',
    'core-basedir/js/views/LoginWindowView',
    //'core-basedir/js/views/MonitorInfraDashboardView',
    'core-basedir/js/views/MultiBarChartView',
    'core-basedir/js/views/MultiDonutChartView',
    'core-basedir/js/views/NodeConsoleLogsView',
    'core-basedir/js/views/QueryFilterView',
    //'core-basedir/js/views/QueryFormView',
    'core-basedir/js/views/QueryResultGridView',
    'core-basedir/js/views/QueryResultLineChartView',
    'core-basedir/js/views/QuerySelectView',
    'core-basedir/js/views/QueryWhereView',
    'core-basedir/js/views/ScatterChartView',
    'core-basedir/js/views/SectionView',
    'core-basedir/js/views/SparklineView',
    //'core-basedir/js/views/SystemInfoView',
    'core-basedir/js/views/TabsView',
    'core-basedir/js/views/WidgetView',
    'core-basedir/js/views/WizardView',
    'core-basedir/js/views/ZoomScatterChartView'
];
constants.coreInitModuleExclude  = [
    './js/common/core.app',
    'underscore',
    'backbone',
    'knockout',
    'knockback'
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

constants.controllerInitModuleName = 'controller-init';
constants.controllerInitModuleInclude = [
    'searchflow-model',
    'traceflow-model',
    'underlay-graph-model',
    'monitor-infra-confignode-model',
    'monitor-infra-analyticsnode-model',
    'monitor-infra-databasenode-model',
    'monitor-infra-controlnode-model',
    'monitor-infra-vrouter-model',
    'monitor-infra-utils',
    'confignode-scatterchart-view',
    'controlnode-scatterchart-view',
    'dbnode-scatterchart-view',
    'analyticsnode-scatterchart-view',
    'vrouter-dashboard-view',
    'monitor-infra-parsers',
    'monitor-infra-utils',
    'monitor-infra-constants',
    'mon-infra-controller-dashboard',
    'controller-basedir/monitor/infrastructure/common/ui/js/views/VRouterScatterChartView'
];
constants.controllerInitModuleExclude  = [
    "contrail-view",
    "contrail-model",
    "contrail-view-model",
    "contrail-list-model",
    "contrail-graph-model",
    "query-form-model",
    "query-or-model",
    "query-and-model",
    "core-init",
];
constants.controllerFileExclusionRegExp = constants.defaultFileExclusionRegExp;

/**
 * constants for contrail-web-server-manager
 */
constants.smCoreRelativePath = "./../../contrail-web-core/webroot/";


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
    skipModuleInsertion: true,
    keepAmdefine: true,
    modules: [],
    optimize: 'uglify2',
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

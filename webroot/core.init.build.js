/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

({
    appDir: './',
    dir: './built',
    baseUrl: './',
    paths: {
        'core-basedir': './',
        'jquery': './' + '/assets/jquery/js/jquery-1.8.3.min',
        'jquery-ba-bbq': './' + '/assets/jquery/js/jquery.ba-bbq.min',
        'knockout': './' + '/assets/knockout/knockout-3.0.0',
        'joint': './' + '/assets/joint/js/joint.clean',
        'geometry': './' + '/assets/joint/js/geometry',
        'vectorizer': './' + '/assets/joint/js/vectorizer',
        'joint.layout.DirectedGraph': './' + '/assets/joint/js/joint.layout.DirectedGraph.min',
        'dagre': './' + '/assets/joint/js/dagre.min',
        'bezier': './' + '/assets/bezierjs/bezier',
        'lodash': './' + '/assets/lodash/lodash.min',
        'backbone': './' + '/assets/backbone/backbone-min',
        'knockback': './' + '/assets/backbone/knockback.min',
        'validation': './' + '/assets/backbone/backbone-validation-amd',
        'text': './' + '/assets/requirejs/text',
        'underscore': './' + '/assets/underscore/underscore-min',
        'joint.contrail': './' + '/js/joint.contrail',

        'core-app': './' + '/js/common/core.app',
        'core-init': './' + '/js/common/core.init',

        'contrail-layout': './' + '/js/contrail-layout',

        'core-utils': './' + '/js/common/core.utils',
        'core-constants': './' + '/js/common/core.constants',
        'core-formatters': './' + '/js/common/core.formatters',
        'core-labels': './' + '/js/common/core.labels',
        'core-messages': './' + '/js/common/core.messages',
        'core-cache': './' + '/js/common/core.cache',
        'core-views-default-config': './' + '/js/common/core.views.default.config',
        'contrail-unified-1': './' + '/js/common/contrail.unified.1',
        'contrail-unified-2': './' + '/js/common/contrail.unified.2',
        'contrail-unified-3': './' + '/js/common/contrail.unified.3',

        'contrail-remote-data-handler': './' + '/js/handlers/ContrailRemoteDataHandler',
        'layout-handler': './' + '/js/handlers/LayoutHandler',
        'menu-handler': './' + '/js/handlers/MenuHandler',
        'content-handler': './' + '/js/handlers/ContentHandler',

        'graph-view': './' + '/js/views/GraphView',
        'contrail-view': './' + '/js/views/ContrailView',
        'query-form-view': './' + '/js/views/QueryFormView',

        'query-form-model': './' + '/js/models/QueryFormModel',
        'query-or-model': './' + '/js/models/QueryOrModel',
        'query-and-model': './' + '/js/models/QueryAndModel',
        'contrail-graph-model': './' + '/js/models/ContrailGraphModel',
        'contrail-view-model': './' + '/js/models/ContrailViewModel',
        'contrail-model': './' + '/js/models/ContrailModel',
        'contrail-list-model': './' + '/js/models/ContrailListModel',
        'mon-infra-node-list-model': './' + '/js/models/NodeListModel',
        'mon-infra-log-list-model': './' + '/js/models/LogListModel',

        // TODO: We need to discuss a criteria on which we should add definations to this file.
        'infoboxes-view': './' + '/js/views/InfoboxesView',
        'barchart-cf': './' + '/js/views/BarChartView',
        'mon-infra-alert-list-view': './' + '/js/views/AlertListView',
        'mon-infra-alert-grid-view': './' + '/js/views/AlertGridView',
        'mon-infra-log-list-view': './' + '/js/views/LogListView',
        'mon-infra-sysinfo-view': './' + '/js/views/SystemInfoView',
        'mon-infra-dashboard-view': './' + '/js/views/MonitorInfraDashboardView'
    },
    map: {
        '*': {
            'underscore': 'underscore'
        }
    },
    shim: {
        'backbone': {
            deps: ['lodash'],
            exports: 'Backbone'
        },
        'joint': {
            deps: ['geometry', 'vectorizer', 'backbone'],
            exports: 'joint',
            init: function (geometry, vectorizer) {
                this.g = geometry;
                this.V = vectorizer;
            }
        },
        'knockout': {
            deps: ['jquery']
        },
        'validation': {
            deps: ['backbone']
        },
        'bezier': {
            deps: ['jquery']
        },
        'joint.layout.DirectedGraph': {
            deps: ['joint']
        },
        'joint.contrail': {
            deps: ['joint.layout.DirectedGraph']
        },
        'contrail-model': {
            deps: ['knockback']
        },
        'contrail-list-model': {
            deps: ['contrail-remote-data-handler']
        },
        'jquery-ba-bbq': {
            deps: ['jquery']
        }
    },
    waitSeconds: 0,
    optimizeCss: 'default',
    skipModuleInsertion: true,
    keepAmdefine: true,
    modules: [
        //{
        //    name: './js/common/core.app',
        //},
        {
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
            ],
            exclude: [
                './js/common/core.app',
                'underscore',
                'backbone',
                'knockout',
                'knockback'
            ]
        }
    ],
    optimize: 'uglify2',
    uglify2: {
        //Example of a specialized config. If you are fine
        //with the default options, no need to specify
        //any of these properties.
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
        //If there is an error calling the minifier for some JavaScript,
        //instead of just skipping that file throw an error.
        optimize: true
    },
    fileExclusionRegExp: /(.*node_modules|.*api|.*jobs|.*test|.*examples)/
})

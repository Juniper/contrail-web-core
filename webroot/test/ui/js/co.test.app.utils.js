/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var contentContainer = "#content-container";
var slickGridSearchtimer = null;
// Need to add a check and declare globalObj only if it doesn't exist and if exists need to extend with this map
if(typeof(globalObj) == "undefined") 
    globalObj = {};
globalObj['env'] = "";
globalObj['loadedScripts'] = [];
//Maintains a deferredObj for each feature pkg and are resolved when the global modules for that feature pkg are available
globalObj['initFeatureAppDefObjMap'] = {};
var FEATURE_PCK_WEB_CONTROLLER = "webController",
    FEATURE_PCK_WEB_STORAGE = "webStorage",
    FEATURE_PCK_WEB_SERVER_MANAGER = "serverManager";

function getCoreAppPaths(coreBaseDir, coreBuildDir, env) {
    /**
     * coreBaseDir: Apps Root directory.
     * coreWebDir: Root directory from the contents will be served. Either built or source depending on env.
     *
     * core-srcdir: Require path id pointing to root directory for the source files which are delivered.
     * in a 'prod' env to use the file in source form (i.e not minified version), use path with prefix 'core-srcdir'
     * eg: use 'core-srcdir/js/views/GridView' as path to access GridView source instead of minified.
     */
    var coreWebDir = coreBaseDir + coreBuildDir;
    if(env == null)
        env = globalObj['env'];
    if(env == "dev") {
        return {
            'core-srcdir'                 : coreBaseDir,
            'core-basedir'                : coreWebDir,
            'jquery'                      : coreWebDir + '/assets/jquery/js/jquery-1.8.3.min',
            'jquery-ui'                 : coreWebDir + '/assets/jquery-ui/js/jquery-ui',
            'jquery.xml2json'           : coreWebDir + '/assets/jquery/js/jquery.xml2json',
            'jquery.ba-bbq'             : coreWebDir + '/assets/jquery/js/jquery.ba-bbq.min',
            'jquery.timer'              : coreWebDir + '/assets/jquery/js/jquery.timer',
            'jquery.ui.touch-punch'     : coreWebDir + '/assets/jquery/js/jquery.ui.touch-punch.min',
            'jquery.validate'           : coreWebDir + "/assets/jquery/js/jquery.validate",
            'jquery.tristate'           : coreWebDir + "/assets/jquery/js/jquery.tristate",
            'jquery.multiselect'        : coreWebDir + "/assets/jquery-ui/js/jquery.multiselect",
            'jquery.multiselect.filter' : coreWebDir + "/assets/jquery-ui/js/jquery.multiselect.filter",
            'jquery.steps.min'          : coreWebDir + "/assets/jquery/js/jquery.steps.min",
            'jquery.panzoom'            : coreWebDir + "/assets/jquery/js/jquery.panzoom.min",
            'jquery.ui.position'        : coreWebDir + "/assets/jquery-contextMenu/js/jquery.ui.position",
            'jquery-contextmenu'        : coreWebDir + "/assets/jquery-contextMenu/js/jquery.contextMenu",
            'bootstrap'                 : coreWebDir + '/assets/bootstrap/js/bootstrap',
            'crossfilter'               : coreWebDir + '/assets/crossfilter/js/crossfilter',
            'jsonpath'                  : coreWebDir + '/assets/jsonpath/js/jsonpath-0.8.0',
            'handlebars'                : coreWebDir + "/assets/handlebars/handlebars-v1.3.0",
            'handlebars-utils'          : coreWebDir + "/js/handlebars-utils",
            'contrail-elements'         : coreWebDir + "/js/contrail-elements",

            'jquery.event.drag'         : coreWebDir + "/assets/slickgrid/js/jquery.event.drag-2.2",
            'jquery.json'               : coreWebDir + "/assets/slickgrid/js/jquery.json-2.3.min",
            'jquery.droppick'           : coreWebDir + "/assets/slickgrid/js/jquery.dropkick-1.0.0",
            'slick.core'                : coreWebDir + "/assets/slickgrid/js/slick.core",
            'slick.grid'                : coreWebDir + "/assets/slickgrid/js/slick.grid",
            'slick.dataview'            : coreWebDir + "/assets/slickgrid/js/slick.dataview",
            'slick.checkboxselectcolumn': coreWebDir + '/assets/slickgrid/js/slick.checkboxselectcolumn',
            'slick.rowselectionmodel'   : coreWebDir + '/assets/slickgrid/js/slick.rowselectionmodel',
            'jquery.datetimepicker'     : coreWebDir + "/assets/datetimepicker/js/jquery.datetimepicker",
            'select2'                   : coreWebDir + "/assets/select2/js/select2.min",
            'moment'                    : coreWebDir + "/assets/moment/moment",
            'jsbn-combined'             : coreWebDir + "/assets/ip/jsbn-combined",
            'sprintf'                   : coreWebDir + "/assets/ip/sprintf",
            'ipv6'                      : coreWebDir + "/assets/ip/ipv6",
            'protocol'                  : coreWebDir + "/js/protocol",
            'uuid'                      : coreWebDir + "/js/uuid",
            'xdate'                     : coreWebDir + "/assets/xdate/js/xdate",
            'contrail-common'           : coreWebDir + "/js/contrail-common",
            'slick.enhancementpager'    : coreWebDir + "/assets/slickgrid/js/slick.enhancementpager",
            'slick.groupmetadata'       : coreWebDir + "/assets/slickgrid/js/slick.groupitemmetadataprovider",
            // 'slickgrid-utils'          coreWebDir +  : "js/slickgrid-utils",
            'web-utils'                 : coreWebDir + "/js/web-utils",
            'config_global'             : coreWebDir + "/js/config_global",
            'contrail-load'             : coreWebDir + '/js/contrail-load',
            'analyzer-utils'            : coreWebDir + "/js/analyzer-utils",
            // 'dashboard-utils'           : "js/dashboard-utils",

            'knockout'                    : coreWebDir + '/assets/knockout/knockout-3.0.0',
            'joint'                       : coreWebDir + '/assets/joint/js/joint.clean',
            'geometry'                    : coreWebDir + '/assets/joint/js/geometry',
            'vectorizer'                  : coreWebDir + '/assets/joint/js/vectorizer',
            'joint.layout.DirectedGraph'  : coreWebDir + '/assets/joint/js/joint.layout.DirectedGraph',
            'dagre'                       : coreWebDir + '/assets/joint/js/dagre',
            'vis'                         : coreWebDir + '/assets/vis-v4.9.0/js/vis.min',
            // 'bezier'                      : coreWebDir + '/assets/bezierjs/bezier',
            'lodash'                      : coreWebDir + '/assets/lodash/lodash.min',
            'backbone'                    : coreWebDir + '/assets/backbone/backbone-min',
            'knockback'                   : coreWebDir + '/assets/backbone/knockback.min',
            'validation'                  : coreWebDir + '/assets/backbone/backbone-validation-amd',
            'text'                        : coreWebDir + '/assets/requirejs/text',
            'underscore'                  : coreWebDir + '/assets/underscore/underscore-min',

            'd3'                        : coreWebDir + '/assets/d3-v3.5.6/js/d3',
            'nv.d3'                     : coreWebDir + '/assets/nvd3-v1.8.1/js/nv.d3',

            'contrail-layout'             : coreWebDir + '/js/contrail-layout',
            'joint.contrail'              : coreWebDir + '/js/common/joint.contrail',
            'core-utils'                  : coreWebDir + '/js/common/core.utils',

            'core-alarm-utils'           :  coreWebDir + '/js/common/core.alarms.utils',
            'core-alarm-parsers'         :  coreWebDir + '/js/common/core.alarms.parsers',
            'core-constants'              : coreWebDir + '/js/common/core.constants',
            'core-formatters'             : coreWebDir + '/js/common/core.formatters',
            'core-labels'                 : coreWebDir + '/js/common/core.labels',
            'core-messages'               : coreWebDir + '/js/common/core.messages',
            'core-cache'                  : coreWebDir + '/js/common/core.cache',
            'core-views-default-config'   : coreWebDir + '/js/common/core.views.default.config',
            // 'core-init'                   : coreWebDir + '/js/common/core.init',
            // 'contrail-unified-1'          : coreWebDir + '/js/common/contrail.unified.1',
            // 'contrail-unified-2'          : coreWebDir + '/js/common/contrail.unified.2',
            // 'contrail-unified-3'          : coreWebDir + '/js/common/contrail.unified.3',
            'cf-datasource'               : coreWebDir + '/js/common/cf.datasource',

            'contrail-remote-data-handler': coreWebDir + '/js/handlers/ContrailRemoteDataHandler',
            'layout-handler'              : coreWebDir + '/js/handlers/LayoutHandler',
            'menu-handler'                : coreWebDir + '/js/handlers/MenuHandler',
            'content-handler'             : coreWebDir + '/js/handlers/ContentHandler',

            'graph-view'                  : coreWebDir + '/js/views/GraphView',
            'contrail-view'               : coreWebDir + '/js/views/ContrailView',
            'query-form-view'             : coreWebDir + '/js/views/QueryFormView',
            'contrail-vis-view'           : coreWebDir + '/js/views/ContrailVisView',

            'query-form-model'            : coreWebDir + '/js/models/QueryFormModel',
            'query-or-model'              : coreWebDir + '/js/models/QueryOrModel',
            'query-and-model'             : coreWebDir + '/js/models/QueryAndModel',
            'contrail-graph-model'        : coreWebDir + '/js/models/ContrailGraphModel',
            'contrail-vis-model'          : coreWebDir + '/js/models/ContrailVisModel',
            'contrail-view-model'         : coreWebDir + '/js/models/ContrailViewModel',
            'contrail-model'              : coreWebDir + '/js/models/ContrailModel',
            'contrail-list-model'         : coreWebDir + '/js/models/ContrailListModel',
            'mon-infra-node-list-model'   : coreWebDir + '/js/models/NodeListModel',
            'mon-infra-log-list-model'    : coreWebDir + '/js/models/LogListModel',
            'vis-node-model'              : coreWebDir + '/js/models/VisNodeModel',
            'vis-edge-model'              : coreWebDir + '/js/models/VisEdgeModel',
            'vis-tooltip-model'           : coreWebDir + '/js/models/VisTooltipModel',

            // TODO: We need to discuss a criteria on which we should add definations to this file.
            'infoboxes'                   : coreWebDir + '/js/views/InfoboxesView',
            'barchart-cf'                 : coreWebDir + '/js/views/BarChartView',
            'mon-infra-alert-list-view'   : coreWebDir + '/js/views/AlertListView',
            'mon-infra-alert-grid-view'   : coreWebDir + '/js/views/AlertGridView',
            'mon-infra-log-list-view'     : coreWebDir + '/js/views/LogListView',
            'mon-infra-sysinfo-view'      : coreWebDir + '/js/views/SystemInfoView',
            'mon-infra-dashboard-view'    : coreWebDir + '/js/views/MonitorInfraDashboardView',
            'loginwindow-model'           : coreWebDir + '/js/models/LoginWindowModel',

            'core.app.utils'              : coreWebDir + "/js/common/core.app.utils",
            'chart-utils'                 : coreWebDir + "/js/common/chart.utils",
            'storage-init'                : 'empty:',

            'thirdparty-libs'       : coreWebDir + '/js/common/thirdparty.libs',
            'contrail-core-views'   : coreWebDir + '/js/common/contrail.core.views',
            'chart-libs'            : coreWebDir + '/js/common/chart.libs',
            'core-bundle'           : coreWebDir + '/js/common/core.bundle',
            'global-libs'           : coreWebDir + '/js/common/global-libs',
            'jquery-dep-libs'       : coreWebDir + '/js/common/jquery.dep.libs',
            'nonamd-libs'           : coreWebDir + '/js/common/nonamd.libs',
            'contrail-element'            : coreWebDir + '/js/models/ContrailElement'
        };
    } else if(env == "prod") {
        return {
            'core-srcdir'                 : coreBaseDir,
            'core-basedir'                : coreBaseDir,
            'controller-basedir'          : coreBaseDir,
            'jquery'                : coreWebDir + '/assets/jquery/js/jquery-1.8.3.min',
            'thirdparty-libs'       : coreWebDir + '/js/common/thirdparty.libs',
            'contrail-core-views'   : coreWebDir + '/js/common/contrail.core.views',
            'chart-libs'            : coreWebDir + '/js/common/chart.libs',
            'core-bundle'           : coreWebDir + '/js/common/core.bundle',
            'global-libs'           : coreWebDir + '/js/common/global-libs',
            'jquery-dep-libs'       : coreWebDir + '/js/common/jquery.dep.libs',
            'nonamd-libs'           : coreWebDir + '/js/common/nonamd.libs',
            'contrail-load'         : coreWebDir + '/js/contrail-load',
            //File to load on demand
            'vis'                   : coreWebDir + '/assets/vis-v4.9.0/js/vis.min',
            'vis-node-model'              : coreWebDir + '/js/models/VisNodeModel',
            'vis-edge-model'              : coreWebDir + '/js/models/VisEdgeModel',
            'vis-tooltip-model'           : coreWebDir + '/js/models/VisTooltipModel',
            'graph-view'                  : coreWebDir + '/js/views/GraphView',
            'contrail-graph-model'        : coreWebDir + '/js/models/ContrailGraphModel',
            'dagre'                       : coreWebDir + '/assets/joint/js/dagre',
            'geometry'                    : coreWebDir + '/assets/joint/js/geometry',
            'vectorizer'                  : coreWebDir + '/assets/joint/js/vectorizer',
            'joint.layout.DirectedGraph'  : coreWebDir + '/assets/joint/js/joint.layout.DirectedGraph',
            'joint'                       : coreWebDir + '/assets/joint/js/joint.clean',
            'joint.contrail'              : coreWebDir + '/js/common/joint.contrail',

            'core-alarm-utils'           :  coreWebDir + '/js/common/core.alarms.utils',
            'core-alarm-parsers'         :  coreWebDir + '/js/common/core.alarms.parsers',
            'contrail-element'            : coreWebDir + '/js/models/ContrailElement'
        }

    }
};

var coreAppMap = {
    '*': {
        'underscore': 'underscore'
    }
};

var coreAppShim =  {
    'core-bundle': {
        dpes:['nonamd-libs','jquery']
    },
    'jquery' : {
        exports: 'jQuery'
    },
    'jquery.multiselect' : {
        deps: ['jquery-ui'],
    },
    'jquery.tristate' : {
        deps: ['jquery-ui']
    },
    'jquery.ui.position' : {
        deps: ['jquery']
    },
    'jquery-contextmenu' : {
        deps: ['jquery']
    },
    'jquery.multiselect.filter' : {
        deps: ['jquery-ui']
    },
    'jquery.steps.min' : {
        deps: ['jquery']
    },
    'bootstrap' : {
        deps: ["jquery"]
    },
    'd3' : {
        deps: ["jquery"],
        exports: 'd3'
    },
    'nv.d3' : {
        deps: ['d3'],
        exports: 'nv'
    },
    'crossfilter' : {
        deps: [],
        exports:'crossfilter'
    },
    'jquery.xml2json' : {
        deps: ["jquery"]
    },
    "jquery.ba-bbq" : {
        deps: ['jquery']
    },
    "jquery.timer" : {
        deps: ['jquery']
    },
    "jquery-ui" : {
        deps: ['jquery']
    },
    'jquery.ui.touch-punch' : {
        deps: ['jquery','jquery-ui']
    },
    'jquery.validate': {
        deps: ['jquery']
    },
    'select2': {
        deps: ['jquery']
        // exports: "$.fn.select2"
    },
    'jquery.event.drag': {
        deps: ['jquery']
    },
    'jquery.json': {
        deps: ['jquery']
    },
    'jquery.droppick': {
        deps: ['jquery']
    },
    'jquery.datetimepicker': {
        deps: ['jquery']
    },
    'slick.core': {
        deps:['jquery']
    },
    'slick.grid': {
        deps:['jquery.event.drag']
    },
    'contrail-common': {
        deps: ['jquery']
    },
    // 'contrail-layout': {
    //     deps:['jquery.ba-bbq']
    // },
    'slick.enhancementpager': {
        deps: ['jquery']
    },
    'slick.rowselectionmodel': {
        deps: ['jquery']
    },        
    'slick.checkboxselectcolumn': {
        deps: ['jquery']
    },
    'slick.dataview': {
        deps: ['jquery','slick.groupmetadata']
    },
    'slick.groupmetadata': {
        deps: ['jquery']
    },
    // 'slickgrid-utils': {
    //     deps: ['jquery','slick.grid','slick.dataview']
    // },
    'contrail-elements': {
        deps: ['jquery-ui']
    },
    'chart-utils': {
        deps: ['jquery']
    },
    'web-utils': {
        deps: ['jquery','knockout']
    },
    'handlebars-utils': {
        deps: ['jquery','handlebars']
    },
    'nvd3-plugin': {
        deps: ['nv.d3']
    },
    'd3-utils': {
        deps: ['d3']
    },
    'qe-utils': {
        deps: ['jquery']
    },
    'select2-utils': {
        deps: ['jquery']
    },
    'ipv6' : {
        deps: ['sprintf','jsbn-combined']
    },
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
    'underscore' : {
        init: function() {
            _.noConflict();
        }
    },
    'vis': {
        deps: ['jquery'],
        exports: 'vis'
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
    }
};

var coreBundles = {
        //chart-libs,thirdparty-libs,contrail-core-views are loaded lazily
        'chart-libs'        : [
            'd3',
            'nv.d3'
        ],
        'thirdparty-libs'   : [
            'slick.grid',
            'slick.checkboxselectcolumn',
            'slick.groupmetadata',
            'slick.rowselectionmodel',
            'slick.enhancementpager',
            'jsbn-combined',
            'sprintf',
            'ipv6',
            'xdate',
            'knockback',
            'validation',
        ],
        'jquery-dep-libs': [
            'jquery.xml2json',
            'jquery.ba-bbq',
            'jquery.json',
            'bootstrap',
            'select2',
            'slick.core',
            'slick.dataview',
            'jquery-ui',
            'contrail-elements',
            'jquery.timer',
            'jquery.ui.touch-punch',
            'jquery.validate',
            'jquery.tristate',
            'jquery.multiselect',
            'jquery.multiselect.filter',
            'jquery.steps.min',
            'jquery.panzoom',
            'jquery-contextmenu',
            'jquery.event.drag',
            'jquery.droppick',
            'jquery.datetimepicker'
        ],
        'core-bundle'       : [
            'underscore',
            'core-utils',
            'core-constants',
            'core-formatters',
            'core-cache',
            'core-labels',
            'core-messages',
            'core-views-default-config',
            'chart-utils',
            'text!core-basedir/templates/core.common.tmpl',
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
            'mon-infra-dashboard-view'   
        ],
        'contrail-core-views': [
            'core-basedir/js/views/GridView',
            'core-basedir/js/views/AccordianView',
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
            'core-basedir/js/views/GridFooterView',
            'core-basedir/js/views/HeatChartView',
            'core-basedir/js/views/HorizontalBarChartView',
            'core-basedir/js/views/LineBarWithFocusChartView',
            'core-basedir/js/views/LineWithFocusChartView',
            'core-basedir/js/views/LoginWindowView',
            'core-basedir/js/views/MultiBarChartView',
            'core-basedir/js/views/BarChartView',
            'core-basedir/js/views/MultiDonutChartView',
            'core-basedir/js/views/NodeConsoleLogsView',
            'core-basedir/js/views/QueryFilterView',
            'core-basedir/js/views/QueryResultGridView',
            'core-basedir/js/views/QueryResultLineChartView',
            'core-basedir/js/views/QuerySelectView',
            'core-basedir/js/views/QueryWhereView',
            'core-basedir/js/views/SparklineView',
            'core-basedir/js/views/TabsView',
            'core-basedir/js/views/WizardView'
        ]
    };


function initBackboneValidation() {
    require(['validation'],function(kbValidation) {
        _.extend(kbValidation.callbacks, {
            valid: function (view, attr, selector) {
                /*
                var $el = $(view.modalElementId).find('[name=' + attr + ']'),
                $group = $el.closest('.form-element');

                $group.removeClass('has-error');
                $group.find('.help-block').html('').addClass('hidden');
                */
            },
            invalid: function (view, attr, error, selector, validation) {
                var model = view.model;
                model.validateAttr(attr, validation);
                /*
                var $el = $(view.modalElementId).find('[name=' + attr + ']'),
                $group = $el.closest('.form-element');
                $group.addClass('has-error');
                $group.find('.help-block').html(error).removeClass('hidden');
                */
            }
        });
    });
};

function initCustomKOBindings(Knockout) {
    require(['knockout'],function(Knockout) {
        Knockout.bindingHandlers.contrailDropdown = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var elementConfig = {}, dropdown;

                if(contrail.checkIfExist(bindingContext) && contrail.checkIfExist(bindingContext.$root)){
                    var elementConfigMap = bindingContext.$root.elementConfigMap(),
                        elementName = $(element).attr("name");

                    elementConfig = elementConfigMap[elementName];
                }

                dropdown = $(element).contrailDropdown(elementConfig).data('contrailDropdown');
                Knockout.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    dropdown.destroy();
                });
            },
            update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var elementConfig = {},
                    dropdown = $(element).data('contrailDropdown');

                if(contrail.checkIfExist(bindingContext) && contrail.checkIfExist(bindingContext.$root)){
                    var elementConfigMap = bindingContext.$root.elementConfigMap(),
                        elementName = $(element).attr("name");

                    elementConfig = elementConfigMap[elementName];
                }

                if (!contrail.checkIfExist(elementConfig.data) && !contrail.checkIfExist(elementConfig.dataSource) && allBindingsAccessor.get('optionList')) {
                    var valueBindingAccessor = allBindingsAccessor.get('value'),
                        value = Knockout.utils.unwrapObservable(valueBindingAccessor),
                        optionListBindingAccessor = allBindingsAccessor.get('optionList'),
                        optionList = Knockout.utils.unwrapObservable(optionListBindingAccessor);

                    value = contrail.checkIfFunction(value) ? value() : value;

                    if (contrail.checkIfFunction(optionList) && $.isArray(optionList(viewModel))) {
                        dropdown.setData(optionList(viewModel), value, true);
                    } else if ($.isArray(optionList)) {
                        dropdown.setData(optionList, value, true);
                    }
                }

                if (allBindingsAccessor.get('value')) {
                    var valueBindingAccessor = allBindingsAccessor.get('value'),
                        value = Knockout.utils.unwrapObservable(valueBindingAccessor);

                    value = contrail.checkIfFunction(value) ? value() : value;
                    //required for hierarchical dropdown
                    if(elementConfig.queryMap) {
                        var data = dropdown.getAllData();
                        if(!contrail.isItemExists(value, data)) {
                            contrail.appendNewItemMainDataSource(value, data);
                        }
                    }
                    if (contrail.checkIfExist(value) && value !== '') {
                        dropdown.value(value, true);
                    }
                }
            }
        };

        Knockout.bindingHandlers.contrailMultiselect = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var elementConfig = {}, multiselect;

                if (contrail.checkIfExist(bindingContext) && contrail.checkIfExist(bindingContext.$root)) {
                    var elementConfigMap = bindingContext.$root.elementConfigMap(),
                        elementName = $(element).attr("name");

                    elementConfig = elementConfigMap[elementName];
                }

                multiselect = $(element).contrailMultiselect(elementConfig).data('contrailMultiselect');

                Knockout.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    multiselect.destroy();
                });
            },
            update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var elementConfig = {}, multiselect = $(element).data('contrailMultiselect');

                if(contrail.checkIfExist(bindingContext) && contrail.checkIfExist(bindingContext.$root)){
                    var elementConfigMap = bindingContext.$root.elementConfigMap(),
                        elementName = $(element).attr("name");

                    elementConfig = elementConfigMap[elementName];
                }

                if (!contrail.checkIfExist(elementConfig.data) && !contrail.checkIfExist(elementConfig.dataSource) && allBindingsAccessor.get('optionList')) {
                    var valueBindingAccessor = allBindingsAccessor.get('value'),
                        value = Knockout.utils.unwrapObservable(valueBindingAccessor),
                        optionListBindingAccessor = allBindingsAccessor.get('optionList'),
                        optionList = Knockout.utils.unwrapObservable(optionListBindingAccessor);

                if (contrail.checkIfFunction(optionList)) {
                    optionList = optionList(viewModel);
                    }

                var formattedOptionList = formatData(optionList, elementConfig),
                    currentOptionList = multiselect.getAllData();

                if (JSON.stringify(formattedOptionList) !== JSON.stringify(currentOptionList)) {
                        value = contrail.checkIfFunction(value) ? value() : value;
                        if (value !== '') {
                            value = $.isArray(value) ? value : [value];
                        } else if (value === '') {
                            value = [];
                        }

                    multiselect.setData(optionList, value, true);
                    }
                }

                if (allBindingsAccessor.get('value')) {
                    var valueBindingAccessor = allBindingsAccessor.get('value'),
                        value = Knockout.utils.unwrapObservable(valueBindingAccessor);

                    value = contrail.checkIfFunction(value) ? value() : value;

                    if (contrail.checkIfExist(value)) {
                        if (value !== '') {
                            value = $.isArray(value) ? value : [value];
                            multiselect.value(value, true);
                        } else if (value === '') {
                            multiselect.value([], true);
                        }
                    }
                }
            }
        };

        Knockout.bindingHandlers.contrailCombobox = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var elementConfig = {}, combobox;

                if(contrail.checkIfExist(bindingContext) && contrail.checkIfExist(bindingContext.$root)){
                    var elementConfigMap = bindingContext.$root.elementConfigMap(),
                        elementName = $(element).attr("name");

                    elementConfig = elementConfigMap[elementName];
                }

                combobox = $(element).contrailCombobox(elementConfig).data('contrailCombobox');

                Knockout.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    combobox.destroy();
                });
            },
            update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var elementConfig = {}, combobox = $(element).data('contrailCombobox');

                if(contrail.checkIfExist(bindingContext) && contrail.checkIfExist(bindingContext.$root)){
                    var elementConfigMap = bindingContext.$root.elementConfigMap(),
                        elementName = $(element).attr("name");

                    elementConfig = elementConfigMap[elementName];
                }

                if (!contrail.checkIfExist(elementConfig.data) && !contrail.checkIfExist(elementConfig.dataSource) && allBindingsAccessor.get('optionList')) {
                    var optionListBindingAccessor = allBindingsAccessor.get('optionList'),
                        optionList = Knockout.utils.unwrapObservable(optionListBindingAccessor);
                    if (contrail.checkIfFunction(optionList) && $.isArray(optionList(viewModel))) {
                        combobox.setData(optionList(viewModel));
                    } else if ($.isArray(optionList)) {
                        combobox.setData(optionList);
                    }
                }

                if (allBindingsAccessor.get('value')) {
                    var valueBindingAccessor = allBindingsAccessor.get('value'),
                        value = Knockout.utils.unwrapObservable(valueBindingAccessor);

                    value = contrail.checkIfFunction(value) ? value() : value;

                    if (contrail.checkIfExist(value) && value !== '') {
                        combobox.value(value);
                    }
                }

                if (allBindingsAccessor.get('disable')) {
                    var valueBindingAccessor = allBindingsAccessor.get('disable'),
                        disable = Knockout.utils.unwrapObservable(valueBindingAccessor);

                    disable = contrail.checkIfFunction(disable) ? disable() : disable;

                    if (contrail.checkIfExist(disable) && disable !== '') {
                        combobox.enable(!disable)
                    }

                }
            }
        };

        Knockout.bindingHandlers.select2 = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                Knockout.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    $(element).select2('destroy');
                });

                var valueObj = Knockout.toJS(valueAccessor()) || {},
                    allBindings = allBindingsAccessor(),
                    lookupKey = allBindings.lookupKey;

                $(element).select2(valueObj);

                if (allBindings.value) {
                    var value = Knockout.utils.unwrapObservable(allBindings.value);
                    if (typeof value === 'function') {
                        $(element).select2('val', value());
                    } else if (value && value != '') {
                        $(element).select2('val', value);
                    }
                }
            },
            update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                $(element).trigger('change');
            }
        };

        Knockout.bindingHandlers.contrailDateTimePicker = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var valueObj = Knockout.toJS(valueAccessor()) || {},
                    allBindings = allBindingsAccessor(),
                    elementConfig = {};

                if(contrail.checkIfExist(bindingContext) && contrail.checkIfExist(bindingContext.$root)){
                    var elementConfigMap = bindingContext.$root.elementConfigMap(),
                        elementName = $(element).attr("name");

                    elementConfig = elementConfigMap[elementName];
                }

                var dateTimePicker = $(element).contrailDateTimePicker(elementConfig).data('contrailDateTimePicker');

                Knockout.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    dateTimePicker.destroy();
                });
            },
            update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var dateTimePicker = $(element).data('contrailDateTimePicker');

                if (allBindingsAccessor.get('value')) {
                    var valueBindingAccessor = allBindingsAccessor.get('value'),
                        value = Knockout.utils.unwrapObservable(valueBindingAccessor);

                    value = contrail.checkIfFunction(value) ? value() : value;
                    dateTimePicker.value(value);
                }
                else {
                    dateTimePicker.value('');
                }
            }
        };

    Knockout.bindingHandlers.contrailNumericTextbox = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var elementConfig = {}, numericTextbox;

            if(contrail.checkIfExist(bindingContext) && contrail.checkIfExist(bindingContext.$root)){
                var elementConfigMap = bindingContext.$root.elementConfigMap(),
                    elementName = $(element).attr("name");

                elementConfig = elementConfigMap[elementName];
            }

            numericTextbox = $(element).contrailNumericTextbox(elementConfig).data('contrailNumericTextbox');

            Knockout.utils.domNodeDisposal.addDisposeCallback(element, function () {
                numericTextbox.destroy();
            });
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var numericTextbox = $(element).data('contrailNumericTextbox');

            if (allBindingsAccessor.get('value')) {
                var valueBindingAccessor = allBindingsAccessor.get('value'),
                    value = Knockout.utils.unwrapObservable(valueBindingAccessor);

                if (contrail.checkIfFunction(value)) {
                    numericTextbox.value(value());
                } else {
                    numericTextbox.value(value);
                }
            }
            else {
                numericTextbox.value('');
            }
        }
    };

        Knockout.bindingHandlers.contrailAutoComplete = {
                init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                    var elementConfig = {}, autocompleteTextBox;

                    if(contrail.checkIfExist(bindingContext) && contrail.checkIfExist(bindingContext.$root)){
                        var elementConfigMap = bindingContext.$root.elementConfigMap(),
                            elementName = $(element).attr("name");

                        elementConfig = elementConfigMap[elementName];
                    }

                    autocompleteTextBox = $(element).contrailAutoComplete(elementConfig).data('contrailAutoComplete');

                    Knockout.utils.domNodeDisposal.addDisposeCallback(element, function () {
                        autocompleteTextBox.destroy();
                    });
                },
                update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                    var autocompleteTextBox = $(element).data('contrailAutoComplete');

                    if (allBindingsAccessor.get('value')) {
                        var valueBindingAccessor = allBindingsAccessor.get('value'),
                            value = Knockout.utils.unwrapObservable(valueBindingAccessor);

                        if (contrail.checkIfFunction(value)) {
                            autocompleteTextBox.value(value());
                        } else {
                            autocompleteTextBox.value(value);
                        }
                    }
                    else {
                        autocompleteTextBox.value('');
                    }
                }
            };

        var updateSelect2 = function (element) {
            var el = $(element);
            if (el.data('select2')) {
                el.trigger('change');
            }
        }
        var updateSelect2Options = Knockout.bindingHandlers['options']['update'];

        Knockout.bindingHandlers['options']['update'] = function (element) {
            var r = updateSelect2Options.apply(null, arguments);
            updateSelect2(element);
            return r;
        };

        var updateSelect2SelectedOptions = Knockout.bindingHandlers['selectedOptions']['update'];

        Knockout.bindingHandlers['selectedOptions']['update'] = function (element) {
            var r = updateSelect2SelectedOptions.apply(null, arguments);
            updateSelect2(element);
            return r;
        };
    });
};

function initDomEvents() {
    $(document)
        .off('click', '.group-detail-advanced-action-item')
        .on('click', '.group-detail-advanced-action-item', function (event) {
            if (!$(this).hasClass('selected')) {
                var thisParent = $(this).parents('.group-detail-container'),
                    newSelectedView = $(this).data('view');

                thisParent.find('.group-detail-item').hide();
                thisParent.find('.group-detail-' + newSelectedView).show();

                thisParent.find('.group-detail-advanced-action-item').removeClass('selected');
                $(this).addClass('selected');

                if (contrail.checkIfExist($(this).parents('.slick-row-detail').data('cgrid'))) {
                    $(this).parents('.contrail-grid').data('contrailGrid').adjustDetailRowHeight($(this).parents('.slick-row-detail').data('cgrid'));
                }
            }
        });

    $(document)
        .off('click', '.input-type-toggle-action')
        .on('click', '.input-type-toggle-action', function (event) {
            var input = $(this).parent().find('input');
            if (input.prop('type') == 'text') {
                input.prop('type', 'password');
                $(this).removeClass('blue');
            } else {
                input.prop('type', 'text');
                $(this).addClass('blue');
            }
        });
};

function getCoreTestAppPaths(coreBaseDir) {
    var coreTestAppBaseDir = coreBaseDir + '/test/ui/js';

    return {
        'co-test-basedir'       : coreTestAppBaseDir,
        'co-test-init'          : coreTestAppBaseDir + '/co.test.init',
        'co-test-config'        : coreTestAppBaseDir + '/co.test.config',
        'co-test-constants'     : coreTestAppBaseDir + '/co.test.constants',
        'co-test-utils'         : coreTestAppBaseDir + '/co.test.utils',
        'co-test-messages'      : coreTestAppBaseDir + '/co.test.messages',
        'co-test-mockdata'      : coreTestAppBaseDir + '/co.test.mock.data',
        'co-test-runner'        : coreTestAppBaseDir + '/co.test.runner',
        'co-grid-contrail-list-model-test-suite'     : coreTestAppBaseDir + '/grid/ContrailListModel.test.suite',
        'co-grid-view-test-suite'                    : coreTestAppBaseDir + '/grid/GridView.test.suite',
        'co-grid-contrail-list-model-lib-test-suite' : coreTestAppBaseDir + '/grid/ContrailListModel.lib.test.suite',
        'co-grid-view-lib-test-suite'                : coreTestAppBaseDir + '/grid/GridView.lib.test.suite',
        'co-chart-view-zoom-scatter-test-suite'      : coreTestAppBaseDir + '/chart/ZoomScatterChartView.test.suite',
        'co-chart-view-line-bar-test-suite'          : coreTestAppBaseDir + '/chart/LineBarWithFocusChartView.test.suite',
        'co-chart-view-line-test-suite'              : coreTestAppBaseDir + '/chart/LineWithFocusChartView.test.suite',
        'co-tabs-view-test-suite'                    : coreTestAppBaseDir + '/generic/TabsView.test.suite',
        'co-details-view-test-suite'                 : coreTestAppBaseDir + '/generic/DetailsView.test.suite',

        'co-form-model-validations-test-suite'       : coreTestAppBaseDir + '/form/ModelValidations.test.suite',
    };
}

function coreTestAppShim() {
    return {
        'co-grid-contrail-list-model-lib-test-suite' : {
            deps: ['slick.core', 'slick.dataview']
        },
        'co-grid-view-lib-test-suite' : {
            deps: ['slick.core', 'slick.grid', 'jquery-ui', 'slick.enhancementpager']
        }
    };
}

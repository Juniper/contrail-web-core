/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
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
globalObj['siteMap'] = {};
globalObj['siteMapSearchStrings'] = [];
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
    //RequireJS alias mapping
    //Aliases that are needed for both prod & dev environment
    var aliasMap = {
        'core-srcdir'                 : coreBaseDir,
        'core-basedir'                : coreWebDir,
        //Bundles
        'thirdparty-libs'       : coreWebDir + '/js/common/thirdparty.libs',
        'contrail-core-views'   : coreWebDir + '/js/common/contrail.core.views',
        'chart-libs'            : coreWebDir + '/js/common/chart.libs',
        'core-bundle'           : coreWebDir + '/js/common/core.bundle',
        'global-libs'           : coreWebDir + '/js/common/global-libs',
        'jquery-dep-libs'       : coreWebDir + '/js/common/jquery.dep.libs',
        'nonamd-libs'           : coreWebDir + '/js/common/nonamd.libs',
        //Files not in bundles
        'underscore'            : coreWebDir + '/assets/underscore/underscore-min',
        'slickgrid-utils'       : coreWebDir + "/js/slickgrid-utils",
        'jquery'                : coreWebDir + '/assets/jquery/js/jquery-1.8.3.min',
        'contrail-load'         : coreWebDir + '/js/contrail-load',
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
        'joint.contrail'              : coreWebDir + '/js/joint.contrail',

        'core-alarm-utils'           :  coreWebDir + '/js/common/core.alarms.utils',
        'core-alarm-parsers'         :  coreWebDir + '/js/common/core.alarms.parsers',

        'query-form-view'             : coreWebDir + '/js/views/QueryFormView',
        'contrail-vis-view'           : coreWebDir + '/js/views/ContrailVisView',

        'query-form-model'            : coreWebDir + '/js/models/QueryFormModel',
        'query-or-model'              : coreWebDir + '/js/models/QueryOrModel',
        'query-and-model'             : coreWebDir + '/js/models/QueryAndModel',
        'contrail-vis-model'          : coreWebDir + '/js/models/ContrailVisModel',

        'loginwindow-model'           : coreWebDir + '/js/models/LoginWindowModel',
        'xml2json'                  : coreWebDir + '/assets/jquery/js/xml2json',

        'json-editor'                 : coreWebDir + '/assets/jsoneditor/js/jsoneditor.min',
        'ajv'                         : coreWebDir + '/assets/ajv/ajv.min',
        'server-schema'               : coreWebDir + '/schemas/server.schema',
        'cluster-schema'              : coreWebDir + '/schemas/cluster.schema',
        'json-model'                  : coreWebDir + "/js/models/JsonModel",
        'json-edit-view'              : coreWebDir + '/js/views/JsonEditView'

    };

    //Separate out aliases that need to be there for both prod & dev environments
    if(env == "dev") {
        var devAliasMap = {
            //Start - Core-bundle aliases
            'core-utils'                  : coreWebDir + '/js/common/core.utils',
            'core-constants'              : coreWebDir + '/js/common/core.constants',
            'core-formatters'             : coreWebDir + '/js/common/core.formatters',
            'core-cache'                  : coreWebDir + '/js/common/core.cache',
            'core-labels'                 : coreWebDir + '/js/common/core.labels',
            'core-messages'               : coreWebDir + '/js/common/core.messages',
            'core-views-default-config'   : coreWebDir + '/js/common/core.views.default.config',
            'chart-utils'                 : coreWebDir + "/js/common/chart.utils",
            'contrail-remote-data-handler': coreWebDir + '/js/handlers/ContrailRemoteDataHandler',
            'cf-datasource'               : coreWebDir + '/js/common/cf.datasource',
            'contrail-view'               : coreWebDir + '/js/views/ContrailView',
            'contrail-model'              : coreWebDir + '/js/models/ContrailModel',
            'contrail-view-model'         : coreWebDir + '/js/models/ContrailViewModel',
            'contrail-list-model'         : coreWebDir + '/js/models/ContrailListModel',
            'lodash'                      : coreWebDir + '/assets/lodash/lodash.min',
            'crossfilter'               : coreWebDir + '/assets/crossfilter/js/crossfilter',
            'backbone'                    : coreWebDir + '/assets/backbone/backbone-min',
            'text'                        : coreWebDir + '/assets/requirejs/text',
            'knockout'                    : coreWebDir + '/assets/knockout/knockout-3.0.0',
            'moment'                    : coreWebDir + "/assets/moment/moment",
            'layout-handler'              : coreWebDir + '/js/handlers/LayoutHandler',
            'menu-handler'                : coreWebDir + '/js/handlers/MenuHandler',
            'content-handler'             : coreWebDir + '/js/handlers/ContentHandler',
            'validation'                  : coreWebDir + '/assets/backbone/backbone-validation-amd',
            'mon-infra-node-list-model'   : coreWebDir + '/js/models/NodeListModel',
            'mon-infra-log-list-model'    : coreWebDir + '/js/models/LogListModel',
            'mon-infra-alert-list-view'   : coreWebDir + '/js/views/AlertListView',
            'mon-infra-alert-grid-view'   : coreWebDir + '/js/views/AlertGridView',
            'mon-infra-log-list-view'     : coreWebDir + '/js/views/LogListView',
            'mon-infra-sysinfo-view'      : coreWebDir + '/js/views/SystemInfoView',
            'mon-infra-dashboard-view'    : coreWebDir + '/js/views/MonitorInfraDashboardView',
            //End - core-bundle aliases
            //Start - jquery.dep.libs aliases
            'jquery.xml2json'           : coreWebDir + '/assets/jquery/js/jquery.xml2json',
            'jquery.ba-bbq'             : coreWebDir + '/assets/jquery/js/jquery.ba-bbq.min',
            'jquery.json'               : coreWebDir + "/assets/slickgrid/js/jquery.json-2.3.min",
            'bootstrap'                 : coreWebDir + '/assets/bootstrap/js/bootstrap',
            'select2'                   : coreWebDir + "/assets/select2/js/select2.min",
            'slick.core'                : coreWebDir + "/assets/slickgrid/js/slick.core",
            'slick.dataview'            : coreWebDir + "/assets/slickgrid/js/slick.dataview",
            'jquery-ui'                 : coreWebDir + '/assets/jquery-ui/js/jquery-ui',
            'contrail-elements'         : coreWebDir + "/js/contrail-elements",
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
            'jquery.event.drag'         : coreWebDir + "/assets/slickgrid/js/jquery.event.drag-2.2",
            'jquery.droppick'           : coreWebDir + "/assets/slickgrid/js/jquery.dropkick-1.0.0",
            'jquery.datetimepicker'     : coreWebDir + "/assets/datetimepicker/js/jquery.datetimepicker",
            //End - jquery.dep.libs aliases
            //Start - thirdparty-libs aliases
            'handlebars'                : coreWebDir + "/assets/handlebars/handlebars-v1.3.0",
            'handlebars-utils'          : coreWebDir + "/js/handlebars-utils",

            'slick.grid'                : coreWebDir + "/assets/slickgrid/js/slick.grid",
            'slick.checkboxselectcolumn': coreWebDir + '/assets/slickgrid/js/slick.checkboxselectcolumn',
            'slick.groupmetadata'       : coreWebDir + "/assets/slickgrid/js/slick.groupitemmetadataprovider",
            'slick.rowselectionmodel'   : coreWebDir + '/assets/slickgrid/js/slick.rowselectionmodel',
            'slick.enhancementpager'    : coreWebDir + "/assets/slickgrid/js/slick.enhancementpager",
            'knockback'                 : coreWebDir + '/assets/backbone/knockback.min',
            //End - thirdparty-libs aliases
            //Start - chart-libs aliases
            'd3'                        : coreWebDir + '/assets/d3-v3.5.6/js/d3',
            'nv.d3'                     : coreWebDir + '/assets/nvd3-v1.8.1/js/nv.d3',
            //End - chart-libs aliases
            //Start - nonamd-libs aliases
            'web-utils'                 : coreWebDir + "/js/web-utils",
            'analyzer-utils'            : coreWebDir + "/js/analyzer-utils",
            'config_global'             : coreWebDir + "/js/config_global",
            'contrail-layout'           : coreWebDir + '/js/contrail-layout',
            'contrail-common'           : coreWebDir + "/js/contrail-common",
            'uuid'                      : coreWebDir + "/js/uuid",
            'protocol'                  : coreWebDir + "/js/protocol",
            'jsbn-combined'             : coreWebDir + "/assets/ip/jsbn-combined",
            'xdate'                     : coreWebDir + "/assets/xdate/js/xdate",
            'sprintf'                   : coreWebDir + "/assets/ip/sprintf",
            'ipv6'                      : coreWebDir + "/assets/ip/ipv6",
            'jsonpath'                  : coreWebDir + '/assets/jsonpath/js/jsonpath-0.8.0',
            //End - nonamd-libs aliases

            'infoboxes'                   : coreWebDir + '/js/views/InfoboxesView',
            'barchart-cf'                 : coreWebDir + '/js/views/BarChartView',

            // 'core.app.utils'              : coreWebDir + "/js/common/core.app.utils",
            'storage-init'                : 'empty:'

        };
        //Merge common (for both prod & dev) alias 
        for(var currAlias in devAliasMap)
            aliasMap[currAlias] = devAliasMap[currAlias]

    } else if(env == "prod") {
        var prodAliasMap = {
            'controller-basedir'          : coreBaseDir,
        }
        //Merge common (for both prod & dev) alias 
        for(var currAlias in prodAliasMap)
            aliasMap[currAlias] = prodAliasMap[currAlias]
    }
    return aliasMap;
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
    'xml2json' : {
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
    'jquery-dep-libs' : {
        deps: ['jquery']
    },
    'slickgrid-utils': {
        deps: ['jquery','slick.grid','slick.dataview']
    },
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

function changeRegion (e)
{
    var oldRegion = contrail.getCookie('region');
    var region = e.added.text;
    if ((null != region) && (oldRegion != region) &&
        ('null' != region) && ('undefined' != region)) {
        contrail.setCookie('region', region);
        /* And issue logout request */
        loadUtils.logout()
    }
}

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

/**
 * This file is also require-d during build script.
 * Run following only when its loaded in client side.
 */
if (typeof document !== 'undefined' && document) {
    var defaultBaseDir = (document.location.pathname.indexOf('/vcenter') == 0) ? "./../" : "./";

    /**
     * Set the global env with the data-env attr from the core.app script tag.
     * This env will determine the path requirejs will fetch and build the cache.
     * for 'prod' env, files under built dir will be used; else, original source as is(for eg. dev env).
     */
    globalObj['env'] =  document.querySelector('script[data-env]') && document.querySelector('script[data-env]').getAttribute('data-env');

    var bundles = {};
    if (globalObj['env'] == 'prod') {
        globalObj['buildBaseDir'] = 'dist';
        bundles = coreBundles;
    } else {
        // defaultBaseDir = defaultBaseDir.slice(0, -1);
        globalObj['buildBaseDir'] = '';
    }

    var coreBaseDir = defaultBaseDir, ctBaseDir = defaultBaseDir,
        smBaseDir = defaultBaseDir, strgBaseDir = defaultBaseDir,
        pkgBaseDir = defaultBaseDir;

    var webServerInfoDefObj;
    requirejs.config({
        bundles:bundles,
        baseUrl: coreBaseDir,
        urlArgs: 'built_at=' + built_at,
        paths: getCoreAppPaths(coreBaseDir, globalObj['buildBaseDir']),
        map: coreAppMap,
        shim: coreAppShim,
        waitSeconds: 0
    });

    // if (document.location.pathname.indexOf('/vcenter') == 0) {
    //     $('head').append('<base href="/vcenter/" />');
    // }

    //featurePkgs is required to pre-load feature bundles
    var loadFeatureApps = function (featurePackages) {
        var featureAppDefObjList= [],
            initAppDefObj, url;
        
        for (var key in featurePackages) {
            if(globalObj['initFeatureAppDefObjMap'][key] == null) {
                if(featurePackages[key] && 
                        [FEATURE_PCK_WEB_CONTROLLER,FEATURE_PCK_WEB_SERVER_MANAGER,FEATURE_PCK_WEB_STORAGE].indexOf(key) > -1) {
                    globalObj['initFeatureAppDefObjMap'][key] = $.Deferred();
                    featureAppDefObjList.push(globalObj['initFeatureAppDefObjMap'][key]);
                }
            }
            if(featurePackages[key] && key == FEATURE_PCK_WEB_CONTROLLER) {
                var ctrlUrl = ctBaseDir + '/common/ui/js/controller.app.js';
                if(globalObj['loadedScripts'].indexOf(ctrlUrl) == -1) {
                    loadUtils.getScript(ctrlUrl);
                }
            } else if (featurePackages[key] && key == FEATURE_PCK_WEB_SERVER_MANAGER) {
                var smUrl = smBaseDir + '/common/ui/js/sm.app.js';
                if(globalObj['loadedScripts'].indexOf(smUrl) == -1) {
                    //Post-Authentication
                    webServerInfoDefObj.done(function() {
                        //Need to remove "slickgrid-utils" once all grids are moved to GridView
                        require(['slickgrid-utils'],function() {
                            loadUtils.getScript(smUrl);
                        });
                    });
                }
            }  else if (featurePackages[key] && key == FEATURE_PCK_WEB_STORAGE) {
                var strgUrl = strgBaseDir + '/common/ui/js/storage.app.js';
                if(globalObj['loadedScripts'].indexOf(strgUrl) == -1) {
                    loadUtils.getScript(strgUrl);
                }
            }
        }

        $.when.apply(window, featureAppDefObjList).done(function () {
            globalObj['featureAppDefObj'].resolve();
        });
    };

    require(['core-bundle','nonamd-libs'],function() {
    });
    function loadAjaxRequest(ajaxCfg,callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET',ajaxCfg['url']);
        xhr.send(null);
        xhr.onload(function(response) {
            callback(response);
        });

    }
    var orchPrefix = window.location.pathname;
    //Even with URL as <https://localhost:8143>,pathname is returning as "/"
    //Strip-offf the trailing /
    orchPrefix = orchPrefix.replace(/\/$/,'');

    (function() {
        var menuXMLLoadDefObj,layoutHandlerLoadDefObj,featurePkgs;
        loadUtils = {
            getScript: function(url, callback) {
                var scriptPath = url + '?built_at=' + built_at;
                globalObj['loadedScripts'].push(url);
                return $.ajax({
                    type: "GET",
                    url: scriptPath,
                    success: callback,
                    dataType: "script",
                    cache: true
                });
            },
            getCookie: function(name) {
                if(name != null) {
                    var cookies = document.cookie.split(";");
                    for (var i = 0; i < cookies.length; i++) {
                        var x = cookies[i].substr(0, cookies[i].indexOf("="));
                        var y = cookies[i].substr(cookies[i].indexOf("=") + 1);
                        x = x.replace(/^s+|s+$/g, "").trim();
                        if (x == name)
                            return unescape(y);
                    }
                }
                return false;
            },
            postAuthenticate: function(response) {
                require(['jquery'],function() {
                    //To fetch alarmtypes
                    require(['core-alarm-utils'],function() {});
                    $('#signin-container').empty();
                    //If #content-container already exists,just show it
                    if($('#content-container').length == 0) {
                        $('#app-container').html($('#app-container-tmpl').text());
                        $('#app-container').removeClass('hide');
                    } else 
                        $('#app-container').removeClass('hide');
                        //Reset content-container
                        $('#content-container').html('');
                    $.ajaxSetup({
                        beforeSend: function (xhr, settings) {
                            if (globalObj['webServerInfo'] != null && globalObj['webServerInfo']['loggedInOrchestrationMode'] != null)
                                xhr.setRequestHeader("x-orchestrationmode", globalObj['webServerInfo']['loggedInOrchestrationMode']);
                            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                            xhr.setRequestHeader("X-CSRF-Token", globalObj['webServerInfo']['_csrf']);
                        }
                    });
                    globalObj['webServerInfo'] = loadUtils.parseWebServerInfo(response);

                    //For Region drop-down
                    require(['jquery', 'jquery-dep-libs'], function() {
                        var regionList =
                            globalObj.webServerInfo.regionList;
                        var cnt = 0;
                        if (null != regionList) {
                            cnt = regionList.length;
                        }
                        var ddRegionList = [];
                        for (var i = 0; i < cnt; i++) {
                            ddRegionList.push({id: regionList[i], text: regionList[i]});
                        }
                        var isServiceEndPointFromConfig =
                            globalObj.webServerInfo.serviceEndPointFromConfig;
                        if ((cnt > 0) && (false == isServiceEndPointFromConfig)) {
                            $('#regionDD').contrailDropdown({dataTextField:"text",
                                                            dataValueField:"id",
                                                            width: '100px',
                                                            change: changeRegion});
                            $('#regionDD').data("contrailDropdown").setData(ddRegionList);
                            $("#regionDD").data("contrailDropdown").value(contrail.getCookie('region'));
                        }
                    });
                    webServerInfoDefObj.resolve();

                    if (loadUtils.getCookie('username') != null) {
                        $('#user_info').text(loadUtils.getCookie('username'));
                    }
                    $('#user-profile').show();
                    loadUtils.bindAppListeners();
                    $.when.apply(window,[menuXMLLoadDefObj,layoutHandlerLoadDefObj]).done(function(menuXML) {
                        if(globalObj['featureAppDefObj'] == null)
                            globalObj['featureAppDefObj'] = $.Deferred();
                        require(['core-bundle'],function() {
                            layoutHandler.load(menuXML);
                        });
                    });
                });
            },
            onAuthenticationReq: function(loadCfg) {
                document.getElementById('signin-container').innerHTML = document.getElementById('signin-container-tmpl').innerHTML;
                require(['jquery','jquery-dep-libs'], function() {
                    var isRegionsFromConfig = false;
                    if (null != loadCfg) {
                        isRegionsFromConfig = loadCfg.isRegionListFromConfig;
                        configRegionList = loadCfg.configRegionList;
                    }
                    var regionList = [];
                    if (true == isRegionsFromConfig) {
                        for (var key in configRegionList) {
                            regionList.push({id: key, text: key});
                        }
                        $('#region_id_cont').show();
                        $("#region_id").select2({placeholder: "Select the Region",
                                                data: regionList,
                                                width: "283px"})
                        var cookieRegion = contrail.getCookie('region');
                        if (regionList.length > 0) {
                            if (null == cookieRegion) {
                                cookieRegion = regionList[0]['key'];
                            }
                            $("#region_id").select2("val", cookieRegion);
                        }
                    }
                });
                var appContEl = document.getElementById('app-container');
                if(appContEl.classList) {
                    appContEl.classList.add('hide');
                } else {
                    appContEl.className += ' hide';
                }
                //Remove modal dialogs
                require(['jquery'],function() {
                    $('.modal').remove();
                    $('.modal-backdrop').remove();
                });
                loadUtils.bindSignInListeners();
            },
            fetchMenu: function(menuXMLLoadDefObj) {
                $.ajax({
                    url: orchPrefix + '/menu',
                    type: "GET",
                    dataType: "xml"
                }).done(function (response,textStatus,xhr) {
                    menuXML = response;
                    menuXMLLoadDefObj.resolve(menuXML);
                }).fail(function(response) {
                    console.info(response);
                    loadUtils.onAuthenticationReq(null);
                });
            },
            isAuthenticated: function() {
                Ajax.request(orchPrefix + '/isauthenticated',"GET",null,function(response) {
                    if(response != null && response.isAuthenticated == true) {
                        loadUtils.postAuthenticate(response);
                    } else {
                        loadUtils.onAuthenticationReq(response);
                    }
                    featurePkgs = response['featurePkg'];
                    require(['jquery'],function() {
                        if(globalObj['featureAppDefObj'] == null)
                            globalObj['featureAppDefObj'] = $.Deferred();
                        if(webServerInfoDefObj == null) 
                            webServerInfoDefObj = $.Deferred();
                        loadFeatureApps(featurePkgs);
                    });
                });
            },
            bindSignInListeners: function() {
                document.getElementById('signin').onclick = loadUtils.authenticate;
                // $('#signin').click(authenticate);
                require(['jquery'],function() {
                    $('body').off('keypress.signInEnter').on('keypress.signInEnter', '.login-container', function(args) {
                        if (args.keyCode == 13) {
                            $('#signin').click();
                            return false;
                        }
                    });
                });
            },
            bindAppListeners: function() {
                document.getElementById('logout').onclick = loadUtils.logout;
                // $('#logout').click(logout);
            },
            authenticate: function() {
                require(['jquery'],function() {
                    //Compares client UTC time with the server UTC time and display alert if mismatch exceeds the threshold
                    var postData = {
                        username: $("[name='username']").val(),
                        password: $("[name='password']").val()
                    };
                    var regionName = $("[name='regionname']").val();
                    if ((null != regionName) && (regionName.length > 0)) {
                        postData['regionname'] = regionName;
                    }
                    var domain = $("[name='domain']").val();
                    if ((null != domain) && (domain.length > 0)) {
                        postData['domain'] = domain;
                    }
                    $.ajax({
                        url: orchPrefix + '/authenticate',
                        type: "POST",
                        data: JSON.stringify(postData),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json"
                    }).done(function (response) {
                        if(response != null && response.isAuthenticated == true) {
                            loadUtils.postAuthenticate(response);
                        } else {
                            //Display login-error message
                            $('#login-error strong').text(response['msg']);
                            $('#login-error').removeClass('hide');
                        }
                    });
                });
            },
            logout: function() {
                //Clear All Pending Ajax calls
                $.allajax.abort();
                $.ajax({
                    url: '/logout',
                    type: "GET",
                    dataType: "json"
                }).done(function (response) {
                    loadUtils.onAuthenticationReq(response);
                });
            },
            parseWebServerInfo: function(webServerInfo) {
                if (webServerInfo['serverUTCTime'] != null) {
                    webServerInfo['timeDiffInMillisecs'] = webServerInfo['serverUTCTime'] - new Date().getTime();
                    if (Math.abs(webServerInfo['timeDiffInMillisecs']) > globalObj['timeStampTolerance']) {
                        if (webServerInfo['timeDiffInMillisecs'] > 0) {
                            globalAlerts.push({
                                msg: infraAlertMsgs['TIMESTAMP_MISMATCH_BEHIND'].format(diffDates(new XDate(), new XDate(webServerInfo['serverUTCTime']), 'rounded')),
                                sevLevel: sevLevels['INFO']
                            });
                        } else {
                            globalAlerts.push({
                                msg: infraAlertMsgs['TIMESTAMP_MISMATCH_AHEAD'].format(diffDates(new XDate(webServerInfo['serverUTCTime']), new XDate(), 'rounded')),
                                sevLevel: sevLevels['INFO']
                            });
                        }
                    }
                }
                return webServerInfo;
            }
        }
        //Check if the session is authenticated
        loadUtils.isAuthenticated();
        require(['jquery'],function() {
            menuXMLLoadDefObj = $.Deferred();
            layoutHandlerLoadDefObj = $.Deferred();
            if(webServerInfoDefObj == null) 
                webServerInfoDefObj = $.Deferred();
            $.ajaxSetup({
                cache: false,
                crossDomain: true,
                //set the default timeout as 30 seconds
                timeout: 30000,
                beforeSend: function (xhr, settings) {
                    if (globalObj['webServerInfo'] != null && globalObj['webServerInfo']['loggedInOrchestrationMode'] != null)
                        xhr.setRequestHeader("x-orchestrationmode", globalObj['webServerInfo']['loggedInOrchestrationMode']);
                    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                    xhr.setRequestHeader("X-CSRF-Token", loadUtils.getCookie('_csrf'));
                },
                error: function (xhr, e) {
                    //ajaxDefErrorHandler(xhr);
                }
            });
            loadUtils.fetchMenu(menuXMLLoadDefObj);

            require(['chart-libs'],function() {});
            require(['jquery-dep-libs'],function() {});
            globalObj['layoutDefObj'] = $.Deferred();

            SVGElement.prototype.getTransformToElement = SVGElement.prototype.getTransformToElement || function(toElement) {
                return toElement.getScreenCTM().inverse().multiply(this.getScreenCTM());
            };

            //nonamd-libs   #no dependency on jquery
            require(['core-bundle','jquery-dep-libs','nonamd-libs'],function() {
                require(['validation','knockout','backbone'],function(validation,ko) {
                    window.kbValidation = validation;
                    // window.ko = ko;
                });
                require(['core-utils'],function(CoreUtils) {
                    cowu = new CoreUtils();
                    require(['underscore'],function(_) {
                        _.noConflict();
                    });
                    require(['layout-handler','content-handler','contrail-load','lodash'],function(LayoutHandler,ContentHandler,ChartUtils,_) {
                        window._ = _;
                        contentHandler = new ContentHandler();
                        initBackboneValidation();
                        initCustomKOBindings(window.ko);
                        initDomEvents();
                        layoutHandler = new LayoutHandler();
                        layoutHandlerLoadDefObj.resolve();
                    });
                });
            });
        });
    })();
    /* End: Loading */
}

if (typeof exports !== 'undefined' && module.exports) {
    exports = module.exports;
    exports.getCoreAppPaths = getCoreAppPaths;
    exports.coreAppMap = coreAppMap;
    exports.coreAppShim = coreAppShim;
}

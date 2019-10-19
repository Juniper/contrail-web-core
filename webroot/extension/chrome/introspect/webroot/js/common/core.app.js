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
var contrailIntrospectIP = null;
var contrailIntrospectProcess = null;
var contrailIntrospectSandeshXML = null;
var FEATURE_PCK_WEB_CONTROLLER = "webController";
var loadIntrospectViaProxy = false;

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
    if ("undefined" !== typeof(window)) {
        window.coreWebDir = coreWebDir;
    }
    if(env == null)
        env = globalObj['env'];
    //RequireJS alias mapping
    //Aliases that are needed for both prod & dev environment
    var aliasMap = {
        'core-srcdir'                 : coreBaseDir,
        'core-basedir'                : coreWebDir,
        //Bundles
        'contrail-core-views'         : coreWebDir + '/js/common/contrail.core.views',
        'core-bundle'                 : coreWebDir + '/js/common/core.bundle',
        'jquery-dep-libs'             : coreWebDir + '/js/common/jquery.dep.libs',
        'nonamd-libs'                 : coreWebDir + '/js/common/nonamd.libs',
        //Files not in bundles
        'underscore'                  : coreWebDir + '/assets/underscore/underscore-min',
        //'jquery'                      : coreWebDir + '/assets/jquery/js/jquery-1.8.3.min',
        //'jquery'                      : coreWebDir + '/assets/jquery/js/jquery-1.9.1.min',
        'jquery'                      : coreWebDir + '/assets/jquery/js/jquery.min',
        'contrail-load'               : coreWebDir + '/js/contrail-load',
        'xml2json'                    : coreWebDir + '/assets/jquery/js/xml2json',
        'jquery-ui'                   : coreWebDir + '/assets/jquery-ui/js/jquery-ui.min',
        'iframe-view'                 : coreWebDir + '/js/views/IframeView',
    };

    //Separate out aliases that need to be there for both prod & dev environments
    if(env == "dev") {
        var devAliasMap = {
            //Start - Core-bundle aliases
            'core-utils'                  : coreWebDir + '/js/common/core.utils',
            'core-hash-utils'             : coreWebDir + '/js/common/core.hash.utils',
            'core-constants'              : coreWebDir + '/js/common/core.constants',
            'core-formatters'             : coreWebDir + '/js/common/core.formatters',
            'core-cache'                  : coreWebDir + '/js/common/core.cache',
            'core-labels'                 : coreWebDir + '/js/common/core.labels',
            'core-messages'               : coreWebDir + '/js/common/core.messages',
            'core-views-default-config'   : coreWebDir + '/js/common/core.views.default.config',
            'contrail-remote-data-handler': coreWebDir + '/js/handlers/ContrailRemoteDataHandler',
            'contrail-view'               : coreWebDir + '/js/views/ContrailView',
            'contrail-model'              : coreWebDir + '/js/models/ContrailModel',
            'contrail-view-model'         : coreWebDir + '/js/models/ContrailViewModel',
            'contrail-list-model'         : coreWebDir + '/js/models/ContrailListModel',
            'contrail-element'            : coreWebDir + '/js/models/ContrailElement',
            'lodash'                      : coreWebDir + '/assets/lodash/lodash.min',
            'crossfilter'                 : coreWebDir + '/assets/crossfilter/js/crossfilter',
            'backbone'                    : coreWebDir + '/assets/backbone/backbone-min',
            'text'                        : coreWebDir + '/assets/requirejs/text',
            'knockout'                    : coreWebDir + '/assets/knockout/knockout',
            'moment'                      : coreWebDir + "/assets/moment/moment",
            'layout-handler'              : coreWebDir + '/js/handlers/LayoutHandler',
            'menu-handler'                : coreWebDir + '/js/handlers/MenuHandler',
            'content-handler'             : coreWebDir + '/js/handlers/ContentHandler',
            'validation'                  : coreWebDir + '/assets/backbone/backbone-validation-amd',
            //End - core-bundle aliases
            //Start - jquery.dep.libs aliases
            'jquery.xml2json'            : coreWebDir + '/assets/jquery/js/jquery.xml2json',
            'jquery.json'                : coreWebDir + "/assets/slickgrid/js/jquery.json-2.3.min",
            'bootstrap'                  : coreWebDir + '/assets/bootstrap/js/bootstrap',
            'select2'                    : coreWebDir + "/assets/select2/js/select2.min",
            'slick.core'                 : coreWebDir + "/assets/slickgrid/js/slick.core",
            'slick.dataview'             : coreWebDir + "/assets/slickgrid/js/slick.dataview",
            'core-contrail-form-elements': coreWebDir + "/js/common/core.contrail.form.elements",
            'jquery.timer'              : coreWebDir + '/assets/jquery/js/jquery.timer',
            'jquery.ui.touch-punch'     : coreWebDir + '/assets/jquery/js/jquery.ui.touch-punch.min',
            'jquery.validate'           : coreWebDir + "/assets/jquery/js/jquery.validate.min",
            'jquery.tristate'           : coreWebDir + "/assets/jquery/js/jquery.tristate",
            'jquery.multiselect'        : coreWebDir + "/assets/jquery-ui/js/jquery.multiselect",
            'jquery.multiselect.filter' : coreWebDir + "/assets/jquery-ui/js/jquery.multiselect.filter",
            'jquery.steps.min'          : coreWebDir + "/assets/jquery/js/jquery.steps.min",
            'jquery.event.drag'         : coreWebDir + "/assets/slickgrid/js/jquery.event.drag-2.2",
            'jquery.datetimepicker'     : coreWebDir + "/assets/datetimepicker/js/jquery.datetimepicker",
            //End - jquery.dep.libs aliases
            //Start - thirdparty-libs aliases
            'handlebars'                : coreWebDir + "/assets/handlebars/handlebars.min",
            'core-handlebars-utils'     : coreWebDir + "/js/common/core.handlebars.utils",
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
            'config_global'             : coreWebDir + "/js/config_global",
            'contrail-layout'           : coreWebDir + '/js/contrail-layout',
            'contrail-common'           : coreWebDir + "/js/contrail-common",
            'protocol'                  : coreWebDir + "/js/protocol",
            'jsonpath'                  : coreWebDir + '/assets/jsonpath/js/jsonpath-0.8.0',
            //End - nonamd-libs aliases

        };
        //Merge common (for both prod & dev) alias
        for(var currAlias in devAliasMap)
            aliasMap[currAlias] = devAliasMap[currAlias]

    } else if(env == "prod") {
        var prodAliasMap = {
            'controller-basedir'          : coreBaseDir,
            'backbone'                    : coreWebDir + '/assets/backbone/backbone-min',
            'knockout'                    : coreWebDir + '/assets/knockout/knockout',
            'knockback'                 : coreWebDir + '/assets/backbone/knockback.min',
            'validation'                  : coreWebDir + '/assets/backbone/backbone-validation-amd'
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
        deps:['nonamd-libs', 'jquery-ui']
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
        deps: ['jquery-ui']
    },
    'core-contrail-form-elements': {
        deps: ['jquery-ui']
    },
    'web-utils': {
        deps: ['jquery','knockout']
    },
    'core-handlebars-utils': {
        deps: ['jquery','handlebars']
    },
    'nvd3-plugin': {
        deps: ['nv.d3']
    },
    'd3-utils': {
        deps: ['d3']
    },
    'select2-utils': {
        deps: ['jquery']
    },
    'backbone': {
        deps: ['lodash'],
        exports: 'Backbone'
    },
    'underscore' : {
        init: function() {
            _.noConflict();
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
    'contrail-model': {
        deps: ['knockback']
    },
    'contrail-list-model': {
        deps: ['contrail-remote-data-handler']
    }
};

function initBackboneValidation() {
    require(['validation'],function(kbValidation) {
        _.extend(kbValidation.callbacks, {
            invalid: function (view, attr, error, selector, validation) {
                var model = view.model;
                model.validateAttr(attr, validation);
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

                var formattedOptionList = cowu.formatFormData(optionList, elementConfig),
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

function setIntrospectCookie (ip, nodeType, callback) {
    chrome.cookies.get({url: "http://127.0.0.1", name: "contrailIntrospectIP"},
                       function(cookie) {
        if ((null != cookie) && (null != cookie.value)) {
            var introspectIpCookie = cookie.value;
            var ipArr = introspectIpCookie.split(":");
            /* Always put the last used IP to the top list */
            var idx = ipArr.indexOf(ip);
            if (-1 == idx) {
                introspectIpCookie = ip + ":" + introspectIpCookie;
            } else {
                ipArr.splice(0, 0, ipArr.splice(idx, 1)[0]);
                introspectIpCookie = ipArr.join(":");
            }
            chrome.cookies.set({url: "http://127.0.0.1", name: "contrailIntrospectIP",
                                value: introspectIpCookie}, function(cookie) {
                chrome.cookies.set({url: "http://127.0.0.1", name: "contrailIntrospectNodeType",
                                   value: nodeType}, function(cookie) {
                    if (null != callback) {
                        callback(introspectIpCookie);
                    }
                });
            });
        } else {
            chrome.cookies.set({url: "http://127.0.0.1", name: "contrailIntrospectIP",
                                value: ip}, function(cookie) {
                chrome.cookies.set({url: "http://127.0.0.1", name: "contrailIntrospectNodeType",
                                   value: nodeType}, function(cookie) {
                    if (null != callback) {
                        callback(ip);
                    }
                });
            });
        }
    });
}

function getIntrospectCookie (callback) {
    chrome.cookies.get({url: "http://127.0.0.1", name: "contrailIntrospectIP"},
                        function(ipCookie) {
        chrome.cookies.get({url: "http://127.0.0.1", name: "contrailIntrospectNodeType"},
                           function(nodeTypeCookie) {
            var introIP = null;
            var introNodeType = null;
            if ((null != ipCookie) && ("" != ipCookie.value)) {
                introIP = ipCookie.value;
            }
            if ((null != nodeTypeCookie) && ("" != nodeTypeCookie.value)) {
                introNodeType = nodeTypeCookie.value;
            }
            callback({introIP: introIP, introNodeType: introNodeType});
            return;
        });
    });
}

function readXMLFileFromLocal() {
    var xFile = $('#xml_sandesh_file')[0].files[0];
    if (xFile) {
        var fRead = new FileReader();
        fRead.onload = function (e) {
            var contents = e.target.result;
            contrailIntrospectSandeshXML = contents;
            return contents;
        };
        fRead.readAsText(xFile);
        return fRead;
    } else {
        alert("Failed to load file.");
    }
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
    globalObj['buildBaseDir'] = '';

    var coreBaseDir = defaultBaseDir, ctBaseDir = defaultBaseDir,
        smBaseDir = defaultBaseDir, strgBaseDir = defaultBaseDir,
        pkgBaseDir = "./contrail-web-controller/webroot";

    globalObj['buildBaseDir'] = "/.";
    coreBaseDir = "./contrail-web-core/webroot";
    ctBaseDir = "./contrail-web-controller/webroot";
    var webServerInfoDefObj;
    requirejs.config({
        bundles:bundles,
        baseUrl: ".",
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
                        [FEATURE_PCK_WEB_CONTROLLER].indexOf(key) > -1) {
                    globalObj['initFeatureAppDefObjMap'][key] = $.Deferred();
                    featureAppDefObjList.push(globalObj['initFeatureAppDefObjMap'][key]);
                }
            }
            if(featurePackages[key] && key == FEATURE_PCK_WEB_CONTROLLER) {
                var ctrlUrl = ctBaseDir + '/common/ui/js/controller.app.js';
                if(globalObj['loadedScripts'].indexOf(ctrlUrl) == -1) {
                    loadUtils.getScript(ctrlUrl);
                }
            }
        }

        $.when.apply(window, featureAppDefObjList).done(function () {
            //Ensure d3 and nv.d3 are available before loading any particular feature
            //d3 and nv.d3 are not necessary for loading menu and layout
                globalObj['featureAppDefObj'].resolve();
        });
    };

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
    var idxIndex = orchPrefix.indexOf("index.html");
    if (idxIndex > -1) {
        orchPrefix = orchPrefix.slice(0, idxIndex - 1);
    }

    (function() {
        var menuXMLLoadDefObj,layoutHandlerLoadDefObj,featurePkgs;
        loadUtils = {
            getScript: function(url, callback) {
                var scriptPath = url;
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
                return null;
            },
            setValuesToPortComboBox: function(callback) {
                $('#process').contrailCombobox({
                    dataValueField: 'id',
                    dataTextField: 'text',
                    dataSource: {
                        type: 'local',
                        data: [
                            {id: 8083, text: 'control'},
                            {id: 8085, text: 'vrouter'},
                            {id: 8089, text: 'analytics'},
                            {id: 8084, text: 'config'}
                        ]
                    }
                });
                getIntrospectCookie(function(cookieObj) {
                    var ipList = [];
                    var ipCookie = cookieObj.introIP;
                    if (null != ipCookie) {
                        var ips = ipCookie.split(":");
                        var len = ips.length;
                        for (var i = 0; i < len; i++) {
                            ipList.push({id: ips[i], text: ips[i]});
                        }
                    }
                    $("#ip_address").contrailCombobox({
                        dataValueField: 'id',
                        dataTextField: 'text',
                        dataSource: {
                            type: 'local',
                            data: ipList
                        }
                    });
                    if (len > 0) {
                        $("#ip_address").data().contrailCombobox.value(ipList[0].id);
                    }
                    var nodeTypeCookie = (null != cookieObj.introNodeType) ? cookieObj.introNodeType
                        : "control";
                    if (null != nodeTypeCookie) {
                        $("#process").data().contrailCombobox.value(nodeTypeCookie);
                    }
                    callback();
                });
            },
            postAuthenticate: function(response) {
                require(['jquery', 'jquery-dep-libs','nonamd-libs'],function() {
                    getIntrospectCookie(function(cookieObj) {
                        if (null != cookieObj) {
                            contrailIntrospectIP = cookieObj.introIP;
                        }
                        $('#signin-container').empty();
                        //If #content-container already exists,just show it
                        if($('#content-container').length == 0) {
                            $('#app-container').html($('#app-container-tmpl').text());
                            $('#app-container').removeClass('hide');
                        } else {
                            $('#app-container').removeClass('hide');
                        }
                        //Reset content-container
                        $('#content-container').html('');
                        globalObj['webServerInfo'] = response;
                        $.when.apply(window, [menuXMLLoadDefObj,
                                     layoutHandlerLoadDefObj]).done(function(menuXML) {
                            if(globalObj['featureAppDefObj'] == null)
                                globalObj['featureAppDefObj'] = $.Deferred();
                            require(['core-bundle'], function() {
                                document.getElementById("dashboard_sdn_logo").onclick= loadUtils.reload;
                                layoutHandler.load(menuXML);
                            });
                        });
                    });
                });
            },
            onAuthenticationReq: function() {
                document.getElementById('signin-container').innerHTML =
                    document.getElementById('signin-container-tmpl').innerHTML;
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
                    $(".focus-config-backdrop").remove();
                });
                //require(['core-bundle','jquery-dep-libs','nonamd-libs', 'core-utils', 'core-hash-utils'],function() {
                this.setValuesToPortComboBox(function() {
                    loadUtils.bindSignInListeners();
                });
            },
            fetchMenu: function(menuXMLLoadDefObj) {
                $.ajax({
                    url: orchPrefix + 'menu.xml',
                    type: "GET",
                    dataType: "xml"
                }).done(function (response,textStatus,xhr) {
                    menuXML = response;
                    menuXMLLoadDefObj.resolve(menuXML);
                }).fail(function(response) {
                    console.info(response);
                    loadUtils.onAuthenticationReq();
                });
            },
            getAuthResp: function(callback) {
                var response = {};
                var url = window.location.toString();
                var isAuthenticated = false;
                response = {
                    featurePkg: {webController: true, introspect: true},
                    featurePkgsInfo: {webController: {enable: true},
                                      introspect: {enable: true},
                    },
                    insecureAccess: true,
                    reloaded: false
                };
                isAuthenticated = false;
                var idx = url.indexOf("#p=setting_introspect_");
                if (idx > -1) {
                    isAuthenticated = true;
                    if ((url.indexOf("#p=setting_introspect_xml") > 0) &&
                        (null == contrailIntrospectSandeshXML)) {
                        isAuthenticated = false;
                        var href = window.location.href;
                        window.location.href = href.substring(0, idx);
                        response.reloaded = true;
                    }
                }
                response.isAuthenticated = isAuthenticated;
                if (null != callback) {
                    callback(response);
                } else {
                    return response;
                }
            },
            isAuthenticated: function() {
                loadUtils.getAuthResp(function(response) {
                    if (true === response.reloaded) {
                        return;
                    }
                    if (false != response.isAuthenticated) {
                        loadUtils.postAuthenticate(response);
                    } else {
                        loadUtils.onAuthenticationReq();
                    }
                    featurePkgs = response['featurePkg'];
                    require(['jquery'],function() {
                        if(globalObj['featureAppDefObj'] == null)
                            globalObj['featureAppDefObj'] = $.Deferred();
                        if(webServerInfoDefObj == null)
                            webServerInfoDefObj = $.Deferred();
                        //Ensure the global aliases (like contrail,functions in web-utils) are available before loading
                        //feature packages as they are used in the callback of feature init modules without requring them
                        require(['nonamd-libs'],function() {
                            loadFeatureApps(featurePkgs);
                        });
                    });
                });
            },
            loadXMLSandeshFile: function(event) {
                var xmlFilePath = $('#xml_sandesh_file').val();
                if (xmlFilePath == '') {
                    alert("Please select a xml file.");
                    return false;
                } else {
                    var fileType = xmlFilePath.substring(xmlFilePath.lastIndexOf(".") + 1);
                    if (fileType.toLowerCase() != "xml") {
                        alert("Please select .xml file only.");
                        return false;
                    }
                }
                var fileName = xmlFilePath.substring(xmlFilePath.lastIndexOf("\\") + 1);
                $("#localFilePath").val(fileName);
            },
            reload: function() {
                var url = window.location.toString();
                var idx = url.indexOf("#p=setting_introspect_");
                var href = window.location.href;
                window.location.href = href.substring(0, idx)
            },
            bindSignInListeners: function() {
                document.getElementById('signin').onclick = loadUtils.authenticate;
                document.getElementById("xml_sandesh_file").onchange = loadUtils.loadXMLSandeshFile;
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
                var xmlFilePath = $("#localFilePath").val();
                if ((null != xmlFilePath) && (xmlFilePath.length > 0)) {
                    $.when(
                        readXMLFileFromLocal()
                    ).done(function (xmlResponse) {
                        loadUtils.getAuthResp(function(response) {
                            loadUtils.postAuthenticate(response);
                        });
                    });
                    return;
                }
                require(['jquery'],function() {
                    contrailIntrospectIP = $("#ip_address").data().contrailCombobox.value();
                    contrailIntrospectProcess = $("#process").data().contrailCombobox.text()
                    if ((null == contrailIntrospectIP) || (!contrailIntrospectIP.length)) {
                        //Display login-error message
                        $('#login-error strong').text("Error");
                        $('#login-error').removeClass('hide');
                        return;
                    }
                    setIntrospectCookie(contrailIntrospectIP, contrailIntrospectProcess, function() {
                        loadUtils.getAuthResp(function(response) {
                            loadUtils.postAuthenticate(response);
                        });
                    });
                });
            },
            logout: function() {
                //Clear iframes
                $('.iframe-view').remove();
                //Clear All Pending Ajax calls
                $.allajax.abort();
                $.ajax({
                    url: '/logout',
                    type: "GET",
                    dataType: "json"
                }).done(function (response) {
                    loadUtils.onAuthenticationReq();
                });
            }
        }
        //Check if the session is authenticated
        require(['jquery'],function() {
            require(['core-bundle','nonamd-libs'],function() {
            });
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
                },
                error: function (xhr, e) {
                    //ajaxDefErrorHandler(xhr);
                }
            });
            loadUtils.fetchMenu(menuXMLLoadDefObj);

            require(['jquery-dep-libs'],function() {});
            globalObj['layoutDefObj'] = $.Deferred();

            SVGElement.prototype.getTransformToElement = SVGElement.prototype.getTransformToElement || function(toElement) {
                return toElement.getScreenCTM().inverse().multiply(this.getScreenCTM());
            };

            //nonamd-libs   #no dependency on jquery
            require(['backbone','validation','knockout','knockback'],function() {
                require(['core-bundle','jquery-dep-libs','nonamd-libs'],function() {
                    require(['validation','knockout','backbone'],function(validation,ko) {
                        window.kbValidation = validation;
                        // window.ko = ko;
                    });
                    require(['core-utils', 'core-hash-utils'],function(CoreUtils, CoreHashUtils) {
                        cowu = new CoreUtils();
                        cowhu = new CoreHashUtils();
                        require(['underscore'],function(_) {
                            _.noConflict();
                        });
                        require(['layout-handler', 'content-handler', 'contrail-load','lodash'], function(LayoutHandler, ContentHandler, ChartUtils,_) {
                            window._ = _;
                            contentHandler = new ContentHandler();
                            initBackboneValidation();
                            initCustomKOBindings(window.ko);
                            layoutHandler = new LayoutHandler();
                            layoutHandlerLoadDefObj.resolve();
                            loadUtils.isAuthenticated();
                        });
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

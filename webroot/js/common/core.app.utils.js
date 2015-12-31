/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */


var globalObj = {'env':""},
    FEATURE_PCK_WEB_CONTROLLER = "webController",
    FEATURE_PCK_WEB_STORAGE = "webStorage",
    FEATURE_PCK_WEB_SERVER_MANAGER = "serverManager";

function getCoreAppPaths(coreBaseDir, coreBuildDir) {
    /**
     * coreBaseDir: Apps Root directory.
     * coreWebDir: Root directory from the contents will be served. Either built or source depending on env.
     *
     * core-srcdir: Require path id pointing to root directory for the source files which are delivered.
     * in a 'prod' env to use the file in source form (i.e not minified version), use path with prefix 'core-srcdir'
     * eg: use 'core-srcdir/js/views/GridView' as path to access GridView source instead of minified.
     */
    var coreWebDir = coreBaseDir + coreBuildDir;
    return {
        'core-srcdir'                 : coreBaseDir,
        'core-basedir'                : coreWebDir,
        'jquery'                      : coreWebDir + 'assets/jquery/js/jquery-1.8.3.min',
        'knockout'                    : coreWebDir + 'assets/knockout/knockout-3.0.0',
        'joint'                       : coreWebDir + 'assets/joint/js/joint.clean',
        'geometry'                    : coreWebDir + 'assets/joint/js/geometry',
        'vectorizer'                  : coreWebDir + 'assets/joint/js/vectorizer',
        'joint.layout.DirectedGraph'  : coreWebDir + 'assets/joint/js/joint.layout.DirectedGraph.min',
        'dagre'                       : coreWebDir + 'assets/joint/js/dagre.min',
        'bezier'                      : coreWebDir + 'assets/bezierjs/bezier',
        'lodash'                      : coreWebDir + 'assets/lodash/lodash.min',
        'backbone'                    : coreWebDir + 'assets/backbone/backbone-min',
        'knockback'                   : coreWebDir + 'assets/backbone/knockback.min',
        'validation'                  : coreWebDir + 'assets/backbone/backbone-validation-amd',
        'text'                        : coreWebDir + 'assets/requirejs/text',
        'underscore'                  : coreWebDir + 'assets/underscore/underscore-min',

        'contrail-layout'             : coreWebDir + 'js/contrail-layout',
        'joint.contrail'              : coreWebDir + 'js/joint.contrail',
        'core-utils'                  : coreWebDir + 'js/common/core.utils',

        'core-constants'              : coreWebDir + 'js/common/core.constants',
        'core-formatters'             : coreWebDir + 'js/common/core.formatters',
        'core-labels'                 : coreWebDir + 'js/common/core.labels',
        'core-messages'               : coreWebDir + 'js/common/core.messages',
        'core-cache'                  : coreWebDir + 'js/common/core.cache',
        'core-views-default-config'   : coreWebDir + 'js/common/core.views.default.config',
        'core-init'                   : coreWebDir + 'js/common/core.init',
        'contrail-unified-1'          : coreWebDir + 'js/common/contrail.unified.1',
        'contrail-unified-2'          : coreWebDir + 'js/common/contrail.unified.2',
        'contrail-unified-3'          : coreWebDir + 'js/common/contrail.unified.3',

        'contrail-remote-data-handler': coreWebDir + 'js/handlers/ContrailRemoteDataHandler',
        'layout-handler'              : coreWebDir + 'js/handlers/LayoutHandler',
        'menu-handler'                : coreWebDir + 'js/handlers/MenuHandler',
        'content-handler'             : coreWebDir + 'js/handlers/ContentHandler',

        'graph-view'                  : coreWebDir + 'js/views/GraphView',
        'contrail-view'               : coreWebDir + 'js/views/ContrailView',
        'query-form-view'             : coreWebDir + 'js/views/QueryFormView',

        'query-form-model'            : coreWebDir + 'js/models/QueryFormModel',
        'query-or-model'              : coreWebDir + 'js/models/QueryOrModel',
        'query-and-model'             : coreWebDir + 'js/models/QueryAndModel',
        'contrail-graph-model'        : coreWebDir + 'js/models/ContrailGraphModel',
        'contrail-view-model'         : coreWebDir + 'js/models/ContrailViewModel',
        'contrail-model'              : coreWebDir + 'js/models/ContrailModel',
        'contrail-list-model'         : coreWebDir + 'js/models/ContrailListModel',
        'mon-infra-node-list-model'   : coreWebDir + 'js/models/NodeListModel',
        'mon-infra-log-list-model'    : coreWebDir + 'js/models/LogListModel',

        // TODO: We need to discuss a criteria on which we should add definations to this file.
        'infoboxes'                   : coreWebDir + 'js/views/InfoboxesView',
        'barchart-cf'                 : coreWebDir + 'js/views/BarChartView',
        'mon-infra-alert-list-view'   : coreWebDir + 'js/views/AlertListView',
        'mon-infra-alert-grid-view'   : coreWebDir + 'js/views/AlertGridView',
        'mon-infra-log-list-view'     : coreWebDir + 'js/views/LogListView',
        'mon-infra-sysinfo-view'      : coreWebDir + 'js/views/SystemInfoView',
        'mon-infra-dashboard-view'    : coreWebDir + 'js/views/MonitorInfraDashboardView'
    };
};

var coreAppMap = {
        '*': {
            'underscore': 'underscore'
        }
};

var coreAppShim =  {
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
        }
};


function initBackboneValidation() {
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
};

function initCustomKOBindings(Knockout) {
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
                    optionList = Knockout.utils.unwrapObservable(optionListBindingAccessor),
                    formattedOptionList = formatData(optionList, elementConfig),
                    currentOptionList = multiselect.getAllData();

                if (JSON.stringify(formattedOptionList) !== JSON.stringify(currentOptionList)) {
                    value = contrail.checkIfFunction(value) ? value() : value;
                    if (value !== '') {
                        value = $.isArray(value) ? value : [value];
                    } else if (value === '') {
                        value = [];
                    }

                    if (contrail.checkIfFunction(optionList) && $.isArray(optionList(viewModel))) {
                        multiselect.setData(optionList(viewModel), value, true);
                    } else if ($.isArray(optionList)) {
                        multiselect.setData(optionList, value, true);
                    }
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

if (typeof exports !== 'undefined' && module.exports) {
    exports = module.exports;
    exports.getCoreAppPaths = getCoreAppPaths;
    exports.coreAppMap = coreAppMap;
    exports.coreAppShim = coreAppShim;
}

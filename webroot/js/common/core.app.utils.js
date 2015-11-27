/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */


var globalObj = {'env':"prod"},
    FEATURE_PCK_WEB_CONTROLLER = "webController",
    FEATURE_PCK_WEB_STORAGE = "webStorage",
    FEATURE_PCK_WEB_SERVER_MANAGER = "serverManager";

function getCoreAppPaths(coreBaseDir) {
    return {
        'core-basedir'                : coreBaseDir,
        'jquery'                      : coreBaseDir + '/assets/jquery/js/jquery-1.8.3.min',
        'bootstrap'                   : coreBaseDir + '/assets/bootstrap/js/bootstrap.min',
        'd3'                          : coreBaseDir + '/assets/d3-v3.5.6/js/d3.min',
        'nvd3'                        : coreBaseDir + '/assets/nvd3-v1.8.1/js/nv.d3.min',
        'xdate'                       : coreBaseDir + '/assets/xdate/js/xdate',
        'handlebars'                  : coreBaseDir + '/assets/handlebars/handlebars-v1.3.0',
        'knockout'                    : coreBaseDir + '/assets/knockout/knockout-3.0.0',
        'joint'                       : coreBaseDir + '/assets/joint/js/joint.clean',
        'geometry'                    : coreBaseDir + '/assets/joint/js/geometry',
        'vectorizer'                  : coreBaseDir + '/assets/joint/js/vectorizer',
        'joint.layout.DirectedGraph'  : coreBaseDir + '/assets/joint/js/joint.layout.DirectedGraph',
        'dagre'                       : coreBaseDir + '/assets/joint/js/dagre',
        'bezier'                      : coreBaseDir + '/assets/bezierjs/bezier',
        'lodash'                      : coreBaseDir + '/assets/joint/js/lodash',
        'backbone'                    : coreBaseDir + '/assets/backbone/backbone-min',
        'knockback'                   : coreBaseDir + '/assets/backbone/knockback.min',
        'validation'                  : coreBaseDir + '/assets/backbone/backbone-validation-amd',
        'text'                        : coreBaseDir + '/assets/requirejs/text',
        'underscore'                  : coreBaseDir + '/assets/underscore/underscore-min',

        'contrail-common'             : coreBaseDir + '/js/contrail-common',
        'handlebars-utils'            : coreBaseDir + '/js/handlebars-utils',
        'contrail-elements'           : coreBaseDir + '/js/contrail-elements',
        'contrail-layout'             : coreBaseDir + '/js/contrail-layout',
        'protocol'                    : coreBaseDir + '/js/protocol',
        'joint.contrail'              : coreBaseDir + '/js/joint.contrail',
        'core-utils'                  : coreBaseDir + '/js/common/core.utils',

        // TODO: Following files should not be required. We need to removew these files from inital loading
        'slickgrid-utils'             : coreBaseDir + '/js/slickgrid-utils',
        'analyzer-utils'              : coreBaseDir + '/js/analyzer-utils',
        'dashboard-utils'             : coreBaseDir + '/js/dashboard-utils',
        'web-utils'                   : coreBaseDir + '/js/web-utils',
        //END TODO

        'core-constants'              : coreBaseDir + '/js/common/core.constants',
        'core-formatters'             : coreBaseDir + '/js/common/core.formatters',
        'core-labels'                 : coreBaseDir + '/js/common/core.labels',
        'core-messages'               : coreBaseDir + '/js/common/core.messages',
        'core-cache'                  : coreBaseDir + '/js/common/core.cache',
        'core-views-default-config'   : coreBaseDir + '/js/common/core.views.default.config',
        'core-init'                   : coreBaseDir + '/js/common/core.init',
        'contrail-unified-1'          : coreBaseDir + '/js/common/contrail.unified.1',
        'contrail-unified-2'          : coreBaseDir + '/js/common/contrail.unified.2',

        'contrail-remote-data-handler': coreBaseDir + '/js/handlers/ContrailRemoteDataHandler',
        'layout-handler'              : coreBaseDir + '/js/handlers/LayoutHandler',
        'menu-handler'                : coreBaseDir + '/js/handlers/MenuHandler',
        'content-handler'             : coreBaseDir + '/js/handlers/ContentHandler',

        'graph-view'                  : coreBaseDir + '/js/views/GraphView',
        'contrail-view'               : coreBaseDir + '/js/views/ContrailView',
        'query-form-view'             : coreBaseDir + '/js/views/QueryFormView',
        'query-result-view'           : coreBaseDir + '/js/views/QueryResultView',
        'query-line-chart-view'       : coreBaseDir + '/js/views/QueryLineChartView',

        'query-form-model'            : coreBaseDir + '/js/models/QueryFormModel',
        'query-or-model'              : coreBaseDir + '/js/models/QueryOrModel',
        'query-and-model'             : coreBaseDir + '/js/models/QueryAndModel',
        'contrail-graph-model'        : coreBaseDir + '/js/models/ContrailGraphModel',
        'contrail-view-model'         : coreBaseDir + '/js/models/ContrailViewModel',
        'contrail-model'              : coreBaseDir + '/js/models/ContrailModel',
        'contrail-list-model'         : coreBaseDir + '/js/models/ContrailListModel',
        'mon-infra-node-list-model'   : coreBaseDir + '/js/models/NodeListModel',
        'mon-infra-log-list-model'    : coreBaseDir + '/js/models/LogListModel',

        // TODO: We need to discuss a criteria on which we should add definations to this file.
        'infoboxes'                   : coreBaseDir + '/js/views/InfoboxesView',
        'barchart-cf'                 : coreBaseDir + '/js/views/BarChartView',
        'mon-infra-alert-list-view'   : coreBaseDir + '/js/views/AlertListView',
        'mon-infra-alert-grid-view'   : coreBaseDir + '/js/views/AlertGridView',
        'mon-infra-log-list-view'     : coreBaseDir + '/js/views/LogListView',
        'mon-infra-sysinfo-view'      : coreBaseDir + '/js/views/SystemInfoView',
        'mon-infra-dashboard-view'    : coreBaseDir + '/js/views/MonitorInfraDashboardView'
    };
};

var coreAppMap = {
        '*': {
            'underscore': 'underscore'
        }
};

var coreAppShim =  {
        'bootstrap': {
            deps: ['jquery']
        },
        'd3': {
            deps: ['jquery']
        },
        'nv.d3': {
            deps: ['d3']
        },
        'nvd3': {
            deps: ['d3']
        },
        'contrail-common': {
            deps: ['jquery']
        },
        'contrail-layout': {
            deps: ['contrail-unified-1', 'web-utils', 'contrail-elements']
        },
        'slickgrid-utils': {
            deps: ['contrail-unified-2']
        },
        'contrail-elements': {
            deps: ['contrail-unified-1']
        },
        'web-utils': {
            deps: ['knockout', 'xdate']
        },
        'handlebars-utils': {
            deps: ['jquery', 'handlebars', 'contrail-unified-1']
        },
        'backbone': {
            deps: ['lodash', 'jquery'],
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
        'knockback': {
            deps: ['knockout', 'backbone']
        },
        'validation': {
            deps: ['backbone']
        },
        'lodash': {
            deps: ['jquery']
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
        'dagre': {
            deps: ['jquery']
        },
        'text': {
            deps: ['jquery']
        },
        'contrail-model': {
            deps: ['knockback']
        },
        'contrail-view-model': {
            deps: ['jquery']
        },
        'contrail-graph-model': {
            deps: ['joint.contrail', 'joint.layout.DirectedGraph']
        },
        'graph-view': {
            deps: ['joint.contrail']
        },
        'contrail-list-model': {
            deps: ['contrail-remote-data-handler']
        },
        'contrail-remote-data-handler': {
            deps: ['jquery']
        },
        'contrail-view' : {
            deps: ['backbone']
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

                if (contrail.checkIfFunction(value)) {
                    dateTimePicker.value(value());
                } else {
                    dateTimePicker.value(value);
                }
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

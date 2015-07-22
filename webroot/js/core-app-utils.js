/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */


var globalObj = {'env':"prod"};

function getCoreAppPaths(coreBaseDir) {
    return {
        'core-basedir'                : coreBaseDir,
        'jquery'                      : coreBaseDir + '/assets/jquery/js/jquery-1.8.3.min',
        'jquery.xml2json'             : coreBaseDir + '/assets/jquery/js/jquery.xml2json',
        'jquery.ba-bbq'               : coreBaseDir + '/assets/jquery/js/jquery.ba-bbq.min',
        'jquery.timer'                : coreBaseDir + '/assets/jquery/js/jquery.timer',
        'jquery-ui'                   : coreBaseDir + '/assets/jquery-ui/js/jquery-ui',
        'jquery.ui.touch-punch'       : coreBaseDir + '/assets/jquery/js/jquery.ui.touch-punch.min',
        'bootstrap'                   : coreBaseDir + '/assets/bootstrap/js/bootstrap.min',
        'd3'                          : coreBaseDir + '/assets/d3-v3.5.6/js/d3',
        'nv.d3'                       : coreBaseDir + '/assets/nvd3/js/nv.d3',
        'nvd3v181'                    : coreBaseDir + '/assets/nvd3-v1.8.1/js/nv.d3',
        'crossfilter'                 : coreBaseDir + '/assets/crossfilter/js/crossfilter.min',
        'jsonpath'                    : coreBaseDir + '/assets/jsonpath/js/jsonpath-0.8.0',
        'xdate'                       : coreBaseDir + '/assets/xdate/js/xdate',
        'jquery.validate'             : coreBaseDir + '/assets/jquery/js/jquery.validate',
        'handlebars'                  : coreBaseDir + '/assets/handlebars/handlebars-v1.3.0',
        'knockout'                    : coreBaseDir + '/assets/knockout/knockout-3.0.0',
        'select2'                     : coreBaseDir + '/assets/select2/js/select2.min',
        'select2-utils'               : coreBaseDir + '/js/select2-utils',
        'jquery.event.drag'           : coreBaseDir + '/assets/slickgrid/js/jquery.event.drag-2.2',
        'jquery.json'                 : coreBaseDir + '/assets/slickgrid/js/jquery.json-2.3.min',
        'jquery.droppick'             : coreBaseDir + '/assets/slickgrid/js/jquery.dropkick-1.0.0',
        'slick.core'                  : coreBaseDir + '/assets/slickgrid/js/slick.core',
        'slick.grid'                  : coreBaseDir + '/assets/slickgrid/js/slick.grid',
        'slick.dataview'              : coreBaseDir + '/assets/slickgrid/js/slick.dataview',
        'slick.enhancementpager'      : coreBaseDir + '/assets/slickgrid/js/slick.enhancementpager',
        'jquery.datetimepicker'       : coreBaseDir + '/assets/datetimepicker/js/jquery.datetimepicker',
        'moment'                      : coreBaseDir + '/assets/moment/moment.min',
        'sprintf'                     : coreBaseDir + '/assets/ip/sprintf',
        'ipv6'                        : coreBaseDir + '/assets/ip/ipv6',
        'jsbn-combined'               : coreBaseDir + '/assets/ip/jsbn-combined',
        'contrail-common'             : coreBaseDir + '/js/contrail-common',
        'handlebars-utils'            : coreBaseDir + '/js/handlebars-utils',
        'slickgrid-utils'             : coreBaseDir + '/js/slickgrid-utils',
        'contrail-elements'           : coreBaseDir + '/js/contrail-elements',
        'topology_api'                : coreBaseDir + '/js/topology_api',
        'chart-utils'                 : coreBaseDir + '/js/chart-utils',
        'web-utils'                   : coreBaseDir + '/js/web-utils',
        'contrail-layout'             : coreBaseDir + '/js/contrail-layout',
        'config_global'               : coreBaseDir + '/js/config_global',
        'protocol'                    : coreBaseDir + '/js/protocol',
        'qe-utils'                    : coreBaseDir + '/js/qe-utils',
        'nvd3-plugin'                 : coreBaseDir + '/js/nvd3-plugin',
        'd3-utils'                    : coreBaseDir + '/js/d3-utils',
        'analyzer-utils'              : coreBaseDir + '/js/analyzer-utils',
        'dashboard-utils'             : coreBaseDir + '/js/dashboard-utils',
        'jquery.multiselect'          : coreBaseDir + '/assets/jquery-ui/js/jquery.multiselect',
        'jquery.multiselect.filter'   : coreBaseDir + '/assets/jquery-ui/js/jquery.multiselect.filter',
        'jquery.steps.min'            : coreBaseDir + '/assets/jquery/js/jquery.steps.min',
        'jquery.tristate'             : coreBaseDir + '/assets/jquery/js/jquery.tristate',
        'joint'                       : coreBaseDir + '/assets/joint/js/joint.clean.min',
        'geometry'                    : coreBaseDir + '/assets/joint/js/geometry',
        'vectorizer'                  : coreBaseDir + '/assets/joint/js/vectorizer',
        'joint.layout.DirectedGraph'  : coreBaseDir + '/assets/joint/js/joint.layout.DirectedGraph',
        'joint.contrail'              : coreBaseDir + '/js/joint.contrail',
        'dagre'                       : coreBaseDir + '/assets/joint/js/dagre',
        'bezier'                      : coreBaseDir + '/assets/bezierjs/bezier',
        'lodash'                      : coreBaseDir + '/assets/joint/js/lodash',
        'jquery.panzoom'              : coreBaseDir + '/assets/jquery/js/jquery.panzoom.min',
        'jquery.ui.position'          : coreBaseDir + '/assets/jquery-contextMenu/js/jquery.ui.position',
        'jquery.contextMenu'          : coreBaseDir + '/assets/jquery-contextMenu/js/jquery.contextMenu',
        'slick.checkboxselectcolumn'  : coreBaseDir + '/assets/slickgrid/js/slick.checkboxselectcolumn',
        'slick.rowselectionmodel'     : coreBaseDir + '/assets/slickgrid/js/slick.rowselectionmodel',
        'backbone'                    : coreBaseDir + '/assets/backbone/backbone-min',
        'knockback'                   : coreBaseDir + '/assets/backbone/knockback.min',
        'validation'                  : coreBaseDir + '/assets/backbone/backbone-validation-amd',
        'text'                        : coreBaseDir + '/assets/requirejs/text',
        'core-utils'                  : coreBaseDir + '/js/core-utils',
        'core-constants'              : coreBaseDir + '/js/core-constants',
        'core-formatters'             : coreBaseDir + '/js/core-formatters',
        'core-labels'                 : coreBaseDir + '/js/core-labels',
        'core-messages'               : coreBaseDir + '/js/core-messages',
        'contrail-view-model'         : coreBaseDir + '/js/models/ContrailViewModel',
        'contrail-model'              : coreBaseDir + '/js/models/ContrailModel',
        'contrail-list-model'         : coreBaseDir + '/js/models/ContrailListModel',
        'graph-view'                  : coreBaseDir + '/js/views/GraphView',
        'contrail-graph-model'        : coreBaseDir + '/js/models/ContrailGraphModel',
        'contrail-remote-data-handler': coreBaseDir + '/js/models/ContrailRemoteDataHandler',
        'uuid-js'                     : coreBaseDir + '/js/uuid',
        'core-cache'                  : coreBaseDir + '/js/core-cache',
        'core-init'                   : coreBaseDir + '/js/core-init',
        'contrail-all-8'              : coreBaseDir + '/js/contrail-all-8',
        'contrail-all-9'              : coreBaseDir + '/js/contrail-all-9'
    };
};

var coreAppMap = {
        '*': {
            'underscore': 'lodash'
        }
};

var coreAppShim =  {
        'jquery.tristate': {
            deps: ['jquery-ui']
        },
        'jquery.multiselect': {
            deps: ['jquery-ui']
        },
        'jquery.multiselect.filter': {
            deps: ['jquery.multiselect']
        },
        'jquery.steps.min': {
            deps: ['jquery']
        },
        'bootstrap': {
            deps: ['jquery']
        },
        'd3': {
            deps: ['jquery']
        },
        'nv.d3': {
            deps: ['d3']
        },
        'nvd3v181': {
            deps: ['d3']
        },
        'crossfilter': {
            deps: ['d3']
        },
        'jquery.xml2json': {
            deps: ['jquery']
        },
        'jquery.ba-bbq': {
            deps: ['jquery']
        },
        'jquery.timer': {
            deps: ['jquery']
        },
        'jquery-ui': {
            deps: ['jquery']
        },
        'jquery.ui.touch-punch': {
            deps: ['jquery']
        },
        'jquery.validate': {
            deps: ['jquery']
        },
        'select2': {
            deps: ['jquery']
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
            deps: ['jquery']
        },
        'slick.grid': {
            deps: ['slick.core', 'jquery.event.drag']
        },
        'contrail-common': {
            deps: ['jquery']
        },
        'contrail-layout': {
            deps: ['jquery.ba-bbq', 'web-utils', 'contrail-elements']
        },
        'slick.enhancementpager': {
            deps: ['jquery']
        },
        'slickgrid-utils': {
            deps: ['slick.dataview']
        },
        'slick.dataview': {
            deps: ['slick.grid']
        },
        'contrail-elements': {
            deps: ['jquery-ui']
        },
        'chart-utils': {
            deps: ['d3']
        },
        'web-utils': {
            deps: ['knockout', 'xdate']
        },
        'qe-utils': {
            deps: ['jquery']
        },
        'handlebars-utils': {
            deps: ['jquery', 'handlebars', 'contrail-all-8']
        },
        'nvd3-plugin': {
            deps: ['nv.d3', 'd3']
        },
        'd3-utils': {
            deps: ['d3']
        },
        'qe-utils': {
            deps: ['jquery']
        },
        'ipv6': {
            deps: ['sprintf', 'jsbn-combined']
        },
        'jquery.panzoom': {
            deps: ['jquery']
        },
        'jquery.ui.position': {
            deps: ['jquery']
        },
        'jquery.contextMenu': {
            deps: ['jquery']
        },
        'slick.checkboxselectcolumn': {
            deps: ['slick.dataview']
        },
        'slick.rowselectionmodel': {
            deps: ['slick.dataview']
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
            deps: ['jquery','slick.core']
        },
        'contrail-graph-model': {
            deps: ['joint.contrail', 'joint.layout.DirectedGraph', 'slick.core']
        },
        'graph-view': {
            deps: ['joint.contrail']
        },
        'contrail-list-model': {
            deps: ['contrail-remote-data-handler', 'slick.core']
        },
        'contrail-remote-data-handler': {
            deps: ['jquery']
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
            var valueObj = Knockout.toJS(valueAccessor()) || {},
                allBindings = allBindingsAccessor(),
                dropDown = $(element).contrailDropdown(valueObj).data('contrailDropdown');

            if (allBindings.value) {
                var value = Knockout.utils.unwrapObservable(allBindings.value);
                if (typeof value === 'function') {
                    dropDown.value(value());
                } else {
                    dropDown.value(value);
                }
            }
            else {
                dropDown.value('');
            }

            Knockout.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).select2('destroy');
            });
        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            $(element).trigger('change');
        }
    };

    Knockout.bindingHandlers.contrailMultiselect = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var valueObj = valueAccessor(),
                allBindings = allBindingsAccessor(),
                lookupKey = allBindings.lookupKey,
                multiselect = $(element).contrailMultiselect(valueObj).data('contrailMultiselect');

            if (allBindings.value) {
                var value = Knockout.utils.unwrapObservable(allBindings.value);
                if (typeof value === 'function') {
                    multiselect.value(value());
                } else {
                    multiselect.value(value);
                }
            }

            Knockout.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).select2('destroy');
            });
        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            $(element).trigger('change');
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
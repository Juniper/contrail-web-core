/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var initDepFiles = [
    'jquery-ui', 'jquery.xml2json', 'jquery.ba-bbq', 'jquery.timer', 'jquery.ui.touch-punch',
    'bootstrap', 'd3', 'nv.d3', 'crossfilter', 'jsonpath', 'xdate', 'jquery.validate',
    'handlebars', 'select2', 'jquery.event.drag', 'jquery.json', 'jquery.droppick', 'slick.core',
    'slick.grid', 'slick.enhancementpager', 'jquery.datetimepicker', 'moment',
    'contrail-common', 'handlebars-utils', 'slickgrid-utils', 'contrail-elements',
    'topology_api', 'chart-utils', 'web-utils', 'contrail-layout', 'config_global', 'protocol',
    'qe-utils', 'nvd3-plugin', 'd3-utils', 'analyzer-utils', 'dashboard-utils', 'ipv6',
    'jquery.tristate', 'jquery.multiselect', 'jquery.multiselect.filter', 'jquery.steps.min', 'slick.dataview',
    'joint', 'joint.layout.DirectedGraph', 'jquery.panzoom', 'joint.contrail', 'jquery.ui.position',
    'jquery.contextMenu', 'slick.checkboxselectcolumn', 'slick.rowselectionmodel',
    'backbone', 'text', 'contrail-model'
];


require(['jquery', 'knockout'], function ($, Knockout) {
    window.ko = Knockout;
    loadCommonTemplates();
    require(initDepFiles, function() {
        require(['underscore', 'validation', 'core-utils', 'core-constants', 'knockout'], function (_, validation, CoreUtils, CoreConstants, Knockout) {
            cowu = new CoreUtils();
            cowc = new CoreConstants();
            kbValidation = validation;
            initBackboneValidation(_);
            initCustomKOBindings(Knockout);
            initDomEvents();
        });
    });
});

function loadCommonTemplates() {
    //Set the base URI
    if (document.location.pathname.indexOf('/vcenter') == 0)
        $('head').append('<base href="/vcenter/" />');
    templateLoader = (function ($, host) {
        //Loads external templates from path and injects in to page DOM
        return {
            loadExtTemplate: function (path, deferredObj, containerName) {
                //Load the template only if it doesn't exists in DOM
                var tmplLoader = $.ajax({url: path})
                    .success(function (result) {
                        //Add templates to DOM
                        if (containerName != null) {
                            $('body').append('<div id="' + containerName + '"></div>');
                            $('#' + containerName).append(result);
                        } else
                            $("body").append(result);
                        if (deferredObj != null)
                            deferredObj.resolve();
                    })
                    .error(function (result) {
                        if (result['statusText'] != 'abort')
                            showInfoWindow("Error while loading page.", 'Error');
                    });

                tmplLoader.complete(function () {
                    $(host).trigger("TEMPLATE_LOADED", [path]);
                });
            }
        };
    })(jQuery, document);
    $.ajaxSetup({async: false});
    //Need to issue the call synchronously as the following scripts refer to the templates in this file
    templateLoader.loadExtTemplate('/views/contrail-common.view');
    $.ajaxSetup({async: true});
};

function initBackboneValidation(_) {
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
        .off('click', '.group-detail-action-item')
        .on('click', '.group-detail-action-item', function (event) {
            if (!$(this).hasClass('selected')) {
                var thisParent = $(this).parents('.group-detail-container'),
                    newSelectedView = $(this).data('view');

                thisParent.find('.group-detail-item').hide();
                thisParent.find('.group-detail-' + newSelectedView).show();

                thisParent.find('.group-detail-action-item').removeClass('selected');
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
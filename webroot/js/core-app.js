/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

requirejs.config({
    baseUrl: "/",
    urlArgs: 'built_at=' + built_at,
    paths: {
        'jquery': "/assets/jquery/js/jquery-1.8.3.min",
        'jquery.xml2json': '/assets/jquery/js/jquery.xml2json',
        'jquery.ba-bbq': '/assets/jquery/js/jquery.ba-bbq.min',
        'jquery.timer': '/assets/jquery/js/jquery.timer',
        'jquery-ui': '/assets/jquery-ui/js/jquery-ui',
        'jquery.ui.touch-punch': '/assets/jquery/js/jquery.ui.touch-punch.min',
        'bootstrap': '/assets/bootstrap/js/bootstrap.min',
        'd3': '/assets/d3/js/d3',
        'nv.d3': '/assets/nvd3/js/nv.d3',
        'crossfilter': '/assets/crossfilter/js/crossfilter.min',
        'jsonpath': '/assets/jsonpath/js/jsonpath-0.8.0',
        'xdate': "/assets/xdate/js/xdate",
        'jquery.validate': "/assets/jquery/js/jquery.validate",
        'handlebars': "/assets/handlebars/handlebars-v1.3.0",
        'knockout': "/assets/knockout/knockout-3.0.0",
        'select2': "/assets/select2/js/select2.min",
        'jquery.event.drag': "/assets/slickgrid/js/jquery.event.drag-2.2",
        'jquery.json': "/assets/slickgrid/js/jquery.json-2.3.min",
        'jquery.droppick': "/assets/slickgrid/js/jquery.dropkick-1.0.0",
        'slick.core': "/assets/slickgrid/js/slick.core",
        'slick.grid': "/assets/slickgrid/js/slick.grid",
        'slick.dataview': "/assets/slickgrid/js/slick.dataview",
        'slick.enhancementpager': "/assets/slickgrid/js/slick.enhancementpager",
        'jquery.datetimepicker': "/assets/datetimepicker/js/jquery.datetimepicker",
        'moment': "/assets/moment/moment",
        'sprintf': "/assets/ip/sprintf",
        'ipv6': "/assets/ip/ipv6",
        'jsbn-combined': "/assets/ip/jsbn-combined",
        'contrail-common': "/js/contrail-common",
        'handlebars-utils': "/js/handlebars-utils",
        'select2-utils': "/js/select2-utils",
        'slickgrid-utils': "/js/slickgrid-utils",
        'contrail-elements': "/js/contrail-elements",
        'topology_api': "/js/topology_api",
        'chart-utils': "/js/chart-utils",
        'web-utils': "/js/web-utils",
        'contrail-layout': "/js/contrail-layout",
        'config_global': "/js/config_global",
        'protocol': "/js/protocol",
        'qe-utils': "/js/qe-utils",
        'nvd3-plugin': "/js/nvd3-plugin",
        'd3-utils': "/js/d3-utils",
        'analyzer-utils': "/js/analyzer-utils",
        'dashboard-utils': "/js/dashboard-utils",
        'jquery.multiselect': "/assets/jquery-ui/js/jquery.multiselect",
        'jquery.multiselect.filter': "/assets/jquery-ui/js/jquery.multiselect.filter",
        'jquery.steps.min': "/assets/jquery/js/jquery.steps.min",
        'jquery.tristate': "/assets/jquery/js/jquery.tristate",
        'joint':'/assets/joint/js/joint.clean.min',
        'geometry' : '/assets/joint/js/geometry',
        'vectorizer' : '/assets/joint/js/vectorizer',
        'joint.layout.DirectedGraph' : "/assets/joint/js/joint.layout.DirectedGraph",
        'joint.contrail' : "/js/joint.contrail",
        'lodash' : '/assets/joint/js/lodash',
        'jquery.panzoom': "/assets/jquery/js/jquery.panzoom.min",
        'jquery.ui.position': "/assets/jquery-contextMenu/js/jquery.ui.position",
        'jquery.contextMenu': "/assets/jquery-contextMenu/js/jquery.contextMenu",
        'slick.checkboxselectcolumn': "/assets/slickgrid/js/slick.checkboxselectcolumn",
        'slick.rowselectionmodel': "/assets/slickgrid/js/slick.rowselectionmodel",
        'underscore': 'assets/underscore/underscore-min',
        'backbone': 'assets/backbone/backbone-min',
        'knockback': 'assets/backbone/knockback.min',
        'validation': 'assets/backbone/backbone-validation-amd',
        'text': 'assets/requirejs/text',
        'core-utils': 'js/core-utils',
        'contrail-model': 'js/models/ContrailModel',
        'core-init': 'js/core-init'
    },
    shim: {
        'jquery.tristate': {
            deps: ['jquery', 'jquery-ui']
        },
        'jquery.multiselect': {
            deps: ['jquery', 'jquery-ui']
        },
        'jquery.multiselect.filter': {
            deps: ['jquery', 'jquery.multiselect']
        },
        'jquery.steps.min': {
            deps: ['jquery']
        },
        'bootstrap': {
            deps: ["jquery"]
        },
        'd3': {
            deps: ["jquery"]
        },
        'nv.d3': {
            deps: ['d3']
        },
        'crossfilter': {
            deps: ['d3']
        },
        'jquery.xml2json': {
            deps: ["jquery"]
        },
        "jquery.ba-bbq": {
            deps: ['jquery']
        },
        "jquery.timer": {
            deps: ['jquery']
        },
        "jquery-ui": {
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
            deps: ['jquery.event.drag']
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
            deps: ['jquery', 'slick.grid', 'slick.dataview']
        },
        'slick.dataview': {
            deps: ['jquery', 'slick.grid']
        },
        'contrail-elements': {
            deps: ['jquery-ui']
        },
        'chart-utils': {
            deps: ['jquery', 'd3']
        },
        'web-utils': {
            deps: ['jquery', 'knockout']
        },
        'qe-utils': {
            deps: ['jquery']
        },
        'handlebars-utils': {
            deps: ['jquery', 'handlebars']
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
        'select2-utils': {
            deps: ['jquery', 'knockout']
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
            deps: ['jquery', 'slick.grid', 'slick.dataview']
        },
        'slick.rowselectionmodel': {
            deps: ['jquery', 'slick.grid', 'slick.dataview']
        },
        'underscore': {
            deps: ['jquery']
        },
        'backbone': {
            deps: ['lodash', 'jquery'],
            exports: 'Backbone'
        },
        'joint': {
            deps: ['geometry', 'vectorizer', 'jquery', 'lodash', 'backbone'],
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
            deps: ['jquery', 'knockout', 'backbone']
        },
        'validation': {
            deps: ['jquery', 'backbone']
        },
        'lodash': {
            deps: ['jquery']
        },
        'joint.layout.DirectedGraph': {
            deps: ['joint']
        },
        'joint.contrail': {
            deps: ['joint', 'joint.layout.DirectedGraph']
        },
        'text': {
            deps: ['jquery']
        },
        'core-utils': {
            deps: ['jquery', 'underscore']
        },
        'contrail-model' :{
            deps: ['jquery', 'underscore', 'backbone', 'knockout', 'knockback']
        },
        'core-init': {
            deps: ['underscore', 'validation', 'core-utils', 'knockout']
        }
    },
    waitSeconds: 0
});

require(['jquery', 'knockout'], function ($, Knockout) {
    window.ko = Knockout;
    loadCommonTemplates();
    require(['jquery-ui', 'jquery.xml2json', 'jquery.ba-bbq', 'jquery.timer', 'jquery.ui.touch-punch',
        'bootstrap', 'd3', 'nv.d3', 'crossfilter', 'jsonpath', 'xdate', 'jquery.validate',
        'handlebars', 'select2', 'jquery.event.drag', 'jquery.json', 'jquery.droppick', 'slick.core',
        'slick.grid', 'slick.enhancementpager', 'jquery.datetimepicker', 'moment',
        'contrail-common', 'handlebars-utils', 'select2-utils', 'slickgrid-utils', 'contrail-elements',
        'topology_api', 'chart-utils', 'web-utils', 'contrail-layout', 'config_global', 'protocol',
        'qe-utils', 'nvd3-plugin', 'd3-utils', 'analyzer-utils', 'dashboard-utils', 'ipv6',
        'jquery.tristate', 'jquery.multiselect', 'jquery.multiselect.filter', 'jquery.steps.min', 'slick.dataview',
        'joint', 'joint.layout.DirectedGraph', 'jquery.panzoom', 'joint.contrail', 'jquery.ui.position',
        'jquery.contextMenu', 'slick.checkboxselectcolumn', 'slick.rowselectionmodel',
        'underscore', 'backbone', 'text', 'core-utils', 'core-init'], function (contrail) {});
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

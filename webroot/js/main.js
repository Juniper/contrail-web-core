requirejs.config({
    baseUrl:"/",
    urlArgs: 'built_at=' + built_at,
    paths: {
        'jquery'                    : "/assets/jquery/js/jquery-1.8.3.min",
        'jquery.xml2json'           : '/assets/jquery/js/jquery.xml2json',
        'jquery.ba-bbq':'/assets/jquery/js/jquery.ba-bbq.min',
        'jquery.timer'              : '/assets/jquery/js/jquery.timer',
        'jquery-ui'                 : '/assets/jquery-ui/js/jquery-ui',
        'jquery.ui.touch-punch' : '/assets/jquery/js/jquery.ui.touch-punch.min',
        'bootstrap'             : '/assets/bootstrap/js/bootstrap.min',
        'd3'                        : '/assets/d3/js/d3',
        'nv.d3'                     : '/assets/nvd3/js/nv.d3',
        'crossfilter'           : '/assets/crossfilter/js/crossfilter.min',
        'jsonpath'                  : '/assets/jsonpath/js/jsonpath-0.8.0',
        'xdate'                     : "/assets/xdate/js/xdate",
        'jquery.validate'           : "/assets/jquery/js/jquery.validate",
        'handlebars'                : "/assets/handlebars/handlebars-v1.3.0",
        'knockout'                  : "/assets/knockout/knockout-3.0.0",
        'select2'                   : "/assets/select2/js/select2.min",
        'jquery.event.drag'         : "/assets/slickgrid/js/jquery.event.drag-2.2",
        'jquery.json'               : "/assets/slickgrid/js/jquery.json-2.3.min",
        'jquery.droppick'           : "/assets/slickgrid/js/jquery.dropkick-1.0.0",
        'slick.core'                : "/assets/slickgrid/js/slick.core",
        'slick.grid'                : "/assets/slickgrid/js/slick.grid",
        'slick.dataview'            : "/assets/slickgrid/js/slick.dataview",
        'slick.enhancementpager'    : "/assets/slickgrid/js/slick.enhancementpager",
        'jquery.datetimepicker'     : "/assets/datetimepicker/js/jquery.datetimepicker",
        'moment'                    : "/assets/moment/moment",
        'sprintf'                   : "/assets/ip/sprintf",
        'ipv6'                      : "/assets/ip/ipv6",
        'jsbn-combined'             : "/assets/ip/jsbn-combined",
        'contrail-common'           : "/js/contrail-common",
        'handlebars-utils'          : "/js/handlebars-utils",
        'select2-utils'                   : "/js/select2-utils",
        'slickgrid-utils'           : "/js/slickgrid-utils",
        'contrail-elements'         : "/js/contrail-elements",
        'topology_api'              : "/js/topology_api",
        'chart-utils'               : "/js/chart-utils",
        'web-utils'                 : "/js/web-utils",
        'contrail-layout'           : "/js/contrail-layout",
        'config_global'             : "/js/config_global",
        'protocol'                  : "/js/protocol",
        'qe-utils'                  : "/js/qe-utils",
        'nvd3-plugin'               : "/js/nvd3-plugin",
        'd3-utils'                  : "/js/d3-utils",
        'analyzer-utils'            : "/js/analyzer-utils",
        'dashboard-utils'           : "/js/dashboard-utils",
        'jquery.multiselect'        : "/assets/jquery-ui/js/jquery.multiselect",
        'jquery.multiselect.filter' : "/assets/jquery-ui/js/jquery.multiselect.filter",
        'jquery.steps.min'          : "/assets/jquery/js/jquery.steps.min"
    },
    shim: {
        'jquery.multiselect' : {
            deps: ['jquery']
        },
        'jquery.multiselect.filter' : {
            deps: ['jquery']
        },
        'jquery.steps.min' : {
            deps: ['jquery']
        },
        'bootstrap' : {
            deps: ["jquery"]
        },
        'd3' : {
            deps: ["jquery"]
        },
        'nv.d3' : {
            deps: ['d3']
        },
        'crossfilter' : {
            deps: ['d3']
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
            deps:['jquery']
        },
        'slick.grid': {
            deps:['jquery.event.drag']
        },
        'contrail-common': {
            deps: ['jquery']
        },
        'contrail-layout': {
            deps:['jquery.ba-bbq','web-utils']
        },
        'slick.enhancementpager': {
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
        'qe-utils': {
            deps: ['jquery']
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
            deps: ['jquery','knockout']
        },
        'ipv6' : {
            deps: ['sprintf','jsbn-combined']
        }
    }
});
require(['knockout'],function(ko) {
    window.ko = ko;
});
require(['jquery'],function($) {
    loadCommonTemplates();
});

require(['jquery','jquery-ui','jquery.xml2json','jquery.ba-bbq','jquery.timer','jquery.ui.touch-punch',
        'bootstrap','d3','nv.d3','crossfilter','jsonpath','xdate','jquery.validate',
        'handlebars','knockout','select2','jquery.event.drag','jquery.json','jquery.droppick','slick.core',
        'slick.grid','slick.enhancementpager','jquery.datetimepicker','moment',
        'contrail-common','handlebars-utils','select2-utils','slickgrid-utils','contrail-elements',
        'topology_api','chart-utils','web-utils','contrail-layout','config_global','protocol',
        'qe-utils','nvd3-plugin','d3-utils','analyzer-utils','dashboard-utils','ipv6',
        'jquery.multiselect','jquery.multiselect.filter','jquery.steps.min','slick.dataview'],function(contrail) {
});

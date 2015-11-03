/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var initDepFiles = [
    'validation', 'handlebars-utils', 'contrail-common', 'slickgrid-utils', 'contrail-elements',
    'topology_api', 'chart-utils', 'qe-utils', 'nvd3-plugin', 'd3-utils', 'analyzer-utils', 'dashboard-utils',
    'joint.contrail', 'text', 'contrail-unified-1', 'contrail-unified-2', 'nvd3v181'
];

require(['jquery', 'knockout', 'bezier'], function ($, Knockout, Bezier) {
    window.ko = Knockout;
    window.Bezier = Bezier;

    if (document.location.pathname.indexOf('/vcenter') == 0) {
        $('head').append('<base href="/vcenter/" />');
    }

    require(initDepFiles, function(validation) {
        require(['core-utils', 'core-constants', 'core-formatters', 'core-cache', 'core-labels', 'core-messages', 'core-views-default-config', 'layout-handler',
                 'core-basedir/js/common/qe.utils',
                 'core-basedir/js/common/qe.model.config',
                 'core-basedir/js/common/qe.grid.config',
                 'core-basedir/js/common/qe.parsers',
                 'text!templates/core.common.tmpl'],
            function (CoreUtils, CoreConstants, CoreFormatters, Cache, CoreLabels, CoreMessages, CoreViewsDefaultConfig, LayoutHandler,
                      QEUtils, QEModelConfig, QEGridConfig, QEParsers, CoreCommonTmpls) {
                cowc = new CoreConstants();
                cowu = new CoreUtils();
                cowf = new CoreFormatters();
                cowl = new CoreLabels();
                cowm = new CoreMessages();
                covdc = new CoreViewsDefaultConfig();
                kbValidation = validation;
                cowch = new Cache();

                qewu = new QEUtils();
                qewmc = new QEModelConfig();
                qewgc = new QEGridConfig();
                qewp = new QEParsers();

                initBackboneValidation();
                initCustomKOBindings(Knockout);
                initDomEvents();
                layoutHandler = new LayoutHandler();
                $("body").append(CoreCommonTmpls);
                require(['contrail-layout'], function(){});
            });
    });
});


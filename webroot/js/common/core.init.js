/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var initDepFiles = [
    'validation', 'handlebars-utils', 'contrail-common', 'slickgrid-utils', 'contrail-elements', 'contrail-unified-1',
    'contrail-unified-2', 'analyzer-utils', 'dashboard-utils', 'joint.contrail', 'text', 'nvd3'
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
                 'core-basedir/js/common/chart.utils',
                 'text!templates/core.common.tmpl'],
            function (CoreUtils, CoreConstants, CoreFormatters, Cache, CoreLabels, CoreMessages, CoreViewsDefaultConfig, LayoutHandler,
                      QEUtils, QEModelConfig, QEGridConfig, QEParsers, ChartUtils, CoreCommonTmpls) {
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

                chUtils = new ChartUtils();

                initBackboneValidation();
                initCustomKOBindings(Knockout);
                initDomEvents();
                layoutHandler = new LayoutHandler();
                $("body").append(CoreCommonTmpls);
                require(['contrail-layout'], function(){});
            });
    });
});


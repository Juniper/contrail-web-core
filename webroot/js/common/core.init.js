/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

require([
        'core-utils',
        'core-constants',
        'core-formatters',
        'core-cache',
        'core-labels',
        'core-messages',
        'core-views-default-config',
        'layout-handler',
        'core-basedir/js/common/qe.utils',
        'core-basedir/js/common/qe.model.config',
        'core-basedir/js/common/qe.grid.config',
        'core-basedir/js/common/qe.parsers',
        'core-basedir/js/common/chart.utils',
        'core-basedir/js/common/core.alarms.utils',
        'core-basedir/js/common/core.alarms.parsers',
        'text!core-basedir/common/ui/templates/core.common.tmpl'
    ], function (CoreUtils, CoreConstants, CoreFormatters, Cache, CoreLabels, CoreMessages, CoreViewsDefaultConfig,
                 LayoutHandler, QEUtils, QEModelConfig, QEGridConfig, QEParsers, ChartUtils, CoreAlarmUtils, CoreAlarmParsers, CoreCommonTmpls) {
        cowc = new CoreConstants();
        cowu = new CoreUtils();
        cowf = new CoreFormatters();
        cowl = new CoreLabels();
        cowm = new CoreMessages();
        covdc = new CoreViewsDefaultConfig();
        cowch = new Cache();

        qewu = new QEUtils();
        qewmc = new QEModelConfig();
        qewgc = new QEGridConfig();
        qewp = new QEParsers();

        coreAlarmUtils = new CoreAlarmUtils();
        coreAlarmParsers = new CoreAlarmParsers();
        chUtils = new ChartUtils();

        initBackboneValidation();
        initCustomKOBindings(window.ko);
        initDomEvents();
        layoutHandler = new LayoutHandler();
        $("body").append(CoreCommonTmpls);

        require(['contrail-layout'], function () {
        });
    }
);


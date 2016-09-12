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
        'core-basedir/js/common/chart.utils',
        'core-basedir/js/common/graph.utils',
        'core-basedir/js/common/core.alarms.utils',
        'core-basedir/js/common/core.alarms.parsers',
        'text!core-basedir/common/ui/templates/core.common.tmpl'

    ], function (CoreUtils, CoreConstants, CoreFormatters, Cache, CoreLabels, CoreMessages, CoreViewsDefaultConfig,
                 LayoutHandler, ChartUtils, GraphUtils, CoreAlarmUtils, CoreAlarmParsers, CoreCommonTmpls) {
        cowc = new CoreConstants();
        cowu = new CoreUtils();
        cowf = new CoreFormatters();
        cowl = new CoreLabels();
        cowm = new CoreMessages();
        covdc = new CoreViewsDefaultConfig();
        cowch = new Cache();

        coreAlarmUtils = new CoreAlarmUtils();
        coreAlarmParsers = new CoreAlarmParsers();

        chUtils = new ChartUtils();
        grUtils = new GraphUtils();

        initBackboneValidation();
        initCustomKOBindings(window.ko);
        initDomEvents();
        layoutHandler = new LayoutHandler();
        $("body").append(CoreCommonTmpls);

        require(['contrail-layout'], function () {
        });
    }
);


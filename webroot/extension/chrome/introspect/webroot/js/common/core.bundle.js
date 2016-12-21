/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([
    'core-handlebars-utils',
    'core-utils',
    'core-hash-utils',
    'core-constants',
    'core-formatters',
    'core-cache',
    'core-labels',
    'core-messages',
    'core-views-default-config',
    'contrail-common',
    'core-contrail-form-elements',
    'text!core-basedir/common/ui/templates/core.common.tmpl',
    // 'core-alarm-utils',
    // 'core.app.utils',
    'contrail-remote-data-handler',
    'contrail-view',
    'contrail-model',
    'contrail-view-model',
    'contrail-list-model',
    'contrail-element',
    'lodash',
    'crossfilter',
    'backbone',
    'text',
    'knockout',
    'layout-handler',
    'menu-handler',
    'help-handler',
    'content-handler',
    'validation',
    //Dashboard

], function (CoreHandlebarsUtils, CoreUtils, CoreHashUtils, CoreConstants, CoreFormatters, Cache, CoreLabels,
             CoreMessages, CoreViewsDefaultConfig, Contrail, CoreContrailFormElements, CoreCommonTmpls) {
    cowc = CoreConstants;
    cowf = new CoreFormatters();
    cowl = new CoreLabels();
    cowm = new CoreMessages();
    covdc = new CoreViewsDefaultConfig();
    contrail = new Contrail();
    cowch = new Cache();
    webServerInfoDefObj.done(function () {
        require(['nonamd-libs'], function () {
            cowc.DROPDOWN_VALUE_SEPARATOR = getValueByJsonPath(globalObj,
                "webServerInfo;uiConfig;dropdown_value_separator",
                cowc.DROPDOWN_VALUE_SEPARATOR);
        });
    });
    $("body").append(CoreCommonTmpls);
});


/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    "text!core-basedir/reports/udd/ui/templates/udd.tmpl",
    "core-basedir/reports/udd/ui/js/UDDPageLoader",
    "qe-module",
    //Additional included files in the module
    "core-basedir/reports/udd/ui/js/common/udd.form.validation.config",
    "core-basedir/reports/udd/ui/js/common/udd.constants",
    "core-basedir/reports/udd/ui/js/models/ContentConfigModel",
    "core-basedir/reports/udd/ui/js/models/WidgetModel",
    "core-basedir/reports/udd/ui/js/models/WidgetsCollection",
    "core-basedir/reports/udd/ui/js/models/ContentConfigs/GridConfigModel",
    "core-basedir/reports/udd/ui/js/models/ContentConfigs/LineBarChartConfigModel",
    "core-basedir/reports/udd/ui/js/models/ContentConfigs/LineChartConfigModel",
    "core-basedir/reports/udd/ui/js/models/ContentConfigs/LogsConfigModel",
    "core-basedir/reports/udd/ui/js/models/dataSourceConfigs/QueryConfigModel",
    "core-basedir/reports/udd/ui/js/views/BaseContentConfigView",
    "core-basedir/reports/udd/ui/js/views/GridStackView",
    "core-basedir/reports/udd/ui/js/views/LogsView",
    "core-basedir/reports/udd/ui/js/views/UDDashboardView",
    "core-basedir/reports/udd/ui/js/views/WidgetView",
    "core-basedir/reports/udd/ui/js/views/ContentConfigs/GridConfigView",
    "core-basedir/reports/udd/ui/js/views/ContentConfigs/LineBarChartConfigView",
    "core-basedir/reports/udd/ui/js/views/ContentConfigs/LineChartConfigView",
    "core-basedir/reports/udd/ui/js/views/ContentConfigs/LogsConfigView",
    "core-basedir/reports/udd/ui/js/views/dataSourceConfigs/QueryConfigView",
], function (UDDTemplates, UDDashboardLoader) {
    $("body").append(UDDTemplates);
    window.UDDLoader = new UDDashboardLoader();
});

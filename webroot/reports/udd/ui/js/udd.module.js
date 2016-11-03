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
    "core-basedir/reports/udd/ui/js/models/contentConfigs/GridConfigModel",
    "core-basedir/reports/udd/ui/js/models/contentConfigs/LineBarChartConfigModel",
    "core-basedir/reports/udd/ui/js/models/contentConfigs/LineChartConfigModel",
    "core-basedir/reports/udd/ui/js/models/contentConfigs/LogsConfigModel",
    "core-basedir/reports/udd/ui/js/models/dataSourceConfigs/QueryConfigModel",
    "core-basedir/reports/udd/ui/js/views/BaseContentConfigView",
    "core-basedir/reports/udd/ui/js/views/GridStackView",
    "core-basedir/reports/udd/ui/js/views/LogsView",
    "core-basedir/reports/udd/ui/js/views/UDDashboardView",
    "core-basedir/reports/udd/ui/js/views/WidgetView",
    "core-basedir/reports/udd/ui/js/views/contentConfigs/GridConfigView",
    "core-basedir/reports/udd/ui/js/views/contentConfigs/LineBarChartConfigView",
    "core-basedir/reports/udd/ui/js/views/contentConfigs/LineChartConfigView",
    "core-basedir/reports/udd/ui/js/views/contentConfigs/LogsConfigView",
    "core-basedir/reports/udd/ui/js/views/dataSourceConfigs/QueryConfigView",
], function (UDDTemplates, UDDashboardLoader) {
    $("body").append(UDDTemplates);
    window.UDDLoader = new UDDashboardLoader();
});

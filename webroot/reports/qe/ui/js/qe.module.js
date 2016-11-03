/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    "text!core-basedir/reports/qe/ui/templates/qe.tmpl",
    "core-basedir/reports/qe/ui/js/QEPageLoader",
    //Additional included files in the module
    "core-basedir/reports/qe/ui/js/common/qe.utils",
    "core-basedir/reports/qe/ui/js/common/qe.parsers",
    "core-basedir/reports/qe/ui/js/common/qe.grid.config",
    "core-basedir/reports/qe/ui/js/common/qe.model.config",
    "core-basedir/reports/qe/ui/js/views/QueryEngineView",
    "core-basedir/reports/qe/ui/js/views/QueryQueueView",
    "core-basedir/reports/qe/ui/js/views/QueryTextView",
    "core-basedir/reports/qe/ui/js/views/ObjectLogsFormView",
    "core-basedir/reports/qe/ui/js/views/SystemLogsFormView",
    "core-basedir/reports/qe/ui/js/views/StatQueryFormView",
    "core-basedir/reports/qe/ui/js/models/ContrailListModelGroup",
    "core-basedir/reports/qe/ui/js/models/ObjectLogsFormModel",
    "core-basedir/reports/qe/ui/js/models/StatQueryFormModel",
    "core-basedir/reports/qe/ui/js/models/SystemLogsFormModel"
], function (QETemplates, QEPageLoader) {
    $("body").append(QETemplates);
    window.qePageLoader = new QEPageLoader();
});

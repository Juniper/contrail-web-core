/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

/**
 * during build time, all view/model file of qe will be
 * concatenated to this file. build config is located in the core repo webroot/build/
 */
define([
    "text!reports/qe/ui/templates/qe.tmpl",
    "core-basedir/reports/qe/ui/js/QEPageLoader"
], function (QETemplates, QEPageLoader) {
    $("body").append(QETemplates);
    window.qePageLoader = new QEPageLoader();
});

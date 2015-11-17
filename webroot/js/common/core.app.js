/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
var defaultBaseDir = (document.location.pathname.indexOf('/vcenter') == 0) ? "./../" : "./"
    coreBaseDir = defaultBaseDir, ctBaseDir = defaultBaseDir,
    smBaseDir = defaultBaseDir, strgBaseDir = defaultBaseDir,
    pkgBaseDir = defaultBaseDir;

requirejs.config({
    baseUrl    : coreBaseDir,
    urlArgs    : 'built_at=' + built_at,
    paths      : getCoreAppPaths(coreBaseDir),
    map        : coreAppMap,
    shim       : coreAppShim,
    waitSeconds: 0
});

require(['core-init'], function () {});

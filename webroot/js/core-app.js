/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
var coreBaseDir = ".",
    ctBaseDir = ".",
    smBaseDir = ".",
    sBaseDir = ".",
    pkgBaseDir = ".";

requirejs.config({
    baseUrl    : coreBaseDir,
    urlArgs    : 'built_at=' + built_at,
    paths      : getCoreAppPaths(coreBaseDir),
    map        : coreAppMap,
    shim       : coreAppShim,
    waitSeconds: 0
});

require(['core-init'], function () {});

/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

requirejs.config({
    baseUrl    : "/",
    urlArgs    : 'built_at=' + built_at,
    paths      : coreAppPaths,
    map        : coreAppMap,
    shim       : coreAppShim,
    waitSeconds: 0
});

require(['core-init'], function () {
});

/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
var defaultBaseDir = (document.location.pathname.indexOf('/vcenter') == 0) ? "./../" : ".";

/**
 * Set the global env with the data-env attr from the core.app script tag.
 * This env will determine the path requirejs will fetch and build the cache.
 * for 'prod' env, files under built dir will be used; else, original source as is(for eg. dev env).
 */
globalObj['env'] = document.querySelector('script[data-main="/js/common/core.app"][data-env]').getAttribute('data-env');
if (globalObj['env'] == 'prod') {
    defaultBaseDir = ''; 
    globalObj['buildBaseDir'] = 'built';
} else {
    globalObj['buildBaseDir'] = '';
}

var coreBaseDir = defaultBaseDir, ctBaseDir = defaultBaseDir,
    smBaseDir = defaultBaseDir, strgBaseDir = defaultBaseDir,
    pkgBaseDir = defaultBaseDir;

requirejs.config({
    baseUrl: coreBaseDir,
    urlArgs: 'built_at=' + built_at,
    paths: getCoreAppPaths(coreBaseDir, globalObj['buildBaseDir']),
    map: coreAppMap,
    shim: coreAppShim,
    waitSeconds: 0
});

var initDepFiles = [
    'validation', 'contrail-unified-1', 'contrail-unified-2', 'contrail-unified-3',
    'joint.contrail', 'text'
];

require(['jquery', 'knockout', 'bezier'], function ($, Knockout, Bezier) {
    window.ko = Knockout;
    window.Bezier = Bezier;

    if (document.location.pathname.indexOf('/vcenter') == 0) {
        $('head').append('<base href="/vcenter/" />');
    }

    require(initDepFiles, function (validation) {
        kbValidation = validation;
        require(['core-init'], function () {
        });
    });
});

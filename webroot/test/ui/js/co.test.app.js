/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var coreBaseDir = "/base/contrail-web-core/webroot",
    featurePkg = "testLibApi";

require([
    coreBaseDir + '/js/core.app.utils.js',
    coreBaseDir + '/test/ui/js/co.test.app.utils.js'
], function () {
    globalObj['env'] = "test";


    requirejs.config({
        baseUrl: coreBaseDir,
        paths: getCoreAppAndCoreTestAppPaths(coreBaseDir),
        map: coreAppMap,
        shim: getCoreAppAndCoreTestAppShims(),
        waitSeconds: 0
    });

    require(['co-test-init'], function () {
        setFeaturePkgAndInit(featurePkg);
    });


    function getCoreAppAndCoreTestAppPaths(coreBaseDir) {
        var coreTestAppPathObj = {};
        var coreAppPaths = getCoreAppPaths(coreBaseDir);
        var coreTestAppPaths = getCoreTestAppPaths(coreBaseDir);

        for (var key in coreAppPaths) {
            if (coreAppPaths.hasOwnProperty(key)) {
                var value = coreAppPaths[key];
                coreTestAppPathObj[key] = value;
            }
        }

        for (var key in coreTestAppPaths) {
            if (coreTestAppPaths.hasOwnProperty(key)) {
                var value = coreTestAppPaths[key];
                coreTestAppPathObj[key] = value;
            }
        }

        return coreTestAppPathObj;
    };

    function getCoreAppAndCoreTestAppShims() {

        var coreTestAppShims = {};

        for (var key in coreAppShim) {
            if (coreAppShim.hasOwnProperty(key)) {
                var value = coreAppShim[key];
                coreTestAppShims[key] = value;
            }
        }

        for (var key in coreTestAppShim) {
            if (coreTestAppShim.hasOwnProperty(key)) {
                var value = coreTestAppShim[key];
                coreTestAppShims[key] = value;
            }
        }

        return coreTestAppShims;
    };

});

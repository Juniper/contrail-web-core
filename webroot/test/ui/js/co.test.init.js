/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var cowc, cowu, cowf, cowl, cowch, cowm, cotc, covdc;

var allTestFiles = [], nmTestKarma = window.__karma__;

for (var file in nmTestKarma.files) {
    if (/\.test\.js$/.test(file)) {
        allTestFiles.push(file);
    }
}

var depArray = [
    'jquery', 'underscore', 'validation', 'core-constants', 'core-utils',
    'core-formatters', 'core-messages', 'core-views-default-config', 'core-labels', 'knockout', 'core-cache', 'contrail-common',

    'text!/base/contrail-web-core/webroot/templates/core.common.tmpl',

    'co-test-utils', 'co-test-constants',

    'layout-handler', 'web-utils', 'handlebars-utils', 'slickgrid-utils', 'contrail-elements',
    'topology_api', 'chart-utils', 'qe-utils', 'nvd3-plugin', 'd3-utils', 'analyzer-utils',
    'dashboard-utils', 'joint.contrail', 'text', 'contrail-unified-1', 'contrail-unified-2', 'nvd3v181'

];

var testAppConfig = {
    featurePkg: '',
    featuresDisabled: '',
    webServerInfo: ''
}

function getTestAppConfig(featureObj) {
    requirejs(['co-test-mockdata'], function (CoreTestMockData) {
        testAppConfig.featurePkg = JSON.stringify(CoreTestMockData[featureObj.featurePkg]);
        testAppConfig.featuresDisabled = JSON.stringify(CoreTestMockData[featureObj.featuresDisabled]);
        testAppConfig.webServerInfo = JSON.stringify(CoreTestMockData[featureObj.webServerInfo]);
    });
    return testAppConfig;
}

function setFeaturePkgAndInit(featurePkg) {
    var featurePkgObj = {};
    switch (featurePkg) {
        case 'webController':
            featurePkgObj.featurePkg = 'webControllerMockData';
            featurePkgObj.featuresDisabled = 'disabledFeatureMockData';
            featurePkgObj.webServerInfo = 'ctWebServerInfoMockData';
            break;

        case 'webStorage':
            featurePkgObj.featurePkg = 'webStorageMockData';
            featurePkgObj.featuresDisabled = 'disabledFeatureMockData';
            featurePkgObj.webServerInfo = 'sWebServerInfoMockData';
            break;

        case 'serverManager':
            featurePkgObj.featurePkg = 'serverManagerMockData';
            featurePkgObj.featuresDisabled = 'disabledFeatureMockData';
            featurePkgObj.webServerInfo = 'smWebServerInfoMockData';
            break;

        case 'testLibApi':
            return testLibApiAppInit({});

    }

    testAppInit(getTestAppConfig(featurePkgObj));
}

function testAppInit(testAppConfig) {

    require(['jquery', 'knockout', 'bezier'], function ($, Knockout, Bezier) {
        window.ko = Knockout;
        window.Bezier = Bezier;

        if (document.location.pathname.indexOf('/vcenter') == 0) {
            $('head').append('<base href="/vcenter/" />');
        }

        require(depArray, function ($, _, validation, CoreConstants, CoreUtils, CoreFormatters, CoreMessages, CoreViewsDefaultConfig, CoreLabels, Knockout, Cache,
                                    contrailCommon, CoreCommonTmpl, CoreTestUtils, CoreTestConstants, LayoutHandler) {
            cowc = new CoreConstants();
            cowu = new CoreUtils();
            cowf = new CoreFormatters();
            cowm = new CoreMessages();
            covdc = new CoreViewsDefaultConfig();
            cowl = new CoreLabels();
            cowch = new Cache();
            cotc = CoreTestConstants;
            kbValidation = validation;
            initBackboneValidation(_);
            initCustomKOBindings(Knockout);
            initDomEvents();
            layoutHandler = new LayoutHandler();

            $("body").addClass('navbar-fixed');
            $("body").append(CoreTestUtils.getPageHeaderHTML());
            $("body").append(CoreTestUtils.getSidebarHTML());
            $("body").append(CoreCommonTmpl);

            var cssList = CoreTestUtils.getCSSList();

            for (var i = 0; i < cssList.length; i++) {
                $("body").append(cssList[i]);
            }

            requirejs(['text!menu.xml'], function (menuXML) {
                    var fakeServer = sinon.fakeServer.create();
                    fakeServer.autoRespond = true;
                    fakeServer.respondWith("GET", CoreTestUtils.getRegExForUrl('/api/admin/webconfig/featurePkg/webController'), [200, {"Content-Type": "application/json"}, testAppConfig.featurePkg]);
                    fakeServer.respondWith("GET", CoreTestUtils.getRegExForUrl('/api/admin/webconfig/features/disabled'), [200, {"Content-Type": "application/json"}, testAppConfig.featuresDisabled]);
                    fakeServer.respondWith("GET", CoreTestUtils.getRegExForUrl('/api/service/networking/web-server-info'), [200, {"Content-Type": "application/json"}, testAppConfig.webServerInfo]);
                    fakeServer.respondWith("GET", CoreTestUtils.getRegExForUrl('/menu.xml'), [200, {"Content-Type": "application/xml"}, menuXML]);

                    requirejs(['contrail-layout'], function () {
                        //TODO: Timeout is currently required to ensure menu is loaed i.e feature app is initialized

                        var logAllTestFiles = "Test files: ";
                        for (var i = 0; i < allTestFiles.length; i++) {
                            logAllTestFiles += "\n";
                            logAllTestFiles +=  i + 1 + ") " + allTestFiles[i];
                        }
                        console.log(logAllTestFiles);

                        var testFilesIndex = 0,
                            loadRunner = true,
                            testFile = allTestFiles[testFilesIndex],
                            defObj = $.Deferred();

                        var singleFileLoad = function(testFile, defObj, loadRunner) {

                            var startKarmaCB = function(defObj, loadRunner) {
                                console.log("Loaded test file: ", testFile);
                                return window.__karma__.start(defObj, loadRunner);
                            };

                            require([testFile], function () {
                                requirejs.config({
                                    deps: [testFile],
                                    callback: startKarmaCB(defObj, loadRunner)
                                });
                            });

                        }

                        var loadNextFileOrStartCoverage = function() {
                            requirejs.undef(testFile);
                            console.log("Unloaded test file: ", allTestFiles[testFilesIndex]);
                            window.QUnit.config.current = {semaphore : 1};
                            window.QUnit.config.blocking = true;
                            //window.QUnit.stop();
                            console.log("Test finished");
                            window.QUnit.init();
                            testFilesIndex += 1;
                            loadRunner = false;
                            if (testFilesIndex < allTestFiles.length) {
                                var defObj = $.Deferred();
                                defObj.done(loadNextFileOrStartCoverage);
                                singleFileLoad(allTestFiles[testFilesIndex], defObj, loadRunner);
                            }
                            else if (testFilesIndex == allTestFiles.length) {
                                console.log("Completed; Starting Coverage: ")
                                window.__karma__.complete({
                                    coverage: window.__coverage__
                                });
                            }
                        };

                        defObj.done(loadNextFileOrStartCoverage);
                        singleFileLoad(testFile, defObj, loadRunner);

                    });
            });
        });
    });
}

function testLibApiAppInit(testAppConfig) {

    require(['jquery', 'knockout', 'bezier'], function ($, Knockout, Bezier) {
        window.ko = Knockout;
        window.Bezier = Bezier;

        if (document.location.pathname.indexOf('/vcenter') == 0) {
            $('head').append('<base href="/vcenter/" />');
        }

        require(depArray, function ($, _, validation, CoreConstants, CoreUtils, CoreFormatters, CoreMessages, CoreLabels, Knockout, Cache,
                                    contrailCommon, CoreCommonTmpl, CoreTestUtils, CoreTestConstants, LayoutHandler) {
            cowc = new CoreConstants();
            cowu = new CoreUtils();
            cowf = new CoreFormatters();
            cowm = new CoreMessages();
            cowl = new CoreLabels();
            cowch = new Cache();
            cotc = CoreTestConstants;

            $("body").addClass('navbar-fixed');
            $("body").append(CoreTestUtils.getPageHeaderHTML());
            $("body").append(CoreTestUtils.getSidebarHTML());
            $("body").append(CoreCommonTmpl);

            var cssList = CoreTestUtils.getCSSList();

            for (var i = 0; i < cssList.length; i++) {
                $("body").append(cssList[i]);
            }
            require(allTestFiles, function () {
                requirejs.config({
                    deps: allTestFiles,
                    callback: window.__karma__.start
                });
            });
        });
    });

}
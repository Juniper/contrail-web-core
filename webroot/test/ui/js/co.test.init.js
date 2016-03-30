/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var cowc, cowu, cowf, cowl, cowch, cowm, cotu, cotc, covdc;

var allTestFiles = [], windowKarma = window.__karma__;

for (var file in windowKarma.files) {
    if (/\.test\.js$/.test(file)) {
        allTestFiles.push(file);
    }
}

var depArray = [
    'jquery', 'underscore', 'validation', 'core-constants', 'core-utils',
    'core-formatters', 'core-messages', 'core-views-default-config', 'core-labels', 'knockout', 'core-cache',

    'text!/base/contrail-web-core/webroot/templates/core.common.tmpl',

    'core-basedir/js/common/qe.utils',
    'core-basedir/js/common/qe.model.config',
    'core-basedir/js/common/qe.grid.config',
    'core-basedir/js/common/qe.parsers',
    'core-basedir/js/common/chart.utils',

    'co-test-utils', 'co-test-constants',

    'layout-handler', 'joint.contrail', 'text', 'contrail-unified-1', 'contrail-unified-2', 'contrail-unified-3',

];

var testAppConfig = {
    featurePkg: '',
    featuresDisabled: '',
    webServerInfo: ''
}

function setFeaturePkgAndInit(featurePkg, coreTestMockData) {
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
    testAppConfig.featurePkg = JSON.stringify(coreTestMockData[featurePkgObj.featurePkg]);
    testAppConfig.featuresDisabled = JSON.stringify(coreTestMockData[featurePkgObj.featuresDisabled]);
    testAppConfig.webServerInfo = JSON.stringify(coreTestMockData[featurePkgObj.webServerInfo]);

    testAppInit(testAppConfig);
}

function testAppInit(testAppConfig) {

    require(['jquery', 'knockout', 'bezier'], function ($, Knockout, Bezier) {
        window.ko = Knockout;
        window.Bezier = Bezier;

        if (document.location.pathname.indexOf('/vcenter') == 0) {
            $('head').append('<base href="/vcenter/" />');
        }

        //fix issue in Chrome for jointJS graphs.
        SVGElement.prototype.getTransformToElement = SVGElement.prototype.getTransformToElement || function(toElement) {
                return toElement.getScreenCTM().inverse().multiply(this.getScreenCTM());
            };

        require(depArray, function ($, _, validation, CoreConstants, CoreUtils, CoreFormatters, CoreMessages,
                                    CoreViewsDefaultConfig, CoreLabels, Knockout, Cache, CoreCommonTmpl,
                                    QEUtils, QEModelConfig, QEGridConfig, QEParsers, ChartUtils,
                                    CoreTestUtils, CoreTestConstants, LayoutHandler) {
            cowc = new CoreConstants();
            cowu = new CoreUtils();
            cowf = new CoreFormatters();
            cowm = new CoreMessages();
            covdc = new CoreViewsDefaultConfig();
            cowl = new CoreLabels();
            kbValidation = validation;
            cowch = new Cache();

            qewu = new QEUtils();
            qewmc = new QEModelConfig();
            qewgc = new QEGridConfig();
            qewp = new QEParsers();

            chUtils = new ChartUtils();

            cotu = CoreTestUtils;
            cotc = CoreTestConstants;

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
                    fakeServer.respondWith("GET", cotu.getRegExForUrl('/api/admin/webconfig/featurePkg/webController'),
                        [200, {"Content-Type": "application/json"}, testAppConfig.featurePkg]);
                    fakeServer.respondWith("GET", cotu.getRegExForUrl('/api/admin/webconfig/features/disabled'),
                        [200, {"Content-Type": "application/json"}, testAppConfig.featuresDisabled]);
                    fakeServer.respondWith("GET", cotu.getRegExForUrl('/api/service/networking/web-server-info'),
                        [200, {"Content-Type": "application/json"}, testAppConfig.webServerInfo]);
                    fakeServer.respondWith("GET", cotu.getRegExForUrl('/menu.xml'),
                        [200, {"Content-Type": "application/xml"}, menuXML]);

                    requirejs(['contrail-layout'], function () {
                        //TODO: Timeout is currently required to ensure menu is loaed i.e feature app is initialized

                        var logAllTestFiles = "Test files: ";
                        for (var i = 0; i < allTestFiles.length; i++) {
                            logAllTestFiles += "\n";
                            logAllTestFiles +=  i + 1 + ") " + allTestFiles[i];
                        }
                        console.log(logAllTestFiles);

                        var testFilesIndex = 0,
                            loadTestRunner = true,
                            testFile = allTestFiles[testFilesIndex],
                            defObj = $.Deferred();

                        function loadSingleFileAndStartKarma(testFile, defObj, loadTestRunner) {
                            var startKarmaCB = function (defObj, loadTestRunner) {
                                console.log("Loaded test file: " + testFile.split('/').pop());
                                return window.__karma__.start(defObj, loadTestRunner);
                            };
                            //Clear Cookies if any exist
                            if (document.cookie != '') {
                                var cookies = document.cookie.split(";");
                                for (var i = 0; i < cookies.length; i++){
                                    var cookie =  cookies[i].split("=");
                                    document.cookie = cookie[0] + "=;expires=Tue, 02 Dec 1890 00:00:01 UTC;";
                                }
                            }

                            //clear the core cache
                            cowch.reset();

                            require([testFile], function () {
                                requirejs.config({
                                    deps: [testFile],
                                    callback: startKarmaCB(defObj, loadTestRunner)
                                });
                            });

                        }

                        function loadNextFileOrStartCoverage() {
                            requirejs.undef(allTestFiles[testFilesIndex]);
                            console.log("Execution complete. Unloaded test file: " + allTestFiles[testFilesIndex].split('/').pop());
                            console.log("----------------------------------------------------------------------------");
                            window.QUnit.config.current = {semaphore: 1};
                            window.QUnit.config.blocking = true;
                            //window.QUnit.stop();
                            testFilesIndex += 1;
                            loadTestRunner = false;
                            if (testFilesIndex < allTestFiles.length) {
                                //console.log("Initializing QUnit and proceeding to next test.");
                                window.QUnit.init();
                                var defObj = $.Deferred();
                                defObj.done(loadNextFileOrStartCoverage);
                                loadSingleFileAndStartKarma(allTestFiles[testFilesIndex], defObj, loadTestRunner);
                            }
                            else if (testFilesIndex == allTestFiles.length) {
                                console.log("Completed; Starting Coverage.")
                                window.__karma__.complete({
                                    coverage: window.__coverage__
                                });
                            }
                        };

                        defObj.done(loadNextFileOrStartCoverage);

                        loadSingleFileAndStartKarma(testFile, defObj, loadTestRunner);

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

        require(depArray, function ($, _, validation, CoreConstants, CoreUtils, CoreFormatters, CoreMessages,
                                    CoreViewsDefaultConfig, CoreLabels, Knockout, Cache, CoreCommonTmpl,
                                    QEUtils, QEModelConfig, QEGridConfig, QEParsers, ChartUtils,
                                    CoreTestUtils, CoreTestConstants, LayoutHandler) {
            cowc = new CoreConstants();
            cowu = new CoreUtils();
            cowf = new CoreFormatters();
            cowm = new CoreMessages();
            covdc = new CoreViewsDefaultConfig();
            cowl = new CoreLabels();
            kbValidation = validation;
            cowch = new Cache();

            qewu = new QEUtils();
            qewmc = new QEModelConfig();
            qewgc = new QEGridConfig();
            qewp = new QEParsers();

            chUtils = new ChartUtils();

            cotu = CoreTestUtils;
            cotc = CoreTestConstants;

            $("body").addClass('navbar-fixed');
            $("body").append(cotu.getPageHeaderHTML());
            $("body").append(cotu.getSidebarHTML());
            $("body").append(CoreCommonTmpl);

            var cssList = cotu.getCSSList();

            for (var i = 0; i < cssList.length; i++) {
                $("body").append(cssList[i]);
            }
            require([allTestFiles[0]], function () {
                requirejs.config({
                    deps: [allTestFiles[0]],
                    callback: window.__karma__.start($.Deferred(), true)
                });
            });
        });
    });

}

/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var cowc, cowu, cowf, cowl, cowch, cowm, cotc;

var allTestFiles = [], nmTestKarma = window.__karma__;

for (var file in nmTestKarma.files) {
    if (/\.test\.js$/.test(file)) {
        allTestFiles.push(file);
    }
}

var depArray = [
    'jquery', 'underscore', 'validation', 'core-constants', 'core-utils',
    'core-formatters', 'core-messages', 'core-labels', 'knockout', 'core-cache', 'contrail-common',

    'text!/base/contrail-web-core/webroot/templates/core.common.tmpl',

    'co-test-utils', 'co-test-constants',

    'layout-handler', 'web-utils', 'handlebars-utils', 'slickgrid-utils', 'contrail-elements',
    'topology_api', 'chart-utils', 'qe-utils', 'nvd3-plugin', 'd3-utils', 'analyzer-utils',
    'dashboard-utils', 'joint.contrail', 'text', 'contrail-all-8', 'contrail-all-9',

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
            featurePkgObj.featurePkg = 'webControllerMockData';
            featurePkgObj.featuresDisabled = 'disabledFeatureMockData';
            featurePkgObj.webServerInfo = 'sWebServerInfoMockData';
            break;

        case 'serverManager':
            featurePkgObj.featurePkg = 'webControllerMockData';
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

        require(depArray, function ($, _, validation, CoreConstants, CoreUtils, CoreFormatters, CoreMessages, CoreLabels, Knockout, Cache,
                                    contrailCommon, CoreCommonTmpl, CoreTestUtils, CoreTestConstants, LayoutHandler) {
            cowc = new CoreConstants();
            cowu = new CoreUtils();
            cowf = new CoreFormatters();
            cowm = new CoreMessages();
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
                        require(allTestFiles, function () {
                            requirejs.config({
                                deps: allTestFiles,
                                callback: window.__karma__.start
                            });
                        });
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
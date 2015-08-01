/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var cowc, cowu, cowf, cowch, cotc;

var allTestFiles = [], nmTestKarma = window.__karma__;

for (var file in nmTestKarma.files) {
    if (/Test\.js$/.test(file)) {
        allTestFiles.push(file);
    }
}

var depArray = [
    'jquery', 'underscore', 'validation', 'core-constants', 'core-utils',
    'core-formatters', 'knockout', 'core-cache', 'contrail-common',

    'text!/base/contrail-web-core/webroot/templates/core.common.tmpl',
    'co-test-utils', 'layout-handler',

    'co-test-constants',

    'web-utils', 'handlebars-utils', 'slickgrid-utils', 'contrail-elements',
    'topology_api', 'chart-utils', 'qe-utils', 'nvd3-plugin', 'd3-utils', 'analyzer-utils',
    'dashboard-utils', 'joint.contrail', 'text', 'contrail-all-8', 'contrail-all-9',

];

require(['jquery', 'knockout', 'bezier'], function ($, Knockout, Bezier) {
    window.ko = Knockout;
    window.Bezier = Bezier;

    if (document.location.pathname.indexOf('/vcenter') == 0) {
        $('head').append('<base href="/vcenter/" />');
    }

    require(depArray, function ($, _, validation, CoreConstants, CoreUtils, CoreFormatters, Knockout, Cache, contrailCommon, CoreCommonTmpl, CoreTestUtils, LayoutHandler, CoreTestConstants) {
        cowc = new CoreConstants();
        cowu = new CoreUtils();
        cowf = new CoreFormatters();
        cowch = new Cache();
        cotc = new CoreTestConstants();
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
            requirejs(['co-test-mockdata', 'co-test-utils'], function (CoreSlickGridMockData, TestUtils) {
                globalObj['coTestUtils'] = TestUtils;
                var fakeServer = sinon.fakeServer.create();
                fakeServer.autoRespond = true;
                fakeServer.respondWith("GET", TestUtils.getRegExForUrl('/api/admin/webconfig/featurePkg/webController'), [200, {"Content-Type": "application/json"}, JSON.stringify(CoreSlickGridMockData.webControllerMockData)]);
                fakeServer.respondWith("GET", TestUtils.getRegExForUrl('/api/admin/webconfig/features/disabled'), [200, {"Content-Type": "application/json"}, JSON.stringify(CoreSlickGridMockData.disabledFeatureMockData)]);
                fakeServer.respondWith("GET", TestUtils.getRegExForUrl('/api/service/networking/web-server-info'), [200, {"Content-Type": "application/json"}, JSON.stringify(CoreSlickGridMockData.ctWebServerInfoMockData)]);
                fakeServer.respondWith("GET", TestUtils.getRegExForUrl('/menu.xml'), [200, {"Content-Type": "application/xml"}, menuXML]);

                //fakeServer.autoRespondAfter = 6000;

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
});
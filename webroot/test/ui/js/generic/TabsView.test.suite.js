/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'co-test-utils',
    'co-test-messages',
    'co-test-constants',
    'co-test-unit'
], function (_, cotu, cotm, cotc, CUnit) {

    var testSuiteClass = function (viewObj, suiteConfig){

        var viewConfig = cotu.getViewConfigObj(viewObj),
            el = viewObj.el,
            tabs = viewConfig.tabs,
            tabsTemplate = contrail.getTemplate4Id(cowc.TMPL_TABS_VIEW);


        module(cotu.formatTestModuleMessage(cotm.TEST_TABSVIEW, el.id));

        var tabsViewTestSuite = CUnit.createTestSuite('TabsViewTestSuite');

        /**
         * Tabs basic group test cases
         */
        var basicTestGroup = tabsViewTestSuite.createTestGroup('basic');

        /**
         * Test tab titles.
         */
        basicTestGroup.registerTest(CUnit.test(cotm.TABSVIEW_TAB_TITLE, function () {
            expect(tabs.length);
            _.each(tabs, function(tab) {
                equal($(el).find('#' + tab.elementId + '-tab-link').text().trim(), tab.title,
                    "Tab title should be equal to the title set");
            });
        }, cotc.SEVERITY_LOW));

        /**
         * Load all the tabs
         */
        //basicTestGroup.registerTest(CUnit.test(cotm.TABSVIEW_TAB_ACTIVATE, function () {
        //    expect(tabs.length);
        //    _.each(tabs, function(tab) {
        //
        //    });
        //}, cotc.SEVERITY_LOW));


        tabsViewTestSuite.run(suiteConfig.groups, suiteConfig.severity);

    };

    return testSuiteClass;
});
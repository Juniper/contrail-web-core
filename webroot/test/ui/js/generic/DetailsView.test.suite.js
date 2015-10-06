/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'jquery',
    'underscore',
    'co-test-utils',
    'co-test-messages',
    'co-test-constants',
    'co-test-unit'
], function ($, _, cotu, cotm, cotc, CUnit) {

    var testSuiteClass = function (viewObj, suiteConfig){
        var viewConfig = cotu.getViewConfigObj(viewObj),
            el = viewObj.el,
            data = viewConfig.data,
            app = viewConfig.app,
            templateConfig = viewConfig.templateConfig,
            detailsTemplate = cowu.generateDetailTemplate(templateConfig, app),
            requestState = cowu.getRequestState4Model(suiteConfig.model),
            mockData = suiteConfig.mockData;

        module(cotu.formatTestModuleMessage(cotm.TEST_DETAILSVIEW, el.id));

        var detailsViewTestSuite = CUnit.createTestSuite('DetailsViewTest');

        /**
         * Basic test group
         */
        var basicTestGroup = detailsViewTestSuite.createTestGroup('basic');

        //basicTestGroup.registerTest(CUnit.test(cotm.DETAILSVIEW_TMPL_HTML, function () {
        //    expect(1);
        //    var domHtml = $(el).html(),
        //        templateHtml = detailsTemplate({data: data, requestState: requestState});
        //    equal(domHtml, templateHtml, "HTML should match the generated one");
        //}, cotc.SEVERITY_LOW));

        basicTestGroup.registerTest(CUnit.test(cotm.DETAILSVIEW_BASIC_ADVANCED_TOGGLE, function() {
            if (requestState !== cowc.DATA_REQUEST_STATE_ERROR) {
                //check advanced view icon
                equal($(el).find('.detail-foundation-container .detail-foundation-action-item :last').attr('data-view'),
                    "advanced-json", "advanced view icon data-view check");

                //trigger click on advanced view
                $(el).find('.detail-foundation-container .detail-foundation-action-item :last i').trigger("click");

                equal($(el).find('.detail-foundation-container .detail-foundation-content-advanced').html(),
                    contrail.formatJSON2HTML(mockData, 2),
                    "advanced view HTML should equal to the generated JSON HTML content");

                //check basic view icon
                equal($(el).find('.detail-foundation-container .detail-foundation-action-item :first').attr('data-view'),
                    "basic-list", "basic view icon data-view check");

                //trigger click on basic view
                $(el).find('.detail-foundation-container .detail-foundation-action-item :first i').trigger("click");

            }
        }, cotc.SEVERITY_LOW));

        /**
         * TODO Add test case for text formatter
         * type of formatter and key can be accessed from viewConfig
         * the dom should have id set to extract the values. details template creation needs update.
         */

        detailsViewTestSuite.run(suiteConfig.groups, suiteConfig.severity);

    };

    return testSuiteClass;
});
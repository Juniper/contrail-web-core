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
            modelMap = viewObj.modelMap,
            el = viewObj.el,
            data = viewConfig.data,
            ajaxConfig = viewConfig.ajaxConfig,
            dataParser = viewConfig.dataParser,
            app = viewConfig.app,
            templateConfig = viewConfig.templateConfig,
            detailsTemplate = cowu.generateDetailTemplate(templateConfig, app);

        if (modelMap != null && modelMap[viewConfig.modelKey] != null) {
            var contrailViewModel = modelMap[viewConfig.modelKey],
                requestState;

            if (!contrailViewModel.isRequestInProgress()) {
                requestState = cowu.getRequestState4Model(contrailViewModel);
                data = contrailViewModel.attributes;
            } else {
                contrailViewModel.onAllRequestsComplete.subscribe(function () {
                    requestState = cowu.getRequestState4Model(contrailViewModel);
                    data = contrailViewModel.attributes;
                });
            }
        } else {
            contrail.ajaxHandler(ajaxConfig, null, function (response) {
                var data = dataParser(response),
                    requestState = cowc.DATA_REQUEST_STATE_SUCCESS_NOT_EMPTY;

                if ($.isEmptyObject(data)) {
                    requestState = cowc.DATA_REQUEST_STATE_SUCCESS_EMPTY;
                }
            }, function (error) {
                data = [];
                requestState = cowc.DATA_REQUEST_STATE_ERROR;
            });
        }

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
                    contrail.formatJSON2HTML(data, 2),
                    "advanced view HTML should equal to the generated JSON HTML content");

                //check basic view icon
                equal($(el).find('.detail-foundation-container .detail-foundation-action-item :first').attr('data-view'),
                    "basic-list", "basic view icon data-view check");

                //trigger click on basic view
                $(el).find('.detail-foundation-container .detail-foundation-action-item :first i').trigger("click");

            }
        }, cotc.SEVERITY_LOW));

        detailsViewTestSuite.run(suiteConfig.groups, suiteConfig.severity);

    };

    return testSuiteClass;
});
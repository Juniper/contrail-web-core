/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'jquery',
    'underscore',
    'co-test-utils',
    'co-test-messages',
    'co-test-constants',
    'co-test-runner'
], function ($, _, cotu, cotm, cotc, cotr) {

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

        var detailsViewTestSuite = cotr.createTestSuite('DetailsViewTest');

        /**
         * Basic test group
         */
        var basicTestGroup = detailsViewTestSuite.createTestGroup('basic');

        //basicTestGroup.registerTest(cotr.test(cotm.DETAILSVIEW_TMPL_HTML, function () {
        //    expect(1);
        //    var domHtml = $(el).html(),
        //        templateHtml = detailsTemplate({data: data, requestState: requestState});
        //    equal(domHtml, templateHtml, "HTML should match the generated one");
        //}, cotc.SEVERITY_LOW));

        /**
         * details elements will always come in this order from left to right
         * advanced, basic and actions depending on config enabled.
         * detail elements get in array [actions, basic, advanced] order
         */
        var detailEls = $(el).find('.detail-foundation-container .detail-foundation-action-item'),
            detailElsIndx = detailEls.length - 1;

        basicTestGroup.registerTest(cotr.test(cotm.DETAILSVIEW_BASIC_ADVANCED_TOGGLE, function() {
            if (requestState !== cowc.DATA_REQUEST_STATE_ERROR) {
                //check advanced view icon
                equal($(detailEls[detailElsIndx]).attr('data-view'),
                    "advanced-json", "advanced view icon data-view check");

                //trigger click on advanced view
                $(detailEls[detailElsIndx]).trigger("click");

                equal($(el).find('.detail-foundation-container .detail-foundation-content-advanced').html(),
                    contrail.formatJSON2HTML(mockData, 2),
                    "advanced view HTML should equal to the generated JSON HTML content");

                //check basic view icon
                equal($(detailEls[detailElsIndx - 1]).attr('data-view'),
                    "basic-list", "basic view icon data-view check");

                //trigger click on basic view
                $(detailEls[detailElsIndx - 1]).trigger("click");

            } else {
                // Assertions can not be run.
                expect(0);
            }
        }, cotc.SEVERITY_LOW));

        if (contrail.checkIfExist(templateConfig.actions)) {
            basicTestGroup.registerTest(cotr.test(cotm.DETAILSVIEW_ACTIONS_BASIC, function() {
                if (requestState !== cowc.DATA_REQUEST_STATE_ERROR) {
                    //check type, icon and title for all actions
                    var actions = templateConfig.actions;
                    var actionLen = actions.length;
                    for (var i=0; i<actionLen; i++) {
                        equal($(detailEls[i]).attr('data-toggle'), actions[i].type, "actions data title check");
                        equal($(detailEls[i]).attr('title'), actions[i].title, "actions data title check");
                        equal($(detailEls[i]).find('i').attr('class'), actions[i].iconClass, "actions icon check");
                    }
                } else {
                    // Assertions can not be run.
                    expect(0);
                }
            }, cotc.SEVERITY_LOW));

            basicTestGroup.registerTest(cotr.test(cotm.DETAILSVIEW_ACTIONS_OPTIONLIST, function() {
                if (requestState !== cowc.DATA_REQUEST_STATE_ERROR) {
                    var actions = templateConfig.actions;
                    var actionLen = actions.length;
                    for (var i=0; i<actionLen; i++) {
                        if(contrail.checkIfExist(actions[i].optionList)) {
                            var optionList = actions[i].optionList,
                                optionListCnt = optionList.length;
                            //trigger click on action
                            $(detailEls[i]).trigger("click");
                            //get the options dom elements
                            var optionDomEls = $(detailEls[i]).parent().find('ul li'),
                                divider = 0;
                            for (var i=0; i<optionListCnt; i++) {
                                if (optionList[i].divider) {
                                    //current element is divider. check for divider class. increment only after that.
                                    equal($(optionDomEls[i+divider]).attr('class'), 'divider', "options divider check");
                                    divider += 1;
                                }
                                equal($(optionDomEls[i + divider]).find('a').attr('data-title'), optionList[i].title, "options title check");
                                equal($(optionDomEls[i + divider]).find('i').attr('class'), optionList[i].iconClass, "options icon check");
                            }
                            //trigger click to close
                            $(detailEls[i]).trigger("click");
                        }
                    }
                } else {
                    // Assertions can not be run.
                    expect(0);
                }
            }, cotc.SEVERITY_LOW));
        }

        /**
         * TODO Add test case for text formatter
         * type of formatter and key can be accessed from viewConfig
         * the dom should have id set to extract the values. details template creation needs update.
         */

        detailsViewTestSuite.run(suiteConfig.groups, suiteConfig.severity);

    };

    return testSuiteClass;
});
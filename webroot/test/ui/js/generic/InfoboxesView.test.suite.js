/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'co-test-utils',
    'co-test-messages',
    'co-test-constants',
    'co-test-runner',
    'infoboxes',
    'co-infoboxes-view-mockdata'
], function (_, cotu, cotm, cotc, cotr, InfoboxesView, InfoboxesMockData) {
    var testSuiteClass = function (viewObj, suiteConfig){
        var viewConfig, el;
        if (viewObj != null) {
            viewConfig = cotu.getViewConfigObj(viewObj);
            el = viewObj.el;
        }
        tabsTemplate = contrail.getTemplate4Id(cowc.TMPL_INFOBOXES_VIEW),
        standAlone = _.result(suiteConfig, 'standAlone', true);
        var infoboxesViewTestSuite = cotr.createTestSuite('InfoboxesViewTestSuite');
        var basicTestGroup = infoboxesViewTestSuite.createTestGroup('basic');
        if (standAlone) {
            el = "#content-container";
            module(cotu.formatTestModuleMessage(cotm.TEST_INFOBOXVIEW, el));
            var mockData = InfoboxesMockData['InfoboxesView']();
            var input = mockData[0]['inputData'];
            var output = mockData[0]['outputData'];
            var infoboxView = new InfoboxesView ({el: el});
            for(var i=0;i<input.length;i++) {
                infoboxView.add(input[i]);
            }
            var defaultInfoboxDetails = $(el).find('.infobox.active').text().trim();
            //Click on second infobox
            $(el).find('.infobox')[1].click();
            var secondInfoboxDetails = $(el).find('.infobox.active').text().trim();
        }
        //By default first infobox is selected we need to compare the first element title in input data
        // with the innerHTML of the first detail container
        basicTestGroup.registerTest(cotr.test('Compare the first infobox content with mockdata', function () {
            equal(defaultInfoboxDetails, input[0]['title'], "Default infobox details and mock html should be same");
        }, cotc.SEVERITY_LOW));

        basicTestGroup.registerTest(cotr.test('Compare the second infobox content with mockdata', function () {
            equal(secondInfoboxDetails, input[1]['title'], "Second infobox details and mock html should be same");
        }, cotc.SEVERITY_LOW));

        infoboxesViewTestSuite.run(suiteConfig.groups, suiteConfig.severity);

    };

    return testSuiteClass;
});

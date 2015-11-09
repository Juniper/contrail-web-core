/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'co-test-utils',
    'co-test-messages',
    'co-test-runner',
], function (cotu, cotm, cotr) {

    var testSuiteClass = function (viewObj, suiteConfig) {
        var mockData = ifNull(suiteConfig.mockData, []),
            gridListModel = viewObj.$el.data('contrailGrid')._dataView,
            dataParsers;

        if (contrail.checkIfExist(suiteConfig.modelConfig)) {
            dataParsers = suiteConfig.modelConfig.dataParsers;
        }

        module(cotu.formatTestModuleMessage(cotm.TEST_GRIDVIEW_LIST_MODEL, viewObj.el.id));

        var gridListModelTestSuite = cotr.createTestSuite('GridListModelTest');

        var basicTestGroup = gridListModelTestSuite.createTestGroup('basic');

        basicTestGroup.registerTest(cotr.test(cotm.GRIDVIEW_LIST_MODEL_INITIAL_SETUP, function () {
            if (mockData == null) {
                assertEmpty(gridListModel);
            } else {
                assertEqual(gridListModel, mockData, dataParsers);
            }

        }, cotc.SEVERITY_HIGH));

        basicTestGroup.registerTest(cotr.test(cotm.GRIDVIEW_LIST_MODEL_REFRESH, function () {
            gridListModel.refresh();
            if (mockData == null) {
                assertEmpty(gridListModel);
            } else {
                assertEqual(gridListModel, mockData, dataParsers);
            }
        }, cotc.SEVERITY_HIGH));


        gridListModelTestSuite.run(suiteConfig.groups, suiteConfig.severity);
    };

    function assertEmpty(gridListModel) {
        expect(6);
        deepEqual(0, gridListModel.getLength(), "rows is initialized to an empty array");
        deepEqual(gridListModel.getItems().length, 0, "getItems().length");
        deepEqual(undefined, gridListModel.getIdxById("id_0"), "getIdxById should return undefined if not found");
        deepEqual(undefined, gridListModel.getRowById("id_0"), "getRowById should return undefined if not found");
        deepEqual(undefined, gridListModel.getItemById("id_0"), "getItemById should return undefined if not found");
        deepEqual(undefined, gridListModel.getItemByIdx(0), "getItemByIdx should return undefined if not found");
    }

    function assertEqual(gridListModel, mockData, dataParsers) {
        var gridListModelItems = gridListModel.getItems();
        if (dataParsers != null) {
            if (contrail.checkIfExist(dataParsers.gridDataParseFn)) {
                gridListModelItems = dataParsers.gridDataParseFn(gridListModelItems);
            }
        }
        expect(6);
        notEqual(0, gridListModel.getLength(), "rows is initialized to an non-empty array");
        deepEqual(gridListModelItems.length, mockData.length, "getItems().length should equal with mockData.length");
        notEqual(undefined, gridListModel.getIdxById("id_0"), "getIdxById should not be undefined");
        notEqual(undefined, gridListModel.getRowById("id_0"), "getRowById should not be undefined");
        notEqual(undefined, gridListModel.getItemById("id_0"), "getItemById should not be undefined");
        deepEqual(mockData[0], gridListModelItems[0], "getItemByIdx[0] (listmodel first item) should equal to mockData[0]");
    }

    return testSuiteClass;

});

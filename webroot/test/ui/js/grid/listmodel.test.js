/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['co-test-messages'], function (cotm) {

    var tests = function (listModel, mockData, testConfig) {
        switch (testConfig.testCases) {
            case 'all':
                runAllTests(listModel, mockData, testConfig.dataParsers);
                break;

            case 'sorting':
                break;

            case 'filtering':
                break;

            case 'updateItems':
                break;

            default:
                runBasicTests(listModel, mockData, testConfig.dataParsers);
                break;
        }
    };

    function assertEmpty(listModel) {
        expect(6);
        deepEqual(0, listModel.getLength(), "rows is initialized to an empty array");
        deepEqual(listModel.getItems().length, 0, "getItems().length");
        deepEqual(undefined, listModel.getIdxById("id_0"), "getIdxById should return undefined if not found");
        deepEqual(undefined, listModel.getRowById("id_0"), "getRowById should return undefined if not found");
        deepEqual(undefined, listModel.getItemById("id_0"), "getItemById should return undefined if not found");
        deepEqual(undefined, listModel.getItemByIdx(0), "getItemByIdx should return undefined if not found");
    }

    function assertEqual(listModel, mockData, dataParsers) {
        if (contrail.checkIfExist(dataParsers.mockDataParseFn)) {
            mockData = dataParsers.mockDataParseFn(mockData);
        }
        var listModelItems = listModel.getItems();
        if (contrail.checkIfExist(dataParsers.gridDataParseFn)) {
            listModelItems = dataParsers.gridDataParseFn(listModel.getItems());
        }
        expect(6);
        notDeepEqual(0, listModel.getLength(), "rows is initialized to an non-empty array");
        deepEqual(listModelItems.length, mockData.length, "getItems().length should equal with mockData.length");
        notDeepEqual(undefined, listModel.getIdxById("id_0"), "getIdxById should not be undefined");
        notDeepEqual(undefined, listModel.getRowById("id_0"), "getRowById should not be undefined");
        notDeepEqual(undefined, listModel.getItemById("id_0"), "getItemById should not be undefined");
        deepEqual(mockData[0], listModelItems[0], "getItemByIdx[0] (listmodel first item) should equal to mockData[0]");
    }

    var runBasicTests = function (listModel, mockData, dataParsers) {

        test(cotm.SLICKGRID_DATAVIEW_INITIAL_SETUP, function () {
            if (listModel == null) {
                listModel = new Slick.Data.DataView();
            }

            if (mockData == null) {
                assertEmpty(listModel);
            } else {
                assertEqual(listModel, mockData, dataParsers);
            }

        });

        test(cotm.SLICKGRID_DATAVIEW_REFRESH, function () {

            if (listModel == null) {
                listModel = new Slick.Data.DataView();
            }

            listModel.refresh();

            if (mockData == null) {
                assertEmpty(listModel);
            } else {
                assertEqual(listModel, mockData, dataParsers);
            }
        });
    };

    var runAllTests = function (listModel, mockData, dataParsers) {
        runBasicTests(listModel, mockData, dataParsers);
        //Add other test modules;
    };

    return tests;

});

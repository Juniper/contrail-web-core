/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'co-test-messages'
], function (cotm) {

    var tests = function (el, viewConfig, testConfig) {
        var gridData = $(el).data('contrailGrid'),
            gridItems = gridData._dataView.getItems();

        var viewConfigHeader = viewConfig.elementConfig.header,
            viewConfigColHeader = viewConfig.elementConfig.columnHeader,
            viewConfigBody = viewConfig.elementConfig.body,
            viewConfigFooter = viewConfig.elementConfig.footer;

        switch (testConfig.testCases) {
            case 'all':
                runAllTests();
                break;

            case 'header':
                break;

            case 'body':
                break;

            case 'footer':
                break;

            default:
                testGridBody();
                break;
        }

        function testGridHeader() {
            var addCols = 0;
            if (contrail.checkIfExist(viewConfigBody.options.detail)) {
                addCols = 1;
            }

            test(cotm.SLICKGRID_GRIDVIEW_COLUMNS_LOADED, function () {
                expect(1);
                equal($(el).find('.slick-header-column').length, (viewConfigColHeader.columns.length + addCols), "loaded columns should be equal to the config");
            });
        };


        function testGridBody() {
            var pageSize = viewConfigFooter.pager.options.pageSize;

            test(cotm.SLICKGRID_GRIDVIEW_ROWS_LOADED, function () {
                expect(1);
                equal($(el).find('.slick-row-master').length, (gridItems.length < pageSize) ? gridItems.length : pageSize, "loaded rows must be equal to pageSize or size of the data if less");
            });

        };

        function testGridFooter() {

        }

        function runAllTests() {
            testGridHeader();
            testGridBody();
            testGridFooter();
            //Add other test modules;
        }
    };

    return tests;
});
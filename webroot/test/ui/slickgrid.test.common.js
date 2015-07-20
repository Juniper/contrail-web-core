/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define(['underscore', 'test-messages', 'co-test-utils'], function (_, TestMessages, SlickGridUtils) {
    this.executeSlickGridTests = function (prefixId, mockData, testConfigObj) {
        var grid = $(testConfigObj.gridElId).data('contrailGrid'),
            gridPagingInfo = grid._dataView.getPagingInfo();

        test(TestMessages.TEST_SLICKGRID_DATAVIEW, function (assert) {
            expect(2);

            ok(grid._dataView.getItems().length == mockData.data.value.length, TestMessages.TEST_NO_OF_ROWS_IN_SLICKGRID_DATAVIEW);
            ok(grid._dataView.getItem(0) !== 'undefined', TestMessages.TEST_ROWS_LOADED_IN_SLICKGRID_DATAVIEW);
        });

        test(TestMessages.TEST_SLICKGRID_VIEW, function (assert) {
            expect(2);

            equal($(testConfigObj.gridElId).find('.slick-row-master').length, (gridPagingInfo.totalRows < gridPagingInfo.pageSize) ? gridPagingInfo.totalRows : gridPagingInfo.pageSize, TestMessages.TEST_ROWS_LOADED_IN_SLICKGRID_VIEW);
            equal($(testConfigObj.gridElId).find('.slick-header-column').length, testConfigObj.cols.length + testConfigObj.addnCols.length, TestMessages.TEST_COLS_LOADED_IN_SLICKGRID_VIEW);
        });
    };
    return {
        executeSlickGridTests: executeSlickGridTests
    };
});
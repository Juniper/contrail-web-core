/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'test-slickgrid-messages', 'test-slickgrid-utils'], function (_, SMTestMessages, SlickGridUtils) {
        this.executeSlickGridTests = function (prefixId, mockData, testConfigObj) {
            var grid = $(testConfigObj.gridElId).data('contrailGrid'),
                gridPagingInfo = grid._dataView.getPagingInfo();

            asyncTest('Test SlickGrid Dataview', function (assert) {
                expect(2);

                ok(grid._dataView.getItems().length == mockData.data.value.length, SMTestMessages.TEST_NO_OF_ROWS_IN_SLICKGRID_DATAVIEW);
                ok(grid._dataView.getItem(0) !== 'undefined', SMTestMessages.TEST_ROWS_LOADED_IN_SLICKGRID_DATAVIEW);

                SlickGridUtils.startQunitWithTimeout(1);
            });

            asyncTest('Test SlickGrid view', function (assert) {
                expect(2);

                equal($(testConfigObj.gridElId).find('.slick-row-master').length, (gridPagingInfo.totalRows < gridPagingInfo.pageSize) ? gridPagingInfo.totalRows : gridPagingInfo.pageSize, SMTestMessages.TEST_ROWS_LOADED_IN_SLICKGRID_VIEW);
                equal($(testConfigObj.gridElId).find('.slick-header-column').length, testConfigObj.cols.length + testConfigObj.addnCols.length, SMTestMessages.TEST_COLS_LOADED_IN_SLICKGRID_VIEW);

                SlickGridUtils.startQunitWithTimeout(1);
            });
        };
    return {
        executeSlickGridTests : executeSlickGridTests
    };
});

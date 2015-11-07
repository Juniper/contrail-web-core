/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'co-test-utils',
    'co-test-messages',
    'co-test-constants',
    'co-test-runner'
], function (_, cotu, cotm, cotc, cotr) {

    var libTestSuiteClass = function (suiteConfig){

        var grid;

        var ROWS = 500, COLS = 10;
        var data = [], row;
        for (var i = 0; i < ROWS; i++) {
            row = { id: "id_" + i };
            for (var j = 0; j < COLS; j++) {
                row["col_" + j] = i + "." + j;
            }
            data.push(row);
        }

        var cols = [], col;
        for (var i = 0; i < COLS; i++) {
            cols.push({
                id: "col" + i,
                field: "col_" + i,
                name: "col_" + i
            });
        }

        cols[0].minWidth = 70;
        grid = new Slick.Grid("#container", data, cols);
        grid.render();

        module(cotu.formatTestModuleMessage(cotm.TEST_GRIDVIEW_GRID, "SlickGrid"));

        var gridViewGridTestSuite = cotr.createTestSuite('GridViewTest');

        var basicTestGroup = gridViewGridTestSuite.createTestGroup('basic');

        /*
        basicTestGroup.registerTest(cotr.test("Basic - Test column minWidth is respected", function () {
            var firstCol = $("#container .slick-header-column:first");
            firstCol.find(".slick-resizable-handle:first").drag({ dx: 100,  dy: 0 });
            firstCol.find(".slick-resizable-handle:first").drag({ dx: -200, dy: 0 });
            equal(firstCol.outerWidth(), 70, "width set to minWidth");
        }, cotc.SEVERITY_HIGH));


        basicTestGroup.registerTest(cotr.test("Basic - column resize should fire event onColumnResized", function () {
            expect(2);
            grid.onColumnsResized.subscribe(function() { ok(true,"onColumnsResized called") });
            var oldWidth = cols[0].width;
            $("#container .slick-resizable-handle:first").drag({ dx: 100, dy: 0 });
            equal(cols[0].width, oldWidth+100-1, "columns array is updated");
        }, cotc.SEVERITY_MEDIUM));
        */

        basicTestGroup.registerTest(cotr.test("Basic - getData should return data", function () {
            equal(grid.getData(), data);
        }, cotc.SEVERITY_HIGH));

        gridViewGridTestSuite.run(suiteConfig.groups, suiteConfig.severity);

    };

    return libTestSuiteClass;
});
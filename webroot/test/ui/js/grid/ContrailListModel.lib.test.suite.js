/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'co-test-utils',
    'co-test-messages',
    'co-test-constants',
    'co-test-unit',
], function (cotu, cotm, cotc, CUnit) {

    var libTestSuiteClass = function (suiteConfig) {

        module(cotu.formatTestModuleMessage(cotm.TEST_GRIDVIEW_LIST_MODEL, "ContrailListModel"));

        var gridListModelTestSuite = CUnit.createTestSuite('GridListModelTest');

        /**
         * Basic Test group
         */

        var basicTestGroup = gridListModelTestSuite.createTestGroup('basic');

        basicTestGroup.registerTest(CUnit.test(cotm.GRIDVIEW_LIST_MODEL_INITIAL_SETUP, function () {
            var gridListModel = new Slick.Data.DataView();
            assertEmpty(gridListModel);
        }, cotc.SEVERITY_HIGH));

        basicTestGroup.registerTest(CUnit.test(cotm.GRIDVIEW_LIST_MODEL_REFRESH, function () {
            var gridListModel = new Slick.Data.DataView();
            gridListModel.refresh();
            assertEmpty(gridListModel);
        }, cotc.SEVERITY_HIGH));

        /**
         * SetItems Test group
         */
        var setItemsTestGroup = gridListModelTestSuite.createTestGroup('setItems');

        setItemsTestGroup.registerTest(CUnit.test("setItems - empty", function() {
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems([]);
            assertEmpty(gridListModel);
        }, cotc.SEVERITY_LOW));

        setItemsTestGroup.registerTest(CUnit.test("setItems - basic", function() {
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems([{cgrid:0},{cgrid:1}]);
            same(2, gridListModel.getLength(), "rows.length");
            same(gridListModel.getItems().length, 2, "getItems().length");
            assertConsistency(gridListModel);
        }, cotc.SEVERITY_LOW));

        setItemsTestGroup.registerTest(CUnit.test("setItems - test alternative idProperty", function() {
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems([{uid:0},{uid:1}], "uid");
            assertConsistency(gridListModel,"uid");
        }, cotc.SEVERITY_LOW));

        setItemsTestGroup.registerTest(CUnit.test("setItems - requires cgrid set on objects", function() {
            var gridListModel = new Slick.Data.DataView();
            expect(0);
            try {
                gridListModel.setItems([1,2,3]);
                ok(false, "exception expected")
            }
            catch (ex) {}
        }, cotc.SEVERITY_LOW));

        setItemsTestGroup.registerTest(CUnit.test("setItems - requires unique cgrid on obejcts", function() {
            var gridListModel = new Slick.Data.DataView();
            expect(0);
            try {
                gridListModel.setItems([{cgrid:0},{cgrid:0}]);
                ok(false, "exception expected")
            }
            catch (ex) {}

        }, cotc.SEVERITY_LOW));

        setItemsTestGroup.registerTest(CUnit.test("setItems - requires unique id on objects (alternative idProperty)", function() {
            var gridListModel = new Slick.Data.DataView();
            expect(0);
            try {
                gridListModel.setItems([{uid:0},{uid:0}], "uid");
                ok(false, "exception expected")
            }
            catch (ex) {}
        }, cotc.SEVERITY_LOW));

        setItemsTestGroup.registerTest(CUnit.test("setItems - check events fired", function() {
            var count = 0;
            var gridListModel = new Slick.Data.DataView();
            gridListModel.onRowsChanged.subscribe(function(e,args) {
                ok(true, "onRowsChanged called");
                count++;
            });
            gridListModel.onRowCountChanged.subscribe(function(e,args) {
                ok(true, "onRowCountChanged called");
                same(args.previous, 0, "previous arg");
                same(args.current, 2, "current arg");
                count++;
            });
            gridListModel.onPagingInfoChanged.subscribe(function(e,args) {
                ok(true, "onPagingInfoChanged called");
                same(args.pageSize, 0, "pageSize arg");
                same(args.pageNum, 0, "pageNum arg");
                same(args.totalRows, 2, "totalRows arg");
                count++;
            });
            gridListModel.setItems([{cgrid:0},{cgrid:1}]);
            gridListModel.refresh();
            same(3, count, "3 events should have been called");
        }, cotc.SEVERITY_MEDIUM));

        setItemsTestGroup.registerTest(CUnit.test("setItems - no events on empty items set", function() {
            var gridListModel = new Slick.Data.DataView();
            expect(0);
            gridListModel.onRowsChanged.subscribe(function() { ok(false, "onRowsChanged called") });
            gridListModel.onRowCountChanged.subscribe(function() { ok(false, "onRowCountChanged called") });
            gridListModel.onPagingInfoChanged.subscribe(function() { ok(false, "onPagingInfoChanged called") });
            gridListModel.setItems([]);
            gridListModel.refresh();
        }, cotc.SEVERITY_MEDIUM));

        setItemsTestGroup.registerTest(CUnit.test("setItems - no events followed by refresh", function() {
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems([{cgrid:0},{cgrid:1}]);
            expect(0);
            gridListModel.onRowsChanged.subscribe(function() { ok(false, "onRowsChanged called") });
            gridListModel.onRowCountChanged.subscribe(function() { ok(false, "onRowCountChanged called") });
            gridListModel.onPagingInfoChanged.subscribe(function() { ok(false, "onPagingInfoChanged called") });
            gridListModel.refresh();
        }, cotc.SEVERITY_MEDIUM));

        setItemsTestGroup.registerTest(CUnit.test("setItems - no refresh while suspended", function() {
            var gridListModel = new Slick.Data.DataView();
            gridListModel.beginUpdate();
            gridListModel.onRowsChanged.subscribe(function() { ok(false, "onRowsChanged called") });
            gridListModel.onRowCountChanged.subscribe(function() { ok(false, "onRowCountChanged called") });
            gridListModel.onPagingInfoChanged.subscribe(function() { ok(false, "onPagingInfoChanged called") });
            gridListModel.setItems([{cgrid:0},{cgrid:1}]);
            gridListModel.setFilter(function(o) { return true });
            gridListModel.refresh();
            same(gridListModel.getLength(), 0, "rows aren't updated until resumed");
        }, cotc.SEVERITY_MEDIUM));

        setItemsTestGroup.registerTest(CUnit.test("setItems - refresh fires after resume", function() {
            var gridListModel = new Slick.Data.DataView();
            gridListModel.beginUpdate();
            gridListModel.setItems([{cgrid:0},{cgrid:1}]);
            same(gridListModel.getItems().length, 2, "items updated immediately");
            gridListModel.setFilter(function(o) { return true; });
            gridListModel.refresh();

            var count = 0;
            gridListModel.onRowsChanged.subscribe(function(e,args) {
                ok(true, "onRowsChanged called");
                same(args, {rows:[0,1]}, "args");
                count++;
            });
            gridListModel.onRowCountChanged.subscribe(function(e,args) {
                ok(true, "onRowCountChanged called");
                same(args.previous, 0, "previous arg");
                same(args.current, 2, "current arg");
                count++;
            });
            gridListModel.onPagingInfoChanged.subscribe(function(e,args) {
                ok(true, "onPagingInfoChanged called");
                same(args.pageSize, 0, "pageSize arg");
                same(args.pageNum, 0, "pageNum arg");
                same(args.totalRows, 2, "totalRows arg");
                count++;
            });
            gridListModel.endUpdate();
            equal(count, 3, "events fired");
            same(gridListModel.getItems().length, 2, "items are the same");
            same(gridListModel.getLength(), 2, "rows updated");

        }, cotc.SEVERITY_MEDIUM));

        /**
         * sorting test group
         */
        var sortTestGroup = gridListModelTestSuite.createTestGroup('sort');

        sortTestGroup.registerTest(CUnit.test("sort - basic", function() {
            var count = 0;
            var items = [{cgrid:2,val:2},{cgrid:1,val:1},{cgrid:0,val:0}];
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems(items);
            gridListModel.onRowsChanged.subscribe(function() {
                ok(true, "onRowsChanged called");
                count++;
            });
            gridListModel.onRowCountChanged.subscribe(function() { ok(false, "onRowCountChanged called") });
            gridListModel.onPagingInfoChanged.subscribe(function() { ok(false, "onPagingInfoChanged called") });
            gridListModel.sort(function(x,y) { return x.val-y.val }, true);
            equal(count, 1, "events fired");
            same(gridListModel.getItems(), items, "original array should get sorted");
            same(items, [{cgrid:0,val:0},{cgrid:1,val:1},{cgrid:2,val:2}], "sort order");
            assertConsistency(gridListModel);
        }, cotc.SEVERITY_LOW));

        sortTestGroup.registerTest(CUnit.test("sort - ascending order by default ", function() {
            var items = [{cgrid:2,val:2},{cgrid:1,val:1},{cgrid:0,val:0}];
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems(items);
            gridListModel.sort(function(x,y) { return x.val-y.val });
            same(items, [{cgrid:0,val:0},{cgrid:1,val:1},{cgrid:2,val:2}], "sort order");
        }, cotc.SEVERITY_MEDIUM));

        sortTestGroup.registerTest(CUnit.test("sort - descending order by default ", function() {
            var items = [{cgrid:0,val:0},{cgrid:2,val:2},{cgrid:1,val:1}];
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems(items);
            gridListModel.sort(function(x,y) { return -1*(x.val-y.val) });
            same(items, [{cgrid:2,val:2},{cgrid:1,val:1},{cgrid:0,val:0}], "sort order");
        }, cotc.SEVERITY_LOW));

        sortTestGroup.registerTest(CUnit.test("sort - check stablility", function() {
            var items = [{cgrid:0,val:0},{cgrid:2,val:2},{cgrid:3,val:2},{cgrid:1,val:1}];
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems(items);

            gridListModel.sort(function(x,y) { return x.val-y.val });
            same(items, [{cgrid:0,val:0},{cgrid:1,val:1},{cgrid:2,val:2},{cgrid:3,val:2}], "sort order");

            gridListModel.sort(function(x,y) { return x.val-y.val });
            same(items, [{cgrid:0,val:0},{cgrid:1,val:1},{cgrid:2,val:2},{cgrid:3,val:2}], "sorting on the same column again doesn't change the order");

            gridListModel.sort(function(x,y) { return -1*(x.val-y.val) });
            same(items, [{cgrid:2,val:2},{cgrid:3,val:2},{cgrid:1,val:1},{cgrid:0,val:0}], "sort order");
        }, cotc.SEVERITY_MEDIUM));

        /**
         * Filter Test group
         */
        var filterTestGroup = gridListModelTestSuite.createTestGroup("filter");

        filterTestGroup.registerTest(CUnit.test("filter - should apply immediately", function() {
            var count = 0;
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems([{cgrid:0,val:0},{cgrid:1,val:1},{cgrid:2,val:2}]);
            gridListModel.onRowsChanged.subscribe(function(e,args) {
                ok(true, "onRowsChanged called");
                same(args, {rows:[0]}, "args");
                count++;
            });
            gridListModel.onRowCountChanged.subscribe(function(e,args) {
                ok(true, "onRowCountChanged called");
                same(args.previous, 3, "previous arg");
                same(args.current, 1, "current arg");
                count++;
            });
            gridListModel.onPagingInfoChanged.subscribe(function(e,args) {
                ok(true, "onPagingInfoChanged called");
                same(args.pageSize, 0, "pageSize arg");
                same(args.pageNum, 0, "pageNum arg");
                same(args.totalRows, 1, "totalRows arg");
                count++;
            });
            gridListModel.setFilter(function(o) { return o.val === 1; });
            equal(count, 3, "events fired");
            same(gridListModel.getItems().length, 3, "original data is still there");
            same(gridListModel.getLength(), 1, "rows are filtered");
            assertConsistency(gridListModel);
        }, cotc.SEVERITY_LOW));

        gridListModelTestSuite.run(suiteConfig.groups, suiteConfig.severity);
    };

    function assertEmpty(gridListModel) {
        expect(6);
        deepEqual(0, gridListModel.getLength(), "rows is initialized to an empty array");
        deepEqual(gridListModel.getItems().length, 0, "getItems().length");
        deepEqual(undefined, gridListModel.getIdxById("cgrid"), "getIdxById should return undefined if not found");
        deepEqual(undefined, gridListModel.getRowById("cgrid"), "getRowById should return undefined if not found");
        deepEqual(undefined, gridListModel.getItemById("cgrid"), "getItemById should return undefined if not found");
        deepEqual(undefined, gridListModel.getItemByIdx(0), "getItemByIdx should return undefined if not found");
    }

    function assertConsistency(gridListModel,idProperty) {
        idProperty = idProperty || "cgrid";
        var items = gridListModel.getItems(),
            filteredOut = 0,
            row,
            id;

        for (var i=0; i<items.length; i++) {
            id = items[i][idProperty];
            same(gridListModel.getItemByIdx(i), items[i], "getItemByIdx");
            same(gridListModel.getItemById(id), items[i], "getItemById");
            same(gridListModel.getIdxById(id), i, "getIdxById");

            row = gridListModel.getRowById(id);
            if (row === undefined)
                filteredOut++;
            else
                same(gridListModel.getItem(row), items[i], "getRowById");
        }

        same(items.length-gridListModel.getLength(), filteredOut, "filtered rows");
    }

    return libTestSuiteClass;

});

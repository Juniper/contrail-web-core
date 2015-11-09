/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'co-test-utils',
    'co-test-messages',
    'co-test-constants',
    'co-test-runner',
], function (cotu, cotm, cotc, cotr) {

    var libTestSuiteClass = function (suiteConfig) {

        module(cotu.formatTestModuleMessage(cotm.TEST_GRIDVIEW_LIST_MODEL, "ContrailListModel"));

        var gridListModelTestSuite = cotr.createTestSuite('GridListModelTest');

        /**
         * Basic Test group
         */

        var basicTestGroup = gridListModelTestSuite.createTestGroup('basic');

        basicTestGroup.registerTest(cotr.test(cotm.GRIDVIEW_LIST_MODEL_INITIAL_SETUP, function () {
            var gridListModel = new Slick.Data.DataView();
            assertEmpty(gridListModel);
        }, cotc.SEVERITY_HIGH));

        basicTestGroup.registerTest(cotr.test(cotm.GRIDVIEW_LIST_MODEL_REFRESH, function () {
            var gridListModel = new Slick.Data.DataView();
            gridListModel.refresh();
            assertEmpty(gridListModel);
        }, cotc.SEVERITY_HIGH));

        /**
         * SetItems Test group
         */
        var setItemsTestGroup = gridListModelTestSuite.createTestGroup('setItems');

        setItemsTestGroup.registerTest(cotr.test("setItems - empty", function() {
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems([]);
            assertEmpty(gridListModel);
        }, cotc.SEVERITY_LOW));

        setItemsTestGroup.registerTest(cotr.test("setItems - basic", function() {
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems([{cgrid:0},{cgrid:1}]);
            same(2, gridListModel.getLength(), "rows.length");
            same(gridListModel.getItems().length, 2, "getItems().length");
            assertConsistency(gridListModel);
        }, cotc.SEVERITY_LOW));

        setItemsTestGroup.registerTest(cotr.test("setItems - test alternative idProperty", function() {
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems([{uid:0},{uid:1}], "uid");
            assertConsistency(gridListModel,"uid");
        }, cotc.SEVERITY_LOW));

        setItemsTestGroup.registerTest(cotr.test("setItems - requires cgrid set on objects", function() {
            var gridListModel = new Slick.Data.DataView();
            expect(0);
            try {
                gridListModel.setItems([1,2,3]);
                ok(false, "exception expected")
            }
            catch (ex) {}
        }, cotc.SEVERITY_LOW));

        setItemsTestGroup.registerTest(cotr.test("setItems - requires unique cgrid on obejcts", function() {
            var gridListModel = new Slick.Data.DataView();
            expect(0);
            try {
                gridListModel.setItems([{cgrid:0},{cgrid:0}]);
                ok(false, "exception expected")
            }
            catch (ex) {}

        }, cotc.SEVERITY_LOW));

        setItemsTestGroup.registerTest(cotr.test("setItems - requires unique id on objects (alternative idProperty)", function() {
            var gridListModel = new Slick.Data.DataView();
            expect(0);
            try {
                gridListModel.setItems([{uid:0},{uid:0}], "uid");
                ok(false, "exception expected")
            }
            catch (ex) {}
        }, cotc.SEVERITY_LOW));

        setItemsTestGroup.registerTest(cotr.test("setItems - check events fired", function() {
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

        setItemsTestGroup.registerTest(cotr.test("setItems - no events on empty items set", function() {
            var gridListModel = new Slick.Data.DataView();
            expect(0);
            gridListModel.onRowsChanged.subscribe(function() { ok(false, "onRowsChanged called") });
            gridListModel.onRowCountChanged.subscribe(function() { ok(false, "onRowCountChanged called") });
            gridListModel.onPagingInfoChanged.subscribe(function() { ok(false, "onPagingInfoChanged called") });
            gridListModel.setItems([]);
            gridListModel.refresh();
        }, cotc.SEVERITY_MEDIUM));

        setItemsTestGroup.registerTest(cotr.test("setItems - no events followed by refresh", function() {
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems([{cgrid:0},{cgrid:1}]);
            expect(0);
            gridListModel.onRowsChanged.subscribe(function() { ok(false, "onRowsChanged called") });
            gridListModel.onRowCountChanged.subscribe(function() { ok(false, "onRowCountChanged called") });
            gridListModel.onPagingInfoChanged.subscribe(function() { ok(false, "onPagingInfoChanged called") });
            gridListModel.refresh();
        }, cotc.SEVERITY_MEDIUM));

        setItemsTestGroup.registerTest(cotr.test("setItems - no refresh while suspended", function() {
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

        setItemsTestGroup.registerTest(cotr.test("setItems - refresh fires after resume", function() {
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

        sortTestGroup.registerTest(cotr.test("sort - basic", function() {
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

        sortTestGroup.registerTest(cotr.test("sort - ascending order by default ", function() {
            var items = [{cgrid:2,val:2},{cgrid:1,val:1},{cgrid:0,val:0}];
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems(items);
            gridListModel.sort(function(x,y) { return x.val-y.val });
            same(items, [{cgrid:0,val:0},{cgrid:1,val:1},{cgrid:2,val:2}], "sort order");
        }, cotc.SEVERITY_MEDIUM));

        sortTestGroup.registerTest(cotr.test("sort - descending order by default ", function() {
            var items = [{cgrid:0,val:0},{cgrid:2,val:2},{cgrid:1,val:1}];
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems(items);
            gridListModel.sort(function(x,y) { return -1*(x.val-y.val) });
            same(items, [{cgrid:2,val:2},{cgrid:1,val:1},{cgrid:0,val:0}], "sort order");
        }, cotc.SEVERITY_LOW));

        sortTestGroup.registerTest(cotr.test("sort - check stablility", function() {
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

        filterTestGroup.registerTest(cotr.test("filter - should apply immediately", function() {
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

        filterTestGroup.registerTest(cotr.test("filter - filtering re-applied on refresh", function() {
            var count = 0;
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems([{cgrid:0,val:0},{cgrid:1,val:1},{cgrid:2,val:2}]);
            gridListModel.setFilterArgs(0);
            gridListModel.setFilter(function(o, args) { return o.val >= args; });
            same(gridListModel.getLength(), 3, "nothing is filtered out");
            assertConsistency(gridListModel);

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
            gridListModel.setFilterArgs(2);
            gridListModel.refresh();
            equal(count, 3, "events fired");
            same(gridListModel.getItems().length, 3, "original data is still there");
            same(gridListModel.getLength(), 1, "rows are filtered");
            assertConsistency(gridListModel);
        }, cotc.SEVERITY_LOW));

        filterTestGroup.registerTest(cotr.test("filter - filtering re-applied on sort ", function() {
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems([{cgrid:0,val:0},{cgrid:1,val:1},{cgrid:2,val:2}]);
            gridListModel.setFilter(function(o) { return o.val === 1; });
            same(gridListModel.getLength(), 1, "one row is remaining");

            gridListModel.onRowsChanged.subscribe(function() { ok(false, "onRowsChanged called") });
            gridListModel.onRowCountChanged.subscribe(function() { ok(false, "onRowCountChanged called") });
            gridListModel.onPagingInfoChanged.subscribe(function() { ok(false, "onPagingInfoChanged called") });
            gridListModel.sort(function(x,y) { return x.val-y.val; }, false);
            same(gridListModel.getItems().length, 3, "original data is still there");
            same(gridListModel.getLength(), 1, "rows are filtered");
            assertConsistency(gridListModel);
        }, cotc.SEVERITY_LOW));

        filterTestGroup.registerTest(cotr.test("filter - filtering all", function() {
            var count = 0;
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems([{cgrid:0,val:0},{cgrid:1,val:1},{cgrid:2,val:2}]);
            gridListModel.onRowsChanged.subscribe(function(e,args) {
                ok(false, "onRowsChanged called");
            });
            gridListModel.onRowCountChanged.subscribe(function(e,args) {
                ok(true, "onRowCountChanged called");
                same(args.previous, 3, "previous arg");
                same(args.current, 0, "current arg");
                count++;
            });
            gridListModel.onPagingInfoChanged.subscribe(function(e,args) {
                ok(true, "onPagingInfoChanged called");
                same(args.pageSize, 0, "pageSize arg");
                same(args.pageNum, 0, "pageNum arg");
                same(args.totalRows, 0, "totalRows arg");
                count++;
            });
            gridListModel.setFilter(function(o) { return false; });
            equal(count, 2, "events fired");
            same(gridListModel.getItems().length, 3, "original data is still there");
            same(gridListModel.getLength(), 0, "rows are filtered");
            assertConsistency(gridListModel);
        }, cotc.SEVERITY_LOW));

        filterTestGroup.registerTest(cotr.test("filter - filtering all then none", function() {
            var count = 0;
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems([{cgrid:0,val:0},{cgrid:1,val:1},{cgrid:2,val:2}]);
            gridListModel.setFilterArgs(false);
            gridListModel.setFilter(function(o, args) { return args; });
            same(gridListModel.getLength(), 0, "all rows are filtered out");

            gridListModel.onRowsChanged.subscribe(function(e,args) {
                ok(true, "onRowsChanged called");
                same(args, {rows:[0,1,2]}, "args");
                count++;
            });
            gridListModel.onRowCountChanged.subscribe(function(e,args) {
                ok(true, "onRowCountChanged called");
                same(args.previous, 0, "previous arg");
                same(args.current, 3, "current arg");
                count++;
            });
            gridListModel.onPagingInfoChanged.subscribe(function(e,args) {
                ok(true, "onPagingInfoChanged called");
                same(args.pageSize, 0, "pageSize arg");
                same(args.pageNum, 0, "pageNum arg");
                same(args.totalRows, 3, "totalRows arg");
                count++;
            });
            gridListModel.setFilterArgs(true);
            gridListModel.refresh();
            equal(count, 3, "events fired");
            same(gridListModel.getItems().length, 3, "original data is still there");
            same(gridListModel.getLength(), 3, "all rows are back");
            assertConsistency(gridListModel);

        }, cotc.SEVERITY_LOW));

        filterTestGroup.registerTest(cotr.test("filter - inlining replaces absolute returns", function() {
            var gridListModel = new Slick.Data.DataView({ inlineFilters: true });
            gridListModel.setItems([{cgrid:0,val:0},{cgrid:1,val:1},{cgrid:2,val:2}]);
            gridListModel.setFilter(function(o) {
                if (o.val === 1) { return true; }
                else if (o.val === 4) { return true }
                return false});
            same(gridListModel.getLength(), 1, "one row is remaining");

            gridListModel.onRowsChanged.subscribe(function() { ok(false, "onRowsChanged called") });
            gridListModel.onRowCountChanged.subscribe(function() { ok(false, "onRowCountChanged called") });
            gridListModel.onPagingInfoChanged.subscribe(function() { ok(false, "onPagingInfoChanged called") });
            same(gridListModel.getItems().length, 3, "original data is still there");
            same(gridListModel.getLength(), 1, "rows are filtered");
            assertConsistency(gridListModel);
        }, cotc.SEVERITY_LOW));

        filterTestGroup.registerTest(cotr.test("filter - inlining replaces evaluated returns", function() {
            var gridListModel = new Slick.Data.DataView({ inlineFilters: true });
            gridListModel.setItems([{cgrid:0,val:0},{cgrid:1,val:1},{cgrid:2,val:2}]);
            gridListModel.setFilter(function(o) {
                if (o.val === 0) { return o.id === 2; }
                else if (o.val === 1) { return o.id === 2 }
                return o.val === 2});
            same(gridListModel.getLength(), 1, "one row is remaining");

            gridListModel.onRowsChanged.subscribe(function() { ok(false, "onRowsChanged called") });
            gridListModel.onRowCountChanged.subscribe(function() { ok(false, "onRowCountChanged called") });
            gridListModel.onPagingInfoChanged.subscribe(function() { ok(false, "onPagingInfoChanged called") });
            same(gridListModel.getItems().length, 3, "original data is still there");
            same(gridListModel.getLength(), 1, "rows are filtered");
            assertConsistency(gridListModel);
        }, cotc.SEVERITY_LOW));

        /**
         * UpdateItem test group
         */

        var updateTestGroup = gridListModelTestSuite.createTestGroup("update");

        updateTestGroup.registerTest(cotr.test("update - basic", function() {
            var count = 0;
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems([{cgrid:0,val:0},{cgrid:1,val:1},{cgrid:2,val:2}]);

            gridListModel.onRowsChanged.subscribe(function(e,args) {
                ok(true, "onRowsChanged called");
                same(args, {rows:[1]}, "args");
                count++;
            });
            gridListModel.onRowCountChanged.subscribe(function(e,args) {
                ok(false, "onRowCountChanged called");
            });
            gridListModel.onPagingInfoChanged.subscribe(function(e,args) {
                ok(false, "onPagingInfoChanged called");
            });

            gridListModel.updateItem(1,{cgrid:1,val:1337});
            equal(count, 1, "events fired");
            same(gridListModel.getItem(1), {cgrid:1,val:1337}, "item updated");
            assertConsistency(gridListModel);
        }, cotc.SEVERITY_LOW));

        updateTestGroup.registerTest(cotr.test("update - updating an item not passing the filter", function() {
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems([{cgrid:0,val:0},{cgrid:1,val:1},{cgrid:2,val:2},{cgrid:3,val:1337}]);
            gridListModel.setFilter(function(o) { return o["val"] !== 1337; });
            gridListModel.onRowsChanged.subscribe(function(e,args) {
                ok(false, "onRowsChanged called");
            });
            gridListModel.onRowCountChanged.subscribe(function(e,args) {
                ok(false, "onRowCountChanged called");
            });
            gridListModel.onPagingInfoChanged.subscribe(function(e,args) {
                ok(false, "onPagingInfoChanged called");
            });
            gridListModel.updateItem(3,{cgrid:3,val:1337});
            same(gridListModel.getItems()[3], {cgrid:3,val:1337}, "item updated");
            assertConsistency(gridListModel);
        }, cotc.SEVERITY_LOW));

        updateTestGroup.registerTest(cotr.test("update - updating an item to pass the filter", function() {
            var count = 0;
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems([{cgrid:0,val:0},{cgrid:1,val:1},{cgrid:2,val:2},{cgrid:3,val:1337}]);
            gridListModel.setFilter(function(o) { return o["val"] !== 1337; });
            gridListModel.onRowsChanged.subscribe(function(e,args) {
                ok(true, "onRowsChanged called");
                same(args, {rows:[3]}, "args");
                count++;
            });
            gridListModel.onRowCountChanged.subscribe(function(e,args) {
                ok(true, "onRowCountChanged called");
                equal(args.previous, 3, "previous arg");
                equal(args.current, 4, "current arg");
                count++;
            });
            gridListModel.onPagingInfoChanged.subscribe(function(e,args) {
                ok(true, "onPagingInfoChanged called");
                same(args.pageSize, 0, "pageSize arg");
                same(args.pageNum, 0, "pageNum arg");
                same(args.totalRows, 4, "totalRows arg");
                count++;
            });
            gridListModel.updateItem(3,{cgrid:3,val:3});
            equal(count, 3, "events fired");
            same(gridListModel.getItems()[3], {cgrid:3,val:3}, "item updated");
            assertConsistency(gridListModel);
        }, cotc.SEVERITY_LOW));

        updateTestGroup.registerTest(cotr.test("update - updating an item to not pass the filter ", function() {
            var count = 0;
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems([{cgrid:0,val:0},{cgrid:1,val:1},{cgrid:2,val:2},{cgrid:3,val:3}]);
            gridListModel.setFilter(function(o) { return o["val"] !== 1337; });
            gridListModel.onRowsChanged.subscribe(function(e,args) {
                console.log(args)
                ok(false, "onRowsChanged called");
            });
            gridListModel.onRowCountChanged.subscribe(function(e,args) {
                ok(true, "onRowCountChanged called");
                equal(args.previous, 4, "previous arg");
                equal(args.current, 3, "current arg");
                count++;
            });
            gridListModel.onPagingInfoChanged.subscribe(function(e,args) {
                ok(true, "onPagingInfoChanged called");
                same(args.pageSize, 0, "pageSize arg");
                same(args.pageNum, 0, "pageNum arg");
                same(args.totalRows, 3, "totalRows arg");
                count++;
            });
            gridListModel.updateItem(3,{cgrid:3,val:1337});
            equal(count, 2, "events fired");
            same(gridListModel.getItems()[3], {cgrid:3,val:1337}, "item updated");
            assertConsistency(gridListModel);
        }, cotc.SEVERITY_LOW));

        /**
         * AddItem Test group
         */
        var addTestGroup = gridListModelTestSuite.createTestGroup("add");

        addTestGroup.registerTest(cotr.test("add - must have id set", function() {
            var count = 0;
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems([{cgrid:0,val:0},{cgrid:1,val:1},{cgrid:2,val:2}]);
            expect(0);
            try {
                gridListModel.addItem({val:1337});
                ok(false, "exception thrown");
            }
            catch (ex) {}
        }, cotc.SEVERITY_LOW));

        addTestGroup.registerTest(cotr.test("add - must have id set (custom)", function() {
            var count = 0;
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems([{uid:0,val:0},{uid:1,val:1},{uid:2,val:2}], "uid");
            expect(0);
            try {
                gridListModel.addItem({cgrid:3,val:1337});
                ok(false, "exception thrown");
            }
            catch (ex) {}
        }, cotc.SEVERITY_LOW));

        addTestGroup.registerTest(cotr.test("add - basic", function() {
            var count = 0;
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems([{cgrid:0,val:0},{cgrid:1,val:1},{cgrid:2,val:2}]);
            gridListModel.onRowsChanged.subscribe(function(e,args) {
                ok(true, "onRowsChanged called");
                same(args, {rows:[3]}, "args");
                count++;
            });
            gridListModel.onRowCountChanged.subscribe(function(e,args) {
                ok(true, "onRowCountChanged called");
                equal(args.previous, 3, "previous arg");
                equal(args.current, 4, "current arg");
                count++;
            });
            gridListModel.onPagingInfoChanged.subscribe(function(e,args) {
                ok(true, "onPagingInfoChanged called");
                equal(args.pageSize, 0, "pageSize arg");
                equal(args.pageNum, 0, "pageNum arg");
                equal(args.totalRows, 4, "totalRows arg");
                count++;
            });
            gridListModel.addItem({cgrid:3,val:1337});
            equal(count, 3, "events fired");
            same(gridListModel.getItems()[3], {cgrid:3,val:1337}, "item updated");
            same(gridListModel.getItem(3), {cgrid:3,val:1337}, "item updated");
            assertConsistency(gridListModel);

        }, cotc.SEVERITY_LOW));

        addTestGroup.registerTest(cotr.test("add - add item not passing the filter", function() {
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems([{cgrid:0,val:0},{cgrid:1,val:1},{cgrid:2,val:2}]);
            gridListModel.setFilter(function(o) { return o["val"] !== 1337; });
            gridListModel.onRowsChanged.subscribe(function(e,args) {
                ok(false, "onRowsChanged called");
            });
            gridListModel.onRowCountChanged.subscribe(function(e,args) {
                ok(false, "onRowCountChanged called");
            });
            gridListModel.onPagingInfoChanged.subscribe(function(e,args) {
                ok(false, "onPagingInfoChanged called");
            });
            gridListModel.addItem({cgrid:3,val:1337});
            same(gridListModel.getItems()[3], {cgrid:3,val:1337}, "item updated");
            assertConsistency(gridListModel);
        }, cotc.SEVERITY_LOW));

        /**
         * InsertItem test group
         */
        var insertTestGroup = gridListModelTestSuite.createTestGroup("insert");

        insertTestGroup.registerTest(cotr.test("insert - must have id set ", function() {
            var count = 0;
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems([{cgrid:0,val:0},{cgrid:1,val:1},{cgrid:2,val:2}]);
            expect(0);
            try {
                gridListModel.insertItem(0,{val:1337});
                ok(false, "exception thrown");
            }
            catch (ex) {}
        }, cotc.SEVERITY_LOW));

        insertTestGroup.registerTest(cotr.test("insert - must have id set (custom)", function() {
            var count = 0;
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems([{uid:0,val:0},{uid:1,val:1},{uid:2,val:2}], "uid");
            expect(0);
            try {
                gridListModel.insertItem(0,{cgrid:3,val:1337});
                ok(false, "exception thrown");
            }
            catch (ex) {}
        }, cotc.SEVERITY_LOW));

        insertTestGroup.registerTest(cotr.test("insert - insert item at the beginning", function() {
            var count = 0;
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems([{cgrid:0,val:0},{cgrid:1,val:1},{cgrid:2,val:2}]);
            gridListModel.onRowsChanged.subscribe(function(e,args) {
                ok(true, "onRowsChanged called");
                same(args, {rows:[0,1,2,3]}, "args");
                count++;
            });
            gridListModel.onRowCountChanged.subscribe(function(e,args) {
                ok(true, "onRowCountChanged called");
                equal(args.previous, 3, "previous arg");
                equal(args.current, 4, "current arg");
                count++;
            });
            gridListModel.onPagingInfoChanged.subscribe(function(e,args) {
                ok(true, "onPagingInfoChanged called");
                equal(args.pageSize, 0, "pageSize arg");
                equal(args.pageNum, 0, "pageNum arg");
                equal(args.totalRows, 4, "totalRows arg");
                count++;
            });
            gridListModel.insertItem(0, {cgrid:3,val:1337});
            equal(count, 3, "events fired");
            same(gridListModel.getItem(0), {cgrid:3,val:1337}, "item updated");
            equal(gridListModel.getItems().length, 4, "items updated");
            equal(gridListModel.getLength(), 4, "rows updated");
            assertConsistency(gridListModel);
        }, cotc.SEVERITY_LOW));

        insertTestGroup.registerTest(cotr.test("insert - inserting item at the middle ", function() {
            var count = 0;
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems([{cgrid:0,val:0},{cgrid:1,val:1},{cgrid:2,val:2}]);
            gridListModel.onRowsChanged.subscribe(function(e,args) {
                ok(true, "onRowsChanged called");
                same(args, {rows:[2,3]}, "args");
                count++;
            });
            gridListModel.onRowCountChanged.subscribe(function(e,args) {
                ok(true, "onRowCountChanged called");
                equal(args.previous, 3, "previous arg");
                equal(args.current, 4, "current arg");
                count++;
            });
            gridListModel.onPagingInfoChanged.subscribe(function(e,args) {
                ok(true, "onPagingInfoChanged called");
                equal(args.pageSize, 0, "pageSize arg");
                equal(args.pageNum, 0, "pageNum arg");
                equal(args.totalRows, 4, "totalRows arg");
                count++;
            });
            gridListModel.insertItem(2,{cgrid:3,val:1337});
            equal(count, 3, "events fired");
            same(gridListModel.getItem(2), {cgrid:3,val:1337}, "item updated");
            equal(gridListModel.getItems().length, 4, "items updated");
            equal(gridListModel.getLength(), 4, "rows updated");
            assertConsistency(gridListModel);

        }, cotc.SEVERITY_LOW));

        insertTestGroup.registerTest(cotr.test("insert - inserting item at the end", function() {
            var count = 0;
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems([{cgrid:0,val:0},{cgrid:1,val:1},{cgrid:2,val:2}]);
            gridListModel.onRowsChanged.subscribe(function(e,args) {
                ok(true, "onRowsChanged called");
                same(args, {rows:[3]}, "args");
                count++;
            });
            gridListModel.onRowCountChanged.subscribe(function(e,args) {
                ok(true, "onRowCountChanged called");
                equal(args.previous, 3, "previous arg");
                equal(args.current, 4, "current arg");
                count++;
            });
            gridListModel.onPagingInfoChanged.subscribe(function(e,args) {
                ok(true, "onPagingInfoChanged called");
                equal(args.pageSize, 0, "pageSize arg");
                equal(args.pageNum, 0, "pageNum arg");
                equal(args.totalRows, 4, "totalRows arg");
                count++;
            });
            gridListModel.insertItem(3,{cgrid:3,val:1337});
            equal(count, 3, "events fired");
            same(gridListModel.getItem(3), {cgrid:3,val:1337}, "item updated");
            equal(gridListModel.getItems().length, 4, "items updated");
            equal(gridListModel.getLength(), 4, "rows updated");
            assertConsistency(gridListModel);
        }, cotc.SEVERITY_LOW));

        /**
         * deleteItem test group
         */
        var deleteTestGroup = gridListModelTestSuite.createTestGroup("delete");

        deleteTestGroup.registerTest(cotr.test("delete - must have the id set", function() {
            var count = 0;
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems([{cgrid:0,val:0},{cgrid:1,val:1},{cgrid:2,val:2}]);
            expect(0);
            try {
                gridListModel.deleteItem(-1);
                ok(false, "exception thrown");
            }
            catch (ex) {}
            try {
                gridListModel.deleteItem(undefined);
                ok(false, "exception thrown");
            }
            catch (ex) {}
            try {
                gridListModel.deleteItem(null);
                ok(false, "exception thrown");
            }
            catch (ex) {}
            try {
                gridListModel.deleteItem(3);
                ok(false, "exception thrown");
            }
            catch (ex) {}
        }, cotc.SEVERITY_LOW));

        deleteTestGroup.registerTest(cotr.test("delete - must have the id set (custom)", function() {
            var count = 0;
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems([{uid:0,id:-1,val:0},{uid:1,id:3,val:1},{uid:2,id:null,val:2}], "uid");
            expect(0);
            try {
                gridListModel.deleteItem(-1);
                ok(false, "exception thrown");
            }
            catch (ex) {}
            try {
                gridListModel.deleteItem(undefined);
                ok(false, "exception thrown");
            }
            catch (ex) {}
            try {
                gridListModel.deleteItem(null);
                ok(false, "exception thrown");
            }
            catch (ex) {}
            try {
                gridListModel.deleteItem(3);
                ok(false, "exception thrown");
            }
            catch (ex) {}
        }, cotc.SEVERITY_LOW));

        deleteTestGroup.registerTest(cotr.test("delete - deleting item at the beginning", function() {
            var count = 0;
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems([{cgrid:05,val:0},{cgrid:15,val:1},{cgrid:25,val:2}]);
            gridListModel.onRowsChanged.subscribe(function(e,args) {
                ok(true, "onRowsChanged called");
                same(args, {rows:[0,1]}, "args");
                count++;
            });
            gridListModel.onRowCountChanged.subscribe(function(e,args) {
                ok(true, "onRowCountChanged called");
                equal(args.previous, 3, "previous arg");
                equal(args.current, 2, "current arg");
                count++;
            });
            gridListModel.onPagingInfoChanged.subscribe(function(e,args) {
                ok(true, "onPagingInfoChanged called");
                equal(args.pageSize, 0, "pageSize arg");
                equal(args.pageNum, 0, "pageNum arg");
                equal(args.totalRows, 2, "totalRows arg");
                count++;
            });
            gridListModel.deleteItem(05);
            equal(count, 3, "events fired");
            equal(gridListModel.getItems().length, 2, "items updated");
            equal(gridListModel.getLength(), 2, "rows updated");
            assertConsistency(gridListModel);

        }, cotc.SEVERITY_LOW));

        deleteTestGroup.registerTest(cotr.test("delete - deleting item at the middle", function() {
            var count = 0;
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems([{cgrid:05,val:0},{cgrid:15,val:1},{cgrid:25,val:2}]);
            gridListModel.onRowsChanged.subscribe(function(e,args) {
                ok(true, "onRowsChanged called");
                same(args, {rows:[1]}, "args");
                count++;
            });
            gridListModel.onRowCountChanged.subscribe(function(e,args) {
                ok(true, "onRowCountChanged called");
                equal(args.previous, 3, "previous arg");
                equal(args.current, 2, "current arg");
                count++;
            });
            gridListModel.onPagingInfoChanged.subscribe(function(e,args) {
                ok(true, "onPagingInfoChanged called");
                equal(args.pageSize, 0, "pageSize arg");
                equal(args.pageNum, 0, "pageNum arg");
                equal(args.totalRows, 2, "totalRows arg");
                count++;
            });
            gridListModel.deleteItem(15);
            equal(count, 3, "events fired");
            equal(gridListModel.getItems().length, 2, "items updated");
            equal(gridListModel.getLength(), 2, "rows updated");
            assertConsistency(gridListModel);
        }, cotc.SEVERITY_LOW));

        deleteTestGroup.registerTest(cotr.test("delete - deleting item at the end", function() {
            var count = 0;
            var gridListModel = new Slick.Data.DataView();
            gridListModel.setItems([{cgrid:05,val:0},{cgrid:15,val:1},{cgrid:25,val:2}]);
            gridListModel.onRowsChanged.subscribe(function(e,args) {
                ok(false, "onRowsChanged called");
            });
            gridListModel.onRowCountChanged.subscribe(function(e,args) {
                ok(true, "onRowCountChanged called");
                equal(args.previous, 3, "previous arg");
                equal(args.current, 2, "current arg");
                count++;
            });
            gridListModel.onPagingInfoChanged.subscribe(function(e,args) {
                ok(true, "onPagingInfoChanged called");
                equal(args.pageSize, 0, "pageSize arg");
                equal(args.pageNum, 0, "pageNum arg");
                equal(args.totalRows, 2, "totalRows arg");
                count++;
            });
            gridListModel.deleteItem(25);
            equal(count, 2, "events fired");
            equal(gridListModel.getItems().length, 2, "items updated");
            equal(gridListModel.getLength(), 2, "rows updated");
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

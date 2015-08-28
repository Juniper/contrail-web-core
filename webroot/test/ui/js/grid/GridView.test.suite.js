/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'co-test-utils',
    'co-test-messages',
    'co-test-constants',
    'co-test-unit'
], function (_, cotu, cotm, cotc, CUnit) {

    var testSuiteClass = function (viewObj, suiteConfig){

        var viewConfig = cotu.getViewConfigObj(viewObj),
            el = viewObj.el,
            gridData = $(el).data('contrailGrid'),
            gridItems = gridData._dataView.getItems();

        var viewConfigHeader = viewConfig.elementConfig.header,
            viewConfigColHeader = viewConfig.elementConfig.columnHeader,
            viewConfigBody = viewConfig.elementConfig.body,
            viewConfigFooter = viewConfig.elementConfig.footer;

        module(cotu.formatTestModuleMessage(cotm.TEST_GRIDVIEW_GRID, el.id));

        var gridViewTestSuite = CUnit.createTestSuite('GridViewTest');

        /**
         * Grid Header group test cases
         */
        var headerTestGroup = gridViewTestSuite.createTestGroup('header');

        /**
         * Test grid title.
         */
        headerTestGroup.registerTest(CUnit.test(cotm.GRIDVIEW_GRID_TITLE, function () {
            expect(1);
            equal($(el).find('.grid-header-text').text().trim(), viewConfigHeader.title.text,
                "grid title should be equal to the title set");
        }, cotc.SEVERITY_LOW));

        /**
         * Check grid default controls data-action configured.
         * collapseable, exportable, refreshable, searchable
         */
        headerTestGroup.registerTest(CUnit.test(cotm.GRIDVIEW_DEFAULT_CONTROLS_DATA_ACTION,
            function () {
            //by default the defaultControls are all set to true. custom viewConfig may not have it.
            if (contrail.checkIfExist(viewConfigHeader.defaultControls)) {
                expect(2);
                //refreshable
                if (viewConfigHeader.defaultControls.refreshable) {
                    equal($(el).find('.grid-header .link-refreshable').attr('data-action'), 'refresh',
                        "grid should have refresh control present");
                } else {
                    equal($(el).find('.grid-header .link-refreshable').attr('data-action'), undefined,
                        "grid should not have refresh control present");
                }
                //searchable
                if (viewConfigHeader.defaultControls.searchable) {
                    equal($(el).find('.grid-header .link-searchbox').attr('data-action'), 'search',
                        "grid should have search control present");
                } else {
                    equal($(el).find('.grid-header .link-searchbox').attr('data-action'), undefined,
                        "grid should not have search control present");
                }
                //TODO class for collapseable, exportable
                /*
                 //collapseable
                 if (viewConfigHeader.defaultControls.collapseable) {
                 equal($(el).find('.grid-header').attr('data-action'), 'collapse',
                 "grid should have collapse control present");

                 } else {
                 equal($(el).find('.grid-header').attr('data-action'), undefined,
                 "grid should not have collapse control present");
                 }
                 //exportable
                 if (viewConfigHeader.defaultControls.exportable) {
                 equal($(el).find('.grid-header').attr('data-action'), 'export',
                 "grid should have export control present");

                 } else {
                 equal($(el).find('.grid-header').attr('data-action'), undefined,
                 "grid should not have export control present");
                 }
                 */
            } else {
                /**
                 * defaultControls are not present in viewConfig. which means grid will use the
                 * default defaultControls; which all the actions are set to true.
                 */
                //refreshable
                equal($(el).find('.grid-header .link-refreshable').attr('data-action'), 'refresh',
                    "grid should have refresh control present");
                //searchable
                equal($(el).find('.grid-header .link-searchbox').attr('data-action'), 'search',
                    "grid should have search control present");
            }
        }, CUnit.SEVERITY_MEDIUM));


        /**
         * Check grid default controls has icons present
         */
        headerTestGroup.registerTest(CUnit.test(cotm.GRIDVIEW_DEFAULT_CONTROLS_ICONS, function () {
            //by default the defaultControls are all set to true. custom viewConfig may not have it.
            if (contrail.checkIfExist(viewConfigHeader.defaultControls)) {
                expect(4);
                //refreshable
                if (viewConfigHeader.defaultControls.refreshable) {
                    equal($(el).find('.grid-header .widget-toolbar-icon .icon-repeat').length, 1,
                        "grid should have refresh icon present");
                } else {
                    equal($(el).find('.grid-header .widget-toolbar-icon .icon-repeat').length, 0,
                        "grid should not have refresh icon present");
                }
                //searchable
                if (viewConfigHeader.defaultControls.searchable) {
                    equal($(el).find('.grid-header .widget-toolbar-icon .icon-search').length, 1,
                        "grid should have search icon present");
                } else {
                    equal($(el).find('.grid-header .widget-toolbar-icon .icon-search').length, 0,
                        "grid should not have search icon present");
                }
                //collapseable
                if (viewConfigHeader.defaultControls.collapseable) {
                    equal($(el).find('.grid-header .widget-toolbar-icon .icon-chevron-up').length, 1,
                        "grid should have collapse icon present");

                } else {
                    equal($(el).find('.grid-header .widget-toolbar-icon .icon-chevron-up').length, 0,
                        "grid should not have collapse icon present");
                }
                //exportable
                if (viewConfigHeader.defaultControls.exportable) {
                    equal($(el).find('.grid-header .widget-toolbar-icon .icon-download-alt').length, 1,
                        "grid should have export icon present");

                } else {
                    equal($(el).find('.grid-header .widget-toolbar-icon .icon-download-alt').length, 0,
                        "grid should not have export icon present");
                }
            } else {
                /**
                 * defaultControls are not present in viewConfig. which means grid will use the
                 * default defaultControls; which all the actions are set to true.
                 */
                expect(4);
                //refreshable
                equal($(el).find('.grid-header .widget-toolbar-icon .icon-repeat').length, 1,
                    "grid should have refresh icon present");
                //searchable
                equal($(el).find('.grid-header .widget-toolbar-icon .icon-search').length, 1,
                    "grid should have search icon present");
                //collapseable
                equal($(el).find('.grid-header .widget-toolbar-icon .icon-chevron-up').length, 0,
                    "grid should have collapse icon present");
                //exportable
                equal($(el).find('.grid-header .widget-toolbar-icon .icon-download-alt').length, 1,
                    "grid should have export icon present");
            }

        }, cotc.SEVERITY_HIGH));

        /**
         * Additional column calculation
         * detail, checkboxSelectable, actionCell adds column to the grid
         * detail and checkbox columns are added to front of configured field columns and action column gets added
         * at the end.
         * For title check test case, we will add columns that are added in front, so that columns can be skipped
         * on iteration while doing assertion.
         */
        var addCols = 0,
            addStartCols = 0,
            addEndCols = 0;
        if (typeof(viewConfigBody.options.detail) === 'object') {
            addStartCols += 1;
        }
        if (typeof(viewConfigBody.options.checkboxSelectable) === 'object') {
            addStartCols += 1;
        }
        //actionCell adds column at the end.
        if (typeof(viewConfigBody.options.actionCell) === 'object') {
            addEndCols += 1;
        }
        addCols = addStartCols + addEndCols;

        /**
         * Check column names
         */
        headerTestGroup.registerTest(CUnit.test(cotm.GRIDVIEW_COLUMN_TITLE, function () {
            var colNames = $(el).find('.slick-header-column .slick-column-name');
            for (var i = 0; i < viewConfigColHeader.columns.length; i++) {
                //skip the additional columns if present
                equal($(colNames[i + addStartCols]).text().trim(), viewConfigColHeader.columns[i].name,
                    "Column title should be same");
            }
        }, cotc.SEVERITY_MEDIUM));

        /**
         * Check the loaded columns
         */
        headerTestGroup.registerTest(CUnit.test(cotm.GRIDVIEW_COLUMNS_LOADED, function () {
            expect(1);
            equal($(el).find('.slick-header-column').length, (viewConfigColHeader.columns.length + addCols),
                "loaded columns should be equal to the config");
        }, cotc.SEVERITY_HIGH));

        /**
         * Test grid header has checkbox selectable enabled
         */
        headerTestGroup.registerTest(CUnit.test(cotm.GRIDVIEW_HEADER_COLUMN_CHECKBOX, function () {
            expect(1);
            if (viewConfigBody.options.checkboxSelectable) {
                equal($(el).find('.slick-header-columns .headerRowCheckbox').length, 1,
                    "Column header must have checkbox enabled");
            } else {
                equal($(el).find('.slick-header-columns .headerRowCheckbox').length, 0,
                    "Column header should not have checkbox enabled");
            }
        }, cotc.SEVERITY_MEDIUM));

        /**
         * Grid Body group test cases
         */

        var pageSize = viewConfigFooter.pager.options.pageSize;
        var bodyTestGroup = gridViewTestSuite.createTestGroup('body');

        /**
         * Check the loaded rows
         */
        bodyTestGroup.registerTest(CUnit.test(cotm.GRIDVIEW_ROWS_LOADED, function () {
            expect(1);
            equal($(el).find('.slick-row-master').length, (gridItems.length < pageSize) ? gridItems.length : pageSize,
                "Loaded rows must be equal to pageSize or size of the data if less");
        }, cotc.SEVERITY_HIGH));


        /**
         * test checkbox selectable config
         */
        bodyTestGroup.registerTest(CUnit.test(cotm.GRIDVIEW_ROWS_CHECKBOX, function () {
            expect(1);
            if (viewConfigBody.options.checkboxSelectable) {
                equal($(el).find('.slick-row-master .rowCheckbox').length,
                    (gridItems.length < pageSize) ? gridItems.length : pageSize,
                    "Loaded rows all must have checkbox enabled");
            } else {
                equal($(el).find('.slick-row-master .rowCheckbox').length, 0,
                    "Loaded rows should not have checkbox enabled");
            }
        }, cotc.SEVERITY_MEDIUM));

        /**
         * detail rows enabled?
         */
        if (contrail.checkIfExist(viewConfigBody.options.detail)) {
            //count the detail toggle icons. make sure all rows has it
            bodyTestGroup.registerTest(CUnit.test(cotm.GRIDVIEW_DETAIL_ROWS_ICON, function () {
                expect(1);
                equal($(el).find('.slick-row-master .toggleDetailIcon').length,
                    (gridItems.length < pageSize) ? gridItems.length : pageSize,
                    "All rows should have the detail toggle icon present");
            }, cotc.SEVERITY_HIGH));

            //toggle detail icon, check the details html.
            bodyTestGroup.registerTest(CUnit.test(cotm.GRIDVIEW_DETAIL_ROW_TOGGLE, function () {
                //simulate click on first row detail toggle icon
                $(el).find('.slick_row_id_0 .toggleDetailIcon').trigger('click');
                //get the details html
                var domDetailsHtml_id0 = $(el).find('.slick-row-detail .slick-row-detail-template-id_0').html();

                //generate one using the template and data from the model
                //since the data is already present, request state is set to SUCCESS_NOT_EMPTY
                var detailsHtml_id0 = Handlebars.compile(viewConfigBody.options.detail.template)({
                    data: gridItems[0],
                    requestState: cowc.DATA_REQUEST_STATE_SUCCESS_NOT_EMPTY
                });

                equal(domDetailsHtml_id0, detailsHtml_id0,
                    "Details row html content should be equal to the one generated from view config template");

                //simulate click to toggle the details row.
                $(el).find('.slick_row_id_0 .toggleDetailIcon').trigger('click');
            }, cotc.SEVERITY_HIGH));

        } else {
            bodyTestGroup.registerTest(CUnit.test(cotm.GRIDVIEW_DETAIL_ROWS_ICON, function () {
                expect(1);
                equal($(el).find('.slick-row-master .toggleDetailIcon').length, 0, "Zero detail toggle icons present.");
            }, cotc.SEVERITY_HIGH));
        }

        /**
         * check fixed row height
         */
        bodyTestGroup.registerTest(CUnit.test(cotm.GRIDVIEW_ROW_FIXED_HEIGHT, function () {
            expect(1);
            equal($(el).find('.slick_row_id_0').css('height'), viewConfigBody.options.fixedRowHeight + "px",
                "Fixed row height should equal to configured.");
        }, cotc.SEVERITY_HIGH));


        /**
         * Grid Footer group test cases
         */
        var footerTestGroup = gridViewTestSuite.createTestGroup('footer');

        //Test footer pager info
        footerTestGroup.registerTest(CUnit.test(cotm.GRIDVIEW_FOOTER_PAGER_INFO, function () {
            expect(1);
            equal($(el).find('.slick-pager-info').text().trim(), 'Total: ' + gridItems.length + ' records',
                "pager info should display total records present");
        }, cotc.SEVERITY_HIGH));

        //Footer pager size default should equal page size in config
        footerTestGroup.registerTest(CUnit.test(cotm.GRIDVIEW_FOOTER_PAGER_SIZE, function () {
            expect(1);
            equal($(el).find('.slick-pager-sizes .select2-chosen').text().trim(),
                viewConfigFooter.pager.options.pageSize + ' Records',
                "page size selection should match default set");
        }, cotc.SEVERITY_HIGH));


        gridViewTestSuite.run(suiteConfig.groups, suiteConfig.severity);

    };

    return testSuiteClass;
});
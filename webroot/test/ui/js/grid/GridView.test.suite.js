/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'handlebars',
    'co-test-utils',
    'co-test-messages',
    'co-test-constants',
    'co-test-runner'
], function (_, Handlebars, cotu, cotm, cotc, cotr) {

    var testSuiteClass = function (viewObj, suiteConfig){

        var viewConfig = cotu.getViewConfigObj(viewObj),
            el = viewObj.el,
            gridData = $(el).data('contrailGrid'),
            gridItems = gridData._dataView.getItems(),
            gridConfig =  $.extend(true, {}, covdc.gridConfig, viewConfig.elementConfig);

        var viewConfigHeader = gridConfig.header,
            viewConfigColHeader = gridConfig.columnHeader,
            viewConfigBody = gridConfig.body,
            viewConfigFooter = gridConfig.footer;

        module(cotu.formatTestModuleMessage(cotm.TEST_GRIDVIEW_GRID, el.id));

        var gridViewTestSuite = cotr.createTestSuite('GridViewTest');

        /**
         * Grid Header group test cases
         */
        var headerTestGroup = gridViewTestSuite.createTestGroup('header');

        /**
         * Test grid title.
         */
        headerTestGroup.registerTest(cotr.test(cotm.GRIDVIEW_GRID_TITLE, function () {
            expect(1);
            equal($(el).find('.grid-header-text').text().trim(), viewConfigHeader.title.text,
                "grid title should be equal to the title set");
        }, cotc.SEVERITY_LOW));

        /**
         * Check grid default controls data-action configured.
         * collapseable, exportable, refreshable, searchable
         */
        headerTestGroup.registerTest(cotr.test(cotm.GRIDVIEW_DEFAULT_CONTROLS_DATA_ACTION,
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
            }, cotr.SEVERITY_MEDIUM));


        /**
         * Check grid default controls has icons present
         */
        headerTestGroup.registerTest(cotr.test(cotm.GRIDVIEW_DEFAULT_CONTROLS_ICONS, function () {
            //by default the defaultControls are all set to true. custom viewConfig may not have it.
            if (contrail.checkIfExist(viewConfigHeader.defaultControls)) {
                expect(4);
                //refreshable
                if (viewConfigHeader.defaultControls.refreshable) {
                    equal($(el).find('.grid-header .widget-toolbar-icon .fa-repeat').length, 1,
                        "grid should have refresh icon present");
                } else {
                    equal($(el).find('.grid-header .widget-toolbar-icon .fa-repeat').length, 0,
                        "grid should not have refresh icon present");
                }
                //searchable
                if (viewConfigHeader.defaultControls.searchable) {
                    equal($(el).find('.grid-header .widget-toolbar-icon .fa-search').length, 1,
                        "grid should have search icon present");
                } else {
                    equal($(el).find('.grid-header .widget-toolbar-icon .fa-search').length, 0,
                        "grid should not have search icon present");
                }
                //collapseable
                if (viewConfigHeader.defaultControls.collapseable) {
                    // either up or down collapseable should be present.
                    var collapseable = $(el).find('.grid-header .widget-toolbar-icon .fa-chevron-up').length |
                        $(el).find('.grid-header .widget-toolbar-icon .fa-chevron-down').length;

                    equal(collapseable, 1, "grid should have collapse icon present");

                } else {
                    equal($(el).find('.grid-header .widget-toolbar-icon .fa-chevron-up').length, 0,
                        "grid should not have collapse icon present");
                }
                //exportable
                if (viewConfigHeader.defaultControls.exportable) {
                    equal($(el).find('.grid-header .widget-toolbar-icon .fa-download').length, 1,
                        "grid should have export icon present");

                } else {
                    equal($(el).find('.grid-header .widget-toolbar-icon .fa-download').length, 0,
                        "grid should not have export icon present");
                }
            } else {
                /**
                 * defaultControls are not present in viewConfig. which means grid will use the
                 * default defaultControls; which all the actions are set to true.
                 */
                expect(4);
                //refreshable
                equal($(el).find('.grid-header .widget-toolbar-icon .fa-repeat').length, 1,
                    "grid should have refresh icon present");
                //searchable
                equal($(el).find('.grid-header .widget-toolbar-icon .fa-search').length, 1,
                    "grid should have search icon present");
                //collapseable
                equal($(el).find('.grid-header .widget-toolbar-icon .fa-chevron-up').length, 0,
                    "grid should have collapse icon present");
                //exportable
                equal($(el).find('.grid-header .widget-toolbar-icon .fa-download').length, 1,
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
        if (typeof(viewConfigBody.options.actionCell) === 'object' ||
            viewConfigBody.options.actionCell instanceof Function) {
            addEndCols += 1;
        }
        addCols = addStartCols + addEndCols;

        /**
         * Check column names
         */
        headerTestGroup.registerTest(cotr.test(cotm.GRIDVIEW_COLUMN_TITLE, function () {
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
        headerTestGroup.registerTest(cotr.test(cotm.GRIDVIEW_COLUMNS_LOADED, function () {
            expect(1);
            equal($(el).find('.slick-header-column').length, (viewConfigColHeader.columns.length + addCols),
                "loaded columns should be equal to the config");
        }, cotc.SEVERITY_HIGH));

        /**
         * Test grid header has checkbox selectable enabled
         */
        headerTestGroup.registerTest(cotr.test(cotm.GRIDVIEW_HEADER_COLUMN_CHECKBOX, function () {
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
         * Config validation test case
         */

        headerTestGroup.registerTest(cotr.test("Test if the columns are present", function () {
            expect(2);
            notEqual(viewConfigColHeader.columns.length ,undefined, "Columns should always be present");
            notEqual(viewConfigColHeader.columns.length,0,"Columns header cannot be empty");

        }, cotc.SEVERITY_HIGH));

        /**
         * Grid Body group test cases
         */

        var pageSize = viewConfigFooter ? viewConfigFooter.pager.options.pageSize : 0;
        var bodyTestGroup = gridViewTestSuite.createTestGroup('body');
        if(viewConfigFooter) {
            /**
             * Check the loaded rows
             */
            bodyTestGroup.registerTest(cotr.test(cotm.GRIDVIEW_ROWS_LOADED, function () {
                expect(1);
                equal($(el).find('.slick-row-master').length, (gridItems.length < pageSize) ? gridItems.length : pageSize,
                    "Loaded rows must be equal to pageSize or size of the data if less");
            }, cotc.SEVERITY_HIGH));


            /**
             * test checkbox selectable config
             */
            bodyTestGroup.registerTest(cotr.test(cotm.GRIDVIEW_ROWS_CHECKBOX, function () {
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
        }

        /**
         * Config validation check test cases
         */

        bodyTestGroup.registerTest(cotr.test("Test if the data source is present", function () {
            expect(1);
            notEqual(viewConfigBody.dataSource ,undefined, "Data source should always be present");

        }, cotc.SEVERITY_HIGH));


        if(viewConfigBody.dataSource.remote!=null) {
            bodyTestGroup.registerTest(cotr.test("Test if the ajax config is valid", function () {
                expect(3);
                notEqual(viewConfigBody.dataSource.remote.ajaxConfig.url, undefined, "datasource url should not be undefined");
                notEqual(viewConfigBody.dataSource.remote.ajaxConfig.url, "",  "datasource url should not be empty");
                notEqual(viewConfigBody.dataSource.remote.ajaxConfig.type, "",  "datasource type cannot be empty");

            }, cotc.SEVERITY_HIGH));
        }

        bodyTestGroup.registerTest(cotr.test("Test if only boolean values are present ", function () {
            var boolValues = {};
            boolValues['true'] = true;
            boolValues['false'] = true;
            equal(boolValues[viewConfigBody.options.autoRefresh] ,true, "Autorefresh values cannot be non-boolean");

        }, cotc.SEVERITY_HIGH));

        bodyTestGroup.registerTest(cotr.test("Test if the details contains template ", function () {
            expect(3);
            notEqual(viewConfigBody.options.detail.template ,undefined, "Template cannot be undefined");
            notEqual(viewConfigBody.options.detail.template ," ", "Template cannot be empty");
            equal(isNaN(viewConfigBody.options.detail.template), true, "Template cannot be a numeric value");


        }, cotc.SEVERITY_HIGH));

        /**
         * detail rows enabled?
         */
        if (contrail.checkIfExist(viewConfigBody.options.detail)) {
            //count the detail toggle icons. make sure all rows has it
            if(viewConfigFooter) {
                bodyTestGroup.registerTest(cotr.test(cotm.GRIDVIEW_DETAIL_ROWS_ICON, function () {
                    expect(1);
                    equal($(el).find('.slick-row-master .toggleDetailIcon').length,
                        (gridItems.length < pageSize) ? gridItems.length : pageSize,
                        "All rows should have the detail toggle icon present");
                }, cotc.SEVERITY_HIGH));
            }

            //toggle detail icon, check the details html.
            bodyTestGroup.registerTest(cotr.test(cotm.GRIDVIEW_DETAIL_ROW_TOGGLE, function () {
                //get the cgrid of the first row
                var cgrid = $(el).find('.slick-row:first').attr('data-cgrid');

                //simulate click on first row detail toggle icon
                $(el).find('.slick_row_' + cgrid + ' .toggleDetailIcon').trigger('click');

                //get the details html
                var domDetailsHtml = $(el).find('.slick-row-detail .slick-row-detail-template-' + cgrid).html();

                //generate one using the template and data from the model
                //since the data is already present, request state is set to SUCCESS_NOT_EMPTY
                var detailsHtmlObj = $(Handlebars.compile(viewConfigBody.options.detail.template)({
                        data: gridItems[0],
                        ignoreKeys: ['cgrid'],
                        requestState: cowc.DATA_REQUEST_STATE_SUCCESS_NOT_EMPTY
                    })),
                    detailsHtml = detailsHtmlObj.prop('outerHTML');

                equal(domDetailsHtml, detailsHtml,
                    "Details row html content should be equal to the one generated from view config template");

                //check basic view/advanced view if the advanced view is enabled.
                //default or attr not present is true/enabled.

                /**
                 * details elements will always come in this order from left to right
                 * basic, advanced
                 */
                var detailEls = $(el).find('.slick-row-detail-container .detail-foundation-action-item');

                if (viewConfigBody.options.detail.advancedViewOptions) {
                    //check advanced view icon
                    equal($(detailEls[1]).attr('data-view'),
                        "advanced-json", "advanced view icon data-view check");

                    //trigger click on advanced view
                    $(detailEls[1]).trigger("click");

                    equal($(el).find('.slick-row-detail-container .detail-foundation-content-advanced').html(),
                        contrail.formatJSON2HTML(gridItems[0].rawData, 2),
                        "advanced view HTML should equal to the generated JSON HTML content");

                    //check basic view icon
                    equal($(detailEls[0]).attr('data-view'),
                        "basic-list", "basic view icon data-view check");

                    //trigger click on basic view
                    $(detailEls[0]).trigger("click");

                }
                //simulate click to toggle the details row.
                $(el).find('.slick_row_' + cgrid + ' .toggleDetailIcon').trigger('click');


            }, cotc.SEVERITY_HIGH));

        } else {
            bodyTestGroup.registerTest(cotr.test(cotm.GRIDVIEW_DETAIL_ROWS_ICON, function () {
                expect(1);
                equal($(el).find('.slick-row-master .toggleDetailIcon').length, 0, "Zero detail toggle icons present.");
            }, cotc.SEVERITY_HIGH));
        }

        /**
         * check fixed row height
         */
        bodyTestGroup.registerTest(cotr.test(cotm.GRIDVIEW_ROW_FIXED_HEIGHT, function () {
            expect(1);
            if (viewConfigBody.options.fixedRowHeight != false && _.isNumber(viewConfigBody.options.fixedRowHeight)) {
                //get the cgrid of the first row
                var cgrid = $(el).find('.slick-row:first').attr('data-cgrid');
                equal($(el).find('.slick_row_' + cgrid).css('height'), viewConfigBody.options.fixedRowHeight + "px",
                    "Fixed row height should equal to configured.");
            } else {
                ok(true, "Fixed row height is set to false");
            }
        }, cotc.SEVERITY_HIGH));

        bodyTestGroup.registerTest(cotr.test(cotm.GRIDVIEW_ROW_FIXED_HEIGHT, function () {
            expect(1);
            if (viewConfigBody.options.fixedRowHeight != false && _.isNumber(viewConfigBody.options.fixedRowHeight)) {
                //get the cgrid of the first row
                var cgrid = $(el).find('.slick-row:first').attr('data-cgrid');
                equal($(el).find('.slick_row_' + cgrid).css('height'), viewConfigBody.options.fixedRowHeight + "px",
                    "Fixed row height should equal to configured.");
            } else {
                ok(true, "Fixed row height is set to false");
            }
        }, cotc.SEVERITY_HIGH));

        /**
         * Grid Footer group test cases
         */
        var footerTestGroup = gridViewTestSuite.createTestGroup('footer');

        if(viewConfigFooter) {
            //Test footer pager info
            footerTestGroup.registerTest(cotr.test(cotm.GRIDVIEW_FOOTER_PAGER_INFO, function () {
                expect(1);
                equal($(el).find('.slick-pager-info').text().trim(), 'Total: ' + gridItems.length + ' records',
                    "pager info should display total records present");
            }, cotc.SEVERITY_HIGH));

            //Footer pager size default should equal page size in config
            footerTestGroup.registerTest(cotr.test(cotm.GRIDVIEW_FOOTER_PAGER_SIZE, function () {
                expect(1);
                equal($(el).find('.slick-pager-sizes .select2-chosen').text().trim(),
                    viewConfigFooter.pager.options.pageSize + ' Records',
                    "page size selection should match default set");
            }, cotc.SEVERITY_HIGH));

            //Landing page should always have minumum of 1 Page in the dropdown.
            footerTestGroup.registerTest(cotr.test(cotm.GRIDVIEW_FOOTER_NAVIGATION_PAGE_NUMBER, function () {
                expect(1);
                equal($(el).find('.slick-pager-nav .select2-chosen').text().trim(),
                    'Page 1',
                    "Navigation should have minumum 1 Page in the dropdown");
            }, cotc.SEVERITY_HIGH));

            /**
             * Footer should have correct number of pages for a given Page size, based on the number of rows.
             */
            footerTestGroup.registerTest(cotr.test(cotm.GRIDVIEW_FOOTER_TOTAL_PAGES, function () {
                expect(1);
                var expectedCount = Math.ceil(gridItems.length/viewConfigFooter.pager.options.pageSize);
                equal($(el).find('.csg-total-page-count').text().trim(),
                    expectedCount,
                    "The total number of pages should be according to page size");
            }, cotc.SEVERITY_HIGH));

        }
        gridViewTestSuite.run(suiteConfig.groups, suiteConfig.severity);

    };

    return testSuiteClass;
});

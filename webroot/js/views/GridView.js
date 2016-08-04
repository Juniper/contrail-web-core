/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'core-basedir/js/views/GridFooterView',
    'slick.checkboxselectcolumn',
    'slick.grid','slick.rowselectionmodel',
    'jquery-ui',
    'jquery.multiselect',
    'jquery.multiselect.filter'
], function (_, ContrailView, ContrailListModel, GridFooterView) {
    var GridView = ContrailView.extend({
        render: function () {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                listModelConfig = $.extend(true, {}, viewConfig.elementConfig['body']['dataSource']),
                modelMap = contrail.handleIfNull(self.modelMap, {}),
                contrailListModel, gridConfig, gridContainer,
                customGridConfig;

            var grid = null, dataView = null, footerPager = null,
                gridDataSource, gridColumns = [], gridSortColumns = [], gridOptions,
                autoRefreshInterval = false, searchColumns = [],
                currentSelectedRows = [],
                dvConfig = null, eventHandlerMap = {grid: {}, dataView: {}},
                scrolledStatus = {scrollLeft: 0, scrollTop: 0},
                adjustAllRowHeightTimer = null;

            if (contrail.checkIfExist(viewConfig.modelKey) && contrail.checkIfExist(modelMap[viewConfig.modelKey])) {
                self.model = modelMap[viewConfig.modelKey]
            }

            contrailListModel = (self.model != null && self.model['_type'] === 'contrailListModel') ? self.model : new ContrailListModel(listModelConfig);

            //delete viewConfig.elementConfig['body']['dataSource']['remote'];
            //viewConfig.elementConfig['body']['dataSource'] = {dataView: contrailListModel};
            viewConfig.elementConfig['body']['dataSource']['dataView'] = contrailListModel;


            gridConfig = $.extend(true, {}, covdc.gridConfig, viewConfig.elementConfig);
            gridContainer = $(this.$el);
            // gridContainer = $(contentContainer);
            customGridConfig = $.extend(true, {}, gridConfig);

            if (contrail.checkIfExist(gridContainer.data('contrailGrid'))) {
                gridContainer.data('contrailGrid').destroy();
            }

            gridContainer.addClass('contrail-grid');
            gridDataSource = gridConfig.body.dataSource;
            gridColumns = gridConfig.columnHeader.columns;
            gridOptions = gridConfig.body.options;
            gridConfig.footer = ($.isEmptyObject(gridConfig.footer)) ? false : gridConfig.footer;

            if (contrail.checkIfKeyExistInObject(true, customGridConfig, 'footer.pager.options.pageSizeSelect')) {
                gridConfig.footer.pager.options.pageSizeSelect = customGridConfig.footer.pager.options.pageSizeSelect;
            }

            if (gridOptions.fixedRowHeight != false && _.isNumber(gridOptions.fixedRowHeight)) {
                gridOptions.rowHeight = gridOptions.fixedRowHeight;
            }

            if (gridColumns.length === 0) {
                initGridHeader();
                gridContainer.append('<div class="grid-body ui-widget"><div class="grid-load-status">No Columns found.</div></div>');
                gridContainer.find('.grid-header-icon-loading').hide();
                return;
            }

            if (contrail.checkIfExist(gridDataSource.dataView)) {
                dataView = gridDataSource.dataView;
                var dataViewData = dataView.getItems();
                //TODO: We should not need to set data with empty array.
                dataView.setData([]);
                initContrailGrid(dataView);
                initDataView(gridConfig);
                dataView.setSearchFilter(searchColumns, searchFilter);
                initClientSidePagination();
                initGridFooter();
                dataView.setData(dataViewData);
            }

            if (contrailListModel.isRequestInProgress()) {
                gridContainer.addClass('grid-state-fetching');
                if (gridOptions.disableRowsOnLoading) {
                    gridContainer.addClass('grid-state-fetching-rows');
                }
            }

            if (contrailListModel.loadedFromCache || !(contrailListModel.isRequestInProgress())) {
                if (contrail.checkIfExist(gridContainer.data('contrailGrid'))) {
                    gridContainer.data('contrailGrid').removeGridLoading();
                    handleGridMessage();
                    performSort(gridSortColumns);
                }
            }

            contrailListModel.onAllRequestsComplete.subscribe(function () {
                if (contrail.checkIfExist(gridContainer.data('contrailGrid'))) {
                    gridContainer.data('contrailGrid').removeGridLoading();
                    handleGridMessage();

                    performSort(gridSortColumns);
                    //TODO: Execute only in refresh case.
                    if (gridConfig.header.defaultControls.refreshable) {
                        setTimeout(function () {
                            gridContainer.find('.link-refreshable i').removeClass('fa-spin fa-spinner').addClass('fa fa-repeat');
                        }, 1000);
                    }
                }
            });

            function handleGridMessage() {
                if(contrailListModel.error) {
                    if(contrailListModel.errorList.length > 0) {
                        gridContainer.data('contrailGrid').showGridMessage('error', 'Error: ' + contrailListModel.errorList[0].responseText);
                    } else {
                        gridContainer.data('contrailGrid').showGridMessage('error');
                    }
                } else if (gridOptions.defaultDataStatusMessage && contrailListModel.getItems().length == 0) {
                    gridContainer.data('contrailGrid').showGridMessage('empty')
                }
            };

            function searchFilter(item, args) {
                var returnFlag = false;

                if (args.searchString == "") {
                    returnFlag = true;
                } else {
                    $.each(args.searchColumns, function (key, val) {
                        var queryString = String(item[val.field]);
                        if (contrail.checkIfFunction(val.formatter)) {
                            queryString = String(val.formatter(0, 0, 0, 0, item));
                        }
                        if (contrail.checkIfFunction(val.searchFn)) {
                            queryString = String(val.searchFn(item));
                        }

                        var argSearchStr = args.searchString.trim().toLowerCase(),
                            queryStrLower = queryString.toLowerCase();

                        //extending search to comma separted input values
                        if (argSearchStr.indexOf(',') === -1) {
                            if (queryStrLower.indexOf(argSearchStr) != -1) {
                                returnFlag = true;
                            }
                        } else {
                            var searchStrArray = args.searchString.split(',');
                            for (var i = 0; i < searchStrArray.length; i++) {
                                var searchStr = searchStrArray[i].trim().toLowerCase();
                                if (searchStrArray[i] != '' && (queryStrLower.indexOf(searchStr)) != -1) {
                                    returnFlag = true;
                                }
                            }
                        }
                    });
                }
                return returnFlag;
            };

            function startAutoRefresh(refreshPeriod) {
                if (refreshPeriod && !autoRefreshInterval) {
                    autoRefreshInterval = setInterval(function () {
                        if (gridContainer.find('.grid-body').is(':visible')) {
                            gridContainer.data('contrailGrid').refreshData();
                        }
                        else {
                            stopAutoRefresh();
                        }
                    }, refreshPeriod * 1000);
                }
            };

            function stopAutoRefresh() {
                if (autoRefreshInterval) {
                    clearInterval(autoRefreshInterval);
                    autoRefreshInterval = false;
                }
            };

            function initContrailGrid(dataObject) {
                var checkboxSelector = new Slick.CheckboxSelectColumn({
                    cssClass: "slick-cell-checkboxsel"
                });
                initGridHeader();
                initGridBodyOptions(checkboxSelector);
                gridContainer.append('<div class="grid-body"></div>');
                if (gridOptions.autoHeight == false) {
                    gridContainer.find('.grid-body').height(gridOptions.gridHeight);
                }
                var visibleColumns = [];
                $.each(gridColumns, function(key, column) {
                    if ((contrail.checkIfExist(column.hide) && !(column.hide)) ||
                        !contrail.checkIfExist(column.hide)) {
                        visibleColumns.push(column);
                    }
                });
                grid = new Slick.Grid(gridContainer.find('.grid-body'), dataObject, visibleColumns, gridOptions);
                grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: false}));
                grid.registerPlugin(checkboxSelector);
                gridContainer.find('.grid-canvas').prepend('<div class="grid-load-status hide"></div>');
                initGridEvents();
                setDataObject4ContrailGrid();
                gridContainer.data('contrailGrid').showGridMessage('loading');
            };

            function initGridHeader() {
                // Grid Header - Title + Other Actions like Expand/Collapse, Search and Custom actions
                if (gridConfig.header) {
                    generateGridHeaderTemplate(gridConfig.header);

                    gridContainer.find('.grid-widget-header .widget-toolbar-icon, .grid-widget-header .grid-header-text').on('click', function (e) {
                        if (!$(this).hasClass('disabled-link')) {
                            var command = $(this).attr('data-action'),
                                gridHeader = $(this).parents(".grid-header");

                            switch (command) {
                                case 'search':
                                    gridHeader.find('.link-searchbox').toggleElement();
                                    gridHeader.find('.input-searchbox').toggleElement();
                                    if (gridHeader.find('.input-searchbox').is(':visible')) {
                                        gridHeader.find('.input-searchbox input').focus();
                                    } else {
                                        gridHeader.find('.input-searchbox input').val('');
                                    }
                                    e.stopPropagation();
                                    break;
                                case 'multiselect':
                                    var linkMultiselectBox = $(this).parent().find('.link-multiselectbox'),
                                        inputMultiselectBox = $(this).parent().find('.input-multiselectbox');

                                    linkMultiselectBox.toggle();
                                    inputMultiselectBox.toggle();
                                    if (inputMultiselectBox.is(':visible')) {
                                        inputMultiselectBox.find('.input-icon').data('contrailCheckedMultiselect').open();
                                    }
                                    e.stopPropagation();
                                    break;
                                case 'refresh':
                                    if (!contrailListModel.isRequestInProgress()) {
                                        gridContainer.find('.link-refreshable i').removeClass('fa-repeat').addClass('fa fa-spin fa-spinner');
                                        gridContainer.data('contrailGrid').refreshData();
                                    }
                                    break;
                                case 'export':
                                    if (!contrailListModel.isRequestInProgress()) {
                                        var gridDSConfig = gridDataSource,
                                            gridData = [], dv;

                                        gridContainer.find('a[data-action="export"] i').removeClass('fa-download').addClass('fa fa-spin fa-spinner');
                                        gridContainer.find('a[data-action="export"]').prop('title', 'Exporting...').data('action', 'exporting').addClass('blue');
                                        if (contrail.checkIfExist(gridDSConfig.remote) && gridDSConfig.remote.serverSidePagination) {
                                            var exportCB = gridDSConfig.remote.exportFunction;
                                            if (exportCB != null) {
                                                exportCB(gridConfig, gridContainer);
                                            }
                                        } else {
                                            dv = gridContainer.data('contrailGrid')._dataView;
                                            gridData = dv.getItems();
                                            exportGridData2CSV(gridConfig, gridData);
                                            setTimeout(function () {
                                                gridContainer.find('a[data-action="export"] i').addClass('fa fa-download').removeClass('fa-spin fa-spinner');
                                                gridContainer.find('a[data-action="export"]').prop('title', 'Export as CSV').data('action', 'export').removeClass('blue');
                                            }, 500);
                                        }
                                    }
                                    break;
                                case 'collapse':
                                    gridHeader.find('i.collapse-icon').toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');

                                    if (gridHeader.find('i.collapse-icon').hasClass('fa-chevron-up')) {
                                        gridContainer.children().removeClass('collapsed');
                                        gridContainer.data('contrailGrid').refreshView();
                                    } else if (gridHeader.find('i.collapse-icon').hasClass('fa-chevron-down')) {
                                        gridContainer.children().addClass('collapsed');
                                        gridHeader.show();
                                    }
                                    break;
                            }
                        }
                    });

                    gridContainer.find('[data-action="widget-collapse"]')
                        .off('click')
                        .on('click', function (event) {
                            gridContainer.data('contrailGrid').expand();
                        });

                    $.each(gridColumns, function (key, val) {
                        // Setting searchable:true for columns wherever necessary
                        if (gridConfig.header.defaultControls.searchable) {
                            if (typeof val.searchable == 'undefined' || val.searchable != false)
                                searchColumns.push(val);
                        }
                        if (!contrail.checkIfExist(val.tooltip)) {
                            val.toolTip = val.name;
                        }
                        if (gridOptions.fixedRowHeight != false && _.isNumber(gridOptions.fixedRowHeight)) {
                            val.cssClass = (contrail.checkIfExist(val.cssClass) ? val.cssClass + ' ' : '') +
                                'fixed-row-height height-' + (gridOptions.fixedRowHeight);
                        }
                    });
                }

                $.each(gridColumns, function (columnKey, columnValue) {
                    // Setting sortable:true for columns wherever necessary
                    if (gridOptions.sortable != false) {
                        if (!contrail.checkIfExist(columnValue.sortable)) {
                            gridColumns[columnKey].sortable = true;
                        }
                        if (contrail.checkIfExist(gridOptions.sortable.defaultSortCols) && contrail.checkIfExist(gridOptions.sortable.defaultSortCols[columnValue.field])) {
                            gridOptions.sortable.defaultSortCols[columnValue.field].sortCol = columnValue;
                        }
                    }
                    else {
                        gridColumns[columnKey].sortable = false;
                    }

                    if ($.isPlainObject(columnValue.formatter)) {
                        columnValue.formatterObj = _.clone(columnValue.formatter)
                        columnValue.formatter = function (r, c, v, cd, dc) {
                            var formatterObj = columnValue.formatterObj,
                                fieldValue = dc[columnValue.field],
                                options = contrail.checkIfExist(formatterObj.options) ? formatterObj.options : {};

                            options.dataObject = dc;

                            if (contrail.checkIfExist(formatterObj.path)) {
                                fieldValue = contrail.getObjectValueByPath(dc, formatterObj.path);
                            }

                            return cowf.getFormattedValue(formatterObj.format, fieldValue, options);
                        };
                    }

                    if (!contrail.checkIfExist(gridColumns[columnKey].id)) {
                        gridColumns[columnKey].id = columnValue.field + '_' + columnKey;
                    }
                });
            };

            function initGridBodyOptions(checkboxSelector) {
                if (contrail.checkIfExist(gridOptions)) {
                    var columns = [];
                    // Adds checkbox to all rows and header for select all functionality
                    if (gridOptions.checkboxSelectable != false) {
                        columns = [];
                        columns.push($.extend(true, {}, checkboxSelector.getColumnDefinition(), {
                            headerCssClass: 'center',
                            cssClass: 'center',
                            formatter: function (r, c, v, cd, dc) {
                                var selectedRows = (contrail.checkIfExist(grid)) ? grid.getSelectedRows() : [];
                                var enabled = true;
                                if (contrail.checkIfFunction(gridOptions.checkboxSelectable.enableRowCheckbox)) {
                                    enabled = gridOptions.checkboxSelectable.enableRowCheckbox(dc);
                                }
                                if (enabled) {
                                    return (selectedRows.indexOf(r) == -1) ?
                                    '<input type="checkbox" class="ace-input rowCheckbox" value="' + r + '"/> <span class="ace-lbl"></span>' :
                                    '<input type="checkbox" class="ace-input rowCheckbox" checked="checked" value="' + r + '"/> <span class="ace-lbl"></span>';

                                }
                                else {
                                    return '<input type="checkbox" class="ace-input rowCheckbox" value="' + r + '" disabled=true/> <span class="ace-lbl"></span>';
                                  }
                            },
                            name: '<input type="checkbox" class="ace-input headerRowCheckbox" disabled=true/> <span class="ace-lbl"></span>'
                        }));

                        columns = columns.concat(gridColumns);
                        gridColumns = columns;
                    }

                    if (gridOptions.detail != false) {
                        columns = [];
                        columns.push({
                            focusable: true,
                            formatter: function (r, c, v, cd, dc) {
                                return '<i class="fa fa-caret-right toggleDetailIcon slick-row-detail-icon"></i>';
                            },
                            id: "_detail_row_icon",
                            rerenderOnResize: false,
                            resizable: false,
                            selectable: true,
                            sortable: false,
                            cssClass: 'center',
                            width: 30,
                            searchable: false,
                            exportConfig: {
                                allow: false
                            },
                            events: {
                                onClick: function (e, dc) {
                                    var target = e.target;
                                    if ($(target).hasClass('fa-caret-right')) {

                                        if (!$(target).parents('.slick-row-master').next().hasClass('slick-row-detail') || $(target).parents('.slick-row-master').next().hasClass('slick-row-detail-state-fetching')) {
                                            $(target).parents('.slick-row-master').next('.slick-row-detail').remove();
                                            var cellSpaceColumn = 0,
                                                cellSpaceRow = gridColumns.length - 1,
                                                fetchingCSSClass = (contrailListModel.isRequestInProgress() ? ' slick-row slick-row-detail-state-fetching' : '');

                                            //if (gridOptions.checkboxSelectable != false) {
                                            //    cellSpaceColumn++;
                                            //}

                                            $(target).parents('.slick-row-master').after(' \
                                                <div class="ui-widget-content slick-row slick-row-detail' + fetchingCSSClass + '" data-cgrid="' + $(target).parents('.slick-row-master').data('cgrid') + '"> \
                                                    <div class="slick-cell l' + cellSpaceColumn + ' r' + cellSpaceRow + '"> \
                                                        <div class="slick-row-detail-container"> \
                                                            <div class="slick-row-detail-template-' + $(target).parents('.slick-row-master').data('cgrid') + '"></div> \
                                                        </div> \
                                                    </div> \
                                                </div>');

                                            $(target).parents('.slick-row-master').next('.slick-row-detail').find('.slick-row-detail-container').show();

                                            // onInit called after building a template
                                            if (contrail.checkIfFunction(gridOptions.detail.onInit)) {
                                                e['detailRow'] = $(target).parents('.slick-row-master').next().find('.slick-row-detail-container');
                                                gridOptions.detail.onInit(e, dc);
                                            }
                                            refreshDetailTemplateById($(target).parents('.slick-row-master').data('cgrid'));

                                        }
                                        else {
                                            $(target).parents('.slick-row-master').next('.slick-row-detail').show();
                                        }

                                        if (contrail.checkIfFunction(gridOptions.detail.onExpand)) {
                                            gridOptions.detail.onExpand(e, dc);
                                        }
                                        $(target).removeClass('fa-caret-right').addClass('fa fa-caret-down');

                                        var slickRowDetail = $(target).parents('.slick-row-master').next('.slick-row-detail'),
                                            slickRowDetailHeight = slickRowDetail.height(),
                                            detailContainerHeight = slickRowDetail.find('.slick-row-detail-container').height();

                                        if (Math.abs(slickRowDetailHeight - detailContainerHeight) > 10) {
                                            gridContainer.data('contrailGrid').adjustDetailRowHeight(slickRowDetail.data('cgrid'))
                                        }
                                    } else if ($(target).hasClass('fa-caret-down')) {
                                        $(target).parents('.slick-row-master').next('.slick-row-detail').hide();

                                        if (contrail.checkIfFunction(gridOptions.detail.onCollapse)) {
                                            gridOptions.detail.onCollapse(e, dc);
                                        }
                                        $(target).removeClass('fa-caret-down').addClass('fa fa-caret-right');
                                    }
                                }
                            }
                        });
                        columns = columns.concat(gridColumns);
                        gridColumns = columns;

                        gridContainer.on('click', '.slick-row-detail', function (event) {
                            var rowId = $(this).data('cgrid');

                            if ($(event.target).hasClass('expander')) {
                                cowu.expandJsonHtml($(event.target));
                                event.stopPropagation();
                            } else if ($(event.target).hasClass('collapser')) {
                                cowu.collapseJsonHtml($(event.target));
                                event.stopPropagation();
                            }

                            if (gridContainer.data('contrailGrid') != null) {
                                gridContainer.data('contrailGrid').adjustDetailRowHeight(rowId);
                            }
                        });
                    }

                    if (gridOptions.actionCell != false) {
                        columns = [];

                        if (gridOptions.actionCell instanceof Array || contrail.checkIfFunction(gridOptions.actionCell)) {
                            var optionList = gridOptions.actionCell;
                            gridOptions.actionCell = {
                                type: 'dropdown',
                                optionList: optionList
                            };
                        }

                        if (gridOptions.actionCell.type == 'dropdown' && gridOptions.actionCell.optionList.length > 0) {
                            columns.push({
                                id: 'slick_action_cog',
                                field: "",
                                cssClass: 'action-cog-cell center',
                                rerenderOnResize: false,
                                width: 20,
                                resizable: false,
                                formatter: function (r, c, v, cd, dc) {
                                    var actionCellArray = [];
                                    if (contrail.checkIfFunction(gridOptions.actionCell.optionList)) {
                                        actionCellArray = gridOptions.actionCell.optionList(dc);
                                    } else {
                                        actionCellArray = gridOptions.actionCell.optionList;
                                    }

                                    return (actionCellArray.length > 0) ? '<i class="fa fa-cog icon-only bigger-110 grid-action-dropdown"></i>' : '';
                                },
                                searchable: false,
                                sortable: false,
                                exportConfig: {
                                    allow: false
                                }
                            });
                        } else if (gridOptions.actionCell.type == 'link') {
                            columns.push({
                                id: 'slick_action_link',
                                field: "",
                                cssClass: 'action-link-cell',
                                rerenderOnResize: false,
                                width: 20,
                                resizable: false,
                                formatter: function (r, c, v, cd, dc) {
                                    return '<i class="' + gridOptions.actionCell.iconClass + ' icon-only grid-action-link"></i>';
                                },
                                searchable: false,
                                sortable: false,
                                exportConfig: {
                                    allow: false
                                }
                            });
                        }

                        if (gridOptions.actionCellPosition == 'start') {
                            columns = columns.concat(gridColumns);
                        } else {
                            columns = gridColumns.concat(columns);
                        }
                        gridColumns = columns;
                    }

                    if (contrail.checkIfExist(gridOptions.sortable.defaultSortCols)) {
                        $.each(gridOptions.sortable.defaultSortCols, function (defaultSortColKey, defaultSortColValue) {
                            gridSortColumns.push(defaultSortColValue);
                        });
                    }
                }
            };

            function refreshDetailTemplateById(id) {
                var source = gridOptions.detail.template,
                    templateKey = gridContainer.prop('id') + '-grid-detail-template';
                source = source.replace(/ }}/g, "}}");
                source = source.replace(/{{ /g, "{{");

                var template = contrail.getTemplate4Source(source, templateKey),
                    dc = dataView.getItemById(id);

                if (contrail.checkIfExist(dc)) {
                    if (contrail.checkIfExist(gridOptions.detail.templateConfig)) {
                        gridContainer.find('.slick-row-detail-template-' + id).html(template({dc: dc, templateConfig: gridOptions.detail.templateConfig}));
                    } else {
                        gridContainer.find('.slick-row-detail-template-' + id).html(template({data: dc, ignoreKeys: ['cgrid'], requestState: cowc.DATA_REQUEST_STATE_SUCCESS_NOT_EMPTY}));
                    }
                    gridContainer.data('contrailGrid').adjustDetailRowHeight(id);
                }
                else {
                    gridContainer.find('.slick-row-detail-template-' + id).parents('.slick-row-detail').remove();
                }
            };

            function initGridEvents() {
                eventHandlerMap.grid['onScroll'] = function (e, args) {
                    if (scrolledStatus.scrollLeft != args.scrollLeft || scrolledStatus.scrollTop != args.scrollTop) {
                        gridContainer.data('contrailGrid').adjustAllRowHeight();
                        scrolledStatus.scrollLeft = args.scrollLeft;
                        scrolledStatus.scrollTop = args.scrollTop;
                    }
                };

                grid['onScroll'].subscribe(eventHandlerMap.grid['onScroll']);

                eventHandlerMap.grid['onSelectedRowsChanged'] = function (e, args) {
                    var onNothingChecked = contrail.checkIfFunction(gridOptions.checkboxSelectable.onNothingChecked) ? gridOptions.checkboxSelectable.onNothingChecked : null,
                        onSomethingChecked = contrail.checkIfFunction(gridOptions.checkboxSelectable.onSomethingChecked) ? gridOptions.checkboxSelectable.onSomethingChecked : null,
                        onEverythingChecked = contrail.checkIfFunction(gridOptions.checkboxSelectable.onEverythingChecked) ? gridOptions.checkboxSelectable.onEverythingChecked : null;

                    var selectedRowLength = args.rows.length;

                    if (selectedRowLength == 0) {
                        (contrail.checkIfExist(onNothingChecked) ? onNothingChecked(e) : '');
                    }
                    else {
                        (contrail.checkIfExist(onSomethingChecked) ? onSomethingChecked(e) : '');

                        if (selectedRowLength == grid.getDataLength()) {
                            (contrail.checkIfExist(onEverythingChecked) ? onEverythingChecked(e) : '');
                        }
                    }
                    gridContainer.data('contrailGrid').refreshView();
                    if (gridOptions.multiRowSelection != true) {
                        gridContainer.find('.slick-cell-checkboxsel').find('input.rowCheckbox:visible').attr('checked', false);
                        $(gridContainer.find('.slick-cell-checkboxsel').find('input.rowCheckbox:visible')[args.rows.pop()]).attr('checked', true);
                    }
                };

                grid['onSelectedRowsChanged'].subscribe(eventHandlerMap.grid['onSelectedRowsChanged']);

                eventHandlerMap.grid['onHeaderClick'] = function (e, args) {
                    if ($(e.target).is(":checkbox")) {

                        if ($(e.target).is(":checked")) {
                            gridContainer.data('contrailGrid').setAllCheckedRows('current-page');

                            var pagingInfo = dataView.getPagingInfo(),
                                currentPageRecords = (pagingInfo.pageSize * (pagingInfo.pageNum + 1)) < pagingInfo.totalRows ? pagingInfo.pageSize : (pagingInfo.totalRows - (pagingInfo.pageSize * (pagingInfo.pageNum)))

                            if (pagingInfo.totalPages > 1 && !gridContainer.data('contrailGrid')._gridStates.allPagesDataChecked) {
                                gridContainer.find('.grid-check-all-info').remove();
                                gridContainer.find('.slick-header').after('<div class="alert alert-info grid-info grid-check-all-info"> ' +
                                    '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                                    '<strong>' + currentPageRecords + ' records checked.</strong> <a class="check-all-link">Click here to check all ' + pagingInfo.totalRows + ' records</a>' +
                                    '</div>');

                                gridContainer.find('.check-all-link')
                                    .off('click')
                                    .on('click', function (e) {
                                        gridContainer.data('contrailGrid').setAllCheckedRows('all-page');
                                        gridContainer.data('contrailGrid')._gridStates.allPagesDataChecked = true;

                                        gridContainer.find('.grid-check-all-info').remove();
                                        gridContainer.find('.slick-header').after('<div class="alert alert-info grid-info grid-check-all-info"> ' +
                                            '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                                            '<strong>' + pagingInfo.totalRows + ' records checked.</strong> <a class="clear-selection-link">Click here to clear selection</a>' +
                                            '</div>');

                                        gridContainer.find('.clear-selection-link')
                                            .off('click')
                                            .on('click', function (e) {
                                                grid.setSelectedRows([]);
                                                gridContainer.find('.grid-check-all-info').remove();
                                                gridContainer.data('contrailGrid')._gridStates.allPagesDataChecked = false;
                                            })
                                    });
                            }

                        } else {
                            grid.setSelectedRows([]);
                            gridContainer.data('contrailGrid')._gridStates.allPagesDataChecked = false;
                            gridContainer.find('.grid-check-all-info').remove();
                        }

                        e.stopPropagation();
                        e.stopImmediatePropagation();
                    }
                };

                grid['onHeaderClick'].subscribe(eventHandlerMap.grid['onHeaderClick']);

                eventHandlerMap.grid['onClick'] = function (e, args) {
                    if (!gridOptions.disableRowsOnLoading || (gridOptions.disableRowsOnLoading && !contrailListModel.isRequestInProgress())) {
                        var column = grid.getColumns()[args.cell],
                            rowData = grid.getDataItem(args.row);
                        gridContainer.data('contrailGrid').selectedRow = args.row;
                        gridContainer.data('contrailGrid').selectedCell = args.cell;

                        if (contrail.checkIfExist(gridConfig.body.events) && contrail.checkIfFunction(gridConfig.body.events.onClick)) {
                            gridConfig.body.events.onClick(e, rowData);
                        }

                        if (contrail.checkIfExist(column.events) && contrail.checkIfFunction(column.events.onClick)) {
                            column.events.onClick(e, rowData);
                        }

                        if (gridOptions.rowSelectable) {
                            if (!gridContainer.find('.slick_row_' + rowData.cgrid).hasClass('selected_row')) {
                                gridContainer.find('.selected_row').removeClass('selected_row');
                                gridContainer.find('.slick_row_' + rowData.cgrid).addClass('selected_row');
                            }
                        }

                        if ($(e.target).hasClass("expander")) {
                            var selfParent = $(e.target).parent(),
                                jsonObj = {};
                            if(selfParent.children('.node').hasClass('raw')){
                                jsonObj = JSON.parse(selfParent.children('ul.node').text());
                                selfParent.empty().append(cowu.constructJsonHtmlViewer(jsonObj, 2, parseInt(selfParent.children('.node').data('depth')) + 1));
                            }
                            selfParent.children('.node').show();
                            selfParent.children('.collapsed').hide();
                            selfParent.children('i').removeClass('fa-plus').removeClass('expander').addClass('fa fa-minus').addClass('collapser');
                        } else if ($(e.target).hasClass("collapser")) {
                            var selfParent = $(e.target).parent();
                            selfParent.children('.collapsed').show();
                            selfParent.children('.node').hide();
                            selfParent.children('i').removeClass('fa-minus').removeClass('collapser').addClass('fa fa-plus').addClass('expander');
                        }

                        if ($(e.target).hasClass("grid-action-dropdown")) {
                            if ($('#' + gridContainer.prop('id') + '-action-menu-' + args.row).is(':visible')) {
                                $('#' + gridContainer.prop('id') + '-action-menu-' + args.row).remove();
                            } else {
                                $('.grid-action-menu').remove();
                                var actionCellArray = [];
                                if (contrail.checkIfFunction(gridOptions.actionCell.optionList)) {
                                    actionCellArray = gridOptions.actionCell.optionList(rowData);
                                } else {
                                    actionCellArray = gridOptions.actionCell.optionList;
                                }

                                //$('#' + gridContainer.prop('id') + '-action-menu').remove();
                                addGridRowActionDroplist(actionCellArray, gridContainer, args.row, $(e.target), rowData);
                                var windowWidth = $(window).width(),
                                    offset = $(e.target).offset(),
                                    actionCellStyle = '';
                                if (gridOptions.actionCellPosition == 'start') {
                                    actionCellStyle = 'top:' + (offset.top + 20) + 'px' + ';right:auto !important;left:' + offset.left + 'px !important;';
                                } else {
                                    actionCellStyle = 'top:' + (offset.top + 20) + 'px' + '; right: ' + (windowWidth - offset.left - 22) + 'px !important;';
                                }
                                $('#' + gridContainer.prop('id') + '-action-menu-' + args.row).attr('style', function (idx, obj) {
                                    if (obj != null) {
                                        return obj + actionCellStyle;
                                    } else {
                                        return actionCellStyle;
                                    }
                                }).show(function () {
                                    var dropdownHeight = $('#' + gridContainer.prop('id') + '-action-menu-' + args.row).height(),
                                        windowHeight = $(window).height(),
                                        currentScrollPosition = $(window).scrollTop(),
                                        actionScrollPosition = offset.top + 20 - currentScrollPosition;

                                    if ((actionScrollPosition + dropdownHeight) > windowHeight) {
                                        window.scrollTo(0, (actionScrollPosition + dropdownHeight) - windowHeight + currentScrollPosition);
                                    }
                                });
                                e.stopPropagation();
                                initOnClickDocument('#' + gridContainer.prop('id') + '-action-menu-' + args.row, function () {
                                    $('#' + gridContainer.prop('id') + '-action-menu-' + args.row).hide();
                                });
                            }
                        }

                        if ($(e.target).hasClass("grid-action-link")) {
                            if (gridOptions.actionCell.type == 'link') {
                                gridOptions.actionCell.onclick(e, args);
                            }
                        }

                        if (gridContainer.data('contrailGrid') != null) {
                            gridContainer.data('contrailGrid').adjustRowHeight(rowData.cgrid);
                        }
                    }
                };

                grid['onClick'].subscribe(eventHandlerMap.grid['onClick']);

            };

            function initOnClickDocument(containerIdentifier, callback) {
                $(document).on('click', function (e) {
                    if (!$(e.target).closest(gridContainer.find(containerIdentifier)).length) {
                        callback(e);
                    }
                });
            };

            function initDataView(gridConfig) {
                eventHandlerMap.dataView['onDataUpdate'] = function (e, args) {
                    //Display filtered count in grid header
                    if (gridConfig.header.showFilteredCntInHeader) {
                        var totalRowCnt, filteredRowCnt;
                        if (grid.getData() != null && grid.getData().getPagingInfo() != null) {
                            totalRowCnt = grid.getData().getItems().length;
                            filteredRowCnt = grid.getData().getPagingInfo()['totalRows']
                        }
                        if (totalRowCnt == filteredRowCnt) {
                            gridContainer.find('.grid-header-text').text(gridConfig.header.title.text + " (" + totalRowCnt + ")");
                        } else {
                            gridContainer.find('.grid-header-text').text(gridConfig.header.title.text + " (" + filteredRowCnt + " of " + totalRowCnt + ")");
                        }
                    }
                    //Refresh the grid only if it's not destroyed
                    if ($(gridContainer).data('contrailGrid') != null && (args.previous != args.current || args.rows.length > 0)) {
                        grid.invalidateAllRows();
                        grid.updateRowCount();
                        grid.render();

                        //onRowCount Changed
                        if (args.previous != args.current) {
                            gridContainer.data('contrailGrid').removeGridMessage();
                            if (dataView.getLength() == 0) {
                                emptyGridHandler();
                                gridContainer.find('.slick-row-detail').remove();
                            } else {
                                gridContainer.find('.grid-footer').removeClass('hide');
                                onDataGridHandler();
                            }
                        }

                        //onRows Changed
                        if (args.rows.length > 0) {
                            if (contrail.checkIfFunction(gridDataSource.events.onDataBoundCB)) {
                                gridDataSource.events.onDataBoundCB();
                            }

                            // Adjusting the row height for all rows
                            gridContainer.data('contrailGrid').adjustAllRowHeight();

                            // Assigning odd and even classes to take care of coloring effect on alternate rows
                            gridContainer.data('contrailGrid').adjustGridAlternateColors();

                            // Refreshing the detail view
                            gridContainer.data('contrailGrid').refreshDetailView();
                        }

                        if (contrail.checkIfFunction(gridDataSource.events.onDataUpdateCB)) {
                            gridDataSource.events.onDataUpdateCB(e, args);
                        }
                    } else if (dataView.getLength() == 0) {
                        emptyGridHandler();
                        gridContainer.find('.slick-row-detail').remove();
                    }
                };

                $.each(eventHandlerMap.dataView, function (key, val) {
                    dataView[key].subscribe(val);
                });
            };

            function initClientSidePagination() {
                eventHandlerMap.grid['onSort'] = function (e, args) {
                    performSort(args.sortCols);
                    grid.setSelectedRows([]);
                };

                grid['onSort'].subscribe(eventHandlerMap.grid['onSort']);

                initSearchBox();
            };

            function performSort(cols) {
                if (cols.length > 0) {
                    dataView.sort(function (dataRow1, dataRow2) {
                        for (var i = 0, l = cols.length; i < l; i++) {
                            var field = cols[i].sortCol.field;
                            var sortField = cols[i].sortCol.sortField;
                            if (sortField != null) {
                                field = sortField;
                            }
                            var sign = cols[i].sortAsc ? 1 : -1;
                            var result = 0;
                            var sortBy = contrail.checkIfExist(cols[i].sortCol.sortable.sortBy);
                            var value1,value2;
                            if(sortBy){
                                if(cols[i].sortCol.sortable.sortBy == 'formattedValue') {
                                    value1 = cols[i].sortCol.formatter('', '', '', '', dataRow1);
                                    value2 = cols[i].sortCol.formatter('', '', '', '', dataRow2);
                                } else {
                                    //It must be a function. Use it to get the value
                                    value1 =  cols[i].sortCol.sortable.sortBy(dataRow1);
                                    value2 =  cols[i].sortCol.sortable.sortBy(dataRow2);
                                }
                            } else {//default
                                value1 = dataRow1[field];
                                value2 = dataRow2[field];
                            }
                            if (cols[i].sortCol.sorter != null) {
                                result = cols[i].sortCol.sorter(value1, value2, sign); // sorter property from column definition will be called if present
                            } else {
                                result = (value1 == value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;
                            }
                            if (result != 0) {
                                return result;
                            }
                        }
                        return 0;
                    });
                }
            };

            function initSearchBox() {
                // Search Textbox Keyup
                gridContainer.find('.input-searchbox input').on('keyup', function (e) {
                    var searchValue = this.value;
                    if (slickGridSearchtimer) {
                        window.clearTimeout(slickGridSearchtimer);
                    }
                    slickGridSearchtimer = setTimeout(function () {
                        if (searchValue == gridContainer.find('.input-searchbox input').val() && searchValue != null) {
                            dataView.setFilterArgs({
                                searchString: searchValue,
                                searchColumns: searchColumns
                            });
                            dataView.setFilter(searchFilter);
                            dataView.refresh();
                            if (dataView.getFilteredItems().length == 0) {
                                gridContainer.data('contrailGrid').showGridMessage('empty', 'No records found for "' + searchValue + '"')
                            }
                            gridContainer.find('.slick-row-detail').remove();
                            gridContainer.find('.input-searchbox input').focus();
                        }
                    }, 500);

                });

                initOnClickDocument('.input-searchbox', function (e) {
                    if (gridContainer.find('.input-searchbox').is(":visible") && gridContainer.find('.input-searchbox').find('input').val() == '') {
                        gridContainer.find('.input-searchbox').hideElement();
                        gridContainer.find('.link-searchbox').showElement();
                    }
                });
            };

            function initGridFooter() {
                if (gridContainer.data('contrailGrid') == null) {
                    return;
                }
                if (gridConfig.footer != false) {
                    gridContainer.append('<div class="grid-footer hide"></div>');

                    gridContainer.find('.grid-footer').append('<div class="slick-pager"> \
                		<span class="slick-pager-nav"> \
                			<span class="pager-control"><i class="fa fa-step-backward icon-disabled pager-control-first"></i></span>\
                			<span class="pager-control"> <i class="fa fa-backward icon-disabled pager-control-prev"></i></span> \
                			<span class="pager-page-info"><div class="csg-current-page"></div> of <span class="csg-total-page-count"></span></span> \
                			<span class="pager-control"> <i class="fa fa-forward icon-disabled pager-control-next"></i></span> \
                			<span class="pager-control"> <i class="fa fa-step-forward icon-disabled pager-control-last"></i></span> \
                		</span> \
                		<span class="slick-pager-info"></span>\
                		<span class="slick-pager-sizes"><div class="csg-pager-sizes"></div></span>\
                	</div>');

                    if (dataView.getLength() != 0) {
                        gridContainer.find('.grid-footer').removeClass('hide');
                    } else if (contrail.checkIfKeyExistInObject(true, gridDataSource, 'remote.serverSidePagination') && gridDataSource.remote.serverSidePagination) {
                        footerPager = new GridFooterView(dataView, gridContainer, gridConfig.footer.pager.options);
                        footerPager.init();
                        //gridContainer.find('.slick-pager-sizes').hide();
                    } else {
                        footerPager = new GridFooterView(dataView, gridContainer, gridConfig.footer.pager.options);
                        footerPager.init();
                    }
                }
                gridContainer.data("contrailGrid")._pager = footerPager;
                startAutoRefresh(gridOptions.autoRefresh);
            };

            function setDataObject4ContrailGrid() {
                gridContainer.data('contrailGrid', {
                    _grid: grid,
                    _dataView: dataView,
                    _eventHandlerMap: eventHandlerMap,
                    _pager: footerPager,
                    _gridStates: {
                        allPagesDataChecked: false,
                        currentPageDataChecked: false
                    },
                    expand: function () {
                        gridContainer.find('i.collapse-icon').addClass('fa fa-chevron-up').removeClass('fa-chevron-down');
                        gridContainer.children().removeClass('collapsed');
                        gridContainer.data('contrailGrid').refreshView();
                    },
                    collapse: function () {
                        gridContainer.find('i.collapse-icon').removeClass('fa-chevron-up').addClass('fa fa-chevron-down');
                        gridContainer.children().addClass('collapsed');
                        gridContainer.find('.grid-header').show();
                    },
                    // Returns an array of data of the checked rows via checkbox when checkboxSelectable is set to true
                    getCheckedRows: function () {
                        if (gridContainer.data('contrailGrid')._gridStates.allPagesDataChecked) {
                            return dataView.getFilteredItems();
                        } else {
                            var selectedRows = grid.getSelectedRows(),
                                returnValue = [];
                            $.each(selectedRows, function (selectedRowKey, selectedRowValue) {
                                returnValue.push(grid.getDataItem(selectedRowValue));
                            });
                            return returnValue;
                        }
                    },
                    // Sets the checked rows of the rows based on rowIndices
                    setCheckedRows: function (rowIndices) {
                        grid.setSelectedRows(rowIndices);
                    },
                    // Set All Checked Rows based on type == 'current-page' and 'all-page'
                    setAllCheckedRows: function (type) {
                        var rows = [], dataLength = 0;
                        if (type == 'all-page') {
                            dataLength = dataView.getFilteredItems().length;
                            for (var i = 0; i < dataLength; i++) {
                                var enabled = true;
                                if (contrail.checkIfFunction(gridOptions.checkboxSelectable.enableRowCheckbox)) {
                                    enabled = gridOptions.checkboxSelectable.enableRowCheckbox(dataView.getItemById('id_' + i));
                                }
                                if (enabled) {
                                    rows.push(i);
                                }
                            }
                        } else {
                            dataLength = grid.getDataLength();
                            for (var i = 0; i < dataLength; i++) {
                                if (gridContainer.find('.rowCheckbox[value="' + i + '"]:disabled').length == 0) {
                                    rows.push(i);
                                }
                            }
                        }
                        grid.setSelectedRows(rows);
                    },

                    getSelectedRow: function () {
                        return grid.getDataItem(gridContainer.data('contrailGrid').selectedRow);
                    },
                    deleteDataByRows: function (rowIndices) {
                        var cgrids = [];
                        $.each(rowIndices, function (key, val) {
                            var dataItem = grid.getDataItem(val);
                            cgrids.push(dataItem.cgrid);
                        });
                        dataView.deleteDataByIds(cgrids);
                    },
                    showGridMessage: function (status, customMsg) {
                        var gridStatusMsgConfig = gridConfig.body.statusMessages,
                            statusMsg = contrail.checkIfExist(customMsg) ? customMsg : (contrail.checkIfExist(gridStatusMsgConfig[status]) ? gridStatusMsgConfig[status].text : ''),
                            messageHtml;
                        this.removeGridMessage();

                        if (status == 'loading' || status == 'loadingNextPage') {
                            gridContainer.find('.grid-header-icon-loading').show();
                        }
                        if (status == 'error') {
                            messageHtml = '<i class="' + gridStatusMsgConfig[status].iconClasses + '"></i> &nbsp;' + statusMsg;
                            gridContainer.find('.grid-load-status').addClass('alert alert-error').html(messageHtml).removeClass('hide');
                        } else if (status != 'loadingNextPage') {
                            messageHtml = (contrail.checkIfExist(gridStatusMsgConfig[status])) ?
                            '<p class="' + gridStatusMsgConfig[status].type + '"><i class="' + gridStatusMsgConfig[status].iconClasses + '"></i> ' + statusMsg + '</p>' : status;
                            gridContainer.find('.grid-load-status').html(messageHtml).removeClass('hide');
                        }

                    },
                    removeGridMessage: function () {
                        gridContainer.find('.grid-load-status').html('').addClass('hide').removeClass('alert alert-error');
                        if (gridOptions.lazyLoading == null || !gridOptions.lazyLoading && gridOptions.defaultDataStatusMessage) {
                            this.removeGridLoading();
                        }
                    },
                    removeGridLoading: function () {
                        gridContainer.find('.grid-header-icon-loading').hide();
                        gridContainer.removeClass('grid-state-fetching');
                        gridContainer.removeClass('grid-state-fetching-rows');
                    },

                    adjustAllRowHeight: function () {
                        if (!(gridOptions.fixedRowHeight != false && _.isNumber(gridOptions.fixedRowHeight))) {
                            var self = this;
                            clearTimeout(adjustAllRowHeightTimer);
                            adjustAllRowHeightTimer = setTimeout(function () {
                                var visibleRowIds = gridContainer.find('.slick-row-master').map(function () {
                                        return $(this).data('cgrid');
                                    }),
                                    rowChunkSize = 25, visibleRowChunk = [];

                                while (visibleRowIds.length > 0) {
                                    visibleRowChunk = visibleRowIds.splice(0, rowChunkSize);
                                    self.adjustRowHeightByChunk(visibleRowChunk);
                                }
                            }, 50);
                        }
                    },

                    adjustRowHeightByChunk: function (rowChunks) {
                        if (!(gridOptions.fixedRowHeight != false && _.isNumber(gridOptions.fixedRowHeight))) {
                            var self = this;
                            setTimeout(function () {
                                $.each(rowChunks, function (chunkKey, chunkValue) {
                                    self.adjustRowHeight(chunkValue);
                                });
                            }, 5);
                        }
                    },

                    adjustRowHeight: function (rowId) {
                        if (!(gridOptions.fixedRowHeight != false && _.isNumber(gridOptions.fixedRowHeight))) {
                            var maxHeight = 20;
                            gridContainer.find('.slick_row_' + rowId).find('.slick-cell').css('height', 'initial');
                            gridContainer.find('.slick_row_' + rowId).find('.slick-cell').each(function () {
                                maxHeight = ($(this).height() > maxHeight) ? $(this).height() : maxHeight;
                            });
                            gridContainer.find('.slick_row_' + rowId).find('.slick-cell').css('height', 'inherit');
                            maxHeight = maxHeight + 10;

                            gridContainer.find('.slick_row_' + rowId).height(maxHeight);
                        }
                    },
                    adjustDetailRowHeight: function (rowId) {
                        var slickdetailRow = gridContainer.find('.slick_row_' + rowId).next('.slick-row-detail'),
                            detailContainerHeight = slickdetailRow.find('.slick-row-detail-container').height();
                        slickdetailRow.height(detailContainerHeight + 10);
                        slickdetailRow.find('.slick-cell').height(detailContainerHeight);
                    },
                    adjustGridAlternateColors: function () {
                        gridContainer.find('.slick-row-master').removeClass('even').removeClass('odd');
                        gridContainer.find('.slick-row-master:visible:even').addClass('even');
                        gridContainer.find('.slick-row-master:visible:odd').addClass('odd');
                    },
                    destroy: function () {
                        stopAutoRefresh();
                        $.each(eventHandlerMap.dataView, function (key, val) {
                            dataView[key].unsubscribe(val);
                        });

                        $.each(eventHandlerMap.grid, function (key, val) {
                            grid[key].unsubscribe(val);
                        });

                        gridContainer.data('contrailGrid')._grid.destroy();
                        gridContainer.data('contrailGrid', null);
                        gridContainer.html('').removeClass('contrail-grid');
                    },
                    // setRemoteAjaxConfig: function (ajaxConfig) {
                    //     if (contrail.checkIfExist(gridDataSource.remote.ajaxConfig)) {
                    //         dataView.setRemoteAjaxConfig(ajaxConfig);
                    //         dvConfig.remote.ajaxConfig = ajaxConfig;
                    //         gridDataSource.remote.ajaxConfig = ajaxConfig;
                    //         customGridConfig.body.dataSource.remote.ajaxConfig = ajaxConfig;
                    //         return true;
                    //     } else {
                    //         return false;
                    //     }
                    // },
                    // Refreshes the grid if the grid data is fetched via ajax call
                    refreshGrid: function () {
                        if (contrail.checkIfExist(gridDataSource.remote) && contrail.checkIfExist(gridDataSource.remote.ajaxConfig.url)) {
                            gridContainer.contrailGrid(customGridConfig);
                        } else {
                            this.refreshView();
                        }
                    },
                    // Refreshes the Dataview if the grid data is fetched via ajax call
                    refreshData: function () {
                        if ((contrail.checkIfExist(gridDataSource.remote) && contrail.checkIfExist(gridDataSource.remote.ajaxConfig.url)) || (contrail.checkIfExist(gridDataSource.dataView) && contrail.checkIfFunction(dataView.refreshData))) {
                            dataView.refreshData();
                        }
                        currentSelectedRows = [];
                    },
                    // Refreshes the view of the grid. Grid is rendered and related adjustments are made.
                    refreshView: function (refreshDetailTemplateFlag) {
                        var refreshDetailTemplateFlag = (contrail.checkIfExist(refreshDetailTemplateFlag)) ? refreshDetailTemplateFlag : true;
                        grid.render();
                        grid.resizeCanvas();
                        this.adjustAllRowHeight();
                        this.adjustGridAlternateColors();
                        this.refreshDetailView(refreshDetailTemplateFlag);

                        if (gridContainer.find('.rowCheckbox:disabled').length > 0) {
                            gridContainer.find('.headerRowCheckbox').attr('disabled', true)
                        }
                    },
                    // Refreshes the detail view of the grid. Grid is rendered and related adjustments are made.
                    refreshDetailView: function (refreshDetailTemplateFlag) {
                        gridContainer.find('.slick-row-detail').each(function () {
                            if (gridContainer.find('.slick_row_' + $(this).data('cgrid')).is(':visible')) {
                                gridContainer.find('.slick_row_' + $(this).data('cgrid')).after($(this));
                                if ($(this).is(':visible')) {
                                    gridContainer.find('.slick_row_' + $(this).data('cgrid')).find('.toggleDetailIcon').addClass('fa fa-caret-down').removeClass('fa-caret-right');
                                }
                                if (refreshDetailTemplateFlag) {
                                    refreshDetailTemplateById($(this).data('cgrid'));
                                }
                            }
                            else {
                                $(this).remove();
                            }
                        });
                    },
                    // Starts AutoRefresh
                    startAutoRefresh: function (refreshPeriod) {
                        startAutoRefresh(refreshPeriod);
                    },
                    // Stops AutoRefresh
                    stopAutoRefresh: function () {
                        stopAutoRefresh();
                    }
                });
            };

            function generateGridHeaderTemplate(headerConfig) {
                var template = ' \
                <h4 class="grid-header-text smaller {{this.cssClass}}" data-action="collapse"> \
            		<i class="grid-header-icon-loading fa fa-spinner fa-spin"></i> \
                    <i class="grid-header-icon {{this.icon}} {{this.iconCssClass}} hide"></i> {{this.text}} \
                </h4>',
                    headerTemplate;

                if (headerConfig.defaultControls.collapseable) {
                    template += '\
                <div class="widget-toolbar pull-right"> \
                    <a class="widget-toolbar-icon" data-action="collapse"> \
                        <i class="collapse-icon fa fa-chevron-up"></i> \
                    </a> \
                </div>';
                }

                if (headerConfig.defaultControls.refreshable) {
                    template += '\
                <div class="widget-toolbar pull-right"> \
                    <a class="widget-toolbar-icon link-refreshable" title="Refresh" data-action="refresh"> \
                        <i class="fa fa-repeat"></i> \
                    </a> \
                </div>';
                }

                if (headerConfig.defaultControls.searchable) {
                    template += '\
                <div class="widget-toolbar pull-right"> \
                    <a class="widget-toolbar-icon link-searchbox" title="Search" data-action="search"> \
                        <i class="fa fa-search"></i> \
                    </a> \
                    <span class="input-searchbox hidden"> \
                        <span class="input-icon"> \
                            <input type="text" placeholder="Search {{this.text}}" class="input-medium input-grid-search"> \
                            <i class="widget-toolbar-icon fa fa-search"></i> \
                        </span> \
                    </span> \
                </div>';
                }

                if (headerConfig.defaultControls.exportable) {
                    template += '\
                    <div class="widget-toolbar pull-right"> \
                        <a class="widget-toolbar-icon" title="Export as CSV" data-action="export"> \
                            <i class="fa fa-download"></i> \
                        </a> \
                    </div>';
                }

                if (headerConfig.defaultControls.columnPickable) {
                    var columnPickerConfig = {
                        type: 'checked-multiselect',
                        //iconClass: 'icon-columns',
                        placeholder: '',
                        elementConfig: {
                            elementId: 'columnPicker',
                            classes: 'columnPicker',
                            data: gridColumns,
                            dataTextField: 'text',
                            dataValueField: 'id',
                            noneSelectedText: '',
                            filterConfig: {
                                placeholder: 'Search Column Name'
                            },
                            parse: formatData4ColumnPicker,
                            minWidth: 200,
                            height: 250,
                            emptyOptionText: 'No Columns found.',
                            click: applyColumnPicker,
                            optgrouptoggle: applyColumnPicker,
                            control: false
                        }
                    };
                    if (!headerConfig.advanceControls) {
                        headerConfig.advanceControls = [];
                    }
                    headerConfig.advanceControls.push(columnPickerConfig);
                }

                if (headerConfig.customControls) {
                    $.each(headerConfig.customControls, function (key, val) {
                        template += '<div class="widget-toolbar pull-right">' + val + '</div>';
                    });
                }

                headerTemplate = '<div class="grid-header"><div id="' + gridContainer.prop('id') + '-header' + '" class="widget-header grid-widget-header">' + template + '</div></div>';
                headerTemplate += '<div class="widget-body-collapsed" data-action="widget-collapse"><a>Click here to expand <i class="fa fa-angle-double-down"></i></a> </div>';
                gridContainer.append(Handlebars.compile(headerTemplate)(gridConfig.header.title));

                if (headerConfig.advanceControls) {
                    $.each(headerConfig.advanceControls, function (key, control) {
                        if (control.type == 'link') {
                            addGridHeaderAction(key, control, gridContainer);
                        } else if (control.type == 'dropdown') {
                            addGridHeaderActionDroplist(key, control, gridContainer);
                        } else if (control.type == 'checked-multiselect') {
                            addGridHeaderActionCheckedMultiselect(key, control, gridContainer);
                        }
                    });
                }
            };

            function applyColumnPicker(event, ui) {
                var checkedColumns = $(gridContainer).find('#columnPicker').data('contrailCheckedMultiselect').getChecked();
                function getColumnIdsPicked(checkedColumns) {
                    var checkedColumnIds = [];
                    if (checkedColumns.length != 0) {
                        $.each(checkedColumns, function (checkedColumnKey, checkedColumnValue) {
                            var checkedColumnValueObj = $.parseJSON(unescape($(checkedColumnValue).val()));
                            checkedColumnIds.push(checkedColumnValueObj.value)
                        });
                    }
                    return checkedColumnIds;
                };
                var visibleColumnIds = getColumnIdsPicked(checkedColumns);
                var current = grid.getColumns().slice(0);
                var ordered = new Array(gridColumns.length);
                for (var i = 0; i < ordered.length; i++) {
                    if ( grid.getColumnIndex(gridColumns[i].id) === undefined ) {
                        // If the column doesn't return a value from getColumnIndex,
                        // it is hidden. Leave it in this position.
                        ordered[i] = gridColumns[i];
                    } else {
                        // Otherwise, grab the next visible column.
                        ordered[i] = current.shift();
                    }
                }
                gridColumns = ordered;
                var visibleColumns = [];

                // Columns which doesn't have a name associated will be by default set to visible.
                $.each(gridColumns, function(key, column) {
                    if (column.name === "") {
                        visibleColumns.push(column);
                    }
                });

                $.each(visibleColumnIds, function(key, id) {
                    $.each(gridColumns, function(key, column) {
                        //var idOrField = (column.id) ? column.id : column.field;
                        if (column.id == id) {
                            visibleColumns.push(column);
                        }
                    });
                });
                grid.setColumns(visibleColumns);
                gridContainer.data('contrailGrid').refreshView();
            };

            function formatData4ColumnPicker(data) {
                var pickColumns = [],
                    childrenData = [];
                $.each(data, function (key, value) {
                    var children = value,
                        selectedFlag = true;
                    // For columns set hide/hidden to true; should display as unchecked.
                    if (contrail.checkIfExist(children.hide) && (children.hide)) {
                          selectedFlag = false;
                    }
                    if (contrail.checkIfExist(children.hidden) && (children.hidden)) {
                        selectedFlag = false;
                    }
                    // In some cases id may not be present in the config; construct the id using field and key.
                    var id = (children.id) ? children.id : children.field + '_' + key;
                    if (!contrail.checkIfExist(children.allowColumnPickable) || children.allowColumnPickable !== false) {
                        childrenData.push({'id': id, 'text': children.name, 'selected': selectedFlag});
                    }
                });
                pickColumns.push({'id': 'columns', 'text': 'Show/Hide Columns', children: childrenData});
                return pickColumns;
            };

            function addGridHeaderAction(key, actionConfig, gridContainer) {
                var actionId = gridContainer.prop('id') + '-header-action-' + key;
                var action = $('<div class="widget-toolbar pull-right"><a ' + (contrail.checkIfExist(actionConfig.linkElementId) ? 'id="' + actionConfig.linkElementId + '" ' : '') +
                    ' class="widget-toolbar-icon' + (contrail.checkIfExist(actionConfig.disabledLink) ? ' disabled-link' : '') + '" ' +
                    'title="' + actionConfig.title + '">' +
                    '<i class="' + actionConfig.iconClass + '"></i></a>' +
                    '</div>').appendTo('#' + gridContainer.prop('id') + '-header');

                $(action).on('click', function (event) {
                    if (!$(this).find('a').hasClass('disabled-link')) {
                        actionConfig.onClick(event, gridContainer);
                    }
                });
            };

            function addGridHeaderActionDroplist(key, actionConfig, gridContainer) {
                var actions = actionConfig.actions,
                    actionId = gridContainer.prop('id') + '-header-action-' + key;
                var actionsTemplate = '<div class="widget-toolbar pull-right"><a ' + (contrail.checkIfExist(actionConfig.linkElementId) ? 'id="' + actionConfig.linkElementId + '" ' : '') +
                    'class="dropdown-toggle' + (contrail.checkIfExist(actionConfig.disabledLink) ? ' disabled-link' : '" data-toggle="dropdown') + '">' +
                    '<i class="' + actionConfig.iconClass + '"></i></a>' +
                    '<ul id="' + actionId + '" class="pull-right dropdown-menu dropdown-caret">' +
                    '</ul></div>';

                $(actionsTemplate).appendTo('#' + gridContainer.prop('id') + '-header');
                $.each(actions, function(key, actionItemConfig){
                    if (actionItemConfig.divider) {
                        $('<li class="divider"></li>').appendTo('#' + actionId);
                    }
                    var actionItem;
                    if(actionItemConfig.readOnly) {
                        actionItem = $('<li><i style="padding:0px 5px 0px 18px;cursor:default" class="' + actionItemConfig.iconClass + '"></i>\
                                            <span>' + actionItemConfig.title + '</span> \
                                            </li>').appendTo('#' + actionId);
                    } else {
                        actionItem = $('<li><a data-original-title="' + actionItemConfig.title + '"> \
                                            <i class="' + actionItemConfig.iconClass + ' margin-right-10"></i>' + actionItemConfig.title + '</a> \
                                            </li>').appendTo('#' + actionId);
                    }

                    $(actionItem).on('click', function(){
                        if(typeof actionItemConfig.onClick === 'function') {
                            actionItemConfig.onClick();
                        }
                    });
                });
            };

            function addGridHeaderActionCheckedMultiselect(key, actionConfig, gridContainer) {
                var actions = actionConfig.actions,
                    actionId = (contrail.checkIfExist(actionConfig.actionId)) ? actionConfig.actionId : gridContainer.prop('id') + '-header-action-' + key;
                var actionsTemplate = '<div id="' + actionId + '" class="widget-toolbar pull-right"> \
		        <div class="input-multiselectbox width-15"> \
		            <div class="input-icon"> \
		            	<i class="widget-toolbar-icon ' + actionConfig.iconClass + (contrail.checkIfExist(actionConfig.disabledLink) ? ' disabled-link' : '') + '"></i> \
		            </div> \
		        </div> \
		    </div>';

                $(actionsTemplate).appendTo('#' + gridContainer.prop('id') + '-header');
                $('#' + actionId).find('.input-icon').contrailCheckedMultiselect(actionConfig.elementConfig);
                $('#' + actionId).find('.input-multiselectbox').removeClass('width-15');

                if (actionConfig.disabledLink) {
                    $('#' + actionId).find('.input-icon').data('contrailCheckedMultiselect').disable();
                }

                /*
                 for column picker we don't need to display selected items on the grid header.
                 Quick Fix: will find the id and set the css.
                 */
                if (actionConfig.elementConfig.elementId == "columnPicker") {
                    $(gridContainer).find(".input-multiselectbox #columnPicker button span:not(.ui-icon)").css({"display":"none"});
                    $(gridContainer).find(".input-multiselectbox #columnPicker button")
                        .html('<i class="fa fa-columns"></i>')
                        .css({'width':'25px', 'padding-left': '10px', 'border': 'none'});


                }
            };

            function addGridRowActionDroplist(actionConfig, gridContainer, rowIndex, targetElement, rowData) {
                var menuClass = 'dropdown-menu pull-right dropdown-caret grid-action-menu';
                if (gridOptions.actionCellPosition == 'start') {
                    menuClass = 'dropdown-menu pull-left dropdown-caret grid-action-menu';
                }
                var gridActionId = $('<ul id="' + gridContainer.prop('id') + '-action-menu-' + rowIndex + '" class="' + menuClass + '"></ul>').appendTo('body');
                $.each(actionConfig, function (key, actionItemConfig) {
                    if (actionItemConfig.divider) {
                        $('<li class="divider"></li>').appendTo('#' + gridContainer.prop('id') + '-action-menu-' + rowIndex);
                    }

                    var actionItem = $('\
                    <li><a class="tooltip-success" data-rel="tooltip" data-placement="left" data-original-title="' + actionItemConfig.title + '"> \
                        <i class="' + actionItemConfig.iconClass + ' margin-right-10"></i>' + actionItemConfig.title + '</a> \
                    </li>').appendTo('#' + gridContainer.prop('id') + '-action-menu-' + rowIndex);

                    $(actionItem).on('click', function () {
                        actionItemConfig.onClick(rowIndex, targetElement, rowData);
                        gridActionId.remove();
                    });
                });
            };

            function emptyGridHandler() {
                if (!gridOptions.lazyLoading && gridOptions.defaultDataStatusMessage && gridContainer.data('contrailGrid')) {
                    gridContainer.data('contrailGrid').showGridMessage('empty');
                    if (gridOptions.checkboxSelectable != false) {
                        gridContainer.find('.headerRowCheckbox').attr('disabled', true);
                    }
                }
            };

            function errorGridHandler(errorMsg) {
                if (gridContainer.data('contrailGrid') != null) {
                    gridContainer.data('contrailGrid').showGridMessage('error', 'Error: ' + errorMsg);
                }
                if (gridOptions.checkboxSelectable != false) {
                    gridContainer.find('.headerRowCheckbox').attr('disabled', true);
                }
            };

            function onDataGridHandler() {
                if (gridOptions.checkboxSelectable != false) {
                    var disabled = true;
                    gridContainer.find('.rowCheckbox').each(function () {
                        disabled = disabled && (!contrail.checkIfExist($(this).attr('disabled')));
                    });

                    if (!disabled) {
                        gridContainer.find('.headerRowCheckbox').attr('disabled', true);
                    } else {
                        gridContainer.find('.headerRowCheckbox').removeAttr('disabled');
                    }
                }
            };
        }
    });

    function exportGridData2CSV(gridConfig, gridData) {
        var csvString = '',
            columnNameArray = [],
            columnExportFormatters = [];

        var gridColumns = gridConfig.columnHeader.columns;

        // Populate Header
        $.each(gridColumns, function(key, val){
            if(typeof val.exportConfig === 'undefined' || (typeof val.exportConfig.allow !== 'undefined' && val.exportConfig.allow == true)){
                columnNameArray.push(val.name);
                if(typeof val.exportConfig !== 'undefined' && typeof val.exportConfig.advFormatter === 'function' && val.exportConfig.advFormatter != false){
                    columnExportFormatters.push(function(data) { return String(val.exportConfig.advFormatter(data)); });
                } else if((typeof val.formatter !== 'undefined') && (typeof val.exportConfig === 'undefined' || (typeof val.exportConfig.stdFormatter !== 'undefined' && val.exportConfig.stdFormatter != false))){
                    columnExportFormatters.push(function(data) { return String(val.formatter(0, 0, 0, 0, data)); });
                } else {
                    columnExportFormatters.push(function(data) {
                        var dataValue = String(data[val.field]);
                        if(typeof dataValue === 'object') {
                            return JSON.stringify(dataValue);
                        } else {
                            return dataValue;
                        }
                    });
                }
            }
        });
        csvString += columnNameArray.join(',') + '\r\n';

        $.each(gridData, function(key, val){
            var dataLineArray = [];
            $.each(columnExportFormatters, function(keyCol, valCol){
                var dataValue = valCol(val);
                dataValue = dataValue.replace(/"/g, '');
                dataLineArray.push('"' + dataValue + '"');
            });
            csvString += dataLineArray.join(',') + '\r\n';
        });

        var blob = new Blob([csvString], {type:'text/csv'});
        var blobUrl = window.URL.createObjectURL(blob);

        var a = document.createElement('a');
        a.href = blobUrl;
        a.target = '_blank';
        a.download = ((contrail.checkIfExist(gridConfig.header.title.text) && (gridConfig.header.title.text != '' || gridConfig.header.title.text != false)) ? gridConfig.header.title.text.toLowerCase().split(' ').join('-') : 'download') + '.csv';

        document.body.appendChild(a);
        a.click();

        setTimeout(function(){
            a.remove();
            window.URL.revokeObjectURL(blobUrl);
        }, 10000);

    };

    return GridView;
});

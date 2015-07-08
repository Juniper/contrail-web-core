/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var GridFooterView = function (dataView, gridContainer, pagingInfo) {
        var pageSizeSelect = pagingInfo.pageSizeSelect,
            csgCurrentPageDropDown = null, csgPagerSizesDropdown = null,
            footerContainer = gridContainer.find('.grid-footer'),
            currentPagingInfo = null;

        this.init = function () {
            if (gridContainer.data('contrailGrid') == null) {
                return;
            }
            var eventMap = gridContainer.data('contrailGrid')._eventHandlerMap.dataView;
            eventMap['onPagingInfoChanged'] = function (e, pagingInfo) {
                var currentPageNum = null, currentPageSize = null;

                if (contrail.checkIfExist(currentPagingInfo)) {
                    currentPageNum = currentPagingInfo.pageNum;
                    currentPageSize = currentPagingInfo.pageSize;
                }

                pagingInfo.pageSizeSelect = pageSizeSelect;
                updatePager(pagingInfo);

                if (pagingInfo.totalPages - pagingInfo.pageNum <= 1 || currentPagingInfo == null || currentPageNum != pagingInfo.pageNum || currentPageSize != pagingInfo.pageSize) {
                    if (gridContainer.data('contrailGrid') != null && !gridContainer.data('contrailGrid')._gridStates.allPagesDataChecked) {
                        gridContainer.data('contrailGrid')._grid.setSelectedRows([])
                    }

                    setTimeout(function () {
                        if (contrail.checkIfExist(gridContainer.data('contrailGrid'))) {
                            gridContainer.data('contrailGrid').adjustAllRowHeight();
                            gridContainer.data('contrailGrid').adjustGridAlternateColors();
                        }
                    }, 600);
                }

                currentPagingInfo = pagingInfo;
            };
            dataView.onPagingInfoChanged.subscribe(eventMap['onPagingInfoChanged']);
            constructPagerUI();
            updatePager(pagingInfo);
            setPageSize(pagingInfo.pageSize);
        };

        function populatePagerSelect(data) {
            var returnData = new Array();
            $.each(data.pageSizeSelect, function (key, val) {
                returnData.push({
                    id: val,
                    text: String(val) + ' Records'
                });
            });
            return returnData;
        }

        function populateCurrentPageSelect(n) {
            var returnData = new Array();
            for (var i = 0; i < n; i++) {
                returnData.push({
                    id: i,
                    text: 'Page ' + String((i + 1))
                });
            }
            return returnData;
        };

        function constructPagerUI() {
            footerContainer.find('.pager-control-first').click(gotoFirst);
            footerContainer.find('.pager-control-prev').click(gotoPrev);
            footerContainer.find('.pager-control-next').click(gotoNext);
            footerContainer.find('.pager-control-last').click(gotoLast);

            csgCurrentPageDropDown = footerContainer.find('.csg-current-page').contrailDropdown({
                placeholder: 'Select..',
                data: [{id: 0, text: 'Page 1'}],
                change: function (e) {
                    dataView.setPagingOptions({pageNum: e.val});
                    csgCurrentPageDropDown.value(String(e.val));
                },
                formatResult: function (item) {
                    return '<span class="grid-footer-dropdown-item">' + item.text + '</span>';
                }
            }).data('contrailDropdown');
            csgCurrentPageDropDown.value('0');

            csgPagerSizesDropdown = footerContainer.find('.csg-pager-sizes').contrailDropdown({
                data: populatePagerSelect(pagingInfo),
                change: function (e) {
                    dataView.setPagingOptions({pageSize: parseInt(e.val), pageNum: 0});
                },
                formatResult: function (item) {
                    return '<span class="grid-footer-dropdown-item">' + item.text + '</span>';
                }
            }).data('contrailDropdown');
            csgPagerSizesDropdown.value(String(pagingInfo.pageSize));

            footerContainer.find(".ui-icon-container").hover(function () {
                $(this).toggleClass("ui-state-hover");
            });
        }

        function updatePager(pagingInfo) {
            var state = getNavState();
            footerContainer.find(".slick-pager-nav i").addClass("icon-disabled");
            if (state.canGotoFirst) {
                footerContainer.find(".icon-step-backward").removeClass("icon-disabled");
            }
            if (state.canGotoLast) {
                footerContainer.find(".icon-step-forward").removeClass("icon-disabled");
            }
            if (state.canGotoNext) {
                footerContainer.find(".icon-forward").removeClass("icon-disabled");
            }
            if (state.canGotoPrev) {
                footerContainer.find(".icon-backward").removeClass("icon-disabled");
            }

            footerContainer.find(".slick-pager-info").text("Total: " + pagingInfo.totalRows + " records");
            footerContainer.find('.csg-total-page-count').text(pagingInfo.totalPages);

            var currentPageSelectData = populateCurrentPageSelect(pagingInfo.totalPages);

            csgCurrentPageDropDown.setData(currentPageSelectData);
            csgCurrentPageDropDown.value('0');
        }

        function getNavState() {
            var pagingInfo = dataView.getPagingInfo();
            var lastPage = pagingInfo.totalPages - 1;

            return {
                canGotoFirst: pagingInfo.pageSize != 0 && pagingInfo.pageNum > 0,
                canGotoLast: pagingInfo.pageSize != 0 && pagingInfo.pageNum < lastPage,
                canGotoPrev: pagingInfo.pageSize != 0 && pagingInfo.pageNum > 0,
                canGotoNext: pagingInfo.pageSize != 0 && pagingInfo.pageNum < lastPage,
                pagingInfo: pagingInfo
            };
        }

        function setPageSize(n) {
            dataView.setRefreshHints({
                isFilterUnchanged: true
            });
            dataView.setPagingOptions({pageSize: n});
        }

        function gotoFirst() {
            if (getNavState().canGotoFirst) {
                dataView.setPagingOptions({pageNum: 0});
                csgCurrentPageDropDown.value('0');
            }
        }

        function gotoLast() {
            var state = getNavState();
            if (state.canGotoLast) {
                dataView.setPagingOptions({pageNum: state.pagingInfo.totalPages - 1});
                csgCurrentPageDropDown.value(String(state.pagingInfo.totalPages - 1));
            }
        }

        function gotoPrev() {
            var state = getNavState();
            if (state.canGotoPrev) {
                dataView.setPagingOptions({pageNum: state.pagingInfo.pageNum - 1});
                csgCurrentPageDropDown.value(String(state.pagingInfo.pageNum - 1));
            }
        }

        function gotoNext() {
            var state = getNavState();
            if (state.canGotoNext) {
                dataView.setPagingOptions({pageNum: state.pagingInfo.pageNum + 1});
                csgCurrentPageDropDown.value(String(state.pagingInfo.pageNum + 1));
            }
        }
    };

    return GridFooterView;
});
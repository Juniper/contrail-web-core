/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-remote-data-handler'
], function (_, ContrailRemoteDataHandler) {
    var ContrailListModel = function (listModelConfig, parentModelList) {
        var contrailListModel = {}, newContrailListModel = {},
            hlContrailListModel, contrailDataHandler = null, newContrailDataHandler, self = this,
            cachedData, remoteHandlerConfig, hlModelConfig,
            cacheUsedStatus = {isCacheUsed: false, reload: true},
            sortConfig = listModelConfig['sortConfig'];

        var defaultCacheConfig = {
            cacheConfig: {
                cacheTimeout: cowc.LIST_CACHE_UPDATE_INTERVAL,
                loadOnTimeout: true
            }
        };

        var childDefaultCacheConfig = {
            cacheConfig: {
                cacheTimeout: 0,
                loadOnTimeout: true
            }
        };

        if (listModelConfig != null) {
            var modelConfig = $.extend(true, {}, defaultCacheConfig, listModelConfig),
                cacheConfig = modelConfig['cacheConfig'];

            contrailListModel = initContrailListModel(cacheConfig, sortConfig);

            if(modelConfig['remote'] != null) {
                if(contrail.checkIfFunction(modelConfig['remote'].onAllRequestsCompleteCB)) {
                    contrailListModel.onAllRequestsComplete.subscribe(function () {
                        modelConfig['remote'].onAllRequestsCompleteCB(contrailListModel, parentModelList);
                    });
                }
            }

            if (modelConfig.data != null) {
                contrailListModel.setData(modelConfig.data);
                bindDataHandler2Model(contrailListModel);
            } else if (modelConfig.remote != null && modelConfig.remote.ajaxConfig != null) {
                hlModelConfig = modelConfig['remote']['hlRemoteConfig'];
                cachedData = (contrailListModel.ucid != null) ? cowch.getDataFromCache(contrailListModel.ucid) : null;
                cacheUsedStatus = setCachedData2Model(contrailListModel, cacheConfig);

                if (cacheUsedStatus['isCacheUsed']) {
                    if (cacheUsedStatus['reload']) {
                        var cachedContrailListModel = cachedData['dataObject']['listModel'],
                            offset = cachedContrailListModel._idOffset;

                        newContrailListModel = initContrailListModel(cacheConfig, sortConfig, offset);
                        remoteHandlerConfig = getUpdateRemoteHandlerConfig(modelConfig, newContrailListModel, contrailListModel, parentModelList);
                        newContrailDataHandler = new ContrailRemoteDataHandler(remoteHandlerConfig);

                        if (hlModelConfig != null) {
                            var childModelConfig = $.extend(true, {}, childDefaultCacheConfig, hlModelConfig);
                            hlContrailListModel = getNewContrailListModel(childModelConfig, [newContrailListModel, contrailListModel]);
                        }
                        bindDataHandler2Model(contrailListModel, newContrailDataHandler, hlContrailListModel);
                        bindDataHandler2Model(newContrailListModel, newContrailDataHandler, hlContrailListModel);
                    } else {
                        // Setting autoFetchData=false i.e create request handler but don't fetch data
                        createRemoteDataHandler(false);
                    }
                    contrailListModel.onAllRequestsComplete.notify();
                } else {
                    createRemoteDataHandler();
                }
            }
        }

        function createRemoteDataHandler(autoFetchData) {
            if (hlModelConfig != null) {
                var childModelConfig = $.extend(true, {}, childDefaultCacheConfig, hlModelConfig);
                hlContrailListModel = getNewContrailListModel(childModelConfig, [contrailListModel]);
            }
            remoteHandlerConfig = getRemoteHandlerConfig(modelConfig, contrailListModel, parentModelList, autoFetchData);
            contrailDataHandler = new ContrailRemoteDataHandler(remoteHandlerConfig);

            bindDataHandler2Model(contrailListModel, contrailDataHandler, hlContrailListModel);
        };

        return contrailListModel;
    };

    function setCachedData2Model(contrailListModel, cacheConfig) {
        var isCacheUsed = false, usePrimaryCache = true,
            reload = true, secondaryCacheStatus,
            cachedData = (cacheConfig.ucid != null) ? cowch.getDataFromCache(cacheConfig.ucid) : null,
            setCachedData2ModelCB = (cacheConfig != null) ? cacheConfig['setCachedData2ModelCB']  : null;

        usePrimaryCache = cowch.isCacheValid(cacheConfig, cachedData, 'listModel');

        if (usePrimaryCache) {
            var cachedContrailListModel = cachedData['dataObject']['listModel'],
                lastUpdateTime = cachedData['lastUpdateTime'];

            contrailListModel.setData(cachedContrailListModel.getItems());
            contrailListModel.loadedFromCache = true;

            isCacheUsed = true;
            if (cacheConfig['cacheTimeout'] < ($.now() - lastUpdateTime)) {
                reload = true;
            } else {
                reload = false;
            }
        } else if (contrail.checkIfFunction(setCachedData2ModelCB)) {
            secondaryCacheStatus = cacheConfig['setCachedData2ModelCB'](contrailListModel, cacheConfig);
            if (contrail.checkIfExist(secondaryCacheStatus)) {
                isCacheUsed = contrail.handleIfNull(secondaryCacheStatus['isCacheUsed'], false);
                reload = contrail.handleIfNull(secondaryCacheStatus['reload'], true);
            } else {
                isCacheUsed = false;
                reload = true;
            }
        }

        return {isCacheUsed: isCacheUsed, reload: reload};
    };

    function initContrailListModel(cacheConfig, sortConfig, offset) {
        var slickDataView = new Slick.Data.DataView({inlineFilters: true}),
            contrailListModel = {};

        $.extend(true, contrailListModel, slickDataView, {
            _type: 'contrailListModel',
            _idOffset: (offset != null) ? offset : 0,
            error: false,
            empty: false,
            errorList: [],
            sortConfig: sortConfig,
            setData: function (data) {
                // Setting id for each data-item; Required to instantiate data-view.
                setId4Idx(data, this);
                this.beginUpdate();
                this.setItems(data);
                this.endUpdate();
            },
            setSearchFilter: function (searchColumns, searchFilter) {
                this.setFilterArgs({
                    searchString: '',
                    searchColumns: searchColumns
                });
                this.setFilter(searchFilter);
            },
            addData: function (data) {
                var dis = this;
                setId4Idx(data, this);
                this.beginUpdate();
                $.each(data, function (key, val) {
                    dis.addItem(val);
                });
                this.endUpdate();
            },
            updateData: function (data) {
                this.beginUpdate();
                var dis = this;
                $.each(data, function (key, val) {
                    dis.updateItem(val.cgrid, val);
                });
                this.endUpdate();
            },
            deleteDataByIds: function (ids) {
                this.beginUpdate();
                var dis = this;
                $.each(ids, function (key, val) {
                    dis.deleteItem(val);
                });
                this.endUpdate();
            },
            performDefaultSort: function() {
                performDefaultSort(sortConfig, this);
            }
        });

        contrailListModel.onAllRequestsComplete = new Slick.Event();

        if(cacheConfig != null) {
            contrailListModel = $.extend(true, contrailListModel, {
                ucid: cacheConfig['ucid']
            });
        }

        return contrailListModel;
    };

    function bindDataHandler2Model(contrailListModel, contrailDataHandler, hlContrailListModel) {
        contrailListModel['isPrimaryRequestInProgress'] = function () {
            return (contrailDataHandler != null) ? contrailDataHandler.isPrimaryRequestInProgress() : false;
        };

        contrailListModel['isVLRequestInProgress'] = function () {
            return (contrailDataHandler != null) ? contrailDataHandler.isVLRequestInProgress() : false;
        };

        contrailListModel['isRequestInProgress'] = function () {
            var currentModelRequestInProgress = (contrailDataHandler != null) ? contrailDataHandler.isRequestInProgress() : false,
                hlModelRequestInProgress = (hlContrailListModel != null) ? hlContrailListModel.isRequestInProgress() : false;

            return (currentModelRequestInProgress || hlModelRequestInProgress);
        };

        contrailListModel['refreshData'] = function () {
            if (contrailDataHandler != null && !contrailDataHandler.isRequestInProgress()) {
                resetListModel4Refresh(contrailListModel);
                contrailDataHandler.refreshData();
                if (hlContrailListModel != null) {
                    hlContrailListModel.refreshData();
                }
            }
         }
    };

    function getRemoteHandlerConfig(listModelConfig, contrailListModel, parentModelList, autoFetchData) {
        var remoteHandlerConfig = {
                autoFetchData: (autoFetchData != null) ? autoFetchData : true
            },
            primaryRemote = listModelConfig.remote,
            vlRemoteConfig = contrail.handleIfNull(listModelConfig.vlRemoteConfig, {}),
            vlRemoteList = contrail.handleIfNull(vlRemoteConfig['vlRemoteList'], []),
            primaryRemoteConfig = {
                ajaxConfig: primaryRemote.ajaxConfig,
                dataParser: primaryRemote.dataParser,
                initCallback: primaryRemote.initCallback,
                successCallback: function (resultJSON, resetDataFlag, response) {
                    if (resetDataFlag) {
                        contrailListModel.setData(resultJSON);
                    } else {
                        contrailListModel.addData(resultJSON);
                    }
                    if (contrail.checkIfFunction(primaryRemote.successCallback)) {
                        primaryRemote.successCallback(resultJSON, contrailListModel, response);
                    }
                },
                refreshSuccessCallback: function () {},
                failureCallback: function (xhr) {
                    contrailListModel.error = true;
                    contrailListModel.errorList.push(xhr);
                    if (parentModelList != null && parentModelList.length > 0) {
                        for (var i = 0; i < 1; i++) {
                            parentModelList[i].error = true;
                            parentModelList[i].errorList.push(xhr);
                        }
                    }
                    if (contrail.checkIfFunction(primaryRemote.failureCallback)) {
                        primaryRemote.failureCallback(xhr, contrailListModel);
                    }
                },
                completeCallback: function (response) {
                    if (contrail.checkIfFunction(primaryRemote.completeCallback)) {
                        primaryRemote.completeCallback(response, contrailListModel, parentModelList);
                    }

                    if (!contrailListModel.isRequestInProgress()) {
                        updateDataInCache(contrailListModel);
                    }

                    if (parentModelList != null && parentModelList.length > 0) {
                        for (var i = 0; i < 1; i++) {
                            if (!parentModelList[i].isRequestInProgress()) {
                                updateDataInCache(parentModelList[i]);
                            }
                        }
                    }
                }
            },
            vlRemote;

        remoteHandlerConfig['primaryRemoteConfig'] = primaryRemoteConfig;
        remoteHandlerConfig['onAllRequestsCompleteCallback'] = function() {
            if(!contrailListModel.isRequestInProgress()) {
                contrailListModel.onAllRequestsComplete.notify();
            }
            if (parentModelList != null && parentModelList.length > 0) {
                for (var i = 0; i < 1; i++) {
                    if (!parentModelList[i].isRequestInProgress()) {
                        parentModelList[i].onAllRequestsComplete.notify();
                    }
                }
            }
        };

        remoteHandlerConfig['vlRemoteConfig'] = {
            vlRemoteList: [],
            completeCallback: function () {
                if (contrail.checkIfFunction(vlRemoteConfig['completeCallback'])) {
                    vlRemoteConfig['completeCallback'](contrailListModel, parentModelList);
                }

                if (!contrailListModel.isRequestInProgress()) {
                    updateDataInCache(contrailListModel);
                }

                if (parentModelList != null && parentModelList.length > 0) {
                    if (!parentModelList[0].isRequestInProgress()) {
                        updateDataInCache(parentModelList[0]);
                    }
                }
            }
        };

        for (var i = 0; i < vlRemoteList.length; i++) {
            var vlSuccessCallback = vlRemoteList[i].successCallback,
                vlFailureCallback = vlRemoteList[i].failureCallback;

            vlRemote = {
                getAjaxConfig: vlRemoteList[i].getAjaxConfig,
                dataParser: vlRemoteList[i].dataParser,
                initCallback: vlRemoteList[i].initCallback,
                successCallback: getVLRemoteSuccessCB(vlSuccessCallback, contrailListModel, parentModelList),
                failureCallback: getVLRemoteFailureCB(vlFailureCallback, contrailListModel, parentModelList)
            }
            remoteHandlerConfig['vlRemoteConfig']['vlRemoteList'].push(vlRemote);
        };


        return remoteHandlerConfig;
    };

    function getVLRemoteSuccessCB(vlSuccessCallback, contrailListModel, parentModelList) {
        return function (response) {
            if (contrail.checkIfFunction(vlSuccessCallback)) {
                vlSuccessCallback(response, contrailListModel, parentModelList);
            }
        };
    };

    function getVLRemoteFailureCB(vlFailureCallback, contrailListModel, parentModelList) {
        return function (xhr) {
            contrailListModel.error = true;
            contrailListModel.errorList.push(xhr);
            if (parentModelList != null && parentModelList.length > 0) {
                for (var i = 0; i < 1; i++) {
                    parentModelList[i].error = true;
                }
            }
            if (contrail.checkIfFunction(vlFailureCallback)) {
                vlFailureCallback(xhr, contrailListModel);
            }
        };
    };

    function getUpdateRemoteHandlerConfig(listModelConfig, newContrailListModel, visibleContrailListModel, parentModelList) {
        var remoteHandlerConfig = {},
            primaryRemote = listModelConfig.remote,
            vlRemoteConfig = contrail.handleIfNull(listModelConfig.vlRemoteConfig, {}),
            vlRemoteList = contrail.handleIfNull(vlRemoteConfig['vlRemoteList'], []),
            primaryRemoteConfig = {
                ajaxConfig: primaryRemote.ajaxConfig,
                dataParser: primaryRemote.dataParser,
                initCallback: primaryRemote.initCallback,
                successCallback: function (resultJSON, resetDataFlag, response) {
                    // TODO: refreshData for newContrailListModel will never get fired.
                    if (resetDataFlag) {
                        newContrailListModel.setData(resultJSON);
                    } else {
                        newContrailListModel.addData(resultJSON);
                    }
                    if (contrail.checkIfFunction(primaryRemote.successCallback)) {
                        primaryRemote.successCallback(resultJSON, newContrailListModel, response);
                    }
                },
                refreshSuccessCallback: function () {},
                failureCallback: function (xhr) {
                    newContrailListModel.error = true;
                    newContrailListModel.errorList.push(xhr);

                    if (parentModelList != null && parentModelList.length > 0) {
                        for (var i = 0; i < 1; i++) {
                            parentModelList[i].error = true;
                            parentModelList[i].errorList.push(xhr);
                        }
                    }

                    if (contrail.checkIfFunction(primaryRemote.failureCallback)) {
                        primaryRemote.failureCallback(xhr, newContrailListModel);
                    }
                },
                completeCallback: function (response) {

                    if (contrail.checkIfFunction(primaryRemote.completeCallback)) {
                        primaryRemote.completeCallback(response, newContrailListModel, parentModelList);
                    }

                    if (!newContrailListModel.isRequestInProgress()) {
                        updateDataInCache(newContrailListModel);

                        visibleContrailListModel.setData([]);
                        visibleContrailListModel.setData(newContrailListModel.getItems());
                    }

                    if (parentModelList != null && parentModelList.length > 0) {
                        for (var i = 0; i < 1; i++) {
                            if (!parentModelList[i].isRequestInProgress()) {
                                updateDataInCache(parentModelList[i]);
                            }
                        }
                    }
                }
            },
            vlRemote;

        remoteHandlerConfig['primaryRemoteConfig'] = primaryRemoteConfig;

        remoteHandlerConfig['onAllRequestsCompleteCallback'] = function() {
            //TODO: Debug why check for isRequestInProgress is not required
            visibleContrailListModel.onAllRequestsComplete.notify();
            newContrailListModel.onAllRequestsComplete.notify();

            if (parentModelList != null && parentModelList.length > 0) {
                for (var i = 0; i < 1; i++) {
                    if (!parentModelList[i].isRequestInProgress()) {
                        parentModelList[i].onAllRequestsComplete.notify();
                    }
                }
            }
        };

        remoteHandlerConfig['vlRemoteConfig'] = {
            vlRemoteList: [],
            completeCallback: function () {
                if (contrail.checkIfFunction(vlRemoteConfig['completeCallback'])) {
                    vlRemoteConfig['completeCallback'](newContrailListModel, parentModelList);
                }

                if (!newContrailListModel.isRequestInProgress()) {
                    updateDataInCache(newContrailListModel);

                    visibleContrailListModel.setData([]);
                    visibleContrailListModel.setData(newContrailListModel.getItems());
                }

                if (parentModelList != null && parentModelList.length > 0) {
                    if (!parentModelList[0].isRequestInProgress()) {
                        updateDataInCache(parentModelList[0]);
                    }
                }
            }
        };

        for (var i = 0; i < vlRemoteList.length; i++) {
            var vlSuccessCallback = vlRemoteList[i].successCallback,
                vlFailureCallback = vlRemoteList[i].failureCallback;

            vlRemote = {
                getAjaxConfig: vlRemoteList[i].getAjaxConfig,
                dataParser: vlRemoteList[i].dataParser,
                initCallback: vlRemoteList[i].initCallback,
                successCallback: getVLRemoteSuccessCB(vlSuccessCallback, newContrailListModel, parentModelList),
                failureCallback: getVLRemoteFailureCB(vlFailureCallback, newContrailListModel, parentModelList)
            }
            remoteHandlerConfig['vlRemoteConfig']['vlRemoteList'].push(vlRemote);
        }

        return remoteHandlerConfig;
    };

    function updateDataInCache(contrailListModel) {
        if (contrailListModel.ucid != null) {
            //TODO: Binding of cached listModel (if any) with existing view should be destroyed.
            cowch.setData2Cache(contrailListModel.ucid, {
                listModel: contrailListModel
            });
        }
    };

    function getNewContrailListModel(modelConfig, parentListModel) {
        return new ContrailListModel(modelConfig, parentListModel);
    };

    function resetListModel4Refresh(listModel) {
        listModel.error = false;
        listModel.errorList = [];
    };

    function setId4Idx(data, dis) {
        var offset = dis._idOffset;
        // Setting id for each data-item; Required to instantiate data-view.
        if (data != null && data.length > 0) {
            $.each(data, function (key, val) {
                if (!contrail.checkIfExist(val.cgrid)) {
                    data[key].cgrid = 'id_' + (key + offset);
                }
            });
            dis._idOffset += data.length;
        }
    };

    function performDefaultSort(sortConfig, contrailListModel) {
        var defaultSortColumns = contrail.checkIfExist(sortConfig) ? sortConfig['defaultSortColumns'] : [];

        if(defaultSortColumns.length > 0) {
            contrailListModel.sort(function (dataRow1, dataRow2) {
                for (var i = 0, l = defaultSortColumns.length; i < l; i++) {
                    var field = defaultSortColumns[i].sortColumn.field,
                        sign = defaultSortColumns[i].sortAsc ? 1 : -1,
                        sortColumn = defaultSortColumns[i].sortColumn,
                        result = 0, value1, value2;

                    if(contrail.checkIfExist(sortColumn.sortable)) {
                        value1 = (contrail.checkIfExist(sortColumn.sortable.sortBy) && sortColumn.sortable.sortBy == 'formattedValue') ? sortColumn.formatter('', '', '', '', dataRow1) : dataRow1[field];
                        value2 = (contrail.checkIfExist(sortColumn.sortable.sortBy) && sortColumn.sortable.sortBy == 'formattedValue') ? sortColumn.formatter('', '', '', '', dataRow2) : dataRow2[field];
                    } else {
                        value1 = dataRow1[field];
                        value2 = dataRow2[field];
                    }

                    if(defaultSortColumns[i].sortColumn.sorter != null){
                        result = defaultSortColumns[i].sortColumn.sorter(value1, value2, sign); // sorter property from column definition will be called if present
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

    return ContrailListModel
});
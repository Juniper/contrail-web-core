/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-remote-data-handler'
], function (_, ContrailRemoteDataHandler) {
    var ContrailListModel = function (listModelConfig) {
        var contrailListModel = {}, newContrailListModel = {},
            contrailDataHandler = null, self = this,
            cachedData, lastUpdateTime, remoteHandlerConfig,
            useCache = true;

        var defaultCacheConfig = {
            cacheConfig: {
                cacheTimeout: cowc.LIST_CACHE_UPDATE_INTERVAL,
                loadOnTimeout: false
            }
        };

        var modelConfig = $.extend(true, {}, listModelConfig, defaultCacheConfig),
            cacheConfig = modelConfig['cacheConfig'];

        contrailListModel = createContrailListModel(modelConfig);

        if (modelConfig != null) {
            if (modelConfig.data != null) {
                contrailListModel.setData(modelConfig.data);
            } else if (modelConfig.remote != null && modelConfig.remote.ajaxConfig != null) {
                cachedData = (contrailListModel.getDataFromCache != null) ? contrailListModel.getDataFromCache(contrailListModel.ucid) : null;
                if(cacheConfig.cacheTimeout == 0 || cachedData == null) {
                    useCache = false;
                } else if (cachedData != null && (cacheConfig.cacheTimeout < ($.now() - cachedData['lastUpdateTime'])) && cacheConfig.loadOnTimeout == false) {
                    useCache = false;
                }

                if(useCache) {
                    var cachedContrailListModel = cachedData['dataObject']['listModel'],
                        offset = cachedContrailListModel._idOffset;

                    newContrailListModel = createContrailListModel(modelConfig);
                    remoteHandlerConfig = getUpdateRemoteHandlerConfig(modelConfig, newContrailListModel, contrailListModel);
                    contrailDataHandler = createGridFromCache(cachedData, contrailListModel, newContrailListModel, remoteHandlerConfig);

                } else {
                    remoteHandlerConfig = getRemoteHandlerConfig(modelConfig, contrailListModel);
                    contrailDataHandler = new ContrailRemoteDataHandler(remoteHandlerConfig);
                    contrailListModel['refreshData'] = function() {
                        if(contrailDataHandler != null) {
                            contrailDataHandler.refreshData();
                        }
                    }

                }
            }
        }

        this.isPrimaryRequestInProgress = function() {
            return (contrailDataHandler != null) ? contrailDataHandler.isPrimaryRequestInProgress() : false;
        }

        this.isLazyRequestInProgress = function() {
            return (contrailDataHandler != null) ? contrailDataHandler.isLazyRequestInProgress() : false;
        }

        this.isRequestInProgress = function() {
            return (contrailDataHandler != null) ? contrailDataHandler.isRequestInProgress() : false;
        }

        return contrailListModel;
    };

    function createGridFromCache(cachedData, contrailListModel, newContrailListModel, remoteHandlerConfig) {
        var cachedContrailListModel = cachedData['dataObject']['listModel'],
            lastUpdateTime = cachedData['lastUpdateTime'],
            newContrailDataHandler;

        contrailListModel.setData(cachedContrailListModel.getItems());

        if (cowc.LIST_CACHE_UPDATE_INTERVAL < ($.now() - lastUpdateTime)) {
            newContrailDataHandler = new ContrailRemoteDataHandler(remoteHandlerConfig);

            newContrailListModel['refreshData'] = function() {
                if(newContrailDataHandler != null) {
                    newContrailDataHandler.refreshData();
                }
            }
        }

        return newContrailDataHandler;
    };

    function createContrailListModel(listModelConfig, offset) {
        var slickDataView = new Slick.Data.DataView({inlineFilters: true}),
            contrailListModel = {};

        $.extend(true, contrailListModel, slickDataView, {
            _idOffset: (offset != null) ? offset : 0,
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
            refreshData: function() {
                // Will be set after data handler is created.
            },
            getDataFromCache: listModelConfig['cacheConfig']['getDataFromCache'],
            setData2Cache: listModelConfig['cacheConfig']['setData2Cache'],
            ucid:listModelConfig['cacheConfig']['ucid']
        });

        return contrailListModel;
    }

    function getRemoteHandlerConfig(listModelConfig, contrailListModel) {
        var remoteHandlerConfig = {},
            primaryRemote = listModelConfig.remote,
            lazyRemote = listModelConfig.lazyRemote,
            primaryRemoteConfig = {
                ajaxConfig: primaryRemote.ajaxConfig,
                dataParser: primaryRemote.dataParser,
                initCallback: primaryRemote.initCallback,
                successCallback: function (response) {
                    contrailListModel.addData(response);
                    if (contrail.checkIfFunction(primaryRemote.successCallback)) {
                        primaryRemote.successCallback(response, contrailListModel);
                    }
                },
                updateCacheCallback: function() {
                    if (contrailListModel.setData2Cache != null) {
                        //TODO: Binding of cached listModel (if any) with existing view should be destroyed.
                        contrailListModel.setData2Cache(contrailListModel.ucid, {
                            listModel: contrailListModel
                        });
                    }
                },
                refreshSuccessCallback: function (response, cleanAndRefresh) {
                    if (cleanAndRefresh) {
                        contrailListModel.setData(response);
                    } else {
                        contrailListModel.addData(response);
                    }
                    if (contrail.checkIfFunction(primaryRemote.refreshSuccessCallback)) {
                        primaryRemote.refreshSuccessCallback(response, contrailListModel);
                    }
                },
                failureCallback: function (xhr) {
                    if (contrail.checkIfFunction(primaryRemote.failureCallback)) {
                        primaryRemote.failureCallback(xhr, contrailListModel);
                    }
                }
            },
            lazyRemoteConfig;

        remoteHandlerConfig['primaryRemoteConfig'] = primaryRemoteConfig;
        remoteHandlerConfig['lazyRemoteConfig'] = [];

        for (var i = 0; lazyRemote != null && i < lazyRemote.length; i++) {
            var lSuccessCallback = lazyRemote[i].successCallback,
                lFailureCallback = lazyRemote[i].failureCallback;

            lazyRemoteConfig = {
                getAjaxConfig: lazyRemote[i].getAjaxConfig,
                dataParser: lazyRemote[i].dataParser,
                initCallback: lazyRemote[i].initCallback,
                successCallback: function (response) {
                    if (contrail.checkIfFunction(lSuccessCallback)) {
                        lSuccessCallback(response, contrailListModel);
                    }
                },
                failureCallback: function (xhr) {
                    if (contrail.checkIfFunction(lFailureCallback)) {
                        lFailureCallback(xhr, contrailListModel);
                    }
                }
            }
            remoteHandlerConfig['lazyRemoteConfig'].push(lazyRemoteConfig);
        }

        return remoteHandlerConfig;
    };

    function getUpdateRemoteHandlerConfig(listModelConfig, newContrailListModel, contrailListModel) {
        var remoteHandlerConfig = {},
            primaryRemote = listModelConfig.remote,
            lazyRemote = listModelConfig.lazyRemote,
            primaryRemoteConfig = {
                ajaxConfig: primaryRemote.ajaxConfig,
                dataParser: primaryRemote.dataParser,
                initCallback: primaryRemote.initCallback,
                successCallback: function (response) {
                    newContrailListModel.addData(response);
                    if (contrail.checkIfFunction(primaryRemote.successCallback)) {
                        primaryRemote.successCallback(response, newContrailListModel);
                    }
                },
                updateCacheCallback: function() {
                    if (newContrailListModel.setData2Cache != null) {
                        //TODO: Binding of cached listModel (if any) with existing view should be destroyed.
                        newContrailListModel.setData2Cache(newContrailListModel.ucid, {
                            listModel: newContrailListModel
                        });
                    }
                    // TODO: We also need update data due to lazy loading.
                    contrailListModel.setData([]);
                    contrailListModel.setData(newContrailListModel.getItems());
                },
                refreshSuccessCallback: function (response, cleanAndRefresh) {
                    if (cleanAndRefresh) {
                        newContrailListModel.setData(response);
                    } else {
                        newContrailListModel.addData(response);
                    }
                    if (contrail.checkIfFunction(primaryRemote.refreshSuccessCallback)) {
                        primaryRemote.refreshSuccessCallback(response, newContrailListModel);
                    }
                },
                failureCallback: function (xhr) {
                    if (contrail.checkIfFunction(primaryRemote.failureCallback)) {
                        primaryRemote.failureCallback(xhr, newContrailListModel);
                    }
                }
            },
            lazyRemoteConfig;

        remoteHandlerConfig['primaryRemoteConfig'] = primaryRemoteConfig;
        remoteHandlerConfig['lazyRemoteConfig'] = [];

        for (var i = 0; lazyRemote != null && i < lazyRemote.length; i++) {
            var lSuccessCallback = lazyRemote[i].successCallback,
                lFailureCallback = lazyRemote[i].failureCallback;

            lazyRemoteConfig = {
                getAjaxConfig: lazyRemote[i].getAjaxConfig,
                dataParser: lazyRemote[i].dataParser,
                initCallback: lazyRemote[i].initCallback,
                successCallback: function (response, updateActiveModel) {
                    if (contrail.checkIfFunction(lSuccessCallback)) {
                        if(updateActiveModel) {
                            lSuccessCallback(response, contrailListModel);
                            lSuccessCallback(response, newContrailListModel);
                        } else {
                            lSuccessCallback(response, newContrailListModel);
                        }
                    }
                },
                failureCallback: function (xhr) {
                    if (contrail.checkIfFunction(lFailureCallback)) {
                        lFailureCallback(xhr, newContrailListModel);
                    }
                }
            }
            remoteHandlerConfig['lazyRemoteConfig'].push(lazyRemoteConfig);
        }

        return remoteHandlerConfig;
    };

    function setId4Idx(data, dis) {
        var offset = dis._idOffset;
        // Setting id for each data-item; Required to instantiate data-view.
        if (data.length > 0) {
            $.each(data, function (key, val) {
                if (!contrail.checkIfExist(val.cgrid)) {
                    data[key].cgrid = 'id_' + (key + offset);
                }
            });
            dis._idOffset += data.length;
        }
    }

    return ContrailListModel
});
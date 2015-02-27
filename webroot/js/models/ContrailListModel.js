/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-remote-data-handler'
], function (_, ContrailRemoteDataHandler) {
    var ContrailListModel = function (listModelConfig, parentListModel) {
        var contrailListModel = {}, newContrailListModel = {},
            hlContrailListModel = {}, contrailDataHandler = null, self = this,
            cachedData, lastUpdateTime, remoteHandlerConfig, hlRemoteConfig,
            useCache = true;

        var defaultCacheConfig = {
            cacheConfig: {
                cacheTimeout: cowc.LIST_CACHE_UPDATE_INTERVAL,
                loadOnTimeout: false
            }
        };

        var modelConfig = $.extend(true, {}, defaultCacheConfig, listModelConfig),
            cacheConfig = modelConfig['cacheConfig'];

        contrailListModel = createContrailListModel(modelConfig);

        if (modelConfig != null) {
            if (modelConfig.data != null) {
                contrailListModel.setData(modelConfig.data);
            } else if (modelConfig.remote != null && modelConfig.remote.ajaxConfig != null) {
                hlRemoteConfig = modelConfig['remote']['hlRemoteConfig'];
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
                    if(hlRemoteConfig != null) {
                        hlContrailListModel = createHLazyListModel(hlRemoteConfig, contrailListModel);
                    }
                    remoteHandlerConfig = getRemoteHandlerConfig(modelConfig, contrailListModel, parentListModel);
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

        this.isVLRequestInProgress = function() {
            return (contrailDataHandler != null) ? contrailDataHandler.isVLRequestInProgress() : false;
        }

        this.isRequestInProgress = function() {
            var currentModelRequestInProgress = (contrailDataHandler != null) ? contrailDataHandler.isRequestInProgress() : false;
            var hlModelRequestInProgress = (hlContrailListModel != null) ? hlContrailListModel.isRequestInProgress() : false;
            return currentModelRequestInProgress && hlModelRequestInProgress;
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

    function getRemoteHandlerConfig(listModelConfig, contrailListModel, parentListModel) {
        var remoteHandlerConfig = {},
            primaryRemote = listModelConfig.remote,
            vlRemoteConfig = (listModelConfig.vlRemoteConfig != null) ? listModelConfig.vlRemoteConfig : {},
            vlRemoteList = (listModelConfig.lazyRemote != null) ? listModelConfig.lazyRemote : [],
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
                },
                completeCallback: function(response) {
                    if (contrailListModel.setData2Cache != null) {
                        //TODO: Binding of cached listModel (if any) with existing view should be destroyed.
                        contrailListModel.setData2Cache(contrailListModel.ucid, {
                            listModel: contrailListModel
                        });
                    }
                    if (contrail.checkIfFunction(primaryRemote.completeCallback)) {
                        primaryRemote.completeCallback(response, contrailListModel, parentListModel);
                    }
                }
            },
            vlRemote;

        remoteHandlerConfig['primaryRemoteConfig'] = primaryRemoteConfig;

        remoteHandlerConfig['vlRemoteConfig'] = {
            vlRemoteList: [],
            completeCallback: function() {
                if (contrail.checkIfFunction(vlRemoteConfig['completeCallback'])) {
                    vlRemoteConfig['completeCallback'](contrailListModel, parentListModel);
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
                successCallback: function (response) {
                    if (contrail.checkIfFunction(vlSuccessCallback)) {
                        vlSuccessCallback(response, contrailListModel);
                    }
                },
                failureCallback: function (xhr) {
                    if (contrail.checkIfFunction(vlFailureCallback)) {
                        vlFailureCallback(xhr, contrailListModel);
                    }
                }
            }
            remoteHandlerConfig['vlRemoteConfig']['vlRemoteList'].push(vlRemote);
        }

        return remoteHandlerConfig;
    };

    function getUpdateRemoteHandlerConfig(listModelConfig, newContrailListModel, contrailListModel) {
        var remoteHandlerConfig = {},
            primaryRemote = listModelConfig.remote,
            vlRemoteList = (listModelConfig.lazyRemote != null) ? listModelConfig.lazyRemote : [],
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
                },
                completeCallback: function() {
                    console.log("I am in complete callback");
                    if (newContrailListModel.setData2Cache != null) {
                        //TODO: Binding of cached listModel (if any) with existing view should be destroyed.
                        newContrailListModel.setData2Cache(newContrailListModel.ucid, {
                            listModel: newContrailListModel
                        });
                    }
                    // TODO: We also need update data due to lazy loading.
                    contrailListModel.setData([]);
                    contrailListModel.setData(newContrailListModel.getItems());
                }
            },
            vlRemote;

        remoteHandlerConfig['primaryRemoteConfig'] = primaryRemoteConfig;
        remoteHandlerConfig['vlRemoteConfig'] = {vlRemoteList: []};

        for (var i = 0; i < vlRemoteList.length; i++) {
            var vlSuccessCallback = vlRemoteList[i].successCallback,
                vlFailureCallback = vlRemoteList[i].failureCallback;

            vlRemote = {
                getAjaxConfig: vlRemoteList[i].getAjaxConfig,
                dataParser: vlRemoteList[i].dataParser,
                initCallback: vlRemoteList[i].initCallback,
                successCallback: function (response, updateActiveModel) {
                    if (contrail.checkIfFunction(vlSuccessCallback)) {
                        if(updateActiveModel) {
                            vlSuccessCallback(response, contrailListModel);
                            vlSuccessCallback(response, newContrailListModel);
                        } else {
                            vlSuccessCallback(response, newContrailListModel);
                        }
                    }
                },
                failureCallback: function (xhr) {
                    if (contrail.checkIfFunction(vlFailureCallback)) {
                        vlFailureCallback(xhr, newContrailListModel);
                    }
                }
            }
            remoteHandlerConfig['vlRemoteConfig']['vlRemoteList'].push(vlRemote);
        }

        return remoteHandlerConfig;
    };

    function createHLazyListModel(modelConfig, parentListModel) {
        return new ContrailListModel(modelConfig, parentListModel);
    }

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
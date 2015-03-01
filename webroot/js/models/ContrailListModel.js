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
            cachedData, lastUpdateTime, remoteHandlerConfig, hlRemoteConfig,
            useCache = true;

        var defaultCacheConfig = {
            cacheConfig: {
                cacheTimeout: cowc.LIST_CACHE_UPDATE_INTERVAL,
                loadOnTimeout: true
            }
        };

        if (listModelConfig != null) {
            var modelConfig = $.extend(true, {}, defaultCacheConfig, listModelConfig),
                cacheConfig = modelConfig['cacheConfig'];

            contrailListModel = initContrailListModel(cacheConfig);

            if (modelConfig.data != null) {
                contrailListModel.setData(modelConfig.data);
                bindDataHandlerProgress2Model(contrailListModel);
            } else if (modelConfig.remote != null && modelConfig.remote.ajaxConfig != null) {
                hlRemoteConfig = modelConfig['remote']['hlRemoteConfig'];
                cachedData = (contrailListModel.getDataFromCache != null) ? contrailListModel.getDataFromCache(contrailListModel.ucid) : null;

                useCache = isCacheValid(cacheConfig, cachedData);

                if (useCache) {
                    var cachedContrailListModel = cachedData['dataObject']['listModel'],
                        offset = cachedContrailListModel._idOffset,
                        lastUpdateTime = cachedData['lastUpdateTime'],
                        cachedContrailListModel = cachedData['dataObject']['listModel'];

                    contrailListModel.setData(cachedContrailListModel.getItems());

                    if (cowc.LIST_CACHE_UPDATE_INTERVAL < ($.now() - lastUpdateTime)) {
                        newContrailListModel = initContrailListModel(cacheConfig, offset);
                        remoteHandlerConfig = getUpdateRemoteHandlerConfig(modelConfig, newContrailListModel, contrailListModel);
                        newContrailDataHandler = new ContrailRemoteDataHandler(remoteHandlerConfig);

                        if (hlRemoteConfig != null) {
                            var childRemoteConfig = $.extend(true, {}, defaultCacheConfig, hlRemoteConfig);
                            childRemoteConfig['cacheConfig']['cacheTimeout'] = 0;
                            hlContrailListModel = getNewContrailListModel(childRemoteConfig, [newContrailListModel]);
                        }
                        bindDataHandlerProgress2Model(contrailListModel, newContrailDataHandler, hlContrailListModel);
                        bindDataHandlerProgress2Model(newContrailListModel, newContrailDataHandler, hlContrailListModel);
                    } else {
                        bindDataHandlerProgress2Model(contrailListModel);
                    }

                } else {
                    if (hlRemoteConfig != null) {
                        var childRemoteConfig = $.extend(true, {}, defaultCacheConfig, hlRemoteConfig);
                        childRemoteConfig['cacheConfig']['cacheTimeout'] = 0;
                        hlContrailListModel = getNewContrailListModel(childRemoteConfig, [contrailListModel]);
                    }
                    remoteHandlerConfig = getRemoteHandlerConfig(modelConfig, contrailListModel, parentModelList);
                    contrailDataHandler = new ContrailRemoteDataHandler(remoteHandlerConfig);

                    bindDataHandlerProgress2Model(contrailListModel, contrailDataHandler, hlContrailListModel);
                }
            }

        }

        return contrailListModel;
    };

    function isCacheValid(cacheConfig, cachedData) {
        var useCache = true;

        if (cacheConfig.cacheTimeout == 0 || cachedData == null || cachedData['dataObject']['listModel'].error) {
            useCache = false;
        } else if (cachedData != null && (cacheConfig.cacheTimeout < ($.now() - cachedData['lastUpdateTime'])) && cacheConfig.loadOnTimeout == false) {
            useCache = false;
        }

        return useCache;
    };

    function initContrailListModel(cacheConfig, offset) {
        var slickDataView = new Slick.Data.DataView({inlineFilters: true}),
            contrailListModel = {};

        $.extend(true, contrailListModel, slickDataView, {
            _idOffset: (offset != null) ? offset : 0,
            error: false,
            errorList: [],
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
            refreshData: function () {
                // Will be set after data handler is created.
            }
        });

        if(cacheConfig != null) {
            contrailListModel = $.extend(true, contrailListModel, {
                getDataFromCache: cacheConfig['getDataFromCache'],
                setData2Cache: cacheConfig['setData2Cache'],
                ucid: cacheConfig['ucid']
            });
        }

        return contrailListModel;
    };

    function bindDataHandlerProgress2Model(contrailListModel, contrailDataHandler, hlContrailListModel) {
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

        /*
         contrailListModel['refreshData'] = function () {
         if (contrailDataHandler != null) {
         contrailDataHandler.refreshData();
         }
         }
         */
    };

    function getRemoteHandlerConfig(listModelConfig, contrailListModel, parentModelList) {
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
                    contrailListModel.error = true;
                    contrailListModel.errorList.push(xhr);
                    if (contrail.checkIfFunction(primaryRemote.failureCallback)) {
                        primaryRemote.failureCallback(xhr, contrailListModel);
                    }
                },
                completeCallback: function (response) {
                    if (contrail.checkIfFunction(primaryRemote.completeCallback)) {
                        primaryRemote.completeCallback(response, contrailListModel);
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
                successCallback: function (response) {
                    if (contrail.checkIfFunction(vlSuccessCallback)) {
                        vlSuccessCallback(response, contrailListModel);
                    }
                },
                failureCallback: function (xhr) {
                    contrailListModel.error = true;
                    contrailListModel.errorList.push(xhr);
                    if (contrail.checkIfFunction(vlFailureCallback)) {
                        vlFailureCallback(xhr, contrailListModel);
                    }
                }
            }
            remoteHandlerConfig['vlRemoteConfig']['vlRemoteList'].push(vlRemote);
        };

        return remoteHandlerConfig;
    };

    function getUpdateRemoteHandlerConfig(listModelConfig, newContrailListModel, visibleContrailListModel) {
        var remoteHandlerConfig = {},
            primaryRemote = listModelConfig.remote,
            vlRemoteConfig = (listModelConfig.vlRemoteConfig != null) ? listModelConfig.vlRemoteConfig : {},
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
                    newContrailListModel.error = true;
                    newContrailListModel.errorList.push(xhr);
                    if (contrail.checkIfFunction(primaryRemote.failureCallback)) {
                        primaryRemote.failureCallback(xhr, newContrailListModel);
                    }
                },
                completeCallback: function (response) {

                    if (contrail.checkIfFunction(primaryRemote.completeCallback)) {
                        primaryRemote.completeCallback(response, newContrailListModel);
                    }

                    if (!newContrailListModel.isRequestInProgress()) {
                        updateDataInCache(newContrailListModel);

                        visibleContrailListModel.setData([]);
                        visibleContrailListModel.setData(newContrailListModel.getItems());
                    }
                }
            },
            vlRemote;

        remoteHandlerConfig['primaryRemoteConfig'] = primaryRemoteConfig;

        remoteHandlerConfig['vlRemoteConfig'] = {
            vlRemoteList: [],
            completeCallback: function () {
                if (contrail.checkIfFunction(vlRemoteConfig['completeCallback'])) {
                    vlRemoteConfig['completeCallback'](newContrailListModel);
                }

                if (!newContrailListModel.isRequestInProgress()) {
                    updateDataInCache(newContrailListModel);

                    visibleContrailListModel.setData([]);
                    visibleContrailListModel.setData(newContrailListModel.getItems());
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
                        vlSuccessCallback(response, newContrailListModel);
                    }
                },
                failureCallback: function (xhr) {
                    newContrailListModel.error = true;
                    newContrailListModel.errorList.push(xhr);
                    if (contrail.checkIfFunction(vlFailureCallback)) {
                        vlFailureCallback(xhr, newContrailListModel);
                    }
                }
            }
            remoteHandlerConfig['vlRemoteConfig']['vlRemoteList'].push(vlRemote);
        }

        return remoteHandlerConfig;
    };

    function updateDataInCache(contrailListModel) {
        if (contrailListModel.setData2Cache != null) {
            //TODO: Binding of cached listModel (if any) with existing view should be destroyed.
            contrailListModel.setData2Cache(contrailListModel.ucid, {
                listModel: contrailListModel
            });
        }
    };

    function getNewContrailListModel(modelConfig, parentListModel) {
        return new ContrailListModel(modelConfig, parentListModel);
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
    };

    return ContrailListModel
});
/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-remote-data-handler'
], function (_, Backbone, ContrailRemoteDataHandler) {
    var ContrailVisModel = Backbone.Model.extend({
        empty: false,
        error: false,
        errorList: [],
        initialize: function (graphModelConfig) {
            var defaultCacheConfig = {
                cacheConfig: {
                    cacheTimeout: cowc.GRAPH_CACHE_UPDATE_INTERVAL,
                    loadOnTimeout: true
                }
            };

            var modelConfig = $.extend(true, {}, graphModelConfig, defaultCacheConfig);

            Backbone.Model.prototype.initialize.apply(this);

            this.cacheConfig = modelConfig['cacheConfig'];
            this.ucid = contrail.checkIfExist(modelConfig['cacheConfig']) ? modelConfig['cacheConfig']['ucid'] : null;
            this.graphConfig = modelConfig;
            this.generateElements = modelConfig.generateElementsFn;
            this.onAllRequestsComplete = new Slick.Event();
            this.beforeDataUpdate = new Slick.Event();
            this.onDataUpdate = new Slick.Event();

            return this;
        },

        fetchData: function () {
            var self = this, cacheUsedStatus = {isCacheUsed: false, reload: true },
                remoteHandlerConfig, cacheConfig = self.cacheConfig;

            cacheUsedStatus = setCachedData2Model(self, cacheConfig);

            if (cacheUsedStatus['isCacheUsed']) {
                self.onAllRequestsComplete.notify();

                if (cacheUsedStatus['reload']) {
                    remoteHandlerConfig = getRemoteHandlerConfig(self, this.graphConfig);
                    self.contrailDataHandler = new ContrailRemoteDataHandler(remoteHandlerConfig);
                } else {
                    remoteHandlerConfig = getRemoteHandlerConfig(self, this.graphConfig, false);
                    self.contrailDataHandler = new ContrailRemoteDataHandler(remoteHandlerConfig);
                }
            } else {
                remoteHandlerConfig = getRemoteHandlerConfig(self, this.graphConfig);
                self.contrailDataHandler = new ContrailRemoteDataHandler(remoteHandlerConfig);
            }

            bindDataHandler2Model(self);
        },

        reLayoutGraph: function () {
            var self = this;
            setData2Model(self, self.rawData);
            self.onAllRequestsComplete.notify();
        }
    });

    function getRemoteHandlerConfig(ContrailVisModel, graphModelConfig, autoFetchData) {
        var remoteHandlerConfig = {
                autoFetchData: (autoFetchData != null) ? autoFetchData : true
            },
            primaryRemote = ContrailVisModel.graphConfig.remote,
            vlRemoteConfig = contrail.handleIfNull(graphModelConfig.vlRemoteConfig, {}),
            vlRemoteList = contrail.handleIfNull(vlRemoteConfig['vlRemoteList'], []),
            primaryRemoteConfig = {
                ajaxConfig: primaryRemote.ajaxConfig,
                dataParser: primaryRemote.dataParser,
                initCallback: primaryRemote.initCallback,
                successCallback: function (response, resetDataFlag) {
                    setData2Model(ContrailVisModel, response);
                    if (contrail.checkIfFunction(primaryRemote.successCallback)) {
                        primaryRemote.successCallback(response, ContrailVisModel);
                    }
                    ContrailVisModel.onDataUpdate.notify();
                },
                refreshSuccessCallback: function () {},
                failureCallback: function (xhr) {
                    ContrailVisModel.error = true;
                    ContrailVisModel.errorList.push(xhr);
                    if (contrail.checkIfFunction(primaryRemote.failureCallback)) {
                        primaryRemote.failureCallback(xhr, ContrailVisModel);
                    }
                    ContrailVisModel.onDataUpdate.notify();
                },
                completeCallback: function (completeResponse) {
                    updateDataInCache(ContrailVisModel, completeResponse);
                    ContrailVisModel.onDataUpdate.notify();
                }
            },
            vlRemoteList;

        remoteHandlerConfig['primaryRemoteConfig'] = primaryRemoteConfig;
        remoteHandlerConfig['onAllRequestsCompleteCallback'] = function () {
            if (!ContrailVisModel.isRequestInProgress()) {
                ContrailVisModel.onAllRequestsComplete.notify();
            }
        };

        remoteHandlerConfig['vlRemoteConfig'] = {
            vlRemoteList: [],
            completeCallback: function (completeResponse) {
                if (contrail.checkIfFunction(vlRemoteConfig['completeCallback'])) {
                    vlRemoteConfig['completeCallback'](ContrailVisModel);
                }

                if (!ContrailVisModel.isRequestInProgress()) {
                    //TODO: Udpade of cache is currently handled by vertical lazy loading success-callback.
                    //updateDataInCache(ContrailVisModel, completeResponse);
                }
                ContrailVisModel.onDataUpdate.notify();
            }
        };

        for (var i = 0; i < vlRemoteList.length; i++) {
            var vlSuccessCallback = vlRemoteList[i].successCallback,
                vlFailureCallback = vlRemoteList[i].failureCallback;

            vlRemoteList = {
                getAjaxConfig: vlRemoteList[i].getAjaxConfig,
                dataParser: vlRemoteList[i].dataParser,
                initCallback: vlRemoteList[i].initCallback,
                successCallback: function (response) {
                    if (contrail.checkIfFunction(vlSuccessCallback)) {
                        vlSuccessCallback(response, ContrailVisModel);
                    }
                    ContrailVisModel.onDataUpdate.notify();
                },
                failureCallback: function (xhr) {
                    ContrailVisModel.error = true;
                    ContrailVisModel.errorList.push(xhr);
                    if (contrail.checkIfFunction(vlFailureCallback)) {
                        vlFailureCallback(xhr, ContrailVisModel);
                    }
                    ContrailVisModel.onDataUpdate.notify();
                }
            }
            remoteHandlerConfig['vlRemoteConfig']['vlRemoteList'].push(vlRemoteList);
        }

        return remoteHandlerConfig;
    };

    function setCachedData2Model(ContrailVisModel, cacheConfig) {
        var isCacheUsed = false, usePrimaryCache = true,
            reload = true, secondaryCacheStatus,
            cachedData = (cacheConfig.ucid != null) ? cowch.getDataFromCache(cacheConfig.ucid) : null,
            setCachedData2ModelCB = (cacheConfig != null) ? cacheConfig['setCachedData2ModelCB']  : null;

        usePrimaryCache = cowch.isCacheValid(cacheConfig, cachedData, 'graphModel');

        if(usePrimaryCache) {
            var cachedGraphModel = cachedData['dataObject']['graphModel'],
                cachedRawData = cachedGraphModel.rawData,
                lastUpdateTime = cachedData['lastUpdateTime'];

            setCachedElementsInModel(ContrailVisModel, cachedGraphModel);

            isCacheUsed = true;
            if (cacheConfig['cacheTimeout'] < ($.now() - lastUpdateTime)) {
                reload = true;
            } else {
                reload = false;
            }
        } else if (contrail.checkIfFunction(setCachedData2ModelCB)) {
            secondaryCacheStatus = cacheConfig['setCachedData2ModelCB'](ContrailVisModel, cacheConfig);
            if (contrail.checkIfExist(secondaryCacheStatus)) {
                isCacheUsed = contrail.handleIfNull(secondaryCacheStatus['isCacheUsed'], false);
                reload = contrail.handleIfNull(secondaryCacheStatus['reload'], true);
            } else {
                isCacheUsed = false;
                reload = true;
            }
        }

        return {isCacheUsed: isCacheUsed, reload: reload };
    };


    function setData2Model(ContrailVisModel, response) {
        ContrailVisModel.elementMap = {node: {}, link: {}};
        ContrailVisModel.nodeSearchDropdownData = null;
        ContrailVisModel.beforeDataUpdate.notify();

        //TODO: We should not edit graohModel in generateElements
        var elementsDataObj = ContrailVisModel.generateElements($.extend(true, {}, response), ContrailVisModel.elementMap);
        ContrailVisModel.elementsDataObj = elementsDataObj;
        ContrailVisModel.rawData = response;
    };

    function setCachedElementsInModel(ContrailVisModel, cachedGraphModel) {
        var cachedCells = cachedGraphModel.getElements();
        ContrailVisModel.elementMap = cachedGraphModel.elementMap;
        ContrailVisModel.nodeSearchDropdownData = cachedGraphModel.nodeSearchDropdownData;
        ContrailVisModel.beforeDataUpdate.notify();

        ContrailVisModel.elementsDataObj = cachedGraphModel.elementsDataObj;
        if(contrail.checkIfExist(cachedGraphModel.elementMap.linkedElements)) {
            cachedCells = cachedCells.concat(cachedGraphModel.elementMap.linkedElements);
        }

        ContrailVisModel.rawData = cachedGraphModel.rawData;
        ContrailVisModel.loadedFromCache = true;

        ContrailVisModel.empty = cachedGraphModel.empty;
    };

    function bindDataHandler2Model(ContrailVisModel) {
        var contrailDataHandler = ContrailVisModel.contrailDataHandler;

        ContrailVisModel['isPrimaryRequestInProgress'] = function () {
            return (contrailDataHandler != null) ? contrailDataHandler.isPrimaryRequestInProgress() : false;
        };

        ContrailVisModel['isVLRequestInProgress'] = function () {
            return (contrailDataHandler != null) ? contrailDataHandler.isVLRequestInProgress() : false;
        };

        ContrailVisModel['isRequestInProgress'] = function () {
            return (contrailDataHandler != null) ? contrailDataHandler.isRequestInProgress() : false;
        };

        ContrailVisModel['refreshData'] = function () {
            if(!ContrailVisModel.isRequestInProgress()) {
                resetGraphModel4Refresh(ContrailVisModel);
                contrailDataHandler.refreshData()
            }
        };
    };

    function updateDataInCache(ContrailVisModel, completeResponse) {
        var response = completeResponse[0];
        if (ContrailVisModel.ucid != null) {
            ContrailVisModel['rawData'] = response;
            //TODO: Binding of cached gridModel (if any) with existing view should be destroyed.
            cowch.setData2Cache(ContrailVisModel.ucid, {
                graphModel: ContrailVisModel
            });
        }
    };

    function resetGraphModel4Refresh(graphModel) {
        graphModel.error = false;
        graphModel.errorList = [];
    };

    return ContrailVisModel;
});
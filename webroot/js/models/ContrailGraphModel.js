/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-remote-data-handler',
    'core-basedir/js/handlers/GraphLayoutHandler',
    'joint.contrail'
], function (_, ContrailRemoteDataHandler, GraphLayoutHandler, joint) {
    var ContrailGraphModel = joint.dia.Graph.extend({
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

            joint.dia.Graph.prototype.initialize.apply(this);

            this.cacheConfig = modelConfig['cacheConfig'];
            this.ucid = contrail.checkIfExist(modelConfig['cacheConfig']) ? modelConfig['cacheConfig']['ucid'] : null;
            this.graphConfig = modelConfig;
            this.generateElements = modelConfig.generateElementsFn;
            this.forceFit = modelConfig.forceFit;
            this.rankDir = modelConfig.ranDir;
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

        reLayoutGraph: function (rankDir) {
            var self = this;
            setData2Model(self, self.rawData, rankDir);
            layoutGraph(self);
            addZoomElements2Graph(self);
            self.onAllRequestsComplete.notify();
        }
    });

    function getRemoteHandlerConfig(contrailGraphModel, graphModelConfig, autoFetchData) {
        var remoteHandlerConfig = {
                autoFetchData: (autoFetchData != null) ? autoFetchData : true
            },
            primaryRemote = contrailGraphModel.graphConfig.remote,
            vlRemoteConfig = contrail.handleIfNull(graphModelConfig.vlRemoteConfig, {}),
            vlRemoteList = contrail.handleIfNull(vlRemoteConfig['vlRemoteList'], []),
            primaryRemoteConfig = {
                ajaxConfig: primaryRemote.ajaxConfig,
                dataParser: primaryRemote.dataParser,
                initCallback: primaryRemote.initCallback,
                successCallback: function (response, resetDataFlag) {
                    setData2Model(contrailGraphModel, response);
                    layoutGraph(contrailGraphModel);
                    addZoomElements2Graph(contrailGraphModel);
                    if (contrail.checkIfFunction(primaryRemote.successCallback)) {
                        primaryRemote.successCallback(response, contrailGraphModel);
                    }
                    contrailGraphModel.onDataUpdate.notify();
                },
                refreshSuccessCallback: function () {},
                failureCallback: function (xhr) {
                    contrailGraphModel.error = true;
                    contrailGraphModel.errorList.push(xhr);
                    if (contrail.checkIfFunction(primaryRemote.failureCallback)) {
                        primaryRemote.failureCallback(xhr, contrailGraphModel);
                    }
                    contrailGraphModel.onDataUpdate.notify();
                },
                completeCallback: function (completeResponse) {
                    updateDataInCache(contrailGraphModel, completeResponse);
                    contrailGraphModel.onDataUpdate.notify();
                }
            },
            vlRemoteList;

        remoteHandlerConfig['primaryRemoteConfig'] = primaryRemoteConfig;
        remoteHandlerConfig['onAllRequestsCompleteCallback'] = function () {
            if (!contrailGraphModel.isRequestInProgress()) {
                contrailGraphModel.onAllRequestsComplete.notify();
            }
        };

        remoteHandlerConfig['vlRemoteConfig'] = {
            vlRemoteList: [],
            completeCallback: function (completeResponse) {
                if (contrail.checkIfFunction(vlRemoteConfig['completeCallback'])) {
                    vlRemoteConfig['completeCallback'](contrailGraphModel);
                }

                if (!contrailGraphModel.isRequestInProgress()) {
                    //TODO: Udpade of cache is currently handled by vertical lazy loading success-callback.
                    //updateDataInCache(contrailGraphModel, completeResponse);
                }
                contrailGraphModel.onDataUpdate.notify();
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
                        vlSuccessCallback(response, contrailGraphModel);
                    }
                    contrailGraphModel.onDataUpdate.notify();
                },
                failureCallback: function (xhr) {
                    contrailGraphModel.error = true;
                    contrailGraphModel.errorList.push(xhr);
                    if (contrail.checkIfFunction(vlFailureCallback)) {
                        vlFailureCallback(xhr, contrailGraphModel);
                    }
                    contrailGraphModel.onDataUpdate.notify();
                }
            }
            remoteHandlerConfig['vlRemoteConfig']['vlRemoteList'].push(vlRemoteList);
        }

        return remoteHandlerConfig;
    };

    function setCachedData2Model(contrailGraphModel, cacheConfig) {
        var isCacheUsed = false, usePrimaryCache = true,
            reload = true, secondaryCacheStatus,
            cachedData = (cacheConfig.ucid != null) ? cowch.getDataFromCache(cacheConfig.ucid) : null,
            setCachedData2ModelCB = (cacheConfig != null) ? cacheConfig['setCachedData2ModelCB']  : null;

        usePrimaryCache = cowch.isCacheValid(cacheConfig, cachedData, 'graphModel');

        if(usePrimaryCache) {
            var cachedGraphModel = cachedData['dataObject']['graphModel'],
                cachedRawData = cachedGraphModel.rawData,
                lastUpdateTime = cachedData['lastUpdateTime'];

            setCachedElementsInModel(contrailGraphModel, cachedGraphModel);
            //layoutGraph(contrailGraphModel);

            isCacheUsed = true;
            if (cacheConfig['cacheTimeout'] < ($.now() - lastUpdateTime)) {
                reload = true;
            } else {
                reload = false;
            }
        } else if (contrail.checkIfFunction(setCachedData2ModelCB)) {
            secondaryCacheStatus = cacheConfig['setCachedData2ModelCB'](contrailGraphModel, cacheConfig);
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


    function setData2Model(contrailGraphModel, response, rankDir) {
        contrailGraphModel.elementMap = {node: {}, link: {}};
        contrailGraphModel.nodeSearchDropdownData = null;
        contrailGraphModel.beforeDataUpdate.notify();

        if (contrailGraphModel.forceFit && rankDir != null) {
            contrailGraphModel.rankDir = rankDir;
        } else if (contrailGraphModel.forceFit && !contrail.checkIfExist(contrailGraphModel.rankDir)) {
            contrailGraphModel.rankDir = computeRankDir(response['nodes'], response['links']);
        }

        //TODO: We should not edit graohModel in generateElements
        var elementsDataObj = contrailGraphModel.generateElements($.extend(true, {}, response), contrailGraphModel.elementMap, contrailGraphModel.rankDir);

        contrailGraphModel.resetCells(elementsDataObj['elements']);
        contrailGraphModel.elementsDataObj = elementsDataObj;
        contrailGraphModel.rawData = response;
    };

    function setCachedElementsInModel(contrailGraphModel, cachedGraphModel) {
        var cachedCells = cachedGraphModel.getElements();
        contrailGraphModel.elementMap = cachedGraphModel.elementMap;
        contrailGraphModel.nodeSearchDropdownData = cachedGraphModel.nodeSearchDropdownData;
        contrailGraphModel.beforeDataUpdate.notify();

        if (contrailGraphModel.forceFit) {
            contrailGraphModel.rankDir = cachedGraphModel.rankDir;
        }

        contrailGraphModel.elementsDataObj = cachedGraphModel.elementsDataObj;
        if(contrail.checkIfExist(cachedGraphModel.elementMap.linkedElements)) {
            cachedCells = cachedCells.concat(cachedGraphModel.elementMap.linkedElements);
        }

        contrailGraphModel.resetCells(cachedCells);

        contrailGraphModel.rawData = cachedGraphModel.rawData;
        contrailGraphModel.directedGraphSize = cachedGraphModel.directedGraphSize;
        contrailGraphModel.loadedFromCache = true;

        contrailGraphModel.empty = cachedGraphModel.empty;
    };

    function layoutGraph (contrailGraphModel) {
        if (contrailGraphModel.forceFit) {
            //contrailGraphModel.directedGraphSize = GraphLayoutHandler.jointLayout(contrailGraphModel, getJointLayoutOptions(elementsObject['nodes'], elementsObject['links']));
            contrailGraphModel.directedGraphSize = GraphLayoutHandler.dagreLayout(contrailGraphModel, getDagreLayoutOptions(contrailGraphModel.rankDir));
        }
    };

    function addZoomElements2Graph (contrailGraphModel) {
        var elementsDataObj = contrailGraphModel.elementsDataObj;

        if (contrail.checkIfExist(elementsDataObj['zoomedNodeElement'])) {
            var zoomedNodeElement = elementsDataObj['zoomedNodeElement'];

            var xOrigin = zoomedNodeElement['attributes']['position']['x'],
                yOrigin = zoomedNodeElement['attributes']['position']['y'];

            /* Translate zoomed elements TODO: Move to view file */
            $.each(elementsDataObj['zoomedElements'], function (zoomedElementKey, zoomedElementValue) {
                zoomedElementValue.translate(xOrigin, yOrigin);
            });

            contrailGraphModel.addCells(elementsDataObj['zoomedElements']);

        }
    };

    function bindDataHandler2Model(contrailGraphModel) {
        var contrailDataHandler = contrailGraphModel.contrailDataHandler;

        contrailGraphModel['isPrimaryRequestInProgress'] = function () {
            return (contrailDataHandler != null) ? contrailDataHandler.isPrimaryRequestInProgress() : false;
        };

        contrailGraphModel['isVLRequestInProgress'] = function () {
            return (contrailDataHandler != null) ? contrailDataHandler.isVLRequestInProgress() : false;
        };

        contrailGraphModel['isRequestInProgress'] = function () {
            return (contrailDataHandler != null) ? contrailDataHandler.isRequestInProgress() : false;
        };

        contrailGraphModel['refreshData'] = function () {
            if(!contrailGraphModel.isRequestInProgress()) {
                resetGraphModel4Refresh(contrailGraphModel);
                contrailDataHandler.refreshData()
            }
        };
    };

    function updateDataInCache(contrailGraphModel, completeResponse) {
        var response = completeResponse[0];
        if (contrailGraphModel.ucid != null) {
            contrailGraphModel['rawData'] = response;
            //TODO: Binding of cached gridModel (if any) with existing view should be destroyed.
            cowch.setData2Cache(contrailGraphModel.ucid, {
                graphModel: contrailGraphModel
            });
        }
    };

    function getJointLayoutOptions(nodes, links, rankDir, separation) {
        var layoutOptions = {setLinkVertices: false, edgeSep: 1, nodeSep: 50, rankSep: 50, rankDir: "LR"};
        if (rankDir == null) {
            rankDir = computeRankDir(nodes, links);
        }
        layoutOptions['rankDir'] = rankDir;
        if (separation != null) {
            layoutOptions['nodeSep'] = separation;
            layoutOptions['rankSep'] = separation;
        }
        return layoutOptions;
    };

    function getDagreLayoutOptions(rankDir, separation) {
        var layoutOptions = {edgeSep: 1, nodeSep: 50, rankSep: 50, rankDir: ctwc.GRAPH_DIR_LR, marginx: cowc.GRAPH_MARGIN_LEFT, marginy: cowc.GRAPH_MARGIN_TOP};
        if(rankDir != null) {
            layoutOptions['rankDir'] = rankDir;
        }
        if (separation != null) {
            layoutOptions['nodeSep'] = separation;
            layoutOptions['rankSep'] = separation;
        }
        return layoutOptions;
    };

    function resetGraphModel4Refresh(graphModel) {
        graphModel.error = false;
        graphModel.errorList = [];
    };

    function computeRankDir (nodes, links) {
        var rankDir;
        if (nodes.length < 4 && (links == null || links.length == 0)) {
            rankDir = ctwc.GRAPH_DIR_LR;
        } else {
            rankDir = (nodes.length > 12 || (links != null && (3 * (links.length) < nodes.length))) ? ctwc.GRAPH_DIR_TB : ctwc.GRAPH_DIR_LR;
        }
        return rankDir;
    };

    return ContrailGraphModel;
});

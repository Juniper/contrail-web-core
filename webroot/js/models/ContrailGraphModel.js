/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-remote-data-handler',
    'js/models/GraphLayoutHandler'
], function (_, ContrailRemoteDataHandler, GraphLayoutHandler) {
    var ContrailGraphModel = joint.dia.Graph.extend({
        error: false,
        errorList: [],
        rankDir: "LR",
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
            this.ucid = modelConfig['cacheConfig']['ucid'];
            this.graphConfig = modelConfig;
            this.generateElements = modelConfig.generateElementsFn;
            this.forceFit = modelConfig.forceFit;
            this.rankDir = ctwc.DEFAULT_GRAPH_DIR;
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
                    updateDataInCache(contrailGraphModel, completeResponse);
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
            reload = false, isSecondaryCacheUsed,
            cachedData = (cacheConfig.ucid != null) ? cowch.getDataFromCache(cacheConfig.ucid) : null;

        //TODO: isRequestInProgress check should not be required
        if (cacheConfig.cacheTimeout == 0 || cachedData == null || cachedData['dataObject']['graphModel'].error || cachedData['dataObject']['graphModel'].isRequestInProgress()) {
            usePrimaryCache = false;
        } else if (cachedData != null && (cacheConfig.cacheTimeout < ($.now() - cachedData['lastUpdateTime'])) && cacheConfig.loadOnTimeout == false) {
            usePrimaryCache = false;
        }

        if(usePrimaryCache) {
            var cachedGraphModel = cachedData['dataObject']['graphModel'],
                cachedRawData = cachedGraphModel.rawData,
                lastUpdateTime = cachedData['lastUpdateTime'];

            setData2Model(contrailGraphModel, cachedRawData);
            //setElements2Model(contrailGraphModel, cachedGraphModel.elementMap, cachedGraphModel.elementsDataObj, cachedGraphModel.rawData);
            layoutGraph(contrailGraphModel);

            isCacheUsed = true;
            if (cacheConfig['cacheTimeout'] < ($.now() - lastUpdateTime)) {
                reload = true;
            }
        } else if (contrail.checkIfFunction(cacheConfig['setCachedData2ModelCB'])) {
            isSecondaryCacheUsed = cacheConfig['setCachedData2ModelCB'](contrailGraphModel);
            if(isSecondaryCacheUsed) {
                isCacheUsed = true;
                reload = true;
            }
        }

        return {isCacheUsed: isCacheUsed, reload: reload };
    };


    function setData2Model(contrailGraphModel, response, rankDir) {
        contrailGraphModel.elementMap = {node: {}, link: {}};
        contrailGraphModel.beforeDataUpdate.notify();

        if (contrailGraphModel.forceFit) {
            contrailGraphModel.rankDir = (rankDir != null) ? rankDir : computeRankDir(response['nodes'], response['links']);
        }

        //TODO: We should not edit graohModel in generateElements
        var elementsDataObj = contrailGraphModel.generateElements($.extend(true, {}, response), contrailGraphModel.elementMap, contrailGraphModel.rankDir);

        contrailGraphModel.clear();
        contrailGraphModel.addCells(elementsDataObj['elements']);
        contrailGraphModel.elementsDataObj = elementsDataObj;
        contrailGraphModel.rawData = response;
    };

    function setElements2Model(contrailGraphModel, elementMap, elementsDataObj, rawData) {
        contrailGraphModel.beforeDataUpdate.notify();
        contrailGraphModel.elementMap = elementMap;
        contrailGraphModel.clear();
        contrailGraphModel.addCells(elementsDataObj['elements']);
        contrailGraphModel.elementsDataObj = elementsDataObj;
        contrailGraphModel.rawData = rawData;
    };

    function layoutGraph (contrailGraphModel) {
        var elementsDataObj = contrailGraphModel.elementsDataObj;

        if (contrailGraphModel.forceFit) {
            //contrailGraphModel.directedGraphSize = GraphLayoutHandler.jointLayout(contrailGraphModel, getJointLayoutOptions(elementsObject['nodes'], elementsObject['links']));
            contrailGraphModel.directedGraphSize = GraphLayoutHandler.dagreLayout(contrailGraphModel, getDagreLayoutOptions(contrailGraphModel.rankDir));
        }
        if (contrail.checkIfExist(elementsDataObj['zoomedNodeElement'])) {
            var zoomedNodeElement = elementsDataObj['zoomedNodeElement'];

            var xOrigin = zoomedNodeElement['attributes']['position']['x'],
                yOrigin = zoomedNodeElement['attributes']['position']['y'];

            contrailGraphModel.addCells(elementsDataObj['zoomedElements']);

            /* Translate zoomed elements TODO: Move to view file */
            $.each(elementsDataObj['zoomedElements'], function (zoomedElementKey, zoomedElementValue) {
                zoomedElementValue.translate(xOrigin, yOrigin);
            });
        }
    }

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
        var layoutOptions = {edgeSep: 1, nodeSep: 50, rankSep: 50, rankDir: "LR", marginx: GRAPH_MARGIN, marginy: GRAPH_MARGIN};
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

    function computeRankDir(nodes, links) {
        var rankDir = (nodes.length > 12 || (links != null && (3 * (links.length) < nodes.length))) ? 'TB' : 'LR';
        return rankDir;
    };

    return ContrailGraphModel;
});
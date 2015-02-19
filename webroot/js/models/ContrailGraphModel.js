define([
    'underscore',
    'contrail-remote-data-handler'
], function (_, ContrailRemoteDataHandler) {
    var ContrailGraphModel = joint.dia.Graph.extend({

        initialize: function (modelConfig) {

            joint.dia.Graph.prototype.initialize.apply(this);
            this.requestInProgress = false;

            this.graphConfig = modelConfig;
            this.getDataFromCache = modelConfig['getDataFromCache'];
            this.setData2Cache = modelConfig['setData2Cache'];
            this.uniqueKey = modelConfig['uniqueKey'];
            this.generateElements = modelConfig.generateElementsFn;
            this.forceFit = modelConfig.forceFit;

            return this;
        },

        fetchData: function (successCallback) {
            var self = this;

            self.requestInProgress = true;
            self.elementMap = {node: {}, link: {}};

            var remoteHandlerConfig = getRemoteHandlerConfig(self, successCallback),
                cachedData = (self.getDataFromCache != null) ? self.getDataFromCache(self.uniqueKey) : null;

            if (cachedData != null) {
                self.contrailDataHandler = createGraphFromCache(cachedData, self, successCallback, remoteHandlerConfig);
            } else {
                self.contrailDataHandler = new ContrailRemoteDataHandler(remoteHandlerConfig);
            }
        }
    });

    var createGraphFromCache = function (cachedData, contrailGraphModel, successCallback, remoteHandlerConfig) {
        var contrailDataHandler,
            cachedGraphModel = cachedData['dataObject']['graphModel'],
            cachedElementsMap = cachedGraphModel.elementMap,
            cachedResponse = cachedData['dataObject']['response'],
            cachedTime = cachedData['time'];

        var elementMap = {node: {}, link: {}};
        var elementsObject = contrailGraphModel.generateElements(cachedResponse, elementMap);

        contrailGraphModel.resetCells(elementsObject['elements']);
        contrailGraphModel.elementMap = cachedElementsMap;

        if (contrailGraphModel.forceFit) {
            contrailGraphModel.directedGraphSize = graphLayoutHandler.layout(contrailGraphModel, getForceFitOptions(null, null, elementsObject['nodes'], elementsObject['links']));
        }

        successCallback(contrailGraphModel.directedGraphSize);

        if (60000 < ($.now() - cachedTime)) {
            contrailDataHandler = new ContrailRemoteDataHandler(remoteHandlerConfig);
        }

        return contrailDataHandler;
    };

    var getRemoteHandlerConfig = function (contrailGraphModel, successCallback) {
        var remoteHandlerConfig = {},
            primaryRemote = contrailGraphModel.graphConfig.remote,
            lazyRemote = contrailGraphModel.graphConfig.lazyRemote,
            primaryRemoteConfig = {
                ajaxConfig: primaryRemote.ajaxConfig,
                dataParser: primaryRemote.dataParser,
                initCallback: primaryRemote.initCallback,
                successCallback: function (response) {
                    var elementMap = {node: {}, link: {}};
                    var elementsObject = contrailGraphModel.generateElements(response, elementMap);

                    contrailGraphModel.resetCells(elementsObject['elements']);
                    contrailGraphModel.elementMap = elementMap;

                    if (contrailGraphModel.forceFit) {
                        contrailGraphModel.directedGraphSize = graphLayoutHandler.layout(contrailGraphModel, getForceFitOptions(null, null, elementsObject['nodes'], elementsObject['links']));
                    }
                    successCallback(contrailGraphModel.directedGraphSize);
                    contrailGraphModel.requestInProgress = false;

                    if (contrailGraphModel.setData2Cache != null) {
                        contrailGraphModel.setData2Cache(contrailGraphModel.uniqueKey, {
                            graphModel: contrailGraphModel,
                            response: response
                        });
                    }
                },
                failureCallback: function (xhr) {
                    if (contrail.checkIfFunction(primaryRemote.failureCallback)) {
                        primaryRemote.failureCallback(xhr, contrailGraphModel);
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
                        lSuccessCallback(response, contrailGraphModel);
                    }
                },
                failureCallback: function (xhr) {
                    if (contrail.checkIfFunction(lFailureCallback)) {
                        lFailureCallback(xhr, contrailGraphModel);
                    }
                }
            }
            remoteHandlerConfig['lazyRemoteConfig'].push(lazyRemoteConfig);
        }

        return remoteHandlerConfig;
    };

    var graphLayoutHandler = $.extend(true, joint.layout.DirectedGraph, {
        layout: function (graph, opt) {

            opt = opt || {};

            var inputGraph = this._prepareData(graph);
            var runner = dagre.layout();

            if (opt.debugLevel) {
                runner.debugLevel(opt.debugLevel);
            }
            if (opt.rankDir) {
                runner.rankDir(opt.rankDir);
            }
            if (opt.rankSep) {
                runner.rankSep(opt.rankSep);
            }
            if (opt.edgeSep) {
                runner.edgeSep(opt.edgeSep);
            }
            if (opt.nodeSep) {
                runner.nodeSep(opt.nodeSep);
            }

            var layoutGraph = runner.run(inputGraph);

            layoutGraph.eachNode(function (u, value) {
                if (!value.dummy) {
                    graph.get('cells').get(u).set('position', {
                        x: value.x + GRAPH_MARGIN - value.width / 2,
                        y: value.y + GRAPH_MARGIN - value.height / 2
                    });
                }
            });

            if (opt.setLinkVertices) {

                layoutGraph.eachEdge(function (e, u, v, value) {
                    var link = graph.get('cells').get(e);
                    if (link) {
                        graph.get('cells').get(e).set('vertices', value.points);
                    }
                });
            }
            return {width: layoutGraph.graph().width, height: layoutGraph.graph().height};
        }
    });

    return ContrailGraphModel;
});
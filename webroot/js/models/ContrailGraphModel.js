define([
    'underscore'
], function (_) {
    var ContrailGraphModel = joint.dia.Graph.extend({

        initialize: function (modelConfig) {

            joint.dia.Graph.prototype.initialize.apply(this);

            this.requestInProgress = false;
            this.elementMap = {node: {}, link: {}};

            this.config = modelConfig.requestConfig;
            this.generateElements = modelConfig.generateElementsFn;
            this.forceFit = modelConfig.forceFit;

            return this;
        },

        fetchData: function (successCallback) {
            var self = this,
                url = this.config.url;

            self.requestInProgress = true;

            $.getJSON(url, function (response) {
                var elementsObject = self.generateElements(response, self.elementMap);

                self.addCell(elementsObject['elements']);
                if(self.forceFit) {
                    self.directedGraphSize = graphLayoutHandler.layout(self, getForceFitOptions(null, null, elementsObject['nodes'], elementsObject['links']));
                }
                successCallback(self.directedGraphSize);
                self.requestInProgress = false;
            });
        }
    });

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
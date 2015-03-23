/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'dagre'
], function (_, Dagre) {
    var GraphLayoutHandler = {
        dagreLayout: function(graph, options) {
            var dagreGraph = new Dagre.graphlib.Graph({multigraph: true, directed: true, compound: true});

            dagreGraph.setGraph(options);
            dagreGraph.setDefaultEdgeLabel(function() { return {}; });

            _.each(graph.getElements(), function(cell) {
                dagreGraph.setNode(cell.id, {
                    width: cell.get('size').width,
                    height: cell.get('size').height
                });
            });

            _.each(graph.getLinks(), function(link) {
                dagreGraph.setEdge({v: link.attributes.source.id, w: link.attributes.target.id, name: link.id});
            });

            Dagre.layout(dagreGraph);

            dagreGraph.nodes().forEach(function(id) {
                var value = dagreGraph.node(id)
                graph.get('cells').get(id).set('position', {
                    x: value.x - value.width/2,
                    y: value.y - value.height/2
                });
            });

            return {width: dagreGraph.graph().width, height: dagreGraph.graph().height};
        },

        jointLayout: function (graph, options) {
            options = options || {};

            var inputGraph = joint.layout.DirectedGraph._prepareData(graph),
                runner = dagre.layout(),
                diGraph;

            if (options.debugLevel) {
                runner.debugLevel(options.debugLevel);
            }
            if (options.rankDir) {
                runner.rankDir(options.rankDir);
            }
            if (options.rankSep) {
                runner.rankSep(options.rankSep);
            }
            if (options.edgeSep) {
                runner.edgeSep(options.edgeSep);
            }
            if (options.nodeSep) {
                runner.nodeSep(options.nodeSep);
            }

            diGraph = runner.run(inputGraph);

            diGraph.eachNode(function (u, value) {
                if (!value.dummy) {
                    graph.get('cells').get(u).set('position', {
                        x: value.x + GRAPH_MARGIN - value.width / 2,
                        y: value.y + GRAPH_MARGIN - value.height / 2
                    });
                }
            });

            if (options.setLinkVertices) {

                diGraph.eachEdge(function (e, u, v, value) {
                    var link = graph.get('cells').get(e);
                    if (link) {
                        graph.get('cells').get(e).set('vertices', value.points);
                    }
                });
            }

            return {width: diGraph.graph().width, height: diGraph.graph().height};
        }
    };

    return GraphLayoutHandler;
});
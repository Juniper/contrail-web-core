/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

joint = $.extend(true, joint, {shapes: {contrail: {}}, layout: {contrail: {}}});

function ContrailElement(type, options) {
    var contrailElement;
    switch(type) {
        case 'virtual-network':
            contrailElement = new joint.shapes.contrail.VirtualNetwork(options);
            break;
        case 'service-instance':
            contrailElement = new joint.shapes.contrail.ServiceInstance(options);
            break;
        case 'link':
            contrailElement = new joint.shapes.contrail.Link(options);
            break;
        default:
            contrailElement = new joint.shapes.contrail.VirtualNetwork(options);
    }
    return contrailElement;
}

function drawVisualization(config) {
    var url = config.url, selectorId = config.selectorId ;

    $.getJSON(url, function(response) {
        var graph = new joint.dia.Graph,
            paper = new joint.dia.Paper({
                height: 250,
                el: $(selectorId),
                model: graph
            });
        //response = createTestData();
        var nodeMap = {}, elements = [],
            nodes = response['nodes'],
            links = response['links'];

        for(var i = 0; i < nodes.length; i++) {
            var nodeName = nodes[i]['name'],
                nodeType = nodes[i]['node_type'],
                nodeStatus = nodes[i]['status'],
                imageLink, element, options;
            imageLink = (nodeStatus == "Deleted") ? "/img/vpn-deleted.png" : "/img/vpn.png";
            options = {attrs: { image: {'xlink:href': imageLink}}};
            element = new ContrailElement(nodeType, options).attr("text/text", nodeName.split(":")[2]);
            elements.push(element);
            nodeMap[nodeName] = element.id;
        }

        for(i = 0; i < links.length; i++) {
            var options = {
                sourceId: nodeMap[links[i]['src']],
                targetId: nodeMap[links[i]['dst']],
                direction: links[i]['dir']
            }, link;

            link = new ContrailElement('link', options);
            elements.push(link);
        }

        graph.addCells(elements);

        joint.layout.contrail.DirectedGraph.layout(graph, { setLinkVertices: false, edgeSep: 30, nodeSep: 35, rankSep: 50, rankDir: "TB" });

        var svg = document.querySelector(selectorId + ' svg g'),
            bbox = svg.getBBox(),
            width = Math.ceil(bbox.width),
            height = Math.ceil(bbox.height);

        paper.setDimensions(width, height, 20);
        initPanZoom(selectorId)
    });
}

function initPanZoom(elementId) {
    var $topology = $(elementId),
        $topologyHeader = $(elementId + "-header");
    $topology.panzoom({
        $zoomIn: $topologyHeader.find("#topology-zoomin"),
        $zoomOut: $topologyHeader.find("#topology-zoomout"),
        $reset: $topologyHeader.find("#topology-reset"),
        maxScale: 2
    });
};

joint.shapes.contrail.VirtualNetwork = joint.shapes.basic.Generic.extend({
    markup: '<g class="rotatable"><g class="scalable"><image/></g><a><text/></a></g>',

    defaults: joint.util.deepSupplement({
        type: 'contrail.VirtualNetwork',
        size: {'width': 30, 'height': 30},
        attrs: {
            text: {
                'font-size': 12,
                'ref-x':.5,
                'ref-y': -5,
                'y-alignment': 'middle',
                'text-anchor': 'middle',
                'ref': 'image',
                'stroke-width': '1px',
                'stroke': 'black'
            },
            a: {},
            image: {
                'width': 30,
                'height': 30,
                'xlink:href': "/img/vpn.png"
            }
        }
    }, joint.shapes.basic.Generic.prototype.defaults)
});

joint.shapes.contrail.ServiceInstance = joint.dia.Element.extend({
    markup: '<g class="rotatable"><g class="scalable"><polygon class="outer"/><polygon class="inner"/></g><a><text/></a></g>',

    defaults: joint.util.deepSupplement({

        type: 'contrail.ServiceInstance',
        size: { width: 30, height: 30 },
        attrs: {
            '.outer': {
                fill: '#3498DB', stroke: '#2980B9', 'stroke-width': 2,
                points: '40,0 80,40 40,80 0,40'
            },
            '.inner': {
                fill: '#3498DB', stroke: '#2980B9', 'stroke-width': 2,
                points: '40,5 75,40 40,75 5,40',
                display: 'none'
            },
            text: {
                'font-size': 12,
                'ref-x':.5,
                'ref-y': -5,
                'y-alignment': 'middle',
                'text-anchor': 'middle',
                'ref': 'polygon',
                'stroke-width': '1px',
                'stroke': 'black'
            },
            a: {
                //'xlink:href': ''
            }
        }

    }, joint.dia.Element.prototype.defaults)
});

joint.shapes.contrail.Link = function(options) {
    var linkConfig = {
        markup: [
                    '<path class="connection" stroke="black"></path>',
                    '<path class="marker-source" fill="black" stroke="black" />',
                    '<path class="marker-target" fill="black" stroke="black" />',
                    '<g class="labels"/>'
                ]. join(''),
        source: { id: options.sourceId },
        target: { id: options.targetId },
        smooth: true,
        attrs: {
            '.connection': {
                'stroke': '#333333',
                'stroke-width': 1
            }
        }
    }, link;

    if(options.direction == 'bi') {
        linkConfig['attrs']['.marker-source'] = { fill: '#333333', d: 'M 6 0 L 0 3 L 6 6 z' };
        linkConfig['attrs']['.marker-target'] = { fill: '#333333', d: 'M 6 0 L 0 3 L 6 6 z' };
    } else if(options.direction == 'uni') {
        linkConfig['attrs']['.marker-target'] = { fill: '#333333', d: 'M 6 0 L 0 3 L 6 6 z' };
    }

    link = new joint.dia.Link(linkConfig);
    return link;
};

joint.layout.contrail.DirectedGraph = $.extend(true, joint.layout.DirectedGraph, {
    layout: function(graph, opt) {

        opt = opt || {};

        var inputGraph = this._prepareData(graph);
        var runner = dagre.layout();

        if (opt.debugLevel) { runner.debugLevel(opt.debugLevel); }
        if (opt.rankDir) { runner.rankDir(opt.rankDir); }
        if (opt.rankSep) { runner.rankSep(opt.rankSep); }
        if (opt.edgeSep) { runner.edgeSep(opt.edgeSep); }
        if (opt.nodeSep) { runner.nodeSep(opt.nodeSep); }

        var layoutGraph = runner.run(inputGraph);

        layoutGraph.eachNode(function(u, value) {
            if (!value.dummy) {
                graph.get('cells').get(u).set('position', {
                    x: value.x + 30 - value.width/2,
                    y: value.y + 30 - value.height/2
                });
            }
        });

        if (opt.setLinkVertices) {

            layoutGraph.eachEdge(function(e, u, v, value) {
                var link = graph.get('cells').get(e);
                if (link) {
                    graph.get('cells').get(e).set('vertices', value.points);
                }
            });
        }

        return { width: layoutGraph.graph().width, height: layoutGraph.graph().height };
    }
});

function createTestData() {
    var testData = {nodes: [], links: []}, node;

    for(var i = 1; i <= 11; i++) {
        node = {name: 'default-domain:admin:vnetwork' + i, node_type: 'virtual-network', status:'Active'};
        testData['nodes'].push(node);
    }

    node = {name: 'default-domain:admin:test', node_type: 'virtual-network', status:'Deleted'};
    testData['nodes'].push(node);

    for(var i = 1; i <= 2; i++) {
        node = {name: 'default-domain:admin:sinstance' + i, node_type: 'service-instance', status:'Active'};
        testData['nodes'].push(node);
    }

    var connections = [[2, 3, 4,5,6,7], [8,9,3], [], [10], [11]];

    for(var i = 0; i < connections.length; i++) {
        var con = connections[i], link;
        if(i % 3 == 0) {
            link = {src: 'default-domain:admin:vnetwork' + (i + 1) , dst: 'default-domain:admin:sinstance' + (i/3 + 1), dir:'uni'};
            testData['links'].push(link);
            link = {src: 'default-domain:admin:sinstance' + (i/3 + 1) , dst: 'default-domain:admin:vnetwork' + (i + 2), dir:'uni'};
            testData['links'].push(link);
        }
        for(var j = 0; j < con.length; j++) {
            link = {src: 'default-domain:admin:vnetwork' + (i + 1) , dst: 'default-domain:admin:vnetwork' + con[j], dir: (i / 2 == 0) ? 'uni' : 'bi'};
            testData['links'].push(link);
        }
    }
    return testData;
};
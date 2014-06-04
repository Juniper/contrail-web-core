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
            contrailElement = new joint.shapes.contrail.Element(options);
    }
    return contrailElement;
}

function drawVisualization(config) {
    var url = config.url;

    $.getJSON(url, function(response) {
        var data = formatData4Visualization(response);
        renderVisualization(config, data);
    });
    
    $.contextMenu({
        selector: 'g', 
        callback: function(key, options) {
            var m = "clicked: " + key;
            window.console && console.log(m) || alert(m); 
        },
        items: {
            "view": {name: "View"},
            "edit": {name: "Edit"},
            "monitor": {name: "Monitor"},
            
        }
    });
}

function renderVisualization(config, data) {
    var selectorId = config.selectorId,
        elements = data['elements'],
        nodes = data['nodes'],
        links = data['links'],
        rankDir, newGraphSize, $panzoom;

    var graph = new joint.dia.Graph,
        paper = new joint.dia.Paper({
            el: $(selectorId),
            model: graph
        });

    graph.addCells(elements);

    rankDir = (nodes.length > 12 || (links.length == 0)) ? 'TB' : 'LR';
    newGraphSize = joint.layout.contrail.DirectedGraph.layout(graph, { setLinkVertices: false, edgeSep:1, nodeSep: 80, rankSep: 80, rankDir: rankDir });
    paper.setDimensions(newGraphSize.width, newGraphSize.height + 100, 1);

    $(selectorId + " text").on('mousedown touchstart', function(e) {
        e.stopImmediatePropagation();
        paper.pointerdown(e);
    });

    $(selectorId + " image").on('mousedown touchstart', function(e) {
        e.stopImmediatePropagation();
        paper.pointerdown(e);
    });

    $(selectorId + " polygon").on('mousedown touchstart', function(e) {
        e.stopImmediatePropagation();
        paper.pointerdown(e);
    });

    for(var i = 0; i < links.length; i++) {
        //setupTransition4Link(data['nodeMap'], links[i], paper, graph);
    }

    $panzoom = initPanZoom(selectorId);

    $panzoom.parent().on('mousewheel.focal', function( e ) {
        e.preventDefault();
        var delta = e.delta || e.originalEvent.wheelDelta;
        var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
        $panzoom.panzoom('zoom', zoomOut, {
            increment:.05,
            animate: false,
            minScale: 0.5,
            maxScale: 2.5,
            duration: 500,
            focal: e
        });
    });
}

function formatData4Visualization(response) {
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
        var optionsForward = {
            sourceId: nodeMap[links[i]['src']],
            targetId: nodeMap[links[i]['dst']]
        }, optionsBackward = {
            sourceId: nodeMap[links[i]['dst']],
            targetId: nodeMap[links[i]['src']]
        }, link;
        if(links[i]['dir'] == 'bi') {
            link = new ContrailElement('link', optionsForward);
            links[i]['outLink'] = link;
            elements.push(link);
            link = new ContrailElement('link', optionsBackward);
            links[i]['inLink'] = link;
            elements.push(link);
        } else {
            link = new ContrailElement('link', optionsForward);
            links[i]['outLink'] = link;
            elements.push(link);
        }
    }
    return {elements: elements, nodeMap: nodeMap, nodes: nodes, links: links};
}

function initPanZoom(elementId) {
    var $topology = $(elementId),
        $topologyHeader = $(elementId + "-header"),
        $panzoom;
    $panzoom = $topology.panzoom({
        $reset: $topologyHeader.find("#topology-reset")
    });
    return $panzoom;
};

function setupTransition4Link(nodeMap, link, paper, graph) {
    var trafficStats = link['more_attributes'],
        inStats = trafficStats['in_stats'],
        inLink = link['inLink'],
        outLink = link['outLink'],
        packets, srcName, source,
        srcId, i, transitionLink;
    for(i = 0; inStats && i < inStats.length; i++) {
        packets = inStats[i]['pkts'];
        if(packets > 0) {
            srcName = inStats[i]['src'];
            srcId = nodeMap[srcName]
            if(inLink.get('source').id == srcId) {
                transitionLink = inLink;
            } else {
                transitionLink = outLink;
            }
            startTransition4Link(transitionLink, paper, 5, 5000);
        }
    }
}

function startTransition4Link(link, paper, sec, interval) {
    var token = V('circle', { r: 3, fill: '#ff7f0e' });
    $(paper.viewport).append(token.node);
    token.animateAlongPath({ dur: sec + 's', repeatCount: 1 }, paper.findViewByModel(link).$('.connection')[0]);
    setInterval(function(){
        token.animateAlongPath({ dur: sec + 's', repeatCount: 1 }, paper.findViewByModel(link).$('.connection')[0]);
    }, interval);
}

function resizeWidget(self,elementId){
	if($(self).find('i').hasClass('icon-resize-full')){
		$(self).find('i').removeClass('icon-resize-full').addClass('icon-resize-small');
		$('#project-visualization-charts').hide();
	}
	else{
		$(self).find('i').removeClass('icon-resize-small').addClass('icon-resize-full');
		$('#project-visualization-charts').show();
	}
	setTopologyHeight(elementId);
}

function setTopologyHeight(elementId){
	var topologyHeight = window.innerHeight;
	
	if($('#project-visualization-charts').is(':visible')){
		topologyHeight = topologyHeight - 435;
	}
	else{
		topologyHeight -= 200 ;
	}
	setTimeout(function(){
		var svgHeight = $(elementId + ' svg').attr('height');
		$(elementId).parent().height((topologyHeight < 190) ? 190 : ((topologyHeight > svgHeight) ? svgHeight : topologyHeight));
	},500)
	
	$(elementId).parent().css('width','100%');
}


function drawTestVisualization(config) {
    var data = formatData4Visualization(createTestData());
    renderVisualization(config, data);
}

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


joint.shapes.contrail.VirtualNetwork = joint.shapes.basic.Generic.extend({
    markup: '<image/><a><text/></a>',

    defaults: joint.util.deepSupplement({
        type: 'contrail.VirtualNetwork',
        size: {'width': 35, 'height': 35},
        attrs: {
            text: {
            	'ref-x':.5,
                'ref-y': -5,
                'y-alignment': 'middle',
                'text-anchor': 'middle',
                'ref': 'image',
                'stroke-width': '0.4px',
                'stroke': '#333',
                'fill': '#333'
            },
            a: {},
            image: {
                'width': 35,
                'height': 35,
                'xlink:href': "/img/vpn.png"
            }
        }
    }, joint.shapes.basic.Generic.prototype.defaults)
});

joint.shapes.contrail.ServiceInstance = joint.dia.Element.extend({
    markup: '<polygon class="outer"/><polygon class="inner"/><a><text/></a>',

    defaults: joint.util.deepSupplement({

        type: 'contrail.ServiceInstance',
        size: { width: 30, height: 30 },
        attrs: {
            '.outer': {
                fill: '#3498DB', stroke: '#2980B9', 'stroke-width': 2,
                points: '15,0 30,15 15,30 0,15'
            },
            '.inner': {
                fill: '#3498DB', stroke: '#2980B9', 'stroke-width': 2,
                points: '15, 3 27,15 15,27 3,15',
                display: 'none'
            },
            text: {
                'font-size': 12,
                'ref-x':.5,
                'ref-y': -5,
                'y-alignment': 'middle',
                'text-anchor': 'middle',
                'ref': 'polygon',
                'stroke-width': '0.4px',
                'stroke': '#333',
                'fill': '#333'
            },
            a: {}
        }

    }, joint.dia.Element.prototype.defaults)
});


joint.shapes.contrail.Element = joint.dia.Element.extend({
    markup: '<polygon class="outer"/><polygon class="inner"/><a><text/></a>',

    defaults: joint.util.deepSupplement({

        type: 'contrail.Element',
        size: { width: 30, height: 30 },
        attrs: {
            '.outer': {
                fill: '#ff7f0e', stroke: '#ff7f0e', 'stroke-width': 2,
                points: '15,0 30,15 15,30 0,15'
            },
            '.inner': {
                fill: '#ff7f0e', stroke: '#ff7f0e', 'stroke-width': 2,
                points: '15, 3 27,15 15,27 3,15',
                display: 'none'
            },
            text: {
                'font-size': 12,
                'ref-x':.5,
                'ref-y': -5,
                'y-alignment': 'middle',
                'text-anchor': 'middle',
                'ref': 'polygon',
                'stroke-width': '0.4px',
                'stroke': '#333',
                'fill': '#333'
            },
            a: {
                //'xlink:href': '#'
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

    linkConfig['attrs']['.marker-target'] = { fill: '#333333', d: 'M 6 0 L 0 3 L 6 6 z' };

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
                    x: value.x + 50 - value.width/2,
                    y: value.y + 50 - value.height/2
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
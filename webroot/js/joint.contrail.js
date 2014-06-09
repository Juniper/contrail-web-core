/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

joint = $.extend(true, joint, {shapes: {contrail: {}}, layout: {contrail: {}}});

var imageMap = {
    'virtual-network': 'vpn',
    'network-policy': 'policy',
    'service-instance-l2': 'l2',
    'service-instance-l3': 'l2',
    'service-instance-analyzer': 'analyzer',
    'service-instance-firewall': 'firewall',
    'service-instance-nat': 'nat',
    'service-instance-lb': 'lb',
    'service-instance': 'nat',
    'security-group': 'sg',
    'floating-ip': 'fip',
    'network-ipam': 'ipam',
    'router': 'router'
};

function ContrailElement(type, options) {
    var contrailElement;
    switch (type) {
        case 'virtual-network':
            contrailElement = new joint.shapes.contrail.VirtualNetwork(options);
            break;
        case 'service-instance':
            contrailElement = new joint.shapes.contrail.ServiceInstance(options);
            break;
        case 'network-policy':
            contrailElement = new joint.shapes.contrail.NetworkPolicy(options);
            break;
        case 'security-group':
            contrailElement = new joint.shapes.contrail.SecurityGroup(options);
            break;
        case 'network-ipam':
            contrailElement = new joint.shapes.contrail.NetworkIPAM(options);
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

    $.getJSON(url, function (response) {
        var data = formatData4BiDirVisualization(response);
        renderVisualization(config, data);
        $.contextMenu({
            selector: 'g',
            callback: function (key, options) {
                var m = "clicked: " + key;
                window.console && console.log(m) || alert(m);
            },
            items: {
                "view": {name: "View"},
                "edit": {name: "Edit"},
                "monitor": {name: "Monitor"}
            }
        });
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

    //rankDir = (nodes.length > 12 || (links.length == 0)) ? 'TB' : 'LR';
    rankDir = 'LR';
    newGraphSize = joint.layout.contrail.DirectedGraph.layout(graph, { setLinkVertices: false, edgeSep:1, nodeSep: 50, rankSep: 50, rankDir: rankDir });
    console.log(newGraphSize);
    paper.setDimensions(newGraphSize.width + 100, newGraphSize.height + 100, 1);

    $(selectorId + " text").on('mousedown touchstart', function (e) {
        e.stopImmediatePropagation();
        paper.pointerdown(e);
    });

    $(selectorId + " image").on('mousedown touchstart', function (e) {
        e.stopImmediatePropagation();
        paper.pointerdown(e);
    });

    $(selectorId + " polygon").on('mousedown touchstart', function (e) {
        e.stopImmediatePropagation();
        paper.pointerdown(e);
    });

    for (var i = 0; i < links.length; i++) {
        //setupTransition4Link(data['nodeMap'], links[i], paper, graph);
    }

    $panzoom = initPanZoom(selectorId);

    $panzoom.parent().on('mousewheel.focal', function (e) {
        e.preventDefault();
        var delta = e.delta || e.originalEvent.wheelDelta;
        var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
        $panzoom.panzoom('zoom', zoomOut, {
            increment: .02,
            animate: false,
            minScale: 0.5,
            maxScale: 2.5,
            duration: 500,
            focal: e
        });
    });
}

function formatData4BiDirVisualization(response) {
    var nodeMap = {}, elements = [],
        nodes = response['nodes'],
        links = response['links'],
        configData = response['configData'];
    createNodes4ConfigData(configData, nodes);
    createNodeElements(nodes, elements, nodeMap);
    createLinkElements(links, elements, nodeMap);

    return {elements: elements, nodeMap: nodeMap, nodes: nodes, links: links};
}

function createNodes4ConfigData(configData, nodes) {
    var networkPolicys = configData['network-policys'],
        securityGroups = configData['security-groups'],
        networkIPAMS = configData['network-ipams'],
        name, i;

    for (i = 0; networkPolicys != null && i < networkPolicys.length; i++) {
        name = networkPolicys[i]['network-policy']['fq_name'].join(':');
        nodes.push({name: name, node_type: 'network-policy'});
    }

    for (i = 0; securityGroups != null && i < securityGroups.length; i++) {
        name = securityGroups[i]['security-group']['fq_name'].join(':');
        nodes.push({name: name, node_type: 'security-group'});
    }

    for (i = 0; networkIPAMS != null && i < networkIPAMS.length; i++) {
        name = networkIPAMS[i]['network-ipam']['fq_name'].join(':');
        nodes.push({name: name, node_type: 'network-ipam'});
    }
}

function createNodeElements(nodes, elements, nodeMap) {
    for (var i = 0; i < nodes.length; i++) {
        var nodeName = nodes[i]['name'],
            nodeType = nodes[i]['node_type'],
            imageLink, element, options, imageName;
        imageName = getImageName(nodes[i]);
        imageLink = '/img/icons/' + imageName;
        options = {attrs: { image: {'xlink:href': imageLink}}};
        element = new ContrailElement(nodeType, options).attr("text/text", nodeName.split(":")[2]);
        elements.push(element);
        nodeMap[nodeName] = element.id;
    }
}

function createLinkElements(links, elements, nodeMap) {
    for (var i = 0; i < links.length; i++) {
        var sInstances = links[i] ['service_inst'],
            dir = links[i]['dir'],
            options, link;

        if (sInstances == null || sInstances.length == 0) {
            options = {
                sourceId: nodeMap[links[i]['src']],
                targetId: nodeMap[links[i]['dst']],
                direction: dir,
                linkType: 'bi'
            };
            link = new ContrailElement('link', options);
            elements.push(link);
        } else {
            options = { direction: dir, linkType: 'bi'};
            for (var j = 0; j < sInstances.length; j++) {
                if (j == 0) {
                    options['sourceId'] = nodeMap[links[i]['src']];
                    options['targetId'] = nodeMap[sInstances[j]['name']];
                } else {
                    options['sourceId'] = nodeMap[sInstances[j - 1]['name']];
                    options['targetId'] = nodeMap[sInstances[j]['name']];
                }
                link = new ContrailElement('link', options);
                elements.push(link);
            }
            options['sourceId'] = nodeMap[sInstances[j - 1]['name']];
            options['targetId'] = nodeMap[links[i]['dst']];
            link = new ContrailElement('link', options);
            elements.push(link);
        }
    }
}

function getImageName(node) {
    var nodeStatus = node['status'],
        serviceType = node['service_type'],
        nodeType = node['node_type'],
        imageName;

    nodeType = (serviceType != null) ? (nodeType + '-' + serviceType) : nodeType;
    imageName = imageMap[nodeType];

    if (imageName == null) {
        imageName = 'opencontrail-icon.png';
    } else if (nodeStatus == 'Deleted') {
        imageName += '-deleted.png';
    } else {
        imageName += '.png';
    }
    return imageName;
};

function initPanZoom(elementId) {
    var $topology = $(elementId),
        $topologyHeader = $(elementId + "-header"),
        $panzoom;
    $panzoom = $topology.panzoom({
        $reset: $topologyHeader.find("#topology-reset"),
        disableZoom: true
    });
    return $panzoom;
};

function resizeWidget(self, elementId) {
    if ($(self).find('i').hasClass('icon-resize-full')) {
        $(self).find('i').removeClass('icon-resize-full').addClass('icon-resize-small');
        $(self).parents('.widget-box').find('.project-visualization-charts').hide();
    }
    else {
        $(self).find('i').removeClass('icon-resize-small').addClass('icon-resize-full');
        $(self).parents('.widget-box').find('.project-visualization-charts').show();
    }
    setTopologyHeight(elementId, true);
}

function setTopologyHeight(elementId, resizeFlag) {
    var topologyHeight = window.innerHeight;

    if ($(elementId).parents('.widget-box').find('.project-visualization-charts').is(':visible')) {
        topologyHeight = topologyHeight - 500;
    }
    else {
        topologyHeight -= 175;
    }

    setTimeout(function () {
        var svgHeight = $(elementId + ' svg').attr('height');
        $(elementId).parent().height((topologyHeight < 190) ? 190 : ((topologyHeight > svgHeight && !(contrail.checkIfExist(resizeFlag) && resizeFlag)) ? svgHeight : topologyHeight));
        $(elementId).parent().css('width', '100%');
    }, 500)
}

function formatData4Visualization(response) {
    var nodeMap = {}, elements = [],
        nodes = response['nodes'],
        links = response['links'];

    createNodeElements(nodes, elements, nodeMap);

    for (var i = 0; i < links.length; i++) {
        var optionsForward = {
            sourceId: nodeMap[links[i]['src']],
            targetId: nodeMap[links[i]['dst']]
        }, optionsBackward = {
            sourceId: nodeMap[links[i]['dst']],
            targetId: nodeMap[links[i]['src']]
        }, link;
        if (links[i]['dir'] == 'bi') {
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

function setupTransition4Link(nodeMap, link, paper, graph) {
    var trafficStats = link['more_attributes'],
        inStats = trafficStats['in_stats'],
        inLink = link['inLink'],
        outLink = link['outLink'],
        packets, srcName, source,
        srcId, i, transitionLink;
    for (i = 0; inStats && i < inStats.length; i++) {
        packets = inStats[i]['pkts'];
        if (packets > 0) {
            srcName = inStats[i]['src'];
            srcId = nodeMap[srcName]
            if (inLink.get('source').id == srcId) {
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
    setInterval(function () {
        token.animateAlongPath({ dur: sec + 's', repeatCount: 1 }, paper.findViewByModel(link).$('.connection')[0]);
    }, interval);
}

function drawTestVisualization(config) {
    $.getJSON('/assets/examples/data/project.json', function (response) {
        var data = formatData4BiDirVisualization(response);
        renderVisualization(config, data);
        $.contextMenu({
            selector: 'g',
            callback: function (key, options) {
                var m = "clicked: " + key;
                window.console && console.log(m) || alert(m);
            },
            items: {
                "view": {name: "View"},
                "edit": {name: "Edit"}
            }
        });
    });
}

function createTestData() {
    var testData = {nodes: [], links: []}, node;

    for (var i = 1; i <= 11; i++) {
        node = {name: 'default-domain:admin:vnetwork' + i, node_type: 'virtual-network', status: 'Active'};
        testData['nodes'].push(node);
    }

    node = {name: 'default-domain:admin:test', node_type: 'virtual-network', status: 'Deleted'};
    testData['nodes'].push(node);

    for (var i = 1; i <= 2; i++) {
        node = {name: 'default-domain:admin:sinstance' + i, node_type: 'service-instance', status: 'Active'};
        testData['nodes'].push(node);
    }

    var connections = [
        [2, 3, 4, 5, 6, 7],
        [8, 9, 3],
        [],
        [10],
        [11]
    ];

    for (var i = 0; i < connections.length; i++) {
        var con = connections[i], link;
        if (i % 3 == 0) {
            link = {src: 'default-domain:admin:vnetwork' + (i + 1), dst: 'default-domain:admin:sinstance' + (i / 3 + 1), dir: 'uni'};
            testData['links'].push(link);
            link = {src: 'default-domain:admin:sinstance' + (i / 3 + 1), dst: 'default-domain:admin:vnetwork' + (i + 2), dir: 'uni'};
            testData['links'].push(link);
        }
        for (var j = 0; j < con.length; j++) {
            link = {src: 'default-domain:admin:vnetwork' + (i + 1), dst: 'default-domain:admin:vnetwork' + con[j], dir: (i / 2 == 0) ? 'uni' : 'bi'};
            testData['links'].push(link);
        }
    }
    return testData;
};

joint.shapes.contrail.ImageElement = joint.shapes.basic.Generic.extend({
    markup: '<image/><text/>',

    defaults: joint.util.deepSupplement({
        type: 'contrail.ImageElement',
        size: {'width': 60, 'height': 60},
        attrs: {
            text: {
                'ref-x': .5,
                'ref-y': 3,
                'y-alignment': 'middle',
                'text-anchor': 'middle',
                'ref': 'image',
                'stroke-width': '0.4px',
                'stroke': '#333',
                'fill': '#333'
            },
            image: {
                'width': 60,
                'height': 60
            }
        }
    }, joint.shapes.basic.Generic.prototype.defaults)
});

joint.shapes.contrail.VirtualNetwork = joint.shapes.contrail.ImageElement.extend({
    defaults: joint.util.deepSupplement({
        type: 'contrail.VirtualNetwork'
    }, joint.shapes.contrail.ImageElement.prototype.defaults)
});

joint.shapes.contrail.ServiceInstance = joint.shapes.contrail.ImageElement.extend({
    defaults: joint.util.deepSupplement({
        type: 'contrail.ServiceInstance'
    }, joint.shapes.contrail.ImageElement.prototype.defaults)
});

joint.shapes.contrail.NetworkPolicy = joint.shapes.contrail.ImageElement.extend({
    defaults: joint.util.deepSupplement({
        type: 'contrail.NetworkPolicy'
    }, joint.shapes.contrail.ImageElement.prototype.defaults)
});

joint.shapes.contrail.SecurityGroup = joint.shapes.contrail.ImageElement.extend({
    defaults: joint.util.deepSupplement({
        type: 'contrail.SecurityGroup'
    }, joint.shapes.contrail.ImageElement.prototype.defaults)
});

joint.shapes.contrail.NetworkIPAM = joint.shapes.contrail.ImageElement.extend({
    defaults: joint.util.deepSupplement({
        type: 'contrail.NetworkIPAM'
    }, joint.shapes.contrail.ImageElement.prototype.defaults)
});

joint.shapes.contrail.Element = joint.dia.Element.extend({
    markup: '<polygon class="outer"/><polygon class="inner"/><text/>',

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
                'ref-x': .5,
                'ref-y': -5,
                'y-alignment': 'middle',
                'text-anchor': 'middle',
                'ref': 'polygon',
                'stroke-width': '0.4px',
                'stroke': '#333',
                'fill': '#333'
            }
        }

    }, joint.dia.Element.prototype.defaults)
});

joint.shapes.contrail.Link = function (options) {
    var linkConfig = {
        markup: [
            '<path class="connection" stroke="black"></path>',
            '<path class="marker-source" fill="black" stroke="black" />',
            '<path class="marker-target" fill="black" stroke="black" />',
            '<g class="marker-vertices"/>',
            '<g class="labels"></g>'
        ].join(''),
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

    if (options['linkType'] == 'bi') {
        if (options.direction == 'bi') {
            linkConfig['attrs']['.marker-source'] = { fill: '#333333', d: 'M 6 0 L 0 3 L 6 6 z' };
            linkConfig['attrs']['.marker-target'] = { fill: '#333333', d: 'M 6 0 L 0 3 L 6 6 z' };
        } else if (options.direction == 'uni') {
            linkConfig['attrs']['.marker-target'] = { fill: '#333333', d: 'M 6 0 L 0 3 L 6 6 z' };
        }
    } else {
        linkConfig['attrs']['.marker-target'] = { fill: '#333333', d: 'M 6 0 L 0 3 L 6 6 z' };
    }

    link = new joint.dia.Link(linkConfig);
    return link;
};

joint.layout.contrail.DirectedGraph = $.extend(true, joint.layout.DirectedGraph, {
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
                    x: value.x + 50 - value.width / 2,
                    y: value.y + 50 - value.height / 2
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
        return { width: layoutGraph.graph().width, height: layoutGraph.graph().height };
    }
});

/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'joint'
], function (joint) {
    joint = $.extend(true, joint, {shapes: {contrail: {}}, layout: {contrail: {}}});

    joint.shapes.contrail.ImageElement = joint.shapes.basic.Generic.extend({
        markup: '<image/><text/>',

        defaults: joint.util.deepSupplement({
            type: 'contrail.ImageElement',
            attrs: {
                text: {
                    'style': 'font-size: 20px;',
                    'ref-x': .5,
                    'ref-y': -10,
                    'y-alignment': 'middle',
                    'text-anchor': 'middle',
                    'ref': 'image',
                    'stroke-width': '0.4px',
                    'stroke': '#333',
                    'fill': '#333'
                }
            }
        }, joint.shapes.basic.Generic.prototype.defaults),

        remove: removeCell
    });

    joint.shapes.contrail.CollectionElement = joint.shapes.basic.Rect.extend({
        markup: '<rect><image/></rect>',
        defaults: joint.util.deepSupplement({
            type: 'contrail.CollectionElement',
            attrs: {
                rect: {rx: 0, ry: 0, 'stroke-width': '0.8px', stroke: '#fff', 'stroke-dasharray': '10,3', fill: 'none'}
            }
        }, joint.shapes.basic.Rect.prototype.defaults)
    });

    joint.shapes.contrail.FontElement = joint.shapes.basic.Rect.extend({
        markup: '<g class="rotatable"><text/><g class="scalable"><rect/></g></g>',

        defaults: joint.util.deepSupplement({
            type: 'contrail.FontElement',
            size: {width: 35, height: 35},
            attrs: {
                rect: {stroke: 0, 'fill-opacity': 0, width: 35, height: 35},
                text: {
                    'ref-y': -10,
                    'x-alignment': 'middle',
                    'y-alignment': 'middle',
                    'ref': 'rect',
                    'stroke-width': '0.4px',
                    'stroke': '#333',
                    'fill': '#333'
                }
            }
        }, joint.shapes.basic.Rect.prototype.defaults)
    });

    joint.shapes.contrail.FontElementView = joint.dia.ElementView.extend({
        template: function (elementProperty) {
            return [
                '<div class="font-element ' + elementProperty.model.attributes.type.split('.').join(' ') + '" font-element-model-id="' + elementProperty.model.id + '">',
                '<i class="' + elementProperty.model.attributes.font.iconClass + '"/>',
                '</div>'
            ].join('');
        },
        initialize: function () {
            _.bindAll(this, 'updateBox');
            joint.dia.ElementView.prototype.initialize.apply(this, arguments);
            this.$box = $(_.template(this.template(this))());
            // Update the box position whenever the underlying model changes.
            this.model.on('change', this.updateBox, this);
            this.updateBox();
        },
        render: function () {
            joint.dia.ElementView.prototype.render.apply(this, arguments);
            this.paper.$el.prepend(this.$box);
            this.updateBox();
            return this;
        },
        updateBox: function () {
            // Set the position and dimension of the box so that it covers the JointJS element.
            var bbox = this.model.getBBox();
            // Example of updating the HTML with a data stored in the cell model.
            this.$box.css({
                width: bbox.width,
                height: bbox.height,
                left: bbox.x,
                top: bbox.y,
                transform: 'rotate(' + (this.model.get('angle') || 0) + 'deg)'
            });
        }
    });

    joint.shapes.contrail.Element = joint.dia.Element.extend({
        markup: '<text/><polygon class="outer"/><polygon class="inner"/>',

        defaults: joint.util.deepSupplement({
            type: 'contrail.Element',
            size: {width: 30, height: 30},
            attrs: {
                '.outer': {
                    fill: '#fff', stroke: '#ff7f0e', 'stroke-width': 3,
                    points: '15,0 30,15 15,30 0,15'
                },
                '.inner': {
                    fill: '#fff', stroke: '#ff7f0e', 'stroke-width': 3,
                    points: '15, 3 27,15 15,27 3,15',
                    display: 'none'
                },
                text: {
                    'font-size': 12,
                    'ref-x': .5,
                    'ref-y': -10,
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

    joint.shapes.contrail.VirtualNetwork = joint.shapes.contrail.FontElement.extend({
        markup: '<g class="rotatable"><text/><g class="scalable"><rect class="VirtualNetwork"/></g></g>',
        defaults: joint.util.deepSupplement({
            type: 'contrail.VirtualNetwork'
        }, joint.shapes.contrail.FontElement.prototype.defaults)
    });

    joint.shapes.contrail.VirtualNetworkView = joint.shapes.contrail.FontElementView.extend({
        defaults: joint.util.deepSupplement({
            type: 'contrail.VirtualNetworkView'
        }, joint.shapes.contrail.FontElementView.prototype.defaults)
    });


    joint.shapes.contrail.VirtualMachine = joint.shapes.contrail.FontElement.extend({
        markup: '<g class="rotatable"><text/><g class="scalable"><rect class="VirtualMachine"/></g></g>',
        defaults: joint.util.deepSupplement({
            type: 'contrail.VirtualMachine'
        }, joint.shapes.contrail.FontElement.prototype.defaults)
    });

    joint.shapes.contrail.VirtualMachineView = joint.shapes.contrail.FontElementView.extend({
        defaults: joint.util.deepSupplement({
            type: 'contrail.VirtualMachineView'
        }, joint.shapes.contrail.FontElementView.prototype.defaults)
    });

    joint.shapes.contrail.ServiceInstance = joint.shapes.contrail.Element.extend({
        defaults: joint.util.deepSupplement({
            type: 'contrail.ServiceInstance'
        }, joint.shapes.contrail.Element.prototype.defaults)
    });

    joint.shapes.contrail.NetworkPolicy = joint.shapes.contrail.FontElement.extend({
        markup: '<g class="rotatable"><text/><g class="scalable"><rect class="NetworkPolicy"/></g></g>',

        defaults: joint.util.deepSupplement({
            type: 'contrail.NetworkPolicy.no-drag-element'
        }, joint.shapes.contrail.FontElement.prototype.defaults)
    });

    joint.shapes.contrail.NetworkPolicyView = joint.shapes.contrail.FontElementView.extend({
        defaults: joint.util.deepSupplement({
            type: 'contrail.NetworkPolicyView'
        }, joint.shapes.contrail.FontElementView.prototype.defaults)
    });

    joint.shapes.contrail.SecurityGroup = joint.shapes.contrail.FontElement.extend({
        markup: '<g class="rotatable"><text/><g class="scalable"><rect class="SecurityGroup"/></g></g>',

        defaults: joint.util.deepSupplement({
            type: 'contrail.SecurityGroup.no-drag-element'
        }, joint.shapes.contrail.FontElement.prototype.defaults)
    });

    joint.shapes.contrail.SecurityGroupView = joint.shapes.contrail.FontElementView.extend({
        defaults: joint.util.deepSupplement({
            type: 'contrail.SecurityGroupView'
        }, joint.shapes.contrail.FontElementView.prototype.defaults)
    });

    joint.shapes.contrail.NetworkIPAM = joint.shapes.contrail.FontElement.extend({
        markup: '<g class="rotatable"><text/><g class="scalable"><rect class="NetworkIPAM"/></g></g>',

        defaults: joint.util.deepSupplement({
            type: 'contrail.NetworkIPAM.no-drag-element'
        }, joint.shapes.contrail.FontElement.prototype.defaults)
    });

    joint.shapes.contrail.NetworkIPAMView = joint.shapes.contrail.FontElementView.extend({
        defaults: joint.util.deepSupplement({
            type: 'contrail.NetworkIPAMView'
        }, joint.shapes.contrail.FontElementView.prototype.defaults)
    });

    joint.shapes.contrail.LogicalRouter = joint.shapes.contrail.FontElement.extend({
        markup: '<g class="rotatable"><text/><g class="scalable"><rect class="LogicalRouter"/></g></g>',

        defaults: joint.util.deepSupplement({
            type: 'contrail.LogicalRouter'
        }, joint.shapes.contrail.FontElement.prototype.defaults)
    });

    joint.shapes.contrail.LogicalRouterView = joint.shapes.contrail.FontElementView.extend({
        defaults: joint.util.deepSupplement({
            type: 'contrail.LogicalRouterView'
        }, joint.shapes.contrail.FontElementView.prototype.defaults)
    });

    joint.shapes.contrail.PhysicalRouter = joint.shapes.contrail.FontElement.extend({
        markup: '<g class="rotatable"><text/><g class="scalable"><rect class="PhysicalRouter"/></g></g>',
        defaults: joint.util.deepSupplement({
            type: 'contrail.PhysicalRouter'
        }, joint.shapes.contrail.FontElement.prototype.defaults)
    });

    joint.shapes.contrail.PhysicalRouterView = joint.shapes.contrail.FontElementView.extend({
        defaults: joint.util.deepSupplement({
            type: 'contrail.PhysicalRouterView'
        }, joint.shapes.contrail.FontElementView.prototype.defaults)
    });

    joint.shapes.contrail.VirtualRouter = joint.shapes.contrail.FontElement.extend({
        markup: '<g class="rotatable"><text/><g class="scalable"><rect class="VirtualRouter"/></g></g>',
        defaults: joint.util.deepSupplement({
            type: 'contrail.VirtualRouter'
        }, joint.shapes.contrail.FontElement.prototype.defaults)
    });

    joint.shapes.contrail.VirtualRouterView = joint.shapes.contrail.FontElementView.extend({
        defaults: joint.util.deepSupplement({
            type: 'contrail.VirtualRouterView'
        }, joint.shapes.contrail.FontElementView.prototype.defaults)
    });

//Chassis components - Begin
    joint.shapes.contrail.Chassis = joint.shapes.contrail.FontElement.extend({
        markup: '<g class="rotatable"><text/><g class="scalable"><rect class="Chassis"/></g></g>',
        defaults: joint.util.deepSupplement({
            type: 'contrail.Chassis'
        }, joint.shapes.contrail.FontElement.prototype.defaults)
    });

    joint.shapes.contrail.ChassisView = joint.shapes.contrail.FontElementView.extend({
        defaults: joint.util.deepSupplement({
            type: 'contrail.ChassisView'
        }, joint.shapes.contrail.FontElementView.prototype.defaults)
    });

    joint.shapes.contrail.LineCard = joint.shapes.contrail.FontElement.extend({
        markup: '<g class="rotatable"><text/><g class="scalable"><rect class="LineCard"/></g></g>',
        defaults: joint.util.deepSupplement({
            type: 'contrail.LineCard'
        }, joint.shapes.contrail.FontElement.prototype.defaults)
    });

    joint.shapes.contrail.LineCardView = joint.shapes.contrail.FontElementView.extend({
        defaults: joint.util.deepSupplement({
            type: 'contrail.LineCardView'
        }, joint.shapes.contrail.FontElementView.prototype.defaults)
    });

    joint.shapes.contrail.SwitchCard = joint.shapes.contrail.FontElement.extend({
        markup: '<g class="rotatable"><text/><g class="scalable"><rect class="SwitchCard"/></g></g>',
        defaults: joint.util.deepSupplement({
            type: 'contrail.SwitchCard'
        }, joint.shapes.contrail.FontElement.prototype.defaults)
    });

    joint.shapes.contrail.SwitchCardView = joint.shapes.contrail.FontElementView.extend({
        defaults: joint.util.deepSupplement({
            type: 'contrail.SwitchCardView'
        }, joint.shapes.contrail.FontElementView.prototype.defaults)
    });

    joint.shapes.contrail.RoutingEngine = joint.shapes.contrail.FontElement.extend({
        markup: '<g class="rotatable"><text/><g class="scalable"><rect class="RoutingEngine"/></g></g>',
        defaults: joint.util.deepSupplement({
            type: 'contrail.RoutingEngine'
        }, joint.shapes.contrail.FontElement.prototype.defaults)
    });

    joint.shapes.contrail.RoutingEngineView = joint.shapes.contrail.FontElementView.extend({
        defaults: joint.util.deepSupplement({
            type: 'contrail.RoutingEngineView'
        }, joint.shapes.contrail.FontElementView.prototype.defaults)
    });

    joint.shapes.contrail.PowerModule = joint.shapes.contrail.FontElement.extend({
        markup: '<g class="rotatable"><text/><g class="scalable"><rect class="PowerModule"/></g></g>',
        defaults: joint.util.deepSupplement({
            type: 'contrail.PowerModule'
        }, joint.shapes.contrail.FontElement.prototype.defaults)
    });

    joint.shapes.contrail.PowerModuleView = joint.shapes.contrail.FontElementView.extend({
        defaults: joint.util.deepSupplement({
            type: 'contrail.PowerModuleView'
        }, joint.shapes.contrail.FontElementView.prototype.defaults)
    });

    joint.shapes.contrail.FanModule = joint.shapes.contrail.FontElement.extend({
        markup: '<g class="rotatable"><text/><g class="scalable"><rect class="FanModule"/></g></g>',
        defaults: joint.util.deepSupplement({
            type: 'contrail.FanModule'
        }, joint.shapes.contrail.FontElement.prototype.defaults)
    });

    joint.shapes.contrail.FanModuleView = joint.shapes.contrail.FontElementView.extend({
        defaults: joint.util.deepSupplement({
            type: 'contrail.FanModuleView'
        }, joint.shapes.contrail.FontElementView.prototype.defaults)
    });

    joint.shapes.contrail.PacketForwardingEngine = joint.shapes.contrail.FontElement.extend({
        markup: '<g class="rotatable"><text/><g class="scalable"><rect class="PacketForwardingEngine"/></g></g>',
        defaults: joint.util.deepSupplement({
            type: 'contrail.PacketForwardingEngine'
        }, joint.shapes.contrail.FontElement.prototype.defaults)
    });

    joint.shapes.contrail.PacketForwardingEngineView = joint.shapes.contrail.FontElementView.extend({
        defaults: joint.util.deepSupplement({
            type: 'contrail.PacketForwardingEngineView'
        }, joint.shapes.contrail.FontElementView.prototype.defaults)
    });

    joint.shapes.contrail.CPU = joint.shapes.contrail.FontElement.extend({
        markup: '<g class="rotatable"><text/><g class="scalable"><rect class="CPU"/></g></g>',
        defaults: joint.util.deepSupplement({
            type: 'contrail.CPU'
        }, joint.shapes.contrail.FontElement.prototype.defaults)
    });

    joint.shapes.contrail.CPUView = joint.shapes.contrail.FontElementView.extend({
        defaults: joint.util.deepSupplement({
            type: 'contrail.CPUView'
        }, joint.shapes.contrail.FontElementView.prototype.defaults)
    });
//Chassis components - End

//joint.shapes.contrail.LogicalRouter = joint.shapes.contrail.ImageElement.extend({
//    defaults: joint.util.deepSupplement({
//        type: 'contrail.LogicalRouter'
//    }, joint.shapes.contrail.ImageElement.prototype.defaults)
//});

    joint.shapes.contrail.ZoomedVirtualNetwork = joint.shapes.basic.Rect.extend({
        markup: '<rect/><text/>',
        defaults: joint.util.deepSupplement({
            type: 'contrail.ZoomedElement.VirtualNetwork',
            attrs: {
                rect: {rx: 0, ry: 0, 'stroke-width': 0, stroke: '#EEE', fill: '#FFF'},
                text: {
                    'ref-x': 0.01,
                    'ref-y': 5,
                    'y-alignment': 'top',
                    'x-alignment': 'left',
                    'text-anchor': 'middle',
                    'ref': 'rect',
                    'stroke-width': '0.4px',
                    'stroke': '#333',
                    'fill': '#333'
                }
            }
        }, joint.shapes.basic.Rect.prototype.defaults),
        remove: removeCell
    });

    joint.shapes.contrail.GroupParentElement = joint.shapes.basic.Rect.extend({
        markup: '<rect/><text/>',
        defaults: joint.util.deepSupplement({
            type: 'contrail.GroupParentElement',
            attrs: {
                rect: {rx: 0, ry: 0, 'stroke-width': 0, stroke: '#EEE'},
                text: {
                    'ref-x': 0.01,
                    'ref-y': 5,
                    'y-alignment': 'top',
                    'x-alignment': 'left',
                    'text-anchor': 'middle',
                    'ref': 'rect',
                    'stroke-width': '0.4px',
                    'stroke': '#333',
                    'fill': '#333'
                }
            }
        }, joint.shapes.basic.Rect.prototype.defaults),
        remove: removeCell
    });

    joint.shapes.contrail.LinkView = joint.dia.LinkView.extend({
        // Overriding mouse events to doing nothing
        startListening: function () {
        }
    });

    joint.shapes.contrail.Link = function (options) {
        var defaultLinkConfig = {
                markup: [
                    '<path class="connection"></path>',
                    '<path class="marker-source"/>',
                    '<path class="marker-target"/>',
                    '<path class="connection-wrap"/>'
                ].join(''),
                smooth: true,
                attrs: {
                    '.connection': {
                        'stroke': '#333'
                    },
                    '.marker-source': {
                        fill: '#333',
                        stroke: '#333'
                    },
                    '.marker-target': {
                        fill: '#333',
                        stroke: '#333'
                    },
                    '.connection-wrap': {
                        fill: '#333',
                        stroke: '#333'
                    }
                }
            },
            linkConfig = contrail.checkIfExist(options.linkConfig) ? options.linkConfig : {
                source: {id: options.sourceId},
                target: {id: options.targetId},
                linkDetails: options.linkDetails,
                elementType: options.elementType
            };

        /*
         TODO - Need to remove linkType and pass the linkConfig which gets extended further
         */
        if (options['linkType'] == 'pr-pr' || options['linkType'] == 'vr-vr' ||
            options['linkType'] == 'pr-vr' || options['linkType'] == 'vr-pr' ||
            options['linkType'] == 'vr-vm' || options['linkType'] == 'vm-vr' ||
            options['linkType'] == 'vr-vn' || options['linkType'] == 'vn-vr' ||
            options['linkType'] == 'vm-vm' || options['linkType'] == 'vn-vn' ||
            options['linkType'] == 'vm-vn' || options['linkType'] == 'vn-vm' ||
            options['linkType'] == 'lc-lc' || options['linkType'] == 'pfe-lc' ||
            options['linkType'] == 'pfe-pfe') {

            var connectionStroke = options['linkDetails']['connectionStroke'];
            try {
                linkConfig['attrs']['.connection']['stroke'] = connectionStroke != null ? connectionStroke : '#e80015';
                linkConfig['attrs']['.connection']['stroke-width'] = 2;
            } catch (error) {
                ///continue;
            }
        } else {
            //TODO - Check if this is needed
            //linkConfig['attrs']['.marker-target'] = {d: 'M 6 0 L 0 3 L 6 6 z'};
        }

        return new joint.dia.Link($.extend(true, {}, defaultLinkConfig, linkConfig));
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

    function removeCell(options) {
        var collection = this.collection;
        if (collection) {
            collection.trigger('batch:start');
        }
        // First, unembed this cell from its parent cell if there is one.
        var parentCellId = this.get('parent');
        if (parentCellId) {

            var parentCell = this.collection && this.collection.get(parentCellId);
            if (parentCell)
                parentCell.unembed(this);
        }
        _.invoke(this.getEmbeddedCells(), 'remove', options);
        this.trigger('remove', this, this.collection, options);
        if (collection) {
            collection.trigger('batch:stop');
        }
    };
    window.removeCell = removeCell;

    return joint;
});
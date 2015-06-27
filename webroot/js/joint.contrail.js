/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

joint = $.extend(true, joint, {shapes: {contrail: {}}, layout: {contrail: {}}});

var IMAGE_MAP = {
    'physical-router': 'prouter',
    'virtual-router': 'vrouter',
    'virtual-network': 'vpn',
    'network-policy': 'policy',
    'service-instance-l2': 'l2',
    'service-instance-analyzer': 'analyzer',
    'service-instance-firewall': 'firewall',
    'service-instance-nat': 'nat',
    'service-instance-lb': 'lb',
    'service-instance': 'nat',
    'security-group': 'sg',
    'floating-ip': 'fip',
    'network-ipam': 'ipam',
    'router': 'router',
    'virtual-machine': 'vm'
};

var GRAPH_MARGIN = 35;

var tooltipConfig = {
    PhysicalRouter: {
        title: function (element, jointConfig) {
            return 'Physical Router';
        },
        content: function (element, jointConfig) {
            var viewElement = jointConfig.connectedGraph.getCell(element.attr('model-id')),
                tooltipContent = contrail.getTemplate4Id('prouter-tooltip-content-template');

            return tooltipContent([{lbl: 'Name', value: viewElement.attributes.prouterDetails['name']},
                {lbl: 'Links', value: viewElement.attributes.prouterDetails.connected_prouters}]);

        }
    },
    VirtualRouter: {
        title: function (element, jointConfig) {
            return 'Virtual Router';
        },
        content: function (element, jointConfig) {
            var viewElement = jointConfig.connectedGraph.getCell(element.attr('model-id')),
                tooltipContent = contrail.getTemplate4Id('vrouter-tooltip-content-template');

            return tooltipContent([{lbl: 'Name', value: viewElement.attributes.vrouterDetails['name']},
                {lbl: 'Links', value: viewElement.attributes.vrouterDetails.connected_vrouters}]);

        }
    },
    //TODO Cleanup this if not needed
    link: {
        title: function (element, jointConfig) {
            return 'Traffic Details';
        },
        content: function (element, jointConfig) {
            var viewElement = jointConfig.connectedGraph.getCell(element.attr('model-id')),
                tooltipContent = contrail.getTemplate4Id('tooltip-content-template'),
                viewElementDetails = viewElement.attributes.linkDetails;

            var data = [],
                partial_msg = "";
            if (viewElementDetails.error == 'Other link marked as unidirectional, attach policy' || viewElementDetails.error == "Other link marked as bidirectional, attach policy")
                partial_msg = "Link partially connected";
            if (viewElementDetails.more_attributes != undefined && viewElementDetails.more_attributes.in_stats != undefined
                && viewElementDetails.more_attributes.out_stats != undefined && viewElementDetails.more_attributes.out_stats.length > 0
                && viewElementDetails.more_attributes.in_stats.length > 0) {
                var in_stats = viewElementDetails.more_attributes.in_stats;
                var out_stats = viewElementDetails.more_attributes.out_stats;
                var src = viewElementDetails.src;
                var dst = viewElementDetails.dst;
                var loss = viewElementDetails.loss;
                /*if(loss.diff && loss.loss_percent>0) commented the percentage loss code for while
                 data.push({lbl:"Link",value:"Packet Loss % "+loss.loss_percent});
                 else*/
                if (partial_msg != "")
                    data.push({lbl: "", value: partial_msg});
                for (var i = 0; i < in_stats.length; i++) {
                    if (src == in_stats[i].src && dst == in_stats[i].dst) {
                        data.push({
                            lbl: "Link",
                            value: in_stats[i].src.split(':').pop() + " --- " + in_stats[i].dst.split(':').pop()
                        });
                        data.push({
                            lbl: "In",
                            value: formatNumberByCommas(in_stats[i].pkts) + " packets / " + formatBytes(in_stats[i].bytes)
                        });
                        for (var j = 0; j < out_stats.length; j++) {
                            if (src == out_stats[j].src && dst == out_stats[j].dst) {
                                data.push({
                                    lbl: "Out",
                                    value: formatNumberByCommas(out_stats[j].pkts) + " packets / " + formatBytes(out_stats[i].bytes)
                                });
                            }
                        }
                    } else if (src == in_stats[i].dst && dst == in_stats[i].src) {
                        data.push({
                            lbl: "Link",
                            value: in_stats[i].src.split(':').pop() + " --- " + in_stats[i].dst.split(':').pop(),
                            dividerClass: 'margin-5-0-0'
                        });
                        data.push({
                            lbl: "In",
                            value: formatNumberByCommas(in_stats[i].pkts) + " packets / " + formatBytes(in_stats[i].bytes)
                        });
                        for (var j = 0; j < out_stats.length; j++) {
                            if (src == out_stats[j].dst && dst == out_stats[j].src) {
                                data.push({
                                    lbl: "Out",
                                    value: formatNumberByCommas(out_stats[j].pkts) + " packets / " + formatBytes(out_stats[i].bytes)
                                });
                            }
                        }
                    }
                }
            } else if (viewElementDetails.more_attributes == undefined || viewElementDetails.more_attributes.in_stats == undefined
                || viewElementDetails.more_attributes.out_stats == undefined) {
                var src = viewElementDetails.src.split(':').pop();
                var dst = viewElementDetails.dst.split(':').pop();
                if (partial_msg != "")
                    data.push({lbl: "", value: partial_msg});

                data.push({lbl: "Link", value: src + " --- " + dst});
                data.push({lbl: "In", value: "0 packets / 0 B"});
                data.push({lbl: "Out", value: "0 packets / 0 B"});

                if (viewElementDetails.dir == 'bi') {
                    data.push({lbl: "Link", value: dst + " --- " + src, dividerClass: 'margin-5-0-0'});
                    data.push({lbl: "In", value: "0 packets / 0 B"});
                    data.push({lbl: "Out", value: "0 packets / 0 B"});
                }
            } else if (viewElementDetails.more_attributes != undefined && viewElementDetails.more_attributes.in_stats != undefined
                && viewElementDetails.more_attributes.out_stats != undefined && viewElementDetails.more_attributes.in_stats.length == 0
                && viewElementDetails.more_attributes.out_stats.length == 0) {
                var src = viewElementDetails.src.split(':').pop();
                var dst = viewElementDetails.dst.split(':').pop();
                if (partial_msg != "")
                    data.push({lbl: "", value: partial_msg});

                data.push({lbl: "Link", value: src + " --- " + dst});
                data.push({lbl: "In", value: "0 packets / 0 B"});
                data.push({lbl: "Out", value: "0 packets / 0 B"});

                if (viewElementDetails.dir == 'bi') {
                    data.push({lbl: "Link", value: dst + " --- " + src, dividerClass: 'margin-5-0-0'});
                    data.push({lbl: "In", value: "0 packets / 0 B"});
                    data.push({lbl: "Out", value: "0 packets / 0 B"});
                }
            }

            return tooltipContent(data);
        }
    }
};

function ContrailElement(type, options) {
    var contrailElement;
    switch (type) {
        case 'physical-router':
            contrailElement = new joint.shapes.contrail.PhysicalRouter(options);
            break;
        case 'virtual-router':
            contrailElement = new joint.shapes.contrail.VirtualRouter(options);
            break;
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
        case 'router':
            contrailElement = new joint.shapes.contrail.LogicalRouter(options);
            break;
        case 'collection-element':
            contrailElement = new joint.shapes.contrail.CollectionElement(options);
            break;
        case 'virtual-machine':
            contrailElement = new joint.shapes.contrail.VirtualMachine(options);
            break;

        case 'chassis':
            contrailElement = new joint.shapes.contrail.Chassis(options);
            break;
        case 'line-card':
            contrailElement = new joint.shapes.contrail.LineCard(options);
            break;
        case 'switch-card':
            contrailElement = new joint.shapes.contrail.SwitchCard(options);
            break;
        case 'routing-engine':
            contrailElement = new joint.shapes.contrail.RoutingEngine(options);
            break;
        case 'power-module':
            contrailElement = new joint.shapes.contrail.PowerModule(options);
            break;
        case 'fan-module':
            contrailElement = new joint.shapes.contrail.FanModule(options);
            break;
        case 'packet-forwarding-engine':
            contrailElement = new joint.shapes.contrail.PacketForwardingEngine(options);
            break;
        case 'cpu':
            contrailElement = new joint.shapes.contrail.CPU(options);
            break;

        case 'link':
            contrailElement = new joint.shapes.contrail.Link(options);
            break;

        default:
            contrailElement = new joint.shapes.contrail.Element(options);
    }
    return contrailElement;
}

function getImageName(node) {
    var nodeStatus = node['status'],
        serviceType = node['service_type'],
        nodeType = node['node_type'],
        imageName;

    nodeType = (serviceType != null) ? (nodeType + '-' + serviceType) : nodeType;
    imageName = IMAGE_MAP[nodeType];

    if (imageName == null) {
        imageName = 'opencontrail-icon.png';
    } else if (nodeStatus == 'Deleted') {
        imageName += '-deleted.png';
    } else {
        imageName += '.png';
    }
    return imageName;
};

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
        type: 'contrail.VirtualMachine.no-drag-element'
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
        type: 'contrail.NetworkPolicy'
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
        type: 'contrail.SecurityGroup'
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
        type: 'contrail.NetworkIPAM'
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

joint.shapes.contrail.ZoomedCloudElement = joint.shapes.basic.Rect.extend({
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

joint.shapes.contrail.ZoomedElement = joint.shapes.basic.Rect.extend({
    markup: '<rect/><text/>',

    defaults: joint.util.deepSupplement({
        type: 'contrail.ZoomedElement',
        attrs: {
            rect: {fill: 'url(#dotted)'},
            text: {
                'ref-x': 0.01,
                'ref-y': 5,
                'y-alignment': 'top',
                'x-alignment': 'left',
                'text-anchor': 'left',
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
    var linkConfig = {
        markup: [
            '<path class="connection"></path>',
            '<path class="marker-source" fill="#333" stroke="#333" />',
            '<path class="marker-target" fill="#333" stroke="#333" />',
            '<path class="connection-wrap" fill="#333" stroke="#333" />'
        ].join(''),
        source: {id: options.sourceId},
        target: {id: options.targetId},
        smooth: true,
        attrs: {
            '.connection': {
                'stroke': '#333'
            },
            '.connection-wrap': {
                'stroke': '#333'
            }
        },
        linkDetails: options.linkDetails,
        elementType: options.elementType
    }, link;
    var connectionStroke = linkConfig['linkDetails']['connectionStroke'];
    var markerTargetStroke = linkConfig['linkDetails']['markerTargetStroke'];
    var markerSourceStroke = linkConfig['linkDetails']['markerSourceStroke'];
    if (options['linkType'] == 'bi') {
        if (options.direction == 'bi') {
            linkConfig['attrs']['.marker-source'] = {fill: '#333', d: 'M 6 0 L 0 3 L 6 6 z'};
            linkConfig['attrs']['.marker-target'] = {fill: '#333', d: 'M 6 0 L 0 3 L 6 6 z'};
        } else if (options.direction == 'uni') {
            linkConfig['attrs']['.marker-target'] = {
                fill: '#e80015', stroke: markerTargetStroke != null ? markerTargetStroke : '#e80015',
                d: 'M 6 0 L 0 3 L 6 6 z'
            };
            linkConfig['attrs']['.connection']['stroke'] = '#e80015';
            linkConfig['attrs']['.connection']['stroke-width'] = 1;
            linkConfig['attrs']['.connection']['stroke-dasharray'] = '4 4';
        }
    } else if (options['linkType'] == 'pr-pr' || options['linkType'] == 'vr-vr' ||
        options['linkType'] == 'pr-vr' || options['linkType'] == 'vr-pr' ||
        options['linkType'] == 'vr-vm' || options['linkType'] == 'vm-vr' ||
        options['linkType'] == 'vr-vn' || options['linkType'] == 'vn-vr' ||
        options['linkType'] == 'vm-vm' || options['linkType'] == 'vn-vn' ||
        options['linkType'] == 'vm-vn' || options['linkType'] == 'vn-vm') {
        linkConfig['attrs']['.connection']['stroke'] = connectionStroke != null ? connectionStroke : '#e80015';
        linkConfig['attrs']['.connection']['stroke-width'] = 2;
    } else {
        linkConfig['attrs']['.marker-target'] = {fill: '#333', d: 'M 6 0 L 0 3 L 6 6 z'};
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

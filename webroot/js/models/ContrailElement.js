/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var ContrailElement = function(type, options) {
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

    return ContrailElement;
});
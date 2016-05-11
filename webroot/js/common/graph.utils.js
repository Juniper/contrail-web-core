/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {

    var GraphUtils = function () {
        var self = this;

        self.getImageName = function(node) {
            var nodeStatus = node['status'],
                serviceType = node['service_type'],
                nodeType = node['node_type'],
                imageName;

            nodeType = (serviceType != null) ? (nodeType + '-' + serviceType) : nodeType;
            imageName = cowc.GRAPH_IMAGE_MAP[nodeType];

            if (imageName == null) {
                imageName = 'opencontrail-icon.png';
            } else if (nodeStatus == 'Deleted') {
                imageName += '-deleted.png';
            } else {
                imageName += '.png';
            }
            return imageName;
        };
    };

    return GraphUtils;
});

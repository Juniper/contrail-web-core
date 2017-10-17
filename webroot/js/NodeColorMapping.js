/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(
       [ 'underscore' ],
       function(_) {
		var lastUpdated;
		var regionList = [];    
		var NodeColorMapping = {
                getNodeColorMap: function (hostNames, resetColor, type) {
                    var nodeColorMap = {},
                        lastUpdated;
                    var region = contrail.getCookie('region');
                    if(region == null) {
                        region = "####Default";
                    }
                    if (regionList[region] == null) {
                        regionList[region] = {
                            nodeColorMap:{}
                        }
                    };
                    if(regionList[region]['nodeColorMap'][type] == null)
                        regionList[region]['nodeColorMap'][type] = {};
                    var self = this,
                        colors = cowc.FIVE_NODE_COLOR,
                        assignedColors = _.values(regionList[region]['nodeColorMap'][type]);
                    if (!$.isArray(hostNames)) {
                        hostNames = [hostNames];
                    }
                    // when the reset flag is not there we will match the colors from
                    // node color map with the colors variable and if there is no match
                    // which says colors are reset, then the flag reset need to be set true.
                    if (window.colorSettingsUpdated > lastUpdated) {
                        resetColor = true;
                    }
                    lastUpdated = _.now();
                    // resetColor flag indicates there is change in
                    // color settings then we need to overwrite the existing
                    // colors in nodecolormap
                    if (resetColor) {
                        var existingNodes = _.keys(regionList[region].nodeColorMap[type]),
                            existingNodesLen = existingNodes.length;
                        //TODO overwrite the colors with the cookie colors
                        colors = cowc.FIVE_NODE_COLOR;
                        for (var i = 0; i < existingNodesLen; i++) {
							regionList[region].nodeColorMap[type][existingNodes[i]] = cowu.ifNull(colors[i], cowc.DEFAULT_COLOR);
                        }
                    }
                    //if hostname doesn't exists in nodeColorMap
                    keys = _.unique(hostNames);
                    keys = _.without(keys, 'DEFAULT');
                    //keys = _.sortBy(keys);
                    var i = 0, unassignedColors = _.difference(colors, assignedColors);
                    $.each(keys, function (idx, obj) {
                        if (regionList[region].nodeColorMap[type][obj] == null) {
                        	regionList[region].nodeColorMap[type][obj] = unassignedColors[i] != null ? unassignedColors[i]:
                                ($.isArray(cowc.DEFAULT_COLOR) ? cowc.DEFAULT_COLOR[0] : cowc.DEFAULT_COLOR);
                            i++;
                        }
                    });
					return regionList[region].nodeColorMap[type];
                }
            };
            return NodeColorMapping;
});

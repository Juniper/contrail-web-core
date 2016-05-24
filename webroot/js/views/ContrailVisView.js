/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([ 'underscore', 'contrail-view', 'vis'],
    function (_, ContrailView, vis) {
    var ContrailVisView = ContrailView.extend({
        defaultVisOptions: {},
        network: null,
        caller: null,
        nodesDataSet: new vis.DataSet([]),
        edgesDataSet: new vis.DataSet([]),
        render: function (viewConfig) {
            var self = this,
                viewConfig = self.attributes.viewConfig,
                elId = viewConfig.elementId,
                container = document.getElementById(elId),
                visOptions = viewConfig.visOptions ? viewConfig.visOptions :
                self.defaultVisOptions;
            self.caller = viewConfig.caller;
            self.initNetwork(container, visOptions);

            if(viewConfig.hasOwnProperty("events")) {
                self.initEvents(viewConfig["events"]);
            }
            if(viewConfig.hasOwnProperty("navigations")) {
                self.initNavigations(viewConfig["navigations"]);
            }
            if(viewConfig.hasOwnProperty("model")) {
                self.setData(viewConfig["model"], visOptions);
            }
        },
        initNetwork: function(container, options) {
            var self = this;
            self.network = new vis.Network(container, {
                nodes: [],
                edges: []
            }, options);
        },
        initEvents: function(events) {
            var self = this;
            $.each(events, function(key, value) {
                if(typeof value === "function") {
                    self.network.on(key, function(params){
                        events[key](params, self);
                    });
                }
            });
        },
        initNavigations: function(navigations) {
            var self = this;
            //ZoomIn, ZoomOut, ZoomReset are always set.
            //The parameter 'navigations' adds additional
            //options to the graph.
            _.each(navigations, function(value, key, obj){
                if(obj && key && obj[key]) {
                    var div = $("<div/>");
                    if(obj[key].hasOwnProperty("id")) {
                        $(div).attr("id", obj[key]["id"]);
                    } else {
                        $(div).attr("id", key);
                    }
                    if(obj[key].hasOwnProperty("style")) {
                        $(div).attr("style", obj[key]["style"]);
                    }
                    if(obj[key].hasOwnProperty("title")) {
                        $(div).attr("title", obj[key]["title"]);
                    }
                    if(obj[key].hasOwnProperty("click")) {
                        $(div).on("click", function(params) {
                            obj[key]["click"](params);
                        });
                    }
                    if(obj[key].hasOwnProperty("class")) {
                        $(div).append($("<i class='" + obj[key]["class"] + "' />"));
                    }
                    $('.vis-navigation').append(div);
                }
            });
            $(".vis-button.vis-zoomIn").attr('title', 'Zoom In');
            $(".vis-button.vis-zoomOut").attr('title', 'Zoom Out');
            $(".vis-button.vis-zoomExtends").attr('title', 'Zoom Reset');
        },
        getNetwork: function() {
            var self = this;
            return self.network;
        },
        setOptions: function(options) {
            var self = this;
            if(options) {
                self.network.setOptions(options);
            }
        },
        getNode: function(id) {
            var self = this;
            if(id) {
                return self.nodesDataSet.get(id);
            }
        },
        getNodeIds: function() {
            var self = this;
            return self.nodesDataSet.getIds();
        },
        add: function(elements, isUpdate, isNode) {
            var self = this,
                arrElements = [],
                modifiedElements = [];
            if(elements) {
                if(!elements.hasOwnProperty("length")) {
                    arrElements.push(elements);
                } else {
                    arrElements = elements;
                }
                _.each(arrElements, function(arrElement) {
                    var elementAttr = arrElement.attributes.model().attributes;
                    if(!elementAttr.hasOwnProperty("id") &&
                        elementAttr.hasOwnProperty("element_id") &&
                        isUpdate !== true) {
                        elementAttr.id = elementAttr.element_id;
                    }
                    elementAttr.model = arrElement;
                    modifiedElements.push(elementAttr);
                });
                if(modifiedElements && modifiedElements.length > 0) {
                    if(isUpdate == true) {
                        if(isNode == false)
                            self.edgesDataSet.update(modifiedElements);
                        else
                            self.nodesDataSet.update(modifiedElements);
                    } else {
                        if(isNode == false)
                            self.edgesDataSet.add(modifiedElements);
                        else
                            self.nodesDataSet.add(modifiedElements);
                    }
                }
            }
        },
        addNode: function(nodes, isUpdate) {
            var self = this;
            self.add(nodes, isUpdate, true)
        },
        updateNode: function(nodes) {
            var self = this;
            self.addNode(nodes, true);
        },
        removeNode: function(ids) {
            var self = this;
            if(ids) {
                self.nodesDataSet.remove(ids);
            }
        },
        getEdge: function(id) {
            var self = this;
            if(id) {
                return self.edgesDataSet.get(id);
            }
        },
        getEdgeIds: function() {
            var self = this;
            return self.edgesDataSet.getIds();
        },
        addEdge: function(edges, isUpdate) {
            var self = this;
            self.add(edges, isUpdate, false);
        },
        updateEdge: function(edges) {
            var self = this;
            self.addEdge(edges, true);
        },
        removeEdge: function(ids) {
            var self = this;
            if(ids) {
                self.edgesDataSet.remove(ids);
            }
        },
        setData: function(data, options) {
            var self = this;

            if(options) {
                self.setOptions(options);
            }
            if(data) {
                self.network.setData(data);
            } else {
                self.network.setData({
                    nodes: self.nodesDataSet,
                    edges: self.edgesDataSet
                });
            }
        },
        getData: function() {
            var self = this;
            var nodeIds = self.nodesDataSet.getIds();
            var nodes = [];
            var edgeIds = self.edgesDataSet.getIds();
            var edges = [];
            _.each(nodeIds, function(id, idx) {
                nodes.push(self.nodesDataSet.get(id))
            });
            _.each(edgeIds, function(id, idx) {
                edges.push(self.edgesDataSet.get(id))
            });
            return {
                nodes: nodes,
                edges: edges
            };
        },
        findNode: function(id) {
            var self = this;
            return self.network.findNode(id);
        }
    });
    return ContrailVisView;
});
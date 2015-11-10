/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'contrail-list-model'
], function(_,Backbone,ContrailListModel) {

     function NodeListModel() {
        if(NodeListModel.prototype.singletonInstance != null) {
            return NodeListModel.prototype.singletonInstance;
        } else {
            var self = this;
            NodeListModel.prototype.singletonInstance = self;

            self.nodeListModels = [];
            self.addListModel = function(listModel) {
                self.nodeListModels.push(listModel);
                listModel.onDataUpdate.subscribe(function() {
                    updateNodeListModel();
                });
            }

            self.nodeListModel =  new ContrailListModel({data:[]});
            self.alertListModel = new ContrailListModel({data:[]});
            self.reset = function() {
                self.nodeListModels = [];
            }
            self.getNodeListModel = function() {
                return self.nodeListModel;
            }
            self.getAlertListModel = function() {
                return self.alertListModel
            }

            function updateNodeListModel() {
                self.nodeListModel.setData([]);
                self.alertListModel.setData([]);
                //Loop through listModels and concatenate the records
                $.each(self.nodeListModels,function(idx,obj) {
                    var currModel = obj;
                    self.nodeListModel.addData(currModel.getItems());
                    var alerts = $.map(currModel.getItems(),function(obj,idx) {
                        return obj['alerts'];
                    });
                    alerts = flattenList(alerts);
                    alerts = _.filter(alerts,function(currAlertObj) {
                        return currAlertObj['detailAlert'] != false
                    });
                    self.alertListModel.addData(alerts);
                });
            }
        }
    };
    return NodeListModel;
});

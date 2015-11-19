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
            var timer;
            self.addListModel = function(listModel) {
                self.nodeListModels.push(listModel);
                listModel.onDataUpdate.subscribe(function() {
                    //Throttle updateNodeListModel calls
                    if(timer) {
                        clearTimeout(timer);
                    }
                    timer = setTimeout(updateNodeListModel,300);
                });
            }

            self.nodeListModel =  new ContrailListModel({data:[]});
            //Add globalAlerts if any
            self.alertListModel = new ContrailListModel({data:globalAlerts});
            self.reset = function() {
                clearTimeout(timer);
                self.nodeListModels = [];
            }
            self.getNodeListModel = function() {
                return self.nodeListModel;
            }
            self.getAlertListModel = function() {
                return self.alertListModel
            }

            function setId4Idx(data, dis) {
                var offset = dis._idOffset;
                // Setting id for each data-item; Required to instantiate data-view.
                if (data != null && data.length > 0) {
                    $.each(data, function (key, val) {
                        if (!contrail.checkIfExist(val.cgrid)) {
                            data[key].cgrid = 'id_' + (key + offset);
                        }
                    });
                    dis._idOffset += data.length;
                }
            };

            function updateNodeListModel() {
                self.nodeListModel.beginUpdate();
                self.alertListModel.beginUpdate();
                self.nodeListModel.setItems([]);
                self.alertListModel.setItems([]);
                setId4Idx(globalAlerts,self.alertListModel);
                for(var i=0,len=globalAlerts.length;i<len;i++) {
                    self.alertListModel.addItem(globalAlerts[i]);
                }
                //Loop through listModels and concatenate the records
                $.each(self.nodeListModels,function(idx,obj) {
                    var currModel = obj;
                    var currItems = currModel.getItems();
                    setId4Idx(currItems,self.nodeListModel);
                    for(var i=0,len=currItems.length;i<len;i++) {
                        self.nodeListModel.addItem(currItems[i]);
                    }
                    var alerts = $.map(currModel.getItems(),function(obj,idx) {
                        return obj['alerts'];
                    });
                    alerts = flattenList(alerts);
                    alerts = _.filter(alerts,function(currAlertObj) {
                        return currAlertObj['detailAlert'] != false
                    });
                    setId4Idx(alerts,self.alertListModel);
                    for(var i=0,len=alerts.length;i<len;i++) {
                        self.alertListModel.addItem(alerts[i]);
                    }
                });
                self.nodeListModel.endUpdate();
                self.alertListModel.endUpdate();
            }
        }
    };
    return NodeListModel;
});

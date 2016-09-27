/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    "lodash",
    "backbone",
    "contrail-list-model"
], function(_, Backbone, ContrailListModel) {
    var ContrailListModelGroup = Backbone.Model.extend({

        constructor: function(modelConfig) {
            var self = this;
            $.extend(true, self.modelConfig, modelConfig, { childModelConfig: [] });
            self.data = [];
            self.error = false;
            self.errorList = [];
            self.childModelObjs = [];
            self.onAllRequestsCompleteCB = [];
            // TODO: consider to use the robust deferrable library --- bluebird
            self.initDefObj = $.Deferred(); // eslint-disable-line
            self.primaryListModel = new ContrailListModel({ data: self.getItems() });

            /* eslint-disable */
            self.onAllRequestsComplete = new Slick.Event();
            self.onDataUpdate = new Slick.Event();
            /* eslint-enable */

            //Default subscription to update the dataView.
            self.onAllRequestsComplete.subscribe(function() {
                self.primaryListModel.setData(self.getItems());
                if (self.error) {
                    self.primaryListModel.error = true;
                    self.primaryListModel.errorList.concat(self.errorList);
                }
                self.primaryListModel.onAllRequestsComplete.notify();
            });

            self.onDataUpdate.subscribe(function() {
                self.primaryListModel.setData(self.data);
                self.primaryListModel.onDataUpdate.notify();
            });

            //we should listen to primaryListModel data update
            self.primaryListModel.onDataUpdate.subscribe(function() {

            });

            if (self.modelConfig.childModelConfig.length !== 0) {
                self.initChildModels(self.modelConfig.childModelConfig);
            }
        },

        initChildModels: function(listModelConfigArray) {
            var self = this,
                defObjArray = [];
            self.modelConfig.childModelConfig = listModelConfigArray;
            self.createAllChildModels(self.modelConfig.childModelConfig, self.updateData);
            _.forEach(self.childModelObjs, function(childModel) {
                defObjArray.push(childModel.status);
            });
            self.childModelDefObjs = defObjArray;
            $.when.apply(null, self.childModelDefObjs).done(function() {
                self.onAllRequestsComplete.notify();
            });
        },

        isRequestInProgress: function() {
            var self = this,
                inProgress = false;
            _.forEach(self.childModelObjs, function(childModel) {
                if (childModel.status.state() === "pending" && !inProgress) {
                    inProgress = true;
                }
            });
            return inProgress;
        },

        getItems: function() {
            var self = this,
                items = [];

            _.forEach(self.childModelObjs, function(childModelObj, idx) {
                items.push({
                    cgrid: "id_" + idx,
                    key: childModelObj.modelConfig.id,
                    values: childModelObj.model.getItems()
                });
            });

            if (self.data.length === 0) {
                self.data = items;
            }

            if (contrail.checkIfExist(self.modelConfig.parseFn)) {
                return self.modelConfig.parseFn(items);
            }

            return items;
        },

        setData: function(data) {
            var self = this;
            self.data = data;
            self.onDataUpdate.notify();
        },

        updateData: function(data) {
            var self = this;
            _.forEach(self.data, function(item) {
                if(item.key === data.key) {
                    item.values = data.values;
                    self.onDataUpdate.notify();
                }
            });
        },

        errorHandler: function(errorObj) {
            var self = this;
            self.error = true;
            self.errorList.concat(errorObj.errorList);
        },

        createChildModelObj: function(listModelConfig, updateDataCB, errorHandler) {
            var status = $.Deferred(), // eslint-disable-line
                model = new ContrailListModel(listModelConfig);

            model.onAllRequestsComplete.subscribe(function() {
                status.resolve(listModelConfig.id);

                if (model.error) {
                    errorHandler({
                        key: listModelConfig.id,
                        errorList: model.errorList
                    });
                }
            });

            model.onDataUpdate.subscribe(function() {
                return updateDataCB({
                    key: listModelConfig.id,
                    values: model.getItems()
                });
            });

            return {
                modelConfig: listModelConfig,
                model: model,
                status: status.promise()
            };
        },

        createAllChildModels: function(listModelConfigArray, updateDataFn, errorHandler) {
            var self = this,
                childModelCollection = [];

            _.forEach(listModelConfigArray, function(listModelConfig) {
                childModelCollection.push(self.createChildModelObj(listModelConfig, updateDataFn, errorHandler));
            });
            self.childModelObjs = childModelCollection;
        }
    });

    return ContrailListModelGroup;
});

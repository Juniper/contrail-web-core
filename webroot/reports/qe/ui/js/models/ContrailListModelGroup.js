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
            var inProgress = false;

            _.forEach(this.childModelObjs, function(childModel) {
                if (childModel.status.state() === "pending" && !inProgress) {
                    inProgress = true;
                }
            });

            return inProgress;
        },

        getItems: function() {
            var items = [];

            _.forEach(this.childModelObjs, function(childModelObj, idx) {
                items.push({
                    cgrid: "id_" + idx,
                    key: childModelObj.modelConfig.id,
                    values: childModelObj.model.getItems()
                });
            });

            if (this.data.length === 0) {
                this.data = items;
            }

            if (contrail.checkIfExist(this.modelConfig.parseFn)) {
                return this.modelConfig.parseFn(items);
            }

            return items;
        },

        setData: function(data) {
            this.data = data;
            this.onDataUpdate.notify();
        },

        updateData: function(data) {
            _.forEach(this.data, function(item) {
                if(item.key === data.key) {
                    item.values = data.values;
                    this.onDataUpdate.notify();
                }
            }, this);
        },

        errorHandler: function(errorObj) {
            this.error = true;
            this.errorList.concat(errorObj.errorList);
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
            var childModelCollection = [];

            _.forEach(listModelConfigArray, function(listModelConfig) {
                childModelCollection.push(this.createChildModelObj(listModelConfig, updateDataFn, errorHandler));
            }, this);
            this.childModelObjs = childModelCollection;
        }
    });

    return ContrailListModelGroup;
});

/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'knockout',
    'contrail-model'
], function (_, Backbone, Knockout, ContrailModel) {
    var JsonModel = ContrailModel.extend({

        defaultConfig: smwmc.getJSONModel(),
        
        configure: function (checkedRows, callbackObj, type) {
                        var ajaxConfig = {};
                        var putData = {},
                            attributes = this.model().attributes;
                        putData[type] = [attributes];

                        ajaxConfig.type = "PUT";
                        ajaxConfig.data = JSON.stringify(putData);
                        ajaxConfig.url = smwu.getObjectUrl(type);

                        contrail.ajaxHandler(ajaxConfig, function () {
                            if (contrail.checkIfFunction(callbackObj.init)) {
                                callbackObj.init();
                            }
                        }, function (response) {
                            callbackObj.success();
                            if (contrail.checkIfFunction(callbackObj.success)) {
                                callbackObj.success();
                            }
                        }, function (error) {
                            if (contrail.checkIfFunction(callbackObj.error)) {
                                callbackObj.error(error);
                            }
                        });
            }
        });

    return JsonModel;
});

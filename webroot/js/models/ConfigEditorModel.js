/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var self;
    var configEditorModel = ContrailModel.extend({
        defaultConfig: {},

        addEditConfigData: function (data, reqUrl, isEdit, callbackObj) {
            var ajaxConfig = {}, returnFlag = false;
            var postData = { data : [{ data : data, reqUrl: reqUrl}]};

            var self  = this;
            ajaxConfig.async = false;
            ajaxConfig.type  = 'POST';
            ajaxConfig.data  = JSON.stringify(postData);
            ajaxConfig.url   =  (isEdit)? ctwc.URL_UPDATE_CONFIG_OBJECT :
                                    ctwc.URL_CREATE_CONFIG_OBJECT;


            contrail.ajaxHandler(ajaxConfig, function () {
                if (contrail.checkIfFunction(callbackObj.init)) {
                    callbackObj.init();
                }
            }, function (response) {
                if (contrail.checkIfFunction(callbackObj.success)) {
                    callbackObj.success();
                }
                returnFlag = true;
            }, function (error) {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(error);
                }
                returnFlag = false;
            });

            return returnFlag;
        }
    });
    return configEditorModel;
});


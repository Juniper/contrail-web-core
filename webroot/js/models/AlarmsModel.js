/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model',
], function (_, ContrailModel) {

    var alarmsModel = ContrailModel.extend({
        ackAlarms: function (checkedRows, callbackObj) {
            var ajaxConfig = {};
            var alarmsList = [];

            $.each(checkedRows, function (checkedRowsKey, checkedRowsValue) {
                alarmsList.push({"table":checkedRowsValue.table,
                    "name":checkedRowsValue.name,
                    "type":checkedRowsValue.type,
                    "token":checkedRowsValue.token});
            });

            ajaxConfig.type = "POST";
            ajaxConfig.data = JSON.stringify(alarmsList);

            ajaxConfig.url = '/api/tenant/monitoring/ackalarms';
            contrail.ajaxHandler(ajaxConfig, function () {
                if (contrail.checkIfFunction(callbackObj.init)) {
                    callbackObj.init();
                }
            }, function (response) {
                if (contrail.checkIfFunction(callbackObj.success)) {
                    callbackObj.success();
                }
            }, function (error) {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(error);
                }
            });
        },
    });

    return alarmsModel;
});
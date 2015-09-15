/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var LoginWindowModel = ContrailModel.extend({
        defaultConfig: {
            'user_name': "",
            'password': ''
        },
        validations: {
            loginValidations: {
                'user_name': {
                    required: true,
                    msg: 'Enter User Name'
                },
                'password': {
                    required: true,
                }
            }
        },
        doLogin: function (data, callbackObj) {
            var ajaxConfig = {}, returnFlag = false;

            if (this.model().isValid(true, "llsConfigValidations")) {
                var locks = this.model().attributes.locks.attributes;
                var loginData = this.model().attributes;
                var putData = {"username": loginData.user_name,"password":loginData.password};
                ajaxConfig = {};
                ajaxConfig.async = false;
                ajaxConfig.type = "POST";
                ajaxConfig.data = JSON.stringify(putData);
                ajaxConfig.dataType = "text";
                ajaxConfig.url = '/api/service/networking/device-status/' +
                                        data['ip'];
                contrail.ajaxHandler(ajaxConfig, function () {
                    if (contrail.checkIfFunction(callbackObj.init)) {
                        callbackObj.init();
                    }
                }, function (response) {
                     console.log(response);
                     if (contrail.checkIfFunction(callbackObj.success)) {
                         callbackObj.success(response);
                     }
                     returnFlag = true;
                }, function (error) {
                     console.log(error);
                     if (contrail.checkIfFunction(callbackObj.error)) {
                         callbackObj.error(error);
                     }
                     returnFlag = false;
                });
            } else {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(this.getFormErrorText(ctwl.
                            LINK_LOCAL_SERVICES_PREFIX_ID));
                }
            }
            return returnFlag;
        },
    });
    return LoginWindowModel;
});


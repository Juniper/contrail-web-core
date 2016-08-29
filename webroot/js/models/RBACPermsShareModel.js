/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-model'
], function (_, ContrailModel) {
    var rbacPermsShareModel = ContrailModel.extend({

        defaultConfig: {
            "tenant": null,
            "tenant_access": "4,2,1"
        },

        validateAttr: function (attributePath, validation, data) {
            var model = data.model().attributes.model(),
                attr = cowu.getAttributeFromPath(attributePath),
                errors = model.get(cowc.KEY_MODEL_ERRORS),
                attrErrorObj = {}, isValid;

            isValid = model.isValid(attributePath, validation);

            attrErrorObj[attr + cowc.ERROR_SUFFIX_ID] =
                (isValid == true) ? false : isValid;
            errors.set(attrErrorObj);
        },


        validations: {
            rbacPermsShareValidations: {
                'tenant': {
                    required: true
                },
                'tenant_access': {
                    required: true
                }
            }
        }
    });
    return rbacPermsShareModel;
});

/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'knockout',
    'knockback'
], function (_, Backbone, Knockout, Knockback) {
    var ContrailModel = Knockback.ViewModel.extend({

        formatModelConfig: function(modelConfig) {
            return modelConfig;
        },

        constructor: function (modelConfig) {
            var model, errorAttributes,
                editingLockAttrs, _this = this,
                modelAttributes = (modelConfig == null) ? this.defaultConfig : modelConfig;

            errorAttributes = generateAttributes(modelAttributes, cowc.ERROR_SUFFIX_ID, false);
            editingLockAttrs = generateAttributes(modelAttributes, cowc.LOCKED_SUFFIX_ID, true);

            modelConfig = $.extend(true, {}, this.defaultConfig, modelConfig, {errors: new Backbone.Model(errorAttributes), locks: new Backbone.Model(editingLockAttrs)});

            modelConfig = this.formatModelConfig(modelConfig);
            model = new Backbone.Model(modelConfig);
            model = _.extend(model, this.validations, {_originalAttributes: modelAttributes});

            Knockback.ViewModel.prototype.constructor.call(this, model);

            delete this.validations;
            return this;
        },

        getValueByPath: function (path) {
            var obj = this.model().attributes;
            path = path.replace(/\[(\w+)\]/g, '.$1');
            path = path.replace(/^\./, '');
            var pathArray = path.split('.');
            while (pathArray.length) {
                var property = pathArray.shift();
                if (obj != null && property in obj) {
                    obj = obj[property];
                } else {
                    return;
                }
            }
            return obj;
        },

        validateAttr: function (attributePath, validation) {
            var attr = cowu.getAttributeFromPath(attributePath),
                errors = this.model().get(cowc.KEY_MODEL_ERRORS),
                attrErrorObj = {}, isValid;

            isValid = this.model().isValid(attributePath, validation);
            attrErrorObj[attr + cowc.ERROR_SUFFIX_ID] = (isValid == true) ? false : isValid;
            errors.set(attrErrorObj);
        },

        initLockAttr: function (attributePath, lockFlag) {
            var attribute = cowu.getAttributeFromPath(attributePath),
                locks = this.model().get(cowc.KEY_MODEL_LOCKS),
                errors = this.model().get(cowc.KEY_MODEL_ERRORS),
                lockObj = {}, attrErrorObj = {};

            lockObj[attribute + cowc.LOCKED_SUFFIX_ID] = lockFlag;
            locks.set(lockObj);

            attrErrorObj[attribute + cowc.ERROR_SUFFIX_ID] = false
            errors.set(attrErrorObj);
        },

        toggleLockAttr: function(attributePath) {
            var attribute = cowu.getAttributeFromPath(attributePath),
                locks = this.model().get(cowc.KEY_MODEL_LOCKS),
                lockedStatus = locks.attributes[attribute + cowc.LOCKED_SUFFIX_ID],
                lockObj = {};

            lockObj[attribute + cowc.LOCKED_SUFFIX_ID] = !lockedStatus;
            locks.set(lockObj);
        },

        showErrorAttr: function(attributePath, msg) {
            var attribute = cowu.getAttributeFromPath(attributePath),
                errors = this.model().get(cowc.KEY_MODEL_ERRORS),
                errorObj = {};

            errorObj[attribute + cowc.ERROR_SUFFIX_ID] = msg;
            errors.set(errorObj);
        },

        checkIfInputDisabled: function(disabledFlag, lockFlag) {
            return disabledFlag || lockFlag;
        },

        getFormErrorText: function (prefixId) {
            var modelErrors = this.model().attributes.errors.attributes,
                errorText = smwm.get(smwm.SHOULD_BE_VALID, smwl.get(prefixId));

            _.each(modelErrors, function (value, key) {
                if (_.isFunction(modelErrors[key]) || (modelErrors[key] == 'false') || (modelErrors[key] == '')) {
                    delete modelErrors[key];
                } else {
                    if (-1 == (key.indexOf('_form_error'))) {
                        errorText = errorText + smwl.getFirstCharUpperCase(key.split('_error')[0]) + ", ";
                    }
                }
            });
            // Replace last comma by a dot
            errorText = errorText.slice(0, -2) + ".";
            return {responseText: errorText};
        }
    });

    var generateAttributes = function (attributes, suffix, defaultValue) {
        var flattenAttributes = cowu.flattenObject(attributes),
            errorAttributes = {};

        _.each(flattenAttributes, function (value, key) {
            var keyArray = key.split('.');
            errorAttributes[keyArray[keyArray.length - 1] + suffix] = defaultValue;
        });

        return errorAttributes;
    };

    return ContrailModel;
});
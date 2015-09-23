/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'knockout',
    'contrail-model'
], function (_, Backbone, Knockout, ContrailModel) {
    var QueryAndModel = ContrailModel.extend({

        defaultConfig: {
            name: '',
            operator: '=',
            value : '',
            suffix_name: '',
            suffix_operator: '=',
            suffix_value : ''
        },

        validateAttr: function (attributePath, validation, data) {
            var model = data.model().attributes.model(),
                attr = cowu.getAttributeFromPath(attributePath),
                errors = model.get(cowc.KEY_MODEL_ERRORS),
                attrErrorObj = {}, isValid;

            isValid = model.isValid(attributePath, validation);

            attrErrorObj[attr + cowc.ERROR_SUFFIX_ID] = (isValid == true) ? false : isValid;
            errors.set(attrErrorObj);
        },

        getThis: function() {
            console.log(this);
        },

        deleteWhereAndClause: function() {
            var andClauses = this.model().collection,
                andClause = this.model();

            andClauses.remove(andClause);
        },

        validations: {}
    });


    return QueryAndModel;
});

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

        constructor: function (parentModel, modelData) {
            this.parentModel = parentModel;
            ContrailModel.prototype.constructor.call(this, modelData);
            return this;
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

        addAndClauseAtIndex: function() {
            var self = this,
                andClauses = this.model().collection,
                andClause = this.model(),
                andClauseIndex = _.indexOf(andClauses.models, andClause),
                newAndClause = new QueryAndModel(self.parentModel(), {});

            andClauses.add(newAndClause, {at: andClauseIndex + 1});
        },

        deleteWhereAndClause: function() {
            var andClauses = this.model().collection,
                andClause = this.model();

            andClauses.remove(andClause);
        },

        getNameOptionList: function(viewModel) {
            var rootModel = viewModel.parentModel().parentModel.model(),
                whereDataObject = rootModel.get('where_data_object');

            return $.map(whereDataObject['name_option_list'], function(schemaValue, schemaKey) {
                if(schemaValue.index) {
                    return {id: schemaValue.name, text: schemaValue.name};
                }
            });
        },

        getValueOptionList: function(viewModel) {
            var rootModel = viewModel.parentModel().parentModel.model(),
                name = viewModel.name(),
                whereDataObject = rootModel.get('where_data_object');

            name = contrail.checkIfFunction(name) ? name() : name;

            return contrail.checkIfKeyExistInObject(true, whereDataObject, 'value_option_list.name') ? whereDataObject['value_option_list'][name] : [];
        },

        getSuffixNameOptionList: function(viewModel) {
            var rootModel = viewModel.parentModel().parentModel.model(),
                name = viewModel.name(),
                whereDataObject = rootModel.get('where_data_object'),
                suffixNameOptionList = [];

            name = contrail.checkIfFunction(name) ? name() : name;

            $.each(whereDataObject['name_option_list'], function(schemaKey, schemaValue) {
                if(schemaValue.name === name && schemaValue.suffixes !== null) {
                    suffixNameOptionList = $.map(schemaValue.suffixes, function(suffixValue, suffixKey) {
                        return {id: suffixValue, text: suffixValue};
                    });
                    return false;
                }
            });

            return suffixNameOptionList;
        },

        validations: {}
    });


    return QueryAndModel;
});

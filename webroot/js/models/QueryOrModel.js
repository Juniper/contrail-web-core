/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'knockout',
    'contrail-model',
    'query-and-model'
], function (_, Backbone, Knockout, ContrailModel, QueryAndModel) {
    var QueryOrModel = ContrailModel.extend({

        defaultConfig: {
            "orText": ''
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

        formatModelConfig: function(modelConfig) {

            var andClauses = [],
                andClauseModels = [], andClauseModel,
                andClausesCollectionModel;

            $.each(andClauses, function(andClauseKey, andClauseValue) {
                andClauseModel = new QueryAndModel(andClauseValue);
                andClauseModels.push(andClauseModel)
            });

            andClausesCollectionModel = new Backbone.Collection(andClauseModels);
            modelConfig['and_clauses'] = andClausesCollectionModel;


            return modelConfig;
        },

        getThis: function() {
            console.log(this)
        },

        addWhereAndClause: function() {
            var andClauses = this.model().attributes.model().get('and_clauses'),
                newAndClause = new QueryAndModel();

            andClauses.add([newAndClause]);
        },


        deleteWhereOrClause: function() {
            var orClauses = this.model().collection,
                orClause = this.model();

            orClauses.remove(orClause);
        },

        getOrClauseText: function(data) {
            var andClauses = data.and_clauses()(),
                andClauseArray = [];

            $.each(andClauses, function(andClauseKey, andClauseValue) {
                var name = andClauseValue.name(),
                    operator = andClauseValue.operator(),
                    value = andClauseValue.value()(),
                    suffixName = andClauseValue.suffix_name(),
                    suffixOperator = andClauseValue.suffix_operator(),
                    suffixValue = andClauseValue.suffix_value()(),
                    andClauseStr = '';

                if (name !== '' &&  operator !== '' && value !== '') {
                    andClauseStr = name + ' ' + operator + ' ' + value;

                    if (suffixName !== '' &&  suffixOperator !== '' && suffixValue !== '') {
                        andClauseStr += ' AND ' + suffixName + ' ' + suffixOperator + ' ' + suffixValue;
                    }

                    andClauseArray.push(andClauseStr)
                }
            });

            return (andClauseArray.length > 0) ? andClauseArray.join(' AND ') : '...';
        },

        validations: {}
    });


    return QueryOrModel;
});

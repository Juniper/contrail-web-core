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
            orClauseText: '',
            orClauseJSON: []
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

        formatModelConfig: function(modelConfig) {
            var self = this,
                parentModel = self.parentModel,
                whereDataObject = parentModel.model().get('where_data_object'),
                orClauseJSON = modelConfig.orClauseJSON,
                orClauseLength = orClauseJSON.length,
                andClauseModels = [], andClauseModel,
                andClausesCollectionModel,
                andClauseObj = {};

            for (var i = 0 ; i < orClauseLength; i += 1) {
                andClauseObj = {
                    name: orClauseJSON[i].name,
                    operator: cowc.OPERATOR_CODES[orClauseJSON[i].op],
                    value: orClauseJSON[i].value
                };

                if (qewu.getNameSuffixKey(orClauseJSON[i].name, whereDataObject['name_option_list']) !== -1 &&
                    (i + 1) < orClauseLength && qewu.getNameSuffixKey(orClauseJSON[i+1].name, whereDataObject['name_option_list']) === -1) {
                    i = i + 1;
                    andClauseObj.suffix_name = orClauseJSON[i].name;
                    andClauseObj.suffix_operator = cowc.OPERATOR_CODES[orClauseJSON[i].op];
                    andClauseObj.suffix_value = orClauseJSON[i].value;
                }

                andClauseModel = new QueryAndModel(self, andClauseObj);
                andClauseModels.push(andClauseModel);
            }

            andClauseModels.push(new QueryAndModel(self, {}));

            andClausesCollectionModel = new Backbone.Collection(andClauseModels);
            modelConfig['and_clauses'] = andClausesCollectionModel;

            return modelConfig;
        },

        addWhereAndClause: function() {
            var model = this.model().attributes.model(),
                andClauses = model.get('and_clauses'),
                newAndClause = new QueryAndModel(this.model().attributes);

            andClauses.add([newAndClause]);
        },


        deleteWhereOrClause: function() {
            var orClauses = this.model().collection,
                orClause = this.model();

            orClauses.remove(orClause);
        },

        getOrClauseText: function(data) {
            var andClauses = data.and_clauses()(),
                andClauseArray = [], orClauseText = '';

            $.each(andClauses, function(andClauseKey, andClauseValue) {
                var name = andClauseValue.name(),
                    operator = andClauseValue.operator(),
                    value = andClauseValue.value(),
                    suffixName = andClauseValue.suffix_name(),
                    suffixOperator = andClauseValue.suffix_operator(),
                    suffixValue = andClauseValue.suffix_value()(),
                    andClauseStr = '';

                name = contrail.checkIfFunction(name) ? name() : name;
                suffixName = contrail.checkIfFunction(suffixName) ? suffixName() : suffixName;
                operator = contrail.checkIfFunction(operator) ? operator() : operator;
                suffixOperator = contrail.checkIfFunction(suffixOperator) ? suffixOperator() : suffixOperator;
                value = contrail.checkIfFunction(value) ? value() : value;
                suffixValue = contrail.checkIfFunction(suffixValue) ? suffixValue() : suffixValue;

                if (name !== '' &&  operator !== '' && value !== '') {
                    andClauseStr = name + ' ' + operator + ' ' + value;

                    if (suffixName !== '' &&  suffixOperator !== '' && suffixValue !== '') {
                        andClauseStr += ' AND ' + suffixName + ' ' + suffixOperator + ' ' + suffixValue;
                    }

                    andClauseArray.push(andClauseStr)
                }
            });

            orClauseText = (andClauseArray.length > 0) ? andClauseArray.join(' AND ') : '';

            data.orClauseText(orClauseText)
            return (orClauseText !== '') ? orClauseText : '...';
        },

        validations: {}
    });


    return QueryOrModel;
});

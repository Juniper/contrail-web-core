/**
 * TODOs: 
 *      1. the type normalizers (normalizeDataType, normalizeTableType) are used
 *         to infer a proper tag/label that can be understood by the validation engine.
 *         Untimately such info should be carried by the data entry, rather than unreliably inferred.
 */

define([
    "lodash",
    "text!reports/udd/config/default.config.json"
], function(_, defaultConfig) {
    var unifiedDataTypes = {
        LOGGABLE: "loggable",
        PLOTTABLE: "plottable",
    }, shouldIgnore = {
        "T": true,
        "T=": true
    };

    /**
     * combine two rules and return the combination.
     *
     * @param  {Object} rule1 rule description
     * @param  {Object} rule2 rule description
     * @return {Object}       combined rule description
     */
    function combine(rule1, rule2) { // eslint-disable-line
        var compatible1 = isCompatibleRule(rule1),
            compatible2 = isCompatibleRule(rule2);

        if (compatible1 && compatible2) {
            rule1 = normalizeRule(rule1);
            rule2 = normalizeRule(rule2);
            return rule1.concat(rule2);
        } else if (compatible1) {
            return normalizeRule(rule1);
        } else if (compatible2) {
            return normalizeRule(rule2);
        } else {
            return {};
        }
    }

    /**
     * check if the rule is in a format described by Backbone.validation
     * @param  {Object}  rule rule description
     * @return {Boolean}
     */
    function isCompatibleRule(rule) {
        return _.isArray(rule) || _.isFunction(rule) || _.isPlainObject(rule);
    }

    /**
     * convert all acceptable rule descritpion format to array-like.
     * The array format is the easiest to merge properly.
     *
     * @param  {Object} rule rule description
     * @return {Object}      normalized rule description in form of array
     */
    function normalizeRule(rule) {
        if (_.isFunction(rule)) {
            return [{
                fn: rule
            }];
        } else if (_.isPlainObject(rule)) {
            return [rule];
        } else {
            return rule;
        }
    }

    /**
     * data type mapper for select field
     * @param  {String} string one field value
     * @return {String}        unified data type string
     */
    function normalizeDataType(string) {
        switch (string) {
            case "int":
            case "long":
                return unifiedDataTypes.PLOTTABLE;
            default: // unhandled string will be returned as is
                return string;
        }
    }

    /**
     * data type mapper for table_type field
     * @param  {String} string one field value
     * @return {String}        unified data type string
     */
    function normalizeTableType(string) {
        switch (string) {
            case "LOG":
            case "OBJECT":
                return unifiedDataTypes.LOGGABLE;
            default: // unhandled string will be returned as is
                return string;
        }
    }

    /**
     * A error string generater
     * @param  {String} subject   string as subject
     * @param  {String} predicate string as verb
     * @param  {String} object    string as object
     * @return {String}           composed error message for a field
     */
    function getFieldErrorMsg(subject, predicate, object) {
        return [subject, predicate, "selection of", object, "fields"].join(" ");
    }

    /**
     * Gets the validation schema.
     *
     * @param      {Object}  rawConfig  The raw configuration
     * @return     {Object}  The validation schema.
     */
    function getValidationSchema(rawConfig) {
        return _.mapValues(rawConfig.contentViews, function(visualizationConfig) {
            return visualizationConfig.validations;
        });
    }
    /**
     * This is the object that describes what validations rules should be applied to any fields in the query form.
     *
     * @type {Object}
     */
    var viewRequiredFormInfo = getValidationSchema(JSON.parse(defaultConfig));

    function hasAllRequiredFields(value, attr, metrics, dataTypeNormalizer) { // eslint-disable-line
        var key = metrics.key,
            target = metrics.target,
            attrRequirements = _.get(viewRequiredFormInfo, [key, target, attr]);

        if (attrRequirements) {
            var requiredFieldTypes = _.uniq(attrRequirements.requiredFieldTypes || ""),
                rejectedFieldTypes = _.uniq(attrRequirements.rejectedFieldTypes || ""),
                selectedFieldValues = value ? value.split(", ") : [],
                selectedTypes = _.uniq(_.map(selectedFieldValues, function(fieldName) {
                    return dataTypeNormalizer(metrics.preprocess(fieldName));
                })),
                isRejected = _.partial(_.partialRight(_.includes, null), rejectedFieldTypes);

            if (_.some(selectedTypes, isRejected)) { // if selected types is rejected by rule of the key
                return getFieldErrorMsg(key, "rejects", rejectedFieldTypes.join(", "));
            } else {
                var neededFieldTypes = _.difference(requiredFieldTypes, selectedTypes);
                if (neededFieldTypes.length !== 0) { // if selected types don't cover all types required by rule of the key
                    return getFieldErrorMsg(key, "requires", neededFieldTypes.join(", "));
                }
            }
        } else {
            return false;
        }
    }

    return {
        /**
         * This is a rulesets created for query form validation in UDD widget.
         *
         * @type {Object}
         */
        UDDQueryConfigValidations: {
            runQueryValidation: { // this ruleset ID follows core-constants/KEY_RUN_QUERY_VALIDATION
                select: {
                    fn: function(value, attr, computedState) { // eslint-disable-line
                        if (computedState.ui_added_parameters) {
                            var metrics = {
                                target: computedState.dataSrcType,
                                key: computedState.visualType,
                                preprocess: function(fieldName) {
                                    var fieldTypeTable = computedState.ui_added_parameters.table_schema_column_names_map,
                                        typeObject = fieldTypeTable[fieldName];

                                    return !shouldIgnore[fieldName] && typeObject ? typeObject.datatype : "";
                                }
                            };
                            return hasAllRequiredFields(value, attr, metrics, normalizeDataType);
                        }
                    }
                },
                table_type: {
                    fn: function(value, attr, computedState) { // eslint-disable-line
                        var metrics = {
                            target: computedState.dataSrcType,
                            key: computedState.visualType,
                            preprocess: function(fieldName) {
                                return fieldName;
                            }
                        };

                        return hasAllRequiredFields(value, attr, metrics, normalizeTableType);
                    }
                }
            }
        },
        /**
         * Combine two Backbone.validation rulesets into one.
         * A rulesets will strictly follow a two level data structure enforced by ContrailModel.
         * The structure is as:
         *     rulesetsID {
         *         rulesetID: {
         *             field1: ...
         *             field2: ...
         *             ...
         *         }
         *         ...
         *     }
         *
         * @param  {Object} rulesets1 rulesets description object
         * @param  {Object} rulesets2 rulesets description object
         * @return {Object}           combined rulesets with each rule normalized in a form of [{validator1, msg1}, {validator2, msg2}, ...]
         */
        mixValidationRules: function(rulesets1, rulesets2) {
            var combinedValidations = {};

            _.forEach(rulesets1, function(ruleset, rulesetName) {
                if (!combinedValidations[rulesetName]) {
                    combinedValidations[rulesetName] = {};
                }

                _.forEach(ruleset, function(rule, formProperty) {
                    combinedValidations[rulesetName][formProperty] = combine(rule, _.get(rulesets2, [rulesetName, formProperty], []));
                });
            });

            return combinedValidations;
        }
    };
});
